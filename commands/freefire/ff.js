import config from "../../config.js";
import { enviarLista } from "../../lib/botones.js";

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];

  await enviarLista(sock, contexto.chatId, {
    texto: `╭━━━〔 🎮 FREE FIRE 〕━━━╮\n┃ Elige una función\n╰━━━━━━━━━━━━━━━━━━━━╯`,
    footer: "S7-Bot-OFC · Free Fire",
    titulo: "Free Fire",
    textoBoton: "🔫 Ver funciones",
    mensajeCitado: info,
    secciones: [
      {
        titulo: "Cuenta",
        filas: [
          { titulo: "📝 Registrarme", id: `${p}reg`, descripcion: "Vincula tu UID de Free Fire" },
          { titulo: "👤 Mi perfil", id: `${p}miuid`, descripcion: "Ver tu UID y región registrados" },
          { titulo: "🗑️ Desvincular", id: `${p}unreg`, descripcion: "Eliminar tu registro" },
        ],
      },
      {
        titulo: "Próximamente (necesitan API)",
        filas: [
          { titulo: "📊 Estadísticas", id: `${p}ffstats`, descripcion: "K/D, rango, partidas" },
          { titulo: "🎫 Elite Pass", id: `${p}ffelite`, descripcion: "Info de la temporada actual" },
          { titulo: "🎁 Canjear código", id: `${p}ffredeem`, descripcion: "Canjear un código de recompensa" },
          { titulo: "🖥️ Estado del servidor", id: `${p}ffserver`, descripcion: "Ver si el server está caído" },
          { titulo: "🔫 Info de arma", id: `${p}ffweapon`, descripcion: "Stats de un arma específica" },
          { titulo: "🏆 Ranking", id: `${p}ffrank`, descripcion: "Top jugadores de la región" },
          { titulo: "🛡️ Info de clan", id: `${p}ffclan`, descripcion: "Buscar un clan/guild" },
        ],
      },
    ],
  });
}