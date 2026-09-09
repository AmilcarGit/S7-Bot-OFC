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

// Tiempo de inicio del bot (para mostrar uptime en el menú)
global.botStartTime = Date.now();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = path.join(__dirname, "session");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolve) => rl.question(texto, resolve));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false, // Usamos código de 8 dígitos, no QR
    auth: state,
    browser: Browsers.macOS("Chrome"),
    generateHighQualityLinkPreview: true,
  });

  // --- Vinculación por código de 8 dígitos ---
  if (!sock.authState.creds.registered) {
    let numero = config.phoneNumber;
    if (!numero) {
      numero = await question(
        chalk.green("Ingresa el número de WhatsApp del bot (con código de país, ej: 5219991234567): ")
      );
      numero = numero.replace(/[^0-9]/g, "");
    }
    setTimeout(async () => {
      try {
        const codigo = await sock.requestPairingCode(numero);
        console.log(chalk.yellow("\n=================================="));
        console.log(chalk.cyan(" TU CÓDIGO DE VINCULACIÓN ES:"));
        console.log(chalk.bold.white(` ${codigo}`));
        console.log(chalk.yellow("==================================\n"));
        console.log(chalk.gray("En WhatsApp: Ajustes > Dispositivos vinculados > Vincular con número de teléfono."));
      } catch (err) {
        console.log(chalk.red("Error al generar el código de vinculación:"), err);
      }
    }, 3000);
  }

  // --- Eventos de conexión ---
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const motivo = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const debeReconectar = motivo !== DisconnectReason.loggedOut;
      console.log(chalk.red("Conexión cerrada."), "Reconectando:", debeReconectar);
      if (debeReconectar) startBot();
    } else if (connection === "open") {
      console.log(chalk.green(`✅ ${config.botName} conectado correctamente (ultra-baileys).`));
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // --- Mensajes entrantes ---
  sock.ev.on("messages.upsert", async (m) => {
    try {
      await handleMessage(sock, m);
    } catch (err) {
      console.error(chalk.red("Error procesando mensaje:"), err);
    }
  });

  // --- Cambios en participantes de grupos ---
  sock.ev.on("group-participants.update", async (update) => {
    try {
      await handleGroupUpdate(sock, update);
    } catch (err) {
      console.error(chalk.red("Error procesando evento de grupo:"), err);
    }
  });

  return sock;
}

startBot();