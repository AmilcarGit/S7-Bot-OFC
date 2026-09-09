import config from "../../config.js";

export async function ejecutar(sock, info, args, contexto) {
  const texto = `👥 *Administración de grupo*

${config.prefix[0]}kick @usuario — Expulsar
${config.prefix[0]}promote @usuario — Ascender a admin
${config.prefix[0]}demote @usuario — Quitar admin
${config.prefix[0]}antilink on — Activar antilink
${config.prefix[0]}antilink off — Desactivar antilink

_Estos comandos solo funcionan dentro de un grupo y solo pueden usarlos los admins._`;

  await sock.sendMessage(contexto.chatId, { text: texto }, { quoted: info });
}