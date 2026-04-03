/**
 * Tests Jest — useNetworkStatus (Bloquant-4 feedback 2026-03-30)
 *
 * Vérifie que le hook retourne le bon SyncStatus selon l'état réseau NetInfo.
 */

import { renderHook, act } from '@testing-library/react-native';
import { useNetworkStatus, NetInfoSubscribeFn } from '../hooks/useNetworkStatus';

/** Fabrique un NetInfo mockable qui retourne un unsubscribe callable */
function createMockSubscribe(initialConnected: boolean): {
  subscribe: NetInfoSubscribeFn;
  emit: (connected: boolean) => void;
} {
  let listener: ((state: { isConnected: boolean | null }) => void) | null = null;

  const subscribe: NetInfoSubscribeFn = (cb) => {
    listener = cb;
    // Émettre l'état initial
    cb({ isConnected: initialConnected });
    return () => { listener = null; };
  };

  const emit = (connected: boolean) => {
    listener?.({ isConnected: connected });
  };

  return { subscribe, emit };
}

describe('useNetworkStatus', () => {
  it('retourne "live" quand le réseau est connecté', () => {
    const { subscribe } = createMockSubscribe(true);
    const { result } = renderHook(() =>
      useNetworkStatus({ netInfoSubscribeFn: subscribe })
    );
    expect(result.current).toBe('live');
  });

  it('retourne "offline" quand le réseau est déconnecté', () => {
    const { subscribe } = createMockSubscribe(false);
    const { result } = renderHook(() =>
      useNetworkStatus({ netInfoSubscribeFn: subscribe })
    );
    expect(result.current).toBe('offline');
  });

  it('passe de "live" à "offline" quand la connexion tombe', () => {
    const { subscribe, emit } = createMockSubscribe(true);
    const { result } = renderHook(() =>
      useNetworkStatus({ netInfoSubscribeFn: subscribe })
    );

    expect(result.current).toBe('live');

    act(() => {
      emit(false);
    });

    expect(result.current).toBe('offline');
  });

  it('revient à "live" quand la connexion est rétablie', () => {
    const { subscribe, emit } = createMockSubscribe(false);
    const { result } = renderHook(() =>
      useNetworkStatus({ netInfoSubscribeFn: subscribe })
    );

    expect(result.current).toBe('offline');

    act(() => {
      emit(true);
    });

    expect(result.current).toBe('live');
  });

  it('traite isConnected=null comme connecté (valeur par défaut sécurisée)', () => {
    let listener: ((state: { isConnected: boolean | null }) => void) | null = null;
    const subscribe: NetInfoSubscribeFn = (cb) => {
      listener = cb;
      cb({ isConnected: null });
      return () => { listener = null; };
    };

    const { result } = renderHook(() =>
      useNetworkStatus({ netInfoSubscribeFn: subscribe })
    );

    expect(result.current).toBe('live');
  });
});
