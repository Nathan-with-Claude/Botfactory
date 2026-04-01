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
      codeTMS: 'T-201',
      zone: 'Lyon 3e',
    },
    {
      tourneeId: 't-002',
      livreurNom: 'Marie Lambert',
      colisTraites: 7,
      colisTotal: 10,
      pourcentage: 70,
      statut: 'EN_COURS',
      derniereActivite: '2026-03-24T10:30:00Z',
      codeTMS: 'T-202',
      zone: 'Villeurbanne',
    },
    {
      tourneeId: 't-003',
      livreurNom: 'Jean Moreau',
      colisTraites: 2,
      colisTotal: 12,
      pourcentage: 16,
      statut: 'A_RISQUE',
      derniereActivite: '2026-03-24T08:00:00Z',
      retardEstimeMinutes: 45,
      colisEnRetard: 4,
      codeTMS: 'T-203',
      zone: 'Lyon 3e',
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

  // ─── Tests feedback terrain 2026-03-30 ────────────────────────────────────

  test('S1 — affiche le nom du livreur en donnée primaire et l\'ID TMS en secondaire', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('liste-tournees'));

    // Le nom du livreur doit être visible en premier
    expect(screen.getByText('Pierre Martin')).toBeInTheDocument();
    expect(screen.getByText('Marie Lambert')).toBeInTheDocument();
    expect(screen.getByText('Jean Moreau')).toBeInTheDocument();

    // L'ID TMS doit être visible comme info secondaire
    expect(screen.getByTestId('id-tms-t-001')).toHaveTextContent('t-001');
    expect(screen.getByTestId('id-tms-t-003')).toHaveTextContent('t-003');
  });

  test('S2 — affiche le détail du retard directement dans la ligne A_RISQUE', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('detail-retard-t-003'));

    const detailRetard = screen.getByTestId('detail-retard-t-003');
    expect(detailRetard).toHaveTextContent('45 min');
    expect(detailRetard).toHaveTextContent('4 colis');
  });

  test('S2 — n\'affiche pas de détail retard pour une tournée EN_COURS', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('liste-tournees'));
    expect(screen.queryByTestId('detail-retard-t-001')).not.toBeInTheDocument();
  });

  test('S4 — le bandeau déconnexion WebSocket est orange (alerte système, pas rouge)', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('bandeau-deconnexion'));
    // Orange #b45309, distinct du rouge métier #ba1a1a
    expect(screen.getByTestId('bandeau-deconnexion')).toHaveStyle({ background: '#b45309' });
  });

  test('S5 — affiche le bouton Exporter le bilan si onExporterBilan est fourni', async () => {
    const { factory } = createMockWsFactory();
    const onExporter = jest.fn();

    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
        onExporterBilan={onExporter}
      />
    );

    await waitFor(() => screen.getByTestId('btn-exporter-bilan'));
    fireEvent.click(screen.getByTestId('btn-exporter-bilan'));
    expect(onExporter).toHaveBeenCalledTimes(1);
  });

  test('S5 — n\'affiche pas le bouton export si onExporterBilan non fourni', async () => {
    const { factory } = createMockWsFactory();

    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('liste-tournees'));
    expect(screen.queryByTestId('btn-exporter-bilan')).not.toBeInTheDocument();
  });

  // ─── Tests US-035 — Recherche multi-critères ──────────────────────────────

  test('US-035 SC1 — recherche par code TMS filtre les tournées correspondantes', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('liste-tournees'));

    fireEvent.change(screen.getByTestId('champ-recherche'), {
      target: { value: 'T-202' },
    });

    expect(screen.getByTestId('ligne-tournee-t-002')).toBeInTheDocument();
    expect(screen.queryByTestId('ligne-tournee-t-001')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ligne-tournee-t-003')).not.toBeInTheDocument();
  });

  test('US-035 SC1 — recherche par code TMS partiel (insensible à la casse)', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('liste-tournees'));

    fireEvent.change(screen.getByTestId('champ-recherche'), {
      target: { value: 't-20' },
    });

    // t-20 match T-201, T-202, T-203 (tous)
    expect(screen.getByTestId('ligne-tournee-t-001')).toBeInTheDocument();
    expect(screen.getByTestId('ligne-tournee-t-002')).toBeInTheDocument();
    expect(screen.getByTestId('ligne-tournee-t-003')).toBeInTheDocument();
  });

  test('US-035 SC2 — recherche par zone géographique (correspondance partielle)', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('liste-tournees'));

    fireEvent.change(screen.getByTestId('champ-recherche'), {
      target: { value: 'Villeurb' },
    });

    expect(screen.getByTestId('ligne-tournee-t-002')).toBeInTheDocument();
    expect(screen.queryByTestId('ligne-tournee-t-001')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ligne-tournee-t-003')).not.toBeInTheDocument();
  });

  test('US-035 SC3 — recherche par nom de livreur (comportement existant préservé)', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('liste-tournees'));

    fireEvent.change(screen.getByTestId('champ-recherche'), {
      target: { value: 'Marie' },
    });

    expect(screen.getByTestId('ligne-tournee-t-002')).toBeInTheDocument();
    expect(screen.queryByTestId('ligne-tournee-t-001')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ligne-tournee-t-003')).not.toBeInTheDocument();
  });

  test('US-035 SC4 — recherche intersectée avec filtre de statut', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('filtre-statut'));

    // Filtrer par A_RISQUE
    fireEvent.change(screen.getByTestId('filtre-statut'), {
      target: { value: 'A_RISQUE' },
    });

    // Puis chercher "Lyon 3" — t-001 (EN_COURS) et t-003 (A_RISQUE) sont en zone Lyon 3e
    fireEvent.change(screen.getByTestId('champ-recherche'), {
      target: { value: 'Lyon 3' },
    });

    // Seule t-003 (A_RISQUE) doit apparaître — t-001 (EN_COURS) est masquée par le filtre statut
    expect(screen.getByTestId('ligne-tournee-t-003')).toBeInTheDocument();
    expect(screen.queryByTestId('ligne-tournee-t-001')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ligne-tournee-t-002')).not.toBeInTheDocument();
  });

  test('US-035 SC5 — recherche sans résultat affiche message et lien effacer', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('liste-tournees'));

    fireEvent.change(screen.getByTestId('champ-recherche'), {
      target: { value: 'XYZ999' },
    });

    expect(screen.getByTestId('message-aucun-resultat-recherche')).toBeInTheDocument();
    expect(screen.getByTestId('lien-effacer-recherche')).toBeInTheDocument();
    expect(screen.queryByTestId('aucune-tournee')).not.toBeInTheDocument();
  });

  test('US-035 SC5 — le bandeau résumé n\'est pas modifié par la recherche', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('bandeau-resume'));

    fireEvent.change(screen.getByTestId('champ-recherche'), {
      target: { value: 'T-202' },
    });

    // Les compteurs ne changent pas malgré la recherche
    expect(screen.getByTestId('compteur-actives')).toHaveTextContent('2');
    expect(screen.getByTestId('compteur-a-risque')).toHaveTextContent('1');
    expect(screen.getByTestId('compteur-cloturees')).toHaveTextContent('0');
  });

  test('US-035 SC6 — effacement de la recherche restaure toutes les tournées', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('liste-tournees'));

    // Recherche qui masque tout
    fireEvent.change(screen.getByTestId('champ-recherche'), {
      target: { value: 'XYZ999' },
    });

    // Effacer via le lien
    fireEvent.click(screen.getByTestId('lien-effacer-recherche'));

    // Toutes les tournées sont de nouveau visibles
    await waitFor(() => {
      expect(screen.getByTestId('ligne-tournee-t-001')).toBeInTheDocument();
      expect(screen.getByTestId('ligne-tournee-t-002')).toBeInTheDocument();
      expect(screen.getByTestId('ligne-tournee-t-003')).toBeInTheDocument();
    });

    // Le champ de recherche est vide
    expect(screen.getByTestId('champ-recherche')).toHaveValue('');
  });

  test('US-035 — recherche en temps réel, pas de bouton Rechercher', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('liste-tournees'));

    // Pas de bouton "Rechercher"
    expect(screen.queryByTestId('btn-rechercher')).not.toBeInTheDocument();
    // Champ de recherche présent
    expect(screen.getByTestId('champ-recherche')).toBeInTheDocument();
  });

  // ─── Bloquant 5 — Bouton Reconnecter + compteur déconnexion ─────────────────

  test('Bloquant-5: affiche le bouton "Reconnecter" dans le bandeau déconnexion', async () => {
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={mockFetch(200, mockTableau)}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('bandeau-deconnexion'));
    expect(screen.getByTestId('btn-reconnecter')).toBeInTheDocument();
    expect(screen.getByTestId('btn-reconnecter')).toHaveTextContent('Reconnecter');
  });

  test('Bloquant-5: le bouton Reconnecter recharge les données au clic', async () => {
    const fetchSpy = jest.fn(mockFetch(200, mockTableau));
    const { factory } = createMockWsFactory();
    render(
      <TableauDeBordPage
        fetchFn={fetchSpy}
        wsFactory={factory}
        apiBaseUrl="http://localhost:8082"
      />
    );

    await waitFor(() => screen.getByTestId('bandeau-deconnexion'));
    const callsAvant = fetchSpy.mock.calls.length;
    fireEvent.click(screen.getByTestId('btn-reconnecter'));
    // Un nouvel appel fetch a été émis
    await waitFor(() => {
      expect(fetchSpy.mock.calls.length).toBeGreaterThan(callsAvant);
    });
  });
});
