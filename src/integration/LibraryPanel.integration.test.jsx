/**
 * Tests de integración: LibraryPanel
 *
 * Verifica la interacción completa del panel de librerías:
 * búsqueda, filtro por categoría, adición de librerías y estado visual.
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import LibraryPanel from '../components/LibraryPanel';
import { ARDUINO_LIBRARIES, LIBRARY_CATEGORIES } from '../data/arduinoLibraries';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeBlockEditorRef(addIncludeBlock = jest.fn()) {
  return { current: { addIncludeBlock } };
}

function renderPanel(props = {}) {
  const blockEditorRef = makeBlockEditorRef(props.addIncludeBlock);
  const { rerender, ...rest } = render(
    <LibraryPanel
      blockEditorRef={blockEditorRef}
      activeIncludes={props.activeIncludes ?? []}
      isDark={props.isDark ?? true}
    />,
  );
  return { ...rest, blockEditorRef, rerender };
}

// ─── Render inicial ───────────────────────────────────────────────────────────

describe('LibraryPanel — render inicial', () => {
  test('muestra el campo de búsqueda', () => {
    renderPanel();
    expect(screen.getByPlaceholderText('Buscar librería…')).toBeInTheDocument();
  });

  test('muestra el chip "Todas" (categoría por defecto)', () => {
    renderPanel();
    expect(screen.getByText('Todas')).toBeInTheDocument();
  });

  test('muestra todos los chips de categoría', () => {
    renderPanel();
    // Verificar que exista al menos un chip por categoría (role="button" con el nombre exacto)
    LIBRARY_CATEGORIES.forEach((cat) => {
      const chips = screen.getAllByText(cat);
      expect(chips.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('muestra el contador total de librerías', () => {
    renderPanel();
    const total = ARDUINO_LIBRARIES.length;
    expect(screen.getByText(new RegExp(`${total} librería`))).toBeInTheDocument();
  });

  test('muestra la librería Wire en la lista', () => {
    renderPanel();
    expect(screen.getByText('Wire')).toBeInTheDocument();
  });

  test('muestra la librería Servo en la lista', () => {
    renderPanel();
    expect(screen.getByText('Servo')).toBeInTheDocument();
  });
});

// ─── Búsqueda ─────────────────────────────────────────────────────────────────

describe('LibraryPanel — búsqueda', () => {
  test('buscar "Wire" filtra resultados a solo Wire', () => {
    renderPanel();
    fireEvent.change(screen.getByPlaceholderText('Buscar librería…'), {
      target: { value: 'Wire' },
    });
    expect(screen.getByText('Wire')).toBeInTheDocument();
    expect(screen.queryByText('Servo')).not.toBeInTheDocument();
  });

  test('búsqueda insensible a mayúsculas', () => {
    renderPanel();
    fireEvent.change(screen.getByPlaceholderText('Buscar librería…'), {
      target: { value: 'wire' },
    });
    expect(screen.getByText('Wire')).toBeInTheDocument();
  });

  test('búsqueda por descripción encuentra resultados', () => {
    renderPanel();
    // Buscar por una palabra de la descripción de Wire ("I2C" or "Two Wire")
    const wireLib = ARDUINO_LIBRARIES.find((l) => l.name === 'Wire');
    const descWord = wireLib.description.split(' ')[0];
    fireEvent.change(screen.getByPlaceholderText('Buscar librería…'), {
      target: { value: descWord },
    });
    expect(screen.getByText('Wire')).toBeInTheDocument();
  });

  test('sin resultados muestra mensaje "Sin resultados"', () => {
    renderPanel();
    fireEvent.change(screen.getByPlaceholderText('Buscar librería…'), {
      target: { value: 'xxxxxxxxxxx_no_existe' },
    });
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  test('limpiar búsqueda restaura todas las librerías', () => {
    renderPanel();
    const input = screen.getByPlaceholderText('Buscar librería…');
    fireEvent.change(input, { target: { value: 'Wire' } });
    fireEvent.change(input, { target: { value: '' } });
    const total = ARDUINO_LIBRARIES.length;
    expect(screen.getByText(new RegExp(`${total} librería`))).toBeInTheDocument();
  });

  test('contador se actualiza al buscar', () => {
    renderPanel();
    // 'Servo' es único: solo coincide la librería Servo (nombre y descripción)
    fireEvent.change(screen.getByPlaceholderText('Buscar librería…'), {
      target: { value: 'Servo' },
    });
    expect(screen.getByTestId('library-counter').textContent).toMatch(/^1 librería/);
  });
});

// ─── Filtro por categoría ─────────────────────────────────────────────────────

describe('LibraryPanel — filtro por categoría', () => {
  test('clic en "Sensores" filtra solo librerías de Sensores', () => {
    renderPanel();
    // Los chips tienen rol button; usar getAllByText pues la categoría aparece también en items
    const sensoresChips = screen.getAllByText('Sensores');
    fireEvent.click(sensoresChips[0]);
    const sensoresLibs = ARDUINO_LIBRARIES.filter((l) => l.category === 'Sensores');
    sensoresLibs.forEach((lib) => {
      expect(screen.getByText(lib.name)).toBeInTheDocument();
    });
    const otherLib = ARDUINO_LIBRARIES.find((l) => l.category !== 'Sensores');
    expect(screen.queryByText(otherLib.name)).not.toBeInTheDocument();
  });

  test('contador refleja el número de librerías en la categoría', () => {
    renderPanel();
    const cat = 'Displays';
    const count = ARDUINO_LIBRARIES.filter((l) => l.category === cat).length;
    const displayChips = screen.getAllByText(cat);
    fireEvent.click(displayChips[0]);
    expect(screen.getByTestId('library-counter').textContent).toMatch(new RegExp(`^${count} librer`));
  });

  test('clic en "Todas" después de filtrar restaura todas las librerías', () => {
    renderPanel();
    const sensoresChips = screen.getAllByText('Sensores');
    fireEvent.click(sensoresChips[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Todas' }));
    const total = ARDUINO_LIBRARIES.length;
    expect(screen.getByTestId('library-counter').textContent).toMatch(new RegExp(`^${total} librer`));
  });

  test('combinación de búsqueda + categoría filtra correctamente', () => {
    renderPanel();
    const comChips = screen.getAllByText('Comunicación');
    fireEvent.click(comChips[0]);
    const comunicacionLibs = ARDUINO_LIBRARIES.filter((l) => l.category === 'Comunicación');
    const comCount = comunicacionLibs.length;
    expect(screen.getByTestId('library-counter').textContent).toMatch(new RegExp(`^${comCount} librer`));
    // Buscar dentro de la categoría con término único ('IRremote' solo existe 1 en Comunicación)
    fireEvent.change(screen.getByPlaceholderText('Buscar librería…'), {
      target: { value: 'IRremote' },
    });
    expect(screen.getByTestId('library-counter').textContent).toMatch(/^1 librería/);
  });
});

// ─── Agregar librería ─────────────────────────────────────────────────────────

describe('LibraryPanel — agregar librería', () => {
  test('clic en librería disponible llama a addIncludeBlock', () => {
    const addIncludeBlock = jest.fn();
    const { blockEditorRef } = renderPanel({ addIncludeBlock });
    blockEditorRef.current.addIncludeBlock = addIncludeBlock;
    fireEvent.click(screen.getByText('Wire'));
    expect(addIncludeBlock).toHaveBeenCalledWith('Wire');
  });

  test('clic en librería ya incluida NO llama a addIncludeBlock', () => {
    const addIncludeBlock = jest.fn();
    const { blockEditorRef } = renderPanel({
      activeIncludes: ['Wire'],
      addIncludeBlock,
    });
    blockEditorRef.current.addIncludeBlock = addIncludeBlock;
    const wireButton = screen.getByText('Wire').closest('li');
    const button = within(wireButton).getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(button);
    expect(addIncludeBlock).not.toHaveBeenCalled();
  });

  test('contador muestra librerías incluidas', () => {
    renderPanel({ activeIncludes: ['Wire', 'SPI'] });
    expect(screen.getByText(/2 incluidas/)).toBeInTheDocument();
  });

  test('contador singular para 1 librería incluida', () => {
    renderPanel({ activeIncludes: ['Servo'] });
    expect(screen.getByText(/1 incluida\b/)).toBeInTheDocument();
  });
});

// ─── Modo light ───────────────────────────────────────────────────────────────

describe('LibraryPanel — modo light', () => {
  test('renderiza sin errores en modo claro', () => {
    expect(() => renderPanel({ isDark: false })).not.toThrow();
  });

  test('muestra las librerías en modo claro', () => {
    renderPanel({ isDark: false });
    expect(screen.getByText('Wire')).toBeInTheDocument();
  });
});
