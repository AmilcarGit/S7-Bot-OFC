export async function ejecutar(sock, info, args, contexto) {
  if (!contexto.esGrupo) return;

  const metadata = await sock.groupMetadata(contexto.chatId);
  const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id);
  if (!admins.includes(contexto.remitente) && !contexto.esOwner) {
    return sock.sendMessage(contexto.chatId, { text: "❌ Solo un admin puede usar este comando." }, { quoted: info });
  }

  const mencionado = info.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mencionado) {
    return sock.sendMessage(contexto.chatId, { text: "⚠️ Menciona al usuario a ascender." }, { quoted: info });
  }

  try {
    await sock.groupParticipantsUpdate(contexto.chatId, [mencionado], "promote");
    await sock.sendMessage(contexto.chatId, { text: "✅ Usuario ascendido a administrador." });
  } catch (err) {
    await sock.sendMessage(contexto.chatId, { text: "❌ No pude ascenderlo (¿soy administrador del grupo?)." });
  }
}
