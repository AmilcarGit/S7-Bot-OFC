import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
} from "baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import chalk from "chalk";
import readline from "readline";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config.js";
import { handleMessage } from "./lib/messageHandler.js";
import { handleGroupUpdate } from "./lib/groupHandler.js";

// Tiempo de inicio del bot
global.botStartTime = Date.now();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = path.join(__dirname, "session");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolve) => rl.question(texto, resolve));

// Banner de inicio
function mostrarBanner() {
  console.clear();
  console.log(chalk.cyanBright(`
╔══════════════════════════════════════════════╗
║                                              ║
║           ${chalk.bold.white(config.botName.padEnd(28))}║
║                                              ║
║     Bot de WhatsApp • ultra-baileys          ║
║                                              ║
╚══════════════════════════════════════════════╝
`));
  console.log(chalk.gray("──────────────────────────────────────────────"));
  console.log(chalk.white(`  Prefijos   : ${chalk.yellow(config.prefix.join(" | "))}`));
  console.log(chalk.white(`  Owner      : ${chalk.yellow(config.owner.join(", ") || "No configurado")}`));
  console.log(chalk.gray("──────────────────────────────────────────────\n"));
}

// Extraer texto del mensaje para mostrar en logs
function extraerTextoLog(mensaje) {
  if (!mensaje) return "";
  return (
    mensaje.conversation ||
    mensaje.extendedTextMessage?.text ||
    mensaje.imageMessage?.caption ||
    mensaje.videoMessage?.caption ||
    mensaje.buttonsResponseMessage?.selectedButtonId ||
    mensaje.listResponseMessage?.singleSelectReply?.selectedRowId ||
    "[multimedia / sin texto]"
  );
}

async function startBot() {
  mostrarBanner();

  console.log(chalk.blue("⏳ Iniciando sesión..."));

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: state,
    browser: Browsers.macOS("Chrome"),
    generateHighQualityLinkPreview: true,
  });

  // --- Vinculación por código de 8 dígitos ---
  if (!sock.authState.creds.registered) {
    let numero = config.phoneNumber;

    if (!numero) {
      console.log(chalk.yellow("\n📱 El bot aún no está vinculado.\n"));
      numero = await question(
        chalk.green("Ingresa el número del bot (con código de país, ej: 51987654321): ")
      );
      numero = numero.replace(/[^0-9]/g, "");
    }

    setTimeout(async () => {
      try {
        const codigo = await sock.requestPairingCode(numero);
        console.log(chalk.yellow("\n╔══════════════════════════════════╗"));
        console.log(chalk.yellow("║     CÓDIGO DE VINCULACIÓN        ║"));
        console.log(chalk.yellow("╠══════════════════════════════════╣"));
        console.log(chalk.bold.white(`║          ${codigo}               ║`));
        console.log(chalk.yellow("╚══════════════════════════════════╝\n"));
        console.log(chalk.gray("Ve a WhatsApp → Ajustes → Dispositivos vinculados"));
        console.log(chalk.gray("→ Vincular con número de teléfono e ingresa el código.\n"));
      } catch (err) {
        console.log(chalk.red("❌ Error al generar el código de vinculación:"), err.message);
      }
    }, 2500);
  }

  // --- Eventos de conexión ---
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const motivo = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const debeReconectar = motivo !== DisconnectReason.loggedOut;

      console.log(chalk.red("\n⚠️  Conexión cerrada."));
      if (debeReconectar) {
        console.log(chalk.yellow("♻️  Reconectando...\n"));
        startBot();
      } else {
        console.log(chalk.red("🔒 Sesión cerrada. Escanea de nuevo el código.\n"));
      }
    } else if (connection === "open") {
      console.log(chalk.greenBright(`\n✅ ${config.botName} conectado correctamente`));
      console.log(chalk.gray("──────────────────────────────────────────────"));
      console.log(chalk.white("  Estado     : ") + chalk.green("En línea"));
      console.log(chalk.white("  Motor      : ") + chalk.cyan("ultra-baileys"));
      console.log(chalk.gray("──────────────────────────────────────────────\n"));
      console.log(chalk.gray("Esperando mensajes...\n"));
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // --- Mensajes entrantes ---
  sock.ev.on("messages.upsert", async (m) => {
    try {
      const info = m.messages?.[0];
      if (!info || !info.message || info.key.fromMe) return;

      const chatId = info.key.remoteJid;
      const esGrupo = chatId.endsWith("@g.us");
      const remitente = esGrupo ? info.key.participant : chatId;
      const numero = (remitente || "").split("@")[0];
      const texto = extraerTextoLog(info.message);

      // Mostrar mensaje en los logs
      const tipo = esGrupo ? chalk.magenta("GRUPO") : chalk.blue("PRIVADO");
      const hora = new Date().toLocaleTimeString("es-PE", { hour12: false });

      console.log(
        chalk.gray(`[${hora}]`) +
        ` ${tipo} ` +
        chalk.yellow(numero) +
        chalk.white(` → ${texto}`)
      );

      await handleMessage(sock, m);
    } catch (err) {
      console.error(chalk.red("❌ Error procesando mensaje:"), err.message);
    }
  });

  // --- Eventos de grupo ---
  sock.ev.on("group-participants.update", async (update) => {
    try {
      await handleGroupUpdate(sock, update);
    } catch (err) {
      console.error(chalk.red("❌ Error en evento de grupo:"), err.message);
    }
  });

  return sock;
}

startBot().catch((err) => {
  console.error(chalk.red("Error fatal al iniciar el bot:"), err);
  process.exit(1);
});