import config from "../../config.js";

const API_URL = "https://api.lempi.lat/dl/ytv";
const API_KEY = "lem_10b02e6bcce68b82f51252de9d9ec71125528d02";

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];
  const url = args.join(" ").trim();

  if (!url) {
    return sock.sendMessage(
      contexto.chatId,
      { text: `❌ *Falta el enlace de YouTube*\n\n📌 Uso:\n${p}ytv <url>\n\n📝 Ejemplo:\n${p}ytv https://youtu.be/h_qaIfL9-UU` },
      { quoted: info }
    );
  }

  if (!/^https?:\/\/(?:www\.)?(?:youtube\.com\/|youtu\.be\/)/i.test(url)) {
    return sock.sendMessage(
      contexto.chatId,
      { text: `❌ *Enlace de YouTube inválido*\n\nSolo se aceptan enlaces de:\n• youtube.com\n• youtu.be` },
      { quoted: info }
    );
  }

  try {
    await sock.sendMessage(
      contexto.chatId,
      { text: `🎬 *DESCARGANDO VIDEO*\n\n🔗 YouTube detectado\n⏳ Procesando el video...\n\n⚡ Espera un momento...` },
      { quoted: info }
    );

    const endpoint = `${API_URL}?url=${encodeURIComponent(url)}&apikey=${encodeURIComponent(API_KEY)}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json", "User-Agent": "S7-Bot-OFC/1.0" },
    });

    if (!response.ok) throw new Error(`API HTTP ${response.status}`);

    const data = await response.json();
    if (!data.status || !data.datos || !data.datos.url) {
      throw new Error("La API no devolvió un video válido");
    }

    const videoUrl = data.datos.url;
    if (!/^https?:\/\//i.test(videoUrl)) throw new Error("La URL del video no es válida");

    const caption =
      `╭━━━〔 🎬 YOUTUBE VIDEO 〕━━━╮\n` +
      `┃\n` +
      `┃ 🎵 *${data.titulo || "Video de YouTube"}*\n` +
      `┃\n` +
      `┃ 📺 Canal: ${data.canal || "Desconocido"}\n` +
      `┃ ⏱️ Duración: ${data.duracion || "Desconocida"}\n` +
      `┃ 🎞️ Calidad: ${data.datos.calidad || "Desconocida"}\n` +
      `┃ 💾 Tamaño: ${data.datos.tamaño || "Desconocido"}\n` +
      `┃ 📁 Formato: ${data.datos.extension || ".mp4"}\n` +
      `┃\n` +
      `┃ ⚡ *Descargado con Lempi API*\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━━━━━╯`;

    await sock.sendMessage(
      contexto.chatId,
      {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        fileName: data.datos.archivo || "youtube-video.mp4",
        caption,
        ptt: false,
      },
      { quoted: info }
    );
  } catch (error) {
    console.error("[YTV]", error);
    await sock.sendMessage(
      contexto.chatId,
      { text: `❌ *Error descargando el video*\n\n> ${error.message || "Error desconocido"}\n\n💡 La API puede estar temporalmente caída o el video no estar disponible.` },
      { quoted: info }
    );
  }
}