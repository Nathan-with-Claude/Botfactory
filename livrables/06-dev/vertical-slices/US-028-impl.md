# Implémentation US-028 : Exporter en CSV la composition d'une tournée

## Contexte

En tant que responsable logistique, je veux pouvoir exporter en CSV la liste des colis d'une tournée
depuis l'onglet Composition de W-05, afin de pouvoir imprimer la feuille de route ou la transmettre
en cas de défaillance système.

- US : `/livrables/05-backlog/user-stories/US-028-export-csv-plan-du-jour.md`
- Wireframe : `/livrables/02-ux/wireframes.md#W-05`
- Prérequis : US-022 (composition), US-023 (affectation), US-024 (lancement)

---

## Bounded Context et couche ciblée

- **BC** : BC-07 Planification de Tournée (Core Domain)
- **Aggregate(s) modifiés** : `TourneePlanifiee` (nouvelle méthode `tracerExportComposition`)
- **Domain Events émis** : `CompositionExportee`

---

## Décisions d'implémentation

### Domain Layer

- **`CompositionExportee`** (nouveau) — record immuable avec `tourneePlanifieeId`, `codeTms`,
  `superviseurId`, `exporteeLe`. Aucun changement d'état dans la `TourneePlanifiee`.
- **`TourneePlanifiee.tracerExportComposition(superviseurId)`** (nouveau) — émet `CompositionExportee`
  dans la liste collect-and-publish. N'aligne pas le statut (opération lecture pure).

### Application Layer

- **`ExporterCompositionCommand`** (nouveau) — record avec `tourneePlanifieeId`, `superviseurId`.
- **`ExporterCompositionHandler`** (nouveau) — orchestre : findById → tracerExportComposition
  → save → clearEvenements. Pattern collect-and-publish identique à `ValiderCompositionHandler`.

### Infrastructure Layer

- Aucune infrastructure nouvelle. Le `TourneePlanifieeRepository` existant est réutilisé.
- La `TourneePlanifiee` est sauvegardée après émission de l'event (traçabilité en base).

### Interface Layer (backend)

- Nouveau endpoint : `POST /api/planification/tournees/{id}/export-csv/tracer`
- Retourne 204 No Content si OK, 404 si tournée introuvable, 403 si non-SUPERVISEUR.
- `PlanificationController` reçoit `ExporterCompositionHandler` par injection de dépendance.
- Log `[BC-07] CompositionExportee` pour traçabilité opérationnelle.

**Choix POST et non GET** : l'endpoint a un effet de bord (émet un event de traçabilité, modifie
l'état de l'agrégat). POST est sémantiquement correct. La génération du fichier CSV étant côté
client, aucun body n'est retourné (204).

### Frontend (web supervision)

- **`src/utils/exporterCSV.ts`** (nouveau) — utilitaire pur avec 4 fonctions :
  - `construireColisCSVRows(tournee)` — construit les lignes CSV depuis zones + contraintes
  - `serialiserEnCSV(rows)` — sérialise avec BOM UTF-8, guillemets pour les virgules
  - `construireNomFichier(id, date)` — format `tournee-[ID]-[date].csv`
  - `exporterCSV(tournee)` — point d'entrée orchestrateur (download via Blob URL)
