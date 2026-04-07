/**
 * syncExecutor — Application Layer (US-006)
 *
 * Convertit les commandes offline en appels API réels et les soumet au backend.
 * Chaque appel injecte le header X-Command-Id pour l'idempotence côté serveur.
 *
 * Le syncExecutor est une CommandExecutor injectable dans createOfflineQueue().
 */

import type { OfflineCommand, CommandType, SyncResult } from '../domain/offlineQueue';
import type { AuthStore } from './httpClientTypes';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8081';

export interface SyncExecutorOptions {
  authStore?: AuthStore;
  fetchFn?: typeof fetch;
  /**
   * US-059 : callback appelé quand une photo dépasse 1 Mo avant envoi.
   * Permet d'afficher un message d'erreur visible à l'utilisateur
   * (toast, alerte, state dans l'écran appelant).
   * Si non fourni, seul un console.error est émis.
   */
  onPhotoTooLarge?: (commandId: string, sizeKo: number) => void;
}

/**
 * Crée un exécuteur de commandes offline.
 * Chaque commande est transformée en requête HTTP avec le X-Command-Id.
 */
export function createSyncExecutor(options: SyncExecutorOptions = {}) {
  const { fetchFn = fetch, onPhotoTooLarge } = options;
  const { authStore } = options;

  async function execute(cmd: OfflineCommand): Promise<SyncResult> {
    const authHeaders = authStore ? authStore.getAuthHeader() : {};

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // SC3 — commandId transmis pour l'idempotence backend
      'X-Command-Id': cmd.commandId,
      ...authHeaders,
    };

    let url: string;
    let body: string;

    // Routage selon le type de commande
    if (cmd.type === 'CONFIRMER_LIVRAISON') {
      const payload = cmd.payload as { tourneeId: string; colisId: string; typePreuve: string; signatureData?: string; nomSignataire?: string; nomTiers?: string; descriptionLieu?: string; photoData?: string };
      url = `${API_BASE_URL}/api/tournees/${encodeURIComponent(payload.tourneeId)}/colis/${encodeURIComponent(payload.colisId)}/livraison`;

      // US-059 : vérification de la taille de la photo avant envoi.
      // Option MVP choisie par le PO : augmenter la limite Spring Boot (5MB/10MB).
      // Seuil d'avertissement : 500 Ko (~667 000 chars base64).
      // Seuil bloquant (erreur utilisateur) : 1 Mo (~1 334 000 chars base64).
      //
      // TODO R2 — US-059 : migrer vers upload multipart deux étapes
      // Étape 1 : POST /api/tournees/{id}/colis/{colisId}/preuve (multipart) → preuveId
      // Étape 2 : POST /api/tournees/{id}/colis/{colisId}/livraison avec preuveId
      // Lib suggérée : react-native-image-compressor (à ajouter en package.json R2)
      const MAX_WARN_BASE64_CHARS = 667_000;   // ~500 Ko de données binaires
      const MAX_ERROR_BASE64_CHARS = 1_334_000; // ~1 Mo de données binaires
      if (payload.photoData && payload.photoData.length > MAX_ERROR_BASE64_CHARS) {
        const sizeKo = Math.round(payload.photoData.length / 1024);
        console.error(
          `[syncExecutor] US-059 : photoData dépasse 1 Mo (${sizeKo} Ko base64). ` +
          'Envoi bloqué — risque de 413 Request Entity Too Large. TODO R2 : migrer vers multipart.'
        );
        if (onPhotoTooLarge) {
          onPhotoTooLarge(cmd.commandId, sizeKo);
        }
        // On retire la commande de la file (résultat non-succès sans bloquer le reste)
        return { success: false, status: 413 };
      } else if (payload.photoData && payload.photoData.length > MAX_WARN_BASE64_CHARS) {
        console.warn(
          `[syncExecutor] US-059 : photoData dépasse 500 Ko (${Math.round(payload.photoData.length / 1024)} Ko base64). ` +
          'Risque de 413 Request Entity Too Large. TODO R2 : compresser via react-native-image-compressor.'
        );
      }

      body = JSON.stringify({
        typePreuve: payload.typePreuve,
        signatureData: payload.signatureData,
        nomSignataire: payload.nomSignataire,
        nomTiers: payload.nomTiers,
        descriptionLieu: payload.descriptionLieu,
        photoData: payload.photoData,
      });
    } else if (cmd.type === 'DECLARER_ECHEC') {
      const payload = cmd.payload as { tourneeId: string; colisId: string; motif: string; disposition: string; note?: string };
      url = `${API_BASE_URL}/api/tournees/${encodeURIComponent(payload.tourneeId)}/colis/${encodeURIComponent(payload.colisId)}/echec`;
      body = JSON.stringify({
        motif: payload.motif,
        disposition: payload.disposition,
        note: payload.note,
      });
    } else {
      // Type de commande inconnu — on le retire de la file sans traitement
      return { success: false, status: 400 };
    }

    try {
      const response = await fetchFn(url, {
        method: 'POST',
        headers,
        body,
      });

      // SC3 — 409 : commande déjà traitée côté serveur (idempotence)
      if (response.status === 409) {
        return { success: false, status: 409, alreadyProcessed: true };
      }

      return {
        success: response.status >= 200 && response.status < 300,
        status: response.status,
      };
    } catch {
      // Erreur réseau → propager pour arrêter la sync (SC2)
      throw new Error('network_error');
    }
  }

  return { execute };
}
