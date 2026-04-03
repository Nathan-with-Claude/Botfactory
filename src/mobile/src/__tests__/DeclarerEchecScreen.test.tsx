import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { DeclarerEchecScreen } from '../screens/DeclarerEchecScreen';
import * as tourneeApi from '../api/tourneeApi';

/**
 * Tests unitaires — US-005 : Écran M-05 — Déclaration d'un échec de livraison
 *
 * Couvre :
 * - Scénario 1 : rendu initial avec motifs et dispositions affichés
 * - Scénario 2 : bouton désactivé tant que motif non sélectionné
 * - Scénario 2b : bouton désactivé si disposition non sélectionnée (motif seul insuffisant)
 * - Scénario 3 : sélection motif + disposition → bouton activé → soumission
 * - Scénario 3b : note optionnelle incluse dans la requête
 * - Scénario 5 : erreur 409 (EchecDejaDeClareError) → message d'erreur affiché
 * - Erreur réseau → message d'erreur générique
 * - Bouton retour → appelle onRetour
 */

jest.mock('../api/tourneeApi', () => ({
  declarerEchecLivraison: jest.fn(),
  EchecDejaDeClareError: class EchecDejaDeClareError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'EchecDejaDeClareError';
    }
  },
}));

const mockDeclarerEchecLivraison = tourneeApi.declarerEchecLivraison as jest.Mock;
const { EchecDejaDeClareError } = tourneeApi;

