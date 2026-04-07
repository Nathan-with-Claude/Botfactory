/**
 * Mock react-native-app-auth pour les tests Jest (US-052).
 * Remplace react-native-app-auth via moduleNameMapper.
 */

const AppAuth = {
  authorize: jest.fn(() =>
    Promise.resolve({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      accessTokenExpirationDate: new Date(Date.now() + 3600000).toISOString(),
      idToken: 'mock-id-token',
    })
  ),
  refresh: jest.fn(() =>
    Promise.resolve({
      accessToken: 'mock-access-token-refreshed',
      refreshToken: 'mock-refresh-token-refreshed',
      accessTokenExpirationDate: new Date(Date.now() + 3600000).toISOString(),
    })
  ),
  revoke: jest.fn(() => Promise.resolve()),
  logout: jest.fn(() => Promise.resolve()),
};

export default AppAuth;
export const { authorize, refresh, revoke, logout } = AppAuth;
