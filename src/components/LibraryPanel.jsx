import React, { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, Chip, List, ListItem, ListItemButton,
  ListItemText, Divider, InputAdornment, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ARDUINO_LIBRARIES, LIBRARY_CATEGORIES } from '../data/arduinoLibraries';

const CAT_COLOR = {
  'Comunicación':   '#1565c0',
  'Sensores':         '#2e7d32',
  'Displays':         '#6a1b9a',
  'LEDs':             '#e65100',
  'Motores':          '#b71c1c',
  'Conectividad':     '#00695c',
  'Almacenamiento':   '#4e342e',
  'Identificación':  '#283593',
  'Tiempo':           '#37474f',
  'Entrada':          '#f57f17',
  'HID':              '#558b2f',
  'Sonido':           '#880e4f',
  'Utilidades':       '#546e7a',
};

/**
 * Panel de gestión de librerías Arduino.
 *
 * Props:
 *   blockEditorRef  - ref al BlockEditor (para llamar addIncludeBlock)
 *   activeIncludes  - string[]: nombres de librerías ya incluidas en el workspace
 */
export default function LibraryPanel({ blockEditorRef, activeIncludes = [], isDark = true }) {
  const [search, setSearch]             = useState('');
  const [selectedCategory, setCategory] = useState('Todas');

  // Paleta según tema
  const P = isDark ? {
    bg:           '#1e2535',
    border:       'rgba(255,255,255,0.06)',
    divider:      'rgba(255,255,255,0.07)',
    inputBg:      '#2a3347',
    inputText:    '#e0ecff',
    inputBorder:  'rgba(255,255,255,0.18)',
    inputIcon:    'rgba(255,255,255,0.35)',
    chipOutline:  'rgba(255,255,255,0.15)',
    chipText:     'rgba(255,255,255,0.55)',
    counter:      'rgba(255,255,255,0.35)',
    libName:      '#d4e6ff',
    libDesc:      'rgba(255,255,255,0.45)',
    disabled:     'rgba(255,255,255,0.2)',
    empty:        'rgba(255,255,255,0.4)',
  } : {
    bg:           '#fff',
    border:       '#f0f0f0',
    divider:      'rgba(0,0,0,0.1)',
    inputBg:      '#fff',
    inputText:    'inherit',
    inputBorder:  'rgba(0,0,0,0.23)',
    inputIcon:    '#888',
    chipOutline:  'rgba(0,0,0,0.23)',
    chipText:     'rgba(0,0,0,0.6)',
    counter:      '#888',
    libName:      'inherit',
    libDesc:      'text.secondary',
    disabled:     '#bbb',
    empty:        'text.secondary',
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ARDUINO_LIBRARIES.filter((lib) => {
      const matchSearch =
        !q ||
        lib.name.toLowerCase().includes(q) ||
        lib.description.toLowerCase().includes(q);
      const matchCat =
        selectedCategory === 'Todas' || lib.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory]);

  const handleAdd = (lib) => {
    if (activeIncludes.includes(lib.name)) return;
    blockEditorRef.current?.addIncludeBlock(lib.name);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', bgcolor: P.bg }}>

      {/* Buscador */}
      <Box sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Buscar librería…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: P.inputIcon }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiInputBase-input': { fontSize: 12, py: 0.6, color: P.inputText },
            '& .MuiOutlinedInput-root': {
              bgcolor: P.inputBg,
              '& fieldset': { borderColor: P.inputBorder },
              '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#4fc3f7' },
            },
          }}
        />
      </Box>

      {/* Chips de categoría */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          px: 1.5,
          pb: 0.75,
          maxHeight: 72,
          overflowY: 'auto',
        }}
      >
        {LIBRARY_CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            size="small"
            clickable
            variant={selectedCategory === cat ? 'filled' : 'outlined'}
            color={selectedCategory === cat ? 'primary' : 'default'}
            onClick={() => setCategory(cat)}
            sx={{
              fontSize: 10, height: 20,
              ...(selectedCategory !== cat && isDark && {
                borderColor: P.chipOutline,
                color: P.chipText,
              }),
            }}
          />
        ))}
      </Box>

      <Divider sx={{ borderColor: P.divider }} />

      {/* Contador */}
      <Typography
        variant="caption"
        data-testid="library-counter"
        sx={{ px: 1.5, py: 0.4, color: P.counter, fontSize: 10, flexShrink: 0 }}
      >
        {filtered.length} librería{filtered.length !== 1 ? 's' : ''}
        {activeIncludes.length > 0 && ` · ${activeIncludes.length} incluida${activeIncludes.length !== 1 ? 's' : ''}`}
      </Typography>

      <Divider sx={{ borderColor: P.divider }} />

      {/* Lista */}
      <List dense disablePadding sx={{ flex: 1, overflowY: 'auto', bgcolor: P.bg }} className="light-scroll">
        {filtered.map((lib) => {
          const added = activeIncludes.includes(lib.name);
          const accentColor = CAT_COLOR[lib.category] || '#607d8b';
          return (
            <ListItem key={lib.name} disablePadding
              sx={{ borderBottom: `1px solid ${P.border}` }}
            >
              <Tooltip
                title={added ? `#include <${lib.name}.h> ya incluida` : `Agregar #include <${lib.name}.h>`}
                placement="left" arrow
              >
                <ListItemButton
                  dense
                  data-testid={`library-item-${lib.name}`}
                  onClick={() => handleAdd(lib)}
                  disabled={added}
                  sx={{
                    py: 0.75, px: 1.5,
                    borderLeft: `3px solid ${added ? '#4caf50' : accentColor}`,
                    transition: 'background 0.15s',
                    '&:hover': { bgcolor: isDark ? `${accentColor}22` : `${accentColor}12` },
                    '&.Mui-disabled': { opacity: 0.55, borderLeftColor: P.disabled },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, fontFamily: 'Consolas, monospace', color: P.libName }}>
                          {lib.name}
                        </Typography>
                        <Typography sx={{
                          fontSize: 9, px: 0.6, py: 0.1, borderRadius: 0.5,
                          bgcolor: `${accentColor}${isDark ? '30' : '20'}`, color: accentColor,
                          fontWeight: 600, lineHeight: 1.6,
                        }}>
                          {lib.category}
                        </Typography>
                      </Box>
                    }
                    secondary={lib.description}
                    secondaryTypographyProps={{ fontSize: 10.5, color: P.libDesc }}
                  />
                  {added ? (
                    <CheckCircleIcon sx={{ fontSize: 18, color: '#4caf50', flexShrink: 0, ml: 0.5 }} />
                  ) : (
                    <AddCircleOutlineIcon sx={{ fontSize: 18, color: accentColor, flexShrink: 0, ml: 0.5, opacity: 0.8 }} />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}

        {filtered.length === 0 && (
          <ListItem>
            <ListItemText
              primary="Sin resultados"
              secondary={`No se encontró "${search}" en ${selectedCategory}`}
              primaryTypographyProps={{ fontSize: 12, color: P.empty }}
              secondaryTypographyProps={{ fontSize: 11, color: P.libDesc }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
}
