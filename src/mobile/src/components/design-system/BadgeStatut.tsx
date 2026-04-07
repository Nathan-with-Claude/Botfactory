/**
 * BadgeStatut — Design System DocuPost (Mobile / React Native)
 *
 * Étiquette colorée indiquant le statut d'un colis ou d'une tournée.
 * Source design-system.md §3.1.
 *
 * Usage :
 *   <BadgeStatut variant="succes" label="LIVRE" />
 *   <BadgeStatut variant="alerte" label="ECHEC" size="md" />
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius } from '../../theme/spacing';

export type BadgeVariant = 'succes' | 'alerte' | 'avertissement' | 'info' | 'neutre';
export type BadgeSize = 'sm' | 'md';

export interface BadgeStatutProps {
  variant: BadgeVariant;
  label: string;
  size?: BadgeSize;
  icon?: boolean;
  pulse?: boolean;  // Non implémenté RN (animation Animated.Value si nécessaire)
}

// ─── Mapping variant → couleurs ───────────────────────────────────────────────

type ColorMap = { fond: string; texte: string; point: string };

const VARIANT_COLORS: Record<BadgeVariant, ColorMap> = {
  succes:         { fond: Colors.tertiaryFixed,        texte: Colors.onTertiaryFixed,     point: Colors.tertiaryContainer },
  alerte:         { fond: Colors.errorContainer,       texte: Colors.onErrorContainer,    point: Colors.error },
  avertissement:  { fond: Colors.avertissementLeger,   texte: Colors.avertissementFonce,  point: Colors.avertissement },
  info:           { fond: Colors.secondaryContainer,   texte: Colors.onSecondaryContainer, point: Colors.primary },
  neutre:         { fond: Colors.surfaceContainer,     texte: Colors.onSurfaceVariant,    point: Colors.outline },
};

/**
 * BadgeStatut (React Native)
 *
 * Touch target : composant passif (non interactif) — pas de contrainte 48dp ici.
 */
export function BadgeStatut({
  variant,
  label,
  size = 'sm',
  icon = true,
}: BadgeStatutProps): React.JSX.Element {
  const colors = VARIANT_COLORS[variant];
  const isMd = size === 'md';

  return (
    <View
      testID="badge-statut"
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[
        styles.container,
        { backgroundColor: colors.fond },
        isMd ? styles.containerMd : styles.containerSm,
      ]}
    >
      {icon && (
        <View
          testID="badge-point"
          style={[styles.point, { backgroundColor: colors.point }]}
        />
      )}
      <Text style={[styles.label, { color: colors.texte }]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Styles (tokens importés depuis theme/) ────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  containerSm: {
    height: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  containerMd: {
    height: 24,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  point: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 12,
  },
});
