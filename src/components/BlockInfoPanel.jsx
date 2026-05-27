import React from 'react';
import { Box, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';

/**
 * Panel que aparece al pie del editor de bloques cuando el usuario
 * selecciona un bloque.
 *
 * En modo avanzado: compacto, código C++, tip técnico.
 * En modo kids: más alto, colorido, lenguaje simple, emoji grande, ejemplo práctico.
 *
 * @param {{ title, description, code?, tip?, emoji?, example? }} info
 * @param {'advanced'|'kids'} mode
 */
export default function BlockInfoPanel({ info, mode = 'advanced', isMobile = false }) {
  if (!info) return null;

  // ── Modo KIDS ────────────────────────────────────────────────────────────
  if (mode === 'kids') {
    if (isMobile) {
      // Layout mobile kids: columna compacta, texto más grande, sin código
      return (
        <Box sx={{
          flexShrink: 0,
          bgcolor: '#1a2e1a',
          borderTop: '3px solid #43a047',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.3)',
          zIndex: 20,
          overflow: 'hidden',
          maxHeight: 130,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 1.5, pt: 1.2, pb: 0.8 }}>
            <Box sx={{
              width: 40, height: 40, flexShrink: 0,
              bgcolor: '#2e7d32', borderRadius: 1.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, border: '2px solid #43a047',
            }}>
              {info.emoji || '🧩'}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#a5d6a7', lineHeight: 1.2, mb: 0.2 }}>
                {info.title}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#c8e6c9', lineHeight: 1.4,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {info.description}
              </Typography>
            </Box>
          </Box>
          {(info.example || info.tip) && (
            <Box sx={{ display: 'flex', borderTop: '1px solid rgba(67,160,71,0.3)' }}>
              {info.example && (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.8, px: 1.5, py: 0.8, bgcolor: 'rgba(46,125,50,0.25)' }}>
                  <Box component="span" sx={{ fontSize: 13, flexShrink: 0 }}>🔧</Box>
                  <Typography sx={{ fontSize: 11.5, color: '#dcedc8', lineHeight: 1.3,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    <Box component="span" sx={{ fontWeight: 700, color: '#aed581' }}>Ej: </Box>
                    {info.example}
                  </Typography>
                </Box>
              )}
              {info.tip && (
                <Box sx={{ flexShrink: 0, maxWidth: '45%', display: 'flex', alignItems: 'center', gap: 0.6,
                  px: 1.2, py: 0.8, bgcolor: 'rgba(255,235,59,0.1)',
                  borderLeft: info.example ? '1px solid rgba(67,160,71,0.3)' : 'none',
                }}>
                  <EmojiObjectsOutlinedIcon sx={{ fontSize: 14, color: '#ffee58', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 10.5, color: '#fff9c4', lineHeight: 1.3,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {info.tip}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      );
    }
    return (
      <Box sx={{
        flexShrink: 0,
        bgcolor: '#1a2e1a',
        borderTop: '3px solid #43a047',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.3)',
        zIndex: 20,
        overflow: 'hidden',
        minHeight: 120,
      }}>
        {/* Fila superior: emoji + título + descripción */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, px: 2, pt: 1.5, pb: 1 }}>
          {/* Emoji grande */}
          <Box sx={{
            width: 48, height: 48, flexShrink: 0,
            bgcolor: '#2e7d32', borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, border: '2px solid #43a047',
          }}>
            {info.emoji || '🧩'}
          </Box>

          {/* Texto */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{
              fontWeight: 800, fontSize: 15, color: '#a5d6a7',
              lineHeight: 1.2, mb: 0.4,
            }}>
              {info.title}
            </Typography>
            <Typography sx={{
              fontSize: 12.5, color: '#c8e6c9', lineHeight: 1.5,
            }}>
              {info.description}
            </Typography>
          </Box>
        </Box>

        {/* Fila inferior: ejemplo + tip */}
        <Box sx={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(67,160,71,0.3)', mx: 0 }}>
          {info.example && (
            <Box sx={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 1,
              px: 2, py: 0.9, bgcolor: 'rgba(46,125,50,0.25)',
            }}>
              <Box component="span" sx={{ fontSize: 14, flexShrink: 0 }}>🔧</Box>
              <Typography sx={{ fontSize: 11.5, color: '#dcedc8', lineHeight: 1.4 }}>
                <Box component="span" sx={{ fontWeight: 700, color: '#aed581' }}>Ejemplo: </Box>
                {info.example}
              </Typography>
            </Box>
          )}
          {info.tip && (
            <Box sx={{
              flexShrink: 0, maxWidth: 300, display: 'flex', alignItems: 'center', gap: 1,
              px: 2, py: 0.9, bgcolor: 'rgba(255,235,59,0.1)',
              borderLeft: info.example ? '1px solid rgba(67,160,71,0.3)' : 'none',
            }}>
              <EmojiObjectsOutlinedIcon sx={{ fontSize: 16, color: '#ffee58', flexShrink: 0 }} />
              <Typography sx={{ fontSize: 11, color: '#fff9c4', lineHeight: 1.4 }}>
                {info.tip}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // ── Modo AVANZADO ─────────────────────────────────────────────────────────
  if (isMobile) {
    // Layout mobile avanzado: vertical, info + código apilados, sin desbordamiento
    return (
      <Box sx={{
        flexShrink: 0,
        bgcolor: '#f0f6ff',
        borderTop: '3px solid #00529b',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -3px 12px rgba(0,0,0,0.12)',
        zIndex: 20,
        overflow: 'hidden',
        maxHeight: 140,
      }}>
        {/* Header: icono + título */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 1.5, pt: 1, pb: 0.3 }}>
          <InfoOutlinedIcon sx={{ fontSize: 17, color: '#00529b', flexShrink: 0 }} />
          <Typography sx={{ fontWeight: 700, color: '#003d7a', fontSize: 13, lineHeight: 1.2,
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>
            {info.title}
          </Typography>
        </Box>
        {/* Descripción */}
        <Box sx={{ px: 1.5, pb: info.code ? 0.3 : 1 }}>
          <Typography sx={{ color: '#334', fontSize: 11.5, lineHeight: 1.4,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {info.description}
          </Typography>
        </Box>
        {/* Código */}
        {info.code && (
          <Box sx={{ px: 1.5, pb: 1 }}>
            <Box component="pre" sx={{
              bgcolor: '#1a2332', color: '#4fc3f7', px: 1.2, py: 0.5, borderRadius: 1,
              fontFamily: '"Fira Code", "Consolas", monospace', fontSize: 10, m: 0,
              overflow: 'auto', whiteSpace: 'pre', lineHeight: 1.4,
              border: '1px solid #2d4a6b', maxHeight: 46,
            }}>
              {info.code}
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  // ── Modo AVANZADO DESKTOP ────────────────────────────────────────────────
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
      <Box sx={{ width: 4, flexShrink: 0, bgcolor: '#00529b' }} />

      {/* Icono */}
      <Box sx={{ px: 1.5, display: 'flex', alignItems: 'center', color: '#00529b', flexShrink: 0 }}>
        <InfoOutlinedIcon sx={{ fontSize: 22 }} />
      </Box>

      {/* Texto principal */}
      <Box sx={{ flex: 1, py: 1, pr: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#003d7a', lineHeight: 1.2, mb: 0.4, fontSize: 13 }}>
          {info.title}
        </Typography>
        <Typography variant="caption" sx={{ color: '#444', lineHeight: 1.4, fontSize: 11.5, display: 'block' }}>
          {info.description}
        </Typography>
      </Box>

      {/* Código generado */}
      {info.code && (
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', px: 1.5, py: 1 }}>
          <Box
            component="pre"
            sx={{
              bgcolor: '#1a2332', color: '#4fc3f7', px: 1.5, py: 0.8, borderRadius: 1,
              fontFamily: '"Fira Code", "Consolas", monospace', fontSize: 11, m: 0,
              maxWidth: 280, maxHeight: 68, overflow: 'hidden',
              whiteSpace: 'pre', lineHeight: 1.5, border: '1px solid #2d4a6b',
            }}
          >
            {info.code}
          </Box>
        </Box>
      )}

      {/* Tip */}
      {info.tip && (
        <Box sx={{
          flexShrink: 0, maxWidth: 200, display: 'flex', alignItems: 'center',
          gap: 0.5, px: 1.5, py: 1, bgcolor: '#fffde7', borderLeft: '1px solid #ffe082',
        }}>
          <LightbulbOutlinedIcon sx={{ fontSize: 16, color: '#f9a825', flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: '#5d4037', fontSize: 10.5, lineHeight: 1.4 }}>
            {info.tip}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
