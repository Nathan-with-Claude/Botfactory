/**
 * Types TypeScript — DTO Tournee et Colis (miroir des DTOs backend)
 * Utilises par tourneeApi.ts et les composants React Native.
 */

export type StatutColis = 'A_LIVRER' | 'LIVRE' | 'ECHEC' | 'A_REPRESENTER';
export type TypeContrainte = 'HORAIRE' | 'FRAGILE' | 'DOCUMENT_SENSIBLE';

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
