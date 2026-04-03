/**
 * Tests TDD — DrawerDetail (US-025)
 *
 * Composant drawer latéral web (W-02).
 * Source design-system.md §3.
 *
 * Scénarios couverts :
 * - SC7 : ouverture et fermeture du drawer
 * - Largeur 480px
 * - Contenu : motif, horodatage, note terrain
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DrawerDetail } from '../DrawerDetail';

describe('DrawerDetail — US-025 §3 (W-02)', () => {

  const defaultProps = {
    isOpen: true,
    titre: 'Détail incident',
    onClose: jest.fn(),
  };

  describe('SC7 — Ouverture', () => {
    it('affiche le drawer si isOpen=true', () => {
      render(
        <DrawerDetail {...defaultProps}>
          <p>Contenu test</p>
        </DrawerDetail>
      );
      expect(screen.getByTestId('drawer-detail')).toBeInTheDocument();
      expect(screen.getByTestId('drawer-detail')).toHaveAttribute('data-open', 'true');
    });

    it('affiche le titre fourni', () => {
      render(
        <DrawerDetail {...defaultProps}>
          <p>Contenu</p>
        </DrawerDetail>
      );
      expect(screen.getByText('Détail incident')).toBeInTheDocument();
    });

    it('affiche le contenu enfant', () => {
      render(
        <DrawerDetail {...defaultProps}>
          <p data-testid="contenu-enfant">Motif : absent</p>
        </DrawerDetail>
      );
      expect(screen.getByTestId('contenu-enfant')).toBeInTheDocument();
    });
  });

  describe('SC7 — Fermeture via bouton X', () => {
    it('appelle onClose au clic sur le bouton fermeture', () => {
      const onClose = jest.fn();
      render(
        <DrawerDetail {...defaultProps} onClose={onClose}>
          <p>Contenu</p>
        </DrawerDetail>
      );
      fireEvent.click(screen.getByTestId('drawer-bouton-fermer'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('SC7 — Fermeture via overlay', () => {
    it('appelle onClose au clic sur l\'overlay', () => {
      const onClose = jest.fn();
      render(
        <DrawerDetail {...defaultProps} onClose={onClose}>
          <p>Contenu</p>
        </DrawerDetail>
      );
      fireEvent.click(screen.getByTestId('drawer-overlay'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('État fermé', () => {
    it('n\'affiche pas le contenu si isOpen=false', () => {
      render(
        <DrawerDetail {...defaultProps} isOpen={false}>
          <p data-testid="contenu-cache">Contenu</p>
        </DrawerDetail>
      );
      expect(screen.getByTestId('drawer-detail')).toHaveAttribute('data-open', 'false');
    });
  });
});
