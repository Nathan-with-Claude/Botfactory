/**
 * colors.ts — Tokens de couleur DocuPost pour React Native
 *
 * Source de vérité pour toutes les couleurs de l'application mobile.
 * Aucun composant React Native ne doit utiliser une valeur hexadécimale
 * directement — utiliser ces tokens.
 *
 * Palette Material Design 3 définie dans /livrables/02-ux/design_mobile_designer.md
 * US-025 : Design System DocuPost — mise à jour palette MD3 designer.
 */

export const Colors = {
  // ─── Palette Material Design 3 (tokens designer) ─────────────────────────
  primary:                '#0037b0',
  primaryContainer:       '#1d4ed8',
  onPrimary:              '#ffffff',
  onPrimaryContainer:     '#cad3ff',
  primaryFixed:           '#dce1ff',
  primaryFixedDim:        '#b7c4ff',
  onPrimaryFixed:         '#001551',
  onPrimaryFixedVariant:  '#0039b5',

  secondary:              '#4059aa',
  secondaryContainer:     '#8fa7fe',
  onSecondary:            '#ffffff',
  onSecondaryContainer:   '#1d3989',
  secondaryFixed:         '#dce1ff',
  secondaryFixedDim:      '#b6c4ff',
  onSecondaryFixed:       '#00164e',
  onSecondaryFixedVariant: '#264191',

  tertiary:               '#00501f',
  tertiaryContainer:      '#006b2c',
  onTertiary:             '#ffffff',
  onTertiaryContainer:    '#71ee8a',
  tertiaryFixed:          '#7ffc97',
  tertiaryFixedDim:       '#62df7d',
  onTertiaryFixed:        '#002109',
  onTertiaryFixedVariant: '#005320',

  error:                  '#ba1a1a',
  errorContainer:         '#ffdad6',
  onError:                '#ffffff',
  onErrorContainer:       '#93000a',

  surface:                '#f7f9fb',
  surfaceBright:          '#f7f9fb',
  surfaceDim:             '#d8dadc',
  surfaceVariant:         '#e0e3e5',
  surfaceTint:            '#2151da',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow:    '#f2f4f6',
  surfaceContainer:       '#eceef0',
  surfaceContainerHigh:   '#e6e8ea',
  surfaceContainerHighest: '#e0e3e5',

  onSurface:              '#191c1e',
  onSurfaceVariant:       '#434655',

  outline:                '#747686',
  outlineVariant:         '#c4c5d7',

  inverseSurface:         '#2d3133',
  inverseOnSurface:       '#eff1f3',
  inversePrimary:         '#b7c4ff',

  // ─── Alias legacy (rétrocompatibilité avec les composants existants) ────────
  primaire:               '#0037b0',
  primaireHover:          '#001551',
  primaireLeger:          '#dce1ff',

  succes:                 '#00501f',
  succesLeger:            '#7ffc97',
  succesFonce:            '#002109',

  alerte:                 '#ba1a1a',
  alerteLeger:            '#ffdad6',
  alerteFonce:            '#93000a',

  avertissement:          '#D97706',
  avertissementLeger:     '#FFFBEB',
  avertissementFonce:     '#78350F',

  info:                   '#0037b0',
  infoLeger:              '#dce1ff',
  infoFonce:              '#1E3A8A',

  surfacePrimary:         '#ffffff',
  surfaceSecondary:       '#f7f9fb',
  fondNeutre:             '#eceef0',
  fondAlerte:             '#ffdad6',

  textePrimaire:          '#191c1e',
  texteSecondaire:        '#434655',
  texteTertiaire:         '#747686',
  texteInverse:           '#ffffff',

  bordureNeutre:          '#c4c5d7',
  bordurefocus:           '#0037b0',
  bordureErreur:          '#ba1a1a',

  progresEncours:         '#0037b0',
  progresRisque:          '#D97706',
  progresDone:            '#006b2c',
} as const;

export type ColorKey = keyof typeof Colors;
