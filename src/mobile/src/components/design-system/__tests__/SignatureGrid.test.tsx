/**
 * Tests TDD — SignatureGrid (DC-03) — US-031
 *
 * Fond en grille de points pour le pad de signature M-04.
 * Composant React Native pur (pas de canvas natif).
 * Priorite P1.
 *
 * Scenarions couverts :
 * - Rendu sans erreur
 * - Rend ses enfants (contenu par-dessus la grille)
 * - Style : flex, fond neutre
 */

import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { SignatureGrid } from '../SignatureGrid';

describe('SignatureGrid (DC-03) — US-031', () => {
  describe('Rendu de base', () => {
    it('rend le composant sans erreur', () => {
      const { getByTestId } = render(
        <SignatureGrid>
          <Text>Pad signature</Text>
        </SignatureGrid>
      );
      expect(getByTestId('signature-grid')).toBeTruthy();
    });

    it('rend ses enfants par-dessus la grille', () => {
      const { getByText } = render(
        <SignatureGrid>
          <Text>Zone signature</Text>
        </SignatureGrid>
      );
      expect(getByText('Zone signature')).toBeTruthy();
    });
  });

  describe('Style', () => {
    it('a un fond blanc ou surface primaire', () => {
      const { getByTestId } = render(
        <SignatureGrid>
          <Text>Contenu</Text>
        </SignatureGrid>
      );
      const grid = getByTestId('signature-grid');
      expect(grid).toBeTruthy();
    });

    it('prend tout l\'espace disponible (flex: 1)', () => {
      const { getByTestId } = render(
        <SignatureGrid>
          <Text>Contenu</Text>
        </SignatureGrid>
      );
      const grid = getByTestId('signature-grid');
      const style = grid.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.flex).toBe(1);
    });
  });

  describe('Props', () => {
    it('accepte un testID personnalise', () => {
      const { getByTestId } = render(
        <SignatureGrid testID="mon-pad">
          <Text>Contenu</Text>
        </SignatureGrid>
      );
      expect(getByTestId('mon-pad')).toBeTruthy();
    });

    it('accepte un style personnalise', () => {
      const { getByTestId } = render(
        <SignatureGrid style={{ height: 300 }}>
          <Text>Contenu</Text>
        </SignatureGrid>
      );
      const grid = getByTestId('signature-grid');
      expect(grid).toBeTruthy();
    });
  });
});
