import React, { useRef, useEffect, useCallback, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SyncAltIcon from '@mui/icons-material/SyncAlt';

/**
 * Editor de código Monaco con sincronización bidireccional.
 *
 * Props:
 *   code        - string: valor actual del código
 *   onChange    - (newCode: string) => void  — sólo se llama cuando el USUARIO edita
 *   syncStatus  - 'ok' | 'error' | 'syncing'
 *   fontSize    - number (default 13)
 *   colorTheme  - 'dark' | 'light' (default 'dark')
 */
export default function CodeEditor({ code, onChange, syncStatus = 'ok', fontSize = 13, colorTheme = 'dark' }) {
  const editorRef   = useRef(null);
  const monacoRef   = useRef(null);
  const extUpdate   = useRef(false);  // true mientras aplicamos un update externo
  const codeRef     = useRef(code);   // ref siempre actualizada con el prop code
  const completionDisposableRef = useRef(null); // para limpiar el provider al desmontar
  const [copied, setCopied] = useState(false);

  // Mantener codeRef al día
  useEffect(() => { codeRef.current = code; }, [code]);

  // Actualizar tamaño de fuente cuando cambia el prop
  useEffect(() => {
    editorRef.current?.updateOptions({ fontSize });
  }, [fontSize]);

  // Actualizar tema cuando cambia colorTheme
  useEffect(() => {
    if (!monacoRef.current) return;
    monacoRef.current.editor.setTheme(colorTheme === 'light' ? 'vs' : 'arduino-dark');
  }, [colorTheme]);

  // Limpiar completion provider al desmontar el componente
  useEffect(() => () => { completionDisposableRef.current?.dispose(); }, []);

  // ── Montar editor ──────────────────────────────────────────────────────────

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current  = editor;
    monacoRef.current  = monaco;

    // Palabras clave de Arduino para autocompletado
    const ARDUINO_COMPLETIONS = [
      'digitalWrite','digitalRead','analogWrite','analogRead','pinMode',
      'delay','delayMicroseconds','millis','micros','tone','noTone',
      'map','constrain','abs','min','max','sqrt','pow','sin','cos','tan',
      'Serial','Serial.begin','Serial.print','Serial.println','Serial.read',
      'HIGH','LOW','INPUT','OUTPUT','INPUT_PULLUP',
      'LED_BUILTIN','A0','A1','A2','A3','A4','A5',
    ];

    completionDisposableRef.current = monaco.languages.registerCompletionItemProvider('cpp', {
      provideCompletionItems: (_model, _pos) => ({
        suggestions: ARDUINO_COMPLETIONS.map((kw) => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: kw,
          detail: 'Arduino',
        })),
      }),
    });

    // Colorear HIGH/LOW/etc. en el tema oscuro
    monaco.editor.defineTheme('arduino-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'identifier.cpp', foreground: 'd4d4d4' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
      },
    });
    editor.updateOptions({ theme: 'arduino-dark' });

    // Sincronizar código que llegó antes de que Monaco terminara de cargar
    if (codeRef.current) {
      const model = editor.getModel();
      if (model && model.getValue() !== codeRef.current) {
        extUpdate.current = true;
        model.setValue(codeRef.current);
        extUpdate.current = false;
      }
    }
  }, []);

  // ── Sincronizar prop → editor (cambio externo, p.ej. desde bloques) ────────

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;
    if (model.getValue() === code) return; // ya es igual

    extUpdate.current = true;

    // Preservar posición del cursor
    const sel = editorRef.current.getSelection();
    // Reemplazar el contenido completo preservando el historial de undo
    editorRef.current.executeEdits('ext-sync', [{
      range: model.getFullModelRange(),
      text: code,
      forceMoveMarkers: true,
    }]);
    if (sel) {
      try { editorRef.current.setSelection(sel); } catch (_) {}
    }

    extUpdate.current = false;
  }, [code]);

  // ── Cambio iniciado por el usuario ─────────────────────────────────────────

  const handleChange = useCallback((value) => {
    if (extUpdate.current) return;  // ignorar cambios programáticos
    onChange?.(value ?? '');
  }, [onChange]);

  // ── Acciones de la barra ───────────────────────────────────────────────────

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = async () => {
    const isElectron = window.electronAPI?.isElectron;
    if (isElectron) {
      await window.electronAPI.saveFile({ content: code, defaultName: 'sketch.ino' });
    } else {
      const blob = new Blob([code], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sketch.ino';
      a.click();
    }
  };

  // ── Status indicator ───────────────────────────────────────────────────────

  const statusChip = {
    ok:      { label: 'Sincronizado', color: '#4ec9b0', icon: <SyncAltIcon sx={{ fontSize: 12 }} /> },
    error:   { label: 'Error de sintaxis', color: '#f48771', icon: <WarningAmberIcon sx={{ fontSize: 12 }} /> },
    syncing: { label: 'Actualizando…',  color: '#569cd6', icon: <SyncAltIcon sx={{ fontSize: 12, animation: 'spin 1s linear infinite' }} /> },
  }[syncStatus] || {};

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, bgcolor: '#1e1e1e' }}>

      {/* ── Barra de título ────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', px: 1.5, py: 0.5, gap: 1,
        bgcolor: '#2d2d2d', borderBottom: '1px solid #3c3c3c', flexShrink: 0,
      }}>
        <Typography variant="caption" sx={{ color: '#cccccc', fontFamily: 'monospace', flex: 1, fontSize: 12 }}>
          sketch.ino
        </Typography>

        {/* Estado de sincronización — UX-06: mayor visibilidad */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.5,
          px: 0.8, py: 0.15, borderRadius: 1,
          bgcolor: `${statusChip.color}18`,
          border: `1px solid ${statusChip.color}50`,
        }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusChip.color, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: statusChip.color, fontSize: 11, lineHeight: 1 }}>
            {statusChip.label}
          </Typography>
        </Box>

        <Tooltip title={copied ? '¡Copiado!' : 'Copiar'}>
          <IconButton data-testid="copy-code-button" size="small" onClick={handleCopy} sx={{ color: copied ? '#4ec9b0' : '#aaa', p: 0.5 }}>
            {copied ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Guardar como .ino">
          <IconButton data-testid="save-ino-button" size="small" onClick={handleSave} sx={{ color: '#aaa', p: 0.5 }}>
            <SaveIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Monaco Editor ──────────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          language="cpp"
          theme="vs-dark"
          defaultValue={code}
          onChange={handleChange}
          onMount={handleMount}
          loading={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#555' }}>
              <Typography variant="caption">Cargando editor…</Typography>
            </Box>
          }
          options={{
            fontSize: 13,
            fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            bracketPairColorization: { enabled: true },
            autoIndent: 'full',
            tabSize: 2,
            scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
            overviewRulerLanes: 0,
            guides: { indentation: true },
            suggest: { showKeywords: true },
          }}
        />
      </Box>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </Box>
  );
}
