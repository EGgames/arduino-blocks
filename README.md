# Arduino Blocks

[![CI — Unit + Integration + E2E Tests](https://github.com/EGgames/arduino-blocks/actions/workflows/ci.yml/badge.svg)](https://github.com/EGgames/arduino-blocks/actions/workflows/ci.yml)
![Jest](https://img.shields.io/badge/Jest-261%20tests-brightgreen)
![Serenity BDD](https://img.shields.io/badge/Serenity%20BDD-48%2F48%20E2E-brightgreen)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![Electron](https://img.shields.io/badge/Electron-27-47848F?logo=electron)
![License](https://img.shields.io/badge/license-MIT-blue)

IDE de programación visual por bloques para Arduino, construido con **React 18 · Electron 27 · Blockly 10 · Monaco Editor · Material UI 5**.

Funciona como **aplicación web** y como **aplicación de escritorio** (Electron). Incluye sincronización bidireccional bloques ↔ código C++, gestor de librerías, compilación y subida a placa vía `arduino-cli`.

> **Documentación completa → [DOCS.md](DOCS.md)**

## Características

- Editor visual por bloques (Blockly) con ~30 bloques Arduino
- Sincronización bidireccional en tiempo real: bloques ↔ código C++
- Compilación y subida a la placa via **arduino-cli**
- Gestor de librerías con 55+ entradas y búsqueda/filtro
- Bloques personalizados (experimental)
- Temas oscuro / claro / sistema
- Funciona como app web y como app de escritorio (Electron)
- Configuración persistente: puerto COM, placa, fuente, tema

## 📋 Requisitos previos

1. **Node.js** 18+ — [nodejs.org](https://nodejs.org)
2. **arduino-cli** instalado y en el PATH — [arduino.cc/pro/cli](https://arduino.github.io/arduino-cli/latest/installation/)

### Instalar arduino-cli (Windows)

```powershell
# Con winget
winget install ArduinoSA.CLI

# O descargar manualmente y agregar al PATH
```

### Configurar arduino-cli

```bash
# Inicializar configuración
arduino-cli config init

# Actualizar índice de placas
arduino-cli core update-index

# Instalar plataforma Arduino AVR (para Uno, Nano, Mega...)
arduino-cli core install arduino:avr

# Para ESP32
arduino-cli core install esp32:esp32 --additional-urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (solo web)
npm start

# Ejecutar con Electron en desarrollo
npm run electron-dev

# Compilar para producción
npm run electron-build
```

## 🧩 Bloques disponibles

| Categoría | Bloques |
|-----------|---------|
| ⚙️ Estructura | setup/loop, comentario |
| 📌 Pines Digitales | pinMode, digitalWrite, digitalRead |
| 📊 Pines Analógicos | analogWrite, analogRead, map, constrain |
| ⏱️ Tiempo | delay, delayMicroseconds, millis |
| 📡 Serial | Serial.begin, Serial.print, Serial.println |
| 🔁 Control | if/else, for, while |
| 📦 Variables | declarar, leer, asignar |
| 🔢 Matemáticas | operaciones, trigonometría |
| ✔️ Lógica | comparaciones, AND/OR/NOT |
| 🔊 Audio | tone, noTone |

## 🏗️ Arquitectura

```
src/
  components/
    App.jsx          # Componente raíz con layout
    BlockEditor.jsx  # Editor Blockly
    CodePreview.jsx  # Preview de código con números de línea
    UploadPanel.jsx  # Panel de conexión y subida a placa
  blocks/
    arduinoBlocks.js    # Definición de bloques Arduino
    arduinoGenerator.js # Generador de código C++
    toolbox.js          # Configuración de la paleta de bloques
electron/
  main.js     # Proceso principal Electron
  preload.js  # Bridge seguro IPC
e2e/          # Suite E2E (Maven / Serenity BDD)
  pom.xml
  src/test/
    java/io/arduino/blocks/e2e/
      pages/       # Page Objects (AppPage, LibraryPanelPage, …)
      steps/       # Step Definitions (Cucumber)
      hooks/       # Hooks de Serenity
      runner/      # JUnit Suite runner
    resources/features/
      HU01_*.feature   # 8 feature files · 48 escenarios
.github/workflows/
  ci.yml        # CI: Jest (261 tests) + E2E (48 escenarios)
```

## 🧪 Tests

### Unit & Integration (Jest)

```bash
# Ejecutar todos los tests
npm test

# Con cobertura
npm test -- --coverage --watchAll=false
```

261 tests · 100 % de cobertura en los módulos probados.

### E2E — Serenity BDD + Cucumber + WebDriver

Suite de 48 escenarios Cucumber escritos en español que ejercitan la UI real
del navegador (Chrome headless) usando **Serenity BDD 4.1.20 + Cucumber 7.18 +
WebDriverManager 5.8**.

```bash
# Requiere: Java 21, Maven 3.9+, app corriendo en http://localhost:3000

cd e2e
mvn verify -B \
  "-Dchrome.switches=--headless=new,--no-sandbox,--disable-dev-shm-usage,--disable-gpu,--window-size=1920,1080"
```

| Resultado | Escenarios |
|-----------|-----------|
| ✅ Passed | 48 / 48 |
| ❌ Failed | 0 |

Historias de usuario cubiertas:

| HU | Descripción |
|----|-------------|
| HU-01 | Apertura y layout de la aplicación |
| HU-09 | Sincronización bidireccional bloques ↔ código |
| HU-13 | Panel de librerías visible por defecto |
| HU-14 | Filtrado de librerías por categoría |
| HU-15 | Búsqueda y adición de librerías |
| HU-17 | Botón de configuración y diálogo de ajustes |
| HU-18 | Navegación de pestañas (Librerías / Bloques / Subir) |
| HU-22 | Botones Copiar y Guardar .ino en el editor de código |

## 🔄 CI / CD

El workflow `.github/workflows/ci.yml` se ejecuta en cada push y PR:

1. **Unit & Integration** — `npm test --coverage` en Node 18 / Ubuntu
2. **E2E** — `mvn verify` en Java 21 / Ubuntu con Chrome headless (depende del job anterior)
3. Artefactos: reporte de cobertura Jest + reporte Serenity HTML

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| UI Framework | React 18.2 + Material UI 5 |
| Editor de bloques | Blockly 10.4 |
| Editor de código | Monaco Editor 4.7 |
| Desktop wrapper | Electron 27 |
| Serial / Compilación | SerialPort 12 + arduino-cli |
| Testing unitario | Jest + React Testing Library |
| Testing E2E | Serenity BDD 4.1 + Cucumber 7.18 + Selenium 4 |
| CI | GitHub Actions |

## 📄 Licencia

MIT — ver [LICENSE](LICENSE) o el encabezado de cada archivo fuente.
