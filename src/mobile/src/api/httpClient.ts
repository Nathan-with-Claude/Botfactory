/**
 * httpClient — Intercepteur HTTP avec Bearer token (US-019)
 *
 * Centralise l'injection du header Authorization dans tous les appels API.
 * Permet également le refresh automatique du token avant expiration.
 *
 * Usage :
 *   import { apiFetch } from './httpClient';
 *   const response = await apiFetch('/api/tournees/today');
 */

import { AuthStore } from './httpClientTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HttpClientOptions {
  /** Store d'authentification (injecté pour la testabilité) */
  authStore?: AuthStore;
  /** Fonction fetch à utiliser (injectée pour les tests) */
  fetchFn?: typeof fetch;
  /** URL de base de l'API */
  baseUrl?: string;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createHttpClient(options: HttpClientOptions = {}) {
  const {
    fetchFn = fetch,
    baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8081',
  } = options;
  const { authStore } = options;

  /**
   * Effectue un appel API avec le token JWT injecté automatiquement.
   * Si le token est expiré, tente un refresh silencieux avant l'appel.
   */
  async function apiFetch(
    path: string,
    init: RequestInit = {}
  ): Promise<Response> {
    // Refresh silencieux si token expiré
    if (authStore && authStore.isTokenExpired()) {
      await authStore.refreshAccessToken();
    }

    const authHeaders = authStore ? authStore.getAuthHeader() : {};

    const response = await fetchFn(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeaders,
        ...(init.headers as Record<string, string> | undefined),
      },
    });

    // SC3/US-020 — 401 → session expirée → forcer déconnexion
    if (response.status === 401 && authStore) {
      await authStore.logout();
    }

    return response;
  }

  return { apiFetch, baseUrl };
}

// ─── Instance par défaut (initialisée après le login) ────────────────────────
// Le store authStore est injecté depuis App.tsx ou le NavigationContainer.
// En dev, le MockJwtAuthFilter backend accepte toutes les requêtes sans token.
