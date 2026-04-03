/**
 * BadgeStatut — Design System DocuPost (Web)
 *
 * Étiquette colorée indiquant le statut d'un colis ou d'une tournée.
 * Source design-system.md §3.1.
 *
 * Usage :
 *   <BadgeStatut variant="succes" label="LIVRE" />
 *   <BadgeStatut variant="alerte" label="ECHEC" size="md" pulse />
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import './BadgeStatut.css';

export type BadgeVariant = 'succes' | 'alerte' | 'avertissement' | 'info' | 'neutre';
export type BadgeSize = 'sm' | 'md';

export interface BadgeStatutProps {
  /** Sémantique couleur du badge — correspond aux tokens design-system.md §3.1 */
  variant: BadgeVariant;
  /** Texte affiché dans le badge. Ex : "A LIVRER", "AFFECTEE" */
  label: string;
  /** Taille du badge. Par défaut : "sm" (20px). */
  size?: BadgeSize;
  /** Afficher le point coloré. Par défaut : true. */
  icon?: boolean;
  /** Animation clignotante — pour les statuts critiques "A RISQUE". */
  pulse?: boolean;
}

/**
 * BadgeStatut
 *
 * Rendu visuel :
 * ┌──────────────┐
 * │ ● A LIVRER   │   fond --color-info-leger, texte --color-info, bords 4px
 * └──────────────┘
 */
export function BadgeStatut({
  variant,
  label,
  size = 'sm',
  icon = true,
  pulse = false,
}: BadgeStatutProps): React.JSX.Element {
  return (
    <span
      className={`badge-statut badge-statut--${variant} badge-statut--${size}`}
      data-testid="badge-statut"
      data-variant={variant}
      data-size={size}
      role="status"
      aria-label={label}
    >
      {icon && (
        <span
          className={`badge-statut__point${pulse ? ' pulse-live' : ''}`}
          data-testid="badge-point"
          aria-hidden="true"
        />
      )}
      <span className="badge-statut__label">{label}</span>
    </span>
  );
}
