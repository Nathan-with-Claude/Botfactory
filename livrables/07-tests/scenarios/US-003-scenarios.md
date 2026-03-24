# Scénarios de tests US-003 — Filtrer et organiser les colis par zone géographique

**User Story** : US-003
**Auteur** : @qa
**Date** : 2026-03-23
**Version** : 1.0
**Statut global** : Exécutés (Jest) / Non exécutés (E2E Playwright — infrastructure non disponible)

---

## Périmètre de la US

- **Bounded Context** : BC-01 Orchestration de Tournée
- **Aggregate ciblé** : Tournée (lecture seule)
- **Domain Events attendus** : aucun (invariant US-003 — le filtrage est une opération locale pure)
- **Couche principale** : Interface Layer (mobile React Native) + Domain Layer (filtreZone.ts)
- **Backend** : non modifié — aucun test backend spécifique à US-003

---

## Résumé de couverture

| Couche | Fichier de test | Nb tests | Statut |
|--------|----------------|----------|--------|
| Domain (logique pure) | `filtreZone.domain.test.ts` | 12 | Verts (12/12) |
| Composant (React Native) | `FiltreZone.test.tsx` | 9 | Verts (9/9) |
| Non régression US-001+002 | `ListeColisScreen.test.tsx` | 13 | Verts (13/13) |
| Backend Spring Boot | TourneeTest + ConsulterListeColisHandlerTest + TourneeControllerTest | 23 | Verts (23/23) |
| **Total** | | **57** | **57/57 verts** |

---

## Scénarios de tests — Domain Layer

### TC-046 : Extraction des zones distinctes triées alphabétiquement

**US liée** : US-003
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Invariant domaine
**Préconditions** : Une liste de colis avec zones C, A, B (dans cet ordre) et un doublon sur Zone A
**Étapes** :
1. Appeler `extraireZonesDisponibles([colisZoneC, colisZoneA, colisZoneB, colisZoneA_doublon])`
**Résultat attendu** : `['Zone A', 'Zone B', 'Zone C']` — tri alphabétique, déduplication
**Statut** : Passé (Jest `filtreZone.domain.test.ts`)

```gherkin
Given une liste de colis appartenant aux zones C, A, B avec un doublon en Zone A
When j'appelle extraireZonesDisponibles(colis)
Then les zones retournées sont ['Zone A', 'Zone B', 'Zone C'] (triées, sans doublon)
```

---

### TC-047 : Exclusion des colis sans zone définie (null)

**US liée** : US-003
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Invariant domaine / Edge case
**Préconditions** : Une liste de colis dont certains ont `zoneGeographique = null`
**Étapes** :
1. Appeler `extraireZonesDisponibles([colisZoneA, colisNull, colisZoneB])`
**Résultat attendu** : `['Zone A', 'Zone B']` — les colis sans zone sont ignorés dans les onglets
**Statut** : Passé (Jest `filtreZone.domain.test.ts`)

```gherkin
Given une liste de colis dont l'un a zoneGeographique null
When j'appelle extraireZonesDisponibles(colis)
Then ce colis n'apparaît pas dans les zones disponibles
And les autres zones sont correctement retournées
```

---

### TC-048 : Exclusion des zones vides ou blancs uniquement

**US liée** : US-003
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Edge case / Invariant domaine
**Préconditions** : Colis avec `zoneGeographique = ''` ou `'   '` (espaces)
**Étapes** :
1. Appeler `extraireZonesDisponibles([colisZoneA, colisVideStr, colisEspaces])`
**Résultat attendu** : `['Zone A']` — les chaînes vides ou blanches sont exclues
**Statut** : Passé (Jest `filtreZone.domain.test.ts`)

```gherkin
Given une liste de colis avec des zones à valeur vide ou espace
When j'appelle extraireZonesDisponibles(colis)
Then ces colis sont exclus des onglets disponibles
```

---

### TC-049 : Liste vide retournée si aucun colis n'a de zone

