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

function esGifOVideo(url) {
  const u = (url || "").toLowerCase();
  return u.includes(".gif") || u.includes(".mp4") || u.includes(".webm") || u.includes("gif");
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

    if (esGifOVideo(url)) {
      // GIF / video animado
      await sock.sendMessage(
        contexto.chatId,
        {
          video: { url: url },
          gifPlayback: true,
          caption: caption,
        },
        { quoted: info }
      );
    } else {
      // Imagen normal
      await sock.sendMessage(
        contexto.chatId,
        {
          image: { url: url },
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