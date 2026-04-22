import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';
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
import { CapturePreuveScreen } from './CapturePreuveScreen';
import { MesConsignesScreen } from './MesConsignesScreen';
import MessagesSuperviseursScreen from './MessagesSuperviseursScreen';
import BandeauInstructionOverlay from '../components/BandeauInstructionOverlay';
import {
  getInstructionsEnAttente,
  InstructionMobileDTO,
} from '../api/supervisionApi';
import { useConsignesLocales } from '../hooks/useConsignesLocales';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { IndicateurSync } from '../components/design-system/IndicateurSync';
import { useSwipeHint } from '../hooks/useSwipeHint';
import { offlineQueue } from '../domain/offlineQueueInstance';

/** Intervalle de polling pour les instructions ENVOYEE (US-016) */
const POLLING_INTERVAL_MS = 10_000;

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

// Navigation interne (US-004 + US-005 + US-007 + US-008/009 + US-037 + US-068)
type NavigationColis =
  | { ecran: 'liste' }
  | { ecran: 'detail'; tourneeId: string; colisId: string }
  | { ecran: 'echec'; tourneeId: string; colisId: string; destinataireNom: string }
  | { ecran: 'preuve'; tourneeId: string; colisId: string; destinataireNom: string }
  | { ecran: 'recapitulatif'; tourneeId: string }
  | { ecran: 'mesConsignes' }
  | { ecran: 'messagesSupervision' };

