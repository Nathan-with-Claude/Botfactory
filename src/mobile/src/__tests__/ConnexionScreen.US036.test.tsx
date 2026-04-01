/**
 * Tests unitaires — US-036 : Card SSO rétractable après la première connexion
 *
 * Couvre :
 *  - SC1 : première ouverture — card visible par défaut (hasConnectedOnce absent ou false)
 *  - SC2 : ouverture suivante — card repliée si hasConnectedOnce = true
 *  - SC3 : toggle manuel — déplier la card repliée via le chevron
 *  - SC4 : toggle manuel — replier la card ouverte via le chevron
 *  - SC5 : persistance préférence — état replié persiste en AsyncStorage
 *  - SC6 : connexion réussie — hasConnectedOnce écrit à true après onLoginSuccess
 *
 * Pattern : DI via props (loginFn, status, error) + mock AsyncStorage via moduleNameMapper.
 */

import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { ConnexionScreen } from '../screens/ConnexionScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Le mock est fourni via moduleNameMapper → src/__mocks__/asyncStorageMock.ts
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Helper : reset du mock store entre chaque test
beforeEach(() => {
  jest.clearAllMocks();
  // Réinitialiser le store interne du mock
  mockAsyncStorage.clear();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderConnexionScreen(overrides: Partial<{
  onLoginSuccess: () => void;
  loginFn: () => void | Promise<void>;
  status: 'unauthenticated' | 'loading' | 'authenticated' | 'error';
  error: string | null;
}> = {}) {
  return render(
    <ConnexionScreen
      onLoginSuccess={overrides.onLoginSuccess ?? jest.fn()}
      loginFn={overrides.loginFn ?? jest.fn()}
      status={overrides.status ?? 'unauthenticated'}
      error={overrides.error ?? null}
    />
  );
}

// ─── SC1 : première ouverture ─────────────────────────────────────────────────

describe('US-036 — SC1 : première ouverture (hasConnectedOnce absent)', () => {
  it('affiche la card SSO par défaut quand hasConnectedOnce est absent', async () => {
    // hasConnectedOnce non positionné → getItem retourne null
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { findByTestId } = renderConnexionScreen();

    // La card doit être visible
    await expect(findByTestId('card-sso-info')).resolves.toBeTruthy();
  });

  it('affiche le contenu de la card quand elle est visible (première ouverture)', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { findByTestId } = renderConnexionScreen();

    await expect(findByTestId('card-sso-contenu')).resolves.toBeTruthy();
  });

  it('affiche le chevron permettant de replier la card ouverte', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { findByTestId } = renderConnexionScreen();

    await expect(findByTestId('btn-toggle-card-sso')).resolves.toBeTruthy();
  });
});

// ─── SC2 : ouvertures suivantes ───────────────────────────────────────────────

describe('US-036 — SC2 : ouvertures suivantes (hasConnectedOnce = true)', () => {
  it('masque le contenu de la card quand hasConnectedOnce est true', async () => {
    mockAsyncStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'hasConnectedOnce') return 'true';
      if (key === 'cardSsoOuverte') return null; // pas de préférence explicite
      return null;
    });

    const { findByTestId, queryByTestId } = renderConnexionScreen();

    // Attendre que le composant ait chargé la préférence
    await findByTestId('btn-toggle-card-sso');

    expect(queryByTestId('card-sso-contenu')).toBeNull();
  });

  it('affiche toujours le chevron même quand la card est repliée', async () => {
    mockAsyncStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'hasConnectedOnce') return 'true';
      return null;
    });

    const { findByTestId } = renderConnexionScreen();

    await expect(findByTestId('btn-toggle-card-sso')).resolves.toBeTruthy();
  });

  it('affiche un titre ou label "Comment ça fonctionne ?" même quand la card est repliée', async () => {
    mockAsyncStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'hasConnectedOnce') return 'true';
      return null;
    });

    const { findByTestId } = renderConnexionScreen();

    // Le header de la card reste visible (seul le contenu est masqué)
    await expect(findByTestId('card-sso-header')).resolves.toBeTruthy();
  });
});

// ─── SC3 : toggle — déplier une card repliée ─────────────────────────────────

describe('US-036 — SC3 : toggle manuel — déplier la card repliée', () => {
  it('affiche le contenu de la card après appui sur le chevron (card initialement repliée)', async () => {
    mockAsyncStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'hasConnectedOnce') return 'true';
      return null;
    });

    const { findByTestId, queryByTestId } = renderConnexionScreen();

    const toggleBtn = await findByTestId('btn-toggle-card-sso');

    // Avant toggle : contenu masqué
    expect(queryByTestId('card-sso-contenu')).toBeNull();

    // Appui sur le chevron
    await act(async () => {
      fireEvent.press(toggleBtn);
    });

    // Après toggle : contenu visible
    expect(queryByTestId('card-sso-contenu')).toBeTruthy();
  });
});

