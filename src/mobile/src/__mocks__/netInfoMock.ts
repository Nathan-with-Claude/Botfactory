/**
 * Mock @react-native-community/netinfo pour les tests Jest (US-052).
 * Remplace @react-native-community/netinfo via moduleNameMapper.
 */

const NetInfo = {
  addEventListener: jest.fn(() => jest.fn()), // retourne une fonction de désabonnement
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: null,
    })
  ),
  configure: jest.fn(),
};

export default NetInfo;
