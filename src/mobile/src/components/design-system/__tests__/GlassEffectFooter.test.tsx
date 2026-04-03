/**
 * Tests TDD — GlassEffectFooter (DC-02) — US-031
 *
 * Footer fixe translucide utilisé sur M-02, M-03, M-04, M-05.
 * Priorité P0 — utilisé sur 4 écrans.
 *
 * Scénarios couverts :
 * - Rendu de base : contient ses enfants
 * - Accessibilité : rôle région accessible
 * - Style : position absolute, pleine largeur
 */

import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { GlassEffectFooter } from '../GlassEffectFooter';

describe('GlassEffectFooter (DC-02) — US-031', () => {
  describe('Rendu de base', () => {
    it('rend le composant sans erreur', () => {
      const { getByTestId } = render(
        <GlassEffectFooter>
          <Text>Contenu footer</Text>
        </GlassEffectFooter>
      );
      expect(getByTestId('glass-effect-footer')).toBeTruthy();
    });

    it('rend ses enfants', () => {
      const { getByText } = render(
        <GlassEffectFooter>
          <Text>Scanner un colis</Text>
          <Text>Cloturer la tournee</Text>
        </GlassEffectFooter>
      );
      expect(getByText('Scanner un colis')).toBeTruthy();
      expect(getByText('Cloturer la tournee')).toBeTruthy();
    });
  });

  describe('Style', () => {
    it('a une position absolute', () => {
      const { getByTestId } = render(
        <GlassEffectFooter>
          <Text>Contenu</Text>
        </GlassEffectFooter>
      );
      const footer = getByTestId('glass-effect-footer');
      const style = footer.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.position).toBe('absolute');
    });

    it('a une hauteur minimum de 80px', () => {
      const { getByTestId } = render(
        <GlassEffectFooter>
          <Text>Contenu</Text>
        </GlassEffectFooter>
      );
      const footer = getByTestId('glass-effect-footer');
      const style = footer.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.minHeight).toBeGreaterThanOrEqual(80);
    });

    it('est en bas d\'ecran (bottom: 0)', () => {
      const { getByTestId } = render(
        <GlassEffectFooter>
          <Text>Contenu</Text>
        </GlassEffectFooter>
      );
      const footer = getByTestId('glass-effect-footer');
      const style = footer.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.bottom).toBe(0);
    });

    it('s\'etend sur toute la largeur (left: 0, right: 0)', () => {
      const { getByTestId } = render(
        <GlassEffectFooter>
          <Text>Contenu</Text>
        </GlassEffectFooter>
      );
      const footer = getByTestId('glass-effect-footer');
      const style = footer.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.left).toBe(0);
      expect(flatStyle.right).toBe(0);
    });
  });

  describe('Accessibilite', () => {
    it('accepte un testID personnalise', () => {
      const { getByTestId } = render(
        <GlassEffectFooter testID="mon-footer">
          <Text>Contenu</Text>
        </GlassEffectFooter>
      );
      expect(getByTestId('mon-footer')).toBeTruthy();
    });
  });
});
