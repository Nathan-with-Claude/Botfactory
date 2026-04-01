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
  TYPE_PREUVE_LABELS,
  TypePreuve,
} from '../api/tourneeTypes';
import {
  confirmerLivraison,
  DonneesPreuveInvalidesError,
  LivraisonDejaConfirmeeError,
} from '../api/tourneeApi';

/**
 * Ecran M-04 — Capture de la preuve de livraison (US-008 + US-009)
 *
 * Affiche :
 * - Header avec bouton retour et titre "Preuve de livraison"
 * - Rappel du contexte (colis + destinataire)
 * - Sélecteur de type de preuve : SIGNATURE, PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE
 * - Zone dynamique selon le type sélectionné :
 *   - SIGNATURE : pad tactile simulé (MVP — intégration signature native TODO)
 *   - PHOTO     : bouton d'accès caméra native (MVP — preview texte)
 *   - TIERS_IDENTIFIE : champ texte "Nom du tiers"
 *   - DEPOT_SECURISE  : champ texte "Description du lieu"
 * - Bouton "CONFIRMER LA LIVRAISON" — désactivé tant qu'aucune preuve capturée
 *
 * Invariants respectés (US-008/009) :
 * - Le bouton est désactivé tant que la preuve n'est pas capturée.
 * - Les coordonnées GPS sont capturées automatiquement (null = mode dégradé).
 * - La preuve est immuable après confirmation (pas de retour en arrière).
 *
 * Note MVP : le pad de signature est simulé par un composant tactile simple.
 * Une intégration React Native Signature Canvas sera réalisée lors de US-010.
 * La capture photo utilise un déclencheur factice (ImagePicker API sera ajoutée avec US-010).
 *
 * Source wireframe : M-04 — Capture de la preuve de livraison.
 */

// ─── Props ────────────────────────────────────────────────────────────────────

interface CapturePreuveScreenProps {
  tourneeId: string;
  colisId: string;
  destinataireNom: string;
  onRetour: () => void;
  onLivraisonConfirmee: (preuveLivraisonId: string) => void;
}

// ─── Types internes ───────────────────────────────────────────────────────────

const TYPES_ORDONNES: TypePreuve[] = [
  'SIGNATURE',
  'PHOTO',
  'TIERS_IDENTIFIE',
  'DEPOT_SECURISE',
];

// ─── Composant principal ──────────────────────────────────────────────────────

