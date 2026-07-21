import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import "../codex-refinements.css";

const INTRO_TIMING = {
  totalMs: 7600,
  reducedMs: 1400,
  helixDelay: 0.25,
  helixDuration: 5.1,
  titleRevealDelay: 5.45,
  handoffDelay: 5.85,
  handoffDuration: 1.35,
  exitDuration: 0.72,
};

const WORK_IMAGES = [
  "/assets/intro-thumbs/ceremony-area.jpg",
  "/projects/brand-film-direction/video-3s-posters/liushen-added-04-3s.png",
  "/assets/intro-thumbs/ceremony-lawn-wide.jpg",
  "/assets/intro-thumbs/indoor-render.jpg",
  "/projects/brand-film-direction/video-3s-posters/liushen-tianjiarui-gwpv3-3s.png",
  "/assets/intro-thumbs/main-stage.jpg",
  "/assets/intro-thumbs/indoor-stage.jpg",
  "/projects/brand-film-direction/video-3s-posters/liushen-friend-check-3s.png",
  "/assets/intro-thumbs/photo-wall-welcome.jpg",
  "/projects/brand-film-direction/video-3s-posters/liushen-work-03-3s.png",
  "/assets/intro-thumbs/photo-area-render.jpg",
  "/assets/intro-thumbs/pink-heart-stage-render.jpg",
  "/assets/intro-thumbs/dessert-area.jpg",
  "/assets/intro-thumbs/garden-ceremony-render.jpg",
  "/assets/intro-thumbs/silver-helix.jpg",
  "/assets/intro-thumbs/wanwen-yang.jpg",
];

const WORK_LABELS = [
  "Ceremony",
  "Endorser",
  "Garden",
  "South France",
  "Limited Gift",
  "Main Stage",
  "Indoor",
  "Friend Check",
  "Welcome",
  "Cooling Screen",
  "Photo Area",
  "Heart Stage",
  "Dessert",
  "Florals",
  "Structure",
  "Wanwen Yang",
];

const RIBBON_CARD_COUNT = WORK_IMAGES.length;
const RIBBON_STEP_DEG = 360 / RIBBON_CARD_COUNT;
const RIBBON_TOTAL_RISE_PX = 600;
const RIBBON_Y_NUDGES = [0, -18, 0, -12, 12, 18, 0, 0, -10, -16, 16, 10, 0, 0, 0, 0];

function makeHelixFrames(count) {
  return Array.from({ length: count }, (_, index) => ({
    angle: index * RIBBON_STEP_DEG,
    x: 0,
    // One full revolution with one continuous bottom-to-top rise.
    // Keeping the rise below one viewport prevents it reading as two rings.
    y: index * (RIBBON_TOTAL_RISE_PX / (count - 1)) - RIBBON_TOTAL_RISE_PX / 2 + (RIBBON_Y_NUDGES[index] ?? 0),
    delay: INTRO_TIMING.helixDelay + index * 0.003,
    imageIndex: index % WORK_IMAGES.length,
  }));
}

