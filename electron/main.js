const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

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

function getTempDir() {
  const dir = path.join(os.tmpdir(), 'arduino-blocks');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function findArduinoCLI() {
  // Buscar arduino-cli en el PATH o en ubicaciones comunes
  const candidates = [
    'arduino-cli',
    'C:\\Program Files\\Arduino CLI\\arduino-cli.exe',
    'C:\\Users\\' + os.userInfo().username + '\\AppData\\Local\\Arduino CLI\\arduino-cli.exe',
    '/usr/local/bin/arduino-cli',
    '/usr/bin/arduino-cli',
    path.join(app.getAppPath(), 'tools', 'arduino-cli'),
  ];
  return candidates[0]; // Se intenta con el PATH primero
}

// ──────────────────────────────────────────────
// IPC: Listar puertos serie
// ──────────────────────────────────────────────
ipcMain.handle('list-ports', async () => {
  return new Promise((resolve) => {
    const cli = findArduinoCLI();
    exec(`"${cli}" board list --format json`, (err, stdout) => {
      if (err) {
        // Fallback: usar serialport nativo si está disponible
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
  return new Promise((resolve) => {
    const tmpDir = getTempDir();
    const sketchDir = path.join(tmpDir, 'sketch');
    if (!fs.existsSync(sketchDir)) fs.mkdirSync(sketchDir, { recursive: true });

    const sketchFile = path.join(sketchDir, 'sketch.ino');
    fs.writeFileSync(sketchFile, code, 'utf8');

    const cli = findArduinoCLI();
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
  return new Promise((resolve) => {
    const tmpDir = getTempDir();
    const sketchDir = path.join(tmpDir, 'sketch_verify');
    if (!fs.existsSync(sketchDir)) fs.mkdirSync(sketchDir, { recursive: true });

    const sketchFile = path.join(sketchDir, 'sketch_verify.ino');
    fs.writeFileSync(sketchFile, code, 'utf8');

    const cli = findArduinoCLI();
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
  return new Promise((resolve) => {
    const cli = findArduinoCLI();
    exec(`"${cli}" core install ${platform}`, (err, stdout, stderr) => {
      resolve({ success: !err, output: stdout + stderr });
    });
  });
});
