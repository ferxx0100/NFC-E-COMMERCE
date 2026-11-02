#!/usr/bin/env node
/*
 * Video vertical "¿Qué es NFC? + catálogo con precios" de TAKTO
 * (Facebook, Reels y TikTok): voz de ElevenLabs + animación HTML + ffmpeg.
 *
 * Uso (desde la raíz del repo):
 *   node tools/video-catalogo/render.js             # usa voz.mp3 y voz-tiempos.json ya guardados
 *   node tools/video-catalogo/render.js --tts       # vuelve a generar la voz (gasta créditos; lee guion.txt)
 *   node tools/video-catalogo/render.js --solo-voz  # solo genera la voz si no existe, no renderiza
 *   node tools/video-catalogo/render.js --cuadros=0,5.5,20   # solo guarda esos segundos como PNG (revisión rápida)
 *
 * Si no existen voz.mp3 / voz-tiempos.json, la voz se genera una vez y se guarda.
 * Requisitos: playwright (chromium) y ffmpeg en el PATH.
 * Para la voz: ELEVENLABS_API_KEY (o un proxy que inyecte la clave).
 *
 * Salidas en assets/img/marca/:
 *   catalogo-nfc-vertical.mp4         1080×1920, 30 fps, H.264 + AAC, +faststart
 *   catalogo-nfc-vertical-poster.jpg  portada (primer cuadro)
 *
 * Basado en tools/video-nfc/ (misma voz, paleta, celular, ondas y subtítulos).
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

const DIR = __dirname;
const ROOT = path.join(DIR, "..", "..");
const OUT = path.join(ROOT, "assets", "img", "marca");
const FPS = 30;
const W = 1080, H = 1920;
const FILE = "catalogo-nfc-vertical.mp4", POSTER = "catalogo-nfc-vertical-poster.jpg";
const args = process.argv.slice(2);

// Voz: José (locutor, mexicano), la misma de tools/video-nfc/render.js.
const VOICE_ID = process.env.VOICE_ID || "y2ijeTfmnXjzheHO6zeN";
const MODEL_ID = "eleven_multilingual_v2";

/*
 * Silencios extra que se meten en la voz (sin regenerarla) para dar tiempo de leer.
 * after: la palabra (tal cual sale en voz-tiempos.json) después de la cual se agrega la pausa.
 */
const PAUSES = [
  { after: "enlace.", secs: 0.5 },   // se ve la reseña abierta en el celular
  { after: "Facebook.", secs: 0.4 }, // las 5 tarjetas juntas
  { after: "negro.", secs: 0.3 },
  { after: "nueve.", secs: 1.5 },    // la lista de precios se queda más tiempo en pantalla
  { after: "envío.", secs: 0.4 },
];

