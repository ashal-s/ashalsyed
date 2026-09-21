import { NextResponse } from "next/server";
import {
  about,
  certifications,
  education,
  experience,
  projects,
  site,
  skillGroups,
} from "@/lib/portfolio";

export const dynamic = "force-static";

function buildLlmText(): string {
  const base = `https://${site.domain}`;
  const lines: string[] = [];

  lines.push(`# ${site.name}   ${site.title}`);
  lines.push("");
  lines.push(`> ${site.tagline}`);
  lines.push("");
  lines.push(about.intro);
  lines.push("");

  lines.push("## Contact");
  lines.push(`- Email: ${site.email}`);
  lines.push(`- GitHub: ${site.github}`);
  lines.push(`- LinkedIn: ${site.linkedin}`);
  lines.push(`- Website: ${base}`);
  lines.push(`- Location: ${site.location}`);
  lines.push("");

  lines.push("## Skills");
  for (const group of skillGroups) {
    const skills = group.skills.map((s) => s.name).join(", ");
    lines.push(`- ${group.name}: ${skills}`);
  }
  lines.push("");

  lines.push("## Projects");
  for (const project of projects) {
    lines.push(
      `- [${project.title}](${project.href}) (${project.year}): ${project.description}`
    );
  }
  lines.push("");

  lines.push("## Experience");
  for (const job of experience) {
    lines.push(
      `- ${job.period}   ${job.role} @ ${job.company}: ${job.description}`
    );
  }
  lines.push("");

  lines.push("## Education");
  for (const item of education) {
    lines.push(`- ${item.degree}, ${item.institution} (${item.detail})`);
  }
  lines.push("");

  lines.push("## Certifications");
  for (const cert of certifications) {
    lines.push(`- ${cert}`);
  }
  lines.push("");

  lines.push("## Pages");
  lines.push(`- Home: ${base}/`);
  lines.push(`- Sitemap: ${base}/sitemap.xml`);

  return lines.join("\n");
}

export function GET() {
  return new NextResponse(buildLlmText(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
