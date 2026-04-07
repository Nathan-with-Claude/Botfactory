# Corrections Sync CQRS supervision ↔ svc-tournee — 2026-04-08

## Contexte

Suite aux tests terrain en recette GCP (2026-04-07/08), 4 problèmes de synchronisation
CQRS entre `svc-supervision` (read model BC-03) et `svc-tournee` (write model BC-01) ont
été identifiés et corrigés dans cette session.

**Symptômes observés :**
- Le dashboard supervision affiche `0/4` après que le livreur ait livré tous ses colis
- Une tournée lancée depuis supervision (T-206, livreur-006) n'est pas visible dans l'app mobile
- Un `DELETE /dev/tms/reset` vide tout sans recréer les données → testeurs bloqués
- Au redémarrage des services, les données sont réinitialisées même si des livraisons avaient eu lieu

---

## Problème 1 — Seeder supervision non-idempotent

### Cause
`DevDataSeeder.seed()` dans svc-supervision s'exécutait à chaque redémarrage
(`CommandLineRunner`) sans vérifier si des données existaient déjà. Les livraisons
effectuées entre deux redémarrages étaient écrasées.

### Correction
Fichier : `src/backend/svc-supervision/.../infrastructure/seeder/DevDataSeeder.java`

- `seed()` vérifie `vueTourneeJpaRepository.count() > 0` au début → skip si données présentes
- `seed()` rendu `public` pour être appelé depuis `DevTmsController`
- `reinitialiser()` efface aussi `processedEventJpaRepository` (table `processed_events`)
  afin que l'événement `TOURNEE_DEMARREE` soit retraité après un reset

---

## Problème 2 — IDs de tournées désalignés entre les deux services

### Cause
Le seeder supervision créait `tournee-sup-001/002/003` qui n'existaient pas dans svc-tournee.
Quand le livreur livrait un colis sur `tournee-dev-001`, supervision cherchait à mettre à jour
`tournee-sup-001` (inexistante côté mobile) → désynchronisation totale.

### Correction
Fichier : `src/backend/svc-supervision/.../infrastructure/seeder/DevDataSeeder.java`

Suppression de `tournee-sup-001`, `tournee-sup-002`, `tournee-sup-003`.

Remplacement par les IDs alignés avec svc-tournee (`DevDataSeeder` BC-01) :

| ID supervision | Livreur | Colis | Statut | ID svc-tournee correspondant |
|----------------|---------|-------|--------|------------------------------|
| `tournee-dev-001` | Pierre Martin (livreur-001) | 5 | EN_COURS | `tournee-dev-001` ✓ |
| `tournee-dev-003` | Marie Lambert (livreur-003) | 3 | EN_COURS | `tournee-dev-003` ✓ |
| `tournee-dev-004` | Jean Moreau (livreur-004) | 6 | A_RISQUE | `tournee-dev-004` ✓ |

Les IDs colis VueColis correspondent exactement aux IDs colis dans svc-tournee
(`colis-dev-001..005`, `colis-dev-003-001..003`, `colis-dev-004-001..006`).

---

## Problème 3 — colisTotal = 0 dans VueTournee auto-créées

### Cause
Quand svc-supervision recevait `COLIS_LIVRE` pour une tournée inconnue, il créait
automatiquement une `VueTournee` avec `colisTotal=0`. Le pourcentage restait donc à
`1/0 = 0%` quelle que soit l'activité.

### Correction — Nouvel événement `TOURNEE_DEMARREE`

**EvenementTourneeCommand + EvenementTourneeRequest** :
- Champ `colisTotal` ajouté (int, défaut 0 pour les events existants)

**SupervisionNotifier** (svc-tournee) :
- Nouvelle méthode `notifierTourneeDemarree(tourneeId, livreurId, colisTotal)`
- EventId **stable** : `"start-" + tourneeId` → idempotence garantie par `processed_events`
- Payload JSON inclut `"colisTotal": N`

