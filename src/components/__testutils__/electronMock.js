/**
 * Instala un `window.electronAPI` falso ANTES de que los componentes se importen.
 *
 * Varios componentes (UpdaterDialog, UploadPanel, CodePreview…) leen
 * `window.electronAPI?.isElectron` en el momento de cargarse el módulo, así que
 * este archivo debe importarse en la PRIMERA línea del test — los `import` se
 * evalúan en orden y este deja la ventana preparada.
 *
 * Como CRA activa `resetMocks`, las implementaciones de los jest.fn() se borran
 * antes de cada test: por eso `installElectronMock()` debe llamarse en un
 * `beforeEach`.
 */

/** Callbacks registrados por los componentes, para dispararlos desde el test */
export const updaterListeners = {};

/** Callbacks de salida de compilación/subida */
export const uploadListeners = {};

/** (Re)instala el mock completo. Llamar en beforeEach. */
export function installElectronMock(overrides = {}) {
  window.electronAPI = {
    isElectron: true,

    // Actualizador
    onUpdateAvailable: (cb) => { updaterListeners.available = cb; },
    onUpdateNotAvailable: (cb) => { updaterListeners.notAvailable = cb; },
    onUpdateDownloadProgress: (cb) => { updaterListeners.progress = cb; },
    onUpdateDownloaded: (cb) => { updaterListeners.downloaded = cb; },
    onUpdateError: (cb) => { updaterListeners.error = cb; },
    removeUpdateListeners: jest.fn(),
    downloadUpdate: jest.fn().mockResolvedValue(undefined),
    installUpdate: jest.fn(),
    checkForUpdates: jest.fn().mockResolvedValue({ dev: false }),

    // Compilación / subida
    listPorts: jest.fn().mockResolvedValue({ ports: [] }),
    compileCode: jest.fn().mockResolvedValue({ success: true, output: 'OK' }),
    uploadCode: jest.fn().mockResolvedValue({ success: true }),
    onUploadOutput: jest.fn((cb) => { uploadListeners.output = cb; }),
    removeUploadOutput: jest.fn(),

    // Archivos
    saveFile: jest.fn().mockResolvedValue({ success: true, filePath: 'C:/tmp/mi_sketch.ino' }),
    openFile: jest.fn().mockResolvedValue({ success: false }),

    ...overrides,
  };
  return window.electronAPI;
}

// Instalación inicial: ocurre al importar, antes que el componente bajo prueba.
installElectronMock();
