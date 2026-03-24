import { ColisDTO, DeclarerEchecRequest, RecapitulatifTourneeDTO, TourneeDTO } from './tourneeTypes';

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
 * Recupere le detail complet d'un colis dans une tournee (US-004 — ecran M-03).
 *
 * @param tourneeId identifiant de la tournee
 * @param colisId   identifiant du colis
 * @returns ColisDTO avec adresse complete, destinataire, contraintes et statut
 * @throws ColisNonTrouveError si le colis n'existe pas dans la tournee (404)
 */
export async function getDetailColis(
  tourneeId: string,
  colisId: string
): Promise<ColisDTO> {
  const response = await fetch(
    `${API_BASE_URL}/api/tournees/${encodeURIComponent(tourneeId)}/colis/${encodeURIComponent(colisId)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // TODO (US-019) : ajouter Authorization: `Bearer ${token}` depuis le store auth
      },
    }
  );

  if (response.status === 404) {
    throw new ColisNonTrouveError(
      `Colis '${colisId}' introuvable dans la tournee '${tourneeId}'`
    );
  }

  if (!response.ok) {
    throw new Error(`Erreur serveur : ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<ColisDTO>;
}

/**
 * Déclare un échec de livraison pour un colis (US-005 — écran M-05).
 *
 * @param tourneeId identifiant de la tournée
 * @param colisId   identifiant du colis
 * @param request   motif normalisé, disposition, et note optionnelle
 * @returns ColisDTO mis à jour avec statut ECHEC, motif et disposition
 * @throws EchecDejaDeClareError si le colis est déjà en ECHEC (409)
 * @throws ColisNonTrouveError si le colis n'existe pas dans la tournée (404)
 */
export async function declarerEchecLivraison(
  tourneeId: string,
  colisId: string,
  request: DeclarerEchecRequest
): Promise<ColisDTO> {
  const response = await fetch(
    `${API_BASE_URL}/api/tournees/${encodeURIComponent(tourneeId)}/colis/${encodeURIComponent(colisId)}/echec`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // TODO (US-019) : ajouter Authorization: `Bearer ${token}` depuis le store auth
      },
      body: JSON.stringify(request),
    }
  );

  if (response.status === 404) {
    throw new ColisNonTrouveError(
      `Colis '${colisId}' introuvable dans la tournée '${tourneeId}'`
    );
  }

  if (response.status === 409) {
    throw new EchecDejaDeClareError(
      `L'échec a déjà été déclaré pour le colis '${colisId}'`
    );
  }

  if (!response.ok) {
    throw new Error(`Erreur serveur : ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<ColisDTO>;
}

/**
 * Cloture la tournee du livreur (US-007 — POST /api/tournees/{tourneeId}/cloture).
 *
 * @param tourneeId identifiant de la tournee a cloturer
 * @returns RecapitulatifTourneeDTO avec les compteurs de livraison
 * @throws ColisEncoreALivrerError si des colis sont encore en statut "a livrer" (409)
 * @throws TourneeNonTrouveeError si la tournee n'existe pas (404)
 */
export async function cloturerTournee(tourneeId: string): Promise<RecapitulatifTourneeDTO> {
  const response = await fetch(
    `${API_BASE_URL}/api/tournees/${encodeURIComponent(tourneeId)}/cloture`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // TODO (US-019) : ajouter Authorization: `Bearer ${token}` depuis le store auth
      },
    }
  );

  if (response.status === 404) {
    throw new TourneeNonTrouveeError(`Tournee '${tourneeId}' introuvable`);
  }

  if (response.status === 409) {
    throw new ColisEncoreALivrerError(
      'Certains colis sont encore en statut "a livrer". La cloture est bloquee.'
    );
  }

  if (!response.ok) {
    throw new Error(`Erreur serveur : ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<RecapitulatifTourneeDTO>;
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

/**
 * Erreur metier : colis introuvable dans la tournee.
 * Correspond au cas 404 de US-004.
 */
export class ColisNonTrouveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ColisNonTrouveError';
  }
}

/**
 * Erreur metier : échec déjà déclaré pour ce colis (US-005).
 * Correspond au cas 409 — invariant Tournée (#5).
 */
export class EchecDejaDeClareError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EchecDejaDeClareError';
  }
}

/**
 * Erreur metier : des colis sont encore en statut "a livrer" — cloture bloquee (US-007).
 * Correspond au cas 409 de POST /api/tournees/{tourneeId}/cloture.
 */
export class ColisEncoreALivrerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ColisEncoreALivrerError';
  }
}