**US liée** : US-003
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Edge case
**Préconditions** : Tous les colis ont `zoneGeographique = null`
**Étapes** :
1. Appeler `extraireZonesDisponibles([colisNull1, colisNull2])`
**Résultat attendu** : `[]`
**Statut** : Passé (Jest `filtreZone.domain.test.ts`)

```gherkin
Given une liste de colis dont tous ont zoneGeographique null
When j'appelle extraireZonesDisponibles(colis)
Then la liste de zones est vide
```

---

### TC-050 : Liste vide retournée si la liste de colis est vide

**US liée** : US-003
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Edge case
**Préconditions** : Liste de colis vide
**Étapes** :
1. Appeler `extraireZonesDisponibles([])`
**Résultat attendu** : `[]`
**Statut** : Passé (Jest `filtreZone.domain.test.ts`)

```gherkin
Given une liste de colis vide
When j'appelle extraireZonesDisponibles([])
Then la liste de zones retournée est vide
```

---

### TC-051 : Zone unique retournée quand tous les colis partagent la même zone

**US liée** : US-003
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Edge case
**Préconditions** : Trois colis tous en Zone A
**Étapes** :
1. Appeler `extraireZonesDisponibles([colisA1, colisA2, colisA3])`
**Résultat attendu** : `['Zone A']`
**Statut** : Passé (Jest `filtreZone.domain.test.ts`)

```gherkin
Given tous les colis appartiennent à la même zone
When j'appelle extraireZonesDisponibles(colis)
Then une seule zone est retournée (sans doublon)
```

---

### TC-052 : filtrerColisByZone retourne tous les colis si filtre = ZONE_TOUS

**US liée** : US-003
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Fonctionnel / Invariant domaine
**Préconditions** : Liste de 5 colis multi-zones, `filtreZone = ZONE_TOUS`
**Étapes** :
1. Appeler `filtrerColisByZone(tousLesColis, ZONE_TOUS)`
**Résultat attendu** : Les 5 colis sont retournés, même référence (pas de copie)
**Statut** : Passé (Jest `filtreZone.domain.test.ts`)

```gherkin
Given une liste de 5 colis et le filtre actif est ZONE_TOUS
When j'appelle filtrerColisByZone(colis, ZONE_TOUS)
Then tous les colis sont retournés sans filtrage
And la référence retournée est identique à la liste d'entrée (pas de copie inutile)
```

---

### TC-053 : filtrerColisByZone filtre correctement par Zone A

**US liée** : US-003
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Fonctionnel
**Préconditions** : Liste de 5 colis (2 Zone A, 1 Zone B, 1 Zone C, 1 sans zone)
**Étapes** :
1. Appeler `filtrerColisByZone(tousLesColis, 'Zone A')`
**Résultat attendu** : 2 colis retournés, identifiants `['a1', 'a2']`
**Statut** : Passé (Jest `filtreZone.domain.test.ts`)

```gherkin
Given une liste de colis multi-zones et le filtre actif est 'Zone A'
When j'appelle filtrerColisByZone(colis, 'Zone A')
Then seuls les colis de Zone A sont retournés (2 colis)
```

---

### TC-054 : filtrerColisByZone retourne une liste vide pour une zone inexistante

**US liée** : US-003
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Edge case
**Préconditions** : Filtre = 'Zone Inexistante', aucun colis de cette zone
**Étapes** :
1. Appeler `filtrerColisByZone(tousLesColis, 'Zone Inexistante')`
**Résultat attendu** : `[]`
**Statut** : Passé (Jest `filtreZone.domain.test.ts`)

```gherkin
Given une liste de colis et un filtre sur une zone qui n'existe pas dans la tournée
When j'appelle filtrerColisByZone(colis, 'Zone Inexistante')
Then la liste retournée est vide
And aucune erreur n'est levée
```

---

### TC-055 : filtrerColisByZone ne mute pas les objets colis (références intactes)