export default function OpeningIntro({ onComplete }) {
  const reduceMotion = useReducedMotion();
  const forceMotion = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("introMotion") === "1";
  const shouldReduceMotion = reduceMotion && !forceMotion;
  const completedRef = useRef(false);
  const introRef = useRef(null);
  const helixFrames = useMemo(() => makeHelixFrames(RIBBON_CARD_COUNT), []);

  useLayoutEffect(() => {
    function measureHomeWordmark() {
      const homeWordmark = document.querySelector(".editorial-title h1");
      if (!homeWordmark || !introRef.current) return;
      const rect = homeWordmark.getBoundingClientRect();
      introRef.current.style.setProperty("--opening-target-left", `${rect.left}px`);
      introRef.current.style.setProperty("--opening-target-top", `${rect.top}px`);
      introRef.current.style.setProperty("--opening-target-width", `${rect.width}px`);
      introRef.current.style.setProperty("--opening-target-height", `${rect.height}px`);
      introRef.current.style.setProperty("--opening-target-font-size", getComputedStyle(homeWordmark).fontSize);
      introRef.current.style.setProperty("--opening-target-line-height", getComputedStyle(homeWordmark).lineHeight);
      introRef.current.style.setProperty("--opening-start-left", `${(window.innerWidth - rect.width * 0.18) / 2}px`);
      introRef.current.style.setProperty("--opening-start-top", `${(window.innerHeight - rect.height * 0.18) / 2}px`);
    }

    const frame = window.requestAnimationFrame(measureHomeWordmark);
    document.fonts?.ready?.then(measureHomeWordmark);
    window.addEventListener("resize", measureHomeWordmark);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measureHomeWordmark);
    };
  }, []);

  function finish() {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete?.();
  }

  useEffect(() => {
    const timer = window.setTimeout(finish, shouldReduceMotion ? INTRO_TIMING.reducedMs : INTRO_TIMING.totalMs);
    return () => window.clearTimeout(timer);
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <motion.div ref={introRef} className="opening-intro opening-intro-reduced" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
        <motion.h1 className="opening-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <span>WANWEN</span>
        </motion.h1>
      </motion.div>
    );
  }

  return (
    <motion.div ref={introRef} className="opening-intro" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: INTRO_TIMING.exitDuration, ease: [0.22, 1, 0.36, 1] }}>
      <div className="opening-atmosphere" aria-hidden="true" />
      <button className="opening-skip" type="button" onClick={finish}>Skip</button>

      <motion.div className="opening-bg-word" aria-hidden="true" initial={{ opacity: 0, y: 36 }} animate={{ opacity: [0, 0.7, 0.7, 0], y: [36, 8, -18, -54] }} transition={{ delay: 0.28, duration: 4.05, times: [0, 0.25, 0.72, 1], ease: [0.22, 1, 0.36, 1] }}>
        WANWEN
      </motion.div>

      <div className="opening-fade opening-fade-top" />
      <div className="opening-fade opening-fade-bottom" />

      <motion.div
        className="opening-helix"
        initial={{ x: 0, y: "42vh", rotateX: 0, rotateZ: 0, scale: 1, "--helix-phase": "12deg" }}
        animate={{
          x: 0,
          y: ["42vh", "24vh", "9vh", "-2vh", "-34vh"],
          rotateX: 0,
          rotateZ: 0,
          scale: 1,
          "--helix-phase": ["12deg", "-60deg", "-305deg", "-503deg", "-708deg"],
        }}
        transition={{
          delay: INTRO_TIMING.helixDelay,
          duration: INTRO_TIMING.helixDuration,
          times: [0, 0.2, 0.57, 0.87, 1],
          ease: [[0.2, 0.26, 0.78, 0.595], "linear", "linear", [0.3, 0.12, 0.7, 0.55]],
        }}
      >
        {helixFrames.map((frame, index) => {
          const src = WORK_IMAGES[frame.imageIndex];
          const label = WORK_LABELS[frame.imageIndex];
          return (
            <motion.figure
              className="opening-helix-card"
              key={`${src}-${index}`}
              style={{ "--card-angle": `${frame.angle}deg`, "--card-x": `${frame.x}px`, "--card-y": `${frame.y}px` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0.96, 0] }}
              transition={{ delay: frame.delay, duration: INTRO_TIMING.helixDuration - 0.05, times: [0, 0.05, 0.88, 0.96, 1], ease: "linear" }}
            >
              <img src={src} alt="" loading="eager" decoding="async" fetchpriority={index < 10 ? "high" : "auto"} draggable="false" />
              <figcaption>{label}</figcaption>
            </motion.figure>
          );
        })}
      </motion.div>

      <motion.div className="opening-paper-wash" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: INTRO_TIMING.handoffDelay - 0.08, duration: INTRO_TIMING.handoffDuration, ease: [0.22, 1, 0.36, 1] }} />

      <motion.div
        className="opening-title-anchor"
        initial={{ left: "var(--opening-start-left)", top: "var(--opening-start-top)", width: "var(--opening-target-width)", x: 0, y: 0 }}
        animate={{ left: "var(--opening-target-left)", top: "var(--opening-target-top)", width: "var(--opening-target-width)", x: 0, y: 0 }}
        transition={{ delay: INTRO_TIMING.handoffDelay, duration: INTRO_TIMING.handoffDuration, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.h1
          className="opening-title"
          initial={{ opacity: 0, scale: 0.18, color: "#ddb08f", filter: "blur(18px)" }}
          animate={{ opacity: [0, 1, 1], scale: [0.18, 0.34, 1], color: ["#ddb08f", "#ddb08f", "#161616"], filter: ["blur(18px)", "blur(2px)", "blur(0px)"] }}
          transition={{ delay: INTRO_TIMING.titleRevealDelay, duration: INTRO_TIMING.handoffDelay + INTRO_TIMING.handoffDuration - INTRO_TIMING.titleRevealDelay, times: [0, 0.28, 1], ease: [0.16, 1, 0.3, 1] }}
        >
          <span>WANWEN</span>
        </motion.h1>
      </motion.div>
    </motion.div>
  );
}
