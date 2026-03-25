# US-023 : Affecter un livreur et un véhicule à une tournée

**Epic** : EPIC-007 — Planification et Préparation des Tournées (interface web logisticien)
**Feature** : F-020 — Affectation livreur et véhicule
**Bounded Context** : BC-07 Planification de Tournée
**Aggregate(s) touchés** : Affectation, TournéeTMS
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : M (5 points)

---

## User Story

En tant que Laurent Renaud (responsable exploitation logistique),
je veux sélectionner un livreur et un véhicule disponibles pour une tournée donnée,
afin de tracer l'affectation dans le SI et de préparer le départ.

---

## Contexte

L'affectation est l'étape centrale du Parcours 0. Elle lie une TournéeTMS à un livreur
(personne physique) et à un véhicule (capacité de transport) pour une date donnée.
Le GestionnaireAffectation (BC-07) garantit les invariants d'unicité et de disponibilité.

L'affectation est le prérequis obligatoire au lancement de la tournée (US-024) :
une tournée sans affectation complète ne peut pas être lancée.

**Invariants à respecter** :
- Un livreur ne peut être affecté qu'à une seule tournée par jour (unicité par livreur
  et par date).
- Un véhicule ne peut être affecté qu'à une seule tournée par jour (unicité par véhicule
  et par date).
- L'affectation est atomique : livreur ET véhicule doivent être sélectionnés pour que
  l'affectation soit enregistrée (pas d'affectation partielle).
- Seul un utilisateur avec le rôle "superviseur" peut créer une affectation (BC-06).

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Affichage des sélecteurs d'affectation

```gherkin
Given une TournéeTMS est au statut "Non affectée" dans le plan du jour
And Laurent Renaud est sur l'écran W-05
When il ouvre l'onglet "Affectation"
Then il voit deux sélecteurs :
     - Liste des livreurs disponibles pour la journée en cours
     - Liste des véhicules disponibles pour la journée en cours
And les livreurs et véhicules déjà affectés à d'autres tournées du jour sont
     affichés avec le badge "Indisponible" et ne sont pas sélectionnables
```

### Scénario 2 : Livreur déjà affecté marqué indisponible

```gherkin
Given le livreur Pierre Morel est déjà affecté à la tournée T-042 du jour
And Laurent Renaud ouvre l'onglet Affectation d'une autre tournée sur W-05
When la liste des livreurs s'affiche
Then Pierre Morel apparaît avec le badge "Indisponible — T-042"
And il est grisé et non sélectionnable dans le sélecteur
```

### Scénario 3 : Enregistrement d'une affectation valide

```gherkin
Given Laurent Renaud a sélectionné un livreur disponible et un véhicule disponible
      pour une tournée non encore affectée
When il clique sur "Valider l'affectation"
Then l'événement AffectationEnregistrée est émis avec :
     - L'identifiant de la tournée
     - L'identifiant du livreur affecté
     - L'identifiant du véhicule affecté
     - L'horodatage de l'affectation
     - L'identifiant du responsable logistique
And la tournée passe au statut "Affectée" sur l'écran W-04
And le livreur et le véhicule affectés apparaissent désormais "Indisponibles" pour
     les autres tournées du jour
```

### Scénario 4 : Tentative d'affectation sans livreur sélectionné

```gherkin
Given Laurent Renaud a sélectionné un véhicule mais pas de livreur
When il tente de cliquer sur "Valider l'affectation"
Then le bouton "Valider l'affectation" est désactivé
And un message indique "Veuillez sélectionner un livreur pour valider l'affectation"
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-w-05--détail-dune-tournée-à-préparer
- Parcours : /livrables/02-ux/user-journeys.md#parcours-0--responsable-logistique--préparer-les-tournées-du-jour
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
- Modules fonctionnels : /livrables/03-architecture-metier/modules-fonctionnels.md#module-8
