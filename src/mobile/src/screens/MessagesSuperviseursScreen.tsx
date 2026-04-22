/**
 * MessagesSuperviseursScreen — Écran M-08 (US-068)
 *
 * Affiche la liste des messages broadcast reçus du superviseur pour la journée.
 * Accessible depuis la ListeColisScreen via l'icône cloche.
 *
 * Comportement :
 * - Au mount : GET /api/supervision/broadcasts/recus?date=YYYY-MM-DD
 * - Pour chaque message non lu : POST /api/supervision/broadcasts/{id}/vu (parallèle)
 * - Tri chronologique inverse (plus récent en premier)
 * - Badge coloré par type, fond teinté pour les non-lus
 * - État vide si aucun message du jour
 * - Bandeau orange "Hors connexion" si réseau indisponible
 *
 * Source : US-068 — "Recevoir et consulter les messages broadcast sur l'application mobile"
 * Wireframe : M-08 — Messages superviseur
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BroadcastRecu {
  broadcastMessageId: string;
  type: 'ALERTE' | 'INFO' | 'CONSIGNE';
  texte: string;
  superviseurId: string;
  horodatageEnvoi: string; // ISO 8601
  vu: boolean;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.EXPO_PUBLIC_SUPERVISION_URL ?? 'http://localhost:8082';

const COULEUR_PAR_TYPE: Record<string, string> = {
  ALERTE:   '#DC2626',
  INFO:     '#1D4ED8',
  CONSIGNE: '#D97706',
};

const FOND_NON_LU_PAR_TYPE: Record<string, string> = {
  ALERTE:   'rgba(220,38,38,0.10)',
  INFO:     'rgba(29,78,216,0.10)',
  CONSIGNE: 'rgba(217,119,6,0.10)',
};

const LIBELLE_PAR_TYPE: Record<string, string> = {
  ALERTE:   'Alerte',
  INFO:     'Info',
  CONSIGNE: 'Consigne',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateAujourdhui(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formaterHeure(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ─── Composant LigneBroadcast ─────────────────────────────────────────────────

interface LigneBroadcastProps {
  message: BroadcastRecu;
}

function LigneBroadcast({ message }: LigneBroadcastProps): React.JSX.Element {
  const couleur = COULEUR_PAR_TYPE[message.type] ?? Colors.infoFonce;
  const fondNonLu = FOND_NON_LU_PAR_TYPE[message.type] ?? 'rgba(0,0,0,0.05)';
  const libelleType = LIBELLE_PAR_TYPE[message.type] ?? message.type;

  return (
    <View
      testID={`message-${message.broadcastMessageId}`}
      style={[
        styles.ligne,
        !message.vu && { backgroundColor: fondNonLu },
      ]}
    >
      {/* En-tête : badge type + heure */}
      <View style={styles.ligneEntete}>
        <View style={[styles.badge, { backgroundColor: couleur }]}>
          <Text style={styles.badgeTexte}>{libelleType.toUpperCase()}</Text>
        </View>
        <Text style={styles.heure}>{formaterHeure(message.horodatageEnvoi)}</Text>
      </View>

      {/* Texte tronqué */}
      <Text style={styles.texte} numberOfLines={2}>
        {message.texte}
      </Text>

      {/* Expéditeur */}
      <Text style={styles.expediteur}>De : {message.superviseurId}</Text>
    </View>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export interface MessagesSuperviseursScreenProps {
  onRetour: () => void;
}

export function MessagesSuperviseursScreen({
  onRetour,
}: MessagesSuperviseursScreenProps): React.JSX.Element {
  const [messages, setMessages] = useState<BroadcastRecu[]>([]);
  const [chargement, setChargement] = useState(true);
  const [horsConnexion, setHorsConnexion] = useState(false);

  // Bouton retour Android natif
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      onRetour();
      return true;
    });
    return () => handler.remove();
  }, [onRetour]);

  const chargerEtAcquitter = useCallback(async () => {
    setChargement(true);
    setHorsConnexion(false);

    try {
      const date = dateAujourdhui();
      const mockHeaders: Record<string, string> =
        process.env.EXPO_PUBLIC_ENV === 'recette'
          ? { 'X-Mock-Role': 'ROLE_LIVREUR', 'X-Mock-Id': 'livreur-002' }
          : {};

      const reponse = await fetch(
        `${BASE_URL}/api/supervision/broadcasts/recus?date=${date}`,
        { headers: { 'Content-Type': 'application/json', ...mockHeaders } }
      );

      if (!reponse.ok) {
        throw new Error(`HTTP ${reponse.status}`);
      }

      const liste: BroadcastRecu[] = await reponse.json();
      setMessages(liste);

      // Acquitter en parallèle tous les messages non lus — erreurs silencieuses
      const nonLus = liste.filter((m) => !m.vu);
      await Promise.allSettled(
        nonLus.map((m) =>
          fetch(
            `${BASE_URL}/api/supervision/broadcasts/${m.broadcastMessageId}/vu`,
            { method: 'POST', headers: mockHeaders }
          )
        )
      );
    } catch {
      setHorsConnexion(true);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerEtAcquitter();
  }, [chargerEtAcquitter]);

  return (
    <View style={styles.container} testID="messages-superviseurs-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          testID="btn-retour-messages"
          onPress={onRetour}
          style={styles.boutonRetour}
          accessibilityRole="button"
          accessibilityLabel="Retour à la liste des colis"
        >
          <Text style={styles.boutonRetourTexte}>{'< Retour'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitre}>Messages superviseur</Text>
      </View>

      {/* Bandeau hors connexion */}
      {horsConnexion && (
        <View style={styles.bandeauOffline} testID="bandeau-offline-messages">
          <Text style={styles.bandeauOfflineTexte}>Hors connexion</Text>
        </View>
      )}

      {/* Contenu */}
      {chargement ? (
        <View style={styles.centre} testID="messages-chargement">
          <ActivityIndicator size="large" color={Colors.primaire} />
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.centre} testID="messages-vide">
          <Text style={styles.videTexte}>
            Votre superviseur n'a pas envoyé de message aujourd'hui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.broadcastMessageId}
          renderItem={({ item }) => <LigneBroadcast message={item} />}
          contentContainerStyle={styles.liste}
          testID="liste-messages"
        />
      )}
    </View>
  );
}

export default MessagesSuperviseursScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.fondNeutre,
  },
  header: {
    height: 64,
    backgroundColor: Colors.primaire,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  boutonRetour: {
    minHeight: 48,
    justifyContent: 'center',
    paddingRight: 8,
  },
  boutonRetourTexte: {
    color: Colors.texteInverse,
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitre: {
    color: Colors.texteInverse,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  bandeauOffline: {
    backgroundColor: '#b45309',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bandeauOfflineTexte: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  videTexte: {
    fontSize: 15,
    color: Colors.texteSecondaire,
    textAlign: 'center',
    lineHeight: 22,
  },
  liste: {
    padding: 12,
  },
  ligne: {
    backgroundColor: Colors.surfacePrimary,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  ligneEntete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeTexte: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heure: {
    fontSize: 12,
    color: Colors.texteTertiaire,
    fontWeight: '500',
  },
  texte: {
    fontSize: 14,
    color: Colors.textePrimaire,
    lineHeight: 20,
    marginBottom: 4,
  },
  expediteur: {
    fontSize: 12,
    color: Colors.texteSecondaire,
    fontStyle: 'italic',
  },
});
