# US-033 : Simulateur TMS pour tests de bout en bout (dev-only)

**Epic** : EPIC-DEV-001 — Infrastructure de test et observabilité (dev/test uniquement)
**Feature** : F-DEV-001 — Simulateur TMS et pont d'événements inter-BC (périmètre dev/test, hors prod)
**Bounded Context** : BC-07 (Planification de Tournée), BC-01 (Orchestration de Tournée), BC-03 (Supervision)
**Aggregate(s) touchés** : PlanDuJour / TourneePlanifiee (BC-07), Tournee (BC-01), VueTournee (BC-03)
**Priorité** : Must Have (bloque tous les tests E2E bout en bout)
**Statut** : Prête
**Complexité estimée** : L

---

## User Story

En tant que développeur ou testeur DocuPost,
je veux pouvoir injecter des TourneesPlanifiees simulées et déclencher le flux complet
(import TMS → affectation → lancement → tableau de bord supervision → app mobile livreur)
sans TMS réel ni bus d'événements Kafka,
afin de valider le comportement de bout en bout de l'ensemble des Bounded Contexts sur
l'environnement de développement.

---

## Contexte

### Problème à résoudre

En production, le flux nominal est :

```
TMS externe → BC-07 (import TourneePlanifiee) → event TourneeLancee
           → Kafka → BC-01 (creation Tournee mobile)
                   → BC-03 (mise a jour VueTournee)
```

En MVP dev, l'event `TourneeLancee` est seulement logge dans `LancerTourneeHandler`.
Conséquences observées lors des tests manuels et E2E :

1. L'onglet Planification et l'onglet Supervision affichent des données sans lien.
2. Lancer une tournée depuis l'écran Planification n'a aucun effet visible dans
   le tableau de bord Supervision ni dans l'app mobile livreur.
3. Le parcours complet "import TMS → affecter → lancer → livreur livre →
   superviseur voit" est impossible à valider automatiquement.

Cette US est un prérequis technique pour la validation de bout en bout de :
- US-011 (tableau de bord supervision)
- US-024 (lancement tournée → visible livreur)
- US-001 (consulter liste colis tournée)
- US-021 (visualiser plan du jour)

### Invariants a respecter

- Le simulateur ne doit jamais être actif en profil `prod`. L'annotation
  `@Profile("dev")` est obligatoire sur tous les beans et endpoints concernés.
- Les tourneeIds générées par le simulateur doivent être des UUID valides,
  cohérents entre les trois Bounded Contexts (même identifiant dans BC-07, BC-01 et BC-03).
- Le pont TourneeLancee → BC-01 + BC-03 ne doit pas contourner les invariants
  de l'Aggregate Tournee (BC-01) : une Tournee ne peut être créée que si
  elle dispose d'un livreurId valide et d'au moins un Colis.
- L'idempotence doit être respectée : un double appel au simulateur avec le même
  tourneeId ne doit pas créer deux Tournees dans BC-01.

### Note d'implémentation recommandée

Deux approches équivalentes sont acceptables pour le pont d'événements :

**Option A — Appel HTTP direct depuis LancerTourneeHandler (recommandée MVP)**

Dans `svc-supervision`, au moment où `LancerTourneeHandler` émet `TourneeLancee`,
injecter conditionnellement (profil `dev`) un `DevEventBridge` qui appelle :
- `POST svc-tournee/internal/tournees` pour créer la Tournee dans BC-01
- `POST svc-supervision/internal/vue-tournee` pour créer la VueTournee dans BC-03

**Option B — DevEventBridge Spring @Profile("dev")**

Un composant Spring `@Component @Profile("dev")` qui écoute les événements
applicatifs internes (via `ApplicationEventPublisher`) et les propage par HTTP
vers svc-tournee et svc-supervision.

**Simulateur d'import TMS**

Un `@RestController @Profile("dev")` dans `svc-supervision` expose
`POST /dev/tms/import` qui génère des `TourneePlanifiee` avec colis réalistes
(3 à 8 colis par tournée, contraintes variées) et les persiste directement
dans la base `svc-supervision` comme si le TMS les avait importées.

---

## Critères d'acceptation (Gherkin)

### SC1 — Import simulé de TourneesPlanifiees via endpoint dev

