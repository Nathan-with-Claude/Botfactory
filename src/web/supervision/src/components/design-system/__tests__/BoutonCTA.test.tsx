/**
 * Tests TDD — BoutonCTA (US-025)
 *
 * Composant bouton d'action web.
 * Source design-system.md §3.4 et §6 (états interactifs).
 *
 * Scénarios couverts :
 * - SC4 : état désactivé (disabled=true)
 * - Rendu avec tous les variants
 * - État loading : spinner affiché, label masqué
 * - Événement onPress déclenché si actif
 * - aria-disabled présent si disabled
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoutonCTA } from '../BoutonCTA';

describe('BoutonCTA — US-025 §3.4', () => {

  describe('SC4 — état désactivé', () => {
    it('n\'appelle pas onPress si disabled=true', () => {
      const onPress = jest.fn();
      render(
        <BoutonCTA variant="primaire" size="md" label="Livrer" onPress={onPress} disabled={true} />
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('a l\'attribut aria-disabled si disabled=true', () => {
      render(
        <BoutonCTA variant="primaire" size="md" label="Livrer" onPress={() => {}} disabled={true} />
      );
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('n\'a pas aria-disabled si disabled=false', () => {
      render(
        <BoutonCTA variant="primaire" size="md" label="Livrer" onPress={() => {}} disabled={false} />
      );
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Variants', () => {
    const variants = ['primaire', 'secondaire', 'tertiaire', 'outline', 'danger'] as const;

    variants.forEach((variant) => {
      it(`rend le bouton avec variant="${variant}"`, () => {
        render(<BoutonCTA variant={variant} size="md" label="Action" onPress={() => {}} />);
        expect(screen.getByTestId('bouton-cta')).toHaveAttribute('data-variant', variant);
      });
    });
  });

  describe('État loading', () => {
    it('affiche le spinner si loading=true', () => {
      render(
        <BoutonCTA variant="primaire" size="md" label="Livrer" onPress={() => {}} loading={true} />
      );
      expect(screen.getByTestId('bouton-spinner')).toBeInTheDocument();
    });

    it('masque le label si loading=true', () => {
      render(
        <BoutonCTA variant="primaire" size="md" label="Livrer" onPress={() => {}} loading={true} />
      );
      expect(screen.queryByText('Livrer')).not.toBeInTheDocument();
    });

    it('n\'appelle pas onPress si loading=true', () => {
      const onPress = jest.fn();
      render(
        <BoutonCTA variant="primaire" size="md" label="Livrer" onPress={onPress} loading={true} />
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Interaction normale', () => {
    it('appelle onPress au clic si actif', () => {
      const onPress = jest.fn();
      render(
        <BoutonCTA variant="primaire" size="md" label="Livrer" onPress={onPress} />
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('affiche le label', () => {
      render(
        <BoutonCTA variant="primaire" size="md" label="LIVRER CE COLIS" onPress={() => {}} />
      );
      expect(screen.getByText('LIVRER CE COLIS')).toBeInTheDocument();
    });
  });

  describe('Tailles', () => {
    ['sm', 'md', 'lg'].forEach((size) => {
      it(`rend correctement avec size="${size}"`, () => {
        render(
          <BoutonCTA variant="primaire" size={size as 'sm' | 'md' | 'lg'} label="Action" onPress={() => {}} />
        );
        expect(screen.getByTestId('bouton-cta')).toHaveAttribute('data-size', size);
      });
    });
  });
});
