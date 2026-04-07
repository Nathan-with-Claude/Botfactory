import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { ColisDTO, StatutColis } from '../api/tourneeTypes';
import { Colors } from '../theme/colors';
import { Theme } from '../theme/theme';

/**
 * Composant — ColisItem
 * Affiche un colis dans la liste de la tournee (ecran M-02).
 *
 * Design : Material Design 3 — palette designer
 * - Card surfaceContainerLowest (blanc) + bande colorée gauche 4px
 * - Badge statut : secondaryContainer (A LIVRER) / tertiary (LIVRÉ) / error (ECHEC)
 * - Avatar destinataire cercle surfaceContainer
 * - Adresse : 20px bold onSurface
 *
 * Source wireframe : M-02 — Liste des colis de la tournee.
 */

const SWIPE_THRESHOLD = 80;
const SWIPE_ACTION_WIDTH = 80;

interface ColisItemProps {
  colis: ColisDTO;
  onPress?: (colisId: string) => void;
  afficherHintSwipe?: boolean;
  onSwipeEchec?: (colisId: string) => void;
}

const STATUT_LABELS: Record<StatutColis, string> = {
  A_LIVRER: 'A LIVRER',
  LIVRE: 'LIVRÉ',
  ECHEC: 'ECHEC',
  A_REPRESENTER: 'REPASSAGE',
};

// Couleurs de la bande gauche selon statut
const STATUT_BANDE_COLOR: Record<StatutColis, string> = {
  A_LIVRER:      Colors.primary,
  LIVRE:         Colors.tertiaryContainer,
  ECHEC:         Colors.error,
  A_REPRESENTER: Colors.avertissement,
};

// Fond du badge selon statut
const STATUT_BADGE_BG: Record<StatutColis, string> = {
  A_LIVRER:      Colors.secondaryContainer,
  LIVRE:         Colors.tertiary,
  ECHEC:         Colors.errorContainer,
  A_REPRESENTER: Colors.avertissementLeger,
};

// Texte du badge selon statut
const STATUT_BADGE_TEXT: Record<StatutColis, string> = {
  A_LIVRER:      Colors.onSecondaryContainer,
  LIVRE:         Colors.onTertiary,
  ECHEC:         Colors.onErrorContainer,
  A_REPRESENTER: Colors.avertissementFonce,
};

