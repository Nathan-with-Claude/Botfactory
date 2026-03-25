# Implémentation US-013 : Alerte automatique tournée à risque de retard

## Contexte

US-013 — BC-03 Supervision, écran W-01.
Persona : Laurent Renaud (superviseur) qui reçoit des alertes automatiques sur les tournées à risque.

Inputs :
- `/livrables/05-backlog/user-stories/US-013-alerte-tournee-risque.md`
- `/livrables/02-ux/wireframes.md` (section W-01)
- `/livrables/04-architecture-technique/architecture-applicative.md`

## Bounded Context et couche ciblée

- **BC** : BC-03 Supervision — `svc-supervision` (port 8082)
- **Aggregate(s) modifiés** : VueTournee (Read Model) — `signalerRisque()` / `normaliserStatut()`
- **Domain Events émis** : `TourneeARisqueDetectee` (record — marqueur sémantique)

## Décisions d'implémentation

### Domain Layer

- `TourneeARisqueDetectee` : record immuable (tourneeId, livreurNom, inactiviteMinutes, horodatage)
  — événement sémantique, non persisté dans le MVP, utilisé comme marqueur
- `RisqueDetector` : domain service (POJO, pas de Spring), évalue si une VueTournee est à risque
  - Critère : `Duration.between(derniereActivite, now) >= seuilInactiviteMin` ET `pourcentage < 100`
  - Invariants : CLOTUREE → false ; colisTotal = 0 → false ; derniereActivite null → false
  - Constructeur : `RisqueDetector(int seuilInactiviteMin)` — configurable

### Application Layer

- `DetecterTourneesARisqueHandler` : @Service Spring
  - Charge toutes les tournées EN_COURS + A_RISQUE via `findAllEnCours()`
  - Pour chaque tournée :
    - `EN_COURS` + estARisque → `signalerRisque()` → save
    - `A_RISQUE` + !estARisque → `normaliserStatut()` → save
    - Aucun changement → aucune action
  - Broadcast WebSocket **une seule fois** si au moins un changement (évite les floods)

### Infrastructure Layer

- `SupervisionConfig` : @Configuration qui déclare le bean `RisqueDetector`
  - `@Value("${supervision.risque.seuil-inactivite-min:30}")` — configurable dans application.yml
- `RisqueDetectorScheduler` : @Component @Scheduled
  - `fixedDelay = 60_000`, `initialDelay = 60_000` (attend que le DevDataSeeder se termine)
  - Appelle `DetecterTourneesARisqueHandler.detecter()`
  - `@EnableScheduling` déjà présent sur `SvcSupervisionApplication`

### Interface Layer

Pas de nouvel endpoint — la mise à jour est poussée via WebSocket (topic `/topic/tableau-de-bord`).

### Frontend

Modifications de `TableauDeBordPage.tsx` :
- `jouerAlerteAudio()` : fonction exportée générant un bip 880Hz/200ms via Web Audio API
  (silencieuse si AudioContext absent — tests Node.js)
- Prop `alerteFn` injectable (défaut = `jouerAlerteAudio`) pour les tests
- `useRef prevARisqueRef` + `useEffect` : déclenche `alerteFn()` une seule fois quand `aRisque` augmente
- `BandeauResume` : affiche un point rouge clignotant (`data-testid="point-alerte"`) si `aRisque > 0`
- `LigneTournee` : background `#fff3e0` + bordure gauche orange pour les lignes A_RISQUE

### Erreurs / invariants préservés

- Une tournée CLOTUREE n'est jamais mise à risque (invariant US-013)
- L'alerte sonore se déclenche une seule fois par apparition (useRef compare avant/après)
- Le broadcast WebSocket n'est émis que si un changement a eu lieu (évite les mises à jour inutiles)
- Le scheduler attend 60s au démarrage pour ne pas évaluer les données avant que le seeder soit prêt

## Tests

### Backend (svc-supervision)

| Fichier | Tests | Résultat |
|---------|-------|----------|
| `RisqueDetectorTest.java` | 6 tests (inactivité > seuil, < seuil, 100%, CLOTUREE, A_RISQUE continue, activite null) | Verts |
| `DetecterTourneesARisqueHandlerTest.java` | 5 tests (EN_COURS→A_RISQUE, A_RISQUE→EN_COURS, EN_COURS sans risque, A_RISQUE stable, broadcast 1×) | Verts |

Total svc-supervision après US-013 : **21/21 tests verts**

### Frontend (supervision-web)

| Fichier | Tests | Résultat |
|---------|-------|----------|
| `TableauDeBordPage.test.tsx` | 4 tests US-013 (point alerte visible, point invisible si 0, alerte sonore via WebSocket, surbrillance ligne) | Verts |

Total frontend supervision : **24/24 tests verts** (20 US-010/011/012 + 4 US-013)

## Commandes de lancement

```bash
# Backend (svc-supervision)
cd src/backend/svc-supervision
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn spring-boot:run -Dspring-boot.run.profiles=dev
# La détection démarre automatiquement après 60s

# Configurer le seuil (optionnel, default 30 min)
# supervision.risque.seuil-inactivite-min=5 (pour les tests manuels rapides)

# Tests backend
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn test

# Tests frontend
cd src/web/supervision
npm test -- --watchAll=false
```
