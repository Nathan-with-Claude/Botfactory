/**
 * Tests TDD — CardTypePreuve (Mobile) (US-025)
 *
 * Sélecteur de type de preuve React Native (M-04).
 * Source design-system.md §6 (sélecteurs).
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CardTypePreuve } from '../CardTypePreuve';

describe('CardTypePreuve (mobile) — US-025 §6 (M-04)', () => {

  it('affiche le label', () => {
    const { getByText } = render(
      <CardTypePreuve type="SIGNATURE" label="Signature" selected={false} onSelect={() => {}} />
    );
    expect(getByText('Signature')).toBeTruthy();
  });

  it('appelle onSelect avec le type à l\'appui', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <CardTypePreuve type="SIGNATURE" label="Signature" selected={false} onSelect={onSelect} />
    );
    fireEvent.press(getByTestId('card-type-preuve'));
    expect(onSelect).toHaveBeenCalledWith('SIGNATURE');
  });

  it('expose testID card-type-preuve', () => {
    const { getByTestId } = render(
      <CardTypePreuve type="PHOTO" label="Photo" selected={true} onSelect={() => {}} />
    );
    expect(getByTestId('card-type-preuve')).toBeTruthy();
  });
});
