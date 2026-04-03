/**
 * DrawerDetail — Design System DocuPost (Web)
 *
 * Panneau latéral coulissant pour afficher les détails (W-02).
 * Source design-system.md §3 (drawer 480px).
 *
 * Usage :
 *   <DrawerDetail
 *     isOpen={isOpen}
 *     titre="Détail incident"
 *     onClose={() => setIsOpen(false)}
 *   >
 *     <p>Motif : absent</p>
 *   </DrawerDetail>
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import './DrawerDetail.css';

export interface DrawerDetailProps {
  /** Contrôle l'affichage du drawer */
  isOpen: boolean;
  /** Titre affiché dans le header du drawer */
  titre: string;
  /** Callback de fermeture (bouton X + clic overlay) */
  onClose: () => void;
  /** Contenu du drawer */
  children: React.ReactNode;
}

/**
 * DrawerDetail
 *
 * SC7 (design-system.md) :
 * - S'ouvre à droite en 480px de large
 * - Fermeture via bouton [X] ou clic en dehors
 * - Pas de navigation
 */
export function DrawerDetail({
  isOpen,
  titre,
  onClose,
  children,
}: DrawerDetailProps): React.JSX.Element {
  return (
    <>
      {/* Overlay de fermeture */}
      <div
        className={`drawer-detail__overlay${isOpen ? ' drawer-detail__overlay--visible' : ''}`}
        data-testid="drawer-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panneau */}
      <aside
        className={`drawer-detail${isOpen ? ' drawer-detail--open' : ''}`}
        data-testid="drawer-detail"
        data-open={String(isOpen)}
        role="complementary"
        aria-label={titre}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="drawer-detail__header">
          <h2 className="drawer-detail__titre">{titre}</h2>
          <button
            className="drawer-detail__bouton-fermer"
            data-testid="drawer-bouton-fermer"
            onClick={onClose}
            type="button"
            aria-label="Fermer le panneau"
          >
            ✕
          </button>
        </div>

        {/* Corps */}
        <div className="drawer-detail__corps">
          {children}
        </div>
      </aside>
    </>
  );
}