**US liée** : US-003
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Invariant domaine
**Préconditions** : Liste de colis avec Zone A et Zone B
**Étapes** :
1. Appeler `filtrerColisByZone(colis, 'Zone A')`
2. Vérifier l'identité des références des objets retournés
**Résultat attendu** : Les objets retournés sont les mêmes références que dans la liste d'entrée (pas de copie)
**Statut** : Passé (Jest `filtreZone.domain.test.ts`)

```gherkin
Given une liste de colis en Zone A et Zone B
When je filtre par Zone A
Then les colis retournés sont les mêmes références mémoire que dans la liste d'origine
And aucun StatutColis n'est modifié
```

---

### TC-056 : Un colis sans zone n'apparaît pas dans les résultats filtrés par zone

**US liée** : US-003
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Invariant domaine / Edge case
**Préconditions** : Liste contenant un colis Zone A et un colis sans zone
**Étapes** :
1. Appeler `filtrerColisByZone([colisZoneA, colisNull], 'Zone A')`
**Résultat attendu** : 1 seul colis retourné (le colis null est exclu)
**Statut** : Passé (Jest `filtreZone.domain.test.ts`)

```gherkin
Given une liste de colis dont un n'a pas de zone définie
When je filtre par Zone A
Then le colis sans zone n'apparaît pas dans la liste filtrée
```

---

## Scénarios de tests — Interface Layer (Composant + Écran)

### TC-057 : Les onglets de zones disponibles sont affichés dynamiquement

**US liée** : US-003
**Couche testée** : Interface (composant React Native)
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Fonctionnel
**Préconditions** : Tournée avec 22 colis répartis en Zone A (8), Zone B (9), Zone C (5)
**Étapes** :
1. Afficher le `ListeColisScreen` avec la tournée chargée
2. Attendre le rendu asynchrone
**Résultat attendu** : `testID="onglets-zones"` visible, onglets `onglet-tous`, `onglet-Zone A`, `onglet-Zone B`, `onglet-Zone C` présents
**Statut** : Passé (Jest `FiltreZone.test.tsx`)

```gherkin
Given une tournée avec des colis répartis en Zone A, Zone B et Zone C
When Pierre ouvre l'écran M-02
Then la barre d'onglets affiche : [Tous] [Zone A] [Zone B] [Zone C]
```

---

### TC-058 : L'onglet "Tous" est actif par défaut à l'ouverture

**US liée** : US-003
**Couche testée** : Interface (composant React Native)
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Fonctionnel / Invariant domaine
**Préconditions** : Tournée chargée avec plusieurs zones
**Étapes** :
1. Afficher le `ListeColisScreen`
2. Vérifier l'état de l'onglet "Tous" sans interaction
**Résultat attendu** : `onglet-tous` a `accessibilityState = { selected: true }`
**Statut** : Passé (Jest `FiltreZone.test.tsx`)

```gherkin
Given Pierre ouvre l'écran M-02 (état initial)
When aucun filtre n'a encore été sélectionné
Then l'onglet "Tous" est actif (fond bleu, accessibilityState.selected = true)
And tous les colis sont affichés
```

---

### TC-059 : SC1 — Filtrage par Zone A affiche uniquement 8 colis

**US liée** : US-003
**Couche testée** : Interface (composant React Native)
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Fonctionnel (Scénario Gherkin SC1 de la US)
**Préconditions** : Tournée 22 colis : Zone A (8), Zone B (9), Zone C (5)
**Étapes** :
1. Afficher le `ListeColisScreen`
2. Appuyer sur l'onglet "Zone A" (`fireEvent.press`)
3. Compter les éléments `colis-item` affichés
**Résultat attendu** : 8 éléments `colis-item` visibles
**Statut** : Passé (Jest `FiltreZone.test.tsx`)

```gherkin
Given Pierre est sur l'écran M-02 avec 22 colis répartis en Zone A (8), Zone B (9), Zone C (5)
And l'onglet "Tous" est actif par défaut
When Pierre appuie sur l'onglet "Zone A"
Then la liste affiche uniquement les 8 colis appartenant à Zone A
```

