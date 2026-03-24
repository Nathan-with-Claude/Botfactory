/**
 * Tests unitaires — filtreZone.ts (logique de domaine US-003)
 *
 * Verifie les fonctions pures :
 * - extraireZonesDisponibles : derivation dynamique des zones depuis les colis
 * - filtrerColisByZone : filtrage local sans effet de bord
 *
 * Ces tests sont independants de React — logique de domaine pure.
 */

import {
  extraireZonesDisponibles,
  filtrerColisByZone,
  ZONE_TOUS,
} from '../domain/filtreZone';
import { ColisDTO } from '../api/tourneeTypes';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeColis = (id: string, zone: string | null): ColisDTO => ({
  colisId: id,
  statut: 'A_LIVRER',
  adresseLivraison: {
    rue: `1 Rue Test ${id}`,
    complementAdresse: null,
    codePostal: '69001',
    ville: 'Lyon',
    zoneGeographique: zone,
    adresseComplete: `1 Rue Test ${id}, 69001 Lyon`,
  },
  destinataire: { nom: `Destinataire ${id}`, telephoneChiffre: null },
  contraintes: [],
  aUneContrainteHoraire: false,
});

// ─── extraireZonesDisponibles ─────────────────────────────────────────────────

describe('extraireZonesDisponibles', () => {
  it('extrait les zones distinctes, triees alphabetiquement', () => {
    const colis = [
      makeColis('c1', 'Zone C'),
      makeColis('c2', 'Zone A'),
      makeColis('c3', 'Zone B'),
      makeColis('c4', 'Zone A'), // doublon
    ];

    const zones = extraireZonesDisponibles(colis);

    expect(zones).toEqual(['Zone A', 'Zone B', 'Zone C']);
  });

  it('exclut les colis dont la zoneGeographique est null', () => {
    const colis = [
      makeColis('c1', 'Zone A'),
      makeColis('c2', null),
      makeColis('c3', 'Zone B'),
    ];

    const zones = extraireZonesDisponibles(colis);

    expect(zones).toEqual(['Zone A', 'Zone B']);
  });

  it('exclut les colis dont la zoneGeographique est une chaine vide', () => {
    const colis = [
      makeColis('c1', 'Zone A'),
      makeColis('c2', ''),
      makeColis('c3', '   '), // espaces seulement
    ];

    const zones = extraireZonesDisponibles(colis);

    expect(zones).toEqual(['Zone A']);
  });

  it('retourne une liste vide si aucun colis n\'a de zone', () => {
    const colis = [makeColis('c1', null), makeColis('c2', null)];

    const zones = extraireZonesDisponibles(colis);

    expect(zones).toEqual([]);
  });

  it('retourne une liste vide si la liste de colis est vide', () => {
    const zones = extraireZonesDisponibles([]);

    expect(zones).toEqual([]);
  });

  it('retourne une seule zone si tous les colis sont dans la meme zone', () => {
    const colis = [
      makeColis('c1', 'Zone A'),
      makeColis('c2', 'Zone A'),
      makeColis('c3', 'Zone A'),
    ];

    const zones = extraireZonesDisponibles(colis);

    expect(zones).toEqual(['Zone A']);
  });
});

// ─── filtrerColisByZone ────────────────────────────────────────────────────────

describe('filtrerColisByZone', () => {
  const colisZoneA = makeColis('a1', 'Zone A');
  const colisZoneA2 = makeColis('a2', 'Zone A');
  const colisZoneB = makeColis('b1', 'Zone B');
  const colisZoneC = makeColis('c1', 'Zone C');
  const colisWithoutZone = makeColis('x1', null);

  const tousLesColis = [colisZoneA, colisZoneA2, colisZoneB, colisZoneC, colisWithoutZone];

  it('retourne tous les colis si le filtre est ZONE_TOUS', () => {
    const result = filtrerColisByZone(tousLesColis, ZONE_TOUS);

    expect(result).toHaveLength(5);
    expect(result).toBe(tousLesColis); // reference directe — pas de copie inutile
  });

  it('filtre uniquement les colis de Zone A', () => {
    const result = filtrerColisByZone(tousLesColis, 'Zone A');

    expect(result).toHaveLength(2);
    expect(result.map(c => c.colisId)).toEqual(['a1', 'a2']);
  });

  it('filtre uniquement les colis de Zone B', () => {
    const result = filtrerColisByZone(tousLesColis, 'Zone B');

    expect(result).toHaveLength(1);
    expect(result[0].colisId).toBe('b1');
  });

  it('retourne une liste vide si aucun colis ne correspond a la zone', () => {
    const result = filtrerColisByZone(tousLesColis, 'Zone Inexistante');

    expect(result).toHaveLength(0);
  });

  it('ne modifie pas les objets colis (references intactes)', () => {
    const result = filtrerColisByZone(tousLesColis, 'Zone A');

    // Les objets retournes sont les memes references (pas de copie)
    expect(result[0]).toBe(colisZoneA);
    expect(result[1]).toBe(colisZoneA2);
  });

  it('n\'inclut pas les colis sans zone dans les resultats filtres par zone', () => {
    const colisAvecEtSansZone = [colisZoneA, colisWithoutZone];

    const result = filtrerColisByZone(colisAvecEtSansZone, 'Zone A');

    expect(result).toHaveLength(1);
    expect(result[0].colisId).toBe('a1');
  });
});
