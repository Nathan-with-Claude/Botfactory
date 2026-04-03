/**
 * Tests TDD — BadgeStatut (Mobile) (US-025)
 *
 * Composant badge de statut pour React Native.
 * Source design-system.md §3.1.
 *
 * Scénarios couverts :
 * - SC3 : rendu avec variant="alerte" et label
 * - Rendu de tous les variants
 * - Point coloré affiché / masqué
 * - Tailles sm / md
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { BadgeStatut } from '../BadgeStatut';

describe('BadgeStatut (mobile) — US-025 §3.1', () => {

  describe('SC3 — rendu avec variant alerte', () => {
    it('affiche le label fourni', () => {
      const { getByText } = render(<BadgeStatut variant="alerte" label="ECHEC" />);
      expect(getByText('ECHEC')).toBeTruthy();
    });

    it('affiche le point coloré par défaut', () => {
      const { getByTestId } = render(<BadgeStatut variant="alerte" label="ECHEC" />);
      expect(getByTestId('badge-point')).toBeTruthy();
    });

    it('masque le point si icon=false', () => {
      const { queryByTestId } = render(<BadgeStatut variant="alerte" label="ECHEC" icon={false} />);
      expect(queryByTestId('badge-point')).toBeNull();
    });
  });

  describe('Tous les variants', () => {
    const variants = ['succes', 'alerte', 'avertissement', 'info', 'neutre'] as const;

    variants.forEach((variant) => {
      it(`rend correctement le variant "${variant}"`, () => {
        const { getByTestId } = render(
          <BadgeStatut variant={variant} label={variant.toUpperCase()} />
        );
        expect(getByTestId('badge-statut')).toBeTruthy();
      });
    });
  });

  describe('Tailles', () => {
    it('accepte size="sm" (défaut)', () => {
      const { getByTestId } = render(<BadgeStatut variant="info" label="A LIVRER" size="sm" />);
      expect(getByTestId('badge-statut')).toBeTruthy();
    });

    it('accepte size="md"', () => {
      const { getByTestId } = render(<BadgeStatut variant="info" label="A LIVRER" size="md" />);
      expect(getByTestId('badge-statut')).toBeTruthy();
    });
  });
});
