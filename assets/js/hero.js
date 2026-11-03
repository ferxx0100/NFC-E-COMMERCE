/*
 * Portada "¿Qué es NFC?".
 * app.js cambia la tarjeta y la app del celular en cada vuelta (#banner-app, .nfc-burst);
 * aquí se copian a los pasos ("Se abre tu Instagram" / "Listo: te siguen") y al letrero
 * "Se abrió…", y la animación se pausa cuando la portada no está en pantalla.
 */
(function () {
  var hero = document.querySelector(".nh");
  if (!hero) return;
  var appEl = document.getElementById("banner-app");
  var burst = hero.querySelector(".nfc-burst");
  var stepApp = hero.querySelector("[data-nh-app]");
  var stepResult = hero.querySelector("[data-nh-result]");
  var opened = hero.querySelector("[data-nh-opened]");

  var SHORT = { "Google Maps": "Google" };
  var RESULT = { "Google Maps": "te dejan reseña", Instagram: "te siguen", WhatsApp: "te escriben", Facebook: "te siguen", TikTok: "te siguen" };

  function sync() {
    var name = (appEl.textContent || "").replace(/\s+/g, " ").trim();
    if (!name) return;
    if (stepApp) stepApp.textContent = SHORT[name] || name;
    if (stepResult) stepResult.textContent = RESULT[name] || "se abre tu enlace";
    if (opened) opened.textContent = name;
    var color = burst && burst.style.getPropertyValue("--burst");
    if (color) hero.style.setProperty("--nh-app", color.trim());
  }

  if (appEl) {
    sync();
    if ("MutationObserver" in window) new MutationObserver(sync).observe(appEl, { childList: true, characterData: true, subtree: true });
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      hero.classList.toggle("is-paused", !entries[0].isIntersecting);
    }).observe(hero);
  }
})();
