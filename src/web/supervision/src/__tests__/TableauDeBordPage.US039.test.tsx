/**
 * Tests TDD — US-039 : Export CSV bilan des tournées du jour depuis W-01
 *
 * Ces tests couvrent :
 *   SC1 — Bouton "Télécharger le bilan du jour" visible si au moins une tournée du jour
 *   SC2 — Téléchargement CSV avec colonnes #Tournee, Livreur, NbColis, NbLivres, NbEchecs, StatutFinal
 *   SC3 — Nom du fichier dynamique : bilan-tournees-AAAA-MM-JJ.csv
 *   SC4 — Bouton absent si aucune tournée du jour
 *   SC5 — Indépendance avec l'export W-05 (US-028 non affecté)
 *
 * Tests unitaires sur genererCSVBilanTournees (fonction pure séparée)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TableauDeBordPage, { TableauDeBordDTO, MockWebSocket, VueTourneeDTO } from '../pages/TableauDeBordPage';
import {
  genererCSVBilanTournees,
  construireNomFichierBilan,
} from '../utils/exporterCSVBilan';

// ─── Données de test ───────────────────────────────────────────────────────────

const tourneesTest: VueTourneeDTO[] = [
  {
    tourneeId: 'T-201',
    livreurNom: 'Pierre Martin',
    colisTraites: 8,
    colisTotal: 10,
    pourcentage: 80,
    statut: 'CLOTUREE',
    derniereActivite: '2026-04-03T17:00:00Z',
    codeTMS: 'T-201',
    zone: 'Lyon 3e',
    nbLivres: 7,
    nbEchecs: 1,
  },
  {
    tourneeId: 'T-202',
    livreurNom: 'Marie Lambert',
    colisTraites: 10,
    colisTotal: 10,
    pourcentage: 100,
    statut: 'CLOTUREE',
    derniereActivite: '2026-04-03T18:00:00Z',
    codeTMS: 'T-202',
    zone: 'Villeurbanne',
    nbLivres: 10,
    nbEchecs: 0,
  },
];

const mockTableauAvecTournees: TableauDeBordDTO = {
  bandeau: { actives: 0, aRisque: 0, cloturees: 2 },
  tournees: tourneesTest,
};

const mockTableauVide: TableauDeBordDTO = {
  bandeau: { actives: 0, aRisque: 0, cloturees: 0 },
  tournees: [],
};

function mockFetch(body: TableauDeBordDTO): () => Promise<Response> {
  return () =>
    Promise.resolve({
      status: 200,
      ok: true,
      json: () => Promise.resolve(body),
    } as Response);
}

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
  return { factory: () => instance, instance };
}

// ─── Tests unitaires — genererCSVBilanTournees ────────────────────────────────

describe('genererCSVBilanTournees (US-039 — fonction pure)', () => {

  it('retourne une chaine vide si la liste de tournees est vide', () => {
    const csv = genererCSVBilanTournees([]);
    // Seule l'en-tête BOM + colonnes
    expect(csv).toContain('#Tournee');
    expect(csv).toContain('Livreur');
  });

  it('contient l\'en-tête avec les 6 colonnes attendues', () => {
    const csv = genererCSVBilanTournees([]);
    const lignes = csv.split('\r\n');
    // Première ligne = en-tête (après BOM)
    const entete = lignes[0].replace('\uFEFF', '');
    expect(entete).toBe('#Tournee,Livreur,NbColis,NbLivres,NbEchecs,StatutFinal');
  });

  it('contient une ligne par tournée', () => {
    const csv = genererCSVBilanTournees(tourneesTest);
    const lignes = csv.split('\r\n').filter(l => l.trim().length > 0);
    // 1 en-tête + 2 tournées
    expect(lignes).toHaveLength(3);
  });

  it('contient les données correctes pour chaque tournée', () => {
    const csv = genererCSVBilanTournees(tourneesTest);
    expect(csv).toContain('T-201');
    expect(csv).toContain('Pierre Martin');
    expect(csv).toContain('10'); // NbColis
    expect(csv).toContain('7');  // NbLivres
    expect(csv).toContain('1');  // NbEchecs
    expect(csv).toContain('CLOTUREE'); // StatutFinal
  });

  it('encode le fichier avec BOM UTF-8', () => {
    const csv = genererCSVBilanTournees(tourneesTest);
    expect(csv.startsWith('\uFEFF')).toBe(true);
  });

  it('utilise CRLF comme séparateur de lignes', () => {
    const csv = genererCSVBilanTournees(tourneesTest);
    expect(csv.includes('\r\n')).toBe(true);
  });

  it('escaping : libelle avec virgule est entre guillemets', () => {
    const tourneesAvecVirgule: VueTourneeDTO[] = [
      {
        tourneeId: 'T-300',
        livreurNom: 'Dupont, Jean',  // virgule dans le nom
        colisTraites: 5,
        colisTotal: 5,
        pourcentage: 100,
        statut: 'CLOTUREE',
        derniereActivite: '2026-04-03T18:00:00Z',
        nbLivres: 5,
        nbEchecs: 0,
      },
    ];
    const csv = genererCSVBilanTournees(tourneesAvecVirgule);
    expect(csv).toContain('"Dupont, Jean"');
  });
});

// ─── Tests unitaires — construireNomFichierBilan ──────────────────────────────

describe('construireNomFichierBilan (US-039)', () => {
  it('construit le nom avec la date au format AAAA-MM-JJ', () => {
    const nom = construireNomFichierBilan('2026-04-03');
    expect(nom).toBe('bilan-tournees-2026-04-03.csv');
  });

  it('inclut le préfixe bilan-tournees', () => {
    const nom = construireNomFichierBilan('2026-12-31');
    expect(nom).toBe('bilan-tournees-2026-12-31.csv');
  });
});

// ─── Tests intégration — TableauDeBordPage ────────────────────────────────────

describe('TableauDeBordPage — bouton export bilan (US-039)', () => {

  it('SC1 : bouton "Télécharger le bilan du jour" visible si au moins une tournée', async () => {
    const { factory } = createMockWsFactory();
    await act(async () => {
      render(
        <TableauDeBordPage
          fetchFn={mockFetch(mockTableauAvecTournees)}
          wsFactory={factory}
        />
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('btn-telecharger-bilan')).toBeInTheDocument();
    });
  });

  it('SC4 : bouton absent si aucune tournée du jour', async () => {
    const { factory } = createMockWsFactory();
    await act(async () => {
      render(
        <TableauDeBordPage
          fetchFn={mockFetch(mockTableauVide)}
          wsFactory={factory}
        />
      );
    });
    await waitFor(() => {
      expect(screen.queryByTestId('btn-telecharger-bilan')).not.toBeInTheDocument();
    });
  });

  it('SC2 : clic sur le bouton déclenche le callback onExporterBilan', async () => {
    const onExporterBilan = jest.fn();
    const { factory } = createMockWsFactory();
    await act(async () => {
      render(
        <TableauDeBordPage
          fetchFn={mockFetch(mockTableauAvecTournees)}
          wsFactory={factory}
          onExporterBilan={onExporterBilan}
        />
      );
    });
    await waitFor(() => {
      const btn = screen.getByTestId('btn-telecharger-bilan');
      fireEvent.click(btn);
    });
    expect(onExporterBilan).toHaveBeenCalled();
  });

  it('SC5 : le bouton "Exporter le bilan" (btn-exporter-bilan) US-011 coexiste sans conflit', async () => {
    const { factory } = createMockWsFactory();
    await act(async () => {
      render(
        <TableauDeBordPage
          fetchFn={mockFetch(mockTableauAvecTournees)}
          wsFactory={factory}
          onExporterBilan={jest.fn()}
        />
      );
    });
    await waitFor(() => {
      // Les deux boutons doivent coexister : btn-exporter-bilan (existant) et btn-telecharger-bilan (nouveau)
      expect(screen.getByTestId('btn-exporter-bilan')).toBeInTheDocument();
      expect(screen.getByTestId('btn-telecharger-bilan')).toBeInTheDocument();
    });
  });
});
