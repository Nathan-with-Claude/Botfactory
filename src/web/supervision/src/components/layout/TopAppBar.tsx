/**
 * TopAppBar — Barre d'en-tête fixe de l'application web superviseur DocuPost
 *
 * Refactorisé avec Tailwind CSS — design system DocuPost (US-027).
 * US-025 SC8 : h-16 fixe, logo DocuPost, navigation principale, badge LIVE animé, profil.
 *
 * Tous les data-testid sont conservés.
 */

import React from 'react';

export interface TopAppBarProps {
  /** Page active pour surligner l'onglet correspondant */
  activePage?: 'preparation' | 'supervision';
  /** Statut de synchronisation WebSocket */
  syncStatus?: 'live' | 'polling' | 'offline';
  /** Callback navigation Préparation */
  onNavigatePreparation?: () => void;
  /** Callback navigation Supervision */
  onNavigateSupervision?: () => void;
  /** Nom de l'utilisateur connecté */
  userName?: string;
}

const syncConfig = {
  live:    { dotCls: 'bg-primary',  labelCls: 'text-primary',                    label: 'LIVE' },
  polling: { dotCls: 'bg-amber-500', labelCls: 'text-amber-500',                  label: 'POLLING' },
  offline: { dotCls: 'bg-error',     labelCls: 'text-error',                      label: 'OFFLINE' },
};

function getInitiales(nom: string): string {
  return nom
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function TopAppBar({
  activePage = 'preparation',
  syncStatus = 'live',
  onNavigatePreparation,
  onNavigateSupervision,
  userName = 'Laurent Renaud',
}: TopAppBarProps): React.JSX.Element {
  const sync = syncConfig[syncStatus];
  const initiales = getInitiales(userName);

  return (
    <header
      data-testid="top-app-bar"
      className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-slate-50/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50"
    >
      {/* Logo + Nav principale */}
      <div className="flex items-center gap-8">
        <span
          data-testid="top-app-bar-logo"
          className="text-xl font-bold text-primary tracking-tighter font-headline"
        >
          DocuPost
        </span>

        <nav className="hidden md:flex items-center h-16" aria-label="Navigation principale">
          <button
            data-testid="top-app-bar-nav-preparation"
            onClick={onNavigatePreparation}
            aria-current={activePage === 'preparation' ? 'page' : undefined}
            className={[
              'h-16 flex items-center px-1 font-headline tracking-tight text-sm transition-colors',
              activePage === 'preparation'
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-slate-500 font-medium hover:text-primary border-b-2 border-transparent',
            ].join(' ')}
          >
            Plan du jour
          </button>
          <button
            data-testid="top-app-bar-nav-supervision"
            onClick={onNavigateSupervision}
            aria-current={activePage === 'supervision' ? 'page' : undefined}
            className={[
              'ml-6 h-16 flex items-center px-1 font-headline tracking-tight text-sm transition-colors',
              activePage === 'supervision'
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-slate-500 font-medium hover:text-primary border-b-2 border-transparent',
            ].join(' ')}
          >
            Historique
          </button>
        </nav>
      </div>

      {/* Droite : badge sync + icônes + profil */}
      <div className="flex items-center gap-4">
        {/* Badge Sync */}
        <div
          data-testid="top-app-bar-indicateur-sync"
          className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/15"
        >
          <span className="relative flex h-2 w-2">
            {syncStatus === 'live' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${sync.dotCls}`} />
          </span>
          <span className={`text-[0.6875rem] font-bold uppercase tracking-wider ${sync.labelCls}`}>
            {sync.label}
          </span>
        </div>

        {/* Bouton sync */}
        <button
          data-testid="top-app-bar-btn-sync"
          aria-label="Synchroniser"
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
        >
          <span className="material-symbols-outlined">sync</span>
        </button>

        {/* Bouton notifications */}
        <button
          data-testid="top-app-bar-btn-notifications"
          aria-label="Notifications"
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* Séparateur */}
        <div className="h-8 w-px bg-slate-200 mx-1" />

        {/* Profil */}
        <div className="flex items-center gap-3 pl-2" data-testid="top-app-bar-profil">
          <div className="text-right">
            <div
              data-testid="top-app-bar-profil-nom"
              className="text-xs font-bold text-on-surface"
            >
              {userName}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Supervisor Mode</div>
          </div>
          {/* Avatar initiales (remplace l'image externe) */}
          <div
            data-testid="top-app-bar-profil-avatar"
            aria-hidden="true"
            className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold font-body border border-slate-200 shrink-0"
          >
            {initiales}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopAppBar;
