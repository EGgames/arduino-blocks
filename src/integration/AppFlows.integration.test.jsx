// El mock de electronAPI debe instalarse antes de importar App
import { installElectronMock } from '../components/__testutils__/electronMock';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../components/App';

// ─── Mocks de dependencias pesadas ────────────────────────────────────────────

const blockEditorApi = {
  loadXML: jest.fn(),
  addIncludeBlock: jest.fn().mockReturnValue(true),
  getCode: jest.fn(() => 'void setup() {}\nvoid loop() {}\n'),
  getXML: jest.fn(() => '<xml/>'),
  getBlockCount: jest.fn(() => 12),
  undo: jest.fn(),
  redo: jest.fn(),
  updateToolboxForLibraries: jest.fn(),
  updateCustomBlocksInToolbox: jest.fn(),
};

jest.mock('../components/BlockEditor', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(function MockBlockEditor({ onCodeChange, mode }, ref) {
      React.useImperativeHandle(ref, () => global.__blockEditorApi);
      React.useEffect(() => {
        onCodeChange?.('void setup() {\n  Serial.print("x");\n}\nvoid loop() {\n  strip.begin();\n}\n');
      }, [onCodeChange]);
      return React.createElement('div', { 'data-testid': 'block-editor', 'data-mode': mode });
    }),
  };
});

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: function MockMonaco({ value, onChange }) {
    const React = require('react');
    return React.createElement('textarea', {
      'data-testid': 'monaco-editor',
      value: value || '',
      onChange: (e) => onChange?.(e.target.value),
      readOnly: !onChange,
    });
  },
}));

// ─── Utilidades ───────────────────────────────────────────────────────────────

function mockMatchMedia(isMobile = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: isMobile && query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

/** Pone la app en modo Niño antes de renderizar */
function ajustesModoNino() {
  localStorage.setItem('arduino-blocks-settings', JSON.stringify({
    theme: 'dark', fontSize: 13, mode: 'kids', comPort: '', board: 'arduino:avr:uno',
  }));
}

beforeEach(() => {
  localStorage.clear();
  mockMatchMedia(false);
  installElectronMock();
  global.__blockEditorApi = blockEditorApi;
  Object.values(blockEditorApi).forEach((fn) => fn.mockClear?.());
  blockEditorApi.getCode.mockReturnValue('void setup() {}\nvoid loop() {}\n');
  blockEditorApi.getBlockCount.mockReturnValue(12);
  blockEditorApi.addIncludeBlock.mockReturnValue(true);
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  delete window.electronAPI;
});

/**
 * Renderiza App y espera a que termine la emisión inicial de código desde los
 * bloques (durante ese instante la sincronización ignora los cambios del editor).
 */
async function renderApp() {
  const utils = render(<App />);
  // El hook de sincronización libera el flag «viene de bloques» en un setTimeout(0)
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  return utils;
}

const CODIGO_EDITADO = 'void setup() {}\nvoid loop() { delay(1); }';

/** Edita el código en Monaco para provocar cambios sin guardar */
async function editarCodigo(texto = CODIGO_EDITADO) {
  await act(async () => {
    fireEvent.change(screen.getByTestId('monaco-editor'), { target: { value: texto } });
  });
}

// ─────────────────────────────────────────────────────────────────────────────

describe('App en Electron — archivos', () => {
  test('muestra el indicador de escritorio', () => {
    render(<App />);
    expect(screen.getByText('Electron')).toBeInTheDocument();
  });

  test('guardar usa el diálogo nativo y confirma la ruta', async () => {
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByText('Guardar')); });
    expect(window.electronAPI.saveFile).toHaveBeenCalledWith(
      expect.objectContaining({ defaultName: 'mi_sketch.ino' }),
    );
    expect(await screen.findByText(/Guardado: /)).toBeInTheDocument();
  });

  test('abrir carga el archivo y regenera los bloques', async () => {
    window.electronAPI.openFile.mockResolvedValue({
      success: true,
      filePath: 'C:/tmp/blink.ino',
      content: 'void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n}',
    });
    render(<App />);
    // Guardar primero para que no haya cambios pendientes
    await act(async () => { fireEvent.click(screen.getByText('Guardar')); });
    await act(async () => { fireEvent.click(screen.getByText('Abrir')); });
    expect(await screen.findByText(/Archivo cargado/)).toBeInTheDocument();
    expect(blockEditorApi.loadXML).toHaveBeenCalled();
  });

  test('cancelar el diálogo de apertura no cambia nada', async () => {
    window.electronAPI.openFile.mockResolvedValue({ success: false });
    render(<App />);
    await act(async () => { fireEvent.click(screen.getByText('Guardar')); });
    await act(async () => { fireEvent.click(screen.getByText('Abrir')); });
    expect(screen.queryByText(/Archivo cargado/)).not.toBeInTheDocument();
  });

  test('un guardado cancelado deja los cambios como pendientes', async () => {
    window.electronAPI.saveFile.mockResolvedValue({ success: false });
    await renderApp();
    await editarCodigo();
    await act(async () => { fireEvent.click(screen.getByText('Guardar')); });
    fireEvent.click(screen.getByText('Nuevo'));
    expect(await screen.findByText('Cambios sin guardar')).toBeInTheDocument();
  });
});

