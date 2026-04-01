/**
 * CardTypePreuve — Design System DocuPost (Mobile / React Native)
 *
 * Sélecteur de type de preuve (M-04).
 * Source design-system.md §6 (sélecteurs).
 *
 * Usage :
 *   <CardTypePreuve
 *     type="SIGNATURE"
 *     label="Signature"
 *     selected={selectedType === 'SIGNATURE'}
 *     onSelect={setSelectedType}
 *   />
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius, Spacing } from '../../theme/spacing';

export type TypePreuve = 'SIGNATURE' | 'PHOTO' | 'TIERS_IDENTIFIE' | 'DEPOT_SECURISE';

export interface CardTypePreuveProps {
  type: TypePreuve;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onSelect: (type: TypePreuve) => void;
  /** testID pour les tests — US-026 */
  testID?: string;
}

/**
 * CardTypePreuve (React Native)
 *
 * États visuels :
 * Default   — fond blanc, bordure Colors.bordureNeutre 1px
 * Selected  — fond Colors.primaireLeger, bordure Colors.primaire 2px
 */
export function CardTypePreuve({
  type,
  label,
  description,
  icon,
  selected,
  onSelect,
  testID = 'card-type-preuve',
}: CardTypePreuveProps): React.JSX.Element {
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={() => onSelect(type)}
      activeOpacity={0.7}
      style={[
        styles.container,
        selected ? styles.containerSelected : styles.containerDefault,
      ]}
    >
      {icon && (
        <View style={styles.icone} accessibilityElementsHidden={true}>
          {icon}
        </View>
      )}
      <Text style={styles.label}>{label}</Text>
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.s4,
    borderRadius: BorderRadius.md,
    minHeight: 72,  // Touch target
    justifyContent: 'center',
  },
  containerDefault: {
    backgroundColor: Colors.surfacePrimary,
    borderWidth: 1,
    borderColor: Colors.bordureNeutre,
  },
  containerSelected: {
    backgroundColor: Colors.primaireLeger,
    borderWidth: 2,
    borderColor: Colors.primaire,
  },
  icone: {
    marginBottom: Spacing.s1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textePrimaire,
  },
  description: {
    fontSize: 12,
    color: Colors.texteSecondaire,
    marginTop: 2,
  },
});
