/**
 * SyncIndicator — Composant d'indicateur de synchronisation offline (US-006)
 *
 * Affiche :
 *  - SC1 : bandeau orange "Hors connexion — Données locales" quand hors ligne
 *  - SC5 : indicateur "Synchronisation en attente — X action(s)" si file non vide
 *  - SC4 : spinner de synchronisation pendant le replay
 *
 * Composant pur — reçoit l'état via props (pas d'accès direct au store).
 */

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SyncIndicatorProps {
  /** true si le réseau est indisponible (SC1) */
  isOffline: boolean;
  /** Nombre de commandes en attente de synchronisation (SC5) */
  pendingCount: number;
  /** true pendant la synchronisation en cours (SC4) */
  isSyncing: boolean;
}

// ─── Composant ───────────────────────────────────────────────────────────────

export function SyncIndicator({
  isOffline,
  pendingCount,
  isSyncing,
}: SyncIndicatorProps): React.JSX.Element | null {

  // SC5 — Aucun indicateur si tout est normal (connecté + file vide)
  if (!isOffline && pendingCount === 0) {
    return null;
  }

  const pluriel = pendingCount > 1 ? 'actions' : 'action';

  return (
    <View style={styles.container}>
      {/* SC1 — Bandeau hors connexion */}
      {isOffline && (
        <View testID="bandeau-hors-connexion" style={styles.bandeauOffline}>
          <Text style={styles.bandeauTexte}>
            Hors connexion — Données locales
          </Text>
        </View>
      )}

      {/* SC5 — Indicateur de synchronisation en attente */}
      {pendingCount > 0 && (
        <View testID="indicateur-sync" style={styles.indicateurSync}>
          {isSyncing ? (
            <>
              <ActivityIndicator
                testID="spinner-sync"
                size="small"
                color="#FFFFFF"
                style={styles.spinner}
              />
              <Text style={styles.syncTexte}>
                Synchronisation en cours...
              </Text>
            </>
          ) : (
            <Text style={styles.syncTexte}>
              Synchronisation en attente — {pendingCount} {pluriel}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  bandeauOffline: {
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bandeauTexte: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '600',
  },
  indicateurSync: {
    backgroundColor: '#374151',
    paddingVertical: 5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  syncTexte: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '500',
  },
  spinner: {
    marginRight: 4,
  },
});
