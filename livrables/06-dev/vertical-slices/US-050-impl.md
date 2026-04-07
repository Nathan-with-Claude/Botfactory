# Implémentation US-050 : Désaffecter un livreur d'une tournée planifiée

## Contexte

Permet au responsable logistique de retirer l'affectation d'un livreur depuis W-05 onglet
Affectation. Cas d'usage : livreur absent le matin, correction d'erreur d'affectation.

Specs : `/livrables/05-backlog/user-stories/US-050-desaffecter-livreur-tournee-planifiee.md`

## Bounded Context et couche ciblée

- **BC** : BC-07 (Planification et Préparation des Tournées)
- **Aggregate modifié** : `TourneePlanifiee`
- **Domain Events émis** : `DesaffectationEnregistree`

## Décisions d'implémentation

### Domain Layer

**Nouveaux fichiers :**
- `domain/planification/model/TourneeDejaLanceeException.java` — exception levée si désaffectation tentée sur tournée LANCEE
- `domain/planification/events/DesaffectationEnregistree.java` — domain event record immuable avec `tourneePlanifieeId`, `codeTms`, `livreurIdRetire`, `livreurNomRetire`, `superviseurId`, `desaffecteeLe`

**Méthode ajoutée dans `TourneePlanifiee.desaffecter(superviseurId)`** :
- Si statut == LANCEE → lève `TourneeDejaLanceeException`
- Si statut == NON_AFFECTEE → lève `PlanificationInvariantException` (rien à désaffecter)
- Si statut == AFFECTEE → remet `livreurId`, `livreurNom`, `vehiculeId`, `affecteeLe` à null, passe statut à NON_AFFECTEE, émet `DesaffectationEnregistree`
- La transition est atomique dans l'agrégat

### Application Layer

**Nouveaux fichiers :**
- `application/planification/DesaffecterTourneeCommand.java` — record `(tourneePlanifieeId, superviseurId)`
- `application/planification/DesaffecterTourneeHandler.java` — charge la `TourneePlanifiee`, appelle `desaffecter()`, sauvegarde, loggue, retourne l'agrégat mis à jour

### Interface Layer (REST)

**Endpoint ajouté dans `PlanificationController` :**
```
DELETE /api/planification/tournees/{id}/affectation
```
- 200 : désaffectation réussie + TourneePlanifieeDTO retourné
- 404 : tournée introuvable
- 409 : tournée LANCEE (`TourneeDejaLanceeException`) ou NON_AFFECTEE (`PlanificationInvariantException`)

Le handler `DesaffecterTourneeHandler` est injecté dans le contrôleur (constructeur étendu).

### Frontend web supervision

**Fichier modifié : `DetailTourneePlanifieePage.tsx`**

1. Nouvelle fonction `desaffecterTournee()` :
   - Demande confirmation via `window.confirm`
   - Appelle `DELETE .../affectation`
   - Succès : recharge le détail, efface les sélecteurs
   - Erreur 409 : affiche message "Impossible de désaffecter une tournée en cours..."
   
2. Nouveau bloc JSX dans onglet Affectation (si `detail.statut === 'AFFECTEE'`) :
   - `data-testid="section-desaffectation"` — bandeau orange avec livreur affecté
   - `data-testid="btn-desaffecter"` — bouton rouge "Désaffecter"
   
3. Bloc LANCEE enrichi : message explicatif avec `data-testid="msg-tournee-en-cours"`

**Correctif indépendant :** `DetailTourneePage.tsx` — guard `typeof TextEncoder === 'undefined'` avant création du `StompClient` pour éviter le crash en jsdom (régression introduite par US-048 lors de l'ajout du mode STOMP).

### Erreurs / invariants préservés

- La règle "AFFECTEE requis, LANCEE interdit" est appliquée dans l'Aggregate, pas dans le Controller
- La désaffectation n'impacte pas svc-tournee (BC-01) ni les colis déjà associés
- `affecteeLe` est remis à null atomiquement avec `livreurId`, `livreurNom`, `vehiculeId`

## Tests

### Backend svc-supervision — Tests domaine (TDD)

Fichier : `src/backend/svc-supervision/src/test/java/com/docapost/supervision/domain/planification/TourneePlanifieeTest.java`

5 nouveaux tests (section `US-050`) :
- `desaffecter_tournee_affectee_remet_a_non_affectee` — vérifie statut + champs null
- `desaffecter_tournee_affectee_emet_event` — vérifie `DesaffectationEnregistree` avec bons attributs
- `desaffecter_tournee_lancee_leve_exception` — `TourneeDejaLanceeException` avec "cours"
- `desaffecter_tournee_non_affectee_leve_exception` — `PlanificationInvariantException` avec "AFFECTEE"
- `apres_desaffectation_tournee_est_affectable` — `estAffectable() == true` + NON_AFFECTEE

### Backend svc-supervision — Tests controller (TDD)

Fichier : `PlanificationControllerTest.java`

3 nouveaux tests :
- `DELETE /affectation` retourne 200 quand succès
- `DELETE /affectation` retourne 409 si LANCEE
- `DELETE /affectation` retourne 404 si tournée introuvable

MockBean `DesaffecterTourneeHandler` ajouté dans la classe de test.

### Frontend web supervision (React Testing Library)

5 nouveaux tests dans `DetailTourneePlanifieePage.test.tsx` (describe `US-050`) :
- SC1 : bouton "Désaffecter" visible si AFFECTEE (`btn-desaffecter`)
- SC4 : bouton absent si NON_AFFECTEE
- SC3 : message d'impossibilité si LANCEE (`msg-tournee-en-cours`)
- SC2 : clic + confirmation → appel DELETE /affectation
- SC3 (erreur) : erreur 409 → `message-erreur` visible

## Suite complète après cette US

- Mobile : 371/371 verts
- Web supervision : 272/272 verts (265 anciens + 7 nouveaux US-049+050 + 1 correctif TextEncoder)
- Backend svc-supervision : 152/152 verts (144 anciens + 8 nouveaux US-049+050)