- **`DetailTourneePlanifieePage.tsx`** — ajout bouton `btn-exporter-csv` dans l'onglet Composition,
  fonction `handleExporterCSV` qui :
  1. Appelle `exporterCSV(tourneePourExport)` (côté client — immédiat)
  2. Appelle `POST .../export-csv/tracer` en fire-and-forget (ne bloque pas l'UX)

**Choix génération côté client** : la `TourneePlanifiee` BC-07 ne stocke pas les colis individuels
(seulement les méta-données de composition : zones, contraintes, anomalies). La génération d'un
CSV par colis se fait en répartissant les effectifs de zones. Ce choix évite un streaming backend
et reste simple (pas de state colis individuel dans BC-07 au niveau du plan du jour). Les colonnes
CSV sont : `#Colis,Adresse,Zone,Contrainte` conformément à la spec US-028 SC2.

### Colonnes CSV et mappage domaine

| Colonne CSV | Mappage dans `TourneePourExport` |
|-------------|----------------------------------|
| `#Colis`    | Numéro séquentiel 0001–N (padded) |
| `Adresse`   | `zone.nom` (meilleure approximation sans adresse individuelle) |
| `Zone`      | `zone.nom` |
| `Contrainte`| `contrainte.libelle` (répartition cyclique entre colis d'une zone) |

### Erreurs / invariants préservés

- L'export ne modifie pas le statut de la `TourneePlanifiee` (lecture pure — vérifié par test SC4).
- La traçabilité backend est non bloquante : si l'appel échoue, le fichier CSV a déjà été téléchargé.
- Le bouton est toujours visible et actif (même pour une tournée LANCEE) — pas de désactivation.
- Format du fichier : BOM UTF-8 + séparateur CRLF pour compatibilité Excel.

---

## Tests

### Tests unitaires frontend

**Fichier** : `src/web/supervision/src/__tests__/exporterCSV.test.ts`

| Test | Scénario |
|------|----------|
| SC1 — format nom de fichier | `construireNomFichier` respecte `tournee-[ID]-[date].csv` |
| SC2 — nombre de lignes | autant de lignes que de colis |
| SC2 — champs CSV | chaque ligne a les 4 colonnes attendues |
| SC2 — zones assignées | chaque zone génère le bon nombre de lignes |
| SC2 — entête CSV | `#Colis,Adresse,Zone,Contrainte` |
| SC2 — nombre de lignes total | 1 entête + N colis |
| SC3 — BOM UTF-8 | le CSV commence par `\uFEFF` |
| SC4 — contraintes en clair | les libellés de contraintes apparaissent dans le CSV |
| SC5 — virgules protégées | guillemets autour des valeurs contenant des virgules |
| SC5 — guillemets doublés | `"` → `""` dans les valeurs |
| SC6 — sans contrainte | colonne Contrainte vide |
| SC7 — total colis | nombre de lignes = nbColis de la tournée |

Total : **13/13 tests verts**

**Fichier** : `src/web/supervision/src/__tests__/DetailTourneePlanifieePage.test.tsx` (section US-028)

| Test | Scénario |
|------|----------|
| SC3 — bouton visible | `btn-exporter-csv` présent quand tournée chargée |
| SC3 — bouton visible LANCEE | `btn-exporter-csv` présent même en statut LANCEE |
| SC1 — appel exporterCSV | `exporterCSV` appelée avec les données de la tournée |
| SC1 — traçabilité backend | endpoint `export-csv/tracer` appelé en POST |

Nouveau : **4/4 tests verts** | Total fichier : **15/15 tests verts**

### Tests unitaires backend

**Fichier** : `src/backend/svc-supervision/src/test/java/.../application/planification/ExporterCompositionHandlerTest.java`

| Test | Scénario |
|------|----------|
| SC1 — CompositionExportee émis | event avec bons attributs lors du save |
| SC2 — save appelé | repository.save() invoqué exactement 1 fois |
| SC3 — 404 tournée introuvable | `TourneePlanifieeNotFoundException` levée |
| SC4 — statut inchangé | `StatutAffectation` identique avant et après |

**4/4 tests verts**

**Fichier** : `src/backend/svc-supervision/src/test/java/.../interfaces/planification/PlanificationControllerTest.java` (section US-028)

| Test | Scénario |
|------|----------|
| 204 traçabilité OK | POST retourne 204 No Content |
| 404 tournée introuvable | POST retourne 404 Not Found |
| 403 non-SUPERVISEUR | POST retourne 403 Forbidden |

Nouveau : **3/3 tests verts** | Total fichier : **13/13 tests verts**

---

## Commandes pour tester en local

### Frontend

```bash
cd src/web/supervision
CI=true npx react-scripts test --testPathPattern="exporterCSV|DetailTourneePlanifieePage" --no-coverage
```

### Backend

```bash
cd src/backend/svc-supervision
mvn test -Dtest="ExporterCompositionHandlerTest,PlanificationControllerTest"
```

### Test manuel (W-05)

1. Lancer `svc-supervision` : `mvn spring-boot:run` (port 8082)
2. Ouvrir `/preparation/tournee/tp-001` (ou l'ID d'une tournée valide)
3. Cliquer sur l'onglet "Composition"
4. Cliquer sur le bouton "Exporter CSV"
5. Vérifier : téléchargement déclenché, nom `tournee-T-XXX-YYYY-MM-DD.csv`
6. Ouvrir le fichier CSV — vérifier entête `#Colis,Adresse,Zone,Contrainte` + lignes
7. Vérifier dans les logs backend : `[BC-07] CompositionExportee : tourneePlanifieeId=...`

---

## Scénario déféré

- **SC4 — Historique des exports visible dans W-05** : l'event `CompositionExportee` est bien émis
  et sauvegardé, mais l'affichage de l'historique dans l'UI W-05 est déféré à une US ultérieure
  (US-028 SC4 n'est pas dans le périmètre de ce vertical slice).
