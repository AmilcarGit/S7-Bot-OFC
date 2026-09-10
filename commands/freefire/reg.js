export const alias = ["register", "vincular"];

import config from "../../config.js";
import { registrarUID } from "../../lib/freefire.js";

const REGIONES_VALIDAS = ["IND", "BR", "SAC", "NA", "SEA", "EU", "ME", "BD", "PK", "TH", "VN", "TW"];

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];
  const uid = args[0];
  const region = (args[1] || "SAC").toUpperCase();

  if (!uid || !/^\d{6,12}$/.test(uid)) {
    return sock.sendMessage(
      contexto.chatId,
      {
        text:
          `╭━━━〔 🎮 REGISTRO FREE FIRE 〕━━━╮\n` +
          `┃ 📌 Uso: ${p}reg <UID> [región]\n` +
          `┃ 📝 Ejemplo: ${p}reg 123456789 SAC\n` +
          `┃ 🌎 Regiones: ${REGIONES_VALIDAS.join(", ")}\n` +
          `┃ (si no pones región, se usa SAC)\n` +
          `╰━━━━━━━━━━━━━━━━━━━━╯`,
      },
      { quoted: info }
    );
  }

  if (!REGIONES_VALIDAS.includes(region)) {
    return sock.sendMessage(
      contexto.chatId,
      {
        text: `╭━━━〔 ❌ REGIÓN INVÁLIDA 〕━━━╮\n┃ Usa una de: ${REGIONES_VALIDAS.join(", ")}\n╰━━━━━━━━━━━━━━━━━━━━╯`,
      },
      { quoted: info }
    );
  }

  registrarUID(contexto.remitente, uid, region);

  await sock.sendMessage(
    contexto.chatId,
    {
      text:
        `╭━━━〔 ✅ REGISTRADO 〕━━━╮\n` +
        `┃ 🆔 UID: ${uid}\n` +
        `┃ 🌎 Región: ${region}\n` +
        `┃ Usa ${p}miuid para verlo cuando quieras.\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`,
    },
    { quoted: info }
  );
}