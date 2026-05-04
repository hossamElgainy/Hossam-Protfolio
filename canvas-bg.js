/**
 * Fixed canvas: drifting particles + proximity lines (dark UI ambient layer).
 * Respects prefers-reduced-motion — draws one static frame and skips the loop.
 */
(function () {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let particles = [];
  let rafId = 0;
  let running = false;

  const cfg = {
    particleCount: () => Math.min(85, Math.floor((width * height) / 22000)),
    linkDist: 140,
    speed: 0.22,
    dotRadius: 1.2,
    lineOpacity: 0.12,
    dotOpacity: 0.45,
    hueA: 190,
    hueB: 265,
  };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedParticles();
  }

  function seedParticles() {
    const n = Math.max(28, cfg.particleCount());
    particles = [];
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * cfg.speed,
        vy: (Math.random() - 0.5) * cfg.speed,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function drawFrame(t) {
    ctx.clearRect(0, 0, width, height);
    const breathe = 0.55 + 0.45 * Math.sin(t * 0.00035);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < cfg.linkDist) {
          const alpha = (1 - d / cfg.linkDist) * cfg.lineOpacity * breathe;
          ctx.strokeStyle = `rgba(120, 200, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    particles.forEach((p, i) => {
      const hue = cfg.hueA + ((cfg.hueB - cfg.hueA) * i) / particles.length;
      ctx.fillStyle = `hsla(${hue}, 85%, 72%, ${cfg.dotOpacity * breathe})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, cfg.dotRadius + 0.35 * Math.sin(t * 0.002 + p.phase), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function tick(t) {
    if (!running) return;
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;
    });
    drawFrame(t);
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    running = true;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  window.addEventListener("resize", () => {
    stop();
    resize();
    if (reducedMotion) drawFrame(0);
    else start();
  });

  resize();
  if (reducedMotion) drawFrame(0);
  else start();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (!reducedMotion) start();
  });
})();
