import config from "../config.js";

export async function handleGroupUpdate(sock, update) {
  if (!config.welcome) return;
  const { id: chatId, participants, action } = update;

  for (const participante of participants) {
    const nombre = "@" + participante.split("@")[0];
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
      await sock.sendMessage(chatId, { text: texto, mentions: [participante] });
    }
  }
}