---

### TC-060 : SC1 — Le bandeau "Reste à livrer" reflète toujours le total de la tournée, pas le filtre

**US liée** : US-003
**Couche testée** : Interface (composant React Native)
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Invariant domaine (critique)
**Préconditions** : Tournée 22 colis, 20 restants à livrer, filtre Zone A actif
**Étapes** :
1. Afficher le `ListeColisScreen`
2. Appuyer sur l'onglet "Zone A"
3. Lire le contenu de `testID="reste-a-livrer"`
**Résultat attendu** : `"Reste a livrer : 20 / 22"` (total tournée, pas 8/8)
**Statut** : Passé (Jest `FiltreZone.test.tsx`)

```gherkin
Given Pierre a le filtre "Zone A" actif (8 colis affichés)
When Pierre observe le bandeau de progression
Then le bandeau affiche "Reste à livrer : 20 / 22" (total tournée complet)
And le filtre actif n'influence pas ce compteur
```

---

### TC-061 : SC1 — Le filtrage est instantané sans appel réseau supplémentaire

**US liée** : US-003
**Couche testée** : Interface (composant React Native)
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Fonctionnel / Non-fonctionnel (performance)
**Préconditions** : Tournée 22 colis chargée (1 seul appel API initial)
**Étapes** :
1. Afficher le `ListeColisScreen`
2. Appuyer sur l'onglet "Zone B"
3. Vérifier le nombre de colis affichés et le nombre d'appels API
**Résultat attendu** : 9 colis Zone B visibles, `getTourneeAujourdhui` appelé exactement 1 fois
**Statut** : Passé (Jest `FiltreZone.test.tsx`)

```gherkin
Given la tournée est chargée depuis l'API (1 appel initial)
When Pierre appuie sur l'onglet "Zone B"
Then la liste affiche immédiatement les 9 colis de Zone B
And aucun appel réseau supplémentaire n'est effectué
```

---

### TC-062 : SC2 — L'onglet "Tous" restaure la vue complète après un filtre

**US liée** : US-003
**Couche testée** : Interface (composant React Native)
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Fonctionnel (Scénario Gherkin SC2 de la US)
**Préconditions** : Filtre Zone A actif (8 colis affichés)
**Étapes** :
1. Appuyer sur l'onglet "Zone A"
2. Appuyer sur l'onglet "Tous"
3. Compter les éléments `colis-item`
**Résultat attendu** : 22 éléments `colis-item` visibles
**Statut** : Passé (Jest `FiltreZone.test.tsx`)

```gherkin
Given Pierre a le filtre "Zone A" actif
When Pierre appuie sur l'onglet "Tous"
Then la liste affiche à nouveau les 22 colis de la tournée
```

---

### TC-063 : SC2 — Les statuts terminaux restent visibles après retour sur "Tous"

**US liée** : US-003
**Couche testée** : Interface (composant React Native)
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Non régression / Fonctionnel (Scénario Gherkin SC2 de la US)
**Préconditions** : Tournée avec 2 colis Zone C au statut LIVRE ; filtre Zone C activé puis "Tous" activé
**Étapes** :
1. Appuyer sur l'onglet "Zone C"
2. Appuyer sur l'onglet "Tous"
3. Compter les éléments `colis-statut` affichant "Livre"
**Résultat attendu** : 2 éléments avec statut "Livre" visibles dans la vue globale
**Statut** : Passé (Jest `FiltreZone.test.tsx`)

```gherkin
Given deux colis de Zone C ont le statut LIVRE
And Pierre passe par le filtre "Zone C" puis revient sur "Tous"
When Pierre observe la liste complète
Then les 2 colis LIVRE de Zone C restent visibles avec leur statut correct
```

---

### TC-064 : SC3 — Une zone entièrement traitée affiche les colis avec statuts terminaux

