/**
 * Tests TDD — US-045 : Hint visuel swipe pour nouveaux utilisateurs
 *
 * Couvre via useSwipeHint hook :
 * - SC1 : hint affiché si swipeHintCount = 0 (absent = première utilisation)
 * - SC2 : hint affiché si swipeHintCount = 1 ou 2 (< SEUIL_HINT=3)
 * - SC3 : hint masqué si swipeHintCount >= SEUIL_HINT (3 utilisations réussies)
 * - SC4 : compteur incrémenté quand incrementerSwipeReussi() est appelé
 * - SC5 : compteur non incrémenté au simple chargement (pas d'appel setItem)
 * - SC6 : fail-safe — hint affiché si AsyncStorage indisponible (true par défaut)
 * - SC7 : hint masqué immédiatement quand le seuil est atteint après incrément
 *
 * Architecture :
 * - Hook useSwipeHint encapsule toute la logique (lisible + testable séparément)
 * - Clé AsyncStorage : @docupost/swipe_hint_count
 * - SEUIL_HINT = 3 (exportée et testable)
 */

import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSwipeHint, SWIPE_HINT_SEUIL, SWIPE_HINT_KEY } from '../hooks/useSwipeHint';

// Mock AsyncStorage via moduleNameMapper (défini dans package.json)
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockAsyncStorage.getItem.mockResolvedValue(null);
  mockAsyncStorage.setItem.mockResolvedValue(undefined);
});

// ─── Tests constants ──────────────────────────────────────────────────────────

describe('US-045 — useSwipeHint — constantes', () => {
  it('SWIPE_HINT_SEUIL est égal à 3', () => {
    expect(SWIPE_HINT_SEUIL).toBe(3);
  });

  it('SWIPE_HINT_KEY est la clé AsyncStorage correcte', () => {
    expect(SWIPE_HINT_KEY).toBe('@docupost/swipe_hint_count');
  });
});

// ─── Tests hook ──────────────────────────────────────────────────────────────

describe('US-045 — useSwipeHint — logique affichage', () => {

  // SC1 : hint visible si swipeHintCount = 0 (absent)
  it('SC1 — afficherHint=true si swipeHintCount est absent (null)', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSwipeHint());

    // État initial (fail-safe) : true
    expect(result.current.afficherHint).toBe(true);

    // Après lecture AsyncStorage
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.afficherHint).toBe(true);
  });

  // SC1 bis : hint visible si swipeHintCount = 0 (explicitement "0")
  it('SC1b — afficherHint=true si swipeHintCount = "0"', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce('0');

    const { result } = renderHook(() => useSwipeHint());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.afficherHint).toBe(true);
  });

  // SC2 : hint visible si swipeHintCount = 1
  it('SC2a — afficherHint=true si swipeHintCount = 1 (< seuil 3)', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce('1');

    const { result } = renderHook(() => useSwipeHint());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.afficherHint).toBe(true);
  });

  // SC2 : hint visible si swipeHintCount = 2
  it('SC2b — afficherHint=true si swipeHintCount = 2 (< seuil 3)', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce('2');

    const { result } = renderHook(() => useSwipeHint());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.afficherHint).toBe(true);
  });

  // SC3 : hint masqué si swipeHintCount = 3
  it('SC3 — afficherHint=false si swipeHintCount = 3 (seuil atteint)', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce('3');

    const { result } = renderHook(() => useSwipeHint());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.afficherHint).toBe(false);
  });

  // SC3 bis : hint masqué si swipeHintCount > 3
  it('SC3b — afficherHint=false si swipeHintCount = 10 (seuil largement dépassé)', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce('10');

    const { result } = renderHook(() => useSwipeHint());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.afficherHint).toBe(false);
  });

  // SC5 : compteur non incrémenté au simple montage
  it('SC5 — AsyncStorage.setItem non appelé au montage (pas d\'incrément automatique)', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce('1');

    renderHook(() => useSwipeHint());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Lecture oui, écriture non
    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(SWIPE_HINT_KEY);
    expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
  });

  // SC6 : fail-safe si AsyncStorage lève une exception
  it('SC6 — fail-safe : afficherHint=true si AsyncStorage.getItem lève une exception', async () => {
    mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('AsyncStorage unavailable'));

    const { result } = renderHook(() => useSwipeHint());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Fail-safe : le hint doit être affiché
    expect(result.current.afficherHint).toBe(true);
  });
});

describe('US-045 — useSwipeHint — incrément après swipe réussi', () => {

  // SC4 : incrément lors d'un swipe réussi
  it('SC4 — incrementerSwipeReussi incrémente le compteur dans AsyncStorage', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('1');
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSwipeHint());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.afficherHint).toBe(true); // compteur = 1, < 3

    // Swipe réussi
    await act(async () => {
      await result.current.incrementerSwipeReussi();
    });

    // AsyncStorage.setItem doit avoir été appelé avec la nouvelle valeur (2)
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(SWIPE_HINT_KEY, '2');
    // Le hint reste visible (compteur = 2 < 3)
    expect(result.current.afficherHint).toBe(true);
  });

  // SC7 : hint masqué immédiatement quand le seuil est atteint
  it('SC7 — afficherHint passe à false immédiatement quand le seuil 3 est atteint après incrément', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('2');
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSwipeHint());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.afficherHint).toBe(true); // compteur = 2, < 3

    // 3ème swipe réussi → seuil atteint
    await act(async () => {
      await result.current.incrementerSwipeReussi();
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(SWIPE_HINT_KEY, '3');
    // Le hint disparaît immédiatement
    expect(result.current.afficherHint).toBe(false);
  });

  // SC4b : fail-safe si AsyncStorage.setItem lève une exception lors de l'incrément
  it('SC4b — fail-safe : incrementerSwipeReussi silencieux si AsyncStorage.setItem échoue', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('1');
    mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage full'));

    const { result } = renderHook(() => useSwipeHint());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Pas d'erreur propagée
    await expect(
      act(async () => {
        await result.current.incrementerSwipeReussi();
      })
    ).resolves.not.toThrow();
  });
});
