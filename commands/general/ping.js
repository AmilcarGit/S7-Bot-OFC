export async function ejecutar(sock, info, args, contexto) {
  const inicio = Date.now();
  await sock.sendMessage(contexto.chatId, { text: "🏓 Calculando..." }, { quoted: info });
  const ms = Date.now() - inicio;
  await sock.sendMessage(contexto.chatId, { text: `🏓 *Pong!*\n⏱️ ${ms}ms de respuesta` });
}