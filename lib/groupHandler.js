import { estaActivo } from "../commands/group/welcome.js";

function obtenerJid(participante) {
  if (typeof participante === "string") return participante;
  return participante?.id || participante?.jid || null;
}

export async function handleGroupUpdate(sock, update) {
  const { id: chatId, participants, action } = update;
  if (!estaActivo(chatId)) return;

  for (const p of participants) {
    const jid = obtenerJid(p);
    if (!jid) continue;

    const nombre = "@" + jid.split("@")[0];
    let texto = "";

    if (action === "add") {
      texto = `👋 ¡Bienvenido/a ${nombre} al grupo!`;
    } else if (action === "remove") {
      texto = `👋 ${nombre} salió del grupo.`;
    } else if (action === "promote") {
      texto = `⬆️ ${nombre} ahora es administrador/a.`;
    } else if (action === "demote") {
      texto = `⬇️ ${nombre} ya no es administrador/a.`;
    }

    if (texto) {
      await sock.sendMessage(chatId, { text: texto, mentions: [jid] });
    }
  }
}