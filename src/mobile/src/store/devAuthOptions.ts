/**
 * devAuthOptions — Options d'authentification mock pour le mode développement (US-047)
 *
 * Injecte des fonctions authorize/refresh/revoke factices dans createAuthStore.
 * Le JWT produit est un faux JWT (non signé) lisible par decodeJwtPayload.
 *
 * Usage :
 *   import { devAuthOptions, setDevLivreurId } from './devAuthOptions';
 *   setDevLivreurId('livreur-002');
 *   const store = createAuthStore(devAuthOptions);
 *   await store.login();
 *
 * NE PAS UTILISER en production.
 */

import type { AppAuthResult, AppAuthRefreshResult, AuthStoreOptions } from './authStore';

// ─── État interne (closure mutable) ──────────────────────────────────────────

let _selectedLivreurId: string = 'livreur-001';

/**
 * Définit le livreurId à utiliser pour la prochaine connexion dev.
 * Doit être appelé avant authStore.login().
 */
export function setDevLivreurId(id: string): void {
  _selectedLivreurId = id;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildFakeJwt(livreurId: string): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: livreurId, roles: ['LIVREUR'] }));
  const signature = 'devsignature';
  return `${header}.${payload}.${signature}`;
}

function buildExpiration8h(): string {
  const d = new Date();
  d.setHours(d.getHours() + 8);
  return d.toISOString();
}

// ─── Options mock ─────────────────────────────────────────────────────────────

export const devAuthOptions: AuthStoreOptions = {
  authorize: (): Promise<AppAuthResult> => {
    const livreurId = _selectedLivreurId;
    const accessToken = buildFakeJwt(livreurId);
    return Promise.resolve({
      accessToken,
      refreshToken: `dev-refresh-${livreurId}`,
      accessTokenExpirationDate: buildExpiration8h(),
    });
  },

  refresh: (refreshToken: string): Promise<AppAuthRefreshResult> => {
    // Extraire le livreurId depuis le refresh token dev (format : dev-refresh-{id})
    const livreurId = refreshToken.replace('dev-refresh-', '') || _selectedLivreurId;
    const accessToken = buildFakeJwt(livreurId);
    return Promise.resolve({
      accessToken,
      refreshToken,
      accessTokenExpirationDate: buildExpiration8h(),
    });
  },

  revoke: (_accessToken: string): Promise<void> => {
    // Révocation no-op en mode dev
    return Promise.resolve();
  },
};
