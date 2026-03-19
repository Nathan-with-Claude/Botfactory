# US-002 : Suivre ma progression en temps réel (reste à livrer et estimation de fin)

**Epic** : EPIC-001 — Exécution de la Tournée
**Feature** : F-001 — Chargement et prise en main de la tournée
**Bounded Context** : BC-01 Orchestration de Tournée
**Aggregate(s) touchés** : Tournée (Avancement — Value Object calculé)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : S (3 points)

---

## User Story

En tant que Pierre Morel (livreur terrain),
je veux voir en temps réel le nombre de colis restants à livrer et une estimation
de l'heure de fin de tournée sur le bandeau en haut de ma liste,
afin de savoir à tout moment si je suis dans les temps et de réduire mon anxiété sur
l'avancement de ma journée.

---

## Contexte

"Je ne sais pas combien il m'en reste." (Pierre, entretien terrain). L'indicateur de
reste à livrer est recalculé dynamiquement après chaque mise à jour de statut d'un
colis. L'estimation de fin de tournée est calculée par le Domain Service
AvancementCalculator à partir du nombre de colis restants et de la cadence moyenne
constatée sur la journée en cours.

**Invariants à respecter** :
- L'Avancement est un Value Object calculé à partir de l'état courant de la Tournée.
  Il ne peut pas être saisi manuellement.
- Le compteur "reste à livrer" compte uniquement les colis dont le StatutColis est
  "à livrer" (excluant : livré, échec, à représenter).
- L'estimation de fin est une approximation non contractuelle — elle ne génère pas
  d'événement de domaine.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Affichage initial de la progression

```gherkin
Given Pierre a chargé sa tournée du jour avec 22 colis
And 8 colis sont déjà au statut "livré" ou "échec"
When Pierre consulte l'écran M-02
Then le bandeau affiche "Reste à livrer : 14 / 22 colis"
And une estimation de fin de tournée est affichée au format "Fin estimée : HH:MM"
```

### Scénario 2 : Mise à jour du compteur après une livraison

```gherkin
Given le bandeau affiche "Reste à livrer : 14 / 22 colis"
When Pierre confirme la livraison d'un colis (événement LivraisonConfirmée émis)
Then le bandeau se met à jour immédiatement sans rechargement de la page
And le bandeau affiche "Reste à livrer : 13 / 22 colis"
And l'estimation de fin de tournée est recalculée et affichée
```

### Scénario 3 : Mise à jour du compteur après un échec

```gherkin
Given le bandeau affiche "Reste à livrer : 13 / 22 colis"
When Pierre enregistre un échec de livraison (événement ÉchecLivraisonDéclaré émis)
Then le bandeau se met à jour immédiatement
And le colis en échec n'est plus comptabilisé dans le "reste à livrer"
And le bandeau affiche "Reste à livrer : 12 / 22 colis"
```

### Scénario 4 : Tous les colis traités

```gherkin
Given le bandeau affiche "Reste à livrer : 1 / 22 colis"
When Pierre traite le dernier colis restant
Then le bandeau affiche "Reste à livrer : 0 / 22 colis"
And le bouton "Clôturer la tournée" devient visible
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-m-02--liste-des-colis-de-la-tournée
- Parcours : /livrables/02-ux/user-journeys.md#parcours-1--livreur--exécuter-une-tournée
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
