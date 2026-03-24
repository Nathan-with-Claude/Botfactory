import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import DetailTourneePage from '../pages/DetailTourneePage';
import type { MockWebSocket } from '../pages/TableauDeBordPage';

/**
 * Tests Jest — DetailTourneePage (US-012)
 * Écran W-02 : détail d'une tournée superviseur.
 */

const mockDetail = {
  tournee: {
    tourneeId: 'tournee-sup-001',
    livreurNom: 'Pierre Martin',
    colisTraites: 3,
    colisTotal: 10,
    pourcentage: 30,
    statut: 'EN_COURS' as const,
    derniereActivite: '2026-03-24T10:00:00Z',
  },
  colis: [
    {
      colisId: 'colis-s-001',
      adresse: '12 rue de la Paix, Paris',
      statut: 'LIVRE',
      horodatageTraitement: '2026-03-24T09:00:00Z',
    },
    {
      colisId: 'colis-s-002',
      adresse: '5 avenue Victor Hugo, Paris',
      statut: 'ECHEC',
      motifEchec: 'ABSENT',
      horodatageTraitement: '2026-03-24T09:30:00Z',
    },
    {
      colisId: 'colis-s-003',
      adresse: '27 boulevard Haussmann, Paris',
      statut: 'A_LIVRER',
    },
  ],
  incidents: [
    {
      colisId: 'colis-s-002',
      adresse: '5 avenue Victor Hugo, Paris',
      motif: 'ABSENT',
      horodatage: '2026-03-24T09:30:00Z',
      note: 'Sonnette hors service',
    },
  ],
};

function makeFetch(status: number, body: unknown) {
  return () =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    } as Response);
}

function makeWsFactory() {
  let ws: MockWebSocket;
  const factory = (_url: string) => {
    ws = {
      onmessage: null,
      onopen: null,
      onclose: null,
      onerror: null,
      close: jest.fn(),
    };
    return ws;
  };
  (factory as typeof factory & { getWs: () => MockWebSocket }).getWs = () => ws;
  return factory as typeof factory & { getWs: () => MockWebSocket };
}

describe('DetailTourneePage (US-012)', () => {
  it('affiche le bandeau avancement et les onglets après chargement', async () => {
    render(
      <DetailTourneePage
        tourneeId="tournee-sup-001"
        fetchFn={makeFetch(200, mockDetail)}
      />
    );

    await waitFor(() =>
      expect(screen.getByTestId('bandeau-avancement')).toBeInTheDocument()
    );

    expect(screen.getByText(/Pierre Martin/)).toBeInTheDocument();
    expect(screen.getByText(/3 \/ 10 colis/)).toBeInTheDocument();
    expect(screen.getByTestId('onglet-colis')).toBeInTheDocument();
    expect(screen.getByTestId('onglet-incidents')).toBeInTheDocument();
  });

  it('affiche la liste des colis avec badges et bouton Instructionner uniquement pour A_LIVRER', async () => {
    const onInstructionner = jest.fn();
    render(
      <DetailTourneePage
        tourneeId="tournee-sup-001"
        fetchFn={makeFetch(200, mockDetail)}
        onInstructionner={onInstructionner}
      />
    );

    await waitFor(() => screen.getByTestId('liste-colis'));

    expect(screen.getByTestId('badge-colis-colis-s-001')).toHaveTextContent('LIVRE');
    expect(screen.getByTestId('badge-colis-colis-s-002')).toHaveTextContent('ECHEC');
    expect(screen.getByTestId('badge-colis-colis-s-003')).toHaveTextContent('A_LIVRER');

    // Bouton Instructionner uniquement pour A_LIVRER
    expect(screen.queryByTestId('btn-instructionner-colis-s-001')).not.toBeInTheDocument();
    expect(screen.queryByTestId('btn-instructionner-colis-s-002')).not.toBeInTheDocument();
    expect(screen.getByTestId('btn-instructionner-colis-s-003')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('btn-instructionner-colis-s-003'));
    expect(onInstructionner).toHaveBeenCalledWith('colis-s-003');
  });

  it('affiche les incidents dans l\'onglet Incidents', async () => {
    render(
      <DetailTourneePage
        tourneeId="tournee-sup-001"
        fetchFn={makeFetch(200, mockDetail)}
      />
    );

    await waitFor(() => screen.getByTestId('onglet-incidents'));
    fireEvent.click(screen.getByTestId('onglet-incidents'));

    await waitFor(() => screen.getByTestId('liste-incidents'));
    expect(screen.getByTestId('incident-colis-s-002')).toBeInTheDocument();
    expect(screen.getByText('ABSENT')).toBeInTheDocument();
    expect(screen.getByText('Sonnette hors service')).toBeInTheDocument();
  });

  it('affiche 404 si tournée introuvable', async () => {
    render(
      <DetailTourneePage
        tourneeId="t-inconnu"
        fetchFn={makeFetch(404, {})}
      />
    );

    await waitFor(() => screen.getByTestId('message-erreur'));
    expect(screen.getByTestId('message-erreur')).toHaveTextContent('introuvable');
  });

  it('n\'affiche pas le bouton Instructionner si tournée clôturée', async () => {
    const detailCloture = {
      ...mockDetail,
      tournee: { ...mockDetail.tournee, statut: 'CLOTUREE' as const },
    };
    const onInstructionner = jest.fn();
    render(
      <DetailTourneePage
        tourneeId="tournee-sup-001"
        fetchFn={makeFetch(200, detailCloture)}
        onInstructionner={onInstructionner}
      />
    );

    await waitFor(() => screen.getByTestId('liste-colis'));
    expect(screen.queryByTestId('btn-instructionner-colis-s-003')).not.toBeInTheDocument();
  });

  it('appelle onRetour si le bouton retour est cliqué', async () => {
    const onRetour = jest.fn();
    render(
      <DetailTourneePage
        tourneeId="tournee-sup-001"
        fetchFn={makeFetch(200, mockDetail)}
        onRetour={onRetour}
      />
    );

    await waitFor(() => screen.getByTestId('btn-retour'));
    fireEvent.click(screen.getByTestId('btn-retour'));
    expect(onRetour).toHaveBeenCalled();
  });

  it('rafraîchit le détail lors d\'un message WebSocket', async () => {
    const wsFactory = makeWsFactory();
    let callCount = 0;
    const fetchFn = () => {
      callCount++;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDetail),
      } as Response);
    };

    render(
      <DetailTourneePage
        tourneeId="tournee-sup-001"
        fetchFn={fetchFn}
        wsFactory={wsFactory}
      />
    );

    await waitFor(() => screen.getByTestId('bandeau-avancement'));
    const before = callCount;

    await act(async () => {
      wsFactory.getWs().onmessage?.({ data: '{}' });
    });

    await waitFor(() => expect(callCount).toBeGreaterThan(before));
  });
});
