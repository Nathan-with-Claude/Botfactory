# Scénarios de tests US-050 : Désaffecter un livreur d'une tournée planifiée

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-050 — Désaffecter un livreur d'une tournée planifiée depuis l'interface de supervision
**Bounded Context** : BC-07 Planification de Tournée (svc-supervision port 8082)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-050-01 | desaffecter() → NON_AFFECTEE + champs null + DesaffectationEnregistree | L1 | Passé |
| TC-050-02 | desaffecter() LANCEE → TourneeDejaLanceeException | L1 | Passé |
| TC-050-03 | desaffecter() NON_AFFECTEE → PlanificationInvariantException | L1 | Passé |
| TC-050-04 | Après désaffectation, estAffectable()=true | L1 | Passé |
| TC-050-05 | DELETE /affectation → 200 AFFECTEE | L2 | Passé |
| TC-050-06 | DELETE /affectation → 409 LANCEE | L2 | Passé |
| TC-050-07 | DELETE /affectation → 404 introuvable | L2 | Passé |
| TC-050-08 | Bouton "Désaffecter" visible si AFFECTEE (UI) | L1 | Passé |
| TC-050-09 | Bouton "Désaffecter" absent si NON_AFFECTEE (UI) | L1 | Passé |
| TC-050-10 | Message d'impossibilité si LANCEE (UI) | L1 | Passé |

---

### TC-050-01 : desaffecter() → NON_AFFECTEE + DesaffectationEnregistree

**Niveau** : L1 | **Type** : Invariant domaine | **Couche** : Domain

```gherkin
Given TourneePlanifiee T-202 à l'état AFFECTEE avec livreurId="livreur-001"
When desaffecter(superviseurId="sup-01") est appelé
Then le statut passe à NON_AFFECTEE
And livreurId, livreurNom, vehiculeId, affecteeLe sont remis à null
And DesaffectationEnregistree est émis avec tourneePlanifieeId, livreurIdRetire, superviseurId
```

**Statut** : Passé

---

### TC-050-02 : desaffecter() LANCEE → exception

**Niveau** : L1 | **Type** : Invariant domaine

```gherkin
Given TourneePlanifiee T-204 à l'état LANCEE
When desaffecter() est appelé
Then TourneeDejaLanceeException est levée
And la TourneePlanifiee n'est pas modifiée
```

**Statut** : Passé

---

### TC-050-03 : desaffecter() NON_AFFECTEE → exception

**Niveau** : L1 | **Type** : Invariant domaine

```gherkin
Given TourneePlanifiee T-201 à l'état NON_AFFECTEE
When desaffecter() est appelé
Then PlanificationInvariantException est levée
And message contient "AFFECTEE"
```

**Statut** : Passé

---

### TC-050-04 : Après désaffectation, estAffectable()=true

**Niveau** : L1 | **Type** : Non régression

```gherkin
Given désaffectation réussie de T-202
When estAffectable() est appelé
Then retourne true (NON_AFFECTEE)
```

**Statut** : Passé

---

### TC-050-05 : DELETE /affectation → 200

**Niveau** : L2 | **Type** : Fonctionnel

```bash
curl -s -X DELETE "http://localhost:8082/api/planification/tournees/tp-202/affectation"
# Attendu : 200 + TourneePlanifieeDTO avec statut=NON_AFFECTEE
```

**Statut** : Passé

---

### TC-050-06 : DELETE /affectation → 409 si LANCEE

**Niveau** : L2 | **Type** : Edge case

```gherkin
Given T-204 est LANCEE
When DELETE /api/planification/tournees/tp-204/affectation
Then HTTP 409
```

**Statut** : Passé

---

### TC-050-07 : DELETE /affectation → 404 introuvable

**Niveau** : L2 | **Type** : Edge case

```gherkin
Given tourneeId inexistant
When DELETE /api/planification/tournees/inexistant/affectation
Then HTTP 404
```

**Statut** : Passé

---

### TC-050-08 à TC-050-10 : UI Frontend

**Niveau** : L1 | **Type** : Fonctionnel UI

```gherkin
Given DetailTourneePlanifieePage affiche T-202 (AFFECTEE)
Then btn-desaffecter est visible dans section-desaffectation

Given T-201 (NON_AFFECTEE)
Then btn-desaffecter est absent

Given T-204 (LANCEE)
Then msg-tournee-en-cours est visible avec message "Impossible de désaffecter..."
```

**Statut** : Passé
