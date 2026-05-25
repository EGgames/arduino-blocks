import { useState, useCallback, useRef } from 'react';
import { codeToXML } from '../utils/xmlGenerator';

// Debounce genérico con método .cancel()
function debounce(fn, ms) {
  let timer;
  const debouncedFn = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  debouncedFn.cancel = () => clearTimeout(timer);
  return debouncedFn;
}

/**
 * Hook que gestiona la sincronización bidireccional bloques ↔ código.
 *
 * @param {React.RefObject} blockEditorRef - ref al componente BlockEditor
 * @param {Function} setCode              - setter del estado de código en App
 * @returns {{ syncStatus, handleBlockCodeChange, handleCodeEditorChange, parseAndUpdateBlocks }}
 */
export function useBidirectionalSync(blockEditorRef, setCode) {
  const [syncStatus, setSyncStatus] = useState('ok');

  // true mientras actualizamos el editor de código desde bloques (evita ciclo)
  const fromBlocksRef = useRef(false);
  // true cuando el usuario editó código que aún no se pudo parsear a bloques
  const codeEditorActiveRef = useRef(false);

  // ── Bloques → Código ─────────────────────────────────────────────────────

  const handleBlockCodeChange = useCallback((newCode) => {
    if (codeEditorActiveRef.current) return;
    fromBlocksRef.current = true;
    setCode(newCode);
    setSyncStatus('ok');
    setTimeout(() => { fromBlocksRef.current = false; }, 0);
  }, [setCode]);

  // ── Código → Bloques (debounced 700 ms) ─────────────────────────────────

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const parseAndUpdateBlocks = useCallback(
    debounce((newCode) => {
      if (fromBlocksRef.current) return;
      setSyncStatus('syncing');
      try {
        const xml = codeToXML(newCode);
        if (xml) {
          codeEditorActiveRef.current = false;
          blockEditorRef.current?.loadXML(xml);
          setSyncStatus('ok');
        } else {
          if (!newCode.trim()) codeEditorActiveRef.current = false;
          setSyncStatus(newCode.trim() ? 'error' : 'ok');
        }
      } catch (e) {
        console.warn('[useBidirectionalSync] Error parseando código:', e);
        setSyncStatus('error');
      }
    }, 700),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── CodeEditor onChange ───────────────────────────────────────────────────

  const handleCodeEditorChange = useCallback((newCode) => {
    if (fromBlocksRef.current) return;
    codeEditorActiveRef.current = true;
    setCode(newCode);
    setSyncStatus('syncing');
    parseAndUpdateBlocks(newCode);
  }, [parseAndUpdateBlocks, setCode]);

  return {
    syncStatus,
    handleBlockCodeChange,
    handleCodeEditorChange,
    parseAndUpdateBlocks,
  };
}
