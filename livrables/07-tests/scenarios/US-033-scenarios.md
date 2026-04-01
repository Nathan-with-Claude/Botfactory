# Scénarios de tests US-033 — Simulateur TMS pour tests de bout en bout

**US liée** : US-033 — Simulateur TMS pour tests de bout en bout (dev-only)
**Date de rédaction** : 2026-03-30
**Rédacteur** : @qa
**Services impliqués** : svc-supervision (port 8082), svc-tournee (port 8081)
**Bounded Contexts** : BC-07 (Planification), BC-03 (Supervision read model), BC-01 (Orchestration)

---

## Vue d'ensemble

| ID | Titre | Niveau | Couche | Statut |
|----|-------|--------|--------|--------|
| TC-033-01 | DevEventBridge crée une VueTournee EN_COURS dans BC-03 | L1 | Infrastructure | Passé |
| TC-033-02 | DevEventBridge appelle svc-tournee POST /internal/dev/tournees | L1 | Infrastructure | Passé |
| TC-033-03 | DevEventBridge continue si svc-tournee est indisponible (résilience) | L1 | Infrastructure | Passé |
| TC-033-04 | DevEventBridge idempotent — pas de doublon VueTournee | L1 | Infrastructure | Passé |
| TC-033-05 | POST /dev/tms/import avec nombre=3 crée 3 TourneesPlanifiees | L1 | Interface | Passé |
| TC-033-06 | POST /dev/tms/import crée des tournées avec entre 3 et 8 colis | L1 | Interface | Passé |
| TC-033-07 | POST /dev/tms/import avec nombre=0 retourne 400 | L1 | Interface | Passé |
| TC-033-08 | DELETE /dev/tms/reset supprime toutes les données dev | L1 | Interface | Passé |
| TC-033-09 | POST /internal/dev/tournees crée une Tournee avec colis | L1 | Interface | Passé |
| TC-033-10 | Colis générés ont le statut A_LIVRER | L1 | Interface | Passé |
| TC-033-11 | POST /internal/dev/tournees idempotent si tournée existante | L1 | Interface | Passé |
| TC-033-12 | Reset vide les données — plan du jour repart à zéro | L2 | API | Passé |
| TC-033-13 | SC1 Import de 3 tournées simulées — 201 + 3 TourneesPlanifiees créées | L2 | API | Passé |
| TC-033-14 | SC1 Contrainte 3-8 colis par tournée simulée respectée | L2 | API | Passé |
| TC-033-15 | SC1 Refus nombre=0 (400 Bad Request) | L2 | API | Passé |
| TC-033-16 | SC1 Refus nombre négatif (400 Bad Request) | L2 | API | Passé |
| TC-033-17 | SC2 Flux complet : Affecter + Lancer → VueTournee EN_COURS dans BC-03 | L2 | Cross-services | Passé |
| TC-033-18 | SC3 Flux complet : Lancement → Tournee créée dans BC-01 (svc-tournee) | L2 | Cross-services | Passé |
| TC-033-19 | SC5 Cohérence tourneeId entre BC-07, BC-03 et BC-01 | L2 | Cross-services | Passé |
| TC-033-20 | SC6 Idempotence VueTournee — une seule occurrence dans le tableau de bord | L2 | Cross-services | Passé |
| TC-033-21 | SC6 Double lancement impossible — 409 Conflict (invariant statut LANCEE) | L2 | API | Passé |
| TC-033-22 | SC4 Isolation profil prod — annotations @Profile("dev") sur tous les beans | L1 | Infrastructure | Passé |
| TC-033-23 | Régression svc-supervision — 130/130 tests verts après ajout simulateur | L1 | Régression | Passé |
| TC-033-24 | Régression svc-tournee — 112/112 tests verts après ajout DevTourneeController | L1 | Régression | Passé |

**Total** : 24 TCs — 11 L1 directs + 2 L1 régression + 11 L2

---

## Scénarios L1 — Tests unitaires / application layer

---

### TC-033-01 : DevEventBridge crée une VueTournee EN_COURS dans BC-03

