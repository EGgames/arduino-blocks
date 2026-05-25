# Informe de Refactorización — Arduino Blocks IDE

> Análisis basado en observación directa de la app en ejecución (localhost:3000) y lectura del código fuente completo.

---

## 🔴 Bugs Críticos

### BUG-01 — `scrub_()` no sobreescrito → solo se genera el primer bloque de cada secuencia ✅ CORREGIDO
**Severidad: CRÍTICA | Afecta: todos los cuerpos de sentencias**

`ArduinoGenerator` extiende `Blockly.Generator` pero no sobreescribe `scrub_()`. La implementación base en Blockly 10.x **simplemente retorna el código sin encadenar el siguiente bloque**:
```js
// Blockly base — blockly_compressed.js línea ~1525
scrub_(a, b, c) { return b } // ← nunca llama a blockToCode(nextBlock)
```
Consecuencia: Solo el **primer bloque** dentro de cualquier `setup()`, `loop()`, cuerpo de `if`, `for`, `while`, o función personalizada genera código. Los bloques subsiguientes se **descartan silenciosamente**.

**Observado en vivo:** `void funcion()` con `digitalWrite` + `Serial.println` en el cuerpo → solo `digitalWrite` aparece en el código. `Serial.println` está completamente ausente.

**Corrección aplicada:**
```js
// src/blocks/arduinoGenerator.js
scrub_(block, code, opt_thisOnly) {
  const nextBlock = block.nextBlock();
  const nextCode = opt_thisOnly ? '' : (nextBlock ? this.blockToCode(nextBlock) : '');
  return code + nextCode;
}
```

---

### BUG-02 — Doble indentación en cuerpos anidados
**Severidad: ALTA | Afecta: if / for / while / funciones**

Los generadores de sentencias añaden `gen.INDENT` manualmente:
```js
fb['arduino_digital_write'] = function(block) {
  return `${gen.INDENT}digitalWrite(${pin}, ${value});\n`; // ← ya tiene 2 espacios
};
```
Y `statementToCode` llama a `prefixLines(code, this.INDENT)` que añade **otros 2 espacios** a cada línea.

Resultado: código dentro de `if`/`for`/`while`/función queda con **4 espacios** en lugar de 2:
```cpp
// Esperado           // Lo que genera
void funcion() {      void funcion() {
  digitalWrite(…);        digitalWrite(…);   ← 4 espacios
  Serial.println(…);      Serial.println(…); ← 4 espacios
}                     }
```

**Fix:** Eliminar `gen.INDENT` de todos los generadores de sentencias simples y dejar que `statementToCode` añada la indentación vía `prefixLines` (convención estándar de Blockly).

---

### BUG-03 — No hay persistencia del workspace
**Severidad: ALTA | Afecta: UX crítica**

Refrescar la página borra todo el trabajo y vuelve al ejemplo Blink inicial. No hay `localStorage` ni serialización automática.

**Fix:** Guardar/cargar el XML del workspace en `localStorage` en cada cambio (o al menos al cerrar la página con `beforeunload`).

---

### BUG-04 — Monaco completion provider se registra globalmente en cada mount
**Severidad: MEDIA | Afecta: remontajes del componente**

```js
// src/components/CodeEditor.jsx
monaco.languages.registerCompletionItemProvider('cpp', { ... });
```
Se llama sin comprobar si ya existe un provider registrado. Si `CodeEditor` se desmonta y remonta, los providers se acumulan duplicando sugerencias.

**Fix:** Guardar la referencia del `IDisposable` devuelto por `registerCompletionItemProvider` y llamar a `.dispose()` en el cleanup del `useEffect`.

---

### BUG-05 — Funciones sin parámetros
**Severidad: MEDIA | Afecta: usabilidad de funciones**

Los bloques `arduino_function_define` y `arduino_function_call` no soportan parámetros. En Arduino es habitual pasar valores a funciones (`int calcular(int x, int y)`). Actualmente no hay forma de hacerlo con bloques.

---

## 🟠 Problemas de Calidad de Código

### QC-01 — Generadores no siguen la convención de Blockly
Los generadores de sentencias deben retornar código **sin indentación inicial**. `statementToCode` se encarga de aplicar `prefixLines`. Al añadir `gen.INDENT` manualmente se rompe la composición de niveles de indentación.

**Archivos afectados:** `src/blocks/arduinoGenerator.js` — todos los `fb[...]` de sentencias.

---

### QC-02 — Archivos monolíticos (separación de responsabilidades)
| Archivo | Líneas | Problema |
|---|---|---|
| `src/blocks/arduinoBlocks.js` | ~450 | Todas las definiciones de bloques en un fichero |
| `src/blocks/arduinoGenerator.js` | ~380 | Todos los generadores en un fichero |
| `src/utils/codeParser.js` | ~500 | Parser completo en un fichero |
| `src/utils/xmlGenerator.js` | ~400 | Generador XML completo en un fichero |

