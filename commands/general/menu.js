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

✨ *ANIME*
┃ ${p}anime — Elegir tipo (lista)
┃ ${p}waifu, ${p}neko, ${p}pat, ${p}hug...

💰 *ECONOMÍA (S7Coins)*
┃ ${p}daily — Reclamar diario
┃ ${p}saldo — Ver tu saldo
┃ ${p}transferir @user <cant> — Enviar
┃ ${p}top — Ranking
┃ ${p}shop — Tienda de títulos
┃ ${p}rob @user — Intentar robar

🛠️ *HERRAMIENTAS*
┃ ${p}qr — Generar código QR

_Escribe cualquier comando, ejemplo: ${p}ping_`;

  if (global.menuImageBuffer) {
    try {
      return await sock.sendMessage(
        contexto.chatId,
        { image: global.menuImageBuffer, caption: texto },
        { quoted: info }
      );
    } catch (err) {
      console.error("No se pudo enviar la imagen del menú, mandando solo texto:", err.message);
    }
  }

  await sock.sendMessage(contexto.chatId, { text: texto }, { quoted: info });
}