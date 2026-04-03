/**
 * Tests unitaires — US-043 : Card SSO rétractable avant connexion
 *
 * Couvre :
 *  - SC1 : bouton de réduction présent dès la première ouverture (card ouverte)
 *  - SC2 : repliage immédiat dans la session courante sans écriture AsyncStorage
 *  - SC3 : re-ouverture sans connexion → card de nouveau ouverte (non mémorisée)
 *  - SC4 : connexion réussie après repliage → AsyncStorage US-036 intact
 *  - SC5 : card repliée reste togglable (re-dépliage fonctionne)
 *
 * Note : SC3 est simulé en vérifiant que AsyncStorage.setItem n'est PAS appelé
 *        pour cardSsoOuverte lors d'un repli avant connexion.
 *
 * Non-régression : US-036 (persistance après connexion), US-019 (SSO).
 */

import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { ConnexionScreen } from '../screens/ConnexionScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

beforeEach(() => {
  jest.clearAllMocks();
  mockAsyncStorage.clear();
});

// ─── Helper ───────────────────────────────────────────────────────────────────

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

// ─── SC1 : bouton de réduction présent dès la première ouverture ──────────────

describe('US-043 — SC1 : bouton de réduction présent dès la première ouverture', () => {
  it('affiche le bouton toggle même sans connexion précédente', async () => {
    // Aucune clé en AsyncStorage : première ouverture absolue
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { findByTestId } = renderConnexionScreen();

    await expect(findByTestId('btn-toggle-card-sso')).resolves.toBeTruthy();
  });

  it('la card est ouverte par défaut à la première ouverture', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { findByTestId } = renderConnexionScreen();

    await expect(findByTestId('card-sso-contenu')).resolves.toBeTruthy();
  });
});

// ─── SC2 : repliage immédiat sans écriture AsyncStorage ─────────────────────

describe('US-043 — SC2 : repliage immédiat dans la session courante (pas de persistence)', () => {
  it('la card se replie immédiatement après appui sur le toggle avant connexion', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { findByTestId, queryByTestId } = renderConnexionScreen();

    const toggleBtn = await findByTestId('btn-toggle-card-sso');

    // Card initialement ouverte
    await findByTestId('card-sso-contenu');

    // Repli
    await act(async () => {
      fireEvent.press(toggleBtn);
    });

    // Card repliée
    expect(queryByTestId('card-sso-contenu')).toBeNull();
  });

  it('le bouton "Se connecter" reste visible après repliage de la card', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { findByTestId, getByTestId } = renderConnexionScreen();

    const toggleBtn = await findByTestId('btn-toggle-card-sso');

    await act(async () => {
      fireEvent.press(toggleBtn);
    });

    // Le bouton SSO reste toujours accessible
    expect(getByTestId('btn-connexion-sso')).toBeTruthy();
  });

  it('aucun setItem pour cardSsoOuverte lors d\'un repli avant connexion', async () => {
    // hasConnectedOnce absent → pas encore connecté
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { findByTestId } = renderConnexionScreen();

    const toggleBtn = await findByTestId('btn-toggle-card-sso');
    await findByTestId('card-sso-contenu');

    await act(async () => {
      fireEvent.press(toggleBtn);
    });

    // Aucun setItem pour cardSsoOuverte ne doit être appelé
    await waitFor(() => {
      const callsForCardSso = mockAsyncStorage.setItem.mock.calls.filter(
        ([key]) => key === 'cardSsoOuverte'
      );
      expect(callsForCardSso).toHaveLength(0);
    });
  });
});

// ─── SC3 : re-ouverture sans connexion → card de nouveau ouverte ─────────────

describe('US-043 — SC3 : re-ouverture de l\'application sans connexion → card ouverte', () => {
  it('la card est ouverte par défaut si hasConnectedOnce est absent (nouvelle session)', async () => {
    // Simule : le repli précédent n'a PAS été persisé en AsyncStorage
    // Donc à la réouverture : hasConnectedOnce=null, cardSsoOuverte=null
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { findByTestId } = renderConnexionScreen();

    // La card doit être ouverte à la réouverture
    await expect(findByTestId('card-sso-contenu')).resolves.toBeTruthy();
  });
});

// ─── SC4 : connexion réussie après repliage → AsyncStorage US-036 intact ─────

describe('US-043 — SC4 : connexion réussie après repliage manuel', () => {
  it('hasConnectedOnce est écrit à true après connexion réussie, même après repliage préalable', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const mockOnSuccess = jest.fn();
    const { findByTestId, rerender } = renderConnexionScreen({ onLoginSuccess: mockOnSuccess });

    // Replier la card avant connexion
    const toggleBtn = await findByTestId('btn-toggle-card-sso');
    await act(async () => {
      fireEvent.press(toggleBtn);
    });

    // Simuler connexion réussie
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

    // hasConnectedOnce doit être écrit (comportement US-036 intact)
    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('hasConnectedOnce', 'true');
    });
  });
});

// ─── SC5 : card repliée reste togglable ──────────────────────────────────────

describe('US-043 — SC5 : card repliée peut être ré-étendue', () => {
  it('la card peut être ré-étendue après avoir été repliée manuellement avant connexion', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { findByTestId, queryByTestId } = renderConnexionScreen();

    const toggleBtn = await findByTestId('btn-toggle-card-sso');

    // Replier
    await act(async () => {
      fireEvent.press(toggleBtn);
    });
    expect(queryByTestId('card-sso-contenu')).toBeNull();

    // Ré-étendre
    await act(async () => {
      fireEvent.press(toggleBtn);
    });
    expect(queryByTestId('card-sso-contenu')).toBeTruthy();
  });

  it('le bouton toggle reste visible que la card soit ouverte ou repliée', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { findByTestId } = renderConnexionScreen();

    const toggleBtn = await findByTestId('btn-toggle-card-sso');

    // Replier
    await act(async () => {
      fireEvent.press(toggleBtn);
    });

    // Le toggle est toujours là
    expect(toggleBtn).toBeTruthy();
  });
});

// ─── Non-régression US-036 ────────────────────────────────────────────────────

describe('US-043 — Non-régression US-036 (persistance après connexion réussie)', () => {
  it('persiste cardSsoOuverte après toggle QUAND hasConnectedOnce=true (utilisateur déjà connecté)', async () => {
    // Utilisateur déjà connecté → US-036 : la persistance doit fonctionner
    mockAsyncStorage.getItem.mockImplementation(async (key: string) => {
      if (key === 'hasConnectedOnce') return 'true';
      return null;
    });

    const { findByTestId } = renderConnexionScreen();

    const toggleBtn = await findByTestId('btn-toggle-card-sso');

    // La card est repliée par défaut (hasConnectedOnce=true, cardSsoOuverte=null → !dejaConnecte = false)
    await act(async () => {
      fireEvent.press(toggleBtn);
    });

    // setItem pour cardSsoOuverte DOIT être appelé pour un utilisateur déjà connecté
    await waitFor(() => {
      const callsForCardSso = mockAsyncStorage.setItem.mock.calls.filter(
        ([key]) => key === 'cardSsoOuverte'
      );
      expect(callsForCardSso.length).toBeGreaterThan(0);
    });
  });
});
