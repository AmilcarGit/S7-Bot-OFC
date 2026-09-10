import config from "../../config.js";
import { enviarLista } from "../../lib/botones.js";
import { TIENDA } from "../../lib/economia.js";

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];

  await enviarLista(sock, contexto.chatId, {
    texto: `╭━━━〔 🛒 TIENDA S7COINS 〕━━━╮\n┃ Compra títulos con tus S7Coins\n╰━━━━━━━━━━━━━━━━━━━━╯`,
    footer: "S7-Bot-OFC · Economía",
    titulo: "Tienda",
    textoBoton: "🛍️ Ver artículos",
    mensajeCitado: info,
    secciones: [
      {
        titulo: "Títulos disponibles",
        filas: TIENDA.map((item) => ({
          titulo: item.nombre,
          id: `${p}comprar ${item.id}`,
          descripcion: `💰 ${item.precio} S7Coins`,
        })),
      },
    ],
  });
}