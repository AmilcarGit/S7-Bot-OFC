export const TIEMPO_SELECCION_MS = 3 * 60 * 1000;
export const MAX_RESULTADOS = 10;

const busquedasPendientes = new Map();

export function claveBusqueda(chatId, remitente) {
  return `${chatId}_${remitente}`;
}

export function limpiarBusquedasVencidas() {
  const ahora = Date.now();
  for (const [clave, valor] of busquedasPendientes) {
    if (!valor || ahora > valor.expira) {
      busquedasPendientes.delete(clave);
    }
  }
}

export function guardarBusqueda(clave, videos) {
  busquedasPendientes.set(clave, { videos, expira: Date.now() + TIEMPO_SELECCION_MS });
}

export function obtenerBusqueda(clave) {
  return busquedasPendientes.get(clave);
}