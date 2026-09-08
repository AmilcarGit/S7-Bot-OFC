import config from "../config.js";
import * as menu from "../commands/general/menu.js";
import * as kick from "../commands/group/kick.js";
import * as promote from "../commands/group/promote.js";
import * as demote from "../commands/group/demote.js";
import * as antilink from "../commands/group/antilink.js";

// Registro simple de comandos: nombre -> módulo con función ejecutar()
const comandos = {
  menu: menu,
  ayuda: menu,
  kick: kick,
  ban: kick,
  promote: promote,
  demote: demote,
  antilink: antilink,
};

function extraerTexto(mensaje) {
  return (
    mensaje.conversation ||
    mensaje.extendedTextMessage?.text ||
    mensaje.imageMessage?.caption ||
    mensaje.videoMessage?.caption ||
    ""
  );
}

export async function handleMessage(sock, m) {
  const info = m.messages?.[0];
  if (!info || !info.message || info.key.fromMe) return;

  // Desenvolver mensajes efímeros / view once (recomendado por ultra-baileys)
  const contenido = info.message.ephemeralMessage?.message || info.message.viewOnceMessage?.message || info.message;

  const chatId = info.key.remoteJid;
  const esGrupo = chatId.endsWith("@g.us");
  const remitente = esGrupo ? info.key.participant : chatId;

  const cuerpo = extraerTexto(contenido);

  // Respuestas de botones nativos (ultra-baileys)
  const idBoton =
    contenido.buttonsResponseMessage?.selectedButtonId ||
    contenido.listResponseMessage?.singleSelectReply?.selectedRowId;

  const textoComando = cuerpo || idBoton || "";
  if (!textoComando) return;

  const prefijoUsado = config.prefix.find((p) => textoComando.startsWith(p));
  if (!prefijoUsado) {
    if (esGrupo) await antilink.verificar(sock, info, textoComando);
    return;
  }

  const partes = textoComando.slice(prefijoUsado.length).trim().split(/\s+/);
  const nombreComando = partes.shift().toLowerCase();
  const args = partes;

  const comando = comandos[nombreComando];
  if (!comando) return;

  const contexto = {
    chatId,
    esGrupo,
    remitente,
    esOwner: config.owner.includes((remitente || "").split("@")[0]),
  };

  await comando.ejecutar(sock, info, args, contexto);
}
