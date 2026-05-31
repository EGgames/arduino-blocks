// ── Panel de Logros para Modo Niño ────────────────────────────────────────────
import React from 'react';
import { Box, Typography, Tooltip, Snackbar, Alert, LinearProgress } from '@mui/material';
import { BADGE_DEFS } from '../hooks/useKidsAchievements';

export default function KidsAchievementsPanel({ badges, newBadge, onClearNewBadge }) {
  const unlockedCount = BADGE_DEFS.filter((b) => badges[b.id]).length;
  const progress = Math.round((unlockedCount / BADGE_DEFS.length) * 100);

  return (
    <Box sx={{ p: 1.5 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: '#1b5e20', mb: 0.5, fontSize: '0.95rem' }}
      >
        🏆 Mis Logros
      </Typography>

      {/* Barra de progreso */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: '0.7rem', color: '#555' }}>
            {unlockedCount} / {BADGE_DEFS.length} desbloqueados
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: '#43a047', fontWeight: 700 }}>
            {progress}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: '#c8e6c9',
            '& .MuiLinearProgress-bar': { bgcolor: '#43a047', borderRadius: 4 },
          }}
        />
      </Box>

      {/* Grid de insignias */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0.75,
        }}
      >
        {BADGE_DEFS.map((def) => {
          const unlocked = !!badges[def.id];
          return (
            <Tooltip
              key={def.id}
              title={
                unlocked
                  ? `${def.title} — ${def.desc}`
                  : '🔒 Aún no desbloqueado'
              }
              placement="top"
              arrow
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0.75,
                  borderRadius: 2,
                  border: unlocked ? '2px solid #43a047' : '2px dashed #bbb',
                  bgcolor: unlocked ? '#e8f5e9' : '#f5f5f5',
                  opacity: unlocked ? 1 : 0.45,
                  cursor: 'default',
                  transition: 'all 0.2s',
                  '&:hover': unlocked
                    ? { boxShadow: '0 3px 8px rgba(67,160,71,0.35)', transform: 'scale(1.08)' }
                    : {},
                }}
              >
                <Typography sx={{ fontSize: '1.5rem', lineHeight: 1 }}>
                  {unlocked ? def.emoji : '❓'}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.55rem',
                    textAlign: 'center',
                    color: unlocked ? '#1b5e20' : '#999',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    mt: 0.3,
                  }}
                >
                  {unlocked ? def.title : '???'}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Notificación de nuevo logro */}
      <Snackbar
        open={!!newBadge}
        autoHideDuration={3500}
        onClose={onClearNewBadge}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          onClose={onClearNewBadge}
          sx={{ fontWeight: 700, fontSize: '1rem' }}
          icon={<span style={{ fontSize: '1.4rem' }}>{newBadge?.emoji}</span>}
        >
          ¡Logro desbloqueado! {newBadge?.title}
        </Alert>
      </Snackbar>
    </Box>
  );
}
