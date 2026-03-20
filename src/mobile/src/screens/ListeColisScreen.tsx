import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getTourneeAujourdhui, TourneeNonTrouveeError } from '../api/tourneeApi';
import { TourneeDTO } from '../api/tourneeTypes';
import ColisItem from '../components/ColisItem';

/**
 * Ecran M-02 — Liste des colis de la tournee
 *
 * Affiche :
 * - Bandeau "Reste a livrer : X / Y" (US-001 + US-002)
 * - Estimation de fin si disponible (US-002)
 * - Bouton "Cloture la tournee" visible uniquement si resteALivrer === 0 (US-002, SC4)
 * - Liste FlatList de ColisItem (un item par colis)
 * - Etats : chargement (spinner), erreur, liste vide ("Aucun colis assigne")
 *
 * Domain Events declenches (via le backend au premier acces) :
 * - TourneeChargee
 * - TourneeDemarree (idempotent)
 *
 * Source wireframe : M-02 — Liste des colis de la tournee.
 */

type EtatEcran =
  | { type: 'chargement' }
  | { type: 'succes'; tournee: TourneeDTO }
  | { type: 'vide' }
  | { type: 'erreur'; message: string };

export const ListeColisScreen: React.FC = () => {
  const [etat, setEtat] = useState<EtatEcran>({ type: 'chargement' });
  const [rafraichissement, setRafraichissement] = useState(false);

  const chargerTournee = useCallback(async () => {
    try {
      const tournee = await getTourneeAujourdhui();
      if (tournee.colis.length === 0) {
        setEtat({ type: 'vide' });
      } else {
        setEtat({ type: 'succes', tournee });
      }
    } catch (err) {
      if (err instanceof TourneeNonTrouveeError) {
        setEtat({ type: 'vide' });
      } else {
        setEtat({
          type: 'erreur',
          message: 'Impossible de charger la tournee. Verifiez votre connexion.',
        });
      }
    }
  }, []);

  useEffect(() => {
    chargerTournee();
  }, [chargerTournee]);

  const handleRafraichissement = useCallback(async () => {
    setRafraichissement(true);
    await chargerTournee();
    setRafraichissement(false);
  }, [chargerTournee]);

  // ─── Etats de rendu ───────────────────────────────────────────────────────

  if (etat.type === 'chargement') {
    return (
      <View style={styles.centeredContainer} testID="etat-chargement">
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.chargementText}>Chargement de votre tournee...</Text>
      </View>
    );
  }

  if (etat.type === 'erreur') {
    return (
      <View style={styles.centeredContainer} testID="etat-erreur">
        <Text style={styles.erreurText}>{etat.message}</Text>
      </View>
    );
  }

  if (etat.type === 'vide') {
    return (
      <View style={styles.centeredContainer} testID="etat-vide">
        <Text style={styles.videText} testID="message-aucun-colis">
          Aucun colis assigne pour aujourd'hui.{'\n'}Contactez votre superviseur.
        </Text>
      </View>
    );
  }

  // type === 'succes'
  const { tournee } = etat;

  return (
    <View style={styles.container} testID="liste-colis-screen">
      {/* Bandeau de progression (US-002) */}
      <View style={styles.bandeauProgression} testID="bandeau-progression">
        <Text style={styles.resteALivrer} testID="reste-a-livrer">
          Reste a livrer : {tournee.resteALivrer} / {tournee.colisTotal}
        </Text>
        {tournee.estimationFin && (
          <Text style={styles.estimationFin} testID="estimation-fin">
            Fin estimee : {tournee.estimationFin}
          </Text>
        )}
      </View>

      {/* Bouton "Cloture la tournee" — visible uniquement si tous les colis sont traites (US-002, SC4) */}
      {tournee.resteALivrer === 0 && (
        <TouchableOpacity
          style={styles.boutonCloture}
          testID="bouton-cloture"
          onPress={() => {
            // TODO US-007 : implementer la cloture de tournee
          }}
          accessibilityRole="button"
          accessibilityLabel="Cloture la tournee"
        >
          <Text style={styles.boutonClotureText}>Cloture la tournee</Text>
        </TouchableOpacity>
      )}

      {/* Liste des colis */}
      <FlatList
        data={tournee.colis}
        keyExtractor={(item) => item.colisId}
        renderItem={({ item }) => <ColisItem colis={item} />}
        contentContainerStyle={styles.liste}
        refreshControl={
          <RefreshControl
            refreshing={rafraichissement}
            onRefresh={handleRafraichissement}
            colors={['#2196F3']}
          />
        }
        testID="flatlist-colis"
        ListEmptyComponent={
          <View style={styles.centeredContainer}>
            <Text style={styles.videText}>Aucun colis dans cette zone.</Text>
          </View>
        }
      />
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
  bandeauProgression: {
    backgroundColor: '#1565C0',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resteALivrer: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  estimationFin: {
    color: '#BBDEFB',
    fontSize: 14,
  },
  boutonCloture: {
    backgroundColor: '#388E3C',
    margin: 16,
    marginTop: 8,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  boutonClotureText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  liste: {
    paddingVertical: 8,
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
  videText: {
    color: '#616161',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ListeColisScreen;
