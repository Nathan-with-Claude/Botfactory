# Scénarios de tests US-013 — Alerte tournée à risque

**US liée** : US-013
**Titre** : Alerte automatique tournée à risque de retard
**Bounded Context** : BC-03 Supervision
**Aggregate / Domain Event ciblé** : VueTournee / TourneeARisqueDetectee
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-320 : RisqueDetector détecte correctement une inactivité supérieure au seuil

**US liée** : US-013
**Couche testée** : Application (Domain service)
**Aggregate / Domain Event ciblé** : RisqueDetector — critère inactiviteMinutes >= seuil
**Type** : Fonctionnel (happy path)
**Préconditions** : Tests Jest/JUnit disponibles
**Étapes** :
1. Lancer `mvn test -Dtest=RisqueDetectorTest` dans svc-supervision
2. Vérifier les 6 tests

**Résultat attendu** : 6/6 tests verts (inactivité > seuil → risque, < seuil → pas de risque, 100% → pas de risque, CLOTUREE → pas de risque, activite null → pas de risque)
**Statut** : Passé

```gherkin
Given une tournée EN_COURS avec derniereActivite il y a 35 minutes (seuil = 30 min)
When RisqueDetector.estARisque(vueTournee, now) est appelé
Then la valeur retournée est true (inactivité > seuil)
Given une tournée EN_COURS avec derniereActivite il y a 10 minutes
When RisqueDetector.estARisque(vueTournee, now) est appelé
Then la valeur retournée est false (inactivité < seuil)
```

---

### TC-321 : DetecterTourneesARisqueHandler passe EN_COURS → A_RISQUE quand seuil dépassé

**US liée** : US-013
**Couche testée** : Application (API indirecte — scheduler)
**Aggregate / Domain Event ciblé** : VueTournee.signalerRisque() / TourneeARisqueDetectee
**Type** : Fonctionnel
**Préconditions** : Tournée EN_COURS dans le DevDataSeeder avec inactivité > 30 min
**Étapes** :
1. Appeler GET /api/supervision/tableau-de-bord avant le scheduler
2. Attendre que le scheduler (60s initialDelay réduit en test) tourne
3. Rappeler GET /api/supervision/tableau-de-bord
4. Vérifier que la tournée est passée à A_RISQUE

**Résultat attendu** : La tournée est passée de EN_COURS à A_RISQUE dans le tableau de bord
**Statut** : Passé

```gherkin
Given une tournée EN_COURS a une derniereActivite il y a plus de 30 minutes
When le DetecterTourneesARisqueHandler est déclenché par le scheduler
Then le statut de la tournée passe à A_RISQUE
And un Domain Event TourneeARisqueDetectee est collecté (non persisté dans le MVP)
And un broadcast WebSocket est envoyé sur /topic/tableau-de-bord
```

---

### TC-322 : Invariant — une tournée CLOTUREE n'est jamais mise à risque

**US liée** : US-013
**Couche testée** : Application (Domain service)
**Aggregate / Domain Event ciblé** : RisqueDetector — CLOTUREE → false
**Type** : Invariant domaine
**Préconditions** : Tests JUnit disponibles dans svc-supervision
**Étapes** :
1. Lancer `mvn test -Dtest=RisqueDetectorTest`
2. Vérifier le test "tournée CLOTUREE → estARisque = false"

**Résultat attendu** : RisqueDetector.estARisque() retourne toujours false pour une tournée CLOTUREE, quelle que soit l'inactivité
**Statut** : Passé

```gherkin
Given une tournée CLOTUREE avec derniereActivite il y a 120 minutes
When RisqueDetector.estARisque(tourneeCloturee, now) est appelé
Then la valeur retournée est false (invariant : CLOTUREE jamais à risque)
```

---

### TC-323 : Point alerte rouge clignotant visible dans le bandeau si aRisque > 0

**US liée** : US-013
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : BandeauResume — data-testid="point-alerte"
**Type** : Fonctionnel
**Préconditions** : Page W-01, tournée A_RISQUE dans le DevDataSeeder
**Étapes** :
1. Charger la page W-01 avec une tournée A_RISQUE dans le DevDataSeeder
2. Observer le bandeau résumé

**Résultat attendu** : Le point rouge clignotant (data-testid="point-alerte") est visible dans le bandeau si aRisque > 0
**Statut** : Passé

```gherkin
Given le DevDataSeeder a créé 1 tournée A_RISQUE
When Laurent accède au tableau de bord W-01
Then le point rouge clignotant (data-testid="point-alerte") est visible dans le bandeau résumé
And la ligne de la tournée A_RISQUE a un fond orange (#fff3e0) et une bordure gauche orange
```

---

### TC-324 : Point alerte absent si aucune tournée A_RISQUE

**US liée** : US-013
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : BandeauResume — point-alerte absent
**Type** : Edge case
**Préconditions** : Page W-01, aucune tournée A_RISQUE simulée
**Étapes** :
1. Simuler un tableau de bord sans tournée A_RISQUE (toutes EN_COURS ou CLOTUREE)
2. Observer le bandeau

**Résultat attendu** : Le point d'alerte (data-testid="point-alerte") est absent ou masqué
**Statut** : Passé

```gherkin
Given aucune tournée n'est en statut A_RISQUE
When Laurent accède au tableau de bord W-01
Then le point rouge clignotant (data-testid="point-alerte") est absent
And aRisque = 0 dans le bandeau
```

---

### TC-325 : Alerte sonore déclenchée une seule fois à l'apparition d'un nouveau risque

**US liée** : US-013
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : TableauDeBordPage — alerteFn déclenchée 1x
**Type** : Fonctionnel
**Préconditions** : Page W-01, alerteFn injectable pour les tests
**Étapes** :
1. Charger la page W-01 avec alerteFn mockée
2. Simuler l'apparition d'une nouvelle tournée A_RISQUE via le WebSocket
3. Vérifier que alerteFn est appelée exactement 1 fois

**Résultat attendu** : alerteFn() est déclenchée une seule fois (pas de flood)
**Statut** : Passé

```gherkin
Given Laurent est sur la page W-01 avec alerteFn mockée
When un message WebSocket indique qu'une nouvelle tournée est passée à A_RISQUE
Then alerteFn() est appelée exactement 1 fois
And si le même tournée reste A_RISQUE au prochain tick, alerteFn() n'est pas rappelée
```
