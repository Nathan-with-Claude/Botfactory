/**
 * Tests TDD — CardTypeInstruction (US-025)
 *
 * Sélecteur de type d'instruction pour W-03.
 * Source design-system.md §6 (sélecteurs).
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardTypeInstruction } from '../CardTypeInstruction';

describe('CardTypeInstruction — US-025 §6 (W-03)', () => {

  describe('Rendu de base', () => {
    it('affiche le label de l\'instruction', () => {
      render(
        <CardTypeInstruction
          type="PRIORITE"
          label="Prioriser ce colis"
          selected={false}
          onSelect={() => {}}
        />
      );
      expect(screen.getByText('Prioriser ce colis')).toBeInTheDocument();
    });
  });

  describe('État sélectionné', () => {
    it('expose data-selected=true si selected=true', () => {
      render(
        <CardTypeInstruction
          type="PRIORITE"
          label="Prioriser ce colis"
          selected={true}
          onSelect={() => {}}
        />
      );
      expect(screen.getByTestId('card-type-instruction')).toHaveAttribute('data-selected', 'true');
    });

    it('expose data-selected=false si selected=false', () => {
      render(
        <CardTypeInstruction
          type="PRIORITE"
          label="Prioriser ce colis"
          selected={false}
          onSelect={() => {}}
        />
      );
      expect(screen.getByTestId('card-type-instruction')).toHaveAttribute('data-selected', 'false');
    });
  });

  describe('Interaction', () => {
    it('appelle onSelect au clic', () => {
      const onSelect = jest.fn();
      render(
        <CardTypeInstruction
          type="PRIORITE"
          label="Prioriser ce colis"
          selected={false}
          onSelect={onSelect}
        />
      );
      fireEvent.click(screen.getByTestId('card-type-instruction'));
      expect(onSelect).toHaveBeenCalledWith('PRIORITE');
    });
  });
});