**US liée** : US-033
**Niveau** : L1
**Couche testée** : Infrastructure
**Aggregate / Domain Event ciblé** : VueTournee (BC-03) / TourneeLancee
**Type** : Fonctionnel
**Préconditions** : Aucune VueTournee avec tourneeId "T-2026-0042" en base
**Étapes** : Appeler `DevEventBridge.propaguerTourneeLancee()` avec un event `TourneeLancee`
**Résultat attendu** : `VueTourneeRepository.save()` appelé avec une VueTournee ayant statut EN_COURS, colisTraites=0, colisTotal=5
**Statut** : Passé

```gherkin
Given aucune VueTournee avec tourneeId "T-2026-0042" n'existe
When DevEventBridge.propaguerTourneeLancee(TourneeLancee(codeTms="T-2026-0042", livreurId="livreur-007", nbColis=5)) est appelé
Then VueTourneeRepository.save() est appelé une fois
And la VueTournee sauvegardée a statut=EN_COURS, colisTraites=0, colisTotal=5, livreurNom="Jean Dupont"
```

---

### TC-033-02 : DevEventBridge appelle svc-tournee POST /internal/dev/tournees

**US liée** : US-033
**Niveau** : L1
**Couche testée** : Infrastructure
**Aggregate / Domain Event ciblé** : Tournee (BC-01) / TourneeLancee
**Type** : Fonctionnel
**Préconditions** : RestTemplate mocké retourne "created"
**Étapes** : Appeler `propaguerTourneeLancee` avec event valide
**Résultat attendu** : `restTemplate.postForObject("http://localhost:8081/internal/dev/tournees", ...)` appelé
**Statut** : Passé

```gherkin
Given l'event TourneeLancee(tourneeId="T-2026-0043", livreurId="livreur-008")
When DevEventBridge.propaguerTourneeLancee(event) est appelé
Then RestTemplate.postForObject("http://localhost:8081/internal/dev/tournees", ...) est appelé exactement une fois
```

---

### TC-033-03 : DevEventBridge continue si svc-tournee est indisponible

**US liée** : US-033
**Niveau** : L1
**Couche testée** : Infrastructure
**Aggregate / Domain Event ciblé** : VueTournee (BC-03)
**Type** : Edge case — résilience
**Préconditions** : RestTemplate lève `RestClientException("Connection refused")`
**Étapes** : Appeler `propaguerTourneeLancee` avec un RestTemplate en erreur
**Résultat attendu** : Aucune exception propagée. La VueTournee est quand même créée en BC-03.
**Statut** : Passé

```gherkin
Given RestTemplate.postForObject() lève RestClientException("Connection refused")
When DevEventBridge.propaguerTourneeLancee(event) est appelé
Then aucune exception n'est propagée
And VueTourneeRepository.save() est quand même appelé (BC-03 non impacté)
```

---

### TC-033-04 : DevEventBridge idempotent — pas de doublon VueTournee

**US liée** : US-033
**Niveau** : L1
**Couche testée** : Infrastructure
**Aggregate / Domain Event ciblé** : VueTournee (BC-03) — invariant idempotence
**Type** : Invariant domaine
**Préconditions** : Une VueTournee avec tourneeId "T-2026-0042" existe déjà
**Étapes** : Appeler `propaguerTourneeLancee` avec le même tourneeId
**Résultat attendu** : `VueTourneeRepository.save()` n'est PAS appelé
**Statut** : Passé

```gherkin
Given une VueTournee avec tourneeId "T-2026-0042" existe déjà en base
When DevEventBridge.propaguerTourneeLancee(TourneeLancee(codeTms="T-2026-0042")) est appelé
Then VueTourneeRepository.save() n'est jamais appelé
```

---

### TC-033-05 : POST /dev/tms/import avec nombre=3 crée 3 TourneesPlanifiees

**US liée** : US-033
**Niveau** : L1
**Couche testée** : Interface (WebMvcTest)
**Aggregate / Domain Event ciblé** : TourneePlanifiee (BC-07)
**Type** : Fonctionnel SC1
**Préconditions** : Profil "dev" actif
**Étapes** : POST /dev/tms/import `{"nombre": 3, "date": "2026-03-27"}`
**Résultat attendu** : 201 Created, body `{"tourneesCreees":3,"date":"2026-03-27"}`, `TourneePlanifieeRepository.save()` appelé 3 fois
**Statut** : Passé

