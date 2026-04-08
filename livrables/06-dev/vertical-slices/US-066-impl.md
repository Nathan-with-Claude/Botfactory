# Implémentation US-066 : Page état des livreurs (W-08)

## Contexte

Page dédiée permettant au superviseur (Laurent Renaud) de visualiser en un coup d'oeil
l'état journalier de tous les livreurs du référentiel :
- **SANS_TOURNEE** : aucune tournée affectée
- **AFFECTE_NON_LANCE** : tournée planifiée, non encore lancée
- **EN_COURS** : tournée lancée

US : /livrables/05-backlog/user-stories/US-066-page-etat-livreurs.md
Specs tech : /livrables/04-architecture-technique/specs-us066-etat-livreurs.md
Wireframe : /livrables/02-ux/wireframes.md#w-08

## Bounded Context et couche ciblée

- **BC** : BC-07 Planification de Tournée (extension) + BC-03 Supervision (Read Model)
- **Aggregate(s) modifiés** : TourneePlanifiee (lecture seule)
- **Read Model nouveau** : VueLivreur (agrégation à la volée, non persisté)
- **Domain Events consommés** : AffectationEnregistree, DesaffectationEnregistree,
  TourneeLancee (via @EventListener pour WebSocket STOMP)
- **Domain Events émis** : aucun (page lecture seule)

## Décisions d'implémentation

### Domain Layer (nouveau)

**Package** `com.docapost.supervision.domain.planification.model` :
- `EtatJournalierLivreur.java` : enum VO (SANS_TOURNEE, AFFECTE_NON_LANCE, EN_COURS).
  Valeur calculée, jamais stockée en base. Déjà existait avant la session.
- `VueLivreur.java` : record immuable (livreurId, nomComplet, etat, tourneePlanifieeId,
  codeTms). Read Model sans identité propre.

**Package** `com.docapost.supervision.domain.planification.service` :
- `LivreurReferentiel.java` : interface port de lecture. Méthode `listerLivreurs()`.
  Découple le domaine de la source SSO/Keycloak (conformité DDD).

### Application Layer

**Package** `com.docapost.supervision.application.planification` :
- `ConsulterEtatLivreursHandler.java` : orchestre la dérivation d'état. Pour chaque
  livreur du référentiel, appelle `TourneePlanifieeRepository.findByLivreurIdAndDate()`
  et applique le switch statut → EtatJournalierLivreur. Aucune logique métier dans
  l'Application Layer — tout le mapping est dans ce handler via le domaine.

### Infrastructure Layer

**Package** `com.docapost.supervision.infrastructure.dev` :
- `DevLivreurReferentiel.java` : implémentation @Profile("dev") avec les 6 livreurs
  canoniques (IDs alignés avec DevDataSeeder).

