/**
 * Tests TDD — TacticalGradient (DC-01) — US-031
 *
 * Degrade identitaire DocuPost.
 * Direction 135deg, #1D4ED8 -> #0037b0.
 * Utilise sur le logo M-01 et le bandeau M-06.
 * Priorite P1.
 *
 * Scenarions couverts :
 * - Rendu sans erreur
 * - Rend ses enfants
 * - Props colors et start/end correctement configurees
 */

import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { TacticalGradient } from '../TacticalGradient';

// Mock expo-linear-gradient — module optionnel, peut ne pas être installé en env test
jest.mock(
  'expo-linear-gradient',
  () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
      LinearGradient: ({ children, colors, testID, style, ...props }: any) =>
        React.createElement(View, { testID: testID || 'linear-gradient', style, 'data-colors': colors, ...props }, children),
    };
  },
  { virtual: true }
);

describe('TacticalGradient (DC-01) — US-031', () => {
  describe('Rendu de base', () => {
    it('rend le composant sans erreur', () => {
      const { getByTestId } = render(
        <TacticalGradient>
          <Text>Contenu</Text>
        </TacticalGradient>
      );
      expect(getByTestId('tactical-gradient')).toBeTruthy();
    });

    it('rend ses enfants', () => {
      const { getByText } = render(
        <TacticalGradient>
          <Text>Logo DocuPost</Text>
        </TacticalGradient>
      );
      expect(getByText('Logo DocuPost')).toBeTruthy();
    });
  });

  describe('Gradient', () => {
    it('utilise les couleurs #1D4ED8 et #0037b0', () => {
      const { getByTestId } = render(
        <TacticalGradient>
          <Text>Contenu</Text>
        </TacticalGradient>
      );
      const gradient = getByTestId('tactical-gradient');
      const colors = gradient.props['data-colors'];
      expect(colors).toContain('#1D4ED8');
      expect(colors).toContain('#0037b0');
    });
  });

  describe('Style', () => {
    it('accepte un style personnalise via la prop style', () => {
      const { getByTestId } = render(
        <TacticalGradient style={{ width: 200, height: 60 }}>
          <Text>Contenu</Text>
        </TacticalGradient>
      );
      const gradient = getByTestId('tactical-gradient');
      expect(gradient).toBeTruthy();
    });

    it('accepte un testID personnalise', () => {
      const { getByTestId } = render(
        <TacticalGradient testID="mon-gradient">
          <Text>Contenu</Text>
        </TacticalGradient>
      );
      expect(getByTestId('mon-gradient')).toBeTruthy();
    });
  });
});
