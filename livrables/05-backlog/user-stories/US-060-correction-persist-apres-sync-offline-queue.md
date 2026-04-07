# US-060 — Corriger l'appel persist() manquant après sync() dans offlineQueue

**Epic** : EPIC-001 — Exécution de la Tournée (app mobile livreur)
**Feature** : F-006 — Mode offline et synchronisation
**Bounded Context** : BC-01 — Tournée
**Aggregate(s) touchés** : Tournee, Colis (commandes CONFIRMER_LIVRAISON, DECLARER_ECHEC)
**Priorité** : P0 — Bloquant production (risque de double envoi de commandes)
**Statut** : À faire
**Complexité estimée** : XS

---

## En tant que…

En tant que Pierre Morel (livreur terrain) utilisant le mode offline,

## Je veux…

que mes commandes déjà synchronisées avec le bureau soient retirées de la file de stockage dès qu'elles ont été envoyées avec succès,

## Afin de…

éviter qu'un redémarrage de l'application après une synchronisation réussie ne renvoie les mêmes commandes au bureau une seconde fois.

---

## Contexte

**Observation QA OBS-AS-006** (rapport corrections-as-built, 2026-04-04) :

Dans `offlineQueue.ts`, la méthode `sync()` (ou le flux de synchronisation dans `useOfflineSync.ts`) vide la file en mémoire après synchronisation réussie via `dequeue()`, mais n'appelle pas `persist()` (ou l'équivalent — sauvegarde dans AsyncStorage) après ce vidage.

Conséquence : si le livreur ferme l'application juste après une synchronisation réussie, AsyncStorage conserve encore les commandes déjà envoyées. Au prochain démarrage, `offlineQueue.ts` charge ces commandes depuis AsyncStorage et les renvoie au serveur.

Ce scénario est distinct de US-056 (persistance à l'enqueue) : US-056 assure que les commandes survivent à un redémarrage avant synchronisation. La présente US-060 assure que les commandes synchronisées sont bien retirées d'AsyncStorage après synchronisation, empêchant tout double envoi.

L'idempotence backend (gestion des 409) constitue un filet de sécurité, mais ne remplace pas la correction de la source du problème.

**Fichiers concernés** :
- `src/mobile/src/domain/offlineQueue.ts` — la méthode de défilement après sync doit appeler persist()
- `src/mobile/src/hooks/useOfflineSync.ts` — vérifier que le flux de sync appelle bien persist() après chaque dequeue() réussi

**Relation avec US-056** :
- US-056 (P1/S, À faire) couvre la persistance à l'enqueue et au rechargement.
- US-060 (P0/XS) couvre le manque de persist() après dequeue() réussi.
- Ces deux US sont complémentaires et doivent être traitées ensemble. US-060 doit être implémentée en priorité absolue (P0) car le double envoi est un bug fonctionnel.

**Invariants à respecter** :
- L'idempotence par `commandId` (côté serveur, 409 = succès) doit rester intacte.
- L'ordre FIFO de la file ne doit pas être affecté.
- La synchronisation partielle (réseau perdu en cours de sync) doit conserver les commandes non encore envoyées dans AsyncStorage.
- `canCloseRoute()` (file vide) doit retourner true uniquement quand AsyncStorage est vide — pas seulement la file en mémoire.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 — persist() appelé après chaque sync réussie

```gherkin
Given le livreur a 3 commandes en file offline (CONFIRMER_LIVRAISON × 2, DECLARER_ECHEC × 1)
And la file est persistée dans AsyncStorage
When la connexion réseau revient et useOfflineSync déclenche la synchronisation
And les 3 commandes sont envoyées avec succès au serveur (HTTP 200 ou 204)
Then après chaque dequeue() réussi, AsyncStorage est mis à jour immédiatement
And après synchronisation complète, AsyncStorage ne contient plus aucune commande
```

### Scénario 2 — Pas de double envoi au redémarrage après sync réussie

```gherkin
Given 3 commandes ont été synchronisées avec succès
And l'application est fermée immédiatement après la synchronisation
When le livreur rouvre l'application
Then offlineQueue charge une file vide depuis AsyncStorage
And aucune commande n'est renvoyée au serveur
And l'événement CommandeSynchronisee n'est pas déclenché à nouveau
```

### Scénario 3 — Synchronisation partielle conserve les commandes restantes

```gherkin
Given le livreur a 4 commandes en file offline
When la synchronisation commence et envoie 2 commandes avec succès
And la connexion réseau est perdue avant les 2 commandes restantes
Then AsyncStorage contient exactement les 2 commandes non encore envoyées
And les 2 commandes envoyées ne sont plus dans AsyncStorage
```

### Scénario 4 — L'idempotence backend reste le filet de sécurité

```gherkin
Given une commande CONFIRMER_LIVRAISON avec commandId "cmd-uuid-001" a été envoyée
And persist() n'a pas été appelé pour une raison exceptionnelle (crash immédiat)
When le livreur rouvre l'application et "cmd-uuid-001" est renvoyée
Then le serveur retourne HTTP 409 (déjà synchronisé)
And useOfflineSync traite le 409 comme un succès et retire la commande de la file
And l'événement PreuveCapturee n'est pas créé en doublon côté domaine
```

---

## Définition of Done

- [ ] `offlineQueue.ts` : `dequeue()` ou `markSynced()` appelle `persist()` (ou écrit dans AsyncStorage) immédiatement après chaque synchronisation réussie
- [ ] `useOfflineSync.ts` : le flux de synchronisation n'accumule pas de commandes "fantômes" dans AsyncStorage
- [ ] Tests unitaires `offlineQueue.test.ts` : scénario "après sync, AsyncStorage est vide" ajouté et passant
- [ ] Tests unitaires : scénario "redémarrage après sync = file vide" ajouté et passant
- [ ] Aucune régression sur les cas de persistance à l'enqueue (US-056)
- [ ] Aucune régression sur l'idempotence commandId

---

## Liens

- Rapport QA source : /livrables/07-tests/scenarios/corrections-as-built-scenarios.md (OBS-AS-006)
- Feedback terrain source : /livrables/09-feedback/feedback-corrections-as-built-2026-04-04.md
- US complémentaire : US-056 — Persistance offlineQueue AsyncStorage
- US liée (domaine offline) : US-006 — Mode offline et synchronisation
- Fichiers concernés :
  - `src/mobile/src/domain/offlineQueue.ts`
  - `src/mobile/src/hooks/useOfflineSync.ts`
