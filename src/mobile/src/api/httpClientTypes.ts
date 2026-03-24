/**
 * httpClientTypes — interfaces partagées httpClient / authStore (US-019)
 * Évite les imports circulaires entre authStore.ts et httpClient.ts.
 */

export interface AuthStore {
  getAuthHeader: () => Record<string, string>;
  isTokenExpired: () => boolean;
  refreshAccessToken: () => Promise<void>;
  logout: () => Promise<void>;
}
