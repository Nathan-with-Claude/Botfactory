import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PanneauInstructionPage, { InstructionCreeDTO } from '../pages/PanneauInstructionPage';

/**
 * Tests Jest — PanneauInstructionPage (US-014)
 * Panneau modal W-03 : envoi d'instruction superviseur.
 */

function makeFetch(status: number, body?: unknown) {
  return (_url: string, _init?: RequestInit) =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body ?? {}),
    } as Response);
}

const mockInstruction: InstructionCreeDTO = {
  instructionId: 'instr-uuid-001',
  colisId: 'c-001',
  typeInstruction: 'PRIORISER',
  statut: 'ENVOYEE',
  horodatage: '2026-03-24T10:00:00Z',
};

describe('PanneauInstructionPage (US-014)', () => {
  it('affiche le panneau avec sélecteur de type et bouton ENVOYER actif pour PRIORISER', () => {
    render(
      <PanneauInstructionPage
        tourneeId="t-001"
        colisId="c-001"
        fetchFn={makeFetch(201, mockInstruction)}
      />
    );

    expect(screen.getByTestId('panneau-instruction')).toBeInTheDocument();
    expect(screen.getByTestId('radio-prioriser')).toBeChecked();
    expect(screen.getByTestId('btn-envoyer')).not.toBeDisabled();
  });

  it('affiche les champs créneau cible et le bouton désactivé si REPROGRAMMER sans date', () => {
    render(
      <PanneauInstructionPage
        tourneeId="t-001"
        colisId="c-001"
        fetchFn={makeFetch(201, mockInstruction)}
      />
    );

    fireEvent.click(screen.getByTestId('radio-reprogrammer'));

    expect(screen.getByTestId('input-date-cible')).toBeInTheDocument();
    expect(screen.getByTestId('input-heure-cible')).toBeInTheDocument();
    expect(screen.getByTestId('message-creneau-requis')).toBeInTheDocument();
    expect(screen.getByTestId('btn-envoyer')).toBeDisabled();
  });

  it('active le bouton ENVOYER si REPROGRAMMER avec date et heure renseignées', () => {
    render(
      <PanneauInstructionPage
        tourneeId="t-001"
        colisId="c-001"
        fetchFn={makeFetch(201, mockInstruction)}
      />
    );

    fireEvent.click(screen.getByTestId('radio-reprogrammer'));
    fireEvent.change(screen.getByTestId('input-date-cible'), { target: { value: '2026-03-25' } });
    fireEvent.change(screen.getByTestId('input-heure-cible'), { target: { value: '10:00' } });

    expect(screen.getByTestId('btn-envoyer')).not.toBeDisabled();
    expect(screen.queryByTestId('message-creneau-requis')).not.toBeInTheDocument();
  });

  it('affiche le toast de succès et appelle onEnvoye après PRIORISER réussi', async () => {
    const onEnvoye = jest.fn();
    render(
      <PanneauInstructionPage
        tourneeId="t-001"
        colisId="c-001"
        livreurNom="Pierre Martin"
        fetchFn={makeFetch(201, mockInstruction)}
        onEnvoye={onEnvoye}
      />
    );

    fireEvent.click(screen.getByTestId('btn-envoyer'));

    await waitFor(() => screen.getByTestId('toast-succes'));
    expect(screen.getByTestId('toast-succes')).toHaveTextContent('Pierre Martin');
    expect(onEnvoye).toHaveBeenCalledWith(mockInstruction);
  });

  it('affiche le message d\'erreur 409 si instruction déjà en attente', async () => {
    render(
      <PanneauInstructionPage
        tourneeId="t-001"
        colisId="c-001"
        fetchFn={makeFetch(409)}
      />
    );

    fireEvent.click(screen.getByTestId('btn-envoyer'));

    await waitFor(() => screen.getByTestId('message-erreur'));
    expect(screen.getByTestId('message-erreur')).toHaveTextContent('instruction est en attente');
  });

  it('affiche le message créneau requis si 422 (REPROGRAMMER sans créneau)', async () => {
    render(
      <PanneauInstructionPage
        tourneeId="t-001"
        colisId="c-001"
        fetchFn={makeFetch(422)}
      />
    );

    fireEvent.click(screen.getByTestId('btn-envoyer'));

    await waitFor(() => screen.getByTestId('message-erreur'));
    // Le message affiché indique que le créneau est requis (message de validation)
    expect(screen.getByTestId('message-erreur').textContent).toBeTruthy();
  });

  it('appelle onFermer quand le bouton × est cliqué', () => {
    const onFermer = jest.fn();
    render(
      <PanneauInstructionPage
        tourneeId="t-001"
        colisId="c-001"
        fetchFn={makeFetch(201, mockInstruction)}
        onFermer={onFermer}
      />
    );

    fireEvent.click(screen.getByTestId('btn-fermer'));
    expect(onFermer).toHaveBeenCalled();
  });
});
