/*
 * Video "¿Qué es NFC?" (22 s, con voz) que se abre desde el botón "Ver video" de la portada.
 * - No descarga nada hasta que la persona lo pide: así la portada carga rápido.
 * - Se abre en una ventana (<dialog>) y se reproduce con sonido; Esc, × o tocar fuera lo cierran.
 * - Sin <dialog> (navegadores viejos) o sin JavaScript, el botón abre el archivo .mp4 directamente.
 */
(function () {
  var dlg = document.getElementById("nh-video");
  var openers = document.querySelectorAll("[data-video-open]");
  if (!dlg || !openers.length || typeof dlg.showModal !== "function") return;
  var video = dlg.querySelector("[data-nfc-video]");
  var closeBtn = dlg.querySelector("[data-video-close]");
  var lastOpener = null;

  function load() {
    if (video.getAttribute("src")) return;
    video.poster = video.getAttribute("data-poster");
    video.src = video.getAttribute("data-src");
  }

  function open(e) {
    e.preventDefault();
    lastOpener = e.currentTarget;
    load();
    dlg.showModal();
    document.body.classList.add("modal-open");
    video.muted = false;
    try { video.currentTime = 0; } catch (err) {}
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  for (var i = 0; i < openers.length; i++) openers[i].addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", function () { dlg.close(); });
  // Tocar fuera del recuadro (el fondo oscuro) también cierra.
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", function () {
    video.pause();
    document.body.classList.remove("modal-open");
    if (lastOpener) lastOpener.focus();
  });
})();
