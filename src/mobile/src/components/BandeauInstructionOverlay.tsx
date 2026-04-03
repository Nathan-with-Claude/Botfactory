import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { InstructionMobileDTO } from '../api/supervisionApi';

/**
 * Composant M-06 — Bandeau overlay notification d'instruction (US-016 / US-037)
 *
 * Affiché par-dessus l'écran courant quand une nouvelle instruction du superviseur
 * est reçue par le livreur (via polling ou FCM Sprint 3).
 *
 * Comportement :
 * - Apparaît par glissement depuis le haut (animation slide-down).
 * - Disparaît automatiquement après 10 secondes si Pierre n'interagit pas.
 * - Bouton "VOIR" : navigue vers M-03 (DetailColisScreen) pour le colis concerné.
 * - Bouton "×" : ferme le bandeau sans naviguer.
 * - US-037 : persiste l'instruction dans AsyncStorage via onConsignePersistee
 *   pour que l'historique "Mes consignes" survive à la fermeture du bandeau.
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
        // Persistance silencieuse — l'historique n'est pas critique pour le livreur
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
  bandeau: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E65100',
    padding: 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titre: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  boutonFermer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  boutonFermerTexte: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 22,
  },
  boutonVoir: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  boutonVoirTexte: {
    color: '#E65100',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

export default BandeauInstructionOverlay;
