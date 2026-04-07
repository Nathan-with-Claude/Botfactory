/**
 * Tests Jest/React Native Testing Library — ListeColisScreen
 *
 * Verifie :
 * - Rendu avec donnees mockees (liste de colis)
 * - Affichage du bandeau "Reste a livrer"
 * - Affichage des contraintes sur un colis (mise en evidence si horaire)
 * - Etat liste vide (aucun colis assigne)
 * - Etat chargement (spinner visible)
 * - Etat erreur reseau
 *
 * Prerequis TDD : ce test est ecrit AVANT l'implementation du composant.
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react-native';
import { ListeColisScreen } from '../screens/ListeColisScreen';
import * as tourneeApi from '../api/tourneeApi';
import { TourneeDTO } from '../api/tourneeTypes';

// Mock de l'API
jest.mock('../api/tourneeApi');
const mockGetTourneeAujourdhui = tourneeApi.getTourneeAujourdhui as jest.MockedFunction<
  typeof tourneeApi.getTourneeAujourdhui
>;

// ─── Fixtures ────────────────────────────────────────────────────────────────

const uneTourneeAvecDeuxColis: TourneeDTO = {
  tourneeId: 'tournee-001',
  livreurId: 'livreur-001',
  date: '2026-03-20',
  statut: 'DEMARREE',
  colis: [
    {
      colisId: 'c-1',
      statut: 'A_LIVRER',
      adresseLivraison: {
        rue: '12 Rue du Port',
        complementAdresse: null,
        codePostal: '69003',
        ville: 'Lyon',
        zoneGeographique: 'Zone A',
        adresseComplete: '12 Rue du Port, 69003 Lyon',
      },
      destinataire: { nom: 'M. Dupont', telephoneChiffre: '0601020304' },
      contraintes: [
        { type: 'HORAIRE', valeur: 'Avant 14h00', estHoraire: true },
      ],
      aUneContrainteHoraire: true,
    },
    {
      colisId: 'c-2',
      statut: 'LIVRE',
      adresseLivraison: {
        rue: '4 Allee des Roses',
        complementAdresse: 'Apt 12',
        codePostal: '69006',
        ville: 'Lyon',
        zoneGeographique: 'Zone B',
        adresseComplete: '4 Allee des Roses Apt 12, 69006 Lyon',
      },
      destinataire: { nom: 'Mme Martin', telephoneChiffre: null },
      contraintes: [],
      aUneContrainteHoraire: false,
    },
  ],
  resteALivrer: 1,
  colisTotal: 2,
  colisTraites: 1,
  estimationFin: '17h30',
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ListeColisScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le spinner de chargement lors du chargement initial', () => {
    // L'API ne resolve pas immediatement
    mockGetTourneeAujourdhui.mockReturnValue(new Promise(() => {}));

    render(<ListeColisScreen />);

    expect(screen.getByTestId('etat-chargement')).toBeTruthy();
  });

  it('affiche le bandeau "Reste a livrer : 1 / 2" avec les donnees de la tournee', async () => {
    mockGetTourneeAujourdhui.mockResolvedValueOnce(uneTourneeAvecDeuxColis);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('bandeau-progression')).toBeTruthy();
    });

    expect(screen.getByTestId('reste-a-livrer')).toHaveTextContent('Reste a livrer : 1 / 2');
  });

  it('affiche l\'estimation de fin de tournee si disponible', async () => {
    mockGetTourneeAujourdhui.mockResolvedValueOnce(uneTourneeAvecDeuxColis);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('estimation-fin')).toHaveTextContent('17h30');
    });
  });

  it('affiche les deux colis dans la liste', async () => {
    mockGetTourneeAujourdhui.mockResolvedValueOnce(uneTourneeAvecDeuxColis);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getAllByTestId('colis-item')).toHaveLength(2);
    });
  });

  it('affiche l\'adresse et le destinataire du premier colis', async () => {
    mockGetTourneeAujourdhui.mockResolvedValueOnce(uneTourneeAvecDeuxColis);

    render(<ListeColisScreen />);

    await waitFor(() => {
      const adresses = screen.getAllByTestId('colis-adresse');
      expect(adresses[0]).toHaveTextContent('12 Rue du Port, 69003 Lyon');
    });

    const destinataires = screen.getAllByTestId('colis-destinataire');
    expect(destinataires[0]).toHaveTextContent('M. Dupont');
  });

  it('affiche la contrainte horaire sur le premier colis et la met en evidence', async () => {
    mockGetTourneeAujourdhui.mockResolvedValueOnce(uneTourneeAvecDeuxColis);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('colis-contrainte-0')).toBeTruthy();
    });

    // La contrainte horaire doit etre visible avec son libelle
    expect(screen.getByTestId('colis-contrainte-0')).toHaveTextContent('Avant 14h00');
  });

  it('affiche le message "Aucun colis assigne" si la tournee est vide', async () => {
    mockGetTourneeAujourdhui.mockRejectedValueOnce(
      new tourneeApi.TourneeNonTrouveeError('Aucune tournee')
    );

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('message-aucun-colis')).toBeTruthy();
    });

    // US-048 : le message a été mis à jour pour être plus explicite
    expect(screen.getByTestId('message-aucun-colis')).toHaveTextContent(
      'Aucune tournée n\'a encore été commandée pour vous'
    );
  });

  it('affiche un message d\'erreur en cas d\'erreur reseau', async () => {
    mockGetTourneeAujourdhui.mockRejectedValueOnce(new Error('Network Error'));

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('etat-erreur')).toBeTruthy();
    });
  });

  it('affiche le statut de chaque colis', async () => {
    mockGetTourneeAujourdhui.mockResolvedValueOnce(uneTourneeAvecDeuxColis);

    render(<ListeColisScreen />);

    await waitFor(() => {
      const statuts = screen.getAllByTestId('colis-statut');
      // US-038 : libellés harmonisés — ColisItem affiche en majuscules
      expect(statuts[0]).toHaveTextContent('A LIVRER');
      expect(statuts[1]).toHaveTextContent('LIVRÉ');
    });
  });

  // ─── US-002 : Bouton Cloture et progression ───────────────────────────────

  it('US002-SC4 - affiche le bouton "Cloture" si resteALivrer vaut 0', async () => {
    const tourneeToutesTraitees: TourneeDTO = {
      ...uneTourneeAvecDeuxColis,
      colis: [
        { ...uneTourneeAvecDeuxColis.colis[0], statut: 'LIVRE' },
        { ...uneTourneeAvecDeuxColis.colis[1], statut: 'LIVRE' },
      ],
      resteALivrer: 0,
      colisTotal: 2,
      colisTraites: 2,
    };
    mockGetTourneeAujourdhui.mockResolvedValueOnce(tourneeToutesTraitees);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('bouton-cloture')).toBeTruthy();
    });
  });

  it('US002-SC4 - cache le bouton "Cloture" si resteALivrer est superieur a 0', async () => {
    mockGetTourneeAujourdhui.mockResolvedValueOnce(uneTourneeAvecDeuxColis);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('bandeau-progression')).toBeTruthy();
    });

    expect(screen.queryByTestId('bouton-cloture')).toBeNull();
  });

  it('US002 - le bandeau de progression affiche le bon format "Reste a livrer : X / Y"', async () => {
    mockGetTourneeAujourdhui.mockResolvedValueOnce(uneTourneeAvecDeuxColis);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('reste-a-livrer')).toHaveTextContent('Reste a livrer : 1 / 2');
    });
  });

  it('US002 - n\'affiche pas l\'estimation de fin si elle est null', async () => {
    const tourneeSansEstimation: TourneeDTO = {
      ...uneTourneeAvecDeuxColis,
      estimationFin: null,
    };
    mockGetTourneeAujourdhui.mockResolvedValueOnce(tourneeSansEstimation);

    render(<ListeColisScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('bandeau-progression')).toBeTruthy();
    });

    expect(screen.queryByTestId('estimation-fin')).toBeNull();
  });
});
