import { orbitGet } from "./orbit.js";
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

export const TIPOS_VALIDOS = [
  "waifu",
  "neko",
  "kitsune",
  "husbando",
  "pat",
  "hug",
  "kiss",
  "cuddle",
  "smile",
  "wave",
  "dance",
  "happy",
];

// Convierte un buffer GIF a un buffer MP4 real (H.264 baseline) usando ffmpeg del sistema
async function gifBufferToMp4(gifBuffer) {
  const tmpDir = os.tmpdir();
  const id = crypto.randomUUID();
  const inPath = path.join(tmpDir, `anime_${id}.gif`);
  const outPath = path.join(tmpDir, `anime_${id}.mp4`);

  await fs.writeFile(inPath, gifBuffer);

  await new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-y",
      "-i", inPath,
      "-movflags", "+faststart",
      "-pix_fmt", "yuv420p",
      "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "-c:v", "libx264",
      "-profile:v", "baseline",
      "-level", "3.0",
      "-preset", "veryfast",
      "-an",
      outPath,
    ]);

    let stderr = "";
    ff.stderr.on("data", (d) => (stderr += d.toString()));
    ff.on("error", reject);
    ff.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error("ffmpeg falló: " + stderr.slice(-500)));
    });
  });

  const mp4Buffer = await fs.readFile(outPath);

  fs.unlink(inPath).catch(() => {});
  fs.unlink(outPath).catch(() => {});

  return mp4Buffer;
}

export async function enviarAnime(sock, info, contexto, tipo) {
  try {
    const data = await orbitGet("/anime/random", { type: tipo });

    if (!data || data.status !== true || !data.result) {
      throw new Error("La API no devolvió una imagen válida");
    }

    const url = data.result;
    const caption =
      "╭━━━〔 ✨ " + tipo.toUpperCase() + " 〕━━━╮\n" +
      "┃ 🎨 Vía Orbit API\n" +
      "╰━━━━━━━━━━━━━━━━━━━━╯";

    // nekos.best exige un User-Agent identificable (no un navegador falso),
    // si no, bloquea la descarga con 403.
    const res = await fetch(url, {
      headers: {
        "User-Agent": "S7-Bot-OFC/1.0 (https://github.com/AmilcarGit/S7-Bot-OFC)",
        Accept: "*/*",
      },
    });

    if (!res.ok) {
      throw new Error("No se pudo descargar el archivo (" + res.status + ")");
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const isGif = contentType.includes("gif") || url.toLowerCase().endsWith(".gif");

    if (isGif) {
      try {
        const mp4Buffer = await gifBufferToMp4(buffer);
        await sock.sendMessage(
          contexto.chatId,
          {
            video: mp4Buffer,
            gifPlayback: true,
            caption: caption,
            mimetype: "video/mp4",
          },
          { quoted: info }
        );
      } catch (ffmpegError) {
        console.error("[ANIME:" + tipo + "] ffmpeg error:", ffmpegError);
        await sock.sendMessage(
          contexto.chatId,
          {
            document: buffer,
            mimetype: "image/gif",
            fileName: `${tipo}.gif`,
            caption: caption + "\n┃ ⚠️ No se pudo animar (falta ffmpeg/libx264 en el servidor)",
          },
          { quoted: info }
        );
      }
    } else {
      await sock.sendMessage(
        contexto.chatId,
        {
          image: buffer,
          caption: caption,
        },
        { quoted: info }
      );
    }
  } catch (error) {
    console.error("[ANIME:" + tipo + "]", error);
    await sock.sendMessage(
      contexto.chatId,
      {
        text:
          "╭━━━〔 ❌ ERROR 〕━━━╮\n" +
          "┃ No se pudo obtener la imagen.\n" +
          "┃ " + (error.message || "Error desconocido") + "\n" +
          "╰━━━━━━━━━━━━━━━━━━━━╯",
      },
      { quoted: info }
    );
  }
}