/**
 * AppLayout — Layout global de l'application web superviseur DocuPost
 *
 * Fournit le header fixe (h-16) avec logo, nav, badge LIVE, profil
 * et la sidebar fixe (w-64) avec les liens Préparation / Supervision.
 *
 * Conforme au design Material Design 3 validé par le designer (2026-03-25).
 * US-027 : Refactorisation interface web superviseur.
 */

import React from 'react';
import '../styles/tokens.css';

export interface AppLayoutProps {
  /** Page active pour surligner le lien correspondant dans la sidebar */
  activePage?: 'preparation' | 'supervision';
  /** Callback navigation Préparation */
  onNavigatePreparation?: () => void;
  /** Callback navigation Supervision */
  onNavigateSupervision?: () => void;
  /** Callback déconnexion */
  onDeconnexion?: () => void;
  /** Statut de connexion WebSocket */
  syncStatus?: 'live' | 'polling' | 'offline';
  /** Enfants — contenu de la page */
  children: React.ReactNode;
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
    color: '#0037b0',
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
    color: '#0037b0',
    fontWeight: 700,
    borderBottom: '2px solid #0037b0',
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
  liveBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e6e8ea',
    padding: '6px 12px',
    borderRadius: 9999,
    border: '1px solid rgba(196, 197, 215, 0.2)',
  },
  liveDotWrapper: {
    position: 'relative',
    width: 8,
    height: 8,
  },
  liveDot: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    backgroundColor: '#0037b0',
  },
  liveLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#0037b0',
  },
  offlineDot: {
    backgroundColor: '#747686',
  },
  offlineLabel: {
    color: '#747686',
  },
  pollingDot: {
    backgroundColor: '#D97706',
  },
  pollingLabel: {
    color: '#D97706',
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
    backgroundColor: '#e2e8f0',
    margin: '0 4px',
  },
  profil: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 8,
  },
  profilTexte: {
    textAlign: 'right' as const,
  },
  profilNom: {
    fontSize: 12,
    fontWeight: 700,
    color: '#191c1e',
    lineHeight: 1.2,
  },
  profilRole: {
    fontSize: 10,
    color: '#747686',
    fontWeight: 500,
    lineHeight: 1.2,
  },
  profilAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
    flexShrink: 0,
  },
  aside: {
    position: 'fixed',
    left: 0,
    top: 64,
    height: 'calc(100vh - 64px)',
    width: 256,
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
    gap: 8,
    backgroundColor: '#f1f3f4',
    borderRight: '1px solid rgba(228, 231, 233, 0.5)',
  },
  sideNavSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  sideNavLinkBase: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 8,
    textDecoration: 'none',
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left' as const,
    transition: 'all 200ms ease-in-out',
  },
  sideNavLinkActive: {
    backgroundColor: '#ffffff',
    color: '#1d4ed8',
    fontWeight: 600,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  sideNavLinkInactive: {
    color: '#475569',
    fontWeight: 500,
  },
  sideNavBottom: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  sideNavIcon: {
    fontFamily: "'Material Symbols Outlined', sans-serif",
    fontSize: 22,
    lineHeight: 1,
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },
  sideNavIconFilled: {
    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },
  main: {
    marginLeft: 256,
    marginTop: 64,
    padding: 32,
    minHeight: 'calc(100vh - 64px)',
    backgroundColor: '#f7f9fb',
  },
};

// Styles d'animation pulse pour le badge LIVE
const pulseKeyframes = `
@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
.live-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
`;

