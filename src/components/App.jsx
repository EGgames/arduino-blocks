import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  AppBar, Box, Button, Divider, IconButton, Snackbar, Alert,
  Tab, Tabs, Toolbar, Tooltip, Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CodeIcon from '@mui/icons-material/Code';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import UploadIcon from '@mui/icons-material/Upload';
import ExtensionIcon from '@mui/icons-material/Extension';
import BlockEditor from './BlockEditor';
import CodeEditor from './CodeEditor';
import UploadPanel from './UploadPanel';
import LibraryPanel from './LibraryPanel';
import CustomBlocksPanel from './CustomBlocksPanel';
import SettingsDialog from './SettingsDialog';
import { codeToXML } from '../utils/xmlGenerator';
import { useBidirectionalSync } from '../hooks/useBidirectionalSync';
import { useSettings } from '../hooks/useSettings';

const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

export default function App() {
  const [code, setCode]               = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bottomTab, setBottomTab]     = useState('libraries');
  const [rightWidth, setRightWidth]   = useState(440);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(280);
  const [snack, setSnack]             = useState({ open: false, message: '', severity: 'info' });
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [settings, setSettings, isDark] = useSettings();

  // Aplicar clase de tema al documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const blockEditorRef = useRef(null);
  const draggingRef    = useRef(false);
  const dragStartXRef  = useRef(0);
  const dragStartWRef  = useRef(0);
  const draggingBottomRef   = useRef(false);
  const dragStartYRef       = useRef(0);
  const dragStartHeightRef  = useRef(0);

  const showSnack = (message, severity = 'info') => setSnack({ open: true, message, severity });

  // Librerías actualmente incluidas (extraídas del código generado)
  const activeIncludes = useMemo(() => {
    const matches = [...code.matchAll(/#include <([^.>]+)\.h>/g)];
    return matches.map((m) => m[1]);
  }, [code]);

  // Sincronizacion bidireccional bloques <-> codigo
  const { syncStatus, handleBlockCodeChange, handleCodeEditorChange, parseAndUpdateBlocks } =
    useBidirectionalSync(blockEditorRef, setCode);

  // Guardar
  const handleSave = useCallback(async () => {
    if (isElectron) {
      const result = await window.electronAPI.saveFile({ content: code, defaultName: 'mi_sketch.ino' });
      if (result.success) showSnack('Guardado: ' + result.filePath, 'success');
    } else {
      const blob = new Blob([code], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'mi_sketch.ino';
      a.click();
      showSnack('Descargado como .ino', 'success');
    }
  }, [code]);

  // Atajo de teclado Ctrl+S / Cmd+S para guardar
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  // Abrir
  const handleOpen = async () => {
    if (!isElectron) return showSnack('Abrir archivos solo disponible en app de escritorio', 'warning');
    const result = await window.electronAPI.openFile();
    if (!result.success) return;
    const ino = result.content;
    setCode(ino);
    parseAndUpdateBlocks.cancel?.();
    const xml = codeToXML(ino);
    if (xml) {
      blockEditorRef.current?.loadXML(xml);
    }
    showSnack('Archivo cargado: ' + result.filePath, 'success');
  };

  // Divisor redimensionable (horizontal)
  const handleDividerMouseDown = (e) => {
    draggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartWRef.current = rightWidth;
    e.preventDefault();
  };

  // Divisor panel inferior (vertical)
  const handleBottomDividerMouseDown = (e) => {
    draggingBottomRef.current = true;
    dragStartYRef.current = e.clientY;
    dragStartHeightRef.current = bottomPanelHeight;
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (draggingRef.current) {
        const delta = dragStartXRef.current - e.clientX;
        const newW = Math.max(280, Math.min(window.innerWidth - 450, dragStartWRef.current + delta));
        setRightWidth(newW);
      }
      if (draggingBottomRef.current) {
        const delta = dragStartYRef.current - e.clientY;
        const newH = Math.max(90, Math.min(window.innerHeight - 200, dragStartHeightRef.current + delta));
        setBottomPanelHeight(newH);
      }
    };
    const onUp = () => {
      draggingRef.current = false;
      draggingBottomRef.current = false;
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f5f5f5' }}>

      {/* AppBar */}
      <AppBar position="static" elevation={0} sx={{
        background: 'linear-gradient(135deg, #0a1929 0%, #003d7a 60%, #00529b 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 10, flexShrink: 0,
      }}>
        <Toolbar variant="dense" sx={{ gap: 1, minHeight: 44 }}>
          <IconButton color="inherit" edge="start" onClick={() => setSidebarOpen((v) => !v)} size="small"
            sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, borderRadius: 1 }}>
            <MenuIcon />
          </IconButton>

          {/* Logo + branding */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.2, mr: 1.5,
            borderRight: '1px solid rgba(255,255,255,0.15)', pr: 2,
          }}>
            <Box sx={{
              width: 30, height: 30, borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.12)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <CodeIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="700" lineHeight={1.1} letterSpacing={0.8} sx={{ fontSize: 13 }}>
                Arduino
              </Typography>
              <Typography sx={{ fontSize: 9.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                Blocks IDE
              </Typography>
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />

          <Tooltip title="Guardar codigo (.ino) [Ctrl+S]">
            <Button color="inherit" startIcon={<SaveIcon />} size="small" onClick={handleSave}
              sx={{ borderRadius: 1.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' }, fontSize: 12 }}>
              Guardar
            </Button>
          </Tooltip>

          {isElectron && (
            <Tooltip title="Abrir proyecto .ino">
              <Button color="inherit" startIcon={<FolderOpenIcon />} size="small" onClick={handleOpen}>
                Abrir
              </Button>
            </Tooltip>
          )}

          <Box sx={{ flex: 1 }} />

          <Tooltip title={isElectron ? 'Modo escritorio' : 'Solo edicion bloques/codigo'}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mr: 1, fontSize: 11 }}>
              {isElectron ? 'Electron' : 'Web'}
            </Typography>
          </Tooltip>

          <Tooltip title="Ayuda">
            <IconButton color="inherit" size="small">
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Configuración">
            <IconButton color="inherit" size="small" onClick={() => setSettingsOpen(true)}
              sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Area principal */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Panel izquierdo: Blockly — position:relative para contener el div absoluto */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <BlockEditor
            ref={blockEditorRef}
            onCodeChange={handleBlockCodeChange}
          />
        </Box>

        {/* Divisor redimensionable con grip visual */}
        <Box
          onMouseDown={handleDividerMouseDown}
          sx={{
            width: 8, cursor: 'col-resize', flexShrink: 0,
            bgcolor: '#e8edf3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: '#00529b' },
            '&:hover .grip-dots': { opacity: 1 },
            position: 'relative',
          }}
        >
          <Box className="grip-dots" sx={{
            opacity: 0.4, transition: 'opacity 0.2s',
            display: 'flex', flexDirection: 'column', gap: '3px',
          }}>
            {[0,1,2,3,4].map((i) => (
              <Box key={i} sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#666' }} />
            ))}
          </Box>
        </Box>

        {/* Panel derecho: Monaco + Upload */}
        <Box sx={{ width: rightWidth, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          {/* Wrapper flex para que Monaco ceda espacio al panel inferior al redimensionar */}
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <CodeEditor
              code={code}
              onChange={handleCodeEditorChange}
              syncStatus={syncStatus}
              fontSize={settings.fontSize}
              colorTheme={isDark ? 'dark' : 'light'}
            />
          </Box>

          {/* Panel inferior con tabs: Subir / Librerías / Bloques */}
          {sidebarOpen && (
            <Box sx={{ flexShrink: 0, borderTop: '1px solid #2a3a50', display: 'flex', flexDirection: 'column', height: bottomPanelHeight }}>              {/* Grip para redimensionar verticalmente */}
              <Box
                onMouseDown={handleBottomDividerMouseDown}
                sx={{
                  height: 6, flexShrink: 0, cursor: 'row-resize',
                  bgcolor: '#2a3a50',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: '#4fc3f7' },
                  '&:hover .grip-h': { opacity: 1 },
                }}
              >
                <Box className="grip-h" sx={{
                  opacity: 0.4, transition: 'opacity 0.2s',
                  display: 'flex', flexDirection: 'row', gap: '3px',
                }}>
                  {[0,1,2,3,4].map((i) => (
                    <Box key={i} sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#c8d4e3' }} />
                  ))}
                </Box>
              </Box>
              <Tabs
                value={bottomTab}
                onChange={(_, v) => setBottomTab(v)}
                variant="fullWidth"
                TabIndicatorProps={{ style: { height: 2, backgroundColor: '#4fc3f7' } }}
                sx={{
                  minHeight: 34, flexShrink: 0,
                  bgcolor: '#1e2535',
                  '& .MuiTab-root': {
                    minHeight: 34, py: 0, fontSize: 11, textTransform: 'none', gap: 0.5,
                    color: 'rgba(200,212,227,0.65)',
                    '&.Mui-selected': { color: '#e0ecff' },
                    '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.06)' },
                  },
                }}
              >
                <Tab icon={<UploadIcon sx={{ fontSize: 14 }} />} iconPosition="start" label="Subir" value="upload" />
                <Tab icon={<LibraryBooksIcon sx={{ fontSize: 14 }} />} iconPosition="start" label="Librerías" value="libraries" />
                <Tab icon={<ExtensionIcon sx={{ fontSize: 14 }} />} iconPosition="start" label="Bloques" value="custom" />
              </Tabs>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {bottomTab === 'upload'    && <UploadPanel code={code} defaultPort={settings.comPort} defaultBoard={settings.board} />}
                {bottomTab === 'libraries' && (
                  <LibraryPanel
                    blockEditorRef={blockEditorRef}
                    activeIncludes={activeIncludes}
                    isDark={isDark}
                  />
                )}
                {bottomTab === 'custom' && (
                  <CustomBlocksPanel blockEditorRef={blockEditorRef} />
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Diálogo de configuración */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>

      {/* Barra de estado inferior */}
      <Box sx={{
        bgcolor: '#0a1929', color: 'rgba(255,255,255,0.55)',
        px: 2, height: 22, display: 'flex', alignItems: 'center', gap: 2,
        borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
        fontSize: 11, userSelect: 'none',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{
            width: 7, height: 7, borderRadius: '50%',
            bgcolor: syncStatus === 'ok' ? '#4ec9b0' : syncStatus === 'error' ? '#f48771' : '#569cd6',
            boxShadow: syncStatus === 'ok' ? '0 0 4px #4ec9b0' : 'none',
          }} />
          <Typography sx={{ fontSize: 'inherit', color: 'inherit' }}>
            {syncStatus === 'ok' ? 'Sincronizado' : syncStatus === 'error' ? 'Error de sintaxis' : 'Actualizando…'}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: 'inherit', color: 'inherit', opacity: 0.4 }}>
          Arduino Blocks IDE
        </Typography>
      </Box>
    </Box>
  );
}