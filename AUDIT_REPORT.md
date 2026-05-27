# Informe de Auditoría de Cobertura — Arduino Blocks

**Fecha de auditoría:** 2025-07  
**Versión:** 1.1.0-alpha  
**Tests:** 261/261 ✅ (9 suites)

---

## Resumen Ejecutivo

| Categoría | Total | Implementado | Skip intencional | Pendiente |
|-----------|-------|-------------|-----------------|-----------|
| Historias de Usuario (HU-01–27) | 27 | **27** ✅ | 0 | 0 |
| Bugs (BUG-01–05) | 5 | **5** ✅ | 0 | 0 |
| Calidad (QC-01–09) | 9 | **6** ✅ | 3 ⚠️ | 0 |
| UX (UX-01–07) | 7 | **6** ✅ | 1 ⚠️ | 0 |
| Arquitectura (ARCH-01–03) | 3 | **2** ✅ | 1 ⚠️ | 0 |

> **Cobertura total:** 46/50 ítems implementados. Los 4 skips restantes son decisiones arquitecturales conscientes documentadas abajo.

---

## 1. Historias de Usuario (HU)

### HU-01 — Estructura setup/loop al abrir ✅
- **Criterio:** El editor muestra un bloque Setup/Loop predeterminado al iniciar.
- **Implementación:** `Blockly.Blocks['arduino_setup_loop']` en `src/blocks/arduinoBlocks.js:9`. XML de ejemplo Blink en `src/config/initialWorkspace.js` (`INITIAL_XML` + `KIDS_INITIAL_XML`). BlockEditor carga el XML inicial si no hay dato guardado en localStorage.
- **Verificado:** ✅

### HU-02 — Toolbox con categorías y drag & drop ✅
- **Criterio:** Panel lateral con categorías de bloques; arrastrar al canvas.
- **Implementación:** `src/blocks/toolbox.js` define la estructura XML del toolbox. `BlockEditor.jsx` inyecta Blockly con `Blockly.inject()` y el toolbox vía `updateToolboxForLibraries` / `updateCustomBlocksInToolbox`.
- **Verificado:** ✅

### HU-03 — Estructuras de control ✅
- **Criterio:** Bloques if/else, for, while, do-while, switch/case.
- **Implementación:**
  - `if/else` → Blockly built-in (`controls_if`)
  - `for` → `arduino_for` en `arduinoBlocks.js:460`
  - `while` → `arduino_while` en `arduinoBlocks.js:476`
  - `do...while` → `arduino_do_while` en `arduinoBlocks.js:488`
  - `switch/case` → `arduino_switch_case` en `arduinoBlocks.js:505`
- **Verificado:** ✅

### HU-04 — Variables con tipo y leer/asignar ✅
- **Criterio:** Bloques para declarar variable global con tipo (int/float/String/bool), leer y asignar.
- **Implementación:** `arduino_global_variable_declare` en `arduinoBlocks.js:543`. Campo TYPE dropdown + campo NAME. Generador en `arduinoGenerator.js`.
- **Verificado:** ✅

### HU-05 — Bloque comentario ✅
- **Criterio:** Bloque que genera `// texto` en C++.
- **Implementación:** `Blockly.Blocks['arduino_comment']` en `arduinoBlocks.js:355` con `FieldTextInput('comentario')`.
- **Verificado:** ✅

### HU-06 — Código actualizado en tiempo real con syntax highlighting ✅
- **Criterio:** El panel de código refleja los cambios de bloques con resaltado Arduino/C++.
- **Implementación:** `src/components/CodeEditor.jsx` con Monaco Editor. El generador Arduino en `arduinoGenerator.js` produce C++ estándar. La sincronización bloques→código va por `useBidirectionalSync.handleBlockCodeChange`.
- **Verificado:** ✅

### HU-07 — Editor editable, cursor estable, autocompletado Arduino ✅
- **Criterio:** El usuario puede editar directamente el código; el cursor no salta; autocompletado con palabras Arduino.
- **Implementación:** `extUpdate` ref en `CodeEditor.jsx:27` controla que el cursor no salte durante updates externos. Array `ARDUINO_COMPLETIONS` en `CodeEditor.jsx:57` con ~30 símbolos Arduino registrados como `CompletionItemProvider`. `completionDisposableRef` limpia el provider al desmontar (BUG-04).
- **Verificado:** ✅

