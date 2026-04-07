# US-059 — Migrer l'upload de photo preuve vers multipart (hors payload JSON)

> Feature : F-008 — Capture et accès aux preuves de livraison (BC-02)
> Epic : EPIC-002 — Capture et Accès aux Preuves de Livraison
> Bounded Context : BC-02 — Preuve de Livraison
> Aggregate(s) touchés : PreuveLivraison
> Priorité : P1 — Important avant démo terrain
> Complexité estimée : M
> Statut : À faire

## En tant que…

Livreur terrain capturant une photo comme preuve de livraison,

## Je veux…

que la photo soit envoyée au backend via un upload multipart dédié (et non sérialisée en base64 dans le payload JSON),

## Afin de…

éviter les erreurs de taille de requête (413 Payload Too Large) qui bloqueraient silencieusement la confirmation de livraison, et permettre une meilleure gestion des fichiers photo côté backend.

## Contexte

**Écart as-built identifié (rapport-as-built-mobile.md, §11, point 5) :**

`syncExecutor.ts` sérialise `photoData` directement en JSON lors de la synchronisation des commandes offline. Une photo de smartphone peut dépasser 1 Mo en base64, ce qui :
- Surcharge le payload JSON `POST /api/tournees/{id}/colis/{colisId}/livraison`
- Peut dépasser la limite de taille par défaut de Spring Boot (`spring.servlet.multipart.max-file-size` et `max-request-size`)
- Entraîne une erreur silencieuse côté mobile (la commande est marquée synchronisée mais la photo n'est pas persistée)

**Ce qui est attendu :**
- Séparer l'upload de la photo en deux étapes :
  1. Upload de la photo via `POST /api/tournees/{id}/colis/{colisId}/preuve` (multipart/form-data) → retourne une `preuveId` ou une URL.
  2. Confirmation de livraison via `POST /api/tournees/{id}/colis/{colisId}/livraison` avec `preuveId` (pas de base64 dans le payload).
- En mode offline, la photo est stockée localement (AsyncStorage ou système de fichiers Expo) et uploadée à la synchronisation.
- Le backend svc-tournee doit accepter le multipart et retourner un identifiant de preuve.

**Alternative acceptable pour le MVP** (si le split en 2 étapes est trop complexe) :
- Limiter la résolution/compression de la photo avant encoding base64 pour rester sous 500 Ko.
- Augmenter la limite Spring Boot (`spring.servlet.multipart.max-file-size=5MB`).
- Documenter cette limite dans l'infrastructure locale.

**Invariants à respecter (Aggregate PreuveLivraison) :**
- Une livraison confirmée doit toujours être associée à une preuve (signature ou photo) — l'invariant de non-régression doit être maintenu.
- En mode offline, la commande ne doit pas être marquée "synchronisée" si la photo n'a pas pu être uploadée.
- L'idempotence par `commandId` doit être préservée pour la commande de livraison.

## Critères d'acceptation

**Scénario 1 — Upload photo réussi (solution multipart ou compression)**
- Given le livreur a capturé une photo (taille brute ~2 Mo)
- When il confirme la livraison avec la photo comme preuve
- Then la photo est transmise au backend sans erreur 413
- And la livraison est confirmée avec l'événement `LivraisonConfirmee` émis côté svc-tournee

**Scénario 2 — Upload photo en mode offline**
- Given le livreur est hors connexion et capture une photo
- When il confirme la livraison
- Then la commande est enfilée dans offlineQueue avec la photo stockée localement (pas en mémoire vive)
- When la connexion revient
- Then la photo est uploadée puis la livraison confirmée dans l'ordre FIFO

**Scénario 3 — Échec upload photo — livraison non marquée synchronisée**
- Given la synchronisation est déclenchée
- When l'upload de la photo échoue (timeout, 413)
- Then la commande reste dans la file offline (pas marquée synchronisée)
- And un message d'erreur est affiché au livreur

**Scénario 4 — Livraison sans photo (signature seule) inchangée**
- Given le livreur utilise la signature numérique comme preuve (pas de photo)
- When il confirme la livraison
- Then le flux existant fonctionne sans modification (signature en base64 restant dans le payload est acceptable pour la taille)

**Scénario 5 — Tests existants CapturePreuveScreen inchangés**
- Given la migration est appliquée
- When on exécute `CapturePreuveScreen.test.tsx`
- Then tous les cas de test passent

## Définition of Done

- [ ] Solution choisie documentée (multipart 2 étapes OU compression + limite Spring Boot augmentée) avec justification
- [ ] `syncExecutor.ts` : upload photo via la solution retenue (pas de base64 > 500 Ko dans payload JSON)
- [ ] En mode offline : photo stockée localement (AsyncStorage ou Expo FileSystem) entre fermeture et réouverture
- [ ] Backend svc-tournee : endpoint multipart ajouté OU limite Spring Boot configurée et documentée
- [ ] Cas d'erreur 413 traité côté mobile (message utilisateur + commande non marquée synchronisée)
- [ ] Tests `CapturePreuveScreen.test.tsx` et `syncExecutor.test.ts` mis à jour
- [ ] `/livrables/00-contexte/infrastructure-locale.md` : limite de taille documentée

## Liens

- Rapport as-built : /livrables/04-architecture-technique/rapport-as-built-mobile.md#11-points-dattention
- US liée : US-008 (capturer signature numérique), US-009 (capturer photo ou tiers), US-006 (mode offline)
- Fichiers concernés :
  - `src/mobile/src/api/syncExecutor.ts`
  - `src/mobile/src/screens/CapturePreuveScreen.tsx`
  - `src/backend/svc-tournee/` (endpoint preuve à adapter si solution multipart)
