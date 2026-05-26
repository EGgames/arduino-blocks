import React, { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Snackbar,
  Alert,
  Typography,
  Box,
} from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';

const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

/**
 * UpdaterDialog — detecta automáticamente nuevas versiones publicadas en GitHub Releases
 * y ofrece descargar e instalar la actualización sin salir de la app.
 */
export default function UpdaterDialog() {
  const [state, setState] = useState('idle'); // idle | available | downloading | downloaded | error
  const [updateInfo, setUpdateInfo] = useState(null); // { version, releaseNotes, releaseDate }
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  const showSnack = (message, severity = 'info') =>
    setSnack({ open: true, message, severity });

  const handleDownload = useCallback(() => {
    setState('downloading');
    window.electronAPI.downloadUpdate().catch(() => {
      setState('error');
      setErrorMsg('No se pudo iniciar la descarga.');
    });
  }, []);

  const handleInstall = useCallback(() => {
    window.electronAPI.installUpdate();
  }, []);

  const handleDismiss = useCallback(() => {
    setState('idle');
    setUpdateInfo(null);
  }, []);

  const handleCheckManually = useCallback(async () => {
    if (!isElectron) {
      showSnack('El verificador de actualizaciones solo está disponible en la aplicación de escritorio.', 'info');
      return;
    }
    showSnack('Buscando actualizaciones...', 'info');
    const res = await window.electronAPI.checkForUpdates();
    if (res?.dev) {
      showSnack('Estás en modo desarrollo — las actualizaciones se deshabilitan.', 'warning');
    }
  }, []);

  useEffect(() => {
    if (!isElectron) return;

    window.electronAPI.onUpdateAvailable((info) => {
      setUpdateInfo(info);
      setState('available');
    });

    window.electronAPI.onUpdateNotAvailable(() => {
      // Silencioso en revisiones automáticas
    });

    window.electronAPI.onUpdateDownloadProgress((p) => {
      setProgress(p.percent ?? 0);
    });

    window.electronAPI.onUpdateDownloaded((info) => {
      setUpdateInfo(info);
      setState('downloaded');
    });

    window.electronAPI.onUpdateError((msg) => {
      setErrorMsg(msg);
      setState('error');
    });

    return () => {
      window.electronAPI.removeUpdateListeners?.();
    };
  }, []);

  // Dialog de error
  if (state === 'error') {
    return (
      <Dialog open maxWidth="xs" fullWidth>
        <DialogTitle>Error al actualizar</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="error">
            {errorMsg || 'Ocurrió un error durante la actualización.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDismiss}>Cerrar</Button>
        </DialogActions>
        <Snackbar
          open={snack.open}
          autoHideDuration={3500}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Dialog>
    );
  }

  // Dialog de actualización disponible
  if (state === 'available') {
    return (
      <>
        <Dialog open maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SystemUpdateAltIcon color="primary" />
            Nueva versión disponible — v{updateInfo?.version}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" gutterBottom>
              Hay una nueva versión de Arduino Blocks. ¿Deseas descargarla e instalarla ahora?
            </Typography>
            {updateInfo?.releaseNotes && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  maxHeight: 180,
                  overflowY: 'auto',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {typeof updateInfo.releaseNotes === 'string'
                  ? updateInfo.releaseNotes
                  : updateInfo.releaseNotes
                      ?.map?.((n) => `${n.version}: ${n.note}`)
                      .join('\n')}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDismiss} color="inherit">
              Más tarde
            </Button>
            <Button onClick={handleDownload} variant="contained" color="primary">
              Descargar e instalar
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snack.open}
          autoHideDuration={3500}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
            {snack.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // Dialog de descarga en progreso
  if (state === 'downloading') {
    return (
      <Dialog open maxWidth="xs" fullWidth>
        <DialogTitle>Descargando actualización...</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            v{updateInfo?.version} — {progress}%
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
        </DialogContent>
      </Dialog>
    );
  }

  // Dialog de descarga completada — listo para instalar
  if (state === 'downloaded') {
    return (
      <Dialog open maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SystemUpdateAltIcon color="success" />
          Actualización lista — v{updateInfo?.version}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            La actualización se ha descargado. Al hacer clic en "Instalar y reiniciar" la app se cerrará
            e instalará la nueva versión automáticamente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDismiss} color="inherit">
            Más tarde
          </Button>
          <Button onClick={handleInstall} variant="contained" color="success">
            Instalar y reiniciar
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Estado idle: no renderizar nada (el Snackbar de check manual se muestra desde App)
  return (
    <Snackbar
      open={snack.open}
      autoHideDuration={3500}
      onClose={() => setSnack((s) => ({ ...s, open: false }))}
    >
      <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        {snack.message}
      </Alert>
    </Snackbar>
  );
}
