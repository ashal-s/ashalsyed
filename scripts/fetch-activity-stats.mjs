#!/usr/bin/env node
/**
 * Build-time activity stats fetcher.
 *
 * GitHub (active): requires GH_STATS_TOKEN (fine-grained PAT with read:user,
 * or classic with read:user) so private contributions match your profile.
 *
 * Totals are summed year-by-year from account creation (all-time).
 * The contribution calendar is the last 12 months (GitHub API max per query).
 *
 * Linear: LINEAR_API_KEY — created / closed / open / bugs (Bug label).
 * Jira: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN — same counters via JQL.
 *
 * Without GH_STATS_TOKEN, keeps the existing data/activity-stats.json fallback
 * (or writes an empty GitHub stub) so local builds still succeed.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_PATH = path.join(ROOT, "data", "activity-stats.json");

/** Load .env / .env.local into process.env (Next does this; plain node scripts do not). */
function loadEnvFiles() {
  for (const name of [".env", ".env.local"]) {
    const filePath = path.join(ROOT, name);
    if (!existsSync(filePath)) continue;
    const text = readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

loadEnvFiles();

const GITHUB_LOGIN = process.env.GH_STATS_LOGIN || "ashal-s";
const GITHUB_TOKEN = process.env.GH_STATS_TOKEN || "";

const LEVEL_MAP = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const USER_CREATED_QUERY = `
  query UserCreated($login: String!) {
    user(login: $login) {
      login
      createdAt
    }
  }
`;

const RANGE_QUERY = `
  query ActivityRange($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
              weekday
            }
          }
        }
      }
    }
  }
`;

function emptyGithub(login, from, to) {
  return {
    login,
    from,
    to,
    calendarFrom: from,
    calendarTo: to,
    totalContributions: 0,
    commits: 0,
    issues: 0,
    pullRequests: 0,
    codeReviews: 0,
    calendar: { weeks: [] },
  };
}

async function githubGraphql(token, query, variables) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "ashalsyed.dev-activity-stats",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub GraphQL HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(
      `GitHub GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`
    );
  }

  return json.data;
}

function mapCalendar(calendar) {
  return {
    weeks: calendar.weeks.map((week) => ({
      contributionDays: week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVEL_MAP[day.contributionLevel] ?? 0,
        weekday: day.weekday,
      })),
    })),
  };
}

/** GitHub allows at most 1 year per contributionsCollection query. */
function yearWindows(createdAt, now) {
  const windows = [];
  let cursor = new Date(createdAt);
  while (cursor < now) {
    const from = new Date(cursor);
    const to = new Date(from);
    to.setFullYear(to.getFullYear() + 1);
    if (to > now) to.setTime(now.getTime());
    // Skip empty/zero-length windows
    if (to > from) {
      windows.push({ from: from.toISOString(), to: to.toISOString() });
    }
    cursor = to;
  }
  return windows;
}

async function linearGraphql(query, variables = {}) {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      Authorization: process.env.LINEAR_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors?.length) {
    throw new Error(
      `Linear GraphQL: ${
        json.errors?.map((e) => e.message).join("; ") || `HTTP ${res.status}`
      }`
    );
  }
  return json.data;
}

/** Linear IssueConnection has no totalCount — paginate id-only pages. */
async function countLinearIssues(filter, { pageSize = 50, maxPages = 100 } = {}) {
  let after = null;
  let total = 0;
  for (let page = 0; page < maxPages; page++) {
    const data = await linearGraphql(
      `
      query CountIssues($after: String, $filter: IssueFilter!, $first: Int!) {
        issues(first: $first, after: $after, filter: $filter) {
          nodes { id }
          pageInfo { hasNextPage endCursor }
        }
      }
    `,
      { after, filter, first: pageSize }
    );
    total += data.issues.nodes.length;
    if (!data.issues.pageInfo.hasNextPage) break;
    after = data.issues.pageInfo.endCursor;
  }
  return total;
}

/**
 * Linear: issues you created / closed (completed + assigned to you) /
 * currently open / bugs you reported (Bug label).
 */
async function fetchLinear() {
  if (!process.env.LINEAR_API_KEY) return null;

  console.log("[activity-stats] Fetching Linear issue stats…");
  const [created, closed, open, bugsReported] = await Promise.all([
    countLinearIssues({ creator: { isMe: { eq: true } } }),
    countLinearIssues({
      assignee: { isMe: { eq: true } },
      state: { type: { eq: "completed" } },
    }),
    countLinearIssues({
      assignee: { isMe: { eq: true } },
      state: {
        type: { in: ["backlog", "unstarted", "started", "triage"] },
      },
    }),
    countLinearIssues({
      creator: { isMe: { eq: true } },
      labels: { name: { eqIgnoreCase: "Bug" } },
    }),
  ]);

  const stats = {
    created,
    closed,
    open,
    bugsReported,
    updatedAt: new Date().toISOString(),
  };
  console.log(
    `[activity-stats] Linear: ${created} created, ${closed} closed, ${open} open, ${bugsReported} bugs`
  );
  return stats;
}

