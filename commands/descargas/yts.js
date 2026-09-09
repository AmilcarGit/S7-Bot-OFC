import config from "../../config.js";
import { enviarLista } from "../../lib/botones.js";
import {
  claveBusqueda,
  limpiarBusquedasVencidas,
  guardarBusqueda,
  MAX_RESULTADOS,
} from "../../lib/ytsStore.js";

const API_KEY = process.env.ORBIT_API_KEY || "ORBIT-4096939993";
const API_URL = "https://api-orbit-9doj.onrender.com/api/v1/search";

async function buscarEnYoutube(query) {
  const url = `${API_URL}?apikey=${encodeURIComponent(API_KEY)}&query=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!data || data.status !== true || !Array.isArray(data.results)) {
    throw new Error("La API de Orbit no devolvió resultados válidos");
  }
  return data.results;
}

export async function ejecutar(sock, info, args, contexto) {
  limpiarBusquedasVencidas();

  const p = config.prefix[0];
  const query = args.join(" ").trim();

  if (!query) {
    return sock.sendMessage(
      contexto.chatId,
      { text: `❌ Escribe algo para buscar.\n\n📌 Ejemplo:\n${p}yts Ozuna` },
      { quoted: info }
    );
  }

  try {
    await sock.sendMessage(
      contexto.chatId,
      { text: `🔎 *Buscando en YouTube...*\n\n> ${query}` },
      { quoted: info }
    );

    const videos = await buscarEnYoutube(query);
    const resultados = videos.filter((v) => v && v.videoId).slice(0, MAX_RESULTADOS);

    if (!resultados.length) {
      return sock.sendMessage(
        contexto.chatId,
        { text: `❌ No encontré resultados para:\n> ${query}` },
        { quoted: info }
      );
    }

    const clave = claveBusqueda(contexto.chatId, contexto.remitente);
    guardarBusqueda(clave, resultados);

    await enviarLista(sock, contexto.chatId, {
      texto: `🔎 *Resultados para:* ${query}\n\n🎬 Encontrados: ${resultados.length}`,
      footer: "Selecciona un video · expira en 3 minutos",
      titulo: "YouTube Search",
      textoBoton: "Ver resultados",
      mensajeCitado: info,
      secciones: [
        {
          titulo: `${resultados.length} resultado(s)`,
          filas: resultados.map((video, i) => ({
            titulo: (video.title || "Sin título").slice(0, 60),
            id: `${p}ytsver ${i}`,
            descripcion: `${(video.author || "Desconocido").slice(0, 35)} · ${video.duration || "?"}`,
          })),
        },
      ],
    });
  } catch (error) {
    console.error("[YTS]", error);
    await sock.sendMessage(
      contexto.chatId,
      { text: `❌ Ocurrió un error al buscar.\n\n> ${error.message || "Error desconocido"}` },
      { quoted: info }
    );
  }
}