**US liée** : US-003
**Couche testée** : Interface (composant React Native)
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Fonctionnel (Scénario Gherkin SC3 de la US)
**Préconditions** : Zone C avec 5 colis tous au statut LIVRE
**Étapes** :
1. Afficher le `ListeColisScreen` avec tournée SC3
2. Appuyer sur l'onglet "Zone C"
3. Vérifier les items affichés et leurs statuts
**Résultat attendu** : 5 colis visibles, aucun avec statut "A livrer"
**Statut** : Passé (Jest `FiltreZone.test.tsx`)

```gherkin
Given Pierre a livré tous les colis de la Zone C (5 colis LIVRE)
When Pierre appuie sur l'onglet "Zone C"
Then la liste affiche les 5 colis de Zone C avec leur statut terminal LIVRE
And aucun colis "À livrer" n'apparaît dans cette vue filtrée
```

---

### TC-065 : La barre d'onglets est masquée si aucun colis n'a de zone définie

**US liée** : US-003
**Couche testée** : Interface (composant React Native)
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Edge case / Invariant domaine
**Préconditions** : Tournée dont tous les colis ont `zoneGeographique = null`
**Étapes** :
1. Afficher le `ListeColisScreen` avec tournée sans zones
2. Attendre le rendu de `flatlist-colis`
3. Vérifier l'absence de `onglets-zones`
**Résultat attendu** : `queryByTestId('onglets-zones')` retourne null — la barre est absente
**Statut** : Passé (Jest `FiltreZone.test.tsx`)

```gherkin
Given une tournée dont tous les colis ont zoneGeographique null
When Pierre ouvre l'écran M-02
Then la barre d'onglets n'est pas affichée
And tous les colis restent visibles sans filtre
```

---

## Scénarios de tests — Accessibilité

### TC-066 : Les onglets de zone ont les attributs ARIA requis

**US liée** : US-003
**Couche testée** : Interface (composant React Native)
**Aggregate / Domain Event ciblé** : N/A
**Type** : Accessibilité
**Préconditions** : FiltreZones rendu avec zones = ['Zone A', 'Zone B'] et zoneActive = ZONE_TOUS
**Étapes** :
1. Inspecter les props des `TouchableOpacity` rendus
**Résultat attendu** :
  - `accessibilityRole="tab"` sur chaque onglet (Tous et zones)
  - `accessibilityState={{ selected: true }}` sur l'onglet actif
  - `accessibilityState={{ selected: false }}` sur les onglets inactifs
  - `accessibilityLabel="Tous les colis"` sur l'onglet Tous
**Statut** : Passé (Jest `FiltreZone.test.tsx` — via prop `accessibilityState`)

```gherkin
Given la barre d'onglets est affichée
When Pierre utilise un lecteur d'écran
Then chaque onglet a accessibilityRole="tab"
And l'onglet actif a accessibilityState.selected = true
And les onglets inactifs ont accessibilityState.selected = false
```

---

## Scénarios de tests — Non régression

### TC-067 : Non régression US-001 — La liste des colis est toujours chargée depuis l'API

**US liée** : US-003 (impact sur US-001)
**Couche testée** : Interface
**Aggregate / Domain Event ciblé** : Tournée / TourneeChargee
**Type** : Non régression
**Préconditions** : `ListeColisScreen` modifié pour intégrer US-003 (zoneActive, zonesDisponibles)
**Étapes** :
1. Exécuter la suite `ListeColisScreen.test.tsx`
**Résultat attendu** : 13/13 tests verts (aucune régression US-001)
**Statut** : Passé (Jest `ListeColisScreen.test.tsx`)

```gherkin
Given les modifications de ListeColisScreen pour US-003 sont intégrées
When j'exécute les tests US-001
Then aucun test US-001 ne régresse
```

---

### TC-068 : Non régression US-002 — Le bandeau de progression reste correct après introduction du filtre

