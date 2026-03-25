# Implémentation US-012 : Consulter le détail d'une tournée avec statuts des colis et incidents

## Contexte

US-012 — BC-03 Supervision, écran W-02.
Persona : Laurent Renaud (superviseur) qui consulte le détail d'une tournée depuis le tableau de bord.

Inputs :
- `/livrables/05-backlog/user-stories/US-012-detail-tournee-superviseur.md`
- `/livrables/02-ux/wireframes.md` (section W-02)
- `/livrables/04-architecture-technique/architecture-applicative.md`

## Bounded Context et couche ciblée

- **BC** : BC-03 Supervision — `svc-supervision` (port 8082)
- **Aggregate(s) modifiés** : aucun (Read Models uniquement — lecture pure)
- **Domain Events émis** : aucun (query)

## Décisions d'implémentation

### Domain Layer (nouveaux Read Models)

- `VueColis` : record immuable (colisId, adresse, statut, motifEchec nullable, horodatageTraitement nullable)
- `IncidentVue` : record immuable (colisId, adresse, motif, horodatage, note nullable)
- `VueTourneeDetail` : record immuable composé de (VueTournee, List<VueColis>, List<IncidentVue>)
- `VueTourneeDetailRepository` : interface port avec `findByTourneeId(String tourneeId): Optional<VueTourneeDetail>`

### Application Layer

- `ConsulterDetailTourneeQuery` : record(String tourneeId)
- `TourneeSupervisionNotFoundException` : exception → HTTP 404
- `ConsulterDetailTourneeHandler` : délègue à `VueTourneeDetailRepository.findByTourneeId()`, lève l'exception si absent

### Infrastructure Layer

- `VueColisEntity` : entité JPA (tourneeId, colisId, adresse, statut, motifEchec, horodatageTraitement)
- `VueColisJpaRepository` : `findByTourneeId(String tourneeId): List<VueColisEntity>`
- `IncidentVueEntity` : entité JPA (tourneeId, colisId, adresse, motif, horodatage, note)
- `IncidentVueJpaRepository` : `findByTourneeId(String tourneeId): List<IncidentVueEntity>`
- `VueTourneeDetailRepositoryImpl` : compose VueTourneeDetail depuis VueTourneeJpaRepository + VueColisJpaRepository + IncidentVueJpaRepository
- `DevDataSeeder` enrichi : colis et incidents pour tournee-sup-001 (3 colis dont 1 LIVRE, 1 ECHEC, 1 A_LIVRER) et tournee-sup-003 (A_RISQUE, 3 colis + 1 incident)

### Interface Layer

- `SupervisionController` étendu :
  - `GET /api/supervision/tournees/{tourneeId}` → `VueTourneeDetailDTO`
  - 200 : détail trouvé
  - 404 : `TourneeSupervisionNotFoundException`
  - 403 : non ROLE_SUPERVISEUR
- `VueColisDTO` : record (colisId, adresse, statut, motifEchec nullable, horodatageTraitement nullable)
- `IncidentVueDTO` : record (colisId, adresse, motif, horodatage, note nullable)
- `VueTourneeDetailDTO` : record (tournee: VueTourneeDTO, colis: List<VueColisDTO>, incidents: List<IncidentVueDTO>), factory `from(VueTourneeDetail)`

### Frontend

- `DetailTourneePage.tsx` : composant React dans `src/web/supervision/src/pages/`
  - Props : `tourneeId`, `onRetour`, `onInstructionner`, `apiBaseUrl`, `fetchFn`, `wsFactory`
  - Bandeau avancement : tourneeId, livreurNom, colisTraites/colisTotal, barre de progression, badge statut (orange si A_RISQUE)
  - Onglets : "Colis (N)" / "Incidents (N)"
  - Onglet Colis : tableau avec badge statut coloré (vert LIVRE, rouge ECHEC, bleu A_LIVRER), motif échec, bouton "Instructionner" conditionnel (A_LIVRER + tournée active + prop onInstructionner)
  - Onglet Incidents : carte par incident (colisId, adresse, motif, note, horodatage)
  - Refresh WebSocket : rechargement du détail à chaque broadcast tableau de bord
  - Bouton "← Retour au tableau de bord" (prop onRetour)

### Erreurs / invariants préservés

- HTTP 404 si tournée absente du Read Model
- HTTP 403 si non ROLE_SUPERVISEUR
- Bouton "Instructionner" absent si statut colis != A_LIVRER ou tournée != EN_COURS/A_RISQUE (invariant US-014)
- Read Model alimenté uniquement par Domain Events (jamais de requête directe sur BC-01)

## Tests

### Backend (svc-supervision)

| Fichier | Tests | Résultat |
|---------|-------|----------|
| `ConsulterDetailTourneeHandlerTest.java` | 3 tests (détail complet, exception si introuvable, listes vides) | Verts |
| `SupervisionControllerTest.java` | 2 tests US-012 (200 avec détail, 404 si introuvable) | Verts |

Total svc-supervision après US-012 : **10/10 tests verts** (8 US-011 + 2 nouveaux US-012 controller, 3 handler)

### Frontend (supervision-web)

| Fichier | Tests | Résultat |
|---------|-------|----------|
| `DetailTourneePage.test.tsx` | 6 tests Jest (chargement bandeau, badges + Instructionner, onglet incidents, 404, tournée clôturée, refresh WebSocket) | Verts |

Total frontend supervision : **20/20 tests verts** (14 US-010+011 + 6 US-012)

## Commandes de lancement

```bash
# Backend (svc-supervision)
cd src/backend/svc-supervision
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn spring-boot:run -Dspring-boot.run.profiles=dev

# URL de test (rôle SUPERVISEUR requis)
# GET http://localhost:8082/api/supervision/tournees/tournee-sup-001

# Tests backend
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn test

# Tests frontend
cd src/web/supervision
npm test -- --watchAll=false
```
