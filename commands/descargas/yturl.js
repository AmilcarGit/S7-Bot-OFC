export async function ejecutar(sock, info, args, contexto) {
  const videoId = args[0];

  if (!videoId) {
    return sock.sendMessage(contexto.chatId, { text: "❌ No se encontró el ID del video." }, { quoted: info });
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  await sock.sendMessage(contexto.chatId, { text: `🔗 *Enlace de YouTube*\n\n${url}` }, { quoted: info });
}