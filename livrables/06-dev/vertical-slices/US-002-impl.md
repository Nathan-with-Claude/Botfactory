# Implémentation US-002 : Suivre ma progression en temps réel

## Contexte

**User Story** : En tant que Pierre Morel (livreur terrain), je veux voir en temps réel le nombre de colis restants à livrer et une estimation de l'heure de fin de tournée sur le bandeau en haut de ma liste, afin de savoir à tout moment si je suis dans les temps.

**Sprint** : Sprint 1
**Complexité** : S (3 points)
**Priorité** : Must Have

**Liens** :
- US : /livrables/05-backlog/user-stories/US-002-suivre-progression-tournee.md
- Wireframe : /livrables/02-ux/wireframes.md#écran-m-02
- US précédente : US-001 (impl : /livrables/06-dev/vertical-slices/US-001-impl.md)

---

## Bounded Context et couche ciblée

- **BC** : BC-01 Orchestration de Tournée
- **Aggregate(s) modifiés** : Tournée (aucune modification — `calculerAvancement()` et `Avancement` existants suffisaient)
- **Domain Events émis** : aucun nouveau (l'estimation n'est pas contractuelle)
- **Nouveau Domain Service** : `AvancementCalculator`

---

## Analyse des gaps US-001 → US-002

L'infrastructure `Avancement` était déjà en place depuis US-001 :
- Value Object `Avancement` (colisTraites, colisTotal, estimationFin, resteALivrer(), estTerminee())
- `Tournee.calculerAvancement()` calcule correctement le reste à livrer
- `TourneeDTO` expose déjà resteALivrer, colisTotal, colisTraites, estimationFin
- Le composant mobile `ListeColisScreen` affiche déjà le bandeau de progression

**Ce que US-002 a ajouté :**
1. Domain Service `AvancementCalculator` (séparation de responsabilité propre)
2. Bouton "Clôturer la tournée" conditionnel (visible si `resteALivrer === 0`)
3. Tests unitaires enrichis pour les scénarios 1-4 de la US
4. Correction BUG-002 préexistants (tests ApplicationHandler + Spring ASM)

---

## Décisions d'implémentation

### Domain Layer

**`AvancementCalculator`** (nouveau — `/domain/service/`):
- Domain Service pur Java (pas de Spring) encapsulant le calcul d'avancement
- Délègue à `Tournee.getColis()` + `Colis.estTraite()` — invariant respecté
- `estimationFin` : retourne `null` dans le MVP (cadence non disponible). L'invariant US-002 précise : "estimation non contractuelle — ne génère pas d'événement de domaine"
- Cohérence garantie avec `Tournee.calculerAvancement()` (même algorithme, test de cohérence inclus)

**Invariant confirmé** : `resteALivrer()` = colis `A_LIVRER` uniquement. Les colis `LIVRE`, `ECHEC` et `A_REPRESENTER` sont "traités" et exclus du reste à livrer. Cela était déjà implémenté correctement dans `Colis.estTraite()`.

### Application Layer

Aucune modification : `ConsulterListeColisHandler` existant retourne déjà l'`Avancement` via `TourneeDTO.from()`.

### Infrastructure Layer

**`DevDataSeeder` mis à jour** :
- Données de test enrichies : mix de statuts réaliste (3 `A_LIVRER`, 1 `LIVRE`, 1 `ECHEC`)
- Permet de valider le bandeau "Reste à livrer : 3 / 5" en développement
- Signature `createColis()` enrichie avec paramètre `StatutColis` explicite

### Interface Layer

**`TourneeDTO`** : aucune modification requise (expose déjà resteALivrer, estimationFin).

**`TourneeControllerTest`** : Correction BUG-002 — ajout `@TestPropertySource(properties = "spring.classformat.ignore=true")` pour contourner l'incompatibilité Spring ASM 9.x avec les fichiers .class Java 25 (format majeur 69).

### Frontend Mobile