export function AppLayout({
  activePage = 'preparation',
  onNavigatePreparation,
  onNavigateSupervision,
  onDeconnexion,
  syncStatus = 'live',
  children,
}: AppLayoutProps): React.JSX.Element {
  const dotStyle: React.CSSProperties = {
    ...styles.liveDot,
    ...(syncStatus === 'offline' ? styles.offlineDot : {}),
    ...(syncStatus === 'polling' ? styles.pollingDot : {}),
  };
  const labelStyle: React.CSSProperties = {
    ...styles.liveLabel,
    ...(syncStatus === 'offline' ? styles.offlineLabel : {}),
    ...(syncStatus === 'polling' ? styles.pollingLabel : {}),
  };
  const statusLabel = syncStatus === 'live' ? 'LIVE' : syncStatus === 'polling' ? 'POLLING' : 'OFFLINE';

  return (
    <>
      <style>{pulseKeyframes}</style>

      {/* Header */}
      <header style={styles.header} data-testid="app-header">
        <div style={styles.headerLeft}>
          <span style={styles.logo}>DocuPost</span>
          <nav style={styles.nav}>
            <button
              style={{
                ...styles.navLinkBase,
                ...(activePage === 'preparation' ? styles.navLinkActive : styles.navLinkInactive),
              }}
              onClick={onNavigatePreparation}
              data-testid="nav-preparation"
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
              data-testid="nav-supervision"
            >
              Historique
            </button>
          </nav>
        </div>

        <div style={styles.headerRight}>
          {/* Badge sync */}
          <div style={styles.liveBadge} data-testid="badge-sync">
            <div style={styles.liveDotWrapper}>
              {syncStatus === 'live' && (
                <span
                  className="live-ping"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    backgroundColor: '#0037b0',
                    opacity: 0.75,
                  }}
                />
              )}
              <span style={dotStyle} />
            </div>
            <span style={labelStyle}>{statusLabel}</span>
          </div>

          {/* Bouton sync */}
          <button style={styles.iconBtn} aria-label="Synchroniser" title="Synchroniser">
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 22 }}>sync</span>
          </button>

          {/* Bouton notifications */}
          <button style={styles.iconBtn} aria-label="Notifications" title="Notifications">
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 22 }}>notifications</span>
          </button>

          <div style={styles.separator} />

          {/* Profil */}
          <div style={styles.profil}>
            <div style={styles.profilTexte}>
              <div style={styles.profilNom}>Laurent Renaud</div>
              <div style={styles.profilRole}>Supervisor Mode</div>
            </div>
            <div style={styles.profilAvatar} aria-hidden="true">LR</div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside style={styles.aside} data-testid="app-sidebar">
        <div style={styles.sideNavSection}>
          <button
            style={{
              ...styles.sideNavLinkBase,
              ...(activePage === 'preparation' ? styles.sideNavLinkActive : styles.sideNavLinkInactive),
            }}
            onClick={onNavigatePreparation}
            data-testid="sidebar-preparation"
          >
            <span
              style={{
                ...styles.sideNavIcon,
                ...(activePage === 'preparation' ? styles.sideNavIconFilled : {}),
              }}
            >
              pending_actions
            </span>
            <span>Préparation</span>
          </button>
          <button
            style={{
              ...styles.sideNavLinkBase,
              ...(activePage === 'supervision' ? styles.sideNavLinkActive : styles.sideNavLinkInactive),
            }}
            onClick={onNavigateSupervision}
            data-testid="sidebar-supervision"
          >
            <span
              style={{
                ...styles.sideNavIcon,
                ...(activePage === 'supervision' ? styles.sideNavIconFilled : {}),
              }}
            >
              monitoring
            </span>
            <span>Supervision</span>
          </button>
        </div>

        <div style={styles.sideNavBottom}>
          <button
            style={{ ...styles.sideNavLinkBase, ...styles.sideNavLinkInactive }}
          >
            <span style={styles.sideNavIcon}>help</span>
            <span>Aide</span>
          </button>
          <button
            style={{ ...styles.sideNavLinkBase, ...styles.sideNavLinkInactive }}
            onClick={onDeconnexion}
            data-testid="sidebar-deconnexion"
          >
            <span style={styles.sideNavIcon}>logout</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main} data-testid="app-main">
        {children}
      </main>
    </>
  );
}

export default AppLayout;