export const ListeColisScreen: React.FC = () => {
  const [etat, setEtat] = useState<EtatEcran>({ type: 'chargement' });
  const [rafraichissement, setRafraichissement] = useState(false);
  const [zoneActive, setZoneActive] = useState<FiltreZone>(ZONE_TOUS);
  const [navigation, setNavigation] = useState<NavigationColis>({ ecran: 'liste' });

  // Bloquant 2 — Statut réseau réel (US-026 + feedback 2026-04-01)
  const syncStatus = useNetworkStatus();

  // US-062 — Compteur d'envois en attente (mis à jour à chaque changement d'état)
  const [pendingCount, setPendingCount] = useState<number>(offlineQueue.getPendingCount());

  // Rafraîchir le compteur à chaque chargement/rafraîchissement de la liste
  useEffect(() => {
    setPendingCount(offlineQueue.getPendingCount());
  }, [etat]);

  // US-045 — Hint swipe : visible si < SEUIL_HINT (3) swipes réussis
  // Remplacement de la logique "sessions" (Bloquant 6) par la logique "swipes réussis"
  const { afficherHint: afficherHintSwipe, incrementerSwipeReussi } = useSwipeHint();

  // US-016 : instruction en attente affichée dans le bandeau M-06
  const [instructionAffichee, setInstructionAffichee] = useState<InstructionMobileDTO | null>(null);
  // Garde en mémoire les instructionId déjà affichés pour éviter les doublons
  const instructionsVues = useRef<Set<string>>(new Set());

  // US-037 : historique persistant des consignes
  const {
    consignes,
    nombreNonLues,
    ajouterConsigne,
    marquerToutesLues,
    marquerExecutee,
    prendreEnCompteNouvelles,
    syncEnCours,
  } = useConsignesLocales();

  // US-068 : compteur messages broadcast non lus du jour
  const [nombreBroadcastsNonLus, setNombreBroadcastsNonLus] = useState(0);

  useEffect(() => {
    const chargerCompteurBroadcasts = async () => {
      try {
        const now = new Date();
        const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const baseUrl = process.env.EXPO_PUBLIC_SUPERVISION_URL ?? 'http://localhost:8082';
        const mockHeaders: Record<string, string> =
          process.env.EXPO_PUBLIC_ENV === 'recette'
            ? { 'X-Mock-Role': 'ROLE_LIVREUR', 'X-Mock-Id': 'livreur-002' }
            : {};
        const reponse = await fetch(
          `${baseUrl}/api/supervision/broadcasts/recus?date=${date}`,
          { headers: mockHeaders }
        );
        if (reponse.ok) {
          const liste: Array<{ vu: boolean }> = await reponse.json();
          setNombreBroadcastsNonLus(liste.filter((m) => !m.vu).length);
        }
      } catch {
        // Silencieux — ne bloque pas la liste
      }
    };
    chargerCompteurBroadcasts();
  }, [navigation.ecran]);

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

  // US-016 : polling des instructions ENVOYEE toutes les 10 secondes
  useEffect(() => {
    const pollInstructions = async () => {
      if (etat.type !== 'succes') return;
      try {
        const instructions = await getInstructionsEnAttente(etat.tournee.tourneeId);
        // Afficher uniquement la première instruction non encore vue
        const nouvelle = instructions.find(
          (i) => !instructionsVues.current.has(i.instructionId)
        );
        if (nouvelle) {
          instructionsVues.current.add(nouvelle.instructionId);
          setInstructionAffichee(nouvelle);
        }
      } catch {
        // Polling silencieux — ne bloque pas la liste
      }
    };

    const intervalle = setInterval(pollInstructions, POLLING_INTERVAL_MS);
    return () => clearInterval(intervalle);
  }, [etat]);

  const handleRafraichissement = useCallback(async () => {
    setRafraichissement(true);
    await chargerTournee();
    setRafraichissement(false);
  }, [chargerTournee]);

  // US-037 delta Sprint 5 : prendreEnCompteNouvelles à l'ouverture de MesConsignesScreen
  useEffect(() => {
    if (navigation.ecran === 'mesConsignes') {
      // Synchronisation silencieuse — erreurs gérées dans le hook
      prendreEnCompteNouvelles().catch(() => undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation.ecran]);

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

  // US-045 — Swipe réussi : incrémenter le compteur swipeHintCount PUIS ouvrir M-05
  // Appelé uniquement par onSwipeEchec dans ColisItem (swipe gauche ≥ 80px)
  const ouvrirDeclarerEchecViaSwipe = useCallback(
    (colisId: string) => {
      // Incrémenter le compteur (swipe réussi = M-05 ouvert)
      incrementerSwipeReussi().catch(() => undefined);
      ouvrirDeclarerEchec(colisId);
    },
    [ouvrirDeclarerEchec, incrementerSwipeReussi]
  );

  const revenirAuDetailDepuisEchec = useCallback(() => {
    // Après l'échec enregistré, revenir à la liste pour que les statuts soient rafraîchis
    setNavigation({ ecran: 'liste' });
    chargerTournee();
  }, [chargerTournee]);

  // ─── Navigation vers l'écran preuve depuis le détail (US-008/009) ─────────

  const ouvrirCapturePreuve = useCallback(
    (colisId: string) => {
      if (etat.type === 'succes') {
        const colis = etat.tournee.colis.find((c) => c.colisId === colisId);
        setNavigation({
          ecran: 'preuve',
          tourneeId: etat.tournee.tourneeId,
          colisId,
          destinataireNom: colis?.destinataire.nom ?? '',
        });
      }
    },
    [etat]
  );

  const revenirAuDetailDepuisPreuve = useCallback(() => {
    // Après la livraison confirmée, revenir à la liste pour que les statuts soient rafraîchis
    setNavigation({ ecran: 'liste' });
    chargerTournee();
  }, [chargerTournee]);

  // ─── Rendu MesConsignesScreen (US-037) ───────────────────────────────────

  if (navigation.ecran === 'mesConsignes') {
    return (
      <MesConsignesScreen
        consignes={consignes}
        onRetour={() => setNavigation({ ecran: 'liste' })}
        onMarquerExecutee={(instructionId) => {
          marquerExecutee(instructionId);
        }}
        onVoirColis={(colisId) => {
          // Navigation M-07 → M-03 (US-037 delta Sprint 5)
          if (etat.type === 'succes') {
            setNavigation({
              ecran: 'detail',
              tourneeId: etat.tournee.tourneeId,
              colisId,
            });
          }
        }}
        syncEnCours={syncEnCours}
        estHorsConnexion={syncStatus === 'offline'}
      />
    );
  }

  // ─── Rendu MessagesSuperviseursScreen (US-068) ───────────────────────────

  if (navigation.ecran === 'messagesSupervision') {
    return (
      <MessagesSuperviseursScreen
        onRetour={() => {
          // Réinitialiser le compteur au retour (les messages ont été acquittés)
          setNombreBroadcastsNonLus(0);
          setNavigation({ ecran: 'liste' });
        }}
      />
    );
  }

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

  // ─── Rendu CapturePreuveScreen (US-008/009) ──────────────────────────────

  if (navigation.ecran === 'preuve') {
    return (
      <CapturePreuveScreen
        tourneeId={navigation.tourneeId}
        colisId={navigation.colisId}
        destinataireNom={navigation.destinataireNom}
        onRetour={() => setNavigation({
          ecran: 'detail',
          tourneeId: navigation.tourneeId,
          colisId: navigation.colisId,
        })}
        onLivraisonConfirmee={revenirAuDetailDepuisPreuve}
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
        onLivrer={ouvrirCapturePreuve}
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
          Aucune tournée n'a encore été commandée pour vous.{'\n'}Veuillez vous rapprocher de votre superviseur.
        </Text>
      </View>
    );
  }

  // type === 'succes'
  const { tournee } = etat;
  const aDesZones = zonesDisponibles.length > 0;

  return (
    <View style={styles.container} testID="liste-colis-screen">
      {/* Bloquant 2 — Bandeau "Hors ligne" quand réseau indisponible (feedback 2026-04-01) */}
      {/* US-062 : pendingCount transmis pour afficher le compteur d'envois en attente */}
      {syncStatus === 'offline' && (
        <View style={styles.bandeauHorsLigne} testID="bandeau-hors-ligne">
          <IndicateurSync syncStatus="offline" pendingCount={pendingCount} />
        </View>
      )}

      {/* Bandeau overlay instruction superviseur M-06 (US-016 + US-037) */}
      {instructionAffichee && (
        <BandeauInstructionOverlay
          instruction={instructionAffichee}
          onVoir={(colisId) => {
            setInstructionAffichee(null);
            ouvrirDetailColis(colisId);
          }}
          onFermer={() => setInstructionAffichee(null)}
          onConsignePersistee={ajouterConsigne}
        />
      )}

      {/* Bandeau de progression (US-002) — toujours base sur toute la tournee (US-003) */}
      <View style={styles.bandeauProgression} testID="bandeau-progression">
        <View style={styles.bandeauProgressionGauche}>
          <Text style={styles.resteALivrer} testID="reste-a-livrer">
            Reste a livrer : {tournee.resteALivrer} / {tournee.colisTotal}
          </Text>
          {tournee.estimationFin != null && (
            <Text style={styles.estimationFin} testID="estimation-fin">
              {`Fin estimee : ${tournee.estimationFin}`}
            </Text>
          )}
        </View>

        {/* Bouton "Mes consignes" avec badge (US-037) */}
        <TouchableOpacity
          testID="btn-mes-consignes"
          style={styles.boutonConsignes}
          onPress={() => {
            marquerToutesLues();
            setNavigation({ ecran: 'mesConsignes' });
          }}
          accessibilityRole="button"
          accessibilityLabel={
            nombreNonLues > 0
              ? `Mes consignes — ${nombreNonLues} non lue${nombreNonLues > 1 ? 's' : ''}`
              : 'Mes consignes'
          }
        >
          <Text style={styles.boutonConsignesTexte}>Consignes</Text>
          {nombreNonLues > 0 && (
            <View style={styles.badge} testID="badge-consignes">
              <Text style={styles.badgeTexte}>
                {nombreNonLues > 9 ? '9+' : String(nombreNonLues)}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Bouton "Messages superviseur" avec badge (US-068) */}
        <TouchableOpacity
          testID="btn-messages-superviseur"
          style={styles.boutonConsignes}
          onPress={() => setNavigation({ ecran: 'messagesSupervision' })}
          accessibilityRole="button"
          accessibilityLabel={
            nombreBroadcastsNonLus > 0
              ? `Messages — ${nombreBroadcastsNonLus} non lu${nombreBroadcastsNonLus > 1 ? 's' : ''}`
              : 'Messages superviseur'
          }
        >
          <Text style={styles.boutonConsignesTexte}>MSG</Text>
          {nombreBroadcastsNonLus > 0 && (
            <View style={styles.badge} testID="badge-messages">
              <Text style={styles.badgeTexte}>
                {nombreBroadcastsNonLus > 9 ? '9+' : String(nombreBroadcastsNonLus)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
        style={styles.flatList}
        data={colisAffiches}
        keyExtractor={(item) => item.colisId}
        renderItem={({ item }) => (
          <ColisItem
            colis={item}
            onPress={ouvrirDetailColis}
            afficherHintSwipe={afficherHintSwipe && item.statut === 'A_LIVRER'}
            onSwipeEchec={item.statut === 'A_LIVRER' ? ouvrirDeclarerEchecViaSwipe : undefined}
          />
        )}
        contentContainerStyle={styles.liste}
        refreshControl={
          <RefreshControl
            refreshing={rafraichissement}
            onRefresh={handleRafraichissement}
            colors={[Colors.primary]}
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
    backgroundColor: Colors.surface,
  },
  flatList: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  bandeauProgression: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 64,
  },
  bandeauProgressionGauche: {
    flex: 1,
  },
  resteALivrer: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  estimationFin: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
  boutonConsignes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 12,
    gap: 6,
    minHeight: 48,
    minWidth: 48,
  },
  boutonConsignesTexte: {
    color: Colors.onPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeTexte: {
    color: Colors.onPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  boutonCloture: {
    backgroundColor: Colors.tertiaryContainer,
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  boutonClotureText: {
    color: Colors.onTertiary,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liste: {
    paddingVertical: 8,
    paddingBottom: 88,
  },
  chargementText: {
    marginTop: 16,
    color: Colors.onSurfaceVariant,
    fontSize: 14,
  },
  erreurText: {
    color: Colors.error,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  videText: {
    color: Colors.onSurfaceVariant,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Bloquant 2 — Bandeau hors ligne
  bandeauHorsLigne: {
    backgroundColor: Colors.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bandeauHorsLigneTexte: {
    color: Colors.onPrimary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});

export default ListeColisScreen;
