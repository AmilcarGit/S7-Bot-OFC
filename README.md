# S7-Bot-OFC

Bot oficial de WhatsApp, base propia desde cero, con vinculación por **código de 8 dígitos** (sin QR), administración de grupos, antilink, botones nativos y respuestas rápidas.

Repositorio: https://github.com/AmilcarGit/S7-Bot-OFC

Construido sobre **[ultra-baileys](https://github.com/russellxz/ultra-baileys)**, un fork optimizado de Baileys con:
- Botones nativos y listas desplegables que sí se renderizan
- Menos latencia (cache de dispositivos y de claves Signal más duradero)
- Consola limpia (sin spam de `libsignal`)
- Keep-alive más rápido para detectar caídas de conexión

> ⚠️ Este proyecto usa `"type": "module"` (ESM). Todos los archivos usan `import`/`export`, no `require`.

## 🚀 Instalación en Termux

```bash
# 1. Actualizar paquetes
pkg update -y && pkg upgrade -y

# 2. Instalar dependencias del sistema
pkg install git nodejs-lts -y

# 3. Clonar el repositorio
git clone https://github.com/AmilcarGit/S7-Bot-OFC.git
cd S7-Bot-OFC

# 4. Instalar dependencias de Node
npm install

# 5. Iniciar el bot
npm start
```

Al iniciar, si `config.js` tiene `phoneNumber` vacío, la consola te pedirá el número del bot (con código de país, sin "+", ej: `5219991234567`). Luego se mostrará un **código de 8 dígitos**.

En tu WhatsApp:
1. Ajustes ⚙️ → Dispositivos vinculados
2. Vincular un dispositivo → Vincular con número de teléfono
3. Ingresa el código de 8 dígitos que apareció en Termux

## 📂 Estructura del proyecto

```
S7-Bot-OFC/
├── index.js                 # Conexión principal y vinculación
├── config.js                # Configuración (prefijo, owner, imagen del menú)
├── lib/
│   ├── messageHandler.js    # Enrutador central de comandos
│   └── groupHandler.js      # Eventos de grupo (bienvenida/salida)
├── commands/
│   ├── general/menu.js      # Menú con imagen
│   └── group/                # kick, promote, demote, antilink
└── session/                  # Credenciales de la sesión (se genera solo)
```

## ⚙️ Mantener el bot corriendo en segundo plano (Termux)

```bash
pkg install screen -y
screen -S s7bot
npm start
# Ctrl + A, luego D para salir sin cerrar el bot
# Para volver: screen -r s7bot
```

## 🛠️ Personalización

- Cambia el nombre, dueño e imagen del menú en `config.js`.
- Agrega nuevos comandos creando un archivo en `commands/` y registrándolo en `lib/messageHandler.js`.

## ⚠️ Nota importante

Este proyecto usa `ultra-baileys` (fork de Baileys instalado directamente desde GitHub), que internamente utiliza `libsignal` para el cifrado extremo a extremo del protocolo de WhatsApp. Úsalo conforme a los Términos de Servicio de WhatsApp: evita el envío masivo no solicitado (spam), ya que puede causar el baneo del número.

Si `npm install` falla al instalar `baileys` desde GitHub, asegúrate de tener `git` instalado en Termux (`pkg install git`).
