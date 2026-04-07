/**
 * CarteColis — Design System DocuPost (Mobile / React Native)
 *
 * Card cliquable représentant un colis dans la liste de la tournée (M-02).
 * Source design-system.md §3.2.
 *
 * Touch target minimum : 72px de hauteur (design-system.md §3.2).
 *
 * US-025 : Design System DocuPost — rendu de base.
 * US-029 : Swipe gauche pour déclarer un échec de livraison.
 *   - Swipe gauche >= 80px : révèle le bouton rouge "Échec" (zone 80px, fond Colors.alerte)
 *   - Tap sur bouton "Échec" : appelle onSwipeEchec(colisId) → navigation vers M-05
 *   - Seuil non atteint ou swipe-droit : la carte revient en position initiale (spring)
 *   - Swipe uniquement disponible pour les colis A_LIVRER
 *   - Implémentation : PanResponder natif React Native (react-native-gesture-handler absent)
 *
 * Invariants US-029 :
 *   - onSwipeEchec ne déclenche PAS l'événement EchecLivraisonDeclare — il ouvre M-05
 *   - Aucun swipe sur LIVRE, ECHEC, A_REPRESENTER
 *   - Seuil 80px (swipeThreshold confirmé wireframe Stitch M-02)
 *   - Zone d'action rouge 80px de large (swipeActionWidth)
 *
 * Usage :
 *   <CarteColis
 *     colisId="C-001"
 *     statut="A_LIVRER"
 *     adresse="12 Rue de la Paix"
 *     destinataire="Jean Dupont"
 *     onPress={() => navigation.navigate('DetailColis', { colisId })}
 *     onSwipeEchec={(colisId) => navigation.navigate('DeclarerEchec', { colisId })}
 *   />
 */

import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius, Spacing } from '../../theme/spacing';
import { Shadows } from '../../theme/shadows';
import { BadgeStatut, BadgeVariant } from './BadgeStatut';
import { ChipContrainte, TypeContrainte } from './ChipContrainte';

export type StatutColisVue = 'A_LIVRER' | 'LIVRE' | 'ECHEC' | 'A_REPRESENTER';

export interface CarteColisProps {
  colisId: string;
  statut: StatutColisVue;
  adresse: string;
  destinataire: string;
  appartement?: string;
  contraintes?: TypeContrainte[];
  horodatage?: string;
  motif?: string;
  onPress: () => void;
  /** US-029 : callback déclenché quand l'utilisateur tape sur le bouton "Échec" révélé par le swipe */
  onSwipeEchec?: (colisId: string) => void;
  /** Bloquant 6 — Afficher le hint "← Glisser pour signaler" (masqué après N sessions) */
  afficherHintSwipe?: boolean;
}

const STATUT_VARIANT: Record<StatutColisVue, BadgeVariant> = {
  A_LIVRER:      'info',       // → secondaryContainer / onSecondaryContainer
  LIVRE:         'succes',     // → tertiaryFixed / onTertiaryFixed
  ECHEC:         'alerte',     // → errorContainer / onErrorContainer
  A_REPRESENTER: 'avertissement',
};

const STATUT_LABELS: Record<StatutColisVue, string> = {
  A_LIVRER:      'A LIVRER',
  LIVRE:         'LIVRE',
  ECHEC:         'ECHEC',
  A_REPRESENTER: 'A REPRESENTER',
};

/** Seuil en px pour déclencher l'action swipe (wireframe Stitch M-02 : swipeThreshold: 80) */
const SWIPE_THRESHOLD = 80;
/** Largeur de la zone d'action rouge révélée (wireframe Stitch M-02 : swipeActionWidth: 80) */
const SWIPE_ACTION_WIDTH = 80;

/** Statuts pour lesquels le swipe-gauche est disponible (US-029 invariant) */
const STATUTS_SWIPABLES: StatutColisVue[] = ['A_LIVRER'];

