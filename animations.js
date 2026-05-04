/**
 * Scroll-triggered reveals + optional nav shrink on scroll.
 */
(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initReveals() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    if (reducedMotion) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => io.observe(el));
  }

  function initNavScroll() {
    const nav = document.querySelector(".navbar");
    if (!nav || reducedMotion) return;

    let last = 0;
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY || 0;
        nav.classList.toggle("navbar--scrolled", y > 24);
        last = y;
      },
      { passive: true }
    );
  }

  initReveals();
  initNavScroll();
})();