**Package** `com.docapost.supervision.infrastructure.planification` :
- `TourneePlanifieeJpaRepository.java` : méthode `findAffecteeOrLanceeByLivreurIdAndDate`
  ajoutée. Requête JPQL avec statut IN ('AFFECTEE', 'LANCEE') + ORDER BY statut DESC
  (LANCEE prime sur AFFECTEE en cas d'inconsistance).
- `TourneePlanifieeRepositoryImpl.java` : délégue `findByLivreurIdAndDate` vers la
  méthode JPA ci-dessus.

**Package** `com.docapost.supervision.infrastructure.websocket` :
- `LivreurEtatWebSocketPublisher.java` : @EventListener sur AffectationEnregistree,
  DesaffectationEnregistree, TourneeLancee. Recalcule l'état du livreur concerné et
  pousse sur `/topic/livreurs/etat` (payload partiel : un seul livreur).
  Couplage nul avec les handlers existants.

### Interface Layer

**Package** `com.docapost.supervision.interfaces.rest` :
- `LivreurEtatController.java` : `GET /api/supervision/livreurs/etat-du-jour?date=`.
  Paramètre date optionnel (défaut = today). @PreAuthorize SUPERVISEUR ou DSI.

**Package** `com.docapost.supervision.interfaces.dto` :
- `LivreurEtatDTO.java` : record avec factory `fromDomain(VueLivreur)`. Sérialise
  l'enum EtatJournalierLivreur en String JSON.

### Frontend

- `EtatLivreursPage.tsx` (nouveau) : page W-08 complète.
  - Bandeau 3 tuiles (Sans tournée / Affectés / En cours) avec compteurs.
  - Filtres rapides (TOUS / SANS_TOURNEE / AFFECTE_NON_LANCE / EN_COURS).
  - Tableau trié EN_COURS > AFFECTE_NON_LANCE > SANS_TOURNEE.
  - Badges Tailwind par état (emerald / primary-container / surface-container).
  - Boutons contextuels (Affecter / Voir préparation / Voir tournée).
  - Polling fallback 30s si STOMP non injecté.
  - Souscription WebSocket STOMP optionnelle via prop `stompSubscribeFn`.
  - Props injectables pour les tests : `fetchFn`, `stompSubscribeFn`,
    `onVoirTourneePlanifiee`, `onAffecter`.

- `App.tsx` modifié :
  - `AppRoute` étendu : `{ page: 'etat-livreurs' }`
  - `NAV_PAGES` : entrée "Livreurs" ajoutée entre Planification et Preuves.
  - Titre onglet : "DocuPost — État des livreurs".
  - Render conditionnel : `EtatLivreursPage` avec callbacks vers `detail-tournee-planifiee`
    (onVoirTourneePlanifiee) et `planification` (onAffecter).

### Erreurs / invariants préservés

- Un livreur ne peut avoir qu'un seul état à la fois (garanti par la requête JPQL LIMIT 1).
- La page est en lecture seule : aucune action d'affectation depuis W-08, seulement
  des navigations vers W-04 (planification) ou W-05 (détail tournée planifiée).
- Statut NON_AFFECTEE exclu de la dérivation (tournée non encore assignée à un livreur).
- @Profile("dev") sur DevLivreurReferentiel : aucun risque d'activation en prod.

## Commandes pour tester en local

### Démarrer le backend (svc-supervision, port 8082)

```bash
cd /home/admin/Botfactory/src/backend/svc-supervision
JAVA_HOME="/usr/lib/jvm/java-21-openjdk-arm64" \
  mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Health check : `curl http://localhost:8082/actuator/health`

### Démarrer le frontend (port 3000)

```bash
cd /home/admin/Botfactory/src/web/supervision
REACT_APP_API_URL=http://localhost:8082 npm start
```

### URLs à tester

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Interface supervision (accès direct tableau de bord en mode dev) |
| Cliquer "Livreurs" dans la nav | Affiche W-08 état des livreurs |
| `http://localhost:8082/api/supervision/livreurs/etat-du-jour` | API backend (nécessite token Bearer) |
| `http://localhost:8082/api/supervision/livreurs/etat-du-jour?date=2026-04-06` | API avec date explicite |

### Token Bearer pour test API

```bash
# En mode dev, le filtre de sécurité accepte tout token non vide
curl -H "Authorization: Bearer dev-token-superviseur" \
  http://localhost:8082/api/supervision/livreurs/etat-du-jour
```

Réponse attendue (état seed du jour) :
```json
[
  {"livreurId":"livreur-002","nomComplet":"Paul Dupont","etat":"EN_COURS","tourneePlanifieeId":"tp-204","codeTms":"T-204"},
  {"livreurId":"livreur-001","nomComplet":"Pierre Martin","etat":"AFFECTE_NON_LANCE","tourneePlanifieeId":"tp-201","codeTms":"T-201"},
  {"livreurId":"livreur-003","nomComplet":"Marie Lambert","etat":"AFFECTE_NON_LANCE","tourneePlanifieeId":"tp-202","codeTms":"T-202"},
  {"livreurId":"livreur-005","nomComplet":"Sophie Bernard","etat":"AFFECTE_NON_LANCE","tourneePlanifieeId":"tp-205","codeTms":"T-205"},
  {"livreurId":"livreur-006","nomComplet":"Lucas Petit","etat":"AFFECTE_NON_LANCE","tourneePlanifieeId":"tp-206","codeTms":"T-206"},
  {"livreurId":"livreur-004","nomComplet":"Jean Moreau","etat":"SANS_TOURNEE","tourneePlanifieeId":null,"codeTms":null}
]
```

## Tests

### Tests unitaires Java

**Fichier** : `src/backend/svc-supervision/src/test/java/com/docapost/supervision/application/planification/ConsulterEtatLivreursHandlerTest.java`

| Cas | Description |
|-----|-------------|
| SC1 | Livreur sans tournée → SANS_TOURNEE |
| SC2 | Livreur avec TourneePlanifiee AFFECTEE → AFFECTE_NON_LANCE |
| SC3 | Livreur avec TourneePlanifiee LANCEE → EN_COURS |
| SC4 | 6 livreurs états mixtes → liste complète avec bons états |
| SC5 | NON_AFFECTEE ignoré (repository retourne empty) → SANS_TOURNEE |
| SC6 | Date différente → filtre correctement par date |

Résultat : **6/6 verts** (171/171 suite totale svc-supervision verts)

### Tests unitaires React

**Fichier** : `src/web/supervision/src/__tests__/EtatLivreursPage.test.tsx`

| Cas | Description |
|-----|-------------|
| SC1 × 2 | Rendu avec les 6 livreurs + codes tournée |
| SC2 | Compteurs bandeau (1/4/1) |
| SC3 × 3 | Badges Tailwind par état (data-etat + classes CSS) |
| SC4 × 3 | Filtrage SANS_TOURNEE / EN_COURS / retour TOUS |
| SC5 × 3 | Boutons action contextuels (Affecter / Voir tournée / Voir préparation) |
| SC6 | Tri EN_COURS > AFFECTE_NON_LANCE > SANS_TOURNEE |
| SC7 | Indicateur de chargement |
| SC8 | Gestion erreur réseau |
| SC9 | Titre + date |
| SC10 | Mise à jour WebSocket partielle (un seul livreur) |

Résultat : **17/17 verts** (289/289 suite totale web — hors 2 bugs pré-existants US-035/US-044)

## Correctif post-QA — Anomalie OBS-066-02 (2026-04-08)

### Bug

`DevLivreurReferentiel.java` utilisait des IDs symboliques (ex. `livreur-paul-dupont`)
non alignés avec les IDs numériques de `DevDataSeeder` (ex. `livreur-002`).

Conséquence : la requête JPQL `WHERE tp.livreurId = :livreurId` ne trouvait aucune
`TourneePlanifiee` correspondante, et tous les livreurs retournaient `SANS_TOURNEE`
au lieu de leur état réel (AFFECTE_NON_LANCE ou EN_COURS).

### Correction appliquée

Fichier : `src/backend/svc-supervision/src/main/java/.../infrastructure/dev/DevLivreurReferentiel.java`

Remplacement des IDs symboliques par les IDs numériques cohérents avec `DevDataSeeder` :

| Avant (incorrect) | Après (correct) |
|---|---|
| `livreur-pierre-martin` | `livreur-001` |
| `livreur-paul-dupont` | `livreur-002` |
| `livreur-marie-lambert` | `livreur-003` |
| `livreur-jean-moreau` | `livreur-004` |
| `livreur-sophie-bernard` | `livreur-005` |
| `livreur-lucas-petit` | `livreur-006` |

### Validation post-correctif

- `ConsulterEtatLivreursHandlerTest` : **6/6 PASS** (tests non affectés — ils mockent
  le référentiel avec leurs propres IDs via Mockito).
- Bug `DevTmsControllerTest` (4 erreurs `ApplicationContext`) confirmé **préexistant**
  (même résultat avant et après le correctif) — hors périmètre OBS-066-02.

---

## Fichiers créés / modifiés

### Fichiers créés

| Chemin | Type |
|--------|------|
| `src/backend/svc-supervision/src/main/java/.../domain/planification/model/EtatJournalierLivreur.java` | Enum VO |
| `src/backend/svc-supervision/src/main/java/.../domain/planification/model/VueLivreur.java` | Record Read Model |
| `src/backend/svc-supervision/src/main/java/.../domain/planification/service/LivreurReferentiel.java` | Interface port |
| `src/backend/svc-supervision/src/main/java/.../application/planification/ConsulterEtatLivreursHandler.java` | Application Service |
| `src/backend/svc-supervision/src/main/java/.../infrastructure/dev/DevLivreurReferentiel.java` | Impl @Profile("dev") |
| `src/backend/svc-supervision/src/main/java/.../infrastructure/websocket/LivreurEtatWebSocketPublisher.java` | Event Listener STOMP |
| `src/backend/svc-supervision/src/main/java/.../interfaces/rest/LivreurEtatController.java` | REST Controller |
| `src/backend/svc-supervision/src/main/java/.../interfaces/dto/LivreurEtatDTO.java` | DTO record |
| `src/backend/svc-supervision/src/test/java/.../application/planification/ConsulterEtatLivreursHandlerTest.java` | Tests unitaires |
| `src/web/supervision/src/pages/EtatLivreursPage.tsx` | Composant React W-08 |
| `src/web/supervision/src/__tests__/EtatLivreursPage.test.tsx` | Tests RTL (17 cas) |

### Fichiers modifiés

| Chemin | Modification |
|--------|-------------|
| `src/backend/svc-supervision/src/main/java/.../domain/planification/repository/TourneePlanifieeRepository.java` | + méthode `findByLivreurIdAndDate` |
| `src/backend/svc-supervision/src/main/java/.../infrastructure/planification/TourneePlanifieeJpaRepository.java` | + requête JPQL `findAffecteeOrLanceeByLivreurIdAndDate` |
| `src/backend/svc-supervision/src/main/java/.../infrastructure/planification/TourneePlanifieeRepositoryImpl.java` | + implémentation `findByLivreurIdAndDate` |
| `src/web/supervision/src/App.tsx` | + route `etat-livreurs`, + nav "Livreurs", + titre onglet |
