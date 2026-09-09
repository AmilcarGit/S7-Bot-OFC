import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARPETA_COMANDOS = path.join(__dirname, "../commands");

function listarArchivosJs(dir) {
  let resultados = [];
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const rutaCompleta = path.join(dir, entrada.name);
    if (entrada.isDirectory()) {
      resultados = resultados.concat(listarArchivosJs(rutaCompleta));
    } else if (entrada.isFile() && entrada.name.endsWith(".js")) {
      resultados.push(rutaCompleta);
    }
  }
  return resultados;
}

export async function cargarComandos() {
  const comandos = {};
  const archivos = listarArchivosJs(CARPETA_COMANDOS);

  for (const archivo of archivos) {
    try {
      const modulo = await import(pathToFileURL(archivo).href);

      if (typeof modulo.ejecutar !== "function") {
        console.log(`⚠️  ${path.relative(CARPETA_COMANDOS, archivo)} no exporta "ejecutar", se omite.`);
        continue;
      }

      const nombrePrincipal = path.basename(archivo, ".js").toLowerCase();
      const nombres = new Set([nombrePrincipal]);

      if (Array.isArray(modulo.alias)) {
        for (const a of modulo.alias) nombres.add(String(a).toLowerCase());
      }

      for (const nombre of nombres) {
        comandos[nombre] = modulo;
      }
    } catch (err) {
      console.error(`❌ Error cargando el comando "${archivo}":`, err.message);
    }
  }

  return comandos;
}