/**
 * BandeauProgression — Design System DocuPost (Web)
 *
 * Indicateur visuel de l'avancement d'une tournée.
 * Source design-system.md §3.3.
 *
 * Usage :
 *   <BandeauProgression
 *     resteLivrer={7} total={10} pourcentage={30}
 *     statut="encours" syncStatus="live"
 *     finEstimee="14:30"
 *   />
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import { IndicateurSync, SyncStatus } from './IndicateurSync';
import './BandeauProgression.css';

export type StatutProgression = 'encours' | 'arisque' | 'cloturee';

export interface BandeauProgressionProps {
  /** Nombre de colis restant à livrer */
  resteLivrer: number;
  /** Nombre total de colis de la tournée */
  total: number;
  /** Pourcentage d'avancement (0-100) */
  pourcentage: number;
  /** Heure de fin estimée (format "HH:MM") — optionnelle */
  finEstimee?: string;
  /** Statut de la tournée — détermine la couleur de la barre */
  statut: StatutProgression;
  /** État de la synchronisation */
  syncStatus: SyncStatus;
}

/**
 * BandeauProgression
 *
 * Structure :
 * ┌─────────────────────────────────────┐
 * │ Reste à livrer : X / Y              │  Label
 * │ ████████░░░░  63 %                  │  Barre de progression
 * │ Fin estimée : HH:MM  [●LIVE]        │  Meta + indicateur sync
 * └─────────────────────────────────────┘
 */
export function BandeauProgression({
  resteLivrer,
  total,
  pourcentage,
  finEstimee,
  statut,
  syncStatus,
}: BandeauProgressionProps): React.JSX.Element {
  const clampedPourcentage = Math.min(100, Math.max(0, pourcentage));

  return (
    <div className={`bandeau-progression bandeau-progression--${statut}`} data-testid="bandeau-progression">
      {/* Ligne 1 : compteur */}
      <div className="bandeau-progression__entete">
        <span className="bandeau-progression__compteur" data-testid="bandeau-compteur">
          Reste à livrer : <strong>{resteLivrer} / {total}</strong>
        </span>
        <IndicateurSync syncStatus={syncStatus} />
      </div>

      {/* Ligne 2 : barre de progression */}
      <div className="bandeau-progression__barre-fond" role="progressbar" aria-valuenow={clampedPourcentage} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="bandeau-progression__barre-remplie"
          data-testid="bandeau-barre"
          data-statut={statut}
          style={{ width: `${clampedPourcentage}%` }}
        />
      </div>

      {/* Ligne 3 : méta */}
      <div className="bandeau-progression__meta">
        <span className="bandeau-progression__pourcentage">{clampedPourcentage} %</span>
        {finEstimee && (
          <span className="bandeau-progression__fin-estimee" data-testid="bandeau-fin-estimee">
            Fin estimée : {finEstimee}
          </span>
        )}
      </div>
    </div>
  );
}
