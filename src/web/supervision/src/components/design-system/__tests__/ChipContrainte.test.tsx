/**
 * Tests TDD — ChipContrainte (US-025)
 *
 * Composant chip pour les contraintes colis (web).
 * Source design-system.md §3.5.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChipContrainte } from '../ChipContrainte';

describe('ChipContrainte — US-025 §3.5', () => {

  describe('Types de contraintes', () => {
    it('affiche une contrainte horaire avec la valeur', () => {
      render(<ChipContrainte type="horaire" valeur="14h00" />);
      expect(screen.getByTestId('chip-contrainte')).toBeInTheDocument();
      expect(screen.getByText(/14h00/)).toBeInTheDocument();
    });

    it('affiche une contrainte fragile', () => {
      render(<ChipContrainte type="fragile" />);
      expect(screen.getByTestId('chip-contrainte')).toBeInTheDocument();
      expect(screen.getByText(/Fragile/i)).toBeInTheDocument();
    });

    it('affiche une contrainte document_sensible', () => {
      render(<ChipContrainte type="document_sensible" />);
      expect(screen.getByTestId('chip-contrainte')).toBeInTheDocument();
      expect(screen.getByText(/Document sensible/i)).toBeInTheDocument();
    });
  });

  describe('Attributs de type', () => {
    it('expose data-type pour le CSS', () => {
      render(<ChipContrainte type="horaire" valeur="10h00" />);
      expect(screen.getByTestId('chip-contrainte')).toHaveAttribute('data-type', 'horaire');
    });

    it('expose data-type fragile', () => {
      render(<ChipContrainte type="fragile" />);
      expect(screen.getByTestId('chip-contrainte')).toHaveAttribute('data-type', 'fragile');
    });
  });
});
