import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import BandeauInstructionOverlay from '../components/BandeauInstructionOverlay';
import type { InstructionMobileDTO } from '../api/supervisionApi';

/**
 * Tests Jest — BandeauInstructionOverlay (US-016)
 * Composant M-06 : bandeau overlay notification instruction superviseur.
 */

const instructionPrioriser: InstructionMobileDTO = {
  instructionId: 'instr-001',
  tourneeId: 'tournee-001',
  colisId: 'colis-s-003',
  superviseurId: 'superviseur-001',
  typeInstruction: 'PRIORISER',
  statut: 'ENVOYEE',
  horodatage: '2026-03-24T10:30:00Z',
};

const instructionReprogrammer: InstructionMobileDTO = {
  instructionId: 'instr-002',
  tourneeId: 'tournee-001',
  colisId: 'colis-s-005',
  superviseurId: 'superviseur-001',
  typeInstruction: 'REPROGRAMMER',
  statut: 'ENVOYEE',
  creneauCible: '2026-03-24T14:00:00Z',
  horodatage: '2026-03-24T10:35:00Z',
};

describe('BandeauInstructionOverlay (US-016)', () => {
  it('affiche le titre et le message de l\'instruction', () => {
    const { getByTestId } = render(
      <BandeauInstructionOverlay
        instruction={instructionPrioriser}
        onVoir={jest.fn()}
        onFermer={jest.fn()}
        autoFermetureMs={60000}
      />
    );

    expect(getByTestId('bandeau-instruction-overlay')).toBeTruthy();
    expect(getByTestId('titre-instruction')).toBeTruthy();
    expect(getByTestId('message-instruction').props.children).toEqual(
      expect.arrayContaining(['Prioriser'])
    );
  });

  it('appelle onVoir avec le colisId quand Pierre appuie sur VOIR', () => {
    const onVoir = jest.fn();
    const { getByTestId } = render(
      <BandeauInstructionOverlay
        instruction={instructionPrioriser}
        onVoir={onVoir}
        onFermer={jest.fn()}
        autoFermetureMs={60000}
      />
    );

    fireEvent.press(getByTestId('bouton-voir-instruction'));
    expect(onVoir).toHaveBeenCalledWith('colis-s-003');
  });

  it('appelle onFermer quand Pierre appuie sur ×', () => {
    const onFermer = jest.fn();
    const { getByTestId } = render(
      <BandeauInstructionOverlay
        instruction={instructionPrioriser}
        onVoir={jest.fn()}
        onFermer={onFermer}
        autoFermetureMs={60000}
      />
    );

    fireEvent.press(getByTestId('bouton-fermer-bandeau'));
    expect(onFermer).toHaveBeenCalled();
  });

  it('ferme automatiquement après autoFermetureMs', () => {
    jest.useFakeTimers();
    const onFermer = jest.fn();
    render(
      <BandeauInstructionOverlay
        instruction={instructionPrioriser}
        onVoir={jest.fn()}
        onFermer={onFermer}
        autoFermetureMs={500}
      />
    );

    expect(onFermer).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(600);
    });
    expect(onFermer).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('affiche le bouton VOIR', () => {
    const { getByTestId } = render(
      <BandeauInstructionOverlay
        instruction={instructionReprogrammer}
        onVoir={jest.fn()}
        onFermer={jest.fn()}
        autoFermetureMs={60000}
      />
    );

    expect(getByTestId('bouton-voir-instruction')).toBeTruthy();
  });
});
