import React from 'react';
import { render, screen } from '@testing-library/react';
import BlockInfoPanel from './BlockInfoPanel';

const INFO_AVANZADO = {
  title: 'digitalWrite',
  description: 'Escribe HIGH o LOW en un pin digital.',
  code: 'digitalWrite(13, HIGH);',
  tip: 'El LED integrado está en el pin 13.',
};

const INFO_KIDS = {
  emoji: '💡',
  title: '¡Enciende una luz!',
  description: 'Este bloque enciende o apaga un pin.',
  example: 'Conecta un LED al pin 13.',
  tip: 'No olvides la resistencia.',
};

describe('BlockInfoPanel', () => {
  test('no renderiza nada sin información', () => {
    const { container } = render(<BlockInfoPanel info={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  describe('modo avanzado', () => {
    test('escritorio: muestra título, descripción, código y consejo', () => {
      render(<BlockInfoPanel info={INFO_AVANZADO} />);
      expect(screen.getByText('digitalWrite')).toBeInTheDocument();
      expect(screen.getByText(/Escribe HIGH o LOW/)).toBeInTheDocument();
      expect(screen.getByText('digitalWrite(13, HIGH);')).toBeInTheDocument();
      expect(screen.getByText(/LED integrado/)).toBeInTheDocument();
    });

    test('escritorio: omite código y consejo cuando no existen', () => {
      render(<BlockInfoPanel info={{ title: 'break', description: 'Sale del bucle.' }} />);
      expect(screen.getByText('break')).toBeInTheDocument();
      expect(screen.queryByText('digitalWrite(13, HIGH);')).not.toBeInTheDocument();
    });

    test('móvil: apila descripción y código', () => {
      render(<BlockInfoPanel info={INFO_AVANZADO} isMobile />);
      expect(screen.getByText('digitalWrite')).toBeInTheDocument();
      expect(screen.getByText('digitalWrite(13, HIGH);')).toBeInTheDocument();
    });

    test('móvil: sin código solo muestra la descripción', () => {
      render(<BlockInfoPanel info={{ title: 'millis', description: 'Tiempo desde el inicio.' }} isMobile />);
      expect(screen.getByText('millis')).toBeInTheDocument();
      expect(screen.getByText('Tiempo desde el inicio.')).toBeInTheDocument();
    });
  });

  describe('modo kids', () => {
    test('escritorio: muestra emoji, ejemplo y consejo', () => {
      render(<BlockInfoPanel info={INFO_KIDS} mode="kids" />);
      expect(screen.getByText('💡')).toBeInTheDocument();
      expect(screen.getByText('¡Enciende una luz!')).toBeInTheDocument();
      expect(screen.getByText(/Conecta un LED/)).toBeInTheDocument();
      expect(screen.getByText('No olvides la resistencia.')).toBeInTheDocument();
    });

    test('escritorio: usa un emoji por defecto si falta', () => {
      render(<BlockInfoPanel info={{ title: 'Bloque', description: 'Texto' }} mode="kids" />);
      expect(screen.getByText('🧩')).toBeInTheDocument();
    });

    test('escritorio: sin ejemplo solo muestra el consejo', () => {
      render(<BlockInfoPanel info={{ title: 'T', description: 'D', tip: 'Solo consejo' }} mode="kids" />);
      expect(screen.getByText('Solo consejo')).toBeInTheDocument();
    });

    test('móvil: versión compacta con ejemplo y consejo', () => {
      render(<BlockInfoPanel info={INFO_KIDS} mode="kids" isMobile />);
      expect(screen.getByText('¡Enciende una luz!')).toBeInTheDocument();
      expect(screen.getByText(/Conecta un LED/)).toBeInTheDocument();
      expect(screen.getByText('No olvides la resistencia.')).toBeInTheDocument();
    });

    test('móvil: sin ejemplo ni consejo no muestra la fila inferior', () => {
      render(<BlockInfoPanel info={{ title: 'T', description: 'D' }} mode="kids" isMobile />);
      expect(screen.getByText('T')).toBeInTheDocument();
      expect(screen.queryByText(/Ej:/)).not.toBeInTheDocument();
    });

    test('móvil: solo con ejemplo', () => {
      render(<BlockInfoPanel info={{ title: 'T', description: 'D', example: 'Prueba esto' }} mode="kids" isMobile />);
      expect(screen.getByText('Prueba esto')).toBeInTheDocument();
    });
  });
});
