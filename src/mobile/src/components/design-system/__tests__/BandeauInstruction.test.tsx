/**
 * Tests TDD — BandeauInstruction (Mobile) (US-025)
 *
 * Overlay de notification instruction superviseur React Native (M-06).
 * Source design-system.md §3.7.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BandeauInstruction } from '../BandeauInstruction';

describe('BandeauInstruction (mobile) — US-025 §3.7', () => {

  const defaultProps = {
    instructionId: 'inst-001',
    texte: 'Prioriser le colis #00312',
    onVoir: jest.fn(),
    onOk: jest.fn(),
  };

  it('affiche le texte de l\'instruction', () => {
    const { getByText } = render(<BandeauInstruction {...defaultProps} />);
    expect(getByText('Prioriser le colis #00312')).toBeTruthy();
  });

  it('affiche le titre "INSTRUCTION SUPERVISEUR"', () => {
    const { getByText } = render(<BandeauInstruction {...defaultProps} />);
    expect(getByText(/INSTRUCTION SUPERVISEUR/)).toBeTruthy();
  });

  it('affiche l\'adresse si fournie', () => {
    const { getByTestId } = render(
      <BandeauInstruction {...defaultProps} adresse="25 Rue Victor Hugo" />
    );
    expect(getByTestId('bandeau-instruction-adresse')).toBeTruthy();
  });

  it('appelle onVoir au tap sur VOIR', () => {
    const onVoir = jest.fn();
    const { getByTestId } = render(
      <BandeauInstruction {...defaultProps} onVoir={onVoir} />
    );
    fireEvent.press(getByTestId('bandeau-instruction-voir'));
    expect(onVoir).toHaveBeenCalledTimes(1);
  });

  it('appelle onOk au tap sur OK', () => {
    const onOk = jest.fn();
    const { getByTestId } = render(
      <BandeauInstruction {...defaultProps} onOk={onOk} />
    );
    fireEvent.press(getByTestId('bandeau-instruction-ok'));
    expect(onOk).toHaveBeenCalledTimes(1);
  });

  it('affiche la barre countdown', () => {
    const { getByTestId } = render(<BandeauInstruction {...defaultProps} />);
    expect(getByTestId('bandeau-instruction-countdown')).toBeTruthy();
  });
});
