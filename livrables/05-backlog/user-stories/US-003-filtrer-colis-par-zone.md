# US-003 : Filtrer et organiser mes colis par zone géographique

**Epic** : EPIC-001 — Exécution de la Tournée
**Feature** : F-002 — Organisation des arrêts par zone
**Bounded Context** : BC-01 Orchestration de Tournée
**Aggregate(s) touchés** : Tournée, Colis (Adresse — Value Object)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : S (3 points)

---

## User Story

En tant que Pierre Morel (livreur terrain),
je veux filtrer la liste de mes colis par zone géographique en appuyant sur un onglet,
afin d'organiser mes arrêts par secteur et réduire mes temps de déplacement sans outil
externe.

---

## Contexte

Pierre connaît bien ses zones de livraison (urbain et péri-urbain). Les zones sont
définies dans le référentiel adresse fourni par l'OMS et attachées à chaque Colis via
le Value Object Adresse (attribut zoneGeographique). Le filtrage est local (côté
application), instantané et ne nécessite pas d'appel réseau.

**Invariants à respecter** :
- Le filtrage ne modifie pas le StatutColis ni l'état de la Tournée : aucun événement
  de domaine n'est émis.
- Un colis appartient à exactement une zone géographique (définie par l'Adresse).
- L'onglet "Tous" affiche l'ensemble des colis sans filtre.
- Le nombre total de colis dans le bandeau "reste à livrer" est toujours calculé sur
  l'ensemble de la tournée, indépendamment du filtre actif.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Filtrage par zone

```gherkin
Given Pierre est sur l'écran M-02 avec 22 colis répartis en Zone A (8), Zone B (9),
      Zone C (5)
And l'onglet "Tous" est actif par défaut
When Pierre appuie sur l'onglet "Zone A"
Then la liste affiche uniquement les 8 colis appartenant à la Zone A
And le filtre est appliqué instantanément sans rechargement
And le bandeau "Reste à livrer" continue d'afficher le total sur toute la tournée
```

### Scénario 2 : Retour à la vue complète

```gherkin
Given Pierre a le filtre "Zone A" actif
When Pierre appuie sur l'onglet "Tous"
Then la liste affiche à nouveau les 22 colis
And les statuts déjà mis à jour pendant le filtrage sont reflétés correctement
```

### Scénario 3 : Zone sans colis restants à livrer

```gherkin
Given Pierre a livré tous les colis de la Zone C
And il n'y a plus de colis "à livrer" en Zone C
When Pierre appuie sur l'onglet "Zone C"
Then la liste affiche les colis de Zone C avec leurs statuts terminaux (livré, échec)
And aucun colis "à livrer" n'apparaît dans cette vue
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-m-02--liste-des-colis-de-la-tournée
- Parcours : /livrables/02-ux/user-journeys.md#parcours-1--livreur--exécuter-une-tournée
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
