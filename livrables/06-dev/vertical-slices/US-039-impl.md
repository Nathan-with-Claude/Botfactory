# Implémentation US-039 : Télécharger le bilan des tournées du jour depuis le tableau de bord

## Contexte

**User Story** : En tant que superviseur logistique, je veux télécharger un fichier CSV de toutes les tournées du jour avec leur statut final depuis le tableau de bord W-01, afin de produire mon rapport de fin de journée.

**Lien US** : `/livrables/05-backlog/user-stories/US-039-export-csv-tableau-de-bord.md`
**Sprint** : Sprint 6 (post-feedback Laurent Renaud 2026-04-01)
**Priorité** : Should Have
**Branche git** : `feature/US-001`

---

## Bounded Context et couche ciblée

- **BC** : BC-03 — Supervision (Core Domain)
- **Aggregate(s) modifiés** : aucun (opération lecture pure sur Read Model `VueTournee`)
- **Domain Events émis** : aucun

---

## Décisions d'implémentation

### Interface Layer (Web — React + TypeScript)

**Nouveau fichier** : `src/utils/exporterCSVBilan.ts`
- `genererCSVBilanTournees(tournees: VueTourneeDTO[]): string` — génère le contenu CSV (BOM UTF-8 + CRLF)
  - Colonnes : `#Tournee, Livreur, NbColis, NbLivres, NbEchecs, StatutFinal`
  - Escaping des virgules et guillemets
- `construireNomFichierBilan(date: string): string` — `bilan-tournees-AAAA-MM-JJ.csv`
- `declencherTelechargementBilan(contenu, nomFichier): void`
- `exporterCSVBilan(tournees, dateJour): void` — point d'entrée

**Modification `VueTourneeDTO`** dans `TableauDeBordPage.tsx` :
- Ajout de `nbLivres?: number` et `nbEchecs?: number` (champs optionnels pour l'export bilan)

**Modification `TableauDeBordPage.tsx`** :
- Nouveau bouton `data-testid="btn-telecharger-bilan"` visible si `tableau.tournees.length > 0`
- Bouton "Télécharger le bilan du jour" (bleu #1565c0) distinct du bouton "Exporter le bilan" existant (`btn-exporter-bilan`)
- Le bouton appelle le callback `onExporterBilan` (injection de dépendance pour les tests)
- Les deux boutons coexistent (SC5 — indépendance avec US-028/export W-05)

### Invariants respectés
- Bouton masqué si aucune tournée du jour
- Opération de lecture pure — aucun Domain Event émis, aucun Aggregate modifié
- Le CSV ne contient que les données disponibles dans le Read Model `VueTournee`

---

## Tests

| Fichier | Type | Tests | Résultats |
|---|---|---|---|
| `TableauDeBordPage.US039.test.tsx` | TDD — unitaires + intégration | 13 tests | 13/13 |

**Suite totale web** : 264/265 (1 échec pré-existant US-044 bug Babel/TS svc-supervision).

### Scénarios couverts

- SC1 : bouton visible si au moins une tournée
- SC2 : clic déclenche `onExporterBilan`
- SC3 : nom de fichier dynamique `bilan-tournees-AAAA-MM-JJ.csv`
- SC4 : bouton absent si aucune tournée
- SC5 : coexistence avec `btn-exporter-bilan` (US-028)
- Tests unitaires `genererCSVBilanTournees` : BOM, CRLF, colonnes, escaping
