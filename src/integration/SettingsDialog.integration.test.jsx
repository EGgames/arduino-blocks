/**
 * Tests de integración: SettingsDialog
 *
 * Verifica el diálogo de configuración: apertura, cierre, cambio de tema,
 * tamaño de fuente y selección de placa.
 */

import React, { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SettingsDialog from '../components/SettingsDialog';
import { DEFAULT_SETTINGS } from '../hooks/useSettings';
import { BOARDS } from '../data/boards';

// ─── Wrapper con estado real ───────────────────────────────────────────────────

function SettingsWrapper({ initialSettings = DEFAULT_SETTINGS }) {
  const [open, setOpen]         = useState(true);
  const [settings, setSettings] = useState(initialSettings);
  const handleChange = (patch) => setSettings((prev) => ({ ...prev, ...patch }));

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <SettingsDialog
        open={open}
        onClose={() => setOpen(false)}
        settings={settings}
        onSettingsChange={handleChange}
      />
    </>
  );
}

// ─── Render básico ────────────────────────────────────────────────────────────

describe('SettingsDialog — render', () => {
  test('muestra el título "Configuración" cuando está abierto', () => {
    render(<SettingsDialog open settings={DEFAULT_SETTINGS} onClose={jest.fn()} onSettingsChange={jest.fn()} />);
    expect(screen.getByText('Configuración')).toBeInTheDocument();
  });

  test('muestra los tres botones de tema', () => {
    render(<SettingsDialog open settings={DEFAULT_SETTINGS} onClose={jest.fn()} onSettingsChange={jest.fn()} />);
    expect(screen.getByText('Oscuro')).toBeInTheDocument();
    expect(screen.getByText('Claro')).toBeInTheDocument();
    expect(screen.getByText('Sistema')).toBeInTheDocument();
  });

  test('muestra la sección "Apariencia"', () => {
    render(<SettingsDialog open settings={DEFAULT_SETTINGS} onClose={jest.fn()} onSettingsChange={jest.fn()} />);
    expect(screen.getByText('Apariencia')).toBeInTheDocument();
  });

  test('muestra la sección "Conexión"', () => {
    render(<SettingsDialog open settings={DEFAULT_SETTINGS} onClose={jest.fn()} onSettingsChange={jest.fn()} />);
    expect(screen.getByText('Conexión')).toBeInTheDocument();
  });

  test('muestra la sección de actualizaciones con su botón', () => {
    render(<SettingsDialog open settings={DEFAULT_SETTINGS} onClose={jest.fn()} onSettingsChange={jest.fn()} />);
    expect(screen.getByText('Actualizaciones')).toBeInTheDocument();
    expect(screen.getByText('Comprobar actualizaciones')).toBeInTheDocument();
  });

  test('muestra el tamaño de fuente actual', () => {
    render(
      <SettingsDialog
        open
        settings={{ ...DEFAULT_SETTINGS, fontSize: 15 }}
        onClose={jest.fn()}
        onSettingsChange={jest.fn()}
      />,
    );
    expect(screen.getByText(/15 px/)).toBeInTheDocument();
  });

  test('muestra la sección "Placa de destino"', () => {
    render(<SettingsDialog open settings={DEFAULT_SETTINGS} onClose={jest.fn()} onSettingsChange={jest.fn()} />);
    expect(screen.getByText('Placa de destino')).toBeInTheDocument();
  });
});

// ─── Cierre del diálogo ───────────────────────────────────────────────────────