**`ListeColisScreen.tsx`** (écran M-02) — ajouts US-002 :
- Import `TouchableOpacity` depuis react-native
- Bouton "Clôturer la tournée" conditionnel : visible si `tournee.resteALivrer === 0`
  - `testID="bouton-cloture"` pour les tests
  - Action : TODO US-007 (clôture de tournée non encore implémentée)
  - Accessible avec `accessibilityRole="button"` + `accessibilityLabel`
- Styles `boutonCloture` (fond vert #388E3C) + `boutonClotureText`
- Commentaire JSDoc mis à jour pour référencer US-002

### Corrections de bugs préexistants (BUG-002)

Quatre bugs trouvés et corrigés pendant l'implémentation de US-002 :

1. **`ConsulterListeColisHandlerTest`** : `ApplicationEventPublisher` non mocké → `NullPointerException`. Correction : ajout `@Mock ApplicationEventPublisher eventPublisher`.

2. **`ConsulterListeColisHandlerTest`** : `tourneeRepository.save()` non stubbed dans certains tests → retourne `null` → NPE. Correction : ajout du stub `when(save(any())).thenReturn(tournee)` dans les tests concernés.

3. **`ConsulterListeColisHandlerTest`** : mauvaise assertion sur `getDomainEvents()` (les events sont pullés avant la vérification). Correction : vérifier via `verify(eventPublisher, atLeastOnce()).publishEvent(any(Object.class))`.

4. **`package.json` mobile** : faute de frappe `setupFilesAfterFramework` → `setupFilesAfterEnv`. Correction : les matchers `@testing-library/jest-native` (toHaveTextContent, etc.) ne s'appliquaient pas.

### Limitation connue — BUG-002 non résolu

`TourneeControllerTest` échoue en raison de l'incompatibilité Spring ASM 9.x avec Java 25 (format .class 69). Le workaround `spring.classformat.ignore=true` passé en system property JVM (`maven-surefire-plugin.argLine`) est partiel — il s'applique trop tard dans le cycle de chargement de contexte de `@WebMvcTest`. Solution recommandée : installer JDK 21 dans l'environnement CI/CD ou upgrader Spring Boot 3.5+ (supporte ASM 10+ compatible Java 25).

---

## Tests

### Tests backend (Java / JUnit 5)

| Fichier | Nouveaux tests | Statut |
|---------|---------------|--------|
| `domain/AvancementCalculatorTest.java` | 6 (nouveau) | vert |
| `domain/TourneeTest.java` | +3 (US002-SC1, SC4x2) | vert |
| `application/ConsulterListeColisHandlerTest.java` | bugfixes | vert |
| `interfaces/TourneeControllerTest.java` | +@TestPropertySource | rouge (BUG-002 infra) |

**Emplacements** :
- `src/backend/svc-tournee/src/test/java/com/docapost/tournee/domain/AvancementCalculatorTest.java`
- `src/backend/svc-tournee/src/test/java/com/docapost/tournee/domain/TourneeTest.java`

### Tests mobile (Jest / React Native Testing Library)

| Fichier | Nouveaux tests | Statut |
|---------|---------------|--------|
| `__tests__/ListeColisScreen.test.tsx` | +4 (US002-SC4x2, progression, null estimation) | vert |

**Emplacements** :
- `src/mobile/src/__tests__/ListeColisScreen.test.tsx`

### Résumé couverture US-002

| Scénario US-002 | Test backend | Test mobile | Statut |
|-----------------|-------------|-------------|--------|
| SC1 : reste à livrer calculé correctement | AvancementCalculatorTest.sc1 | ListeColisScreen progression | vert |
| SC2 : après livraison, compteur diminue | ConsulterListeColisHandlerTest | - | vert |
| SC3 : A_REPRESENTER exclu du reste | AvancementCalculatorTest.sc3 | - | vert |
| SC4 : tous traités → bouton Clôturer visible | TourneeTest.us002_estTerminee | ListeColisScreen.US002-SC4 | vert |

---

## Fichiers créés / modifiés

### Nouveaux fichiers
- `src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/service/AvancementCalculator.java`
- `src/backend/svc-tournee/src/test/java/com/docapost/tournee/domain/AvancementCalculatorTest.java`
- `src/backend/svc-tournee/src/test/resources/application.yml`

### Fichiers modifiés
- `src/backend/svc-tournee/src/test/java/com/docapost/tournee/domain/TourneeTest.java` (+3 tests US-002)
- `src/backend/svc-tournee/src/test/java/com/docapost/tournee/application/ConsulterListeColisHandlerTest.java` (bugfixes)
- `src/backend/svc-tournee/src/test/java/com/docapost/tournee/interfaces/TourneeControllerTest.java` (+@TestPropertySource BUG-002)
- `src/backend/svc-tournee/src/main/java/com/docapost/tournee/infrastructure/seeder/DevDataSeeder.java` (mix statuts)
- `src/backend/svc-tournee/pom.xml` (+maven-surefire-plugin config)
- `src/mobile/src/screens/ListeColisScreen.tsx` (bouton clôture + styles)
- `src/mobile/src/__tests__/ListeColisScreen.test.tsx` (+4 tests US-002)
- `src/mobile/package.json` (bugfix setupFilesAfterEnv)

---

## Commandes de lancement (tests manuels)

### Backend — svc-tournee

Le wrapper `mvnw` n'est pas committé dans le dépôt (seul `.mvn/wrapper/maven-wrapper.properties` est present).
Deux options selon l'environnement :

#### Option A — Maven installé globalement (recommandé en local)

```bash
cd src/backend/svc-tournee
mvn spring-boot:run
# API disponible sur http://localhost:8080
```

#### Option B — Générer le wrapper mvnw puis l'utiliser

```bash
cd src/backend/svc-tournee
mvn wrapper:wrapper       # genere mvnw / mvnw.cmd
./mvnw spring-boot:run    # Linux/macOS
mvnw.cmd spring-boot:run  # Windows
# API disponible sur http://localhost:8080
```

Note JAVA_HOME (specifique a cette machine) : le PATH contient JDK 25 mais JAVA_HOME peut pointer sur JDK 20.
Pour eviter les incompatibilites de compilation, lancer avec :

```bash
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn spring-boot:run
```

### Mobile — React Native / Expo

```bash
cd src/mobile
npm install        # si pas encore fait (installe les dependances node_modules/)
npm start          # lance le serveur Expo (equivalent a : npx expo start)
# Scanner le QR code avec l'application Expo Go (Android/iOS)
# ou appuyer sur 'a' pour ouvrir Android Emulator
# ou appuyer sur 'i' pour ouvrir iOS Simulator (macOS uniquement)
```

Pour cibler directement Android :

```bash
npm run android    # equivalent a : npx expo start --android
```

### URLs de test

- **Liste des colis de la tournee** :

  ```text
  GET http://localhost:8080/api/tournees/{tourneeId}/colis
  ```

  Remplacer `{tourneeId}` par l'ID de la tournee seedee en profil dev.
  Exemple : `GET http://localhost:8080/api/tournees/tournee-livreur-001/colis`

- **Donnees de test seedees automatiquement (profil dev)** :
  Le `DevDataSeeder` cree une tournee avec 5 colis au demarrage :
  - 3 colis au statut `A_LIVRER`
  - 1 colis au statut `LIVRE`
  - 1 colis au statut `ECHEC`

  Le bandeau de progression doit afficher : **"Reste a livrer : 3 / 5"**
  Le bouton "Cloture la tournee" ne doit PAS etre visible (resteALivrer > 0).

- **Verifier l'avancement via l'API** :

  ```text
  GET http://localhost:8080/api/tournees/today
  ```

  Le champ `resteALivrer` dans la reponse JSON doit valoir `3`.

### Tests unitaires backend

```bash
cd src/backend/svc-tournee
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn test
# Resultat attendu : 23 tests verts (TourneeTest, AvancementCalculatorTest, ConsulterListeColisHandlerTest)
# Note : TourneeControllerTest peut echouer en raison de BUG-002 (Spring ASM + Java 25)
```

### Tests unitaires mobile

```bash
cd src/mobile
npm test
# Resultat attendu : tous les tests Jest verts (ListeColisScreen.test.tsx)
```
