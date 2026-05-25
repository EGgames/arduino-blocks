import { renderHook, act } from '@testing-library/react';
import { useSettings, DEFAULT_SETTINGS } from './useSettings';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const LS_KEY = 'arduino-blocks-settings';

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem:   (k)    => store[k] ?? null,
    setItem:   (k, v) => { store[k] = String(v); },
    removeItem:(k)    => { delete store[k]; },
    clear:     ()     => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock de matchMedia (preferencia de sistema)
let _systemDark = false;
const mqListeners = [];

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    get matches() { return _systemDark; },
    media: query,
    addEventListener:    (_, fn) => mqListeners.push(fn),
    removeEventListener: (_, fn) => {
      const i = mqListeners.indexOf(fn);
      if (i !== -1) mqListeners.splice(i, 1);
    },
    dispatchEvent: () => {},
  }),
});

const triggerSystemDarkChange = (isDark) => {
  _systemDark = isDark;
  mqListeners.forEach((fn) => fn({ matches: isDark }));
};

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  localStorageMock.clear();
  _systemDark = false;
  mqListeners.length = 0;
});

// ─── Valores por defecto ──────────────────────────────────────────────────────

describe('DEFAULT_SETTINGS', () => {
  test('tiene los campos requeridos', () => {
    expect(DEFAULT_SETTINGS).toHaveProperty('theme');
    expect(DEFAULT_SETTINGS).toHaveProperty('fontSize');
    expect(DEFAULT_SETTINGS).toHaveProperty('comPort');
    expect(DEFAULT_SETTINGS).toHaveProperty('board');
  });

  test('tema por defecto es dark', () => {
    expect(DEFAULT_SETTINGS.theme).toBe('dark');
  });

  test('placa por defecto es Arduino Uno', () => {
    expect(DEFAULT_SETTINGS.board).toBe('arduino:avr:uno');
  });

  test('fontSize por defecto es 13', () => {
    expect(DEFAULT_SETTINGS.fontSize).toBe(13);
  });

  test('comPort por defecto está vacío', () => {
    expect(DEFAULT_SETTINGS.comPort).toBe('');
  });
});

// ─── Carga inicial ────────────────────────────────────────────────────────────

describe('useSettings — carga inicial', () => {
  test('devuelve los valores por defecto si localStorage está vacío', () => {
    const { result } = renderHook(() => useSettings());
    const [settings] = result.current;
    expect(settings).toMatchObject(DEFAULT_SETTINGS);
  });

  test('carga valores guardados desde localStorage', () => {
    localStorageMock.setItem(LS_KEY, JSON.stringify({ theme: 'light', fontSize: 16 }));
    const { result } = renderHook(() => useSettings());
    const [settings] = result.current;
    expect(settings.theme).toBe('light');
    expect(settings.fontSize).toBe(16);
  });

  test('combina localStorage con defaults para campos faltantes', () => {
    localStorageMock.setItem(LS_KEY, JSON.stringify({ fontSize: 18 }));
    const { result } = renderHook(() => useSettings());
    const [settings] = result.current;
    // fontSize viene de localStorage
    expect(settings.fontSize).toBe(18);
    // board viene del default
    expect(settings.board).toBe(DEFAULT_SETTINGS.board);
  });

  test('JSON inválido en localStorage usa los defaults', () => {
    localStorageMock.setItem(LS_KEY, '{invalid json');
    const { result } = renderHook(() => useSettings());
    const [settings] = result.current;
    expect(settings).toMatchObject(DEFAULT_SETTINGS);
  });
});

// ─── Retorno del hook ─────────────────────────────────────────────────────────

describe('useSettings — retorno', () => {
  test('retorna un array de 3 elementos', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current).toHaveLength(3);
  });

  test('el primer elemento es el objeto settings', () => {
    const { result } = renderHook(() => useSettings());
    expect(typeof result.current[0]).toBe('object');
  });

  test('el segundo elemento es una función', () => {
    const { result } = renderHook(() => useSettings());
    expect(typeof result.current[1]).toBe('function');
  });

  test('el tercer elemento es boolean', () => {
    const { result } = renderHook(() => useSettings());
    expect(typeof result.current[2]).toBe('boolean');
  });
});

// ─── Función set ──────────────────────────────────────────────────────────────

describe('useSettings — función set', () => {
  test('actualiza el estado con patch parcial', () => {
    const { result } = renderHook(() => useSettings());
    act(() => { result.current[1]({ fontSize: 16 }); });
    expect(result.current[0].fontSize).toBe(16);
  });

  test('preserva los campos no incluidos en el patch', () => {
    const { result } = renderHook(() => useSettings());
    act(() => { result.current[1]({ fontSize: 14 }); });
    expect(result.current[0].board).toBe(DEFAULT_SETTINGS.board);
    expect(result.current[0].theme).toBe(DEFAULT_SETTINGS.theme);
  });

  test('persiste el cambio en localStorage', () => {
    const { result } = renderHook(() => useSettings());
    act(() => { result.current[1]({ comPort: 'COM3' }); });
    const stored = JSON.parse(localStorageMock.getItem(LS_KEY));
    expect(stored.comPort).toBe('COM3');
  });

  test('múltiples actualizaciones se acumulan correctamente', () => {
    const { result } = renderHook(() => useSettings());
    act(() => { result.current[1]({ fontSize: 15 }); });
    act(() => { result.current[1]({ board: 'arduino:avr:mega' }); });
    expect(result.current[0].fontSize).toBe(15);
    expect(result.current[0].board).toBe('arduino:avr:mega');
  });
});

// ─── isDark ───────────────────────────────────────────────────────────────────

describe('useSettings — isDark', () => {
  test('tema dark → isDark = true', () => {
    const { result } = renderHook(() => useSettings());
    // default es 'dark'
    expect(result.current[2]).toBe(true);
  });

  test('tema light → isDark = false', () => {
    localStorageMock.setItem(LS_KEY, JSON.stringify({ theme: 'light' }));
    const { result } = renderHook(() => useSettings());
    expect(result.current[2]).toBe(false);
  });

  test('tema system + sistema oscuro → isDark = true', () => {
    _systemDark = true;
    localStorageMock.setItem(LS_KEY, JSON.stringify({ theme: 'system' }));
    const { result } = renderHook(() => useSettings());
    expect(result.current[2]).toBe(true);
  });

  test('tema system + sistema claro → isDark = false', () => {
    _systemDark = false;
    localStorageMock.setItem(LS_KEY, JSON.stringify({ theme: 'system' }));
    const { result } = renderHook(() => useSettings());
    expect(result.current[2]).toBe(false);
  });

  test('cambiar tema via set actualiza isDark inmediatamente', () => {
    const { result } = renderHook(() => useSettings());
    // Empieza en dark → isDark = true
    expect(result.current[2]).toBe(true);
    act(() => { result.current[1]({ theme: 'light' }); });
    expect(result.current[2]).toBe(false);
    act(() => { result.current[1]({ theme: 'dark' }); });
    expect(result.current[2]).toBe(true);
  });

  test('tema system reacciona al cambio de preferencia del OS', () => {
    localStorageMock.setItem(LS_KEY, JSON.stringify({ theme: 'system' }));
    const { result } = renderHook(() => useSettings());
    // Sistema claro → false
    expect(result.current[2]).toBe(false);
    // Simular que el OS cambia a oscuro
    act(() => { triggerSystemDarkChange(true); });
    expect(result.current[2]).toBe(true);
    // Simular que vuelve a claro
    act(() => { triggerSystemDarkChange(false); });
    expect(result.current[2]).toBe(false);
  });
});
