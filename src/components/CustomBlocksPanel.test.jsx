import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import * as Blockly from 'blockly';
import CustomBlocksPanel, { registerCustomBlock } from './CustomBlocksPanel';
import { arduinoGenerator } from '../blocks/arduinoGenerator';

const LS_KEY = 'arduino-blocks-custom';

function refMock() {
  return {
    current: {
      updateCustomBlocksInToolbox: jest.fn(),
      addCustomBlock: jest.fn().mockReturnValue(true),
    },
  };
}

beforeEach(() => localStorage.clear());

describe('registerCustomBlock', () => {
  test('define el bloque en Blockly y su generador', () => {
    registerCustomBlock({ id: 'abc', label: 'Motor ON', code: 'motor.on();' });
    expect(Blockly.Blocks['custom_abc']).toBeDefined();
    const ws = new Blockly.Workspace();
    const block = ws.newBlock('custom_abc');
    expect(arduinoGenerator.forBlock['custom_abc'](block)).toBe('motor.on();\n');
    ws.dispose();
  });

  test('no duplica el salto de línea final', () => {
    registerCustomBlock({ id: 'nl', label: 'X', code: 'x();\n' });
    expect(arduinoGenerator.forBlock['custom_nl']({})).toBe('x();\n');
  });

  test('re-registrar solo actualiza el generador', () => {
    registerCustomBlock({ id: 'dup', label: 'Uno', code: 'uno();', color: 200 });
    const primera = Blockly.Blocks['custom_dup'];
    registerCustomBlock({ id: 'dup', label: 'Dos', code: 'dos();' });
    expect(Blockly.Blocks['custom_dup']).toBe(primera);
    expect(arduinoGenerator.forBlock['custom_dup']({})).toBe('dos();\n');
  });

  test('el init del bloque configura etiqueta y color', () => {
    registerCustomBlock({ id: 'init', label: 'Etiqueta', code: 'y();' });
    const ws = new Blockly.Workspace();
    const block = ws.newBlock('custom_init');
    expect(block.getColour()).toBeTruthy();
    ws.dispose();
  });
});

