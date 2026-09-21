"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Bug,
  CheckCircle2,
  CircleDot,
  Eye,
  FolderKanban,
  GitCommitHorizontal,
  GitPullRequestArrow,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import {
  fadeUpItem,
  springSnappy,
  staggerContainer,
  viewport,
} from "@/lib/motion";
import {
  activityStats,
  combinedTrackerStats,
  type ContributionDay,
  type GithubActivityStats,
} from "@/lib/activity-stats";
import { site } from "@/lib/portfolio";
import { SectionHeader } from "./section-header";

const LEVEL_CLASS: Record<number, string> = {
  0: "bg-contrib-0 border border-border/70",
  1: "bg-contrib-1 border border-contrib-1",
  2: "bg-contrib-2 border border-contrib-2",
  3: "bg-contrib-3 border border-contrib-3",
  4: "bg-contrib-4 border border-contrib-4",
};

function formatUpdated(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function formatCount(n: number) {
  return new Intl.NumberFormat("en-AU").format(n);
}

function formatDayLabel(isoDate: string) {
  try {
    return new Intl.DateTimeFormat("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${isoDate}T12:00:00`));
  } catch {
    return isoDate;
  }
}

function contributionLabel(day: ContributionDay) {
  const n = day.count;
  const countText =
    n === 0 ? "No contributions" : `${n} contribution${n === 1 ? "" : "s"}`;
  return `${countText} on ${formatDayLabel(day.date)}`;
}

function monthLabels(weeks: GithubActivityStats["calendar"]["weeks"]) {
  const labels: { label: string; weekIndex: number }[] = [];
  let lastMonth = "";
  weeks.forEach((week, weekIndex) => {
    const first = week.contributionDays[0];
    if (!first) return;
    const month = new Date(`${first.date}T00:00:00`).toLocaleString("en-AU", {
      month: "short",
    });
    if (month !== lastMonth) {
      labels.push({ label: month, weekIndex });
      lastMonth = month;
    }
  });
  return labels;
}

function DayCell({
  day,
  active,
  onEnter,
  onLeave,
}: {
  day: ContributionDay;
  active: boolean;
  onEnter: (day: ContributionDay, el: HTMLButtonElement) => void;
  onLeave: () => void;
}) {
  const label = contributionLabel(day);
  return (
    <button
      type="button"
      aria-label={label}
      onMouseEnter={(e) => onEnter(day, e.currentTarget)}
      onMouseLeave={onLeave}
      onFocus={(e) => onEnter(day, e.currentTarget)}
      onBlur={onLeave}
      className={`block h-[10px] w-[10px] sm:h-[11px] sm:w-[11px] shrink-0 rounded-[2px] outline-none transition-shadow ${
        LEVEL_CLASS[day.level] ?? LEVEL_CLASS[0]
      } ${active ? "ring-1 ring-foreground/80 ring-offset-1 ring-offset-card" : "hover:ring-1 hover:ring-foreground/50"}`}
    />
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <motion.div
      variants={fadeUpItem}
      whileHover={{ y: -4, borderColor: "hsl(var(--accent) / 0.4)" }}
      transition={springSnappy}
      className="rounded-xl border border-border/80 bg-card/40 p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="w-3.5 h-3.5 text-accent" aria-hidden />
        <span className="font-mono text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground tabular-nums">
        {formatCount(value)}
      </p>
      {hint ? (
        <p className="mt-1.5 text-[11px] text-muted-foreground font-mono leading-snug">
          {hint}
        </p>
      ) : null}
    </motion.div>
  );
}

export function Activity() {
  const { github, updatedAt, linear, jira } = activityStats;
  const trackers = combinedTrackerStats(linear, jira);
  const weeks = github.calendar.weeks;
  const hasCalendar = weeks.length > 0;
  const months = hasCalendar ? monthLabels(weeks) : [];
  const profileUrl = `https://github.com/${github.login}`;
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const showTooltip = (day: ContributionDay, el: HTMLButtonElement) => {
    const rect = el.getBoundingClientRect();
    const parent = el.closest("[data-calendar-root]")?.getBoundingClientRect();
    if (!parent) return;
    setActiveDate(day.date);
    setTooltip({
      text: contributionLabel(day),
      x: rect.left - parent.left + rect.width / 2,
      y: rect.top - parent.top,
    });
  };

  const hideTooltip = () => {
    setActiveDate(null);
    setTooltip(null);
  };

  const githubCounters = [
    {
      label: "Contributions",
      value: github.totalContributions,
      icon: Sparkles,
    },
    {
      label: "Commits",
      value: github.commits,
      icon: GitCommitHorizontal,
    },
    {
      label: "Issues",
      value: github.issues,
      icon: CircleDot,
    },
    {
      label: "Pull requests",
      value: github.pullRequests,
      icon: GitPullRequestArrow,
    },
    {
      label: "Code reviews",
      value: github.codeReviews,
      icon: Eye,
    },
  ];

  const trackerCounters = trackers
    ? [
        {
          label: "Created",
          value: trackers.created,
          icon: PlusCircle,
          hint:
            linear && jira
              ? `Linear ${formatCount(linear.created)} · Jira ${formatCount(jira.created)}`
              : undefined,
        },
        {
          label: "Closed",
          value: trackers.closed,
          icon: CheckCircle2,
          hint:
            linear && jira
              ? `Linear ${formatCount(linear.closed)} · Jira ${formatCount(jira.closed)}`
              : undefined,
        },
        {
          label: "Open",
          value: trackers.open,
          icon: FolderKanban,
          hint:
            linear && jira
              ? `Linear ${formatCount(linear.open)} · Jira ${formatCount(jira.open)}`
              : undefined,
        },
        {
          label: "Bugs reported",
          value: trackers.bugsReported,
          icon: Bug,
          hint:
            linear && jira
              ? `Linear ${formatCount(linear.bugsReported)} · Jira ${formatCount(jira.bugsReported)}`
              : undefined,
        },
      ]
    : [];

  const trackerSources = [linear && "Linear", jira && "Jira"]
    .filter(Boolean)
    .join(" + ");

  return (
    <section id="activity" className="py-24 px-6 scroll-mt-20 border-t border-border/40">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          label="03   Activity"
          title="GitHub activity"
          description="All-time contributions, commits, issues, pull requests and reviews — plus the last 12 months on the calendar."
        />

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer}
        >
          {githubCounters.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </motion.div>

        {trackers && (
          <div className="mb-8">
            <div className="mb-4">
              <p className="font-mono text-xs uppercase tracking-wider text-accent mb-1">
                Issue trackers
              </p>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                Linear &amp; Jira
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
                Combined task activity across {trackerSources}: created by you,
                closed while assigned to you, currently open, and bugs you
                reported.
              </p>
            </div>

            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-3"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={staggerContainer}
            >
              {trackerCounters.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </motion.div>
          </div>
        )}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeUpItem}
          className="rounded-xl border border-border/80 bg-card/40 p-4 sm:p-6 overflow-x-auto"
        >
          <div className="flex items-center justify-between gap-4 mb-4 min-w-[640px]">
            <p className="font-mono text-xs text-muted-foreground">
              ~/github   contribution calendar
            </p>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-accent hover:underline"
            >
              @{github.login}
            </a>
          </div>

          {hasCalendar ? (
            <div className="relative min-w-[640px]" data-calendar-root>
              {tooltip && (
                <div
                  role="tooltip"
                  className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-md border border-border bg-foreground px-2.5 py-1.5 text-xs text-background shadow-lg"
                  style={{ left: tooltip.x, top: tooltip.y }}
                >
                  {tooltip.text}
                  <span
                    className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-foreground"
                    aria-hidden
                  />
                </div>
              )}

              <div
                className="grid gap-[3px] mb-1 text-[10px] text-muted-foreground font-mono"
                style={{
                  gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
                }}
              >
                {weeks.map((_, weekIndex) => {
                  const month = months.find((m) => m.weekIndex === weekIndex);
                  return (
                    <span key={weekIndex} className="h-4 overflow-visible">
                      {month ? month.label : ""}
                    </span>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col justify-between py-[1px] text-[10px] text-muted-foreground font-mono leading-none h-[82px] sm:h-[90px]">
                  <span />
                  <span>Mon</span>
                  <span />
                  <span>Wed</span>
                  <span />
                  <span>Fri</span>
                  <span />
                </div>

                <div className="flex gap-[3px]">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px]">
                      {week.contributionDays.map((day) => (
                        <DayCell
                          key={day.date}
                          day={day}
                          active={activeDate === day.date}
                          onEnter={showTooltip}
                          onLeave={hideTooltip}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <p>
                  Calendar: last 12 months · Totals: all time · updated{" "}
                  {formatUpdated(updatedAt)}
                </p>
                <div className="flex items-center gap-1.5 font-mono">
                  <span>Less</span>
                  {[0, 1, 2, 3, 4].map((level) => (
                    <span
                      key={level}
                      className={`block h-2.5 w-2.5 shrink-0 rounded-[2px] ${LEVEL_CLASS[level]}`}
                      aria-hidden
                    />
                  ))}
                  <span>More</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <p>
                Contribution data will appear after the next build with{" "}
                <code className="font-mono text-accent">GH_STATS_TOKEN</code>{" "}
                configured.
              </p>
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-accent hover:underline font-mono text-xs"
              >
                View profile on GitHub
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
