/**
 * useOfflineSyncState — État offline testable sans NetInfo (US-006)
 *
 * Encapsule la logique de synchronisation indépendamment de NetInfo.
 * Utilisé par useOfflineSync (qui gère l'écoute réseau)
 * et par les tests unitaires qui n'ont pas accès à NetInfo.
 */

import type { OfflineQueue } from '../domain/offlineQueue';

export interface OfflineSyncStateOptions {
  queue: OfflineQueue;
  syncFn: () => Promise<void>;
}

export function createOfflineSyncState({ queue, syncFn }: OfflineSyncStateOptions) {
  let _isSyncing = false;

  function getPendingCount(): number {
    return queue.getPendingCount();
  }

  function canCloseRoute(): boolean {
    return queue.canCloseRoute();
  }

  async function triggerSync(): Promise<void> {
    if (_isSyncing) return;
    if (queue.getPendingCount() === 0) return;

    _isSyncing = true;
    try {
      await syncFn();
    } finally {
      _isSyncing = false;
    }
  }

  function isSyncing(): boolean {
    return _isSyncing;
  }

  return {
    getPendingCount,
    canCloseRoute,
    triggerSync,
    isSyncing,
  };
}
