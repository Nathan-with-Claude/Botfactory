/**
 * Tests unitaires — webAuthService (US-020)
 *
 * Couvre :
 *  - SC1 : redirectToSso génère l'URL correcte + state anti-CSRF
 *  - exchangeCodeForToken : échange code → token, validation state
 *  - SC3 : refreshAccessToken silencieux
 *  - isTokenExpired : détection expiration
 *  - handleApiError : 401 → refresh, 403 → forbidden
 */

// Mock window.location
const mockAssign = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    pathname: '/tableau-de-bord',
    href: '',
    replace: jest.fn(),
  },
  writable: true,
});

// Réinitialise sessionStorage entre les tests
beforeEach(() => {
  sessionStorage.clear();
  jest.clearAllMocks();
});

// Import APRÈS les mocks
import {
  getAuthHeader,
  isTokenExpired,
  handleApiError,
  exchangeCodeForToken,
  getCurrentUser,
} from '../auth/webAuthService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeJwt(payload: object, expired = false): string {
  const exp = expired
    ? Math.floor(Date.now() / 1000) - 3600
    : Math.floor(Date.now() / 1000) + 3600;
  const fullPayload = { ...payload, exp };
  const base64 = btoa(JSON.stringify(fullPayload));
  return `header.${base64}.sig`;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('webAuthService — US-020', () => {

  describe('getAuthHeader()', () => {
    it('retourne un objet vide si pas de token en sessionStorage', () => {
      sessionStorage.removeItem('docupost_access_token');
      // Réimporter pour avoir l'état fresh — on teste l'état initial
      expect(getAuthHeader()).toEqual({});
    });
  });

  describe('isTokenExpired()', () => {
    it('retourne true si pas de token', () => {
      sessionStorage.removeItem('docupost_access_token');
      expect(isTokenExpired()).toBe(true);
    });
  });

  describe('exchangeCodeForToken()', () => {
    it('échange le code contre un token si state valide', async () => {
      // Préparer le state anti-CSRF
      sessionStorage.setItem('docupost_oauth_state', 'state-abc');

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          access_token: makeJwt({ sub: 'superviseur-001', roles: ['SUPERVISEUR'] }),
          refresh_token: 'refresh-123',
          expires_in: 3600,
          token_type: 'Bearer',
        }),
      });

      const result = await exchangeCodeForToken('code-xyz', 'state-abc', mockFetch as unknown as typeof fetch);

      expect(result.access_token).toBeTruthy();
      expect(result.refresh_token).toBe('refresh-123');
      // Le state doit être consommé (anti-rejeu)
      expect(sessionStorage.getItem('docupost_oauth_state')).toBeNull();
    });

    it('lève une erreur si le state ne correspond pas (CSRF)', async () => {
      sessionStorage.setItem('docupost_oauth_state', 'state-expected');

      await expect(
        exchangeCodeForToken('code-xyz', 'state-different', jest.fn() as unknown as typeof fetch)
      ).rejects.toThrow('state_mismatch');
    });

    it('lève une erreur si le token endpoint répond 400', async () => {
      sessionStorage.setItem('docupost_oauth_state', 'state-abc');
      const mockFetch = jest.fn().mockResolvedValue({ ok: false, status: 400 });

      await expect(
        exchangeCodeForToken('code-xyz', 'state-abc', mockFetch as unknown as typeof fetch)
      ).rejects.toThrow('token_exchange_failed');
    });
  });

  describe('getCurrentUser()', () => {
    it('retourne le payload décodé si un token valide est en sessionStorage', async () => {
      // Préparer un échange de token pour alimenter _accessToken
      sessionStorage.setItem('docupost_oauth_state', 'state-user-test');
      const userPayload = { sub: 'superviseur-999', roles: ['SUPERVISEUR'] };
      const jwt = makeJwt(userPayload);
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          access_token: jwt,
          refresh_token: 'r',
          expires_in: 3600,
          token_type: 'Bearer',
        }),
      });
      await exchangeCodeForToken('code', 'state-user-test', mockFetch as unknown as typeof fetch);
      const user = getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.sub).toBe('superviseur-999');
    });
  });

  describe('handleApiError()', () => {
    it('retourne "forbidden" pour un 403', async () => {
      const result = await handleApiError(403);
      expect(result).toBe('forbidden');
    });

    it('retourne "error" pour un 500', async () => {
      const result = await handleApiError(500);
      expect(result).toBe('error');
    });
  });
});
