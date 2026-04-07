# US-062 — Afficher le compteur d'envois en attente dans IndicateurSync

**Epic** : EPIC-001 — Exécution de la Tournée (app mobile livreur)
**Feature** : F-006 — Mode offline et synchronisation
**Bounded Context** : BC-01 — Tournée
**Aggregate(s) touchés** : Tournee (état de synchronisation)
**Priorité** : P1 — Important avant démo terrain
**Statut** : À faire
**Complexité estimée** : S

---

## En tant que…

En tant que Pierre Morel (livreur terrain) travaillant en zone sans réseau,

## Je veux…

voir dans le badge OFFLINE de `IndicateurSync` le nombre exact d'envois en attente (ex. "OFFLINE — 8"),

## Afin de…

savoir combien d'actions de livraison sont stockées localement et pouvoir confirmer à mon superviseur que tout est bien enregistré, même sans connexion.

---

## Contexte

**Signal terrain (feedback Pierre Morel, 2026-04-04, point #1) :**

Après la correction de la persistance offline (US-056), les commandes survivent au redémarrage. Mais le badge OFFLINE affiché dans `IndicateurSync` indique uniquement l'état de connectivité ("OFFLINE" ou "LIVE") sans indiquer le nombre de commandes en attente d'envoi.

Le livreur ne peut pas quantifier ce qui est stocké localement. En tournée rurale avec 30-40 minutes sans réseau, Pierre déclare typiquement 6 à 10 livraisons hors ligne. L'absence de compteur l'oblige à "prendre les gens au mot" sur ce qui est enregistré.

**Ce qui est attendu :**
- Lorsque le livreur est OFFLINE et que la file d'envois contient N commandes, le badge affiche "OFFLINE — N" (ou "OFFLINE · 8 en attente").
- Lorsque N = 0 en mode OFFLINE, le badge affiche simplement "OFFLINE" (sans compteur).
- Lorsque le livreur est LIVE (connexion active, file vide), le badge affiche "LIVE".
- Le compteur se met à jour en temps réel au fur et à mesure que des commandes sont ajoutées à la file ou synchronisées.

**Terminologie terrain à respecter (règle PO 2026-04-04) :**
- Ne pas afficher "en attente de synchronisation" — utiliser "envois en attente" ou "en attente".
- "Synchronisation" est du jargon IT non compris par les livreurs terrain.

**Fichiers concernés** :
- Composant `IndicateurSync` (à identifier dans `src/mobile/src/`) — ajouter la prop `pendingCount`
- Hook `useOfflineSync` ou `offlineQueue` — exposer le nombre de commandes en file
- Écrans utilisant `IndicateurSync` : `ListeColisScreen`, `DetailColisScreen` (a minima)

**Invariants à respecter** :
- Le compteur doit refléter la file persistée dans AsyncStorage (pas seulement la mémoire).
- Le compteur doit décrémenter en temps réel quand une commande est synchronisée.
- Le passage OFFLINE → LIVE avec compteur = 0 doit se faire sans artefact visuel.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 — Badge OFFLINE avec compteur non nul

```gherkin
Given Pierre est hors connexion réseau
And la file offline contient 8 commandes non encore envoyées
When Pierre consulte l'écran ListeColisScreen
Then le badge IndicateurSync affiche "OFFLINE" accompagné du nombre 8
And le libellé utilise le terme "en attente" (pas "synchronisation")
```

### Scénario 2 — Badge OFFLINE sans commandes en attente

```gherkin
Given Pierre est hors connexion réseau
And la file offline est vide (aucune commande en attente)
When Pierre consulte l'écran ListeColisScreen
Then le badge IndicateurSync affiche uniquement "OFFLINE" sans compteur
```

### Scénario 3 — Compteur décrémente en temps réel lors de la synchronisation

```gherkin
Given Pierre vient de retrouver le réseau
And la file offline contient 8 commandes
When useOfflineSync synchronise les commandes une par une
Then le compteur dans IndicateurSync passe de 8 à 7 à 6... jusqu'à 0
And quand le compteur atteint 0, le badge passe à l'état "LIVE"
```

### Scénario 4 — Compteur incrémente lors d'un enqueue en mode OFFLINE

```gherkin
Given Pierre est hors connexion réseau
And la file offline contient 3 commandes
When Pierre confirme une livraison (CONFIRMER_LIVRAISON enfilé)
Then le compteur dans IndicateurSync passe de 3 à 4
And le badge affiche toujours "OFFLINE" avec le nouveau compteur
```

### Scénario 5 — Badge LIVE quand connexion active et file vide

```gherkin
Given Pierre est en mode connecté (réseau disponible)
And la file offline est vide
When Pierre consulte l'écran ListeColisScreen
Then le badge IndicateurSync affiche "LIVE"
And aucun compteur n'est affiché
```

### Scénario 6 — Le compteur reflète la file persistée (pas seulement la mémoire)

```gherkin
Given Pierre avait 5 commandes en file offline
And il a fermé et rouvert l'application (rechargement depuis AsyncStorage)
When Pierre consulte ListeColisScreen après réouverture
Then le badge IndicateurSync affiche "OFFLINE — 5"
And le compteur correspond bien aux 5 commandes rechargées depuis AsyncStorage
```

---

## Définition of Done

- [ ] `IndicateurSync` accepte une prop `pendingCount: number` et l'affiche dans le badge quand > 0
- [ ] Le libellé du compteur utilise "en attente" (pas "synchronisation")
- [ ] `useOfflineSync` ou `offlineQueue` expose une valeur réactive `pendingCount`
- [ ] `ListeColisScreen` et tout écran utilisant `IndicateurSync` passe `pendingCount`
- [ ] Le compteur se met à jour en temps réel à chaque enqueue et dequeue
- [ ] Le compteur est initialisé depuis AsyncStorage au chargement du hook (cohérence après redémarrage)
- [ ] Tests unitaires `IndicateurSync.test.tsx` : cas badge OFFLINE sans compteur, avec compteur, badge LIVE
- [ ] Tests `offlineQueue.test.ts` : `pendingCount` retourne le bon nombre après enqueue et dequeue
- [ ] Aucune régression sur les tests existants de ListeColisScreen

---

## Liens

- Feedback source : /livrables/09-feedback/feedback-corrections-as-built-2026-04-04.md (point #1 bloquant)
- US complémentaire : US-056 — Persistance offlineQueue AsyncStorage
- US complémentaire : US-060 — Correction persist() après sync()
- US liée (domaine offline) : US-006 — Mode offline et synchronisation
- Règle libellé UX : /livrables/05-backlog/corrections-as-built-2026-04.md#règles-de-libellé-ux
- Wireframe : /livrables/02-ux/wireframes.md#composant-indicateursync
