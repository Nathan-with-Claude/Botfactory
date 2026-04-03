/**
 * useNetworkStatus — Hook React Native (Bloquant-4 feedback 2026-03-30)
 *
 * Surveille l'état réseau en temps réel via NetInfo et expose un SyncStatus
 * compatible avec IndicateurSync et BandeauProgression.
 *
 * Mapping :
 *  - Connecté (ou état inconnu) → 'live'
 *  - Hors connexion             → 'offline'
 *
 * Injection de dépendance `netInfoSubscribeFn` pour les tests unitaires.
 * En l'absence d'injection, utilise NetInfo de @react-native-community/netinfo
 * si disponible, sinon reste à 'live' (dégradé gracieux).
 */

import { useEffect, useState } from 'react';
import type { SyncStatus } from '../components/design-system/IndicateurSync';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NetInfoState = {
  isConnected: boolean | null;
};

export type NetInfoUnsubscribe = (() => void) | { remove: () => void };

export type NetInfoSubscribeFn = (
  listener: (state: NetInfoState) => void
) => NetInfoUnsubscribe;

export interface UseNetworkStatusOptions {
  /** Injection pour les tests — remplace NetInfo.addEventListener */
  netInfoSubscribeFn?: NetInfoSubscribeFn;
}

/** Charge NetInfo dynamiquement pour éviter un crash si le module est absent */
function getNetInfoSubscribe(): NetInfoSubscribeFn | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NetInfo = require('@react-native-community/netinfo').default;
    if (NetInfo && typeof NetInfo.addEventListener === 'function') {
      return NetInfo.addEventListener;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Retourne le SyncStatus courant basé sur l'état réseau.
 * - 'live'    : connecté (ou état inconnu — fail-safe)
 * - 'offline' : hors connexion confirmée
 */
export function useNetworkStatus({
  netInfoSubscribeFn,
}: UseNetworkStatusOptions = {}): SyncStatus {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('live');

  useEffect(() => {
    const subscribe = netInfoSubscribeFn ?? getNetInfoSubscribe();

    // Si NetInfo n'est pas disponible (env de test sans mock), rester à 'live'
    if (!subscribe) return;

    const unsubscribe = subscribe((state) => {
      const connected = state.isConnected ?? true;
      setSyncStatus(connected ? 'live' : 'offline');
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      } else if (unsubscribe && typeof (unsubscribe as { remove?: () => void }).remove === 'function') {
        (unsubscribe as { remove: () => void }).remove();
      }
    };
  }, [netInfoSubscribeFn]);

  return syncStatus;
}
