/**
 * SideNavBar — Navigation latérale fixe de l'application web superviseur DocuPost
 *
 * Refactorisé avec Tailwind CSS — design system DocuPost (US-027).
 * US-025 SC9 : fixe left-0 top-16, w-64, items actif/inactif selon la route.
 *
 * Tous les data-testid sont conservés.
 */

import React from 'react';

export interface SideNavBarProps {
  /** Page active pour surligner le lien correspondant */
  activePage?: 'preparation' | 'supervision';
  /** Callback navigation Préparation */
  onNavigatePreparation?: () => void;
  /** Callback navigation Supervision */
  onNavigateSupervision?: () => void;
  /** Callback déconnexion */
  onDeconnexion?: () => void;
}

export function SideNavBar({
  activePage = 'preparation',
  onNavigatePreparation,
  onNavigateSupervision,
  onDeconnexion,
}: SideNavBarProps): React.JSX.Element {
  return (
    <aside
      data-testid="side-nav-bar"
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] flex flex-col p-4 gap-2 w-64 bg-slate-100 border-r border-slate-200/30"
    >
      <div className="space-y-1">
        {/* Lien Préparation */}
        <button
          data-testid="side-nav-bar-preparation"
          onClick={onNavigatePreparation}
          aria-current={activePage === 'preparation' ? 'page' : undefined}
          className={[
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out w-full text-left text-sm font-body',
            activePage === 'preparation'
              ? 'bg-white text-primary font-semibold shadow-sm'
              : 'text-slate-600 hover:text-primary hover:bg-slate-200/50',
          ].join(' ')}
        >
          <span
            className="material-symbols-outlined"
            style={activePage === 'preparation'
              ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
              : undefined}
          >
            pending_actions
          </span>
          <span>Préparation</span>
        </button>

        {/* Lien Supervision */}
        <button
          data-testid="side-nav-bar-supervision"
          onClick={onNavigateSupervision}
          aria-current={activePage === 'supervision' ? 'page' : undefined}
          className={[
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out w-full text-left text-sm font-body',
            activePage === 'supervision'
              ? 'bg-white text-primary font-semibold shadow-sm'
              : 'text-slate-600 hover:text-primary hover:bg-slate-200/50',
          ].join(' ')}
        >
          <span
            className="material-symbols-outlined"
            style={activePage === 'supervision'
              ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
              : undefined}
          >
            monitoring
          </span>
          <span>Supervision</span>
        </button>
      </div>

      {/* Liens bas de page */}
      <div className="mt-auto space-y-1">
        <button
          data-testid="side-nav-bar-aide"
          className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-primary hover:bg-slate-200/50 rounded-lg transition-all duration-200 ease-in-out w-full text-left text-sm font-body"
        >
          <span className="material-symbols-outlined">help</span>
          <span>Aide</span>
        </button>

        <button
          data-testid="side-nav-bar-deconnexion"
          onClick={onDeconnexion}
          className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-primary hover:bg-slate-200/50 rounded-lg transition-all duration-200 ease-in-out w-full text-left text-sm font-body"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

export default SideNavBar;
