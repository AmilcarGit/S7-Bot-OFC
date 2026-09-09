import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ_PROYECTO = path.join(__dirname, "../..");
const PM2_PROCESS_NAME = process.env.PM2_NAME || "s7-bot-ofc";

export async function ejecutar(sock, info, args, contexto) {
  if (!contexto.esOwner) {
    return sock.sendMessage(
      contexto.chatId,
      { text: "❌ Solo el owner del bot puede usar este comando." },
      { quoted: info }
    );
  }

  await sock.sendMessage(
    contexto.chatId,
    { text: "🔄 Actualizando desde GitHub (git pull)..." },
    { quoted: info }
  );

  try {
    const { stdout, stderr } = await execAsync("git pull", {
      cwd: RAIZ_PROYECTO,
      timeout: 30000,
    });

    const salida = (stdout || "").trim();
    const errores = (stderr || "").trim();
    const sinCambios = /already up to date/i.test(salida);

    let texto = `✅ *git pull* completado\n\n\`\`\`${salida || "(sin salida)"}\`\`\``;
    if (errores) texto += `\n\n⚠️ *stderr:*\n\`\`\`${errores}\`\`\``;

    await sock.sendMessage(contexto.chatId, { text: texto });

    if (sinCambios) {
      return sock.sendMessage(contexto.chatId, {
        text: "ℹ️ No había cambios nuevos, no fue necesario reiniciar.",
      });
    }

    if ((args[0] || "").toLowerCase() === "norestart") {
      return sock.sendMessage(contexto.chatId, {
        text: "✅ Cambios descargados. No reinicié porque pediste 'norestart'.",
      });
    }

    await sock.sendMessage(contexto.chatId, {
      text: `♻️ Reiniciando el bot (pm2 restart ${PM2_PROCESS_NAME})...`,
    });

    setTimeout(() => {
      exec(`pm2 restart ${PM2_PROCESS_NAME}`, (err) => {
        if (err) console.error("Error al reiniciar con pm2:", err.message);
      });
    }, 1500);
  } catch (error) {
    console.error("[UPDATE]", error);
    await sock.sendMessage(
      contexto.chatId,
      { text: `❌ Error al actualizar:\n\n\`\`\`${error.message || "Error desconocido"}\`\`\`` },
      { quoted: info }
    );
  }
}