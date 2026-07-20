(() => {
  function syncOpeningTitleTarget() {
    const intro = document.querySelector(".opening-intro");
    const target = document.querySelector(".editorial-title h1 span");
    if (!intro || !target) return;

    const rect = target.getBoundingClientRect();
    intro.style.setProperty("--opening-target-left", `${rect.left}px`);
    intro.style.setProperty("--opening-target-top", `${rect.top}px`);
    intro.style.setProperty("--opening-target-width", `${rect.width}px`);
  }

  const observer = new MutationObserver(syncOpeningTitleTarget);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("resize", syncOpeningTitleTarget, { passive: true });
  requestAnimationFrame(syncOpeningTitleTarget);
  window.setTimeout(syncOpeningTitleTarget, 250);
})();
