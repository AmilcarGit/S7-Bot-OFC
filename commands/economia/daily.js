export const alias = ["diario"];

import { reclamarDiario } from "../../lib/economia.js";

function formatearTiempo(ms) {
  const horas = Math.floor(ms / 3600000);
  const minutos = Math.floor((ms % 3600000) / 60000);
  return `${horas}h ${minutos}m`;
}

export async function ejecutar(sock, info, args, contexto) {
  const resultado = reclamarDiario(contexto.remitente);

  if (!resultado.exito) {
    return sock.sendMessage(
      contexto.chatId,
      {
        text:
          `╭━━━〔 ⏰ DAILY 〕━━━╮\n` +
          `┃ Ya reclamaste tu recompensa hoy.\n` +
          `┃ Vuelve en ${formatearTiempo(resultado.restanteMs)}.\n` +
          `╰━━━━━━━━━━━━━━━━━━━━╯`,
      },
      { quoted: info }
    );
  }

  await sock.sendMessage(
    contexto.chatId,
    {
      text:
        `╭━━━〔 🎁 DAILY 〕━━━╮\n` +
        `┃ +${resultado.recompensa} S7Coins\n` +
        `┃ 💰 Saldo: ${resultado.saldoNuevo} S7Coins\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`,
    },
    { quoted: info }
  );
}