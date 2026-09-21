"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import {
  fadeUpItem,
  scaleIn,
  springSmooth,
  staggerContainer,
  viewport,
} from "@/lib/motion";
import { certifications, education } from "@/lib/portfolio";
import { SectionHeader } from "./section-header";

export function Education() {
  return (
    <section id="education" className="py-24 px-6 scroll-mt-20 border-t border-border/40">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="06   Education" title="Education" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer}
          className="space-y-4"
        >
          {education.map((item) => (
            <motion.div
              key={item.degree}
              variants={scaleIn}
              whileHover={{ y: -4 }}
              transition={springSmooth}
              className="rounded-xl border border-border/80 bg-card/40 p-6 flex items-start gap-4"
            >
              <div className="p-2.5 rounded-lg bg-accent/10 text-accent">
                <GraduationCap className="w-5 h-5" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{item.degree}</h3>
                <p className="text-muted-foreground">{item.institution}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
              </div>
            </motion.div>
          ))}

          {certifications.length > 0 && (
            <motion.div variants={fadeUpItem}>
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-3 mt-6">
                Certifications
              </p>
              <ul className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <li
                    key={cert}
                    className="px-3 py-1.5 rounded-md bg-muted/50 text-sm text-muted-foreground"
                  >
                    {cert}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