describe('App — cambios sin guardar', () => {
  test('«Nuevo» con cambios pendientes pide confirmación y permite cancelar', async () => {
    await renderApp();
    await editarCodigo();
    fireEvent.click(screen.getByText('Nuevo'));
    expect(await screen.findByText('Cambios sin guardar')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByText('Cambios sin guardar')).not.toBeInTheDocument());
  });

  test('«Continuar sin guardar» crea el proyecto nuevo', async () => {
    await renderApp();
    await editarCodigo();
    jest.useFakeTimers();
    fireEvent.click(screen.getByText('Nuevo'));
    fireEvent.click(await screen.findByRole('button', { name: 'Continuar sin guardar' }));
    act(() => { jest.advanceTimersByTime(200); });
    expect(blockEditorApi.loadXML).toHaveBeenCalled();
    jest.useRealTimers();
    expect(await screen.findByText('Nuevo proyecto creado')).toBeInTheDocument();
  });

  test('«Guardar y continuar» guarda antes de abrir', async () => {
    window.electronAPI.openFile.mockResolvedValue({
      success: true, filePath: 'C:/a.ino', content: 'void setup(){}\nvoid loop(){}',
    });
    await renderApp();
    await editarCodigo();
    fireEvent.click(screen.getByText('Abrir'));
    await act(async () => {
      fireEvent.click(await screen.findByRole('button', { name: 'Guardar y continuar' }));
    });
    expect(window.electronAPI.saveFile).toHaveBeenCalled();
    expect(window.electronAPI.openFile).toHaveBeenCalled();
  });

  test('si el guardado falla no continúa con la acción pendiente', async () => {
    window.electronAPI.saveFile.mockResolvedValue({ success: false });
    await renderApp();
    await editarCodigo();
    fireEvent.click(screen.getByText('Nuevo'));
    await act(async () => {
      fireEvent.click(await screen.findByRole('button', { name: 'Guardar y continuar' }));
    });
    expect(screen.getByText('Cambios sin guardar')).toBeInTheDocument();
  });
});

describe('App — atajos de teclado', () => {
  test('Ctrl+Z deshace en el editor de bloques', () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
    expect(blockEditorApi.undo).toHaveBeenCalled();
  });

  test('Ctrl+Y y Ctrl+Shift+Z rehacen', () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 'y', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true, shiftKey: true });
    expect(blockEditorApi.redo).toHaveBeenCalledTimes(2);
  });

  test('las teclas sin Ctrl no hacen nada', () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 'z' });
    expect(blockEditorApi.undo).not.toHaveBeenCalled();
  });
});

describe('App — sincronización de librerías con el toolbox', () => {
  test('los #include del código activan las categorías de librería', async () => {
    await renderApp();
    await editarCodigo('#include <Servo.h>\n#include <Wire.h>\nvoid setup(){}\nvoid loop(){}');
    await waitFor(() => {
      expect(blockEditorApi.updateToolboxForLibraries).toHaveBeenCalledWith(
        expect.arrayContaining(['Servo', 'Wire']),
      );
    });
  });

  test('añadir una librería desde el panel inserta el bloque include', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('library-item-Servo'));
    expect(blockEditorApi.addIncludeBlock).toHaveBeenCalledWith('Servo');
  });
});

