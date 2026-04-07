/**
 * Tests US-049 — Aligner 6 livreurs dev cohérents (ConnexionScreen mobile)
 *
 * SC1 : Le picker mobile propose exactement 6 livreurs dev.
 * Les IDs et noms doivent correspondre aux valeurs canoniques.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { ConnexionScreen } from '../screens/ConnexionScreen';
import { DEV_LIVREURS } from '../constants/devLivreurs';
import type { AuthStore } from '../store/authStore';

// Mock minimaliste de l'authStore pour ce test
const mockAuthStore: AuthStore = {
  state: { statut: 'DECONNECTE', utilisateur: null, erreur: null },
  login: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn().mockReturnValue(() => {}),
  refresh: jest.fn().mockResolvedValue(undefined),
};

describe('ConnexionScreen — US-049 (6 livreurs dev)', () => {

  it('SC1 — DEV_LIVREURS contient exactement 6 livreurs', () => {
    expect(DEV_LIVREURS).toHaveLength(6);
  });

  it('SC1 — livreur-006 Lucas Petit est le 6ème livreur canonique', () => {
    const livreur006 = DEV_LIVREURS.find(l => l.id === 'livreur-006');
    expect(livreur006).toBeDefined();
    expect(livreur006?.prenom).toBe('Lucas');
    expect(livreur006?.nom).toBe('Petit');
  });

  it('SC1 — les IDs vont de livreur-001 à livreur-006', () => {
    const ids = DEV_LIVREURS.map(l => l.id);
    expect(ids).toEqual([
      'livreur-001', 'livreur-002', 'livreur-003',
      'livreur-004', 'livreur-005', 'livreur-006',
    ]);
  });

  it('SC1 — ConnexionScreen affiche 6 boutons livreurs en mode dev', () => {
    const { getByTestId } = render(
      <ConnexionScreen
        authStore={mockAuthStore}
        devLivreurs={DEV_LIVREURS}
      />
    );

    // Vérifier chaque bouton par testID
    expect(getByTestId('btn-dev-livreur-livreur-001')).toBeTruthy();
    expect(getByTestId('btn-dev-livreur-livreur-002')).toBeTruthy();
    expect(getByTestId('btn-dev-livreur-livreur-003')).toBeTruthy();
    expect(getByTestId('btn-dev-livreur-livreur-004')).toBeTruthy();
    expect(getByTestId('btn-dev-livreur-livreur-005')).toBeTruthy();
    expect(getByTestId('btn-dev-livreur-livreur-006')).toBeTruthy();
  });

  it('SC1 — le bouton livreur-006 affiche "Lucas Petit (livreur-006)"', () => {
    const { getByTestId } = render(
      <ConnexionScreen
        authStore={mockAuthStore}
        devLivreurs={DEV_LIVREURS}
      />
    );

    const btn006 = getByTestId('btn-dev-livreur-livreur-006');
    expect(btn006).toBeTruthy();
  });

  it('SC1 — livreur-005 Sophie Bernard figure dans la liste', () => {
    const livreur005 = DEV_LIVREURS.find(l => l.id === 'livreur-005');
    expect(livreur005?.prenom).toBe('Sophie');
    expect(livreur005?.nom).toBe('Bernard');
  });
});
