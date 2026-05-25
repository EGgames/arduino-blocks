import React from 'react';
import { Box, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

/**
 * Panel que aparece al pie del editor de bloques cuando el usuario
 * selecciona un bloque. Muestra nombre, descripción y código generado.
 *
 * @param {{ title:string, description:string, code?:string, tip?:string }} info
 */
export default function BlockInfoPanel({ info }) {
  if (!info) return null;

  return (
    <Box
      sx={{
        flexShrink: 0,
        height: 84,
        bgcolor: '#f0f6ff',
        borderTop: '3px solid #00529b',
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        boxShadow: '0 -3px 12px rgba(0,0,0,0.12)',
        zIndex: 20,
        overflow: 'hidden',
      }}
    >
      {/* Franja azul izquierda */}
      <Box
        sx={{
          width: 4,
          flexShrink: 0,
          bgcolor: '#00529b',
        }}
      />

      {/* Icono */}
      <Box
        sx={{
          px: 1.5,
          display: 'flex',
          alignItems: 'center',
          color: '#00529b',
          flexShrink: 0,
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 22 }} />
      </Box>

      {/* Texto principal */}
      <Box sx={{ flex: 1, py: 1, pr: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: '#003d7a', lineHeight: 1.2, mb: 0.4, fontSize: 13 }}
        >
          {info.title}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: '#444', lineHeight: 1.4, fontSize: 11.5, display: 'block' }}
        >
          {info.description}
        </Typography>
      </Box>

      {/* Código generado */}
      {info.code && (
        <Box
          sx={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            px: 1.5,
            py: 1,
          }}
        >
          <Box
            component="pre"
            sx={{
              bgcolor: '#1a2332',
              color: '#4fc3f7',
              px: 1.5,
              py: 0.8,
              borderRadius: 1,
              fontFamily: '"Fira Code", "Consolas", monospace',
              fontSize: 11,
              m: 0,
              maxWidth: 280,
              maxHeight: 68,
              overflow: 'hidden',
              whiteSpace: 'pre',
              lineHeight: 1.5,
              border: '1px solid #2d4a6b',
            }}
          >
            {info.code}
          </Box>
        </Box>
      )}

      {/* Tip (si existe) */}
      {info.tip && (
        <Box
          sx={{
            flexShrink: 0,
            maxWidth: 200,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 1,
            bgcolor: '#fffde7',
            borderLeft: '1px solid #ffe082',
          }}
        >
          <LightbulbOutlinedIcon sx={{ fontSize: 16, color: '#f9a825', flexShrink: 0 }} />
          <Typography
            variant="caption"
            sx={{ color: '#5d4037', fontSize: 10.5, lineHeight: 1.4 }}
          >
            {info.tip}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
