import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { caseStudies, getCaseStudy } from "@/lib/case-studies";
import { site } from "@/lib/portfolio";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  if (!caseStudy) return {};

  const title = `${caseStudy.title} Case Study   ${site.name}`;
  return {
    title,
    description: caseStudy.subtitle,
    openGraph: {
      title,
      description: caseStudy.subtitle,
      url: `https://${site.domain}/projects/${caseStudy.slug}`,
      siteName: site.domain,
      type: "article",
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  if (!caseStudy) notFound();

  return (
    <main className="pt-24 pb-24 px-6 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-10 font-mono group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          ~/projects
        </Link>

        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <p className="font-mono text-xs text-accent">Case Study</p>
            {caseStudy.draft && (
              <span className="px-2 py-0.5 rounded-md bg-muted/60 text-xs font-mono text-muted-foreground">
                Draft   details to verify
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight">
            {caseStudy.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {caseStudy.subtitle}
          </p>

          {caseStudy.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2 mt-6">
              {caseStudy.tags.map((tag) => (
                <li
                  key={tag}
                  className="px-2.5 py-1 rounded-md bg-muted/50 font-mono text-xs text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </header>

        <div className="content-prose">
          {caseStudy.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
