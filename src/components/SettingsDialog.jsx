import React, { useState, useEffect } from 'react';
import {
  Box, Button, Divider, Drawer, FormControl, IconButton,
  MenuItem, Select, Slider, Tooltip, Typography,
} from '@mui/material';
import CloseIcon            from '@mui/icons-material/Close';
import RefreshIcon          from '@mui/icons-material/Refresh';
import DarkModeIcon         from '@mui/icons-material/DarkMode';
import LightModeIcon        from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import UsbIcon              from '@mui/icons-material/Usb';
import DeveloperBoardIcon   from '@mui/icons-material/DeveloperBoard';
import PaletteIcon          from '@mui/icons-material/Palette';
import TuneIcon             from '@mui/icons-material/Tune';
import ChildCareIcon        from '@mui/icons-material/ChildCare';
import CodeIcon             from '@mui/icons-material/Code';
import { BOARDS } from '../data/boards';

const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

// ── Helpers ────────────────────────────────────────────────────────────────

function Section({ icon, title, children }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {icon}
        <Typography sx={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
        }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

function Label({ children }) {
  return (
    <Typography sx={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', mb: 0.75, display: 'block' }}>
      {children}
    </Typography>
  );
}

const SELECT_SX = {
  color: '#e0ecff', fontSize: 12,
  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.18)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4fc3f7' },
  '.MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' },
};

// ── Componente principal ───────────────────────────────────────────────────

