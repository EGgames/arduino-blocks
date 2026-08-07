import React from 'react';
import { render } from '@testing-library/react';
import UpdaterDialog from './UpdaterDialog';

// Sin window.electronAPI: el componente debe comportarse como en el navegador.
describe('UpdaterDialog en modo web', () => {
  test('no registra listeners ni renderiza nada', () => {
    const { container, unmount } = render(<UpdaterDialog />);
    expect(container).toBeEmptyDOMElement();
    expect(() => unmount()).not.toThrow();
  });
});
