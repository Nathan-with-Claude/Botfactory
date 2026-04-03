/**
 * ConnexionScreen — Écran M-01 (US-019 + US-036)
 *
 * Point d'entrée de l'application mobile.
 * Présente le bouton de connexion via SSO corporate Docaposte (OAuth2 PKCE).
 *
 * US-036 : Card SSO rétractable après la première connexion.
 *  - Première ouverture : card "Comment ça fonctionne ?" visible.
 *  - Après la première connexion réussie : hasConnectedOnce=true stocké en AsyncStorage.
 *  - Ouvertures suivantes : card repliée par défaut.
 *  - Un chevron permet de la déplier/replier manuellement à tout moment.
 *  - La préférence (dépliée/repliée) est persistée en clé cardSsoOuverte.
 *
 * US-043 : Card SSO rétractable AVANT connexion (session courante seulement).
 *  - Le toggle est disponible dès la première ouverture, avant toute connexion.
 *  - Repliage avant connexion : state local uniquement, SANS écriture AsyncStorage.
 *  - Repliage après connexion (hasConnectedOnce=true) : persisté comme US-036.
 *
 * Props injectables pour les tests (pattern DI via props).
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthStatus } from '../store/authStore';

// ─── Clés AsyncStorage ────────────────────────────────────────────────────────

const KEY_HAS_CONNECTED_ONCE = 'hasConnectedOnce';
const KEY_CARD_SSO_OUVERTE = 'cardSsoOuverte';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ConnexionScreenProps {
  /** Appelée quand le statut passe à "authenticated" (navigation vers M-02) */
  onLoginSuccess: () => void;
  /** Fonction qui déclenche le flux OAuth2 PKCE */
  loginFn: () => void | Promise<void>;
  /** Statut courant du store d'auth */
  status: AuthStatus;
  /** Message d'erreur à afficher (null si pas d'erreur) */
  error: string | null;
}

// ─── Composant ───────────────────────────────────────────────────────────────

