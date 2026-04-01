/**
 * CardTypePreuve — Design System DocuPost (Web)
 *
 * Sélecteur de type de preuve pour les écrans de capture.
 * Source design-system.md §6 (sélecteurs).
 *
 * Usage :
 *   <CardTypePreuve
 *     type="SIGNATURE"
 *     label="Signature"
 *     selected={selectedType === 'SIGNATURE'}
 *     onSelect={setSelectedType}
 *   />
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import './CardTypePreuve.css';

export type TypePreuve = 'SIGNATURE' | 'PHOTO' | 'TIERS_IDENTIFIE' | 'DEPOT_SECURISE';

export interface CardTypePreuveProps {
  /** Type de preuve */
  type: TypePreuve;
  /** Libellé affiché */
  label: string;
  /** Description optionnelle */
  description?: string;
  /** Icône optionnelle */
  icon?: React.ReactNode;
  /** Carte sélectionnée */
  selected: boolean;
  /** Callback de sélection */
  onSelect: (type: TypePreuve) => void;
}

/**
 * CardTypePreuve
 *
 * Même logique visuelle que CardTypeInstruction (design-system.md §6).
 */
export function CardTypePreuve({
  type,
  label,
  description,
  icon,
  selected,
  onSelect,
}: CardTypePreuveProps): React.JSX.Element {
  return (
    <button
      className={`card-type-preuve${selected ? ' card-type-preuve--selected' : ''}`}
      data-testid="card-type-preuve"
      data-type={type}
      data-selected={String(selected)}
      onClick={() => onSelect(type)}
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
    >
      {icon && (
        <span className="card-type-preuve__icone" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="card-type-preuve__label">{label}</span>
      {description && (
        <span className="card-type-preuve__description">{description}</span>
      )}
    </button>
  );
}