**TourneeController.GET /today** (svc-tournee) :
- Appelle `notifierTourneeDemarree()` après chaque consultation de tournée
- La supervision reçoit le `colisTotal` réel et crée/met à jour la `VueTournee`
- Les appels suivants sont ignorés par idempotence

**VueTourneeEventHandler** (svc-supervision) :
- Nouveau `case "TOURNEE_DEMARREE"` dans `appliquerEvenement()`
- Si VueTournee inexistante → créée avec `colisTotal` issu de l'event
- Si VueTournee existante avec `colisTotal=0` → mise à jour du total
- Si VueTournee existante avec `colisTotal>0` → no-op

---

## Problème 4 — Pas de commande full-reset pour les testeurs

### Cause
`DELETE /dev/tms/reset` supprimait toutes les données sans recréer. Les testeurs devaient
redémarrer les services pour retrouver des données fraîches.

### Correction — Full-reset unified

**svc-tournee — DevDataSeeder** :
- Nouvelle méthode `public resetAndReseed()` : `deleteAll()` + reseed

**svc-tournee — DevTourneeController** :
- Nouvel endpoint `POST /internal/dev/reseed` → appelle `resetAndReseed()`

**svc-supervision — DevTmsController** :
- `DELETE /dev/tms/reset` modifié : `reinitialiser()` + `seed()` (plus de données perdues)
- Nouvel endpoint `POST /dev/tms/full-reset` :
  1. `reinitialiser()` — supervision
  2. HTTP `POST /internal/dev/reseed` vers svc-tournee (best-effort, log WARN si indispo)
  3. `seed()` — supervision

**Frontend supervision — TableauDeBordPage** :
- Bouton "Reset données dev" visible si `REACT_APP_AUTH_BYPASS=true`
- Appelle `POST /dev/tms/full-reset`
- Désactivé pendant la requête, rafraîchit le tableau de bord à la fin

---

## Fichiers modifiés

### svc-supervision

| Fichier | Modification |
|---------|-------------|
| `application/EvenementTourneeCommand.java` | + champ `colisTotal` |
| `application/VueTourneeEventHandler.java` | + case `TOURNEE_DEMARREE` + colisTotal dans orElseGet |
| `interfaces/dto/EvenementTourneeRequest.java` | + champ `colisTotal` |
| `interfaces/rest/EvenementTourneeController.java` | + mapping `colisTotal` |
| `infrastructure/seeder/DevDataSeeder.java` | Idempotence + IDs alignés + public seed() + processedEvents dans reinitialiser() |
| `interfaces/dev/DevTmsController.java` | DELETE /reset reseed + POST /full-reset |

### svc-tournee

| Fichier | Modification |
|---------|-------------|
| `infrastructure/supervision/SupervisionNotifier.java` | + notifierTourneeDemarree() + refactor envoyerPayloadAvecRetry() |
| `interfaces/rest/TourneeController.java` | Appel notifierTourneeDemarree() dans GET /today |
| `infrastructure/seeder/DevDataSeeder.java` | + public resetAndReseed() |
| `interfaces/dev/DevTourneeController.java` | + DevDataSeeder injection + POST /dev/reseed |

### Tests

| Fichier | Modification |
|---------|-------------|
| `test/.../VueTourneeEventHandlerTest.java` | + paramètre `colisTotal=0` dans tous les constructeurs EvenementTourneeCommand |

### Frontend

| Fichier | Modification |
|---------|-------------|
| `src/web/supervision/src/pages/TableauDeBordPage.tsx` | + prop postFn + bouton Reset données dev + handleFullReset() |

---

## Déploiement

Build Cloud Build `e4d469eb-46de-4c57-85ce-ad997cf10101` — SUCCESS (2026-04-08, 6 min).

Services mis à jour sur GCP Cloud Run (europe-west1, projet `docupost-recette-prod`) :
- `svc-tournee:latest`
- `svc-supervision:latest`
- `frontend-supervision:latest`
