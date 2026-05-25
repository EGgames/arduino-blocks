const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec, spawn, execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const https = require('https');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    title: 'Arduino Blocks',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const CLI_VERSION = '1.1.1';

// Caché del path una vez resuelto
let _cliPath = null;
// Promesa compartida para evitar descargas paralelas
let _cliDownloadPromise = null;

function getTempDir() {
  const dir = path.join(os.tmpdir(), 'arduino-blocks');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Busca el binario en ubicaciones conocidas. Devuelve la ruta o null.
 */
function findArduinoCLI() {
  const ext = process.platform === 'win32' ? '.exe' : '';
  const binaryName = `arduino-cli${ext}`;

  // 1. App empaquetada: extraResources copia a process.resourcesPath/tools/
  if (app.isPackaged) {
    const bundled = path.join(process.resourcesPath, 'tools', binaryName);
    if (fs.existsSync(bundled)) return bundled;
  }

  // 2. Dev mode: tools/{platform}/ relativo al proyecto
  const platformDir = process.platform === 'win32' ? 'win'
    : process.platform === 'darwin' ? 'mac'
    : 'linux';
  const devBundled = path.join(__dirname, '..', 'tools', platformDir, binaryName);
  if (fs.existsSync(devBundled)) return devBundled;

  // 3. Descarga previa en userData
  const userDataBin = path.join(app.getPath('userData'), 'tools', binaryName);
  if (fs.existsSync(userDataBin)) return userDataBin;

  return null;
}

/**
 * Descarga con seguimiento de redirecciones HTTP.
 */
function httpsDownload(url, destFile, onProgress) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destFile);
    const req = https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        try { fs.unlinkSync(destFile); } catch {}
        httpsDownload(res.headers.location, destFile, onProgress).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const total = parseInt(res.headers['content-length'] || '0', 10);
      let downloaded = 0;
      res.on('data', (chunk) => {
        downloaded += chunk.length;
        if (total > 0 && onProgress) {
          const pct = Math.round((downloaded / total) * 100);
          onProgress(`[arduino-cli] Descargando... ${pct}% (${(downloaded / 1024 / 1024).toFixed(1)} MB)\n`);
        }
      });
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', (err) => {
      try { fs.unlinkSync(destFile); } catch {}
      reject(err);
    });
  });
}

/**
 * Descarga arduino-cli al directorio userData y devuelve la ruta al binario.
 */
async function downloadArduinoCLI(onProgress) {
  const ext = process.platform === 'win32' ? '.exe' : '';
  const binaryName = `arduino-cli${ext}`;
  const destDir = path.join(app.getPath('userData'), 'tools');
  const destBin = path.join(destDir, binaryName);

  fs.mkdirSync(destDir, { recursive: true });

  const arch = process.arch;
  const assets = {
    win32:  { x64: `arduino-cli_${CLI_VERSION}_Windows_64bit.zip` },
    darwin: { arm64: `arduino-cli_${CLI_VERSION}_macOS_ARM64.tar.gz`, x64: `arduino-cli_${CLI_VERSION}_macOS_64bit.tar.gz` },
    linux:  { x64: `arduino-cli_${CLI_VERSION}_Linux_64bit.tar.gz`, arm64: `arduino-cli_${CLI_VERSION}_Linux_ARM64.tar.gz` },
  };
  const platformAssets = assets[process.platform] || assets.linux;
  const assetName = platformAssets[arch] || platformAssets['x64'];
  const url = `https://github.com/arduino/arduino-cli/releases/download/v${CLI_VERSION}/${assetName}`;
  const tmpFile = path.join(os.tmpdir(), assetName);

  if (onProgress) onProgress(`[arduino-cli] Preparando herramientas de compilación (solo la primera vez)...\n`);

  await httpsDownload(url, tmpFile, onProgress);

  if (onProgress) onProgress(`[arduino-cli] Instalando...\n`);

  if (assetName.endsWith('.zip')) {
    execSync(
      `powershell -command "Expand-Archive -Path '${tmpFile}' -DestinationPath '${destDir}' -Force"`,
      { stdio: 'pipe' }
    );
  } else {
    execSync(`tar -xzf "${tmpFile}" -C "${destDir}" arduino-cli`, { stdio: 'pipe' });
    execSync(`chmod +x "${destBin}"`);
  }

  try { fs.unlinkSync(tmpFile); } catch {}

  if (onProgress) onProgress(`[arduino-cli] Listo. Compilando...\n\n`);
  return destBin;
}

/**
 * Garantiza que arduino-cli esté disponible.
 * En apps empaquetadas: siempre está en resourcesPath (extraResources).
 * Si por cualquier razón no está: lo descarga automáticamente (una sola vez).
 */
async function ensureArduinoCLI(onProgress) {
  if (_cliPath) return _cliPath;

  const found = findArduinoCLI();
  if (found) {
    _cliPath = found;
    return _cliPath;
  }

  // No encontrado — descargar automáticamente (promesa compartida)
  if (!_cliDownloadPromise) {
    _cliDownloadPromise = downloadArduinoCLI(onProgress);
  }
  _cliPath = await _cliDownloadPromise;
  return _cliPath;
}

