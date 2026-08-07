import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CodeEditor from './CodeEditor';

// ── Monaco falso: expone editor/monaco al test a través de onMount ────────────

// Estado compartido con el mock (el prefijo «mock» lo exige jest.mock)
const mockMonacoState = {
  editor: null,
  monaco: null,
  themeSet: null,
  completionProvider: null,
  disposed: false,
};

function mockCrearEditorFalso(valorInicial) {
  let value = valorInicial ?? '';
  return {
    getModel: () => ({
      getValue: () => value,
      setValue: (v) => { value = v; },
      getFullModelRange: () => ({ startLineNumber: 1, endLineNumber: 1 }),
    }),
    executeEdits: jest.fn((_src, edits) => { value = edits[0].text; }),
    getSelection: jest.fn(() => ({ startLineNumber: 1 })),
    setSelection: jest.fn(),
    updateOptions: jest.fn(),
    _getValue: () => value,
  };
}

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: function MockMonaco({ defaultValue, onChange, onMount }) {
    const React = require('react');
    React.useEffect(() => {
      const editor = mockCrearEditorFalso(defaultValue);
      const monaco = {
        languages: {
          CompletionItemKind: { Function: 1 },
          registerCompletionItemProvider: jest.fn((_lang, provider) => {
            mockMonacoState.completionProvider = provider;
            return { dispose: () => { mockMonacoState.disposed = true; } };
          }),
        },
        editor: {
          defineTheme: jest.fn(),
          setTheme: jest.fn((t) => { mockMonacoState.themeSet = t; }),
        },
      };
      mockMonacoState.editor = editor;
      mockMonacoState.monaco = monaco;
      onMount?.(editor, monaco);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return React.createElement('textarea', {
      'data-testid': 'monaco',
      onChange: (e) => onChange?.(e.target.value),
      defaultValue: defaultValue || '',
    });
  },
}));

beforeEach(() => {
  mockMonacoState.editor = null;
  mockMonacoState.monaco = null;
  mockMonacoState.themeSet = null;
  mockMonacoState.disposed = false;
  Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
  global.URL.createObjectURL = jest.fn(() => 'blob:x');
});

describe('CodeEditor', () => {
  test('muestra el nombre del sketch y el estado sincronizado', () => {
    render(<CodeEditor code="int x;" syncStatus="ok" />);
    expect(screen.getByText('sketch.ino')).toBeInTheDocument();
    expect(screen.getByText('Sincronizado')).toBeInTheDocument();
  });

  test('muestra el estado de error de sintaxis', () => {
    render(<CodeEditor code="int x" syncStatus="error" />);
    expect(screen.getByText('Error de sintaxis')).toBeInTheDocument();
  });

  test('muestra el estado de actualización', () => {
    render(<CodeEditor code="int x;" syncStatus="syncing" />);
    expect(screen.getByText('Actualizando…')).toBeInTheDocument();
  });

  test('un estado desconocido no rompe el render', () => {
    render(<CodeEditor code="int x;" syncStatus="otro" />);
    expect(screen.getByText('sketch.ino')).toBeInTheDocument();
  });

  test('registra el autocompletado de Arduino al montar', () => {
    render(<CodeEditor code="" />);
    expect(mockMonacoState.monaco.languages.registerCompletionItemProvider).toHaveBeenCalledWith('cpp', expect.any(Object));
    const { suggestions } = mockMonacoState.completionProvider.provideCompletionItems({}, {});
    expect(suggestions.map((s) => s.label)).toEqual(expect.arrayContaining(['digitalWrite', 'analogRead', 'HIGH']));
  });

  test('sincroniza el código que llegó antes de montar Monaco', () => {
    render(<CodeEditor code="int previo;" />);
    expect(mockMonacoState.editor._getValue()).toBe('int previo;');
  });

  test('propaga los cambios del usuario', () => {
    const onChange = jest.fn();
    render(<CodeEditor code="int x;" onChange={onChange} />);
    fireEvent.change(screen.getByTestId('monaco'), { target: { value: 'int y;' } });
    expect(onChange).toHaveBeenCalledWith('int y;');
  });

  test('vaciar el editor se propaga como cadena vacía', () => {
    const onChange = jest.fn();
    render(<CodeEditor code="int x;" onChange={onChange} />);
    fireEvent.change(screen.getByTestId('monaco'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith('');
  });

  test('sin manejador onChange los cambios no rompen nada', () => {
    render(<CodeEditor code="int x;" />);
    expect(() => {
      fireEvent.change(screen.getByTestId('monaco'), { target: { value: 'int z;' } });
    }).not.toThrow();
  });

  test('aplica los cambios externos al modelo sin perder el cursor', () => {
    const { rerender } = render(<CodeEditor code="int x;" onChange={jest.fn()} />);
    act(() => { rerender(<CodeEditor code="int nuevo;" onChange={jest.fn()} />); });
    expect(mockMonacoState.editor.executeEdits).toHaveBeenCalled();
    expect(mockMonacoState.editor.setSelection).toHaveBeenCalled();
    expect(mockMonacoState.editor._getValue()).toBe('int nuevo;');
  });

  test('no reescribe el modelo si el código no cambió', () => {
    const { rerender } = render(<CodeEditor code="int x;" />);
    mockMonacoState.editor.executeEdits.mockClear();
    act(() => { rerender(<CodeEditor code="int x;" />); });
    expect(mockMonacoState.editor.executeEdits).not.toHaveBeenCalled();
  });

  test('cambia el tamaño de fuente al cambiar el prop', () => {
    const { rerender } = render(<CodeEditor code="x" fontSize={13} />);
    act(() => { rerender(<CodeEditor code="x" fontSize={18} />); });
    expect(mockMonacoState.editor.updateOptions).toHaveBeenCalledWith({ fontSize: 18 });
  });

  test('cambia el tema entre claro y oscuro', () => {
    const { rerender } = render(<CodeEditor code="x" colorTheme="dark" />);
    act(() => { rerender(<CodeEditor code="x" colorTheme="light" />); });
    expect(mockMonacoState.themeSet).toBe('vs');
    act(() => { rerender(<CodeEditor code="x" colorTheme="dark" />); });
    expect(mockMonacoState.themeSet).toBe('arduino-dark');
  });

  test('copia el código al portapapeles', async () => {
    jest.useFakeTimers();
    render(<CodeEditor code="int x;" />);
    await act(async () => { fireEvent.click(screen.getByTestId('copy-code-button')); });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('int x;');
    act(() => { jest.advanceTimersByTime(1600); });
    jest.useRealTimers();
  });

  test('guarda como archivo en el navegador', async () => {
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<CodeEditor code="int x;" />);
    await act(async () => { fireEvent.click(screen.getByTestId('save-ino-button')); });
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  test('guarda a través de Electron cuando está disponible', async () => {
    window.electronAPI = { isElectron: true, saveFile: jest.fn().mockResolvedValue({ success: true }) };
    render(<CodeEditor code="int x;" />);
    await act(async () => { fireEvent.click(screen.getByTestId('save-ino-button')); });
    expect(window.electronAPI.saveFile).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'int x;', defaultName: 'sketch.ino' }),
    );
    delete window.electronAPI;
  });

  test('libera el proveedor de autocompletado al desmontar', () => {
    const { unmount } = render(<CodeEditor code="x" />);
    unmount();
    expect(mockMonacoState.disposed).toBe(true);
  });
});
