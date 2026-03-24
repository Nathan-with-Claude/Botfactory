/**
 * ConnexionScreen — Écran M-01 (US-019)
 *
 * Point d'entrée de l'application mobile.
 * Présente le bouton de connexion via SSO corporate Docaposte (OAuth2 PKCE).
 *
 * Props injectables pour les tests (pattern DI via props).
 */

import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { AuthStatus } from '../store/authStore';

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

  // SC1 — Redirection automatique après authentification réussie
  useEffect(() => {
    if (status === 'authenticated') {
      onLoginSuccess();
    }
  }, [status, onLoginSuccess]);

  const isLoading = status === 'loading';

  return (
    <View testID="screen-connexion" style={styles.container}>
      {/* Logo / Titre */}
      <View style={styles.header}>
        <Text style={styles.titre}>DocuPost</Text>
        <Text style={styles.sousTitre}>Application Livreur</Text>
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

            {/* SC1 — Bouton principal de connexion SSO */}
            <TouchableOpacity
              testID="btn-connexion-sso"
              style={styles.btnPrincipal}
              onPress={() => void loginFn()}
              accessibilityRole="button"
              accessibilityLabel="Se connecter via compte Docaposte"
            >
              <Text style={styles.btnPrincipalTexte}>
                Se connecter via compte Docaposte
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
    marginBottom: 48,
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
