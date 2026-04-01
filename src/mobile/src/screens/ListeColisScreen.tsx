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
import BandeauInstructionOverlay from '../components/BandeauInstructionOverlay';
import {
  getInstructionsEnAttente,
  InstructionMobileDTO,
} from '../api/supervisionApi';
import { useConsignesLocales } from '../hooks/useConsignesLocales';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { IndicateurSync } from '../components/design-system/IndicateurSync';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Intervalle de polling pour les instructions ENVOYEE (US-016) */
const POLLING_INTERVAL_MS = 10_000;

/** Bloquant 6 — Nombre maximum de sessions pendant lesquelles le hint swipe est affiché */
const SWIPE_HINT_MAX_SESSIONS = 5;
const SWIPE_HINT_KEY = '@docupost/swipe_hint_count';

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

// Navigation interne (US-004 + US-005 + US-007 + US-008/009 + US-037)
type NavigationColis =
  | { ecran: 'liste' }
  | { ecran: 'detail'; tourneeId: string; colisId: string }
  | { ecran: 'echec'; tourneeId: string; colisId: string; destinataireNom: string }
  | { ecran: 'preuve'; tourneeId: string; colisId: string; destinataireNom: string }
  | { ecran: 'recapitulatif'; tourneeId: string }
  | { ecran: 'mesConsignes' };

export const ListeColisScreen: React.FC = () => {
  const [etat, setEtat] = useState<EtatEcran>({ type: 'chargement' });
  const [rafraichissement, setRafraichissement] = useState(false);
  const [zoneActive, setZoneActive] = useState<FiltreZone>(ZONE_TOUS);
  const [navigation, setNavigation] = useState<NavigationColis>({ ecran: 'liste' });

  // Bloquant 2 — Statut réseau réel (US-026 + feedback 2026-04-01)
  const syncStatus = useNetworkStatus();

  // Bloquant 6 — Hint swipe visible seulement pendant les N premières sessions
  const [afficherHintSwipe, setAfficherHintSwipe] = useState(false);
  useEffect(() => {
    const verifierHintSwipe = async () => {
      try {
        const valeurStr = await AsyncStorage.getItem(SWIPE_HINT_KEY);
        const sessions = valeurStr ? parseInt(valeurStr, 10) : 0;
        if (sessions < SWIPE_HINT_MAX_SESSIONS) {
          setAfficherHintSwipe(true);
          await AsyncStorage.setItem(SWIPE_HINT_KEY, String(sessions + 1));
        } else {
          setAfficherHintSwipe(false);
        }
      } catch {
        // AsyncStorage indisponible — pas de hint (silencieux)
        setAfficherHintSwipe(false);
      }
    };
    verifierHintSwipe();
  }, []);

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
      {/* Bloquant 2 — Bandeau "Hors ligne" quand réseau indisponible (feedback 2026-04-01) */}
      {syncStatus === 'offline' && (
        <View style={styles.bandeauHorsLigne} testID="bandeau-hors-ligne">
          <IndicateurSync syncStatus="offline" />
          <Text style={styles.bandeauHorsLigneTexte}>
            {' '}Hors ligne — vos actions seront synchronisees
          </Text>
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
          <ColisItem
            colis={item}
            onPress={ouvrirDetailColis}
            afficherHintSwipe={afficherHintSwipe && item.statut === 'A_LIVRER'}
            onSwipeEchec={item.statut === 'A_LIVRER' ? ouvrirDeclarerEchec : undefined}
          />
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
  bandeauProgressionGauche: {
    flex: 1,
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
  boutonConsignes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 12,
    gap: 6,
  },
  boutonConsignesTexte: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeTexte: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
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
  // Bloquant 2 — Bandeau hors ligne
  bandeauHorsLigne: {
    backgroundColor: '#D32F2F',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bandeauHorsLigneTexte: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});

export default ListeColisScreen;
