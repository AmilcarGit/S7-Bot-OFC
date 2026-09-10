import config from "../../config.js";
import { enviarLista } from "../../lib/botones.js";
import { enviarAnime, TIPOS_VALIDOS } from "../../lib/animeApi.js";

const EMOJIS = {
  waifu: "👧",
  neko: "🐱",
  kitsune: "🦊",
  husbando: "🧑",
  pat: "🤚",
  hug: "🤗",
  kiss: "💋",
  cuddle: "🥰",
  smile: "😊",
  wave: "👋",
  dance: "💃",
  happy: "😄",
};

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];
  const tipo = (args[0] || "").toLowerCase();

  // Si ya escribió un tipo válido (ej: ".anime neko"), lo manda directo.
  if (tipo && TIPOS_VALIDOS.includes(tipo)) {
    return enviarAnime(sock, info, contexto, tipo);
  }

  // Sin tipo (o inválido) -> mostramos la lista para elegir con un toque.
  await enviarLista(sock, contexto.chatId, {
    texto: `╭━━━〔 ✨ ANIME 〕━━━╮\n┃ Elige qué imagen quieres ver\n╰━━━━━━━━━━━━━━━━━━━━╯`,
    footer: "Vía Orbit API",
    titulo: "Galería Anime",
    textoBoton: "🎨 Ver tipos",
    mensajeCitado: info,
    secciones: [
      {
        titulo: "Tipos disponibles",
        filas: TIPOS_VALIDOS.map((t) => ({
          titulo: `${EMOJIS[t] || "✨"} ${t.charAt(0).toUpperCase() + t.slice(1)}`,
          id: `${p}${t}`,
          descripcion: `Ver una imagen de tipo "${t}"`,
        })),
      },
    ],
  });
}