#!/usr/bin/env node
/*
 * Video "¿Qué es NFC?" de TAKTO: voz de ElevenLabs + animación HTML + ffmpeg.
 *
 * Uso (desde la raíz del repo):
 *   node tools/video-nfc/render.js            # usa voz.mp3 y voz-tiempos.json ya guardados
 *   node tools/video-nfc/render.js --tts      # vuelve a generar la voz con ElevenLabs (lee guion.txt)
 *   node tools/video-nfc/render.js --only=square   # solo un formato (square | vertical)
 *
 * Requisitos: playwright (chromium) y ffmpeg en el PATH.
 * Para --tts: ELEVENLABS_API_KEY (o un proxy que inyecte la clave), VOICE_ID opcional.
 *
 * Salidas en assets/img/marca/:
 *   que-es-nfc-web.mp4        1080×1080, para la portada (H.264, +faststart)
 *   que-es-nfc-vertical.mp4   1080×1920, para TikTok / Reels / Facebook
 *   que-es-nfc-poster.jpg     portada del video de la web
 *   que-es-nfc-vertical-poster.jpg  portada para redes
 *
 * Cómo funciona: animacion.html expone window.render(t). Aquí se avanza t a 30 cuadros
 * por segundo, se toma una captura por cuadro y se manda a ffmpeg junto con la voz.
 * Los tiempos de cada escena salen de las marcas por palabra que devuelve ElevenLabs.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

const DIR = __dirname;
const ROOT = path.join(DIR, "..", "..");
const OUT = path.join(ROOT, "assets", "img", "marca");
const FPS = 30;
const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith("--only=")) || "").split("=")[1];

// Voz: José (locutor, mexicano), la que el dueño agregó a su biblioteca de ElevenLabs.
// Otro José de la biblioteca (formal): LU0vACP2vTCsged003Jk. Antes: Andres (u36BhA6zuwclwVyAT1Bi), Angélica (twZzvyYIl5ntDHC1Vatv).
const VOICE_ID = process.env.VOICE_ID || "y2ijeTfmnXjzheHO6zeN";
const MODEL_ID = "eleven_multilingual_v2";

const FORMATS = {
  square: { w: 1080, h: 1080, file: "que-es-nfc-web.mp4", poster: "que-es-nfc-poster.jpg", crf: 23, audio: "128k" },
  vertical: { w: 1080, h: 1920, file: "que-es-nfc-vertical.mp4", poster: "que-es-nfc-vertical-poster.jpg", crf: 21, audio: "160k" },
};

function tts(text) {
  // Se usa curl (respeta HTTPS_PROXY); el módulo https de Node no pasa por el proxy.
  const body = JSON.stringify({ text, model_id: MODEL_ID, voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true } });
  return new Promise((resolve, reject) => {
    const url = "https://api.elevenlabs.io/v1/text-to-speech/" + VOICE_ID + "/with-timestamps?output_format=mp3_44100_128";
    const p = spawn("curl", ["-sS", "-m", "120", "-w", "\n%{http_code}", "-X", "POST", url,
      "-H", "Content-Type: application/json", "-H", "xi-api-key: " + (process.env.ELEVENLABS_API_KEY || "x"), "--data-binary", "@-"]);
    let s = "";
    p.stdout.on("data", (d) => (s += d));
    p.stderr.on("data", (d) => process.stderr.write(d));
    p.on("error", reject);
    p.on("close", () => {
      const i = s.lastIndexOf("\n"), code = s.slice(i + 1).trim(), out = s.slice(0, i);
      if (code === "200") resolve(JSON.parse(out));
      else reject(new Error("ElevenLabs " + code + ": " + out.slice(0, 300)));
    });
    p.stdin.end(body);
  });
}

// Marcas por carácter → palabras con inicio y fin.
function toWords(a) {
  const words = [];
  let cur = null;
  a.characters.forEach((c, i) => {
    if (/\s/.test(c)) { if (cur) words.push(cur); cur = null; return; }
    if (!cur) cur = { w: "", start: a.character_start_times_seconds[i] };
    cur.w += c;
    cur.end = a.character_end_times_seconds[i];
  });
  if (cur) words.push(cur);
  return words;
}

async function renderFormat(browser, name) {
  const f = FORMATS[name];
  const page = await browser.newPage({ viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 });
  await page.goto("file://" + path.join(DIR, "animacion.html") + "?f=" + name);
  await page.evaluate(() => window.ready);
  const info = await page.evaluate(() => ({ dur: window.DURATION, offset: window.OFFSET, tap: window.TIMES.listo }));
  const frames = Math.ceil(info.dur * FPS);
  const delay = Math.round(info.offset * 1000);
  const tapMs = Math.round((info.offset + info.tap) * 1000);

  const out = path.join(OUT, f.file);
  const ff = spawn("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-i", path.join(DIR, "voz.mp3"),
    "-f", "lavfi", "-i", "sine=frequency=1568:duration=0.3:sample_rate=44100",
    "-filter_complex",
    // Voz con medio segundo de entrada + un "ding" suave al leer la tarjeta.
    "[1:a]adelay=" + delay + ":all=1,apad[v];" +
    "[2:a]afade=t=in:d=0.01,afade=t=out:st=0.03:d=0.27,volume=0.18,adelay=" + tapMs + ":all=1[c];" +
    "[v][c]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]",
    "-map", "0:v", "-map", "[a]", "-t", info.dur.toFixed(3),
    "-c:v", "libx264", "-preset", "slow", "-crf", String(f.crf), "-pix_fmt", "yuv420p", "-profile:v", "high", "-r", String(FPS),
    "-c:a", "aac", "-b:a", f.audio, "-ar", "44100",
    "-movflags", "+faststart", out,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error("ffmpeg salió con " + c)))));

  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => window.render(t), i / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 60 === 0) process.stdout.write("\r" + name + ": " + i + "/" + frames + " cuadros");
  }
  ff.stdin.end();
  await done;
  process.stdout.write("\r" + name + ": " + frames + "/" + frames + " cuadros → " + path.relative(ROOT, out) + "\n");

  // Portada: celular abriendo la reseña de Google.
  await page.evaluate((t) => window.render(t), info.offset + (await page.evaluate(() => window.TIMES.abre)) + 1.2);
  await page.screenshot({ type: "jpeg", quality: 82, path: path.join(OUT, f.poster) });
  await page.close();
}

(async () => {
  if (args.includes("--tts")) {
    const text = fs.readFileSync(path.join(DIR, "guion.txt"), "utf8").trim();
    console.log("Generando voz con ElevenLabs (" + VOICE_ID + ")…");
    const j = await tts(text);
    fs.writeFileSync(path.join(DIR, "voz.mp3"), Buffer.from(j.audio_base64, "base64"));
    fs.writeFileSync(path.join(DIR, "voz-tiempos.json"), JSON.stringify({ voice_id: VOICE_ID, model_id: MODEL_ID, text, words: toWords(j.alignment) }, null, 1));
  }
  const voice = JSON.parse(fs.readFileSync(path.join(DIR, "voz-tiempos.json"), "utf8"));
  fs.writeFileSync(path.join(DIR, "voz-tiempos.js"), "// Generado por render.js a partir de voz-tiempos.json\nwindow.VOICE = " + JSON.stringify(voice) + ";\n");

  const browser = await chromium.launch();
  try {
    for (const name of Object.keys(FORMATS)) if (!only || only === name) await renderFormat(browser, name);
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
