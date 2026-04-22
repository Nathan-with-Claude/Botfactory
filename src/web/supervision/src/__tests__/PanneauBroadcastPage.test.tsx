/**
 * Tests TDD — PanneauBroadcastPage (US-069)
 *
 * Couvre :
 * - Rendu du formulaire : boutons type, textarea, bouton ENVOYER désactivé si incomplet
 * - Rendu de l'historique avec compteurs "Vu par N / M livreurs"
 * - Affichage état vide : "Aucun message envoyé aujourd'hui."
 * - Clic chevron → charge le détail nominatif
 * - Toast de confirmation après envoi réussi
 * - Mise à jour compteur via WebSocket simulé
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PanneauBroadcastPage, {
  BroadcastSummaryDTO,
  BroadcastStatutLivraisonDTO,
} from '../pages/PanneauBroadcastPage';

// ─── Helpers mock fetch ───────────────────────────────────────────────────────

function makeFetch(responses: Array<{ status: number; body?: unknown }>) {
  let callIndex = 0;
  return (_url: string, _init?: RequestInit) => {
    const r = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    return Promise.resolve({
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      json: () => Promise.resolve(r.body ?? {}),
    } as Response);
  };
}

// ─── Données de test ──────────────────────────────────────────────────────────

const summaries: BroadcastSummaryDTO[] = [
  {
    broadcastMessageId: 'bc-001',
    type: 'ALERTE',
    texte: 'Attention incident zone A — secteur nord',
    horodatageEnvoi: '2026-04-21T09:12:00Z',
    nombreDestinataires: 4,
    nombreVus: 2,
  },
  {
    broadcastMessageId: 'bc-002',
    type: 'INFO',
    texte: 'Réunion 14h30 en salle B',
    horodatageEnvoi: '2026-04-21T11:45:00Z',
    nombreDestinataires: 4,
    nombreVus: 4,
  },
  {
    broadcastMessageId: 'bc-003',
    type: 'CONSIGNE',
    texte: 'Port EPI obligatoire dès demain',
    horodatageEnvoi: '2026-04-21T14:03:00Z',
    nombreDestinataires: 2,
    nombreVus: 0,
  },
];

const detailStatuts: BroadcastStatutLivraisonDTO[] = [
  { livreurId: 'l-001', nomComplet: 'Pierre Morel', statut: 'VU', horodatageVu: '2026-04-21T09:14:00Z' },
  { livreurId: 'l-002', nomComplet: 'Paul Dupont', statut: 'VU', horodatageVu: '2026-04-21T09:15:00Z' },
  { livreurId: 'l-003', nomComplet: 'Marie Lambert', statut: 'ENVOYE', horodatageVu: null },
  { livreurId: 'l-004', nomComplet: 'Jean Moreau', statut: 'ENVOYE', horodatageVu: null },
];

// ─── Tests formulaire ─────────────────────────────────────────────────────────

describe('PanneauBroadcastPage — Formulaire (US-069)', () => {
  it('affiche les 3 boutons de type ALERTE / INFO / CONSIGNE', async () => {
    const fetchFn = makeFetch([{ status: 200, body: [] }, { status: 200, body: [] }]);
    render(<PanneauBroadcastPage fetchFn={fetchFn} />);

    await waitFor(() => {
      expect(screen.getByTestId('btn-type-ALERTE')).toBeInTheDocument();
      expect(screen.getByTestId('btn-type-INFO')).toBeInTheDocument();
      expect(screen.getByTestId('btn-type-CONSIGNE')).toBeInTheDocument();
    });
  });

  it('bouton ENVOYER désactivé si type non sélectionné et texte vide', async () => {
    const fetchFn = makeFetch([{ status: 200, body: [] }, { status: 200, body: [] }]);
    render(<PanneauBroadcastPage fetchFn={fetchFn} />);

    await waitFor(() => {
      const btn = screen.getByTestId('btn-envoyer-broadcast');
      expect(btn).toBeDisabled();
    });
  });

  it('bouton ENVOYER activé quand type sélectionné ET texte non vide', async () => {
    const fetchFn = makeFetch([{ status: 200, body: [] }, { status: 200, body: [] }]);
    render(<PanneauBroadcastPage fetchFn={fetchFn} />);

    await waitFor(() => screen.getByTestId('btn-type-ALERTE'));

    fireEvent.click(screen.getByTestId('btn-type-ALERTE'));
    fireEvent.change(screen.getByTestId('textarea-broadcast'), {
      target: { value: 'Attention accident sur zone B' },
    });

    expect(screen.getByTestId('btn-envoyer-broadcast')).not.toBeDisabled();
  });

  it('affiche le compteur de caractères X/280 (rouge si >250)', async () => {
    const fetchFn = makeFetch([{ status: 200, body: [] }, { status: 200, body: [] }]);
    render(<PanneauBroadcastPage fetchFn={fetchFn} />);

    await waitFor(() => screen.getByTestId('textarea-broadcast'));

    const texte251 = 'A'.repeat(251);
    fireEvent.change(screen.getByTestId('textarea-broadcast'), {
      target: { value: texte251 },
    });

    const compteur = screen.getByTestId('compteur-chars');
    expect(compteur).toHaveTextContent('251/280');
    expect(compteur).toHaveClass('text-red-600');
  });

  it('affiche le toast de confirmation après un envoi réussi', async () => {
    const postResponse = {
      broadcastMessageId: 'bc-new',
      nombreDestinataires: 3,
      horodatageEnvoi: '2026-04-21T15:00:00Z',
    };
    const fetchFn = makeFetch([
      { status: 200, body: [] },          // GET secteurs
      { status: 200, body: [] },          // GET historique
      { status: 201, body: postResponse }, // POST broadcast
      { status: 200, body: [] },          // GET historique après envoi
    ]);
    render(<PanneauBroadcastPage fetchFn={fetchFn} />);

    await waitFor(() => screen.getByTestId('btn-type-INFO'));

    fireEvent.click(screen.getByTestId('btn-type-INFO'));
    fireEvent.change(screen.getByTestId('textarea-broadcast'), {
      target: { value: 'Réunion de coordination' },
    });
    fireEvent.click(screen.getByTestId('btn-envoyer-broadcast'));

    await waitFor(() => {
      expect(screen.getByTestId('toast-broadcast-succes')).toBeInTheDocument();
    });
  });
});

// ─── Tests historique ─────────────────────────────────────────────────────────

describe('PanneauBroadcastPage — Historique (US-069)', () => {
  it('affiche "Aucun message envoyé aujourd\'hui." si liste vide', async () => {
    const fetchFn = makeFetch([{ status: 200, body: [] }, { status: 200, body: [] }]);
    render(<PanneauBroadcastPage fetchFn={fetchFn} />);

    await waitFor(() => {
      expect(screen.getByTestId('historique-vide')).toBeInTheDocument();
      expect(screen.getByTestId('historique-vide')).toHaveTextContent(
        'Aucun message envoyé aujourd\'hui.'
      );
    });
  });

  it('affiche les items avec badge, heure, texte tronqué et compteur Vu par N/M', async () => {
    const fetchFn = makeFetch([
      { status: 200, body: [] },          // GET secteurs
      { status: 200, body: summaries },   // GET historique
    ]);
    render(<PanneauBroadcastPage fetchFn={fetchFn} />);

    await waitFor(() => {
      expect(screen.getByTestId('item-broadcast-bc-001')).toBeInTheDocument();
      expect(screen.getByTestId('item-broadcast-bc-002')).toBeInTheDocument();
      expect(screen.getByTestId('item-broadcast-bc-003')).toBeInTheDocument();
    });

    // Compteurs corrects
    expect(screen.getByTestId('compteur-bc-001')).toHaveTextContent('Vu par 2 / 4');
    expect(screen.getByTestId('compteur-bc-002')).toHaveTextContent('Vu par 4 / 4');
    expect(screen.getByTestId('compteur-bc-003')).toHaveTextContent('Vu par 0 / 2');

    // Badges de type
    expect(screen.getByTestId('badge-bc-001')).toHaveTextContent('ALERTE');
    expect(screen.getByTestId('badge-bc-002')).toHaveTextContent('INFO');
    expect(screen.getByTestId('badge-bc-003')).toHaveTextContent('CONSIGNE');
  });

  it('affiche le détail nominatif après clic sur le chevron', async () => {
    const fetchFn = makeFetch([
      { status: 200, body: [] },            // GET secteurs
      { status: 200, body: summaries },     // GET historique
      { status: 200, body: detailStatuts }, // GET statuts bc-001
    ]);
    render(<PanneauBroadcastPage fetchFn={fetchFn} />);

    await waitFor(() => screen.getByTestId('chevron-bc-001'));

    fireEvent.click(screen.getByTestId('chevron-bc-001'));

    await waitFor(() => {
      expect(screen.getByTestId('detail-statuts-bc-001')).toBeInTheDocument();
      expect(screen.getByText('Pierre Morel')).toBeInTheDocument();
      expect(screen.getByText('Paul Dupont')).toBeInTheDocument();
      expect(screen.getByText('Marie Lambert')).toBeInTheDocument();
      expect(screen.getByText('Jean Moreau')).toBeInTheDocument();
    });
  });

  it('livreurs VU et EN ATTENTE sont visuellement distingués par data-statut', async () => {
    const fetchFn = makeFetch([
      { status: 200, body: [] },
      { status: 200, body: summaries },
      { status: 200, body: detailStatuts },
    ]);
    render(<PanneauBroadcastPage fetchFn={fetchFn} />);

    await waitFor(() => screen.getByTestId('chevron-bc-001'));
    fireEvent.click(screen.getByTestId('chevron-bc-001'));

    await waitFor(() => {
      expect(screen.getByTestId('statut-livreur-l-001')).toHaveAttribute('data-statut', 'VU');
      expect(screen.getByTestId('statut-livreur-l-003')).toHaveAttribute('data-statut', 'ENVOYE');
    });
  });

  it('met à jour le compteur Vu par N/M via mise à jour WebSocket simulée', async () => {
    const fetchFn = makeFetch([
      { status: 200, body: [] },
      { status: 200, body: summaries },
    ]);

    let wsUpdateCallback: ((update: { broadcastMessageId: string; nombreVus: number; nombreTotal: number }) => void) | null = null;

    render(
      <PanneauBroadcastPage
        fetchFn={fetchFn}
        onWsSubscribe={(cb) => { wsUpdateCallback = cb; }}
      />
    );

    await waitFor(() => screen.getByTestId('compteur-bc-003'));
    expect(screen.getByTestId('compteur-bc-003')).toHaveTextContent('Vu par 0 / 2');

    // Simuler un message WebSocket : Pierre Morel a vu la CONSIGNE
    wsUpdateCallback!({ broadcastMessageId: 'bc-003', nombreVus: 1, nombreTotal: 2 });

    await waitFor(() => {
      expect(screen.getByTestId('compteur-bc-003')).toHaveTextContent('Vu par 1 / 2');
    });
  });
});
