/**
 * MesConsignesScreen — Écran M-07 (US-037)
 *
 * Affiche l'historique des instructions superviseur reçues dans la journée.
 * Accessible depuis la ListeColisScreen via le bouton "Mes consignes" (avec badge).
 *
 * Chaque consigne affiche :
 * - Son type (PRIORISER, MODIFIER_CRENEAU, ANNULER, MESSAGE_LIBRE)
 * - Son statut : Nouvelle / Prise en compte / Exécutée
 * - L'horodatage de réception
 * - Le colis concerné (si applicable)
 * - Un bouton "Marquer exécutée" pour les consignes en statut ENVOYEE
 *
 * Architecture :
 * - Composant stateless : toute la logique de persistance est dans useConsignesLocales.
 * - Props injectables pour les tests (onMarquerExecutee, syncEnCours).
 * - La liste est déjà triée par date décroissante par le hook.
 *
 * Source : US-037 — Historique des consignes livreur
 * Wireframe : M-07 — Mes consignes
 */

import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ConsigneLocale } from '../hooks/useConsignesLocales';
import { Colors } from '../theme/colors';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MesConsignesScreenProps {
  consignes: ConsigneLocale[];
  onRetour: () => void;
  onMarquerExecutee: (instructionId: string) => void;
  syncEnCours: boolean;
  /**
   * Navigation vers le détail d'un colis (M-03).
   * Optionnel : si absent, le bouton "Voir le colis" n'est pas affiché.
   * US-037 delta Sprint 5 — navigation M-07 → M-03.
   */
  onVoirColis?: (colisId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUT_LABELS: Record<string, { label: string; couleur: string }> = {
  ENVOYEE:         { label: 'Nouvelle',        couleur: Colors.avertissement },
  PRISE_EN_COMPTE: { label: 'Prise en compte', couleur: Colors.info },
  EXECUTEE:        { label: 'Exécutée',         couleur: Colors.succes },
};

const TYPE_LABELS: Record<string, string> = {
  PRIORISER:        'Prioriser',
  MODIFIER_CRENEAU: 'Modifier créneau',
  ANNULER:          'Annuler',
  MESSAGE_LIBRE:    'Message',
};

/** Statuts pour lesquels le bouton "Marquer exécutée" est affiché */
const STATUTS_EXECUTABLES = new Set(['ENVOYEE']);

function formatHorodatage(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ─── Composant LigneConsigne ─────────────────────────────────────────────────

interface LigneConsigneProps {
  consigne: ConsigneLocale;
  onMarquerExecutee: (instructionId: string) => void;
  syncEnCours: boolean;
  onVoirColis?: (colisId: string) => void;
}

function LigneConsigne({
  consigne,
  onMarquerExecutee,
  syncEnCours,
  onVoirColis,
}: LigneConsigneProps): React.JSX.Element {
  const statutInfo = STATUT_LABELS[consigne.statut] ?? {
    label: consigne.statut,
    couleur: Colors.texteTertiaire,
  };
  const typeLabel =
    TYPE_LABELS[consigne.typeInstruction] ?? consigne.typeInstruction;
  const peutEtreExecutee = STATUTS_EXECUTABLES.has(consigne.statut);

  return (
    <View
      testID={`consigne-${consigne.instructionId}`}
      style={[styles.ligne, !consigne.lue && styles.ligneNonLue]}
    >
      {/* En-tête : type + badge statut */}
      <View style={styles.ligneEntete}>
        <Text style={styles.ligneType}>{typeLabel}</Text>
        <View
          testID={`badge-statut-${consigne.instructionId}`}
          style={[
            styles.badgeStatut,
            { backgroundColor: `${statutInfo.couleur}20` },
          ]}
        >
          <Text
            style={[styles.badgeStatutTexte, { color: statutInfo.couleur }]}
          >
            {statutInfo.label}
          </Text>
        </View>
      </View>

      {/* Colis concerné */}
      {consigne.colisId ? (
        <Text
          testID={`colis-concerne-${consigne.instructionId}`}
          style={styles.ligneColis}
        >
          Colis #{consigne.colisId}
        </Text>
      ) : null}

      {/* Créneau cible si applicable */}
      {consigne.creneauCible ? (
        <Text style={styles.ligneCreneau}>
          Créneau : {consigne.creneauCible}
        </Text>
      ) : null}

      {/* Horodatage */}
      <Text style={styles.ligneHorodatage}>
        Reçue à {formatHorodatage(consigne.horodatage)}
      </Text>

      {/* Boutons d'action : ligne horizontale si les deux sont présents */}
      <View style={styles.boutonsBas}>
        {/* Bouton "Marquer exécutée" — uniquement pour les consignes exécutables */}
        {peutEtreExecutee && (
          <TouchableOpacity
            testID={`btn-executer-${consigne.instructionId}`}
            style={[styles.boutonExecuter, syncEnCours && styles.boutonDesactive]}
            onPress={() => onMarquerExecutee(consigne.instructionId)}
            disabled={syncEnCours}
            accessibilityRole="button"
            accessibilityLabel="Marquer l'instruction comme exécutée"
            accessibilityState={{ disabled: syncEnCours }}
          >
            <Text style={styles.boutonExecuterTexte}>
              {syncEnCours ? 'Synchronisation…' : 'Marquer exécutée'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Bouton "Voir le colis" — navigation M-07 → M-03 (US-037 delta Sprint 5) */}
        {onVoirColis && consigne.colisId ? (
          <TouchableOpacity
            testID={`btn-voir-colis-${consigne.instructionId}`}
            style={styles.boutonVoirColis}
            onPress={() => onVoirColis(consigne.colisId)}
            accessibilityRole="button"
            accessibilityLabel="Voir le détail du colis concerné"
          >
            <Text style={styles.boutonVoirColisTexte}>Voir le colis</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function MesConsignesScreen({
  consignes,
  onRetour,
  onMarquerExecutee,
  syncEnCours,
  onVoirColis,
}: MesConsignesScreenProps): React.JSX.Element {
  return (
    <View style={styles.container} testID="mes-consignes-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          testID="btn-retour-consignes"
          onPress={onRetour}
          style={styles.boutonRetour}
          accessibilityRole="button"
          accessibilityLabel="Retour à la liste des colis"
        >
          <Text style={styles.boutonRetourTexte}>{'< Retour'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitre}>Mes consignes</Text>
      </View>

      {/* Sous-titre */}
      <View style={styles.sousTitreContainer}>
        <Text testID="sous-titre-consignes" style={styles.sousTitre}>
          Instructions reçues aujourd'hui ({consignes.length})
        </Text>
      </View>

      {/* Liste des consignes ou état vide */}
      {consignes.length === 0 ? (
        <View style={styles.vide} testID="consignes-vide">
          <Text style={styles.videTexte}>
            Aucune consigne reçue pour l'instant.
          </Text>
          <Text style={styles.videTexteSecondaire}>
            Les instructions de votre superviseur apparaîtront ici.
          </Text>
        </View>
      ) : (
        <FlatList
          data={consignes}
          keyExtractor={(item) => item.instructionId}
          renderItem={({ item }) => (
            <LigneConsigne
              consigne={item}
              onMarquerExecutee={onMarquerExecutee}
              syncEnCours={syncEnCours}
              onVoirColis={onVoirColis}
            />
          )}
          contentContainerStyle={styles.liste}
          testID="liste-consignes"
        />
      )}
    </View>
  );
}

export default MesConsignesScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.fondNeutre,
  },
  header: {
    height: 64,
    backgroundColor: Colors.primaire,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  boutonRetour: {
    minHeight: 48,
    justifyContent: 'center',
    paddingRight: 8,
  },
  boutonRetourTexte: {
    color: Colors.texteInverse,
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitre: {
    color: Colors.texteInverse,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  sousTitreContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bordureNeutre,
    backgroundColor: Colors.surfacePrimary,
  },
  sousTitre: {
    fontSize: 13,
    color: Colors.texteSecondaire,
    fontWeight: '500',
  },
  liste: {
    padding: 12,
  },
  ligne: {
    backgroundColor: Colors.surfacePrimary,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaire,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  ligneNonLue: {
    borderLeftColor: Colors.avertissement,
    backgroundColor: Colors.avertissementLeger,
  },
  ligneEntete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ligneType: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textePrimaire,
  },
  badgeStatut: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeStatutTexte: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  ligneColis: {
    fontSize: 13,
    color: Colors.texteSecondaire,
    marginBottom: 2,
  },
  ligneCreneau: {
    fontSize: 13,
    color: Colors.texteSecondaire,
    marginBottom: 2,
  },
  ligneHorodatage: {
    fontSize: 12,
    color: Colors.texteTertiaire,
    marginTop: 4,
    marginBottom: 8,
  },
  boutonExecuter: {
    backgroundColor: Colors.primaire,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  boutonsBas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  boutonDesactive: {
    backgroundColor: Colors.texteTertiaire,
    opacity: 0.6,
  },
  boutonExecuterTexte: {
    color: Colors.texteInverse,
    fontSize: 13,
    fontWeight: '700',
  },
  boutonVoirColis: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.primaire,
    backgroundColor: Colors.surfacePrimary,
  },
  boutonVoirColisTexte: {
    color: Colors.primaire,
    fontSize: 13,
    fontWeight: '700',
  },
  vide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  videTexte: {
    fontSize: 16,
    color: Colors.texteSecondaire,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  videTexteSecondaire: {
    fontSize: 14,
    color: Colors.texteTertiaire,
    textAlign: 'center',
  },
});
