// ── Sistema de Logros para Modo Niño ─────────────────────────────────────────
// Persiste insignias en localStorage y expone { badges, unlock }
import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'arduino-blocks-achievements';

export const BADGE_DEFS = [
  {
    id: 'primer_bloque',
    emoji: '🧱',
    title: '¡Primer Bloque!',
    desc: 'Pusiste tu primer bloque en el tablero.',
  },
  {
    id: 'primera_carga',
    emoji: '🚀',
    title: '¡Lanzado!',
    desc: 'Subiste tu primer programa al Arduino.',
  },
  {
    id: 'primer_proyecto',
    emoji: '🗂️',
    title: '¡Explorador!',
    desc: 'Cargaste un proyecto de ejemplo.',
  },
  {
    id: 'semaforo',
    emoji: '🚦',
    title: '¡Semáforo!',
    desc: 'Completaste el proyecto Semáforo.',
  },
  {
    id: 'musica',
    emoji: '🎵',
    title: '¡Músico!',
    desc: 'Cargaste el proyecto de Melodía.',
  },
  {
    id: 'neopixel',
    emoji: '🌈',
    title: '¡Arcoíris!',
    desc: 'Usaste LEDs de colores NeoPixel.',
  },
  {
    id: 'cinco_bloques',
    emoji: '⭐',
    title: '¡Cinco Bloques!',
    desc: 'Pusiste 5 bloques en el tablero.',
  },
  {
    id: 'diez_bloques',
    emoji: '🌟',
    title: '¡Diez Bloques!',
    desc: 'Pusiste 10 bloques en el tablero.',
  },
  {
    id: 'serial',
    emoji: '💬',
    title: '¡Comunicador!',
    desc: 'Usaste el bloque de mensaje serial.',
  },
  {
    id: 'piano',
    emoji: '🎹',
    title: '¡Pianista!',
    desc: 'Cargaste el proyecto Piano de Botones.',
  },
  {
    id: 'morse',
    emoji: '📡',
    title: '¡Explorador Morse!',
    desc: 'Cargaste el proyecto de Código Morse.',
  },
  {
    id: 'alarma',
    emoji: '🚨',
    title: '¡Guardián!',
    desc: 'Cargaste el proyecto de Alarma con Sensor.',
  },
  {
    id: 'dado',
    emoji: '🎲',
    title: '¡Jugador!',
    desc: 'Cargaste el proyecto de Dado Electrónico.',
  },
  {
    id: 'brillo',
    emoji: '🔆',
    title: '¡Artista de Luz!',
    desc: 'Cargaste el proyecto Control de Brillo.',
  },
  {
    id: 'termometro',
    emoji: '🌡️',
    title: '¡Científico!',
    desc: 'Cargaste el proyecto LED Termómetro.',
  },
  {
    id: 'ayuda',
    emoji: '📖',
    title: '¡Curioso!',
    desc: 'Abriste la sección de Ayuda por primera vez.',
  },
  {
    id: 'veinte_bloques',
    emoji: '💎',
    title: '¡Constructor!',
    desc: 'Pusiste 20 bloques en el tablero a la vez.',
  },
  {
    id: 'guardian',
    emoji: '🏆',
    title: '¡Maestro Arduino!',
    desc: 'Desbloqueaste todos los demás logros. ¡Increíble!',
  },
];

function loadBadges() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveBadges(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage lleno o bloqueado
  }
}

export function useKidsAchievements() {
  const [badges, setBadges] = useState(() => loadBadges());
  const [newBadge, setNewBadge] = useState(null); // badge recién desbloqueado para notificación

  const unlock = useCallback((badgeId) => {
    setBadges((prev) => {
      if (prev[badgeId]) return prev; // ya desbloqueado
      const updated = { ...prev, [badgeId]: Date.now() };

      // Comprobar si se desbloquean todos (excepto guardian)
      const allExceptGuardian = BADGE_DEFS.filter((b) => b.id !== 'guardian');
      const allDone = allExceptGuardian.every((b) => updated[b.id]);
      if (allDone && !updated['guardian']) {
        updated['guardian'] = Date.now();
      }

      saveBadges(updated);
      const def = BADGE_DEFS.find((b) => b.id === badgeId);
      if (def) setNewBadge(def);
      return updated;
    });
  }, []);

  const clearNewBadge = useCallback(() => setNewBadge(null), []);

  const resetAll = useCallback(() => {
    saveBadges({});
    setBadges({});
  }, []);

  // Sincroniza si otra pestaña/ventana modifica el storage
  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEY) setBadges(loadBadges());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return { badges, unlock, newBadge, clearNewBadge, resetAll };
}