```gherkin
Given l'application tourne en profil "dev"
When POST /dev/tms/import {"nombre": 3, "date": "2026-03-27"} est envoyé
Then la réponse est 201 Created
And le body contient {"tourneesCreees": 3, "date": "2026-03-27"}
And TourneePlanifieeRepository.save() est appelé exactement 3 fois
```

---

### TC-033-06 : POST /dev/tms/import crée des tournées avec entre 3 et 8 colis

**US liée** : US-033
**Niveau** : L1
**Couche testée** : Interface (WebMvcTest)
**Aggregate / Domain Event ciblé** : TourneePlanifiee (BC-07)
**Type** : Invariant domaine SC1
**Préconditions** : Profil "dev" actif
**Étapes** : POST /dev/tms/import `{"nombre": 2}`
**Résultat attendu** : Chaque `TourneePlanifiee` sauvegardée a `nbColis` entre 3 et 8, un `id` non vide, un `codeTms` non vide
**Statut** : Passé

```gherkin
Given l'application tourne en profil "dev"
When POST /dev/tms/import {"nombre": 2, "date": "2026-03-27"} est envoyé
Then chaque TourneePlanifiee capturée par ArgumentCaptor a nbColis entre 3 et 8
And chaque TourneePlanifiee a un id non vide et un codeTms non vide
```

---

### TC-033-07 : POST /dev/tms/import avec nombre=0 retourne 400

**US liée** : US-033
**Niveau** : L1
**Couche testée** : Interface (WebMvcTest)
**Aggregate / Domain Event ciblé** : DevTmsController — validation input
**Type** : Invariant domaine (cas négatif)
**Préconditions** : Profil "dev" actif
**Étapes** : POST /dev/tms/import `{"nombre": 0}`
**Résultat attendu** : 400 Bad Request
**Statut** : Passé

```gherkin
Given l'application tourne en profil "dev"
When POST /dev/tms/import {"nombre": 0, "date": "2026-03-27"} est envoyé
Then la réponse est 400 Bad Request
And aucune TourneePlanifiee n'est créée
```

---

### TC-033-08 : DELETE /dev/tms/reset supprime toutes les données dev

**US liée** : US-033
**Niveau** : L1
**Couche testée** : Interface (WebMvcTest)
**Aggregate / Domain Event ciblé** : DevTmsController — reset
**Type** : Fonctionnel
**Préconditions** : Profil "dev" actif
**Étapes** : DELETE /dev/tms/reset
**Résultat attendu** : 204 No Content, `DevDataSeeder.reinitialiser()` appelé
**Statut** : Passé

```gherkin
Given l'application tourne en profil "dev"
When DELETE /dev/tms/reset est envoyé
Then la réponse est 204 No Content
And DevDataSeeder.reinitialiser() est appelé exactement une fois
```

---

### TC-033-09 : POST /internal/dev/tournees crée une Tournee avec colis

**US liée** : US-033
**Niveau** : L1
**Couche testée** : Interface svc-tournee (WebMvcTest)
**Aggregate / Domain Event ciblé** : Tournee (BC-01)
**Type** : Fonctionnel SC3
**Préconditions** : Profil "dev" actif, aucune Tournee avec id "T-2026-0042"
**Étapes** : POST /internal/dev/tournees `{"tourneeId":"T-2026-0042","livreurId":"livreur-007","livreurNom":"Jean Dupont","nbColis":5}`
**Résultat attendu** : 201 Created, body `{"tourneeId":"T-2026-0042","statut":"CREEE","nbColis":5}`, Tournee avec 5 colis en base
**Statut** : Passé

```gherkin
Given aucune Tournee avec id "T-2026-0042" n'existe
When POST /internal/dev/tournees {"tourneeId":"T-2026-0042","livreurId":"livreur-007","nbColis":5}
Then la réponse est 201 Created avec tourneeId="T-2026-0042"
And la Tournee capturée a id="T-2026-0042", livreurId="livreur-007", 5 colis
```

---

### TC-033-10 : Colis générés ont le statut A_LIVRER

