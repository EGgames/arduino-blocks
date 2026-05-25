/**
 * Tests de integración: App
 *
 * Verifica la integración del componente principal: renderizado del AppBar,
 * apertura/cierre del panel de configuración, cambio de tema y
 * comportamiento del botón de guardar en modo web.
 *
 * Los componentes pesados (Blockly / Monaco) se reemplazan con mocks
 * ligeros para aislar la lógica de la App.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../components/App';

// ─── Mocks de dependencias pesadas ────────────────────────────────────────────

jest.mock('../components/BlockEditor', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(function MockBlockEditor(_props, ref) {
      React.useImperativeHandle(ref, () => ({
        loadXML: jest.fn(),
        addIncludeBlock: jest.fn(),
      }));
      return React.createElement('div', { 'data-testid': 'block-editor' });
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

jest.mock('../components/CustomBlocksPanel', () => ({
  __esModule: true,
  default: function MockCustomBlocksPanel() {
    return require('react').createElement('div', { 'data-testid': 'custom-blocks-panel' });
  },
}));

// ─── Setup global ─────────────────────────────────────────────────────────────

function mockMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
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

mockMatchMedia();

beforeEach(() => {
  localStorage.clear();
  mockMatchMedia();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── Render inicial ───────────────────────────────────────────────────────────

describe('App — render inicial', () => {
  test('muestra el nombre "Arduino" en el AppBar', () => {
    render(<App />);
    expect(screen.getByText('Arduino')).toBeInTheDocument();
  });

  test('muestra "Blocks IDE" en el AppBar', () => {
    render(<App />);
    expect(screen.getByText('Blocks IDE')).toBeInTheDocument();
  });

  test('muestra el botón "Guardar"', () => {
    render(<App />);
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });

  test('muestra el indicador "Web" (modo no Electron)', () => {
    render(<App />);
    expect(screen.getByText('Web')).toBeInTheDocument();
  });

  test('no muestra el botón "Abrir" en modo web', () => {
    render(<App />);
    expect(screen.queryByText('Abrir')).not.toBeInTheDocument();
  });

  test('renderiza el BlockEditor (mock)', () => {
    render(<App />);
    expect(screen.getByTestId('block-editor')).toBeInTheDocument();
  });

  test('renderiza el CodeEditor Monaco (mock)', () => {
    render(<App />);
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  test('muestra el panel de librerías por defecto', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('Buscar librería…')).toBeInTheDocument();
  });
});

// ─── Panel de configuración ───────────────────────────────────────────────────

describe('App — panel de configuración', () => {
  test('clic en icono de configuración abre el diálogo', async () => {
    render(<App />);
    const settingsBtn = screen.getByTestId('SettingsIcon').closest('button');
    fireEvent.click(settingsBtn);
    await waitFor(() => {
      expect(screen.getByText('Configuración')).toBeInTheDocument();
    });
  });

  test('panel de configuración muestra los tres botones de tema', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('SettingsIcon').closest('button'));
    await waitFor(() => {
      expect(screen.getByText('Oscuro')).toBeInTheDocument();
      expect(screen.getByText('Claro')).toBeInTheDocument();
      expect(screen.getByText('Sistema')).toBeInTheDocument();
    });
  });

  test('clic en cerrar del panel de configuración lo cierra', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('SettingsIcon').closest('button'));
    await waitFor(() => screen.getByText('Configuración'));

    // Cerrar
    fireEvent.click(screen.getByTestId('CloseIcon').closest('button'));
    await waitFor(() => {
      expect(screen.queryByText('Configuración')).not.toBeInTheDocument();
    });
  });

  test('cambiar tema desde el panel no genera error', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('SettingsIcon').closest('button'));
    await waitFor(() => screen.getByText('Claro'));
    expect(() => fireEvent.click(screen.getByText('Claro'))).not.toThrow();
  });
});

// ─── Cambio de tema ───────────────────────────────────────────────────────────

describe('App — cambio de tema', () => {
  test('tema por defecto establece data-theme="dark" en documentElement', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  test('cambiar a tema claro actualiza data-theme="light"', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('SettingsIcon').closest('button'));
    await waitFor(() => screen.getByText('Claro'));
    fireEvent.click(screen.getByText('Claro'));
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  test('cambiar de vuelta a tema oscuro actualiza data-theme="dark"', async () => {
    render(<App />);
    // Cambiar a claro
    fireEvent.click(screen.getByTestId('SettingsIcon').closest('button'));
    await waitFor(() => screen.getByText('Claro'));
    fireEvent.click(screen.getByText('Claro'));
    // Cambiar a oscuro
    await waitFor(() => screen.getByText('Oscuro'));
    fireEvent.click(screen.getByText('Oscuro'));
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});

// ─── Guardado en modo web ─────────────────────────────────────────────────────

describe('App — guardar (modo web)', () => {
  test('clic en Guardar muestra snackbar con mensaje de descarga', async () => {
    // Mock de URL.createObjectURL y click en <a>
    const mockCreateObjectURL = jest.fn(() => 'blob:mock');
    const mockClick = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    const origCreate = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = origCreate(tag);
      if (tag === 'a') el.click = mockClick;
      return el;
    });

    render(<App />);
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(screen.getByText(/Descargado como \.ino/)).toBeInTheDocument();
    });

    document.createElement.mockRestore?.();
  });

  test('atajo de teclado Ctrl+S dispara el guardado', async () => {
    const mockCreateObjectURL = jest.fn(() => 'blob:mock');
    global.URL.createObjectURL = mockCreateObjectURL;
    const origCreate = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = origCreate(tag);
      if (tag === 'a') el.click = jest.fn();
      return el;
    });

    render(<App />);
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });

    await waitFor(() => {
      expect(screen.getByText(/Descargado como \.ino/)).toBeInTheDocument();
    });

    document.createElement.mockRestore?.();
  });
});

// ─── Tabs del panel inferior ──────────────────────────────────────────────────

describe('App — tabs del panel inferior', () => {
  test('panel "Librerías" muestra el buscador por defecto', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('Buscar librería…')).toBeInTheDocument();
  });

  test('la lista de librerías está visible al inicio', () => {
    render(<App />);
    expect(screen.getByText('Wire')).toBeInTheDocument();
  });
});

// ─── Editor de código ─────────────────────────────────────────────────────────

describe('App — editor de código', () => {
  test('el editor Monaco recibe el código inicial', () => {
    render(<App />);
    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveValue('');
  });

  test('escribir en el editor actualiza el código', async () => {
    render(<App />);
    const editor = screen.getByTestId('monaco-editor');
    fireEvent.change(editor, {
      target: { value: '#include <Wire.h>\nvoid setup(){} void loop(){}' },
    });
    // Verificar que el código fue actualizado (Wire aparece como "incluida" en LibraryPanel)
    await waitFor(() => {
      expect(screen.getByTestId('library-counter').textContent).toMatch(/1 incluida/);
    });
  });
});
