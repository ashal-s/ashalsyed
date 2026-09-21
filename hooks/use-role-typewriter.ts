"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 55;
const ERASE_MS = 32;
const HOLD_MS = 2000;

export function useRoleTypewriter(texts: readonly string[]) {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "erasing">("typing");

  useEffect(() => {
    const full = texts[index] ?? "";
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (display.length < full.length) {
        timeout = setTimeout(() => {
          setDisplay(full.slice(0, display.length + 1));
        }, TYPE_MS);
      } else {
        timeout = setTimeout(() => setPhase("holding"), 0);
      }
    } else if (phase === "holding") {
      timeout = setTimeout(() => setPhase("erasing"), HOLD_MS);
    } else if (display.length > 0) {
      timeout = setTimeout(() => {
        setDisplay(display.slice(0, -1));
      }, ERASE_MS);
    } else {
      timeout = setTimeout(() => {
        setIndex((i) => (i + 1) % texts.length);
        setPhase("typing");
      }, 0);
    }

    return () => clearTimeout(timeout);
  }, [display, index, phase, texts]);

  return display;
}
