/**
 * authStore — BC-06 Identité et Accès (US-019)
 *
 * Store d'authentification OAuth2 PKCE pour l'application mobile livreur.
 *
 * Stratégie :
 *  - Le flux OAuth2 PKCE est délégué à react-native-app-auth (SSO corporate Docaposte).
 *  - L'implémentation de production passe des fonctions `authorize`, `refresh`, `revoke`
 *    qui wrappent react-native-app-auth.
 *  - En dev/test, des fonctions mock sont injectées.
 *  - Le token JWT est stocké en mémoire (jamais en clair dans AsyncStorage).
 *  - Le refresh token est stocké dans SecureStore (Expo) ou Keychain en prod.
 *
 * Aucune logique métier ici — orchestration pure (Application Layer).
 */

// ─── Types publics ────────────────────────────────────────────────────────────

export type AuthStatus =
  | 'unauthenticated'
  | 'loading'
  | 'authenticated'
  | 'error';

export interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpirationDate: string | null;
  livreurId: string | null;
  role: string | null;
  error: string | null;
}

/** Résultat renvoyé par react-native-app-auth.authorize() */
export interface AppAuthResult {
  accessToken: string;
  refreshToken: string;
  accessTokenExpirationDate: string;
  idToken?: string;
}

/** Résultat renvoyé par react-native-app-auth.refresh() */
export interface AppAuthRefreshResult {
  accessToken: string;
  refreshToken: string;
  accessTokenExpirationDate: string;
}

/**
 * Options d'injection de dépendances pour le store.
 * Permet de mocker react-native-app-auth dans les tests.
 */
export interface AuthStoreOptions {
  authorize: () => Promise<AppAuthResult>;
  refresh: (refreshToken: string) => Promise<AppAuthRefreshResult>;
  revoke: (accessToken: string) => Promise<void>;
}

// ─── Helpers privés ───────────────────────────────────────────────────────────

/**
 * Décode le payload d'un JWT (base64url → JSON).
 * Ne vérifie pas la signature — c'est le backend qui valide via Keycloak.
 */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return {};
    // Remplace base64url par base64 standard
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function extractLivreurId(token: string): string | null {
  const payload = decodeJwtPayload(token);
  return typeof payload.sub === 'string' ? payload.sub : null;
}

function extractRole(token: string): string | null {
  const payload = decodeJwtPayload(token);
  const roles = payload.roles;
  if (Array.isArray(roles) && roles.length > 0) {
    return String(roles[0]);
  }
  return null;
}

const ERROR_MESSAGE =
  'Connexion impossible. Vérifiez votre réseau ou contactez le support.';

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Crée une instance isolée du store d'authentification.
 * Usage production : createAuthStore(prodAuthOptions)
 * Usage test : createAuthStore({ authorize: jest.fn(), ... })
 */
export function createAuthStore(options: AuthStoreOptions) {
  // État interne (pas de Zustand pour éviter une dépendance — le store est singleton)
  let state: AuthState = {
    status: 'unauthenticated',
    accessToken: null,
    refreshToken: null,
    accessTokenExpirationDate: null,
    livreurId: null,
    role: null,
    error: null,
  };

  // Listeners pour React (pattern pub/sub minimaliste)
  const listeners = new Set<() => void>();

  function notify(): void {
    listeners.forEach(l => l());
  }

  function setState(partial: Partial<AuthState>): void {
    state = { ...state, ...partial };
    notify();
  }

  async function login(): Promise<void> {
    setState({ status: 'loading', error: null });
    try {
      const result = await options.authorize();
      const livreurId = extractLivreurId(result.accessToken);
      const role = extractRole(result.accessToken);
      setState({
        status: 'authenticated',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        accessTokenExpirationDate: result.accessTokenExpirationDate,
        livreurId,
        role,
        error: null,
      });
    } catch {
      setState({
        status: 'error',
        accessToken: null,
        refreshToken: null,
        accessTokenExpirationDate: null,
        livreurId: null,
        role: null,
        error: ERROR_MESSAGE,
      });
    }
  }

  async function refreshAccessToken(): Promise<void> {
    const currentRefreshToken = state.refreshToken;
    if (!currentRefreshToken) {
      setState({ status: 'unauthenticated', accessToken: null });
      return;
    }
    try {
      const result = await options.refresh(currentRefreshToken);
      const livreurId = extractLivreurId(result.accessToken);
      const role = extractRole(result.accessToken);
      setState({
        status: 'authenticated',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        accessTokenExpirationDate: result.accessTokenExpirationDate,
        livreurId,
        role,
        error: null,
      });
    } catch {
      setState({
        status: 'unauthenticated',
        accessToken: null,
        refreshToken: null,
        accessTokenExpirationDate: null,
        livreurId: null,
        role: null,
        error: null,
      });
    }
  }

  async function logout(): Promise<void> {
    const tokenToRevoke = state.accessToken;
    // Vider l'état avant même la révocation (RGPD — pas de données en local)
    setState({
      status: 'unauthenticated',
      accessToken: null,
      refreshToken: null,
      accessTokenExpirationDate: null,
      livreurId: null,
      role: null,
      error: null,
    });
    if (tokenToRevoke) {
      try {
        await options.revoke(tokenToRevoke);
      } catch {
        // Révocation côté serveur échouée — état local déjà vidé, on absorbe l'erreur
      }
    }
  }

  function getAuthHeader(): Record<string, string> {
    if (state.status === 'authenticated' && state.accessToken) {
      return { Authorization: `Bearer ${state.accessToken}` };
    }
    return {};
  }

  function isTokenExpired(): boolean {
    if (!state.accessTokenExpirationDate) return true;
    return new Date(state.accessTokenExpirationDate) <= new Date();
  }

  function getState(): AuthState {
    return { ...state };
  }

  // Exposé uniquement pour les tests
  function _setState(newState: AuthState): void {
    state = newState;
    notify();
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    login,
    logout,
    refreshAccessToken,
    getAuthHeader,
    isTokenExpired,
    getState,
    subscribe,
    // Test helper — ne pas utiliser en prod
    _setState,
  };
}

// ─── Singleton prod ───────────────────────────────────────────────────────────
// En prod, react-native-app-auth est importé ici.
// En dev, le MockJwtAuthFilter backend est actif et aucune vraie auth n'est nécessaire.
// Le fichier prodAuthOptions.ts sera ajouté quand Keycloak est provisionné.

/**
 * Config SSO Keycloak / Docaposte pour react-native-app-auth.
 * Les valeurs sont lues depuis les variables d'environnement Expo.
 * En développement local, ces valeurs peuvent pointer vers un Keycloak dev.
 */
export const SSO_CONFIG = {
  issuer:
    process.env.EXPO_PUBLIC_SSO_ISSUER ?? 'https://sso.docaposte.fr/realms/docupost',
  clientId:
    process.env.EXPO_PUBLIC_SSO_CLIENT_ID ?? 'docupost-mobile',
  redirectUrl:
    process.env.EXPO_PUBLIC_SSO_REDIRECT_URL ?? 'docupost://callback',
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  // PKCE est activé par défaut dans react-native-app-auth
  usePKCE: true,
};
