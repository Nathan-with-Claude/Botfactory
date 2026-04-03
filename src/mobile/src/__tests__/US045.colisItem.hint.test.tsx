/**
 * Tests TDD — US-045 : Hint visuel swipe — rendu dans ColisItem
 *
 * Couvre les spécifications de la v1.3 (wireframe M-02) :
 * - SC-RENDER-1 : le texte exact du hint est affiché sous la carte
 *   ("← Glissez vers la gauche pour déclarer un problème")
 * - SC-RENDER-2 : le hint n'est pas visible quand afficherHintSwipe=false
 * - SC-RENDER-3 : le hint n'est pas visible sur un colis non A_LIVRER (pas de swipeActif)
 * - SC-RENDER-4 : le hint est positionné hors du header (sous la carte, pas en ligne)
 *
 * Architecture :
 * - ColisItem reçoit afficherHintSwipe (bool) depuis ListeColisScreen via useSwipeHint
 * - Le hint est un Text avec testID="hint-swipe", texte exact conforme wireframe M-02 v1.3
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import ColisItem from '../components/ColisItem';
import type { ColisDTO } from '../api/tourneeTypes';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const colisALivrer: ColisDTO = {
  colisId: 'colis-alivrer-001',
  statut: 'A_LIVRER',
  adresseLivraison: {
    rue: '12 Rue du Port',
    complementAdresse: 'Apt 3B',
    codePostal: '69003',
    ville: 'Lyon',
    zoneGeographique: 'Zone B',
    adresseComplete: '12 Rue du Port, 69003 Lyon',
  },
  destinataire: { nom: 'M. Dupont', telephoneChiffre: null },
  contraintes: [],
  aUneContrainteHoraire: false,
  estTraite: false,
};

const colisLivre: ColisDTO = {
  ...colisALivrer,
  colisId: 'colis-livre-001',
  statut: 'LIVRE',
  estTraite: true,
};

// ─── Tests rendu hint ─────────────────────────────────────────────────────────

describe('US-045 — ColisItem — rendu du hint swipe (wireframe M-02 v1.3)', () => {

  // SC-RENDER-1 : texte exact affiché quand conditions réunies
  it('SC-RENDER-1 — affiche le texte exact du hint si afficherHintSwipe=true et colis A_LIVRER avec onSwipeEchec', () => {
    const { getByTestId } = render(
      <ColisItem
        colis={colisALivrer}
        afficherHintSwipe={true}
        onSwipeEchec={jest.fn()}
      />
    );
    const hint = getByTestId('hint-swipe');
    expect(hint.props.children).toBe(
      '← Glissez vers la gauche pour déclarer un problème'
    );
  });

  // SC-RENDER-2 : hint absent si afficherHintSwipe=false
  it('SC-RENDER-2 — n\'affiche pas le hint si afficherHintSwipe=false', () => {
    const { queryByTestId } = render(
      <ColisItem
        colis={colisALivrer}
        afficherHintSwipe={false}
        onSwipeEchec={jest.fn()}
      />
    );
    expect(queryByTestId('hint-swipe')).toBeNull();
  });

  // SC-RENDER-3 : hint absent si le colis n'est pas A_LIVRER (swipe inactif)
  it('SC-RENDER-3 — n\'affiche pas le hint sur un colis LIVRE même si afficherHintSwipe=true', () => {
    const { queryByTestId } = render(
      <ColisItem
        colis={colisLivre}
        afficherHintSwipe={true}
        onSwipeEchec={jest.fn()}
      />
    );
    expect(queryByTestId('hint-swipe')).toBeNull();
  });

  // SC-RENDER-4 : le hint est positionné sous la carte (pas en ligne avec le badge)
  // On vérifie que le badge et le hint ne partagent pas le même nœud parent direct
  it('SC-RENDER-4 — le badge statut n\'a pas le hint comme frère direct dans le même View', () => {
    const { getByTestId } = render(
      <ColisItem
        colis={colisALivrer}
        afficherHintSwipe={true}
        onSwipeEchec={jest.fn()}
      />
    );
    const hint = getByTestId('hint-swipe');
    const badge = getByTestId('colis-statut');
    // Le badge est enfant d'une View (le header) — son parent.parent est la carte
    // Le hint est enfant direct de la carte — son parent est la carte
    // Ils n'ont donc pas le même parent direct
    const parentDuHint = hint.parent;
    const parentDuBadge = badge.parent;
    expect(parentDuHint).not.toBe(parentDuBadge);
  });
});
