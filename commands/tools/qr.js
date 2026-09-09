import axios from "axios";
import config from "../../config.js";

export async function ejecutar(sock, info, args, contexto) {
  const texto = args.join(" ").trim();

  if (!texto) {
    await sock.sendMessage(
      contexto.chatId,
      {
        text:
          "╭━━〔 📱 QR GENERATOR 〕━━╮\n" +
          "│\n" +
          "│ ❌ Falta el texto.\n" +
          "│\n" +
          "│ Uso:\n" +
          "│ .qr Tu texto aquí\n" +
          "│\n" +
          "│ Ejemplo:\n" +
          "│ .qr Hola como están S7\n" +
          "│\n" +
          "╰━━━━━━━━━━━━━━━━━━━━╯",
      },
      { quoted: info }
    );
    return;
  }

  try {
    const response = await axios.get(
      "https://api-orbit-9doj.onrender.com/api/v1/tools/qr",
      {
        params: {
          apikey: config.orbitApiKey,
          text: texto,
        },
        headers: {
          "x-api-key": config.orbitApiKey,
          "x-orbit-ip": config.orbitIp,
        },
        responseType: "arraybuffer",
        timeout: 20000,
      }
    );

    const contentType = String(
      response.headers["content-type"] || ""
    ).toLowerCase();

    if (!contentType.includes("image")) {
      throw new Error("La API no devolvió una imagen QR válida.");
    }

    await sock.sendMessage(
      contexto.chatId,
      {
        image: Buffer.from(response.data),
        caption:
          "╭━━〔 📱 QR GENERADO 〕━━╮\n" +
          "│\n" +
          `│ 📝 Texto: ${texto}\n` +
          "│\n" +
          "│ ⚡ Orbit API\n" +
          "╰━━━━━━━━━━━━━━━━━━━━╯",
      },
      { quoted: info }
    );
  } catch (error) {
    console.error("[QR] Error:", error.message);

    await sock.sendMessage(
      contexto.chatId,
      {
        text:
          "❌ *Error al generar el código QR*\n\n" +
          `> ${error.message || "Error desconocido"}`,
      },
      { quoted: info }
    );
  }
}