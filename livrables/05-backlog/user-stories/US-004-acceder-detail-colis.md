# US-004 : Accéder au détail d'un colis et déclencher une action de livraison

**Epic** : EPIC-001 — Exécution de la Tournée
**Feature** : F-003 — Mise à jour du statut d'un colis
**Bounded Context** : BC-01 Orchestration de Tournée
**Aggregate(s) touchés** : Colis (Entity)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : S (3 points)

---

## User Story

En tant que Pierre Morel (livreur terrain),
je veux accéder au détail complet d'un colis depuis la liste et déclencher en un geste
l'action "LIVRER CE COLIS" ou "DÉCLARER UN ÉCHEC",
afin de réaliser la mise à jour de statut en moins de 45 secondes depuis la liste, sans
friction, d'une seule main.

---

## Contexte

L'écran de détail (M-03) est le pivot central de l'action terrain. Il regroupe toutes
les informations nécessaires à Pierre avant d'agir : destinataire, adresse complète,
contraintes actives (horaire, fragile, document sensible), historique des tentatives
précédentes et lien vers la navigation externe. Les deux boutons d'action principaux
sont dimensionnés pour une utilisation d'une seule main, debout, en conditions terrain.

**Invariants à respecter** :
- Un Colis au statut "livré" ou "échec" ne peut plus déclencher les boutons d'action
  (immutabilité du statut terminal).
- La transition de statut autorisée est : à livrer → livré (via M-04) ou à livrer →
  échec (via M-05). Toute autre transition est rejetée.
- Le numéro de téléphone du destinataire est masqué dans l'affichage (accès via bouton
  d'appel uniquement — conformité RGPD).

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Accès au détail d'un colis à livrer

```gherkin
Given Pierre est sur l'écran M-02 avec la liste de ses colis
And le colis #00247 a le statut "à livrer" avec contrainte "Avant 14h00" et "Fragile"
When Pierre appuie sur l'item du colis #00247
Then l'écran M-03 s'affiche avec le destinataire, l'adresse complète et l'appartement
And les contraintes "Avant 14h00" et "Fragile" sont visibles dans la section contraintes
And le bouton "LIVRER CE COLIS" est actif
And le bouton "DÉCLARER UN ÉCHEC" est actif
And le numéro de téléphone du destinataire est masqué (accès par bouton d'appel)
```

### Scénario 2 : Colis déjà livré — boutons désactivés

```gherkin
Given le colis #00247 a le statut "livré" depuis 09h42
When Pierre consulte l'écran M-03 de ce colis
Then les boutons "LIVRER CE COLIS" et "DÉCLARER UN ÉCHEC" sont absents
And le message "Ce colis a été livré à 09h42" est affiché
```

### Scénario 3 : Colis avec historique de tentative précédente

```gherkin
Given le colis #00247 a fait l'objet d'une tentative de livraison la veille (Absent)
When Pierre consulte l'écran M-03
Then la section "Historique" affiche "19/03 09:42 — Tentative — Absent"
And le statut courant du colis est "à livrer" (nouvelle tentative possible)
```

### Scénario 4 : Navigation vers la carte externe

```gherkin
Given Pierre est sur l'écran M-03 du colis #00247
When Pierre appuie sur "Voir sur la carte"
Then l'application de navigation externe (Google Maps ou équivalent) s'ouvre avec
     l'adresse du colis pré-remplie
And Pierre peut revenir à l'écran M-03 via le bouton retour système
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-m-03--détail-dun-colis
- Parcours : /livrables/02-ux/user-journeys.md#parcours-1--livreur--exécuter-une-tournée
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
