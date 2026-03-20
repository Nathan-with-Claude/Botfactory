# Scénarios de tests US-001 : Consulter la liste des colis assignés à ma tournée

**US liée** : US-001 — Consulter la liste des colis assignés à ma tournée
**Bounded Context** : BC-01 Orchestration de Tournée
**Aggregate principal** : Tournee
**Domain Events ciblés** : TourneeDemarree, TourneeChargee
**Rédigé par** : @qa
**Date** : 2026-03-20
**Nombre total de TCs** : 25

---

## Rappel des invariants domaine (BC-01)

- BC-01-INV-01 : Une Tournée ne peut être démarrée que si elle contient au moins un Colis.
- BC-01-INV-02 : `TourneeDemarree` est émis exactement une fois par journée par tournée (idempotence).
- BC-01-INV-03 : `TourneeChargee` est émis à chaque chargement de la tournée.
- BC-01-INV-04 : Le `StatutColis` initial est `A_LIVRER` pour tout colis nouvellement assigné.
- BC-01-INV-05 : `calculerAvancement()` comptabilise `LIVRE` et `ECHEC` comme colis traités.

---

## A — Tests d'invariants domaine (Domain Layer)

### TC-001 : `demarrer()` lève TourneeInvariantException si la tournée est sans colis

**US liée** : US-001
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournee / aucun event
**Type** : Invariant domaine
**Préconditions** :
- Une Tournee est instanciée avec une liste de colis vide.
- Le statut est `PLANIFIEE`.

**Étapes** :
1. Créer une instance `Tournee` avec `colis = []` et statut `PLANIFIEE`.
2. Appeler `tournee.demarrer()`.

**Résultat attendu** :
- `TourneeInvariantException` est levée avec un message indiquant l'absence de colis.
- Aucun Domain Event n'est collecté dans `domainEvents`.
- Le statut de la Tournee reste `PLANIFIEE`.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/domain/TourneeTest.java`
**Statut** : À tester

---

### TC-002 : `TourneeDemarree` est émis lors du premier appel à `demarrer()`

**US liée** : US-001
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournee / TourneeDemarree
**Type** : Invariant domaine
**Préconditions** :
- Une Tournee avec au moins 1 colis, statut `PLANIFIEE`.

**Étapes** :
1. Créer une instance `Tournee` avec 1 colis en statut `A_LIVRER`.
2. Appeler `tournee.demarrer()`.
3. Appeler `tournee.pullDomainEvents()`.

**Résultat attendu** :
- La liste retournée contient exactement 1 événement de type `TourneeDemarree`.
- L'événement porte l'`id` de la tournée, le `livreurId` et un `horodatage` non nul.
- Le statut de la Tournee est `DEMARREE`.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/domain/TourneeTest.java`
**Statut** : À tester

---

### TC-003 : `TourneeDemarree` n'est PAS émis lors d'un second appel à `demarrer()` (idempotence)

**US liée** : US-001
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournee / TourneeDemarree (absence)
**Type** : Invariant domaine
**Préconditions** :
- Une Tournee avec au moins 1 colis, statut `DEMARREE` (premier `demarrer()` déjà appelé).
- `pullDomainEvents()` a déjà été appelé (liste interne vidée).

**Étapes** :
1. Créer une instance `Tournee` avec 1 colis, statut `DEMARREE`.
2. Appeler `tournee.demarrer()` une seconde fois.
3. Appeler `tournee.pullDomainEvents()`.

**Résultat attendu** :
- La liste retournée est vide (aucun `TourneeDemarree` émis en doublon).
- Le statut de la Tournee reste `DEMARREE`.
- Aucune exception n'est levée.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/domain/TourneeTest.java`
**Statut** : À tester

---

### TC-004 : `calculerAvancement()` retourne colisTraites=0 et colisTotal=N si tous les colis sont à livrer

**US liée** : US-001
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournee / Avancement (Value Object)
**Type** : Invariant domaine
**Préconditions** :
- Une Tournee avec N colis, tous en statut `A_LIVRER` (N >= 1).

**Étapes** :
1. Créer une instance `Tournee` avec 5 colis en statut `A_LIVRER`.
2. Appeler `tournee.calculerAvancement()`.

