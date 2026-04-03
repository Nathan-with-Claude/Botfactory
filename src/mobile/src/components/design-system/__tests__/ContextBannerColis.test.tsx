/**
 * Tests TDD — ContextBannerColis (DC-04) — US-031
 *
 * Banniere contextuelle identifiant le colis en cours.
 * Utilisee sur M-04 (variant neutre) et M-05 (variant erreur).
 * Priorite P0.
 *
 * Scenarions couverts :
 * - Rendu colisId et destinataire
 * - Label "COLIS EN COURS" visible
 * - Variant neutre : bordure Colors.primaire
 * - Variant erreur : fond alerte
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { ContextBannerColis } from '../ContextBannerColis';

describe('ContextBannerColis (DC-04) — US-031', () => {
  const defaultProps = {
    colisId: 'C-042',
    destinataire: 'Jean Dupont',
    variant: 'neutre' as const,
  };

  describe('Rendu de base', () => {
    it('rend le composant sans erreur', () => {
      const { getByTestId } = render(<ContextBannerColis {...defaultProps} />);
      expect(getByTestId('context-banner-colis')).toBeTruthy();
    });

    it('affiche le colisId', () => {
      const { getByText } = render(<ContextBannerColis {...defaultProps} />);
      expect(getByText('C-042')).toBeTruthy();
    });

    it('affiche le nom du destinataire', () => {
      const { getByText } = render(<ContextBannerColis {...defaultProps} />);
      expect(getByText('Jean Dupont')).toBeTruthy();
    });

    it('affiche le label COLIS EN COURS', () => {
      const { getByTestId } = render(<ContextBannerColis {...defaultProps} />);
      expect(getByTestId('context-banner-label')).toBeTruthy();
    });
  });

  describe('Variant neutre (M-04)', () => {
    it('a une bordure gauche de couleur primaire', () => {
      const { getByTestId } = render(
        <ContextBannerColis {...defaultProps} variant="neutre" />
      );
      const banner = getByTestId('context-banner-colis');
      const style = banner.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.borderLeftColor).toBe('#1D4ED8');
      expect(flatStyle.borderLeftWidth).toBe(4);
    });
  });

  describe('Variant erreur (M-05)', () => {
    it('a une bordure gauche de couleur alerte', () => {
      const { getByTestId } = render(
        <ContextBannerColis {...defaultProps} variant="erreur" />
      );
      const banner = getByTestId('context-banner-colis');
      const style = banner.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.borderLeftColor).toBe('#DC2626');
    });
  });

  describe('Accessibilite', () => {
    it('a un accessibilityLabel lisible', () => {
      const { getByLabelText } = render(
        <ContextBannerColis {...defaultProps} />
      );
      expect(getByLabelText('Colis en cours C-042 pour Jean Dupont')).toBeTruthy();
    });
  });
});