**US liée** : US-003 (impact sur US-002)
**Couche testée** : Interface
**Aggregate / Domain Event ciblé** : Tournée / AvancementCalcule
**Type** : Non régression
**Préconditions** : `ListeColisScreen` lit toujours `tournee.resteALivrer` et `tournee.colisTotal` (pas de données dérivées du filtre)
**Étapes** :
1. Exécuter la suite `ListeColisScreen.test.tsx`
**Résultat attendu** : 13/13 tests verts (bandeau de progression inchangé)
**Statut** : Passé (Jest `ListeColisScreen.test.tsx`)

```gherkin
Given le filtre de zone est actif sur Zone A
When Pierre observe le bandeau de progression
Then le bandeau lit toujours tournee.resteALivrer (global), pas le nombre de colis filtrés
And aucun test de progression ne régresse
```

---

## Scénarios de tests — Backend (non modifié pour US-003)

### TC-069 : Non régression backend — 23 tests Spring Boot restent verts

**US liée** : US-003 (impact backend nul)
**Couche testée** : Infrastructure / Application / Domain (Java)
**Aggregate / Domain Event ciblé** : Tournée / TourneeChargee / TourneeDemarree
**Type** : Non régression
**Préconditions** : Backend non modifié pour US-003
**Étapes** :
1. Exécuter `mvn test` dans `src/backend/svc-tournee`
**Résultat attendu** : 23/23 tests verts (TourneeTest 7, ConsulterListeColisHandlerTest 11, TourneeControllerTest 5)
**Statut** : Passé (mvn test — JDK 20)

```gherkin
Given le backend n'a pas été modifié pour US-003
When j'exécute la suite de tests Spring Boot
Then les 23 tests restent verts
And aucun Domain Event existant n'est altéré
```

---

## Scénarios E2E — Non exécutés (infrastructure non disponible en session)

> Ces scénarios sont documentés pour exécution manuelle ou automatisée avec Playwright.
> Préconditions communes : backend lancé sur `http://localhost:8080` (profil dev), Expo Web sur `http://localhost:8082`.

### TC-070 : E2E — Affichage de la barre d'onglets au chargement de l'écran M-02

**US liée** : US-003
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Fonctionnel E2E
**Préconditions** : Backend dev avec DevDataSeeder (5 colis, 3 zones : Zone A, B, C)
**Étapes** :
1. Naviguer sur `http://localhost:8082`
2. Observer l'écran M-02 après chargement
**Résultat attendu** : Barre d'onglets visible avec [Tous] [Zone A] [Zone B] [Zone C]
**Statut** : A tester

```gherkin
Given le backend dev est démarré avec les données DevDataSeeder
And l'app Expo Web est démarrée sur http://localhost:8082
When Pierre navigue sur l'écran M-02
Then la barre d'onglets affiche [Tous] [Zone A] [Zone B] [Zone C]
And l'onglet "Tous" est actif (fond bleu)
```

---

### TC-071 : E2E — Filtrage par Zone A réduit la liste

**US liée** : US-003
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Fonctionnel E2E (SC1 Gherkin US)
**Préconditions** : Écran M-02 chargé avec 5 colis
**Étapes** :
1. Cliquer sur l'onglet "Zone A"
2. Compter les colis affichés
**Résultat attendu** : 2 colis visibles (colis-dev-001 et colis-dev-005), bandeau "Reste à livrer : 3 / 5" inchangé
**Statut** : A tester

```gherkin
Given Pierre est sur l'écran M-02 avec les 5 colis DevDataSeeder
When Pierre clique sur l'onglet "Zone A"
Then 2 colis sont visibles (12 Rue du Port + 7 Rue de la République)
And le bandeau affiche "Reste à livrer : 3 / 5" (total tournée)
And la liste change sans rechargement de page
```

---

### TC-072 : E2E — Retour à "Tous" après filtre Zone A

