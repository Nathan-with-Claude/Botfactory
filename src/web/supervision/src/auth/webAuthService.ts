/**
 * webAuthService — BC-06 Identité et Accès (US-020)
 *
 * Service d'authentification OAuth2 Authorization Code pour l'interface web.
 * Le flux est standard : redirection navigateur vers le SSO Keycloak, puis
 * callback avec le code d'autorisation, échange contre un access_token JWT.
 *
 * Stratégie pour le MVP :
 *  - Le token JWT est stocké en mémoire (variable module) + sessionStorage.
 *  - Le refresh est géré via un cookie httpOnly côté serveur si le SSO Keycloak
 *    est configuré avec des sessions longues (recommandé pour la prod).
 *  - Pour le MVP, le refresh token est stocké en sessionStorage (durée session).
 *
 * Conformité US-020 :
 *  - SC1 : flux OAuth2 Authorization Code via redirectToSso()
 *  - SC2 : le backend renvoie 403 si le rôle est LIVREUR → géré par handleApiError()
 *  - SC3 : expiration détectée par handleApiError() → redirection SSO
 *  - SC4 : accès DSI tracé via AuditLogger (côté backend svc-supervision)
 *  - SC5 : logout() révoque la session et redirige vers SSO logout endpoint
 */

// ─── Configuration SSO ────────────────────────────────────────────────────────

const SSO_CONFIG = {
  /** URL de base du SSO Keycloak (configurable via variable d'env) */
  issuer: process.env.REACT_APP_SSO_ISSUER ?? 'https://sso.docaposte.fr/realms/docupost',
  clientId: process.env.REACT_APP_SSO_CLIENT_ID ?? 'docupost-web',
  redirectUri:
    process.env.REACT_APP_SSO_REDIRECT_URI ??
    `${window.location.origin}/auth/callback`,
  scopes: 'openid profile email',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface JwtPayload {
  sub: string;
  roles: string[];
  email?: string;
  name?: string;
  exp: number;
}

// ─── État en mémoire ──────────────────────────────────────────────────────────

let _accessToken: string | null = sessionStorage.getItem('docupost_access_token');
let _refreshToken: string | null = sessionStorage.getItem('docupost_refresh_token');

// ─── Fonctions publiques ─────────────────────────────────────────────────────

/**
 * Redirige le navigateur vers la page de connexion SSO corporate.
 * Flux OAuth2 Authorization Code (standard web — pas de PKCE obligatoire
 * pour les clients confidentiels, mais recommandé).
 */
export function redirectToSso(returnPath?: string): void {
  // Sauvegarde l'URL courante pour redirection post-login (SC3)
  if (returnPath) {
    sessionStorage.setItem('docupost_return_path', returnPath);
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SSO_CONFIG.clientId,
    redirect_uri: SSO_CONFIG.redirectUri,
    scope: SSO_CONFIG.scopes,
    state: generateState(),
  });

  window.location.href = `${SSO_CONFIG.issuer}/protocol/openid-connect/auth?${params.toString()}`;
}

/**
 * Échange le code d'autorisation OAuth2 contre un token JWT.
 * Appelé par la page de callback /auth/callback.
 */
export async function exchangeCodeForToken(
  code: string,
  state: string,
  fetchFn: typeof fetch = fetch
): Promise<TokenResponse> {
  // Validation de l'état anti-CSRF
  const savedState = sessionStorage.getItem('docupost_oauth_state');
  if (state !== savedState) {
    throw new Error('state_mismatch: possible CSRF attack');
  }
  sessionStorage.removeItem('docupost_oauth_state');

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: SSO_CONFIG.clientId,
    redirect_uri: SSO_CONFIG.redirectUri,
    code,
  });

  const response = await fetchFn(
    `${SSO_CONFIG.issuer}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    }
  );

  if (!response.ok) {
    throw new Error(`token_exchange_failed: ${response.status}`);
  }

  const tokenResponse = (await response.json()) as TokenResponse;
  storeTokens(tokenResponse);
  return tokenResponse;
}

/**
 * Renvoie le header Authorization Bearer pour les requêtes API.
 * Retourne un objet vide si non authentifié.
 */
export function getAuthHeader(): Record<string, string> {
  if (_accessToken) {
    return { Authorization: `Bearer ${_accessToken}` };
  }
  return {};
}

/**
 * Retourne le payload décodé du JWT courant, ou null si non authentifié.
 */
export function getCurrentUser(): JwtPayload | null {
  if (!_accessToken) return null;
  return decodeJwtPayload(_accessToken);
}

/**
 * Vérifie si le token JWT est expiré.
 */
export function isTokenExpired(): boolean {
  if (!_accessToken) return true;
  const payload = decodeJwtPayload(_accessToken);
  if (!payload) return true;
  return payload.exp * 1000 <= Date.now();
}

/**
 * Tente un refresh silencieux du token JWT.
 * Retourne false si le refresh échoue (session expirée → redirection SSO).
 */
export async function refreshAccessToken(
  fetchFn: typeof fetch = fetch
): Promise<boolean> {
  if (!_refreshToken) return false;

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: SSO_CONFIG.clientId,
    refresh_token: _refreshToken,
  });

  try {
    const response = await fetchFn(
      `${SSO_CONFIG.issuer}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const tokenResponse = (await response.json()) as TokenResponse;
    storeTokens(tokenResponse);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

/**
 * SC5 — Déconnexion : révoque la session côté SSO et redirige.
 */
export function logout(): void {
  const token = _accessToken;
  clearTokens();

  const params = new URLSearchParams({
    client_id: SSO_CONFIG.clientId,
    post_logout_redirect_uri: window.location.origin,
    id_token_hint: token ?? '',
  });

  window.location.href =
    `${SSO_CONFIG.issuer}/protocol/openid-connect/logout?${params.toString()}`;
}

/**
 * Gère les erreurs API — détecte 401/403 et déclenche le bon comportement.
 * - 401 : session expirée → tentative de refresh, sinon redirection SSO
 * - 403 : accès refusé (rôle insuffisant) → affichage message métier
 */
export async function handleApiError(status: number): Promise<'retry' | 'forbidden' | 'error'> {
  if (status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return 'retry';
    // Refresh échoué → retour à l'écran de connexion
    sessionStorage.setItem('docupost_return_path', window.location.pathname);
    return 'error';
  }
  if (status === 403) {
    return 'forbidden';
  }
  return 'error';
}

// ─── Helpers privés ───────────────────────────────────────────────────────────

function generateState(): string {
  const state = Math.random().toString(36).substring(2);
  sessionStorage.setItem('docupost_oauth_state', state);
  return state;
}

function storeTokens(tokenResponse: TokenResponse): void {
  _accessToken = tokenResponse.access_token;
  _refreshToken = tokenResponse.refresh_token;
  sessionStorage.setItem('docupost_access_token', tokenResponse.access_token);
  sessionStorage.setItem('docupost_refresh_token', tokenResponse.refresh_token);
}

function clearTokens(): void {
  _accessToken = null;
  _refreshToken = null;
  sessionStorage.removeItem('docupost_access_token');
  sessionStorage.removeItem('docupost_refresh_token');
  sessionStorage.removeItem('docupost_return_path');
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