**US liée** : US-033
**Niveau** : L1
**Couche testée** : Interface svc-tournee (WebMvcTest)
**Aggregate / Domain Event ciblé** : Colis (BC-01) — invariant statut initial
**Type** : Invariant domaine
**Préconditions** : Profil "dev" actif
**Étapes** : POST /internal/dev/tournees avec nbColis=3
**Résultat attendu** : Tous les colis de la Tournee ont statut A_LIVRER
**Statut** : Passé

```gherkin
Given une requête POST /internal/dev/tournees avec nbColis=3
When la Tournee est créée
Then tous les colis ont statut A_LIVRER
```

---

### TC-033-11 : POST /internal/dev/tournees idempotent si tournée existante

**US liée** : US-033
**Niveau** : L1
**Couche testée** : Interface svc-tournee (WebMvcTest)
**Aggregate / Domain Event ciblé** : Tournee (BC-01) — invariant idempotence SC6
**Type** : Invariant domaine
**Préconditions** : Une Tournee avec id "T-2026-0042" existe déjà
**Étapes** : POST /internal/dev/tournees avec le même tourneeId
**Résultat attendu** : 200 OK (pas 201), `TourneeRepository.save()` n'est PAS appelé
**Statut** : Passé

```gherkin
Given une Tournee avec id "T-2026-0042" existe déjà
When POST /internal/dev/tournees {"tourneeId":"T-2026-0042",...} est envoyé
Then la réponse est 200 OK avec tourneeId="T-2026-0042"
And TourneeRepository.save() n'est jamais appelé
```

---

### TC-033-22 : SC4 — Isolation profil prod — annotations @Profile("dev") sur tous les beans

**US liée** : US-033
**Niveau** : L1
**Couche testée** : Infrastructure
**Aggregate / Domain Event ciblé** : DevEventBridge, DevTmsController, DevTourneeController
**Type** : Invariant non-fonctionnel (sécurité prod)
**Préconditions** : Code source inspecté
**Étapes** : Vérifier les annotations @Profile("dev") sur DevEventBridge, DevRestConfig, DevTmsController, DevTourneeController
**Résultat attendu** : Les 4 beans sont annotés `@Profile("dev")`
**Statut** : Passé

```gherkin
Given le code source des composants simulateur
When on vérifie les annotations Spring
Then DevEventBridge est annoté @Profile("dev")
And DevRestConfig est annoté @Profile("dev")
And DevTmsController est annoté @Profile("dev")
And DevTourneeController est annoté @Profile("dev")
```

---

### TC-033-23 : Régression svc-supervision — 130/130 tests verts

**US liée** : US-033
**Niveau** : L1
**Couche testée** : Régression
**Type** : Non régression
**Préconditions** : Code US-033 intégré dans svc-supervision
**Étapes** : `mvn test` dans svc-supervision
**Résultat attendu** : 130/130 tests PASS
**Statut** : Passé

---

### TC-033-24 : Régression svc-tournee — 112/112 tests verts

**US liée** : US-033
**Niveau** : L1
**Couche testée** : Régression
**Type** : Non régression
**Préconditions** : Code US-033 intégré dans svc-tournee
**Étapes** : `mvn test` dans svc-tournee
**Résultat attendu** : 112/112 tests PASS
**Statut** : Passé

---

## Scénarios L2 — Tests d'intégration API

---

### TC-033-12 : Reset vide les données — plan du jour repart à zéro

**US liée** : US-033
**Niveau** : L2
**Couche testée** : API / Infrastructure
**Type** : Fonctionnel
**Préconditions** : svc-supervision démarré en profil dev (port 8082)
**Étapes** : DELETE http://localhost:8082/dev/tms/reset
**Résultat attendu** : 204 No Content
**Statut** : Passé

```gherkin
Given svc-supervision tourne en profil "dev" sur le port 8082
When DELETE http://localhost:8082/dev/tms/reset est envoyé
Then la réponse est 204 No Content
```

---

### TC-033-13 : SC1 — Import de 3 tournées simulées