**Résultat attendu** :
- `avancement.colisTraites()` == 0.
- `avancement.colisTotal()` == 5.
- `avancement.estimationFin()` == null (limitation MVP US-001).

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/domain/TourneeTest.java`
**Statut** : À tester

---

### TC-005 : `calculerAvancement()` comptabilise LIVRE et ECHEC comme colis traités

**US liée** : US-001
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournee / Avancement (Value Object)
**Type** : Invariant domaine
**Préconditions** :
- Une Tournee avec 5 colis : 2 en statut `LIVRE`, 1 en statut `ECHEC`, 2 en statut `A_LIVRER`.

**Étapes** :
1. Créer une instance `Tournee` avec 5 colis dans les statuts ci-dessus.
2. Appeler `tournee.calculerAvancement()`.

**Résultat attendu** :
- `avancement.colisTraites()` == 3 (2 LIVRE + 1 ECHEC).
- `avancement.colisTotal()` == 5.
- Les colis en statut `A_LIVRER` ne sont PAS comptabilisés comme traités.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/domain/TourneeTest.java`
**Statut** : À tester

---

## B — Tests Application Layer

### TC-006 : Le Handler retourne la tournée avec ses colis quand elle existe

**US liée** : US-001
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : Tournee / TourneeDemarree
**Type** : Fonctionnel
**Préconditions** :
- Le `TourneeRepository` (mock) retourne une Tournee avec 5 colis pour `livreur-001` à la date du jour.

**Étapes** :
1. Préparer un mock `TourneeRepository.findByLivreurAndDate(livreur-001, aujourd'hui)` retournant une Tournee valide.
2. Exécuter `ConsulterListeColisHandler.handle(new ConsulterListeColisCommand("livreur-001", today))`.

