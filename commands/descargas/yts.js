export const alias = ["ytsearch"];

import config from "../../config.js";
import { orbitGet } from "../../lib/orbit.js";
import {
  claveBusqueda,
  limpiarBusquedasVencidas,
  guardarBusqueda,
  MAX_RESULTADOS,
} from "../../lib/ytsStore.js";

async function buscarEnYoutube(query) {
  const data = await orbitGet("/busqueda", { query });

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

    let texto = `🔎 *Resultados para:* ${query}\n\n`;

    resultados.forEach((video, i) => {
      texto += `*${i + 1}.* ${video.title || "Sin título"}\n`;
      texto += `👤 ${video.author || "Desconocido"} | ⏱️ ${video.duration || "?"}\n`;
      texto += `🔗 ${video.url}\n\n`;
    });

    texto += `_Para descargar, usa:_\n${p}yta <enlace> _o_ ${p}ytv <enlace>`;

    await sock.sendMessage(contexto.chatId, { text: texto }, { quoted: info });
  } catch (error) {
    console.error("[YTS]", error);
    await sock.sendMessage(
      contexto.chatId,
      {
        text:
          `❌ Error al buscar en YouTube\n\n> ${error.message || "Error desconocido"}\n\n` +
          `_Si es HTTP 403, revisa que la Orbit IP en config.js sea la actual del dashboard._`,
      },
      { quoted: info }
    );
  }
}