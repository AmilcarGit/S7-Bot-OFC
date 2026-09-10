export const alias = ["desvincular"];

import { eliminarRegistro } from "../../lib/freefire.js";

export async function ejecutar(sock, info, args, contexto) {
  const existia = eliminarRegistro(contexto.remitente);

  const texto = existia
    ? `╭━━━〔 ✅ DESVINCULADO 〕━━━╮\n┃ Tu registro de Free Fire fue eliminado.\n╰━━━━━━━━━━━━━━━━━━━━╯`
    : `╭━━━〔 ℹ️ SIN REGISTRO 〕━━━╮\n┃ No tenías ningún UID registrado.\n╰━━━━━━━━━━━━━━━━━━━━╯`;

  await sock.sendMessage(contexto.chatId, { text: texto }, { quoted: info });
}