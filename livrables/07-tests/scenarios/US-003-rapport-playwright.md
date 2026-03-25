# Rapport de tests — US-003 : Filtrer et organiser les colis par zone géographique

**Agent** : @qa
**Date d'exécution** : 2026-03-23
**Version** : 2.0 (mise à jour avec résultats E2E réels)
**US** : US-003 — Filtrer et organiser mes colis par zone géographique

---

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|----------------|-------|-------|---------|
| Domain — filtreZone.ts | Jest (Node pur) | 12/12 | PASS |
| Composant — FiltreZone + ListeColisScreen | Jest / RNTL | 9/9 | PASS |
| Non régression US-001+002 — ListeColisScreen | Jest / RNTL | 13/13 | PASS |
| Backend Spring Boot | Maven / JUnit 5 | 23/23 | PASS |
| **Total automatisé (Jest + mvn)** | | **57/57** | **PASS** |
| E2E Playwright TC-070 à TC-073 + API (19 tests) | Playwright / Chromium | 19/19 | **PASS** |
| **TOTAL GÉNÉRAL** | | **76/76** | **PASS** |

**Verdict US-003** : Validée sur toutes les couches — Domain, Application, Interface, Infrastructure et E2E.

---

## Résultats détaillés — Tests automatisés Jest

### Suite 1 : Domain Layer — filtreZone.domain.test.ts

**Commande** : `cd src/mobile && npx jest --testPathPattern="filtreZone.domain"`
**Durée** : ~3 s
**Résultat** : 12/12 PASS

| Test | Statut |
|------|--------|
| extraireZonesDisponibles — extrait les zones distinctes triées alphabétiquement | PASS |
| extraireZonesDisponibles — exclut les colis dont zoneGeographique est null | PASS |
| extraireZonesDisponibles — exclut les colis dont zoneGeographique est une chaîne vide | PASS |
| extraireZonesDisponibles — retourne une liste vide si aucun colis n'a de zone | PASS |
| extraireZonesDisponibles — retourne une liste vide si la liste de colis est vide | PASS |
| extraireZonesDisponibles — retourne une seule zone si tous les colis sont dans la même zone | PASS |
| filtrerColisByZone — retourne tous les colis si le filtre est ZONE_TOUS | PASS |
| filtrerColisByZone — filtre uniquement les colis de Zone A | PASS |
| filtrerColisByZone — filtre uniquement les colis de Zone B | PASS |
| filtrerColisByZone — retourne une liste vide si aucun colis ne correspond à la zone | PASS |
| filtrerColisByZone — ne modifie pas les objets colis (références intactes) | PASS |
| filtrerColisByZone — n'inclut pas les colis sans zone dans les résultats filtrés par zone | PASS |