function tts(text) {
  // Se usa curl (respeta HTTPS_PROXY); el módulo https de Node no pasa por el proxy.
  const body = JSON.stringify({ text, model_id: MODEL_ID, voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true } });
  return new Promise((resolve, reject) => {
    const url = "https://api.elevenlabs.io/v1/text-to-speech/" + VOICE_ID + "/with-timestamps?output_format=mp3_44100_128";
    const p = spawn("curl", ["-sS", "-m", "180", "-w", "\n%{http_code}", "-X", "POST", url,
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

// Aplica PAUSES: corre las marcas de tiempo y devuelve los cortes del audio original.
function applyPauses(words) {
  const cuts = []; // [{ at: segundo del audio original, secs }]
  PAUSES.forEach((pz) => {
    const i = words.findIndex((w) => w.w === pz.after);
    if (i < 0) { console.warn("Pausa: no encontré la palabra «" + pz.after + "»"); return; }
    const next = words[i + 1];
    // Corta a la mitad del silencio entre esa palabra y la siguiente.
    cuts.push({ at: next ? (words[i].end + next.start) / 2 : words[i].end, secs: pz.secs });
  });
  cuts.sort((a, b) => a.at - b.at);
  const shift = (t) => cuts.reduce((s, c) => (t >= c.at ? s + c.secs : s), 0);
  return { words: words.map((w) => ({ w: w.w, start: +(w.start + shift(w.start)).toFixed(3), end: +(w.end + shift(w.start)).toFixed(3) })), cuts };
}

async function main() {
  const mp3 = path.join(DIR, "voz.mp3"), json = path.join(DIR, "voz-tiempos.json");
  if (args.includes("--tts") || !fs.existsSync(mp3) || !fs.existsSync(json)) {
    const text = fs.readFileSync(path.join(DIR, "guion.txt"), "utf8").trim();
    console.log("Generando voz con ElevenLabs (" + VOICE_ID + ")…");
    const j = await tts(text);
    fs.writeFileSync(mp3, Buffer.from(j.audio_base64, "base64"));
    fs.writeFileSync(json, JSON.stringify({ voice_id: VOICE_ID, model_id: MODEL_ID, text, words: toWords(j.alignment) }, null, 1));
    console.log("Voz guardada en " + path.relative(ROOT, mp3));
  }
  if (args.includes("--solo-voz")) return;

  const voice = JSON.parse(fs.readFileSync(json, "utf8"));
  const { words, cuts } = applyPauses(voice.words);
  fs.writeFileSync(path.join(DIR, "voz-tiempos.js"), "// Generado por render.js a partir de voz-tiempos.json (con las pausas de PAUSES)\nwindow.VOICE = " + JSON.stringify({ text: voice.text, words }) + ";\n");

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await page.goto("file://" + path.join(DIR, "animacion.html"));
    await page.evaluate(() => window.ready);
    const info = await page.evaluate(() => ({ dur: window.DURATION, offset: window.OFFSET, ding: window.TIMES.ding }));
    const cuadros = (args.find((a) => a.startsWith("--cuadros=")) || "").split("=")[1];
    if (cuadros) {
      const dir = process.env.CUADROS_DIR || path.join(DIR, "cuadros");
      fs.mkdirSync(dir, { recursive: true });
      for (const s of cuadros.split(",").map(Number)) {
        await page.evaluate((t) => window.render(t), s);
        await page.screenshot({ type: "png", path: path.join(dir, "t" + s.toFixed(2).padStart(6, "0") + ".png") });
      }
      console.log("Duración " + info.dur.toFixed(2) + " s · cuadros en " + dir);
      return;
    }
    const frames = Math.ceil(info.dur * FPS);
    const delay = Math.round(info.offset * 1000);
    const dingMs = Math.round((info.offset + info.ding) * 1000);

    // Voz: se parte en los cortes de PAUSES y se vuelve a unir con silencios en medio.
    let voz = "";
    const segs = [];
    let from = 0;
    cuts.forEach((c, i) => {
      voz += "[1:a]atrim=" + from.toFixed(3) + ":" + c.at.toFixed(3) + ",asetpts=PTS-STARTPTS[s" + i + "];" +
        "aevalsrc=0:d=" + c.secs + ":s=44100:c=mono[z" + i + "];";
      segs.push("[s" + i + "]", "[z" + i + "]");
      from = c.at;
    });
    voz += "[1:a]atrim=start=" + from.toFixed(3) + ",asetpts=PTS-STARTPTS[s_end];";
    segs.push("[s_end]");
    voz += segs.join("") + "concat=n=" + segs.length + ":v=0:a=1,aformat=sample_rates=44100:channel_layouts=mono[vz];";

    const out = path.join(OUT, FILE);
    const ff = spawn("ffmpeg", [
      "-y", "-loglevel", "error",
      "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-i", mp3,
      "-f", "lavfi", "-i", "sine=frequency=1568:duration=0.3:sample_rate=44100",
      "-filter_complex",
      voz +
      "[vz]adelay=" + delay + ":all=1,apad[v];" +
      // "Ding" suave cuando el celular lee la tarjeta.
      "[2:a]afade=t=in:d=0.01,afade=t=out:st=0.03:d=0.27,volume=0.18,adelay=" + dingMs + ":all=1[c];" +
      "[v][c]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]",
      "-map", "0:v", "-map", "[a]", "-t", info.dur.toFixed(3),
      "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-pix_fmt", "yuv420p", "-profile:v", "high", "-r", String(FPS),
      "-c:a", "aac", "-b:a", "160k", "-ar", "44100",
      "-movflags", "+faststart", out,
    ], { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error("ffmpeg salió con " + c)))));

    for (let i = 0; i < frames; i++) {
      await page.evaluate((t) => window.render(t), i / FPS);
      const buf = await page.screenshot({ type: "jpeg", quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
      if (i % 60 === 0) process.stdout.write("\rvertical: " + i + "/" + frames + " cuadros");
    }
    ff.stdin.end();
    await done;
    process.stdout.write("\rvertical: " + frames + "/" + frames + " cuadros → " + path.relative(ROOT, out) + " (" + info.dur.toFixed(2) + " s)\n");

    // Portada: el primer cuadro (gancho "¿Qué es NFC?").
    await page.evaluate((t) => window.render(t), 0);
    await page.screenshot({ type: "jpeg", quality: 85, path: path.join(OUT, POSTER) });
    await page.close();
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
