/**
 * CardTypeInstruction — Design System DocuPost (Web)
 *
 * Sélecteur de type d'instruction pour W-03.
 * Source design-system.md §6 (sélecteurs).
 *
 * Usage :
 *   <CardTypeInstruction
 *     type="PRIORITE"
 *     label="Prioriser ce colis"
 *     description="Le colis sera traité en premier."
 *     selected={selectedType === 'PRIORITE'}
 *     onSelect={setSelectedType}
 *   />
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import './CardTypeInstruction.css';

export type TypeInstruction = 'PRIORITE' | 'ISOLATION' | 'REPLANIFICATION' | 'MESSAGE';

export interface CardTypeInstructionProps {
  /** Identifiant du type d'instruction */
  type: TypeInstruction;
  /** Libellé affiché */
  label: string;
  /** Description optionnelle */
  description?: string;
  /** Icône optionnelle (ReactNode) */
  icon?: React.ReactNode;
  /** Carte sélectionnée */
  selected: boolean;
  /** Callback de sélection — passe le type */
  onSelect: (type: TypeInstruction) => void;
}

/**
 * CardTypeInstruction
 *
 * États visuels (design-system.md §6 sélecteurs) :
 * Default   — fond blanc, bordure --color-bordure-neutre 1px
 * Selected  — fond --color-primaire-leger, bordure --color-primaire 2px
 * Hover     — fond --color-surface-secondary
 */
export function CardTypeInstruction({
  type,
  label,
  description,
  icon,
  selected,
  onSelect,
}: CardTypeInstructionProps): React.JSX.Element {
  return (
    <button
      className={`card-type-instruction${selected ? ' card-type-instruction--selected' : ''}`}
      data-testid="card-type-instruction"
      data-type={type}
      data-selected={String(selected)}
      onClick={() => onSelect(type)}
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
    >
      {icon && (
        <span className="card-type-instruction__icone" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="card-type-instruction__label">{label}</span>
      {description && (
        <span className="card-type-instruction__description">{description}</span>
      )}
    </button>
  );
}