export const ColisItem: React.FC<ColisItemProps> = ({
  colis,
  onPress,
  afficherHintSwipe = false,
  onSwipeEchec,
}) => {
  const bandeColor = STATUT_BANDE_COLOR[colis.statut];
  const badgeBg = STATUT_BADGE_BG[colis.statut];
  const badgeTextColor = STATUT_BADGE_TEXT[colis.statut];
  const statutLabel = STATUT_LABELS[colis.statut];
  const estTraite = colis.estTraite;
  const swipeActif = colis.statut === 'A_LIVRER' && !!onSwipeEchec;

  // Animation swipe
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) =>
        swipeActif && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2,
      onPanResponderMove: (_evt, gestureState) => {
        const dx = Math.min(0, Math.max(-SWIPE_ACTION_WIDTH, gestureState.dx));
        translateX.setValue(dx);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (!swipeActif) return;
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          Animated.spring(translateX, { toValue: -SWIPE_ACTION_WIDTH, useNativeDriver: true, bounciness: 4 }).start();
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 8 }).start();
        }
      },
    })
  ).current;

  const handleSwipeEchec = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
    onSwipeEchec?.(colis.colisId);
  };

  // Contenu de la carte (partagé)
  const contenu = (
    <>
      {/* Bande colorée gauche (4px) */}
      <View style={[styles.bandeGauche, { backgroundColor: bandeColor }]} />

      {/* Corps de la carte */}
      <View style={styles.corps}>
        {/* Ligne 1 : badge statut */}
        <View style={styles.ligneBadges}>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeTextColor }]} testID="colis-statut">
              {statutLabel}
            </Text>
          </View>
        </View>

        {/* Adresse */}
        <Text
          style={[styles.adresse, estTraite && styles.adresseTraite]}
          numberOfLines={2}
          testID="colis-adresse"
        >
          {colis.adresseLivraison.adresseComplete}
        </Text>

        {/* Destinataire avec avatar */}
        <View style={styles.destinataireRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcone}>👤</Text>
          </View>
          <Text style={[styles.destinataire, estTraite && styles.destinataireTraite]} testID="colis-destinataire">
            {colis.destinataire.nom}
          </Text>
        </View>

        {/* Toutes les contraintes (horaires et non horaires) avec testID préservés */}
        {colis.contraintes.length > 0 && (
          <View style={styles.contraintesContainer} testID="colis-contraintes">
            {colis.contraintes.map((contrainte, idx) => (
              <View
                key={idx}
                style={[
                  styles.contrainte,
                  contrainte.estHoraire && styles.contrainteHoraire,
                ]}
                testID={`colis-contrainte-${idx}`}
              >
                <Text style={[
                  styles.contrainteText,
                  contrainte.estHoraire && styles.contrainteHoraireText,
                ]}>
                  {contrainte.estHoraire ? `⏰ ${contrainte.valeur}` : contrainte.valeur}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* US-045 — Hint swipe */}
        {afficherHintSwipe && swipeActif && (
          <Text
            testID="hint-swipe"
            style={styles.hintSwipe}
            accessibilityLabel="Glissez vers la gauche pour déclarer un problème"
            accessibilityRole="text"
          >
            {'← Glissez vers la gauche pour déclarer un problème'}
          </Text>
        )}
      </View>
    </>
  );

  if (swipeActif) {
    return (
      <View testID="colis-item" style={styles.swipeWrapper}>
        {/* Zone d'action rouge (derrière la carte) */}
        <View style={styles.zoneActionEchec} pointerEvents="box-none">
          <TouchableOpacity
            testID="bouton-swipe-echec"
            accessibilityRole="button"
            accessibilityLabel={`Déclarer l'échec de livraison du colis ${colis.colisId}`}
            style={styles.boutonEchec}
            onPress={handleSwipeEchec}
          >
            <Text style={styles.boutonEchecTexte}>Échec</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
          <TouchableOpacity
            style={[styles.container, estTraite && styles.containerTraite, styles.containerInSwipe]}
            onPress={() => onPress?.(colis.colisId)}
            accessibilityRole="button"
            accessibilityLabel={`Voir le detail du colis ${colis.colisId}`}
            activeOpacity={0.7}
          >
            {contenu}
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, estTraite && styles.containerTraite]}
      testID="colis-item"
      onPress={() => onPress?.(colis.colisId)}
      accessibilityRole="button"
      accessibilityLabel={`Voir le detail du colis ${colis.colisId}`}
      activeOpacity={0.7}
    >
      {contenu}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Theme.borderRadius.lg,
    marginHorizontal: 16,
    marginVertical: 4,
    minHeight: 72,
    flexDirection: 'row',
    overflow: 'hidden',
    ...Theme.shadow.sm,
  },
  containerTraite: {
    opacity: 0.6,
  },
  // Bande colorée gauche (4px)
  bandeGauche: {
    width: 4,
    borderTopLeftRadius: Theme.borderRadius.lg,
    borderBottomLeftRadius: Theme.borderRadius.lg,
  },
  corps: {
    flex: 1,
    padding: 16,
    gap: 6,
  },
  ligneBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  adresse: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 24,
  },
  adresseTraite: {
    color: Colors.onSurfaceVariant,
  },
  destinataireRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcone: {
    fontSize: 16,
  },
  destinataire: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
    flex: 1,
  },
  destinataireTraite: {
    color: Colors.onSurfaceVariant,
  },
  contraintesContainer: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  contrainte: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  contrainteHoraire: {
    backgroundColor: Colors.errorContainer,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  contrainteText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  contrainteHoraireText: {
    color: Colors.onErrorContainer,
    fontWeight: '600',
  },
  // Styles swipe
  swipeWrapper: {
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 4,
  },
  containerInSwipe: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  zoneActionEchec: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SWIPE_ACTION_WIDTH,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.lg,
  },
  boutonEchec: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonEchecTexte: {
    color: Colors.onPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  hintSwipe: {
    fontSize: 10,
    color: Colors.outline,
    fontStyle: 'italic',
  },
});

export default ColisItem;
