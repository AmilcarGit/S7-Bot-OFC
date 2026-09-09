import config from "../../config.js";
import { enviarLista } from "../../lib/botones.js";
import { claveBusqueda, obtenerBusqueda } from "../../lib/ytsStore.js";

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];
  const indice = Number(args[0]);
  const clave = claveBusqueda(contexto.chatId, contexto.remitente);
  const pendiente = obtenerBusqueda(clave);

  if (!pendiente || Number.isNaN(indice) || !pendiente.videos[indice]) {
    return sock.sendMessage(
      contexto.chatId,
      { text: `❌ Esa búsqueda expiró o no es válida.\n\n> Usa ${p}yts de nuevo.` },
      { quoted: info }
    );
  }

  const video = pendiente.videos[indice];
  const titulo = video.title || "Sin título";
  const autor = video.author || "Desconocido";
  const duracion = video.duration || "Desconocida";
  const vistas = video.views || "Desconocidas";
  const url = video.url || `https://www.youtube.com/watch?v=${video.videoId}`;

  const texto =
    `╭━━━〔 🎬 YOUTUBE 〕━━━╮\n` +
    `┃ 📌 ${titulo}\n` +
    `┃ 👤 ${autor}\n` +
    `┃ ⏱️ ${duracion}\n` +
    `┃ 👁️ ${vistas}\n` +
    `╰━━━━━━━━━━━━━━━━━━━━╯\n\n` +
    `🔗 ${url}\n\n` +
    `👇 Selecciona qué deseas descargar:`;

  await enviarLista(sock, contexto.chatId, {
    texto,
    footer: "Orbit YouTube Search",
    titulo: "Descargar YouTube",
    textoBoton: "Opciones",
    mensajeCitado: info,
    secciones: [
      {
        titulo: "Descargas",
        filas: [
          { titulo: "🎵 Descargar Audio", id: `${p}yta ${url}`, descripcion: "Descargar como MP3" },
          { titulo: "🎬 Descargar Video", id: `${p}ytv ${url}`, descripcion: "Descargar como MP4" },
          { titulo: "🔗 Ver enlace", id: `${p}yturl ${video.videoId}`, descripcion: "Mostrar enlace de YouTube" },
        ],
      },
    ],
  });
}