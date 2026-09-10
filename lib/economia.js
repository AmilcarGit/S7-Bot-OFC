import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARCHIVO = path.join(__dirname, "../data/economia.json");

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

function obtenerUsuario(datos, id) {
  if (!datos[id]) {
    datos[id] = { saldo: 0, ultimoDaily: 0, ultimoRob: 0, titulo: null };
  }
  return datos[id];
}

export function obtenerSaldo(id) {
  const datos = leerDatos();
  return obtenerUsuario(datos, id).saldo;
}

export function agregarSaldo(id, cantidad) {
  const datos = leerDatos();
  const usuario = obtenerUsuario(datos, id);
  usuario.saldo = Math.max(0, usuario.saldo + cantidad);
  guardarDatos(datos);
  return usuario.saldo;
}

export function quitarSaldo(id, cantidad) {
  return agregarSaldo(id, -cantidad);
}

export function transferir(origenId, destinoId, cantidad) {
  const datos = leerDatos();
  const origen = obtenerUsuario(datos, origenId);
  const destino = obtenerUsuario(datos, destinoId);

  if (origen.saldo < cantidad) return false;

  origen.saldo -= cantidad;
  destino.saldo += cantidad;
  guardarDatos(datos);
  return true;
}

export function topUsuarios(limite = 10) {
  const datos = leerDatos();
  return Object.entries(datos)
    .map(([id, u]) => ({ id, saldo: u.saldo }))
    .filter((u) => u.saldo > 0)
    .sort((a, b) => b.saldo - a.saldo)
    .slice(0, limite);
}

const COOLDOWN_DAILY_MS = 24 * 60 * 60 * 1000;
const RECOMPENSA_DAILY_MIN = 200;
const RECOMPENSA_DAILY_MAX = 500;

export function reclamarDiario(id) {
  const datos = leerDatos();
  const usuario = obtenerUsuario(datos, id);
  const ahora = Date.now();
  const restante = usuario.ultimoDaily + COOLDOWN_DAILY_MS - ahora;

  if (restante > 0) {
    return { exito: false, restanteMs: restante };
  }

  const recompensa =
    Math.floor(Math.random() * (RECOMPENSA_DAILY_MAX - RECOMPENSA_DAILY_MIN + 1)) + RECOMPENSA_DAILY_MIN;

  usuario.saldo += recompensa;
  usuario.ultimoDaily = ahora;
  guardarDatos(datos);

  return { exito: true, recompensa, saldoNuevo: usuario.saldo };
}

const COOLDOWN_ROB_MS = 60 * 60 * 1000;
const PROBABILIDAD_EXITO_ROB = 0.5;
const SALDO_MINIMO_VICTIMA = 100;
const PORCENTAJE_ROBO_MIN = 0.1;
const PORCENTAJE_ROBO_MAX = 0.3;
const PENALIZACION_FALLO = 100;

export function intentarRobo(ladronId, victimaId) {
  const datos = leerDatos();
  const ladron = obtenerUsuario(datos, ladronId);
  const victima = obtenerUsuario(datos, victimaId);
  const ahora = Date.now();

  const restante = ladron.ultimoRob + COOLDOWN_ROB_MS - ahora;
  if (restante > 0) {
    return { estado: "cooldown", restanteMs: restante };
  }

  if (victima.saldo < SALDO_MINIMO_VICTIMA) {
    return { estado: "victima_pobre" };
  }

  ladron.ultimoRob = ahora;

  const exito = Math.random() < PROBABILIDAD_EXITO_ROB;

  if (exito) {
    const porcentaje = PORCENTAJE_ROBO_MIN + Math.random() * (PORCENTAJE_ROBO_MAX - PORCENTAJE_ROBO_MIN);
    const monto = Math.floor(victima.saldo * porcentaje);
    victima.saldo -= monto;
    ladron.saldo += monto;
    guardarDatos(datos);
    return { estado: "exito", monto };
  }

  ladron.saldo = Math.max(0, ladron.saldo - PENALIZACION_FALLO);
  guardarDatos(datos);
  return { estado: "fallo", penalizacion: PENALIZACION_FALLO };
}

export function obtenerTitulo(id) {
  const datos = leerDatos();
  return obtenerUsuario(datos, id).titulo;
}

export function asignarTitulo(id, titulo) {
  const datos = leerDatos();
  const usuario = obtenerUsuario(datos, id);
  usuario.titulo = titulo;
  guardarDatos(datos);
}

export const TIENDA = [
  { id: "corazon", nombre: "❤️ Querido/a", precio: 2000 },
  { id: "vip", nombre: "🌟 VIP", precio: 5000 },
  { id: "leyenda", nombre: "👑 Leyenda", precio: 15000 },
];