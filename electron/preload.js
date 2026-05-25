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
});
