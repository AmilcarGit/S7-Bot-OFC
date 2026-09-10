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

    await sock.sendMessage(
      contexto.chatId,
      {
        image: { url: data.result },
        caption: `╭━━━〔 ✨ ${tipo.toUpperCase()} 〕━━━╮\n┃ 🎨 Vía Orbit API\n╰━━━━━━━━━━━━━━━━━━━━╯`,
      },
      { quoted: info }
    );
  } catch (error) {
    console.error(`[ANIME:${tipo}]`, error);
    await sock.sendMessage(
      contexto.chatId,
      {
        text: `╭━━━〔 ❌ ERROR 〕━━━╮\n┃ No se pudo obtener la imagen.\n┃ ${error.message || "Error desconocido"}\n╰━━━━━━━━━━━━━━━━━━━━╯`,
      },
      { quoted: info }
    );
  }
}