**US liée** : US-003
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Fonctionnel E2E (SC2 Gherkin US)
**Préconditions** : Filtre "Zone A" actif (2 colis affichés)
**Étapes** :
1. Cliquer sur l'onglet "Tous"
2. Compter les colis affichés
**Résultat attendu** : 5 colis visibles avec leurs statuts corrects
**Statut** : A tester

```gherkin
Given Pierre a le filtre "Zone A" actif
When Pierre clique sur l'onglet "Tous"
Then les 5 colis sont à nouveau visibles avec leurs statuts corrects
```

---

### TC-073 : E2E — Zone C affiche uniquement les colis traités

**US liée** : US-003
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Fonctionnel E2E (SC3 Gherkin US)
**Préconditions** : colis-dev-004 en Zone C avec statut LIVRE
**Étapes** :
1. Cliquer sur l'onglet "Zone C"
2. Observer les colis et statuts affichés
**Résultat attendu** : 1 seul colis visible (23 Avenue Jean Jaurès) avec statut "Livré" — aucun colis "À livrer"
**Statut** : A tester

```gherkin
Given Pierre a livré le colis de Zone C (statut LIVRE dans DevDataSeeder)
When Pierre clique sur l'onglet "Zone C"
Then 1 colis est visible avec statut terminal "Livré"
And aucun colis "À livrer" n'apparaît
```

---

## Tableau récapitulatif des scénarios

| TC | Titre court | Couche | Type | Statut |
|----|-------------|--------|------|--------|
| TC-046 | extraireZonesDisponibles — tri alphabétique et déduplication | Domain | Invariant domaine | Passé |
| TC-047 | Exclusion colis null | Domain | Edge case | Passé |
| TC-048 | Exclusion zones vides/espaces | Domain | Edge case | Passé |
| TC-049 | Liste vide — tous null | Domain | Edge case | Passé |
| TC-050 | Liste vide — colis vide | Domain | Edge case | Passé |
| TC-051 | Zone unique | Domain | Edge case | Passé |
| TC-052 | ZONE_TOUS retourne tous les colis | Domain | Invariant domaine | Passé |
| TC-053 | Filtrage Zone A | Domain | Fonctionnel | Passé |
| TC-054 | Zone inexistante — liste vide | Domain | Edge case | Passé |
| TC-055 | Pas de mutation des colis | Domain | Invariant domaine | Passé |
| TC-056 | Colis sans zone exclu du filtre | Domain | Invariant domaine | Passé |
| TC-057 | Onglets affichés dynamiquement | Interface | Fonctionnel | Passé |
| TC-058 | Onglet "Tous" actif par défaut | Interface | Invariant domaine | Passé |
| TC-059 | SC1 — Filtrage Zone A (8 colis) | Interface | Fonctionnel | Passé |
| TC-060 | SC1 — Bandeau global inchangé | Interface | Invariant domaine (critique) | Passé |
| TC-061 | SC1 — Filtrage instantané sans API | Interface | Fonctionnel / Perf | Passé |
| TC-062 | SC2 — Retour "Tous" (22 colis) | Interface | Fonctionnel | Passé |
| TC-063 | SC2 — Statuts terminaux préservés | Interface | Non régression | Passé |
| TC-064 | SC3 — Zone entièrement traitée | Interface | Fonctionnel | Passé |
| TC-065 | Barre masquée si aucune zone | Interface | Edge case | Passé |
| TC-066 | Attributs ARIA des onglets | Interface | Accessibilité | Passé |
| TC-067 | Non régression US-001 | Interface | Non régression | Passé |
| TC-068 | Non régression US-002 (bandeau) | Interface | Non régression | Passé |
| TC-069 | Non régression backend 23 tests | Infrastructure | Non régression | Passé |
| TC-070 | E2E — Affichage barre onglets | E2E | Fonctionnel | A tester |
| TC-071 | E2E — Filtrage Zone A | E2E | Fonctionnel | A tester |
| TC-072 | E2E — Retour "Tous" | E2E | Fonctionnel | A tester |
| TC-073 | E2E — Zone C traitée | E2E | Fonctionnel | A tester |
