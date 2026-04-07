import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { InstructionMobileDTO } from '../api/supervisionApi';
import { Colors } from '../theme/colors';
import { Theme } from '../theme/theme';

/**
 * Composant M-06 — Bandeau overlay notification d'instruction (US-016 / US-037)
 *
 * Design : Material Design 3 — fond infoFonce (#1E3A8A) comme défini dans les tokens
 * Overlay plein écran top, animation slide-down, compte à rebours 10s
 *
 * Source : US-016 / US-037
 * Wireframe : M-06 — Notification d'instruction reçue
 */

const DUREE_AUTO_FERMETURE_MS = 10_000;

// ─── Props ────────────────────────────────────────────────────────────────────

interface BandeauInstructionOverlayProps {
  instruction: InstructionMobileDTO;
  onVoir: (colisId: string) => void;
  onFermer: () => void;
  /** Override pour les tests — permet de contrôler le timer */
  autoFermetureMs?: number;
  /**
   * US-037 — Callback appelé au montage pour persister l'instruction dans
   * l'historique AsyncStorage. Optionnel pour rétrocompatibilité avec les
   * tests US-016 existants.
   */
  onConsignePersistee?: (instruction: InstructionMobileDTO) => Promise<void>;
}

// ─── Composant ────────────────────────────────────────────────────────────────

const BandeauInstructionOverlay: React.FC<BandeauInstructionOverlayProps> = ({
  instruction,
  onVoir,
  onFermer,
  autoFermetureMs = DUREE_AUTO_FERMETURE_MS,
  onConsignePersistee,
}) => {
  const translateY = useRef(new Animated.Value(-120)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation slide-down à l'affichage + persistance US-037
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();

    // US-037 : persister l'instruction dans l'historique local dès la réception
    if (onConsignePersistee) {
      onConsignePersistee(instruction).catch(() => {
        // Persistance silencieuse
      });
    }

    // Fermeture automatique après autoFermetureMs
    timerRef.current = setTimeout(() => {
      onFermer();
    }, autoFermetureMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoFermetureMs, instruction, onConsignePersistee, onFermer, translateY]);

  const handleVoir = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onVoir(instruction.colisId);
  };

  const handleFermer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onFermer();
  };

  const libelleType: Record<string, string> = {
    PRIORISER: 'Prioriser',
    ANNULER: 'Annuler',
    REPROGRAMMER: 'Reprogrammer',
  };

  return (
    <Animated.View
      testID="bandeau-instruction-overlay"
      style={[styles.bandeau, { transform: [{ translateY }] }]}
      accessibilityRole="alert"
      accessibilityLabel={`Instruction superviseur : ${libelleType[instruction.typeInstruction] ?? instruction.typeInstruction} colis ${instruction.colisId}`}
    >
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.titre} testID="titre-instruction">
          INSTRUCTION SUPERVISEUR
        </Text>
        <TouchableOpacity
          testID="bouton-fermer-bandeau"
          onPress={handleFermer}
          accessibilityRole="button"
          accessibilityLabel="Fermer le bandeau"
          style={styles.boutonFermer}
        >
          <Text style={styles.boutonFermerTexte}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Corps */}
      <Text style={styles.message} testID="message-instruction">
        {libelleType[instruction.typeInstruction] ?? instruction.typeInstruction}{' '}
        le colis {instruction.colisId}
        {instruction.creneauCible
          ? ` — ${new Date(instruction.creneauCible).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
          : ''}
      </Text>

      {/* Action */}
      <TouchableOpacity
        testID="bouton-voir-instruction"
        onPress={handleVoir}
        style={styles.boutonVoir}
        accessibilityRole="button"
        accessibilityLabel="Voir le détail du colis"
      >
        <Text style={styles.boutonVoirTexte}>VOIR</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Fond infoFonce (#1E3A8A) — overlay bleu foncé M-06
  bandeau: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.infoFonce,
    padding: 16,
    zIndex: 1000,
    ...Theme.shadow.lg,
    borderBottomLeftRadius: Theme.borderRadius.lg,
    borderBottomRightRadius: Theme.borderRadius.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titre: {
    color: Colors.tertiaryFixed,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  boutonFermer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    minWidth: 32,
    minHeight: 32,
  },
  boutonFermerTexte: {
    color: Colors.onPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  message: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 14,
    lineHeight: 24,
  },
  boutonVoir: {
    backgroundColor: Colors.onPrimary,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: Theme.touchTarget.minHeight,
    justifyContent: 'center',
  },
  boutonVoirTexte: {
    color: Colors.infoFonce,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default BandeauInstructionOverlay;
