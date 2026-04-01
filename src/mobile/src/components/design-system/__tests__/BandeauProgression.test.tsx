/**
 * Tests TDD — BandeauProgression (Mobile) (US-025)
 *
 * Composant bandeau de progression React Native.
 * Source design-system.md §3.3.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { BandeauProgression } from '../BandeauProgression';

describe('BandeauProgression (mobile) — US-025 §3.3', () => {

  const defaultProps = {
    resteLivrer: 7,
    total: 10,
    pourcentage: 30,
    statut: 'encours' as const,
    syncStatus: 'live' as const,
  };

  it('affiche le compteur resteLivrer / total', () => {
    const { getByTestId } = render(<BandeauProgression {...defaultProps} />);
    expect(getByTestId('bandeau-compteur')).toBeTruthy();
  });

  it('affiche la barre de progression', () => {
    const { getByTestId } = render(<BandeauProgression {...defaultProps} />);
    expect(getByTestId('bandeau-barre')).toBeTruthy();
  });

  it('affiche la fin estimée si fournie', () => {
    const { getByTestId } = render(
      <BandeauProgression {...defaultProps} finEstimee="14:30" />
    );
    expect(getByTestId('bandeau-fin-estimee')).toBeTruthy();
  });

  it('n\'affiche pas la fin estimée si absente', () => {
    const { queryByTestId } = render(<BandeauProgression {...defaultProps} />);
    expect(queryByTestId('bandeau-fin-estimee')).toBeNull();
  });

  it('affiche l\'IndicateurSync', () => {
    const { getByTestId } = render(
      <BandeauProgression {...defaultProps} syncStatus="offline" />
    );
    expect(getByTestId('indicateur-sync')).toBeTruthy();
  });
});
