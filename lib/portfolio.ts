export const site = {
  name: "Ashal Syed",
  domain: "ashalsyed.dev",
  title: "Software Engineer",
  tagline:
    "I build full-stack products from idea to production, working across frontend, backend, databases, infrastructure and testing.",
  email: "ashal.syed@gmail.com",
  cvUrl: "/resume/Ashal%20Resume.pdf",
  location: "Melbourne, Australia",
  availability: "Melbourne, Australia",
  github: "https://github.com/ashal-s",
  linkedin: "https://www.linkedin.com/in/ashalsyed",
} as const;

export const navLinks = [
  { href: "/#projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/#activity", label: "Activity" },
  { href: "/#skills", label: "Skills" },
  { href: "/#about", label: "About" },
  { href: "/#education", label: "Education" },
  { href: "/#contact", label: "Contact" },
] as const;

export const socialLinks = [
  {
    name: "GitHub",
    href: site.github,
    handle: "@ashal-s",
  },
  {
    name: "LinkedIn",
    href: site.linkedin,
    handle: "ashalsyed",
  },
] as const;

export const roles = [
  "Software Engineer",
  "Full-Stack Developer",
  "Building GraphOrg",
  "Building Mafia",
] as const;

export const about = {
  intro:
    "I'm a software engineer based in Melbourne who likes building products end to end architecture, backend, database design, infrastructure and the UI on top. I'm especially interested in startups where engineers work close to the product and can see the impact of their work directly.",
  highlights: [
    {
      label: "Current role",
      value: "Software Prod & Platform Engineering Analyst at Accenture",
    },
    {
      label: "Background",
      value: "Bachelor of Computer Science, Deakin University",
    },
    {
      label: "Focus",
      value: "Full-stack product engineering across frontend, backend, infrastructure and testing",
    },
  ],
} as const;

export const skillGroups = [
  {
    name: "Languages",
    skills: [
      { name: "TypeScript", level: 90 },
      { name: "JavaScript", level: 88 },
      { name: "Python", level: 75 },
      { name: "SQL", level: 78 },
    ],
  },
  {
    name: "Frontend",
    skills: [
      { name: "React", level: 92 },
      { name: "Next.js", level: 90 },
      { name: "Tailwind CSS", level: 88 },
    ],
  },
  {
    name: "Backend & Data",
    skills: [
      { name: "Node.js", level: 85 },
      { name: "PostgreSQL", level: 80 },
      { name: "Supabase", level: 78 },
      { name: "REST APIs", level: 88 },
    ],
  },
  {
    name: "Cloud & DevOps",
    skills: [
      { name: "AWS", level: 75 },
      { name: "Docker", level: 78 },
      { name: "Vercel", level: 85 },
      { name: "GitHub Actions", level: 82 },
    ],
  },
  {
    name: "Testing & Observability",
    skills: [
      { name: "Jest", level: 80 },
      { name: "Playwright", level: 78 },
      { name: "Sentry", level: 72 },
      { name: "Better Stack", level: 70 },
    ],
  },
  {
    name: "Tools",
    skills: [
      { name: "Git", level: 90 },
      { name: "GitHub", level: 90 },
      { name: "Figma", level: 70 },
      { name: "Jira", level: 78 },
    ],
  },
] as const;

export const projects = [
  {
    title: "GraphOrg",
    subtitle: "Company knowledge and engineering context platform",
    description:
      "Engineering information is spread across repositories, documentation, cloud infrastructure and project-management tools. GraphOrg connects these systems into a searchable map of an organisation, its teams, services, repositories and infrastructure, so engineers can find context without hunting through five different tools.",
    highlights: [
      "GitHub, Jira & Confluence integrations",
      "Organisation relationship graph: teams, services, repositories and infrastructure",
      "Search",
      "AI assistant with source citations",
      "MCP / agent access",
      "Background synchronisation",
      "Authentication & authorization",
      "Docker deployment & cloud infrastructure",
      "CI/CD",
      "Observability",
    ],
    tags: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS"],
    href: null,
    github: null,
    caseStudyHref: "/projects/graphorg",
    featured: true,
    year: "2025   Present",
  },
  {
    title: "Mafia",
    subtitle: "Multiplayer social-deduction platform",
    description:
      "A long-form multiplayer Mafia platform supporting games with multiple roles, timed phases, private communication, voting and automated game management, built for real games with real people rather than a tech demo.",
    highlights: [
      "Real-time multiplayer state",
      "Authentication",
      "Game & lobby management",
      "Role assignment",
      "Night actions",
      "Voting system",
      "Multiple chat channels",
      "Timed game phases",
      "Notifications",
      "Responsive / PWA experience",
      "Database design",
      "Authorization & security",
    ],
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "Supabase", "Vercel"],
    href: null,
    github: null,
    caseStudyHref: "/projects/mafia",
    featured: true,
    year: "2025   Present",
  },
  {
    title: "Pachrukhi",
    subtitle: "Family history and genealogy platform",
    description:
      "An early-stage project working through the harder engineering problems in genealogy software: graph-like family relationships, searching large family structures, privacy and access control over sensitive records, and media and document handling at scale. Still early, more to show here soon.",
    highlights: [
      "Graph-like family relationships",
      "Search over large family structures",
      "Privacy & access control",
      "Media & document handling",
    ],
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
    href: null,
    github: null,
    caseStudyHref: null,
    featured: false,
    year: "2026",
  },
] as const;

export const experience = [
  {
    period: "Sep 2025   Present",
    role: "Software Prod & Platform Engineering Analyst",
    company: "Accenture",
    description:
      "Contributing to enterprise platform delivery for the Australian Taxation Office's PayDay Super project. Designing manual and automated test solutions, writing database queries for validation and defect investigation, and running end-to-end integration testing across interconnected services. Working closely with developers and system designers within a disciplined Azure DevOps agile framework across enterprise systems.",
  },
  {
    period: "Jan 2024   Sep 2025",
    role: "Software Engineer",
    company: "Webifex Labs",
    description:
      "Delivered production full-stack Next.js applications end to end: REST APIs and backend services in Node.js and Express, PostgreSQL and MongoDB schema design, secure authentication and payment integrations, and CI/CD pipelines in GitHub Actions. Owned features from Figma handoff through cloud deployment and production support.",
  },
] as const;

export const nowBuilding = [
  "GraphOrg   Organisational context platform · latest: wiring up the GitHub/Jira/Confluence integrations and the relationship graph",
  "Mafia   Multiplayer social-deduction platform · latest: building out the voting system and timed game phases",
] as const;

export const stats = [
  { value: "3+", label: "Years in software engineering" },
  { value: "4", label: "Professional certifications" },
  { value: "3", label: "Products in active development" },
] as const;

export const education = [
  {
    degree: "Bachelor of Computer Science",
    institution: "Deakin University",
    detail: "Major in Full-Stack Development",
  },
] as const;

export const certifications = [
  "Meta Back-End Developer Professional Certificate",
  "AWS Certified Developer   Associate",
  "Reinvention with Agentic AI",
  "ICAgile Fundamentals",
] as const;