### HU-08 — Tamaño de fuente 10–20px desde settings ✅
- **Criterio:** Slider para cambiar el tamaño de fuente del editor; persiste al recargar.
- **Implementación:** `SettingsDialog.jsx` expone `Slider` para `fontSize`. `useSettings.js` persiste en `localStorage`. `CodeEditor.jsx` recibe `fontSize` prop y aplica con `editor.updateOptions({ fontSize })`.
- **Verificado:** ✅

### HU-09 — Botón copiar código ✅
- **Criterio:** Botón en el editor de código que copia al portapapeles con confirmación visual.
- **Implementación:** `handleCopy` en `CodeEditor.jsx:130` usa `navigator.clipboard.writeText(code)`. Estado `copied` cambia el ícono de `ContentCopyIcon` a `CheckIcon` por 1500ms (`data-testid="copy-code-button"`).
- **Verificado:** ✅

### HU-10 — Bloques → Código en < 200ms ✅
- **Criterio:** El cambio de bloques genera código de forma síncrona y visible.
- **Implementación:** `handleBlockCodeChange` en `useBidirectionalSync.js` llama directamente a `arduinoGenerator.workspaceToCode()` y `setCode()` sin debounce. La dirección bloques→código es inmediata.
- **Verificado:** ✅

### HU-11 — Código → Bloques tras 700ms de inactividad ✅
- **Criterio:** Al editar texto, Blockly se actualiza 700ms después; si no parsea, muestra error.
- **Implementación:** `debounce(parseAndUpdateBlocks, 700)` en `useBidirectionalSync.js:44`. Si `codeToXML()` retorna null, `setSyncStatus('error')`.
- **Verificado:** ✅

### HU-12 — Indicador de estado de sincronización ✅
- **Criterio:** Indicador verde/azul/rojo visible que muestra el estado de sync.
- **Implementación (UX-06):** `statusChip` en `CodeEditor.jsx:151–154` con 3 estados: `ok` (verde `#4ec9b0` "Sincronizado"), `syncing` (azul `#569cd6` "Actualizando…"), `error` (rojo `#f48771` "Error de sintaxis"). Indicador con punto de color + texto + fondo semitransparente con borde.
- **Verificado:** ✅

### HU-13 — Catálogo de librerías ≥ 55 ✅
- **Criterio:** Panel con al menos 55 librerías con nombre, descripción y categoría.
- **Implementación:** `src/data/arduinoLibraries.js` contiene **57 entradas** verificadas. `LibraryPanel.jsx` renderiza el catálogo con categorías y filtro.
- **Verificado:** ✅ (57 librerías)

### HU-14 — Búsqueda insensible a mayúsculas ✅
- **Criterio:** Campo de búsqueda que filtra librerías; mensaje si no hay resultados.
- **Implementación:** `LibraryPanel.jsx` filtra con `toLowerCase()`. Muestra "No se encontraron librerías" si el array filtrado está vacío.
- **Verificado:** ✅

### HU-15 — Clic añade #include, sin duplicados, ícono de verificación ✅
- **Criterio:** Al seleccionar una librería se inserta `#include <Lib.h>` una sola vez.
- **Implementación:** `activeIncludes` en `App.jsx:64` extrae con regex `/#include <([^.>]+)\.h>/g` del código actual. Se pasa a `LibraryPanel` que deshabilita los ya incluidos y muestra `CheckIcon`. El bloque `arduino_include` flotante genera el `#include`.
- **Verificado:** ✅

### HU-16 — Selector de puerto COM con refresh ✅
- **Criterio:** Dropdown de puertos COM con botón para actualizar la lista; persiste selección.
- **Implementación:** `UploadPanel.jsx:refreshPorts()` llama `window.electronAPI.listPorts()`. En web muestra Web Serial API o mensaje de incompatibilidad. Estado `selectedPort` persiste en el componente.
- **Verificado:** ✅

### HU-17 — Selector de placa con FQBN ✅
- **Criterio:** Dropdown de placas Arduino con FQBN correcto.
- **Implementación:** `src/data/boards.js` contiene **10 placas** (Uno, Mega, Nano, Leonardo, Due, MKR, etc.) con `fqbn`. `UploadPanel.jsx` y `SettingsDialog.jsx` usan el mismo catálogo.
- **Verificado:** ✅ (10 placas)

