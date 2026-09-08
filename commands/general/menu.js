import config from "../../config.js";

export async function ejecutar(sock, info, args, contexto) {
  const texto = `✅ *${config.botName}* conectado y operativo.
📌 Prefijo: ${config.prefix.join(" | ")}

Elige una opción abajo o escribe un comando directamente.`;

  const opciones = {
    footer: config.botName,
    title: "Menú principal",
    buttons: [
      { text: "👥 Administración", id: ".ayudagrupo" },
      { text: "🔒 Antilink ON", id: ".antilink on" },
      { text: "🔓 Antilink OFF", id: ".antilink off" },
    ],
  };

  try {
    await sock.sendMessage(
      contexto.chatId,
      { image: { url: config.menuImage }, caption: texto, ...opciones },
      { quoted: info }
    );
  } catch (err) {
    console.error("No se pudo cargar la imagen del menú, enviando solo texto:", err.message);
    await sock.sendMessage(contexto.chatId, { text: texto, ...opciones }, { quoted: info });
  }
}