```gherkin
Given l'application tourne en profil "dev"
And aucune TourneePlanifiee n'existe pour la date du jour
When le testeur envoie POST /dev/tms/import avec { "nombre": 3, "date": "2026-03-27" }
Then 3 TourneesPlanifiees sont créées dans svc-supervision
And chaque TourneePlanifiee contient entre 3 et 8 Colis avec contraintes réalistes
And l'event TourneeImporteeTMS est émis pour chaque TourneePlanifiee créée
And le plan du jour (W-04) affiche les 3 nouvelles tournées sans rechargement manuel
```

### SC2 — Après lancement, la VueTournee apparait dans le tableau de bord Supervision

```gherkin
Given une TourneePlanifiee avec un livreurId et un vehiculeId affectés existe dans BC-07
And l'application tourne en profil "dev"
When le responsable logistique clique sur "Lancer" (W-04) ou "Valider et lancer" (W-05)
Then l'event TourneeLancee est émis dans BC-07
And le DevEventBridge propage l'event vers BC-03
And une VueTournee correspondante est créée ou mise à jour dans svc-supervision
And la tournée apparait dans le tableau de bord Supervision (W-01) avec le statut "En cours"
And le tourneeId est identique dans BC-07 et BC-03
```

### SC3 — Après lancement, la Tournee apparait dans l'app mobile livreur (svc-tournee)

```gherkin
Given une TourneePlanifiee a été lancée (event TourneeLancee émis dans BC-07)
And l'application tourne en profil "dev"
When le livreur ouvre l'application mobile et s'authentifie avec le livreurId affecté
Then la Tournee est disponible dans BC-01 (svc-tournee)
And l'event TourneeChargee est émis dans BC-01
And le livreur voit sa liste de Colis (US-001) sans erreur
And le tourneeId est identique dans BC-07 et BC-01
```

### SC4 — Le simulateur est désactivé en profil prod

```gherkin
Given l'application tourne en profil "prod"
When une requête est envoyée à POST /dev/tms/import
Then la réponse est 404 Not Found (endpoint absent)
And aucun bean DevEventBridge n'est instancié dans le contexte Spring
And aucun log de simulation n'apparait dans les traces applicatives
```

### SC5 — Cohérence des identifiants entre les trois BCs

```gherkin
Given le simulateur a lancé une TourneePlanifiee avec tourneeId "T-2026-0042"
And livreurId "L-007"
When le testeur interroge les trois services :
  - GET svc-supervision/planification/plan-du-jour (BC-07)
  - GET svc-supervision/tournees (BC-03)
  - GET svc-tournee/tournees/livreur/L-007 (BC-01)
Then le tourneeId "T-2026-0042" est présent dans les trois réponses
And le livreurId "L-007" est identique dans les trois réponses
And les Colis référencés ont les mêmes colisIds dans BC-07 et BC-01
```

### SC6 — Idempotence du simulateur

```gherkin
Given le simulateur a déjà créé une Tournee dans BC-01 avec tourneeId "T-2026-0042"
When le DevEventBridge reçoit un second event TourneeLancee avec le même tourneeId
Then aucune Tournee supplémentaire n'est créée dans BC-01
And la réponse HTTP du pont est 200 OK (idempotence)
And un log INFO "TourneeDejaCree idempotence tourneeId=T-2026-0042" est émis
```

---

## Liens

- Wireframe Planification : /livrables/02-ux/wireframes.md#w-04-plan-du-jour
- Wireframe Tableau de bord : /livrables/02-ux/wireframes.md#w-01-tableau-de-bord
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
- US-024 (lancement tournée) : /livrables/05-backlog/user-stories/US-024-lancer-tournee-visible-livreur.md
- US-032 (synchronisation read model) : /livrables/05-backlog/user-stories/US-032-synchroniser-read-model-supervision.md
- Implémentation US-032 : /livrables/06-dev/vertical-slices/US-032-impl.md

---

## Hors périmètre

- Le simulateur ne teste pas Kafka (remplacé par HTTP en dev).
- Le simulateur ne teste pas la récupération sur coupure réseau (couvert par US-006).
- Cette US ne remplace pas l'intégration TMS réelle (prévue en V2 post-MVP).
- Le bouton UI de simulation dans l'interface web (W-04) est optionnel :
  l'endpoint REST suffit pour les tests automatisés ; le bouton UI peut être
  ajouté dans une US séparée si jugé utile pour les démos.