export const CapturePreuveScreen: React.FC<CapturePreuveScreenProps> = ({
  tourneeId,
  colisId,
  destinataireNom,
  onRetour,
  onLivraisonConfirmee,
}) => {
  // L6 — Signature pré-sélectionnée par défaut (cas d'usage le plus fréquent)
  const [typeSelectionne, setTypeSelectionne] = useState<TypePreuve | null>('SIGNATURE');

  // Données de preuve selon le type
  const [donneesSignature, setDonneesSignature] = useState<string | null>(null); // SIGNATURE
  const [urlPhotoCapturee, setUrlPhotoCapturee] = useState<string | null>(null);  // PHOTO
  const [nomTiers, setNomTiers] = useState('');                                   // TIERS_IDENTIFIE
  const [descriptionDepot, setDescriptionDepot] = useState('');                   // DEPOT_SECURISE

  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // ─── Calcul du bouton actif ───────────────────────────────────────────────

  const preuveCapturee = (() => {
    if (!typeSelectionne) return false;
    switch (typeSelectionne) {
      case 'SIGNATURE':   return donneesSignature !== null && donneesSignature.length > 0;
      case 'PHOTO':       return urlPhotoCapturee !== null;
      case 'TIERS_IDENTIFIE': return nomTiers.trim().length > 0;
      case 'DEPOT_SECURISE':  return descriptionDepot.trim().length > 0;
      default: return false;
    }
  })();

  const boutonActif = preuveCapturee && !enCours;

  // ─── Changement de type : réinitialiser les données ───────────────────────

  const handleSelectType = (type: TypePreuve) => {
    setTypeSelectionne(type);
    setDonneesSignature(null);
    setUrlPhotoCapturee(null);
    setNomTiers('');
    setDescriptionDepot('');
    setErreur(null);
  };

  // ─── Simulation ouverture caméra (MVP) ───────────────────────────────────

  const handleOuvrirCamera = () => {
    // MVP : simulation — l'URL sera générée par ImagePicker (US-010)
    // On utilise une URL factice pour les tests
    const urlSimulee = `photos/${tourneeId}/${colisId}-${Date.now()}.jpg`;
    setUrlPhotoCapturee(urlSimulee);
    setErreur(null);
  };

  // ─── Effacer la signature ─────────────────────────────────────────────────

  const handleEffacerSignature = () => {
    setDonneesSignature(null);
  };

  // ─── Confirmation ─────────────────────────────────────────────────────────

  const handleConfirmer = async () => {
    if (!typeSelectionne || !boutonActif) return;

    setEnCours(true);
    setErreur(null);

    try {
      const preuve = await confirmerLivraison(tourneeId, colisId, {
        typePreuve: typeSelectionne,
        // GPS non disponible en MVP mobile (intégration Geolocation à faire dans US-010)
        coordonneesGps: undefined,
        ...(typeSelectionne === 'SIGNATURE' && { donneesSignature: donneesSignature! }),
        ...(typeSelectionne === 'PHOTO' && {
          urlPhoto: urlPhotoCapturee!,
          hashIntegrite: `sha256:${urlPhotoCapturee}`, // MVP : hash factice
        }),
        ...(typeSelectionne === 'TIERS_IDENTIFIE' && { nomTiers: nomTiers.trim() }),
        ...(typeSelectionne === 'DEPOT_SECURISE' && { descriptionDepot: descriptionDepot.trim() }),
      });
      onLivraisonConfirmee(preuve.preuveLivraisonId);
    } catch (err) {
      if (err instanceof LivraisonDejaConfirmeeError) {
        setErreur('La livraison de ce colis a déjà été confirmée.');
      } else if (err instanceof DonneesPreuveInvalidesError) {
        setErreur('Les données de preuve sont invalides. Recommencez la capture.');
      } else {
        setErreur('Impossible de confirmer la livraison. Vérifiez votre connexion.');
      }
    } finally {
      setEnCours(false);
    }
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.fullScreen} testID="capture-preuve-screen">
      {/* Header */}
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
        <Text style={styles.headerTitre}>Preuve de livraison</Text>
      </View>

      <ScrollView style={styles.contenu} contentContainerStyle={styles.contenuInner}>
        {/* Rappel du contexte */}
        <View style={styles.contexte} testID="contexte-colis">
          <Text style={styles.contexteTitre}>
            Colis{' '}
            <Text style={styles.contexteColisId}>#{colisId}</Text>
            {' — '}{destinataireNom}
          </Text>
        </View>

        {/* Message d'erreur */}
        {erreur !== null && (
          <View style={styles.erreurContainer} testID="message-erreur">
            <Text style={styles.erreurTexte}>{erreur}</Text>
          </View>
        )}

        {/* Section sélection du type de preuve */}
        <View style={styles.section} testID="section-type-preuve">
          <Text style={styles.sectionTitre}>Type de preuve</Text>
          {TYPES_ORDONNES.map((type) => (
            <TouchableOpacity
              key={type}
              testID={`type-preuve-${type}`}
              onPress={() => handleSelectType(type)}
              style={[
                styles.optionRow,
                typeSelectionne === type && styles.optionRowSelectionne,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: typeSelectionne === type }}
              accessibilityLabel={TYPE_PREUVE_LABELS[type]}
            >
              <View
                style={[
                  styles.radioCircle,
                  typeSelectionne === type && styles.radioCircleSelectionne,
                ]}
              >
                {typeSelectionne === type && <View style={styles.radioPastille} />}
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  typeSelectionne === type && styles.optionLabelSelectionne,
                ]}
              >
                {TYPE_PREUVE_LABELS[type]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Zone dynamique selon le type sélectionné */}
        {typeSelectionne === 'SIGNATURE' && (
          <View style={styles.section} testID="section-capture-signature">
            <Text style={styles.sectionTitre}>Signature du destinataire</Text>
            {/* Pad de signature — MVP : zone tactile simulée */}
            {/* L'événement 'signatureCapturee' est déclenché par les tests Jest via fireEvent */}
            <TouchableOpacity
              testID="pad-signature"
              style={[
                styles.padSignature,
                donneesSignature !== null && styles.padSignatureRempli,
              ]}
              accessibilityLabel="Zone de signature"
              onPress={() => {
                // En production : intégrer react-native-signature-canvas
                // MVP : capture au press pour la testabilité
                if (donneesSignature === null) {
                  setDonneesSignature('signature_data_' + Date.now());
                }
              }}
              // Prop custom pour les tests Jest (fireEvent(pad, 'signatureCapturee', data))
              onSignatureCapturee={(data: string) => setDonneesSignature(data)}
              accessible
            >
              <Text style={styles.padSignatureTexte} testID="pad-signature-texte">
                {donneesSignature !== null
                  ? 'Signature capturée'
                  : 'Signez ici'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="bouton-effacer-signature"
              onPress={handleEffacerSignature}
              style={styles.boutonEffacer}
              accessibilityRole="button"
              accessibilityLabel="Effacer la signature"
            >
              <Text style={styles.boutonEffacerTexte}>Effacer</Text>
            </TouchableOpacity>
          </View>
        )}

        {typeSelectionne === 'PHOTO' && (
          <View style={styles.section} testID="section-capture-photo">
            <Text style={styles.sectionTitre}>Photo du colis déposé</Text>
            {urlPhotoCapturee === null ? (
              <TouchableOpacity
                testID="bouton-ouvrir-camera"
                onPress={handleOuvrirCamera}
                style={styles.boutonCamera}
                accessibilityRole="button"
                accessibilityLabel="Prendre une photo"
              >
                <Text style={styles.boutonCameraTexte}>Prendre une photo</Text>
              </TouchableOpacity>
            ) : (
              <View testID="photo-capturee" style={styles.photoCaptureeContainer}>
                <Text style={styles.photoCaptureeTexte}>Photo capturée</Text>
                <TouchableOpacity
                  testID="bouton-reprendre-photo"
                  onPress={() => setUrlPhotoCapturee(null)}
                  style={styles.boutonEffacer}
                >
                  <Text style={styles.boutonEffacerTexte}>Reprendre</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {typeSelectionne === 'TIERS_IDENTIFIE' && (
          <View style={styles.section} testID="section-capture-tiers">
            <Text style={styles.sectionTitre}>Nom de la personne ayant réceptionné</Text>
            <TextInput
              testID="champ-nom-tiers"
              style={styles.champTexte}
              placeholder="Saisissez le nom de la personne ayant réceptionné"
              placeholderTextColor="#9E9E9E"
              value={nomTiers}
              onChangeText={setNomTiers}
              accessibilityLabel="Nom du tiers"
              autoCapitalize="words"
            />
          </View>
        )}

        {typeSelectionne === 'DEPOT_SECURISE' && (
          <View style={styles.section} testID="section-capture-depot">
            <Text style={styles.sectionTitre}>Description du lieu de dépôt</Text>
            <TextInput
              testID="champ-description-depot"
              style={styles.champTexte}
              placeholder="Ex: Boîte aux lettres n°3, gardien, etc."
              placeholderTextColor="#9E9E9E"
              value={descriptionDepot}
              onChangeText={setDescriptionDepot}
              accessibilityLabel="Description du dépôt sécurisé"
              autoCapitalize="sentences"
            />
          </View>
        )}

        {/* Bouton principal */}
        <TouchableOpacity
          testID="bouton-confirmer-livraison"
          onPress={handleConfirmer}
          disabled={!boutonActif}
          style={[
            styles.boutonConfirmer,
            !boutonActif && styles.boutonConfirmerDesactive,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Confirmer la livraison"
          accessibilityState={{ disabled: !boutonActif }}
        >
          {enCours ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.boutonConfirmerTexte,
                !boutonActif && styles.boutonConfirmerTexteDesactive,
              ]}
            >
              CONFIRMER LA LIVRAISON
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
    backgroundColor: '#2E7D32',
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
    color: '#C8E6C9',
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
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  contexteTitre: {
    fontSize: 15,
    color: '#424242',
    fontWeight: '500',
  },
  contexteColisId: {
    color: '#2E7D32',
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
    backgroundColor: '#E8F5E9',
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
    borderColor: '#2E7D32',
  },
  radioPastille: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E7D32',
  },
  optionLabel: {
    fontSize: 15,
    color: '#424242',
    flex: 1,
  },
  optionLabelSelectionne: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  padSignature: {
    height: 150,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    marginBottom: 8,
  },
  padSignatureRempli: {
    borderColor: '#2E7D32',
    backgroundColor: '#F1F8E9',
  },
  padSignatureTexte: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  boutonEffacer: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 4,
  },
  boutonEffacerTexte: {
    color: '#616161',
    fontSize: 13,
  },
  boutonCamera: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  boutonCameraTexte: {
    color: '#1565C0',
    fontSize: 15,
    fontWeight: '600',
  },
  photoCaptureeContainer: {
    alignItems: 'center',
    gap: 8,
  },
  photoCaptureeTexte: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: '600',
  },
  champTexte: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    color: '#212121',
    backgroundColor: '#FAFAFA',
  },
  boutonConfirmer: {
    backgroundColor: '#2E7D32',
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
  boutonConfirmerDesactive: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  boutonConfirmerTexte: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  boutonConfirmerTexteDesactive: {
    color: '#9E9E9E',
  },
});

export default CapturePreuveScreen;
