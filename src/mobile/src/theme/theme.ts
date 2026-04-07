/**
 * theme.ts — Constantes de style centralisées DocuPost (Mobile / React Native)
 *
 * Regroupe les tokens de design réutilisables : espacements, rayons,
 * typographie, touch targets et ombres.
 *
 * Source design : /livrables/02-ux/design_mobile_designer.md
 * US-025 : Design System DocuPost.
 */

export const Theme = {
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    body: 16,
    lg: 18,
    xl: 20,
    h2: 24,
    h1: 32,
    display: 36,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  touchTarget: {
    minHeight: 48,
    minWidth: 48,
  },
  shadow: {
    sm: {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    md: {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.10,
      shadowRadius: 8,
    },
    lg: {
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
  },
} as const;
