import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { cloturerTournee, ColisEncoreALivrerError } from '../api/tourneeApi';
import { RecapitulatifTourneeDTO } from '../api/tourneeTypes';

/**
 * Ecran M-07 — Recapitulatif de tournee apres cloture
 *
 * US-007 : Cloture de tournee
 *
 * Appelle POST /api/tournees/{tourneeId}/cloture au montage.
 * Affiche :
 * - Bandeau "Tournee cloturee" (titre)
 * - Compteurs : total, livres, echecs, a representer
 * - Micro-enquete de satisfaction (note 1 a 5)
 * - Bouton "Terminer" pour revenir a l'ecran d'accueil
 *
 * Etats :
 * - Chargement : spinner (appel API en cours)
 * - Succes : recap + enquete + bouton Terminer
 * - Erreur : message (ex : colis encore a livrer — ne devrait pas arriver si le bouton est bien protege)
 *
 * Source wireframe : M-02 → bouton "Cloture la tournee" → M-07
 */

interface Props {
  tourneeId: string;
  onTerminer: () => void;
}

type EtatEcran =
  | { type: 'chargement' }
  | { type: 'succes'; recap: RecapitulatifTourneeDTO }
  | { type: 'erreur'; message: string };

export const RecapitulatifTourneeScreen: React.FC<Props> = ({ tourneeId, onTerminer }) => {
  const [etat, setEtat] = useState<EtatEcran>({ type: 'chargement' });
  const [noteSatisfaction, setNoteSatisfaction] = useState<number | null>(null);

  const effectuerCloture = useCallback(async () => {
    try {
      const recap = await cloturerTournee(tourneeId);
      setEtat({ type: 'succes', recap });
    } catch (err) {
      if (err instanceof ColisEncoreALivrerError) {
        setEtat({
          type: 'erreur',
          message: 'Certains colis sont encore a livrer. La cloture est bloquee.',
        });
      } else {
        setEtat({
          type: 'erreur',
          message: 'Impossible de cloturer la tournee. Verifiez votre connexion.',
        });
      }
    }
  }, [tourneeId]);

  useEffect(() => {
    effectuerCloture();
  }, [effectuerCloture]);

  // ─── Etat de chargement ───────────────────────────────────────────────────

  if (etat.type === 'chargement') {
    return (
      <View style={styles.centeredContainer} testID="recap-chargement">
        <ActivityIndicator size="large" color="#388E3C" />
        <Text style={styles.chargementText}>Cloture en cours...</Text>
      </View>
    );
  }

  // ─── Etat d'erreur ────────────────────────────────────────────────────────

  if (etat.type === 'erreur') {
    return (
      <View style={styles.centeredContainer} testID="recap-erreur">
        <Text style={styles.erreurText}>{etat.message}</Text>
        <TouchableOpacity
          style={styles.boutonTerminer}
          testID="bouton-terminer"
          onPress={onTerminer}
          accessibilityRole="button"
        >
          <Text style={styles.boutonTerminerText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Succes : affichage du recapitulatif ──────────────────────────────────

  const { recap } = etat;

  return (
    <View style={styles.container} testID="recap-screen">
      {/* Titre */}
      <View style={styles.headerSuccess}>
        <Text style={styles.headerTitre} testID="recap-titre">
          Tournee cloturee !
        </Text>
        <Text style={styles.headerSousTitre}>
          Bilan de votre journee
        </Text>
      </View>

      {/* Compteurs */}
      <View style={styles.recapCard}>
        <View style={styles.recapLigne}>
          <Text style={styles.recapLabel}>Total colis</Text>
          <Text style={styles.recapValeur} testID="recap-colis-total">
            {recap.colisTotal}
          </Text>
        </View>
        <View style={[styles.recapLigne, styles.recapLigneVerte]}>
          <Text style={styles.recapLabel}>Livres</Text>
          <Text style={[styles.recapValeur, styles.valeurVerte]} testID="recap-colis-livres">
            {recap.colisLivres}
          </Text>
        </View>
        <View style={[styles.recapLigne, styles.recapLigneRouge]}>
          <Text style={styles.recapLabel}>Echecs</Text>
          <Text style={[styles.recapValeur, styles.valeurRouge]} testID="recap-colis-echecs">
            {recap.colisEchecs}
          </Text>
        </View>
        <View style={[styles.recapLigne, styles.recapLigneOrange]}>
          <Text style={styles.recapLabel}>A representer</Text>
          <Text style={[styles.recapValeur, styles.valeurOrange]} testID="recap-colis-a-representer">
            {recap.colisARepresenter}
          </Text>
        </View>
      </View>

      {/* Micro-enquete de satisfaction */}
      <View style={styles.enqueteCard} testID="enquete-satisfaction">
        <Text style={styles.enqueteTitre}>Comment s'est passee votre journee ?</Text>
        <View style={styles.notesContainer}>
          {[1, 2, 3, 4, 5].map((note) => (
            <TouchableOpacity
              key={note}
              testID={`note-${note}`}
              style={[
                styles.noteButton,
                noteSatisfaction === note && styles.noteButtonActive,
              ]}
              onPress={() => setNoteSatisfaction(note)}
              accessibilityRole="button"
              accessibilityLabel={`Note ${note} sur 5`}
            >
              <Text style={[
                styles.noteText,
                noteSatisfaction === note && styles.noteTextActive,
              ]}>
                {note}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {noteSatisfaction !== null && (
          <Text style={styles.enqueteMerci} testID="enquete-merci">
            Merci pour votre retour !
          </Text>
        )}
      </View>

      {/* Bouton Terminer */}
      <TouchableOpacity
        style={styles.boutonTerminer}
        testID="bouton-terminer"
        onPress={onTerminer}
        accessibilityRole="button"
        accessibilityLabel="Terminer la journee"
      >
        <Text style={styles.boutonTerminerText}>TERMINER</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  headerSuccess: {
    backgroundColor: '#388E3C',
    padding: 24,
    alignItems: 'center',
  },
  headerTitre: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSousTitre: {
    color: '#C8E6C9',
    fontSize: 14,
  },
  recapCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  recapLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recapLigneVerte: {
    backgroundColor: '#F1F8E9',
  },
  recapLigneRouge: {
    backgroundColor: '#FFF3E0',
  },
  recapLigneOrange: {
    backgroundColor: '#FFF8E1',
  },
  recapLabel: {
    fontSize: 15,
    color: '#424242',
  },
  recapValeur: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  valeurVerte: {
    color: '#388E3C',
  },
  valeurRouge: {
    color: '#D32F2F',
  },
  valeurOrange: {
    color: '#F57C00',
  },
  enqueteCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    alignItems: 'center',
  },
  enqueteTitre: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 12,
    textAlign: 'center',
  },
  notesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  noteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  noteButtonActive: {
    borderColor: '#388E3C',
    backgroundColor: '#388E3C',
  },
  noteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#616161',
  },
  noteTextActive: {
    color: '#FFFFFF',
  },
  enqueteMerci: {
    marginTop: 8,
    fontSize: 13,
    color: '#388E3C',
  },
  boutonTerminer: {
    backgroundColor: '#1565C0',
    margin: 16,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  boutonTerminerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
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
    marginBottom: 16,
  },
});

export default RecapitulatifTourneeScreen;
