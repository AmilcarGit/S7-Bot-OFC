import config from "../../config.js";

const overrides = new Map();

export function estaActivo(chatId) {
  if (overrides.has(chatId)) return overrides.get(chatId);
  return config.welcome;
}

export async function ejecutar(sock, info, args, contexto) {
  if (!contexto.esGrupo) {
    return sock.sendMessage(contexto.chatId, { text: "❌ Este comando solo funciona en grupos." }, { quoted: info });
  }
  const metadata = await sock.groupMetadata(contexto.chatId);
  const admins = metadata.participants.filter((p) => p.admin).map((p) => p.id);
  if (!admins.includes(contexto.remitente) && !contexto.esOwner) {
    return sock.sendMessage(contexto.chatId, { text: "❌ Solo un admin puede usar este comando." }, { quoted: info });
  }
  const opcion = (args[0] || "").toLowerCase();
  if (opcion === "on") {
    overrides.set(contexto.chatId, true);
    await sock.sendMessage(contexto.chatId, { text: "👋 Mensajes de bienvenida/despedida activados en este grupo." });
  } else if (opcion === "off") {
    overrides.set(contexto.chatId, false);
    await sock.sendMessage(contexto.chatId, { text: "🔕 Mensajes de bienvenida/despedida desactivados en este grupo." });
  } else {
    const estado = estaActivo(contexto.chatId) ? "activado ✅" : "desactivado 🔕";
    await sock.sendMessage(contexto.chatId, { text: `Uso: .welcome on | .welcome off\nEstado actual: ${estado}` });
  }
}