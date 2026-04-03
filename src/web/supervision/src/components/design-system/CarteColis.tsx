/**
 * CarteColis — Design System DocuPost (Web)
 *
 * Carte représentant un colis dans les listes de supervision.
 * Source design-system.md §3.2.
 *
 * Usage :
 *   <CarteColis
 *     colisId="C-001"
 *     statut="A_LIVRER"
 *     adresse="12 Rue de la Paix, Paris 75001"
 *     destinataire="Jean Dupont"
 *     onPress={() => navigate(`/colis/${colisId}`)}
 *   />
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import { BadgeStatut, BadgeVariant } from './BadgeStatut';
import { ChipContrainte, TypeContrainte } from './ChipContrainte';
import './CarteColis.css';

export type StatutColisVue = 'A_LIVRER' | 'LIVRE' | 'ECHEC' | 'A_REPRESENTER';

export interface CarteColisProps {
  colisId: string;
  statut: StatutColisVue;
  adresse: string;
  destinataire: string;
  appartement?: string;
  contraintes?: TypeContrainte[];
  horodatage?: string;
  motif?: string;
  onPress?: () => void;
}

const STATUT_VARIANT: Record<StatutColisVue, BadgeVariant> = {
  A_LIVRER:      'info',
  LIVRE:         'succes',
  ECHEC:         'alerte',
  A_REPRESENTER: 'avertissement',
};

const STATUT_LABELS: Record<StatutColisVue, string> = {
  A_LIVRER:      'A LIVRER',
  LIVRE:         'LIVRE',
  ECHEC:         'ECHEC',
  A_REPRESENTER: 'A REPRESENTER',
};

/**
 * CarteColis
 *
 * Structure :
 * ┌─────────────────────────────────────┐
 * │ [BadgeStatut]       [ChipContrainte]│  Ligne 1
 * │ Adresse principale                  │  Ligne 2 — texte gras
 * │ Destinataire — appartement          │  Ligne 3 — texte secondaire
 * └─────────────────────────────────────┘
 */
export function CarteColis({
  colisId,
  statut,
  adresse,
  destinataire,
  appartement,
  contraintes = [],
  horodatage,
  motif,
  onPress,
}: CarteColisProps): React.JSX.Element {
  const variant = STATUT_VARIANT[statut];
  const label = STATUT_LABELS[statut];
  const estTraite = statut === 'LIVRE' || statut === 'ECHEC';

  const Element = onPress ? 'button' : 'div';

  return (
    <Element
      className={`carte-colis carte-colis--${statut.toLowerCase()}${estTraite ? ' carte-colis--traite' : ''}`}
      data-testid="carte-colis"
      data-colis-id={colisId}
      data-statut={statut}
      onClick={onPress}
      type={onPress ? 'button' : undefined}
      aria-label={onPress ? `Voir le détail du colis ${colisId}` : undefined}
    >
      {/* Ligne 1 : badge + contraintes */}
      <div className="carte-colis__entete">
        <BadgeStatut variant={variant} label={label} size="sm" />
        <div className="carte-colis__contraintes">
          {contraintes.map((type, idx) => (
            <ChipContrainte key={idx} type={type} />
          ))}
        </div>
      </div>

      {/* Ligne 2 : adresse */}
      <p className="carte-colis__adresse" data-testid="carte-colis-adresse">{adresse}</p>

      {/* Ligne 3 : destinataire */}
      <p className="carte-colis__destinataire" data-testid="carte-colis-destinataire">
        {destinataire}
        {appartement && <span className="carte-colis__appartement"> — {appartement}</span>}
      </p>

      {/* Métadonnées LIVRE / ECHEC */}
      {horodatage && (
        <p className="carte-colis__horodatage" data-testid="carte-colis-horodatage">{horodatage}</p>
      )}
      {motif && statut === 'ECHEC' && (
        <p className="carte-colis__motif" data-testid="carte-colis-motif">Motif : {motif}</p>
      )}
    </Element>
  );
}