**Couverture des invariants DDD** :
- Filtrage sans mutation des Aggregates : VERIFIE
- Aucun Domain Event émis lors du filtrage : VERIFIE (fonctions pures, pas d'appel API)
- Colis sans zone exclus des onglets : VERIFIE
- ZONE_TOUS retourne la référence directe (pas de copie) : VERIFIE

---

### Suite 2 : Interface Layer — FiltreZone.test.tsx

**Commande** : `cd src/mobile && npx jest --testPathPattern="FiltreZone.test"`
**Durée** : ~3 s
**Résultat** : 9/9 PASS

| Test | Scénario US | Statut |
|------|------------|--------|
| affiche les onglets de zone disponibles dans la tournée | Prérequis | PASS |
| l'onglet "Tous" est actif par défaut | Prérequis + Invariant | PASS |
| SC1 — filtre la liste et affiche uniquement les 8 colis de Zone A | SC1 | PASS |
| SC1 — le bandeau "Reste à livrer" reste basé sur toute la tournée, pas sur le filtre | SC1 Invariant critique | PASS |
| SC1 — le filtrage est instantané (aucun rechargement API) | SC1 Performance | PASS |
| SC2 — l'onglet "Tous" restaure la liste complète après un filtre | SC2 | PASS |
| SC2 — après retour sur "Tous", les statuts mis à jour restent visibles | SC2 Non régression | PASS |
| SC3 — une zone dont tous les colis sont traités affiche ces colis avec leur statut terminal | SC3 | PASS |
| n'affiche pas la barre d'onglets si aucun colis n'a de zone définie | Edge case | PASS |

**Couverture des critères d'acceptation Gherkin** :
- SC1 (Filtrage par zone) : 3/3 critères vérifiés
- SC2 (Retour vue complète) : 2/2 critères vérifiés
- SC3 (Zone sans colis restants) : 1/1 critère vérifié

---

### Suite 3 : Non régression — ListeColisScreen.test.tsx

**Commande** : `cd src/mobile && npx jest --testPathPattern="ListeColisScreen"`
**Résultat** : 13/13 PASS

Aucune régression détectée sur US-001 et US-002 après les modifications de `ListeColisScreen` pour US-003.

---

### Suite 4 : Backend Spring Boot

**Commande** : `cd src/backend/svc-tournee && mvn test`
**JDK** : 20.0.2
**Durée** : 7 s
**Résultat** : 23/23 PASS — BUILD SUCCESS

| Classe de test | Tests | Résultat |
|---------------|-------|---------|
| TourneeTest | 7 | PASS |
| ConsulterListeColisHandlerTest | 11 | PASS |
| TourneeControllerTest | 5 | PASS |

Le backend n'a pas été modifié pour US-003 — ce résultat confirme l'absence de régression.

---

## Résultats E2E Playwright — Exécutés le 2026-03-23

**Fichier spec** : `src/mobile/e2e/US-003-filtrer-colis-par-zone.spec.ts`
**Commande** : `npx playwright test src/mobile/e2e/US-003-filtrer-colis-par-zone.spec.ts --project=chromium`
**Infrastructure** : Backend Spring Boot port 8081 (profil dev) + Expo Web port 8082
**Durée totale** : 18,4 s
**Résultat global** : **19/19 PASS**

### Protocole d'exécution

```bash
# Étape 1 — Tuer les processus existants
taskkill //F //IM java.exe 2>/dev/null || true
taskkill //F //IM node.exe 2>/dev/null || true
sleep 3

# Étape 2 — Démarrer le backend Spring Boot (port 8081, profil dev)
cd c:/Github/Botfactory/src/backend/svc-tournee
JAVA_HOME="C:/Program Files/Java/jdk-20" \
  mvn clean spring-boot:run -Dspring-boot.run.profiles=dev > /tmp/backend-us003.log 2>&1 &

# Étape 3 — Health check backend
# → Backend OK après 4x2s

# Étape 4 — Démarrer Expo Web (port 8082)
cd c:/Github/Botfactory/src/mobile
EXPO_PUBLIC_API_URL=http://localhost:8081 npx expo start --web --port 8082 > /tmp/expo-us003.log 2>&1 &
# → Expo Web OK après 1x3s

# Étape 5 — Lancer les tests
npx playwright test src/mobile/e2e/US-003-filtrer-colis-par-zone.spec.ts --project=chromium
```

### Résultats détaillés

#### TC-070 — Barre d'onglets affichée au chargement de l'écran M-02

| Test | Résultat | Durée |
|------|---------|-------|
| TC-070a : Les onglets [Tous][Zone A][Zone B][Zone C] sont visibles | PASS | 995ms |
| TC-070b : L'onglet "Tous" est actif par défaut (fond bleu #1565C0) | PASS | 857ms |
| TC-070c : Les 5 colis sont tous visibles avec l'onglet "Tous" actif | PASS | 815ms |

**Screenshot** : `livrables/07-tests/screenshots/US-003/TC-070-vue-tous.png`

#### TC-071 — SC1 : Filtrage par Zone A réduit la liste sans affecter le bandeau

| Test | Résultat | Durée |
|------|---------|-------|
| TC-071a : Cliquer sur Zone A affiche 2 colis | PASS | 1,1s |
| TC-071b : Le bandeau "Reste a livrer : 3 / 5" reste inchangé (invariant domaine) | PASS | 1,1s |
| TC-071c : Zone B affiche 2 colis sans appel réseau supplémentaire (invariant perf) | PASS | 1,1s |
| TC-071d : L'onglet Zone A devient actif (fond bleu) après clic | PASS | 1,2s |

**Screenshot** : `livrables/07-tests/screenshots/US-003/TC-071-filtre-zone-a.png`

#### TC-072 — SC2 : Retour à la vue complète depuis un filtre zone

| Test | Résultat | Durée |
|------|---------|-------|
| TC-072a : Cliquer sur "Tous" depuis Zone A restaure les 5 colis | PASS | 1,5s |
| TC-072b : Les statuts terminaux (Livre, Echec) restent visibles après retour | PASS | 1,5s |
| TC-072c : L'onglet "Tous" reprend le fond bleu après retour | PASS | 1,5s |

**Screenshot** : `livrables/07-tests/screenshots/US-003/TC-072-retour-tous.png`

#### TC-073 — SC3 : Zone entièrement traitée affiche les statuts terminaux

| Test | Résultat | Durée |
|------|---------|-------|
| TC-073a : Zone C affiche 1 colis (colis-dev-004 — LIVRE) | PASS | 1,1s |
| TC-073b : Le colis de Zone C a un statut terminal "Livre" | PASS | 1,1s |
| TC-073c : Aucun colis "A livrer" n'apparaît dans Zone C | PASS | 1,1s |
| TC-073d : Le bandeau "Reste a livrer" affiche toujours 3/5 depuis Zone C (invariant domaine) | PASS | 1,1s |

**Screenshot** : `livrables/07-tests/screenshots/US-003/TC-073-zone-c-traitee.png`

#### Tests API backend directs

| Test | Résultat | Durée |
|------|---------|-------|
| API-US003-01 : La réponse contient des colis avec le champ zoneGeographique | PASS | 37ms |
| API-US003-02 : Les zones présentes sont Zone A, Zone B et Zone C (DevDataSeeder) | PASS | 17ms |
| API-US003-03 : Zone A contient 2 colis | PASS | 14ms |
| API-US003-04 : Zone B contient 2 colis | PASS | 13ms |
| API-US003-05 : Zone C contient 1 colis avec statut LIVRE | PASS | 15ms |

---

## Notes techniques E2E (Expo Web + Playwright)

- `testID="onglet-tous"` est en minuscules (FiltreZones.tsx ligne 52) — différent de la constante `ZONE_TOUS = 'TOUS'`.
- `accessibilityState.selected` n'est pas traduit en `aria-selected` par Expo Web — l'état actif est détecté via `backgroundColor: rgb(21, 101, 192)` (#1565C0).
- `testID="colis-item"` est partagé par tous les items (ColisItem.tsx ligne 44) — utiliser `.count()` pour vérifier le nombre.
- Le mock `page.route('**/api/tournees/today')` est utilisé pour garantir l'indépendance vis-à-vis de l'état en base de données tout en validant le comportement réel de l'application Expo Web.
- Les tests API directs (API-US003-01 à API-US003-05) utilisent le backend réel sans mock.

---

## Analyse de couverture des invariants DDD

| Invariant US-003 | Test couvrant | Vérifié |
|-----------------|--------------|---------|
| Le filtrage ne modifie pas le StatutColis | TC-055 (Jest) + TC-073b (E2E) | Oui |
| Aucun Domain Event n'est émis lors du filtrage | TC-061 (Jest) + TC-071c (E2E — 0 appel API) | Oui |
| L'onglet "Tous" est actif par défaut | TC-058 (Jest) + TC-070b (E2E fond bleu) | Oui |
| "Reste à livrer" = total tournée, pas zone filtrée | TC-060 (Jest) + TC-071b + TC-073d (E2E) | Oui |
| Le filtrage est instantané sans rechargement | TC-061 (Jest) + TC-071c (E2E < 300ms) | Oui |
| Un colis sans zone n'apparaît pas dans les onglets | TC-047, TC-056, TC-065 (Jest) | Oui |
| Un colis appartient à exactement une zone | TC-046 (Jest) + API-US003-03/04/05 | Oui |

---

## Anomalies détectées

Aucune anomalie fonctionnelle détectée. Une note d'adaptation technique :

**OBS-001** (non bloquant) : `accessibilityState.selected` de React Native n'est pas exposé en `aria-selected` dans le rendu Expo Web. Les tests E2E vérifient l'état actif via la couleur `backgroundColor`. Ce comportement est conforme à la documentation React Native / Expo Web et n'impacte pas l'accessibilité sur Android/iOS natif.

---

## Recommandations

1. L'US-003 est validée sur toutes les couches — aucune action corrective requise.
2. Inclure les 19 tests E2E dans le pipeline CI/CD une fois la configuration DevOps US en place.
3. **Amélioration future** (non bloquante) : afficher le nombre de colis par zone dans l'onglet (ex. "Zone A (2)").
4. **Amélioration future** (non bloquante) : mémoriser le filtre de zone actif lors de la navigation entre écrans.

---

## Rapport HTML Playwright

Disponible dans : `/livrables/07-tests/rapports/US-003-rapport/index.html`

Screenshots disponibles dans : `/livrables/07-tests/screenshots/US-003/`
- `TC-070-vue-tous.png` — Vue initiale avec onglet "Tous" actif et 5 colis
- `TC-071-filtre-zone-a.png` — Filtre Zone A actif (2 colis)
- `TC-072-retour-tous.png` — Retour sur "Tous" (5 colis)
- `TC-073-zone-c-traitee.png` — Zone C (1 colis avec statut terminal "Livre")
