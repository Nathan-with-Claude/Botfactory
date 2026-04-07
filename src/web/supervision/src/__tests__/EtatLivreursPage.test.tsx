import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import EtatLivreursPage from '../pages/EtatLivreursPage';

/**
 * Tests TDD — EtatLivreursPage (US-066)
 *
 * Convention de test Tailwind (jsdom ne charge pas les feuilles de style) :
 * - Vérifier les classes Tailwind via toHaveClass()
 * - Vérifier les états métier via data-* attributes
 * - Ne jamais utiliser toHaveStyle() pour des couleurs Tailwind
 */

// ─── Données de test ──────────────────────────────────────────────────────────

const LIVREURS_MIXTES = [
  {
    livreurId: 'livreur-paul-dupont',
    nomComplet: 'Paul Dupont',
    etat: 'EN_COURS' as const,
    tourneePlanifieeId: 'tp-204',
    codeTms: 'T-204',
  },
  {
    livreurId: 'livreur-pierre-martin',
    nomComplet: 'Pierre Martin',
    etat: 'AFFECTE_NON_LANCE' as const,
    tourneePlanifieeId: 'tp-201',
    codeTms: 'T-201',
  },
  {
    livreurId: 'livreur-marie-lambert',
    nomComplet: 'Marie Lambert',
    etat: 'AFFECTE_NON_LANCE' as const,
    tourneePlanifieeId: 'tp-202',
    codeTms: 'T-202',
  },
  {
    livreurId: 'livreur-sophie-bernard',
    nomComplet: 'Sophie Bernard',
    etat: 'AFFECTE_NON_LANCE' as const,
    tourneePlanifieeId: 'tp-205',
    codeTms: 'T-205',
  },
  {
    livreurId: 'livreur-lucas-petit',
    nomComplet: 'Lucas Petit',
    etat: 'AFFECTE_NON_LANCE' as const,
    tourneePlanifieeId: 'tp-206',
    codeTms: 'T-206',
  },
  {
    livreurId: 'livreur-jean-moreau',
    nomComplet: 'Jean Moreau',
    etat: 'SANS_TOURNEE' as const,
    tourneePlanifieeId: null,
    codeTms: null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(status: number, body?: unknown): () => Promise<Response> {
  return () =>
    Promise.resolve({
      status,
      ok: status >= 200 && status < 300,
      json: () => Promise.resolve(body),
    } as Response);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('EtatLivreursPage (US-066)', () => {
  // ─── SC1 : Rendu initial avec 3 états ─────────────────────────────────────

  it('SC1 - affiche une ligne par livreur avec leur état du jour', async () => {
    await act(async () => {
      render(
        <EtatLivreursPage
          apiBaseUrl="http://localhost:8082"
          fetchFn={mockFetch(200, LIVREURS_MIXTES)}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Paul Dupont')).toBeInTheDocument();
    });

    // Vérifier les 6 livreurs affichés
    expect(screen.getByText('Paul Dupont')).toBeInTheDocument();
    expect(screen.getByText('Pierre Martin')).toBeInTheDocument();
    expect(screen.getByText('Marie Lambert')).toBeInTheDocument();
    expect(screen.getByText('Sophie Bernard')).toBeInTheDocument();
    expect(screen.getByText('Lucas Petit')).toBeInTheDocument();
    expect(screen.getByText('Jean Moreau')).toBeInTheDocument();
  });

  it('SC1 - affiche le code tournée pour les livreurs affectés/en cours', async () => {
    await act(async () => {
      render(
        <EtatLivreursPage
          apiBaseUrl="http://localhost:8082"
          fetchFn={mockFetch(200, LIVREURS_MIXTES)}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('T-204')).toBeInTheDocument();
    });

    expect(screen.getByText('T-201')).toBeInTheDocument();
    expect(screen.getByText('T-202')).toBeInTheDocument();
  });

  // ─── SC2 : Compteurs dans le bandeau ──────────────────────────────────────

  it('SC2 - bandeau affiche les compteurs corrects (1 sans tournée, 4 affectés, 1 en cours)', async () => {
    await act(async () => {
      render(
        <EtatLivreursPage
          apiBaseUrl="http://localhost:8082"
          fetchFn={mockFetch(200, LIVREURS_MIXTES)}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('compteur-sans-tournee')).toBeInTheDocument();
    });

    expect(screen.getByTestId('compteur-sans-tournee')).toHaveTextContent('1');
    expect(screen.getByTestId('compteur-affectes')).toHaveTextContent('4');
    expect(screen.getByTestId('compteur-en-cours')).toHaveTextContent('1');
  });

  // ─── SC3 : Badges d'état ──────────────────────────────────────────────────

  it('SC3 - badge EN_COURS a les classes Tailwind vertes', async () => {
    render(
      <EtatLivreursPage
        apiBaseUrl="http://localhost:8082"
        fetchFn={mockFetch(200, LIVREURS_MIXTES)}
      />
    );

    const badge = await screen.findByTestId('badge-livreur-livreur-paul-dupont', {}, { timeout: 3000 });
    expect(badge).toHaveAttribute('data-etat', 'EN_COURS');
    expect(badge).toHaveClass('bg-emerald-100');
    expect(badge).toHaveClass('text-emerald-700');
  });

  it('SC3 - badge AFFECTE_NON_LANCE a les classes Tailwind bleues', async () => {
    render(
      <EtatLivreursPage
        apiBaseUrl="http://localhost:8082"
        fetchFn={mockFetch(200, LIVREURS_MIXTES)}
      />
    );

    const badge = await screen.findByTestId('badge-livreur-livreur-pierre-martin', {}, { timeout: 3000 });
    expect(badge).toHaveAttribute('data-etat', 'AFFECTE_NON_LANCE');
    expect(badge).toHaveClass('bg-primary-container');
    expect(badge).toHaveClass('text-on-primary-container');
  });

  it('SC3 - badge SANS_TOURNEE a les classes Tailwind grises', async () => {
    render(
      <EtatLivreursPage
        apiBaseUrl="http://localhost:8082"
        fetchFn={mockFetch(200, LIVREURS_MIXTES)}
      />
    );

    const badge = await screen.findByTestId('badge-livreur-livreur-jean-moreau', {}, { timeout: 3000 });
    expect(badge).toHaveAttribute('data-etat', 'SANS_TOURNEE');
    expect(badge).toHaveClass('bg-surface-container');
    expect(badge).toHaveClass('text-on-surface-variant');
  });

  // ─── SC4 : Filtrage par état ───────────────────────────────────────────────

  it('SC4 - filtre "Sans tournée" affiche uniquement Jean Moreau', async () => {
    await act(async () => {
      render(
        <EtatLivreursPage
          apiBaseUrl="http://localhost:8082"
          fetchFn={mockFetch(200, LIVREURS_MIXTES)}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('filtre-SANS_TOURNEE')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('filtre-SANS_TOURNEE'));

    await waitFor(() => {
      expect(screen.getByText('Jean Moreau')).toBeInTheDocument();
      expect(screen.queryByText('Paul Dupont')).not.toBeInTheDocument();
      expect(screen.queryByText('Pierre Martin')).not.toBeInTheDocument();
    });
  });

  it('SC4 - filtre "Tous" réaffiche les 6 livreurs', async () => {
    await act(async () => {
      render(
        <EtatLivreursPage
          apiBaseUrl="http://localhost:8082"
          fetchFn={mockFetch(200, LIVREURS_MIXTES)}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('filtre-SANS_TOURNEE')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('filtre-SANS_TOURNEE'));
    fireEvent.click(screen.getByTestId('filtre-TOUS'));

    await waitFor(() => {
      expect(screen.getByText('Paul Dupont')).toBeInTheDocument();
      expect(screen.getByText('Jean Moreau')).toBeInTheDocument();
    });
  });

  it('SC4 - filtre "En cours" affiche uniquement Paul Dupont', async () => {
    await act(async () => {
      render(
        <EtatLivreursPage
          apiBaseUrl="http://localhost:8082"
          fetchFn={mockFetch(200, LIVREURS_MIXTES)}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('filtre-EN_COURS')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('filtre-EN_COURS'));

    await waitFor(() => {
      expect(screen.getByText('Paul Dupont')).toBeInTheDocument();
      expect(screen.queryByText('Jean Moreau')).not.toBeInTheDocument();
      expect(screen.queryByText('Pierre Martin')).not.toBeInTheDocument();
    });
  });

  // ─── SC5 : Boutons d'action contextuels ───────────────────────────────────

  it('SC5 - livreur SANS_TOURNEE a un bouton "Affecter"', async () => {
    const onAffecter = jest.fn();

    render(
      <EtatLivreursPage
        apiBaseUrl="http://localhost:8082"
        fetchFn={mockFetch(200, LIVREURS_MIXTES)}
        onAffecter={onAffecter}
      />
    );

    const btn = await screen.findByTestId('action-livreur-livreur-jean-moreau', {}, { timeout: 3000 });
    expect(btn).toHaveTextContent('Affecter');
    fireEvent.click(btn);
    expect(onAffecter).toHaveBeenCalledTimes(1);
  });

  it('SC5 - livreur EN_COURS a un bouton "Voir tournée"', async () => {
    const onVoirTourneePlanifiee = jest.fn();

    render(
      <EtatLivreursPage
        apiBaseUrl="http://localhost:8082"
        fetchFn={mockFetch(200, LIVREURS_MIXTES)}
        onVoirTourneePlanifiee={onVoirTourneePlanifiee}
      />
    );

    const btn = await screen.findByTestId('action-livreur-livreur-paul-dupont', {}, { timeout: 3000 });
    expect(btn).toHaveTextContent('Voir tournée');
    fireEvent.click(btn);
    expect(onVoirTourneePlanifiee).toHaveBeenCalledWith('tp-204');
  });

  it('SC5 - livreur AFFECTE_NON_LANCE a un bouton "Voir préparation"', async () => {
    const onVoirTourneePlanifiee = jest.fn();

    render(
      <EtatLivreursPage
        apiBaseUrl="http://localhost:8082"
        fetchFn={mockFetch(200, LIVREURS_MIXTES)}
        onVoirTourneePlanifiee={onVoirTourneePlanifiee}
      />
    );

    const btn = await screen.findByTestId('action-livreur-livreur-pierre-martin', {}, { timeout: 3000 });
    expect(btn).toHaveTextContent('Voir préparation');
    fireEvent.click(btn);
    expect(onVoirTourneePlanifiee).toHaveBeenCalledWith('tp-201');
  });

  // ─── SC6 : Tri par état (EN_COURS > AFFECTE > SANS_TOURNEE) ──────────────

  it('SC6 - les livreurs sont triés EN_COURS > AFFECTE_NON_LANCE > SANS_TOURNEE', async () => {
    await act(async () => {
      render(
        <EtatLivreursPage
          apiBaseUrl="http://localhost:8082"
          fetchFn={mockFetch(200, LIVREURS_MIXTES)}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getAllByTestId(/^ligne-livreur-/)).toHaveLength(6);
    });

    const lignes = screen.getAllByTestId(/^ligne-livreur-/);
    // Premier élément doit être EN_COURS
    expect(lignes[0]).toHaveAttribute('data-etat', 'EN_COURS');
    // Dernier élément doit être SANS_TOURNEE
    expect(lignes[lignes.length - 1]).toHaveAttribute('data-etat', 'SANS_TOURNEE');
  });

  // ─── SC7 : État de chargement ─────────────────────────────────────────────

  it('SC7 - affiche un indicateur de chargement pendant le fetch', async () => {
    let resolveFetch!: (r: Response) => void;
    const fetchFn = () =>
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      });

    render(
      <EtatLivreursPage
        apiBaseUrl="http://localhost:8082"
        fetchFn={fetchFn as unknown as typeof fetch}
      />
    );

    expect(screen.getByTestId('chargement-livreurs')).toBeInTheDocument();

    await act(async () => {
      resolveFetch({
        ok: true,
        status: 200,
        json: () => Promise.resolve(LIVREURS_MIXTES),
      } as Response);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('chargement-livreurs')).not.toBeInTheDocument();
    });
  });

  // ─── SC8 : Erreur réseau ──────────────────────────────────────────────────

  it('SC8 - affiche un message d\'erreur en cas d\'erreur réseau', async () => {
    const fetchFn = () => Promise.reject(new Error('Network error'));

    await act(async () => {
      render(
        <EtatLivreursPage
          apiBaseUrl="http://localhost:8082"
          fetchFn={fetchFn as unknown as typeof fetch}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('erreur-livreurs')).toBeInTheDocument();
    });
  });

  // ─── SC9 : Titre et date ──────────────────────────────────────────────────

  it('SC9 - affiche le titre "État des livreurs" et la date', async () => {
    await act(async () => {
      render(
        <EtatLivreursPage
          apiBaseUrl="http://localhost:8082"
          fetchFn={mockFetch(200, LIVREURS_MIXTES)}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('titre-etat-livreurs')).toBeInTheDocument();
    });

    expect(screen.getByTestId('titre-etat-livreurs')).toHaveTextContent('État des livreurs');
  });

  // ─── SC10 : Mise à jour par WebSocket (update partiel) ───────────────────

  it('SC10 - une mise à jour WebSocket change uniquement le livreur concerné', async () => {
    let wsUpdateCallback: ((data: unknown) => void) | null = null;

    const mockWsSubscribe = jest.fn((topic: string, callback: (msg: { body: string }) => void) => {
      if (topic === '/topic/livreurs/etat') {
        wsUpdateCallback = (data) => callback({ body: JSON.stringify(data) });
      }
      return { unsubscribe: jest.fn() };
    });

    render(
      <EtatLivreursPage
        apiBaseUrl="http://localhost:8082"
        fetchFn={mockFetch(200, LIVREURS_MIXTES)}
        stompSubscribeFn={mockWsSubscribe}
      />
    );

    // Attendre que le composant soit chargé
    await screen.findByTestId('badge-livreur-livreur-pierre-martin', {}, { timeout: 3000 });

    // Vérifier l'état initial de Pierre Martin
    expect(screen.getByTestId('badge-livreur-livreur-pierre-martin')).toHaveAttribute(
      'data-etat',
      'AFFECTE_NON_LANCE'
    );

    // Simuler la mise à jour WebSocket : Pierre Martin passe EN_COURS
    await act(async () => {
      wsUpdateCallback!({
        livreurId: 'livreur-pierre-martin',
        nomComplet: 'Pierre Martin',
        etat: 'EN_COURS',
        tourneePlanifieeId: 'tp-201',
        codeTms: 'T-201',
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('badge-livreur-livreur-pierre-martin')).toHaveAttribute(
        'data-etat',
        'EN_COURS'
      );
    });

    // Paul Dupont ne doit pas avoir changé
    expect(screen.getByTestId('badge-livreur-livreur-paul-dupont')).toHaveAttribute(
      'data-etat',
      'EN_COURS'
    );
  });
});