const DEFAULT_PROPS = {
  tourneeId: 'tournee-001',
  colisId: 'colis-001',
  destinataireNom: 'M. Dupont',
  onRetour: jest.fn(),
  onEchecEnregistre: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DeclarerEchecScreen — US-005', () => {
  // ─── Rendu initial ───────────────────────────────────────────────────────

  it('affiche le contexte du colis (ID et destinataire)', () => {
    const { getByTestId } = render(<DeclarerEchecScreen {...DEFAULT_PROPS} />);
    const contexte = getByTestId('contexte-colis');
    expect(contexte).toBeTruthy();
    const colisIdElement = getByTestId('contexte-colis-id');
    expect(colisIdElement.props.children).toContain('colis-001');
  });

  it('affiche les 4 motifs normalisés', () => {
    const { getByTestId } = render(<DeclarerEchecScreen {...DEFAULT_PROPS} />);
    expect(getByTestId('motif-ABSENT')).toBeTruthy();
    expect(getByTestId('motif-ACCES_IMPOSSIBLE')).toBeTruthy();
    expect(getByTestId('motif-REFUS_CLIENT')).toBeTruthy();
    expect(getByTestId('motif-HORAIRE_DEPASSE')).toBeTruthy();
  });

  it('affiche les 3 dispositions normalisées', () => {
    const { getByTestId } = render(<DeclarerEchecScreen {...DEFAULT_PROPS} />);
    expect(getByTestId('disposition-A_REPRESENTER')).toBeTruthy();
    expect(getByTestId('disposition-DEPOT_CHEZ_TIERS')).toBeTruthy();
    expect(getByTestId('disposition-RETOUR_DEPOT')).toBeTruthy();
  });

  it('affiche le champ note optionnel et le compteur', () => {
    const { getByTestId } = render(<DeclarerEchecScreen {...DEFAULT_PROPS} />);
    expect(getByTestId('champ-note')).toBeTruthy();
    expect(getByTestId('compteur-note')).toBeTruthy();
  });

  // ─── Scénario 2 : bouton désactivé ───────────────────────────────────────

  it('SC2 — bouton désactivé tant que motif non sélectionné', () => {
    const { getByTestId } = render(<DeclarerEchecScreen {...DEFAULT_PROPS} />);
    const bouton = getByTestId('bouton-enregistrer-echec');
    expect(bouton.props.accessibilityState.disabled).toBe(true);
  });

  it('bouton désactivé si seul le motif est sélectionné (disposition manquante)', () => {
    const { getByTestId } = render(<DeclarerEchecScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('motif-ABSENT'));
    const bouton = getByTestId('bouton-enregistrer-echec');
    expect(bouton.props.accessibilityState.disabled).toBe(true);
  });

  it('bouton activé quand motif ET disposition sont sélectionnés', () => {
    const { getByTestId } = render(<DeclarerEchecScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('motif-ABSENT'));
    fireEvent.press(getByTestId('disposition-A_REPRESENTER'));
    const bouton = getByTestId('bouton-enregistrer-echec');
    expect(bouton.props.accessibilityState.disabled).toBe(false);
  });

  // ─── Scénario 1 : soumission nominale ────────────────────────────────────

  it('SC1 — appelle declarerEchecLivraison avec le motif et la disposition sélectionnés', async () => {
    mockDeclarerEchecLivraison.mockResolvedValueOnce({ statut: 'ECHEC' });
    jest.useFakeTimers();

    const onEchecEnregistre = jest.fn();
    const { getByTestId } = render(
      <DeclarerEchecScreen {...DEFAULT_PROPS} onEchecEnregistre={onEchecEnregistre} toastDureeMs={100} />
    );

    fireEvent.press(getByTestId('motif-ABSENT'));
    fireEvent.press(getByTestId('disposition-A_REPRESENTER'));

    await act(async () => {
      fireEvent.press(getByTestId('bouton-enregistrer-echec'));
    });

    expect(mockDeclarerEchecLivraison).toHaveBeenCalledWith(
      'tournee-001',
      'colis-001',
      expect.objectContaining({
        motif: 'ABSENT',
        disposition: 'A_REPRESENTER',
      })
    );

    // onEchecEnregistre est appelé après le toast (délai toastDureeMs)
    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    expect(onEchecEnregistre).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  // ─── Scénario 3 : note optionnelle ───────────────────────────────────────

  it('SC3 — note optionnelle incluse dans la requête si saisie', async () => {
    mockDeclarerEchecLivraison.mockResolvedValueOnce({ statut: 'ECHEC' });

    const { getByTestId } = render(<DeclarerEchecScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('motif-ACCES_IMPOSSIBLE'));
    fireEvent.press(getByTestId('disposition-RETOUR_DEPOT'));
    fireEvent.changeText(getByTestId('champ-note'), 'Portail code non fonctionnel');

    await act(async () => {
      fireEvent.press(getByTestId('bouton-enregistrer-echec'));
    });

    expect(mockDeclarerEchecLivraison).toHaveBeenCalledWith(
      'tournee-001',
      'colis-001',
      expect.objectContaining({
        motif: 'ACCES_IMPOSSIBLE',
        disposition: 'RETOUR_DEPOT',
        noteLibre: 'Portail code non fonctionnel',
      })
    );
  });

  it('note vide n\'est pas transmise (noteLibre undefined)', async () => {
    mockDeclarerEchecLivraison.mockResolvedValueOnce({ statut: 'ECHEC' });

    const { getByTestId } = render(<DeclarerEchecScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('motif-ABSENT'));
    fireEvent.press(getByTestId('disposition-A_REPRESENTER'));

    await act(async () => {
      fireEvent.press(getByTestId('bouton-enregistrer-echec'));
    });

    const appelArgs = mockDeclarerEchecLivraison.mock.calls[0][2];
    expect(appelArgs.noteLibre).toBeUndefined();
  });

  // ─── Scénario 5 : colis déjà en ECHEC ───────────────────────────────────

  it('SC5 — affiche un message si échec déjà déclaré (EchecDejaDeClareError)', async () => {
    mockDeclarerEchecLivraison.mockRejectedValueOnce(
      new EchecDejaDeClareError('Echec deja declare')
    );

    const { getByTestId } = render(<DeclarerEchecScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('motif-ABSENT'));
    fireEvent.press(getByTestId('disposition-A_REPRESENTER'));

    await act(async () => {
      fireEvent.press(getByTestId('bouton-enregistrer-echec'));
    });

    await waitFor(() => {
      expect(getByTestId('message-erreur')).toBeTruthy();
    });
  });

  // ─── Erreur réseau ───────────────────────────────────────────────────────

  it('affiche un message d\'erreur générique en cas d\'erreur réseau', async () => {
    mockDeclarerEchecLivraison.mockRejectedValueOnce(new Error('Network error'));

    const { getByTestId } = render(<DeclarerEchecScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('motif-ABSENT'));
    fireEvent.press(getByTestId('disposition-A_REPRESENTER'));

    await act(async () => {
      fireEvent.press(getByTestId('bouton-enregistrer-echec'));
    });

    await waitFor(() => {
      expect(getByTestId('message-erreur')).toBeTruthy();
    });
  });

  // ─── Bouton retour ───────────────────────────────────────────────────────

  it('appelle onRetour quand le bouton retour est pressé', () => {
    const onRetour = jest.fn();
    const { getByTestId } = render(
      <DeclarerEchecScreen {...DEFAULT_PROPS} onRetour={onRetour} />
    );
    fireEvent.press(getByTestId('bouton-retour'));
    expect(onRetour).toHaveBeenCalledTimes(1);
  });

  // ─── Compteur de note ────────────────────────────────────────────────────

  it('met à jour le compteur au fur et à mesure de la saisie de note', () => {
    const { getByTestId } = render(<DeclarerEchecScreen {...DEFAULT_PROPS} />);
    fireEvent.changeText(getByTestId('champ-note'), 'Test note');
    const compteur = getByTestId('compteur-note');
    // children est un tableau [longueur, '/', 250]
    const children = compteur.props.children;
    expect(Array.isArray(children) ? children[0] : children).toBe(9);
  });

  // ─── Feedback terrain 2026-03-30 ─────────────────────────────────────────

  it('L4 — affiche le toast de confirmation apres soumission reussie', async () => {
    mockDeclarerEchecLivraison.mockResolvedValueOnce({ statut: 'ECHEC' });
    jest.useFakeTimers();

    const { getByTestId } = render(
      <DeclarerEchecScreen {...DEFAULT_PROPS} toastDureeMs={500} />
    );

    fireEvent.press(getByTestId('motif-ABSENT'));
    fireEvent.press(getByTestId('disposition-A_REPRESENTER'));

    await act(async () => {
      fireEvent.press(getByTestId('bouton-enregistrer-echec'));
    });

    // Le toast doit etre visible immediatemment apres soumission
    await waitFor(() => {
      expect(getByTestId('toast-echec-enregistre')).toBeTruthy();
    });

    jest.useRealTimers();
  });

  it('L4 — appelle onEchecEnregistre apres la duree du toast', async () => {
    mockDeclarerEchecLivraison.mockResolvedValueOnce({ statut: 'ECHEC' });
    jest.useFakeTimers();

    const onEchecEnregistre = jest.fn();
    const { getByTestId } = render(
      <DeclarerEchecScreen {...DEFAULT_PROPS} onEchecEnregistre={onEchecEnregistre} toastDureeMs={500} />
    );

    fireEvent.press(getByTestId('motif-ABSENT'));
    fireEvent.press(getByTestId('disposition-A_REPRESENTER'));

    await act(async () => {
      fireEvent.press(getByTestId('bouton-enregistrer-echec'));
    });

    // Avant expiration du toast
    expect(onEchecEnregistre).not.toHaveBeenCalled();

    // Avancer le temps
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(onEchecEnregistre).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('L8 — affiche le texte d aide disposition si aucun motif selectionne', () => {
    const { getByTestId } = render(<DeclarerEchecScreen {...DEFAULT_PROPS} />);
    expect(getByTestId('aide-disposition')).toBeTruthy();
  });

  it('L8 — masque le texte d aide disposition apres selection d un motif', () => {
    const { getByTestId, queryByTestId } = render(<DeclarerEchecScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('motif-ABSENT'));
    expect(queryByTestId('aide-disposition')).toBeNull();
  });
});
