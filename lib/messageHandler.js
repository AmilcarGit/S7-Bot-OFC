import config from "../config.js";
import * as antilink from "../commands/group/antilink.js";
import { cargarComandos } from "./comandos.js";

let comandosCache = null;
async function obtenerComandos() {
  if (!comandosCache) {
    comandosCache = await cargarComandos();
    console.log(`📦 Comandos cargados (${Object.keys(comandosCache).length}): ${Object.keys(comandosCache).sort().join(", ")}`);
  }
  return comandosCache;
}

function extraerTexto(mensaje) {
  return (
    mensaje.conversation ||
    mensaje.extendedTextMessage?.text ||
    mensaje.imageMessage?.caption ||
    mensaje.videoMessage?.caption ||
    ""
  );
}

async function extraerCandidatosId(sock, info, esGrupo) {
  const candidatos = new Set();

  const principal = esGrupo ? info.key.participant : info.key.remoteJid;
  if (principal) {
    candidatos.add(principal.split("@")[0]);

    if (principal.endsWith("@lid") && typeof sock.getPNForLID === "function") {
      try {
        const real = await sock.getPNForLID(principal);
        if (real) candidatos.add(real.split("@")[0]);
      } catch (err) {
        console.error("No se pudo resolver @lid → número real:", err.message);
      }
    }
  }

  const alterno = esGrupo
    ? info.key.participantAlt || info.key.participantPn
    : info.key.remoteJidAlt || info.key.senderPn;
  if (alterno) candidatos.add(alterno.split("@")[0]);

  return [...candidatos];
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

  const comandos = await obtenerComandos();
  const comando = comandos[nombreComando];
  if (!comando) return;

  const idsRemitente = await extraerCandidatosId(sock, info, esGrupo);
  const contexto = {
    chatId,
    esGrupo,
    remitente,
    idsRemitente,
    esOwner: idsRemitente.some((id) => config.owner.includes(id)),
  };

  await comando.ejecutar(sock, info, args, contexto);
}