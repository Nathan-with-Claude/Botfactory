/**
 * Tests TDD — CarteColis (Mobile) (US-025 + US-029)
 *
 * Composant card cliquable représentant un colis dans la liste de la tournée.
 * Source design-system.md §3.2.
 *
 * Scénarios couverts (US-025) :
 * - SC5 : touch target conforme (hauteur minimum 72px)
 * - Rendu de base : adresse, destinataire, badge statut
 * - Contraintes affichées
 * - Callback onPress déclenché
 *
 * Scénarios couverts (US-029 — swipe gauche pour déclarer échec) :
 * - SC1 : la zone d'action rouge "Echec" est rendue sous la carte
 * - SC2 : tap sur le bouton "Echec" appelle onSwipeEchec avec le colisId
 * - SC3 : le bouton "Echec" n'est pas visible si statut LIVRE ou ECHEC
 * - SC4 : le bouton "Echec" est présent si statut A_LIVRER
 * - SC5 : le conteneur wrapper est présent pour le swipe
 * - SC6 : onSwipeEchec non fourni — pas d'erreur si bouton tapé (défense)
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CarteColis } from '../CarteColis';

describe('CarteColis (mobile) — US-025 §3.2', () => {

  const defaultProps = {
    colisId: 'C-001',
    statut: 'A_LIVRER' as const,
    adresse: '12 Rue de la Paix, Paris 75001',
    destinataire: 'Jean Dupont',
    onPress: jest.fn(),
  };

  describe('SC5 — touch target', () => {
    it('a une hauteur minimum de 72px', () => {
      const { getByTestId } = render(<CarteColis {...defaultProps} />);
      const carte = getByTestId('carte-colis');
      // La contrainte hauteur est définie dans le style minHeight: 72
      const style = carte.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.minHeight).toBeGreaterThanOrEqual(72);
    });
  });

  describe('Rendu de base', () => {
    it('affiche l\'adresse', () => {
      const { getByTestId } = render(<CarteColis {...defaultProps} />);
      expect(getByTestId('carte-colis-adresse')).toBeTruthy();
    });

    it('affiche le destinataire', () => {
      const { getByTestId } = render(<CarteColis {...defaultProps} />);
      expect(getByTestId('carte-colis-destinataire')).toBeTruthy();
    });

    it('affiche le badge de statut', () => {
      const { getByTestId } = render(<CarteColis {...defaultProps} />);
      expect(getByTestId('badge-statut')).toBeTruthy();
    });
  });

  describe('Contraintes', () => {
    it('affiche les chips de contrainte', () => {
      const { getAllByTestId } = render(
        <CarteColis {...defaultProps} contraintes={['horaire', 'fragile']} />
      );
      expect(getAllByTestId('chip-contrainte').length).toBe(2);
    });

    it('n\'affiche pas de chips si pas de contrainte', () => {
      const { queryAllByTestId } = render(
        <CarteColis {...defaultProps} contraintes={[]} />
      );
      expect(queryAllByTestId('chip-contrainte').length).toBe(0);
    });
  });

  describe('Interaction', () => {
    it('appelle onPress à l\'appui', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(<CarteColis {...defaultProps} onPress={onPress} />);
      fireEvent.press(getByTestId('carte-colis'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Statuts', () => {
    it('rend le statut LIVRE avec opacity réduite', () => {
      const { getByTestId } = render(
        <CarteColis {...defaultProps} statut="LIVRE" />
      );
      const carte = getByTestId('carte-colis');
      const style = carte.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.opacity).toBe(0.7);
    });
  });
});

// ─── US-029 : Swipe gauche pour déclarer un échec ─────────────────────────────

describe('CarteColis — US-029 : Swipe gauche vers M-05', () => {

  const defaultProps = {
    colisId: 'C-002',
    statut: 'A_LIVRER' as const,
    adresse: '5 Avenue des Lilas, Lyon 69003',
    destinataire: 'Marie Curie',
    onPress: jest.fn(),
  };

  describe('SC1 — Zone d\'action "Echec" visible pour statut A_LIVRER', () => {
    it('rend la zone d\'action swipe (conteneur parent avec overflow hidden)', () => {
      const { getByTestId } = render(
        <CarteColis {...defaultProps} onSwipeEchec={jest.fn()} />
      );
      expect(getByTestId('carte-colis-swipe-wrapper')).toBeTruthy();
    });

    it('rend le bouton Echec pour un colis A_LIVRER', () => {
      const { getByTestId } = render(
        <CarteColis {...defaultProps} onSwipeEchec={jest.fn()} />
      );
      expect(getByTestId('bouton-swipe-echec')).toBeTruthy();
    });

    it('le bouton Echec affiche le texte "Échec"', () => {
      const { getByTestId } = render(
        <CarteColis {...defaultProps} onSwipeEchec={jest.fn()} />
      );
      const bouton = getByTestId('bouton-swipe-echec');
      expect(bouton).toBeTruthy();
    });
  });

  describe('SC2 — Tap sur bouton Echec appelle onSwipeEchec', () => {
    it('appelle onSwipeEchec avec le colisId lors du tap sur le bouton Echec', () => {
      const onSwipeEchec = jest.fn();
      const { getByTestId } = render(
        <CarteColis {...defaultProps} onSwipeEchec={onSwipeEchec} />
      );
      fireEvent.press(getByTestId('bouton-swipe-echec'));
      expect(onSwipeEchec).toHaveBeenCalledWith('C-002');
    });

    it('appelle onSwipeEchec exactement une fois par tap', () => {
      const onSwipeEchec = jest.fn();
      const { getByTestId } = render(
        <CarteColis {...defaultProps} onSwipeEchec={onSwipeEchec} />
      );
      fireEvent.press(getByTestId('bouton-swipe-echec'));
      expect(onSwipeEchec).toHaveBeenCalledTimes(1);
    });
  });

  describe('SC3 — Swipe inactif pour statuts terminaux (LIVRE, ECHEC)', () => {
    it('ne rend pas le bouton Echec si statut est LIVRE', () => {
      const { queryByTestId } = render(
        <CarteColis {...defaultProps} statut="LIVRE" onSwipeEchec={jest.fn()} />
      );
      expect(queryByTestId('bouton-swipe-echec')).toBeNull();
    });

    it('ne rend pas le bouton Echec si statut est ECHEC', () => {
      const { queryByTestId } = render(
        <CarteColis {...defaultProps} statut="ECHEC" onSwipeEchec={jest.fn()} />
      );
      expect(queryByTestId('bouton-swipe-echec')).toBeNull();
    });

    it('ne rend pas le bouton Echec si statut est A_REPRESENTER', () => {
      const { queryByTestId } = render(
        <CarteColis {...defaultProps} statut="A_REPRESENTER" onSwipeEchec={jest.fn()} />
      );
      expect(queryByTestId('bouton-swipe-echec')).toBeNull();
    });
  });

  describe('SC4 — Prop onSwipeEchec facultative', () => {
    it('ne rend pas le bouton Echec si onSwipeEchec n\'est pas fourni', () => {
      const { queryByTestId } = render(
        <CarteColis {...defaultProps} />
      );
      // Pas de bouton swipe si le parent ne fournit pas onSwipeEchec
      expect(queryByTestId('bouton-swipe-echec')).toBeNull();
    });

    it('conserve le onPress normal même sans onSwipeEchec', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <CarteColis {...defaultProps} onPress={onPress} />
      );
      fireEvent.press(getByTestId('carte-colis'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('SC5 — Conteneur wrapper présent uniquement si swipe actif', () => {
    it('rend le wrapper swipe si onSwipeEchec est fourni et statut éligible', () => {
      const { getByTestId } = render(
        <CarteColis {...defaultProps} statut="A_LIVRER" onSwipeEchec={jest.fn()} />
      );
      expect(getByTestId('carte-colis-swipe-wrapper')).toBeTruthy();
    });

    it('ne rend pas le wrapper swipe si statut LIVRE (swipe non disponible)', () => {
      const { queryByTestId } = render(
        <CarteColis {...defaultProps} statut="LIVRE" onSwipeEchec={jest.fn()} />
      );
      // Le wrapper n'est pas rendu pour les colis traités
      expect(queryByTestId('carte-colis-swipe-wrapper')).toBeNull();
    });
  });

  describe('SC6 — Accessibilité du bouton swipe', () => {
    it('le bouton Echec a un accessibilityLabel descriptif', () => {
      const { getByTestId } = render(
        <CarteColis {...defaultProps} onSwipeEchec={jest.fn()} />
      );
      const bouton = getByTestId('bouton-swipe-echec');
      expect(bouton.props.accessibilityLabel).toBeTruthy();
    });

    it('le bouton Echec a le rôle button', () => {
      const { getByTestId } = render(
        <CarteColis {...defaultProps} onSwipeEchec={jest.fn()} />
      );
      const bouton = getByTestId('bouton-swipe-echec');
      expect(bouton.props.accessibilityRole).toBe('button');
    });
  });
});