// ──────────────────────────────────────────────
// IPC: Listar puertos serie
// ──────────────────────────────────────────────
ipcMain.handle('list-ports', async () => {
  let cli;
  try { cli = await ensureArduinoCLI(); } catch { cli = null; }

  if (!cli) {
    try {
      const { SerialPort } = require('serialport');
      const ports = await SerialPort.list();
      return { success: true, ports: ports.map(p => ({ port: p.path, description: p.friendlyName || p.manufacturer || '' })) };
    } catch { return { success: true, ports: [] }; }
  }

  return new Promise((resolve) => {
    exec(`"${cli}" board list --format json`, (err, stdout) => {
      if (err) {
        try {
          const { SerialPort } = require('serialport');
          SerialPort.list().then((ports) => {
            resolve({ success: true, ports: ports.map(p => ({ port: p.path, description: p.friendlyName || p.manufacturer || '' })) });
          }).catch(() => resolve({ success: true, ports: [] }));
        } catch {
          resolve({ success: true, ports: [] });
        }
        return;
      }
      try {
        const data = JSON.parse(stdout);
        const ports = (data.detected_ports || []).map(p => ({
          port: p.port?.address || '',
          description: p.port?.label || '',
          board: p.matching_boards?.[0]?.name || '',
          fqbn: p.matching_boards?.[0]?.fqbn || '',
        }));
        resolve({ success: true, ports });
      } catch {
        resolve({ success: true, ports: [] });
      }
    });
  });
});

// ──────────────────────────────────────────────
// IPC: Compilar y subir sketch
// ──────────────────────────────────────────────
ipcMain.handle('upload-code', async (_event, { code, port, fqbn }) => {
  const onProgress = (msg) => mainWindow?.webContents.send('upload-output', msg);
  let cli;
  try {
    cli = await ensureArduinoCLI(onProgress);
  } catch (err) {
    return { success: false, output: `Error al preparar herramientas de compilación: ${err.message}` };
  }

  return new Promise((resolve) => {
    const tmpDir = getTempDir();
    const sketchDir = path.join(tmpDir, 'sketch');
    if (!fs.existsSync(sketchDir)) fs.mkdirSync(sketchDir, { recursive: true });

    const sketchFile = path.join(sketchDir, 'sketch.ino');
    fs.writeFileSync(sketchFile, code, 'utf8');

    const boardFqbn = fqbn || 'arduino:avr:uno';
    const cmd = `"${cli}" compile --fqbn ${boardFqbn} "${sketchDir}" && "${cli}" upload -p ${port} --fqbn ${boardFqbn} "${sketchDir}"`;

    let output = '';
    const proc = spawn(cmd, { shell: true });

    proc.stdout.on('data', (d) => {
      output += d.toString();
      mainWindow?.webContents.send('upload-output', d.toString());
    });
    proc.stderr.on('data', (d) => {
      output += d.toString();
      mainWindow?.webContents.send('upload-output', d.toString());
    });
    proc.on('close', (code) => {
      resolve({ success: code === 0, output });
    });
  });
});

// ──────────────────────────────────────────────
// IPC: Solo compilar (verificar)
// ──────────────────────────────────────────────
ipcMain.handle('compile-code', async (_event, { code, fqbn }) => {
  const onProgress = (msg) => mainWindow?.webContents.send('upload-output', msg);
  let cli;
  try {
    cli = await ensureArduinoCLI(onProgress);
  } catch (err) {
    return { success: false, output: `Error al preparar herramientas de compilación: ${err.message}` };
  }

  return new Promise((resolve) => {
    const tmpDir = getTempDir();
    const sketchDir = path.join(tmpDir, 'sketch_verify');
    if (!fs.existsSync(sketchDir)) fs.mkdirSync(sketchDir, { recursive: true });

    const sketchFile = path.join(sketchDir, 'sketch_verify.ino');
    fs.writeFileSync(sketchFile, code, 'utf8');

    const boardFqbn = fqbn || 'arduino:avr:uno';
    const cmd = `"${cli}" compile --fqbn ${boardFqbn} "${sketchDir}"`;

    let output = '';
    exec(cmd, (err, stdout, stderr) => {
      output = stdout + stderr;
      resolve({ success: !err, output });
    });
  });
});

// ──────────────────────────────────────────────
// IPC: Guardar archivo
// ──────────────────────────────────────────────
ipcMain.handle('save-file', async (_event, { content, defaultName }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'mi_proyecto.ino',
    filters: [
      { name: 'Arduino Sketch', extensions: ['ino'] },
      { name: 'Todos los archivos', extensions: ['*'] },
    ],
  });
  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, content, 'utf8');
    return { success: true, filePath: result.filePath };
  }
  return { success: false };
});

// ──────────────────────────────────────────────
// IPC: Abrir archivo
// ──────────────────────────────────────────────
ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'Arduino Sketch', extensions: ['ino'] },
      { name: 'Todos los archivos', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const content = fs.readFileSync(result.filePaths[0], 'utf8');
    return { success: true, content, filePath: result.filePaths[0] };
  }
  return { success: false };
});

// ──────────────────────────────────────────────
// IPC: Instalar plataforma arduino-cli
// ──────────────────────────────────────────────
ipcMain.handle('install-platform', async (_event, { platform }) => {
  const onProgress = (msg) => mainWindow?.webContents.send('upload-output', msg);
  let cli;
  try {
    cli = await ensureArduinoCLI(onProgress);
  } catch (err) {
    return { success: false, output: `Error al preparar herramientas: ${err.message}` };
  }
  return new Promise((resolve) => {
    exec(`"${cli}" core install ${platform}`, (err, stdout, stderr) => {
      resolve({ success: !err, output: stdout + stderr });
    });
  });
});
