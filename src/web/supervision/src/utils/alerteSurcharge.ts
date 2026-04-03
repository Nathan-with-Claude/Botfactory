/**
 * alerteSurcharge — Utilitaire frontend US-041
 *
 * Calcule le niveau d'alerte de surcharge pour une tournée en W-04.
 *
 * Règles de calcul (spec US-041) :
 *   - CRITIQUE  : poids > capacité (dépassement effectif — cohérent avec CapaciteVehiculeDepasseeException)
 *   - APPROCHE  : poids >= 95% de la capacité (seuil d'alerte — cohérent avec US-030)
 *   - AUCUNE    : poids < 95% de la capacité, ou pas de véhicule affecté
 *
 * Source : US-041
 */

/** Niveau d'alerte de surcharge d'une tournée */
export type NiveauAlerte = 'AUCUNE' | 'APPROCHE' | 'CRITIQUE';

/** Seuil d'alerte : 95% de la capacité (cohérent avec les invariants BC-07 US-030) */
const SEUIL_APPROCHE = 0.95;

/**
 * Calcule le niveau d'alerte pour une tournée selon son poids estimé et la capacité du véhicule.
 *
 * @param poidsEstimeKg    - Poids estimé de la tournée en kg
 * @param capaciteKg       - Capacité du véhicule affecté en kg (null/undefined si non affecté)
 * @returns NiveauAlerte
 */
export function calculerNiveauAlerte(
  poidsEstimeKg: number,
  capaciteKg: number | null | undefined
): NiveauAlerte {
  if (capaciteKg == null || capaciteKg <= 0) {
    return 'AUCUNE';
  }
  if (poidsEstimeKg > capaciteKg) {
    return 'CRITIQUE';
  }
  if (poidsEstimeKg >= capaciteKg * SEUIL_APPROCHE) {
    return 'APPROCHE';
  }
  return 'AUCUNE';
}

/**
 * Génère le texte de tooltip selon le niveau d'alerte.
 */
export function genererTooltipPoids(
  poidsEstimeKg: number,
  capaciteKg: number | null | undefined,
  niveau: NiveauAlerte
): string | null {
  if (niveau === 'AUCUNE' || capaciteKg == null) return null;
  if (niveau === 'CRITIQUE') {
    return `Chargement trop lourd — ${poidsEstimeKg} kg / ${capaciteKg} kg`;
  }
  return `Charge élevée — ${poidsEstimeKg} kg / ${capaciteKg} kg`;
}
