export const alias = ["ranking"];

import { topUsuarios } from "../../lib/economia.js";

export async function ejecutar(sock, info, args, contexto) {
  const top = topUsuarios(10);

  if (!top.length) {
    return sock.sendMessage(
      contexto.chatId,
      { text: `╭━━━〔 🏆 TOP S7COINS 〕━━━╮\n┃ Todavía no hay nadie en el ranking.\n╰━━━━━━━━━━━━━━━━━━━━╯` },
      { quoted: info }
    );
  }

  const medallas = ["🥇", "🥈", "🥉"];
  const mentions = [];
  let texto = `╭━━━〔 🏆 TOP S7COINS 〕━━━╮\n`;

  top.forEach((u, i) => {
    mentions.push(u.id);
    texto += `┃ ${medallas[i] || `${i + 1}.`} @${u.id.split("@")[0]} — ${u.saldo} S7Coins\n`;
  });

  texto += `╰━━━━━━━━━━━━━━━━━━━━╯`;

  await sock.sendMessage(contexto.chatId, { text: texto, mentions }, { quoted: info });
}