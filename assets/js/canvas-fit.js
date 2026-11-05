document.querySelectorAll('[data-fit-canvas]').forEach((stage) => {
  const canvas = stage.querySelector('[data-fixed-canvas]');
  if (!canvas) return;

  function fitCanvas() {
    if (window.matchMedia('print').matches) return;

    const scale = Math.min(
      stage.clientWidth / canvas.offsetWidth,
      stage.clientHeight / canvas.offsetHeight
    );
    canvas.style.setProperty('--canvas-scale', Math.max(0, scale));
  }

  new ResizeObserver(fitCanvas).observe(stage);
  window.addEventListener('resize', fitCanvas);
  window.visualViewport?.addEventListener('resize', fitCanvas);
  window.matchMedia('print').addEventListener('change', fitCanvas);
  fitCanvas();
});