**US liée** : US-033
**Niveau** : L2
**Couche testée** : API
**Aggregate / Domain Event ciblé** : TourneePlanifiee (BC-07)
**Type** : Fonctionnel SC1
**Préconditions** : svc-supervision démarré, reset effectué
**Étapes** :
1. DELETE /dev/tms/reset → 204
2. POST /dev/tms/import `{"nombre": 3, "date": "2026-03-30"}`
3. GET /api/planification/plans/2026-03-30

**Résultat attendu** : POST retourne 201 `{"tourneesCreees":3}`. Le plan du jour liste des tournées avec id "tp-sim-*"
**Statut** : Passé

```gherkin
Given svc-supervision tourne en profil "dev"
When POST /dev/tms/import {"nombre": 3, "date": "2026-03-30"}
Then la réponse est 201 Created {"tourneesCreees": 3, "date": "2026-03-30"}
And GET /api/planification/plans/2026-03-30 retourne des tournées avec codeTms "T-SIM-*"
```

---

### TC-033-14 : SC1 — Contrainte 3-8 colis par tournée simulée

**US liée** : US-033
**Niveau** : L2
**Couche testée** : API
**Type** : Invariant domaine SC1
**Préconditions** : 3 tournées simulées créées
**Étapes** : GET /api/planification/tournees/{tp-sim-xxx} pour chaque tournée simulée
**Résultat attendu** : Chaque tournée a `nbColis` entre 3 et 8
**Statut** : Passé

```gherkin
Given 3 TourneesPlanifiees simulées avec ids tp-sim-cc4b3885, tp-sim-e816b2d9, tp-sim-4d5ade64
When GET /api/planification/tournees/{id} est appelé pour chaque
Then chaque tournée retourne nbColis entre 3 et 8 (observé : 7, 8, 3)
```

---

### TC-033-15 : SC1 — Refus nombre=0

**US liée** : US-033
**Niveau** : L2
**Couche testée** : API
**Type** : Invariant domaine (cas négatif)
**Préconditions** : svc-supervision démarré
**Étapes** : POST /dev/tms/import `{"nombre": 0}`
**Résultat attendu** : 400 Bad Request
**Statut** : Passé

---

### TC-033-16 : SC1 — Refus nombre négatif

**US liée** : US-033
**Niveau** : L2
**Couche testée** : API
**Type** : Invariant domaine (edge case)
**Préconditions** : svc-supervision démarré
**Étapes** : POST /dev/tms/import `{"nombre": -1}`
**Résultat attendu** : 400 Bad Request
**Statut** : Passé

---

### TC-033-17 : SC2 — Flux complet : Affecter + Lancer → VueTournee EN_COURS dans BC-03

**US liée** : US-033
**Niveau** : L2
**Couche testée** : Cross-services BC-07 → BC-03
**Aggregate / Domain Event ciblé** : TourneePlanifiee (BC-07) / TourneeLancee → VueTournee (BC-03)
**Type** : Fonctionnel cross-services SC2
**Préconditions** : Tournée simulée tp-sim-cc4b3885 (codeTms T-SIM-8646) en état NON_AFFECTEE
**Étapes** :
1. POST /api/planification/tournees/tp-sim-cc4b3885/affecter → 200
2. POST /api/planification/tournees/tp-sim-cc4b3885/lancer → 200 + statut=LANCEE
3. GET /api/supervision/tableau-de-bord → VueTournee T-SIM-8646 présente avec statut=EN_COURS

**Résultat attendu** : T-SIM-8646 visible dans le tableau de bord Supervision avec statut EN_COURS
**Statut** : Passé

```gherkin
Given TourneePlanifiee tp-sim-cc4b3885 (T-SIM-8646) NON_AFFECTEE dans BC-07
When POST /affecter {"livreurId":"livreur-007",...} → 200
And POST /lancer → 200 statut=LANCEE
Then GET /api/supervision/tableau-de-bord contient T-SIM-8646 avec statut=EN_COURS
And la propagation est < 1s (fire-and-forget sync dans LancerTourneeHandler)
```

---

### TC-033-18 : SC3 — Lancement → Tournee créée dans BC-01 (svc-tournee)

