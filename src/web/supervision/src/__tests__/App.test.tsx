/**
 * Tests TDD — App.tsx (routeur maison)
 *
 * Stratégie : on simule le hash ou l'état de navigation en injectant
 * directement la prop `routeInitiale` dans App, puis on vérifie
 * que la bonne page est rendue via son data-testid.
 *
 * Les pages elles-mêmes ne sont PAS re-testées ici — on se contente
 * de vérifier que le routeur sélectionne le bon écran.
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App, { type AppRoute } from '../App';

// ─── Mocks des pages et services ─────────────────────────────────────────────
// On mock les pages pour éviter leurs dépendances réseau / SSO.

jest.mock('../pages/ConnexionPage', () => ({
  ConnexionPage: ({ status }: { status: string }) => (
    <div data-testid="page-connexion" data-status={status} />
  ),
}));

jest.mock('../pages/TableauDeBordPage', () => ({
  __esModule: true,
  default: ({ onVoirTournee }: { onVoirTournee?: (id: string) => void }) => (
    <div
      data-testid="tableau-de-bord-page"
      onClick={() => onVoirTournee?.('T-001')}
    />
  ),
}));

jest.mock('../pages/DetailTourneePage', () => ({
  __esModule: true,
  default: ({ tourneeId, onRetour, onInstructionner }: {
    tourneeId: string;
    onRetour?: () => void;
    onInstructionner?: (colisId: string) => void;
  }) => (
    <div
      data-testid="detail-tournee-page"
      data-tournee-id={tourneeId}
    >
      <button data-testid="btn-retour-mock" onClick={onRetour}>Retour</button>
      <button data-testid="btn-instructionner-mock" onClick={() => onInstructionner?.('colis-001')}>
        Instructionner
      </button>
    </div>
  ),
}));

jest.mock('../pages/PanneauInstructionPage', () => ({
  __esModule: true,
  default: ({ tourneeId, colisId, onFermer }: {
    tourneeId: string;
    colisId: string;
    onFermer?: () => void;
  }) => (
    <div
      data-testid="panneau-instruction"
      data-tournee-id={tourneeId}
      data-colis-id={colisId}
    >
      <button data-testid="btn-fermer-mock" onClick={onFermer}>Fermer</button>
    </div>
  ),
}));

jest.mock('../pages/PreparationPage', () => ({
  __esModule: true,
  default: ({ onVoirDetail }: { onVoirDetail?: (id: string) => void }) => (
    <div
      data-testid="preparation-page"
      onClick={() => onVoirDetail?.('plan-001')}
    />
  ),
}));

jest.mock('../pages/DetailTourneePlanifieePage', () => ({
  __esModule: true,
  default: ({ tourneePlanifieeId, onRetour }: {
    tourneePlanifieeId: string;
    onRetour?: () => void;
  }) => (
    <div
      data-testid="detail-tournee-planifiee-page"
      data-id={tourneePlanifieeId}
    >
      <button data-testid="btn-retour-planif-mock" onClick={onRetour}>Retour</button>
    </div>
  ),
}));

jest.mock('../pages/ConsulterPreuvePage', () => ({
  __esModule: true,
  default: () => <div data-testid="consulter-preuve-page" />,
}));

jest.mock('../pages/AuthCallbackPage', () => ({
  AuthCallbackPage: ({ onAuthSuccess }: { onAuthSuccess?: () => void }) => (
    <div
      data-testid="auth-callback-page"
      onClick={onAuthSuccess}
    />
  ),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderApp(routeInitiale?: AppRoute) {
  return render(<App routeInitiale={routeInitiale} />);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('App — routeur maison', () => {

  // TC-APP-01 : route par défaut → ConnexionPage
  it('TC-APP-01 : affiche ConnexionPage sur la route par défaut', () => {
    renderApp();
    expect(screen.getByTestId('page-connexion')).toBeInTheDocument();
  });

  // TC-APP-02 : route connexion
  it('TC-APP-02 : affiche ConnexionPage sur la route "connexion"', () => {
    renderApp({ page: 'connexion' });
    expect(screen.getByTestId('page-connexion')).toBeInTheDocument();
  });

  // TC-APP-03 : route tableau-de-bord
  it('TC-APP-03 : affiche TableauDeBordPage sur la route "tableau-de-bord"', () => {
    renderApp({ page: 'tableau-de-bord' });
    expect(screen.getByTestId('tableau-de-bord-page')).toBeInTheDocument();
  });

  // TC-APP-04 : navigation connexion → tableau-de-bord via AuthCallbackPage
  it('TC-APP-04 : navigue vers tableau-de-bord après auth réussie', async () => {
    renderApp({ page: 'auth-callback' });
    expect(screen.getByTestId('auth-callback-page')).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(screen.getByTestId('auth-callback-page'));
    });

    expect(screen.getByTestId('tableau-de-bord-page')).toBeInTheDocument();
  });

  // TC-APP-05 : clic sur une tournée dans le tableau de bord → DetailTourneePage
  it('TC-APP-05 : navigue vers DetailTourneePage au clic sur une tournée', async () => {
    renderApp({ page: 'tableau-de-bord' });

    await act(async () => {
      await userEvent.click(screen.getByTestId('tableau-de-bord-page'));
    });

    const detail = screen.getByTestId('detail-tournee-page');
    expect(detail).toBeInTheDocument();
    expect(detail).toHaveAttribute('data-tournee-id', 'T-001');
  });

  // TC-APP-06 : retour du détail → tableau-de-bord
  it('TC-APP-06 : btn-retour depuis DetailTourneePage revient au tableau-de-bord', async () => {
    renderApp({ page: 'detail-tournee', tourneeId: 'T-001' });
    expect(screen.getByTestId('detail-tournee-page')).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(screen.getByTestId('btn-retour-mock'));
    });

    expect(screen.getByTestId('tableau-de-bord-page')).toBeInTheDocument();
  });

  // TC-APP-07 : clic Instructionner → PanneauInstructionPage
  it('TC-APP-07 : navigue vers PanneauInstructionPage au clic Instructionner', async () => {
    renderApp({ page: 'detail-tournee', tourneeId: 'T-002' });

    await act(async () => {
      await userEvent.click(screen.getByTestId('btn-instructionner-mock'));
    });

    const panneau = screen.getByTestId('panneau-instruction');
    expect(panneau).toBeInTheDocument();
    expect(panneau).toHaveAttribute('data-tournee-id', 'T-002');
    expect(panneau).toHaveAttribute('data-colis-id', 'colis-001');
  });

  // TC-APP-08 : fermer PanneauInstruction → retour detail-tournee
  it('TC-APP-08 : fermer PanneauInstruction revient à DetailTourneePage', async () => {
    renderApp({ page: 'instruction', tourneeId: 'T-002', colisId: 'colis-001' });

    await act(async () => {
      await userEvent.click(screen.getByTestId('btn-fermer-mock'));
    });

    expect(screen.getByTestId('detail-tournee-page')).toBeInTheDocument();
  });

  // TC-APP-09 : route planification → PreparationPage
  it('TC-APP-09 : affiche PreparationPage sur la route "planification"', () => {
    renderApp({ page: 'planification' });
    expect(screen.getByTestId('preparation-page')).toBeInTheDocument();
  });

  // TC-APP-10 : clic sur Voir détail → DetailTourneePlanifieePage
  it('TC-APP-10 : navigue vers DetailTourneePlanifieePage depuis PreparationPage', async () => {
    renderApp({ page: 'planification' });

    await act(async () => {
      await userEvent.click(screen.getByTestId('preparation-page'));
    });

    const detail = screen.getByTestId('detail-tournee-planifiee-page');
    expect(detail).toBeInTheDocument();
    expect(detail).toHaveAttribute('data-id', 'plan-001');
  });

  // TC-APP-11 : retour depuis DetailTourneePlanifiee → planification
  it('TC-APP-11 : btn-retour depuis DetailTourneePlanifieePage revient à planification', async () => {
    renderApp({ page: 'detail-tournee-planifiee', tourneePlanifieeId: 'plan-001' });

    await act(async () => {
      await userEvent.click(screen.getByTestId('btn-retour-planif-mock'));
    });

    expect(screen.getByTestId('preparation-page')).toBeInTheDocument();
  });

  // TC-APP-12 : route preuves → ConsulterPreuvePage
  it('TC-APP-12 : affiche ConsulterPreuvePage sur la route "preuves"', () => {
    renderApp({ page: 'preuves' });
    expect(screen.getByTestId('consulter-preuve-page')).toBeInTheDocument();
  });

  // TC-APP-13 : route auth-callback → AuthCallbackPage
  it('TC-APP-13 : affiche AuthCallbackPage sur la route "auth-callback"', () => {
    renderApp({ page: 'auth-callback' });
    expect(screen.getByTestId('auth-callback-page')).toBeInTheDocument();
  });

});
