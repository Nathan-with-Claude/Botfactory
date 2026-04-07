# US-056 — Persister la file offline entre sessions via AsyncStorage

> Feature : F-006 — Mode offline et synchronisation
> Epic : EPIC-001 — Exécution de la Tournée (app mobile livreur)
> Bounded Context : BC-01 — Tournée
> Aggregate(s) touchés : Tournee, Colis (commandes CONFIRMER_LIVRAISON, DECLARER_ECHEC)
> Priorité : P1 — Important avant démo terrain
> Complexité estimée : S
> Statut : À faire

## En tant que…

Livreur terrain travaillant en zone de faible couverture réseau,

## Je veux…

que mes actions de livraison et d'échec enregistrées en mode offline soient conservées même si je ferme et rouvre l'application,

## Afin de…

ne pas perdre mes commandes en attente de synchronisation quand l'application est fermée ou que le téléphone redémarre.

## Contexte

**Écart as-built identifié (rapport-as-built-mobile.md, §6 et §11, point 3) :**

`offlineQueue.ts` stocke les commandes en mémoire vive uniquement. Si le livreur ferme l'application avant le retour de la connexion, toutes les commandes enfilées (CONFIRMER_LIVRAISON, DECLARER_ECHEC) sont perdues. `AsyncStorage` est référencé dans la documentation mais n'est pas utilisé dans `offlineQueue.ts`.

**Ce qui est attendu :**
- À chaque `enqueue()`, sérialiser la file dans AsyncStorage (clé `offline_queue`).
- Au démarrage de l'application (`useOfflineSync` ou `offlineQueue` init), charger la file depuis AsyncStorage.
- À chaque `dequeue()` réussi (commande synchronisée), mettre à jour AsyncStorage.
- La logique de `canCloseRoute()` (file vide) doit tenir compte de la file persistée.

**Invariants à respecter (offlineQueue) :**
- L'idempotence par `commandId` est déjà implémentée — elle doit être préservée après rechargement depuis AsyncStorage.
- L'ordre FIFO doit être maintenu lors du rechargement.
- Les 409 côté serveur (déjà synchronisé) doivent toujours être traités comme des succès (idempotence backend).
- La clôture de tournée reste conditionnée à `canCloseRoute()` (file vide et synchronisée).

## Critères d'acceptation

**Scénario 1 — Persistance après fermeture**
- Given le livreur a enfilé 3 commandes offline (CONFIRMER_LIVRAISON × 2, DECLARER_ECHEC × 1) sans connexion réseau
- When il ferme l'application (kill process)
- And il rouvre l'application
- Then la file contient toujours les 3 commandes dans l'ordre FIFO

**Scénario 2 — Synchronisation automatique après réouverture**
- Given la file contient des commandes persistées
- When le livreur rouvre l'application et qu'une connexion réseau est disponible
- Then useOfflineSync déclenche la synchronisation automatiquement
- And les commandes sont envoyées dans l'ordre FIFO avec leur commandId original
- And la file AsyncStorage est vidée au fur et à mesure

**Scénario 3 — Idempotence après rechargement**
- Given une commande CONFIRMER_LIVRAISON avec commandId `cmd-uuid-001` a déjà été synchronisée côté serveur
- When la file est rechargée depuis AsyncStorage et tente de renvoyer `cmd-uuid-001`
- Then le 409 retourné par le serveur est traité comme un succès (pas de doublon)

**Scénario 4 — Clôture conditionnée à la file vide**
- Given la file contient des commandes non synchronisées persistées
- When le livreur tente de clôturer sa tournée
- Then `canCloseRoute()` retourne false
- And le bouton de clôture est désactivé ou un message d'avertissement est affiché

**Scénario 5 — File vide = clôture autorisée**
- Given toutes les commandes offline ont été synchronisées
- When `canCloseRoute()` est évalué
- Then il retourne true
- And la clôture de tournée peut être déclenchée

## Définition of Done

- [ ] `offlineQueue.ts` : `enqueue()` sérialise dans AsyncStorage après chaque ajout
- [ ] `offlineQueue.ts` : fonction d'initialisation charge la file depuis AsyncStorage au démarrage
- [ ] `offlineQueue.ts` : `dequeue()` met à jour AsyncStorage après chaque synchronisation réussie
- [ ] `useOfflineSync.ts` : appel de l'initialisation au montage du hook
- [ ] Tests unitaires `offlineQueue.test.ts` : ajout de cas de test persistance + rechargement (mock AsyncStorage)
- [ ] Aucune régression sur les tests existants de la file offline

## Liens

- Rapport as-built : /livrables/04-architecture-technique/rapport-as-built-mobile.md#6-mode-offline
- US liée : US-006 (mode offline + synchronisation)
- Fichiers concernés :
  - `src/mobile/src/domain/offlineQueue.ts`
  - `src/mobile/src/hooks/useOfflineSync.ts`
