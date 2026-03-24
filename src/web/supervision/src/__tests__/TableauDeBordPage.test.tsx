import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TableauDeBordPage, { TableauDeBordDTO, MockWebSocket } from '../pages/TableauDeBordPage';

/**
 * Tests Jest — TableauDeBordPage (US-011)
 */

const mockTableau: TableauDeBordDTO = {
  tournees: [
    {
      tourneeId: 't-001',
      livreurNom: 'Pierre Martin',
      colisTraites: 3,
      colisTotal: 10,
      pourcentage: 30,
      statut: 'EN_COURS',
      derniereActivite: '2026-03-24T10:00:00Z',
    },
    {
      tourneeId: 't-002',
      livreurNom: 'Marie Lambert',
      colisTraites: 7,
      colisTotal: 10,
      pourcentage: 70,
      statut: 'EN_COURS',
      derniereActivite: '2026-03-24T10:30:00Z',
    },
    {
      tourneeId: 't-003',
      livreurNom: 'Jean Moreau',
      colisTraites: 2,
      colisTotal: 12,
      pourcentage: 16,
      statut: 'A_RISQUE',
      derniereActivite: '2026-03-24T08:00:00Z',
    },
  ],
  actives: 2,
  aRisque: 1,
  cloturees: 0,
};

function mockFetch(status: number, body?: object): () => Promise<Response> {
  return () =>
    Promise.resolve({
      status,
      ok: status >= 200 && status < 300,
      json: () => Promise.resolve(body),
    } as Response);
}

// Fabrique un MockWebSocket contrôlable depuis les tests
function createMockWsFactory(): {
  factory: (url: string) => MockWebSocket;
  instance: MockWebSocket;
} {
  const instance: MockWebSocket = {
    onmessage: null,
    onopen: null,
    onclose: null,
    onerror: null,
    close: jest.fn(),
  };
  return {
    factory: () => instance,
    instance,
  };
}

describe('TableauDeBordPage', () => {
  test('affiche le tableau de bord avec bandeau résumé et liste des tournées', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('bandeau-resume')).toBeInTheDocument();
    });

    expect(screen.getByTestId('compteur-actives')).toHaveTextContent('2');
    expect(screen.getByTestId('compteur-a-risque')).toHaveTextContent('1');
    expect(screen.getByTestId('compteur-cloturees')).toHaveTextContent('0');
    expect(screen.getByTestId('liste-tournees')).toBeInTheDocument();
    expect(screen.getByTestId('ligne-tournee-t-001')).toBeInTheDocument();
    expect(screen.getByTestId('ligne-tournee-t-002')).toBeInTheDocument();
    expect(screen.getByTestId('ligne-tournee-t-003')).toBeInTheDocument();
  });

  test('affiche A_RISQUE en tête de liste (tri priorité)', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('liste-tournees')).toBeInTheDocument();
    });

    const lignes = screen.getAllByRole('row');
    // lignes[0] = header, lignes[1] = première tournée
    expect(lignes[1]).toHaveAttribute('data-testid', 'ligne-tournee-t-003'); // A_RISQUE en tête
  });

  test('filtre par statut A_RISQUE', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('filtre-statut')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('filtre-statut'), {
      target: { value: 'A_RISQUE' },
    });

    expect(screen.getByTestId('ligne-tournee-t-003')).toBeInTheDocument();
    expect(screen.queryByTestId('ligne-tournee-t-001')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ligne-tournee-t-002')).not.toBeInTheDocument();
  });

  test('affiche le bandeau déconnexion si WebSocket non connecté', async () => {
    // Pas de factory = WebSocket simulé comme déconnecté
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('tableau-de-bord-page')).toBeInTheDocument();
    });

    // WS non connecté (onopen jamais appelé) → bandeau déconnexion visible
    expect(screen.getByTestId('bandeau-deconnexion')).toBeInTheDocument();
  });

  test('met à jour le tableau via WebSocket', async () => {
    const { factory, instance } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('bandeau-resume')).toBeInTheDocument();
    });

    // Simuler un message WebSocket avec données mises à jour
    const tableauMisAJour: TableauDeBordDTO = {
      ...mockTableau,
      actives: 1,
      aRisque: 2,
    };

    act(() => {
      instance.onmessage?.({ data: JSON.stringify(tableauMisAJour) });
    });

    await waitFor(() => {
      expect(screen.getByTestId('compteur-actives')).toHaveTextContent('1');
      expect(screen.getByTestId('compteur-a-risque')).toHaveTextContent('2');
    });
  });

  test('affiche un message si aucune tournée après filtre', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('filtre-statut')).toBeInTheDocument();
    });

    // Filtrer par CLOTUREE (0 dans les données de test)
    fireEvent.change(screen.getByTestId('filtre-statut'), {
      target: { value: 'CLOTUREE' },
    });

    expect(screen.getByTestId('aucune-tournee')).toBeInTheDocument();
  });

  test('appelle onVoirTournee quand on clique sur Voir', async () => {
    const { factory } = createMockWsFactory();
    const onVoir = jest.fn();

    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
        onVoirTournee={onVoir}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('btn-voir-t-001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-voir-t-001'));

    expect(onVoir).toHaveBeenCalledWith('t-001');
  });

  // ─── Tests US-013 ─────────────────────────────────────────────────────────

  test('US-013: affiche le point alerte clignotant si aRisque > 0', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('point-alerte'));
    expect(screen.getByTestId('point-alerte')).toBeInTheDocument();
  });

  test('US-013: n\'affiche pas le point alerte si aRisque = 0', async () => {
    const { factory } = createMockWsFactory();
    const tableauSansRisque = { ...mockTableau, aRisque: 0 };
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, tableauSansRisque)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('bandeau-resume'));
    expect(screen.queryByTestId('point-alerte')).not.toBeInTheDocument();
  });

  test('US-013: déclenche alerte sonore quand nouvelles tournées à risque via WebSocket', async () => {
    const { factory, instance } = createMockWsFactory();
    const alerteFn = jest.fn();

    // Début : 0 à risque
    const tableauSansRisque = { ...mockTableau, aRisque: 0 };
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, tableauSansRisque)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
        alerteFn={alerteFn}
      />
    );

    await waitFor(() => screen.getByTestId('bandeau-resume'));
    expect(alerteFn).not.toHaveBeenCalled();

    // WebSocket : 1 nouvelle tournée à risque
    const tableauAvecRisque = { ...mockTableau, aRisque: 1 };
    act(() => {
      instance.onmessage?.({ data: JSON.stringify(tableauAvecRisque) });
    });

    await waitFor(() => expect(alerteFn).toHaveBeenCalledTimes(1));
  });

  test('US-013: la ligne A_RISQUE est mise en surbrillance orange', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('ligne-tournee-t-003'));

    const ligneARisque = screen.getByTestId('ligne-tournee-t-003');
    // La ligne A_RISQUE doit avoir un style de fond distinctif
    expect(ligneARisque).toHaveStyle({ background: '#fff3e0' });
  });
});
