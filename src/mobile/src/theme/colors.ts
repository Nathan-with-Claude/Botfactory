/**
 * colors.ts — Tokens de couleur DocuPost pour React Native
 *
 * Source de vérité pour toutes les couleurs de l'application mobile.
 * Aucun composant React Native ne doit utiliser une valeur hexadécimale
 * directement — utiliser ces tokens.
 *
 * Correspond aux tokens CSS web définis dans tokens.css §1.
 * US-025 : Design System DocuPost.
 */

export const Colors = {
  // ─── Primaire ─────────────────────────────────────────────────────────────
  primaire:            '#1D4ED8',
  primaireHover:       '#1E40AF',
  primaireLeger:       '#EFF6FF',

  // ─── Statuts métier ───────────────────────────────────────────────────────
  succes:              '#16A34A',
  succesLeger:         '#F0FDF4',
  succesFonce:         '#14532D',

  alerte:              '#DC2626',
  alerteLeger:         '#FEF2F2',
  alerteFonce:         '#7F1D1D',

  avertissement:       '#D97706',
  avertissementLeger:  '#FFFBEB',
  avertissementFonce:  '#78350F',

  info:                '#2563EB',
  infoLeger:           '#EFF6FF',
  infoFonce:           '#1E3A8A',

  // ─── Surfaces ─────────────────────────────────────────────────────────────
  surfacePrimary:      '#FFFFFF',
  surfaceSecondary:    '#F8FAFC',
  fondNeutre:          '#F1F5F9',
  fondAlerte:          '#FEF3C7',

  // ─── Texte ────────────────────────────────────────────────────────────────
  textePrimaire:       '#0F172A',
  texteSecondaire:     '#475569',
  texteTertiaire:      '#94A3B8',
  texteInverse:        '#FFFFFF',

  // ─── Bordures ─────────────────────────────────────────────────────────────
  bordureNeutre:       '#E2E8F0',
  bordurefocus:        '#2563EB',
  bordureErreur:       '#DC2626',

  // ─── Progression ──────────────────────────────────────────────────────────
  progresEncours:      '#3B82F6',
  progresRisque:       '#F59E0B',
  progresDone:         '#16A34A',
} as const;

export type ColorKey = keyof typeof Colors;
