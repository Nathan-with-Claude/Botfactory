import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import FiltreZones from '../components/FiltreZones';
import {
  extraireZonesDisponibles,
  filtrerColisByZone,
  FiltreZone,
  ZONE_TOUS,
} from '../domain/filtreZone';
import { DetailColisScreen } from './DetailColisScreen';
import { DeclarerEchecScreen } from './DeclarerEchecScreen';
import { RecapitulatifTourneeScreen } from './RecapitulatifTourneeScreen';

/**
 * Ecran M-02 — Liste des colis de la tournee
 *
 * Affiche :
 * - Bandeau "Reste a livrer : X / Y" (US-001 + US-002)
 * - Estimation de fin si disponible (US-002)
 * - Onglets de filtre par zone geographique (US-003) — filtrage local instantane
 * - Bouton "Cloture la tournee" visible uniquement si resteALivrer === 0 (US-002, SC4)
 * - Liste FlatList de ColisItem (un item par colis)
 * - Etats : chargement (spinner), erreur, liste vide ("Aucun colis assigne")
 *
 * Invariants US-003 :
 * - Le filtrage est purement local (aucun appel reseau supplementaire).
 * - Le bandeau "Reste a livrer" est toujours calcule sur l'ensemble de la tournee.
 * - L'onglet "Tous" est actif par defaut.
 * - Aucun Domain Event n'est emis lors du filtrage.
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

// Navigation interne (US-004 + US-005 + US-007)
type NavigationColis =
  | { ecran: 'liste' }
  | { ecran: 'detail'; tourneeId: string; colisId: string }
  | { ecran: 'echec'; tourneeId: string; colisId: string; destinataireNom: string }
  | { ecran: 'recapitulatif'; tourneeId: string };

export const ListeColisScreen: React.FC = () => {
  const [etat, setEtat] = useState<EtatEcran>({ type: 'chargement' });
  const [rafraichissement, setRafraichissement] = useState(false);
  const [zoneActive, setZoneActive] = useState<FiltreZone>(ZONE_TOUS);
  const [navigation, setNavigation] = useState<NavigationColis>({ ecran: 'liste' });

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

  // ─── Logique de filtrage par zone (US-003) ────────────────────────────────
  // Derive depuis l'etat "succes" uniquement — purement calculee, sans effet de bord

  const zonesDisponibles = useMemo(() => {
    if (etat.type !== 'succes') return [];
    return extraireZonesDisponibles(etat.tournee.colis);
  }, [etat]);

  const colisAffiches = useMemo(() => {
    if (etat.type !== 'succes') return [];
    return filtrerColisByZone(etat.tournee.colis, zoneActive);
  }, [etat, zoneActive]);

  // ─── Navigation vers le detail d'un colis (US-004) ───────────────────────

  const ouvrirDetailColis = useCallback(
    (colisId: string) => {
      if (etat.type === 'succes') {
        setNavigation({
          ecran: 'detail',
          tourneeId: etat.tournee.tourneeId,
          colisId,
        });
      }
    },
    [etat]
  );

  const revenirALaListe = useCallback(() => {
    setNavigation({ ecran: 'liste' });
  }, []);

  // ─── Navigation vers l'écran d'échec depuis le détail (US-005) ──────────

  const ouvrirDeclarerEchec = useCallback(
    (colisId: string) => {
      if (etat.type === 'succes') {
        const colis = etat.tournee.colis.find((c) => c.colisId === colisId);
        setNavigation({
          ecran: 'echec',
          tourneeId: etat.tournee.tourneeId,
          colisId,
          destinataireNom: colis?.destinataire.nom ?? '',
        });
      }
    },
    [etat]
  );

  const revenirAuDetailDepuisEchec = useCallback(() => {
    // Après l'échec enregistré, revenir à la liste pour que les statuts soient rafraîchis
    setNavigation({ ecran: 'liste' });
    chargerTournee();
  }, [chargerTournee]);

  // ─── Rendu RecapitulatifTourneeScreen (US-007) ───────────────────────────

  if (navigation.ecran === 'recapitulatif') {
    return (
      <RecapitulatifTourneeScreen
        tourneeId={navigation.tourneeId}
        onTerminer={() => {
          // Revenir a la liste apres cloture (la tournee sera CLOTUREE)
          setNavigation({ ecran: 'liste' });
          chargerTournee();
        }}
      />
    );
  }

  // ─── Rendu DeclarerEchecScreen (US-005) ──────────────────────────────────

  if (navigation.ecran === 'echec') {
    return (
      <DeclarerEchecScreen
        tourneeId={navigation.tourneeId}
        colisId={navigation.colisId}
        destinataireNom={navigation.destinataireNom}
        onRetour={() => setNavigation({
          ecran: 'detail',
          tourneeId: navigation.tourneeId,
          colisId: navigation.colisId,
        })}
        onEchecEnregistre={revenirAuDetailDepuisEchec}
      />
    );
  }

  // ─── Rendu DetailColisScreen (US-004) ─────────────────────────────────────

  if (navigation.ecran === 'detail') {
    return (
      <DetailColisScreen
        tourneeId={navigation.tourneeId}
        colisId={navigation.colisId}
        onRetour={revenirALaListe}
        onEchec={ouvrirDeclarerEchec}
      />
    );
  }

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
  const aDesZones = zonesDisponibles.length > 0;

  return (
    <View style={styles.container} testID="liste-colis-screen">
      {/* Bandeau de progression (US-002) — toujours base sur toute la tournee (US-003) */}
      <View style={styles.bandeauProgression} testID="bandeau-progression">
        <Text style={styles.resteALivrer} testID="reste-a-livrer">
          Reste a livrer : {tournee.resteALivrer} / {tournee.colisTotal}
        </Text>
        {tournee.estimationFin != null && (
          <Text style={styles.estimationFin} testID="estimation-fin">
            {`Fin estimee : ${tournee.estimationFin}`}
          </Text>
        )}
      </View>

      {/* Bouton "Cloture la tournee" — visible uniquement si tous les colis sont traites (US-007) */}
      {tournee.resteALivrer === 0 && tournee.statut !== 'CLOTUREE' && (
        <TouchableOpacity
          style={styles.boutonCloture}
          testID="bouton-cloture"
          onPress={() => {
            if (etat.type === 'succes') {
              setNavigation({ ecran: 'recapitulatif', tourneeId: etat.tournee.tourneeId });
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Cloture la tournee"
        >
          <Text style={styles.boutonClotureText}>Cloture la tournee</Text>
        </TouchableOpacity>
      )}

      {/* Onglets de filtre par zone (US-003) — affiches uniquement si des zones sont disponibles */}
      {aDesZones && (
        <FiltreZones
          zones={zonesDisponibles}
          zoneActive={zoneActive}
          onZoneChange={setZoneActive}
        />
      )}

      {/* Liste des colis (filtree par zone si filtre actif) */}
      <FlatList
        data={colisAffiches}
        keyExtractor={(item) => item.colisId}
        renderItem={({ item }) => (
          <ColisItem colis={item} onPress={ouvrirDetailColis} />
        )}
        contentContainerStyle={styles.liste}
        refreshControl={
          <RefreshControl
            refreshing={rafraichissement}
            onRefresh={handleRafraichissement}
            colors={['#2196F3']}
          />
        }
        testID="flatlist-colis"
        initialNumToRender={50}
        maxToRenderPerBatch={50}
        windowSize={21}
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
