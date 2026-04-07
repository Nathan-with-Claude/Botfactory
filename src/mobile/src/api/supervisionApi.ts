/**
 * Client API — Supervision (svc-supervision, port 8082)
 *
 * Fonctions appelées depuis le mobile du livreur pour :
 * - Récupérer les instructions en attente (polling US-016)
 * - Marquer une instruction comme exécutée (US-015)
 *
 * Note : URL de base distincte de svc-tournee (8081 vs 8082).
 * US-051 : Bearer token injecté via createHttpClient (même pattern que tourneeApi.ts).
 */

import { createHttpClient } from './httpClient';
import { authStore } from '../store/authStoreInstance';

const SUPERVISION_BASE_URL =
  process.env.EXPO_PUBLIC_SUPERVISION_URL ?? 'http://localhost:8082';

const { apiFetch } = createHttpClient({
  authStore,
  baseUrl: SUPERVISION_BASE_URL,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InstructionMobileDTO {
  instructionId: string;
  tourneeId: string;
  colisId: string;
  superviseurId: string;
  typeInstruction: string;
  statut: string;
  creneauCible?: string;
  /**
   * Texte libre de la consigne rédigé par le superviseur (US-037 v1.3).
   * Exemple : "Prioriser le colis COLIS-042 — client urgent"
   * Optionnel : peut être absent pour les types structurés (MODIFIER_CRENEAU, etc.)
   */
  texteConsigne?: string;
  horodatage: string;
}

// ─── Fonctions API ────────────────────────────────────────────────────────────

/**
 * Récupère les instructions ENVOYEE pour une tournée donnée (polling US-016).
 * Appelé toutes les 10 secondes par ListeColisScreen.
 *
 * @param tourneeId identifiant de la tournée du livreur
 * @returns liste des instructions en attente (vide si aucune)
 */
export async function getInstructionsEnAttente(
  tourneeId: string
): Promise<InstructionMobileDTO[]> {
  try {
    const response = await apiFetch(
      `/api/supervision/instructions/en-attente?tourneeId=${encodeURIComponent(tourneeId)}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      // Erreur silencieuse (401 géré par httpClient → logout) — le polling ne doit pas bloquer le livreur
      return [];
    }

    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as InstructionMobileDTO[]) : [];
  } catch {
    // Erreur réseau — silencieuse
    return [];
  }
}

/**
 * Marque une instruction comme exécutée par le livreur (US-015).
 * Appelé automatiquement depuis DetailColisScreen au chargement
 * si une instruction ENVOYEE est trouvée pour ce colis.
 *
 * @param instructionId identifiant de l'instruction à marquer exécutée
 * @throws Error si l'appel échoue (404, réseau) — géré silencieusement côté appelant
 */
export async function marquerInstructionExecutee(
  instructionId: string
): Promise<void> {
  const response = await apiFetch(
    `/api/supervision/instructions/${encodeURIComponent(instructionId)}/executer`,
    { method: 'PATCH' }
  );

  if (!response.ok && response.status !== 409) {
    // 409 = déjà exécutée — idempotent, on ignore
    throw new Error(`Erreur lors de la mise à jour de l'instruction : ${response.status}`);
  }
}

/**
 * Marque une instruction comme prise en compte par le livreur (US-037 delta Sprint 5).
 * Appelé automatiquement à l'ouverture de MesConsignesScreen pour chaque instruction
 * au statut ENVOYEE. Transition : ENVOYEE → PRISE_EN_COMPTE.
 *
 * Si offline (réseau indisponible), l'erreur est propagée à l'appelant qui
 * choisit de la gérer silencieusement (réessai à la prochaine ouverture).
 *
 * @param instructionId identifiant de l'instruction à marquer prise en compte
 * @throws Error si l'appel échoue (réseau, 404) — géré silencieusement par useConsignesLocales
 */
export async function prendreEnCompteInstruction(
  instructionId: string
): Promise<void> {
  const response = await apiFetch(
    `/api/supervision/instructions/${encodeURIComponent(instructionId)}/prendre-en-compte`,
    { method: 'PATCH' }
  );

  if (!response.ok && response.status !== 409) {
    // 409 = déjà PRISE_EN_COMPTE — idempotent, on ignore
    throw new Error(`Erreur prendre en compte instruction : ${response.status}`);
  }
}
