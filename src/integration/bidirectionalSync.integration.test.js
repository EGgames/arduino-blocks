/**
 * Tests de integración: useBidirectionalSync
 *
 * Verifica la integración del hook con codeParser, xmlGenerator y el
 * blockEditorRef. Prueba los flujos de sincronización bidireccional
 * bloques → código y código → bloques.
 */

import { renderHook, act } from '@testing-library/react';
import { useBidirectionalSync } from '../hooks/useBidirectionalSync';

// ─── Configuración de fake timers ─────────────────────────────────────────────

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_SKETCH = `
  void setup() { pinMode(13, OUTPUT); delay(100); }
  void loop()   { digitalWrite(13, HIGH); delay(500); }
`;

const INVALID_SKETCH = 'esto no es arduino c++';

function makeHook() {
  const setCode = jest.fn();
  const blockEditorRef = { current: { loadXML: jest.fn() } };
  const hook = renderHook(() => useBidirectionalSync(blockEditorRef, setCode));
  return { hook, setCode, blockEditorRef };
}

// ─── Estado inicial ───────────────────────────────────────────────────────────

describe('useBidirectionalSync — estado inicial', () => {
  test('syncStatus inicia en "ok"', () => {
    const { hook } = makeHook();
    expect(hook.result.current.syncStatus).toBe('ok');
  });

  test('retorna las 4 funciones esperadas', () => {
    const { hook } = makeHook();
    const { syncStatus, handleBlockCodeChange, handleCodeEditorChange, parseAndUpdateBlocks } =
      hook.result.current;
    expect(typeof syncStatus).toBe('string');
    expect(typeof handleBlockCodeChange).toBe('function');
    expect(typeof handleCodeEditorChange).toBe('function');
    expect(typeof parseAndUpdateBlocks).toBe('function');
  });

  test('parseAndUpdateBlocks tiene método .cancel()', () => {
    const { hook } = makeHook();
    expect(typeof hook.result.current.parseAndUpdateBlocks.cancel).toBe('function');
  });
});

// ─── Bloques → Código ─────────────────────────────────────────────────────────

describe('useBidirectionalSync — handleBlockCodeChange', () => {
  test('llama a setCode con el código recibido', () => {
    const { hook, setCode } = makeHook();
    act(() => { hook.result.current.handleBlockCodeChange('int x = 5;'); });
    expect(setCode).toHaveBeenCalledWith('int x = 5;');
  });

  test('establece syncStatus en "ok"', () => {
    const { hook } = makeHook();
    act(() => { hook.result.current.handleBlockCodeChange(VALID_SKETCH); });
    expect(hook.result.current.syncStatus).toBe('ok');
  });

  test('no llama a loadXML (solo actualiza código, no genera bloques)', () => {
    const { hook, blockEditorRef } = makeHook();
    act(() => {
      hook.result.current.handleBlockCodeChange(VALID_SKETCH);
      jest.runAllTimers();
    });
    expect(blockEditorRef.current.loadXML).not.toHaveBeenCalled();
  });

  test('puede llamarse múltiples veces sin error', () => {
    const { hook, setCode } = makeHook();
    act(() => {
      hook.result.current.handleBlockCodeChange('void setup(){}');
      hook.result.current.handleBlockCodeChange('void setup(){ delay(1); }');
    });
    expect(setCode).toHaveBeenCalledTimes(2);
  });
});

// ─── Código → Bloques ─────────────────────────────────────────────────────────

