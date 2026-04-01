/**
 * Client API — Supervision (svc-supervision, port 8082)
 *
 * Fonctions appelées depuis le mobile du livreur pour :
 * - Récupérer les instructions en attente (polling US-016)
 * - Marquer une instruction comme exécutée (US-015)
 *
 * Note : URL de base distincte de svc-tournee (8081 vs 8082).
 */

const SUPERVISION_BASE_URL =
  process.env.EXPO_PUBLIC_SUPERVISION_URL ?? 'http://10.0.2.2:8082';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InstructionMobileDTO {
  instructionId: string;
  tourneeId: string;
  colisId: string;
  superviseurId: string;
  typeInstruction: string;
  statut: string;
  creneauCible?: string;
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
  const response = await fetch(
    `${SUPERVISION_BASE_URL}/api/supervision/instructions/en-attente?tourneeId=${encodeURIComponent(tourneeId)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // TODO (US-019) : ajouter Authorization: `Bearer ${token}`
      },
    }
  );

  if (!response.ok) {
    // Erreur silencieuse — le polling ne doit pas bloquer le livreur
    return [];
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as InstructionMobileDTO[]) : [];
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
  const response = await fetch(
    `${SUPERVISION_BASE_URL}/api/supervision/instructions/${encodeURIComponent(instructionId)}/executer`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // TODO (US-019) : ajouter Authorization: `Bearer ${token}`
      },
    }
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
  const response = await fetch(
    `${SUPERVISION_BASE_URL}/api/supervision/instructions/${encodeURIComponent(instructionId)}/prendre-en-compte`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // TODO (US-019) : ajouter Authorization: `Bearer ${token}`
      },
    }
  );

  if (!response.ok && response.status !== 409) {
    // 409 = déjà PRISE_EN_COMPTE — idempotent, on ignore
    throw new Error(`Erreur prendre en compte instruction : ${response.status}`);
  }
}
