/**
 * Tests TDD — US-040 : Enrichir le CSV exporté avec le nom du destinataire et le statut final
 *
 * Colonnes cibles : #Colis, Destinataire, Adresse, Zone, Contrainte, Statut
 * (ajout de Destinataire en 2eme position et Statut en dernière)
 *
 * Ces tests sont écrits AVANT l'implémentation (RED phase TDD).
 *
 * Scenarios couverts :
 *   SC1 — Colonnes enrichies : #Colis, Destinataire, Adresse, Zone, Contrainte, Statut
 *   SC2 — Statut "Livré" pour colis LivraisonConfirmee
 *   SC3 — Statut "Échec" pour colis EchecLivraisonDeclare
 *   SC4 — Statut "En cours" pour colis non encore traité
 *   SC5 — Retrocompatibilité : les tests existants restent verts (format mis à jour)
 *   SC6 — Destinataire absent = chaîne vide
 *   SC7 — Valeur avec virgule dans Destinataire → guillemets
 */

import {
  construireColisCSVRowsEnrichis,
  serialiserEnCSVEnrichi,
  TourneePourExportEnrichie,
  ColisCSVRowEnrichi,
} from '../utils/exporterCSV';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const tourneeMockEnrichie: TourneePourExportEnrichie = {
  id: 'tp-203',
  codeTms: 'T-203',
  date: '2026-04-03',
  nbColis: 3,
  zones: [
    { nom: 'Lyon 8e', nbColis: 2 },
    { nom: 'Lyon 5e', nbColis: 1 },
  ],
  contraintes: [
    { libelle: 'Avant 10h', nbColisAffectes: 1 },
  ],
  colis: [
    {
      numeroColis: '0001',
      destinataire: 'M. Dupont',
      adresse: '12 rue de la Paix',
      zone: 'Lyon 8e',
      contrainte: 'Avant 10h',
      statut: 'LIVRE',
    },
    {
      numeroColis: '0002',
      destinataire: 'Mme Lambert',
      adresse: '5 avenue Victor Hugo',
      zone: 'Lyon 8e',
      contrainte: '',
      statut: 'ECHEC',
    },
    {
      numeroColis: '0003',
      destinataire: '',
      adresse: '8 place Bellecour',
      zone: 'Lyon 5e',
      contrainte: '',
      statut: 'EN_COURS',
    },
  ],
};

// ─── Tests unitaires — construireColisCSVRowsEnrichis ─────────────────────────

describe('construireColisCSVRowsEnrichis (US-040)', () => {

  it('SC1 : retourne des lignes avec les 6 champs attendus', () => {
    const rows = construireColisCSVRowsEnrichis(tourneeMockEnrichie);
    rows.forEach((row: ColisCSVRowEnrichi) => {
      expect(row).toHaveProperty('numeroColis');
      expect(row).toHaveProperty('destinataire');
      expect(row).toHaveProperty('adresse');
      expect(row).toHaveProperty('zone');
      expect(row).toHaveProperty('contrainte');
      expect(row).toHaveProperty('statut');
    });
  });

  it('SC1 : retourne autant de lignes que de colis', () => {
    const rows = construireColisCSVRowsEnrichis(tourneeMockEnrichie);
    expect(rows).toHaveLength(3);
  });

  it('SC2 : statut LIVRE est présent pour le colis 0001', () => {
    const rows = construireColisCSVRowsEnrichis(tourneeMockEnrichie);
    expect(rows[0].statut).toBe('Livré');
  });

  it('SC3 : statut ECHEC est présent pour le colis 0002', () => {
    const rows = construireColisCSVRowsEnrichis(tourneeMockEnrichie);
    expect(rows[1].statut).toBe('Échec');
  });

  it('SC4 : statut EN_COURS est présent pour le colis 0003', () => {
    const rows = construireColisCSVRowsEnrichis(tourneeMockEnrichie);
    expect(rows[2].statut).toBe('En cours');
  });

  it('SC6 : destinataire absent = chaîne vide', () => {
    const rows = construireColisCSVRowsEnrichis(tourneeMockEnrichie);
    expect(rows[2].destinataire).toBe('');
  });

  it('SC1 : destinataire présent dans les rows', () => {
    const rows = construireColisCSVRowsEnrichis(tourneeMockEnrichie);
    expect(rows[0].destinataire).toBe('M. Dupont');
    expect(rows[1].destinataire).toBe('Mme Lambert');
  });
});

// ─── Tests unitaires — serialiserEnCSVEnrichi ─────────────────────────────────

describe('serialiserEnCSVEnrichi (US-040)', () => {

  it('SC1 : l\'en-tête contient les 6 colonnes dans le bon ordre', () => {
    const rows = construireColisCSVRowsEnrichis(tourneeMockEnrichie);
    const csv = serialiserEnCSVEnrichi(rows);
    const lignes = csv.replace('\uFEFF', '').split('\r\n');
    expect(lignes[0]).toBe('#Colis,Destinataire,Adresse,Zone,Contrainte,Statut');
  });

  it('SC2 : "Livré" est présent dans le CSV pour le colis 0001', () => {
    const rows = construireColisCSVRowsEnrichis(tourneeMockEnrichie);
    const csv = serialiserEnCSVEnrichi(rows);
    expect(csv).toContain('Livré');
  });

  it('SC3 : "Échec" est présent dans le CSV pour le colis 0002', () => {
    const rows = construireColisCSVRowsEnrichis(tourneeMockEnrichie);
    const csv = serialiserEnCSVEnrichi(rows);
    expect(csv).toContain('Échec');
  });

  it('SC4 : "En cours" est présent dans le CSV pour le colis 0003', () => {
    const rows = construireColisCSVRowsEnrichis(tourneeMockEnrichie);
    const csv = serialiserEnCSVEnrichi(rows);
    expect(csv).toContain('En cours');
  });

  it('SC3 : BOM UTF-8 présent', () => {
    const rows = construireColisCSVRowsEnrichis(tourneeMockEnrichie);
    const csv = serialiserEnCSVEnrichi(rows);
    expect(csv.startsWith('\uFEFF')).toBe(true);
  });

  it('SC3 : CRLF comme séparateur de lignes', () => {
    const rows = construireColisCSVRowsEnrichis(tourneeMockEnrichie);
    const csv = serialiserEnCSVEnrichi(rows);
    expect(csv.includes('\r\n')).toBe(true);
  });

  it('SC7 : valeur avec virgule dans Destinataire est entre guillemets', () => {
    const rows: ColisCSVRowEnrichi[] = [
      {
        numeroColis: '0001',
        destinataire: 'Dupont, Jean',
        adresse: '12 rue de la Paix',
        zone: 'Lyon 8e',
        contrainte: '',
        statut: 'Livré',
      },
    ];
    const csv = serialiserEnCSVEnrichi(rows);
    expect(csv).toContain('"Dupont, Jean"');
  });

  it('SC5 : le nombre de lignes de données correspond au nombre de colis', () => {
    const rows = construireColisCSVRowsEnrichis(tourneeMockEnrichie);
    const csv = serialiserEnCSVEnrichi(rows);
    const lignes = csv.replace('\uFEFF', '').split('\r\n').filter(l => l.trim().length > 0);
    // 1 en-tête + 3 colis
    expect(lignes).toHaveLength(4);
  });
});
