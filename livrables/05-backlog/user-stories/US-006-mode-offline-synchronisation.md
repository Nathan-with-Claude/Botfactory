# US-006 : Continuer à livrer en zone blanche et synchroniser dès le retour de connexion

**Epic** : EPIC-001 — Exécution de la Tournée
**Feature** : F-005 — Mode offline et synchronisation différée
**Bounded Context** : BC-01 Orchestration de Tournée / BC-05 Intégration SI
**Aggregate(s) touchés** : Tournée, Colis, EvenementLivraison
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : L (8 points)

---

## User Story

En tant que Pierre Morel (livreur terrain),
je veux pouvoir continuer à enregistrer mes livraisons et échecs même sans connexion
réseau, et que toutes mes actions soient automatiquement synchronisées avec le SI dès
que le réseau revient,
afin de ne jamais être bloqué en zone péri-urbaine à cause de la connectivité, sans
risquer de perdre aucune donnée terrain.

---

## Contexte

Les tournées de Pierre couvrent des zones péri-urbaines où la couverture réseau est
variable. La stratégie offline-first de l'application mobile impose que toutes les
commandes terrain (ConfirmerLivraison, DeclarerEchec, CapturePreuve) soient exécutables
sans connexion. Les actions sont stockées localement dans WatermelonDB (SQLite) et
rejoués en ordre FIFO dès le retour de la connexion. Chaque commande porte un
commandId UUID v7 unique garantissant l'idempotence côté serveur.

Le SLA de synchronisation OMS (< 30 secondes) s'applique à partir du retour de
connexion, non depuis l'action terrain.

**Invariants à respecter** :
- Toutes les commandes terrain doivent être réalisables sans connexion réseau
  (offline-first obligatoire).
- Chaque commande porte un commandId UUID v7 unique — le backend rejette silencieusement
  les doublons.
- La clôture de tournée est bloquée tant que la file de synchronisation n'est pas vide.
- Les preuves (signatures, photos) sont stockées localement en format compressé et
  uploadées vers le store objet dès le retour de connexion.
- Les événements non transmis en temps réel sont mis en queue et rejoués (at-least-once
  delivery).

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Livraison réussie en mode offline

```gherkin
Given Pierre est en zone blanche (réseau indisponible)
And l'application affiche le bandeau orange "Hors connexion — Données locales"
When Pierre confirme la livraison du colis #00247 avec une signature numérique
Then l'action est stockée localement dans WatermelonDB avec le commandId UUID v7
And le statut du colis #00247 passe à "livré" dans la liste M-02 (mise à jour locale)
And l'indicateur "Synchronisation en attente — 1 action" est visible sur M-02
And aucun appel réseau n'est effectué
```

### Scénario 2 : Synchronisation automatique au retour de connexion

```gherkin
Given Pierre a effectué 3 actions en mode offline (2 livraisons, 1 échec)
And le réseau mobile revient
When l'application détecte le retour de connexion
Then les 3 événements sont rejoués vers l'API dans l'ordre FIFO
And chaque événement est transmis à l'OMS en moins de 30 secondes après le retour de
     connexion
And l'indicateur "Synchronisation en attente" disparaît de M-02
And les événements LivraisonConfirmée et ÉchecLivraisonDéclaré sont émis côté serveur
```

### Scénario 3 : Idempotence en cas de rejeu en double

```gherkin
Given Pierre a confirmé la livraison du colis #00247 en mode offline (commandId = uuid-A)
And la connexion se rétablit et l'action est rejouée
And en raison d'une instabilité réseau, la commande est renvoyée une deuxième fois
     avec le même commandId uuid-A
When le backend reçoit la commande dupliquée
Then le backend rejette silencieusement la commande dupliquée sans créer de doublon
And un seul événement LivraisonConfirmée est enregistré dans le store d'événements
```

### Scénario 4 : Clôture de tournée bloquée avec actions en attente

```gherkin
Given Pierre a terminé tous ses colis mais a 2 actions en attente de synchronisation
When Pierre appuie sur "Clôturer la tournée"
Then le bouton de clôture est désactivé
And le message "Synchronisation en cours — Attendez la fin de la synchronisation pour
     clôturer votre tournée" est affiché
And dès que la synchronisation est complète, le bouton de clôture se déverrouille
```

### Scénario 5 : Indicateur de statut de synchronisation visible en permanence

```gherkin
Given Pierre utilise l'application en mode connecté
When 0 action est en attente de synchronisation
Then l'indicateur de synchronisation n'est pas affiché (état normal)

Given Pierre a 1 ou plusieurs actions en attente de synchronisation
Then l'indicateur "Synchronisation en attente — X action(s)" est visible sur M-02 en
     permanence
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-m-02--liste-des-colis-de-la-tournée
- Parcours : /livrables/02-ux/user-journeys.md#parcours-1--livreur--exécuter-une-tournée
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
