const MAX_BOTONES = 3;

export async function enviarBotones(sock, chat, opciones = {}) {
  const { texto, footer, botones, mensajeCitado, menciones } = opciones;

  if (!texto) throw new Error('enviarBotones requiere "texto"');
  if (!Array.isArray(botones) || !botones.length) {
    throw new Error('enviarBotones requiere al menos un botón en "botones"');
  }
  if (botones.length > MAX_BOTONES) {
    console.log(`Aviso: WhatsApp solo muestra hasta ${MAX_BOTONES} botones, se recortó la lista.`);
  }

  const botonesFormateados = botones.slice(0, MAX_BOTONES).map((b, i) => {
    if (!b?.id) throw new Error(`El botón en la posición ${i} no tiene "id"`);
    return { text: b.texto || "Opción", id: b.id };
  });

  return sock.sendMessage(
    chat,
    {
      text: texto,
      footer,
      buttons: botonesFormateados,
      ...(menciones ? { mentions: menciones } : {}),
    },
    mensajeCitado ? { quoted: mensajeCitado } : {}
  );
}

export async function enviarLista(sock, chat, opciones = {}) {
  const { texto, footer, titulo, textoBoton, secciones, mensajeCitado, menciones, imagen } = opciones;

  if (!texto) throw new Error('enviarLista requiere "texto"');
  if (!Array.isArray(secciones) || !secciones.length) {
    throw new Error('enviarLista requiere al menos una sección en "secciones"');
  }

  const seccionesFormateadas = secciones.map((s, i) => {
    const filas = Array.isArray(s.filas) ? s.filas : [];
    if (!filas.length) throw new Error(`La sección en la posición ${i} no tiene "filas"`);

    return {
      title: s.titulo || "",
      rows: filas.map((f, j) => {
        if (!f?.id) throw new Error(`La fila ${j} de la sección ${i} no tiene "id"`);
        return {
          title: f.titulo || "Opción",
          rowId: f.id,
          description: f.descripcion || "",
        };
      }),
    };
  });

  const contenidoBase = {
    footer,
    title: titulo,
    buttonText: textoBoton || "Ver opciones",
    sections: seccionesFormateadas,
    ...(menciones ? { mentions: menciones } : {}),
  };

  const contenido = imagen
    ? { ...contenidoBase, image: Buffer.isBuffer(imagen) ? imagen : { url: imagen }, caption: texto }
    : { ...contenidoBase, text: texto };

  return sock.sendMessage(chat, contenido, mensajeCitado ? { quoted: mensajeCitado } : {});
}