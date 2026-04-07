/**
 * IndicateurSync — Design System DocuPost (Mobile / React Native)
 *
 * Indicateur d'état de connexion et synchronisation.
 * Source design-system.md §3.6.
 *
 * Usage :
 *   <IndicateurSync syncStatus="live" />
 *   <IndicateurSync syncStatus="offline" pendingCount={3} />
 *
 * US-025 : Design System DocuPost.
 * US-062 : Compteur d'envois en attente.
 *
 * Comportement pendingCount :
 *  - LIVE, pendingCount = 0 ou absent : badge "LIVE" uniquement
 *  - OFFLINE, pendingCount > 0 : badge + "N envoi(s) en attente"
 *  - OFFLINE, pendingCount = 0 ou absent : badge "OFFLINE" uniquement
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius } from '../../theme/spacing';

export type SyncStatus = 'live' | 'offline' | 'polling' | 'syncing';

export interface IndicateurSyncProps {
  syncStatus: SyncStatus;
  /** US-062 — Nombre d'envois en attente de synchronisation */
  pendingCount?: number;
}

const LABELS: Record<SyncStatus, string> = {
  live:    'LIVE',
  offline: 'OFFLINE',
  polling: 'POLLING',
  syncing: 'SYNC',
};

const POINT_COLORS: Record<SyncStatus, string> = {
  live:    Colors.tertiaryContainer,
  offline: Colors.error,
  polling: Colors.avertissement,
  syncing: Colors.primary,
};

const LABEL_COLORS: Record<SyncStatus, string> = {
  live:    Colors.tertiaryContainer,
  offline: Colors.error,
  polling: Colors.avertissement,
  syncing: Colors.primary,
};

/**
 * IndicateurSync (React Native)
 */
export function IndicateurSync({ syncStatus, pendingCount }: IndicateurSyncProps): React.JSX.Element {
  const label = LABELS[syncStatus];
  const isSyncing = syncStatus === 'syncing';

  // US-062 — Afficher le compteur si offline ET des envois en attente
  const afficherCompteur = syncStatus === 'offline' && pendingCount !== undefined && pendingCount > 0;
  const libelleEnAttente = afficherCompteur
    ? `${pendingCount} envoi${pendingCount > 1 ? 's' : ''} en attente`
    : null;

  // Label d'accessibilité enrichi
  const labelAccessibilite = afficherCompteur
    ? `Pas de réseau — ${libelleEnAttente}`
    : `Synchronisation : ${label}`;

  return (
    <View
      testID="indicateur-sync"
      accessibilityLabel={labelAccessibilite}
      style={styles.container}
    >
      {isSyncing ? (
        <Text style={[styles.iconeSyncing, { color: POINT_COLORS[syncStatus] }]}>↻</Text>
      ) : (
        <View
          testID="sync-point"
          style={[styles.point, { backgroundColor: POINT_COLORS[syncStatus] }]}
        />
      )}
      <Text style={[styles.label, { color: LABEL_COLORS[syncStatus] }]}>
        {label}
      </Text>
      {afficherCompteur && (
        <Text
          testID="sync-pending-count"
          style={[styles.pendingCount, { color: LABEL_COLORS[syncStatus] }]}
        >
          {libelleEnAttente}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    gap: 4,
  },
  point: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  iconeSyncing: {
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  pendingCount: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
