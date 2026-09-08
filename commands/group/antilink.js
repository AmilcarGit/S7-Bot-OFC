// Estado en memoria: qué grupos tienen antilink activado.
// Para persistencia real, reemplazar por lectura/escritura en un JSON o base de datos.
const gruposConAntilink = new Set();
const REGEX_LINK = /(chat\.whatsapp\.com|https?:\/\/)/i;

export async function ejecutar(sock, info, args, contexto) {
  if (!contexto.esGrupo) return;

  const metadata = await sock.groupMetadata(contexto.chatId);
  const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id);
  if (!admins.includes(contexto.remitente) && !contexto.esOwner) {
    return sock.sendMessage(contexto.chatId, { text: "❌ Solo un admin puede usar este comando." }, { quoted: info });
  }

  const opcion = (args[0] || "").toLowerCase();
  if (opcion === "on") {
    gruposConAntilink.add(contexto.chatId);
    await sock.sendMessage(contexto.chatId, { text: "🔒 Antilink activado en este grupo." });
  } else if (opcion === "off") {
    gruposConAntilink.delete(contexto.chatId);
    await sock.sendMessage(contexto.chatId, { text: "🔓 Antilink desactivado en este grupo." });
  } else {
    await sock.sendMessage(contexto.chatId, { text: "Uso: .antilink on | .antilink off" });
  }
}

export async function verificar(sock, info, texto) {
  const chatId = info.key.remoteJid;
  if (!gruposConAntilink.has(chatId)) return;
  if (!REGEX_LINK.test(texto)) return;

  const remitente = info.key.participant;
  if (!remitente) return;

  try {
    const metadata = await sock.groupMetadata(chatId);
    const esAdmin = metadata.participants.some((p) => p.id === remitente && p.admin);
    if (esAdmin) return; // No moderamos a los admins

    await sock.sendMessage(chatId, { delete: info.key });
    await sock.groupParticipantsUpdate(chatId, [remitente], "remove");
    await sock.sendMessage(chatId, { text: "🚫 Se eliminó un mensaje con enlace y se expulsó al usuario." });
  } catch (err) {
    console.error("Error en antilink:", err);
  }
}
