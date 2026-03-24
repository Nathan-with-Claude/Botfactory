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
}

/**
 * Crée un exécuteur de commandes offline.
 * Chaque commande est transformée en requête HTTP avec le X-Command-Id.
 */
export function createSyncExecutor(options: SyncExecutorOptions = {}) {
  const { fetchFn = fetch } = options;
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
