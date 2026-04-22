import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Theme } from '../theme/theme';

/**
 * BroadcastOverlay — Composant overlay notification broadcast (US-068)
 *
 * Design : slide-down depuis le haut, animation spring identique à BandeauInstructionOverlay.
 * Badge coloré selon le type (ALERTE=rouge, INFO=bleu, CONSIGNE=orange).
 * Auto-fermeture après 15s (override autoFermetureMs pour les tests).
 *
 * Si broadcast === null, ne rend rien.
 *
 * Source : US-068 — "Recevoir et consulter les messages broadcast sur l'application mobile"
 * Wireframe : M-08 — Notification broadcast reçue
 */

const DUREE_AUTO_FERMETURE_MS = 15_000;

// ─── Couleurs par type ────────────────────────────────────────────────────────

const COULEUR_PAR_TYPE: Record<string, string> = {
  ALERTE:   '#DC2626',
  INFO:     '#1D4ED8',
  CONSIGNE: '#D97706',
};

const LIBELLE_PAR_TYPE: Record<string, string> = {
  ALERTE:   'Alerte',
  INFO:     'Info',
  CONSIGNE: 'Consigne',
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BroadcastOverlayProps {
  broadcast: {
    broadcastMessageId: string;
    type: 'ALERTE' | 'INFO' | 'CONSIGNE';
    texte: string;
    superviseurNom?: string;
  } | null;
  onVoir: () => void;
  onFermer: () => void;
  /** Override pour les tests — permet de contrôler le timer */
  autoFermetureMs?: number;
}

// ─── Composant ────────────────────────────────────────────────────────────────

const BroadcastOverlay: React.FC<BroadcastOverlayProps> = ({
  broadcast,
  onVoir,
  onFermer,
  autoFermetureMs = DUREE_AUTO_FERMETURE_MS,
}) => {
  const translateY = useRef(new Animated.Value(-120)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!broadcast) return;

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();

    timerRef.current = setTimeout(() => {
      onFermer();
    }, autoFermetureMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoFermetureMs, broadcast, onFermer, translateY]);

  if (!broadcast) return null;

  const couleur = COULEUR_PAR_TYPE[broadcast.type] ?? Colors.infoFonce;
  const libelleType = LIBELLE_PAR_TYPE[broadcast.type] ?? broadcast.type;

  const handleVoir = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onVoir();
  };

  const handleFermer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onFermer();
  };

  return (
    <Animated.View
      testID="broadcast-overlay"
      style={[styles.bandeau, { transform: [{ translateY }] }]}
      accessibilityRole="alert"
      accessibilityLabel={`Message superviseur : ${libelleType} — ${broadcast.texte}`}
    >
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.titre}>MESSAGE SUPERVISEUR</Text>
        <TouchableOpacity
          testID="bouton-fermer-broadcast"
          onPress={handleFermer}
          accessibilityRole="button"
          accessibilityLabel="Fermer le message"
          style={styles.boutonFermer}
        >
          <Text style={styles.boutonFermerTexte}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Badge type */}
      <View style={[styles.badge, { backgroundColor: couleur }]}>
        <Text style={styles.badgeTexte} testID="badge-type-broadcast">
          {libelleType.toUpperCase()}
        </Text>
      </View>

      {/* Texte tronqué à 2 lignes */}
      <Text
        style={styles.message}
        testID="texte-broadcast"
        numberOfLines={2}
      >
        {broadcast.texte}
      </Text>

      {/* Bouton VOIR */}
      <TouchableOpacity
        testID="bouton-voir-broadcast"
        onPress={handleVoir}
        style={[styles.boutonVoir, { borderColor: Colors.onPrimary }]}
        accessibilityRole="button"
        accessibilityLabel="Voir tous les messages"
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
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  badgeTexte: {
    color: Colors.onPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  message: {
    color: Colors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 14,
    lineHeight: 22,
  },
  boutonVoir: {
    borderWidth: 1.5,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
    minHeight: Theme.touchTarget.minHeight,
    justifyContent: 'center',
  },
  boutonVoirTexte: {
    color: Colors.onPrimary,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default BroadcastOverlay;
