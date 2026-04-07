# US-066 : Visualiser l'état du jour de tous les livreurs sur une page dédiée

**Epic** : EPIC-003 — Supervision et Pilotage Temps Réel
**Feature** : F-009 — Tableau de bord des tournées du jour (extension)
**Bounded Context** : BC-03 Supervision (Read Model) — croise BC-07 Planification de Tournée
**Aggregate(s) touchés** : VueLivreur (nouveau Read Model à créer), TourneePlanifiee (BC-07, lecture)
**Priorité** : Should Have
**Statut** : A affiner
**Complexité estimée** : M (5 points)

---

## User Story

En tant que Laurent Renaud (responsable exploitation logistique),
je veux consulter une page récapitulative de l'état du jour de tous mes livreurs
(sans tournée, affecté à une tournée non lancée, en cours de tournée),
afin d'identifier en un coup d'oeil les livreurs disponibles à affecter et ceux
déjà en opération, sans avoir à naviguer entre le tableau de bord des tournées et
l'écran de planification.

---

## Contexte

Aujourd'hui, Laurent doit croiser deux écrans pour connaître la disponibilité de
ses livreurs : le tableau de bord des tournées (W-01, BC-03) pour les tournées actives,
et l'écran de planification (PreparationPage, BC-07) pour les tournées planifiées mais
non encore lancées. Les 6 livreurs canoniques du référentiel dev sont : Pierre Martin,
Paul Dupont, Marie Lambert, Jean Moreau, Sophie Bernard, Lucas Petit.

Cette page centralise cette information sur un seul écran (W-08 — nouveau) en dérivant
l'état de chaque livreur depuis les sources authoritative suivantes :
- **SANS_TOURNEE** : livreur sans aucune TourneePlanifiee associée pour la date du jour
  (statuts NON_AFFECTEE ne comptent pas car la tournée n'est pas encore attribuée à
  un livreur).
- **AFFECTE_NON_LANCE** : livreur dont la TourneePlanifiee du jour est au statut
  AFFECTEE (BC-07).
- **EN_COURS** : livreur dont la TourneePlanifiee du jour est au statut LANCEE (BC-07)
  et dont la VueTournee correspondante est active dans BC-03.

Ce nouveau Read Model (`VueLivreur`) est alimenté par les Domain Events existants :
`AffectationEnregistree`, `DesaffectationEnregistree`, `TourneeLancee`,
`TourneeClôturee` — aucun nouveau Domain Event n'est requis pour le MVP.

**Agents a notifier avant implementation** :
- **@ux** : concevoir le wireframe detaille W-08 et le lien de navigation depuis W-01
  et la PreparationPage (BC-07).
- **@architecte-metier** : confirmer si `VueLivreur` est un nouveau Read Model dans
  BC-03 (extension) ou justifie un sous-domaine dédié ; valider les 3 états
  (SANS_TOURNEE, AFFECTE_NON_LANCE, EN_COURS) dans l'Ubiquitous Language.
- **@architecte-technique** : définir l'endpoint `GET /api/supervision/livreurs/etat-du-jour`
  (ou variante) et confirmer si VueLivreur est une projection en base ou une
  agregation à la volée depuis TourneePlanifieeRepository + VueTourneeRepository.
- **@developpeur** : implementation apres validation des specs par les agents ci-dessus.

**Invariants a respecter** :
- La page est en lecture seule : aucune action d'affectation ne peut etre déclenchée
  depuis cet ecran (redirection vers W-05 pour affecter).
- Le referentiel des livreurs est stable pour une journee : la liste des livreurs
  inscrits dans le systeme ne change pas en cours de tournee.