describe('CustomBlocksPanel', () => {
  test('sin bloques guardados muestra el mensaje vacío', () => {
    const ref = refMock();
    render(<CustomBlocksPanel blockEditorRef={ref} />);
    expect(screen.getByText(/Aún no hay bloques personalizados/)).toBeInTheDocument();
    expect(screen.getByText('Mis bloques (0)')).toBeInTheDocument();
  });

  test('carga y registra los bloques guardados al montar', () => {
    localStorage.setItem(LS_KEY, JSON.stringify([{ id: 'g1', label: 'Guardado', code: 'guardado();' }]));
    const ref = refMock();
    render(<CustomBlocksPanel blockEditorRef={ref} />);
    expect(screen.getByText('Guardado')).toBeInTheDocument();
    expect(ref.current.updateCustomBlocksInToolbox).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'g1' })]),
    );
  });

  test('un localStorage corrupto no rompe el panel', () => {
    localStorage.setItem(LS_KEY, 'no-json');
    render(<CustomBlocksPanel blockEditorRef={refMock()} />);
    expect(screen.getByText('Mis bloques (0)')).toBeInTheDocument();
  });

  test('crea un bloque nuevo y lo persiste', () => {
    const ref = refMock();
    render(<CustomBlocksPanel blockEditorRef={ref} />);
    fireEvent.change(screen.getByLabelText('Nombre del bloque'), { target: { value: 'Activar motor' } });
    fireEvent.change(screen.getByLabelText('Código C++ generado'), { target: { value: 'motor.setSpeed(255);' } });
    fireEvent.click(screen.getByRole('button', { name: /crear bloque/i }));

    expect(screen.getByText('Activar motor')).toBeInTheDocument();
    expect(screen.getByText('Mis bloques (1)')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(LS_KEY))).toHaveLength(1);
    expect(ref.current.updateCustomBlocksInToolbox).toHaveBeenCalledTimes(2);
  });

  test('la tecla Enter en el nombre también crea el bloque', () => {
    render(<CustomBlocksPanel blockEditorRef={refMock()} />);
    fireEvent.change(screen.getByLabelText('Nombre del bloque'), { target: { value: 'Rápido' } });
    fireEvent.change(screen.getByLabelText('Código C++ generado'), { target: { value: 'rapido();' } });
    fireEvent.keyDown(screen.getByLabelText('Nombre del bloque'), { key: 'Enter' });
    expect(screen.getByText('Mis bloques (1)')).toBeInTheDocument();
  });

  test('otras teclas no crean el bloque', () => {
    render(<CustomBlocksPanel blockEditorRef={refMock()} />);
    fireEvent.change(screen.getByLabelText('Nombre del bloque'), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText('Código C++ generado'), { target: { value: 'x();' } });
    fireEvent.keyDown(screen.getByLabelText('Nombre del bloque'), { key: 'a' });
    expect(screen.getByText('Mis bloques (0)')).toBeInTheDocument();
  });

  test('valida que haya nombre y código', () => {
    localStorage.setItem(LS_KEY, JSON.stringify([]));
    const { rerender } = render(<CustomBlocksPanel blockEditorRef={refMock()} />);
    // El botón está deshabilitado sin datos, así que se usa Enter para forzar la validación
    fireEvent.keyDown(screen.getByLabelText('Nombre del bloque'), { key: 'Enter' });
    expect(screen.getByText('Escribe un nombre para el bloque')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nombre del bloque'), { target: { value: 'Solo nombre' } });
    fireEvent.keyDown(screen.getByLabelText('Nombre del bloque'), { key: 'Enter' });
    expect(screen.getByText('Escribe el código C++ que generará el bloque')).toBeInTheDocument();
    rerender(<CustomBlocksPanel blockEditorRef={refMock()} />);
  });

  test('el aviso de error se puede cerrar', () => {
    render(<CustomBlocksPanel blockEditorRef={refMock()} />);
    fireEvent.keyDown(screen.getByLabelText('Nombre del bloque'), { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByText('Escribe un nombre para el bloque')).not.toBeInTheDocument();
  });

  test('inserta un bloque en el workspace', () => {
    localStorage.setItem(LS_KEY, JSON.stringify([{ id: 'ins', label: 'Insertable', code: 'ins();' }]));
    const ref = refMock();
    render(<CustomBlocksPanel blockEditorRef={ref} />);
    fireEvent.click(screen.getByRole('button', { name: /insertar en workspace/i }));
    expect(ref.current.addCustomBlock).toHaveBeenCalledWith('ins');
  });

  test('avisa por consola si no se pudo insertar', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(LS_KEY, JSON.stringify([{ id: 'ko', label: 'Fallo', code: 'ko();' }]));
    const ref = refMock();
    ref.current.addCustomBlock.mockReturnValue(false);
    render(<CustomBlocksPanel blockEditorRef={ref} />);
    fireEvent.click(screen.getByRole('button', { name: /insertar en workspace/i }));
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  test('elimina un bloque de la lista', () => {
    localStorage.setItem(LS_KEY, JSON.stringify([{ id: 'del', label: 'Borrable', code: 'del();' }]));
    const ref = refMock();
    render(<CustomBlocksPanel blockEditorRef={ref} />);
    fireEvent.click(screen.getByRole('button', { name: /eliminar bloque/i }));
    expect(screen.queryByText('Borrable')).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(LS_KEY))).toEqual([]);
  });

  test('recorta el código largo en la vista previa', () => {
    const largo = 'a'.repeat(80) + ';';
    localStorage.setItem(LS_KEY, JSON.stringify([{ id: 'l', label: 'Largo', code: largo }]));
    render(<CustomBlocksPanel blockEditorRef={refMock()} />);
    expect(screen.getByText(/…$/)).toBeInTheDocument();
  });

  test('funciona aunque el editor de bloques todavía no esté montado', () => {
    render(<CustomBlocksPanel blockEditorRef={{ current: null }} />);
    fireEvent.change(screen.getByLabelText('Nombre del bloque'), { target: { value: 'Sin editor' } });
    fireEvent.change(screen.getByLabelText('Código C++ generado'), { target: { value: 'x();' } });
    fireEvent.click(screen.getByRole('button', { name: /crear bloque/i }));
    expect(screen.getByText('Mis bloques (1)')).toBeInTheDocument();
  });
});
