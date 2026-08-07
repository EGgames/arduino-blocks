import { renderHook, act } from '@testing-library/react';
import { useKidsAchievements, BADGE_DEFS } from './useKidsAchievements';

const STORAGE_KEY = 'arduino-blocks-achievements';

describe('useKidsAchievements', () => {
  beforeEach(() => { localStorage.clear(); });

  test('arranca sin insignias', () => {
    const { result } = renderHook(() => useKidsAchievements());
    expect(result.current.badges).toEqual({});
    expect(result.current.newBadge).toBeNull();
  });

  test('desbloquea una insignia y la persiste', () => {
    const { result } = renderHook(() => useKidsAchievements());
    act(() => result.current.unlock('primer_bloque'));
    expect(result.current.badges.primer_bloque).toBeTruthy();
    expect(result.current.newBadge.id).toBe('primer_bloque');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).primer_bloque).toBeTruthy();
  });

  test('desbloquear dos veces no cambia el estado', () => {
    const { result } = renderHook(() => useKidsAchievements());
    act(() => result.current.unlock('serial'));
    const primero = result.current.badges.serial;
    act(() => result.current.unlock('serial'));
    expect(result.current.badges.serial).toBe(primero);
  });

  test('ignora identificadores desconocidos para la notificación', () => {
    const { result } = renderHook(() => useKidsAchievements());
    act(() => result.current.unlock('inexistente'));
    expect(result.current.newBadge).toBeNull();
    expect(result.current.badges.inexistente).toBeTruthy();
  });

  test('clearNewBadge limpia la notificación', () => {
    const { result } = renderHook(() => useKidsAchievements());
    act(() => result.current.unlock('musica'));
    act(() => result.current.clearNewBadge());
    expect(result.current.newBadge).toBeNull();
  });

  test('al completar todas las demás se otorga la insignia final', () => {
    const { result } = renderHook(() => useKidsAchievements());
    const restantes = BADGE_DEFS.filter((b) => b.id !== 'guardian');
    act(() => { restantes.forEach((b) => result.current.unlock(b.id)); });
    expect(result.current.badges.guardian).toBeTruthy();
  });

  test('resetAll borra todo', () => {
    const { result } = renderHook(() => useKidsAchievements());
    act(() => result.current.unlock('dado'));
    act(() => result.current.resetAll());
    expect(result.current.badges).toEqual({});
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{}');
  });

  test('carga las insignias guardadas previamente', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ piano: 123 }));
    const { result } = renderHook(() => useKidsAchievements());
    expect(result.current.badges.piano).toBe(123);
  });

  test('un storage corrupto no rompe el arranque', () => {
    localStorage.setItem(STORAGE_KEY, '{no es json');
    const { result } = renderHook(() => useKidsAchievements());
    expect(result.current.badges).toEqual({});
  });

  test('se sincroniza cuando otra pestaña modifica el storage', () => {
    const { result } = renderHook(() => useKidsAchievements());
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ morse: 999 }));
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    });
    expect(result.current.badges.morse).toBe(999);
  });

  test('ignora eventos de storage de otras claves', () => {
    const { result } = renderHook(() => useKidsAchievements());
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'otra-clave' }));
    });
    expect(result.current.badges).toEqual({});
  });

  test('las definiciones de insignia están bien formadas', () => {
    expect(BADGE_DEFS.length).toBeGreaterThan(10);
    for (const b of BADGE_DEFS) {
      expect(b.id).toBeTruthy();
      expect(b.emoji).toBeTruthy();
      expect(b.title).toBeTruthy();
      expect(b.desc).toBeTruthy();
    }
    expect(new Set(BADGE_DEFS.map((b) => b.id)).size).toBe(BADGE_DEFS.length);
  });
});
