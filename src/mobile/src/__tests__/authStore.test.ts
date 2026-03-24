/**
 * Tests unitaires — authStore (US-019)
 *
 * Couvre :
 *  - SC1 : connexion SSO réussie → token stocké, rôle LIVREUR
 *  - SC2 : erreur SSO → état erreur, pas de token
 *  - SC4 : refresh token automatique
 *  - SC5 : déconnexion → tokens effacés
 */

import {
  AuthState,
  createAuthStore,
  AuthStoreOptions,
} from '../store/authStore';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeOptions(overrides: Partial<AuthStoreOptions> = {}): AuthStoreOptions {
  return {
    authorize: jest.fn(),
    refresh: jest.fn(),
    revoke: jest.fn(),
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('authStore — US-019', () => {

  // SC1 — Connexion SSO réussie
  describe('login()', () => {
    it('stocke le token JWT et le refreshToken après connexion SSO réussie', async () => {
      const mockAuthorize = jest.fn().mockResolvedValue({
        accessToken: 'jwt-abc123',
        refreshToken: 'refresh-xyz',
        accessTokenExpirationDate: '2026-03-24T23:00:00Z',
        idToken: 'id-token-xxx',
      });
      const opts = makeOptions({ authorize: mockAuthorize });
      const store = createAuthStore(opts);

      await store.login();

      const state: AuthState = store.getState();
      expect(state.accessToken).toBe('jwt-abc123');
      expect(state.refreshToken).toBe('refresh-xyz');
      expect(state.status).toBe('authenticated');
      expect(state.error).toBeNull();
    });

    it('extrait le livreurId depuis le claim sub du JWT', async () => {
      // JWT payload : { sub: "livreur-042", roles: ["LIVREUR"] }
      const payload = btoa(JSON.stringify({ sub: 'livreur-042', roles: ['LIVREUR'] }));
      const fakeJwt = `header.${payload}.sig`;

      const mockAuthorize = jest.fn().mockResolvedValue({
        accessToken: fakeJwt,
        refreshToken: 'refresh-xyz',
        accessTokenExpirationDate: '2026-03-24T23:00:00Z',
        idToken: 'id-token-xxx',
      });
      const opts = makeOptions({ authorize: mockAuthorize });
      const store = createAuthStore(opts);

      await store.login();

      expect(store.getState().livreurId).toBe('livreur-042');
    });

    it('extrait le rôle LIVREUR depuis le claim roles', async () => {
      const payload = btoa(JSON.stringify({ sub: 'livreur-042', roles: ['LIVREUR'] }));
      const fakeJwt = `header.${payload}.sig`;

      const mockAuthorize = jest.fn().mockResolvedValue({
        accessToken: fakeJwt,
        refreshToken: 'refresh-xyz',
        accessTokenExpirationDate: '2026-03-24T23:00:00Z',
        idToken: 'id-token-xxx',
      });
      const store = createAuthStore(makeOptions({ authorize: mockAuthorize }));
      await store.login();

      expect(store.getState().role).toBe('LIVREUR');
    });
  });

  // SC2 — Erreur SSO
  describe('login() — erreur', () => {
    it('positionne status=error et conserve un message clair si le SSO échoue', async () => {
      const mockAuthorize = jest.fn().mockRejectedValue(new Error('invalid_credentials'));
      const store = createAuthStore(makeOptions({ authorize: mockAuthorize }));

      await store.login();

      const state = store.getState();
      expect(state.status).toBe('error');
      expect(state.accessToken).toBeNull();
      expect(state.error).toBeTruthy();
    });

    it('positionne status=error si le SSO est annulé par l\'utilisateur', async () => {
      const mockAuthorize = jest.fn().mockRejectedValue(new Error('user_cancelled_flow'));
      const store = createAuthStore(makeOptions({ authorize: mockAuthorize }));

      await store.login();

      expect(store.getState().status).toBe('error');
    });
  });

  // SC4 — Refresh token
  describe('refreshAccessToken()', () => {
    it('renouvelle le token JWT sans interaction utilisateur', async () => {
      const mockRefresh = jest.fn().mockResolvedValue({
        accessToken: 'jwt-new',
        refreshToken: 'refresh-new',
        accessTokenExpirationDate: '2026-03-25T23:00:00Z',
      });
      const store = createAuthStore(makeOptions({ refresh: mockRefresh }));
      // Positionne un état initial authentifié
      store._setState({
        status: 'authenticated',
        accessToken: 'jwt-old',
        refreshToken: 'refresh-old',
        accessTokenExpirationDate: '2026-03-24T00:00:00Z',
        livreurId: 'livreur-001',
        role: 'LIVREUR',
        error: null,
      });

      await store.refreshAccessToken();

      expect(store.getState().accessToken).toBe('jwt-new');
      expect(store.getState().refreshToken).toBe('refresh-new');
      expect(store.getState().status).toBe('authenticated');
      expect(mockRefresh).toHaveBeenCalledWith('refresh-old');
    });

    it('positionne status=unauthenticated si le refresh échoue', async () => {
      const mockRefresh = jest.fn().mockRejectedValue(new Error('refresh_expired'));
      const store = createAuthStore(makeOptions({ refresh: mockRefresh }));
      store._setState({
        status: 'authenticated',
        accessToken: 'jwt-old',
        refreshToken: 'refresh-old',
        accessTokenExpirationDate: '2026-03-24T00:00:00Z',
        livreurId: 'livreur-001',
        role: 'LIVREUR',
        error: null,
      });

      await store.refreshAccessToken();

      expect(store.getState().status).toBe('unauthenticated');
      expect(store.getState().accessToken).toBeNull();
    });
  });

  // SC5 — Déconnexion
  describe('logout()', () => {
    it('invalide le token JWT et vide l\'état auth', async () => {
      const mockRevoke = jest.fn().mockResolvedValue(undefined);
      const store = createAuthStore(makeOptions({ revoke: mockRevoke }));
      store._setState({
        status: 'authenticated',
        accessToken: 'jwt-abc',
        refreshToken: 'refresh-abc',
        accessTokenExpirationDate: '2026-03-25T00:00:00Z',
        livreurId: 'livreur-001',
        role: 'LIVREUR',
        error: null,
      });

      await store.logout();

      const state = store.getState();
      expect(state.status).toBe('unauthenticated');
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.livreurId).toBeNull();
      expect(mockRevoke).toHaveBeenCalledWith('jwt-abc');
    });

    it('efface le state même si la révocation échoue côté SSO', async () => {
      const mockRevoke = jest.fn().mockRejectedValue(new Error('network_error'));
      const store = createAuthStore(makeOptions({ revoke: mockRevoke }));
      store._setState({
        status: 'authenticated',
        accessToken: 'jwt-abc',
        refreshToken: 'refresh-abc',
        accessTokenExpirationDate: '2026-03-25T00:00:00Z',
        livreurId: 'livreur-001',
        role: 'LIVREUR',
        error: null,
      });

      await store.logout();

      expect(store.getState().status).toBe('unauthenticated');
    });
  });

  // getAuthHeader
  describe('getAuthHeader()', () => {
    it('retourne le header Authorization Bearer quand authentifié', () => {
      const store = createAuthStore(makeOptions());
      store._setState({
        status: 'authenticated',
        accessToken: 'jwt-abc123',
        refreshToken: 'r',
        accessTokenExpirationDate: '2026-03-25T00:00:00Z',
        livreurId: 'livreur-001',
        role: 'LIVREUR',
        error: null,
      });

      expect(store.getAuthHeader()).toEqual({ Authorization: 'Bearer jwt-abc123' });
    });

    it('retourne un objet vide si non authentifié', () => {
      const store = createAuthStore(makeOptions());
      expect(store.getAuthHeader()).toEqual({});
    });
  });

  // isTokenExpired
  describe('isTokenExpired()', () => {
    it('détecte un token expiré (date passée)', () => {
      const store = createAuthStore(makeOptions());
      store._setState({
        status: 'authenticated',
        accessToken: 'jwt',
        refreshToken: 'r',
        accessTokenExpirationDate: '2020-01-01T00:00:00Z', // passé
        livreurId: 'livreur-001',
        role: 'LIVREUR',
        error: null,
      });
      expect(store.isTokenExpired()).toBe(true);
    });

    it('retourne false pour un token encore valide', () => {
      const store = createAuthStore(makeOptions());
      store._setState({
        status: 'authenticated',
        accessToken: 'jwt',
        refreshToken: 'r',
        accessTokenExpirationDate: '2099-01-01T00:00:00Z', // futur
        livreurId: 'livreur-001',
        role: 'LIVREUR',
        error: null,
      });
      expect(store.isTokenExpired()).toBe(false);
    });
  });
});
