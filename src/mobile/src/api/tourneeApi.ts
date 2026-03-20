import { TourneeDTO } from './tourneeTypes';

/**
 * Client API — Tournee
 *
 * Appelle le backend svc-tournee : GET /api/tournees/today
 * Le JWT est inclus dans les headers Authorization par l'intercepteur HTTP
 * (a implementer dans US-019 avec react-native-app-auth).
 *
 * En profil dev, le MockJwtAuthFilter backend n'a pas besoin de token.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8081';

/**
 * Recupere la tournee du jour pour le livreur authentifie.
 * Throws en cas d'erreur reseau ou HTTP non-2xx.
 */
export async function getTourneeAujourdhui(): Promise<TourneeDTO> {
  const response = await fetch(`${API_BASE_URL}/api/tournees/today`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // TODO (US-019) : ajouter Authorization: `Bearer ${token}` depuis le store auth
    },
  });

  if (response.status === 404) {
    throw new TourneeNonTrouveeError('Aucune tournee assignee pour aujourd\'hui');
  }

  if (!response.ok) {
    throw new Error(`Erreur serveur : ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<TourneeDTO>;
}

/**
 * Erreur metier : aucune tournee assignee a ce livreur pour aujourd'hui.
 * Correspond au Scenario 3 de la US-001.
 */
export class TourneeNonTrouveeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TourneeNonTrouveeError';
  }
}
