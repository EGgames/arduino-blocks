import React, { useState } from 'react';
import { Box, IconButton, Paper, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';

const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

function lineNumbers(code) {
  return code.split('\n').map((line, i) => (
    <div key={i} style={{ display: 'flex' }}>
      <span style={{
        minWidth: 32, textAlign: 'right', paddingRight: 12,
        color: '#858585', userSelect: 'none', fontSize: '0.78rem',
      }}>
        {i + 1}
      </span>
      <span>{line}</span>
    </div>
  ));
}

export default function CodePreview({ code }) {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (isElectron) {
      await window.electronAPI.saveFile({ content: code, defaultName: 'mi_sketch.ino' });
    } else {
      const blob = new Blob([code], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'mi_sketch.ino';
      a.click();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex', flexDirection: 'column', height: '100%',
        bgcolor: '#1e1e1e', color: '#d4d4d4', overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', px: 2, py: 0.5,
        bgcolor: '#252526', borderBottom: '1px solid #3e3e42',
      }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            flex: 1, minHeight: 36,
            '& .MuiTab-root': { color: '#858585', minHeight: 36, fontSize: '0.8rem', textTransform: 'none' },
            '& .Mui-selected': { color: '#d4d4d4' },
            '& .MuiTabs-indicator': { bgcolor: '#007acc' },
          }}
        >
          <Tab label="sketch.ino" />
        </Tabs>
        <Tooltip title={copied ? '¡Copiado!' : 'Copiar código'}>
          <IconButton size="small" onClick={handleCopy} sx={{ color: '#858585' }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Guardar archivo .ino">
          <IconButton size="small" onClick={handleSave} sx={{ color: '#858585' }}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Code */}
      <Box
        sx={{
          flex: 1, overflow: 'auto', p: 1.5,
          fontFamily: '"Fira Code", "Consolas", "Courier New", monospace',
          fontSize: '0.85rem', lineHeight: 1.6,
        }}
      >
        {code ? (
          lineNumbers(code)
        ) : (
          <Typography variant="body2" sx={{ color: '#555', mt: 2, textAlign: 'center' }}>
            Agrega bloques para ver el código generado...
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
