import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CodePreview from './CodePreview';

describe('CodePreview', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.assign(navigator, { clipboard: { writeText: jest.fn() } });
    global.URL.createObjectURL = jest.fn(() => 'blob:fake');
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('muestra un mensaje cuando no hay código', () => {
    render(<CodePreview code="" />);
    expect(screen.getByText(/Agrega bloques para ver el código/)).toBeInTheDocument();
  });

  test('numera las líneas del código', () => {
    render(<CodePreview code={'void setup() {\n}\nvoid loop() {}'} />);
    expect(screen.getByText('void setup() {')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('copia el código al portapapeles y vuelve al estado inicial', () => {
    render(<CodePreview code="int x = 1;" />);
    fireEvent.click(screen.getByRole('button', { name: /copiar/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('int x = 1;');
    act(() => { jest.advanceTimersByTime(2100); });
  });

  test('descarga el sketch como .ino en modo web', () => {
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<CodePreview code="int x = 1;" />);
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  test('la pestaña sketch.ino está presente', () => {
    render(<CodePreview code="x" />);
    const tab = screen.getByRole('tab', { name: 'sketch.ino' });
    expect(tab).toBeInTheDocument();
    fireEvent.click(tab);
  });
});
