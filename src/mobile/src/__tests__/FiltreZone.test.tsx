/**
 * Tests Jest — Filtrage par zone geographique (US-003)
 *
 * Verifie :
 * - SC1 : Filtrage par zone — affiche uniquement les colis de la zone selectionnee
 * - SC2 : Retour a la vue complete — l'onglet "Tous" affiche tous les colis
 * - SC3 : Zone sans colis restants — affiche les colis avec statuts terminaux
 * - Invariant : le bandeau "Reste a livrer" reflète toujours le total de la tournee (pas filtré)
 * - Les zones disponibles sont extraites depuis les colis de la tournee (dynamique)
 * - L'onglet "Tous" est actif par defaut
 *
 * Application TDD (prerequis US-003) :
 * ces tests sont ecrits AVANT l'implementation.
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { ListeColisScreen } from '../screens/ListeColisScreen';
import * as tourneeApi from '../api/tourneeApi';
import { TourneeDTO, ColisDTO } from '../api/tourneeTypes';

jest.mock('../api/tourneeApi');
const mockGetTourneeAujourdhui = tourneeApi.getTourneeAujourdhui as jest.MockedFunction<
  typeof tourneeApi.getTourneeAujourdhui
>;

// ─── Fixtures US-003 ──────────────────────────────────────────────────────────
// 22 colis : Zone A (8), Zone B (9), Zone C (5) — conforme au SC1 de l'US

const makeColisZoneA = (idx: number, statut: ColisDTO['statut'] = 'A_LIVRER'): ColisDTO => ({
  colisId: `zone-a-${idx}`,
  statut,
  adresseLivraison: {
    rue: `${idx} Rue Alpha`,
    complementAdresse: null,
    codePostal: '69001',
    ville: 'Lyon',
    zoneGeographique: 'Zone A',
    adresseComplete: `${idx} Rue Alpha, 69001 Lyon`,
  },
  destinataire: { nom: `Destinataire A${idx}`, telephoneChiffre: null },
  contraintes: [],
  aUneContrainteHoraire: false,
});

const makeColisZoneB = (idx: number, statut: ColisDTO['statut'] = 'A_LIVRER'): ColisDTO => ({
  colisId: `zone-b-${idx}`,
  statut,
  adresseLivraison: {
    rue: `${idx} Rue Beta`,
    complementAdresse: null,
    codePostal: '69002',
    ville: 'Lyon',
    zoneGeographique: 'Zone B',
    adresseComplete: `${idx} Rue Beta, 69002 Lyon`,
  },
  destinataire: { nom: `Destinataire B${idx}`, telephoneChiffre: null },
  contraintes: [],
  aUneContrainteHoraire: false,
});

const makeColisZoneC = (idx: number, statut: ColisDTO['statut'] = 'A_LIVRER'): ColisDTO => ({
  colisId: `zone-c-${idx}`,
  statut,
  adresseLivraison: {
    rue: `${idx} Rue Gamma`,
    complementAdresse: null,
    codePostal: '69003',
    ville: 'Lyon',
    zoneGeographique: 'Zone C',
    adresseComplete: `${idx} Rue Gamma, 69003 Lyon`,
  },
  destinataire: { nom: `Destinataire C${idx}`, telephoneChiffre: null },
  contraintes: [],
  aUneContrainteHoraire: false,
});

// 8 Zone A + 9 Zone B + 5 Zone C = 22 colis, 20 restants (2 livres en Zone C)
const colisZoneA = Array.from({ length: 8 }, (_, i) => makeColisZoneA(i + 1));
const colisZoneB = Array.from({ length: 9 }, (_, i) => makeColisZoneB(i + 1));
const colisZoneC = [
  makeColisZoneC(1, 'LIVRE'),
  makeColisZoneC(2, 'LIVRE'),
  makeColisZoneC(3, 'A_LIVRER'),
  makeColisZoneC(4, 'A_LIVRER'),
  makeColisZoneC(5, 'A_LIVRER'),
];

const tourneeTroisZones: TourneeDTO = {
  tourneeId: 'tournee-003',
  livreurId: 'livreur-001',
  date: '2026-03-23',
  statut: 'DEMARREE',
  colis: [...colisZoneA, ...colisZoneB, ...colisZoneC],
  resteALivrer: 20,   // 8 ZoneA + 9 ZoneB + 3 ZoneC restants
  colisTotal: 22,
  colisTraites: 2,
  estimationFin: null,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('US-003 — Filtrage par zone geographique', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Prerequis ─────────────────────────────────────────────────────────────

  it('affiche les onglets de zone disponibles dans la tournee', async () => {
    mockGetTourneeAujourdhui.mockResolvedValueOnce(tourneeTroisZones);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('onglets-zones')).toBeTruthy();
    }, { timeout: 10000 });

    // Les trois zones + l'onglet "Tous" doivent etre presents
    expect(screen.getByTestId('onglet-tous')).toBeTruthy();
    expect(screen.getByTestId('onglet-Zone A')).toBeTruthy();
    expect(screen.getByTestId('onglet-Zone B')).toBeTruthy();
    expect(screen.getByTestId('onglet-Zone C')).toBeTruthy();
  });

  it("l'onglet \"Tous\" est actif par defaut", async () => {
    mockGetTourneeAujourdhui.mockResolvedValueOnce(tourneeTroisZones);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('onglet-tous')).toBeTruthy();
    });

    // L'onglet "Tous" est marque comme actif
    expect(screen.getByTestId('onglet-tous')).toHaveProp('accessibilityState', { selected: true });
  });

  // ── SC1 : Filtrage par zone ────────────────────────────────────────────────

  it('SC1 — filtre la liste et affiche uniquement les 8 colis de Zone A', async () => {
    mockGetTourneeAujourdhui.mockResolvedValueOnce(tourneeTroisZones);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('onglet-Zone A')).toBeTruthy();
    });

    // Appui sur l'onglet Zone A
    fireEvent.press(screen.getByTestId('onglet-Zone A'));

    // La liste doit afficher exactement 8 colis
    await waitFor(() => {
      const items = screen.getAllByTestId('colis-item');
      expect(items).toHaveLength(8);
    });
  });

  it('SC1 — le bandeau "Reste a livrer" reste base sur toute la tournee, pas sur le filtre', async () => {
    mockGetTourneeAujourdhui.mockResolvedValueOnce(tourneeTroisZones);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('onglet-Zone A')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('onglet-Zone A'));

    await waitFor(() => {
      // Le bandeau affiche toujours le total global (20/22), pas le total filtre (8/8)
      expect(screen.getByTestId('reste-a-livrer')).toHaveTextContent('Reste a livrer : 20 / 22');
    });
  });

  it('SC1 — le filtrage est instantane (aucun rechargement API)', async () => {
    mockGetTourneeAujourdhui.mockResolvedValueOnce(tourneeTroisZones);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('onglet-Zone B')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('onglet-Zone B'));

    // Le filtre doit etre applique dans le meme cycle de rendu — pas d'appel API supplementaire
    const items = screen.getAllByTestId('colis-item');
    expect(items).toHaveLength(9);
    // L'API n'a ete appelee qu'une seule fois (au chargement initial)
    expect(mockGetTourneeAujourdhui).toHaveBeenCalledTimes(1);
  });

  // ── SC2 : Retour a la vue complete ────────────────────────────────────────

  it('SC2 — l\'onglet "Tous" restaure la liste complete apres un filtre', async () => {
    mockGetTourneeAujourdhui.mockResolvedValueOnce(tourneeTroisZones);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('onglet-Zone A')).toBeTruthy();
    });

    // Appuyer sur Zone A puis revenir sur Tous
    fireEvent.press(screen.getByTestId('onglet-Zone A'));
    fireEvent.press(screen.getByTestId('onglet-tous'));

    // La liste doit a nouveau afficher les 22 colis
    await waitFor(() => {
      const items = screen.getAllByTestId('colis-item');
      expect(items).toHaveLength(22);
    });
  });

  it('SC2 — apres retour sur "Tous", les statuts mis a jour restent visibles', async () => {
    // La fixture a deja 2 colis LIVRE en Zone C — on verifie qu'ils restent visibles
    mockGetTourneeAujourdhui.mockResolvedValueOnce(tourneeTroisZones);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('onglet-Zone C')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('onglet-Zone C'));
    fireEvent.press(screen.getByTestId('onglet-tous'));

    await waitFor(() => {
      const statuts = screen.getAllByTestId('colis-statut');
      // 2 colis Zone C sont "Livre" — ils doivent apparaitre dans la vue globale
      const livres = statuts.filter(s => s.props.children === 'Livre');
      expect(livres).toHaveLength(2);
    });
  });

  // ── SC3 : Zone sans colis restants ────────────────────────────────────────

  it('SC3 — une zone dont tous les colis sont traites affiche ces colis avec leur statut terminal', async () => {
    // Zone C complete : 2 LIVRE + 3 A_LIVRER (mais on teste le cas pur avec 5 livres)
    const tourneeSC3 = {
      ...tourneeTroisZones,
      colis: [
        ...colisZoneA,
        ...colisZoneB,
        makeColisZoneC(1, 'LIVRE'),
        makeColisZoneC(2, 'LIVRE'),
        makeColisZoneC(3, 'LIVRE'),
        makeColisZoneC(4, 'LIVRE'),
        makeColisZoneC(5, 'LIVRE'),
      ],
      resteALivrer: 17, // 8 + 9
      colisTraites: 5,
    };
    mockGetTourneeAujourdhui.mockResolvedValueOnce(tourneeSC3);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('onglet-Zone C')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('onglet-Zone C'));

    await waitFor(() => {
      // La zone C affiche ses 5 colis, tous LIVRE
      const items = screen.getAllByTestId('colis-item');
      expect(items).toHaveLength(5);
    });

    // Aucun colis "A livrer" ne doit apparaitre dans cette vue
    const statuts = screen.getAllByTestId('colis-statut');
    const aLivrer = statuts.filter(s => s.props.children === 'A livrer');
    expect(aLivrer).toHaveLength(0);
  });

  // ── Sans zones definies ────────────────────────────────────────────────────

  it('n\'affiche pas la barre d\'onglets si aucun colis n\'a de zone definie', async () => {
    const tourneesSansZone: TourneeDTO = {
      ...tourneeTroisZones,
      colis: tourneeTroisZones.colis.map(c => ({
        ...c,
        adresseLivraison: { ...c.adresseLivraison, zoneGeographique: null },
      })),
    };
    mockGetTourneeAujourdhui.mockResolvedValueOnce(tourneesSansZone);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('flatlist-colis')).toBeTruthy();
    });

    // Pas d'onglets affiches si pas de zones
    expect(screen.queryByTestId('onglets-zones')).toBeNull();
  });
});
