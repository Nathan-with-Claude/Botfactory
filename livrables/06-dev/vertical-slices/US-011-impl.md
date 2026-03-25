# Implémentation US-011 : Tableau de bord des tournées en temps réel

## Contexte

US-011 — BC-03 Supervision — nouveau service `svc-supervision`.
Persona : Laurent Renaud (superviseur), écran W-01.

## Bounded Context et couche ciblée

- **BC** : BC-03 Supervision — nouveau service `svc-supervision` (port 8082)
- **Aggregate(s) modifiés** : aucun (Read Model)
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Domain Layer
- `VueTournee` : Read Model (pas d'Aggregate), mise à jour par projections + handlers alertes
- `StatutTourneeVue` : enum EN_COURS | A_RISQUE | CLOTUREE
- `TableauDeBord` : Value Object immuable (liste VueTournee + compteurs bandeau)
- `VueTourneeRepository` : interface port avec findAll, findByStatut, findByTourneeId, save, findAllEnCours

### Application Layer
- `ConsulterTableauDeBordQuery` : record(filtreStatut nullable) + factory `sansFiltre()`
- `ConsulterTableauDeBordHandler` : filtre par statut si présent, construit `TableauDeBord.of()`

### Infrastructure Layer
- `VueTourneeEntity` : entité JPA avec `tourneeId` (PK), enum statut
- `VueTourneeJpaRepository` : Spring Data JPA, `findByStatut()` + `@Query findAllEnCours()`
- `VueTourneeRepositoryImpl` : stratégie find-or-create pour `save()`
- `SupervisionWebSocketConfig` : STOMP over WebSocket, endpoint `/ws/supervision` SockJS, topic `/topic/tableau-de-bord`
- `DevDataSeeder` : 3 VueTournee de test (2 EN_COURS, 1 A_RISQUE)

### Interface Layer
- `SupervisionController` : `GET /api/supervision/tableau-de-bord?statut={EN_COURS|A_RISQUE|CLOTUREE}` → 200/400/403
- `TableauDeBordBroadcaster` : push `TableauDeBordDTO` sur `/topic/tableau-de-bord` après chaque modification
- `VueTourneeDTO` / `TableauDeBordDTO` : records immuables
- `SecurityConfig` : `ROLE_SUPERVISEUR` requis sur `/api/supervision/**`, `/ws/**` permis
- `MockJwtAuthFilter` : injecte `superviseur-001 / ROLE_SUPERVISEUR` en profil dev

### Frontend
- `TableauDeBordPage.tsx` : écran W-01
  - `useTableauDeBord` hook : charge initial + WebSocket updates + polling fallback
  - `BandeauResume` : compteurs actives / aRisque / cloturees
  - `LigneTournee` : ligne de tableau avec badge statut + bouton Voir
  - Filtre statut (select)
  - Tri : A_RISQUE en tête
  - Bandeau rouge si WebSocket déconnecté

### Erreurs / invariants préservés
- 403 si non-SUPERVISEUR
- 400 si statut inconnu dans query param
- WebSocket fallback : le bandeau rouge prévient l'utilisateur si la connexion temps réel est perdue

## Tests

### Backend (svc-supervision)
| Fichier | Tests | Résultat |
|---------|-------|----------|
| `ConsulterTableauDeBordHandlerTest.java` | 4 tests (sans filtre, filtre A_RISQUE, vide, compteurs) | Verts |
| `SupervisionControllerTest.java` | 4 tests WebMvcTest (200, filtre, 403 livreur, 400 invalide) | Verts |

Total svc-supervision après US-011 : **8/8 tests verts**

### Frontend (supervision-web)
| Fichier | Tests | Résultat |
|---------|-------|----------|
| `TableauDeBordPage.test.tsx` | 7 tests Jest | Verts |

Total frontend supervision : **14/14 tests verts** (US-010 + US-011)

## Commandes de lancement

```bash
# Backend (svc-supervision)
cd src/backend/svc-supervision
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn spring-boot:run -Dspring-boot.run.profiles=dev
# → http://localhost:8082/api/supervision/tableau-de-bord

# Tests backend
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn test
```

---

## Corrections post-QA (2026-03-25)

**Anomalie OBS-011-01** — Rapport : `livrables/07-tests/scenarios/US-011-rapport-playwright.md`

**Symptôme** : Les tests Playwright (et ceux couvrant US-013, US-020) échouaient sur `expect(body.bandeau).toBeDefined()`. L'API retournait les compteurs à la racine du JSON : `{"aRisque":1,"actives":2,"cloturees":0,"tournees":[...]}`.

**Correction** : Le record `TableauDeBordDTO` a été restructuré pour encapsuler les compteurs dans un sous-record `BandeauResume`. La réponse JSON est maintenant : `{"bandeau":{"actives":2,"aRisque":1,"cloturees":0},"tournees":[...]}`.

Le test unitaire `SupervisionControllerTest` a également été mis à jour pour vérifier `$.bandeau.actives` au lieu de `$.actives`.

**Fichiers modifiés** :
- `src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/dto/TableauDeBordDTO.java`
- `src/backend/svc-supervision/src/test/java/com/docapost/supervision/interfaces/SupervisionControllerTest.java`
