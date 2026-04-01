/**
 * MiniProgressBar (DC-07) — Design System DocuPost (Mobile / React Native)
 *
 * Barre de progression fine (4px) indiquant l'avancement d'un formulaire.
 * Utilisee sur M-04 au-dessus du bouton CONFIRMER LA LIVRAISON.
 *
 * Spec US-031 DC-07 :
 * - Props : progress (0.0 a 1.0), color (Colors.primaire par defaut)
 * - Hauteur : 4px (h-1)
 * - Largeur : pleine largeur du conteneur
 * - Usage M-04 : progress=0.75 (3 etapes sur 4 — type preuve + signature tracee)
 * - Bordures : radius 2px
 *
 * Usage :
 *   <MiniProgressBar progress={0.75} />
 *   <MiniProgressBar progress={1.0} color={Colors.succes} />
 *
 * US-031 : Nouveaux composants designer.
 */

import React from 'react';
import { DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';

export interface MiniProgressBarProps {
  /** Valeur entre 0.0 et 1.0. Les valeurs hors limites sont clampees. */
  progress: number;
  /** Couleur de la barre. Par defaut : Colors.primaire (#1D4ED8). */
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

/**
 * MiniProgressBar
 *
 * Barre de progression fine 4px.
 * La largeur de la barre interne est calculee en pourcentage du conteneur.
 */
export function MiniProgressBar({
  progress,
  color = Colors.primaire,
  style,
  testID = 'mini-progress-bar',
}: MiniProgressBarProps): React.JSX.Element {
  // Clamp entre 0 et 1
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const widthPercent: DimensionValue = `${Math.round(clampedProgress * 100)}%`;

  return (
    <View
      testID={testID}
      style={[styles.container, style]}
    >
      <View
        testID={`${testID}-fill`}
        style={[
          styles.fill,
          {
            width: widthPercent,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
