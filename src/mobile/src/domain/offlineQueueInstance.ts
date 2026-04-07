/**
 * offlineQueueInstance — Singleton de la file offline (US-062)
 *
 * Instance partagée de l'OfflineQueue utilisée par toute l'application mobile.
 * Garantit qu'une seule file existe en mémoire (même état, même compteur).
 *
 * Utilisation :
 *   import { offlineQueue } from '../domain/offlineQueueInstance';
 *   // Puis : useOfflineSync({ queue: offlineQueue, syncFn: ... })
 *
 * L'instance doit être initialisée via offlineQueue.initialize() au démarrage
 * (ou via useOfflineSync qui appelle initialize() dans son useEffect).
 */

import { createOfflineQueue } from './offlineQueue';

export const offlineQueue = createOfflineQueue();
