/**
 * Types TypeScript — DTO Tournee et Colis (miroir des DTOs backend)
 * Utilises par tourneeApi.ts et les composants React Native.
 */

export type StatutColis = 'A_LIVRER' | 'LIVRE' | 'ECHEC' | 'A_REPRESENTER';
export type TypeContrainte = 'HORAIRE' | 'FRAGILE' | 'DOCUMENT_SENSIBLE';

/** Motifs normalisés d'échec de livraison (US-005). */
export type MotifNonLivraison =
  | 'ABSENT'
  | 'ACCES_IMPOSSIBLE'
  | 'REFUS_CLIENT'
  | 'HORAIRE_DEPASSE';

/** Labels affichés à l'écran M-05 pour chaque motif. */
export const MOTIF_LABELS: Record<MotifNonLivraison, string> = {
  ABSENT: 'Absent',
  ACCES_IMPOSSIBLE: 'Accès impossible',
  REFUS_CLIENT: 'Refus du client',
  HORAIRE_DEPASSE: 'Horaires dépassés',
};

/** Dispositions possibles pour un colis en échec (US-005). */
export type Disposition =
  | 'A_REPRESENTER'
  | 'DEPOT_CHEZ_TIERS'
  | 'RETOUR_DEPOT';

/** Labels affichés à l'écran M-05 pour chaque disposition. */
export const DISPOSITION_LABELS: Record<Disposition, string> = {
  A_REPRESENTER: 'À représenter (nouvelle tentative)',
  DEPOT_CHEZ_TIERS: 'Dépôt chez un tiers',
  RETOUR_DEPOT: 'Retour au dépôt',
};

export interface ContrainteDTO {
  type: TypeContrainte;
  valeur: string;
  estHoraire: boolean;
}

export interface AdresseDTO {
  rue: string;
  complementAdresse: string | null;
  codePostal: string;
  ville: string;
  zoneGeographique: string | null;
  adresseComplete: string;
}

export interface DestinataireDTO {
  nom: string;
  telephoneChiffre: string | null;
}

export interface ColisDTO {
  colisId: string;
  statut: StatutColis;
  adresseLivraison: AdresseDTO;
  destinataire: DestinataireDTO;
  contraintes: ContrainteDTO[];
  aUneContrainteHoraire: boolean;
  estTraite: boolean;
  /** Renseigné uniquement si statut = ECHEC (US-005). */
  motifNonLivraison: MotifNonLivraison | null;
  /** Renseigné uniquement si statut = ECHEC (US-005). */
  disposition: Disposition | null;
}

export interface TourneeDTO {
  tourneeId: string;
  livreurId: string;
  date: string; // ISO date "YYYY-MM-DD"
  statut: 'CHARGEE' | 'DEMARREE' | 'CLOTUREE';
  colis: ColisDTO[];
  resteALivrer: number;
  colisTotal: number;
  colisTraites: number;
  estimationFin: string | null; // HH:mm
}

/** Requête POST /api/tournees/{tourneeId}/colis/{colisId}/echec (US-005). */
export interface DeclarerEchecRequest {
  motif: MotifNonLivraison;
  disposition: Disposition;
  noteLibre?: string;
}

/** Récapitulatif retourné après clôture de tournée (US-007). */
export interface RecapitulatifTourneeDTO {
  tourneeId: string;
  livreurId: string;
  date: string; // ISO date "YYYY-MM-DD"
  statut: 'CLOTUREE';
  colisTotal: number;
  colisLivres: number;
  colisEchecs: number;
  colisARepresenter: number;
}
