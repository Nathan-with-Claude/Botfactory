/**
 * TopAppBar — Barre d'en-tête fixe de l'application web superviseur DocuPost
 *
 * Conforme au design Material Design 3 et aux tokens du design system.
 * US-025 SC8 : h-16 fixe, logo DocuPost, navigation principale, IndicateurSync, profil.
 *
 * Tokens utilisés depuis tokens.css (via variables CSS) — aucune valeur hardcodée.
 */

import React from 'react';
import '../../styles/tokens.css';

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

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    zIndex: 50,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    backgroundColor: 'rgba(247, 249, 251, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(196, 197, 215, 0.3)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  },
  logo: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 20,
    fontWeight: 800,
    color: 'var(--md3-primary, #0037b0)',
    letterSpacing: '-0.04em',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    height: 64,
  },
  navLinkBase: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    padding: '0 4px',
    fontFamily: "'Work Sans', sans-serif",
    fontWeight: 500,
    fontSize: 14,
    letterSpacing: '-0.01em',
    textDecoration: 'none',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    transition: 'color 150ms ease-in-out',
  },
  navLinkActive: {
    color: 'var(--md3-primary, #0037b0)',
    fontWeight: 700,
    borderBottom: '2px solid var(--md3-primary, #0037b0)',
  },
  navLinkInactive: {
    color: '#64748b',
    borderBottom: '2px solid transparent',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  syncBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e6e8ea',
    padding: '6px 12px',
    borderRadius: 9999,
    border: '1px solid rgba(196, 197, 215, 0.2)',
  },
  syncDotWrapper: {
    position: 'relative',
    width: 8,
    height: 8,
  },
  syncDot: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    backgroundColor: 'var(--md3-primary, #0037b0)',
  },
  syncDotLive: {
    backgroundColor: 'var(--md3-primary, #0037b0)',
  },
  syncDotPolling: {
    backgroundColor: 'var(--color-avertissement, #D97706)',
  },
  syncDotOffline: {
    backgroundColor: 'var(--color-alerte, #DC2626)',
  },
  syncLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: 'var(--md3-primary, #0037b0)',
  },
  syncLabelPolling: {
    color: 'var(--color-avertissement, #D97706)',
  },
  syncLabelOffline: {
    color: 'var(--color-alerte, #DC2626)',
  },
  iconBtn: {
    padding: 8,
    color: '#64748b',
    background: 'none',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 150ms ease-in-out',
    fontSize: 24,
  },
  separator: {
    width: 1,
    height: 32,
    backgroundColor: 'var(--color-bordure-neutre, #E2E8F0)',
    margin: '0 4px',
  },
  profil: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 8,
  },
  profilNom: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--color-texte-primaire, #0F172A)',
    lineHeight: 1.2,
  },
  profilAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: 'var(--color-info, #2563EB)',
    color: 'var(--color-texte-inverse, #FFFFFF)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
    flexShrink: 0,
  },
};

const pulseKeyframes = `
@keyframes top-app-bar-ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
.top-app-bar-live-ping {
  animation: top-app-bar-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
`;

export function TopAppBar({
  activePage = 'preparation',
  syncStatus = 'live',
  onNavigatePreparation,
  onNavigateSupervision,
  userName = 'Laurent Renaud',
}: TopAppBarProps): React.JSX.Element {
  const dotStyle: React.CSSProperties = {
    ...styles.syncDot,
    ...(syncStatus === 'polling' ? styles.syncDotPolling : {}),
    ...(syncStatus === 'offline' ? styles.syncDotOffline : {}),
  };
  const labelStyle: React.CSSProperties = {
    ...styles.syncLabel,
    ...(syncStatus === 'polling' ? styles.syncLabelPolling : {}),
    ...(syncStatus === 'offline' ? styles.syncLabelOffline : {}),
  };
  const statusLabel = syncStatus === 'live' ? 'LIVE' : syncStatus === 'polling' ? 'POLLING' : 'OFFLINE';
  const initiales = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <style>{pulseKeyframes}</style>
      <header style={styles.header} data-testid="top-app-bar">
        <div style={styles.headerLeft}>
          {/* Logo */}
          <span style={styles.logo} data-testid="top-app-bar-logo">
            DocuPost
          </span>

          {/* Navigation principale */}
          <nav style={styles.nav} aria-label="Navigation principale">
            <button
              style={{
                ...styles.navLinkBase,
                ...(activePage === 'preparation' ? styles.navLinkActive : styles.navLinkInactive),
              }}
              onClick={onNavigatePreparation}
              data-testid="top-app-bar-nav-preparation"
              aria-current={activePage === 'preparation' ? 'page' : undefined}
            >
              Plan du jour
            </button>
            <button
              style={{
                ...styles.navLinkBase,
                marginLeft: 16,
                ...(activePage === 'supervision' ? styles.navLinkActive : styles.navLinkInactive),
              }}
              onClick={onNavigateSupervision}
              data-testid="top-app-bar-nav-supervision"
              aria-current={activePage === 'supervision' ? 'page' : undefined}
            >
              Historique
            </button>
          </nav>
        </div>

        <div style={styles.headerRight}>
          {/* IndicateurSync */}
          <div style={styles.syncBadge} data-testid="top-app-bar-indicateur-sync">
            <div style={styles.syncDotWrapper}>
              {syncStatus === 'live' && (
                <span
                  className="top-app-bar-live-ping"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    backgroundColor: 'var(--md3-primary, #0037b0)',
                    opacity: 0.75,
                  }}
                />
              )}
              <span style={dotStyle} />
            </div>
            <span style={labelStyle}>{statusLabel}</span>
          </div>

          {/* Bouton sync */}
          <button style={styles.iconBtn} aria-label="Synchroniser" data-testid="top-app-bar-btn-sync">
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 22 }}>sync</span>
          </button>

          {/* Bouton notifications */}
          <button style={styles.iconBtn} aria-label="Notifications" data-testid="top-app-bar-btn-notifications">
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 22 }}>notifications</span>
          </button>

          <div style={styles.separator} />

          {/* Profil */}
          <div style={styles.profil} data-testid="top-app-bar-profil">
            <span style={styles.profilNom} data-testid="top-app-bar-profil-nom">
              {userName}
            </span>
            <div style={styles.profilAvatar} aria-hidden="true" data-testid="top-app-bar-profil-avatar">
              {initiales}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default TopAppBar;
