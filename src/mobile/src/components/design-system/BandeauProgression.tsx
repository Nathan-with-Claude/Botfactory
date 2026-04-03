/**
 * BandeauProgression — Design System DocuPost (Mobile / React Native)
 *
 * Bandeau d'avancement de la tournée (M-02 header).
 * Source design-system.md §3.3.
 * Hauteur design : 80px.
 *
 * Usage :
 *   <BandeauProgression
 *     resteLivrer={7} total={10} pourcentage={30}
 *     statut="encours" syncStatus="live"
 *   />
 *
 * US-025 : Design System DocuPost.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius, Spacing } from '../../theme/spacing';
import { IndicateurSync, SyncStatus } from './IndicateurSync';

export type StatutProgression = 'encours' | 'arisque' | 'cloturee';

export interface BandeauProgressionProps {
  resteLivrer: number;
  total: number;
  pourcentage: number;
  finEstimee?: string;
  statut: StatutProgression;
  syncStatus: SyncStatus;
}

const BARRE_COLORS: Record<StatutProgression, string> = {
  encours:  Colors.progresEncours,
  arisque:  Colors.progresRisque,
  cloturee: Colors.progresDone,
};

/**
 * BandeauProgression (React Native)
 *
 * Hauteur fixe 80px (design-system.md §4 mobile).
 */
export function BandeauProgression({
  resteLivrer,
  total,
  pourcentage,
  finEstimee,
  statut,
  syncStatus,
}: BandeauProgressionProps): React.JSX.Element {
  const clampedPourcentage = Math.min(100, Math.max(0, pourcentage));
  const barreColor = BARRE_COLORS[statut];

  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityValue={{ now: clampedPourcentage, min: 0, max: 100 }}>
      {/* Entête */}
      <View style={styles.entete}>
        <Text testID="bandeau-compteur" style={styles.compteur}>
          Reste à livrer : <Text style={styles.compteurGras}>{resteLivrer} / {total}</Text>
        </Text>
        <IndicateurSync syncStatus={syncStatus} />
      </View>

      {/* Barre */}
      <View style={styles.barreFond}>
        <View
          testID="bandeau-barre"
          style={[styles.barreRemplie, { width: `${clampedPourcentage}%`, backgroundColor: barreColor }]}
        />
      </View>

      {/* Méta */}
      <View style={styles.meta}>
        <Text style={styles.pourcentage}>{clampedPourcentage} %</Text>
        {finEstimee && (
          <Text testID="bandeau-fin-estimee" style={styles.finEstimee}>
            Fin estimée : {finEstimee}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfacePrimary,
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bordureNeutre,
    gap: Spacing.s2,
  },
  entete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compteur: {
    fontSize: 14,
    color: Colors.texteSecondaire,
  },
  compteurGras: {
    fontWeight: '600',
    color: Colors.textePrimaire,
  },
  barreFond: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.fondNeutre,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  barreRemplie: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s4,
  },
  pourcentage: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textePrimaire,
  },
  finEstimee: {
    fontSize: 12,
    color: Colors.texteSecondaire,
  },
});
