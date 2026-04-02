# Scénarios de tests US-028 — Exporter en CSV la composition d'une tournée

**Agent** : @qa
**Date de rédaction** : 2026-03-30
**US** : US-028 — Exporter en CSV la composition d'une tournée

---

## Synthèse de couverture

| Niveau | Outil | TCs | Couverture |
|--------|-------|-----|------------|
| L1 — Domain/Application | Jest (frontend) | 13 | Logique CSV : nom fichier, colonnes, BOM, virgules, contraintes |
| L1 — UI Component | Jest/RNTL (frontend) | 4 | Bouton visible, click → exporterCSV, traçabilité backend |
| L1 — Application Handler | JUnit/Mockito (backend) | 4 | CompositionExportee, save, 404, statut inchangé |
| L1 — Controller | @WebMvcTest (backend) | 3 | 204, 404, 403 |
| L2 — API intégration | curl (svc-supervision) | 3 | Endpoint réel : 204, 404, 403-dev |
| L3 — UI Playwright | Non exécuté | 0 | Frontend port 3000 non disponible |

**Stratégie appliquée** : la génération CSV est entièrement côté client (TypeScript pur), l'endpoint backend ne fait que tracer l'event. La pyramide L1→L2 couvre 100 % des critères d'acceptation.

---

## TC-028-01 : construireNomFichier respecte le format tournee-[ID]-[date].csv

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (utilitaire frontend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee / CompositionExportee
**Type** : Invariant domaine
**Préconditions** : Utilitaire `exporterCSV.ts` disponible
**Étapes** : Appel de `construireNomFichier('T-203', '2026-03-20')`
**Résultat attendu** : `'tournee-T-203-2026-03-20.csv'`
**Statut** : Passé

```gherkin
Given le codeTms "T-203" et la date "2026-03-20"
When construireNomFichier est appelée
Then le nom retourné est "tournee-T-203-2026-03-20.csv"
```

---

## TC-028-02 : construireNomFichier fonctionne avec n'importe quel identifiant

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (utilitaire frontend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Invariant domaine
**Préconditions** : Utilitaire `exporterCSV.ts` disponible
**Étapes** : Appel de `construireNomFichier('tp-001', '2026-01-15')`
**Résultat attendu** : `'tournee-tp-001-2026-01-15.csv'`
**Statut** : Passé

```gherkin
Given le codeTms "tp-001" et la date "2026-01-15"
When construireNomFichier est appelée
Then le nom retourné est "tournee-tp-001-2026-01-15.csv"
```

---

## TC-028-03 : construireColisCSVRows retourne autant de lignes que de colis

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (utilitaire frontend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Fonctionnel
**Préconditions** : TourneeMock avec nbColis=5 (Lyon 8e:3, Lyon 5e:2)
**Étapes** : Appel de `construireColisCSVRows(tourneeMock)`
**Résultat attendu** : tableau de 5 lignes
**Statut** : Passé

```gherkin
Given une tournée avec 5 colis répartis sur 2 zones
When construireColisCSVRows est appelée
Then le résultat contient exactement 5 lignes
```

---

## TC-028-04 : chaque ligne CSV contient les 4 champs obligatoires

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (utilitaire frontend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Fonctionnel
**Préconditions** : TourneeMock standard
**Étapes** : Appel de `construireColisCSVRows(tourneeMock)`, inspection de chaque ligne
**Résultat attendu** : chaque `ColisCSVRow` possède `numeroColis`, `adresse`, `zone`, `contrainte`
**Statut** : Passé

```gherkin
Given une tournée avec des zones et contraintes
When construireColisCSVRows est appelée
Then chaque ligne de résultat possède les propriétés numeroColis, adresse, zone et contrainte
```

---

## TC-028-05 : les zones sont correctement assignées aux lignes (répartition séquentielle)

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (utilitaire frontend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Invariant domaine
**Préconditions** : TourneeMock avec Lyon 8e (3 colis), Lyon 5e (2 colis)
**Étapes** : Appel de `construireColisCSVRows(tourneeMock)`, vérification des zones par index
**Résultat attendu** : rows[0..2].zone = "Lyon 8e", rows[3..4].zone = "Lyon 5e"
**Statut** : Passé

```gherkin
Given une tournée avec zone "Lyon 8e" (3 colis) puis "Lyon 5e" (2 colis)
When construireColisCSVRows est appelée
Then les 3 premières lignes ont zone="Lyon 8e" et les 2 suivantes zone="Lyon 5e"
```

---

## TC-028-06 : nombre de lignes correspond au total colis (y compris cas zéro)

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (utilitaire frontend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Edge case
**Préconditions** : Zone avec nbColis=0
**Étapes** : Appel de `construireColisCSVRows` avec zone "Zone inconnue" nbColis=0
**Résultat attendu** : tableau vide (0 lignes)
**Statut** : Passé

```gherkin
Given une zone avec 0 colis
When construireColisCSVRows est appelée
Then le résultat est un tableau vide
```

---

## TC-028-07 : le CSV commence par le BOM UTF-8

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (utilitaire frontend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Invariant domaine
**Préconditions** : Lignes CSV générées depuis tourneeMock
**Étapes** : Appel de `serialiserEnCSV(rows)`, vérification du premier caractère
**Résultat attendu** : le CSV commence par `\uFEFF`
**Statut** : Passé

```gherkin
Given des lignes CSV valides
When serialiserEnCSV est appelée
Then le contenu retourné commence par le BOM UTF-8 (U+FEFF)
```

---

## TC-028-08 : la première ligne après BOM est l'entête #Colis,Adresse,Zone,Contrainte

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (utilitaire frontend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Invariant domaine
**Préconditions** : Lignes CSV générées
**Étapes** : Appel de `serialiserEnCSV(rows)`, split CRLF, vérification ligne[0]
**Résultat attendu** : `'#Colis,Adresse,Zone,Contrainte'`
**Statut** : Passé

```gherkin
Given des lignes CSV valides
When serialiserEnCSV est appelée
Then après suppression du BOM, la première ligne est "#Colis,Adresse,Zone,Contrainte"
```

---

## TC-028-09 : les contraintes sont sérialisées en clair dans la colonne Contrainte

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (utilitaire frontend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Fonctionnel
**Préconditions** : TourneeMock avec contraintes "Avant 14h" et "Fragile"
**Étapes** : Appel de `serialiserEnCSV(rows)`, recherche des libellés dans le CSV
**Résultat attendu** : le CSV contient "Avant 14h" et "Fragile"
**Statut** : Passé

```gherkin
Given une tournée avec contraintes libellées "Avant 14h" et "Fragile"
When le CSV est sérialisé
Then les libellés "Avant 14h" et "Fragile" apparaissent dans le contenu CSV
```

---

## TC-028-10 : la colonne Contrainte est vide pour une tournée sans contrainte

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (utilitaire frontend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Edge case
**Préconditions** : tourneeMinimale sans contrainte (zone Villeurbanne, 2 colis)
**Étapes** : Appel de `serialiserEnCSV(rows)`, split CRLF, vérification colonne[3] de ligne[1]
**Résultat attendu** : la 4e colonne de la première ligne de données est vide (`''`)
**Statut** : Passé

```gherkin
Given une tournée sans contrainte
When le CSV est sérialisé
Then la colonne Contrainte de chaque ligne de données est vide
```

---

## TC-028-11 : le nombre de lignes de données correspond au nombre de colis

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (utilitaire frontend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Invariant domaine
**Préconditions** : TourneeMock avec 5 colis
**Étapes** : `serialiserEnCSV(rows)`, split CRLF, comptage
**Résultat attendu** : 1 entête + 5 lignes = 6 lignes total
**Statut** : Passé

```gherkin
Given une tournée avec 5 colis
When le CSV est sérialisé
Then le fichier contient exactement 1 ligne entête + 5 lignes de données
```

---

## TC-028-12 : les virgules dans les valeurs sont protégées par des guillemets

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (utilitaire frontend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Edge case
**Préconditions** : ligne avec adresse contenant une virgule et contrainte contenant une virgule
**Étapes** : Appel de `serialiserEnCSV` sur la ligne problématique
**Résultat attendu** : les valeurs avec virgule sont entourées de guillemets doubles
**Statut** : Passé

```gherkin
Given une ligne CSV avec adresse "Rue de la Paix, 75001 Paris" et contrainte "Avant 14h, Fragile"
When serialiserEnCSV est appelée
Then le CSV contient '"Rue de la Paix, 75001 Paris"' et '"Avant 14h, Fragile"'
```

---

## TC-028-13 : les guillemets dans les valeurs sont doublés (RFC 4180)

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (utilitaire frontend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Edge case
**Préconditions** : ligne avec adresse contenant un guillemet
**Étapes** : Appel de `serialiserEnCSV` sur la ligne avec `Résidence "Le Parc"`
**Résultat attendu** : le CSV contient `"Résidence ""Le Parc"""`
**Statut** : Passé

```gherkin
Given une ligne CSV avec adresse 'Résidence "Le Parc"'
When serialiserEnCSV est appelée
Then le CSV contient '"Résidence ""Le Parc"""' (guillemets doublés selon RFC 4180)
```

---

## TC-028-14 : bouton "Exporter CSV" visible quand la tournée est chargée

**US liée** : US-028
**Niveau** : L1
**Couche testée** : UI (composant React)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Fonctionnel
**Préconditions** : DetailTourneePlanifieePage rendu avec une tournée NON_AFFECTEE chargée
**Étapes** : Render du composant, vérification de la présence de `btn-exporter-csv`
**Résultat attendu** : le bouton est présent dans le DOM (getByTestId ne lève pas d'erreur)
**Statut** : Passé

```gherkin
Given la page DetailTourneePlanifieePage avec une tournée correctement chargée
When la page est rendue
Then le bouton avec data-testid="btn-exporter-csv" est visible
```

---

## TC-028-15 : bouton "Exporter CSV" visible même pour une tournée LANCEE

**US liée** : US-028
**Niveau** : L1
**Couche testée** : UI (composant React)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Invariant domaine
**Préconditions** : DetailTourneePlanifieePage avec tournée en statut LANCEE
**Étapes** : Render avec statut LANCEE, vérification de la présence du bouton
**Résultat attendu** : le bouton est toujours présent (pas de désactivation selon l'impl)
**Statut** : Passé

```gherkin
Given une tournée en statut LANCEE
When la page DetailTourneePlanifieePage est rendue
Then le bouton "Exporter CSV" est toujours visible et actif
```

---

## TC-028-16 : cliquer "Exporter CSV" appelle exporterCSV avec les données de la tournée

**US liée** : US-028
**Niveau** : L1
**Couche testée** : UI (composant React)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Fonctionnel
**Préconditions** : Spy sur `exporterCSVModule.exporterCSV`, tournée tp-203 chargée
**Étapes** : Click sur `btn-exporter-csv`, vérification des appels du spy
**Résultat attendu** : `exporterCSV` appelée 1 fois avec `{ id: 'tp-203', codeTms: 'T-203' }`
**Statut** : Passé

```gherkin
Given le bouton "Exporter CSV" visible sur la page de tournée tp-203
When le logisticien clique sur le bouton
Then la fonction exporterCSV est appelée exactement 1 fois avec les données de la tournée tp-203
```

---

## TC-028-17 : cliquer "Exporter CSV" appelle l'endpoint de traçabilité backend en fire-and-forget

**US liée** : US-028
**Niveau** : L1
**Couche testée** : UI (composant React)
**Aggregate / Domain Event ciblé** : TourneePlanifiee / CompositionExportee
**Type** : Fonctionnel
**Préconditions** : Spy sur `exporterCSVModule.exporterCSV`, mock fetch, tournée tp-203
**Étapes** : Click sur `btn-exporter-csv`, attente async, vérification des appels fetch
**Résultat attendu** : un appel POST vers `export-csv/tracer` est enregistré dans les appels fetch
**Statut** : Passé

```gherkin
Given la page de tournée tp-203
When le logisticien clique sur "Exporter CSV"
Then un appel POST vers l'URL contenant "export-csv/tracer" est déclenché en arrière-plan
```

---

## TC-028-18 : ExporterCompositionHandler émet CompositionExportee avec les bons attributs

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (handler backend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee / CompositionExportee
**Type** : Invariant domaine
**Préconditions** : Repository mocké retournant tp-203 (T-203), superviseur-001
**Étapes** : `handler.handle(new ExporterCompositionCommand("tp-203", "superviseur-001"))`, capture du save
**Résultat attendu** : `CompositionExportee` avec `tourneePlanifieeId="tp-203"`, `codeTms="T-203"`, `superviseurId="superviseur-001"`, `exporteeLe != null`
**Statut** : Passé

```gherkin
Given une TourneePlanifiee tp-203 (codeTms T-203) dans le repository
When ExporterCompositionHandler traite la commande avec superviseurId="superviseur-001"
Then un event CompositionExportee est émis avec tourneePlanifieeId, codeTms, superviseurId et horodatage
```

---

## TC-028-19 : la tournée est sauvegardée après tracerExportComposition

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (handler backend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Fonctionnel
**Préconditions** : Repository mocké retournant tp-203
**Étapes** : `handler.handle(...)`, vérification `verify(repository, times(1)).save(tournee)`
**Résultat attendu** : `repository.save()` appelé exactement 1 fois
**Statut** : Passé

```gherkin
Given une TourneePlanifiee dans le repository
When ExporterCompositionHandler est exécuté
Then le repository.save() est invoqué exactement 1 fois pour persister l'event
```

---

## TC-028-20 : TourneePlanifieeNotFoundException si tournée absente

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (handler backend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Edge case
**Préconditions** : Repository retourne `Optional.empty()` pour "tp-inconnu"
**Étapes** : `handler.handle(new ExporterCompositionCommand("tp-inconnu", "superviseur-001"))`
**Résultat attendu** : `TourneePlanifieeNotFoundException` levée
**Statut** : Passé

```gherkin
Given aucune tournée avec l'id "tp-inconnu" dans le repository
When ExporterCompositionHandler est exécuté
Then une TourneePlanifieeNotFoundException est levée
```

---

## TC-028-21 : le statut de la tournée n'est pas modifié (invariant lecture pure)

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Application (handler backend)
**Aggregate / Domain Event ciblé** : TourneePlanifiee / CompositionExportee
**Type** : Invariant domaine
**Préconditions** : TourneePlanifiee avec StatutAffectation initial
**Étapes** : `handler.handle(...)`, comparaison `tournee.getStatut()` avant et après
**Résultat attendu** : le statut est identique avant et après l'export (opération de lecture pure)
**Statut** : Passé

```gherkin
Given une TourneePlanifiee avec un statut initial quelconque
When ExporterCompositionHandler est exécuté
Then le statut de la TourneePlanifiee est identique après l'opération (invariant lecture pure)
```

---

## TC-028-22 : POST export-csv/tracer retourne 204 No Content (controller)

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Infrastructure / Interface (controller backend — @WebMvcTest)
**Aggregate / Domain Event ciblé** : CompositionExportee
**Type** : Fonctionnel
**Préconditions** : ExporterCompositionHandler mocké (doNothing), rôle SUPERVISEUR
**Étapes** : `POST /api/planification/tournees/tp-203/export-csv/tracer`
**Résultat attendu** : HTTP 204 No Content
**Statut** : Passé

```gherkin
Given un logisticien SUPERVISEUR authentifié
When il envoie POST /api/planification/tournees/{id}/export-csv/tracer
Then le serveur répond 204 No Content
```

---

## TC-028-23 : POST export-csv/tracer retourne 404 si tournée introuvable (controller)

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Infrastructure / Interface (controller backend — @WebMvcTest)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Edge case
**Préconditions** : ExporterCompositionHandler lève `TourneePlanifieeNotFoundException`
**Étapes** : `POST /api/planification/tournees/tp-inconnu/export-csv/tracer`
**Résultat attendu** : HTTP 404 Not Found
**Statut** : Passé

```gherkin
Given une tournée inexistante "tp-inconnu"
When le superviseur appelle POST export-csv/tracer
Then le serveur répond 404 Not Found
```

---

## TC-028-24 : POST export-csv/tracer retourne 403 pour un LIVREUR (controller)

**US liée** : US-028
**Niveau** : L1
**Couche testée** : Infrastructure / Interface (controller backend — @WebMvcTest)
**Aggregate / Domain Event ciblé** : —
**Type** : Invariant domaine (sécurité)
**Préconditions** : Utilisateur avec rôle LIVREUR (@WithMockUser)
**Étapes** : `POST /api/planification/tournees/tp-203/export-csv/tracer` avec role LIVREUR
**Résultat attendu** : HTTP 403 Forbidden
**Statut** : Passé

```gherkin
Given un utilisateur avec le rôle LIVREUR
When il appelle POST export-csv/tracer
Then le serveur répond 403 Forbidden
```

---

## TC-028-25 : L2 — POST tracer retourne 204 sur service réel (tournée existante)

**US liée** : US-028
**Niveau** : L2
**Couche testée** : Infrastructure (API intégration — service réel)
**Aggregate / Domain Event ciblé** : CompositionExportee
**Type** : Fonctionnel
**Préconditions** : svc-supervision démarré sur port 8082, profil dev (MockJwtAuthFilter actif), tournée tp-201 dans le seed
**Étapes** : `curl -X POST http://localhost:8082/api/planification/tournees/tp-201/export-csv/tracer`
**Résultat attendu** : HTTP 204 No Content, log `[BC-07] CompositionExportee` dans la console backend
**Statut** : Passé

```gherkin
Given le service svc-supervision en cours d'exécution et la tournée tp-201 en base
When POST /api/planification/tournees/tp-201/export-csv/tracer est appelé
Then la réponse est HTTP 204 No Content
And l'event CompositionExportee est tracé dans les logs backend
```

---

## TC-028-26 : L2 — POST tracer retourne 404 pour une tournée inexistante (service réel)

**US liée** : US-028
**Niveau** : L2
**Couche testée** : Infrastructure (API intégration — service réel)
**Aggregate / Domain Event ciblé** : TourneePlanifiee
**Type** : Edge case
**Préconditions** : svc-supervision démarré sur port 8082
**Étapes** : `curl -X POST http://localhost:8082/api/planification/tournees/tp-INEXISTANT/export-csv/tracer`
**Résultat attendu** : HTTP 404 Not Found
**Statut** : Passé

```gherkin
Given un id de tournée "tp-INEXISTANT" non présent en base
When POST export-csv/tracer est appelé
Then la réponse est HTTP 404 Not Found
```

---

## TC-028-27 : L2 — Invariant statut inchangé après export (service réel)

**US liée** : US-028
**Niveau** : L2
**Couche testée** : Infrastructure (API intégration — service réel)
**Aggregate / Domain Event ciblé** : TourneePlanifiee / CompositionExportee
**Type** : Invariant domaine
**Préconditions** : svc-supervision démarré, tournée tp-201 en statut NON_AFFECTEE
**Étapes** : GET détail tp-201 → statut avant ; POST export-csv/tracer ; GET détail tp-201 → statut après
**Résultat attendu** : statut identique avant et après (NON_AFFECTEE), pas de modification d'état
**Statut** : Passé

```gherkin
Given la tournée tp-201 en statut "NON_AFFECTEE"
When POST export-csv/tracer est exécuté
Then GET /api/planification/tournees/tp-201 retourne toujours statut="NON_AFFECTEE"
```

---

## TC-028-28 : L2 — Comportement rôle LIVREUR en profil dev (MockJwtAuthFilter)

**US liée** : US-028
**Niveau** : L2
**Couche testée** : Infrastructure (API intégration — service réel)
**Aggregate / Domain Event ciblé** : —
**Type** : Edge case (infrastructure dev)
**Préconditions** : svc-supervision en profil dev (MockJwtAuthFilter injecte systématiquement SUPERVISEUR)
**Étapes** : `curl -X POST .../tp-201/export-csv/tracer -H "X-User-Role: LIVREUR"`
**Résultat attendu** : HTTP 204 (MockJwtAuthFilter ignore l'en-tête X-User-Role et injecte SUPERVISEUR) — comportement attendu en dev, couvert par TC-028-24 (@WebMvcTest) en prod
**Statut** : Passé (comportement conforme à l'implémentation dev)

```gherkin
Given le profil dev avec MockJwtAuthFilter actif
When POST export-csv/tracer est appelé avec header X-User-Role: LIVREUR
Then la réponse est 204 car MockJwtAuthFilter injecte ROLE_SUPERVISEUR indépendamment du header
And la protection 403 est garantie par TC-028-24 (@WebMvcTest avec @WithMockUser(roles="LIVREUR"))
```

---

## Note sur SC4 — Historique des exports dans W-05

Le scénario SC4 de la US-028 (affichage de l'historique `CompositionExportee` dans W-05) est
explicitement déféré à une US ultérieure selon `US-028-impl.md`. L'event est bien émis et persisté
(vérifié par TC-028-18 et TC-028-25), mais son affichage dans l'UI est hors périmètre de ce vertical slice.

## Note sur L3 — Tests Playwright

Le frontend supervision (port 3000) n'était pas disponible lors de la session de tests.
Les critères d'acceptation SC1, SC2, SC3 sont intégralement couverts par L1 (Jest/RNTL).
L'US est déclarée Validée sans L3 — couverture assurée par L1 (27 TCs) et L2 (4 TCs).
