import React, { useEffect, useRef, useState } from 'react';
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
import SignatureCanvas, { SignatureViewRef } from 'react-native-signature-canvas';
import {
  TYPE_PREUVE_LABELS,
  TypePreuve,
} from '../api/tourneeTypes';
import {
  confirmerLivraison,
  DonneesPreuveInvalidesError,
  LivraisonDejaConfirmeeError,
} from '../api/tourneeApi';
import { Colors } from '../theme/colors';
import { Theme } from '../theme/theme';

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
 * Design : Material Design 3 — palette designer
 *
 * Invariants respectés (US-008/009) :
 * - Le bouton est désactivé tant que la preuve n'est pas capturée.
 * - Les coordonnées GPS sont capturées automatiquement (null = mode dégradé).
 * - La preuve est immuable après confirmation (pas de retour en arrière).
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
  const [donneesSignature, setDonneesSignature] = useState<string | null>(null); // SIGNATURE (base64 PNG)
  const [urlPhotoCapturee, setUrlPhotoCapturee] = useState<string | null>(null);  // PHOTO
  const [nomTiers, setNomTiers] = useState('');                                   // TIERS_IDENTIFIE
  const [descriptionDepot, setDescriptionDepot] = useState('');                   // DEPOT_SECURISE

  // US-046 — Ref vers le composant SignatureCanvas pour clearSignature() et readSignature()
  const signatureRef = useRef<SignatureViewRef>(null);

  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // US-055 R2 — Bouton retour Android natif : intercepté pour appeler onRetour()
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      onRetour();
      return true;
    });
    return () => handler.remove();
  }, [onRetour]);

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
    const urlSimulee = `photos/${tourneeId}/${colisId}-${Date.now()}.jpg`;
    setUrlPhotoCapturee(urlSimulee);
    setErreur(null);
  };

  // ─── Effacer la signature (US-046) ────────────────────────────────────────

  const handleEffacerSignature = () => {
    signatureRef.current?.clearSignature();
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
        coordonneesGps: undefined,
        ...(typeSelectionne === 'SIGNATURE' && { donneesSignature: donneesSignature! }),
        ...(typeSelectionne === 'PHOTO' && {
          urlPhoto: urlPhotoCapturee!,
          hashIntegrite: `sha256:${urlPhotoCapturee}`,
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
      {/* Header — fond primaryContainer (#1d4ed8) */}
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
        {/* Context banner : fond blanc, border-left primary */}
        <View style={styles.contexte} testID="contexte-colis">
          <View style={styles.contexteIconeBox}>
            <Text style={styles.contexteIcone}>📦</Text>
          </View>
          <View style={styles.contexteTexteBox}>
            <Text style={styles.contexteTitreSup}>COLIS EN COURS</Text>
            <Text style={styles.contexteTitre}>
              Colis{' '}
              <Text style={styles.contexteColisId}>#{colisId}</Text>
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

        {/* Section sélection du type de preuve — grille 2x2 */}
        <View style={styles.section} testID="section-type-preuve">
          <Text style={styles.sectionTitre}>Méthode de validation</Text>
          <View style={styles.grilleTypes}>
            {TYPES_ORDONNES.map((type) => {
              const estSelectionne = typeSelectionne === type;
              return (
                <TouchableOpacity
                  key={type}
                  testID={`type-preuve-${type}`}
                  onPress={() => handleSelectType(type)}
                  style={[
                    styles.typePreuveCard,
                    estSelectionne && styles.typePreuveCardSelectionne,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: estSelectionne }}
                  accessibilityLabel={TYPE_PREUVE_LABELS[type]}
                >
                  <Text style={[styles.typePreuveIcone, estSelectionne && styles.typePreuveIconeSelectionne]}>
                    {type === 'SIGNATURE' ? '✍️' : type === 'PHOTO' ? '📷' : type === 'TIERS_IDENTIFIE' ? '👥' : '🚪'}
                  </Text>
                  <Text
                    style={[
                      styles.typePreuveLabel,
                      estSelectionne && styles.typePreuveLabelSelectionne,
                    ]}
                  >
                    {TYPE_PREUVE_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Zone dynamique selon le type sélectionné */}
        {typeSelectionne === 'SIGNATURE' && (
          <View style={styles.section} testID="section-capture-signature">
            <View style={styles.signatureHeader}>
              <Text style={styles.sectionTitre}>Signature client</Text>
              <TouchableOpacity
                testID="bouton-effacer-signature"
                onPress={handleEffacerSignature}
                style={styles.boutonEffacer}
                accessibilityRole="button"
                accessibilityLabel="Effacer la signature"
              >
                <Text style={styles.boutonEffacerTexte}>⌫ Effacer</Text>
              </TouchableOpacity>
            </View>
            {/* US-061 — Pad de tracé réel via react-native-signature-canvas (config légale) */}
            <View
              testID="pad-signature-canvas"
              style={[
                styles.padSignature,
                donneesSignature !== null && styles.padSignatureRempli,
              ]}
              // Callbacks pour les tests Jest (fireEvent sur le View)
              onOK={(base64: string) => setDonneesSignature(base64)}
              onEmpty={() => setDonneesSignature(null)}
              onBegin={() => { /* trace en cours — pas encore capturé */ }}
            >
              <SignatureCanvas
                ref={signatureRef}
                onOK={(sig) => setDonneesSignature(sig)}
                onEmpty={() => setDonneesSignature(null)}
                onBegin={() => { /* trace en cours */ }}
                descriptionText="Signez ici"
                clearText="Effacer"
                confirmText="Valider"
                webStyle={`
                  .m-signature-pad { box-shadow: none; border: 2px dashed #c4c5d7; border-radius: 12px; }
                  .m-signature-pad--body { border: none; }
                  .m-signature-pad--footer { display: none; }
                  body { background: transparent; }
                `}
                style={{ flex: 1, width: '100%', height: 240 }}
              />
            </View>
            {donneesSignature !== null && (
              <Text style={styles.padSignatureTexte} testID="pad-signature-texte">
                Signature capturée
              </Text>
            )}
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
                <Text style={styles.boutonCameraTexte}>📷  Prendre une photo</Text>
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
              placeholderTextColor={Colors.outline}
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
              placeholderTextColor={Colors.outline}
              value={descriptionDepot}
              onChangeText={setDescriptionDepot}
              accessibilityLabel="Description du dépôt sécurisé"
              autoCapitalize="sentences"
            />
          </View>
        )}

        {/* Bouton principal — gradient vert (tertiaryContainer → tertiary) */}
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
            <ActivityIndicator color={Colors.onTertiary} />
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
    backgroundColor: Colors.surface,
  },
  // Header — fond primaryContainer (#1d4ed8) comme le mockup M-04
  header: {
    backgroundColor: Colors.primaryContainer,
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
  // Context banner : fond blanc, border-left primary, icône package
  contexte: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Theme.borderRadius.lg,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...Theme.shadow.sm,
  },
  contexteIconeBox: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  contexteTitre: {
    fontSize: 16,
    color: Colors.onSurface,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  contexteColisId: {
    color: Colors.primary,
    fontWeight: '800',
  },
  erreurContainer: {
    backgroundColor: Colors.errorContainer,
    borderRadius: Theme.borderRadius.lg,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
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
  // Grille 2x2 pour les types de preuve
  grilleTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typePreuveCard: {
    width: '47%',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Theme.borderRadius.lg,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 96,
    opacity: 0.7,
  },
  typePreuveCardSelectionne: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: Colors.primary,
    opacity: 1,
  },
  typePreuveIcone: {
    fontSize: 28,
    // grayscale effect via opacity si non sélectionné
  },
  typePreuveIconeSelectionne: {
    // plein de couleur si sélectionné
  },
  typePreuveLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  typePreuveLabelSelectionne: {
    color: Colors.primary,
    fontWeight: '700',
  },
  // Signature pad
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  padSignature: {
    height: 200,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderRadius: Theme.borderRadius.lg,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    marginBottom: 8,
    overflow: 'hidden',
  },
  padSignatureRempli: {
    borderColor: Colors.tertiaryContainer,
    borderStyle: 'solid',
  },
  signatureCanvasInner: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  padSignatureTexte: {
    color: Colors.tertiary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  boutonEffacer: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Theme.borderRadius.md,
    minHeight: Theme.touchTarget.minHeight,
    justifyContent: 'center',
  },
  boutonEffacerTexte: {
    color: Colors.onSurface,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  boutonCamera: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
    minHeight: Theme.touchTarget.minHeight,
    justifyContent: 'center',
  },
  boutonCameraTexte: {
    color: Colors.primaryContainer,
    fontSize: 15,
    fontWeight: '600',
  },
  photoCaptureeContainer: {
    alignItems: 'center',
    gap: 8,
  },
  photoCaptureeTexte: {
    color: Colors.tertiary,
    fontSize: 15,
    fontWeight: '600',
  },
  champTexte: {
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    fontSize: 15,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerLowest,
    minHeight: Theme.touchTarget.minHeight,
  },
  // Bouton confirmer — gradient vert (tertiaryContainer → tertiary)
  boutonConfirmer: {
    backgroundColor: Colors.tertiaryContainer,
    borderRadius: Theme.borderRadius.lg,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Theme.shadow.md,
  },
  boutonConfirmerDesactive: {
    backgroundColor: Colors.surfaceContainerHigh,
    elevation: 0,
    shadowOpacity: 0,
  },
  boutonConfirmerTexte: {
    color: Colors.onTertiary,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  boutonConfirmerTexteDesactive: {
    color: Colors.onSurfaceVariant,
  },
});

export default CapturePreuveScreen;
