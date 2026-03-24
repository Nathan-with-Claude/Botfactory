/**
 * ConnexionPage — Page de connexion SSO web (US-020)
 *
 * Affichée quand l'utilisateur n'est pas authentifié, ou quand la session expire.
 * Le flux OAuth2 Authorization Code est déclenché via redirectToSso().
 *
 * Statuts gérés :
 *  - "unauthenticated" : état initial, bouton de connexion
 *  - "loading" : connexion en cours (redirection SSO)
 *  - "forbidden" : 403 — rôle LIVREUR tentant d'accéder (SC2)
 *  - "session-expired" : session expirée après inactivité (SC3)
 */

import React from 'react';
import { redirectToSso } from '../auth/webAuthService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConnexionStatus =
  | 'unauthenticated'
  | 'loading'
  | 'forbidden'
  | 'session-expired'
  | 'error';

export interface ConnexionPageProps {
  status: ConnexionStatus;
  error: string | null;
}

// ─── Composant ───────────────────────────────────────────────────────────────

export function ConnexionPage({ status, error }: ConnexionPageProps): React.JSX.Element {
  function handleConnexion(): void {
    redirectToSso(window.location.pathname);
  }

  return (
    <div data-testid="page-connexion" style={styles.container}>
      {/* En-tête */}
      <div style={styles.header}>
        <h1 style={styles.titre}>DocuPost</h1>
        <p style={styles.sousTitre}>Interface de Supervision</p>
      </div>

      {/* Contenu central */}
      <div style={styles.card}>
        {status === 'loading' ? (
          <div data-testid="spinner-connexion" style={styles.spinner}>
            <div style={styles.spinnerIcon} />
            <p style={styles.spinnerTexte}>Connexion en cours...</p>
          </div>
        ) : (
          <>
            {/* SC2 — Accès refusé (rôle LIVREUR) */}
            {status === 'forbidden' && (
              <div data-testid="msg-acces-refuse" style={styles.alerteDanger}>
                <strong>Accès non autorisé</strong>
                <p>
                  {error ??
                    'Accès non autorisé. Cette interface est réservée aux superviseurs.'}
                </p>
              </div>
            )}

            {/* SC3 — Session expirée */}
            {status === 'session-expired' && (
              <div data-testid="msg-session-expiree" style={styles.alerteInfo}>
                <strong>Session expirée</strong>
                <p>Votre session a expiré. Veuillez vous reconnecter.</p>
                <button
                  data-testid="btn-reconnecter"
                  style={styles.btnPrimaire}
                  onClick={handleConnexion}
                >
                  Se reconnecter
                </button>
              </div>
            )}

            {/* Bouton de connexion principal (SC1) */}
            {(status === 'unauthenticated' || status === 'error' || status === 'forbidden') && (
              <>
                <p style={styles.intro}>
                  Connectez-vous avec votre compte Docaposte pour accéder
                  au tableau de bord de supervision.
                </p>
                <button
                  data-testid="btn-connexion-sso"
                  style={styles.btnPrimaire}
                  onClick={handleConnexion}
                >
                  Se connecter via compte Docaposte
                </button>
              </>
            )}

            <p style={styles.infoSecu}>
              Connexion sécurisée via le SSO corporate Docaposte (OAuth2)
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Styles inline (pas de dépendance CSS externe pour le MVP) ───────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F5F7FA',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  titre: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#005B96',
    margin: 0,
  },
  sousTitre: {
    fontSize: '16px',
    color: '#666',
    margin: '4px 0 0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
  },
  spinner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  spinnerIcon: {
    width: '40px',
    height: '40px',
    border: '4px solid #E5E7EB',
    borderTop: '4px solid #005B96',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  spinnerTexte: {
    color: '#666',
    fontSize: '14px',
  },
  alerteDanger: {
    backgroundColor: '#FFF3CD',
    border: '1px solid #FBBF24',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    textAlign: 'left',
  },
  alerteInfo: {
    backgroundColor: '#EFF6FF',
    border: '1px solid #93C5FD',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    textAlign: 'left',
  },
  intro: {
    color: '#374151',
    fontSize: '14px',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  btnPrimaire: {
    backgroundColor: '#005B96',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    marginTop: '8px',
  },
  infoSecu: {
    fontSize: '12px',
    color: '#9CA3AF',
    marginTop: '16px',
  },
};
