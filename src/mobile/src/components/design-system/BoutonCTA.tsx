/**
 * BoutonCTA — Design System DocuPost (Mobile / React Native)
 *
 * Bouton d'action principal et secondaire.
 * Source design-system.md §3.4.
 * Touch target minimum : 48x48dp (hauteur 56dp sur mobile).
 *
 * Usage :
 *   <BoutonCTA variant="primaire" size="md" label="LIVRER CE COLIS" onPress={handleLivrer} />
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius } from '../../theme/spacing';

export type BoutonVariant = 'primaire' | 'secondaire' | 'tertiaire' | 'outline' | 'danger';
export type BoutonSize = 'sm' | 'md' | 'lg';

export interface BoutonCTAProps {
  variant: BoutonVariant;
  size: BoutonSize;
  label: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}

type StyleMap = { fond: string; texte: string; bordure?: string };

const VARIANT_STYLES: Record<BoutonVariant, StyleMap> = {
  primaire:    { fond: Colors.primary,            texte: Colors.onPrimary },
  secondaire:  { fond: 'transparent',              texte: Colors.error,               bordure: Colors.error },
  tertiaire:   { fond: Colors.tertiaryContainer,   texte: Colors.onTertiary },
  outline:     { fond: 'transparent',              texte: Colors.primary,             bordure: Colors.primary },
  danger:      { fond: Colors.error,               texte: Colors.onPrimary },
};

const SIZE_HEIGHT: Record<BoutonSize, number> = {
  sm: 40,
  md: 56,  // mobile — touch target WCAG 48dp minimum
  lg: 56,
};

const SIZE_RADIUS: Record<BoutonSize, number> = {
  sm: BorderRadius.md,
  md: BorderRadius.lg,
  lg: BorderRadius.lg,
};

/**
 * BoutonCTA (React Native)
 */
export function BoutonCTA({
  variant,
  size,
  label,
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  onPress,
}: BoutonCTAProps): React.JSX.Element {
  const isDisabled = disabled || loading;
  const variantStyle = VARIANT_STYLES[variant];

  function handlePress(): void {
    if (!isDisabled) {
      onPress();
    }
  }

  return (
    <TouchableOpacity
      testID="bouton-cta"
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.container,
        {
          height: SIZE_HEIGHT[size],
          borderRadius: SIZE_RADIUS[size],
          backgroundColor: variantStyle.fond,
          borderColor: variantStyle.bordure ?? 'transparent',
          borderWidth: variantStyle.bordure ? 1 : 0,
          opacity: isDisabled ? 0.4 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator
          testID="bouton-spinner"
          size="small"
          color={variantStyle.texte}
          accessibilityLabel="Chargement en cours"
        />
      ) : (
        <View style={styles.contenu}>
          {icon && iconPosition === 'left' && (
            <View style={styles.icone} accessibilityElementsHidden={true}>
              {icon}
            </View>
          )}
          <Text style={[styles.label, { color: variantStyle.texte, fontSize: size === 'sm' ? 14 : 16 }]}>
            {label}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.icone} accessibilityElementsHidden={true}>
              {icon}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    minWidth: 48,  // touch target WCAG
  },
  contenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontWeight: '600',
    lineHeight: 20,
  },
  icone: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
