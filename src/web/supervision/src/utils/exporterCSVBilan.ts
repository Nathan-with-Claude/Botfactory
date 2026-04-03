/**
 * exporterCSVBilan — Utilitaire frontend US-039
 *
 * Génère et déclenche le téléchargement d'un fichier CSV bilan de toutes les tournées
 * du jour depuis W-01 (TableauDeBordPage).
 *
 * Colonnes CSV (spec US-039 SC2) :
 *   #Tournee, Livreur, NbColis, NbLivres, NbEchecs, StatutFinal
 * Encodage : UTF-8 avec BOM (pour compatibilité Excel)
 * Nom du fichier : bilan-tournees-AAAA-MM-JJ.csv
 *
 * Invariant : opération de lecture pure — aucun Domain Event émis,
 * aucun Aggregate modifié.
 *
 * Source : US-039
 */

import { VueTourneeDTO } from '../pages/TableauDeBordPage';

// ─── Génération du CSV ────────────────────────────────────────────────────────

/**
 * Échappe une valeur CSV : entoure de guillemets si contient virgule, guillemet ou retour ligne.
 */
function echapperValeur(valeur: string): string {
  if (valeur.includes(',') || valeur.includes('"') || valeur.includes('\n')) {
    return `"${valeur.replace(/"/g, '""')}"`;
  }
  return valeur;
}

/**
 * Génère le contenu CSV pour le bilan des tournées du jour.
 * Colonnes : #Tournee, Livreur, NbColis, NbLivres, NbEchecs, StatutFinal
 * BOM UTF-8 inclus.
 */
export function genererCSVBilanTournees(tournees: VueTourneeDTO[]): string {
  const entete = '#Tournee,Livreur,NbColis,NbLivres,NbEchecs,StatutFinal';

  const lignes = tournees.map(t => {
    const numeroCols = [
      echapperValeur(t.codeTMS ?? t.tourneeId),
      echapperValeur(t.livreurNom),
      String(t.colisTotal),
      String(t.nbLivres ?? t.colisTraites),
      String(t.nbEchecs ?? 0),
      echapperValeur(t.statut),
    ];
    return numeroCols.join(',');
  });

  // BOM UTF-8 pour compatibilité Excel + CRLF comme séparateur de lignes
  return '\uFEFF' + [entete, ...lignes].join('\r\n');
}

/**
 * Construit le nom du fichier CSV bilan selon la spec US-039 :
 * bilan-tournees-AAAA-MM-JJ.csv
 */
export function construireNomFichierBilan(date: string): string {
  return `bilan-tournees-${date}.csv`;
}

/**
 * Déclenche le téléchargement du fichier CSV bilan dans le navigateur.
 */
export function declencherTelechargementBilan(contenu: string, nomFichier: string): void {
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
 * Point d'entrée principal — exporte le bilan CSV de toutes les tournées du jour.
 * Orchestre genererCSVBilanTournees → construireNomFichierBilan → declencherTelechargementBilan.
 */
export function exporterCSVBilan(tournees: VueTourneeDTO[], dateJour: string): void {
  const contenu = genererCSVBilanTournees(tournees);
  const nomFichier = construireNomFichierBilan(dateJour);
  declencherTelechargementBilan(contenu, nomFichier);
}
