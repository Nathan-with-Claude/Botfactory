/**
 * App.tsx — Routeur maison DocuPost Supervision (US-APP-routing)
 *
 * Pas de react-router-dom (absent de package.json). Navigation pilotée par
 * un état React de type discriminant (AppRoute). Chaque page reçoit des
 * callbacks de navigation en props — aucune page n'est modifiée.
 *
 * Routes disponibles :
 *   connexion              → ConnexionPage (défaut / non-authentifié)
 *   tableau-de-bord        → TableauDeBordPage
 *   detail-tournee         → DetailTourneePage (+ tourneeId)
 *   instruction            → PanneauInstructionPage (+ tourneeId, colisId)
 *   planification          → PreparationPage
 *   detail-tournee-planifiee → DetailTourneePlanifieePage (+ tourneePlanifieeId)
 *   preuves                → ConsulterPreuvePage
 *   auth-callback          → AuthCallbackPage
 *
 * Note WebSocket : TableauDeBordPage et DetailTourneePage tentent une connexion
 * WebSocket native vers ws://localhost:8082/ws/supervision. Le backend utilise
 * STOMP sur SockJS — la connexion WebSocket native échoue (101 non reçu).
 * L'application bascule automatiquement sur le polling HTTP de secours.
 * Résolution prévue : US-future (migrer vers @stomp/stompjs + SockJS côté front).
 */

import React, { useState, useEffect } from 'react';

import { ConnexionPage, ConnexionStatus } from './pages/ConnexionPage';
import TableauDeBordPage from './pages/TableauDeBordPage';
import DetailTourneePage from './pages/DetailTourneePage';
import PanneauInstructionPage, { InstructionCreeDTO } from './pages/PanneauInstructionPage';
import PreparationPage from './pages/PreparationPage';
import DetailTourneePlanifieePage from './pages/DetailTourneePlanifieePage';
import ConsulterPreuvePage from './pages/ConsulterPreuvePage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';

// ─── Type discriminant de la route ───────────────────────────────────────────

export type AppRoute =
  | { page: 'connexion'; status?: ConnexionStatus; error?: string | null }
  | { page: 'tableau-de-bord' }
  | { page: 'detail-tournee'; tourneeId: string }
  | { page: 'instruction'; tourneeId: string; colisId: string }
  | { page: 'planification' }
  | { page: 'detail-tournee-planifiee'; tourneePlanifieeId: string }
  | { page: 'preuves'; colisId?: string }
  | { page: 'auth-callback' };

// ─── Layout shell ────────────────────────────────────────────────────────────

const SHELL_STYLE: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#F2F4F6',
  fontFamily: "'Inter', sans-serif",
};

const CONTENT_STYLE: React.CSSProperties = {
  maxWidth: 1280,
  margin: '0 auto',
  padding: '32px 24px',
};

// Navigation principale (visible uniquement une fois connecté)
const NAV_PAGES: Array<{ label: string; route: AppRoute }> = [
  { label: 'Supervision', route: { page: 'tableau-de-bord' } },
  { label: 'Planification', route: { page: 'planification' } },
  { label: 'Preuves', route: { page: 'preuves' } },
];

