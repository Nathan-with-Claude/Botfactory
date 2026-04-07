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
 * Design : Material Design 3 — palette designer (/livrables/02-ux/design_mobile_designer.md)
 *
 * Props injectables pour les tests (pattern DI via props).
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthStatus } from '../store/authStore';
import type { DevLivreur } from '../constants/devLivreurs';
import { Colors } from '../theme/colors';
import { Theme } from '../theme/theme';

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
  /**
   * US-047 — Liste des livreurs dev à afficher en mode __DEV__.
   * Si absent (undefined) ou vide, le bloc dev n'est pas affiché.
   */
  devLivreurs?: DevLivreur[];
  /**
   * US-047 — Callback déclenché quand l'utilisateur sélectionne un compte dev.
   * Reçoit le livreurId choisi.
   */
  onDevLivreurSelected?: (livreurId: string) => void;
}

// ─── Composant ───────────────────────────────────────────────────────────────

export function ConnexionScreen({
  onLoginSuccess,
  loginFn,
  status,
  error,
  devLivreurs,
  onDevLivreurSelected,
}: ConnexionScreenProps): React.JSX.Element {

  // US-036 — état de la card SSO : null = non encore chargé depuis AsyncStorage
  const [cardOuverte, setCardOuverte] = useState<boolean | null>(null);
  // US-043 — indique si l'utilisateur s'est déjà connecté au moins une fois
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
        setCardOuverte(valeurCard === 'true');
      } else {
        setCardOuverte(!estDejaConnecte);
      }
    };

    void chargerPreferences();
  }, []);

  // SC1 — Redirection automatique après authentification réussie
  useEffect(() => {
    if (status === 'authenticated') {
      onLoginSuccess();
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
  const toggleCard = async () => {
    const nouvelEtat = !cardOuverte;
    setCardOuverte(nouvelEtat);
    if (dejaConnecte) {
      await AsyncStorage.setItem(KEY_CARD_SSO_OUVERTE, String(nouvelEtat));
    }
  };

  const isLoading = status === 'loading';
  const cardEstOuverte = cardOuverte !== null ? cardOuverte : true;

  return (
    <ScrollView
      testID="screen-connexion"
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Zone logo + titre */}
      <View style={styles.logoZone}>
        {/* Logo carré gradient tactique */}
        <View style={styles.logoBox}>
          <Text style={styles.logoIcone}>📄</Text>
        </View>
        <Text style={styles.titre}>DocuPost</Text>
        <Text style={styles.sousTitre}>Votre outil de tournée</Text>
      </View>

      {/* US-036 — Card SSO rétractable (info style designer) */}
      <View testID="card-sso-info" style={styles.cardSso}>
        {/* Header de la card : toujours visible */}
        <TouchableOpacity
          testID="btn-toggle-card-sso"
          style={styles.cardSsoHeader}
          onPress={() => void toggleCard()}
          accessibilityRole="button"
          accessibilityLabel={cardEstOuverte ? 'Replier l\'aide connexion' : 'Déplier l\'aide connexion'}
        >
          <View style={styles.cardSsoHeaderLeft}>
            <Text style={styles.cardSsoIconeInfo}>ℹ</Text>
            <Text testID="card-sso-header" style={styles.cardSsoTitre}>
              Comment ça fonctionne ?
            </Text>
          </View>
          <Text style={styles.cardSsoChevron}>{cardEstOuverte ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {/* Contenu de la card : affiché uniquement si ouverte */}
        {cardEstOuverte && (
          <View testID="card-sso-contenu" style={styles.cardSsoContenu}>
            <Text style={styles.cardSsoTexte}>
              Utilisez vos identifiants professionnels pour accéder à votre itinéraire et scanner vos colis en toute sécurité.
            </Text>
          </View>
        )}
      </View>

      {/* US-047 — Sélecteur de compte livreur en mode développement */}
      {devLivreurs && devLivreurs.length > 0 && (
        <View testID="section-dev-mode" style={styles.devSection}>
          <Text style={styles.devTitre}>MODE DEV</Text>
          <Text style={styles.devSousTitre}>Choisir un compte livreur :</Text>
          {devLivreurs.map((livreur) => (
            <TouchableOpacity
              key={livreur.id}
              testID={`btn-dev-livreur-${livreur.id}`}
              style={styles.btnDevLivreur}
              onPress={() => onDevLivreurSelected?.(livreur.id)}
              accessibilityRole="button"
              accessibilityLabel={`Se connecter en tant que ${livreur.prenom} ${livreur.nom}`}
            >
              <Text style={styles.btnDevLivreurNom}>{livreur.prenom} {livreur.nom}</Text>
              <Text style={styles.btnDevLivreurId}>{livreur.id}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Zone principale */}
      <View style={styles.corps}>
        {isLoading ? (
          // SC1 — Spinner pendant le flux SSO
          <ActivityIndicator
            testID="spinner-connexion"
            size="large"
            color={Colors.primary}
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

            {/* SC1 — Bouton principal de connexion SSO — gradient tactique */}
            <View style={styles.btnPrincipalWrapper}>
              <TouchableOpacity
                testID="btn-connexion-sso"
                style={styles.btnPrincipal}
                onPress={() => void loginFn()}
                accessibilityRole="button"
                accessibilityLabel="Connexion Docaposte"
              >
                <Text style={styles.btnPrincipalIcone}>🔑</Text>
                <Text style={styles.btnPrincipalTexte}>
                  Se connecter via compte Docaposte
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.infoSecu}>
              Connexion sécurisée via le SSO corporate Docaposte
            </Text>
          </>
        )}
      </View>

      {/* Footer version */}
      <Text style={styles.footer}>v 2.0.0 — Docaposte</Text>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  // ── Logo zone ───────────────────────────────────────────────────────────────
  logoZone: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primary,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
    ...Theme.shadow.md,
  },
  logoIcone: {
    fontSize: 40,
  },
  titre: {
    fontSize: Theme.fontSize.display,
    fontWeight: Theme.fontWeight.black,
    color: Colors.primary,
    letterSpacing: -1,
  },
  sousTitre: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  // ── Card SSO (info style designer) ─────────────────────────────────────────
  cardSso: {
    width: '100%',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: Theme.spacing.md,
    overflow: 'hidden',
  },
  cardSsoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  cardSsoHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardSsoIconeInfo: {
    fontSize: 16,
    color: Colors.primary,
  },
  cardSsoTitre: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.onSurface,
  },
  cardSsoChevron: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  cardSsoContenu: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  cardSsoTexte: {
    fontSize: Theme.fontSize.sm,
    color: Colors.onSurfaceVariant,
    fontWeight: Theme.fontWeight.medium,
    lineHeight: 20,
  },
  // ── Zone principale ─────────────────────────────────────────────────────────
  corps: {
    width: '100%',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  erreurContainer: {
    width: '100%',
    backgroundColor: Colors.errorContainer,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  erreurTexte: {
    color: Colors.onErrorContainer,
    fontSize: Theme.fontSize.sm,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: Theme.fontWeight.medium,
  },
  // Wrapper outer card (outlineVariant border) + bouton gradient tactique
  btnPrincipalWrapper: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Theme.borderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    ...Theme.shadow.sm,
  },
  btnPrincipal: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...Theme.shadow.md,
  },
  btnPrincipalIcone: {
    fontSize: 20,
  },
  btnPrincipalTexte: {
    color: Colors.onPrimary,
    fontSize: Theme.fontSize.body,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 0.5,
  },
  btnSecondaire: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.onErrorContainer,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 24,
    minHeight: Theme.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaireTexte: {
    color: Colors.onErrorContainer,
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
  },
  infoSecu: {
    fontSize: Theme.fontSize.xs,
    color: Colors.outline,
    textAlign: 'center',
    marginTop: 4,
  },
  // ── Section dev-mode (US-047) ─────────────────────────────────────────────
  devSection: {
    width: '100%',
    backgroundColor: Colors.avertissementLeger,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.avertissement,
    padding: 12,
    marginBottom: Theme.spacing.md,
    gap: 8,
  },
  devTitre: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.avertissementFonce,
    textAlign: 'center',
    letterSpacing: 1,
  },
  devSousTitre: {
    fontSize: 12,
    color: Colors.avertissementFonce,
    textAlign: 'center',
    marginBottom: 4,
  },
  btnDevLivreur: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.avertissement,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: Theme.touchTarget.minHeight,
  },
  btnDevLivreurNom: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.avertissementFonce,
  },
  btnDevLivreurId: {
    fontSize: 11,
    color: Colors.avertissement,
    fontFamily: 'monospace',
  },
  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: Theme.spacing.md,
    fontSize: 12,
    fontWeight: Theme.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.outline,
  },
});
