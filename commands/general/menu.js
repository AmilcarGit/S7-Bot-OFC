import config from "../../config.js";

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];

  const texto = `╭━━━━━━━━━━━━━━━━━━━╮
┃  *${config.botName}*
╰━━━━━━━━━━━━━━━━━━━╯

🔥 *GENERAL*
┃ ${p}menu — Ver este menú
┃ ${p}ping — Ver latencia
┃ ${p}ayudagrupo — Ayuda de grupo

📥 *DESCARGAS*
┃ ${p}yts — Buscar en YouTube
┃ ${p}yta — Descargar audio
┃ ${p}ytv — Descargar video

👮 *ADMINISTRACIÓN*
┃ ${p}kick @usuario — Expulsar
┃ ${p}promote @usuario — Hacer admin
┃ ${p}demote @usuario — Quitar admin
┃ ${p}antilink on/off — Antilink
┃ ${p}welcome on/off — Bienvenida

🛠️ *HERRAMIENTAS*
┃ ${p}qr — Generar código QR

_Escribe cualquier comando, ejemplo: ${p}ping_`;

  await sock.sendMessage(contexto.chatId, { text: texto }, { quoted: info });
}