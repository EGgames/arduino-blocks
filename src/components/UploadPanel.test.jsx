// El mock de electronAPI debe instalarse antes de importar el componente
import { installElectronMock, uploadListeners } from './__testutils__/electronMock';
import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import UploadPanel from './UploadPanel';
import { BOARDS } from '../data/boards';

const CODIGO = 'void setup() {}\nvoid loop() {}';

beforeEach(() => {
  installElectronMock({
    listPorts: jest.fn().mockResolvedValue({
      ports: [{ port: 'COM3', board: 'Arduino Uno' }, { port: 'COM7' }],
    }),
  });
});

describe('UploadPanel en modo escritorio', () => {
  test('carga los puertos al montarse y preselecciona el primero', async () => {
    render(<UploadPanel code={CODIGO} />);
    await waitFor(() => expect(window.electronAPI.listPorts).toHaveBeenCalled());
    expect(await screen.findByText('COM3')).toBeInTheDocument();
  });

  test('permite cambiar de placa', async () => {
    render(<UploadPanel code={CODIGO} />);
    await waitFor(() => expect(window.electronAPI.listPorts).toHaveBeenCalled());
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /placa/i }));
    const opcion = await screen.findByRole('option', { name: BOARDS[1].label });
    fireEvent.click(opcion);
    expect(screen.getByRole('combobox', { name: /placa/i })).toHaveTextContent(BOARDS[1].label);
  });

  test('verificar compila y muestra la salida', async () => {
    window.electronAPI.compileCode.mockResolvedValue({ success: true, output: 'Sketch usa 900 bytes' });
    render(<UploadPanel code={CODIGO} />);
    await waitFor(() => expect(window.electronAPI.listPorts).toHaveBeenCalled());
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /verificar/i })); });
    expect(window.electronAPI.compileCode).toHaveBeenCalledWith(
      expect.objectContaining({ code: CODIGO }),
    );
    expect(await screen.findByText(/Sketch usa 900 bytes/)).toBeInTheDocument();
    expect(await screen.findByText(/Compilación exitosa/)).toBeInTheDocument();
  });

  test('un error de compilación se informa', async () => {
    window.electronAPI.compileCode.mockResolvedValue({ success: false, output: 'error: expected ;' });
    render(<UploadPanel code={CODIGO} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /verificar/i })); });
    expect(await screen.findByText(/Error de compilación/)).toBeInTheDocument();
  });

  test('una excepción al compilar se informa', async () => {
    window.electronAPI.compileCode.mockRejectedValue(new Error('arduino-cli no encontrado'));
    render(<UploadPanel code={CODIGO} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /verificar/i })); });
    expect(await screen.findByText(/arduino-cli no encontrado/)).toBeInTheDocument();
  });

  test('no compila si no hay código', async () => {
    render(<UploadPanel code="   " />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /verificar/i })); });
    expect(window.electronAPI.compileCode).not.toHaveBeenCalled();
    expect(await screen.findByText('No hay código para verificar')).toBeInTheDocument();
  });

  test('subir envía el código al puerto seleccionado y avisa al terminar', async () => {
    const onUploadSuccess = jest.fn();
    render(<UploadPanel code={CODIGO} onUploadSuccess={onUploadSuccess} />);
    expect(await screen.findByText('COM3')).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /subir/i })); });
    expect(window.electronAPI.uploadCode).toHaveBeenCalledWith(
      expect.objectContaining({ code: CODIGO, port: 'COM3' }),
    );
    expect(onUploadSuccess).toHaveBeenCalled();
    expect(await screen.findByText(/Código subido exitosamente/)).toBeInTheDocument();
  });

  test('una subida fallida no dispara el callback de éxito', async () => {
    const onUploadSuccess = jest.fn();
    window.electronAPI.uploadCode.mockResolvedValue({ success: false });
    render(<UploadPanel code={CODIGO} onUploadSuccess={onUploadSuccess} />);
    expect(await screen.findByText('COM3')).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /subir/i })); });
    expect(onUploadSuccess).not.toHaveBeenCalled();
    expect(await screen.findByText(/Error al subir/)).toBeInTheDocument();
  });

  test('una excepción al subir se informa', async () => {
    window.electronAPI.uploadCode.mockRejectedValue(new Error('puerto ocupado'));
    render(<UploadPanel code={CODIGO} />);
    expect(await screen.findByText('COM3')).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /subir/i })); });
    expect(await screen.findByText(/puerto ocupado/)).toBeInTheDocument();
  });

  test('sin código no intenta subir', async () => {
    render(<UploadPanel code="" />);
    expect(await screen.findByText('COM3')).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /subir/i })); });
    expect(window.electronAPI.uploadCode).not.toHaveBeenCalled();
    expect(await screen.findByText('No hay código para subir')).toBeInTheDocument();
  });

  test('sin puertos disponibles el desplegable lo indica y no se puede subir', async () => {
    installElectronMock({ listPorts: jest.fn().mockResolvedValue({ ports: [] }) });
    render(<UploadPanel code={CODIGO} defaultPort="" />);
    await waitFor(() => expect(window.electronAPI.listPorts).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: /subir/i })).toBeDisabled();
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /puerto com/i }));
    expect(await screen.findByText('Sin puertos detectados')).toBeInTheDocument();
  });

  test('el botón de refrescar vuelve a pedir los puertos', async () => {
    render(<UploadPanel code={CODIGO} />);
    await waitFor(() => expect(window.electronAPI.listPorts).toHaveBeenCalledTimes(1));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /actualizar puertos/i })); });
    expect(window.electronAPI.listPorts).toHaveBeenCalledTimes(2);
  });

  test('un fallo al listar puertos se informa', async () => {
    installElectronMock({ listPorts: jest.fn().mockRejectedValue(new Error('sin permisos')) });
    render(<UploadPanel code={CODIGO} />);
    expect(await screen.findByText(/sin permisos/)).toBeInTheDocument();
  });

  test('la salida en vivo del proceso se acumula en el log', async () => {
    render(<UploadPanel code={CODIGO} />);
    await waitFor(() => expect(window.electronAPI.onUploadOutput).toHaveBeenCalled());
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /verificar/i })); });
    act(() => { uploadListeners.output('línea 1\n'); });
    act(() => { uploadListeners.output('línea 2\n'); });
    const dialogo = screen.getByRole('dialog');
    expect(within(dialogo).getByText(/línea 1/)).toBeInTheDocument();
    expect(within(dialogo).getByText(/línea 2/)).toBeInTheDocument();
  });

  test('el diálogo de salida se puede cerrar', async () => {
    render(<UploadPanel code={CODIGO} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /verificar/i })); });
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  test('el modo plano no usa el contenedor Paper', async () => {
    const { container } = render(<UploadPanel code={CODIGO} flat />);
    await waitFor(() => expect(window.electronAPI.listPorts).toHaveBeenCalled());
    expect(container.querySelector('.MuiPaper-root:not(.MuiDialog-paper)')).toBeNull();
  });

  test('al desmontar libera el listener de salida', async () => {
    const { unmount } = render(<UploadPanel code={CODIGO} />);
    await waitFor(() => expect(window.electronAPI.listPorts).toHaveBeenCalled());
    unmount();
    expect(window.electronAPI.removeUploadOutput).toHaveBeenCalled();
  });
});
