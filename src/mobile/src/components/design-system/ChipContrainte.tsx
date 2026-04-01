/**
 * ChipContrainte — Design System DocuPost (Mobile / React Native)
 *
 * Étiquette compacte pour les contraintes d'un colis.
 * Source design-system.md §3.5.
 *
 * Usage :
 *   <ChipContrainte type="horaire" valeur="14h00" />
 *   <ChipContrainte type="fragile" />
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius } from '../../theme/spacing';

export type TypeContrainte = 'horaire' | 'fragile' | 'document_sensible';

export interface ChipContrainteProps {
  type: TypeContrainte;
  valeur?: string;
}

const LABELS: Record<TypeContrainte, string> = {
  horaire:           'Avant',
  fragile:           'Fragile',
  document_sensible: 'Document sensible',
};

/**
 * ChipContrainte (React Native)
 */
export function ChipContrainte({ type, valeur }: ChipContrainteProps): React.JSX.Element {
  const baseLabel = LABELS[type];
  const displayLabel = type === 'horaire' && valeur
    ? `${baseLabel} ${valeur}`
    : baseLabel;

  return (
    <View
      testID="chip-contrainte"
      accessibilityLabel={displayLabel}
      style={styles.container}
    >
      <Text style={styles.icone} accessibilityElementsHidden={true}>⚑</Text>
      <Text style={styles.label}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.avertissementLeger,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.avertissement,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  icone: {
    fontSize: 10,
    color: Colors.avertissementFonce,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.avertissementFonce,
    lineHeight: 14,
  },
});
