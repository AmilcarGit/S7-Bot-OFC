import config from "../../config.js";
import { TIENDA, obtenerSaldo, quitarSaldo, asignarTitulo } from "../../lib/economia.js";

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];
  const itemId = (args[0] || "").toLowerCase();
  const item = TIENDA.find((i) => i.id === itemId);

  if (!item) {
    return sock.sendMessage(
      contexto.chatId,
      {
        text: `╭━━━〔 🛒 COMPRAR 〕━━━╮\n┃ 📌 Uso: ${p}comprar <id>\n┃ Usa ${p}shop para ver los IDs.\n╰━━━━━━━━━━━━━━━━━━━━╯`,
      },
      { quoted: info }
    );
  }

  const saldo = obtenerSaldo(contexto.remitente);
  if (saldo < item.precio) {
    return sock.sendMessage(
      contexto.chatId,
      {
        text: `╭━━━〔 ❌ SALDO INSUFICIENTE 〕━━━╮\n┃ Necesitas ${item.precio} S7Coins.\n┃ Tienes: ${saldo}\n╰━━━━━━━━━━━━━━━━━━━━╯`,
      },
      { quoted: info }
    );
  }

  quitarSaldo(contexto.remitente, item.precio);
  asignarTitulo(contexto.remitente, item.nombre);

  await sock.sendMessage(
    contexto.chatId,
    { text: `╭━━━〔 ✅ COMPRA EXITOSA 〕━━━╮\n┃ Ahora tienes el título: ${item.nombre}\n╰━━━━━━━━━━━━━━━━━━━━╯` },
    { quoted: info }
  );
}