import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARCHIVO = path.join(__dirname, "../data/freefire.json");

function asegurarArchivo() {
  const carpeta = path.dirname(ARCHIVO);
  if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta, { recursive: true });
  if (!fs.existsSync(ARCHIVO)) fs.writeFileSync(ARCHIVO, "{}", "utf-8");
}

function leerDatos() {
  asegurarArchivo();
  try {
    return JSON.parse(fs.readFileSync(ARCHIVO, "utf-8"));
  } catch {
    return {};
  }
}

function guardarDatos(datos) {
  asegurarArchivo();
  fs.writeFileSync(ARCHIVO, JSON.stringify(datos, null, 2), "utf-8");
}

export function registrarUID(waId, uid, region) {
  const datos = leerDatos();
  datos[waId] = { uid, region: region.toUpperCase() };
  guardarDatos(datos);
}

export function obtenerRegistro(waId) {
  const datos = leerDatos();
  return datos[waId] || null;
}

export function eliminarRegistro(waId) {
  const datos = leerDatos();
  const existia = !!datos[waId];
  delete datos[waId];
  guardarDatos(datos);
  return existia;
}

export async function enviarProximamente(sock, info, contexto, nombreFuncion) {
  await sock.sendMessage(
    contexto.chatId,
    {
      text:
        `╭━━━〔 🚧 PRÓXIMAMENTE 〕━━━╮\n` +
        `┃ "${nombreFuncion}" todavía no está conectado\n` +
        `┃ a ninguna API de Free Fire.\n` +
        `┃ Cuando el owner agregue el endpoint,\n` +
        `┃ esta función va a funcionar.\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`,
    },
    { quoted: info }
  );
}