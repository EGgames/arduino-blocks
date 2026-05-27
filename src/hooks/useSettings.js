import { useState, useCallback, useEffect } from 'react';

const LS_KEY = 'arduino-blocks-settings';

export const DEFAULT_SETTINGS = {
  theme:    'dark',             // 'dark' | 'light' | 'system'
  fontSize: 13,                 // tamaño fuente Monaco
  comPort:  '',                 // puerto COM seleccionado
  board:    'arduino:avr:uno',  // placa seleccionada
  mode:     'advanced',         // 'advanced' | 'kids'
};

export function useSettings() {
  const [settings, _set] = useState(() => {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(LS_KEY) || '{}') };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Detectar preferencia del sistema operativo
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true,
  );

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const fn = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const set = useCallback((patch) => {
    _set((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' && systemDark);

  return [settings, set, isDark];
}
