/**
 * SignatureGrid (DC-03) — Design System DocuPost (Mobile / React Native)
 *
 * Fond en grille de points discrets pour le pad de signature M-04.
 * Composant de presentation pure — aucun evenement domaine associe.
 *
 * Spec US-031 DC-03 :
 * - Pattern : points de 4px de diametre, espaces 20x20px
 * - Couleur points : rgba(0, 0, 0, 0.08) (tres discrets)
 * - Usage : background du View contenant le canvas de signature
 *
 * En React Native, le pattern CSS radial-gradient n'est pas directement disponible.
 * Implementation via une grille SVG inline (react-native-svg si disponible)
 * ou via une approximation par View avec dotPattern.
 *
 * Usage :
 *   <SignatureGrid style={{ height: 300 }}>
 *     <SignatureCanvas ref={signatureRef} ... />
 *   </SignatureGrid>
 *
 * US-031 : Nouveaux composants designer.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';

export interface SignatureGridProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

/**
 * SignatureGrid
 *
 * Conteneur avec fond grille de points pour le pad de signature.
 * Les points sont simules via un pattern de petites View positionnees absolument.
 * Le contenu (canvas de signature) est rendu par-dessus.
 */
export function SignatureGrid({
  children,
  style,
  testID = 'signature-grid',
}: SignatureGridProps): React.JSX.Element {
  return (
    <View
      testID={testID}
      style={[styles.container, style]}
    >
      {/* Grille de points de fond — rendue par la couche de background */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <DotPattern />
      </View>

      {/* Contenu (canvas signature) par-dessus la grille */}
      {children}
    </View>
  );
}

/**
 * DotPattern
 *
 * Grille approximative de points discrets.
 * Genere une grille de petits points espaces de 20px.
 */
function DotPattern(): React.JSX.Element {
  const SPACING = 20;
  const DOT_SIZE = 4;
  const COLS = 15; // Approximation pour couvrir un ecran standard
  const ROWS = 20;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => (
          <View
            key={`dot-${row}-${col}`}
            style={[
              styles.dot,
              {
                top: row * SPACING + SPACING / 2 - DOT_SIZE / 2,
                left: col * SPACING + SPACING / 2 - DOT_SIZE / 2,
              },
            ]}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfacePrimary,
    position: 'relative',
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
});
