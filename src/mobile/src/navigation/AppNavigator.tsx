/**
 * AppNavigator — Navigation Stack principale de l'application mobile DocuPost Livreur
 *
 * US-055 : Migration vers react-navigation Stack.
 *
 * Architecture :
 *  - Un Stack.Navigator racine gère toutes les routes de l'application.
 *  - La route initiale est déterminée par l'état d'authentification (authStore).
 *  - Le bouton retour Android natif est supporté sur toutes les transitions.
 *
 * Routes :
 *  - Connexion         → ConnexionScreen (M-01)
 *  - ListeColis        → ListeColisScreen (M-02)
 *  - DetailColis       → DetailColisScreen (M-03) — params: tourneeId, colisId
 *  - CapturePreuve     → CapturePreuveScreen (M-04) — params: tourneeId, colisId, destinataireNom
 *  - DeclarerEchec     → DeclarerEchecScreen (M-05) — params: tourneeId, colisId, destinataireNom
 *  - Recapitulatif     → RecapitulatifTourneeScreen (M-07) — params: tourneeId
 *  - MesConsignes      → MesConsignesScreen (M-08)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ConnexionScreen } from '../screens/ConnexionScreen';
import { ListeColisScreen } from '../screens/ListeColisScreen';
import { DetailColisScreen } from '../screens/DetailColisScreen';
import { CapturePreuveScreen } from '../screens/CapturePreuveScreen';
import { DeclarerEchecScreen } from '../screens/DeclarerEchecScreen';
import { RecapitulatifTourneeScreen } from '../screens/RecapitulatifTourneeScreen';
import { MesConsignesScreen } from '../screens/MesConsignesScreen';

// ─── Types des paramètres de routes ──────────────────────────────────────────

export type AppStackParamList = {
  Connexion: undefined;
  ListeColis: undefined;
  DetailColis: {
    tourneeId: string;
    colisId: string;
  };
  CapturePreuve: {
    tourneeId: string;
    colisId: string;
    destinataireNom: string;
  };
  DeclarerEchec: {
    tourneeId: string;
    colisId: string;
    destinataireNom: string;
  };
  Recapitulatif: {
    tourneeId: string;
  };
  MesConsignes: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

// ─── Composant ────────────────────────────────────────────────────────────────

interface AppNavigatorProps {
  /** Route initiale selon l'état d'authentification */
  ecranInitial: keyof AppStackParamList;
}

export function AppNavigator({ ecranInitial }: AppNavigatorProps): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName={ecranInitial}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Connexion" component={ConnexionScreen as React.ComponentType} />
      <Stack.Screen name="ListeColis" component={ListeColisScreen} />
      <Stack.Screen name="DetailColis" component={DetailColisScreen as React.ComponentType} />
      <Stack.Screen name="CapturePreuve" component={CapturePreuveScreen as React.ComponentType} />
      <Stack.Screen name="DeclarerEchec" component={DeclarerEchecScreen as React.ComponentType} />
      <Stack.Screen name="Recapitulatif" component={RecapitulatifTourneeScreen as React.ComponentType} />
      <Stack.Screen name="MesConsignes" component={MesConsignesScreen as React.ComponentType} />
    </Stack.Navigator>
  );
}
