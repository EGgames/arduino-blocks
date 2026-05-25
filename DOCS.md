# Arduino Blocks — Documentación Técnica

> IDE de programación visual por bloques para Arduino.  
> Stack: **React 18** · **Electron 27** · **Blockly 10** · **Monaco Editor** · **Material UI 5**

---

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Requisitos previos](#2-requisitos-previos)
3. [Instalación y desarrollo](#3-instalación-y-desarrollo)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Arquitectura de la aplicación](#5-arquitectura-de-la-aplicación)
6. [Componentes React](#6-componentes-react)
7. [Sistema de bloques Arduino](#7-sistema-de-bloques-arduino)
8. [Sincronización bidireccional](#8-sincronización-bidireccional)
9. [Integración con Electron](#9-integración-con-electron)
10. [Configuración y ajustes](#10-configuración-y-ajustes)
11. [Temas (claro / oscuro)](#11-temas-claro--oscuro)
12. [Compilación y distribución](#12-compilación-y-distribución)
13. [Extensión: bloques personalizados](#13-extensión-bloques-personalizados)
14. [Referencia de la API pública de componentes](#14-referencia-de-la-api-pública-de-componentes)

---

## 1. Visión general

Arduino Blocks es un entorno de desarrollo integrado (IDE) que permite programar placas Arduino mediante **arrastrar y soltar bloques visuales**, con traducción automática y en tiempo real al código C++ de Arduino.

### Funcionalidades principales

| Función | Descripción |
|---------|-------------|
| Editor de bloques | Workspace Blockly con toolbox categorizado |
| Editor de código | Monaco Editor con sintaxis C++/Arduino y autocompletado |
| Sincronización bidireccional | Bloques ↔ Código se mantienen sincronizados en tiempo real |
| Gestor de librerías | Catálogo de 55+ librerías Arduino con búsqueda y filtro |
| Bloques personalizados | Crear y reusar bloques con código C++ propio (experimental) |
| Subida a placa | Compilación y upload via `arduino-cli` (solo Electron) |
| Configuración | Puerto COM, placa, tema visual, tamaño de fuente |
| Temas | Oscuro / Claro / Sistema (detecta preferencia del OS) |
| Persistencia | Workspace, configuración y bloques personalizados en `localStorage` |

---

## 2. Requisitos previos

### Entorno de desarrollo

| Herramienta | Versión mínima | Notas |
|-------------|---------------|-------|
| Node.js | 18.x | [nodejs.org](https://nodejs.org) |
| npm | 9.x | Incluido con Node |
| arduino-cli | 0.35+ | Para compilar/subir código |

### Instalar arduino-cli

**Windows (winget):**
```powershell
winget install ArduinoSA.CLI
```

**macOS (Homebrew):**
```bash
brew install arduino-cli
```

**Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
```

### Configurar arduino-cli

```bash
# Inicializar y actualizar índice de plataformas
arduino-cli config init
arduino-cli core update-index

# Plataformas más comunes
arduino-cli core install arduino:avr          # Uno, Nano, Mega, Leonardo…
arduino-cli core install arduino:megaavr      # Nano Every
arduino-cli core install arduino:sam          # Due
arduino-cli core install esp32:esp32 \
  --additional-urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
arduino-cli core install esp8266:esp8266 \
  --additional-urls https://arduino.esp8266.com/stable/package_esp8266com_index.json
```

---

## 3. Instalación y desarrollo

```bash
# Clonar repositorio
git clone <repo-url>
cd "Arduino Blocks"

# Instalar dependencias
npm install

# Modo desarrollo — solo navegador (sin Electron)
npm start

# Modo desarrollo — app de escritorio completa
npm run electron-dev

# Compilar React para producción
npm run build

# Empaquetar app de escritorio instalable
npm run electron-build
```

### Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | CRA dev server en `http://localhost:3000` |
| `npm run electron-dev` | React + Electron en paralelo (con `concurrently`) |
| `npm run build` | Build de producción en `build/` |
| `npm run electron-build` | Empaqueta con `electron-builder` → `dist/` |
| `npm test` | Tests con Jest / React Testing Library |

---

## 4. Estructura del proyecto

```
Arduino Blocks/
├── electron/
│   ├── main.js          # Proceso principal Electron (IPC, arduino-cli, filesystem)
│   └── preload.js       # Context bridge — expone window.electronAPI al renderer
│
├── public/
│   └── index.html       # Plantilla HTML base
│
├── src/
│   ├── index.js         # Punto de entrada React
│   ├── index.css        # Estilos globales + overrides de Blockly + temas
│   │
│   ├── blocks/
│   │   ├── arduinoBlocks.js    # Definición de ~30 bloques Arduino personalizados
│   │   ├── arduinoGenerator.js # Generador de código C++ para cada bloque
│   │   └── toolbox.js          # Estructura XML del toolbox de Blockly
│   │
│   ├── components/
│   │   ├── App.jsx             # Raíz: layout, estados globales, resize
│   │   ├── BlockEditor.jsx     # Wrapper del workspace de Blockly
│   │   ├── CodeEditor.jsx      # Monaco Editor con autocompletado Arduino
│   │   ├── CodePreview.jsx     # Vista previa de código (read-only)
│   │   ├── CustomBlocksPanel.jsx # Creador de bloques personalizados
│   │   ├── ErrorBoundary.jsx   # Captura de errores React
│   │   ├── LibraryPanel.jsx    # Gestor de librerías Arduino
│   │   ├── SettingsDialog.jsx  # Drawer de configuración
│   │   └── UploadPanel.jsx     # Compilación y subida a placa
│   │
│   ├── config/
│   │   └── initialWorkspace.js # XML del workspace inicial (setup/loop vacío)
│   │
│   ├── data/
│   │   ├── arduinoLibraries.js # Catálogo de 55+ librerías (nombre, descripción, categoría)
│   │   └── boards.js           # Lista de 10 placas Arduino/ESP con su FQBN
│   │
│   ├── hooks/
│   │   ├── useBidirectionalSync.js # Lógica de sincronización bloques ↔ código
│   │   └── useSettings.js          # Gestión de configuración con localStorage
│   │
│   └── utils/
│       ├── codeParser.js      # Parser de código C++ Arduino → AST simple
│       └── xmlGenerator.js    # AST → XML de Blockly (para sincronización inversa)
│
├── package.json
└── DOCS.md               # Este archivo
```

---

## 5. Arquitectura de la aplicación

```
┌─────────────────────────────────────────────────────────┐
│                        App.jsx                          │
│                                                         │
│  ┌──────────────┐  resize  ┌──────────────────────────┐ │
│  │ BlockEditor  │◄────────►│      CodeEditor           │ │
│  │  (Blockly)   │          │      (Monaco)             │ │
│  └──────┬───────┘          └──────────────────────────┘ │
│         │ onCodeChange              ▲                    │
│         │                          │ onChange            │
│         ▼                          │                    │
│  ┌──────────────────────────────────────────────┐       │
│  │         useBidirectionalSync (hook)          │       │
│  │  bloques→código (inmediato)                  │       │
│  │  código→bloques (debounce 700ms + parser)    │       │
│  └──────────────────────────────────────────────┘       │
│                                                         │
│  Panel inferior (redimensionable):                      │
│  ┌────────────┬─────────────────┬──────────────────┐    │
│  │ UploadPanel│  LibraryPanel   │ CustomBlocksPanel │    │
│  └────────────┴─────────────────┴──────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Flujo de datos principal

```
Usuario edita bloque
       │
       ▼
Blockly workspace.addChangeListener
       │
       ▼
arduinoGenerator.workspaceToCode(ws)  →  código C++
       │
       ▼
handleBlockCodeChange → setCode(newCode)
       │
       ▼
CodeEditor recibe prop `code` → executeEdits (sin disparar onChange)
```

```
Usuario edita texto en Monaco
       │
       ▼
handleChange → handleCodeEditorChange (debounce 700ms)
       │
       ▼
codeParser.parseArduinoCode(code) → AST
       │
       ▼
xmlGenerator.codeToXML(ast) → xmlString
       │
       ▼
blockEditorRef.loadXML(xmlString) → workspace.clear() + domToWorkspace
```

---

## 6. Componentes React

### `App.jsx`

Componente raíz. Gestiona:

- **Layout redimensionable**: panel lateral derecho (Monaco + inferior) con drag horizontal; panel inferior con drag vertical.
- **Estados globales**: `code`, `bottomTab`, `rightWidth`, `bottomPanelHeight`, `snack`, `settingsOpen`.
- **Hook `useSettings`**: tema, fuente, puerto COM, placa.
- **Efecto de tema**: `document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')`.
- **AppBar**: botones Guardar, Abrir, Vista previa, Ayuda, Configuración.

Props de estado clave:

| Estado | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `code` | string | `''` | Código C++ actual |
| `bottomTab` | string | `'libraries'` | Tab activo del panel inferior |
| `rightWidth` | number | `440` | Ancho del panel Monaco en px |
| `bottomPanelHeight` | number | `280` | Alto del panel inferior en px |

---

### `BlockEditor.jsx`

Wrapper del workspace de Blockly. Usa `forwardRef` para exponer métodos imperativa al padre.

**API pública (via `ref`):**

| Método | Firma | Descripción |
|--------|-------|-------------|
| `loadXML` | `(xmlString: string) => void` | Carga un workspace desde XML (no emite cambios) |
| `getXML` | `() => string` | Devuelve el XML actual del workspace |
| `getCode` | `() => string` | Genera y devuelve el código C++ actual |
| `addCustomBlock` | `(id: string) => boolean` | Inserta un bloque personalizado en el workspace |
| `addIncludeBlock` | `(libName: string) => boolean` | Añade un bloque `#include` (evita duplicados) |

**Comportamientos internos:**

- `ResizeObserver` en el contenedor → llama `Blockly.svgResize(workspace)` para evitar áreas blancas al redimensionar.
- Persiste el workspace en `localStorage` con la clave `'arduino-blocks-workspace'`.
- Emite el código generado en cada cambio de bloques relevante (CREATE, DELETE, MOVE, CHANGE, FINISHED_LOADING).

---

### `CodeEditor.jsx`

Monaco Editor configurado para C++/Arduino.

**Props:**

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `code` | string | — | Valor actual del código |
| `onChange` | function | — | Callback cuando el usuario edita |
| `syncStatus` | `'ok'`\|`'error'`\|`'syncing'` | `'ok'` | Indicador de sincronización |
| `fontSize` | number | `13` | Tamaño de fuente en px |
| `colorTheme` | `'dark'`\|`'light'` | `'dark'` | Tema del editor |

**Características:**
- Tema personalizado `arduino-dark` (VS Dark base).
- Autocompletado con 40+ palabras clave de Arduino.
- Actualización externa sin disparar `onChange` (flag `extUpdate.current`).
- `automaticLayout: true` para adaptar el canvas al contenedor.
- Botones en la barra de título: copiar al portapapeles, guardar como `.ino`.

---

### `LibraryPanel.jsx`

Gestor del catálogo de librerías Arduino.

**Props:**

| Prop | Tipo | Descripción |
|------|------|-------------|
| `blockEditorRef` | ref | Para llamar `addIncludeBlock` |
| `activeIncludes` | string[] | Librerías ya incluidas en el código actual |
| `isDark` | boolean | Aplica paleta oscura o clara |

**Funciones:**
- Búsqueda en tiempo real por nombre y descripción.
- Filtro por categoría (13 categorías con colores de acento propios).
- Click → inserta bloque `arduino_include` en el workspace.
- Indica visualmente las librerías ya incluidas (icono ✓ verde).

---

### `UploadPanel.jsx`

Panel de compilación y subida a placa (funcional solo en Electron).

**Props:**

| Prop | Tipo | Descripción |
|------|------|-------------|
| `code` | string | Código a compilar/subir |
| `defaultPort` | string | Puerto COM inicial (desde settings) |
| `defaultBoard` | string | FQBN de la placa inicial (desde settings) |

**Flujo de subida:**
1. Escribe `sketch.ino` en directorio temporal del OS.
2. Invoca `arduino-cli compile --fqbn <fqbn> <dir>` via IPC.
3. Si compila sin errores, invoca `arduino-cli upload -p <port> --fqbn <fqbn> <dir>`.
4. El output en tiempo real se muestra en un diálogo de log.

---

### `CustomBlocksPanel.jsx`

Creador de bloques personalizados (experimental).

- Permite definir un bloque con: etiqueta, código C++ y color.
- Registra el bloque en Blockly en tiempo real (`Blockly.Blocks['custom_<id>']`).
- Persiste los bloques en `localStorage` con la clave `'arduino-blocks-custom'`.
- Botón "Insertar" → llama `blockEditorRef.addCustomBlock(id)`.

---

### `SettingsDialog.jsx`

Drawer lateral derecho de configuración.

**Props:**

| Prop | Tipo | Descripción |
|------|------|-------------|
| `open` | boolean | Visibilidad del drawer |
| `onClose` | function | Callback de cierre |
| `settings` | object | Configuración actual |
| `onSettingsChange` | function | `(patch) => void` para actualizar settings |

**Secciones:**
- **Apariencia**: botones Oscuro / Claro / Sistema; slider de tamaño de fuente (10–20 px).
- **Conexión**: selector de puerto COM con botón de actualizar (Electron); selector de placa usando `BOARDS` de `src/data/boards.js`.

---

## 7. Sistema de bloques Arduino

### Definición de bloques (`src/blocks/arduinoBlocks.js`)

Cada bloque se define con `Blockly.Blocks['tipo'] = { init() { ... } }`.

Bloques incluidos:

| ID del bloque | Descripción |
|---------------|-------------|
| `arduino_setup_loop` | Estructura principal (setup + loop), no movible/borrable |
| `arduino_pin_mode` | `pinMode(pin, modo)` |
| `arduino_digital_write` | `digitalWrite(pin, valor)` |
| `arduino_digital_read` | `digitalRead(pin)` → salida |
| `arduino_analog_write` | `analogWrite(pin, valor)` |
| `arduino_analog_read` | `analogRead(pin)` → salida |
| `arduino_delay` | `delay(ms)` |
| `arduino_delay_microseconds` | `delayMicroseconds(us)` |
| `arduino_millis` | `millis()` → salida |
| `arduino_serial_begin` | `Serial.begin(baud)` |
| `arduino_serial_print` | `Serial.print(valor)` |
| `arduino_serial_println` | `Serial.println(valor)` |
| `arduino_variable_declare` | Declarar variable tipada |
| `arduino_variable_get` | Leer variable → salida |
| `arduino_variable_set` | Asignar variable |
| `arduino_if` | `if / else` |
| `arduino_if_simple` | `if` sin `else` |
| `arduino_for` | Bucle `for` con var, desde, hasta, paso |
| `arduino_while` | Bucle `while` |
| `arduino_map` | `map(v, fromL, fromH, toL, toH)` → salida |
| `arduino_constrain` | `constrain(v, min, max)` → salida |
| `arduino_compare` | Operadores de comparación (`==`, `!=`, `<`, `>`, …) |
| `arduino_logic` | Operadores lógicos (`&&`, `\|\|`) |
| `arduino_not` | Negación lógica |
| `arduino_tone` | `tone(pin, frecuencia)` |
| `arduino_no_tone` | `noTone(pin)` |
| `arduino_include` | `#include <lib.h>` |
| `arduino_comment` | Comentario en el código |
| `custom_<id>` | Bloque personalizado (registrado dinámicamente) |

### Generador de código (`src/blocks/arduinoGenerator.js`)

Usa `arduinoGenerator.forBlock['tipo'] = (block, generator) => { ... }`.

El generador `arduino_setup_loop` produce la estructura completa del sketch:

```cpp
void setup() {
  // bloques del SETUP
}

void loop() {
  // bloques del LOOP
}
```

### Toolbox (`src/blocks/toolbox.js`)

Configuración en formato objeto JS con categorías anidadas. Cada categoría tiene `kind: 'CATEGORY'`, `name`, `colour` y un array de `contents` con `{ kind: 'BLOCK', type: 'nombre_bloque' }`.

---

## 8. Sincronización bidireccional

El hook `useBidirectionalSync` (`src/hooks/useBidirectionalSync.js`) coordina los dos editores.

### Bloques → Código (inmediato)

```
Cambio en workspace Blockly
  → workspace.addChangeListener (en BlockEditor)
  → arduinoGenerator.workspaceToCode(ws)
  → handleBlockCodeChange(newCode)
  → setCode(newCode)                     ← actualiza estado en App
  → CodeEditor recibe nuevo prop `code`
  → executeEdits preservando cursor/selección
```

La flag `fromBlocksRef` evita el ciclo: cuando el código viene de bloques, el `handleChange` de Monaco se ignora.

### Código → Bloques (debounce 700 ms)

```
Usuario escribe en Monaco
  → handleCodeEditorChange(newCode) [debounced 700ms]
  → parseArduinoCode(newCode)   → AST
  → codeToXML(ast)              → xmlString
  → blockEditorRef.loadXML(xmlString)
       → workspace.clear()
       → Blockly.Xml.domToWorkspace(dom, ws)
       → zoomToFit() [tras 80ms]
```

Si el parser falla (código inválido/incompleto), `syncStatus` pasa a `'error'` y los bloques no se actualizan hasta que el código sea parseable nuevamente.

### Estados de sincronización

| Estado | Indicador visual | Significado |
|--------|-----------------|-------------|
| `ok` | 🟢 verde | Bloques y código sincronizados |
| `syncing` | 🔵 azul (girando) | Actualización en curso |
| `error` | 🔴 rojo | Código no parseable como bloques |

---

## 9. Integración con Electron

### Arquitectura de procesos

```
Renderer Process (React)
  └── window.electronAPI.*   (contextBridge)
          │
          │ IPC invoke/on
          ▼
Main Process (Node.js)
  ├── ipcMain.handle('list-ports')
  ├── ipcMain.handle('upload-code')
  ├── ipcMain.handle('compile-code')
  ├── ipcMain.handle('save-file')
  ├── ipcMain.handle('open-file')
  └── ipcMain.handle('install-platform')
```

### `window.electronAPI` (preload.js)

| Método | Descripción |
|--------|-------------|
| `listPorts()` | Lista puertos serie disponibles. Usa `arduino-cli board list`; fallback a `serialport` nativo |
| `uploadCode({ code, port, fqbn })` | Compila y sube el sketch |
| `compileCode({ code, fqbn })` | Solo compila (sin subir) |
| `saveFile({ content, defaultName })` | Abre diálogo "Guardar como…" |
| `openFile()` | Abre diálogo de selección y retorna el contenido del `.ino` |
| `installPlatform({ fqbn })` | Instala la plataforma necesaria con `arduino-cli` |
| `onUploadOutput(cb)` | Suscribe al stream de output del proceso de subida |
| `removeUploadOutput()` | Cancela la suscripción al stream |
| `isElectron` | `true` — permite al renderer detectar el entorno |

### Detección del entorno

```js
const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;
```

Las funcionalidades exclusivas de Electron (subida, listado de puertos, guardar con diálogo nativo) verifican esta constante antes de ejecutarse.

---

## 10. Configuración y ajustes

### Hook `useSettings` (`src/hooks/useSettings.js`)

```js
const [settings, setSettings, isDark] = useSettings();
```

**Objeto `settings`:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `theme` | `'dark'`\|`'light'`\|`'system'` | `'dark'` | Tema visual |
| `fontSize` | number | `13` | Tamaño de fuente Monaco (px) |
| `comPort` | string | `''` | Puerto COM seleccionado |
| `board` | string | `'arduino:avr:uno'` | FQBN de la placa |

- Persistido en `localStorage` con clave `'arduino-blocks-settings'`.
- `isDark` es `true` si `theme === 'dark'` o si `theme === 'system'` y el OS prefiere modo oscuro (`window.matchMedia('(prefers-color-scheme: dark)')`).
- Reactivo al cambio de preferencia del sistema operativo.

### Lista de placas (`src/data/boards.js`)

Exporta `BOARDS`: array de `{ label, fqbn }` usado en `SettingsDialog` y `UploadPanel`.

Placas incluidas: Arduino Uno, Nano, Mega 2560, Leonardo, Pro Mini, Micro, Due, Nano Every, ESP32 Dev Module, ESP8266 NodeMCU.

---

## 11. Temas (claro / oscuro)

El tema se aplica mediante el atributo `data-theme` en el elemento `<html>`:

```js
// En App.jsx
useEffect(() => {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}, [isDark]);
```

### CSS (`src/index.css`)

Los overrides de Blockly para tema oscuro usan el selector `html[data-theme="dark"]`:

```css
html[data-theme="dark"] .blocklyMainBackground { fill: #1a2335 !important; }
html[data-theme="dark"] .blocklyGrid > line    { stroke: rgba(255,255,255,0.06) !important; }
html[data-theme="dark"] .blocklyFlyoutBackground { fill: #232f45 !important; }
```

Para tema claro, los overrides usan `html[data-theme="light"]`.

### Monaco Editor

El tema de Monaco se cambia dinámicamente via `useEffect` en `CodeEditor.jsx`:

```js
useEffect(() => {
  monacoRef.current?.editor.setTheme(colorTheme === 'light' ? 'vs' : 'arduino-dark');
}, [colorTheme]);
```

### Material UI

Los componentes MUI usan colores hardcoded en `sx` props con paletas condicionales basadas en la prop `isDark` (e.g. `LibraryPanel`). No se usa el `ThemeProvider` de MUI para simplificar el código.

---

## 12. Compilación y distribución

### Proceso de build

```bash
npm run electron-build
```

Esto ejecuta:
1. `npm run build` → CRA genera `build/` con los assets optimizados.
2. `electron-builder` empaqueta todo en `dist/`.

### Targets por plataforma

| Plataforma | Formato | Configuración |
|------------|---------|---------------|
| Windows | NSIS installer (`.exe`) | `"win": { "target": "nsis" }` |
| macOS | DMG | `"mac": { "target": "dmg" }` |
| Linux | AppImage | `"linux": { "target": "AppImage" }` |

### Archivos incluidos en el paquete

```json
"files": [
  "build/**/*",
  "electron/**/*",
  "node_modules/**/*"
]
```

> **Nota:** `serialport` es una dependencia nativa. En algunos entornos puede requerir recompilar con `electron-rebuild` si la versión de Node del build difiere de la de Electron.

---

## 13. Extensión: bloques personalizados

### Crear un bloque personalizado

1. Ir al tab **Bloques** en el panel inferior.
2. Escribir una **etiqueta** (nombre visible en el bloque).
3. Escribir el **código C++** que generará el bloque (puede incluir `%1`, `%2`… como placeholders futuros).
4. Seleccionar un **color** para el bloque.
5. Click en **Crear**.

El bloque queda registrado con `id = Date.now().toString(36)` y se guarda en `localStorage`.

### API interna

```js
// Registrar un bloque personalizado (usado por CustomBlocksPanel)
registerCustomBlock({ id, label, code, color });

// Insertar en el workspace
blockEditorRef.current.addCustomBlock(id);
```

`registerCustomBlock` registra tanto `Blockly.Blocks['custom_<id>']` como `arduinoGenerator.forBlock['custom_<id>']`.

---

## 14. Referencia de la API pública de componentes

### `BlockEditor` (ref)

```ts
interface BlockEditorRef {
  loadXML(xmlString: string): void;
  getXML(): string;
  getCode(): string;
  addCustomBlock(id: string): boolean;
  addIncludeBlock(libName: string): boolean;
}
```

### `useSettings`

```ts
function useSettings(): [
  settings: {
    theme: 'dark' | 'light' | 'system';
    fontSize: number;
    comPort: string;
    board: string;
  },
  setSettings: (patch: Partial<settings>) => void,
  isDark: boolean,
]
```

### `useBidirectionalSync`

```ts
function useBidirectionalSync(
  blockEditorRef: React.RefObject<BlockEditorRef>,
  setCode: (code: string) => void,
): {
  syncStatus: 'ok' | 'error' | 'syncing';
  handleBlockCodeChange: (code: string) => void;
  handleCodeEditorChange: (code: string) => void;
}
```

### `window.electronAPI` (contexto Electron)

```ts
interface ElectronAPI {
  isElectron: true;
  listPorts(): Promise<{ success: boolean; ports: { port: string; description: string }[] }>;
  uploadCode(opts: { code: string; port: string; fqbn: string }): Promise<{ success: boolean; error?: string }>;
  compileCode(opts: { code: string; fqbn: string }): Promise<{ success: boolean; error?: string }>;
  saveFile(opts: { content: string; defaultName: string }): Promise<void>;
  openFile(): Promise<{ content: string; filePath: string } | null>;
  installPlatform(opts: { fqbn: string }): Promise<{ success: boolean }>;
  onUploadOutput(cb: (data: string) => void): void;
  removeUploadOutput(): void;
}
```

---

*Generado para Arduino Blocks v1.0.0 — mayo 2026*
