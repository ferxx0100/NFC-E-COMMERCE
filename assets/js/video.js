/*
 * Video "¿Qué es NFC?" de la portada.
 * - Se reproduce sin sonido cuando entra en pantalla (no si el usuario pidió menos movimiento).
 * - El botón "Ver con sonido" lo reinicia con audio.
 */
(function () {
  var video = document.querySelector("[data-nfc-video]");
  if (!video) return;
  var btn = document.querySelector("[data-video-sound]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var userStarted = false; // el usuario le dio play con sonido o tocó los controles

  function label(text) {
    if (btn) btn.innerHTML = text;
  }

  function play() {
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  if (btn) {
    btn.addEventListener("click", function () {
      userStarted = true;
      video.muted = false;
      video.currentTime = 0;
      play();
      label('<span aria-hidden="true">↺</span> Ver de nuevo');
    });
  }

  video.addEventListener("volumechange", function () {
    if (!video.muted) userStarted = true;
  });
  video.addEventListener("ended", function () {
    label('<span aria-hidden="true">▶</span> Ver con sonido');
  });

  if (reduce || !("IntersectionObserver" in window)) return;

  // Autoplay sin sonido al verlo; se pausa al salir de pantalla.
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && e.intersectionRatio >= 0.5) {
        if (video.paused && !video.ended && video.muted && !userStarted) play();
      } else if (!video.paused && video.muted && !userStarted) {
        video.pause();
      }
    });
  }, { threshold: [0, 0.5] }).observe(video);
})();
