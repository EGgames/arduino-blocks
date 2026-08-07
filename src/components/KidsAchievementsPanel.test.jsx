import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import KidsAchievementsPanel from './KidsAchievementsPanel';
import { BADGE_DEFS } from '../hooks/useKidsAchievements';

describe('KidsAchievementsPanel', () => {
  test('sin logros muestra 0 desbloqueados y todo bloqueado', () => {
    render(<KidsAchievementsPanel badges={{}} newBadge={null} onClearNewBadge={jest.fn()} />);
    expect(screen.getByText(`0 / ${BADGE_DEFS.length} desbloqueados`)).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getAllByText('???')).toHaveLength(BADGE_DEFS.length);
  });

  test('muestra el emoji y el título de las insignias desbloqueadas', () => {
    render(
      <KidsAchievementsPanel
        badges={{ primer_bloque: Date.now() }}
        newBadge={null}
        onClearNewBadge={jest.fn()}
      />,
    );
    expect(screen.getByText('¡Primer Bloque!')).toBeInTheDocument();
    expect(screen.getByText('🧱')).toBeInTheDocument();
    expect(screen.getByText(`1 / ${BADGE_DEFS.length} desbloqueados`)).toBeInTheDocument();
  });

  test('calcula el porcentaje de progreso', () => {
    const todas = Object.fromEntries(BADGE_DEFS.map((b) => [b.id, 1]));
    render(<KidsAchievementsPanel badges={todas} newBadge={null} onClearNewBadge={jest.fn()} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.queryByText('???')).not.toBeInTheDocument();
  });

  test('muestra la notificación de logro nuevo y permite cerrarla', () => {
    const onClear = jest.fn();
    render(
      <KidsAchievementsPanel
        badges={{ musica: 1 }}
        newBadge={BADGE_DEFS.find((b) => b.id === 'musica')}
        onClearNewBadge={onClear}
      />,
    );
    expect(screen.getByText(/¡Logro desbloqueado!/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClear).toHaveBeenCalled();
  });
});
