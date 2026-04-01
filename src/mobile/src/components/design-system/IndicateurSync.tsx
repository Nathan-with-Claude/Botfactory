/**
 * IndicateurSync — Design System DocuPost (Mobile / React Native)
 *
 * Indicateur d'état de connexion et synchronisation.
 * Source design-system.md §3.6.
 *
 * Usage :
 *   <IndicateurSync syncStatus="live" />
 *   <IndicateurSync syncStatus="offline" />
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius } from '../../theme/spacing';

export type SyncStatus = 'live' | 'offline' | 'polling' | 'syncing';

export interface IndicateurSyncProps {
  syncStatus: SyncStatus;
}

const LABELS: Record<SyncStatus, string> = {
  live:    'LIVE',
  offline: 'OFFLINE',
  polling: 'POLLING',
  syncing: 'SYNC',
};

const POINT_COLORS: Record<SyncStatus, string> = {
  live:    Colors.succes,
  offline: Colors.alerte,
  polling: Colors.avertissement,
  syncing: Colors.primaire,
};

const LABEL_COLORS: Record<SyncStatus, string> = {
  live:    Colors.succes,
  offline: Colors.alerte,
  polling: Colors.avertissement,
  syncing: Colors.primaire,
};

/**
 * IndicateurSync (React Native)
 */
export function IndicateurSync({ syncStatus }: IndicateurSyncProps): React.JSX.Element {
  const label = LABELS[syncStatus];
  const isSyncing = syncStatus === 'syncing';

  return (
    <View
      testID="indicateur-sync"
      accessibilityLabel={`Synchronisation : ${label}`}
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
});
