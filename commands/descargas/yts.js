import config from "../../config.js";
import {
  claveBusqueda,
  limpiarBusquedasVencidas,
  guardarBusqueda,
  MAX_RESULTADOS,
} from "../../lib/ytsStore.js";

const API_KEY = process.env.ORBIT_API_KEY || "ORBIT-4096939993";
const API_URL = "https://api-orbit-9doj.onrender.com/api/v1/search";

async function buscarEnYoutube(query) {
  const url = API_URL + "?apikey=" + encodeURIComponent(API_KEY) + "&query=" + encodeURIComponent(query);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("HTTP " + response.status + " - " + response.statusText);
  }

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
      { text: "❌ Escribe algo para buscar.\n\n📌 Ejemplo:\n" + p + "yts Ozuna" },
      { quoted: info }
    );
  }

  try {
    await sock.sendMessage(
      contexto.chatId,
      { text: "🔎 *Buscando en YouTube...*\n\n> " + query },
      { quoted: info }
    );

    const videos = await buscarEnYoutube(query);
    const resultados = videos.filter((v) => v && v.videoId).slice(0, MAX_RESULTADOS);

    if (!resultados.length) {
      return sock.sendMessage(
        contexto.chatId,
        { text: "❌ No encontré resultados para:\n> " + query },
        { quoted: info }
      );
    }

    const clave = claveBusqueda(contexto.chatId, contexto.remitente);
    guardarBusqueda(clave, resultados);

    let texto = "🔎 *Resultados para:* " + query + "\n\n";

    resultados.forEach((video, i) => {
      texto += "*" + (i + 1) + ".* " + (video.title || "Sin título") + "\n";
      texto += "👤 " + (video.author || "Desconocido") + " | ⏱️ " + (video.duration || "?") + "\n";
      texto += "🔗 " + video.url + "\n\n";
    });

    await sock.sendMessage(contexto.chatId, { text: texto }, { quoted: info });

  } catch (error) {
    console.error("[YTS]", error);
    await sock.sendMessage(
      contexto.chatId,
      {
        text:
          "❌ Error al buscar en YouTube\n\n> " +
          (error.message || "Error desconocido") +
          "\n\n_Si es HTTP 403, revisa la IP autorizada en Orbit API_",
      },
      { quoted: info }
    );
  }
}