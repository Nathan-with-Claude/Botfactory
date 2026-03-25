# Scénarios de tests US-006 — Mode offline et synchronisation

**US liée** : US-006
**Titre** : Continuer à livrer en zone blanche et synchroniser dès le retour de connexion
**Bounded Context** : BC-01 Orchestration de Tournée (mobile offline) + BC-05 Intégration SI
**Aggregate / Domain Event ciblé** : Tournée (état local offline) / LivraisonConfirmee, EchecLivraisonDeclare (rejoués)
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-260 : Bandeau "Hors connexion" affiché en mode offline

**US liée** : US-006
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : SyncIndicator — testID="bandeau-hors-connexion"
**Type** : Fonctionnel (happy path offline)
**Préconditions** : Application mobile démarrée, réseau simulé comme absent
**Étapes** :
1. Charger l'application
2. Intercepter toutes les requêtes réseau pour simuler le mode hors connexion
3. Observer le bandeau affiché

**Résultat attendu** : Le bandeau orange "Hors connexion — Données locales" (testID="bandeau-hors-connexion") est affiché
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-02 (ListeColisScreen)
And le réseau est simulé comme absent (offline)
When l'application détecte la perte de connexion
Then le bandeau orange "Hors connexion — Données locales" (testID="bandeau-hors-connexion") est affiché
And les données locales sont toujours visibles
```

---

### TC-261 : Indicateur "X action(s) en attente" affiché après action offline

**US liée** : US-006
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : SyncIndicator — testID="indicateur-sync"
**Type** : Fonctionnel
**Préconditions** : Mode offline simulé, une commande en file d'attente
**Étapes** :
1. Simuler le mode offline
2. Confirmer une livraison (action enqueued localement)
3. Observer l'indicateur de synchronisation

**Résultat attendu** : L'indicateur "Synchronisation en attente — 1 action(s)" (testID="indicateur-sync") est affiché
**Statut** : Passé

```gherkin
Given Pierre est hors connexion et sur l'écran M-02
When Pierre confirme une livraison en mode offline
Then l'action est ajoutée à la file offline
And l'indicateur "1 action(s) en attente" (testID="indicateur-sync") est affiché
And aucune erreur n'est affichée (mode dégradé transparent)
```

---

### TC-262 : Idempotence — la même commande n'est pas en-filée deux fois

**US liée** : US-006
**Couche testée** : Application (Domain mobile — offlineQueue)
**Aggregate / Domain Event ciblé** : offlineQueue.enqueue() — idempotent sur commandId
**Type** : Invariant domaine
**Préconditions** : Tests Jest disponibles
**Étapes** :
1. Lancer `npx jest --testPathPattern="offlineQueue"`
2. Vérifier les tests d'idempotence (enqueue avec même commandId ignoré)

**Résultat attendu** : 14/14 tests offlineQueue verts — la file ne contient pas de doublons de commandId
**Statut** : Passé

```gherkin
Given une commande avec commandId="uuid-test-001" est déjà dans la file offline
When enqueue() est appelé avec le même commandId="uuid-test-001"
Then la commande n'est pas ajoutée en doublon
And la file contient toujours exactement 1 commande avec cet id
```

---

### TC-263 : Replay FIFO au retour du réseau — synchronisation automatique

**US liée** : US-006
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : CommandIdempotencyFilter — X-Command-Id
**Type** : Fonctionnel
**Préconditions** : Backend svc-tournee en profil dev, endpoint POST /livraison disponible
**Étapes** :
1. Envoyer POST /api/tournees/{id}/colis/{id}/livraison avec header X-Command-Id: uuid-sync-001
2. Vérifier HTTP 200
3. Renvoyer la même requête (doublon idempotent)
4. Vérifier HTTP 409

**Résultat attendu** : Premier appel HTTP 200, deuxième appel HTTP 409 (idempotence backend)
**Statut** : Passé

```gherkin
Given le backend svc-tournee tourne en profil dev avec CommandIdempotencyFilter actif
When POST /api/tournees/{id}/colis/{id}/livraison est appelé avec X-Command-Id: uuid-sync-001
Then la réponse est HTTP 200 (première fois)
When la même requête est envoyée à nouveau avec le même X-Command-Id
Then la réponse est HTTP 409 Conflict (idempotence — doublon rejeté)
```

---

### TC-264 : canCloseRoute() retourne false si file non vide

**US liée** : US-006
**Couche testée** : Application (Domain mobile — offlineQueue)
**Aggregate / Domain Event ciblé** : offlineQueue.canCloseRoute()
**Type** : Invariant domaine
**Préconditions** : Tests Jest disponibles
**Étapes** :
1. Lancer `npx jest --testPathPattern="offlineQueue"`
2. Vérifier le test canCloseRoute

**Résultat attendu** : canCloseRoute() retourne false si des commandes sont en attente, true si la file est vide
**Statut** : Passé

```gherkin
Given la file offline contient 1 commande en attente de synchronisation
When canCloseRoute() est appelé
Then la valeur retournée est false (blocage de la clôture)
When la file est vidée (sync terminée)
And canCloseRoute() est appelé à nouveau
Then la valeur retournée est true
```

---

### TC-265 : Sync partielle — arrêt sur erreur réseau, commandes restantes conservées

**US liée** : US-006
**Couche testée** : Application (Domain mobile — offlineQueue.sync())
**Aggregate / Domain Event ciblé** : offlineQueue.sync() — arrêt sur erreur, FIFO préservé
**Type** : Edge case
**Préconditions** : Tests Jest disponibles
**Étapes** :
1. Lancer `npx jest --testPathPattern="offlineQueue"`
2. Vérifier le test sync partielle

**Résultat attendu** : sync() s'arrête à la première erreur réseau. Les commandes non exécutées sont conservées dans la file dans leur ordre FIFO original.
**Statut** : Passé

```gherkin
Given la file offline contient 3 commandes (cmd-A, cmd-B, cmd-C) dans l'ordre FIFO
And cmd-B déclenche une erreur réseau lors du replay
When sync() est lancé
Then cmd-A est exécutée avec succès
And cmd-B échoue → sync() s'arrête
And cmd-B et cmd-C restent dans la file, dans l'ordre original
```

---

### TC-266 : SyncIndicator — spinner visible pendant la synchronisation active

**US liée** : US-006
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : SyncIndicator — testID="spinner-sync"
**Type** : Fonctionnel
**Préconditions** : Mode offline simulé, sync en cours
**Étapes** :
1. Simuler des actions offline
2. Simuler le retour du réseau
3. Observer l'indicateur pendant la synchronisation

**Résultat attendu** : Le spinner de synchronisation (testID="spinner-sync") est visible pendant la sync active
**Statut** : Passé

```gherkin
Given Pierre a des actions en attente dans la file offline
When le réseau revient et la synchronisation est déclenchée
Then le spinner de synchronisation (testID="spinner-sync") est visible
And après la sync réussie, le spinner disparaît
And les actions ne sont plus dans la file
```
