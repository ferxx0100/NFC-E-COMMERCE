/*
 * Genera las imágenes PNG de la marca en assets/img/marca/ a partir de
 * tools/imagenes.html (mismas tarjetas que la página).
 *
 * Requiere Playwright:  npm i -D playwright && npx playwright install chromium
 * Uso:                  node tools/exportar-imagenes.js
 */
const path = require("path");
const { chromium } = require("playwright");
const C = require("../assets/js/catalog.js");
// El reel muestra 6 tarjetas, una por vuelta de 6 s (ver reelSeq en imagenes.html).

const OUT = path.join(__dirname, "..", "assets", "img", "marca");
const page = (q) => "file://" + path.join(__dirname, "imagenes.html") + "?" + q;

(async () => {
  const browser = await chromium.launch();
  const shots = [];
  C.products.forEach((p) => p.variants.forEach((v) => {
    shots.push({ q: `art=solo&p=${p.id}&v=${v.id}`, file: `tarjeta-${p.id}-${v.id}.png`, w: p.shape === "v" ? 810 : 1284, h: p.shape === "v" ? 1284 : 810, transparent: true });
  }));
  C.products.forEach((p) => {
    if (p.shape === "v") p.variants.forEach((v) => shots.push({ q: `art=post&p=${p.id}&v=${v.id}`, file: `post-${p.id}-${v.id}.jpg`, w: 1080, h: 1350 }));
    else shots.push({ q: `art=post&p=${p.id}`, file: `post-${p.id}.jpg`, w: 1080, h: 1350 });
  });
  shots.push({ q: "art=productos", file: "post-productos.jpg", w: 1080, h: 1350 });
  shots.push({ q: "art=og", file: "og.jpg", w: 1200, h: 630 });
  for (const s of shots) {
    const p = await browser.newPage({ viewport: { width: s.w, height: s.h } });
    await p.goto(page(s.q));
    await p.evaluate(() => document.fonts.ready);
    const jpg = s.file.endsWith(".jpg");
    await p.screenshot({ path: path.join(OUT, s.file), omitBackground: !!s.transparent, type: jpg ? "jpeg" : "png", quality: jpg ? 90 : undefined });
    await p.close();
    console.log("✓", s.file);
  }
  await video(browser, "art=reel", 1080, 1920, 36, "reel-que-es-nfc.mp4");
  await video(browser, "art=promo", 1080, 1350, 18, "promo-revende-nfc.mp4");
  await browser.close();
})();

// Videos cuadro por cuadro: el reel "¿Qué es NFC?" (Reels, TikTok, estados)
// y la promo para grupos de Facebook "gana dinero vendiendo tarjetas NFC".
async function video(browser, query, w, h, seconds, file) {
  const { execFileSync } = require("child_process");
  const fs = require("fs");
  const os = require("os");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "reel-"));
  const fps = 30;
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(page(query));
  await p.evaluate(() => document.fonts.ready);
  for (let i = 0; i < fps * seconds; i++) {
    await p.evaluate((ms) => window.seek(ms), (i * 1000) / fps);
    await p.screenshot({ path: path.join(tmp, String(i).padStart(4, "0") + ".jpg"), type: "jpeg", quality: 92 });
  }
  await p.close();
  execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(fps), "-i", path.join(tmp, "%04d.jpg"),
    "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    path.join(OUT, file)]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log("✓ " + file);
}
