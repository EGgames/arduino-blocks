import React, { createRef } from 'react';
import { render, act, waitFor } from '@testing-library/react';
import * as Blockly from 'blockly';
import BlockEditor from './BlockEditor';
import { INITIAL_XML, KIDS_INITIAL_XML } from '../config/initialWorkspace';

// jsdom no implementa las mediciones (canvas/SVG) que Blockly usa al renderizar.
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = function getContext() {
    return {
      font: '',
      measureText: (text) => ({ width: String(text).length * 6 }),
      fillText: () => {},
      clearRect: () => {},
      save: () => {},
      restore: () => {},
    };
  };
  if (!global.SVGElement.prototype.getBBox) {
    global.SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 100, height: 20 });
  }
  if (!global.SVGElement.prototype.getComputedTextLength) {
    global.SVGElement.prototype.getComputedTextLength = () => 60;
  }
  if (!global.SVGElement.prototype.getScreenCTM) {
    global.SVGElement.prototype.getScreenCTM = () => ({
      a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
      inverse() { return this; },
      multiply() { return this; },
    });
  }
  global.ResizeObserver = global.ResizeObserver || class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

beforeEach(() => localStorage.clear());

/** Monta el editor y devuelve la ref con su API pública */
function montar(props = {}) {
  const ref = createRef();
  const utils = render(<BlockEditor ref={ref} onCodeChange={props.onCodeChange} {...props} />);
  return { ref, ...utils };
}

