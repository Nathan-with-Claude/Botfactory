/**
 * Tests TDD — BadgeStatut (US-025)
 *
 * Composant web affichant le statut d'un colis ou d'une tournée.
 * Source design-system.md §3.1.
 *
 * Scénarios couverts :
 * - SC3 : rendu d'un badge avec variant="alerte" et label
 * - Rendu avec tous les variants
 * - Comportement pulse (animation)
 * - Tailles sm / md
 * - Point coloré (icon=true par défaut)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BadgeStatut } from '../BadgeStatut';

describe('BadgeStatut — US-025 §3.1', () => {

  describe('SC3 — rendu avec variant alerte', () => {
    it('affiche le label fourni', () => {
      render(<BadgeStatut variant="alerte" label="ECHEC" />);
      expect(screen.getByText('ECHEC')).toBeInTheDocument();
    });

    it('affiche le point coloré par défaut (icon omis = true)', () => {
      render(<BadgeStatut variant="alerte" label="ECHEC" />);
      expect(screen.getByTestId('badge-point')).toBeInTheDocument();
    });

    it('masque le point coloré si icon=false', () => {
      render(<BadgeStatut variant="alerte" label="ECHEC" icon={false} />);
      expect(screen.queryByTestId('badge-point')).not.toBeInTheDocument();
    });
  });

  describe('Variants visuels', () => {
    const variants = ['succes', 'alerte', 'avertissement', 'info', 'neutre'] as const;

    variants.forEach((variant) => {
      it(`rend le badge avec variant="${variant}"`, () => {
        render(<BadgeStatut variant={variant} label={variant.toUpperCase()} />);
        const badge = screen.getByTestId('badge-statut');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveAttribute('data-variant', variant);
      });
    });
  });

  describe('Tailles', () => {
    it('applique la classe taille "sm" par défaut', () => {
      render(<BadgeStatut variant="info" label="A LIVRER" />);
      expect(screen.getByTestId('badge-statut')).toHaveAttribute('data-size', 'sm');
    });

    it('applique la classe taille "md" si size="md"', () => {
      render(<BadgeStatut variant="info" label="A LIVRER" size="md" />);
      expect(screen.getByTestId('badge-statut')).toHaveAttribute('data-size', 'md');
    });
  });

  describe('Animation pulse', () => {
    it('n\'applique pas la classe pulse par défaut', () => {
      render(<BadgeStatut variant="alerte" label="A RISQUE" />);
      const badge = screen.getByTestId('badge-statut');
      expect(badge).not.toHaveClass('pulse-live');
    });

    it('applique la classe pulse-live si pulse=true', () => {
      render(<BadgeStatut variant="alerte" label="A RISQUE" pulse={true} />);
      expect(screen.getByTestId('badge-point')).toHaveClass('pulse-live');
    });
  });
});
