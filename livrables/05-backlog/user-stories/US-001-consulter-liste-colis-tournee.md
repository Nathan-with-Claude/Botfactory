# US-001 : Consulter la liste des colis assignés à ma tournée

**Epic** : EPIC-001 — Exécution de la Tournée
**Feature** : F-001 — Chargement et prise en main de la tournée
**Bounded Context** : BC-01 Orchestration de Tournée
**Aggregate(s) touchés** : Tournée, Colis
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : M (5 points)

---

## User Story

En tant que Pierre Morel (livreur terrain),
je veux consulter dès mon authentification la liste complète des colis assignés à ma
tournée du jour, avec l'adresse, le destinataire, les contraintes et le statut de chaque
colis,
afin de prendre en main ma tournée rapidement sans support papier et de ne perdre aucun
colis de vue.

---

## Contexte

Pierre arrive au dépôt le matin et doit pouvoir démarrer sa tournée sans feuille de
route papier. L'application charge la tournée du jour depuis l'OMS via l'API REST, après
authentification SSO. La liste est disponible même en mode offline (données synchronisées
lors de la dernière connexion).

**Invariants à respecter** :
- Une Tournée ne peut être démarrée que si elle contient au moins un Colis (invariant
  agrégat Tournée).
- Chaque Colis affiché porte un StatutColis initial normalisé : "à livrer".
- Le chargement de la tournée génère obligatoirement l'événement TournéeChargée.
- Le premier accès à la liste des colis génère l'événement TournéeDémarrée (une seule
  fois par journée, idempotent).

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Chargement normal de la tournée du jour

```gherkin
Given Pierre est authentifié via SSO corporate
And l'OMS a assigné 22 colis à sa tournée du jour
When Pierre ouvre l'écran liste des colis (M-02)
Then l'événement TournéeChargée est émis avec le nombre de colis = 22
And l'événement TournéeDémarrée est émis avec l'identifiant de Pierre et l'horodatage
And la liste affiche les 22 colis avec pour chacun : adresse, destinataire, statut "à
    livrer"
And le bandeau "Reste à livrer : 22 / 22" est affiché
```

### Scénario 2 : Affichage des contraintes sur un colis

```gherkin
Given Pierre consulte la liste des colis de sa tournée
And un colis porte la contrainte "Avant 14h00"
When Pierre visualise cet item dans la liste
Then la contrainte "Avant 14h00" est visible sur l'item colis
And la contrainte est mise en évidence visuellement
```

### Scénario 3 : Tournée sans colis assigné

```gherkin
Given Pierre est authentifié
And aucun colis n'est assigné à sa tournée pour aujourd'hui
When Pierre ouvre l'écran liste des colis
Then aucun événement TournéeDémarrée n'est émis
And le message "Aucun colis assigné pour aujourd'hui. Contactez votre superviseur."
    est affiché
```

### Scénario 4 : TournéeDémarrée émis une seule fois par journée

```gherkin
Given Pierre a déjà ouvert sa liste de colis ce matin (TournéeDémarrée émis)
When Pierre ferme l'application et la rouvre dans la même journée
Then l'événement TournéeDémarrée n'est PAS émis une seconde fois
And la liste des colis reflète l'état courant de la tournée (statuts mis à jour)
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-m-02--liste-des-colis-de-la-tournée
- Parcours : /livrables/02-ux/user-journeys.md#parcours-1--livreur--exécuter-une-tournée
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
