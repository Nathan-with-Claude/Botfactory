/**
 * useOfflineSync — Hook React Native (US-006)
 *
 * Surveille le statut réseau via NetInfo et déclenche la synchronisation
 * automatiquement dès le retour de connexion.
 *
 * Expose :
 *  - pendingCount : nombre de commandes en attente (SC5)
 *  - isSyncing : vrai pendant la synchronisation
 *  - isOffline : vrai quand le réseau est indisponible (SC1)
 *  - canCloseRoute : vrai si la file est vide (SC4)
 *
 * Injection de dépendances via options pour les tests.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import type { OfflineQueue, CommandExecutor } from '../domain/offlineQueue';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseOfflineSyncOptions {
  queue: OfflineQueue;
  syncFn: () => Promise<void>;
}

export interface UseOfflineSyncResult {
  pendingCount: number;
  isSyncing: boolean;
  isOffline: boolean;
  canCloseRoute: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOfflineSync({
  queue,
  syncFn,
}: UseOfflineSyncOptions): UseOfflineSyncResult {
  const [pendingCount, setPendingCount] = useState<number>(queue.getPendingCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const wasOfflineRef = useRef<boolean>(false);
  const isSyncingRef = useRef<boolean>(false);

  /** Rafraîchit le compteur de commandes en attente */
  const refreshPendingCount = useCallback(() => {
    setPendingCount(queue.getPendingCount());
  }, [queue]);

  /** Déclenche la synchronisation */
  const triggerSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    if (queue.getPendingCount() === 0) return;

    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      await syncFn();
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
      refreshPendingCount();
    }
  }, [queue, syncFn, refreshPendingCount]);

  // US-056 — Charger la file persistée depuis AsyncStorage au montage
  useEffect(() => {
    void queue.initialize();
    refreshPendingCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Écoute les changements de connectivité
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;

      if (!connected) {
        setIsOffline(true);
        wasOfflineRef.current = true;
      } else {
        setIsOffline(false);
        // SC2 — Synchronisation automatique au retour de connexion
        if (wasOfflineRef.current) {
          wasOfflineRef.current = false;
          void triggerSync();
        }
      }
    });

    return () => unsubscribe();
  }, [triggerSync]);

  return {
    pendingCount,
    isSyncing,
    isOffline,
    canCloseRoute: queue.canCloseRoute(),
  };
}