**US liée** : US-033
**Niveau** : L2
**Couche testée** : Cross-services BC-07 → BC-01
**Aggregate / Domain Event ciblé** : TourneeLancee → Tournee (BC-01)
**Type** : Fonctionnel cross-services SC3
**Préconditions** : Tournée T-SIM-8646 lancée (TC-033-17 exécuté)
**Étapes** : POST /internal/dev/tournees avec tourneeId=T-SIM-8646 → vérification idempotence (200 = tournée présente)
**Résultat attendu** : 200 OK (tournée existante créée par DevEventBridge lors du lancement)
**Statut** : Passé

```gherkin
Given TourneePlanifiee T-SIM-8646 a été lancée (TourneeLancee émis)
When POST /internal/dev/tournees {"tourneeId":"T-SIM-8646","livreurId":"livreur-007",...}
Then la réponse est 200 OK (idempotence — tournée déjà créée par DevEventBridge)
And le tourneeId "T-SIM-8646" est cohérent avec BC-07 et BC-03
```

---

### TC-033-19 : SC5 — Cohérence tourneeId entre BC-07, BC-03 et BC-01

**US liée** : US-033
**Niveau** : L2
**Couche testée** : Cross-services (3 BCs)
**Aggregate / Domain Event ciblé** : TourneePlanifiee / VueTournee / Tournee
**Type** : Invariant domaine cross-services SC5
**Préconditions** : Tournée T-SIM-8646 lancée
**Étapes** :
1. GET /api/planification/plans/2026-03-30 → chercher T-SIM-8646
2. GET /api/supervision/tableau-de-bord → chercher T-SIM-8646
3. POST /internal/dev/tournees T-SIM-8646 → vérifier 200

**Résultat attendu** : T-SIM-8646 présent dans les 3 services. livreurId="livreur-007" cohérent dans BC-07.
**Statut** : Passé

```gherkin
Given le simulateur a lancé TourneePlanifiee T-SIM-8646 avec livreurId="livreur-007"
When le testeur interroge les 3 services (BC-07, BC-03, BC-01)
Then T-SIM-8646 est présent dans les 3 réponses
And livreurId="livreur-007" est cohérent dans BC-07
```

---

### TC-033-20 : SC6 — Idempotence VueTournee — une seule occurrence dans le tableau de bord

**US liée** : US-033
**Niveau** : L2
**Couche testée** : Cross-services BC-03
**Aggregate / Domain Event ciblé** : VueTournee — invariant idempotence
**Type** : Invariant domaine SC6
**Préconditions** : Tournée T-SIM-8646 lancée
**Étapes** : GET /api/supervision/tableau-de-bord → compter les occurrences de T-SIM-8646
**Résultat attendu** : Exactement 1 occurrence de T-SIM-8646
**Statut** : Passé

```gherkin
Given TourneeLancee a été émis pour T-SIM-8646
When GET /api/supervision/tableau-de-bord
Then T-SIM-8646 apparaît exactement une fois dans la réponse
```

---

### TC-033-21 : SC6 — Double lancement impossible — 409 Conflict

**US liée** : US-033
**Niveau** : L2
**Couche testée** : API
**Aggregate / Domain Event ciblé** : TourneePlanifiee (BC-07) — invariant statut LANCEE
**Type** : Invariant domaine (cas négatif SC6)
**Préconditions** : Tournée tp-sim-cc4b3885 déjà lancée
**Étapes** : POST /api/planification/tournees/tp-sim-cc4b3885/lancer (deuxième appel)
**Résultat attendu** : 409 Conflict
**Statut** : Passé

```gherkin
Given TourneePlanifiee tp-sim-cc4b3885 est déjà en statut LANCEE
When POST /api/planification/tournees/tp-sim-cc4b3885/lancer est envoyé à nouveau
Then la réponse est 409 Conflict
And aucune VueTournee supplémentaire n'est créée dans BC-03
```

---

## Décision L3

L3 non requis pour US-033.

**Justification** : US-033 est une infrastructure dev-only sans composant UI propre.
Le bouton de simulation dans W-04 est explicitement hors périmètre de cette US
(mentionné dans la spécification : "l'endpoint REST suffit pour les tests automatisés ;
le bouton UI peut être ajouté dans une US séparée"). L1 et L2 couvrent l'intégralité
des critères d'acceptation SC1 à SC6.
