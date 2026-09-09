import config from "../config.js";
import * as menu from "../commands/general/menu.js";
import * as ping from "../commands/general/ping.js";
import * as ayudagrupo from "../commands/general/ayudagrupo.js";
import * as kick from "../commands/group/kick.js";
import * as promote from "../commands/group/promote.js";
import * as demote from "../commands/group/demote.js";
import * as antilink from "../commands/group/antilink.js";
import * as welcome from "../commands/group/welcome.js";
import * as qr from "../commands/tools/qr.js";
import * as yts from "../commands/descargas/yts.js";
import * as ytsver from "../commands/descargas/ytsver.js";
import * as yturl from "../commands/descargas/yturl.js";
import * as yta from "../commands/descargas/yta.js";
import * as ytv from "../commands/descargas/ytv.js";
import * as update from "../commands/owner/update.js";

const comandos = {
  menu: menu,
  ayuda: menu,
  ping: ping,
  ayudagrupo: ayudagrupo,
  kick: kick,
  ban: kick,
  promote: promote,
  demote: demote,
  antilink: antilink,
  welcome: welcome,
  qr: qr,
  yts: yts,
  ytsearch: yts,
  ytsver: ytsver,
  yturl: yturl,
  yta: yta,
  ytaudio: yta,
  ytv: ytv,
  update: update,
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

function extraerRespuestaBoton(mensaje) {
  if (mensaje.buttonsResponseMessage?.selectedButtonId) {
    return mensaje.buttonsResponseMessage.selectedButtonId;
  }
  if (mensaje.listResponseMessage?.singleSelectReply?.selectedRowId) {
    return mensaje.listResponseMessage.singleSelectReply.selectedRowId;
  }
  const paramsJson = mensaje.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
  if (paramsJson) {
    try {
      const parsed = JSON.parse(paramsJson);
      if (parsed?.id) return parsed.id;
    } catch (err) {
      console.error("No se pudo parsear la respuesta del botón nativo:", err.message);
    }
  }
  return null;
}

export async function handleMessage(sock, m) {
  const info = m.messages?.[0];
  if (!info || !info.message || info.key.fromMe) return;

  const contenido = info.message.ephemeralMessage?.message || info.message.viewOnceMessage?.message || info.message;

  const chatId = info.key.remoteJid;
  const esGrupo = chatId.endsWith("@g.us");
  const remitente = esGrupo ? info.key.participant : chatId;

  const cuerpo = extraerTexto(contenido);
  const idBoton = extraerRespuestaBoton(contenido);

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