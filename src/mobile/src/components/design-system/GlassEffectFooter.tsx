/**
 * GlassEffectFooter (DC-02) — Design System DocuPost (Mobile / React Native)
 *
 * Footer fixe translucide avec effet verre. Utilise sur 4 ecrans :
 * M-02 (Liste colis), M-03 (Detail colis), M-04 (Capture preuve), M-05 (Echec).
 *
 * Spec US-031 DC-02 :
 * - Background : rgba(255, 255, 255, 0.85)
 * - Blur : BlurView intensity=20 (expo-blur) ou fallback fond blanc opaque
 * - Shadow : 0 -4px 20px rgba(0, 0, 0, 0.08)
 * - Position : absolute bottom, pleine largeur
 * - Hauteur : 80px + safe area inset bottom
 *
 * Usage :
 *   <GlassEffectFooter>
 *     <BoutonCTA label="Scanner un colis" onPress={...} />
 *     <BoutonCTA label="Cloture la tournee" variant="secondaire" onPress={...} />
 *   </GlassEffectFooter>
 *
 * US-031 : Nouveaux composants designer.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

// Tentative d'import expo-blur (optionnel — peut ne pas etre disponible dans tous les env)
let BlurView: React.ComponentType<any> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  BlurView = require('expo-blur').BlurView;
} catch {
  // expo-blur non disponible — fallback transparent
}

export interface GlassEffectFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

/**
 * GlassEffectFooter
 *
 * Footer fixe translucide. Utilise BlurView si expo-blur est disponible,
 * sinon fallback sur fond rgba(255, 255, 255, 0.92).
 */
export function GlassEffectFooter({
  children,
  style,
  testID = 'glass-effect-footer',
}: GlassEffectFooterProps): React.JSX.Element {
  const containerStyle = [styles.container, style];

  if (BlurView) {
    return (
      <BlurView
        testID={testID}
        intensity={20}
        tint="light"
        style={containerStyle}
      >
        <View style={styles.inner}>
          {children}
        </View>
      </BlurView>
    );
  }

  // Fallback sans expo-blur : fond blanc semi-transparent
  return (
    <View
      testID={testID}
      style={containerStyle}
    >
      <View style={styles.inner}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    // Shadow superieure (iOS)
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    // Shadow superieure (Android)
    elevation: 8,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
