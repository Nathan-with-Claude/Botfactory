import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { ColisDTO, StatutColis } from '../api/tourneeTypes';

/**
 * Composant — ColisItem
 * Affiche un colis dans la liste de la tournee (ecran M-02).
 *
 * Affiche :
 * - Adresse complete du colis
 * - Nom du destinataire
 * - Badge statut colore (A_LIVRER = bleu, LIVRE = vert, ECHEC = rouge, A_REPRESENTER = orange)
 * - Contraintes (mise en evidence si contrainte horaire)
 *
 * Interactions :
 * - Appui sur l'item : navigue vers M-03 (Detail du colis) via la prop onPress (US-004)
 *
 * Source wireframe : M-02 — Liste des colis de la tournee.
 */

/** Seuil swipe gauche pour déclarer un échec (Bloquant 6 + US-029) */
const SWIPE_THRESHOLD = 80;
const SWIPE_ACTION_WIDTH = 80;

interface ColisItemProps {
  colis: ColisDTO;
  onPress?: (colisId: string) => void; // US-004 : navigation vers DetailColisScreen
  /** Bloquant 6 — Afficher le hint "← Glisser pour signaler" (masqué après N sessions) */
  afficherHintSwipe?: boolean;
  /** US-029 — Callback déclenché quand l'utilisateur tape sur le bouton "Échec" révélé par swipe */
  onSwipeEchec?: (colisId: string) => void;
}

const STATUT_LABELS: Record<StatutColis, string> = {
  A_LIVRER: 'A livrer',
  LIVRE: 'Livre',
  ECHEC: 'Echec',
  A_REPRESENTER: 'A representer',
};

const STATUT_COLORS: Record<StatutColis, string> = {
  A_LIVRER: '#2196F3',  // bleu
  LIVRE: '#4CAF50',     // vert
  ECHEC: '#F44336',     // rouge
  A_REPRESENTER: '#FF9800', // orange
};

export const ColisItem: React.FC<ColisItemProps> = ({
  colis,
  onPress,
  afficherHintSwipe = false,
  onSwipeEchec,
}) => {
  const statutColor = STATUT_COLORS[colis.statut];
  const statutLabel = STATUT_LABELS[colis.statut];
  const estTraite = colis.estTraite;
  const swipeActif = colis.statut === 'A_LIVRER' && !!onSwipeEchec;

  // Animation swipe (Bloquant 6 + US-029)
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
      {/* En-tete : adresse + badge statut */}
      <View style={styles.header}>
        <Text
          style={[styles.adresse, estTraite && styles.adresseTraite]}
          numberOfLines={2}
          testID="colis-adresse"
        >
          {colis.adresseLivraison.adresseComplete}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {/* Bloquant 6 — hint swipe visible seulement pendant les N premières sessions */}
          {afficherHintSwipe && swipeActif && (
            <Text testID="hint-swipe" style={styles.hintSwipe} accessibilityElementsHidden>
              {'← Glisser'}
            </Text>
          )}
          <View style={[styles.badge, { backgroundColor: statutColor }]}>
            <Text style={styles.badgeText} testID="colis-statut">
              {statutLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Destinataire */}
      <Text style={styles.destinataire} testID="colis-destinataire">
        {colis.destinataire.nom}
      </Text>

      {/* Contraintes */}
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
              <Text
                style={[
                  styles.contrainteText,
                  contrainte.estHoraire && styles.contrainteHoraireText,
                ]}
              >
                {contrainte.estHoraire ? '⚑ ' : ''}{contrainte.valeur}
              </Text>
            </View>
          ))}
        </View>
      )}
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
      {/* En-tete : adresse + badge statut */}
      <View style={styles.header}>
        <Text
          style={[styles.adresse, estTraite && styles.adresseTraite]}
          numberOfLines={2}
          testID="colis-adresse"
        >
          {colis.adresseLivraison.adresseComplete}
        </Text>
        <View style={[styles.badge, { backgroundColor: statutColor }]}>
          <Text style={styles.badgeText} testID="colis-statut">
            {statutLabel}
          </Text>
        </View>
      </View>

      {/* Destinataire */}
      <Text style={styles.destinataire} testID="colis-destinataire">
        {colis.destinataire.nom}
      </Text>

      {/* Contraintes */}
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
              <Text
                style={[
                  styles.contrainteText,
                  contrainte.estHoraire && styles.contrainteHoraireText,
                ]}
              >
                {contrainte.estHoraire ? '⚑ ' : ''}{contrainte.valeur}
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  containerTraite: {
    opacity: 0.6,
    borderLeftColor: '#9E9E9E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  adresse: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  adresseTraite: {
    color: '#757575',
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  destinataire: {
    fontSize: 13,
    color: '#424242',
    marginTop: 4,
  },
  contraintesContainer: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  contrainte: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  contrainteHoraire: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  contrainteText: {
    fontSize: 12,
    color: '#616161',
  },
  contrainteHoraireText: {
    color: '#E65100',
    fontWeight: '600',
  },
  // Styles swipe (Bloquant 6 + US-029)
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
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonEchec: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonEchecTexte: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  // Hint swipe (Bloquant 6)
  hintSwipe: {
    fontSize: 10,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
});

export default ColisItem;
