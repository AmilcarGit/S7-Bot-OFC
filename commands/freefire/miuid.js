export const alias = ["perfil", "miid"];

import config from "../../config.js";
import { obtenerRegistro } from "../../lib/freefire.js";

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];
  const registro = obtenerRegistro(contexto.remitente);

  if (!registro) {
    return sock.sendMessage(
      contexto.chatId,
      { text: `╭━━━〔 ⚠️ SIN REGISTRO 〕━━━╮\n┃ Aún no te registras.\n┃ Usa: ${p}reg <UID> [región]\n╰━━━━━━━━━━━━━━━━━━━━╯` },
      { quoted: info }
    );
  }

  await sock.sendMessage(
    contexto.chatId,
    {
      text:
        `╭━━━〔 🎮 MI PERFIL FF 〕━━━╮\n` +
        `┃ 🆔 UID: ${registro.uid}\n` +
        `┃ 🌎 Región: ${registro.region}\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`,
    },
    { quoted: info }
  );
}