**Résultat attendu** :
- Le handler retourne une Tournee non nulle avec 5 colis.
- `tournee.demarrer()` est appelé sur l'agrégat.
- La Tournee est sauvegardée via `TourneeRepository.save(tournee)`.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/application/ConsulterListeColisHandlerTest.java`
**Statut** : À tester

---

### TC-007 : Le Handler lève TourneeNotFoundException si aucune tournée pour ce livreur aujourd'hui

**US liée** : US-001
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : Tournee / aucun event
**Type** : Edge case
**Préconditions** :
- Le `TourneeRepository` (mock) retourne `Optional.empty()` pour `livreur-001` à la date du jour.

**Étapes** :
1. Préparer un mock `TourneeRepository.findByLivreurAndDate(livreur-001, aujourd'hui)` retournant `Optional.empty()`.
2. Exécuter `ConsulterListeColisHandler.handle(new ConsulterListeColisCommand("livreur-001", today))`.

**Résultat attendu** :
- `TourneeNotFoundException` est levée.
- `TourneeRepository.save()` n'est JAMAIS appelé.
- Aucun Domain Event n'est publié.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/application/ConsulterListeColisHandlerTest.java`
**Statut** : À tester

---

### TC-008 : Le Handler sauvegarde la tournée après `demarrer()`

**US liée** : US-001
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : Tournee / TourneeDemarree
**Type** : Fonctionnel
**Préconditions** :
- Le `TourneeRepository` (mock) retourne une Tournee valide (statut `PLANIFIEE`, 3 colis).
- Le `TourneeEventPublisher` (mock) est prêt à recevoir des events.

**Étapes** :
1. Préparer mocks : repository retourne une Tournee valide, publisher ne fait rien.
2. Exécuter `ConsulterListeColisHandler.handle(...)`.
3. Vérifier les interactions avec les mocks (Mockito `verify`).

**Résultat attendu** :
- `TourneeRepository.save(tournee)` est appelé exactement 1 fois après `demarrer()`.
- L'ordre est garanti : `demarrer()` → `save()` → publication des events.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/application/ConsulterListeColisHandlerTest.java`
**Statut** : À tester

---

### TC-009 : Le Handler publie `TourneeDemarree` après sauvegarde (collect-and-publish)

**US liée** : US-001
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : Tournee / TourneeDemarree
**Type** : Fonctionnel
**Préconditions** :
- Le `TourneeRepository` (mock) retourne une Tournee valide en statut `PLANIFIEE`.
- Le `TourneeEventPublisher` (mock) capture les events publiés.

**Étapes** :
1. Préparer mocks.
2. Exécuter `ConsulterListeColisHandler.handle(...)`.
3. Capturer les events publiés via le mock publisher.

**Résultat attendu** :
- `TourneeEventPublisher.publish(event)` est appelé au moins 1 fois.
- L'event publié est de type `TourneeDemarree`.
- La publication intervient APRES `TourneeRepository.save()` (collect-and-publish garanti).

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/application/ConsulterListeColisHandlerTest.java`
**Statut** : À tester

---

## C — Tests Interface / API

### TC-010 : `GET /api/tournees/today` retourne HTTP 200 avec le TourneeDTO complet (5 colis du seeder)

**US liée** : US-001
**Couche testée** : Interface
**Aggregate / Domain Event ciblé** : Tournee / TourneeDTO
**Type** : Fonctionnel
**Préconditions** :
- Profil `dev` actif : `MockJwtAuthFilter` injecte `livreur-001 / ROLE_LIVREUR`.
- `DevDataSeeder` a créé la Tournee `TRN-2026-0001` avec 5 colis pour `livreur-001`.

**Étapes** :
1. Envoyer `GET /api/tournees/today` avec authentification mock (profil dev).
2. Analyser la réponse HTTP.

**Résultat attendu** :
- HTTP 200 OK.
- Corps JSON contient un `TourneeDTO` avec :
  - `id` non nul.
  - `livreurId` == `livreur-001`.
  - `colis` : liste de 5 éléments.
  - `avancement.colisTotal` == 5.
  - `avancement.colisTraites` == 0.
  - `avancement.estimationFin` == null.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/interfaces/TourneeControllerTest.java`
**Statut** : À tester

---

### TC-011 : `GET /api/tournees/today` retourne HTTP 404 si pas de tournée pour ce livreur

**US liée** : US-001
**Couche testée** : Interface
**Aggregate / Domain Event ciblé** : Tournee / TourneeNotFoundException
**Type** : Edge case
**Préconditions** :
- Profil `dev` actif : `MockJwtAuthFilter` injecte `livreur-999 / ROLE_LIVREUR` (livreur sans tournée).
- Aucune tournée n'existe pour `livreur-999` à la date du jour.

**Étapes** :
1. Envoyer `GET /api/tournees/today` avec un livreurId sans tournée assignée.
2. Analyser la réponse HTTP.

**Résultat attendu** :
- HTTP 404 Not Found.
- Corps JSON contient un message d'erreur métier intelligible.
- Aucun stack trace technique n'est exposé dans la réponse.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/interfaces/TourneeControllerTest.java`
**Statut** : À tester

---

### TC-012 : `GET /api/tournees/today` retourne HTTP 401 si non authentifié

**US liée** : US-001
**Couche testée** : Interface
**Aggregate / Domain Event ciblé** : Tournee / SecurityConfig
**Type** : Sécurité
**Préconditions** :
- Aucun token d'authentification dans la requête (pas de header `Authorization`).
- `MockJwtAuthFilter` non actif (ou requête sans credentials).

**Étapes** :
1. Envoyer `GET /api/tournees/today` sans header d'authentification.
2. Analyser la réponse HTTP.

**Résultat attendu** :
- HTTP 401 Unauthorized.
- Le handler `ConsulterListeColisHandler` n'est PAS appelé.
- Aucune donnée de tournée n'est exposée.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/interfaces/TourneeControllerTest.java`
**Statut** : À tester

---

### TC-013 : Le DTO retourné contient les contraintes horaires d'un colis (typeContrainte + valeur)

**US liée** : US-001
**Couche testée** : Interface
**Aggregate / Domain Event ciblé** : Tournee / ColisDTO / ContrainteDTO
**Type** : Fonctionnel
**Préconditions** :
- La Tournee du seeder contient le colis `COL-002` avec la contrainte `AVANT_14H00`.

**Étapes** :
1. Envoyer `GET /api/tournees/today` (profil dev, `livreur-001`).
2. Dans le JSON retourné, localiser le colis `COL-002`.
3. Vérifier la structure du champ `contraintes`.

**Résultat attendu** :
- `colis[1].contraintes` est une liste non vide.
- Le premier élément contient `typeContrainte: "AVANT_14H00"` (ou équivalent).
- L'attribut `estHoraire` (ou `aUneContrainteHoraire`) est `true` pour cette contrainte.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/interfaces/TourneeControllerTest.java`
**Statut** : À tester

---

### TC-014 : Le champ `resteALivrer` dans le DTO correspond à `colisTotal - colisTraites`

**US liée** : US-001
**Couche testée** : Interface
**Aggregate / Domain Event ciblé** : Tournee / TourneeDTO / Avancement
**Type** : Fonctionnel
**Préconditions** :
- La Tournee du seeder a 5 colis, tous en statut `A_LIVRER`.

**Étapes** :
1. Envoyer `GET /api/tournees/today` (profil dev).
2. Lire les valeurs `avancement.colisTotal` et `avancement.colisTraites` dans le JSON.
3. Calculer `resteALivrer = colisTotal - colisTraites`.

**Résultat attendu** :
- `avancement.colisTotal` == 5.
- `avancement.colisTraites` == 0.
- `resteALivrer` == 5 (affiché dans le bandeau "Reste à livrer : 5 / 5").

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/interfaces/TourneeControllerTest.java`
**Statut** : À tester

---

## D — Tests Mobile

### TC-015 : `ListeColisScreen` affiche le spinner pendant le chargement

**US liée** : US-001
**Couche testée** : Mobile
**Aggregate / Domain Event ciblé** : ListeColisScreen / état chargement
**Type** : Fonctionnel
**Préconditions** :
- L'appel `getTourneeAujourdhui()` est en cours (promesse non résolue).

**Étapes** :
1. Monter `ListeColisScreen` avec un mock `getTourneeAujourdhui` qui ne se résout pas immédiatement.
2. Vérifier l'état de rendu avant la résolution de la promesse.

**Résultat attendu** :
- Un composant spinner (ActivityIndicator ou équivalent) est visible dans le rendu.
- La liste de colis n'est pas encore affichée.
- Pas de message d'erreur visible.

**Fichier de test correspondant** : `src/mobile/src/__tests__/ListeColisScreen.test.tsx`
**Statut** : À tester

---

### TC-016 : `ListeColisScreen` affiche "Reste à livrer : 5 / 5" avec 5 colis en statut A_LIVRER

**US liée** : US-001
**Couche testée** : Mobile
**Aggregate / Domain Event ciblé** : ListeColisScreen / bandeau progression
**Type** : Fonctionnel
**Préconditions** :
- `getTourneeAujourdhui()` retourne le JDD-001 (5 colis, tous `A_LIVRER`, `colisTraites=0`).

**Étapes** :
1. Monter `ListeColisScreen` avec le mock retournant le JDD-001.
2. Attendre la résolution du chargement.
3. Vérifier le texte du bandeau de progression.

**Résultat attendu** :
- Le bandeau affiche exactement le texte "Reste à livrer : 5 / 5" (ou "5 / 5 colis").
- La liste affiche 5 éléments `ColisItem`.
- Le spinner a disparu.

**Fichier de test correspondant** : `src/mobile/src/__tests__/ListeColisScreen.test.tsx`
**Statut** : À tester

---

### TC-017 : `ListeColisScreen` affiche "Aucun colis assigné" si la tournée est vide

**US liée** : US-001
**Couche testée** : Mobile
**Aggregate / Domain Event ciblé** : ListeColisScreen / état vide
**Type** : Edge case
**Préconditions** :
- `getTourneeAujourdhui()` retourne une réponse `TourneeNonTrouveeError` (HTTP 404 traduit).

**Étapes** :
1. Monter `ListeColisScreen` avec le mock levant `TourneeNonTrouveeError`.
2. Attendre la résolution du chargement.
3. Vérifier le message affiché.

**Résultat attendu** :
- Le message "Aucun colis assigné pour aujourd'hui. Contactez votre superviseur." est visible.
- Aucun `ColisItem` n'est rendu.
- Le bandeau "Reste à livrer" n'est pas affiché.

**Fichier de test correspondant** : `src/mobile/src/__tests__/ListeColisScreen.test.tsx`
**Statut** : À tester

---

### TC-018 : `ListeColisScreen` affiche un message d'erreur si l'API retourne une erreur réseau

**US liée** : US-001
**Couche testée** : Mobile
**Aggregate / Domain Event ciblé** : ListeColisScreen / état erreur
**Type** : Edge case
**Préconditions** :
- `getTourneeAujourdhui()` lève une erreur réseau générique (ex. `Network request failed`).

**Étapes** :
1. Monter `ListeColisScreen` avec le mock levant une erreur réseau.
2. Attendre la résolution du chargement.
3. Vérifier le message d'erreur affiché.

**Résultat attendu** :
- Un message d'erreur générique (ex. "Impossible de charger votre tournée. Vérifiez votre connexion.") est visible.
- Aucun `ColisItem` n'est rendu.
- Un bouton "Réessayer" ou équivalent est accessible.

**Fichier de test correspondant** : `src/mobile/src/__tests__/ListeColisScreen.test.tsx`
**Statut** : À tester

---

### TC-019 : `ColisItem` affiche la contrainte horaire mise en évidence (style différent) vs contrainte non horaire

**US liée** : US-001
**Couche testée** : Mobile
**Aggregate / Domain Event ciblé** : ColisItem / Contrainte.aUneContrainteHoraire
**Type** : Fonctionnel
**Préconditions** :
- Un colis avec contrainte `AVANT_14H00` (`estHoraire=true`) et un colis avec contrainte `FRAGILE` (`estHoraire=false`).

**Étapes** :
1. Rendre `ColisItem` avec le colis `COL-002` (contrainte `AVANT_14H00`, `estHoraire=true`).
2. Vérifier le style appliqué à l'élément de contrainte.
3. Rendre `ColisItem` avec le colis `COL-003` (contrainte `FRAGILE`, `estHoraire=false`).
4. Comparer les styles des deux contraintes.

**Résultat attendu** :
- La contrainte `AVANT_14H00` est rendue avec un style visuellement distinctif (ex. couleur d'alerte, gras, icône).
- La contrainte `FRAGILE` est rendue avec un style standard.
- Les deux contraintes sont affichées (ni l'une ni l'autre n'est masquée).

**Fichier de test correspondant** : `src/mobile/src/__tests__/ListeColisScreen.test.tsx`
**Statut** : À tester

---

## E — Edge cases et non-régression

### TC-020 : Un colis avec plusieurs contraintes affiche toutes les contraintes

**US liée** : US-001
**Couche testée** : Mobile / Interface
**Aggregate / Domain Event ciblé** : Colis / ColisItem / ColisDTO
**Type** : Edge case
**Préconditions** :
- Un colis avec 3 contraintes : `AVANT_9H00`, `FRAGILE`, `DOCUMENT_SENSIBLE` (JDD-004).

**Étapes** :
1. Via l'API : `GET /api/tournees/today` avec un colis multi-contraintes.
2. Vérifier que le DTO contient 3 éléments dans `contraintes`.
3. Via le mobile : rendre `ColisItem` avec ce colis.
4. Vérifier que les 3 contraintes sont affichées.

**Résultat attendu** :
- API : `ColisDTO.contraintes` contient exactement 3 éléments.
- Mobile : 3 badges de contrainte sont visibles dans le rendu du `ColisItem`.
- La contrainte `AVANT_9H00` est mise en évidence (horaire).

**Fichier de test correspondant** : `src/mobile/src/__tests__/ListeColisScreen.test.tsx`, `src/test/java/com/docapost/tournee/interfaces/TourneeControllerTest.java`
**Statut** : À tester

---

### TC-021 : Une tournée avec un seul colis démarre correctement (cas limite)

**US liée** : US-001
**Couche testée** : Domain / Application
**Aggregate / Domain Event ciblé** : Tournee / TourneeDemarree
**Type** : Edge case
**Préconditions** :
- Une Tournee avec exactement 1 colis en statut `A_LIVRER`.

**Étapes** :
1. Créer une instance `Tournee` avec 1 seul colis.
2. Appeler `tournee.demarrer()`.
3. Appeler `tournee.pullDomainEvents()`.

**Résultat attendu** :
- Aucune exception n'est levée (le seuil minimum est 1 colis).
- `TourneeDemarree` est émis.
- `calculerAvancement()` retourne `colisTotal=1`, `colisTraites=0`.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/domain/TourneeTest.java`
**Statut** : À tester

---

### TC-022 : Si le `DevDataSeeder` est relancé (redémarrage), il ne crée pas de doublon (idempotence seeder)

**US liée** : US-001
**Couche testée** : Infrastructure
**Aggregate / Domain Event ciblé** : Tournee / DevDataSeeder
**Type** : Non régression
**Préconditions** :
- Profil `dev` actif.
- La tournée `TRN-2026-0001` a déjà été créée par un premier démarrage de l'application.

**Étapes** :
1. Démarrer l'application une seconde fois (ou appeler manuellement `DevDataSeeder.run()`).
2. Interroger la base H2 : `SELECT COUNT(*) FROM tournee WHERE livreur_id = 'livreur-001' AND date = CURRENT_DATE`.

**Résultat attendu** :
- Le compteur retourne 1 (pas de doublon).
- Les colis associés sont toujours exactement 5.
- L'application démarre sans exception liée à une contrainte d'unicité.

**Fichier de test correspondant** : test manuel en dev local (à automatiser en test d'intégration)
**Statut** : À tester (manuel)

---

### TC-023 : `TourneeChargee` est défini dans les Domain Events de la tournée (non-régression)

**US liée** : US-001
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournee / TourneeChargee
**Type** : Non régression
**Préconditions** :
- Le code source du domaine est présent (`TourneeChargee.java` existe).

**Étapes** :
1. Vérifier que la classe `TourneeChargee` implémente l'interface `DomainEvent`.
2. Vérifier que `TourneeChargee` est référencé dans les Domain Events de l'agrégat `Tournee` (ou dans le Handler).
3. S'assurer qu'aucun commit ne supprime cette classe sans migration planifiée.

**Résultat attendu** :
- `TourneeChargee.java` existe et compile.
- La classe implémente `DomainEvent`.
- Note : la publication vers BC-03 est intentionnellement désactivée (limitation US-001), ce comportement est attendu et documenté.

**Fichier de test correspondant** : vérification statique du code source (compilation + revue)
**Statut** : À tester

---

## F — Tests de performance

### TC-024 : `GET /api/tournees/today` répond en moins de 500ms pour une tournée de 120 colis (NFR ENF-PERF-006)

**US liée** : US-001
**Couche testée** : Infrastructure / Interface
**Aggregate / Domain Event ciblé** : Tournee / ENF-PERF-006
**Type** : Perf
**Préconditions** :
- Une Tournee avec 120 colis (JDD-003) est persistée en base (profil test de charge).
- L'environnement de test dispose de la même configuration que l'environnement de recette.

**Étapes** :
1. Configurer JMeter ou Gatling avec 10 utilisateurs virtuels simultanés.
2. Envoyer 100 requêtes `GET /api/tournees/today` en séquence (livreur avec 120 colis).
3. Mesurer le temps de réponse (p50, p95, p99).

**Résultat attendu** :
- p95 < 500ms (ENF-PERF-006 : latence API < 500ms pour les requêtes de lecture).
- Aucune requête n'atteint le timeout (> 5 secondes).
- Pas de dégradation mémoire côté JVM après 100 requêtes.

**Fichier de test correspondant** : à créer — `src/test/perf/TourneeLoadTest.jmx` ou `TourneeLoadTest.scala` (Gatling)
**Statut** : À implémenter

---

## G — Tests de sécurité

### TC-025 : Un livreur ne peut pas accéder à la tournée d'un autre livreur

**US liée** : US-001
**Couche testée** : Interface / Application
**Aggregate / Domain Event ciblé** : Tournee / ENF-SEC-005 (RBAC)
**Type** : Sécurité
**Préconditions** :
- `livreur-001` est authentifié (token JWT avec `sub=livreur-001`).
- Une tournée existe pour `livreur-002` (données distinctes).
- Le handler utilise `Authentication.getName()` depuis le `SecurityContext` — PAS un paramètre URL manipulable.

**Étapes** :
1. Envoyer `GET /api/tournees/today` avec token authentifié pour `livreur-001`.
2. Vérifier que le handler utilise bien `livreur-001` (extrait du SecurityContext), et non un paramètre fourni dans la requête.
3. Tenter une manipulation (ex. modifier le header ou ajouter un paramètre `?livreurId=livreur-002`).

**Résultat attendu** :
- Le handler retourne uniquement la tournée de `livreur-001` (isolation garantie par le SecurityContext).
- Aucune donnée de `livreur-002` n'est exposée.
- Un éventuel paramètre `livreurId` dans l'URL est ignoré (le livreurId vient exclusivement du token).

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/interfaces/TourneeControllerTest.java` (test à ajouter)
**Statut** : À implémenter

---

## Récapitulatif des TCs par couche

| TC | Titre court | Couche | Type | Statut |
|----|-------------|--------|------|--------|
| TC-001 | demarrer() sans colis → TourneeInvariantException | Domain | Invariant | À tester |
| TC-002 | TourneeDemarree émis au premier demarrer() | Domain | Invariant | À tester |
| TC-003 | TourneeDemarree non émis en doublon (idempotence) | Domain | Invariant | À tester |
| TC-004 | calculerAvancement() : 0 traités si tout A_LIVRER | Domain | Invariant | À tester |
| TC-005 | calculerAvancement() : LIVRE + ECHEC comptabilisés | Domain | Invariant | À tester |
| TC-006 | Handler retourne tournée avec colis | Application | Fonctionnel | À tester |
| TC-007 | Handler lève TourneeNotFoundException | Application | Edge case | À tester |
| TC-008 | Handler sauvegarde après demarrer() | Application | Fonctionnel | À tester |
| TC-009 | Handler publie TourneeDemarree (collect-and-publish) | Application | Fonctionnel | À tester |
| TC-010 | GET /today → HTTP 200 + DTO 5 colis | Interface | Fonctionnel | À tester |
| TC-011 | GET /today → HTTP 404 si pas de tournée | Interface | Edge case | À tester |
| TC-012 | GET /today → HTTP 401 si non authentifié | Interface | Sécurité | À tester |
| TC-013 | DTO contient contraintes horaires (typeContrainte) | Interface | Fonctionnel | À tester |
| TC-014 | resteALivrer = colisTotal - colisTraites | Interface | Fonctionnel | À tester |
| TC-015 | Spinner visible pendant chargement | Mobile | Fonctionnel | À tester |
| TC-016 | Bandeau "Reste à livrer : 5 / 5" | Mobile | Fonctionnel | À tester |
| TC-017 | Message "Aucun colis assigné" si 404 | Mobile | Edge case | À tester |
| TC-018 | Message erreur si erreur réseau | Mobile | Edge case | À tester |
| TC-019 | Contrainte horaire mise en évidence (style) | Mobile | Fonctionnel | À tester |
| TC-020 | Colis multi-contraintes affiche toutes | Edge case | Edge case | À tester |
| TC-021 | Tournée 1 colis démarre correctement | Domain/Application | Edge case | À tester |
| TC-022 | DevDataSeeder idempotent au redémarrage | Infrastructure | Non régression | À tester (manuel) |
| TC-023 | TourneeChargee défini (non-régression) | Domain | Non régression | À tester |
| TC-024 | GET /today < 500ms pour 120 colis | Infrastructure/Interface | Perf | À implémenter |
| TC-025 | Livreur isolé par SecurityContext (pas URL) | Interface/Application | Sécurité | À implémenter |

---

## Limitations connues documentées

- `estimationFin` est systématiquement `null` dans US-001 (sera implémenté en US-002). TC-004 et TC-010 reflètent ce comportement attendu.
- `TourneeChargee` est défini mais non publié vers BC-03 (TC-023 vérifie l'existence de la classe, pas la publication).
- `MockJwtAuthFilter` remplace OAuth2/Keycloak (US-019) : TC-012 et TC-025 doivent être rejoués avec le vrai SSO quand US-019 est implémentée.
- TC-024 et TC-025 ne peuvent pas s'appuyer sur les tests JUnit/Jest existants : ils nécessitent un outillage supplémentaire (JMeter/Gatling et tests de sécurité dédiés).
