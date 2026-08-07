// El mock de electronAPI debe instalarse antes de importar el componente
import { installElectronMock } from './__testutils__/electronMock';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CodePreview from './CodePreview';

beforeEach(() => installElectronMock());

describe('CodePreview en modo escritorio', () => {
  test('guardar usa el diálogo nativo de Electron', async () => {
    render(<CodePreview code="int x = 1;" />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /guardar/i })); });
    expect(window.electronAPI.saveFile).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'int x = 1;', defaultName: 'mi_sketch.ino' }),
    );
  });
});