/**
 * CarteColis avec support swipe-gauche (US-029)
 *
 * Structure §3.2 :
 * ┌─────────────────────────────────────────────────────────┐
 * │ [Zone action rouge "Échec" 80px] │ [Contenu de la carte]│
 * └─────────────────────────────────────────────────────────┘
 *
 * Mécanisme swipe (PanResponder) :
 * - La carte (TouchableOpacity) est translatée sur l'axe X (translateX).
 * - La zone rouge est positionnée en absolute à droite, toujours 0px (décalée derrière la carte).
 * - Quand translateX < -SWIPE_THRESHOLD → zone rouge visible + carte décalée.
 * - Relâcher avant seuil → spring back vers 0.
 * - Swipe-droit depuis position décalée → spring back vers 0.
 */
export function CarteColis({
  colisId,
  statut,
  adresse,
  destinataire,
  appartement,
  contraintes = [],
  horodatage,
  motif,
  onPress,
  onSwipeEchec,
  afficherHintSwipe = false,
}: CarteColisProps): React.JSX.Element {
  const variant = STATUT_VARIANT[statut];
  const label = STATUT_LABELS[statut];
  const estLivre = statut === 'LIVRE';
  const estEchec = statut === 'ECHEC';
  const swipeActif = STATUTS_SWIPABLES.includes(statut) && !!onSwipeEchec;

  // ─── Animation swipe (US-029) ─────────────────────────────────────────────
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      // Capturer uniquement si le geste est principalement horizontal
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        return swipeActif && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
      },
      onPanResponderMove: (_evt, gestureState) => {
        // Limiter le déplacement : gauche seulement (dx < 0) jusqu'à -SWIPE_ACTION_WIDTH
        // Depuis position décalée, autoriser le retour droite (dx > 0)
        const dx = Math.min(0, Math.max(-SWIPE_ACTION_WIDTH, gestureState.dx));
        translateX.setValue(dx);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (!swipeActif) return;
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Seuil atteint → snap vers -SWIPE_ACTION_WIDTH (zone rouge révélée)
          Animated.spring(translateX, {
            toValue: -SWIPE_ACTION_WIDTH,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        } else {
          // Seuil non atteint ou swipe-droit → retour à la position initiale
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  /** Réinitialise la position de la carte (après tap sur bouton Echec) */
  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const handleSwipeEchec = () => {
    resetPosition();
    onSwipeEchec?.(colisId);
  };

  // ─── Rendu avec swipe (wrapper + zone rouge + carte animée) ────────────────

  if (swipeActif) {
    return (
      <View
        testID="carte-colis-swipe-wrapper"
        style={styles.swipeWrapper}
      >
        {/* Zone d'action rouge révélée par le swipe (positionnée derrière la carte) */}
        <View style={styles.zoneActionEchec} pointerEvents="box-none">
          <TouchableOpacity
            testID="bouton-swipe-echec"
            accessibilityRole="button"
            accessibilityLabel={`Déclarer l'échec de livraison du colis ${colisId}`}
            style={styles.boutonEchec}
            onPress={handleSwipeEchec}
          >
            <Text style={styles.boutonEchecIcone}>✕</Text>
            <Text style={styles.boutonEchecTexte}>Échec</Text>
          </TouchableOpacity>
        </View>

        {/* Carte animée — se déplace horizontalement lors du swipe */}
        <Animated.View
          style={[styles.animatedWrapper, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            testID="carte-colis"
            accessibilityRole="button"
            accessibilityLabel={`Voir le détail du colis ${colisId}`}
            onPress={onPress}
            activeOpacity={0.7}
            style={[
              styles.container,
              styles.containerInSwipe,
              estLivre && styles.containerLivre,
              estEchec && styles.containerEchec,
              ...(estLivre ? [{ opacity: 0.7 }] : []),
            ]}
          >
            {/* Bloquant 6 : hint swipe conditionnel (masqué après N sessions) */}
          {renderContenu({ label, variant, adresse, destinataire, appartement, contraintes, horodatage, motif, estEchec, avecHintSwipe: afficherHintSwipe })}
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // ─── Rendu sans swipe (statuts terminaux ou pas de onSwipeEchec) ───────────

  return (
    <TouchableOpacity
      testID="carte-colis"
      accessibilityRole="button"
      accessibilityLabel={`Voir le détail du colis ${colisId}`}
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        estLivre && styles.containerLivre,
        estEchec && styles.containerEchec,
        ...(estLivre ? [{ opacity: 0.7 }] : []),
      ]}
    >
      {renderContenu({ label, variant, adresse, destinataire, appartement, contraintes, horodatage, motif, estEchec })}
    </TouchableOpacity>
  );
}

// ─── Contenu interne de la carte (partagé entre rendu swipe et sans swipe) ──

interface ContenuProps {
  label: string;
  variant: BadgeVariant;
  adresse: string;
  destinataire: string;
  appartement?: string;
  contraintes: TypeContrainte[];
  horodatage?: string;
  motif?: string;
  estEchec: boolean;
  /** L5 : afficher le hint visuel swipe-gauche pour signaler l'action disponible */
  avecHintSwipe?: boolean;
}

function renderContenu({
  label,
  variant,
  adresse,
  destinataire,
  appartement,
  contraintes,
  horodatage,
  motif,
  estEchec,
  avecHintSwipe = false,
}: ContenuProps): React.ReactNode {
  return (
    <>
      {/* Ligne 1 : badge + contraintes + L5 hint swipe */}
      <View style={styles.entete}>
        <BadgeStatut variant={variant} label={label} size="sm" />
        <View style={styles.enteteRight}>
          <View style={styles.contraintes}>
            {contraintes.map((type, idx) => (
              <ChipContrainte key={idx} type={type} />
            ))}
          </View>
          {/* L5 : micro-hint visuel indiquant le swipe disponible */}
          {avecHintSwipe && (
            <Text
              testID="hint-swipe-echec"
              style={styles.hintSwipe}
              accessibilityElementsHidden
            >
              ← Échec
            </Text>
          )}
        </View>
      </View>

      {/* Ligne 2 : adresse */}
      <Text testID="carte-colis-adresse" style={styles.adresse} numberOfLines={2}>
        {adresse}
      </Text>

      {/* Ligne 3 : destinataire */}
      <Text testID="carte-colis-destinataire" style={styles.destinataire} numberOfLines={1}>
        {destinataire}
        {appartement ? ` — ${appartement}` : ''}
      </Text>

      {/* Métadonnées */}
      {horodatage && (
        <Text testID="carte-colis-horodatage" style={styles.horodatage}>
          {horodatage}
        </Text>
      )}
      {motif && estEchec && (
        <Text testID="carte-colis-motif" style={styles.motif}>
          Motif : {motif}
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // ─── Structure swipe (US-029) ───────────────────────────────────────────────
  swipeWrapper: {
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: Spacing.s4,
    marginVertical: 4,
  },
  animatedWrapper: {
    // Pas de marges ici — elles sont sur swipeWrapper
  },
  zoneActionEchec: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SWIPE_ACTION_WIDTH,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boutonEchec: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  boutonEchecIcone: {
    fontSize: 20,
    color: Colors.onPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  boutonEchecTexte: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onPrimary,
    letterSpacing: 0.5,
  },

  // ─── Carte principale ───────────────────────────────────────────────────────
  container: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.s3,
    paddingHorizontal: Spacing.s4,
    marginHorizontal: Spacing.s4,
    marginVertical: 4,
    minHeight: 72,
    ...Shadows.cardSm,
  },
  containerInSwipe: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  containerLivre: {
    // opacity géré en ligne pour le test style
  },
  containerEchec: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  entete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s1,
  },
  enteteRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contraintes: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  hintSwipe: {
    fontSize: 10,
    color: Colors.outline,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  adresse: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  destinataire: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  horodatage: {
    fontSize: 12,
    color: Colors.outline,
    marginTop: 2,
  },
  motif: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
    marginTop: 2,
  },
});
