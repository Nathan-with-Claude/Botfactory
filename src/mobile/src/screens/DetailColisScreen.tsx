import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ColisDTO, StatutColis } from '../api/tourneeTypes';
import { ColisNonTrouveError, getDetailColis } from '../api/tourneeApi';
import { getInstructionsEnAttente, marquerInstructionExecutee } from '../api/supervisionApi';

/**
 * Ecran M-03 — Detail d'un colis (US-004)
 *
 * Affiche :
 * - Header avec bouton retour et identifiant du colis
 * - Section destinataire : nom, adresse complete (rue + complement), bouton d'appel (numero masque RGPD)
 * - Section contraintes : liste des contraintes actives (horaire, fragile, document sensible)
 * - Lien "Voir sur la carte" : ouvre Google Maps avec l'adresse pre-remplie
 * - Boutons d'action : "LIVRER CE COLIS" et "DECLARER UN ECHEC" (US-005 / US-008)
 *   - Absents si le colis est dans un statut terminal (livre, echec, a representer)
 *   - Remplaces par un message de statut si terminal
 *
 * Invariants respectes (US-004) :
 * - Un colis au statut terminal ne propose aucun bouton d'action.
 * - Le numero de telephone du destinataire n'est jamais affiche en clair (RGPD).
 *
 * Domain Events declenches : aucun (lecture seule).
 * Les events LivraisonConfirmee / EchecLivraisonDeclare seront emis par US-005 et US-008.
 *
 * Source wireframe : M-03 — Detail d'un colis.
 */

// ─── Props ────────────────────────────────────────────────────────────────────

interface DetailColisScreenProps {
  tourneeId: string;
  colisId: string;
  onRetour: () => void;
  onLivrer?: (colisId: string) => void;   // TODO US-008 : navigation vers M-04
  onEchec?: (colisId: string) => void;    // TODO US-005 : navigation vers M-05
  /** Override pour les tests — permet de mocker l'appel supervision */
  marquerExecuteeFn?: (instructionId: string) => Promise<void>;
  /** Override pour les tests — permet de mocker la récupération des instructions */
  getInstructionsFn?: (tourneeId: string) => Promise<import('../api/supervisionApi').InstructionMobileDTO[]>;
}

// ─── Types internes ───────────────────────────────────────────────────────────

type EtatEcran =
  | { type: 'chargement' }
  | { type: 'succes'; colis: ColisDTO }
  | { type: 'erreur'; message: string };

// ─── Constantes de statut ─────────────────────────────────────────────────────

const MESSAGES_STATUT_TERMINAL: Partial<Record<StatutColis, string>> = {
  LIVRE: 'Ce colis a ete livre',
  ECHEC: 'Echec de livraison declare',
  A_REPRESENTER: 'Ce colis est a representer lors d une prochaine tournee',
};

// ─── Composant principal ──────────────────────────────────────────────────────

