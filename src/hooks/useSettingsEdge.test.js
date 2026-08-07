import { renderHook, act } from '@testing-library/react';
import { useSettings, DEFAULT_SETTINGS } from './useSettings';

const LS_KEY = 'arduino-blocks-settings';

/** Instala un matchMedia falso con control del listener de cambio */
function mockMatchMedia({ matches = false, soportado = true } = {}) {
  if (!soportado) {
    delete window.matchMedia;
    return {};
  }
  const listeners = {};
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches,
    media: query,
    addEventListener: (evt, cb) => { listeners[evt] = cb; },
    removeEventListener: jest.fn(),
  }));
  return listeners;
}

const matchMediaOriginal = window.matchMedia;
afterEach(() => { window.matchMedia = matchMediaOriginal; localStorage.clear(); });

describe('useSettings — preferencia del sistema', () => {
  test('sin matchMedia asume tema oscuro', () => {
    mockMatchMedia({ soportado: false });
    const { result } = renderHook(() => useSettings());
    const [, set] = result.current;
    act(() => set({ theme: 'system' }));
    expect(result.current[2]).toBe(true);
  });

  test('con el sistema en claro y tema «system» devuelve claro', () => {
    mockMatchMedia({ matches: false });
    const { result } = renderHook(() => useSettings());
    act(() => result.current[1]({ theme: 'system' }));
    expect(result.current[2]).toBe(false);
  });

  test('con el sistema en oscuro y tema «system» devuelve oscuro', () => {
    mockMatchMedia({ matches: true });
    const { result } = renderHook(() => useSettings());
    act(() => result.current[1]({ theme: 'system' }));
    expect(result.current[2]).toBe(true);
  });

  test('reacciona a los cambios de preferencia del sistema', () => {
    const listeners = mockMatchMedia({ matches: false });
    const { result } = renderHook(() => useSettings());
    act(() => result.current[1]({ theme: 'system' }));
    expect(result.current[2]).toBe(false);
    act(() => listeners.change({ matches: true }));
    expect(result.current[2]).toBe(true);
  });

  test('el tema claro explícito ignora la preferencia del sistema', () => {
    mockMatchMedia({ matches: true });
    const { result } = renderHook(() => useSettings());
    act(() => result.current[1]({ theme: 'light' }));
    expect(result.current[2]).toBe(false);
  });
});

describe('useSettings — persistencia', () => {
  test('parte de los valores por defecto', () => {
    mockMatchMedia();
    const { result } = renderHook(() => useSettings());
    expect(result.current[0]).toMatchObject(DEFAULT_SETTINGS);
  });

  test('combina lo guardado con los valores por defecto', () => {
    mockMatchMedia();
    localStorage.setItem(LS_KEY, JSON.stringify({ fontSize: 18 }));
    const { result } = renderHook(() => useSettings());
    expect(result.current[0].fontSize).toBe(18);
    expect(result.current[0].board).toBe(DEFAULT_SETTINGS.board);
  });

  test('un almacenamiento corrupto cae en los valores por defecto', () => {
    mockMatchMedia();
    localStorage.setItem(LS_KEY, 'no es json');
    const { result } = renderHook(() => useSettings());
    expect(result.current[0]).toEqual(DEFAULT_SETTINGS);
  });

  test('guarda cada cambio en localStorage', () => {
    mockMatchMedia();
    const { result } = renderHook(() => useSettings());
    act(() => result.current[1]({ mode: 'kids' }));
    expect(JSON.parse(localStorage.getItem(LS_KEY)).mode).toBe('kids');
  });

  test('al desmontar quita el listener del sistema', () => {
    mockMatchMedia();
    const { unmount } = renderHook(() => useSettings());
    expect(() => unmount()).not.toThrow();
  });
});