describe('App — modo Niño', () => {
  test('cambia la marca y muestra los pasos guiados', () => {
    ajustesModoNino();
    render(<App />);
    expect(screen.getByText('¡Hola!')).toBeInTheDocument();
    expect(screen.getByText('Modo Niño 🎉')).toBeInTheDocument();
    expect(screen.getByText('1️⃣ Arrastra bloques')).toBeInTheDocument();
  });

  test('ofrece las mismas acciones de archivo que el modo avanzado', () => {
    ajustesModoNino();
    render(<App />);
    expect(screen.getByRole('button', { name: /nuevo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /abrir/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
  });

  test('«Nuevo» en modo Niño crea un programa vacío', async () => {
    ajustesModoNino();
    await renderApp();
    jest.useFakeTimers();
    blockEditorApi.loadXML.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /nuevo/i }));
    act(() => { jest.advanceTimersByTime(200); });
    expect(blockEditorApi.loadXML).toHaveBeenCalledWith(expect.stringContaining('kids_setup_loop'));
    jest.useRealTimers();
    expect(await screen.findByText('Nuevo proyecto creado')).toBeInTheDocument();
  });

  test('«Abrir» en modo Niño usa el diálogo nativo', async () => {
    ajustesModoNino();
    window.electronAPI.openFile.mockResolvedValue({
      success: true, filePath: 'C:/tmp/kids.ino', content: 'void setup(){}\nvoid loop(){}',
    });
    await renderApp();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /abrir/i })); });
    expect(window.electronAPI.openFile).toHaveBeenCalled();
  });

  test('«Guardar» en modo Niño guarda el sketch', async () => {
    ajustesModoNino();
    await renderApp();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /guardar/i })); });
    expect(window.electronAPI.saveFile).toHaveBeenCalledWith(
      expect.objectContaining({ defaultName: 'mi_sketch.ino' }),
    );
  });

  test('la barra lateral ofrece subir, proyectos, logros, tutorial y ayuda', () => {
    ajustesModoNino();
    render(<App />);
    expect(screen.getByRole('tab', { name: /Subir/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Proyectos/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Logros/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tutorial/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Ayuda/ })).toBeInTheDocument();
  });

  test('cargar un proyecto de ejemplo desbloquea logros', async () => {
    ajustesModoNino();
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /Proyectos/ }));
    fireEvent.click(await screen.findByText('Semáforo'));
    expect(blockEditorApi.loadXML).toHaveBeenCalled();
    expect(await screen.findByText(/Proyecto "Semáforo" cargado/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Logros/ }));
    expect(await screen.findByText('¡Semáforo!')).toBeInTheDocument();
  });

  test('abrir la ayuda desbloquea el logro de curiosidad', async () => {
    ajustesModoNino();
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /Ayuda/ }));
    expect(await screen.findByText('❓ Ayuda y Guía de Bloques')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /Logros/ }));
    expect(await screen.findByText('¡Curioso!')).toBeInTheDocument();
  });

  test('el tutorial se muestra en su pestaña', async () => {
    ajustesModoNino();
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /Tutorial/ }));
    expect(await screen.findByText('🎓 Tutoriales')).toBeInTheDocument();
  });

  test('los logros por cantidad de bloques y por Serial se otorgan solos', async () => {
    ajustesModoNino();
    blockEditorApi.getBlockCount.mockReturnValue(25);
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /Logros/ }));
    expect(await screen.findByText('¡Primer Bloque!')).toBeInTheDocument();
    expect(screen.getByText('¡Constructor!')).toBeInTheDocument();
    expect(screen.getByText('¡Comunicador!')).toBeInTheDocument();
    expect(screen.getByText('¡Arcoíris!')).toBeInTheDocument();
  });
});

describe('App en móvil', () => {
  beforeEach(() => mockMatchMedia(true));

  test('muestra la navegación inferior con las tres vistas', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Bloques' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Código' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Herramientas' })).toBeInTheDocument();
  });

  test('la vista de herramientas ofrece las pestañas de escritorio', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Herramientas' }));
    expect(screen.getByRole('tab', { name: /Librerías/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /Bloques/ }));
    fireEvent.click(screen.getByRole('tab', { name: /Subir/ }));
    expect(screen.getAllByText(/Conexión y Subida/).length).toBeGreaterThan(0);
  });

  test('en modo Niño solo muestra el panel de subida', () => {
    ajustesModoNino();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Herramientas' }));
    expect(screen.getByText('Subir a tu Arduino')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Librerías/ })).not.toBeInTheDocument();
  });

  test('en modo Niño las acciones de archivo son botones de icono', async () => {
    ajustesModoNino();
    render(<App />);
    for (const nombre of ['Nuevo', 'Abrir', 'Guardar']) {
      expect(screen.getByRole('button', { name: nombre })).toBeInTheDocument();
    }
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Guardar' })); });
    expect(window.electronAPI.saveFile).toHaveBeenCalled();
  });

  test('el guardado en móvil usa el botón de icono', async () => {
    render(<App />);
    const guardar = screen.getAllByTestId('SaveIcon')[0].closest('button');
    await act(async () => { fireEvent.click(guardar); });
    expect(window.electronAPI.saveFile).toHaveBeenCalled();
  });
});

describe('App — paneles redimensionables', () => {
  test('arrastrar el divisor vertical cambia el ancho del panel derecho', () => {
    const { container } = render(<App />);
    const divisor = container.querySelector('[class*="css-"] .grip-dots')?.parentElement;
    expect(divisor).toBeTruthy();
    fireEvent.mouseDown(divisor, { clientX: 800 });
    fireEvent.mouseMove(document, { clientX: 600 });
    fireEvent.mouseUp(document);
  });

  test('arrastrar el divisor horizontal cambia la altura del panel inferior', () => {
    const { container } = render(<App />);
    const divisor = container.querySelector('.grip-h')?.parentElement;
    expect(divisor).toBeTruthy();
    fireEvent.mouseDown(divisor, { clientY: 500 });
    fireEvent.mouseMove(document, { clientY: 300 });
    fireEvent.mouseUp(document);
  });

  test('el botón de menú pliega y despliega el panel inferior', () => {
    render(<App />);
    const menu = screen.getByTestId('MenuIcon').closest('button');
    fireEvent.click(menu);
    expect(screen.queryByPlaceholderText('Buscar librería…')).not.toBeInTheDocument();
    fireEvent.click(menu);
    expect(screen.getByPlaceholderText('Buscar librería…')).toBeInTheDocument();
  });
});
