/**
 * Tests TDD — ChipContrainte (Mobile) (US-025)
 *
 * Composant chip de contrainte React Native.
 * Source design-system.md §3.5.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { ChipContrainte } from '../ChipContrainte';

describe('ChipContrainte (mobile) — US-025 §3.5', () => {

  it('affiche une contrainte horaire avec la valeur', () => {
    const { getByText, getByTestId } = render(<ChipContrainte type="horaire" valeur="14h00" />);
    expect(getByTestId('chip-contrainte')).toBeTruthy();
    expect(getByText(/14h00/)).toBeTruthy();
  });

  it('affiche une contrainte fragile', () => {
    const { getByText, getByTestId } = render(<ChipContrainte type="fragile" />);
    expect(getByTestId('chip-contrainte')).toBeTruthy();
    expect(getByText(/Fragile/i)).toBeTruthy();
  });

  it('affiche une contrainte document_sensible', () => {
    const { getByText } = render(<ChipContrainte type="document_sensible" />);
    expect(getByText(/Document sensible/i)).toBeTruthy();
  });
});