function NavBar({ current, navigate }: {
  current: AppRoute;
  navigate: (r: AppRoute) => void;
}) {
  return (
    <nav
      data-testid="nav-principale"
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid rgba(196, 197, 215, 0.3)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        height: 56,
        gap: 4,
      }}
    >
      {/* Logo */}
      <span
        style={{
          fontWeight: 800,
          fontSize: 18,
          color: '#005B96',
          marginRight: 32,
          letterSpacing: '-0.02em',
          cursor: 'pointer',
        }}
        onClick={() => navigate({ page: 'tableau-de-bord' })}
      >
        DocuPost
      </span>

      {NAV_PAGES.map(({ label, route }) => {
        const active = current.page === route.page;
        return (
          <button
            key={label}
            data-testid={`nav-${route.page}`}
            onClick={() => navigate(route)}
            style={{
              padding: '6px 16px',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              backgroundColor: active ? '#EEF2FF' : 'transparent',
              color: active ? '#0037B0' : '#747686',
              transition: 'all 150ms',
            }}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}

// ─── Composant principal App ──────────────────────────────────────────────────

interface AppProps {
  /**
   * Injecté par les tests unitaires pour démarrer sur une route précise.
   * En production, la route initiale est déduite de window.location.
   */
  routeInitiale?: AppRoute;
}

function resolveRouteInitiale(): AppRoute {
  // Détection de la route auth/callback via l'URL réelle (SSO redirect)
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/callback')) {
    return { page: 'auth-callback' };
  }
  // Si un token est déjà présent (mode dev après bypass SSO, ou session restaurée)
  if (typeof window !== 'undefined' && sessionStorage.getItem('docupost_access_token')) {
    return { page: 'tableau-de-bord' };
  }
  // Par défaut : page de connexion
  return { page: 'connexion', status: 'unauthenticated', error: null };
}

/** Titres affichés dans l'onglet navigateur selon la route active */
const TITRES_PAR_PAGE: Partial<Record<AppRoute['page'], string>> = {
  'tableau-de-bord':        'DocuPost — Supervision',
  'detail-tournee':         'DocuPost — Détail tournée',
  'instruction':            'DocuPost — Envoyer une instruction',
  'planification':          'DocuPost — Plan du jour',
  'detail-tournee-planifiee': 'DocuPost — Détail tournée planifiée',
  'preuves':                'DocuPost — Preuves de livraison',
  'connexion':              'DocuPost — Connexion',
  'auth-callback':          'DocuPost — Connexion en cours…',
};

function App({ routeInitiale }: AppProps) {
  const [route, setRoute] = useState<AppRoute>(
    routeInitiale ?? resolveRouteInitiale()
  );

  // Bloquant 3 — titre d'onglet navigateur dynamique par page
  useEffect(() => {
    document.title = TITRES_PAR_PAGE[route.page] ?? 'DocuPost — Supervision';
  }, [route.page]);

  // Indicateur simple d'authentification (stocké en sessionStorage en prod)
  const estAuthentifie = route.page !== 'connexion' && route.page !== 'auth-callback';

  function navigate(r: AppRoute): void {
    setRoute(r);
  }

  // ─── Rendu par route ────────────────────────────────────────────────────────

  // Pages sans shell (plein écran)
  if (route.page === 'connexion') {
    return (
      <ConnexionPage
        status={route.status ?? 'unauthenticated'}
        error={route.error ?? null}
      />
    );
  }

  if (route.page === 'auth-callback') {
    return (
      <AuthCallbackPage
        onAuthSuccess={() => navigate({ page: 'tableau-de-bord' })}
        onAuthError={(err) => navigate({ page: 'connexion', status: 'error', error: err })}
      />
    );
  }

  // Pages avec shell (nav + padding)
  return (
    <div style={SHELL_STYLE}>
      {estAuthentifie && (
        <NavBar current={route} navigate={navigate} />
      )}

      <div style={CONTENT_STYLE}>

        {route.page === 'tableau-de-bord' && (
          <TableauDeBordPage
            onVoirTournee={(tourneeId) => navigate({ page: 'detail-tournee', tourneeId })}
          />
        )}

        {route.page === 'detail-tournee' && (
          <DetailTourneePage
            tourneeId={route.tourneeId}
            onRetour={() => navigate({ page: 'tableau-de-bord' })}
            onInstructionner={(colisId) =>
              navigate({ page: 'instruction', tourneeId: route.tourneeId, colisId })
            }
          />
        )}

        {route.page === 'instruction' && (
          <PanneauInstructionPage
            tourneeId={route.tourneeId}
            colisId={route.colisId}
            onFermer={() =>
              navigate({ page: 'detail-tournee', tourneeId: route.tourneeId })
            }
            onEnvoye={(_instruction: InstructionCreeDTO) =>
              navigate({ page: 'detail-tournee', tourneeId: route.tourneeId })
            }
          />
        )}

        {route.page === 'planification' && (
          <PreparationPage
            onVoirDetail={(id) =>
              navigate({ page: 'detail-tournee-planifiee', tourneePlanifieeId: id })
            }
            onAffecter={(id) =>
              navigate({ page: 'detail-tournee-planifiee', tourneePlanifieeId: id })
            }
          />
        )}

        {route.page === 'detail-tournee-planifiee' && (
          <DetailTourneePlanifieePage
            tourneePlanifieeId={route.tourneePlanifieeId}
            onRetour={() => navigate({ page: 'planification' })}
          />
        )}

        {route.page === 'preuves' && (
          <ConsulterPreuvePage />
        )}

      </div>
    </div>
  );
}

export default App;
