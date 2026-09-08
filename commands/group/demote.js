export async function ejecutar(sock, info, args, contexto) {
  if (!contexto.esGrupo) return;

  const metadata = await sock.groupMetadata(contexto.chatId);
  const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id);
  if (!admins.includes(contexto.remitente) && !contexto.esOwner) {
    return sock.sendMessage(contexto.chatId, { text: "❌ Solo un admin puede usar este comando." }, { quoted: info });
  }

  const mencionado = info.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mencionado) {
    return sock.sendMessage(contexto.chatId, { text: "⚠️ Menciona al usuario a degradar." }, { quoted: info });
  }

  try {
    await sock.groupParticipantsUpdate(contexto.chatId, [mencionado], "demote");
    await sock.sendMessage(contexto.chatId, { text: "✅ Usuario removido de administrador." });
  } catch (err) {
    await sock.sendMessage(contexto.chatId, { text: "❌ No pude degradarlo (¿soy administrador del grupo?)." });
  }
}
