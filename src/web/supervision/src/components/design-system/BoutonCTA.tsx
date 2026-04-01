/**
 * BoutonCTA — Design System DocuPost (Web)
 *
 * Bouton d'action principal et secondaire.
 * Source design-system.md §3.4 et §6 (états interactifs).
 *
 * Usage :
 *   <BoutonCTA variant="primaire" size="md" label="LIVRER CE COLIS" onPress={handleLivrer} />
 *   <BoutonCTA variant="secondaire" size="md" label="DECLARER UN ECHEC" onPress={handleEchec} />
 *   <BoutonCTA variant="primaire" size="md" label="Enregistrer" onPress={handleSave} loading />
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import './BoutonCTA.css';

export type BoutonVariant = 'primaire' | 'secondaire' | 'tertiaire' | 'outline' | 'danger';
export type BoutonSize = 'sm' | 'md' | 'lg';

export interface BoutonCTAProps {
  /** Apparence visuelle du bouton */
  variant: BoutonVariant;
  /** Taille du bouton */
  size: BoutonSize;
  /** Texte du bouton */
  label: string;
  /** Icône optionnelle */
  icon?: React.ReactNode;
  /** Position de l'icône */
  iconPosition?: 'left' | 'right';
  /** Désactive le bouton (opacity 0.4, cursor not-allowed, aria-disabled) */
  disabled?: boolean;
  /** Affiche un spinner et désactive le bouton */
  loading?: boolean;
  /** Gestionnaire du clic */
  onPress: () => void;
  /** Type HTML natif du bouton */
  type?: 'button' | 'submit' | 'reset';
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * BoutonCTA
 *
 * Variantes :
 * [LIVRER CE COLIS →]     primaire — fond --color-primaire, texte blanc
 * [DECLARER UN ECHEC]     secondaire — bordure --color-alerte, texte --color-alerte
 * [Voir détail]           tertiaire — texte --color-lien, pas de fond ni bordure
 * [Affecter]              outline — bordure --color-primaire, texte --color-primaire
 * [Supprimer]             danger — fond --color-alerte, texte blanc
 */
export function BoutonCTA({
  variant,
  size,
  label,
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  onPress,
  type = 'button',
  className,
}: BoutonCTAProps): React.JSX.Element {
  const isDisabled = disabled || loading;

  function handleClick(): void {
    if (!isDisabled) {
      onPress();
    }
  }

  return (
    <button
      type={type}
      className={[
        'bouton-cta',
        `bouton-cta--${variant}`,
        `bouton-cta--${size}`,
        isDisabled ? 'bouton-cta--disabled' : '',
        loading ? 'bouton-cta--loading' : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
      data-testid="bouton-cta"
      data-variant={variant}
      data-size={size}
      disabled={isDisabled}
      aria-disabled={isDisabled ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      onClick={handleClick}
    >
      {loading ? (
        <span
          className="bouton-cta__spinner"
          data-testid="bouton-spinner"
          aria-label="Chargement en cours"
          role="status"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="bouton-cta__icon bouton-cta__icon--left" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="bouton-cta__label">{label}</span>
          {icon && iconPosition === 'right' && (
            <span className="bouton-cta__icon bouton-cta__icon--right" aria-hidden="true">
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  );
}
