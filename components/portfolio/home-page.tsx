"use client";

import { motion } from "framer-motion";
import { About } from "@/components/portfolio/about";
import { Activity } from "@/components/portfolio/activity";
import { Contact } from "@/components/portfolio/contact";
import { Education } from "@/components/portfolio/education";
import { Experience } from "@/components/portfolio/experience";
import { Footer } from "@/components/portfolio/footer";
import { GridBackground } from "@/components/portfolio/grid-background";
import { Hero } from "@/components/portfolio/hero";
import { BadAppleEgg } from "@/components/portfolio/bad-apple-egg";
import { KonamiEgg } from "@/components/portfolio/konami-egg";
import { Nav } from "@/components/portfolio/nav";
import { Projects } from "@/components/portfolio/projects";
import { Skills } from "@/components/portfolio/skills";

export function HomePage() {
  return (
    <>
      <GridBackground />
      <KonamiEgg />
      <BadAppleEgg />
      <Nav />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Hero />
        <Projects />
        <Experience />
        <Activity />
        <Skills />
        <About />
        <Education />
        <Contact />
      </motion.main>
      <Footer />
    </>
  );
}
