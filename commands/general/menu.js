import config from "../../config.js";

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];

  const texto = `╭─❖ *${config.botName}* ❖─╮
│ ✅ Conectado y operativo
│ 📌 Prefijo: ${config.prefix.join(" | ")}
╰────────────────╯

🔥 *GENERAL*
┃ 📌 ${p}menu, ${p}ayuda — Ver este menú
┃ 📌 ${p}ping — Ver estado del bot

🔥 *ADMINISTRACIÓN DE GRUPO*
┃ 📌 ${p}kick @usuario — Expulsar
┃ 📌 ${p}promote @usuario — Ascender a admin
┃ 📌 ${p}demote @usuario — Quitar admin
┃ 📌 ${p}antilink on / off — Activar o desactivar antilink
┃ 📌 ${p}welcome on / off — Activar o desactivar bienvenida

_Escribe cualquier comando directamente, por ejemplo: ${p}ping_`;

  try {
    await sock.sendMessage(
      contexto.chatId,
      { image: { url: config.menuImage }, caption: texto },
      { quoted: info }
    );
  } catch (err) {
    console.error("No se pudo cargar la imagen del menú, enviando solo texto:", err.message);
    await sock.sendMessage(contexto.chatId, { text: texto }, { quoted: info });
  }
}