export const alias = ["pay", "enviar"];

import config from "../../config.js";
import { transferir, obtenerSaldo } from "../../lib/economia.js";

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];
  const mencionado = info.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const cantidad = Number(args.find((a) => /^\d+$/.test(a)));

  if (!mencionado || !cantidad || cantidad <= 0) {
    return sock.sendMessage(
      contexto.chatId,
      { text: `╭━━━〔 💸 TRANSFERIR 〕━━━╮\n┃ 📌 Uso: ${p}transferir @usuario <cantidad>\n╰━━━━━━━━━━━━━━━━━━━━╯` },
      { quoted: info }
    );
  }

  if (mencionado === contexto.remitente) {
    return sock.sendMessage(
      contexto.chatId,
      { text: `╭━━━〔 ❌ ERROR 〕━━━╮\n┃ No puedes transferirte a ti mismo.\n╰━━━━━━━━━━━━━━━━━━━━╯` },
      { quoted: info }
    );
  }

  const exito = transferir(contexto.remitente, mencionado, cantidad);

  if (!exito) {
    return sock.sendMessage(
      contexto.chatId,
      {
        text: `╭━━━〔 ❌ SALDO INSUFICIENTE 〕━━━╮\n┃ Tu saldo: ${obtenerSaldo(contexto.remitente)} S7Coins\n╰━━━━━━━━━━━━━━━━━━━━╯`,
      },
      { quoted: info }
    );
  }

  await sock.sendMessage(
    contexto.chatId,
    {
      text:
        `╭━━━〔 💸 TRANSFERENCIA 〕━━━╮\n` +
        `┃ Enviaste ${cantidad} S7Coins a @${mencionado.split("@")[0]}\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`,
      mentions: [mencionado],
    },
    { quoted: info }
  );
}