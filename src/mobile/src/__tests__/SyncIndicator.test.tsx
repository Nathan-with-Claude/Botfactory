/**
 * Tests unitaires — SyncIndicator (US-006)
 *
 * Couvre :
 *  - SC1 : bandeau orange "Hors connexion" affiché si offline
 *  - SC5 : indicateur "Synchronisation en attente — X action(s)" si pendingCount > 0
 *  - SC5 : indicateur masqué si pendingCount = 0 (état normal)
 *  - SC4 : message "Synchronisation en cours" bloquant la clôture
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { SyncIndicator } from '../components/SyncIndicator';

describe('SyncIndicator — US-006', () => {

  it('SC1 — affiche le bandeau "Hors connexion" quand isOffline=true', () => {
    const { getByTestId, getByText } = render(
      <SyncIndicator
        isOffline={true}
        pendingCount={0}
        isSyncing={false}
      />
    );
    expect(getByTestId('bandeau-hors-connexion')).toBeTruthy();
    expect(getByText(/Hors connexion/)).toBeTruthy();
  });

  it('SC5 — affiche l\'indicateur de synchronisation si pendingCount > 0', () => {
    const { getByTestId, getByText } = render(
      <SyncIndicator
        isOffline={false}
        pendingCount={3}
        isSyncing={false}
      />
    );
    expect(getByTestId('indicateur-sync')).toBeTruthy();
    expect(getByText(/3 action/)).toBeTruthy();
  });

  it('SC5 — masque l\'indicateur si pendingCount = 0 et connexion active', () => {
    const { queryByTestId } = render(
      <SyncIndicator
        isOffline={false}
        pendingCount={0}
        isSyncing={false}
      />
    );
    expect(queryByTestId('bandeau-hors-connexion')).toBeNull();
    expect(queryByTestId('indicateur-sync')).toBeNull();
  });

  it('SC4 — affiche un spinner si isSyncing=true', () => {
    const { getByTestId } = render(
      <SyncIndicator
        isOffline={false}
        pendingCount={2}
        isSyncing={true}
      />
    );
    expect(getByTestId('spinner-sync')).toBeTruthy();
  });

  it('SC5 — affiche "1 action" au singulier si pendingCount = 1', () => {
    const { getByText } = render(
      <SyncIndicator
        isOffline={false}
        pendingCount={1}
        isSyncing={false}
      />
    );
    expect(getByText(/1 action/)).toBeTruthy();
  });

  it('SC5 — affiche "X actions" au pluriel si pendingCount > 1', () => {
    const { getByText } = render(
      <SyncIndicator
        isOffline={false}
        pendingCount={5}
        isSyncing={false}
      />
    );
    expect(getByText(/5 actions/)).toBeTruthy();
  });
});