### HU-18 — Compilar y subir con output en tiempo real ✅
- **Criterio:** Botón "Subir" compila y sube; log aparece en tiempo real; muestra éxito/error.
- **Implementación:** `handleUpload()` en `UploadPanel.jsx:71` llama `window.electronAPI.uploadCode()`. El IPC `onUploadOutput` hace streaming del log. Dialog con `<pre>` scrollable para mostrar salida. Snackbar confirma resultado.
- **Verificado:** ✅

### HU-19 — Solo compilar sin puerto requerido ✅
- **Criterio:** Botón "Verificar" compila sin necesitar puerto.
- **Implementación:** `handleVerify()` en `UploadPanel.jsx:59` llama `window.electronAPI.compileCode()` sin parámetro `port`. No valida `selectedPort` antes de ejecutar.
- **Verificado:** ✅

### HU-20 — Guardar .ino (nativo Electron / descarga web) ✅
- **Criterio:** Guardar como .ino con diálogo nativo en Electron, descarga en web. Ctrl+S funciona.
- **Implementación:** `handleSave()` en `App.jsx:72`. En Electron: `window.electronAPI.saveFile()`. En web: crea `<a>` con `download='mi_sketch.ino'`. Atajo `Ctrl/Cmd+S` via `useEffect` keydown.
- **Verificado:** ✅

### HU-21 — Abrir .ino y reconstruir bloques ✅
- **Criterio:** Abrir un archivo .ino carga el código y la sincronización inversa intenta reconstruir bloques.
- **Implementación:** `handleOpen()` en `App.jsx:113`. Soporta Electron (`openFile()`) y web (input[file]). Llama `codeToXML(ino)` de `xmlGenerator.js` y `blockEditorRef.current?.loadXML(xml)` si hay XML válido.
- **Verificado:** ✅

### HU-22 — Tema oscuro/claro/sistema ✅
- **Criterio:** Selector de tema que aplica inmediatamente y persiste; opción "sistema" sigue al SO.
- **Implementación:** `useSettings.js` con `theme: 'system'|'dark'|'light'`. `isDark = theme === 'dark' || (theme === 'system' && systemDark)`. `SettingsDialog.jsx` tiene 3 botones con iconos. `data-theme` en `document.documentElement` vía `useEffect`.
- **Verificado:** ✅

