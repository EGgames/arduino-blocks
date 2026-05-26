const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  listPorts: () => ipcRenderer.invoke('list-ports'),
  uploadCode: (opts) => ipcRenderer.invoke('upload-code', opts),
  compileCode: (opts) => ipcRenderer.invoke('compile-code', opts),
  saveFile: (opts) => ipcRenderer.invoke('save-file', opts),
  openFile: () => ipcRenderer.invoke('open-file'),
  installPlatform: (opts) => ipcRenderer.invoke('install-platform', opts),
  onUploadOutput: (cb) => ipcRenderer.on('upload-output', (_e, data) => cb(data)),
  removeUploadOutput: () => ipcRenderer.removeAllListeners('upload-output'),
  isElectron: true,

  // ── Auto-Updater ──────────────────────────────
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateChecking: (cb) => ipcRenderer.on('update-checking', () => cb()),
  onUpdateAvailable: (cb) => ipcRenderer.on('update-available', (_e, info) => cb(info)),
  onUpdateNotAvailable: (cb) => ipcRenderer.on('update-not-available', () => cb()),
  onUpdateDownloadProgress: (cb) => ipcRenderer.on('update-download-progress', (_e, p) => cb(p)),
  onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', (_e, info) => cb(info)),
  onUpdateError: (cb) => ipcRenderer.on('update-error', (_e, msg) => cb(msg)),
  removeUpdateListeners: () => {
    ['update-checking', 'update-available', 'update-not-available',
      'update-download-progress', 'update-downloaded', 'update-error']
      .forEach((ch) => ipcRenderer.removeAllListeners(ch));
  },
});
