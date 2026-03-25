# Scénarios de tests US-024 — Lancer une tournée

**US liée** : US-024
**Titre** : Lancer une tournée pour la rendre visible au livreur
**Bounded Context** : BC-07 Planification de Tournée → déclenche BC-01
**Aggregate / Domain Event ciblé** : TourneePlanifiee / TourneeLancee
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-250 : Lancement individuel d'une tournée AFFECTEE → statut LANCEE + TourneeLancee émis

**US liée** : US-024
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : TourneePlanifiee.lancer() / TourneeLancee
**Type** : Fonctionnel (happy path)
**Préconditions** : Tournée tp-202 en statut AFFECTEE, backend svc-supervision en profil dev
**Étapes** :
1. Appeler POST /api/planification/tournees/tp-202/lancer
2. Vérifier la réponse

**Résultat attendu** : HTTP 200, statut=LANCEE dans la réponse. Le log [BC-07→BC-01] TourneeLancee est tracé.
**Statut** : Passé

```gherkin
Given la tournée tp-202 est en statut AFFECTEE
When POST /api/planification/tournees/tp-202/lancer est appelé avec MockJwt SUPERVISEUR
Then la réponse est HTTP 200
And "statut" = "LANCEE"
And le log "[BC-07→BC-01] TourneeLancee" est émis (simulation bus MVP)
```

---

### TC-251 : Invariant — lancement d'une tournée NON_AFFECTEE → HTTP 409

**US liée** : US-024
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : TourneePlanifiee.lancer() — PlanificationInvariantException si NON_AFFECTEE
**Type** : Invariant domaine
**Préconditions** : Tournée tp-201 en statut NON_AFFECTEE
**Étapes** :
1. Appeler POST /api/planification/tournees/tp-201/lancer
2. Vérifier la réponse

**Résultat attendu** : HTTP 409 Conflict — la tournée doit être AFFECTEE pour être lancée
**Statut** : Passé

```gherkin
Given la tournée tp-201 est en statut NON_AFFECTEE
When POST /api/planification/tournees/tp-201/lancer est appelé
Then la réponse est HTTP 409 Conflict
And PlanificationInvariantException est levée par le domaine
And la tournée reste en statut NON_AFFECTEE
```

---

### TC-252 : Lancement groupé — toutes les tournées AFFECTEE du jour sont lancées

**US liée** : US-024
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : LancerTourneeHandler.lancerToutesLesTourneesAffectees()
**Type** : Fonctionnel
**Préconditions** : Au moins une tournée AFFECTEE dans le DevDataSeeder (tp-202)
**Étapes** :
1. Appeler POST /api/planification/plans/{today}/lancer-toutes
2. Vérifier la réponse

**Résultat attendu** : HTTP 200, nbTourneesLancees≥1, message de confirmation
**Statut** : Passé

```gherkin
Given au moins une tournée AFFECTEE existe pour aujourd'hui (tp-202)
When POST /api/planification/plans/{today}/lancer-toutes est appelé
Then la réponse est HTTP 200
And "nbTourneesLancees" >= 1
And "message" contient "tournée(s) lancée(s) avec succès"
```

---

### TC-253 : Lancement groupé — retourne 0 si aucune tournée AFFECTEE

**US liée** : US-024
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : LancerTourneeHandler.lancerToutesLesTourneesAffectees() — liste vide
**Type** : Edge case
**Préconditions** : Date future sans tournées AFFECTEE
**Étapes** :
1. Appeler POST /api/planification/plans/{date future}/lancer-toutes
2. Vérifier la réponse

**Résultat attendu** : HTTP 200, nbTourneesLancees=0 — aucune erreur
**Statut** : Passé

```gherkin
Given aucune tournée AFFECTEE n'existe pour la date future demandée
When POST /api/planification/plans/{demain}/lancer-toutes est appelé
Then la réponse est HTTP 200
And "nbTourneesLancees" = 0
And aucune erreur n'est retournée
```

---

### TC-254 : Bouton "Lancer" sur la ligne AFFECTEE déclenche le lancement et affiche badge LANCEE

**US liée** : US-024
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : PreparationPage — bouton Lancer + rechargement
**Type** : Fonctionnel
**Préconditions** : Page W-04 affichant tp-202 en statut AFFECTEE
**Étapes** :
1. Charger la page W-04 (PreparationPage)
2. Cliquer sur le bouton "Lancer" de la ligne tp-202
3. Observer le badge de statut après le lancement

**Résultat attendu** : Le badge de la tournée passe de AFFECTEE à LANCEE. Le bouton "Lancer" est remplacé par le badge LANCEE.
**Statut** : Passé

```gherkin
Given Laurent est sur la page W-04 et la tournée tp-202 affiche le statut AFFECTEE
When Laurent clique sur le bouton "Lancer" de la ligne tp-202
Then la tournée tp-202 affiche maintenant le badge LANCEE
And le bouton "Lancer" n'est plus affiché (remplacé par le badge)
And un message de succès est affiché
```

---

### TC-255 : Bannière "LANCER TOUTES LES TOURNÉES" visible si affectees > 0 et lancees = 0

**US liée** : US-024
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : PreparationPage — bouton "LANCER TOUTES"
**Type** : Fonctionnel
**Préconditions** : Page W-04 avec tournées dont certaines AFFECTEE et aucune LANCEE
**Étapes** :
1. Observer le bandeau de la page W-04 quand affectees > 0 et lancees = 0

**Résultat attendu** : Le bouton "LANCER TOUTES LES TOURNÉES" est visible dans le bandeau
**Statut** : Passé

```gherkin
Given la page W-04 affiche des tournées dont au moins une est AFFECTEE et aucune n'est LANCEE
When Laurent observe le bandeau résumé
Then le bouton "LANCER TOUTES LES TOURNÉES" est visible
And cliquer sur ce bouton ouvre une modale de confirmation
```