export default function SettingsDialog({ open, onClose, settings, onSettingsChange }) {
  const [ports, setPorts]           = useState([]);
  const [loadingPorts, setLoading]  = useState(false);

  useEffect(() => {
    if (open && isElectron) refreshPorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const refreshPorts = async () => {
    setLoading(true);
    try {
      const r = await window.electronAPI.listPorts();
      setPorts(r.ports || []);
    } catch (e) {
      console.warn('[SettingsDialog] Error listando puertos:', e);
    } finally {
      setLoading(false);
    }
  };

  const set = (key, value) => onSettingsChange({ [key]: value });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          bgcolor: '#141e2e',
          color: '#e0ecff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
        },
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', px: 2.5, py: 2,
        background: 'linear-gradient(135deg, #0a1929, #003d7a)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <Typography variant="subtitle1" fontWeight="700" sx={{ flex: 1, letterSpacing: 0.3 }}>
          Configuración
        </Typography>
        <IconButton size="small" onClick={onClose}
          sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 3 }}
        className="light-scroll"
      >

        {/* ── Apariencia ──────────────────────────────────────────── */}
        <Section icon={<PaletteIcon sx={{ fontSize: 16, color: '#4fc3f7' }} />} title="Apariencia">

          <Label>Tema</Label>
          <Box sx={{ display: 'flex', gap: 0.75, mb: 2.5 }}>
            {[
              { value: 'dark',   label: 'Oscuro',  Icon: DarkModeIcon },
              { value: 'light',  label: 'Claro',   Icon: LightModeIcon },
              { value: 'system', label: 'Sistema', Icon: SettingsBrightnessIcon },
            ].map(({ value, label, Icon }) => {
              const active = settings.theme === value;
              return (
                <Button key={value} size="small" fullWidth
                  onClick={() => set('theme', value)}
                  startIcon={<Icon sx={{ fontSize: 14 }} />}
                  sx={{
                    textTransform: 'none', fontSize: 11, py: 0.8,
                    borderRadius: 1.5,
                    ...(active ? {
                      bgcolor: '#005fa3',
                      border: '1px solid #4fc3f7',
                      color: '#fff',
                      '&:hover': { bgcolor: '#006db8' },
                    } : {
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.55)',
                      '&:hover': { border: '1px solid rgba(255,255,255,0.35)', color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' },
                    }),
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Box>

          <Label>Tamaño de fuente del código — {settings.fontSize} px</Label>
          <Slider
            value={settings.fontSize}
            min={10} max={20} step={1}
            onChange={(_, v) => set('fontSize', v)}
            marks={[
              { value: 10, label: '10' },
              { value: 14, label: '14' },
              { value: 18, label: '18' },
              { value: 20, label: '20' },
            ]}
            sx={{
              color: '#4fc3f7', mt: 0.5,
              '& .MuiSlider-markLabel': { color: 'rgba(255,255,255,0.35)', fontSize: 10 },
              '& .MuiSlider-thumb': { width: 14, height: 14 },
            }}
          />
        </Section>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

        {/* ── Modo ────────────────────────────────────────────────── */}
        <Section icon={<TuneIcon sx={{ fontSize: 16, color: '#4fc3f7' }} />} title="Modo de uso">
          <Box sx={{ display: 'flex', gap: 0.75, mb: 0.5 }}>
            {[
              { value: 'advanced', label: 'Avanzado', Icon: CodeIcon,      desc: 'Todos los bloques' },
              { value: 'kids',     label: 'Niño',      Icon: ChildCareIcon, desc: 'Bloques básicos' },
            ].map(({ value, label, Icon, desc }) => {
              const active = settings.mode === value;
              return (
                <Button key={value} size="small" fullWidth
                  onClick={() => set('mode', value)}
                  startIcon={<Icon sx={{ fontSize: 14 }} />}
                  sx={{
                    textTransform: 'none', fontSize: 11, py: 0.8,
                    borderRadius: 1.5, flexDirection: 'column', gap: 0,
                    ...(active ? {
                      bgcolor: '#005fa3',
                      border: '1px solid #4fc3f7',
                      color: '#fff',
                      '&:hover': { bgcolor: '#006db8' },
                    } : {
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.55)',
                      '&:hover': { border: '1px solid rgba(255,255,255,0.35)', color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' },
                    }),
                  }}
                >
                  <span>{label}</span>
                  <Typography sx={{ fontSize: 9, opacity: 0.7, lineHeight: 1, mt: 0.25 }}>{desc}</Typography>
                </Button>
              );
            })}
          </Box>
        </Section>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

        {/* ── Conexión ────────────────────────────────────────────── */}
        <Section icon={<UsbIcon sx={{ fontSize: 16, color: '#4fc3f7' }} />} title="Conexión">

          {/* Puerto COM */}
          <Label>Puerto COM</Label>
          {isElectron ? (
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <FormControl size="small" fullWidth>
                <Select
                  value={settings.comPort}
                  displayEmpty
                  onChange={(e) => set('comPort', e.target.value)}
                  sx={SELECT_SX}
                  MenuProps={{ PaperProps: { sx: { bgcolor: '#1e2a3e', color: '#e0ecff' } } }}
                >
                  <MenuItem value="" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                    <em>— Sin selección —</em>
                  </MenuItem>
                  {ports.map((p) => (
                    <MenuItem key={p.port} value={p.port} sx={{ fontSize: 12 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{p.port}</span>
                        {p.description && (
                          <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                            {p.description}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title={loadingPorts ? 'Buscando…' : 'Actualizar puertos'}>
                <span>
                  <IconButton size="small" onClick={refreshPorts} disabled={loadingPorts}
                    sx={{ color: '#4fc3f7', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 1 }}>
                    <RefreshIcon fontSize="small"
                      sx={{ animation: loadingPorts ? 'spin 1s linear infinite' : 'none' }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          ) : (
            <Box sx={{ mb: 2, p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography sx={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
                Disponible solo en la app de escritorio.
              </Typography>
            </Box>
          )}

          {/* Placa */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
            <DeveloperBoardIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }} />
            <Label>Placa de destino</Label>
          </Box>
          <FormControl size="small" fullWidth>
            <Select
              value={settings.board}
              onChange={(e) => set('board', e.target.value)}
              sx={SELECT_SX}
              MenuProps={{ PaperProps: { sx: { bgcolor: '#1e2a3e', color: '#e0ecff' } } }}
            >
              {BOARDS.map((b) => (
                <MenuItem key={b.fqbn} value={b.fqbn} sx={{ fontSize: 12 }}>
                  {b.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        </Section>

      </Box>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <Box sx={{
        px: 2.5, py: 1.5,
        borderTop: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <Typography sx={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          Los cambios se guardan automáticamente
        </Typography>
      </Box>
    </Drawer>
  );
}