describe('useBidirectionalSync — handleCodeEditorChange', () => {
  test('llama a setCode con el código recibido', () => {
    const { hook, setCode } = makeHook();
    act(() => { hook.result.current.handleCodeEditorChange(VALID_SKETCH); });
    expect(setCode).toHaveBeenCalledWith(VALID_SKETCH);
  });

  test('establece syncStatus en "syncing" inmediatamente', () => {
    const { hook } = makeHook();
    act(() => { hook.result.current.handleCodeEditorChange(VALID_SKETCH); });
    expect(hook.result.current.syncStatus).toBe('syncing');
  });

  test('después de 700 ms con código válido → loadXML es llamado', () => {
    const { hook, blockEditorRef } = makeHook();
    act(() => {
      hook.result.current.handleCodeEditorChange(VALID_SKETCH);
      jest.advanceTimersByTime(700);
    });
    expect(blockEditorRef.current.loadXML).toHaveBeenCalledTimes(1);
  });

  test('después de 700 ms con código válido → syncStatus vuelve a "ok"', () => {
    const { hook } = makeHook();
    act(() => {
      hook.result.current.handleCodeEditorChange(VALID_SKETCH);
      jest.advanceTimersByTime(700);
    });
    expect(hook.result.current.syncStatus).toBe('ok');
  });

  test('después de 700 ms con código inválido → loadXML NO es llamado', () => {
    const { hook, blockEditorRef } = makeHook();
    act(() => {
      hook.result.current.handleCodeEditorChange(INVALID_SKETCH);
      jest.advanceTimersByTime(700);
    });
    expect(blockEditorRef.current.loadXML).not.toHaveBeenCalled();
  });

  test('después de 700 ms con código inválido → syncStatus = "error"', () => {
    const { hook } = makeHook();
    act(() => {
      hook.result.current.handleCodeEditorChange(INVALID_SKETCH);
      jest.advanceTimersByTime(700);
    });
    expect(hook.result.current.syncStatus).toBe('error');
  });

  test('código vacío después de 700 ms → syncStatus = "ok" (no error)', () => {
    const { hook } = makeHook();
    act(() => {
      hook.result.current.handleCodeEditorChange('');
      jest.advanceTimersByTime(700);
    });
    expect(hook.result.current.syncStatus).toBe('ok');
  });

  test('XML pasado a loadXML contiene el sketch parseado', () => {
    const { hook, blockEditorRef } = makeHook();
    act(() => {
      hook.result.current.handleCodeEditorChange(VALID_SKETCH);
      jest.advanceTimersByTime(700);
    });
    const xmlArg = blockEditorRef.current.loadXML.mock.calls[0][0];
    expect(xmlArg).toContain('<xml');
    expect(xmlArg).toContain('arduino_setup_loop');
    expect(xmlArg).toContain('arduino_pin_mode');
  });
});

// ─── Debounce ─────────────────────────────────────────────────────────────────

describe('useBidirectionalSync — debounce', () => {
  test('múltiples cambios rápidos → solo un loadXML al final', () => {
    const { hook, blockEditorRef } = makeHook();
    act(() => {
      hook.result.current.handleCodeEditorChange('void setup(){ delay(1); } void loop(){}');
      jest.advanceTimersByTime(100);
      hook.result.current.handleCodeEditorChange('void setup(){ delay(10); } void loop(){}');
      jest.advanceTimersByTime(100);
      hook.result.current.handleCodeEditorChange(VALID_SKETCH);
      jest.advanceTimersByTime(700);
    });
    expect(blockEditorRef.current.loadXML).toHaveBeenCalledTimes(1);
  });

  test('antes de 700 ms loadXML no se llama', () => {
    const { hook, blockEditorRef } = makeHook();
    act(() => {
      hook.result.current.handleCodeEditorChange(VALID_SKETCH);
      jest.advanceTimersByTime(699);
    });
    expect(blockEditorRef.current.loadXML).not.toHaveBeenCalled();
  });
});

// ─── Anti-ciclo ───────────────────────────────────────────────────────────────

describe('useBidirectionalSync — guard anti-ciclo', () => {
  test('handleCodeEditorChange ignorado si fromBlocks es verdadero', () => {
    const { hook, setCode } = makeHook();

    // Simular que los bloques están actualizando el código
    act(() => {
      hook.result.current.handleBlockCodeChange(VALID_SKETCH); // pone fromBlocks=true
      // Intentar cambiar el editor al mismo tiempo
      hook.result.current.handleCodeEditorChange('int x=0;');
    });

    // setCode solo debe haberse llamado 1 vez (por handleBlockCodeChange)
    expect(setCode).toHaveBeenCalledTimes(1);
    expect(setCode).toHaveBeenCalledWith(VALID_SKETCH);
  });
});

// ─── parseAndUpdateBlocks directo ─────────────────────────────────────────────

describe('useBidirectionalSync — parseAndUpdateBlocks directo', () => {
  test('con código válido llama a loadXML tras avanzar el timer', () => {
    const { hook, blockEditorRef } = makeHook();
    act(() => {
      hook.result.current.parseAndUpdateBlocks(VALID_SKETCH);
      jest.advanceTimersByTime(700);
    });
    expect(blockEditorRef.current.loadXML).toHaveBeenCalledTimes(1);
  });

  test('.cancel() detiene el debounce pendiente', () => {
    const { hook, blockEditorRef } = makeHook();
    act(() => {
      hook.result.current.parseAndUpdateBlocks(VALID_SKETCH);
      hook.result.current.parseAndUpdateBlocks.cancel();
      jest.advanceTimersByTime(1000);
    });
    expect(blockEditorRef.current.loadXML).not.toHaveBeenCalled();
  });
});
