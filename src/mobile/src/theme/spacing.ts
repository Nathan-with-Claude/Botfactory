/**
 * spacing.ts — Tokens d'espacement DocuPost pour React Native
 *
 * Correspond aux espacements définis dans design-system.md §4 (mobile).
 * Tous les multiples de 4px.
 * US-025 : Design System DocuPost.
 */

export const Spacing = {
  /** 4px — micro : icônes, chips internes */
  s1: 4,
  /** 8px — compact : séparateurs, padding badge */
  s2: 8,
  /** 12px — normal : padding card interne */
  s3: 12,
  /** 16px — standard : marge latérale page */
  s4: 16,
  /** 20px */
  s5: 20,
  /** 24px — espacement entre sections */
  s6: 24,
} as const;

/** Hauteur standard des boutons CTA principaux (56px — US-026) */
export const BTN_HEIGHT_CTA = 56 as const;
/** Hauteur minimale des éléments interactifs (touch target — 48px) */
export const TOUCH_TARGET_MIN = 48 as const;

export const BorderRadius = {
  /** 4px — badges, chips */
  sm: 4,
  /** 8px — boutons web, inputs */
  md: 8,
  /** 12px — cards mobile, boutons mobile */
  lg: 12,
  /** 16px — modaux, overlays */
  xl: 16,
  /** 9999px — pills, points status */
  full: 9999,
} as const;

export type SpacingKey = keyof typeof Spacing;
export type BorderRadiusKey = keyof typeof BorderRadius;