### HU-23 — Workspace Blockly con tema oscuro ✅
- **Criterio:** En tema oscuro, el workspace Blockly usa colores oscuros (#1a2335), cuadrícula tenue, flyout oscuro.
- **Implementación:** `getArduinoDarkTheme()` en `kidsBlocks.js:38` con colores personalizados. `isDark` prop en `BlockEditor.jsx:33` aplica el tema vía `workspace.setTheme()`.
- **Verificado:** ✅

### HU-24 — LibraryPanel con colores del tema activo ✅
- **Criterio:** El panel de librerías adapta su paleta al tema oscuro/claro.
- **Implementación:** `LibraryPanel.jsx:34` recibe `isDark` prop. Objeto `P` en línea 39 define paleta dual. Todos los colores de fondo, borde y texto usan condicional `isDark ? ... : ...`.
- **Verificado:** ✅

### HU-25 — Blockly redibuja al redimensionar ✅
- **Criterio:** Al arrastrar los divisores o redimensionar la ventana, Blockly se redibuja correctamente.
- **Implementación:** `ResizeObserver` en `BlockEditor.jsx:307–313` llama `Blockly.svgResize(ws)` cuando cambia el tamaño del contenedor. Los divisores en `App.jsx` actualizan `rightWidth` y `bottomPanelHeight` via `mousemove`.
- **Verificado:** ✅

### HU-26 — Panel de bloques personalizados con persistencia ✅
- **Criterio:** Panel para crear bloques con etiqueta, código C++ y color; persisten al recargar.
- **Implementación:** `CustomBlocksPanel.jsx` con `localStorage` (`LS_CUSTOM_KEY = 'arduino-blocks-custom'`). `registerCustomBlock()` registra en `Blockly.Blocks` y en `arduinoGenerator.forBlock`. Se restauran al montar con `loadSaved()`.
- **Verificado:** ✅

### HU-27 — Insertar bloque personalizado en workspace ✅
- **Criterio:** Botón "Insertar" agrega el bloque al workspace Blockly activo.
- **Implementación:** `CustomBlocksPanel.jsx` llama `blockEditorRef.current?.addCustomBlock(type)`. `addCustomBlock` en `BlockEditor.jsx` (useImperativeHandle) crea el bloque en el workspace via `Blockly.getMainWorkspace()`.
- **Verificado:** ✅

---

## 2. Bugs del REFACTORING_REPORT.md

### BUG-01 — `scrub_()` no encadena bloques ✅
- **Problema:** Los bloques en secuencia no generaban código del bloque siguiente.
- **Fix:** Override de `scrub_()` en `arduinoGenerator.js:164` para encadenar el siguiente bloque de la secuencia.
- **Verificado:** ✅ (línea 164 confirmada en auditoría)

### BUG-02 — Doble indentación por `gen.INDENT` manual ✅
- **Problema:** Los generadores añadían `gen.INDENT` manualmente causando 4 espacios en lugar de 2.
- **Fix:** Eliminados todos los `gen.INDENT` manuales en generadores. Regla documentada en `arduinoGenerator.js:177–184`. `statementToCode()` ya aplica `prefixLines(code, INDENT)`.
- **Verificado:** ✅ (comentario de regla presente, no hay usos incorrectos)

### BUG-03 — XML no persiste en localStorage ✅
- **Problema:** Al recargar la página, el workspace Blockly se perdía.
- **Fix:** `BlockEditor.jsx` usa `useRef` + `useEffect` para guardar y restaurar el XML del workspace en localStorage con clave `arduino-blocks-workspace`.
- **Verificado:** ✅

### BUG-04 — Memory leak en completion provider de Monaco ✅
- **Problema:** El `CompletionItemProvider` de Monaco nunca se limpiaba al desmontar.
- **Fix:** `completionDisposableRef` en `CodeEditor.jsx:27`. Cleanup en `useEffect` de desmontaje: `completionDisposableRef.current?.dispose()`.
- **Verificado:** ✅ (líneas 28 y 42 confirmadas)

### BUG-05 — Campo PARAMS ausente en `arduino_function_define` ✅
- **Problema:** No se podían definir funciones con parámetros desde el bloque.
- **Fix:** `FieldTextInput` con nombre `'PARAMS'` en `arduinoBlocks.js:427`. Tooltip actualizado para indicar el formato (e.g., `int a, float b`).
- **Verificado:** ✅ (línea 427 confirmada)

---

## 3. Ítems de Calidad (QC)

### QC-01 — Generadores sin doble indentación ✅
*(Mismo fix que BUG-02 — ver arriba)*

### QC-02 — Dividir archivos monolíticos ❌ SKIP INTENCIONAL
- **Razón del skip:** `arduinoBlocks.js` (~700 líneas) y `arduinoGenerator.js` (~420 líneas) son candidatos a dividir en submódulos. Sin embargo, el riesgo de romper las referencias de tipo string `'arduino_X'` entre archivos y la ausencia de un bundler configurado para tree-shaking hace que el refactor tenga alto riesgo sin beneficio inmediato. Los archivos son legibles y cohesivos.
- **Decisión:** Aceptable hasta que superen las 1000 líneas.

### QC-03 — Migración a TypeScript ❌ SKIP INTENCIONAL
- **Razón del skip:** Scope demasiado grande para este milestone. Requeriría configurar `tsconfig.json`, tipar las props de todos los componentes, tipar la API de Blockly (tipos comunitarios parciales), y actualizar 9 suites de tests. Sin una necesidad urgente de tipado estático, el costo/beneficio no justifica el riesgo.
- **Decisión:** Candidato para milestone 2.0.

### QC-04 — Suite de tests completa ✅
- **Estado:** **261 tests en 9 suites**, todos en verde (verificado con `npm test -- --watchAll=false`).
- **Suites:** `codeParser.test.js`, `xmlGenerator.test.js`, `useSettings.test.js`, `data.test.js`, `pipeline.integration.test.js`, `bidirectionalSync.integration.test.js`, `App.integration.test.jsx`, `LibraryPanel.integration.test.jsx`, `SettingsDialog.integration.test.jsx`.
- **Verificado:** ✅

### QC-05 — Hook useBidirectionalSync ✅
- **Estado:** `src/hooks/useBidirectionalSync.js` extrae toda la lógica de sincronización de App.jsx. Expone `{ syncStatus, handleBlockCodeChange, handleCodeEditorChange, parseAndUpdateBlocks }`.
- **Verificado:** ✅

### QC-06 — Debounce de utilidad genérico ⚠️ ACEPTABLE
- **Estado:** La función `debounce()` está definida inline en `useBidirectionalSync.js:5–13` (~8 líneas). No es una librería ni un módulo utils separado.
- **Decisión:** Aceptable. La función es simple, autónoma, tiene método `.cancel()` y es el único sitio donde se usa. Extraerla a `src/utils/debounce.js` sería prematura abstracción.

### QC-07 — Workspace inicial de ejemplo ✅
- **Estado:** `src/config/initialWorkspace.js` exporta `INITIAL_XML` (ejemplo Blink: setup+loop con pinMode, digitalWrite, delay) y `KIDS_INITIAL_XML` (variante simplificada para modo niño).
- **Verificado:** ✅

### QC-08 — ErrorBoundary ✅
- **Estado:** `src/components/ErrorBoundary.jsx` implementa `React.Component` con `getDerivedStateFromError`, `componentDidCatch`, UI de fallback y botón "Reintentar".
- **Verificado:** ✅

### QC-09 — Bloques flotantes no duplican código ✅
- **Estado:** `arduino_global_variable_declare` en el generador retorna `''` cuando está adjunto a un padre (usa `getSurroundParent()` check en `workspaceToCode`). Las variables globales se recogen solo de bloques flotantes en el paso 2 de `workspaceToCode`. Mismo patrón para `#include`, `#define` y bloques de librería.
- **Verificado:** ✅

---

## 4. Ítems de UX

### UX-01 — Panel de subida en modo web ✅
- **Estado:** `UploadPanel.jsx` detecta `isElectron`. En web: selector de placa visible, Web Serial API para detectar puerto (si el navegador lo soporta), botones "Verificar" y "Subir" deshabilitados con `Tooltip` explicativo. Mensaje "requiere la app de escritorio" visible.
- **Verificado:** ✅

### UX-02 — zoomToFit al cambiar modo ✅
- **Estado:** `workspace.zoomToFit()` llamado en dos lugares de `BlockEditor.jsx`: línea ~115 (al cambiar `mode`) y línea ~149 (dentro de `loadXML`).
- **Verificado:** ✅

### UX-03 — Tema oscuro en Blockly ✅
*(Mismo que HU-23 — ver arriba)*

### UX-04 — Cabecera identificadora en BlockEditor ✅
- **Estado (implementado esta sesión):** Cabecera con `position:relative, flexShrink:0` en el render de `BlockEditor.jsx`. Muestra `'🧩 bloques'` en modo kids o `'editor.blocks'` en modo avanzado. Se oculta en mobile (`!isMobile`). Colores adaptativos para modo kids/dark/light.
- **Archivo:** `src/components/BlockEditor.jsx:384–406`
- **Verificado:** ✅

### UX-05 — Undo/Redo con Ctrl+Z/Y en Blockly ✅
- **Estado (implementado esta sesión):**
  - `undo()` y `redo()` expuestos en `useImperativeHandle` de `BlockEditor.jsx:233–236` usando `workspace.undo(false/true)`.
  - `App.jsx` keyboard handler extendido con Ctrl+Z (deshacer) y Ctrl+Y/Ctrl+Shift+Z (rehacer). Los atajos solo actúan sobre Blockly cuando Monaco **no** tiene el foco (guard: `.monaco-editor` no está en `activeElement`).
- **Verificado:** ✅

### UX-06 — Indicador de sincronización mejorado ✅
- **Estado (implementado esta sesión):** `statusChip` con 3 estados visuales en `CodeEditor.jsx:151–154`. Cada estado tiene label legible, color semántico e ícono. El indicador usa `Box` con fondo semitransparente (`color18`) y borde (`color50`) para mayor visibilidad.
- **Verificado:** ✅

### UX-07 — Pin como variable (selector dinámico) ❌ SKIP INTENCIONAL
- **Razón del skip:** Requiere que los bloques `arduino_digital_write`, `arduino_pin_mode`, etc. acepten tanto `FieldNumber` como `FieldVariable` como entrada para el pin. Cambiar la forma de entrada de un bloque existente en Blockly implica modificar la API de los bloques guardados en XML, lo que rompería workspaces existentes en localStorage. Riesgo de regresión alto.
- **Decisión:** Aceptable usar `FieldNumber` hasta que se implementen migraciones de XML.

---

## 5. Ítems de Arquitectura (ARCH)

### ARCH-01 — Hook useBidirectionalSync ✅
*(Mismo que QC-05 — ver arriba)*

### ARCH-02 — useImperativeHandle ⚠️ ACEPTABLE
- **Estado:** `BlockEditor` expone una API imperativa via `useImperativeHandle` (loadXML, getXML, getCode, updateToolboxForLibraries, updateCustomBlocksInToolbox, addCustomBlock, addIncludeBlock, undo, redo). Es funcional y bien documentado.
- **Decisión:** El enfoque con `forwardRef` + `useImperativeHandle` es el patrón React correcto para integrar librerías imperativas como Blockly. No requiere cambio.

### ARCH-03 — Limpieza del completion provider Monaco ✅
*(Mismo que BUG-04 — ver arriba)*

---

## 6. Skips Intencionales — Resumen

| ID | Descripción | Justificación | Prioridad Futura |
|----|-------------|---------------|-----------------|
| QC-02 | Dividir archivos monolíticos | Riesgo de regresión alto, sin beneficio inmediato | Milestone 2.0 |
| QC-03 | Migración a TypeScript | Scope demasiado grande, requiere tipar toda la API Blockly | Milestone 2.0 |
| QC-06 | Debounce como módulo utils | Prematura abstracción, función de 8 líneas con un único uso | Bajo |
| UX-07 | Pin como variable dinámica | Cambiaría XML de workspaces existentes (ruptura de backwards compat) | Requiere migrador XML |
| ARCH-02 | Eliminar useImperativeHandle | Patrón correcto para Blockly; reemplazarlo empeoraría la arquitectura | No aplicable |

---

## 7. Cobertura de Tests por Área

| Suite | Tests | Área cubierta |
|-------|-------|--------------|
| `codeParser.test.js` | ~35 | Parser C++ → AST, casos edge |
| `xmlGenerator.test.js` | ~30 | AST → XML Blockly |
| `useSettings.test.js` | ~15 | Persistencia en localStorage, tema sistema |
| `data.test.js` | ~10 | arduinoLibraries.js (>55), boards.js |
| `pipeline.integration.test.js` | ~20 | Flujo bloques → código → parser → XML |
| `bidirectionalSync.integration.test.js` | ~25 | Sync bidireccional completo |
| `App.integration.test.jsx` | ~50 | Render, save/load, keyboard shortcuts |
| `LibraryPanel.integration.test.jsx` | ~40 | Búsqueda, filtrado, inclusión de librerías |
| `SettingsDialog.integration.test.jsx` | ~36 | Settings, tema, fuente, persistencia |
| **TOTAL** | **261** | — |

---

## 8. Estado Final del Proyecto

```
arduino-blocks v1.1.0-alpha
├── HU-01 a HU-27       27/27 ✅  (100%)
├── BUG-01 a BUG-05      5/5  ✅  (100%)
├── QC-01, 04, 05, 07–09 6/9  ✅  (3 skips intencionales)
├── UX-01 a UX-06        6/7  ✅  (1 skip intencional)
├── ARCH-01, 03          2/3  ✅  (1 aceptable)
└── Tests            261/261  ✅  (9 suites, 0 fallos)
```

### Deuda técnica pendiente (no bloqueante)
1. **QC-02** Dividir `arduinoBlocks.js` y `arduinoGenerator.js` en submódulos por categoría
2. **QC-03** Migración a TypeScript con tipos para Blockly y props de componentes
3. **UX-07** Selector de pin dinámico (requiere migrador XML para backwards compat)

### Nuevas funcionalidades implementadas esta sesión
- **UX-04** Cabecera identificadora en BlockEditor (`editor.blocks` / `🧩 bloques`)
- **UX-05** Undo/Redo de Blockly con `Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z`
- **UX-06** Indicador de sincronización mejorado (label + punto de color + fondo semitransparente)
