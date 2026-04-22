import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import MessagesSuperviseursScreen from '../screens/MessagesSuperviseursScreen';

/**
 * Tests Jest — MessagesSuperviseursScreen (US-068)
 * Écran M-08 : liste des messages broadcast reçus du superviseur.
 */

// Mock fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch;

const BROADCASTS_SAMPLE = [
  {
    broadcastMessageId: 'bc-001',
    type: 'ALERTE',
    texte: 'Zone inondée secteur Nord',
    superviseurId: 'sup-001',
    horodatageEnvoi: '2026-04-21T08:00:00Z',
    vu: false,
  },
  {
    broadcastMessageId: 'bc-002',
    type: 'INFO',
    texte: 'Réunion 18h30 au dépôt',
    superviseurId: 'sup-001',
    horodatageEnvoi: '2026-04-21T09:00:00Z',
    vu: true,
  },
  {
    broadcastMessageId: 'bc-003',
    type: 'CONSIGNE',
    texte: 'Prioriser les colis fragiles',
    superviseurId: 'sup-001',
    horodatageEnvoi: '2026-04-21T10:00:00Z',
    vu: false,
  },
];

beforeEach(() => {
  mockFetch.mockReset();
});

describe('MessagesSuperviseursScreen (US-068)', () => {
  it('affiche l\'état vide si la liste est vide', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { getByTestId } = render(
      <MessagesSuperviseursScreen onRetour={jest.fn()} />
    );

    await waitFor(() => {
      expect(getByTestId('messages-vide')).toBeTruthy();
    });
  });

  it('affiche 3 messages avec badges corrects', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => BROADCASTS_SAMPLE,
    });

    const { getByTestId } = render(
      <MessagesSuperviseursScreen onRetour={jest.fn()} />
    );

    await waitFor(() => {
      expect(getByTestId('message-bc-001')).toBeTruthy();
      expect(getByTestId('message-bc-002')).toBeTruthy();
      expect(getByTestId('message-bc-003')).toBeTruthy();
    });
  });

  it('appelle POST /vu pour chaque message non lu au mount', async () => {
    // Premier appel : GET /recus — retourne 3 messages dont 2 non lus
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => BROADCASTS_SAMPLE,
    });

    render(<MessagesSuperviseursScreen onRetour={jest.fn()} />);

    await waitFor(() => {
      // 1 appel GET + 2 appels POST (bc-001 et bc-003, les non-lus)
      const postCalls = mockFetch.mock.calls.filter(
        ([url, opts]: [string, RequestInit | undefined]) =>
          typeof url === 'string' &&
          url.includes('/vu') &&
          opts?.method === 'POST'
      );
      expect(postCalls).toHaveLength(2);

      const urls = postCalls.map(([url]: [string]) => url);
      expect(urls.some((u: string) => u.includes('bc-001'))).toBe(true);
      expect(urls.some((u: string) => u.includes('bc-003'))).toBe(true);
    });
  });

  it('affiche le bandeau hors connexion si fetch échoue', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { getByTestId } = render(
      <MessagesSuperviseursScreen onRetour={jest.fn()} />
    );

    await waitFor(() => {
      expect(getByTestId('bandeau-offline-messages')).toBeTruthy();
    });
  });
});
