import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { RecapitulatifTourneeScreen } from '../screens/RecapitulatifTourneeScreen';
import * as tourneeApi from '../api/tourneeApi';

/**
 * Tests unitaires — US-007 : Écran M-07 — Récapitulatif de tournée après clôture
 *
 * Couvre :
 * - Scénario 1 : appel de cloturerTournee() au montage → affichage du récapitulatif
 * - Scénario 1b : affiche livrés, échecs, à représenter, total
 * - Scénario 2 : état de chargement (spinner) pendant l'appel API
 * - Scénario 3 : affiche une erreur si la clôture est refusée (409 — colis encore à livrer)
 * - Scénario 4 : micro-enquête de satisfaction (note 1-5) affichée après clôture
 * - Scénario 4b : sélection d'une note → possible (sans erreur)
 */

jest.mock('../api/tourneeApi', () => ({
  cloturerTournee: jest.fn(),
  TourneeDejaClotureError: class TourneeDejaClotureError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TourneeDejaClotureError';
    }
  },
  ColisEncoreALivrerError: class ColisEncoreALivrerError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ColisEncoreALivrerError';
    }
  },
}));

const mockCloturerTournee = tourneeApi.cloturerTournee as jest.Mock;
const { ColisEncoreALivrerError } = tourneeApi;

const RECAP_SUCCES = {
  tourneeId: 'tournee-001',
  livreurId: 'livreur-001',
  date: '2026-03-24',
  statut: 'CLOTUREE' as const,
  colisTotal: 22,
  colisLivres: 18,
  colisEchecs: 3,
  colisARepresenter: 1,
};

const DEFAULT_PROPS = {
  tourneeId: 'tournee-001',
  onTerminer: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RecapitulatifTourneeScreen — US-007', () => {
  // ─── Scénario 1 : clôture réussie — affichage du récapitulatif ────────────

  it('affiche le bandeau "Tournée clôturée" après succès', async () => {
    mockCloturerTournee.mockResolvedValueOnce(RECAP_SUCCES);

    const { getByTestId } = render(<RecapitulatifTourneeScreen {...DEFAULT_PROPS} />);

    await waitFor(() => {
      expect(getByTestId('recap-titre')).toBeTruthy();
    });
  });

  it('affiche le nombre total de colis', async () => {
    mockCloturerTournee.mockResolvedValueOnce(RECAP_SUCCES);

    const { getByTestId } = render(<RecapitulatifTourneeScreen {...DEFAULT_PROPS} />);

    await waitFor(() => {
      const total = getByTestId('recap-colis-total');
      expect(total.props.children).toEqual(22);
    });
  });

  it('affiche le nombre de colis livrés', async () => {
    mockCloturerTournee.mockResolvedValueOnce(RECAP_SUCCES);

    const { getByTestId } = render(<RecapitulatifTourneeScreen {...DEFAULT_PROPS} />);

    await waitFor(() => {
      const livres = getByTestId('recap-colis-livres');
      expect(livres.props.children).toEqual(18);
    });
  });

  it('affiche le nombre d\'échecs', async () => {
    mockCloturerTournee.mockResolvedValueOnce(RECAP_SUCCES);

    const { getByTestId } = render(<RecapitulatifTourneeScreen {...DEFAULT_PROPS} />);

    await waitFor(() => {
      const echecs = getByTestId('recap-colis-echecs');
      expect(echecs.props.children).toEqual(3);
    });
  });

  it('affiche le nombre de colis à représenter', async () => {
    mockCloturerTournee.mockResolvedValueOnce(RECAP_SUCCES);

    const { getByTestId } = render(<RecapitulatifTourneeScreen {...DEFAULT_PROPS} />);

    await waitFor(() => {
      const aRepresenter = getByTestId('recap-colis-a-representer');
      expect(aRepresenter.props.children).toEqual(1);
    });
  });

  // ─── Scénario 2 : état de chargement ─────────────────────────────────────

  it('affiche un indicateur de chargement pendant l\'appel API', () => {
    mockCloturerTournee.mockImplementation(() => new Promise(() => {})); // promesse jamais résolue

    const { getByTestId } = render(<RecapitulatifTourneeScreen {...DEFAULT_PROPS} />);

    expect(getByTestId('recap-chargement')).toBeTruthy();
  });

  // ─── Scénario 3 : erreur — colis encore à livrer ─────────────────────────

  it('affiche un message d\'erreur si des colis sont encore à livrer (409)', async () => {
    mockCloturerTournee.mockRejectedValueOnce(
      new ColisEncoreALivrerError('Certains colis sont encore en statut a livrer')
    );

    const { getByTestId } = render(<RecapitulatifTourneeScreen {...DEFAULT_PROPS} />);

    await waitFor(() => {
      expect(getByTestId('recap-erreur')).toBeTruthy();
    });
  });

  // ─── Scénario 4 : micro-enquête de satisfaction ───────────────────────────

  it('affiche la micro-enquête de satisfaction après clôture réussie', async () => {
    mockCloturerTournee.mockResolvedValueOnce(RECAP_SUCCES);

    const { getByTestId } = render(<RecapitulatifTourneeScreen {...DEFAULT_PROPS} />);

    await waitFor(() => {
      expect(getByTestId('enquete-satisfaction')).toBeTruthy();
    });
  });

  it('permet de sélectionner une note de satisfaction sans erreur', async () => {
    mockCloturerTournee.mockResolvedValueOnce(RECAP_SUCCES);

    const { getByTestId } = render(<RecapitulatifTourneeScreen {...DEFAULT_PROPS} />);

    await waitFor(() => {
      expect(getByTestId('note-5')).toBeTruthy();
    });

    fireEvent.press(getByTestId('note-5'));
    // Aucune erreur ne doit être levée
    expect(getByTestId('note-5')).toBeTruthy();
  });

  // ─── Bouton "Terminer" ────────────────────────────────────────────────────

  it('affiche le bouton "Terminer" après clôture et l\'appelle à la pression', async () => {
    mockCloturerTournee.mockResolvedValueOnce(RECAP_SUCCES);
    const onTerminer = jest.fn();

    const { getByTestId } = render(
      <RecapitulatifTourneeScreen tourneeId="tournee-001" onTerminer={onTerminer} />
    );

    await waitFor(() => {
      expect(getByTestId('bouton-terminer')).toBeTruthy();
    });

    fireEvent.press(getByTestId('bouton-terminer'));
    expect(onTerminer).toHaveBeenCalledTimes(1);
  });
});