**Fix:** Dividir por categoría (pines, tiempo, serial, control, variables, funciones).

---

### QC-03 — Sin TypeScript
Todo el proyecto es JavaScript plano. No hay comprobación de tipos en tiempo de compilación. Errores como `fb['nonexistent_block']` o pasar el tipo equivocado a `statementToCode` son silenciosos.

**Fix:** Migrar a TypeScript o añadir JSDoc con `@ts-check` como mínimo.

---

### QC-04 — Sin tests
No existen tests unitarios para:
- `codeParser.js` (parser recursivo descendiente con ≥30 casos)
- `xmlGenerator.js` (generación de XML de Blockly desde AST)
- `arduinoGenerator.js` (generación de código C++ por tipo de bloque)

Cualquier refactorización de estos módulos es ciega.

**Fix:** Añadir tests con Jest. Son módulos puros (entrada → salida), ideales para testing.

---

### QC-05 — Lógica de sincronización compleja y frágil (`App.jsx`)
Hay **tres refs de estado** para gestionar la sincronización bidireccional:
```js
const fromBlocksRef = useRef(false);       // ¿el cambio vino de bloques?
const codeEditorActiveRef = useRef(false); // ¿el usuario está editando código?
const extUpdate = useRef(false);           // dentro de CodeEditor: ¿cambio programático?
```
Esta lógica puede quedarse "bloqueada" si la edición de código falla a mitad de camino. No hay máquina de estados explícita, timeout de recovery, ni logging de transiciones.

**Fix:** Extraer a un custom hook `useBidirectionalSync` con estado explícito (`'blocks' | 'code' | 'idle'`) y reseteo con timeout.

---

### QC-06 — `debounce` reimplementado a mano
`App.jsx` implementa su propio `debounce` en lugar de usar la función de `lodash` o `@react-hookz/web` que ya están en el ecosistema.

---

### QC-07 — `INITIAL_XML` hardcodeado en `BlockEditor.jsx`
El XML del ejemplo Blink (≈30 líneas) está embebido como string literal. Debería estar en `src/config/initialWorkspace.xml` o similar.

---

### QC-08 — Sin React Error Boundaries
Cualquier error de renderizado en `BlockEditor` o `CodeEditor` crashea toda la app. No hay componente `ErrorBoundary` que muestre un fallback.

---

### QC-09 — `_collectGlobalVars` es un stub vacío
```js
_collectGlobalVars(workspace) {
  return ''; // Los bloques de declaración de variables… se ignoran aquí
}
```
Está comentado como "se generan inline" pero los `arduino_variable_declare` dentro del workspace **no** se generan como globales; se generan en el lugar donde están en el bloque de setup/loop. No hay soporte real para variables globales.

---

## 🟡 Problemas de UX / UI

### UX-01 — Panel "Subida a placa" ocupa espacio permanentemente
El aviso de ⚡ "La subida a placa requiere la aplicación de escritorio…" ocupa ~80px en la parte inferior del editor de código **siempre visible**, incluso en modo Electron donde no debería mostrarse. En modo web reduce el espacio útil del editor.

**Fix:** En Electron: ocultar completamente y reemplazar por botón "Subir". En web: hacer el panel colapsable.

---

### UX-02 — Sin zoom-to-fit al cargar workspace
Cuando se carga un workspace complejo (muchos bloques), la vista no se ajusta automáticamente. El usuario tiene que hacer scroll o zoom manual.

**Fix:** Llamar a `workspace.zoomToFit()` después de `loadXML()`.

---

### UX-03 — Inconsistencia de tema claro/oscuro
El editor Blockly usa tema claro (fondo blanco, bloques de colores vivos). Monaco usa tema oscuro (`vs-dark`). La transición visual es brusca.

**Fix:** Usar `Blockly.Theme` personalizado con colores oscuros, o añadir un toggle de tema que sincronice ambos editores.

---

### UX-04 — No hay label en el panel de bloques
El panel del editor de código tiene `sketch.ino` como título. El panel de bloques no tiene ningún título/etiqueta. Visualmente parece que el panel de bloques es "el IDE" y el de código es solo una pestaña, cuando en realidad son iguales.

---

### UX-05 — Sin atajos de teclado
No hay:
- `Ctrl+S` → guardar  
- `Ctrl+Z` / `Ctrl+Y` → deshacer/rehacer en bloques
- `Ctrl+Shift+F` → formatear código
- `Ctrl+Enter` → subir a placa (en Electron)

---

