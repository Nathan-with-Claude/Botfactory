# Implémentation US-040 : Enrichir le CSV exporté avec le nom du destinataire et le statut final

## Contexte

**User Story** : En tant que superviseur logistique, je veux que le CSV téléchargé depuis le détail d'une tournée (W-05) contienne le nom du destinataire et le statut final de chaque colis.

**Lien US** : `/livrables/05-backlog/user-stories/US-040-enrichir-colonnes-csv-export.md`
**Sprint** : Sprint 6 (post-feedback Laurent Renaud 2026-04-01)
**Priorité** : Should Have
**Branche git** : `feature/US-001`

---

## Bounded Context et couche ciblée

- **BC** : BC-07 — Planification (Supporting Domain)
- **Aggregate(s) modifiés** : aucun (enrichissement de lecture)
- **Domain Events émis** : `CompositionExportee` (inchangé — émis par le backend au téléchargement)

---

## Décisions d'implémentation

### Décision d'architecture : extension par ajout, pas modification

Pour préserver la rétrocompatibilité totale avec US-028, les nouvelles fonctions sont ajoutées dans `exporterCSV.ts` **en parallèle** des fonctions existantes :

| Existant (US-028) | Nouveau (US-040) |
|---|---|
| `ColisCSVRow` | `ColisCSVRowEnrichi` |
| `TourneePourExport` | `TourneePourExportEnrichie` |
| `construireColisCSVRows()` | `construireColisCSVRowsEnrichis()` |
| `serialiserEnCSV()` | `serialiserEnCSVEnrichi()` |
| `exporterCSV()` | `exporterCSVEnrichi()` |

Les tests existants (`exporterCSV.test.ts`) restent verts sans modification.

### Interface Layer (Web — TypeScript)

**Nouveaux types dans `exporterCSV.ts`** :
- `StatutColisCsv` : `'LIVRE' | 'ECHEC' | 'EN_COURS'`
- `ColisCSVRowEnrichi` : 6 champs — `numeroColis, destinataire, adresse, zone, contrainte, statut`
- `ColisCompositionEnrichi` : données colis individuels avec `destinataire?`, `statut: StatutColisCsv`
- `TourneePourExportEnrichie extends TourneePourExport` : ajoute `colis: ColisCompositionEnrichi[]`

**Nouvelles fonctions dans `exporterCSV.ts`** :
- `construireColisCSVRowsEnrichis(tournee)` : mappe `ColisCompositionEnrichi[]` → `ColisCSVRowEnrichi[]`
  - `LIVRE` → `'Livré'`, `ECHEC` → `'Échec'`, `EN_COURS` → `'En cours'`
  - `destinataire` absent → chaîne vide
- `serialiserEnCSVEnrichi(rows)` : entête `#Colis,Destinataire,Adresse,Zone,Contrainte,Statut` + BOM UTF-8 + CRLF
- `exporterCSVEnrichi(tournee)` : orchestrateur (point d'entrée pour `DetailTourneePlanifieePage`)

### Invariants respectés
- Les virgules dans les noms de destinataires sont protégées par guillemets (escaping)
- `destinataire` absent → chaîne vide (non null) dans le CSV
- Les colonnes existantes préservées dans le même ordre (`#Colis` en 1ère, `Destinataire` en 2ème, `Statut` en dernière)
- Aucune modification des fonctions US-028 (`construireColisCSVRows`, `serialiserEnCSV`)

---

## Tests

| Fichier | Type | Tests | Résultats |
|---|---|---|---|
| `exporterCSV.US040.test.ts` | TDD — unitaires (fonctions pures) | 15 tests | 15/15 |
| `exporterCSV.test.ts` | Rétrocompatibilité US-028 | 10 tests | 10/10 (inchangés) |

**Suite totale web** : 264/265 (1 échec pré-existant US-044).

### Scénarios couverts

- SC1 : 6 champs dans chaque ligne, en-tête avec 6 colonnes
- SC2 : `LIVRE` → `'Livré'`
- SC3 : `ECHEC` → `'Échec'`
- SC4 : `EN_COURS` → `'En cours'`
- SC5 : 1 ligne par colis + BOM UTF-8 + CRLF
- SC6 : `destinataire` absent → chaîne vide
- SC7 : virgule dans `Destinataire` → guillemets
