/**
 * Logique de domaine — Filtrage par zone geographique (US-003)
 *
 * Bounded Context : BC-01 Orchestration de Tournee
 * Aggregate : Tournee (lecture seule — aucun evenement emis)
 *
 * Invariants implémentes ici :
 * - Le filtrage ne modifie pas le StatutColis ni l'etat de la Tournee.
 * - L'onglet "Tous" affiche l'ensemble des colis sans filtre.
 * - Le compteur "Reste a livrer" est toujours calcule sur l'ensemble de la tournee.
 * - Un colis sans zoneGeographique n'est pas filtrable par zone.
 * - Les zones disponibles sont derivees dynamiquement depuis les colis de la tournee.
 */

import { ColisDTO } from '../api/tourneeTypes';

/** Identifiant special de la zone "Tous" (pas de filtre) */
export const ZONE_TOUS = 'TOUS';

/** Type representant le filtre de zone actif */
export type FiltreZone = typeof ZONE_TOUS | string;

/**
 * Extrait les zones geographiques distinctes depuis la liste des colis.
 * Retourne les zones triees alphabetiquement.
 * Exclut les colis sans zone definie (null ou vide).
 *
 * Exemple : [colis ZoneA, colis ZoneB] → ['Zone A', 'Zone B']
 */
export function extraireZonesDisponibles(colis: ColisDTO[]): string[] {
  const zones = new Set<string>();
  for (const c of colis) {
    const zone = c.adresseLivraison.zoneGeographique;
    if (zone && zone.trim().length > 0) {
      zones.add(zone);
    }
  }
  return Array.from(zones).sort();
}

/**
 * Filtre les colis selon la zone active.
 * Si filtreZone === ZONE_TOUS, retourne tous les colis sans exception.
 * Sinon, retourne uniquement les colis dont la zoneGeographique correspond.
 *
 * Invariant : le filtrage ne modifie pas les objets colis (retourne des references).
 */
export function filtrerColisByZone(colis: ColisDTO[], filtreZone: FiltreZone): ColisDTO[] {
  if (filtreZone === ZONE_TOUS) {
    return colis;
  }
  return colis.filter(c => c.adresseLivraison.zoneGeographique === filtreZone);
}