### UX-06 — Indicador de sincronización pequeño e ilegible
El punto verde/naranja de sincronización (6px) + texto "Sincronizado" es muy pequeño. En pantallas HiDPI o con la interfaz comprimida es difícil de distinguir.

---

### UX-07 — Pin number como campo numérico siempre literal
Los bloques de pines (`digitalWrite`, `analogRead`, etc.) tienen el número de pin como `FieldNumber` editado a mano. No es posible pasar una **variable** como número de pin, lo cual es habitual (ej. `int LED_PIN = 13; digitalWrite(LED_PIN, HIGH)`).

**Fix:** Convertir el campo PIN en un `ValueInput` de tipo `Number` que acepte tanto literales como bloques de variable.

---

## 🔵 Funcionalidad Faltante (backlog priorizado)

| Prioridad | Feature | Impacto |
|---|---|---|
| 🔴 Alta | **Parámetros en funciones** — `int suma(int a, int b)` | Sin esto las funciones son prácticamente inútiles |
| 🔴 Alta | **Variables globales** — Declarar fuera del setup | Necesario para compartir estado entre funciones |
| 🔴 Alta | **`#include` / bibliotecas** — `<Servo.h>`, `<Wire.h>`, etc. | Sin esto no se puede usar ninguna librería |
| 🟠 Media | **Persistencia local** — `localStorage` o archivo `.ino` | Perder trabajo al refrescar es inaceptable |
| 🟠 Media | **Arrays** — `int arr[] = {1,2,3}`; `arr[i]` | Usados constantemente en Arduino |
| 🟠 Media | **`const` / `#define`** — Constantes con nombre | Buena práctica, evita magic numbers |
| 🟠 Media | **`switch/case`** | Muy usado en state machines y menús |
| 🟠 Media | **`do...while`** | Falta solo este loop |
| 🟡 Baja | **`attachInterrupt()`** — Interrupciones hardware | Avanzado pero común |
| 🟡 Baja | **I2C/Wire** — `Wire.begin()`, `Wire.write()` | Para sensores I2C |
| 🟡 Baja | **Exportar workspace como PNG** | Útil para documentación |
| 🟡 Baja | **Comentarios en workspace** — Blockly los soporta | Mejora legibilidad |
| 🟡 Baja | **Selección de placa y puerto** — en Electron | Necesario para compilación real |
| 🟡 Baja | **Integración arduino-cli** — errores de compilación reales | El "compile" actual no existe |

---

## 🏗️ Arquitectura

### ARCH-01 — Sincronización bidireccional mezclada en `App.jsx`
`App.jsx` contiene:
- La máquina de estados de sync (refs + callbacks)
- La lógica de debounce (parseAndUpdateBlocks, 700ms)
- El parser y generador de XML
- El layout y el tema MUI

Debería extraerse a un custom hook `useBidirectionalSync(blockEditorRef)` que exponga solo `{ handleBlockCodeChange, handleCodeEditorChange }`.

---

### ARCH-02 — API imperativa de `BlockEditor` vía `useImperativeHandle`
`BlockEditor` expone `loadXML()`, `getXML()`, `getCode()` a través de `ref`. Es funcional pero frágil (dependiente del ciclo de vida de React para el ref). Una alternativa más robusta sería un **Blockly Context Provider** que exponga el workspace y las operaciones como contexto.

---

### ARCH-03 — Monaco configurado con snippets globales
Los `CompletionItem` de funciones Arduino se registran globalmente en el lenguaje `cpp`. Si se añadieran más instancias del editor o se cambiara de lenguaje, estos providers quedarían activos.

---

## 📋 Resumen Ejecutivo

| Categoría | Issues | Críticos |
|---|---|---|
| Bugs | 5 | 2 (BUG-01 corregido, BUG-02 pendiente) |
| Calidad de código | 9 | 3 (QC-01, QC-02, QC-04) |
| UX/UI | 7 | 1 (UX-01) |
| Funcionalidad faltante | 14 | 3 (parámetros, globales, #include) |
| Arquitectura | 3 | 1 (ARCH-01) |
| **Total** | **38** | **10** |

### Orden de ejecución recomendado

1. **BUG-02** — Eliminar `gen.INDENT` de los generadores (fix de indentación)
2. **BUG-03** — Persistencia en `localStorage`
3. **QC-04** — Tests unitarios para parser y generador  
4. **QC-05** — Refactorizar sync a `useBidirectionalSync`
5. **FUNC** — Variables globales + `#include`
6. **FUNC** — Parámetros en funciones
7. **QC-03** — Migración a TypeScript
8. **FUNC** — Arrays + `const`/`#define`
9. **UX-01** — Rediseño del panel de subida
10. **ARCH-01** — Blockly context provider

---

*Generado por observación directa de la app en ejecución + análisis de código fuente — `e:\dev\Arduino Blocks\`*
