import config from "../../config.js";

export async function ejecutar(sock, info, args, contexto) {
  const texto = `✅ *${config.botName}* conectado y operativo.
📌 Prefijo: ${config.prefix.join(" | ")}

Elige una opción abajo o escribe un comando directamente.`;

  await sock.sendMessage(
    contexto.chatId,
    {
      image: { url: config.menuImage },
      caption: texto,
      footer: config.botName,
      title: "Menú principal",
      buttons: [
        { text: "👥 Administración", id: ".ayudagrupo" },
        { text: "🔒 Antilink ON", id: ".antilink on" },
        { text: "🔓 Antilink OFF", id: ".antilink off" },
        {
          text: "📋 Ver comandos",
          sections: [
            {
              title: "Administración de grupo",
              rows: [
                { title: "Expulsar", description: `${config.prefix[0]}kick @usuario`, id: ".ayudagrupo" },
                { title: "Ascender admin", description: `${config.prefix[0]}promote @usuario`, id: ".ayudagrupo" },
                { title: "Quitar admin", description: `${config.prefix[0]}demote @usuario`, id: ".ayudagrupo" },
                { title: "Antilink", description: `${config.prefix[0]}antilink on/off`, id: ".ayudagrupo" },
              ],
            },
          ],
        },
      ],
    },
    { quoted: info }
  );
}
