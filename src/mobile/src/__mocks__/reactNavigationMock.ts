/**
 * Mock react-navigation/native pour les tests Jest (US-055)
 *
 * Évite les erreurs "No navigation context" dans les tests unitaires
 * des composants qui utilisent useNavigation().
 *
 * Usage dans jest.config (moduleNameMapper) :
 *   "@react-navigation/native": "<rootDir>/src/__mocks__/reactNavigationMock.ts"
 */

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReplace = jest.fn();
const mockReset = jest.fn();

const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  replace: mockReplace,
  reset: mockReset,
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  canGoBack: jest.fn(() => false),
  isFocused: jest.fn(() => true),
  getParent: jest.fn(() => undefined),
  getState: jest.fn(() => ({})),
};

export const useNavigation = jest.fn(() => mockNavigation);
export const useRoute = jest.fn(() => ({ params: {} }));
export const useIsFocused = jest.fn(() => true);
export const useFocusEffect = jest.fn((cb: () => void) => cb());
export const NavigationContainer = ({ children }: { children: React.ReactNode }) => children;

// Réexporter les mocks pour les assertions dans les tests
export { mockNavigate, mockGoBack, mockReplace };

// eslint-disable-next-line @typescript-eslint/no-var-requires
const React = require('react');

export default {
  useNavigation,
  useRoute,
  useIsFocused,
  useFocusEffect,
  NavigationContainer,
};
