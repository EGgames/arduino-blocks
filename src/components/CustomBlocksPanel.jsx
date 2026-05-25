import React, { useState, useEffect } from 'react';
import * as Blockly from 'blockly';
import { arduinoGenerator } from '../blocks/arduinoGenerator';
import {
  Alert, Box, Button, Chip, Divider, IconButton,
  List, ListItem, ListItemText, TextField, Tooltip, Typography,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExtensionIcon from '@mui/icons-material/Extension';

const LS_CUSTOM_KEY = 'arduino-blocks-custom';

// ── helpers ────────────────────────────────────────────────────────────────

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(LS_CUSTOM_KEY) || '[]'); }
  catch { return []; }
}

function persist(list) {
  localStorage.setItem(LS_CUSTOM_KEY, JSON.stringify(list));
}

/**
 * Registra (o re-registra) un bloque personalizado en Blockly y en el generador.
 * Puede llamarse en cualquier momento; si el tipo ya existe en Blockly.Blocks
 * solo actualiza el generador (el init no se puede cambiar en caliente).
 */
export function registerCustomBlock({ id, label, code, color }) {
  const type = `custom_${id}`;

  if (!Blockly.Blocks[type]) {
    const _label = label;
    const _color = color || 45;
    Blockly.Blocks[type] = {
      init() {
        this.appendDummyInput()
          .appendField(new Blockly.FieldLabel(_label));
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(_color);
        this.setTooltip(`Bloque personalizado: ${_label}`);
      },
    };
  }

  const _code = code;
  arduinoGenerator.forBlock[type] = () =>
    _code.endsWith('\n') ? _code : _code + '\n';
}

// ── componente ─────────────────────────────────────────────────────────────

export default function CustomBlocksPanel({ blockEditorRef }) {
  const [customBlocks, setCustomBlocks] = useState(loadSaved);
  const [label, setLabel]               = useState('');
  const [code, setCode]                 = useState('');
  const [error, setError]               = useState('');

  // Registrar bloques guardados al montar
  useEffect(() => {
    customBlocks.forEach(registerCustomBlock);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = () => {
    if (!label.trim()) { setError('Escribe un nombre para el bloque'); return; }
    if (!code.trim())  { setError('Escribe el código C++ que generará el bloque'); return; }
    setError('');

    const def = {
      id:    Date.now().toString(36),
      label: label.trim(),
      code:  code.trim(),
      color: 45,
    };
    registerCustomBlock(def);

    const next = [...customBlocks, def];
    setCustomBlocks(next);
    persist(next);
    setLabel('');
    setCode('');
  };

  const handleDelete = (id) => {
    const next = customBlocks.filter((b) => b.id !== id);
    setCustomBlocks(next);
    persist(next);
    // Nota: Blockly.Blocks no se puede des-registrar en caliente,
    // el tipo queda pero ya no aparece en la lista del panel.
  };

  const handleInsert = (def) => {
    const ok = blockEditorRef.current?.addCustomBlock(def.id);
    if (!ok) console.warn('[CustomBlocksPanel] No se pudo insertar bloque:', def.id);
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

      {/* Cabecera */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ExtensionIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Nuevo bloque
        </Typography>
        <Chip label="experimental" size="small" color="warning" variant="outlined"
          sx={{ fontSize: 9, height: 16, ml: 'auto' }} />
      </Box>

      {/* Formulario */}
      <TextField
        size="small"
        label="Nombre del bloque"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="ej: Activar motor"
        fullWidth
        onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
      />

      <TextField
        size="small"
        label="Código C++ generado"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={"ej: motor.setSpeed(255);"}
        multiline
        rows={3}
        fullWidth
        inputProps={{ style: { fontFamily: 'Consolas, monospace', fontSize: 12 } }}
      />

      {error && (
        <Alert severity="error" sx={{ py: 0, fontSize: 12 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        size="small"
        startIcon={<AddCircleIcon />}
        onClick={handleCreate}
        disabled={!label.trim() || !code.trim()}
        sx={{ alignSelf: 'flex-start' }}
      >
        Crear bloque
      </Button>

      <Divider />

      {/* Lista de bloques guardados */}
      <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Mis bloques ({customBlocks.length})
      </Typography>

      {customBlocks.length === 0 ? (
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', textAlign: 'center', mt: 1 }}>
          Aún no hay bloques personalizados.<br />
          Crea uno arriba y aparecerá aquí.
        </Typography>
      ) : (
        <List dense disablePadding>
          {customBlocks.map((def) => (
            <ListItem
              key={def.id}
              disablePadding
              sx={{
                mb: 0.5, bgcolor: '#fff', borderRadius: 1,
                border: '1px solid #e0e0e0',
                '&:hover': { borderColor: '#00529b' },
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: 140 }}>
                    {def.label}
                  </Typography>
                }
                secondary={
                  <Typography component="span" variant="caption"
                    sx={{ fontFamily: 'Consolas, monospace', fontSize: 10, color: 'text.secondary' }}
                  >
                    {def.code.length > 48 ? def.code.slice(0, 48) + '…' : def.code}
                  </Typography>
                }
                sx={{ px: 1, py: 0.5 }}
              />
              <Box sx={{ display: 'flex', gap: 0.5, pr: 0.5, flexShrink: 0 }}>
                <Tooltip title="Insertar en workspace">
                  <IconButton size="small" color="primary" onClick={() => handleInsert(def)}>
                    <PlayArrowIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar bloque">
                  <IconButton size="small" color="error" onClick={() => handleDelete(def.id)}>
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItem>
          ))}
        </List>
      )}

    </Box>
  );
}