// ─── SC4 : toggle — replier une card ouverte ─────────────────────────────────

describe('US-036 — SC4 : toggle manuel — replier la card ouverte', () => {
  it('masque le contenu de la card après appui sur le chevron (card initialement ouverte)', async () => {
    // Première ouverture : card visible
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { findByTestId, queryByTestId } = renderConnexionScreen();

    const toggleBtn = await findByTestId('btn-toggle-card-sso');

    // Attendre que la card soit visible
    await findByTestId('card-sso-contenu');

    // Replier
    await act(async () => {
      fireEvent.press(toggleBtn);
    });

    // Contenu masqué
    expect(queryByTestId('card-sso-contenu')).toBeNull();
  });
});

// ─── SC5 : persistance de la préférence ──────────────────────────────────────

describe('US-036 — SC5 : persistance préférence dans AsyncStorage', () => {
  it('persiste cardSsoOuverte = false dans AsyncStorage après repli manuel', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { findByTestId } = renderConnexionScreen();

    const toggleBtn = await findByTestId('btn-toggle-card-sso');
    await findByTestId('card-sso-contenu');

    await act(async () => {
      fireEvent.press(toggleBtn);
    });

    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('cardSsoOuverte', 'false');
    });
  });

  it('persiste cardSsoOuverte = true dans AsyncStorage après déploi manuel', async () => {
    mockAsyncStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'hasConnectedOnce') return 'true';
      return null;
    });

    const { findByTestId } = renderConnexionScreen();

    const toggleBtn = await findByTestId('btn-toggle-card-sso');

    await act(async () => {
      fireEvent.press(toggleBtn);
    });

    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('cardSsoOuverte', 'true');
    });
  });

  it('restaure la préférence cardSsoOuverte = false depuis AsyncStorage', async () => {
    mockAsyncStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'hasConnectedOnce') return 'true';
      if (key === 'cardSsoOuverte') return 'false';
      return null;
    });

    const { findByTestId, queryByTestId } = renderConnexionScreen();

    await findByTestId('btn-toggle-card-sso');

    expect(queryByTestId('card-sso-contenu')).toBeNull();
  });

  it('restaure la préférence cardSsoOuverte = true depuis AsyncStorage', async () => {
    mockAsyncStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'hasConnectedOnce') return 'true';
      if (key === 'cardSsoOuverte') return 'true';
      return null;
    });

    const { findByTestId } = renderConnexionScreen();

    await expect(findByTestId('card-sso-contenu')).resolves.toBeTruthy();
  });
});

// ─── SC6 : écriture hasConnectedOnce après connexion réussie ─────────────────

describe('US-036 — SC6 : écriture hasConnectedOnce après connexion réussie', () => {
  it('écrit hasConnectedOnce = true dans AsyncStorage quand status passe à authenticated', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const mockOnSuccess = jest.fn();
    const { rerender } = renderConnexionScreen({ onLoginSuccess: mockOnSuccess });

    // Simuler la connexion réussie (changement de statut)
    await act(async () => {
      rerender(
        <ConnexionScreen
          onLoginSuccess={mockOnSuccess}
          loginFn={jest.fn()}
          status="authenticated"
          error={null}
        />
      );
    });

    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('hasConnectedOnce', 'true');
    });
  });

  it('n\'écrit pas hasConnectedOnce si hasConnectedOnce est déjà true', async () => {
    mockAsyncStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'hasConnectedOnce') return 'true';
      return null;
    });

    const mockOnSuccess = jest.fn();
    const { rerender } = renderConnexionScreen({ onLoginSuccess: mockOnSuccess });

    await act(async () => {
      rerender(
        <ConnexionScreen
          onLoginSuccess={mockOnSuccess}
          loginFn={jest.fn()}
          status="authenticated"
          error={null}
        />
      );
    });

    await waitFor(() => {
      // setItem pour hasConnectedOnce ne doit PAS être appelé si déjà true
      const callsForHasConnected = mockAsyncStorage.setItem.mock.calls.filter(
        ([key]) => key === 'hasConnectedOnce'
      );
      expect(callsForHasConnected).toHaveLength(0);
    });
  });
});

// ─── Non-régression US-019 ────────────────────────────────────────────────────

describe('US-036 — Non-régression tests US-019 existants', () => {
  it('SC1 (US-019) — affiche toujours le bouton "Connexion Docaposte"', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { getByTestId } = renderConnexionScreen();

    expect(getByTestId('btn-connexion-sso')).toBeTruthy();
  });

  it('SC1 (US-019) — spinner visible en état loading', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { getByTestId } = renderConnexionScreen({ status: 'loading' });

    expect(getByTestId('spinner-connexion')).toBeTruthy();
  });
});