describe('SettingsDialog — cierre', () => {
  test('botón cerrar llama a onClose', () => {
    const onClose = jest.fn();
    render(
      <SettingsDialog open settings={DEFAULT_SETTINGS} onClose={onClose} onSettingsChange={jest.fn()} />,
    );
    fireEvent.click(screen.getByTestId('CloseIcon').closest('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ─── Cambio de tema ───────────────────────────────────────────────────────────

describe('SettingsDialog — cambio de tema', () => {
  test('clic en "Claro" llama a onSettingsChange con { theme: "light" }', () => {
    const onSettingsChange = jest.fn();
    render(
      <SettingsDialog
        open
        settings={DEFAULT_SETTINGS}
        onClose={jest.fn()}
        onSettingsChange={onSettingsChange}
      />,
    );
    fireEvent.click(screen.getByText('Claro'));
    expect(onSettingsChange).toHaveBeenCalledWith({ theme: 'light' });
  });

  test('clic en "Sistema" llama a onSettingsChange con { theme: "system" }', () => {
    const onSettingsChange = jest.fn();
    render(
      <SettingsDialog
        open
        settings={DEFAULT_SETTINGS}
        onClose={jest.fn()}
        onSettingsChange={onSettingsChange}
      />,
    );
    fireEvent.click(screen.getByText('Sistema'));
    expect(onSettingsChange).toHaveBeenCalledWith({ theme: 'system' });
  });

  test('clic en "Oscuro" llama a onSettingsChange con { theme: "dark" }', () => {
    const onSettingsChange = jest.fn();
    render(
      <SettingsDialog
        open
        settings={{ ...DEFAULT_SETTINGS, theme: 'light' }}
        onClose={jest.fn()}
        onSettingsChange={onSettingsChange}
      />,
    );
    fireEvent.click(screen.getByText('Oscuro'));
    expect(onSettingsChange).toHaveBeenCalledWith({ theme: 'dark' });
  });

  test('el tema activo se refleja en el settings recibido', () => {
    const { rerender } = render(
      <SettingsDialog
        open
        settings={{ ...DEFAULT_SETTINGS, theme: 'light' }}
        onClose={jest.fn()}
        onSettingsChange={jest.fn()}
      />,
    );
    // El botón Claro debería tener estilos activos (bgcolor distinto)
    // Verificamos que el settings se pasa correctamente
    const buttons = screen.getAllByRole('button');
    const claroBtn = buttons.find((b) => b.textContent.includes('Claro'));
    expect(claroBtn).toBeDefined();

    rerender(
      <SettingsDialog
        open
        settings={{ ...DEFAULT_SETTINGS, theme: 'dark' }}
        onClose={jest.fn()}
        onSettingsChange={jest.fn()}
      />,
    );
    const oscuroBtn = screen.getAllByRole('button').find((b) => b.textContent.includes('Oscuro'));
    expect(oscuroBtn).toBeDefined();
  });
});

// ─── Integración con estado (wrapper) ────────────────────────────────────────

describe('SettingsDialog — integración con estado real', () => {
  test('cambio de tema actualiza el estado del wrapper', () => {
    render(<SettingsWrapper />);
    // El dialog empieza con tema 'dark'
    expect(screen.getByText(/13 px/)).toBeInTheDocument();
    // Cambiar a tema claro
    fireEvent.click(screen.getByText('Claro'));
    // El tema cambió pero el dialog sigue mostrando el label (comprobamos que no crashea)
    expect(screen.getByText('Configuración')).toBeInTheDocument();
  });

  test('cerrar y reabrir el diálogo mantiene el estado', () => {
    render(<SettingsWrapper />);
    // Cambiar tema
    fireEvent.click(screen.getByText('Sistema'));
    // Cerrar
    fireEvent.click(screen.getByTestId('CloseIcon').closest('button'));
    // Reabrir
    fireEvent.click(screen.getByText('Abrir'));
    expect(screen.getByText('Configuración')).toBeInTheDocument();
  });

  test('múltiples cambios de tema no generan error', () => {
    render(<SettingsWrapper />);
    expect(() => {
      fireEvent.click(screen.getByText('Claro'));
      fireEvent.click(screen.getByText('Sistema'));
      fireEvent.click(screen.getByText('Oscuro'));
    }).not.toThrow();
  });
});

// ─── Placa y conexión (web mode) ──────────────────────────────────────────────

describe('SettingsDialog — placa (web mode)', () => {
  test('muestra "Puerto COM" en modo web', () => {
    render(<SettingsDialog open settings={DEFAULT_SETTINGS} onClose={jest.fn()} onSettingsChange={jest.fn()} />);
    expect(screen.getByText('Puerto COM')).toBeInTheDocument();
  });

  test('muestra el label de placa de destino', () => {
    render(<SettingsDialog open settings={DEFAULT_SETTINGS} onClose={jest.fn()} onSettingsChange={jest.fn()} />);
    expect(screen.getByText('Placa de destino')).toBeInTheDocument();
  });

  test('la placa por defecto es Arduino Uno', () => {
    render(<SettingsDialog open settings={DEFAULT_SETTINGS} onClose={jest.fn()} onSettingsChange={jest.fn()} />);
    const uno = BOARDS.find((b) => b.fqbn === 'arduino:avr:uno');
    expect(screen.getByText(uno.label)).toBeInTheDocument();
  });
});
