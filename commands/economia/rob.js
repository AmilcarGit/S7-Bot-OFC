export const alias = ["robar"];

import config from "../../config.js";
import { intentarRobo } from "../../lib/economia.js";

function formatearTiempo(ms) {
  const minutos = Math.floor(ms / 60000);
  return `${minutos} min`;
}

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];
  const mencionado = info.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  if (!mencionado) {
    return sock.sendMessage(
      contexto.chatId,
      { text: `╭━━━〔 🦹 ROB 〕━━━╮\n┃ 📌 Uso: ${p}rob @usuario\n╰━━━━━━━━━━━━━━━━━━━━╯` },
      { quoted: info }
    );
  }

  if (mencionado === contexto.remitente) {
    return sock.sendMessage(
      contexto.chatId,
      { text: `╭━━━〔 ❌ ERROR 〕━━━╮\n┃ No puedes robarte a ti mismo.\n╰━━━━━━━━━━━━━━━━━━━━╯` },
      { quoted: info }
    );
  }

  const resultado = intentarRobo(contexto.remitente, mencionado);

  if (resultado.estado === "cooldown") {
    return sock.sendMessage(
      contexto.chatId,
      { text: `╭━━━〔 ⏰ ESPERA 〕━━━╮\n┃ Podrás robar de nuevo en ${formatearTiempo(resultado.restanteMs)}.\n╰━━━━━━━━━━━━━━━━━━━━╯` },
      { quoted: info }
    );
  }

  if (resultado.estado === "victima_pobre") {
    return sock.sendMessage(
      contexto.chatId,
      { text: `╭━━━〔 🦹 ROB 〕━━━╮\n┃ Esa persona no tiene suficiente saldo para robarle.\n╰━━━━━━━━━━━━━━━━━━━━╯` },
      { quoted: info }
    );
  }

  if (resultado.estado === "exito") {
    return sock.sendMessage(
      contexto.chatId,
      {
        text: `╭━━━〔 🦹 ROBO EXITOSO 〕━━━╮\n┃ Le robaste ${resultado.monto} S7Coins a @${mencionado.split("@")[0]} 💰\n╰━━━━━━━━━━━━━━━━━━━━╯`,
        mentions: [mencionado],
      },
      { quoted: info }
    );
  }

  await sock.sendMessage(
    contexto.chatId,
    { text: `╭━━━〔 🚨 TE ATRAPARON 〕━━━╮\n┃ Fallaste el robo y pagaste ${resultado.penalizacion} S7Coins de multa.\n╰━━━━━━━━━━━━━━━━━━━━╯` },
    { quoted: info }
  );
}