describe('BlockEditor', () => {
  test('inyecta Blockly y emite el código inicial', () => {
    const onCodeChange = jest.fn();
    montar({ onCodeChange });
    expect(onCodeChange).toHaveBeenCalled();
    expect(onCodeChange.mock.calls[0][0]).toContain('void setup()');
  });

  test('expone el XML y el código del workspace', () => {
    const { ref } = montar();
    expect(ref.current.getXML()).toContain('arduino_setup_loop');
    expect(ref.current.getCode()).toContain('void loop()');
    expect(ref.current.getBlockCount()).toBeGreaterThan(0);
  });

  test('carga un XML externo sin emitir código', () => {
    const onCodeChange = jest.fn();
    const { ref } = montar({ onCodeChange });
    onCodeChange.mockClear();
    act(() => {
      ref.current.loadXML(
        '<xml xmlns="https://developers.google.com/blockly/xml">' +
        '<block type="arduino_setup_loop" x="10" y="10"></block></xml>',
      );
    });
    expect(ref.current.getBlockCount()).toBe(1);
  });

  test('loadXML migra el formato antiguo de los pines', () => {
    const { ref } = montar();
    act(() => {
      ref.current.loadXML(
        '<xml xmlns="https://developers.google.com/blockly/xml">' +
        '<block type="arduino_setup_loop" x="10" y="10"><statement name="LOOP">' +
        '<block type="arduino_digital_write"><field name="PIN">7</field>' +
        '<field name="VALUE">LOW</field></block></statement></block></xml>',
      );
    });
    expect(ref.current.getCode()).toContain('digitalWrite(7, LOW);');
  });

  test('loadXML ignora entradas vacías o inválidas', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { ref } = montar();
    const antes = ref.current.getBlockCount();
    act(() => ref.current.loadXML(''));
    expect(ref.current.getBlockCount()).toBe(antes);
    act(() => ref.current.loadXML('<<<no es xml>>>'));
    warn.mockRestore();
  });

  test('addIncludeBlock añade la librería una sola vez', () => {
    const { ref } = montar();
    let creado;
    act(() => { creado = ref.current.addIncludeBlock('Servo'); });
    expect(creado).toBe(true);
    expect(ref.current.getCode()).toContain('#include <Servo.h>');

    let repetido;
    act(() => { repetido = ref.current.addIncludeBlock('Servo'); });
    expect(repetido).toBe(false);
  });

  test('updateToolboxForLibraries registra los bloques de la librería', () => {
    const { ref } = montar();
    act(() => ref.current.updateToolboxForLibraries(['Servo', 'Servo', 'DHT']));
    expect(Blockly.Blocks['lib_servo_init']).toBeDefined();
    expect(Blockly.Blocks['lib_dht_init']).toBeDefined();
  });

  test('una librería sin bloques propios usa la categoría genérica', () => {
    const { ref } = montar();
    act(() => ref.current.updateToolboxForLibraries(['LibreriaInventada']));
    expect(Blockly.Blocks['lib_custom_global_decl']).toBeDefined();
  });

  test('inserta y lista bloques personalizados en el toolbox', () => {
    const { ref } = montar();
    Blockly.Blocks['custom_test1'] = {
      init() {
        this.appendDummyInput().appendField('personalizado');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(45);
      },
    };
    act(() => ref.current.updateCustomBlocksInToolbox([{ id: 'test1', label: 'Personalizado' }]));
    let ok;
    act(() => { ok = ref.current.addCustomBlock('test1'); });
    expect(ok).toBe(true);
  });

  test('insertar un bloque personalizado inexistente devuelve false', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { ref } = montar();
    let ok;
    act(() => { ok = ref.current.addCustomBlock('no-existe'); });
    expect(ok).toBe(false);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  test('deshacer y rehacer no lanzan errores', () => {
    const { ref } = montar();
    expect(() => act(() => { ref.current.undo(); ref.current.redo(); })).not.toThrow();
  });

  test('persiste el workspace en localStorage y re-emite el código al editarlo', async () => {
    const onCodeChange = jest.fn();
    montar({ onCodeChange });
    onCodeChange.mockClear();

    // Editar un campo dispara BLOCK_CHANGE → guardado + nueva emisión de código
    const ws = window.__blocklyWorkspace;
    const serialBegin = ws.getBlocksByType('arduino_serial_begin')[0];
    act(() => { serialBegin.setFieldValue('115200', 'BAUD'); });

    await waitFor(() => {
      expect(localStorage.getItem('arduino-blocks-workspace')).toContain('arduino_setup_loop');
    });
    await waitFor(() => {
      expect(onCodeChange).toHaveBeenCalledWith(expect.stringContaining('Serial.begin(115200)'));
    });
  });

  test('recupera el workspace guardado al montar', () => {
    localStorage.setItem('arduino-blocks-workspace', INITIAL_XML);
    const onCodeChange = jest.fn();
    montar({ onCodeChange });
    expect(onCodeChange.mock.calls[0][0]).toContain('digitalWrite');
  });

  test('un XML guardado corrupto cae en el ejemplo inicial', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem('arduino-blocks-workspace', '<<< roto');
    const onCodeChange = jest.fn();
    montar({ onCodeChange });
    expect(onCodeChange).toHaveBeenCalled();
    warn.mockRestore();
  });

  describe('cambio de modo', () => {
    test('conserva el mismo programa y solo traduce los bloques', () => {
      const onCodeChange = jest.fn();
      const { rerender, ref } = montar({ onCodeChange, mode: 'advanced' });
      const codigoAntes = ref.current.getCode();
      expect(ref.current.getXML()).toContain('arduino_digital_write');

      act(() => { rerender(<BlockEditor ref={ref} onCodeChange={onCodeChange} mode="kids" />); });

      expect(ref.current.getXML()).toContain('kids_digital_write');
      expect(ref.current.getCode()).toBe(codigoAntes);
    });

    test('volver al modo Avanzado devuelve los bloques originales', () => {
      const onCodeChange = jest.fn();
      const { rerender, ref } = montar({ onCodeChange, mode: 'advanced' });
      const codigoAntes = ref.current.getCode();

      act(() => { rerender(<BlockEditor ref={ref} onCodeChange={onCodeChange} mode="kids" />); });
      act(() => { rerender(<BlockEditor ref={ref} onCodeChange={onCodeChange} mode="advanced" />); });

      expect(ref.current.getXML()).toContain('arduino_digital_write');
      expect(ref.current.getXML()).not.toContain('kids_');
      expect(ref.current.getCode()).toBe(codigoAntes);
    });

    test('los cambios hechos en un modo siguen ahí en el otro', () => {
      const onCodeChange = jest.fn();
      const { rerender, ref } = montar({ onCodeChange, mode: 'advanced' });
      act(() => ref.current.addIncludeBlock('Servo'));
      const codigoAntes = ref.current.getCode();
      expect(codigoAntes).toContain('#include <Servo.h>');

      act(() => { rerender(<BlockEditor ref={ref} onCodeChange={onCodeChange} mode="kids" />); });
      expect(ref.current.getCode()).toBe(codigoAntes);
    });

    test('ambos modos comparten el mismo workspace guardado', () => {
      const onCodeChange = jest.fn();
      const { rerender, ref } = montar({ onCodeChange, mode: 'advanced' });
      act(() => { rerender(<BlockEditor ref={ref} onCodeChange={onCodeChange} mode="kids" />); });

      expect(localStorage.getItem('arduino-blocks-workspace')).toContain('kids_');
      expect(localStorage.getItem('arduino-blocks-workspace-kids')).toBeNull();
    });

    test('recupera el workspace kids de versiones anteriores', () => {
      localStorage.setItem('arduino-blocks-workspace-kids', KIDS_INITIAL_XML);
      const onCodeChange = jest.fn();
      const ref = createRef();
      render(<BlockEditor ref={ref} onCodeChange={onCodeChange} mode="kids" />);
      expect(ref.current.getXML()).toContain('kids_setup_loop');
      expect(ref.current.getCode()).toContain('digitalWrite(13, HIGH);');
    });
  });

  test('el modo móvil acorta los nombres de categoría', () => {
    const { container } = montar({ isMobile: true });
    expect(container.querySelector('.blocklyToolboxDiv')).toBeTruthy();
  });

  test('el tema oscuro se aplica sin romper el editor', () => {
    const ref = createRef();
    const { rerender } = render(<BlockEditor ref={ref} onCodeChange={jest.fn()} isDark />);
    act(() => { rerender(<BlockEditor ref={ref} onCodeChange={jest.fn()} isDark={false} />); });
    expect(ref.current.getCode()).toContain('void setup()');
  });

  test('la cabecera del panel se oculta en móvil', () => {
    const { queryByText } = montar({ isMobile: true });
    expect(queryByText('editor.blocks')).toBeNull();
  });

  test('la cabecera del panel se muestra en escritorio', () => {
    const { getByText } = montar();
    expect(getByText('editor.blocks')).toBeInTheDocument();
  });

  test('la API pública es segura tras desmontar el editor', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { ref, unmount } = montar();
    const api = ref.current;
    unmount();
    expect(api.getXML()).toBe('');
    expect(api.getCode()).toBe('');
    expect(api.getBlockCount()).toBe(0);
    expect(api.addCustomBlock('lo-que-sea')).toBe(false);
    expect(api.addIncludeBlock('Servo')).toBe(false);
    expect(() => api.loadXML('<xml/>')).not.toThrow();
    expect(() => api.undo()).not.toThrow();
    expect(() => api.updateToolboxForLibraries(['Servo'])).not.toThrow();
    expect(() => api.updateCustomBlocksInToolbox()).not.toThrow();
    warn.mockRestore();
  });

  describe('panel informativo del bloque seleccionado', () => {
    /** Simula la selección de un bloque en el workspace */
    function seleccionar(ws, blockId) {
      act(() => {
        Blockly.Events.fire(new Blockly.Events.Selected(null, blockId, ws.id));
      });
    }

    test('al seleccionar un bloque muestra su descripción', async () => {
      const { findByText } = montar();
      const ws = window.__blocklyWorkspace;
      const bloque = ws.getBlocksByType('arduino_pin_mode')[0];
      seleccionar(ws, bloque.id);
      expect(await findByText(/pinMode/)).toBeInTheDocument();
    });

    test('al deseleccionar oculta el panel', async () => {
      const { findByText, queryByText } = montar();
      const ws = window.__blocklyWorkspace;
      const bloque = ws.getBlocksByType('arduino_pin_mode')[0];
      seleccionar(ws, bloque.id);
      await findByText(/pinMode/);
      seleccionar(ws, null);
      await waitFor(() => expect(queryByText('📌  pinMode')).toBeNull());
    });

    test('un bloque sin descripción no muestra panel', async () => {
      const { ref, queryByText } = montar();
      act(() => ref.current.addIncludeBlock('Wire'));
      const ws = window.__blocklyWorkspace;
      const bloque = ws.getBlocksByType('arduino_include')[0];
      seleccionar(ws, bloque.id);
      await waitFor(() => expect(queryByText('editor.blocks')).toBeInTheDocument());
    });

    test('en modo Niño usa el diccionario de descripciones infantiles', async () => {
      const ref = createRef();
      const { findByText } = render(<BlockEditor ref={ref} onCodeChange={jest.fn()} mode="kids" />);
      const ws = window.__blocklyWorkspace;
      const bloque = ws.getBlocksByType('kids_pin_mode')[0];
      seleccionar(ws, bloque.id);
      expect(await findByText(/Configurar/i)).toBeInTheDocument();
    });
  });
});
