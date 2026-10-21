/**
 * Fallback mount of landing-1 when the static rewrite is not used.
 * Prefer `public/landing-v1/index.html` via next.config rewrite on `/`.
 */
"use client";

import { useEffect, useRef } from "react";

const STYLE_HREF = "/landing-v1/styles.css";
const SCRIPT_SRC = "/landing-v1/script.js";
const ROOT_CLASS = "landing-v1-active";

export type LandingV1ClientProps = {
  html: string;
};

export function LandingV1Client({ html }: LandingV1ClientProps) {
  const booted = useRef(false);

  useEffect(() => {
    document.documentElement.classList.add(ROOT_CLASS);
    document.body.classList.add(ROOT_CLASS);
    const hadDark = document.documentElement.classList.contains("dark");
    if (hadDark) document.documentElement.classList.remove("dark");

    if (!document.querySelector(`link[data-landing-v1="css"]`)) {
      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = STYLE_HREF;
      style.dataset.landingV1 = "css";
      document.head.appendChild(style);
    }

    // Script is an IIFE with DOM listeners — load once per full page life.
    if (!booted.current && !document.querySelector(`script[data-landing-v1="js"]`)) {
      booted.current = true;
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.dataset.landingV1 = "js";
      document.body.appendChild(script);
    }

    return () => {
      document.documentElement.classList.remove(ROOT_CLASS);
      document.body.classList.remove(ROOT_CLASS);
      if (hadDark) document.documentElement.classList.add("dark");
    };
  }, []);

  return <div className="landing-v1-root" dangerouslySetInnerHTML={{ __html: html }} />;
}
