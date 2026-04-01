/**
 * BandeauInstruction — Design System DocuPost (Mobile / React Native)
 *
 * Overlay de notification d'instruction superviseur (M-06).
 * Source design-system.md §3.7.
 *
 * Usage :
 *   <BandeauInstruction
 *     instructionId="inst-001"
 *     texte="Prioriser le colis #00312"
 *     adresse="25 Rue Victor Hugo"
 *     onVoir={handleVoir}
 *     onOk={handleOk}
 *   />
 *
 * US-025 : Design System DocuPost.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius, Spacing } from '../../theme/spacing';

export interface BandeauInstructionProps {
  instructionId: string;
  texte: string;
  adresse?: string;
  countdownSecondes?: number;
  onVoir: () => void;
  onOk: () => void;
  /** Label au-dessus du texte d'instruction — "Action Requise" (US-015/016 précisions design 2026-03-25) */
  labelActionRequise?: boolean;
}

/**
 * BandeauInstruction (React Native)
 *
 * Structure §3.7 (mise à jour 2026-03-25) :
 * [Bell] INSTRUCTION SUPERVISEUR
 *  ACTION REQUISE
 *  Prioriser le colis #00312
 *  25 Rue Victor Hugo
 *     [VOIR L'ITINÉRAIRE →]    [OK ✓]
 * ████████████████░░░  (barre verte décroissante)
 *
 * Changements précisions design 2026-03-25 (US-015/016) :
 * - Label "Action Requise" ajouté au-dessus du texte (terme domaine validé PO)
 * - Bouton "VOIR L'ITINÉRAIRE" remplace "VOIR" (CTA primaire, naviguer vers carte)
 * - Barre countdown verte (Colors.succes) remplace blanc semi-transparent
 */
export function BandeauInstruction({
  texte,
  adresse,
  countdownSecondes = 10,
  onVoir,
  onOk,
  labelActionRequise = true,
}: BandeauInstructionProps): React.JSX.Element {
  const [secondesRestantes, setSecondesRestantes] = useState(countdownSecondes);

  useEffect(() => {
    if (secondesRestantes <= 0) return;
    const timer = setInterval(() => {
      setSecondesRestantes((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondesRestantes]);

  const pourcentageCountdown = (secondesRestantes / countdownSecondes) * 100;

  return (
    <View
      testID="bandeau-instruction"
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={styles.container}
    >
      {/* En-tête */}
      <View style={styles.entete}>
        <Text style={styles.icone} accessibilityElementsHidden={true}>🔔</Text>
        <Text style={styles.titre}>INSTRUCTION SUPERVISEUR</Text>
      </View>

      {/* Corps */}
      <View style={styles.corps}>
        {/* Label "Action Requise" — US-015/016 précisions design 2026-03-25 */}
        {labelActionRequise && (
          <Text
            testID="bandeau-instruction-label-action-requise"
            style={styles.labelActionRequise}
            accessibilityRole="text"
          >
            Action Requise
          </Text>
        )}
        <Text testID="bandeau-instruction-texte" style={styles.texte}>{texte}</Text>
        {adresse && (
          <Text testID="bandeau-instruction-adresse" style={styles.adresse}>{adresse}</Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {/* Bouton "VOIR L'ITINÉRAIRE" (primaire) — US-016 précisions design 2026-03-25 */}
        <TouchableOpacity
          testID="bandeau-instruction-voir"
          onPress={onVoir}
          style={styles.btnVoirItineraire}
          accessibilityRole="button"
          accessibilityLabel="Voir l'itinéraire"
        >
          <Text style={styles.btnTexte}>VOIR L'ITINÉRAIRE →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="bandeau-instruction-ok"
          onPress={onOk}
          style={styles.btnOk}
          accessibilityRole="button"
          accessibilityLabel="Acquitter l'instruction"
        >
          <Text style={styles.btnTexte}>OK ✓</Text>
        </TouchableOpacity>
      </View>

      {/* Countdown */}
      <View style={styles.countdownFond}>
        <View
          testID="bandeau-instruction-countdown"
          style={[styles.countdownBarre, { width: `${pourcentageCountdown}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.infoFonce,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s2,
    paddingHorizontal: Spacing.s4,
    paddingTop: Spacing.s3,
    paddingBottom: Spacing.s2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  icone: {
    fontSize: 16,
  },
  titre: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.texteInverse,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  corps: {
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s2,
  },
  // Label "Action Requise" — US-015/016 précisions design 2026-03-25
  labelActionRequise: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.avertissement,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  texte: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.texteInverse,
    marginBottom: 2,
  },
  adresse: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.s2,
    paddingHorizontal: Spacing.s4,
    paddingBottom: Spacing.s2,
  },
  // Bouton "VOIR L'ITINÉRAIRE" — style primaire (US-016 précisions design 2026-03-25)
  btnVoirItineraire: {
    paddingHorizontal: Spacing.s3,
    paddingVertical: Spacing.s1,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaire,
  },
  btnOk: {
    paddingHorizontal: Spacing.s3,
    paddingVertical: Spacing.s1,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.succes,
  },
  btnTexte: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.texteInverse,
  },
  countdownFond: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  // Barre de progression verte décroissante — US-015/016 précisions design 2026-03-25
  countdownBarre: {
    height: '100%',
    backgroundColor: Colors.succes,
  },
});
