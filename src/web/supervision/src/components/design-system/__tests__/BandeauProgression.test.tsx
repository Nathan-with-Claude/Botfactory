/**
 * Tests TDD — BandeauProgression (US-025)
 *
 * Composant web affichant l'avancement d'une tournée.
 * Source design-system.md §3.3.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BandeauProgression } from '../BandeauProgression';

describe('BandeauProgression — US-025 §3.3', () => {

  const defaultProps = {
    resteLivrer: 7,
    total: 10,
    pourcentage: 30,
    statut: 'encours' as const,
    syncStatus: 'live' as const,
  };

  describe('Rendu de base', () => {
    it('affiche le compteur "Reste à livrer : X / Y"', () => {
      render(<BandeauProgression {...defaultProps} />);
      expect(screen.getByTestId('bandeau-compteur')).toBeInTheDocument();
      expect(screen.getByText(/7 \/ 10/)).toBeInTheDocument();
    });

    it('affiche la barre de progression', () => {
      render(<BandeauProgression {...defaultProps} />);
      expect(screen.getByTestId('bandeau-barre')).toBeInTheDocument();
    });

    it('affiche le pourcentage', () => {
      render(<BandeauProgression {...defaultProps} pourcentage={30} />);
      expect(screen.getByText(/30/)).toBeInTheDocument();
    });
  });

  describe('Statuts de la barre', () => {
    it('applique data-statut="encours" si statut=encours', () => {
      render(<BandeauProgression {...defaultProps} statut="encours" />);
      expect(screen.getByTestId('bandeau-barre')).toHaveAttribute('data-statut', 'encours');
    });

    it('applique data-statut="arisque" si statut=arisque', () => {
      render(<BandeauProgression {...defaultProps} statut="arisque" />);
      expect(screen.getByTestId('bandeau-barre')).toHaveAttribute('data-statut', 'arisque');
    });

    it('applique data-statut="cloturee" si statut=cloturee', () => {
      render(<BandeauProgression {...defaultProps} statut="cloturee" />);
      expect(screen.getByTestId('bandeau-barre')).toHaveAttribute('data-statut', 'cloturee');
    });
  });

  describe('Fin estimée', () => {
    it('n\'affiche pas "Fin estimée" si finEstimee est absent', () => {
      render(<BandeauProgression {...defaultProps} />);
      expect(screen.queryByTestId('bandeau-fin-estimee')).not.toBeInTheDocument();
    });

    it('affiche "Fin estimée : 14:30" si finEstimee fourni', () => {
      render(<BandeauProgression {...defaultProps} finEstimee="14:30" />);
      expect(screen.getByTestId('bandeau-fin-estimee')).toBeInTheDocument();
      expect(screen.getByText(/14:30/)).toBeInTheDocument();
    });
  });

  describe('IndicateurSync intégré', () => {
    it('affiche le statut syncStatus', () => {
      render(<BandeauProgression {...defaultProps} syncStatus="offline" />);
      expect(screen.getByTestId('indicateur-sync')).toBeInTheDocument();
    });
  });
});
