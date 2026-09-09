import config from "../../config.js";
import { enviarLista } from "../../lib/botones.js";

function obtenerHoraPeru() {
  return new Date().toLocaleString("es-PE", {
    timeZone: "America/Lima",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function obtenerFechaPeru() {
  return new Date().toLocaleDateString("es-PE", {
    timeZone: "America/Lima",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function obtenerTiempoActivo() {
  const ms = Date.now() - (global.botStartTime || Date.now());
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (dias > 0) return `${dias}d ${horas % 24}h ${minutos % 60}m`;
  if (horas > 0) return `${horas}h ${minutos % 60}m ${segundos % 60}s`;
  if (minutos > 0) return `${minutos}m ${segundos % 60}s`;
  return `${segundos}s`;
}

export async function ejecutar(sock, info, args, contexto) {
  const p = config.prefix[0];
  const hora = obtenerHoraPeru();
  const fecha = obtenerFechaPeru();
  const uptime = obtenerTiempoActivo();

  const texto = `╭━━━━━━━━━━━━━━━━━━━╮
┃  *${config.botName}*
╰━━━━━━━━━━━━━━━━━━━╯

📅 *Fecha:* ${fecha}
🕐 *Hora Perú:* ${hora}
⏱️ *Activo:* ${uptime}
📌 *Prefijo:* ${config.prefix.join(" | ")}

Selecciona una categoría:`;

  const imagen = global.menuImageBuffer || config.menuImage;

  try {
    await enviarLista(sock, contexto.chatId, {
      texto,
      footer: `${config.botName} • Sistema operativo`,
      titulo: "📋 Menú Principal",
      textoBoton: "Abrir menú",
      imagen,
      mensajeCitado: info,
      secciones: [
        {
          titulo: "🔥 General",
          filas: [
            { titulo: "📌 Menú", id: `${p}menu`, descripcion: "Mostrar este menú" },
            { titulo: "🏓 Ping", id: `${p}ping`, descripcion: "Ver latencia del bot" },
            { titulo: "👥 Ayuda Grupo", id: `${p}ayudagrupo`, descripcion: "Comandos de administración" },
          ],
        },
        {
          titulo: "📥 Descargas",
          filas: [
            { titulo: "🔎 Buscar YouTube", id: `${p}yts`, descripcion: "Buscar videos en YouTube" },
            { titulo: "🎵 Descargar Audio", id: `${p}yta`, descripcion: "Descargar audio de YouTube" },
            { titulo: "🎬 Descargar Video", id: `${p}ytv`, descripcion: "Descargar video de YouTube" },
          ],
        },
        {
          titulo: "👮 Administración",
          filas: [
            { titulo: "🚫 Kick", id: `${p}kick`, descripcion: "Expulsar usuario" },
            { titulo: "⬆️ Promote", id: `${p}promote`, descripcion: "Hacer administrador" },
            { titulo: "⬇️ Demote", id: `${p}demote`, descripcion: "Quitar administrador" },
            { titulo: "🔗 Antilink", id: `${p}antilink`, descripcion: "Activar/desactivar antilink" },
            { titulo: "👋 Welcome", id: `${p}welcome`, descripcion: "Activar/desactivar bienvenida" },
          ],
        },
        {
          titulo: "🛠️ Herramientas",
          filas: [
            { titulo: "📱 Generar QR", id: `${p}qr`, descripcion: "Crear código QR" },
          ],
        },
      ],
    });
  } catch (err) {
    console.error("Error enviando menú:", err.message);

    // Fallback rápido sin imagen
    await sock.sendMessage(contexto.chatId, {
      text: `${texto}\n\n_Escribe el comando directamente_`,
    }, { quoted: info });
  }
}