import React from 'react';
import { render, screen, fireEvent, within, waitForElementToBeRemoved } from '@testing-library/react';
import KidsProjectsPanel from './KidsProjectsPanel';
import KidsHelpPanel from './KidsHelpPanel';
import KidsTutorial from './KidsTutorial';

describe('KidsProjectsPanel', () => {
  test('lista las tarjetas de proyecto', () => {
    render(<KidsProjectsPanel onLoadProject={jest.fn()} />);
    expect(screen.getByText('🚀 Proyectos de ejemplo')).toBeInTheDocument();
    expect(screen.getByText('Semáforo')).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(5);
  });

  test('al pulsar una tarjeta carga el proyecto con su XML y título', () => {
    const onLoadProject = jest.fn();
    render(<KidsProjectsPanel onLoadProject={onLoadProject} />);
    fireEvent.click(screen.getByText('Semáforo'));
    expect(onLoadProject).toHaveBeenCalledTimes(1);
    const [xml, titulo] = onLoadProject.mock.calls[0];
    expect(titulo).toBe('Semáforo');
    expect(xml).toContain('<xml');
    expect(screen.getByText(/¡Proyecto cargado!/)).toBeInTheDocument();
  });

  test('la notificación se puede cerrar', async () => {
    render(<KidsProjectsPanel onLoadProject={jest.fn()} />);
    fireEvent.click(screen.getByText('Semáforo'));
    const aviso = screen.getByText(/¡Proyecto cargado!/);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    await waitForElementToBeRemoved(aviso);
  });

  test('sin callback no falla ni muestra la notificación', () => {
    render(<KidsProjectsPanel />);
    fireEvent.click(screen.getByText('Semáforo'));
    expect(screen.queryByText(/¡Proyecto cargado!/)).not.toBeInTheDocument();
  });

  test('todos los proyectos tienen un XML de bloques válido', () => {
    const onLoadProject = jest.fn();
    render(<KidsProjectsPanel onLoadProject={onLoadProject} />);
    const tarjetas = screen.getAllByRole('button');
    tarjetas.forEach((t) => fireEvent.click(t));
    expect(onLoadProject.mock.calls.length).toBe(tarjetas.length);
    for (const [xml, titulo] of onLoadProject.mock.calls) {
      expect(typeof titulo).toBe('string');
      expect(xml).toContain('kids_setup_loop');
    }
  });
});

describe('KidsHelpPanel', () => {
  test('muestra el título y la primera sección desplegada', () => {
    render(<KidsHelpPanel />);
    expect(screen.getByText('❓ Ayuda y Guía de Bloques')).toBeInTheDocument();
    expect(screen.getByText(/¿Necesitas más ayuda\?/)).toBeInTheDocument();
  });

  test('permite abrir y cerrar las secciones', () => {
    render(<KidsHelpPanel />);
    const cabeceras = screen.getAllByRole('button');
    expect(cabeceras.length).toBeGreaterThan(1);

    // Abrir la segunda sección
    fireEvent.click(cabeceras[1]);
    expect(cabeceras[1]).toHaveAttribute('aria-expanded', 'true');

    // Cerrarla de nuevo
    fireEvent.click(cabeceras[1]);
    expect(cabeceras[1]).toHaveAttribute('aria-expanded', 'false');
  });

  test('cada sección lista sus bloques con ejemplo o consejo', () => {
    render(<KidsHelpPanel />);
    const cabeceras = screen.getAllByRole('button');
    cabeceras.forEach((c) => fireEvent.click(c));
    expect(screen.getAllByText(/Ej:/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/💡/).length).toBeGreaterThan(0);
  });
});

describe('KidsTutorial', () => {
  test('muestra la lista de tutoriales', () => {
    render(<KidsTutorial />);
    expect(screen.getByText('🎓 Tutoriales')).toBeInTheDocument();
    expect(screen.getAllByText(/pasos$/).length).toBeGreaterThan(0);
  });

  test('al elegir un tutorial se abre en el primer paso', () => {
    render(<KidsTutorial />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByText(/Paso 1 de/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /atras/i })).toBeDisabled();
  });

  test('se puede avanzar y retroceder entre pasos', () => {
    render(<KidsTutorial />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(screen.getByText(/Paso 2 de/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /atras/i }));
    expect(screen.getByText(/Paso 1 de/)).toBeInTheDocument();
  });

  test('en el último paso aparece el botón de completado y vuelve a la lista', () => {
    render(<KidsTutorial />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    const total = Number(screen.getByText(/Paso 1 de \d+/).textContent.match(/de (\d+)/)[1]);
    for (let i = 1; i < total; i++) {
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    }
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled();
    const completar = screen.getByRole('button', { name: /Tutorial completado/ });
    fireEvent.click(completar);
    expect(screen.getByText('🎓 Tutoriales')).toBeInTheDocument();
  });

  test('el enlace de migas vuelve a la lista', () => {
    render(<KidsTutorial />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Tutoriales' }));
    expect(screen.getByText('🎓 Tutoriales')).toBeInTheDocument();
  });

  test('todos los tutoriales se pueden abrir', () => {
    const { container } = render(<KidsTutorial />);
    const total = within(container).getAllByRole('button').length;
    for (let i = 0; i < total; i++) {
      fireEvent.click(screen.getAllByRole('button')[i]);
      expect(screen.getByText(/Paso 1 de/)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Tutoriales' }));
    }
  });
});
