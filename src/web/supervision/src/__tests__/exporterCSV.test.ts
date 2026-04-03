/**
 * Tests unitaires — exporterCSV (US-028)
 *
 * Couvre les scénarios :
 * SC1 — Nom du fichier respecte le format tournee-[ID]-[date].csv
 * SC2 — Contenu CSV avec colonnes #Colis, Adresse, Zone, Contrainte
 * SC3 — Encodage UTF-8 avec BOM
 * SC4 — Contraintes sérialisées en clair
 * SC5 — Virgules dans les valeurs protégées par guillemets
 * SC6 — Tournée sans contrainte génère une colonne Contrainte vide
 * SC7 — Le nombre de lignes CSV correspond au nombre de colis de la tournée
 *
 * Source : US-028
 */

import {
  construireColisCSVRows,
  serialiserEnCSV,
  construireNomFichier,
  TourneePourExport,
  ColisCSVRow,
} from '../utils/exporterCSV';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const tourneeMock: TourneePourExport = {
  id: 'tp-203',
  codeTms: 'T-203',
  date: '2026-03-20',
  nbColis: 5,
  zones: [
    { nom: 'Lyon 8e', nbColis: 3 },
    { nom: 'Lyon 5e', nbColis: 2 },
  ],
  contraintes: [
    { libelle: 'Avant 14h', nbColisAffectes: 2 },
    { libelle: 'Fragile', nbColisAffectes: 1 },
  ],
};

const tourneeMinimale: TourneePourExport = {
  id: 'tp-001',
  codeTms: 'T-001',
  date: '2026-03-20',
  nbColis: 2,
  zones: [{ nom: 'Villeurbanne', nbColis: 2 }],
  contraintes: [],
};

// ─── SC1 : Nom du fichier ──────────────────────────────────────────────────────

describe('construireNomFichier', () => {
  it('SC1 — respecte le format tournee-[ID]-[date].csv', () => {
    const nom = construireNomFichier('T-203', '2026-03-20');
    expect(nom).toBe('tournee-T-203-2026-03-20.csv');
  });

  it('SC1 — fonctionne avec un id quelconque', () => {
    const nom = construireNomFichier('tp-001', '2026-01-15');
    expect(nom).toBe('tournee-tp-001-2026-01-15.csv');
  });
});

// ─── SC2 : Colonnes CSV ────────────────────────────────────────────────────────

describe('construireColisCSVRows', () => {
  it('SC2 — retourne autant de lignes que de colis', () => {
    const rows = construireColisCSVRows(tourneeMock);
    expect(rows).toHaveLength(5);
  });

  it('SC2 — chaque ligne a les champs numeroColis, adresse, zone, contrainte', () => {
    const rows = construireColisCSVRows(tourneeMock);
    rows.forEach((row: ColisCSVRow) => {
      expect(row).toHaveProperty('numeroColis');
      expect(row).toHaveProperty('adresse');
      expect(row).toHaveProperty('zone');
      expect(row).toHaveProperty('contrainte');
    });
  });

  it('SC2 — les zones sont correctement assignées aux lignes', () => {
    const rows = construireColisCSVRows(tourneeMock);
    // 3 premiers colis → Lyon 8e
    expect(rows[0].zone).toBe('Lyon 8e');
    expect(rows[1].zone).toBe('Lyon 8e');
    expect(rows[2].zone).toBe('Lyon 8e');
    // 2 derniers colis → Lyon 5e
    expect(rows[3].zone).toBe('Lyon 5e');
    expect(rows[4].zone).toBe('Lyon 5e');
  });

  it('SC7 — le nombre de lignes correspond exactement au total colis', () => {
    const tourneeSansColis: TourneePourExport = {
      ...tourneeMock, nbColis: 0, zones: []
    };
    // Avec zones vides, fallback sur "Zone inconnue" avec nbColis=0
    const rows = construireColisCSVRows({ ...tourneeSansColis, zones: [{ nom: 'Zone inconnue', nbColis: 0 }] });
    expect(rows).toHaveLength(0);
  });
});

// ─── SC3 : Encodage UTF-8 avec BOM ────────────────────────────────────────────

describe('serialiserEnCSV', () => {
  it('SC3 — commence par le BOM UTF-8', () => {
    const rows = construireColisCSVRows(tourneeMock);
    const csv = serialiserEnCSV(rows);
    expect(csv.startsWith('\uFEFF')).toBe(true);
  });

  it('SC2 — la première ligne (après BOM) est l\'entête', () => {
    const rows = construireColisCSVRows(tourneeMock);
    const csv = serialiserEnCSV(rows);
    const lignes = csv.replace('\uFEFF', '').split('\r\n');
    expect(lignes[0]).toBe('#Colis,Adresse,Zone,Contrainte');
  });

  it('SC4 — les contraintes sont sérialisées en clair dans la colonne Contrainte', () => {
    const rows = construireColisCSVRows(tourneeMock);
    const csv = serialiserEnCSV(rows);
    // Les contraintes "Avant 14h" ou "Fragile" doivent apparaître
    expect(csv).toContain('Avant 14h');
    expect(csv).toContain('Fragile');
  });

  it('SC6 — la colonne Contrainte est vide pour une tournée sans contrainte', () => {
    const rows = construireColisCSVRows(tourneeMinimale);
    const csv = serialiserEnCSV(rows);
    const lignes = csv.replace('\uFEFF', '').split('\r\n');
    // ligne 1 : données de la première ligne de colis
    const colonnes = lignes[1].split(',');
    expect(colonnes[3]).toBe(''); // Contrainte = vide
  });

  it('SC2 — le nombre de lignes de données correspond au nombre de colis', () => {
    const rows = construireColisCSVRows(tourneeMock);
    const csv = serialiserEnCSV(rows);
    const lignes = csv.replace('\uFEFF', '').split('\r\n');
    // 1 entête + 5 lignes de données
    expect(lignes).toHaveLength(1 + 5);
  });

  it('SC5 — les virgules dans les valeurs sont protégées par des guillemets', () => {
    const rowsAvecVirgule: ColisCSVRow[] = [
      { numeroColis: '0001', adresse: 'Rue de la Paix, 75001 Paris', zone: 'Paris 1er', contrainte: 'Avant 14h, Fragile' }
    ];
    const csv = serialiserEnCSV(rowsAvecVirgule);
    expect(csv).toContain('"Rue de la Paix, 75001 Paris"');
    expect(csv).toContain('"Avant 14h, Fragile"');
  });

  it('SC5 — les guillemets dans les valeurs sont doublés', () => {
    const rowsAvecGuillemets: ColisCSVRow[] = [
      { numeroColis: '0001', adresse: 'Résidence "Le Parc"', zone: 'Lyon 3e', contrainte: '' }
    ];
    const csv = serialiserEnCSV(rowsAvecGuillemets);
    expect(csv).toContain('"Résidence ""Le Parc"""');
  });
});