export function ConnexionScreen({
  onLoginSuccess,
  loginFn,
  status,
  error,
}: ConnexionScreenProps): React.JSX.Element {

  // US-036 — état de la card SSO : null = non encore chargé depuis AsyncStorage
  const [cardOuverte, setCardOuverte] = useState<boolean | null>(null);
  // US-043 — indique si l'utilisateur s'est déjà connecté au moins une fois
  // Permet de décider si le toggle doit persister en AsyncStorage ou non
  const [dejaConnecte, setDejaConnecte] = useState<boolean>(false);

  // US-036 — Chargement initial des préférences depuis AsyncStorage
  useEffect(() => {
    const chargerPreferences = async () => {
      const [valeurConnecte, valeurCard] = await Promise.all([
        AsyncStorage.getItem(KEY_HAS_CONNECTED_ONCE),
        AsyncStorage.getItem(KEY_CARD_SSO_OUVERTE),
      ]);

      const estDejaConnecte = valeurConnecte === 'true';
      setDejaConnecte(estDejaConnecte);

      if (valeurCard !== null) {
        // Restaurer la préférence explicite de l'utilisateur
        setCardOuverte(valeurCard === 'true');
      } else {
        // Comportement par défaut : card ouverte à la première connexion, repliée ensuite
        setCardOuverte(!estDejaConnecte);
      }
    };

    void chargerPreferences();
  }, []);

  // SC1 — Redirection automatique après authentification réussie
  useEffect(() => {
    if (status === 'authenticated') {
      onLoginSuccess();
      // US-036 — Écrire hasConnectedOnce = true uniquement si pas encore positionné
      const marquerPremierConnexion = async () => {
        const valeur = await AsyncStorage.getItem(KEY_HAS_CONNECTED_ONCE);
        if (valeur !== 'true') {
          await AsyncStorage.setItem(KEY_HAS_CONNECTED_ONCE, 'true');
        }
      };
      void marquerPremierConnexion();
    }
  }, [status, onLoginSuccess]);

  // US-036/US-043 — Toggle de la card SSO
  // - Si l'utilisateur s'est déjà connecté (dejaConnecte=true) : persist en AsyncStorage (US-036)
  // - Sinon (avant première connexion) : state local uniquement, sans écriture AsyncStorage (US-043)
  const toggleCard = async () => {
    const nouvelEtat = !cardOuverte;
    setCardOuverte(nouvelEtat);
    if (dejaConnecte) {
      await AsyncStorage.setItem(KEY_CARD_SSO_OUVERTE, String(nouvelEtat));
    }
  };

  const isLoading = status === 'loading';

  // Tant que les préférences ne sont pas chargées, on détermine un état par défaut
  // (card ouverte) pour ne pas bloquer l'affichage
  const cardEstOuverte = cardOuverte !== null ? cardOuverte : true;

  return (
    <View testID="screen-connexion" style={styles.container}>
      {/* Logo / Titre */}
      <View style={styles.header}>
        <Text style={styles.titre}>DocuPost</Text>
        <Text style={styles.sousTitre}>Application Livreur</Text>
      </View>

      {/* US-036 — Card SSO rétractable */}
      <View testID="card-sso-info" style={styles.cardSso}>
        {/* Header de la card : toujours visible */}
        <TouchableOpacity
          testID="btn-toggle-card-sso"
          style={styles.cardSsoHeader}
          onPress={() => void toggleCard()}
          accessibilityRole="button"
          accessibilityLabel={cardEstOuverte ? 'Replier l\'aide connexion' : 'Déplier l\'aide connexion'}
        >
          <Text testID="card-sso-header" style={styles.cardSsoTitre}>
            Comment ça fonctionne ?
          </Text>
          <Text style={styles.cardSsoChevron}>{cardEstOuverte ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {/* Contenu de la card : affiché uniquement si ouverte */}
        {cardEstOuverte && (
          <View testID="card-sso-contenu" style={styles.cardSsoContenu}>
            <Text style={styles.cardSsoTexte}>
              Appuyez sur le bouton ci-dessous pour vous connecter avec votre compte Docaposte.
            </Text>
            <Text style={styles.cardSsoTexte}>
              Vous serez redirigé vers la page de connexion sécurisée (SSO corporate).
            </Text>
          </View>
        )}
      </View>

      {/* Zone principale */}
      <View style={styles.corps}>
        {isLoading ? (
          // SC1 — Spinner pendant le flux SSO
          <ActivityIndicator
            testID="spinner-connexion"
            size="large"
            color="#005B96"
          />
        ) : (
          <>
            {/* SC2 — Message d'erreur */}
            {status === 'error' && error && (
              <View testID="msg-erreur-connexion" style={styles.erreurContainer}>
                <Text style={styles.erreurTexte}>{error}</Text>
                <TouchableOpacity
                  testID="btn-reessayer"
                  style={styles.btnSecondaire}
                  onPress={() => void loginFn()}
                  accessibilityRole="button"
                  accessibilityLabel="Réessayer la connexion"
                >
                  <Text style={styles.btnSecondaireTexte}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* SC1 — Bouton principal de connexion SSO (L2 : libellé raccourci) */}
            <TouchableOpacity
              testID="btn-connexion-sso"
              style={styles.btnPrincipal}
              onPress={() => void loginFn()}
              accessibilityRole="button"
              accessibilityLabel="Connexion Docaposte"
            >
              <Text style={styles.btnPrincipalTexte}>
                Connexion Docaposte
              </Text>
            </TouchableOpacity>

            <Text style={styles.infoSecu}>
              Connexion sécurisée via le SSO corporate Docaposte
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titre: {
    fontSize: 36,
    fontWeight: '700',
    color: '#005B96',
    letterSpacing: 1,
  },
  sousTitre: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  // ── Card SSO ────────────────────────────────────────────────────────────────
  cardSso: {
    width: '100%',
    backgroundColor: '#EBF4FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#005B96',
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardSsoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  cardSsoTitre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#005B96',
  },
  cardSsoChevron: {
    fontSize: 12,
    color: '#005B96',
  },
  cardSsoContenu: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  cardSsoTexte: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  // ── Zone principale ─────────────────────────────────────────────────────────
  corps: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  erreurContainer: {
    width: '100%',
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  erreurTexte: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  btnPrincipal: {
    width: '100%',
    backgroundColor: '#005B96',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrincipalTexte: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  btnSecondaire: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#856404',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  btnSecondaireTexte: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
  },
  infoSecu: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});
