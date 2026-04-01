/**
 * shadows.ts — Tokens d'ombres DocuPost pour React Native
 *
 * React Native utilise des propriétés dédiées (shadowColor, elevation, etc.)
 * plutôt que la propriété CSS box-shadow.
 * Ces tokens correspondent aux ombres définies dans design-system.md §5.
 *
 * US-025 : Design System DocuPost.
 */

import { ViewStyle } from 'react-native';

export const Shadows: Record<string, ViewStyle> = {
  /** Ombre légère — cartes colis, items liste */
  cardSm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  /** Ombre moyenne — modaux, popovers */
  cardMd: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },

  /** Ombre forte — overlays, drawers */
  overlay: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export type ShadowKey = keyof typeof Shadows;
