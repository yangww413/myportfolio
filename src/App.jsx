import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import OpeningIntro from "./components/OpeningIntro.jsx";
import PortfolioHome from "./components/PortfolioHome.jsx";

const INTRO_SESSION_KEY = "ww-opening-intro-played-wordmark-v2";

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get("intro") === "1") return true;
    if (params.get("skipIntro") === "1") return false;
    return sessionStorage.getItem(INTRO_SESSION_KEY) !== "true";
  });

  function completeIntro() {
    sessionStorage.setItem(INTRO_SESSION_KEY, "true");
    setShowIntro(false);
  }

  useEffect(() => {
    if (!showIntro) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showIntro]);

  return (
    <div className={`portfolio-shell ${showIntro ? "has-opening-intro" : "is-home-ready"}`}>
      <div className={`portfolio-app ${showIntro ? "portfolio-app-under-intro" : "portfolio-app-visible"}`} aria-hidden={showIntro ? "true" : undefined}>
        <PortfolioHome />
      </div>

      <AnimatePresence mode="sync">
        {showIntro ? <OpeningIntro key="opening-intro" onComplete={completeIntro} /> : null}
      </AnimatePresence>
    </div>
  );
}
