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
 *          US-042 — Horodatage adaptatif (formaterHorodatage exportée, testID horodatage-{id})
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
  /**
   * Indique si le livreur est en mode hors connexion.
   * Si true : bandeau orange "Hors connexion" + message dédié affiché (US-037 v1.3).
   */
  estHorsConnexion?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUT_LABELS: Record<string, { label: string; couleur: string }> = {
  ENVOYEE:         { label: 'Nouvelle',        couleur: Colors.avertissement },
  PRISE_EN_COMPTE: { label: 'Prise en compte', couleur: Colors.info },
  EXECUTEE:        { label: 'Traitée',          couleur: Colors.succes },
};

const TYPE_LABELS: Record<string, string> = {
  PRIORISER:        'Prioriser',
  MODIFIER_CRENEAU: 'Modifier créneau',
  ANNULER:          'Annuler',
  MESSAGE_LIBRE:    'Message',
};

/** Statuts pour lesquels le bouton "Marquer exécutée" est affiché */
const STATUTS_EXECUTABLES = new Set(['ENVOYEE']);

/**
 * Formate un horodatage ISO pour l'affichage dans M-07 (US-042).
 *
 * - Si la consigne est du jour courant (même date locale) : "HH:mm"
 * - Si la consigne date d'un autre jour : "JJ/MM HH:mm"
 *
 * @param iso - Horodatage ISO 8601 de réception de la consigne
 * @param maintenant - Date de référence "maintenant" (injectable pour les tests)
 * @returns Chaîne formatée
 */
export function formaterHorodatage(iso: string, maintenant: Date = new Date()): string {
  try {
    const date = new Date(iso);
    const estDuJour =
      date.getFullYear() === maintenant.getFullYear() &&
      date.getMonth() === maintenant.getMonth() &&
      date.getDate() === maintenant.getDate();

    const heure = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (estDuJour) {
      return heure;
    }

    const jour = String(date.getDate()).padStart(2, '0');
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    return `${jour}/${mois} ${heure}`;
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

      {/* Texte libre de la consigne (US-037 v1.3) */}
      {consigne.texteConsigne ? (
        <Text
          testID={`texte-consigne-${consigne.instructionId}`}
          style={styles.ligneTexteConsigne}
        >
          {consigne.texteConsigne}
        </Text>
      ) : null}

      {/* Colis concerné — ou mention "Non associé à un colis" (US-037 v1.3) */}
      {consigne.colisId ? (
        <Text
          testID={`colis-concerne-${consigne.instructionId}`}
          style={styles.ligneColis}
        >
          Colis #{consigne.colisId}
        </Text>
      ) : (
        <Text
          testID={`non-associe-colis-${consigne.instructionId}`}
          style={styles.ligneColisAbsent}
        >
          Non associé à un colis
        </Text>
      )}

      {/* Créneau cible si applicable */}
      {consigne.creneauCible ? (
        <Text style={styles.ligneCreneau}>
          Créneau : {consigne.creneauCible}
        </Text>
      ) : null}

      {/* Horodatage (US-042) — format "HH:mm" si du jour, "JJ/MM HH:mm" sinon */}
      <Text
        testID={`horodatage-${consigne.instructionId}`}
        style={styles.ligneHorodatage}
      >
        Reçue à {formaterHorodatage(consigne.horodatage)}
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
            accessibilityLabel="Marquer l'instruction comme traitée"
            accessibilityState={{ disabled: syncEnCours }}
          >
            <Text style={styles.boutonExecuterTexte}>
              {syncEnCours ? 'Synchronisation…' : 'Traitée'}
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
  estHorsConnexion = false,
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

      {/* Bandeau mode offline (US-037 v1.3 — wireframe M-07 états spéciaux) */}
      {estHorsConnexion && (
        <View style={styles.bandeauOffline} testID="bandeau-offline-consignes">
          <Text style={styles.bandeauOfflineTexte}>Hors connexion</Text>
        </View>
      )}
      {estHorsConnexion && (
        <Text
          testID="message-offline-consignes"
          style={styles.messageOffline}
        >
          Les nouvelles consignes ne peuvent pas arriver en mode hors connexion.
        </Text>
      )}

      {/* Sous-titre */}
      <View style={styles.sousTitreContainer}>
        <Text testID="sous-titre-consignes" style={styles.sousTitre}>
          Instructions reçues aujourd'hui ({consignes.length})
        </Text>
      </View>

      {/* Liste des consignes ou état vide */}
      {consignes.length === 0 ? (
        <View style={styles.vide} testID="consignes-vide">
          <Text
            testID="consignes-vide-texte-principal"
            style={styles.videTexte}
          >
            Aucune consigne reçue aujourd'hui.
          </Text>
          <Text style={styles.videTexteSecondaire}>
            Votre superviseur n'a pas envoyé d'instruction.
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
  ligneTexteConsigne: {
    fontSize: 14,
    color: Colors.textePrimaire,
    marginBottom: 4,
    lineHeight: 20,
  },
  ligneColis: {
    fontSize: 13,
    color: Colors.texteSecondaire,
    marginBottom: 2,
  },
  ligneColisAbsent: {
    fontSize: 13,
    color: Colors.texteTertiaire,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  bandeauOffline: {
    backgroundColor: '#b45309',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bandeauOfflineTexte: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  messageOffline: {
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
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
