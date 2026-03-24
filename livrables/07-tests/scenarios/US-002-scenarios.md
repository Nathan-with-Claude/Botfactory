# Scénarios de tests US-002 : Suivre ma progression en temps réel

**US liée** : US-002 — Suivre ma progression en temps réel (reste à livrer et estimation de fin)
**Bounded Context** : BC-01 Orchestration de Tournée
**Aggregate principal** : Tournee
**Value Object ciblé** : Avancement
**Domain Service ciblé** : AvancementCalculator
**Domain Events ciblés** : aucun nouveau (l'estimation n'est pas contractuelle)
**Rédigé par** : @qa
**Date** : 2026-03-23
**Nombre total de TCs** : 20

---

## Rappel des invariants domaine (BC-01 — US-002)

- **BC-01-INV-US002-01** : `Avancement` est un Value Object calculé — il ne peut pas être saisi manuellement.
- **BC-01-INV-US002-02** : `resteALivrer()` compte uniquement les colis dont le `StatutColis` est `A_LIVRER`. Les statuts `LIVRE`, `ECHEC` et `A_REPRESENTER` sont exclus.
- **BC-01-INV-US002-03** : `estimationFin` est une approximation non contractuelle — elle ne génère pas de Domain Event.
- **BC-01-INV-US002-04** : `estTerminee()` retourne `true` si et seulement si `resteALivrer() == 0`.
- **BC-01-INV-US002-05** : `colisTotal` est constant sur toute la durée de la tournée (un colis n'est jamais supprimé, seulement changé de statut).

---

## A — Tests d'invariants domaine (Domain Layer — AvancementCalculator + Tournee)

### TC-026 : `resteALivrer()` exclut les colis LIVRE du compteur

**US liée** : US-002
**Couche testée** : Domain
**Aggregate / Value Object ciblé** : Tournee / Avancement
**Type** : Invariant domaine
**Préconditions** :
- Une Tournee contient 5 colis : 2 au statut `A_LIVRER`, 2 au statut `LIVRE`, 1 au statut `ECHEC`.

**Étapes** :
1. Créer une `Tournee` avec 5 colis dans les statuts décrits.
2. Appeler `tournee.calculerAvancement()`.
3. Lire `avancement.resteALivrer()`.

**Résultat attendu** :
- `resteALivrer()` retourne `2`.
- `colisTotal` retourne `5`.
- `colisTraites` retourne `3` (LIVRE + ECHEC).

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/domain/AvancementCalculatorTest.java`
**Statut** : Passé (implémenté en US-002)

---

### TC-027 : `resteALivrer()` exclut les colis ECHEC du compteur

**US liée** : US-002
**Couche testée** : Domain
**Aggregate / Value Object ciblé** : Tournee / Avancement
**Type** : Invariant domaine
**Préconditions** :
- Une Tournee contient 3 colis : 1 au statut `A_LIVRER`, 2 au statut `ECHEC`.

**Étapes** :
1. Créer une `Tournee` avec les 3 colis décrits.
2. Appeler `tournee.calculerAvancement()`.

**Résultat attendu** :
- `resteALivrer()` retourne `1`.
- Les 2 colis `ECHEC` sont comptabilisés dans `colisTraites`.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/domain/AvancementCalculatorTest.java`
**Statut** : Passé (implémenté en US-002 — SC3)

---

### TC-028 : `resteALivrer()` exclut les colis A_REPRESENTER du compteur

**US liée** : US-002
**Couche testée** : Domain
**Aggregate / Value Object ciblé** : Tournee / Avancement
**Type** : Invariant domaine
**Préconditions** :
- Une Tournee contient 4 colis : 2 au statut `A_LIVRER`, 2 au statut `A_REPRESENTER`.

**Étapes** :
1. Créer une `Tournee` avec les 4 colis décrits.
2. Appeler `tournee.calculerAvancement()`.

**Résultat attendu** :
- `resteALivrer()` retourne `2`.
- Les colis `A_REPRESENTER` sont considérés comme traités (`estTraite()` retourne `true`).

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/domain/AvancementCalculatorTest.java`
**Statut** : Passé (implémenté en US-002)

---

### TC-029 : `estTerminee()` retourne false tant qu'au moins un colis est A_LIVRER

**US liée** : US-002
**Couche testée** : Domain
**Aggregate / Value Object ciblé** : Tournee / Avancement
**Type** : Invariant domaine
**Préconditions** :
- Une Tournee contient 5 colis dont au moins 1 au statut `A_LIVRER`.

**Étapes** :
1. Calculer `avancement = tournee.calculerAvancement()`.
2. Appeler `avancement.estTerminee()`.

**Résultat attendu** :
- `estTerminee()` retourne `false`.
- Le bouton "Clôturer la tournée" ne doit pas être visible (règle mobile).

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/domain/TourneeTest.java`
**Statut** : Passé (implémenté en US-002)

---

### TC-030 : `estTerminee()` retourne true quand tous les colis sont traités

**US liée** : US-002
**Couche testée** : Domain
**Aggregate / Value Object ciblé** : Tournee / Avancement
**Type** : Invariant domaine
**Préconditions** :
- Une Tournee contient 5 colis : 3 au statut `LIVRE`, 2 au statut `ECHEC`. Aucun `A_LIVRER`.

**Étapes** :
1. Calculer `avancement = tournee.calculerAvancement()`.
2. Appeler `avancement.estTerminee()`.

**Résultat attendu** :
- `resteALivrer()` retourne `0`.
- `estTerminee()` retourne `true`.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/domain/TourneeTest.java`
**Statut** : Passé (implémenté en US-002)

---

### TC-031 : `estimationFin` retourne null dans le MVP (cadence non disponible)

**US liée** : US-002
**Couche testée** : Domain
**Aggregate / Value Object ciblé** : Avancement
**Type** : Invariant domaine
**Préconditions** :
- Toute tournée avec n'importe quel état de colis.

**Étapes** :
1. Calculer `avancement = AvancementCalculator.calculer(tournee)`.
2. Lire `avancement.getEstimationFin()`.

**Résultat attendu** :
- `getEstimationFin()` retourne `null`.
- Aucun Domain Event n'est émis.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/domain/AvancementCalculatorTest.java`
**Statut** : Passé (implémenté en US-002)

---

### TC-032 : `colisTotal` est constant quel que soit le statut des colis

**US liée** : US-002
**Couche testée** : Domain
**Aggregate / Value Object ciblé** : Tournee / Avancement
**Type** : Invariant domaine
**Préconditions** :
- Une Tournee contient 5 colis au statut initial `A_LIVRER`.

**Étapes** :
1. Calculer `avancement1 = tournee.calculerAvancement()` — tous les colis `A_LIVRER`.
2. Changer 3 colis en `LIVRE`.
3. Calculer `avancement2 = tournee.calculerAvancement()`.

**Résultat attendu** :
- `avancement1.getColisTotal() == avancement2.getColisTotal() == 5`.
- Aucun colis n'est supprimé de la tournée.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/domain/AvancementCalculatorTest.java`
**Statut** : À tester

---

### TC-033 : `AvancementCalculator` et `Tournee.calculerAvancement()` sont cohérents

**US liée** : US-002
**Couche testée** : Domain
**Aggregate / Domain Service ciblé** : Tournee / AvancementCalculator
**Type** : Invariant domaine
**Préconditions** :
- Une Tournee contient un mix de colis : 3 `A_LIVRER`, 1 `LIVRE`, 1 `ECHEC`.

**Étapes** :
1. Appeler `Tournee.calculerAvancement()` — méthode déléguant au Domain Service.
2. Appeler `AvancementCalculator.calculer(tournee)` directement.
3. Comparer les deux résultats.

**Résultat attendu** :
- `resteALivrer`, `colisTotal`, `colisTraites`, `estimationFin` sont identiques dans les deux résultats.

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/domain/AvancementCalculatorTest.java`
**Statut** : Passé (test de cohérence inclus dans US-002)

---

## B — Tests fonctionnels (Application Layer)

### TC-034 : SC1 — L'endpoint retourne le bon avancement initial (DevDataSeeder)

**US liée** : US-002
**Couche testée** : Application
**Aggregate / Value Object ciblé** : Tournee / Avancement
**Type** : Fonctionnel
**Préconditions** :
- Le backend est démarré avec le profil `dev`.
- `DevDataSeeder` a créé une tournée `TRN-001` avec 5 colis (3 `A_LIVRER`, 1 `LIVRE`, 1 `ECHEC`).

**Étapes** :
1. `GET /api/tournees/TRN-001` avec header `X-Livreur-Id: LIV-001`.
2. Lire les champs `resteALivrer`, `colisTotal`, `colisTraites`, `estimationFin`.

**Résultat attendu** :
```json
{
  "resteALivrer": 3,
  "colisTotal": 5,
  "colisTraites": 2,
  "estimationFin": null
}
```

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/application/ConsulterListeColisHandlerTest.java`
**Statut** : Passé (implémenté en US-002)

---

### TC-035 : SC2 — Le compteur diminue après une livraison confirmée

**US liée** : US-002
**Couche testée** : Application
**Aggregate / Value Object ciblé** : Tournee / Avancement
**Type** : Fonctionnel
**Préconditions** :
- Le bandeau affiche `resteALivrer = 3` (état initial DevDataSeeder).

**Étapes** :
1. Simuler la confirmation de livraison d'un colis : passer son statut de `A_LIVRER` à `LIVRE` en base.
2. `GET /api/tournees/TRN-001` avec header `X-Livreur-Id: LIV-001`.

**Résultat attendu** :
- `resteALivrer` est désormais `2`.
- `colisTraites` est désormais `3`.
- `colisTotal` est toujours `5`.

**Statut** : À tester (test manuel — US-002 ne fournit pas encore l'endpoint de mise à jour de statut)

---

### TC-036 : SC3 — Le compteur diminue après un échec déclaré

**US liée** : US-002
**Couche testée** : Application
**Aggregate / Value Object ciblé** : Tournee / Avancement
**Type** : Fonctionnel
**Préconditions** :
- Le bandeau affiche `resteALivrer = 3`.

**Étapes** :
1. Simuler la déclaration d'un échec : passer un colis de `A_LIVRER` à `ECHEC`.
2. `GET /api/tournees/TRN-001`.

**Résultat attendu** :
- `resteALivrer` est désormais `2`.
- Le colis en `ECHEC` est exclu du reste à livrer.

**Statut** : À tester

---

### TC-037 : SC4 — `estTerminee()` déclenche l'affichage du bouton Clôture

**US liée** : US-002
**Couche testée** : Application
**Aggregate / Value Object ciblé** : Tournee / Avancement
**Type** : Fonctionnel
**Préconditions** :
- Tous les colis de la tournée sont au statut `LIVRE` ou `ECHEC`.

**Étapes** :
1. `GET /api/tournees/TRN-001`.
2. Vérifier `resteALivrer == 0` et `estTerminee == true` dans la réponse.

**Résultat attendu** :
- La réponse JSON indique `resteALivrer: 0`.
- Le composant mobile `ListeColisScreen` affiche le bouton "Clôturer la tournée".

**Fichier de test correspondant** : `src/test/java/com/docapost/tournee/application/ConsulterListeColisHandlerTest.java`
**Statut** : Passé (implémenté en US-002)

---

## C — Tests d'interface mobile (ListeColisScreen — Jest / React Native Testing Library)

### TC-038 : Bandeau affiche "Reste à livrer : 3 / 5" avec les données DevDataSeeder

**US liée** : US-002
**Couche testée** : Interface (Mobile)
**Composant ciblé** : ListeColisScreen (écran M-02)
**Type** : Fonctionnel
**Préconditions** :
- `tournee.resteALivrer = 3`, `tournee.colisTotal = 5`.

**Étapes** :
1. Monter le composant `ListeColisScreen` avec les données de tournée mockées.
2. Lire le texte du bandeau de progression.

**Résultat attendu** :
- Le bandeau contient "Reste à livrer : 3 / 5".

**Fichier de test correspondant** : `src/mobile/src/__tests__/ListeColisScreen.test.tsx`
**Statut** : Passé (implémenté en US-002)

---

### TC-039 : Bouton "Clôturer la tournée" masqué quand resteALivrer > 0

**US liée** : US-002
**Couche testée** : Interface (Mobile)
**Composant ciblé** : ListeColisScreen (écran M-02)
**Type** : Fonctionnel
**Préconditions** :
- `tournee.resteALivrer = 3` (colis restants).

**Étapes** :
1. Monter le composant avec `resteALivrer = 3`.
2. Chercher un élément avec `testID="bouton-cloture"`.

**Résultat attendu** :
- L'élément `testID="bouton-cloture"` est absent du rendu.

**Fichier de test correspondant** : `src/mobile/src/__tests__/ListeColisScreen.test.tsx`
**Statut** : Passé (implémenté en US-002)

---

### TC-040 : Bouton "Clôturer la tournée" visible quand resteALivrer == 0

**US liée** : US-002
**Couche testée** : Interface (Mobile)
**Composant ciblé** : ListeColisScreen (écran M-02)
**Type** : Fonctionnel
**Préconditions** :
- `tournee.resteALivrer = 0` (tous les colis traités).

**Étapes** :
1. Monter le composant avec `resteALivrer = 0`.
2. Chercher un élément avec `testID="bouton-cloture"`.

**Résultat attendu** :
- L'élément `testID="bouton-cloture"` est présent dans le rendu.
- Le bouton a `accessibilityRole="button"` et un `accessibilityLabel` non vide.

**Fichier de test correspondant** : `src/mobile/src/__tests__/ListeColisScreen.test.tsx`
**Statut** : Passé (implémenté en US-002)

---

### TC-041 : Estimation fin affichée "--" quand estimationFin est null

**US liée** : US-002
**Couche testée** : Interface (Mobile)
**Composant ciblé** : ListeColisScreen (écran M-02)
**Type** : Fonctionnel / Edge case
**Préconditions** :
- `tournee.estimationFin = null`.

**Étapes** :
1. Monter le composant avec `estimationFin = null`.
2. Observer la zone "Fin estimée" du bandeau.

**Résultat attendu** :
- Le bandeau affiche "--" ou masque le champ `estimationFin`.
- Aucune erreur JavaScript n'est levée.

**Fichier de test correspondant** : `src/mobile/src/__tests__/ListeColisScreen.test.tsx`
**Statut** : Passé (implémenté en US-002)

---

## D — Tests Edge Cases

### TC-042 : Tournée avec zéro colis — Avancement = 0/0

**US liée** : US-002
**Couche testée** : Domain
**Aggregate / Value Object ciblé** : Tournee / Avancement
**Type** : Edge case
**Préconditions** :
- Une Tournee contient une liste de colis vide.

**Étapes** :
1. Calculer `avancement = AvancementCalculator.calculer(tournee)`.

**Résultat attendu** :
- `resteALivrer() == 0`.
- `colisTotal == 0`.
- `estTerminee()` retourne `true` (aucun colis à livrer).
- Aucune division par zéro ou exception levée.

**Statut** : À tester

---

### TC-043 : Tournée avec 1 seul colis A_LIVRER

**US liée** : US-002
**Couche testée** : Domain
**Aggregate / Value Object ciblé** : Tournee / Avancement
**Type** : Edge case
**Préconditions** :
- Une Tournee contient 1 seul colis au statut `A_LIVRER`.

**Étapes** :
1. Calculer `avancement`.
2. Vérifier `resteALivrer()`, `colisTotal`, `estTerminee()`.

**Résultat attendu** :
- `resteALivrer() == 1`.
- `colisTotal == 1`.
- `estTerminee() == false`.

**Statut** : À tester

---

### TC-044 : Transition A_LIVRER → LIVRE sur le dernier colis restant

**US liée** : US-002
**Couche testée** : Domain
**Aggregate / Value Object ciblé** : Tournee / Avancement
**Type** : Edge case
**Préconditions** :
- Une Tournee contient 1 colis au statut `A_LIVRER`. Tous les autres colis sont `LIVRE` ou `ECHEC`.

**Étapes** :
1. Calculer `avancement1` — `resteALivrer() == 1`, `estTerminee() == false`.
2. Passer le dernier colis en statut `LIVRE`.
3. Calculer `avancement2`.

**Résultat attendu** :
- `avancement2.resteALivrer() == 0`.
- `avancement2.estTerminee() == true`.
- Le bouton "Clôturer la tournée" devient visible.

**Statut** : À tester

---

## E — Tests de non-régression

### TC-045 : `calculerAvancement()` en US-002 ne casse pas le comportement US-001

**US liée** : US-002 (non-régression US-001)
**Couche testée** : Application
**Type** : Non régression
**Préconditions** :
- L'endpoint `GET /api/tournees/{id}` fonctionne correctement (validé en US-001 — TC-010 à TC-018).

**Étapes** :
1. Rejouer les scénarios TC-010 à TC-018 (US-001) après l'introduction de `AvancementCalculator`.
2. Vérifier que la liste des colis, les DTO, les statuts et les contraintes sont inchangés.

**Résultat attendu** :
- Les champs `id`, `colis`, `statut`, `destinataire`, `adresse`, `contraintes` de la réponse sont identiques à ceux validés en US-001.
- Les nouveaux champs `resteALivrer`, `colisTotal`, `colisTraites`, `estimationFin` sont ajoutés sans casser les champs existants.

**Statut** : À tester

---

## Récapitulatif couverture par scénario US-002

| Scénario Gherkin | TCs couvrant | Couche | Statut |
|-----------------|-------------|--------|--------|
| SC1 : Affichage initial | TC-026, TC-034, TC-038 | Domain + Application + Mobile | Partiellement passé |
| SC2 : Mise à jour après livraison | TC-035 | Application | À tester |
| SC3 : Mise à jour après échec | TC-027, TC-036 | Domain + Application | Partiellement passé |
| SC4 : Tous traités → bouton Clôture | TC-029, TC-030, TC-037, TC-039, TC-040 | Domain + Application + Mobile | Passé |
| Estimation fin null | TC-031, TC-041 | Domain + Mobile | Passé |
| Invariant colisTotal constant | TC-032 | Domain | À tester |
| Non régression US-001 | TC-045 | Application | À tester |

---

## Jeux de données de référence

| Jeu | Description | resteALivrer | colisTotal | estTerminee |
|-----|-------------|-------------|------------|-------------|
| JDD-US002-01 (DevDataSeeder) | 3 A_LIVRER + 1 LIVRE + 1 ECHEC | 3 | 5 | false |
| JDD-US002-02 | 0 A_LIVRER + 5 LIVRE | 0 | 5 | true |
| JDD-US002-03 | 1 A_LIVRER + 4 ECHEC | 1 | 5 | false |
| JDD-US002-04 | 0 colis | 0 | 0 | true |
| JDD-US002-05 | 2 A_LIVRER + 2 A_REPRESENTER + 1 LIVRE | 2 | 5 | false |

---

*Scénarios rédigés en Ubiquitous Language selon le Domain Model BC-01.*
*Réf. domain-model : /livrables/03-architecture-metier/domain-model.md*
*Réf. wireframe M-02 : /livrables/02-ux/wireframes.md#écran-m-02--liste-des-colis-de-la-tournée*
