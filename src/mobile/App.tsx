/**
 * App.tsx — Point d'entrée de l'application mobile DocuPost Livreur
 *
 * US-047 : Branchement de ConnexionScreen comme écran d'intro.
 *   - En mode __DEV__ : sélecteur de compte livreur (DEV_LIVREURS) affiché dans ConnexionScreen.
 *   - En mode prod : SSO uniquement (devLivreurs=undefined → bloc dev absent).
 *
 * US-055 : Migration vers react-navigation Stack.
 *   - NavigationContainer + Stack.Navigator pour les routes de premier niveau.
 *   - Connexion → ListeColis géré par react-navigation (bouton retour Android natif).
 *   - Les sous-écrans de ListeColisScreen (détail, échec, preuve, récap, consignes)
 *     sont définis dans AppNavigator.tsx mais restent gérés par useState interne
 *     (migration complète R2 — voir journal-developpeur.md décision 2026-04-04).
 *   - L'authStore contrôle toujours quel écran est initial via son statut.
 *
 * Note architecturale (R2 TODO) :
 *   ConnexionScreen a des props (loginFn, status, error, devLivreurs) qui ne peuvent pas
 *   être transmises via Stack.Screen component=. Elles sont passées via render callback.
 *   Refactoriser vers un AuthProvider + useNavigation() côté ConnexionScreen lors de R2.
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ConnexionScreen } from './src/screens/ConnexionScreen';
import { ListeColisScreen } from './src/screens/ListeColisScreen';
import { authStore } from './src/store/authStoreInstance';
import { setDevLivreurId } from './src/store/devAuthOptions';
import { DEV_LIVREURS } from './src/constants/devLivreurs';
import type { AuthState } from './src/store/authStore';
import type { AppStackParamList } from './src/navigation/AppNavigator';

// ─── Stack Navigator ──────────────────────────────────────────────────────────
// Utilise AppStackParamList (défini dans AppNavigator) pour la cohérence de typage

export type RootStackParamList = AppStackParamList;

const Stack = createStackNavigator<RootStackParamList>();

// ─── Composant racine ─────────────────────────────────────────────────────────

export default function App() {
  const [authState, setAuthState] = useState<AuthState>(authStore.getState());

  useEffect(() => {
    // Abonnement au store — retourne la fonction de désabonnement
    return authStore.subscribe(() => {
      setAuthState(authStore.getState());
    });
  }, []);

  const handleDevLivreurSelected = (livreurId: string) => {
    setDevLivreurId(livreurId);
    void authStore.login();
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authState.status === 'authenticated' ? (
          /* ListeColisScreen : gère ses sous-écrans via useState (R2 : migrer vers Stack) */
          <Stack.Screen name="ListeColis" component={ListeColisScreen} />
        ) : (
          /* ConnexionScreen : props injectées via render callback (auth + dev mode) */
          <Stack.Screen name="Connexion">
            {() => (
              <ConnexionScreen
                onLoginSuccess={() => void authStore.login()}
                loginFn={() => void authStore.login()}
                status={authState.status}
                error={authState.error}
                devLivreurs={__DEV__ ? DEV_LIVREURS : undefined}
                onDevLivreurSelected={__DEV__ ? handleDevLivreurSelected : undefined}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
