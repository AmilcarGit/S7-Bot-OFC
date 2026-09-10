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

✨ *ANIME*
┃ ${p}anime — Galería anime
┃ ${p}anime waifu
┃ ${p}anime neko
┃ ${p}anime kitsune
┃ ${p}anime husbando
┃ ${p}anime hug / kiss / pat...

👮 *ADMINISTRACIÓN*
┃ ${p}kick @usuario — Expulsar
┃ ${p}promote @usuario — Hacer admin
┃ ${p}demote @usuario — Quitar admin
┃ ${p}antilink on/off — Antilink
┃ ${p}welcome on/off — Bienvenida

🛠️ *HERRAMIENTAS*
┃ ${p}qr — Generar código QR

👑 *OWNER*
┃ ${p}update — Actualizar bot

_Escribe cualquier comando, ejemplo: ${p}ping_`;

  if (global.menuImageBuffer) {
    try {
      return await sock.sendMessage(
        contexto.chatId,
        { image: global.menuImageBuffer, caption: texto },
        { quoted: info }
      );
    } catch (err) {
      console.error("No se pudo enviar la imagen del menú:", err.message);
    }
  }

  await sock.sendMessage(contexto.chatId, { text: texto }, { quoted: info });
}