/* Página "A fondo": stepper de diagramas, índice activo y navegación móvil. Sin dependencias. */
(function () {
  "use strict";
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Stepper: cada .stepper tiene grupos SVG [data-step="k"] y un <ol class="panel"> con un <li> por paso.
     Paso actual: grupo visible y resaltado; pasos anteriores atenuados; posteriores casi ocultos.
     Un grupo puede declarar data-step="2-4" para seguir visible a pleno en ese rango. */
  document.querySelectorAll(".stepper").forEach(box => {
    const items = [...box.querySelectorAll("ol.panel > li")];
    const groups = [...box.querySelectorAll("[data-step]")].filter(g => !g.closest("ol.panel"));
    const n = items.length;
    if (!n) return;
    box.classList.add("js");
    const prev = box.querySelector(".prev"), next = box.querySelector(".next"), out = box.querySelector(".count");
    let k = 1;
    const range = g => { const [a, b] = g.dataset.step.split("-").map(Number); return [a, b || a]; };
    function show() {
      groups.forEach(g => {
        const [a, b] = range(g);
        g.classList.toggle("future", k < a);
        g.classList.toggle("past", k > b);
      });
      items.forEach((li, i) => li.classList.toggle("now", i === k - 1));
      if (out) out.innerHTML = `Paso <b>${k}</b> de ${n}`;
      if (prev) prev.disabled = k === 1;
      if (next) next.textContent = k === n ? "Reiniciar" : "Siguiente";
    }
    if (prev) prev.addEventListener("click", () => { if (k > 1) { k--; show(); } });
    if (next) next.addEventListener("click", () => { k = k === n ? 1 : k + 1; show(); });
    box.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { k = Math.min(n, k + 1); show(); }
      if (e.key === "ArrowLeft") { k = Math.max(1, k - 1); show(); }
    });
    show();
  });

  /* índice activo */
  const links = Object.fromEntries([...document.querySelectorAll(".index a[data-id]")].map(a => [a.dataset.id, a]));
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    Object.values(links).forEach(a => a.classList.remove("active"));
    if (links[e.target.id]) links[e.target.id].classList.add("active");
  }), { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll("section.deep").forEach(s => so.observe(s));

  /* navegación móvil */
  const jump = document.getElementById("jump");
  if (jump) jump.addEventListener("change", () => {
    const t = document.getElementById(jump.value);
    if (t) t.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
  });
})();
