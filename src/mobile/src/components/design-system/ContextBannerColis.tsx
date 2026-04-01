/**
 * ContextBannerColis (DC-04) — Design System DocuPost (Mobile / React Native)
 *
 * Banniere contextuelle lecture seule identifiant le colis en cours.
 * Presente sur M-04 (capture preuve — variant neutre) et M-05 (echec — variant erreur).
 *
 * Spec US-031 DC-04 :
 * - Props : colisId (string), destinataire (string), variant ("neutre" | "erreur")
 * - variant "neutre" (M-04) : bordure gauche 4px Colors.primaire, fond surface secondaire
 * - variant "erreur" (M-05) : bordure gauche 4px Colors.alerte, fond alerte leger
 * - Icone : colis (Package)
 * - Label : "COLIS EN COURS" uppercase 10px
 *
 * Usage :
 *   <ContextBannerColis colisId="C-042" destinataire="Jean Dupont" variant="neutre" />
 *   <ContextBannerColis colisId="C-042" destinataire="Jean Dupont" variant="erreur" />
 *
 * US-031 : Nouveaux composants designer.
 */

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';

export type ContextBannerVariant = 'neutre' | 'erreur';

export interface ContextBannerColisProps {
  colisId: string;
  destinataire: string;
  variant: ContextBannerVariant;
  style?: ViewStyle;
  testID?: string;
}

/**
 * ContextBannerColis
 *
 * Bandeau lecture seule affichant le contexte colis courant.
 * La bordure gauche colore communique semantiquement le variant :
 * - neutre = flux normal (bleu primaire)
 * - erreur = flux echec (rouge alerte)
 */
export function ContextBannerColis({
  colisId,
  destinataire,
  variant,
  style,
  testID = 'context-banner-colis',
}: ContextBannerColisProps): React.JSX.Element {
  const isErreur = variant === 'erreur';

  return (
    <View
      testID={testID}
      accessibilityLabel={`Colis en cours ${colisId} pour ${destinataire}`}
      style={[
        styles.container,
        isErreur ? styles.containerErreur : styles.containerNeutre,
        style,
      ]}
    >
      {/* Icone colis — representation textuelle (pas de dependance externe) */}
      <Text style={styles.icone} accessibilityElementsHidden>
        📦
      </Text>

      <View style={styles.contenu}>
        {/* Label "COLIS EN COURS" */}
        <Text
          testID="context-banner-label"
          style={[styles.label, isErreur ? styles.labelErreur : styles.labelNeutre]}
        >
          COLIS EN COURS
        </Text>

        {/* ID du colis */}
        <Text testID="context-banner-colis-id" style={styles.colisId}>
          {colisId}
        </Text>

        {/* Nom du destinataire */}
        <Text testID="context-banner-destinataire" style={styles.destinataire} numberOfLines={1}>
          {destinataire}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
  },
  containerNeutre: {
    backgroundColor: Colors.surfaceSecondary,
    borderLeftColor: Colors.primaire,
  },
  containerErreur: {
    backgroundColor: Colors.alerteLeger,
    borderLeftColor: Colors.alerte,
  },
  icone: {
    fontSize: 20,
    marginRight: 12,
  },
  contenu: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  labelNeutre: {
    color: Colors.primaire,
  },
  labelErreur: {
    color: Colors.alerte,
  },
  colisId: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textePrimaire,
  },
  destinataire: {
    fontSize: 13,
    color: Colors.texteSecondaire,
  },
});
