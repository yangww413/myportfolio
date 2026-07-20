import { useEffect, useLayoutEffect, useMemo } from "react";
import { initPortfolioInteractions } from "../interactions.js";
import { initRomanticFluidEffect } from "../codex-interactions.js";
import portfolioPreviewHtml from "../../portfolio-preview.codex.html?raw";

export default function PortfolioHome() {
  const markup = useMemo(() => {
    const parsed = new DOMParser().parseFromString(portfolioPreviewHtml, "text/html");
    return parsed.querySelector("main")?.outerHTML || "";
  }, []);

  useLayoutEffect(() => {
    if (!markup || !window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;

    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    const previousRestoration = window.history.scrollRestoration;
    root.style.scrollBehavior = "auto";
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);

    window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previousBehavior;
      window.history.scrollRestoration = previousRestoration;
    });
  }, [markup]);

  useEffect(() => {
    if (!markup) return undefined;
    const cleanupPortfolio = initPortfolioInteractions();
    const cleanupRomanticFluid = initRomanticFluidEffect();

    function scrollToCurrentHash() {
      if (!window.location.hash) return;
      const target = document.querySelector(window.location.hash);
      if (!target) return;
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);
      window.requestAnimationFrame(() => {
        root.style.scrollBehavior = previousBehavior;
      });
    }

    window.addEventListener("hashchange", scrollToCurrentHash);
    return () => {
      window.removeEventListener("hashchange", scrollToCurrentHash);
      cleanupPortfolio?.();
      cleanupRomanticFluid?.();
    };
  }, [markup]);

  if (!markup) {
    return <div className="portfolio-loading">WW&apos;s Portfolio</div>;
  }

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
