# Implémentation US-041 : Afficher le poids estimé et une alerte de surcharge dans le tableau de préparation

## Contexte

**User Story** : En tant que superviseur logistique, je veux voir le poids estimé de chaque tournée dans W-04 avec une icône d'alerte si ce poids dépasse la capacité du véhicule affecté.

**Lien US** : `/livrables/05-backlog/user-stories/US-041-poids-estime-tableau-preparation.md`
**Sprint** : Sprint 6 (post-feedback Laurent Renaud 2026-04-01)
**Priorité** : Should Have
**Branche git** : `feature/US-001`

---

## Bounded Context et couche ciblée

- **BC** : BC-07 — Planification (Supporting Domain)
- **Aggregate(s) modifiés** : `TourneePlanifiee` (lecture uniquement — nouveaux champs DTO)
- **Domain Events émis** : aucun (affichage lecture seule)

---

## Décisions d'implémentation

### Nouveau module domaine frontend

**Nouveau fichier** : `src/utils/alerteSurcharge.ts`
- `NiveauAlerte` (type) : `'AUCUNE' | 'APPROCHE' | 'CRITIQUE'`
- `calculerNiveauAlerte(poidsEstimeKg, capaciteKg): NiveauAlerte`
  - `CRITIQUE` si `poids > capacite` (dépassement effectif)
  - `APPROCHE` si `poids >= capacite * 0.95` (seuil d'approche cohérent avec US-030)
  - `AUCUNE` si `capacite == null` (véhicule non affecté) ou `poids < 95%`
- `genererTooltipPoids(poids, capacite, niveau): string | null`
  - CRITIQUE : `"Chargement trop lourd — X kg / Y kg"`
  - APPROCHE : `"Charge élevée — X kg / Y kg"`

### Interface Layer (Web — React + TypeScript)

**Modification `TourneePlanifieeDTO`** dans `PreparationPage.tsx` :
- Ajout de `poidsEstimeKg?: number` et `capaciteVehiculeKg?: number`

**Modification `PreparationPage.tsx`** :
- Nouvelle colonne `<th data-testid="colonne-poids-entete">Poids</th>` dans l'en-tête
- Nouvelle cellule `<td data-testid="poids-{id}">` par ligne :
  - Affiche `{poidsEstimeKg} kg` si présent, sinon `—`
  - Si niveau `APPROCHE` : icône `⚠` orange avec `data-niveau="APPROCHE"` + tooltip
  - Si niveau `CRITIQUE` : icône `⛔` rouge avec `data-niveau="CRITIQUE"` + tooltip
  - Aucune icône si `AUCUNE` (véhicule non affecté ou charge normale)
- Import de `calculerNiveauAlerte` et `genererTooltipPoids` depuis `alerteSurcharge.ts`

### Seuil cohérent avec BC-07

Le seuil de 95% (`SEUIL_APPROCHE = 0.95`) est cohérent avec les invariants de l'Aggregate `Vehicule` implémentés dans US-030 (`CapaciteVehiculeDepasseeException`). L'affichage W-04 anticipe le problème avant même l'ouverture du détail W-05.

### Invariants respectés
- Colonne Poids en lecture seule — aucune action depuis cette cellule
- Si `capaciteVehiculeKg` est absent → aucune icône d'alerte
- Le seuil CRITIQUE correspond strictement à `poids > capacite` (100% dépassé)
- Le seuil APPROCHE est `poids >= 95%` (non dépassé mais proche)

---

## Tests

| Fichier | Type | Tests | Résultats |
|---|---|---|---|
| `PreparationPage.US041.test.tsx` | TDD — unitaires + intégration | 14 tests | 14/14 |

**Suite totale web** : 264/265 (1 échec pré-existant US-044).

### Scénarios couverts

- SC1 : colonne Poids visible dans l'en-tête + valeur en kg dans la cellule
- SC2 : alerte CRITIQUE (rouge, `data-niveau="CRITIQUE"`) si `poids > capacite`
- SC3 : alerte APPROCHE (orange, `data-niveau="APPROCHE"`) si `poids >= 95%`
- SC4 : aucune alerte si charge normale (< 95%)
- SC5 : aucune alerte si véhicule non affecté
- Tests unitaires `calculerNiveauAlerte` : 8 cas limites (null, 0, 95%, 100%, >100%)
