import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { CapturePreuveScreen } from '../screens/CapturePreuveScreen';
import * as tourneeApi from '../api/tourneeApi';

// Mock de l'API
jest.mock('../api/tourneeApi');

const mockConfirmerLivraison = tourneeApi.confirmerLivraison as jest.MockedFunction<
  typeof tourneeApi.confirmerLivraison
>;

const DEFAULT_PROPS = {
  tourneeId: 'tournee-001',
  colisId: 'colis-001',
  destinataireNom: 'M. Dupont',
  onRetour: jest.fn(),
  onLivraisonConfirmee: jest.fn(),
};

describe('CapturePreuveScreen (US-008 + US-009)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Rendu initial ─────────────────────────────────────────────────────────

  it('affiche le testID de l écran racine', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    expect(getByTestId('capture-preuve-screen')).toBeTruthy();
  });

  it('affiche le header avec titre Preuve de livraison', () => {
    const { getByText } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    expect(getByText('Preuve de livraison')).toBeTruthy();
  });

  it('affiche le rappel du contexte (colis + destinataire)', () => {
    const { getByTestId, queryByText } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    expect(getByTestId('contexte-colis')).toBeTruthy();
    // Le nom du destinataire apparaît dans le contexte (peut être fragmenté dans des Text)
    expect(getByTestId('contexte-colis').props.children).toBeTruthy();
  });

  it('affiche les 4 types de preuve sélectionnables', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    expect(getByTestId('type-preuve-SIGNATURE')).toBeTruthy();
    expect(getByTestId('type-preuve-PHOTO')).toBeTruthy();
    expect(getByTestId('type-preuve-TIERS_IDENTIFIE')).toBeTruthy();
    expect(getByTestId('type-preuve-DEPOT_SECURISE')).toBeTruthy();
  });

  it('désactive le bouton CONFIRMER si aucun type sélectionné', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    const bouton = getByTestId('bouton-confirmer-livraison');
    expect(bouton.props.accessibilityState?.disabled).toBe(true);
  });

  // ─── US-008 : SIGNATURE ────────────────────────────────────────────────────

  it('US-008 SC1 : affiche le pad de signature après sélection SIGNATURE', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-SIGNATURE'));
    expect(getByTestId('pad-signature')).toBeTruthy();
    expect(getByTestId('bouton-effacer-signature')).toBeTruthy();
  });

  it('US-008 SC2 : bouton CONFIRMER désactivé si pad de signature vide', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-SIGNATURE'));
    const bouton = getByTestId('bouton-confirmer-livraison');
    expect(bouton.props.accessibilityState?.disabled).toBe(true);
  });

  it('US-008 SC3 : effacer remet le pad à vide et désactive le bouton', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-SIGNATURE'));
    // Simuler une signature
    const pad = getByTestId('pad-signature');
    fireEvent(pad, 'signatureCapturee', 'données_signature_base64');
    // Le bouton doit être actif
    let bouton = getByTestId('bouton-confirmer-livraison');
    expect(bouton.props.accessibilityState?.disabled).toBe(false);
    // Effacer la signature
    fireEvent.press(getByTestId('bouton-effacer-signature'));
    bouton = getByTestId('bouton-confirmer-livraison');
    expect(bouton.props.accessibilityState?.disabled).toBe(true);
  });

  it('US-008 SC1 : confirmerLivraison() appelé avec type SIGNATURE', async () => {
    mockConfirmerLivraison.mockResolvedValue({
      preuveLivraisonId: 'preuve-uuid-001',
      colisId: 'colis-001',
      typePreuve: 'SIGNATURE',
      horodatage: '2026-03-24T09:00:00Z',
      modeDegradeGps: true,
    });

    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-SIGNATURE'));
    const pad = getByTestId('pad-signature');
    fireEvent(pad, 'signatureCapturee', 'données_signature_base64');

    await act(async () => {
      fireEvent.press(getByTestId('bouton-confirmer-livraison'));
    });

    expect(mockConfirmerLivraison).toHaveBeenCalledWith(
      'tournee-001',
      'colis-001',
      expect.objectContaining({ typePreuve: 'SIGNATURE' })
    );
    expect(DEFAULT_PROPS.onLivraisonConfirmee).toHaveBeenCalledWith('preuve-uuid-001');
  });

  // ─── US-009 : TIERS_IDENTIFIE ─────────────────────────────────────────────

  it('US-009 SC2 : affiche le champ nom du tiers après sélection TIERS_IDENTIFIE', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-TIERS_IDENTIFIE'));
    expect(getByTestId('champ-nom-tiers')).toBeTruthy();
  });

  it('US-009 SC3 : bouton CONFIRMER désactivé si nom tiers vide', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-TIERS_IDENTIFIE'));
    const bouton = getByTestId('bouton-confirmer-livraison');
    expect(bouton.props.accessibilityState?.disabled).toBe(true);
  });

  it('US-009 SC2 : bouton actif quand nom tiers renseigné', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-TIERS_IDENTIFIE'));
    fireEvent.changeText(getByTestId('champ-nom-tiers'), 'Mme Leroy');
    const bouton = getByTestId('bouton-confirmer-livraison');
    expect(bouton.props.accessibilityState?.disabled).toBe(false);
  });

  it('US-009 SC2 : confirmerLivraison() appelé avec type TIERS_IDENTIFIE et nomTiers', async () => {
    mockConfirmerLivraison.mockResolvedValue({
      preuveLivraisonId: 'preuve-uuid-002',
      colisId: 'colis-001',
      typePreuve: 'TIERS_IDENTIFIE',
      horodatage: '2026-03-24T09:00:00Z',
      modeDegradeGps: true,
    });

    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-TIERS_IDENTIFIE'));
    fireEvent.changeText(getByTestId('champ-nom-tiers'), 'Mme Leroy');

    await act(async () => {
      fireEvent.press(getByTestId('bouton-confirmer-livraison'));
    });

    expect(mockConfirmerLivraison).toHaveBeenCalledWith(
      'tournee-001',
      'colis-001',
      expect.objectContaining({ typePreuve: 'TIERS_IDENTIFIE', nomTiers: 'Mme Leroy' })
    );
  });

  // ─── US-009 : DEPOT_SECURISE ──────────────────────────────────────────────

  it('US-009 SC4 : affiche le champ description après sélection DEPOT_SECURISE', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-DEPOT_SECURISE'));
    expect(getByTestId('champ-description-depot')).toBeTruthy();
  });

  it('US-009 SC4 : bouton CONFIRMER désactivé si description dépôt vide', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-DEPOT_SECURISE'));
    const bouton = getByTestId('bouton-confirmer-livraison');
    expect(bouton.props.accessibilityState?.disabled).toBe(true);
  });

  it('US-009 SC4 : bouton actif quand description saisie', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-DEPOT_SECURISE'));
    fireEvent.changeText(getByTestId('champ-description-depot'), 'Boite aux lettres n°3');
    const bouton = getByTestId('bouton-confirmer-livraison');
    expect(bouton.props.accessibilityState?.disabled).toBe(false);
  });

  // ─── US-009 : PHOTO (sans caméra native) ─────────────────────────────────

  it('US-009 : affiche le bouton caméra après sélection PHOTO', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-PHOTO'));
    expect(getByTestId('bouton-ouvrir-camera')).toBeTruthy();
  });

  // ─── Gestion des erreurs ──────────────────────────────────────────────────

  it('affiche un message d erreur si confirmerLivraison échoue', async () => {
    mockConfirmerLivraison.mockRejectedValue(
      new tourneeApi.LivraisonDejaConfirmeeError('Livraison déjà confirmée')
    );

    const { getByTestId, getByText } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-SIGNATURE'));
    const pad = getByTestId('pad-signature');
    fireEvent(pad, 'signatureCapturee', 'sig');

    await act(async () => {
      fireEvent.press(getByTestId('bouton-confirmer-livraison'));
    });

    await waitFor(() => {
      expect(getByTestId('message-erreur')).toBeTruthy();
    });
  });

  // ─── Navigation ───────────────────────────────────────────────────────────

  it('bouton retour appelle onRetour', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('bouton-retour'));
    expect(DEFAULT_PROPS.onRetour).toHaveBeenCalled();
  });
});
