import config from "../../config.js";

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

🔥 *GENERAL*
┃ ${p}menu — Ver este menú
┃ ${p}ping — Ver latencia
┃ ${p}ayudagrupo — Ayuda de grupo

📥 *DESCARGAS*
┃ ${p}yts — Buscar en YouTube
┃ ${p}yta — Descargar audio
┃ ${p}ytv — Descargar video

👮 *ADMINISTRACIÓN*
┃ ${p}kick @usuario — Expulsar
┃ ${p}promote @usuario — Hacer admin
┃ ${p}demote @usuario — Quitar admin
┃ ${p}antilink on/off — Antilink
┃ ${p}welcome on/off — Bienvenida

🛠️ *HERRAMIENTAS*
┃ ${p}qr — Generar código QR

_Escribe cualquier comando, ejemplo: ${p}ping_`;

  try {
    // Usa la imagen en caché si existe, si no usa la URL
    const imagen = global.menuImageBuffer
      ? global.menuImageBuffer
      : { url: config.menuImage };

    await sock.sendMessage(
      contexto.chatId,
      {
        image: imagen,
        caption: texto,
      },
      { quoted: info }
    );
  } catch (err) {
    console.error("Error enviando menú:", err.message);
    // Si falla la imagen, manda solo texto
    await sock.sendMessage(contexto.chatId, { text: texto }, { quoted: info });
  }
}