- Un livreur ne peut avoir qu'un seul etat a la fois pour une date donnee.
- Seuls les utilisateurs avec le role "superviseur" ou "DSI" peuvent acceder a W-08
  (alignement avec la restriction d'acces de W-01 — US-011).
- La donnee affichee doit etre coherente avec l'etat reel des TourneePlanifiees en
  base : pas de cache applicatif desynchronise.

---

## Critères d'acceptation (Gherkin)

### Scenario 1 : Affichage de la liste complete des livreurs avec leur etat du jour

```gherkin
Given Laurent est authentifie sur l'interface web avec le role "superviseur"
And les 6 livreurs sont enregistres dans le referentiel du jour
And Pierre Martin est affecte a la tournee T-201 (statut AFFECTEE)
And Paul Dupont est affecte a la tournee T-204 (statut LANCEE)
And Marie Lambert est affectee a la tournee T-202 (statut AFFECTEE)
And Jean Moreau n'a aucune TourneePlanifiee pour la date du jour
And Sophie Bernard est affectee a la tournee T-205 (statut AFFECTEE)
And Lucas Petit est affecte a la tournee T-206 (statut AFFECTEE)
When Laurent accede a l'ecran W-08 "Etat des livreurs"
Then la liste affiche 6 lignes, une par livreur
And chaque ligne affiche : nom complet, badge d'etat, code tournee associe (si applicable)
And Jean Moreau porte le badge "SANS TOURNEE"
And Pierre Martin porte le badge "AFFECTE — T-201"
And Paul Dupont porte le badge "EN COURS — T-204"
And le compteur de synthese affiche "1 sans tournee — 4 affectes — 1 en cours"
```

### Scenario 2 : Mise a jour de l'etat d'un livreur apres lancement d'une tournee

```gherkin
Given Laurent visualise l'ecran W-08
And Pierre Martin est affiche avec le badge "AFFECTE — T-201"
When le superviseur lance la tournee T-201 depuis PreparationPage
And l'evenement TourneeLancee est emis avec livreurId = livreur-pierre-martin
Then le badge de Pierre Martin passe de "AFFECTE — T-201" a "EN COURS — T-201"
And la mise a jour est visible sur W-08 en moins de 30 secondes (WebSocket)
And le compteur de synthese se met a jour : "1 sans tournee — 3 affectes — 2 en cours"
```

### Scenario 3 : Livreur revient a l'etat "sans tournee" apres desaffectation

```gherkin
Given Laurent visualise l'ecran W-08
And Sophie Bernard est affichee avec le badge "AFFECTE — T-205"
When le superviseur desaffecte Sophie Bernard de la tournee T-205
And l'evenement DesaffectationEnregistree est emis avec livreurId = livreur-sophie-bernard
Then le badge de Sophie Bernard passe a "SANS TOURNEE"
And la tournee T-205 n'est plus affichee sur la ligne de Sophie Bernard
And le compteur de synthese se met a jour en moins de 30 secondes
```

### Scenario 4 : Filtrer les livreurs par etat

```gherkin
Given Laurent est sur l'ecran W-08 avec 6 livreurs (1 sans tournee, 4 affectes, 1 en cours)
When Laurent clique sur le filtre "Sans tournee"
Then seule la ligne de Jean Moreau est affichee
And un bouton "Affecter une tournee" est visible sur la ligne de Jean Moreau
And ce bouton redirige vers l'ecran W-04 (plan du jour) avec le filtre "Non affectees"
When Laurent clique sur "Tous"
Then les 6 lignes sont de nouveau affichees
```

### Scenario 5 : Acces non autorise refuse

```gherkin
Given un utilisateur est authentifie avec le role "livreur"
When il tente d'acceder a l'ecran W-08 via URL directe
Then il est redirige vers la page d'accueil de l'application mobile
And un message "Acces non autorise" est affiche
And l'evenement AccesRefuse est journalise dans BC-06
```

### Scenario 6 : Livreur dont la tournee est cloturee en fin de journee

```gherkin
Given Paul Dupont est en cours de tournee T-204 (badge "EN COURS")
When Paul Dupont cloture sa tournee T-204 depuis l'application mobile
And l'evenement TourneeClôturee est emis avec livreurId = livreur-paul-dupont
Then le badge de Paul Dupont passe a "SANS TOURNEE" (tournee terminee = disponible)
And la ligne n'affiche plus de code tournee associe
And le compteur de synthese se met a jour
```

### Scenario 7 : Navigation depuis le tableau de bord W-01

```gherkin
Given Laurent est sur l'ecran W-01 (tableau de bord des tournees)
When il clique sur le lien / bouton "Etat des livreurs" dans la navigation
Then il est redirige vers l'ecran W-08 sans rechargement complet
And le bouton "Retour au tableau de bord" est visible sur W-08
```

---

## Wireframe textuel sommaire (W-08)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [DocuPost]  [Tableau de bord]  [Planification]  [Etat des livreurs]  [Deconnexion] │
├─────────────────────────────────────────────────────────────────────────────┤
│  Etat des livreurs — 06/04/2026                                             │
│  1 sans tournee  |  4 affectes  |  1 en cours                              │
│                                                                             │
│  [Tous]  [Sans tournee]  [Affectes]  [En cours]       [Rafraichir]         │
├───────────────┬───────────────────────────────┬──────────────────────────────┤
│ Livreur       │ Etat                          │ Action                      │
├───────────────┼───────────────────────────────┼──────────────────────────────┤
│ Paul Dupont   │ [EN COURS - T-204]  (vert)    │ Voir detail tournee          │
│ Pierre Martin │ [AFFECTE - T-201]   (bleu)    │ Voir detail preparation      │
│ Marie Lambert │ [AFFECTE - T-202]   (bleu)    │ Voir detail preparation      │
│ Sophie Bernard│ [AFFECTE - T-205]   (bleu)    │ Voir detail preparation      │
│ Lucas Petit   │ [AFFECTE - T-206]   (bleu)    │ Voir detail preparation      │
│ Jean Moreau   │ [SANS TOURNEE]      (gris)    │ Affecter une tournee         │
├───────────────┴───────────────────────────────┴──────────────────────────────┤
│ [← Retour au tableau de bord]                                               │
└─────────────────────────────────────────────────────────────────────────────┘

Codes couleur :
- Badge "EN COURS" : fond vert (#1B5E20), texte blanc
- Badge "AFFECTE" : fond bleu (primary-container), texte sur fond
- Badge "SANS TOURNEE" : fond gris (#757575), texte blanc
```

**Navigation entrante** :
- Depuis W-01 (tableau de bord) : lien dans la barre de navigation principale.
- Depuis PreparationPage (W-04) : bouton secondaire "Voir etat livreurs".

**Actions disponibles** :
- "Voir detail tournee" (etat EN_COURS) : redirige vers W-02 (detail tournee superviseur).
- "Voir detail preparation" (etat AFFECTE_NON_LANCE) : redirige vers W-05 (detail preparation).
- "Affecter une tournee" (etat SANS_TOURNEE) : redirige vers W-04 avec filtre "NON_AFFECTEE".

---

## Contraintes techniques identifiees

### Endpoint backend necessaire

```
GET /api/supervision/livreurs/etat-du-jour
  - Parametre optionnel : date (ISO 8601, default = date du jour)
  - Acces : ROLE_SUPERVISEUR ou ROLE_DSI
  - Reponse : liste de VueLivreurDTO
    {
      "livreurId": "livreur-001",
      "nomComplet": "Pierre Martin",
      "etat": "AFFECTE_NON_LANCE",  // SANS_TOURNEE | AFFECTE_NON_LANCE | EN_COURS
      "tourneePlanifieeId": "tp-201",
      "codeTms": "T-201"
    }
```

**Strategie d'implementation a valider par @architecte-technique** :
- Option A (recommandee MVP) : agregation a la volee — jointure
  `TourneePlanifieeRepository` (BC-07) + liste des livreurs du referentiel.
  Derivation de l'etat par regle : LANCEE → EN_COURS, AFFECTEE → AFFECTE_NON_LANCE,
  aucune TourneePlanifiee avec livreurId → SANS_TOURNEE.
- Option B (post-MVP) : nouveau Read Model `VueLivreur` maintenu par projection des
  Domain Events `AffectationEnregistree`, `DesaffectationEnregistree`, `TourneeLancee`,
  `TourneeClôturee` — alignement CQRS complet.

### Mise a jour temps reel

Les mises a jour de l'etat des livreurs transitent par le canal WebSocket STOMP
existant (US-057) : le serveur publie sur `/topic/livreurs/etat` les changements d'etat
lors de la reception des Domain Events BC-07.

### Liens avec les BC existants

| Dependance | Sens | Description |
|-----------|------|-------------|
| BC-07 TourneePlanifiee | Lecture | Source authoritative du statut AFFECTEE / LANCEE / livreurId |
| BC-03 VueTournee | Lecture | Coherence avec l'etat EN_COURS du tableau de bord W-01 |
| BC-06 Authentification | Controle d'acces | Restriction role SUPERVISEUR / DSI |
| US-057 WebSocket STOMP | Technique | Canal de diffusion des mises a jour temps reel |

---

## Dependances avec les User Stories existantes

| US | Titre | Type de dependance |
|----|-------|-------------------|
| US-011 | Tableau de bord tournees (W-01) | Partage le canal WebSocket et le role superviseur |
| US-023 | Affecter livreur et vehicule | L'etat AFFECTE_NON_LANCE est produit par US-023 |
| US-024 | Lancer tournee | L'etat EN_COURS est produit par US-024 |
| US-050 | Desaffecter livreur d'une tournee | L'etat SANS_TOURNEE peut resulter de US-050 |
| US-049 | 6 livreurs dev coherents (Prête) | Referentiel livreurs necessaire pour les tests dev |
| US-057 | WebSocket STOMP tableau de bord (P1) | Infrastructure technique prerequis pour le temps reel |

**Prerequis d'implementation** : US-023, US-024 et US-049 doivent etre Terminees ;
US-057 doit etre au minimum en cours avant d'activer la mise a jour temps reel
(la page peut etre livree en mode polling si US-057 n'est pas encore disponible).

---

## Liens

- Wireframe detaille (a creer par @ux) : /livrables/02-ux/wireframes.md#ecran-w-08--etat-des-livreurs
- Parcours superviseur (a completer par @ux) : /livrables/02-ux/user-journeys.md#parcours-2--superviseur--piloter-les-tournees-en-temps-reel
- Architecture applicative : /livrables/04-architecture-technique/architecture-applicative.md
- Domain model (BC-03, BC-07) : /livrables/03-architecture-metier/domain-model.md
- Rapport as-built supervision : /livrables/04-architecture-technique/rapport-as-built-supervision.md
