/**
 * Tests unitaires — DetailColisScreen (ecran M-03, US-004)
 *
 * Verifie :
 * SC1 : Affichage des informations completes d'un colis A_LIVRER
 * SC2 : Colis deja livre — boutons absents, message "Ce colis a ete livre"
 * SC3 : Colis en echec — boutons absents, message echec
 * SC4 : Contraintes affichees (horaire, fragile)
 * SC5 : Numero de telephone masque (bouton appel present, numero brut absent)
 * SC6 : Etat de chargement
 * SC7 : Etat d'erreur reseau
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { DetailColisScreen } from '../screens/DetailColisScreen';
import { getDetailColis, ColisNonTrouveError } from '../api/tourneeApi';
import { ColisDTO } from '../api/tourneeTypes';

// Mock de l'API
jest.mock('../api/tourneeApi', () => ({
  getDetailColis: jest.fn(),
  ColisNonTrouveError: class ColisNonTrouveError extends Error {
    constructor(msg: string) {
      super(msg);
      this.name = 'ColisNonTrouveError';
    }
  },
}));

const mockGetDetailColis = getDetailColis as jest.MockedFunction<typeof getDetailColis>;

// ─── Fixtures ────────────────────────────────────────────────────────────────

const UN_COLIS_A_LIVRER: ColisDTO = {
  colisId: 'colis-001',
  statut: 'A_LIVRER',
  adresseLivraison: {
    rue: '12 Rue du Port',
    complementAdresse: 'Apt 3B',
    codePostal: '69003',
    ville: 'Lyon',
    zoneGeographique: 'Zone A',
    adresseComplete: '12 Rue du Port, 69003 Lyon',
  },
  destinataire: {
    nom: 'M. Dupont',
    telephoneChiffre: '0601020304',
  },
  contraintes: [
    { type: 'HORAIRE', valeur: 'Avant 14h00', estHoraire: true },
    { type: 'FRAGILE', valeur: 'Fragile', estHoraire: false },
  ],
  aUneContrainteHoraire: true,
  estTraite: false,
};

const UN_COLIS_LIVRE: ColisDTO = {
  ...UN_COLIS_A_LIVRER,
  colisId: 'colis-002',
  statut: 'LIVRE',
  estTraite: true,
  contraintes: [],
  aUneContrainteHoraire: false,
};

const UN_COLIS_ECHEC: ColisDTO = {
  ...UN_COLIS_A_LIVRER,
  colisId: 'colis-003',
  statut: 'ECHEC',
  estTraite: true,
  contraintes: [],
  aUneContrainteHoraire: false,
};

// ─── Helper de rendu ─────────────────────────────────────────────────────────

const renderScreen = (tourneeId = 'tournee-001', colisId = 'colis-001') => {
  return render(
    <DetailColisScreen tourneeId={tourneeId} colisId={colisId} onRetour={() => {}} />
  );
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('DetailColisScreen — M-03', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SC1 : Affichage du detail complet d un colis a livrer', () => {
    it('affiche le nom du destinataire', async () => {
      mockGetDetailColis.mockResolvedValue(UN_COLIS_A_LIVRER);
      renderScreen();
      await waitFor(() => {
        expect(screen.getByTestId('destinataire-nom')).toBeTruthy();
      });
      expect(screen.getByTestId('destinataire-nom')).toHaveTextContent('M. Dupont');
    });

    it('affiche l adresse complete avec le complement', async () => {
      mockGetDetailColis.mockResolvedValue(UN_COLIS_A_LIVRER);
      renderScreen();
      await waitFor(() => {
        expect(screen.getByTestId('adresse-complete')).toBeTruthy();
      });
      expect(screen.getByTestId('adresse-complete')).toHaveTextContent('12 Rue du Port');
      expect(screen.getByTestId('adresse-complement')).toHaveTextContent('Apt 3B');
    });

    it('affiche l identifiant du colis dans le header', async () => {
      mockGetDetailColis.mockResolvedValue(UN_COLIS_A_LIVRER);
      renderScreen('tournee-001', 'colis-001');
      await waitFor(() => {
        expect(screen.getByTestId('header-colis-id')).toBeTruthy();
      });
      expect(screen.getByTestId('header-colis-id')).toHaveTextContent('colis-001');
    });

    it('affiche les boutons LIVRER CE COLIS et DECLARER UN ECHEC', async () => {
      mockGetDetailColis.mockResolvedValue(UN_COLIS_A_LIVRER);
      renderScreen();
      await waitFor(() => {
        expect(screen.getByTestId('bouton-livrer')).toBeTruthy();
        expect(screen.getByTestId('bouton-echec')).toBeTruthy();
      });
    });
  });

  describe('SC2 : Colis deja livre — boutons desactives', () => {
    it('n affiche pas les boutons d action quand le colis est livre', async () => {
      mockGetDetailColis.mockResolvedValue(UN_COLIS_LIVRE);
      renderScreen('tournee-001', 'colis-002');
      await waitFor(() => {
        expect(screen.queryByTestId('bouton-livrer')).toBeNull();
        expect(screen.queryByTestId('bouton-echec')).toBeNull();
      });
    });

    it('affiche un message indiquant que le colis est livre', async () => {
      mockGetDetailColis.mockResolvedValue(UN_COLIS_LIVRE);
      renderScreen('tournee-001', 'colis-002');
      await waitFor(() => {
        expect(screen.getByTestId('message-statut-terminal')).toBeTruthy();
      });
      expect(screen.getByTestId('message-statut-terminal')).toHaveTextContent(
        'Ce colis a ete livre'
      );
    });
  });

  describe('SC3 : Colis en echec — boutons desactives', () => {
    it('n affiche pas les boutons d action quand le colis est en echec', async () => {
      mockGetDetailColis.mockResolvedValue(UN_COLIS_ECHEC);
      renderScreen('tournee-001', 'colis-003');
      await waitFor(() => {
        expect(screen.queryByTestId('bouton-livrer')).toBeNull();
        expect(screen.queryByTestId('bouton-echec')).toBeNull();
      });
    });

    it('affiche un message d echec', async () => {
      mockGetDetailColis.mockResolvedValue(UN_COLIS_ECHEC);
      renderScreen('tournee-001', 'colis-003');
      await waitFor(() => {
        expect(screen.getByTestId('message-statut-terminal')).toBeTruthy();
      });
      expect(screen.getByTestId('message-statut-terminal')).toHaveTextContent('Echec');
    });
  });

  describe('SC4 : Contraintes affichees', () => {
    it('affiche toutes les contraintes du colis', async () => {
      mockGetDetailColis.mockResolvedValue(UN_COLIS_A_LIVRER);
      renderScreen();
      await waitFor(() => {
        expect(screen.getByTestId('section-contraintes')).toBeTruthy();
      });
      expect(screen.getByTestId('contrainte-0')).toHaveTextContent('Avant 14h00');
      expect(screen.getByTestId('contrainte-1')).toHaveTextContent('Fragile');
    });

    it('n affiche pas la section contraintes si le colis n en a pas', async () => {
      mockGetDetailColis.mockResolvedValue(UN_COLIS_LIVRE);
      renderScreen('tournee-001', 'colis-002');
      await waitFor(() => {
        expect(screen.queryByTestId('section-contraintes')).toBeNull();
      });
    });
  });

  describe('SC5 : Numero de telephone masque (RGPD)', () => {
    it('affiche le bouton d appel sans exposer le numero brut', async () => {
      mockGetDetailColis.mockResolvedValue(UN_COLIS_A_LIVRER);
      renderScreen();
      await waitFor(() => {
        expect(screen.getByTestId('bouton-appel')).toBeTruthy();
      });
      // Le numero brut ne doit pas apparaitre en clair dans l'affichage
      expect(screen.queryByText('0601020304')).toBeNull();
    });
  });

  describe('SC6 : Etat de chargement', () => {
    it('affiche un indicateur de chargement pendant le fetch', () => {
      mockGetDetailColis.mockReturnValue(new Promise(() => {})); // never resolves
      renderScreen();
      expect(screen.getByTestId('etat-chargement')).toBeTruthy();
    });
  });

  describe('SC7 : Etat d erreur', () => {
    it('affiche un message d erreur si le fetch echoue', async () => {
      mockGetDetailColis.mockRejectedValue(new Error('Erreur reseau'));
      renderScreen();
      await waitFor(() => {
        expect(screen.getByTestId('etat-erreur')).toBeTruthy();
      });
    });

    it('affiche un message specifique si le colis est introuvable', async () => {
      mockGetDetailColis.mockRejectedValue(
        new ColisNonTrouveError('Colis introuvable')
      );
      renderScreen();
      await waitFor(() => {
        expect(screen.getByTestId('etat-erreur')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('appelle getDetailColis avec les bons parametres', async () => {
      mockGetDetailColis.mockResolvedValue(UN_COLIS_A_LIVRER);
      renderScreen('tournee-abc', 'colis-xyz');
      await waitFor(() => {
        expect(mockGetDetailColis).toHaveBeenCalledWith('tournee-abc', 'colis-xyz');
      });
    });

    it('le bouton retour appelle onRetour', async () => {
      mockGetDetailColis.mockResolvedValue(UN_COLIS_A_LIVRER);
      const onRetour = jest.fn();
      render(
        <DetailColisScreen
          tourneeId="tournee-001"
          colisId="colis-001"
          onRetour={onRetour}
        />
      );
      await waitFor(() => {
        expect(screen.getByTestId('bouton-retour')).toBeTruthy();
      });
      fireEvent.press(screen.getByTestId('bouton-retour'));
      expect(onRetour).toHaveBeenCalledTimes(1);
    });
  });
});
