import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, IconButton, InputLabel,
  MenuItem, Paper, Select, Snackbar, Alert, Tooltip, Typography,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import UsbIcon from '@mui/icons-material/Usb';
import { BOARDS } from '../data/boards';

const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

export default function UploadPanel({ code, defaultPort = '', defaultBoard = 'arduino:avr:uno', flat = false }) {
  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState(defaultPort);
  const [selectedBoard, setSelectedBoard] = useState(defaultBoard);
  const [loading, setLoading] = useState(false);
  const [loadingPorts, setLoadingPorts] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [log, setLog] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });
  const logRef = useRef(null);

  useEffect(() => {
    if (isElectron) {
      refreshPorts();
      window.electronAPI.onUploadOutput((data) => {
        setLog((prev) => prev + data);
      });
      return () => window.electronAPI.removeUploadOutput();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const refreshPorts = async () => {
    setLoadingPorts(true);
    try {
      const result = await window.electronAPI.listPorts();
      setPorts(result.ports || []);
      if (result.ports?.length > 0 && !selectedPort) {
        setSelectedPort(result.ports[0].port);
      }
    } catch (e) {
      showSnack('Error al listar puertos: ' + e.message, 'error');
    } finally {
      setLoadingPorts(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) return showSnack('No hay código para verificar', 'warning');
    setLoading(true);
    setLog('');
    setLogOpen(true);
    try {
      const result = await window.electronAPI.compileCode({ code, fqbn: selectedBoard });
      setLog(result.output || '');
      showSnack(result.success ? 'Compilación exitosa ✅' : 'Error de compilación ❌', result.success ? 'success' : 'error');
    } catch (e) {
      showSnack('Error: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!code.trim()) return showSnack('No hay código para subir', 'warning');
    if (!selectedPort) return showSnack('Selecciona un puerto COM', 'warning');
    setLoading(true);
    setLog('');
    setLogOpen(true);
    try {
      const result = await window.electronAPI.uploadCode({
        code,
        port: selectedPort,
        fqbn: selectedBoard,
      });
      showSnack(result.success ? 'Código subido exitosamente ✅' : 'Error al subir ❌', result.success ? 'success' : 'error');
    } catch (e) {
      showSnack('Error: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnack = (message, severity = 'info') => setSnack({ open: true, message, severity });

  if (!isElectron) {
    return (
      <Box sx={flat ? { p: 2 } : { p: 2, m: 1, bgcolor: '#fff8e1', border: '1px solid #f9a825', borderRadius: 1 }}>
        <Typography variant="body2" color={flat ? 'rgba(200,230,201,0.8)' : 'text.secondary'}>
          ⚡ La subida a placa requiere la aplicación de escritorio (Electron).
          En el navegador puedes editar bloques y ver el código generado.
        </Typography>
      </Box>
    );
  }

  const containerSx = flat
    ? { p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }
    : { p: 1.5, m: 1, display: 'flex', flexDirection: 'column', gap: 1.5 };

  const WrapperComponent = flat ? Box : Paper;
  const wrapperProps = flat ? { sx: containerSx } : { elevation: 2, sx: containerSx };
  return (
    <>
      <WrapperComponent {...wrapperProps}>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <UsbIcon fontSize="small" /> Conexión y Subida
        </Typography>

        {/* Placa */}
        <FormControl size="small" fullWidth>
          <InputLabel>Placa</InputLabel>
          <Select value={selectedBoard} label="Placa" onChange={(e) => setSelectedBoard(e.target.value)}>
            {BOARDS.map((b) => (
              <MenuItem key={b.fqbn} value={b.fqbn}>{b.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Puerto */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel>Puerto COM</InputLabel>
            <Select value={selectedPort} label="Puerto COM" onChange={(e) => setSelectedPort(e.target.value)}>
              {ports.length === 0
                ? <MenuItem value="" disabled>Sin puertos detectados</MenuItem>
                : ports.map((p) => (
                    <MenuItem key={p.port} value={p.port}>
                      {p.port} {p.board && <Chip label={p.board} size="small" sx={{ ml: 1 }} />}
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>
          <Tooltip title="Actualizar puertos">
            <IconButton size="small" onClick={refreshPorts} disabled={loadingPorts}>
              {loadingPorts ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Botones */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={loading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
            onClick={handleVerify}
            disabled={loading}
            fullWidth
          >
            Verificar
          </Button>
          <Button
            variant="contained"
            size="small"
            color="success"
            startIcon={loading ? <CircularProgress size={16} /> : <UploadIcon />}
            onClick={handleUpload}
            disabled={loading || !selectedPort}
            fullWidth
          >
            Subir
          </Button>
        </Box>
      </WrapperComponent>

      {/* Diálogo de log */}
      <Dialog open={logOpen} onClose={() => setLogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Salida de compilación / subida</DialogTitle>
        <DialogContent>
          <Box
            ref={logRef}
            component="pre"
            sx={{
              bgcolor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1,
              fontFamily: 'monospace', fontSize: '0.8rem',
              maxHeight: 400, overflow: 'auto', whiteSpace: 'pre-wrap',
            }}
          >
            {log || 'Esperando salida...'}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} variant="filled">{snack.message}</Alert>
      </Snackbar>
    </>
  );
}
