/**
 * Tests TDD — US-046 : Pad de trace réel pour la capture de signature numérique (M-04)
 *
 * Remplace le TouchableOpacity simulé (US-008 dette technique) par SignatureCanvas.
 * Ces tests sont écrits AVANT l'implémentation (RED phase TDD).
 *
 * Scenarios couverts :
 *   SC1 — Le composant SignatureCanvas est affiché à la place du TouchableOpacity simulé
 *   SC2 — Pad vide : bouton CONFIRMER désactivé
 *   SC3 — Tracé présent : bouton CONFIRMER activé
 *   SC4 — Bouton Effacer : clearSignature() appelé, bouton CONFIRMER repassé désactivé
 *   SC5 — Confirmation : readSignature() → onOK → base64PNG transmis au handler
 *   SC6 — Aucune régression : TIERS_IDENTIFIE, DEPOT_SECURISE, PHOTO inchangés
 *   SC7 — Scénario 5 (US-046) : pad vide après Effacer → bouton désactivé
 *   SC8 — Le testID 'pad-signature-canvas' est présent (nouveau composant)
 *   SC9 — Aucun TouchableOpacity simulé (pad-signature-simule absent)
 */

import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { CapturePreuveScreen } from '../screens/CapturePreuveScreen';
import * as tourneeApi from '../api/tourneeApi';

jest.mock('../api/tourneeApi');
jest.mock('react-native-signature-canvas');

const mockConfirmerLivraison = tourneeApi.confirmerLivraison as jest.MockedFunction<
  typeof tourneeApi.confirmerLivraison
>;

const DEFAULT_PROPS = {
  tourneeId: 'tournee-046',
  colisId: 'colis-046',
  destinataireNom: 'M. Durand',
  onRetour: jest.fn(),
  onLivraisonConfirmee: jest.fn(),
};

