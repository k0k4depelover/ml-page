/* Tema claro/oscuro compartido entre páginas. Se carga sin defer en <head> para aplicar el tema guardado antes de pintar. */
(function () {
  var KEY = "cuaderno-ml-theme";
  var root = document.documentElement;
  try { var saved = localStorage.getItem(KEY); if (saved === "dark" || saved === "light") root.dataset.theme = saved; } catch (e) {}
  function current() {
    return root.dataset.theme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("theme-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  });
})();
