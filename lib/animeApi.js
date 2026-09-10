import { orbitGet } from "./orbit.js";

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

    // Descargar el archivo para detectar el tipo real
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
      },
    });

    if (!res.ok) {
      throw new Error("No se pudo descargar el archivo (" + res.status + ")");
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = (res.headers.get("content-type") || "").toLowerCase();

    // GIF o video animado
    if (contentType.includes("gif") || contentType.includes("video") || contentType.includes("mp4")) {
      await sock.sendMessage(
        contexto.chatId,
        {
          video: buffer,
          gifPlayback: true,
          caption: caption,
          mimetype: contentType.includes("mp4") ? "video/mp4" : "video/mp4",
        },
        { quoted: info }
      );
    } else {
      // Imagen normal (png, jpg, webp, etc.)
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