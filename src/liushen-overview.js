export function initLiushenOverview() {
  const carousel = document.querySelector("[data-liushen-overview-carousel]");
  if (!carousel) return () => {};

  const viewport = carousel.querySelector("[data-overview-viewport]");
  const track = carousel.querySelector("[data-overview-track]");
  const originals = [...carousel.querySelectorAll(".liushen-overview-slide")];
  const previous = carousel.querySelector("[data-overview-prev]");
  const next = carousel.querySelector("[data-overview-next]");
  const counter = carousel.querySelector("[data-overview-count]");
  const kicker = carousel.querySelector("[data-overview-kicker]");
  const title = carousel.querySelector("[data-overview-title]");
  const summary = carousel.querySelector("[data-overview-summary]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!viewport || !track || originals.length === 0) return () => {};

  originals.forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.dataset.clone = "true";
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("tabindex", "-1");
    track.appendChild(clone);
  });

  const slides = [...track.querySelectorAll(".liushen-overview-slide")];
  let activeIndex = 0;
  let loopWidth = 0;
  let frame = 0;
  let lastTime = 0;
  let lastMetaTime = 0;
  let isVisible = true;
  let isPaused = false;

  function syncOverviewVideos() {
    slides.forEach((slide, index) => {
      const video = slide.querySelector(".liushen-overview-video");
      if (!video) return;
      const shouldPlay = index % originals.length === activeIndex && isVisible && !document.hidden;
      if (!shouldPlay) {
        video.pause();
        if (video.currentSrc) {
          video.removeAttribute("src");
          video.load();
        }
        return;
      }
      if (!video.src && video.dataset.src) {
        video.src = video.dataset.src;
        video.load();
      }
      video.play().catch(() => {});
    });
  }

  function updateMeta(index) {
    activeIndex = (index + originals.length) % originals.length;
    originals.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === activeIndex));
    slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex % originals.length === activeIndex));
    const caption = originals[activeIndex].querySelector(".liushen-overview-caption");
    if (kicker) kicker.textContent = caption?.querySelector("small")?.textContent?.trim() || "";
    if (title) title.textContent = caption?.querySelector("h2")?.textContent?.trim() || "";
    if (summary) summary.textContent = caption?.querySelector("p")?.textContent?.trim() || "";
    if (counter) counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(originals.length).padStart(2, "0")}`;
    syncOverviewVideos();
  }

  function syncMeasurements() {
    const firstClone = slides[originals.length];
    loopWidth = firstClone ? firstClone.offsetLeft - originals[0].offsetLeft : 0;
    if (loopWidth > 0) track.style.setProperty("--liushen-overview-marquee-distance", `${-loopWidth}px`);
  }

  function closestIndex() {
    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    const closest = slides.reduce((result, slide, index) => {
      const distance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center);
      return distance < result.distance ? { index, distance } : result;
    }, { index: 0, distance: Infinity });
    return closest.index % originals.length;
  }

  function tick(time) {
    if (!lastTime) lastTime = time;
    const delta = Math.min(48, time - lastTime);
    lastTime = time;

    if (isVisible && !isPaused && !document.hidden && !reduceMotion.matches) {
      if (time - lastMetaTime > 4300) {
        updateMeta(activeIndex + 1);
        lastMetaTime = time;
      }
    }
    frame = requestAnimationFrame(tick);
  }

  function nudge(direction) {
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0");
    const step = originals[0].offsetWidth + gap;
    viewport.scrollBy({ left: direction * step, behavior: reduceMotion.matches ? "auto" : "smooth" });
    updateMeta(activeIndex + direction);
  }

  function openSlide(slide, index) {
    updateMeta(index);
    document.querySelector(slide.dataset.target)?.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  }

  originals.forEach((slide, index) => {
    slide.addEventListener("mouseenter", () => updateMeta(index));
    slide.addEventListener("focus", () => updateMeta(index));
    slide.addEventListener("click", () => openSlide(slide, index));
  });
  slides.slice(originals.length).forEach((slide, index) => {
    slide.addEventListener("click", () => openSlide(slide, index));
  });

  previous?.addEventListener("click", () => nudge(-1));
  next?.addEventListener("click", () => nudge(1));
  carousel.addEventListener("mouseenter", () => { isPaused = true; });
  carousel.addEventListener("mouseleave", () => { isPaused = false; });
  carousel.addEventListener("focusin", () => { isPaused = true; });
  carousel.addEventListener("focusout", () => { isPaused = false; });
  viewport.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    viewport.scrollLeft += event.deltaY;
  }, { passive: false });

  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        syncOverviewVideos();
      }, { threshold: 0.08 })
    : null;
  observer?.observe(carousel);
  window.addEventListener("resize", syncMeasurements);
  requestAnimationFrame(syncMeasurements);
  updateMeta(0);
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    observer?.disconnect();
    slides.forEach((slide) => slide.querySelector(".liushen-overview-video")?.pause());
    window.removeEventListener("resize", syncMeasurements);
  };
}
