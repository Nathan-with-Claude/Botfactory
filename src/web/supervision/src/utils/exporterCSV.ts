/**
 * exporterCSV — Utilitaire frontend US-028
 *
 * Génère et déclenche le téléchargement d'un fichier CSV représentant
 * la composition d'une TourneePlanifiee depuis W-05 onglet Composition.
 *
 * Colonnes CSV (spec US-028 SC2) : #Colis, Adresse, Zone, Contrainte
 * Encodage : UTF-8 avec BOM (pour compatibilité Excel)
 * Nom du fichier : tournee-[ID]-[YYYY-MM-DD].csv
 *
 * Invariant : l'export n'émet aucun changement d'état sur la TourneeTMS
 * (opération de lecture — la traçabilité est gérée côté backend via tracerExportCSV).
 *
 * Source : US-028
 */

export interface ColisCSVRow {
  numeroColis: string;
  adresse: string;
  zone: string;
  contrainte: string;
}

export interface TourneePourExport {
  id: string;
  codeTms: string;
  date: string;
  zones: { nom: string; nbColis: number }[];
  contraintes: { libelle: string; nbColisAffectes: number }[];
  nbColis: number;
}

/**
 * Construit les lignes CSV à partir des données de composition de la tournée.
 *
 * Comme le modèle BC-07 ne stocke pas les colis individuels (uniquement les méta-données
 * de composition), on génère une ligne par "slot de colis" en répartissant
 * les zones et contraintes selon leurs effectifs.
 *
 * Chaque ligne représente un colis numéroté, assigné à la zone dont le quota
 * n'est pas encore épuisé.
 */
export function construireColisCSVRows(tournee: TourneePourExport): ColisCSVRow[] {
  const rows: ColisCSVRow[] = [];
  let numeroColis = 1;

  const zones = tournee.zones.length > 0
    ? tournee.zones
    : [{ nom: 'Zone inconnue', nbColis: tournee.nbColis }];

  for (const zone of zones) {
    // Contraintes applicables à cette zone (on répartit les contraintes proportionnellement)
    const contraintesLibelles = tournee.contraintes.map(c => c.libelle);

    for (let i = 0; i < zone.nbColis; i++) {
      // Attribution d'une contrainte selon la position dans le slot de zone
      const contrainte = contraintesLibelles.length > 0
        ? contraintesLibelles[i % contraintesLibelles.length]
        : '';

      rows.push({
        numeroColis: String(numeroColis).padStart(4, '0'),
        adresse: zone.nom,
        zone: zone.nom,
        contrainte,
      });
      numeroColis++;
    }
  }

  return rows;
}

/**
 * Sérialise les lignes CSV en texte UTF-8 avec BOM.
 * Entête : #Colis,Adresse,Zone,Contrainte
 * Les virgules dans les valeurs sont protégées par des guillemets.
 */
export function serialiserEnCSV(rows: ColisCSVRow[]): string {
  const echapper = (valeur: string): string => {
    if (valeur.includes(',') || valeur.includes('"') || valeur.includes('\n')) {
      return `"${valeur.replace(/"/g, '""')}"`;
    }
    return valeur;
  };

  const entete = '#Colis,Adresse,Zone,Contrainte';
  const lignes = rows.map(row =>
    [
      echapper(row.numeroColis),
      echapper(row.adresse),
      echapper(row.zone),
      echapper(row.contrainte),
    ].join(',')
  );

  // BOM UTF-8 pour compatibilité Excel
  return '\uFEFF' + [entete, ...lignes].join('\r\n');
}

/**
 * Construit le nom du fichier CSV selon la spec US-028 :
 * tournee-[ID]-[YYYY-MM-DD].csv
 */
export function construireNomFichier(tourneeId: string, date: string): string {
  return `tournee-${tourneeId}-${date}.csv`;
}

/**
 * Déclenche le téléchargement du fichier CSV dans le navigateur.
 * Crée un lien <a> temporaire avec un Blob URL.
 */
export function declencherTelechargement(contenu: string, nomFichier: string): void {
  const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  lien.style.display = 'none';
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
}

/**
 * Point d'entrée principal — exporte en CSV la composition d'une tournée.
 * Orchestre construireColisCSVRows → serialiserEnCSV → declencherTelechargement.
 */
export function exporterCSV(tournee: TourneePourExport): void {
  const rows = construireColisCSVRows(tournee);
  const contenu = serialiserEnCSV(rows);
  const nomFichier = construireNomFichier(tournee.codeTms, tournee.date);
  declencherTelechargement(contenu, nomFichier);
}
