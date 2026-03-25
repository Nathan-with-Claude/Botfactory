# US-011 : Visualiser l'avancement de toutes les tournées du jour en temps réel

**Epic** : EPIC-003 — Supervision et Pilotage Temps Réel
**Feature** : F-009 — Tableau de bord des tournées du jour
**Bounded Context** : BC-03 Supervision
**Aggregate(s) touchés** : VueTournee (Read Model), TableauDeBord
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : L (8 points)

---

## User Story

En tant que Laurent Renaud (responsable exploitation logistique),
je veux visualiser sur un tableau de bord web la liste de toutes les tournées actives
du jour avec leur avancement en temps réel, sans avoir à appeler chaque livreur,
afin de piloter l'ensemble de la flotte de façon proactive et de détecter immédiatement
les tournées nécessitant mon attention.

---

## Contexte

Aujourd'hui Laurent « pilote à l'aveugle ». Il détecte les retards uniquement quand ils
sont déjà avérés. Le tableau de bord W-01 remplace le pilotage téléphonique par une vue
agrégée en temps réel mise à jour par les Domain Events remontés du BC-01 (Orchestration
de Tournée) via le bus d'événements interne.

La mise à jour du tableau de bord intervient en moins de 30 secondes après toute action
terrain (via WebSocket). Les tournées à risque sont mises en surbrillance avec une
alerte visuelle et sonore.

**Invariants à respecter** :
- Le tableau de bord est un Read Model (CQRS allégé) : il ne requête jamais directement
  le modèle d'écriture de l'Orchestration de Tournée.
- La mise à jour est déclenchée par les Domain Events : LivraisonConfirmée,
  ÉchecLivraisonDéclaré, TournéeÀRisqueDétectée, TournéeClôturée.
- Délai maximum entre action terrain et mise à jour tableau de bord : 30 secondes.
- Seuls les utilisateurs avec le rôle "superviseur" ou "DSI" peuvent accéder à W-01.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Affichage des tournées actives du jour

```gherkin
Given Laurent est authentifié sur l'interface web avec le rôle "superviseur"
And 8 tournées sont actives le 19/03/2026
When Laurent accède à l'écran W-01
Then la liste des 8 tournées actives est affichée avec pour chacune :
     - Nom du livreur
     - Identifiant de la tournée
     - Barre de progression (X colis traités / Y total)
     - Pourcentage d'avancement
     - Statut (badge coloré : EN COURS, À RISQUE, CLÔTURÉE)
     - Horodatage de la dernière activité
And le bandeau résumé affiche "8 actives — 0 clôturées — 0 à risque"
```

### Scénario 2 : Mise à jour en temps réel après action terrain

```gherkin
Given Laurent visualise l'écran W-01 avec la tournée T-042 (P. Morel) à 63 %
When Pierre confirme la livraison d'un colis (événement LivraisonConfirmée émis)
Then la barre de progression de la tournée T-042 se met à jour en moins de 30 secondes
And le pourcentage passe de 63 % à la valeur recalculée
And aucun rechargement de page n'est nécessaire (mise à jour WebSocket)
```

### Scénario 3 : Tournée à risque mise en surbrillance

```gherkin
Given la tournée T-043 (L. Petit) génère l'événement TournéeÀRisqueDétectée
When l'événement est consommé par le tableau de bord
Then la ligne de la tournée T-043 est mise en surbrillance orange dans le tableau
And l'icône d'alerte ⚠ est affichée sur la ligne
And le bandeau résumé met à jour le compteur "1 à risque"
And une alerte sonore discrète est déclenchée
And le tout se produit en moins de 15 minutes après l'apparition de l'écart de délai
```

### Scénario 4 : Filtrage par statut

```gherkin
Given Laurent est sur l'écran W-01 avec 8 tournées (6 en cours, 1 à risque, 1 clôturée)
When Laurent clique sur le filtre "À risque"
Then seule la tournée T-043 (statut À RISQUE) est affichée dans le tableau
And le filtre "À risque" est visuellement actif
And un clic sur "Toutes" restaure l'affichage complet
```

### Scénario 5 : Perte de connexion serveur — données non actualisées

```gherkin
Given Laurent visualise W-01 et la connexion WebSocket est perdue
When 30 secondes s'écoulent sans mise à jour
Then un bandeau rouge "Données non actualisées — Reconnexion en cours..." est affiché
And l'horodatage de la dernière synchronisation connue est indiqué
And dès que la connexion est rétablie, le bandeau disparaît et les données se
     resynchronisent automatiquement
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-w-01--tableau-de-bord-des-tournées
- Parcours : /livrables/02-ux/user-journeys.md#parcours-2--superviseur--piloter-les-tournées-en-temps-réel
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
