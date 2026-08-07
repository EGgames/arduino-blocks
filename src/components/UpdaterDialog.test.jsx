// El mock de electronAPI debe instalarse antes de importar el componente
import { updaterListeners, installElectronMock } from './__testutils__/electronMock';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import UpdaterDialog from './UpdaterDialog';

beforeEach(() => installElectronMock());

describe('UpdaterDialog en modo escritorio', () => {
  test('en estado inicial no muestra ningún diálogo', () => {
    const { container } = render(<UpdaterDialog />);
    expect(container).toBeEmptyDOMElement();
  });

  test('muestra el diálogo cuando hay versión nueva, con notas en texto', () => {
    render(<UpdaterDialog />);
    act(() => updaterListeners.available({ version: '1.3.0', releaseNotes: 'Bloques nuevos' }));
    expect(screen.getByText(/Nueva versión disponible/)).toHaveTextContent('1.3.0');
    expect(screen.getByText('Bloques nuevos')).toBeInTheDocument();
  });

  test('acepta notas de versión en formato lista', () => {
    render(<UpdaterDialog />);
    act(() => updaterListeners.available({
      version: '1.3.0',
      releaseNotes: [{ version: '1.3.0', note: 'Soporte de todas las librerías' }],
    }));
    expect(screen.getByText(/1.3.0: Soporte de todas las librerías/)).toBeInTheDocument();
  });

  test('sin notas de versión solo muestra el texto de invitación', () => {
    render(<UpdaterDialog />);
    act(() => updaterListeners.available({ version: '1.3.0' }));
    expect(screen.getByText(/¿Deseas descargarla e instalarla ahora\?/)).toBeInTheDocument();
  });

  test('«Más tarde» descarta la notificación', () => {
    const { container } = render(<UpdaterDialog />);
    act(() => updaterListeners.available({ version: '1.3.0' }));
    fireEvent.click(screen.getByRole('button', { name: 'Más tarde' }));
    expect(container).toBeEmptyDOMElement();
  });

  test('descargar muestra el progreso', () => {
    render(<UpdaterDialog />);
    act(() => updaterListeners.available({ version: '1.3.0' }));
    fireEvent.click(screen.getByRole('button', { name: 'Descargar e instalar' }));
    expect(window.electronAPI.downloadUpdate).toHaveBeenCalled();
    expect(screen.getByText(/Descargando actualización/)).toBeInTheDocument();
    act(() => updaterListeners.progress({ percent: 42 }));
    expect(screen.getByText(/42%/)).toBeInTheDocument();
    act(() => updaterListeners.progress({}));
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });

  test('un fallo al descargar muestra el diálogo de error', async () => {
    window.electronAPI.downloadUpdate.mockRejectedValueOnce(new Error('red caída'));
    render(<UpdaterDialog />);
    act(() => updaterListeners.available({ version: '1.3.0' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Descargar e instalar' }));
    });
    expect(screen.getByText('No se pudo iniciar la descarga.')).toBeInTheDocument();
  });

  test('descarga completada permite instalar y reiniciar', () => {
    render(<UpdaterDialog />);
    act(() => updaterListeners.downloaded({ version: '1.3.0' }));
    expect(screen.getByText(/Actualización lista/)).toHaveTextContent('1.3.0');
    fireEvent.click(screen.getByRole('button', { name: 'Instalar y reiniciar' }));
    expect(window.electronAPI.installUpdate).toHaveBeenCalled();
  });

  test('descarga completada también puede posponerse', () => {
    const { container } = render(<UpdaterDialog />);
    act(() => updaterListeners.downloaded({ version: '1.3.0' }));
    fireEvent.click(screen.getByRole('button', { name: 'Más tarde' }));
    expect(container).toBeEmptyDOMElement();
  });

  test('un error del actualizador se muestra y se puede cerrar', () => {
    render(<UpdaterDialog />);
    act(() => updaterListeners.error('firma inválida'));
    expect(screen.getByText('firma inválida')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByText('firma inválida')).not.toBeInTheDocument();
  });

  test('un error sin mensaje usa un texto genérico', () => {
    render(<UpdaterDialog />);
    act(() => updaterListeners.error(''));
    expect(screen.getByText('Ocurrió un error durante la actualización.')).toBeInTheDocument();
  });

  test('«sin actualizaciones» no cambia nada', () => {
    const { container } = render(<UpdaterDialog />);
    act(() => updaterListeners.notAvailable());
    expect(container).toBeEmptyDOMElement();
  });

  test('al desmontar retira los listeners', () => {
    const { unmount } = render(<UpdaterDialog />);
    unmount();
    expect(window.electronAPI.removeUpdateListeners).toHaveBeenCalled();
  });
});
