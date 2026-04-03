/**
 * TacticalGradient (DC-01) — Design System DocuPost (Mobile / React Native)
 *
 * Degrade identitaire DocuPost pour les elements decoratifs.
 * Direction 135deg, de Colors.primaire (#1D4ED8) vers #0037b0 (reference designer).
 *
 * ATTENTION : #0037b0 est utilise UNIQUEMENT pour les gradients decoratifs.
 * La couleur primaire standalone reste Colors.primaire = #1D4ED8 (Option B).
 *
 * Utilise sur :
 * - Logo DocuPost M-01
 * - Bandeau d'instruction M-06
 * - Header M-02 (en option — le header peut utiliser aussi Colors.primaire plat)
 *
 * Spec US-031 DC-01 :
 * - Direction : 135deg (start={x:0, y:0} → end={x:1, y:1})
 * - Couleur debut : #1D4ED8 (Colors.primaire)
 * - Couleur fin : #0037b0 (reference designer, usage gradient decoratif uniquement)
 *
 * Usage :
 *   <TacticalGradient style={{ height: 80, borderRadius: 12 }}>
 *     <Text style={{ color: 'white' }}>Logo DocuPost</Text>
 *   </TacticalGradient>
 *
 * US-031 : Nouveaux composants designer.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';

// Token gradient — #0037b0 est l'extremite decorative du gradient identitaire
const GRADIENT_END = '#0037b0';

// Tentative d'import expo-linear-gradient (optionnel)
let LinearGradient: React.ComponentType<any> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch {
  // expo-linear-gradient non disponible — fallback couleur plate
}

export interface TacticalGradientProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

/**
 * TacticalGradient
 *
 * Wrapper avec degrade identitaire DocuPost.
 * Utilise expo-linear-gradient si disponible, sinon fallback fond Colors.primaire.
 */
export function TacticalGradient({
  children,
  style,
  testID = 'tactical-gradient',
}: TacticalGradientProps): React.JSX.Element {
  const colors = [Colors.primaire, GRADIENT_END];

  if (LinearGradient) {
    return (
      <LinearGradient
        testID={testID}
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  // Fallback : fond couleur primaire plate
  return (
    <View
      testID={testID}
      style={[styles.container, styles.fallback, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: Colors.primaire,
  },
});
