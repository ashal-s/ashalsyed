export type CaseStudySection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
};

export type CaseStudy = {
  slug: string;
  title: string;
  subtitle: string;
  tags: readonly string[];
  draft: boolean;
  sections: CaseStudySection[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "graphorg",
    title: "GraphOrg",
    subtitle: "Company knowledge and engineering context platform",
    tags: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS"],
    draft: true,
    sections: [
      {
        heading: "Problem",
        paragraphs: [
          "In any org past a handful of engineers, the answer to \"who owns this service\", \"what depends on what\", or \"where's the documentation for this\" is scattered across GitHub, Jira, Confluence, cloud infrastructure consoles and whatever project-management tool the team happens to use that quarter.",
          "None of these systems know about each other. A repository doesn't know which Jira project it belongs to. A Confluence page doesn't know which service it documents. Onboarding a new engineer, or debugging an incident at 2am, means manually stitching that picture together from five different tools, every time.",
        ],
      },
      {
        heading: "Solution",
        paragraphs: [
          "GraphOrg connects those systems into a single, searchable map of an organisation: its teams, services, repositories and infrastructure, and the relationships between them. Instead of five tools with five different mental models, there's one graph that already knows a repo belongs to a service, a service belongs to a team, and that service runs on a particular piece of infrastructure.",
          "On top of that graph sits search, and an AI assistant that answers questions about the organisation with citations back to the source system, so answers stay checkable instead of being treated as ground truth on faith.",
        ],
      },
      {
        heading: "Architecture",
        paragraphs: [
          "Source connectors for GitHub, Jira and Confluence pull data on a background sync schedule rather than relying purely on webhooks, so the graph stays consistent even when an integration misses an event or a service is down for a window.",
          "Synced data is normalised into entities (teams, services, repositories, infrastructure resources) and the relationships between them, stored in PostgreSQL. An API layer sits in front of that graph for the web app, search, and the AI assistant, all gated behind authentication and authorization so access follows real team and organisation boundaries.",
          "The same graph is also exposed over MCP, so agents and other tools can query organisational context directly rather than only humans clicking through a UI. The whole thing ships as Docker containers on cloud infrastructure, with CI/CD and observability wired in so sync failures and regressions surface immediately instead of silently rotting the graph.",
        ],
      },
      {
        heading: "Engineering Decisions",
        paragraphs: [
          "The graph model was chosen deliberately over just mirroring documents from each source: a pile of synced Jira tickets and Confluence pages doesn't answer relationship questions like \"what repos does this team own\" or \"what services depend on this piece of infrastructure\". Modelling entities and edges explicitly is what makes those questions answerable at all.",
          "The AI assistant is built to always cite its sources rather than answer freely. Engineering context is exactly the kind of information where a confident but wrong answer is worse than no answer, so every response traces back to the GitHub, Jira or Confluence record it came from.",
          "Sync is background and incremental rather than a big nightly rebuild, so the graph reflects reality within minutes of something changing upstream instead of up to a day later.",
        ],
      },
      {
        heading: "Challenges",
        paragraphs: [
          "The hardest problem wasn't pulling data out of GitHub, Jira and Confluence, it was reconciling identity across them: the same service might be referenced by a repo name in GitHub, a component field in Jira, and a page title in Confluence, with no shared ID anywhere. Matching those into a single graph entity without false merges (or missed ones) is an ongoing tuning problem rather than a one-time fix.",
          "Rate limits across three external APIs, each with different pagination and throttling behaviour, also shaped the sync design: it has to make progress incrementally and recover cleanly from a partial sync rather than needing to complete a full pass to be useful.",
        ],
      },
      {
        heading: "What I Learned",
        paragraphs: [
          "Building GraphOrg made the case for citation-backed AI features very concrete: an assistant that's occasionally wrong but always unverifiable is worse than a search box, because people stop trusting it entirely the first time it's caught out. Sourcing every answer keeps it useful even when it's imperfect.",
          "It also reinforced that background sync architecture is a product decision, not just an implementation detail; how fresh the graph is, and how gracefully it degrades when a source API misbehaves, directly determines whether people trust it enough to rely on it during an incident.",
        ],
      },
    ],
  },
  {
    slug: "mafia",
    title: "Mafia",
    subtitle: "Multiplayer social-deduction platform",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "Supabase", "Vercel"],
    draft: true,
    sections: [
      {
        heading: "Problem",
        paragraphs: [
          "Mafia is a game built entirely on asymmetric information: some players know things others don't, and the game only works if that asymmetry holds. Running it online, for real games with real people rather than a demo, means modelling roles, timed phases, private communication and voting in a way that's both fair and fun over many rounds, and that can't be cheated by anyone who's curious enough to open dev tools.",
        ],
      },
      {
        heading: "Solution",
        paragraphs: [
          "The platform models a game as a chain of entities: Game, Players, Roles, Phases, Actions, Votes and Chats. Each game moves through timed phases (day, night, voting), during which players take role-specific actions and communicate through channels scoped to their role, all resolved and enforced server-side rather than trusted to the client.",
        ],
      },
      {
        heading: "Architecture",
        paragraphs: [
          "The frontend is a Next.js and React app on Vercel, styled with Tailwind CSS, with a responsive layout built to work as a PWA since games run over phones as often as desktops. Supabase provides authentication, PostgreSQL storage, and realtime subscriptions so game state, chat and phase timers update live for every player without polling.",
          "Game data is modelled relationally: games, players, role assignments, phases, actions, votes and chat messages are all separate tables with explicit foreign keys, rather than a single blob of game state, so authorization rules can be enforced at the data layer instead of only in application code.",
        ],
      },
      {
        heading: "Engineering Decisions",
        paragraphs: [
          "The core decision running through the whole system: never trust the client with information a player's role shouldn't have. Role assignment happens server-side and is never sent to a client that shouldn't see it. Night actions are validated against the player's actual role and the current phase before they're allowed to resolve, not just hidden behind a UI that happens not to show the button.",
          "Chat is split into multiple channels (public, and role-restricted channels like a Mafia or Cult chat), and channel membership is resolved the same way: server-side, against the player's real role for that game, not against anything the client claims.",
        ],
      },
      {
        heading: "Challenges",
        paragraphs: [
          "The concrete version of that problem: how do you stop a Mafia player from reading Cult chat simply by calling the API directly, bypassing the UI entirely? The fix is to never let \"does the UI show this channel\" stand in for authorization. Every request for chat messages is checked server-side against a role-membership table for that specific game and channel; a player who isn't in Cult chat gets no rows back no matter how the request is made, because the query itself is scoped to their verified role, not to what the frontend intended to show them.",
          "The same principle extends to knowing a channel exists at all: a player outside a role-restricted chat shouldn't be able to enumerate its existence, let alone its contents, so channel visibility is filtered server-side rather than just its messages.",
          "Beyond authorization, keeping timed phases in sync across clients with real network latency, and resolving simultaneous votes and night actions deterministically when multiple players act in the same window, were the other recurring sources of edge cases.",
        ],
      },
      {
        heading: "What I Learned",
        paragraphs: [
          "The biggest lesson was to design authorization at the data layer first and treat the UI as a convenience on top of it, not the other way around. A hidden button is not access control. Anything a role shouldn't be able to see or do needs to be unreachable at the query and API level, because a determined player will eventually just call the API directly.",
          "It also sharpened how I think about real-time systems generally: state that's shared across many clients needs a single source of truth on the server, with the client treated as a view that can always be slightly stale or slightly wrong, and reconciled rather than trusted.",
        ],
      },
    ],
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}
