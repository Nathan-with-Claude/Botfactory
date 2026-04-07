/**
 * authStoreInstance — Singleton authStore partagé entre App.tsx et les modules API.
 *
 * Ce fichier centralise la création du store pour éviter les imports circulaires :
 *   App.tsx          importe authStoreInstance (pas de createAuthStore direct)
 *   tourneeApi.ts    importe authStoreInstance pour injecter le header Authorization
 *
 * En dev : utilise devAuthOptions (fake JWT, pas de Keycloak requis).
 * TODO Sprint 7 : remplacer devAuthOptions par prodAuthOptions quand Keycloak est provisionné.
 */

import { createAuthStore } from './authStore';
import { devAuthOptions } from './devAuthOptions';

export const authStore = createAuthStore(devAuthOptions);
