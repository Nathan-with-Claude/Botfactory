/**
 * AuthCallbackPage — Callback OAuth2 Authorization Code (US-020)
 *
 * Reçoit le code d'autorisation depuis le SSO Keycloak après authentification.
 * Échange le code contre un token JWT, puis redirige vers le tableau de bord.
 *
 * URL attendue : /auth/callback?code=xxx&state=yyy
 *
 * Invariants US-020 :
 *  - SC3 : si le code est absent ou invalide, retour à ConnexionPage
 *  - SC1 : après échange réussi, redirection vers W-01 ou la page d'origine
 */

import React, { useEffect, useState } from 'react';
import { exchangeCodeForToken } from '../auth/webAuthService';

export interface AuthCallbackPageProps {
  /** Injecté pour les tests */
  exchangeFn?: typeof exchangeCodeForToken;
  /** Callback appelé après succès (navigation vers W-01) */
  onAuthSuccess?: () => void;
  /** Callback appelé en cas d'erreur */
  onAuthError?: (error: string) => void;
}

export function AuthCallbackPage({
  exchangeFn = exchangeCodeForToken,
  onAuthSuccess,
  onAuthError,
}: AuthCallbackPageProps): React.JSX.Element {
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function handleCallback(): Promise<void> {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const errorParam = params.get('error');

      if (errorParam) {
        const msg = 'Connexion refusée par le SSO. Veuillez réessayer.';
        setStatus('error');
        setErrorMessage(msg);
        onAuthError?.(msg);
        return;
      }

      if (!code || !state) {
        const msg = 'Paramètres de callback invalides.';
        setStatus('error');
        setErrorMessage(msg);
        onAuthError?.(msg);
        return;
      }

      try {
        await exchangeFn(code, state);
        // Redirection vers la page d'origine (SC3) ou W-01
        const returnPath = sessionStorage.getItem('docupost_return_path') ?? '/';
        sessionStorage.removeItem('docupost_return_path');
        onAuthSuccess?.();
        if (!onAuthSuccess) {
          window.location.replace(returnPath);
        }
      } catch (err) {
        const msg = 'Échange de token échoué. Veuillez vous reconnecter.';
        setStatus('error');
        setErrorMessage(msg);
        onAuthError?.(msg);
      }
    }

    void handleCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'error') {
    return (
      <div data-testid="callback-erreur" style={styles.container}>
        <p style={styles.erreur}>{errorMessage}</p>
        <a href="/" style={styles.lienRetour}>
          Retour à la connexion
        </a>
      </div>
    );
  }

  return (
    <div data-testid="callback-chargement" style={styles.container}>
      <p style={styles.texteChargement}>Authentification en cours...</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FA',
  },
  texteChargement: {
    color: '#374151',
    fontSize: '16px',
  },
  erreur: {
    color: '#DC2626',
    fontSize: '14px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  lienRetour: {
    color: '#005B96',
    textDecoration: 'underline',
  },
};