function jiraAuthHeader() {
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  return `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;
}

async function jiraApproximateCount(baseUrl, jql) {
  const res = await fetch(`${baseUrl}/rest/api/3/search/approximate-count`, {
    method: "POST",
    headers: {
      Authorization: jiraAuthHeader(),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ jql }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Jira count HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(
      `Jira count HTTP ${res.status}: ${json.errorMessages?.join("; ") || text.slice(0, 200)}`
    );
  }
  return typeof json.count === "number" ? json.count : 0;
}

/**
 * Jira Cloud: reporter / assignee Done / open / Bug issuetype via approximate-count.
 */
async function fetchJira() {
  if (
    !process.env.JIRA_BASE_URL ||
    !process.env.JIRA_EMAIL ||
    !process.env.JIRA_API_TOKEN
  ) {
    return null;
  }

  const baseUrl = process.env.JIRA_BASE_URL.replace(/\/$/, "");
  console.log("[activity-stats] Fetching Jira issue stats…");

  const queries = {
    created: "reporter = currentUser()",
    closed: 'assignee = currentUser() AND statusCategory = "Done"',
    open: 'assignee = currentUser() AND statusCategory != "Done"',
    bugsReported: "reporter = currentUser() AND issuetype = Bug",
  };

  const entries = await Promise.all(
    Object.entries(queries).map(async ([key, jql]) => [
      key,
      await jiraApproximateCount(baseUrl, jql),
    ])
  );
  const counts = Object.fromEntries(entries);

  const stats = {
    created: counts.created,
    closed: counts.closed,
    open: counts.open,
    bugsReported: counts.bugsReported,
    updatedAt: new Date().toISOString(),
  };
  console.log(
    `[activity-stats] Jira: ${stats.created} created, ${stats.closed} closed, ${stats.open} open, ${stats.bugsReported} bugs`
  );
  return stats;
}

async function fetchGithub(login, token) {
  const now = new Date();
  const calendarTo = now.toISOString();
  const calendarFromDate = new Date(now);
  calendarFromDate.setFullYear(calendarFromDate.getFullYear() - 1);
  const calendarFrom = calendarFromDate.toISOString();

  const meta = await githubGraphql(token, USER_CREATED_QUERY, { login });
  const user = meta?.user;
  if (!user) {
    throw new Error(`GitHub user "${login}" not found`);
  }

  const windows = yearWindows(user.createdAt, now);
  console.log(
    `[activity-stats] Summing ${windows.length} year window(s) since ${user.createdAt.slice(0, 10)}…`
  );

  let totalContributions = 0;
  let commits = 0;
  let issues = 0;
  let pullRequests = 0;
  let codeReviews = 0;
  let calendar = { weeks: [] };

  for (const { from, to } of windows) {
    const data = await githubGraphql(token, RANGE_QUERY, {
      login,
      from,
      to,
    });
    const collection = data?.user?.contributionsCollection;
    if (!collection) continue;

    totalContributions += collection.contributionCalendar.totalContributions;
    commits += collection.totalCommitContributions;
    issues += collection.totalIssueContributions;
    pullRequests += collection.totalPullRequestContributions;
    codeReviews += collection.totalPullRequestReviewContributions;
  }

  // Calendar: dedicated last-12-months query (same shape as GitHub's graph)
  const recent = await githubGraphql(token, RANGE_QUERY, {
    login,
    from: calendarFrom,
    to: calendarTo,
  });
  calendar = mapCalendar(recent.user.contributionsCollection.contributionCalendar);

  return {
    login: user.login,
    from: user.createdAt,
    to: calendarTo,
    calendarFrom,
    calendarTo,
    totalContributions,
    commits,
    issues,
    pullRequests,
    codeReviews,
    calendar,
  };
}

async function loadExisting() {
  try {
    const raw = await readFile(OUT_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function main() {
  const toIso = new Date().toISOString();
  await mkdir(path.dirname(OUT_PATH), { recursive: true });

  let github;
  if (!GITHUB_TOKEN) {
    const existing = await loadExisting();
    if (existing?.github?.calendar?.weeks?.length) {
      console.warn(
        "[activity-stats] No GH_STATS_TOKEN — keeping existing data/activity-stats.json"
      );
      const next = {
        ...existing,
        updatedAt: existing.updatedAt || toIso,
        linear: (await fetchLinear()) ?? existing.linear ?? null,
        jira: (await fetchJira()) ?? existing.jira ?? null,
      };
      await writeFile(OUT_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");
      return;
    }
    console.warn(
      "[activity-stats] No GH_STATS_TOKEN — writing empty GitHub stub"
    );
    github = emptyGithub(GITHUB_LOGIN, toIso, toIso);
  } else {
    console.log(
      `[activity-stats] Fetching all-time GitHub stats for @${GITHUB_LOGIN}…`
    );
    github = await fetchGithub(GITHUB_LOGIN, GITHUB_TOKEN);
    console.log(
      `[activity-stats] all-time: ${github.totalContributions} contributions, ${github.commits} commits, ${github.pullRequests} PRs`
    );
  }

  const payload = {
    updatedAt: toIso,
    github,
    linear: await fetchLinear(),
    jira: await fetchJira(),
  };

  await writeFile(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`[activity-stats] Wrote ${path.relative(ROOT, OUT_PATH)}`);
}

main().catch((err) => {
  console.error("[activity-stats] Failed:", err.message || err);
  process.exit(1);
});
