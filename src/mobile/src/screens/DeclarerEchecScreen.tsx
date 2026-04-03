import React, { useState } from 'react';
import {
  ActivityIndicator,
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

/**
 * Ecran M-05 — Déclaration d'un échec de livraison (US-005)
 *
 * Affiche :
 * - Header avec retour et identifiant du colis
 * - Rappel du contexte (destinataire)
 * - Liste de motifs normalisés (boutons radio — un seul choix obligatoire)
 * - Liste de dispositions (boutons radio — un seul choix obligatoire)
 * - Champ note optionnelle (250 caractères max)
 * - Bouton "ENREGISTRER L'ECHEC" — désactivé tant que le motif n'est pas sélectionné
 *
 * Invariants US-005 :
 * - Le motif est obligatoire (bouton désactivé sinon).
 * - La disposition est obligatoire (bouton désactivé sinon).
 * - Note libre max 250 caractères.
 * - Un colis déjà en ECHEC : message "Échec déjà déclaré" (Scénario 5).
 *
 * Domain Events déclenchés (via POST backend) :
 *   EchecLivraisonDeclare, MotifEnregistre, DispositionEnregistree, IncidentDeclare
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

// ─── Constante toast (injectable pour les tests) ─────────────────────────────

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
  // L4 — Toast de confirmation après enregistrement réussi
  const [toastVisible, setToastVisible] = useState(false);

  // Le bouton est actif uniquement si motif ET disposition sont sélectionnés (Scénario 2)
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
      // L4 — Afficher le toast puis rediriger
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

      {/* Header — L7 : couleur #C62828 (ratio 5.9:1 blanc/rouge, WCAG AA conforme) */}
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
        {/* Rappel du contexte */}
        <View style={styles.contexte} testID="contexte-colis">
          <Text style={styles.contexteTitre}>
            Colis{' '}
            <Text testID="contexte-colis-id" style={styles.contexteColisId}>
              #{colisId}
            </Text>
            {' — '}{destinataireNom}
          </Text>
        </View>

        {/* Message d'erreur */}
        {erreur !== null && (
          <View style={styles.erreurContainer} testID="message-erreur">
            <Text style={styles.erreurTexte}>{erreur}</Text>
          </View>
        )}

        {/* Section motif de non-livraison */}
        <View style={styles.section} testID="section-motif">
          <Text style={styles.sectionTitre}>Motif de non-livraison</Text>
          {MOTIFS_ORDONNES.map((motif) => (
            <TouchableOpacity
              key={motif}
              testID={`motif-${motif}`}
              onPress={() => setMotifSelectionne(motif)}
              style={[
                styles.optionRow,
                motifSelectionne === motif && styles.optionRowSelectionne,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: motifSelectionne === motif }}
              accessibilityLabel={MOTIF_LABELS[motif]}
            >
              <View
                style={[
                  styles.radioCircle,
                  motifSelectionne === motif && styles.radioCircleSelectionne,
                ]}
              >
                {motifSelectionne === motif && <View style={styles.radioPastille} />}
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  motifSelectionne === motif && styles.optionLabelSelectionne,
                ]}
              >
                {MOTIF_LABELS[motif]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section disposition — L8 : texte d'aide si aucun motif sélectionné */}
        <View style={styles.section} testID="section-disposition">
          <Text style={styles.sectionTitre}>Que faire de ce colis ?</Text>
          {motifSelectionne === null && (
            <Text style={styles.aideDisposition} testID="aide-disposition">
              Choisissez d'abord un motif pour débloquer cette section
            </Text>
          )}
          {DISPOSITIONS_ORDONNEES.map((disposition) => (
            <TouchableOpacity
              key={disposition}
              testID={`disposition-${disposition}`}
              onPress={() => setDispositionSelectionnee(disposition)}
              style={[
                styles.optionRow,
                dispositionSelectionnee === disposition && styles.optionRowSelectionne,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: dispositionSelectionnee === disposition }}
              accessibilityLabel={DISPOSITION_LABELS[disposition]}
            >
              <View
                style={[
                  styles.radioCircle,
                  dispositionSelectionnee === disposition && styles.radioCircleSelectionne,
                ]}
              >
                {dispositionSelectionnee === disposition && (
                  <View style={styles.radioPastille} />
                )}
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  dispositionSelectionnee === disposition && styles.optionLabelSelectionne,
                ]}
              >
                {DISPOSITION_LABELS[disposition]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Champ note optionnel */}
        <View style={styles.section} testID="section-note">
          <Text style={styles.sectionTitre}>Note (optionnelle)</Text>
          <TextInput
            testID="champ-note"
            style={styles.champNote}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor="#9E9E9E"
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
            <ActivityIndicator color="#FFFFFF" />
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#C62828',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  boutonRetour: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  boutonRetourText: {
    color: '#FFCDD2',
    fontSize: 15,
  },
  headerTitre: {
    color: '#FFFFFF',
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
  contexte: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#C62828',
  },
  contexteTitre: {
    fontSize: 15,
    color: '#424242',
    fontWeight: '500',
  },
  contexteColisId: {
    color: '#C62828',
    fontWeight: '700',
  },
  erreurContainer: {
    backgroundColor: '#FFCDD2',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C62828',
  },
  erreurTexte: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitre: {
    fontSize: 13,
    fontWeight: '700',
    color: '#616161',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 6,
    gap: 12,
    marginBottom: 4,
  },
  optionRowSelectionne: {
    backgroundColor: '#FFEBEE',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9E9E9E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelectionne: {
    borderColor: '#C62828',
  },
  radioPastille: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C62828',
  },
  optionLabel: {
    fontSize: 15,
    color: '#424242',
    flex: 1,
  },
  optionLabelSelectionne: {
    color: '#C62828',
    fontWeight: '600',
  },
  champNote: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: '#212121',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  compteurNote: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'right',
    marginTop: 4,
  },
  boutonEnregistrer: {
    backgroundColor: '#C62828',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  boutonEnregistrerDesactive: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  boutonEnregistrerTexte: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  boutonEnregistrerTexteDesactive: {
    color: '#9E9E9E',
  },
  // L4 — Toast de confirmation
  toast: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: '#1B5E20',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  toastTexte: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // L8 — Texte d'aide disposition grisée
  aideDisposition: {
    color: '#9E9E9E',
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 8,
  },
});

export default DeclarerEchecScreen;
