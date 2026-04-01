/**
 * IndicateurSync — Design System DocuPost (Web)
 *
 * Indicateur d'état de connexion et de synchronisation.
 * Source design-system.md §3.6.
 *
 * Usage :
 *   <IndicateurSync syncStatus="live" />
 *   <IndicateurSync syncStatus="offline" />
 *   <IndicateurSync syncStatus="polling" />
 *   <IndicateurSync syncStatus="syncing" />
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import './IndicateurSync.css';

export type SyncStatus = 'live' | 'offline' | 'polling' | 'syncing';

export interface IndicateurSyncProps {
  /** État de la synchronisation */
  syncStatus: SyncStatus;
}

const LABELS: Record<SyncStatus, string> = {
  live: 'LIVE',
  offline: 'OFFLINE',
  polling: 'POLLING',
  syncing: 'SYNC',
};

/**
 * IndicateurSync
 *
 * États :
 * [● LIVE]        point vert animé — WebSocket actif
 * [● POLLING]     point orange — fallback polling 30s
 * [● OFFLINE]     point rouge — hors connexion
 * [↻ SYNC]        icône rotation — synchronisation en cours
 */
export function IndicateurSync({ syncStatus }: IndicateurSyncProps): React.JSX.Element {
  const label = LABELS[syncStatus];
  const isSyncing = syncStatus === 'syncing';

  return (
    <span
      className={`indicateur-sync indicateur-sync--${syncStatus}`}
      data-testid="indicateur-sync"
      data-status={syncStatus}
      aria-label={`Synchronisation : ${label}`}
    >
      {isSyncing ? (
        <span
          className="indicateur-sync__icone-rotation"
          data-testid="sync-icone-rotation"
          aria-hidden="true"
        >
          ↻
        </span>
      ) : (
        <span
          className={`indicateur-sync__point${syncStatus === 'live' ? ' pulse-live' : ''}`}
          data-testid="sync-point"
          data-status={syncStatus}
          aria-hidden="true"
        />
      )}
      <span className="indicateur-sync__label">{label}</span>
    </span>
  );
}
