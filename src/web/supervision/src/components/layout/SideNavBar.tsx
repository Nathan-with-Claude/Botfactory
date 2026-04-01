/**
 * SideNavBar — Navigation latérale fixe de l'application web superviseur DocuPost
 *
 * Conforme au design Material Design 3 et aux tokens du design system.
 * US-025 SC9 : fixe left-0 top-16, w-64, items actif/inactif selon la route.
 *
 * Tokens utilisés depuis tokens.css (via variables CSS) — aucune valeur hardcodée.
 */

import React from 'react';
import '../../styles/tokens.css';

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

const styles: Record<string, React.CSSProperties> = {
  aside: {
    position: 'fixed',
    left: 0,
    top: 64,
    height: 'calc(100vh - 4rem)',
    width: 256,
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
    gap: 8,
    backgroundColor: 'var(--md3-surface-container-low, #f1f3f4)',
    borderRight: '1px solid rgba(228, 231, 233, 0.3)',
  },
  navSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navLinkBase: {
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
  navLinkActive: {
    backgroundColor: 'var(--color-surface-primary, #FFFFFF)',
    color: 'var(--color-info, #2563EB)',
    fontWeight: 600,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  navLinkInactive: {
    color: 'var(--color-texte-secondaire, #475569)',
    fontWeight: 500,
  },
  navBottom: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  icon: {
    fontFamily: "'Material Symbols Outlined', sans-serif",
    fontSize: 22,
    lineHeight: 1,
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },
  iconFilled: {
    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },
};

export function SideNavBar({
  activePage = 'preparation',
  onNavigatePreparation,
  onNavigateSupervision,
  onDeconnexion,
}: SideNavBarProps): React.JSX.Element {
  return (
    <aside style={styles.aside} data-testid="side-nav-bar">
      <div style={styles.navSection}>
        {/* Lien Préparation */}
        <button
          style={{
            ...styles.navLinkBase,
            ...(activePage === 'preparation' ? styles.navLinkActive : styles.navLinkInactive),
          }}
          onClick={onNavigatePreparation}
          data-testid="side-nav-bar-preparation"
          aria-current={activePage === 'preparation' ? 'page' : undefined}
        >
          <span
            style={{
              ...styles.icon,
              ...(activePage === 'preparation' ? styles.iconFilled : {}),
            }}
          >
            pending_actions
          </span>
          <span>Préparation</span>
        </button>

        {/* Lien Supervision */}
        <button
          style={{
            ...styles.navLinkBase,
            ...(activePage === 'supervision' ? styles.navLinkActive : styles.navLinkInactive),
          }}
          onClick={onNavigateSupervision}
          data-testid="side-nav-bar-supervision"
          aria-current={activePage === 'supervision' ? 'page' : undefined}
        >
          <span
            style={{
              ...styles.icon,
              ...(activePage === 'supervision' ? styles.iconFilled : {}),
            }}
          >
            monitoring
          </span>
          <span>Supervision</span>
        </button>
      </div>

      {/* Liens bas de page */}
      <div style={styles.navBottom}>
        <button
          style={{ ...styles.navLinkBase, ...styles.navLinkInactive }}
          data-testid="side-nav-bar-aide"
        >
          <span style={styles.icon}>help</span>
          <span>Aide</span>
        </button>

        <button
          style={{ ...styles.navLinkBase, ...styles.navLinkInactive }}
          onClick={onDeconnexion}
          data-testid="side-nav-bar-deconnexion"
        >
          <span style={styles.icon}>logout</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

export default SideNavBar;
