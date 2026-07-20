export function initPortfolioInteractions() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const disposers = [];
  const editorialHome = document.querySelector(".editorial-home");

  if (editorialHome) document.body.classList.add("editorial-home-active");

  document.querySelectorAll(".scroll-progress, .site-cursor, .signal-ribbon").forEach((element) => element.remove());

  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  const cursor = document.createElement("div");
  cursor.className = "site-cursor";
  document.body.appendChild(cursor);

  function on(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    disposers.push(() => target.removeEventListener(event, handler, options));
  }

  function createSimplexNoise(seed = 1) {
    const grad3 = [
      [1, 1], [-1, 1], [1, -1], [-1, -1],
      [1, 0], [-1, 0], [1, 0], [-1, 0],
      [0, 1], [0, -1], [0, 1], [0, -1],
    ];
    const perm = new Uint8Array(512);
    const source = new Uint8Array(256);
    let state = seed >>> 0;

    function random() {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return state / 4294967296;
    }

    for (let i = 0; i < 256; i += 1) source[i] = i;
    for (let i = 255; i >= 0; i -= 1) {
      const r = Math.floor(random() * (i + 1));
      const value = source[r];
      source[r] = source[i];
      perm[i] = value;
      perm[i + 256] = value;
    }

    return (xin, yin) => {
      const f2 = 0.5 * (Math.sqrt(3) - 1);
      const g2 = (3 - Math.sqrt(3)) / 6;
      const s = (xin + yin) * f2;
      const i = Math.floor(xin + s);
      const j = Math.floor(yin + s);
      const t = (i + j) * g2;
      const x0 = xin - (i - t);
      const y0 = yin - (j - t);
      const i1 = x0 > y0 ? 1 : 0;
      const j1 = x0 > y0 ? 0 : 1;
      const x1 = x0 - i1 + g2;
      const y1 = y0 - j1 + g2;
      const x2 = x0 - 1 + 2 * g2;
      const y2 = y0 - 1 + 2 * g2;
      const ii = i & 255;
      const jj = j & 255;
      const gi0 = perm[ii + perm[jj]] % 12;
      const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
      const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;

      function corner(x, y, gradientIndex) {
        const tt = 0.5 - x * x - y * y;
        if (tt < 0) return 0;
        const g = grad3[gradientIndex];
        return tt * tt * tt * tt * (g[0] * x + g[1] * y);
      }

      return 70 * (corner(x0, y0, gi0) + corner(x1, y1, gi1) + corner(x2, y2, gi2));
    };
  }

  function initHeroFluidBackground() {
    const canvas = document.querySelector(".hero-fluid-canvas");
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const noise = createSimplexNoise(4132026);
    const buffer = document.createElement("canvas");
    const bufferContext = buffer.getContext("2d");
    if (!bufferContext) return;

    let frameId = 0;
    let lastFrame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(1, Math.floor(rect.width * dpr));
      height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;
      buffer.width = Math.max(96, Math.floor(width / 8));
      buffer.height = Math.max(64, Math.floor(height / 8));
    }

    function drawColorField(time) {
      const bw = buffer.width;
      const bh = buffer.height;
      const image = bufferContext.createImageData(bw, bh);
      const data = image.data;

      for (let y = 0; y < bh; y += 1) {
        for (let x = 0; x < bw; x += 1) {
          const nx = x / bw;
          const ny = y / bh;
          const slow = noise(nx * 2.1 + time * 0.16, ny * 2.1 - time * 0.11);
          const detail = noise(nx * 5.8 - time * 0.2, ny * 4.6 + time * 0.18);
          const fold = noise(nx * 10.5 + slow * 0.42, ny * 9.5 + detail * 0.36 + time * 0.14);
          const warm = Math.max(0, slow * 0.58 + fold * 0.28 + 0.44);
          const cool = Math.max(0, -slow * 0.42 + detail * 0.34 + 0.36);
          const highlight = Math.max(0, fold * 0.5 + 0.5) ** 4;
          const vignette = 1 - Math.min(0.72, Math.hypot(nx - 0.52, ny - 0.48) * 1.05);
          const i = (y * bw + x) * 4;

          data[i] = Math.min(255, (8 + warm * 118 + highlight * 72) * vignette);
          data[i + 1] = Math.min(255, (9 + warm * 58 + cool * 94 + highlight * 54) * vignette);
          data[i + 2] = Math.min(255, (10 + cool * 112 + warm * 34 + highlight * 48) * vignette);
          data[i + 3] = 255;
        }
      }

      bufferContext.putImageData(image, 0, 0);
      context.imageSmoothingEnabled = true;
      context.drawImage(buffer, 0, 0, width, height);
    }

    function drawFlowLines(time) {
      context.save();
      context.globalCompositeOperation = "screen";
      context.lineCap = "round";

      for (let i = 0; i < 92; i += 1) {
        let x = ((Math.sin(i * 17.31 + time * 0.72) * 0.5 + 0.5) * width);
        let y = ((Math.cos(i * 9.73 - time * 0.54) * 0.5 + 0.5) * height);
        const isWarm = i % 3 !== 0;
        context.beginPath();
        context.moveTo(x, y);

        for (let step = 0; step < 42; step += 1) {
          const angle = noise(x * 0.0018 + time * 0.7, y * 0.0018 - time * 0.56) * Math.PI * 2.2;
          const length = (4.8 + (i % 7) * 0.62) * dpr;
          x += Math.cos(angle) * length;
          y += Math.sin(angle) * length;
          context.lineTo(x, y);
        }

        context.strokeStyle = isWarm
          ? `rgba(234, 166, 119, ${0.035 + (i % 5) * 0.012})`
          : `rgba(77, 157, 161, ${0.04 + (i % 4) * 0.014})`;
        context.lineWidth = (0.8 + (i % 4) * 0.34) * dpr;
        context.stroke();
      }

      context.restore();
    }

    function draw(now) {
      if (!width || !height) resize();
      const shouldThrottle = !reduceMotion && now - lastFrame < 32;
      if (shouldThrottle) {
        frameId = requestAnimationFrame(draw);
        return;
      }

      lastFrame = now;
      const time = now * 0.00022;
      drawColorField(time);
      drawFlowLines(time);

      if (!reduceMotion) frameId = requestAnimationFrame(draw);
    }

    resize();
    on(window, "resize", resize, { passive: true });
    frameId = requestAnimationFrame(draw);
    disposers.push(() => cancelAnimationFrame(frameId));
  }

  function updateProgress() {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    root.style.setProperty("--scroll-progress", String(window.scrollY / scrollable));
  }

  function updateArchiveSection() {
    if (!editorialHome) return;
    const sections = Array.from(editorialHome.querySelectorAll("[data-folio]"));
    const folioCurrent = editorialHome.querySelector(".folio-current");
    const navLinks = Array.from(editorialHome.querySelectorAll(".archive-navlinks a[href^='#']"));
    const readingLine = window.innerHeight * 0.38;
    let activeSection = sections[0];

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= readingLine) activeSection = section;
    });

    if (folioCurrent && activeSection?.dataset.folio) {
      folioCurrent.textContent = activeSection.dataset.folio;
    }

    const activeId = activeSection?.id || "about";
    navLinks.forEach((link) => {
      const target = link.getAttribute("href")?.slice(1);
      const shouldBeActive = activeId === "home" ? target === "about" : target === activeId;
      link.classList.toggle("is-active", shouldBeActive);
    });
  }

  initHeroFluidBackground();

  on(window, "scroll", updateProgress, { passive: true });
  on(window, "scroll", updateArchiveSection, { passive: true });
  on(window, "resize", updateArchiveSection, { passive: true });
  updateProgress();
  updateArchiveSection();

  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    on(window, "pointermove", (event) => {
      root.style.setProperty("--cursor-x", `${event.clientX}px`);
      root.style.setProperty("--cursor-y", `${event.clientY}px`);
      root.style.setProperty("--hero-x", `${event.clientX - window.innerWidth / 2}px`);
      root.style.setProperty("--hero-y", `${event.clientY - window.innerHeight / 2}px`);
    });

    document.querySelectorAll("a, button, video").forEach((element) => {
      const enter = () => document.body.classList.add("cursor-active");
      const leave = () => document.body.classList.remove("cursor-active");
      on(element, "pointerenter", enter);
      on(element, "pointerleave", leave);
    });
  }

  document.querySelectorAll(".hero, .case-hero").forEach((section) => {
    if (section.closest(".wedding-case")) return;

    const ribbon = document.createElement("div");
    ribbon.className = "signal-ribbon";
    ribbon.setAttribute("aria-hidden", "true");
    ribbon.innerHTML = "<span>PORTFOLIO / VISUAL DESIGN / AI CREATIVE / BRAND CONTENT / </span><span>PORTFOLIO / VISUAL DESIGN / AI CREATIVE / BRAND CONTENT / </span>";
    section.appendChild(ribbon);
  });

  document.querySelectorAll(".project, .concept-grid article, .cap-card, .scheme-links a").forEach((card) => {
    card.classList.add("motion-card");

    on(card, "pointermove", (event) => {
      if (reduceMotion) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
      card.style.setProperty("--glare-x", `${((x + 0.5) * 100).toFixed(0)}%`);
      card.style.setProperty("--glare-y", `${((y + 0.5) * 100).toFixed(0)}%`);
    });

    on(card, "pointerleave", () => {
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });

  const tourStops = document.querySelectorAll(
    ".scheme-lines-page:not(.scheme-yuming-page):not(.scheme-orchid-page) .lines-render-sheet .scheme-render-collage figure",
  );
  let pinnedTourStop = null;
  const tourStopLabels = {
    "render-e": "1",
    "render-c": "2",
    "render-f": "3",
    "render-d": "4",
    "render-b": "5",
    "render-a": "6",
  };

  function activateTourStop(stop, shouldPin = false) {
    tourStops.forEach((item) => item.classList.toggle("is-active", item === stop));
    if (shouldPin) pinnedTourStop = stop;
  }

  tourStops.forEach((stop) => {
    stop.classList.add("tour-stop");
    stop.setAttribute("tabindex", "0");
    stop.setAttribute("role", "button");
    const label = Object.entries(tourStopLabels).find(([className]) => stop.classList.contains(className))?.[1] || "";
    stop.setAttribute("aria-label", `Tour stop ${label}`);

    on(stop, "pointerenter", () => activateTourStop(stop));
    on(stop, "pointerleave", () => {
      if (pinnedTourStop && pinnedTourStop !== stop) {
        activateTourStop(pinnedTourStop);
        return;
      }
      if (pinnedTourStop !== stop) stop.classList.remove("is-active");
    });
    on(stop, "click", () => activateTourStop(stop, true));
    on(stop, "focus", () => activateTourStop(stop));
    on(stop, "blur", () => {
      if (pinnedTourStop !== stop) stop.classList.remove("is-active");
    });
    on(stop, "keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activateTourStop(stop, true);
    });
  });

  document.querySelectorAll(
    ".scheme-yuming-page .lines-render-sheet .scheme-render-collage figure, .scheme-orchid-page .lines-render-sheet .scheme-render-collage figure",
  ).forEach((figure) => {
    figure.setAttribute("tabindex", "0");
    figure.setAttribute("role", "img");
    const imageLabel = figure.querySelector("img")?.getAttribute("alt")?.trim();
    if (imageLabel) figure.setAttribute("aria-label", imageLabel);

    on(figure, "pointerenter", () => figure.classList.add("is-active"));
    on(figure, "pointerleave", () => figure.classList.remove("is-active"));
    on(figure, "focus", () => figure.classList.add("is-active"));
    on(figure, "blur", () => figure.classList.remove("is-active"));
  });

  document.querySelectorAll(".wedding-case .wedding-story, .wedding-case .lines-mood-sheet").forEach((part, index) => {
    part.classList.add("wedding-part");
    part.style.setProperty("--part-order", index);
  });

  const revealTargets = document.querySelectorAll(".reveal, .timeline-item, .project, .cap-card, .concept-grid article, .journey-list article, .scheme-links a, .wedding-part");
  let observer;
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });
    revealTargets.forEach((element) => observer.observe(element));
    disposers.push(() => observer.disconnect());
  } else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  }

  const statNumbers = document.querySelectorAll(".stat-number");
  function animateStat(element) {
    if (element.dataset.counted) return;
    element.dataset.counted = "true";

    const target = Number(element.dataset.count || 0);
    const suffix = element.dataset.suffix || "";

    if (reduceMotion) {
      element.textContent = `${target}${suffix}`;
      return;
    }

    const duration = 1100;
    const startTime = performance.now();

    function tick(now) {
      const progressValue = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      element.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progressValue < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  let statsObserver;
  if ("IntersectionObserver" in window) {
    statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateStat(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    statNumbers.forEach((element) => statsObserver.observe(element));
    disposers.push(() => statsObserver.disconnect());
  } else {
    statNumbers.forEach(animateStat);
  }

  document.body.classList.add("motion-ready");
  if (editorialHome) editorialHome.classList.add("motion-ready");

  return () => {
    disposers.forEach((dispose) => dispose());
    document.querySelectorAll(".scroll-progress, .site-cursor, .signal-ribbon").forEach((element) => element.remove());
    document.body.classList.remove("cursor-active");
    document.body.classList.remove("editorial-home-active");
    if (editorialHome) editorialHome.classList.remove("motion-ready");
  };
}
