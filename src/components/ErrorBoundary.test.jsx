import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function Bomba({ explota, mensaje }) {
  if (explota) throw new Error(mensaje ?? 'boom');
  return <div>contenido ok</div>;
}

describe('ErrorBoundary', () => {
  let consoleError;
  beforeEach(() => { consoleError = jest.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { consoleError.mockRestore(); });

  test('renderiza los hijos cuando no hay error', () => {
    render(<ErrorBoundary><Bomba explota={false} /></ErrorBoundary>);
    expect(screen.getByText('contenido ok')).toBeInTheDocument();
  });

  test('muestra la pantalla de error con el mensaje de la excepción', () => {
    render(<ErrorBoundary><Bomba explota mensaje="fallo al renderizar" /></ErrorBoundary>);
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('fallo al renderizar')).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
  });

  test('usa un mensaje genérico si el error no tiene texto', () => {
    render(<ErrorBoundary><Bomba explota mensaje="" /></ErrorBoundary>);
    expect(screen.getByText('Error inesperado en la aplicación.')).toBeInTheDocument();
  });

  test('el botón Reintentar vuelve a renderizar los hijos', () => {
    function Contenedor() {
      const [explota, setExplota] = React.useState(true);
      return (
        <>
          <button onClick={() => setExplota(false)}>arreglar</button>
          <ErrorBoundary><Bomba explota={explota} /></ErrorBoundary>
        </>
      );
    }
    render(<Contenedor />);
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('arreglar'));
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(screen.getByText('contenido ok')).toBeInTheDocument();
  });
});
