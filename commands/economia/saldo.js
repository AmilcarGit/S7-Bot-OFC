export const alias = ["balance", "coins", "s7coins"];

import { obtenerSaldo, obtenerTitulo } from "../../lib/economia.js";

export async function ejecutar(sock, info, args, contexto) {
  const mencionado = info.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const objetivo = mencionado || contexto.remitente;

  const saldo = obtenerSaldo(objetivo);
  const titulo = obtenerTitulo(objetivo);
  const nombre = "@" + objetivo.split("@")[0];

  await sock.sendMessage(
    contexto.chatId,
    {
      text:
        `╭━━━〔 💰 SALDO 〕━━━╮\n` +
        `┃ 👤 ${nombre}\n` +
        (titulo ? `┃ 🏷️ ${titulo}\n` : "") +
        `┃ 💵 ${saldo} S7Coins\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`,
      mentions: [objetivo],
    },
    { quoted: info }
  );
}