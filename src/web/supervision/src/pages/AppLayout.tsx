/**
 * AppLayout — Layout partagé de l'application web superviseur DocuPost
 *
 * Compose TopAppBar + SideNavBar + zone de contenu principale (ml-64 mt-16).
 * Utilisé par PreparationPage (W-04) et TableauDeBordPage (W-01).
 *
 * US-027 — Refactorisation UI design DocuPost.
 */

import React from 'react';
import { TopAppBar, TopAppBarProps } from '../components/layout/TopAppBar';
import { SideNavBar, SideNavBarProps } from '../components/layout/SideNavBar';

export interface AppLayoutProps {
  /** Page active (preparation | supervision) */
  activePage?: 'preparation' | 'supervision';
  /** Statut WebSocket pour le badge LIVE / POLLING / OFFLINE */
  syncStatus?: TopAppBarProps['syncStatus'];
  /** Nom de l'utilisateur connecté */
  userName?: string;
  /** Callback navigation Préparation */
  onNavigatePreparation?: () => void;
  /** Callback navigation Supervision */
  onNavigateSupervision?: () => void;
  /** Callback déconnexion */
  onDeconnexion?: SideNavBarProps['onDeconnexion'];
  /** Contenu de la page */
  children: React.ReactNode;
}

/**
 * AppLayout
 *
 * Structure :
 * - TopAppBar fixe (h-16, z-50)
 * - SideNavBar fixe (w-64, top-16)
 * - <main> avec ml-64 mt-16 p-8 min-h-screen bg-background
 */
export function AppLayout({
  activePage = 'preparation',
  syncStatus = 'live',
  userName = 'Laurent Renaud',
  onNavigatePreparation,
  onNavigateSupervision,
  onDeconnexion,
  children,
}: AppLayoutProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body antialiased">
      {/* Header fixe */}
      <TopAppBar
        activePage={activePage}
        syncStatus={syncStatus}
        userName={userName}
        onNavigatePreparation={onNavigatePreparation}
        onNavigateSupervision={onNavigateSupervision}
      />

      {/* Sidebar fixe */}
      <SideNavBar
        activePage={activePage}
        onNavigatePreparation={onNavigatePreparation}
        onNavigateSupervision={onNavigateSupervision}
        onDeconnexion={onDeconnexion}
      />

      {/* Zone de contenu principale */}
      <main className="ml-64 mt-16 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
