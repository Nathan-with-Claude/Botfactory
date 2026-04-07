import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Disposition,
  DISPOSITION_LABELS,
  MotifNonLivraison,
  MOTIF_LABELS,
} from '../api/tourneeTypes';
import {
  declarerEchecLivraison,
  EchecDejaDeClareError,
} from '../api/tourneeApi';
import { Colors } from '../theme/colors';
import { Theme } from '../theme/theme';

/**
 * Ecran M-05 — Déclaration d'un échec de livraison (US-005)
 *
 * Design : Material Design 3 — palette designer
 * Header : fond error (#ba1a1a) — screen échec
 * Cards motifs : style radio avec sélection en primary (conforme M-05 designer)
 *
 * Source wireframe : M-05 — Déclaration d'un échec de livraison.
 */

// ─── Props ────────────────────────────────────────────────────────────────────

interface DeclarerEchecScreenProps {
  tourneeId: string;
  colisId: string;
  destinataireNom: string;
  onRetour: () => void;
  onEchecEnregistre: () => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const MOTIFS_ORDONNES: MotifNonLivraison[] = [
  'ABSENT',
  'ACCES_IMPOSSIBLE',
  'REFUS_CLIENT',
  'HORAIRE_DEPASSE',
];

const DISPOSITIONS_ORDONNEES: Disposition[] = [
  'A_REPRESENTER',
  'DEPOT_CHEZ_TIERS',
  'RETOUR_DEPOT',
];

const NOTE_MAX_LONGUEUR = 250;
const TOAST_DUREE_MS = 2500;

// ─── Composant principal ──────────────────────────────────────────────────────

export const DeclarerEchecScreen: React.FC<DeclarerEchecScreenProps & { toastDureeMs?: number }> = ({
  tourneeId,
  colisId,
  destinataireNom,
  onRetour,
  onEchecEnregistre,
  toastDureeMs = TOAST_DUREE_MS,
}) => {
  const [motifSelectionne, setMotifSelectionne] = useState<MotifNonLivraison | null>(null);
  const [dispositionSelectionnee, setDispositionSelectionnee] = useState<Disposition | null>(null);
  const [note, setNote] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  // US-055 R2 — Bouton retour Android natif : intercepté pour appeler onRetour()
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      onRetour();
      return true;
    });
    return () => handler.remove();
  }, [onRetour]);

  const boutonActif = motifSelectionne !== null && dispositionSelectionnee !== null && !enCours && !toastVisible;

  const handleEnregistrer = async () => {
    if (!motifSelectionne || !dispositionSelectionnee) return;

    setEnCours(true);
    setErreur(null);

    try {
      await declarerEchecLivraison(tourneeId, colisId, {
        motif: motifSelectionne,
        disposition: dispositionSelectionnee,
        noteLibre: note.trim() || undefined,
      });
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        onEchecEnregistre();
      }, toastDureeMs);
    } catch (err) {
      if (err instanceof EchecDejaDeClareError) {
        setErreur('Échec déjà déclaré pour ce colis.');
      } else {
        setErreur('Impossible d\'enregistrer l\'échec. Vérifiez votre connexion.');
      }
    } finally {
      setEnCours(false);
    }
  };

  return (
    <View style={styles.fullScreen} testID="declarer-echec-screen">
      {/* L4 — Toast de confirmation */}
      {toastVisible && (
        <View style={styles.toast} testID="toast-echec-enregistre">
          <Text style={styles.toastTexte}>
            Echec enregistre — Votre superviseur a ete notifie
          </Text>
        </View>
      )}

      {/* Header — fond error (#ba1a1a) */}
      <View style={styles.header}>
        <TouchableOpacity
          testID="bouton-retour"
          onPress={onRetour}
          style={styles.boutonRetour}
          accessibilityRole="button"
          accessibilityLabel="Retour au détail du colis"
        >
          <Text style={styles.boutonRetourText}>{'< Retour'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitre}>Échec de livraison</Text>
      </View>

      <ScrollView style={styles.contenu} contentContainerStyle={styles.contenuInner}>
        {/* Context banner : fond errorContainer, border-left error */}
        <View style={styles.contexte} testID="contexte-colis">
          <Text style={styles.contexteIcone}>📦</Text>
          <View style={styles.contexteTexteBox}>
            <Text style={styles.contexteTitreSup}>Identité Colis</Text>
            <Text style={styles.contexteTitre}>
              Colis{' '}
              <Text testID="contexte-colis-id" style={styles.contexteColisId}>
                #{colisId}
              </Text>
              {' — '}{destinataireNom}
            </Text>
          </View>
        </View>

        {/* Message d'erreur */}
        {erreur !== null && (
          <View style={styles.erreurContainer} testID="message-erreur">
            <Text style={styles.erreurTexte}>{erreur}</Text>
          </View>
        )}

        {/* Section motif de non-livraison */}
        <View style={styles.section} testID="section-motif">
          <Text style={styles.sectionTitre}>Motif de l'échec</Text>
          {MOTIFS_ORDONNES.map((motif) => {
            const estSelectionne = motifSelectionne === motif;
            return (
              <TouchableOpacity
                key={motif}
                testID={`motif-${motif}`}
                onPress={() => setMotifSelectionne(motif)}
                style={[
                  styles.optionRow,
                  estSelectionne && styles.optionRowSelectionne,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: estSelectionne }}
                accessibilityLabel={MOTIF_LABELS[motif]}
              >
                <View style={styles.optionGauche}>
                  <View
                    style={[
                      styles.radioCircle,
                      estSelectionne && styles.radioCircleSelectionne,
                    ]}
                  >
                    {estSelectionne && <View style={styles.radioPastille} />}
                  </View>
                  <Text
                    style={[
                      styles.optionLabel,
                      estSelectionne && styles.optionLabelSelectionne,
                    ]}
                  >
                    {MOTIF_LABELS[motif]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section disposition */}
        <View style={styles.section} testID="section-disposition">
          <Text style={styles.sectionTitre}>Que faire de ce colis ?</Text>
          {motifSelectionne === null && (
            <Text style={styles.aideDisposition} testID="aide-disposition">
              Choisissez d'abord un motif pour débloquer cette section
            </Text>
          )}
          {DISPOSITIONS_ORDONNEES.map((disposition) => {
            const estSelectionne = dispositionSelectionnee === disposition;
            return (
              <TouchableOpacity
                key={disposition}
                testID={`disposition-${disposition}`}
                onPress={() => setDispositionSelectionnee(disposition)}
                style={[
                  styles.optionRow,
                  estSelectionne && styles.optionRowSelectionne,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: estSelectionne }}
                accessibilityLabel={DISPOSITION_LABELS[disposition]}
              >
                <View style={styles.optionGauche}>
                  <View
                    style={[
                      styles.radioCircle,
                      estSelectionne && styles.radioCircleSelectionne,
                    ]}
                  >
                    {estSelectionne && <View style={styles.radioPastille} />}
                  </View>
                  <Text
                    style={[
                      styles.optionLabel,
                      estSelectionne && styles.optionLabelSelectionne,
                    ]}
                  >
                    {DISPOSITION_LABELS[disposition]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Champ note optionnel */}
        <View style={styles.section} testID="section-note">
          <Text style={styles.sectionTitre}>Note (optionnelle)</Text>
          <TextInput
            testID="champ-note"
            style={styles.champNote}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor={Colors.outline}
            multiline
            maxLength={NOTE_MAX_LONGUEUR}
            value={note}
            onChangeText={setNote}
            accessibilityLabel="Note optionnelle"
          />
          <Text style={styles.compteurNote} testID="compteur-note">
            {note.length}/{NOTE_MAX_LONGUEUR}
          </Text>
        </View>

        {/* Bouton principal */}
        <TouchableOpacity
          testID="bouton-enregistrer-echec"
          onPress={handleEnregistrer}
          disabled={!boutonActif}
          style={[
            styles.boutonEnregistrer,
            !boutonActif && styles.boutonEnregistrerDesactive,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Enregistrer l'échec de livraison"
          accessibilityState={{ disabled: !boutonActif }}
        >
          {enCours ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text
              style={[
                styles.boutonEnregistrerTexte,
                !boutonActif && styles.boutonEnregistrerTexteDesactive,
              ]}
            >
              ENREGISTRER L'ECHEC
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  // Header — fond error (rouge #ba1a1a) conforme M-05 designer
  header: {
    backgroundColor: Colors.error,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
  },
  boutonRetour: {
    paddingVertical: 4,
    paddingRight: 8,
    minHeight: Theme.touchTarget.minHeight,
    justifyContent: 'center',
  },
  boutonRetourText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
  },
  headerTitre: {
    color: Colors.onPrimary,
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  contenu: {
    flex: 1,
  },
  contenuInner: {
    padding: 16,
    gap: 12,
  },
  // Context banner : fond errorContainer, border-left error
  contexte: {
    backgroundColor: Colors.errorContainer,
    borderRadius: Theme.borderRadius.lg,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  contexteIcone: {
    fontSize: 28,
  },
  contexteTexteBox: {
    flex: 1,
  },
  contexteTitreSup: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onErrorContainer,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
    marginBottom: 4,
  },
  contexteTitre: {
    fontSize: 16,
    color: Colors.onErrorContainer,
    fontWeight: '700',
  },
  contexteColisId: {
    fontWeight: '800',
  },
  erreurContainer: {
    backgroundColor: Colors.errorContainer,
    borderRadius: Theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  erreurTexte: {
    color: Colors.onErrorContainer,
    fontSize: 14,
    fontWeight: '500',
  },
  // Section cadre blanc
  section: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    ...Theme.shadow.sm,
  },
  sectionTitre: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Colors.surfaceContainerLow,
    marginBottom: 8,
    minHeight: Theme.touchTarget.minHeight,
  },
  optionRowSelectionne: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  optionGauche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelectionne: {
    borderColor: Colors.primary,
  },
  radioPastille: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  optionLabel: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
    flex: 1,
  },
  optionLabelSelectionne: {
    color: Colors.onSurface,
    fontWeight: '700',
  },
  champNote: {
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    fontSize: 14,
    color: Colors.onSurface,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: Colors.surfaceContainerLowest,
  },
  compteurNote: {
    fontSize: 12,
    color: Colors.outline,
    textAlign: 'right',
    marginTop: 4,
  },
  // Bouton enregistrer — fond error pour action destructive
  boutonEnregistrer: {
    backgroundColor: Colors.error,
    borderRadius: Theme.borderRadius.lg,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Theme.shadow.md,
  },
  boutonEnregistrerDesactive: {
    backgroundColor: Colors.surfaceContainerHigh,
    elevation: 0,
    shadowOpacity: 0,
  },
  boutonEnregistrerTexte: {
    color: Colors.onPrimary,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  boutonEnregistrerTexteDesactive: {
    color: Colors.onSurfaceVariant,
  },
  // L4 — Toast de confirmation
  toast: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: Colors.tertiaryContainer,
    borderRadius: Theme.borderRadius.lg,
    padding: 14,
    alignItems: 'center',
    zIndex: 100,
    ...Theme.shadow.lg,
  },
  toastTexte: {
    color: Colors.onTertiary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // L8 — Texte d'aide disposition grisée
  aideDisposition: {
    color: Colors.outline,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 8,
  },
});

export default DeclarerEchecScreen;
