import config from "../../config.js";

const API_KEY = process.env.ORBIT_API_KEY || "ORBIT-4096939993";
const API_URL = "https://api-orbit-9doj.onrender.com/api/v1/download/ytaudio";

function extraerVideoId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];
  const youtubeUrl = args.join(" ").trim();

  if (!youtubeUrl) {
    return sock.sendMessage(
      contexto.chatId,
      { text: `Falta el enlace de YouTube\n\nEjemplo:\n${p}yta https://www.youtube.com/watch?v=8QkY_PDfAlE` },
      { quoted: info }
    );
  }

  if (!youtubeUrl.includes("youtube.com/") && !youtubeUrl.includes("youtu.be/")) {
    return sock.sendMessage(
      contexto.chatId,
      { text: "Enlace invalido\n\n> Envia un enlace valido de YouTube." },
      { quoted: info }
    );
  }

  try {
    await sock.sendMessage(
      contexto.chatId,
      { text: "Descargando audio...\n\n> Espera un momento mientras proceso el audio." },
      { quoted: info }
    );

    const apiUrl = `${API_URL}?apikey=${encodeURIComponent(API_KEY)}&url=${encodeURIComponent(youtubeUrl)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`API HTTP ${response.status}`);

    const data = await response.json();
    if (!data || data.status !== true || !data.download_url) {
      throw new Error("Orbit no devolvio un enlace de descarga valido");
    }

    const audioUrl = data.download_url;
    const title = data.title || "Audio de YouTube";
    const thumbnail = data.thumbnail || `https://i.ytimg.com/vi/${extraerVideoId(youtubeUrl)}/hqdefault.jpg`;
    const duration = data.duration || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = String(duration % 60).padStart(2, "0");

    const filename =
      `${title}`.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim().slice(0, 100) + ".mp3";

    await sock.sendMessage(
      contexto.chatId,
      {
        image: { url: thumbnail },
        caption: `Titulo: ${title}\nDuracion: ${minutes}:${seconds}\nFormato: ${data.format || "mp3"}\n\nEnviando audio...`,
      },
      { quoted: info }
    );

    await sock.sendMessage(
      contexto.chatId,
      { audio: { url: audioUrl }, mimetype: "audio/mpeg", fileName: filename, ptt: false },
      { quoted: info }
    );
  } catch (error) {
    console.error("[YTA]", error);
    await sock.sendMessage(
      contexto.chatId,
      { text: `No se pudo descargar el audio\n\n> ${error.message || "Error desconocido"}` },
      { quoted: info }
    );
  }
}