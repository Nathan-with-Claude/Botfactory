# US-035 : Rechercher une tournee dans le tableau de bord par nom de livreur, code TMS ou zone geographique

**Epic** : EPIC-003 : Supervision et Pilotage Temps Reel
**Feature** : F-009 : Tableau de bord des tournees du jour
**Bounded Context** : BC-03 Supervision et Pilotage (Core Domain)
**Aggregate(s) touchés** : VueTournee (Read Model)
**Priorité** : Should Have
**Statut** : Prête
**Complexité estimée** : S

---

## User Story

En tant que responsable logistique,
je veux pouvoir rechercher une tournee dans le tableau de bord par nom de livreur,
par code TMS de la tournee ou par zone geographique,
afin de retrouver rapidement une tournee specifique sans avoir a parcourir l'ensemble du tableau.

---

## Contexte

Feedback terrain du 2026-03-30 (Laurent Renaud, Responsable Exploitation Logistique) :
le champ de recherche du tableau de bord W-01 ne cherche que par nom de livreur. En supervision
operationnelle, les besoins de recherche sont multiples : retrouver la tournee "T-205" communiquee
par un transporteur, ou lister toutes les tournees actives sur la zone "Villeurbanne" lors d'un
incident reseau. La restriction a un seul critere oblige a un scroll manuel qui devient penalisant
au-dela de 15 tournees simultanees.

Le champ de recherche agit sur le Read Model `VueTournee` (projection cote supervision).
Il n'emet pas de Domain Event — c'est une operation de consultation (lecture seule).

**Invariants a respecter** :
- La recherche est une operation de lecture sur la `VueTournee` : elle ne modifie aucun
  Aggregate du domaine.
- Les trois criteres (nom de livreur, code TMS, zone geographique) sont traites en union
  (OU logique) : une tournee correspondant a l'un des criteres remonte dans les resultats.
- La recherche est insensible a la casse et tolere les sous-chaines (recherche partielle).
- Les filtres de statut actifs (En cours / A risque / Cloturees) s'appliquent en intersection
  avec le resultat de la recherche (ET logique).
- Si la recherche ne retourne aucun resultat, un message "Aucune tournee ne correspond
  a votre recherche" est affiche.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Recherche par code TMS

```gherkin
Given le responsable logistique est sur W-01 (Tableau de bord des tournees du jour)
And 15 VueTournee sont affichees dont une avec le codeTMS "T-205"
When il saisit "T-205" dans le champ de recherche
Then seule la tournee dont le codeTMS est "T-205" est affichee dans le tableau
And les autres VueTournee sont masquees
And le compteur de tournees du bandeau resume n'est pas modifie (il reste sur le total du jour)
```

### Scenario 2 — Recherche par zone geographique

```gherkin
Given le responsable logistique est sur W-01
And 3 VueTournee ont la zone geographique "Villeurbanne" dans leurs donnees
When il saisit "Villeurb" dans le champ de recherche
Then les 3 VueTournee de la zone "Villeurbanne" sont affichees (correspondance partielle)
And les autres VueTournee sont masquees
```

### Scenario 3 — Recherche par nom de livreur (comportement existant preserve)

```gherkin
Given le responsable logistique est sur W-01
And une VueTournee est assignee au livreur "Pierre Morel"
When il saisit "Pierre" dans le champ de recherche
Then la VueTournee de Pierre Morel est affichee
And les VueTournee des autres livreurs sont masquees
```

### Scenario 4 — Intersection avec le filtre de statut actif

```gherkin
Given le responsable logistique a selectionne le filtre "A risque" sur W-01
And 2 VueTournee de la zone "Lyon 3" sont affichees dont 1 "A risque" et 1 "En cours"
When il saisit "Lyon 3" dans le champ de recherche
Then seule la VueTournee "A risque" de Lyon 3 est affichee
And la VueTournee "En cours" de Lyon 3 est exclue (filtre de statut actif)
```

### Scenario 5 — Recherche sans resultat

```gherkin
Given le responsable logistique est sur W-01
When il saisit "XYZ999" dans le champ de recherche
Then le tableau de bord affiche le message "Aucune tournee ne correspond a votre recherche"
And un lien "Effacer la recherche" est propose
```

### Scenario 6 — Effacement de la recherche

```gherkin
Given le champ de recherche contient "T-205" et une seule tournee est affichee
When le responsable logistique efface le contenu du champ de recherche
Then toutes les VueTournee correspondant aux filtres de statut actifs sont de nouveau affichees
```

---

## Definition of Done

- [ ] Le champ de recherche accepte les trois criteres (nom livreur, codeTMS, zone geographique)
      avec correspondance partielle et insensibilite a la casse.
- [ ] La recherche s'applique en intersection avec les filtres de statut existants.
- [ ] Le cas "aucun resultat" affiche un message explicite et un lien de reinitialisation.
- [ ] Les compteurs du bandeau resume (Actives / Cloturees / A risque) ne sont pas affectes
      par la recherche.
- [ ] Tests unitaires sur le service de filtrage de la VueTournee.
- [ ] Tests E2E Playwright sur W-01 couvrant les scenarios 1 a 6.
- [ ] Aucune regression sur les filtres de statut existants (US-011).

---

## Dépendances

- **US-011** (prerequis) : le tableau de bord W-01 et le Read Model VueTournee doivent
  etre en place.
- **BC-03** : le Read Model VueTournee doit exposer les champs `nomLivreur`, `codeTMS`
  et `zoneGeographique` pour que la recherche soit possible.

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#W-01
- Feedback source : /livrables/09-feedback/feedback-superviseur-2026-03-30.md
- US liee : /livrables/05-backlog/user-stories/US-011-tableau-de-bord-tournees.md
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