export const DetailColisScreen: React.FC<DetailColisScreenProps> = ({
  tourneeId,
  colisId,
  onRetour,
  onLivrer,
  onEchec,
  marquerExecuteeFn = marquerInstructionExecutee,
  getInstructionsFn = getInstructionsEnAttente,
}) => {
  const [etat, setEtat] = useState<EtatEcran>({ type: 'chargement' });

  const chargerDetailColis = useCallback(async () => {
    setEtat({ type: 'chargement' });
    try {
      const colis = await getDetailColis(tourneeId, colisId);
      setEtat({ type: 'succes', colis });

      // US-015 : marquer automatiquement l'instruction ENVOYEE comme exécutée
      // dès que Pierre consulte le détail du colis (transparent, aucun UI)
      try {
        const instructions = await getInstructionsFn(tourneeId);
        const instructionEnAttente = instructions.find(
          (i) => i.colisId === colisId && i.statut === 'ENVOYEE'
        );
        if (instructionEnAttente) {
          await marquerExecuteeFn(instructionEnAttente.instructionId);
        }
      } catch {
        // Silencieux — l'échec de la mise à jour instruction ne bloque pas le livreur
      }
    } catch (err) {
      if (err instanceof ColisNonTrouveError) {
        setEtat({ type: 'erreur', message: 'Colis introuvable dans cette tournee.' });
      } else {
        setEtat({
          type: 'erreur',
          message: 'Impossible de charger le detail du colis. Verifiez votre connexion.',
        });
      }
    }
  }, [tourneeId, colisId, getInstructionsFn, marquerExecuteeFn]);

  useEffect(() => {
    chargerDetailColis();
  }, [chargerDetailColis]);

  // ─── Etat chargement ───────────────────────────────────────────────────────

  if (etat.type === 'chargement') {
    return (
      <View style={styles.fullScreen}>
        <View style={styles.header}>
          <TouchableOpacity
            testID="bouton-retour"
            onPress={onRetour}
            style={styles.boutonRetour}
            accessibilityRole="button"
            accessibilityLabel="Retour a la liste des colis"
          >
            <Text style={styles.boutonRetourText}>{'< Retour'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centeredContainer} testID="etat-chargement">
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.chargementText}>Chargement du detail...</Text>
        </View>
      </View>
    );
  }

  // ─── Etat erreur ───────────────────────────────────────────────────────────

  if (etat.type === 'erreur') {
    return (
      <View style={styles.fullScreen}>
        <View style={styles.header}>
          <TouchableOpacity
            testID="bouton-retour"
            onPress={onRetour}
            style={styles.boutonRetour}
            accessibilityRole="button"
            accessibilityLabel="Retour a la liste des colis"
          >
            <Text style={styles.boutonRetourText}>{'< Retour'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centeredContainer} testID="etat-erreur">
          <Text style={styles.erreurText}>{etat.message}</Text>
        </View>
      </View>
    );
  }

  // ─── Etat succes ───────────────────────────────────────────────────────────

  const { colis } = etat;
  const estTerminal = colis.estTraite;
  const messageTerminal = MESSAGES_STATUT_TERMINAL[colis.statut];

  const ouvrirCarte = () => {
    const adresse = encodeURIComponent(colis.adresseLivraison.adresseComplete);
    const url = `https://www.google.com/maps/search/?api=1&query=${adresse}`;
    Linking.openURL(url).catch(() => {
      // silencieux — ouverture externe non critique
    });
  };

  const appelTelephone = () => {
    if (colis.destinataire.telephoneChiffre) {
      Linking.openURL(`tel:${colis.destinataire.telephoneChiffre}`).catch(() => {
        // silencieux — ouverture externe non critique
      });
    }
  };

  return (
    <View style={styles.fullScreen} testID="detail-colis-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          testID="bouton-retour"
          onPress={onRetour}
          style={styles.boutonRetour}
          accessibilityRole="button"
          accessibilityLabel="Retour a la liste des colis"
        >
          <Text style={styles.boutonRetourText}>{'< Retour'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitre}>
          Colis{' '}
          <Text testID="header-colis-id" style={styles.headerColisId}>
            #{colis.colisId}
          </Text>
        </Text>
      </View>

      <ScrollView style={styles.contenu} contentContainerStyle={styles.contenuInner}>
        {/* Section destinataire */}
        <View style={styles.section} testID="section-destinataire">
          <Text style={styles.sectionTitre}>Destinataire</Text>
          <Text style={styles.destinataireNom} testID="destinataire-nom">
            {colis.destinataire.nom}
          </Text>
          <Text style={styles.adresseTexte} testID="adresse-complete">
            {colis.adresseLivraison.adresseComplete}
          </Text>
          {colis.adresseLivraison.complementAdresse != null && (
            <Text style={styles.adresseTexte} testID="adresse-complement">
              {colis.adresseLivraison.complementAdresse}
            </Text>
          )}

          {/* Bouton d'appel — numero jamais affiche en clair (RGPD) */}
          {colis.destinataire.telephoneChiffre != null && (
            <TouchableOpacity
              testID="bouton-appel"
              onPress={appelTelephone}
              style={styles.boutonAppel}
              accessibilityRole="button"
              accessibilityLabel="Appeler le destinataire"
            >
              <Text style={styles.boutonAppelText}>Appeler</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Section contraintes — affichee uniquement si contraintes presentes */}
        {colis.contraintes.length > 0 && (
          <View style={styles.section} testID="section-contraintes">
            <Text style={styles.sectionTitre}>Contraintes</Text>
            {colis.contraintes.map((contrainte, idx) => (
              <View
                key={idx}
                style={[
                  styles.contrainteRow,
                  contrainte.estHoraire && styles.contrainteHoraireRow,
                ]}
                testID={`contrainte-${idx}`}
              >
                <Text
                  style={[
                    styles.contrainteTexte,
                    contrainte.estHoraire && styles.contrainteHoraireTexte,
                  ]}
                >
                  {contrainte.estHoraire ? '\u2691 ' : ''}{contrainte.valeur}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Lien carte externe */}
        <TouchableOpacity
          testID="bouton-carte"
          onPress={ouvrirCarte}
          style={styles.boutonCarte}
          accessibilityRole="link"
          accessibilityLabel="Voir sur la carte"
        >
          <Text style={styles.boutonCarteTexte}>Voir sur la carte</Text>
        </TouchableOpacity>

        {/* Actions principales ou message statut terminal */}
        {estTerminal ? (
          <View style={styles.messageTerminalContainer} testID="message-statut-terminal">
            <Text style={styles.messageTerminalTexte}>
              {messageTerminal ?? 'Ce colis a deja ete traite'}
            </Text>
          </View>
        ) : (
          <View style={styles.actionsContainer}>
            {/* LIVRER CE COLIS — navigue vers M-04 (US-008) */}
            <TouchableOpacity
              testID="bouton-livrer"
              onPress={() => onLivrer?.(colis.colisId)}
              style={styles.boutonLivrer}
              accessibilityRole="button"
              accessibilityLabel="Livrer ce colis"
            >
              <Text style={styles.boutonLivrerTexte}>LIVRER CE COLIS</Text>
            </TouchableOpacity>

            {/* DECLARER UN ECHEC — navigue vers M-05 (US-005) */}
            <TouchableOpacity
              testID="bouton-echec"
              onPress={() => onEchec?.(colis.colisId)}
              style={styles.boutonEchec}
              accessibilityRole="button"
              accessibilityLabel="Declarer un echec de livraison"
            >
              <Text style={styles.boutonEchecTexte}>DECLARER UN ECHEC</Text>
            </TouchableOpacity>
          </View>
        )}
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
    backgroundColor: '#1565C0',
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
    color: '#BBDEFB',
    fontSize: 15,
  },
  headerTitre: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  headerColisId: {
    color: '#BBDEFB',
  },
  contenu: {
    flex: 1,
  },
  contenuInner: {
    padding: 16,
    gap: 12,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#9E9E9E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  destinataireNom: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  adresseTexte: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 22,
  },
  boutonAppel: {
    marginTop: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  boutonAppelText: {
    color: '#1565C0',
    fontSize: 14,
    fontWeight: '600',
  },
  contrainteRow: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  contrainteHoraireRow: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  contrainteTexte: {
    fontSize: 14,
    color: '#616161',
  },
  contrainteHoraireTexte: {
    color: '#E65100',
    fontWeight: '600',
  },
  boutonCarte: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  boutonCarteTexte: {
    color: '#1565C0',
    fontSize: 15,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  boutonLivrer: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  boutonLivrerTexte: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  boutonEchec: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9E9E9E',
  },
  boutonEchecTexte: {
    color: '#616161',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  messageTerminalContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 8,
  },
  messageTerminalTexte: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  chargementText: {
    marginTop: 16,
    color: '#616161',
    fontSize: 14,
  },
  erreurText: {
    color: '#D32F2F',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default DetailColisScreen;
