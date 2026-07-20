function createSimplexNoise(seed = 1) {
  const gradients = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [1, 0], [-1, 0],
    [0, 1], [0, -1], [0, 1], [0, -1],
  ];
  const permutation = new Uint8Array(512);
  const source = new Uint8Array(256);
  let state = seed >>> 0;

  function random() {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  }

  for (let index = 0; index < 256; index += 1) source[index] = index;
  for (let index = 255; index >= 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const value = source[swapIndex];
    source[swapIndex] = source[index];
    permutation[index] = value;
    permutation[index + 256] = value;
  }

  return (xInput, yInput) => {
    const f2 = 0.5 * (Math.sqrt(3) - 1);
    const g2 = (3 - Math.sqrt(3)) / 6;
    const skew = (xInput + yInput) * f2;
    const i = Math.floor(xInput + skew);
    const j = Math.floor(yInput + skew);
    const unskew = (i + j) * g2;
    const x0 = xInput - (i - unskew);
    const y0 = yInput - (j - unskew);
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + g2;
    const y1 = y0 - j1 + g2;
    const x2 = x0 - 1 + 2 * g2;
    const y2 = y0 - 1 + 2 * g2;
    const ii = i & 255;
    const jj = j & 255;

    function corner(x, y, gradientIndex) {
      const amount = 0.5 - x * x - y * y;
      if (amount < 0) return 0;
      const gradient = gradients[gradientIndex];
      return amount ** 4 * (gradient[0] * x + gradient[1] * y);
    }

    const g0 = permutation[ii + permutation[jj]] % 12;
    const g1 = permutation[ii + i1 + permutation[jj + j1]] % 12;
    const g2Index = permutation[ii + 1 + permutation[jj + 1]] % 12;
    return 70 * (corner(x0, y0, g0) + corner(x1, y1, g1) + corner(x2, y2, g2Index));
  };
}

export function initRomanticFluidEffect() {
  const canvas = document.querySelector(".archive-fluid-canvas");
  const preview = canvas?.closest(".archive-romantic-preview");
  const sourceImage = preview?.querySelector(".archive-romantic-frame-base");
  if (!canvas || !preview || !sourceImage) return undefined;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return undefined;

  const noise = createSimplexNoise(290413);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const image = new Image();
  let animationFrame = 0;
  let width = 0;
  let height = 0;
  let lastFrame = 0;
  let isVisible = true;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    width = Math.max(1, Math.round(rect.width * dpr));
    height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function getCoverCrop() {
    const imageAspect = image.naturalWidth / image.naturalHeight;
    const canvasAspect = width / height;
    if (imageAspect > canvasAspect) {
      const cropWidth = image.naturalHeight * canvasAspect;
      return { x: (image.naturalWidth - cropWidth) / 2, y: 0, width: cropWidth, height: image.naturalHeight };
    }
    const cropHeight = image.naturalWidth / canvasAspect;
    return { x: 0, y: (image.naturalHeight - cropHeight) / 2, width: image.naturalWidth, height: cropHeight };
  }

  function draw(now) {
    if (!width || !height) resize();
    if (!image.complete || !image.naturalWidth || !isVisible) {
      animationFrame = window.requestAnimationFrame(draw);
      return;
    }

    if (!reduceMotion && now - lastFrame < 32) {
      animationFrame = window.requestAnimationFrame(draw);
      return;
    }
    lastFrame = now;

    const crop = getCoverCrop();
    const columns = width > 900 ? 46 : 38;
    const rows = width > 900 ? 34 : 28;
    const sourceTileWidth = crop.width / columns;
    const sourceTileHeight = crop.height / rows;
    const tileWidth = width / columns;
    const tileHeight = height / rows;
    const time = now * 0.00028;
    const breath = 0.72 + Math.sin(now * 0.0009) * 0.28;
    const amplitudeX = width * (0.018 + breath * 0.014);
    const amplitudeY = height * (0.018 + breath * 0.013);

    context.clearRect(0, 0, width, height);
    context.globalAlpha = 1;
    context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
    context.globalAlpha = 0.94;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const nx = column / columns;
        const ny = row / rows;
        const broad = noise(nx * 1.48 + time * 0.72, ny * 1.34 - time * 0.5);
        const detail = noise(nx * 3.8 - time * 0.88, ny * 3.35 + time * 0.76);
        const cross = noise(nx * 2.2 + ny * 0.82 + time * 0.58, ny * 1.92 - nx * 0.46 - time * 0.64);
        const offsetX = (broad * 0.76 + detail * 0.24) * amplitudeX;
        const offsetY = (cross * 0.72 - broad * 0.28) * amplitudeY;

        context.drawImage(
          image,
          crop.x + column * sourceTileWidth,
          crop.y + row * sourceTileHeight,
          sourceTileWidth + 1,
          sourceTileHeight + 1,
          column * tileWidth + offsetX,
          row * tileHeight + offsetY,
          tileWidth + 2.5,
          tileHeight + 2.5,
        );
      }
    }

    context.globalAlpha = 1;

    if (!reduceMotion) animationFrame = window.requestAnimationFrame(draw);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(preview);

  const visibilityObserver = new IntersectionObserver((entries) => {
    isVisible = entries[0]?.isIntersecting ?? true;
  }, { rootMargin: "160px" });
  visibilityObserver.observe(preview);

  image.decoding = "async";
  image.src = sourceImage.currentSrc || sourceImage.src;
  image.addEventListener("load", () => {
    resize();
    if (reduceMotion) draw(0);
  }, { once: true });

  resize();
  animationFrame = window.requestAnimationFrame(draw);

  return () => {
    window.cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
  };
}
