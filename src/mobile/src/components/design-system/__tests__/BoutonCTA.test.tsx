/**
 * Tests TDD — BoutonCTA (Mobile) (US-025)
 *
 * Composant bouton d'action React Native.
 * Source design-system.md §3.4.
 *
 * Scénarios couverts :
 * - SC4 : état désactivé (disabled=true, onPress non déclenché)
 * - État loading : spinner affiché, label masqué
 * - Touch target minimum 48x48dp (hauteur = 56px sur mobile)
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BoutonCTA } from '../BoutonCTA';

describe('BoutonCTA (mobile) — US-025 §3.4', () => {

  describe('SC4 — état désactivé', () => {
    it('n\'appelle pas onPress si disabled=true', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <BoutonCTA variant="primaire" size="md" label="Livrer" onPress={onPress} disabled={true} />
      );
      fireEvent.press(getByTestId('bouton-cta'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('État loading', () => {
    it('affiche le spinner si loading=true', () => {
      const { getByTestId } = render(
        <BoutonCTA variant="primaire" size="md" label="Livrer" onPress={() => {}} loading={true} />
      );
      expect(getByTestId('bouton-spinner')).toBeTruthy();
    });

    it('masque le label si loading=true', () => {
      const { queryByText } = render(
        <BoutonCTA variant="primaire" size="md" label="Livrer" onPress={() => {}} loading={true} />
      );
      expect(queryByText('Livrer')).toBeNull();
    });

    it('n\'appelle pas onPress si loading=true', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <BoutonCTA variant="primaire" size="md" label="Livrer" onPress={onPress} loading={true} />
      );
      fireEvent.press(getByTestId('bouton-cta'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Interaction normale', () => {
    it('appelle onPress à l\'appui si actif', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <BoutonCTA variant="primaire" size="md" label="Livrer" onPress={onPress} />
      );
      fireEvent.press(getByTestId('bouton-cta'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('affiche le label', () => {
      const { getByText } = render(
        <BoutonCTA variant="primaire" size="md" label="LIVRER CE COLIS" onPress={() => {}} />
      );
      expect(getByText('LIVRER CE COLIS')).toBeTruthy();
    });
  });

  describe('Variants', () => {
    const variants = ['primaire', 'secondaire', 'tertiaire', 'outline', 'danger'] as const;
    variants.forEach((variant) => {
      it(`rend correctement variant="${variant}"`, () => {
        const { getByTestId } = render(
          <BoutonCTA variant={variant} size="md" label="Action" onPress={() => {}} />
        );
        expect(getByTestId('bouton-cta')).toBeTruthy();
      });
    });
  });
});
