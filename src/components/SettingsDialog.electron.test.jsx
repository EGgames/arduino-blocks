// El mock de electronAPI debe instalarse antes de importar el componente
import { installElectronMock } from './__testutils__/electronMock';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SettingsDialog from './SettingsDialog';
import { BOARDS } from '../data/boards';

const SETTINGS = { theme: 'dark', fontSize: 13, mode: 'advanced', comPort: '', board: BOARDS[0].fqbn };

function abrir(props = {}) {
  const onSettingsChange = jest.fn();
  const utils = render(
    <SettingsDialog
      open
      onClose={jest.fn()}
      settings={{ ...SETTINGS, ...props.settings }}
      onSettingsChange={onSettingsChange}
    />,
  );
  return { onSettingsChange, ...utils };
}

beforeEach(() => {
  installElectronMock({
    listPorts: jest.fn().mockResolvedValue({
      ports: [{ port: 'COM3', description: 'Arduino Uno' }, { port: 'COM9' }],
    }),
  });
});

describe('SettingsDialog en modo escritorio', () => {
  test('al abrirse carga los puertos disponibles', async () => {
    abrir();
    await waitFor(() => expect(window.electronAPI.listPorts).toHaveBeenCalled());
  });

  test('permite elegir un puerto COM', async () => {
    const { onSettingsChange } = abrir();
    await waitFor(() => expect(window.electronAPI.listPorts).toHaveBeenCalled());
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
    fireEvent.click(await screen.findByText('COM3'));
    expect(onSettingsChange).toHaveBeenCalledWith({ comPort: 'COM3' });
  });

  test('el botón de refrescar vuelve a listar los puertos', async () => {
    abrir();
    await waitFor(() => expect(window.electronAPI.listPorts).toHaveBeenCalledTimes(1));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /actualizar puertos/i })); });
    expect(window.electronAPI.listPorts).toHaveBeenCalledTimes(2);
  });

  test('un fallo al listar puertos se registra sin romper el panel', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    installElectronMock({ listPorts: jest.fn().mockRejectedValue(new Error('sin acceso')) });
    abrir();
    await waitFor(() => expect(warn).toHaveBeenCalled());
    warn.mockRestore();
  });

  test('comprobar actualizaciones informa cuando no hay ninguna', async () => {
    window.electronAPI.checkForUpdates.mockResolvedValue({ notAvailable: true });
    abrir();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /comprobar actualizaciones/i })); });
    expect(await screen.findByText('No hay actualizaciones disponibles.')).toBeInTheDocument();
  });

  test('informa cuando sí hay actualización', async () => {
    window.electronAPI.checkForUpdates.mockResolvedValue({ available: true });
    abrir();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /comprobar actualizaciones/i })); });
    expect(await screen.findByText('Se encontró una actualización disponible.')).toBeInTheDocument();
  });

  test('informa del modo desarrollo', async () => {
    window.electronAPI.checkForUpdates.mockResolvedValue({ dev: true });
    abrir();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /comprobar actualizaciones/i })); });
    expect(await screen.findByText(/modo desarrollo/)).toBeInTheDocument();
  });

  test('informa de un error devuelto por el actualizador', async () => {
    window.electronAPI.checkForUpdates.mockResolvedValue({ error: 'sin red' });
    abrir();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /comprobar actualizaciones/i })); });
    expect(await screen.findByText(/sin red/)).toBeInTheDocument();
  });

  test('informa de una excepción al comprobar', async () => {
    window.electronAPI.checkForUpdates.mockRejectedValue(new Error('boom'));
    abrir();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /comprobar actualizaciones/i })); });
    expect(await screen.findByText('No se pudo comprobar actualizaciones.')).toBeInTheDocument();
  });

  test('el aviso de actualizaciones se puede cerrar', async () => {
    window.electronAPI.checkForUpdates.mockResolvedValue({ notAvailable: true });
    abrir();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /comprobar actualizaciones/i })); });
    const aviso = await screen.findByText('No hay actualizaciones disponibles.');
    expect(aviso).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
  });

  test('permite cambiar el tema, el modo, la placa y el tamaño de fuente', async () => {
    const { onSettingsChange } = abrir();
    await waitFor(() => expect(window.electronAPI.listPorts).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /claro/i }));
    expect(onSettingsChange).toHaveBeenCalledWith({ theme: 'light' });

    fireEvent.click(screen.getByRole('button', { name: /niño/i }));
    expect(onSettingsChange).toHaveBeenCalledWith({ mode: 'kids' });

    fireEvent.mouseDown(screen.getAllByRole('combobox')[1]);
    fireEvent.click(await screen.findByRole('option', { name: BOARDS[1].label }));
    expect(onSettingsChange).toHaveBeenCalledWith({ board: BOARDS[1].fqbn });
  });

  test('el deslizador de fuente propaga el nuevo valor', async () => {
    const { onSettingsChange } = abrir();
    await waitFor(() => expect(window.electronAPI.listPorts).toHaveBeenCalled());
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 18 } });
    await waitFor(() => expect(onSettingsChange).toHaveBeenCalledWith({ fontSize: 18 }));
  });

  test('el botón de cerrar llama a onClose', async () => {
    const onClose = jest.fn();
    render(
      <SettingsDialog open onClose={onClose} settings={SETTINGS} onSettingsChange={jest.fn()} />,
    );
    await waitFor(() => expect(window.electronAPI.listPorts).toHaveBeenCalled());
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onClose).toHaveBeenCalled();
  });

  test('cerrado no dispara la carga de puertos', () => {
    render(
      <SettingsDialog open={false} onClose={jest.fn()} settings={SETTINGS} onSettingsChange={jest.fn()} />,
    );
    expect(window.electronAPI.listPorts).not.toHaveBeenCalled();
  });
});
