import config from "../../config.js";

const API_URL = "https://api.lempi.lat/dl/ytv";
const API_KEY = "lem_10b02e6bcce68b82f51252de9d9ec71125528d02";

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];
  const url = args.join(" ").trim();

  if (!url) {
    return sock.sendMessage(
      contexto.chatId,
      { text: `╭━━━〔 🎬 VIDEO 〕━━━╮\n┃ ⚠️ Falta el enlace de YouTube.\n┃ 📌 Ejemplo:\n┃ ${p}ytv https://youtu.be/h_qaIfL9-UU\n╰━━━━━━━━━━━━━━━━━━━━╯` },
      { quoted: info }
    );
  }

  if (!/^https?:\/\/(?:www\.)?(?:youtube\.com\/|youtu\.be\/)/i.test(url)) {
    return sock.sendMessage(
      contexto.chatId,
      { text: `╭━━━〔 ❌ ENLACE INVÁLIDO 〕━━━╮\n┃ Solo se aceptan enlaces de:\n┃ • youtube.com\n┃ • youtu.be\n╰━━━━━━━━━━━━━━━━━━━━╯` },
      { quoted: info }
    );
  }

  try {
    await sock.sendMessage(
      contexto.chatId,
      { text: `╭━━━〔 🎬 DESCARGANDO VIDEO 〕━━━╮\n┃ 🔗 YouTube detectado\n┃ ⏳ Procesando, espera un momento...\n╰━━━━━━━━━━━━━━━━━━━━╯` },
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

    // Descargamos el archivo nosotros mismos con headers de navegador,
    // porque Lempi bloquea (403) las descargas "directas" sin User-Agent/Referer.
    const descarga = await fetch(videoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: "https://lempi.lat/",
        Accept: "*/*",
      },
    });

    if (!descarga.ok) {
      throw new Error(`No se pudo descargar el archivo de video (HTTP ${descarga.status})`);
    }

    const videoBuffer = Buffer.from(await descarga.arrayBuffer());

    const caption =
      `╭━━━〔 🎬 YOUTUBE VIDEO 〕━━━╮\n` +
      `┃ 🎵 ${data.titulo || "Video de YouTube"}\n` +
      `┃ 📺 Canal: ${data.canal || "Desconocido"}\n` +
      `┃ ⏱️ Duración: ${data.duracion || "Desconocida"}\n` +
      `┃ 🎞️ Calidad: ${data.datos.calidad || "Desconocida"}\n` +
      `┃ 💾 Tamaño: ${data.datos.tamaño || "Desconocido"}\n` +
      `┃ 📁 Formato: ${data.datos.extension || ".mp4"}\n` +
      `┃ ⚡ Descargado con Lempi API\n` +
      `╰━━━━━━━━━━━━━━━━━━━━╯`;

    await sock.sendMessage(
      contexto.chatId,
      {
        video: videoBuffer,
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
      {
        text:
          `╭━━━〔 ❌ ERROR 〕━━━╮\n` +
          `┃ No se pudo descargar el video.\n` +
          `┃ ${error.message || "Error desconocido"}\n` +
          `┃ 💡 La API puede estar caída o el video no disponible.\n` +
          `╰━━━━━━━━━━━━━━━━━━━━╯`,
      },
      { quoted: info }
    );
  }
}