describe('US-046 : Pad de trace réel SignatureCanvas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── SC1 : Le composant SignatureCanvas est présent ────────────────────────

  it('SC1 : affiche la section pad-signature-canvas (SignatureCanvas) dans la section SIGNATURE', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    // SIGNATURE est pré-sélectionné par défaut (L6)
    // pad-signature-canvas est le conteneur du composant SignatureCanvas réel
    expect(getByTestId('pad-signature-canvas')).toBeTruthy();
    // Le pad-signature-canvas doit avoir les callbacks onOK et onEmpty (props)
    const padEl = getByTestId('pad-signature-canvas');
    expect(padEl.props.onOK).toBeDefined();
    expect(padEl.props.onEmpty).toBeDefined();
  });

  it('SC8 : le testID pad-signature-canvas est présent dans la section SIGNATURE', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    // Le conteneur de SignatureCanvas doit porter le testID 'pad-signature-canvas'
    expect(getByTestId('pad-signature-canvas')).toBeTruthy();
  });

  it('SC9 : le TouchableOpacity simulé (pad-signature-simule) n\'est plus présent', () => {
    const { queryByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    // L'ancien pad simulé ne doit plus exister
    expect(queryByTestId('pad-signature-simule')).toBeNull();
  });

  // ─── SC2 : Pad vide — bouton CONFIRMER désactivé ──────────────────────────

  it('SC2 : pad vide au rendu initial — bouton CONFIRMER désactivé', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    const bouton = getByTestId('bouton-confirmer-livraison');
    expect(bouton.props.accessibilityState?.disabled).toBe(true);
  });

  // ─── SC3 : Tracé présent — bouton CONFIRMER activé ──────────────────────

  it('SC3 : quand onOK est déclenché avec base64, le bouton CONFIRMER s\'active', async () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    // Récupérer le composant SignatureCanvas mock et appeler sa prop onOK
    const padCanvas = getByTestId('pad-signature-canvas');
    // Simuler la réception de la signature via l'événement onOK du composant
    await act(async () => {
      fireEvent(padCanvas, 'onOK', 'data:image/png;base64,SIGNATURE_BASE64_TEST');
    });
    const bouton = getByTestId('bouton-confirmer-livraison');
    expect(bouton.props.accessibilityState?.disabled).toBe(false);
  });

  it('SC3b : quand onBegin est déclenché, le pad est considéré en cours de trace', async () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    const padCanvas = getByTestId('pad-signature-canvas');
    // Simule le début du tracé
    await act(async () => {
      fireEvent(padCanvas, 'onBegin');
    });
    // Après onBegin sans onOK, le bouton reste désactivé (base64 pas encore capturé)
    const bouton = getByTestId('bouton-confirmer-livraison');
    expect(bouton.props.accessibilityState?.disabled).toBe(true);
  });

  // ─── SC4 : Bouton Effacer — pad remis à zéro, CONFIRMER désactivé ────────

  it('SC4 : après Effacer, le bouton CONFIRMER repasse désactivé', async () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    const padCanvas = getByTestId('pad-signature-canvas');

    // 1) Simuler une signature capturée
    await act(async () => {
      fireEvent(padCanvas, 'onOK', 'data:image/png;base64,SIGNATURE_BASE64_TEST');
    });
    expect(getByTestId('bouton-confirmer-livraison').props.accessibilityState?.disabled).toBe(false);

    // 2) Appuyer sur Effacer
    await act(async () => {
      fireEvent.press(getByTestId('bouton-effacer-signature'));
    });

    // 3) Le bouton CONFIRMER doit être désactivé
    expect(getByTestId('bouton-confirmer-livraison').props.accessibilityState?.disabled).toBe(true);
  });

  it('SC7 : pad vide (onEmpty déclenché) → bouton CONFIRMER désactivé', async () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    const padCanvas = getByTestId('pad-signature-canvas');

    // Simuler onOK pour activer, puis onEmpty pour revider
    await act(async () => {
      fireEvent(padCanvas, 'onOK', 'data:image/png;base64,SIG');
    });
    await act(async () => {
      fireEvent(padCanvas, 'onEmpty');
    });

    expect(getByTestId('bouton-confirmer-livraison').props.accessibilityState?.disabled).toBe(true);
  });

  // ─── SC5 : Confirmation — readSignature() → base64 transmis au handler ───

  it('SC5 : confirmer la livraison transmet le base64PNG au handler', async () => {
    mockConfirmerLivraison.mockResolvedValue({
      preuveLivraisonId: 'preuve-046-uuid',
      colisId: 'colis-046',
      typePreuve: 'SIGNATURE',
      horodatage: '2026-04-03T09:00:00Z',
      modeDegradeGps: true,
    });

    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    const padCanvas = getByTestId('pad-signature-canvas');

    // 1) Simuler la réception d'une signature base64
    await act(async () => {
      fireEvent(padCanvas, 'onOK', 'data:image/png;base64,SIGNATURE_BASE64_REEL');
    });

    // 2) Appuyer sur CONFIRMER
    await act(async () => {
      fireEvent.press(getByTestId('bouton-confirmer-livraison'));
    });

    // 3) Le handler doit être appelé avec la signature base64 non nulle
    await waitFor(() => {
      expect(mockConfirmerLivraison).toHaveBeenCalledWith(
        'tournee-046',
        'colis-046',
        expect.objectContaining({
          typePreuve: 'SIGNATURE',
          donneesSignature: 'data:image/png;base64,SIGNATURE_BASE64_REEL',
        })
      );
    });
    expect(DEFAULT_PROPS.onLivraisonConfirmee).toHaveBeenCalledWith('preuve-046-uuid');
  });

  // ─── SC6 : Aucune régression sur les autres types de preuve ──────────────

  it('SC6a : TIERS_IDENTIFIE — champ texte toujours présent', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-TIERS_IDENTIFIE'));
    expect(getByTestId('champ-nom-tiers')).toBeTruthy();
  });

  it('SC6b : DEPOT_SECURISE — champ description toujours présent', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-DEPOT_SECURISE'));
    expect(getByTestId('champ-description-depot')).toBeTruthy();
  });

  it('SC6c : PHOTO — bouton caméra toujours présent', () => {
    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-PHOTO'));
    expect(getByTestId('bouton-ouvrir-camera')).toBeTruthy();
  });

  it('SC6d : TIERS_IDENTIFIE — confirmerLivraison appelé avec nomTiers (pas de signature)', async () => {
    mockConfirmerLivraison.mockResolvedValue({
      preuveLivraisonId: 'preuve-tiers-046',
      colisId: 'colis-046',
      typePreuve: 'TIERS_IDENTIFIE',
      horodatage: '2026-04-03T09:00:00Z',
      modeDegradeGps: true,
    });

    const { getByTestId } = render(<CapturePreuveScreen {...DEFAULT_PROPS} />);
    fireEvent.press(getByTestId('type-preuve-TIERS_IDENTIFIE'));
    fireEvent.changeText(getByTestId('champ-nom-tiers'), 'Mme Leblanc');

    await act(async () => {
      fireEvent.press(getByTestId('bouton-confirmer-livraison'));
    });

    expect(mockConfirmerLivraison).toHaveBeenCalledWith(
      'tournee-046',
      'colis-046',
      expect.objectContaining({ typePreuve: 'TIERS_IDENTIFIE', nomTiers: 'Mme Leblanc' })
    );
  });
});
