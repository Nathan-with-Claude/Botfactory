/**
 * ChipContrainte — Design System DocuPost (Web)
 *
 * Étiquette compacte pour les contraintes d'un colis.
 * Source design-system.md §3.5.
 *
 * Usage :
 *   <ChipContrainte type="horaire" valeur="14h00" />
 *   <ChipContrainte type="fragile" />
 *   <ChipContrainte type="document_sensible" />
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import './ChipContrainte.css';

export type TypeContrainte = 'horaire' | 'fragile' | 'document_sensible';

export interface ChipContrainteProps {
  /** Type de contrainte — détermine l'icône et la couleur */
  type: TypeContrainte;
  /** Valeur optionnelle — ex : "14h00" pour les contraintes horaires */
  valeur?: string;
}

const LABELS: Record<TypeContrainte, string> = {
  horaire: 'Avant',
  fragile: 'Fragile',
  document_sensible: 'Document sensible',
};

const ICONS: Record<TypeContrainte, string> = {
  horaire: '⚑',
  fragile: '⚑',
  document_sensible: '⚑',
};

/**
 * ChipContrainte
 *
 * Structure :
 * ┌──────────────┐
 * │ ⚑ Avant 14h  │   fond --color-avertissement-leger, texte --color-avertissement
 * └──────────────┘
 */
export function ChipContrainte({ type, valeur }: ChipContrainteProps): React.JSX.Element {
  const baseLabel = LABELS[type];
  const displayLabel = type === 'horaire' && valeur
    ? `${baseLabel} ${valeur}`
    : baseLabel;

  return (
    <span
      className={`chip-contrainte chip-contrainte--${type}`}
      data-testid="chip-contrainte"
      data-type={type}
      role="note"
      aria-label={displayLabel}
    >
      <span className="chip-contrainte__icone" aria-hidden="true">
        {ICONS[type]}
      </span>
      <span className="chip-contrainte__label">{displayLabel}</span>
    </span>
  );
}
