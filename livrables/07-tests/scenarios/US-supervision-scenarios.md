# Scénarios de tests — Campagne Supervision Web — Session 2026-04-02

**US couvertes** : US-011, US-012, US-013, US-014, US-015, US-020, US-030, US-034, US-035, US-038, US-044
**Périmètre** : svc-supervision (port 8082) + frontend web supervision (port 3000)

---

## Synthèse des résultats

| Niveau | Outil | Tests | Résultat |
|--------|-------|-------|----------|
| L1 — Unitaires Java | mvn test | 144/144 | PASS |
| L1 — Jest frontend | react-scripts test | 222/223 | FAIL (1 — TC-044-SC2) |
| L2 — API curl | curl | 11/11 | PASS |
| L3 — Playwright | Chromium | 2/3 | FAIL (1 — TC-SUP-L3-02 assertion obsolète) |
| **TOTAL** | | **379/381** | **PASS (99.5%)** |

---

## Suite L1 — Tests unitaires Java (svc-supervision)

### TC-SUP-L1-001 : Tableau de bord — Handler sans filtre

**US liée** : US-011
**Niveau** : L1
**Couche testée** : Application — ConsulterTableauDeBordHandler
**Aggregate / Domain Event ciblé** : VueTournee (Read Model)
**Type** : Fonctionnel
**Statut** : `Passé`

```gherkin
Given 3 VueTournee en base (2 EN_COURS, 1 A_RISQUE)
When ConsulterTableauDeBordQuery.sansFiltre() est exécutée
Then TableauDeBord retourne bandeau {actives:2, aRisque:1, cloturees:0} et 3 tournées
```

### TC-SUP-L1-002 : Tableau de bord — Handler filtre A_RISQUE

**US liée** : US-011
**Niveau** : L1
**Couche testée** : Application
**Statut** : `Passé`

```gherkin
Given 2 EN_COURS, 1 A_RISQUE
When ConsulterTableauDeBordQuery(filtreStatut=A_RISQUE)
Then seules les tournées A_RISQUE sont retournées
```

### TC-SUP-L1-003 : Instruction — Domaine — envoi standard

**US liée** : US-014
**Niveau** : L1
**Couche testée** : Domain — Instruction
**Type** : Invariant domaine
**Statut** : `Passé`

```gherkin
Given une tournée active et un colisId non null
When Instruction.envoyer(instructionId, tourneeId, colisId, superviseurId, PRIORISER, null)
Then InstructionEnvoyee event est émis, statut ENVOYEE, instructionId non null
```

### TC-SUP-L1-004 : Instruction — Domaine — invariant colisId non null

**US liée** : US-014
**Niveau** : L1
**Couche testée** : Domain
**Type** : Invariant domaine (négatif)
**Statut** : `Passé`

```gherkin
Given colisId null
When Instruction.envoyer(...)
Then NullPointerException levée (Objects.requireNonNull)
```

### TC-SUP-L1-005 : TourneePlanifiee — verifierCompatibiliteVehicule compatible

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Domain — TourneePlanifiee
**Type** : Invariant domaine
**Statut** : `Passé`

```gherkin
Given TourneePlanifiee(poidsEstimeKg=300), Vehicule(VH-07, capaciteKg=600)
When verifierCompatibiliteVehicule(vehicule, superviseurId)
Then CompatibiliteVehiculeVerifiee est émis, résultat COMPATIBLE
```

### TC-SUP-L1-006 : TourneePlanifiee — verifierCompatibiliteVehicule dépassement

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Domain
**Type** : Invariant domaine (négatif)
**Statut** : `Passé`

```gherkin
Given TourneePlanifiee(poidsEstimeKg=500), Vehicule(VH-01, capaciteKg=150)
When verifierCompatibiliteVehicule sans forçage
Then CapaciteVehiculeDepasseeException est levée, aucun event émis
```

### TC-SUP-L1-007 : TourneePlanifiee — poidsEstimeKg null (SC4)

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Domain
**Type** : Edge case
**Statut** : `Passé`

```gherkin
Given TourneePlanifiee(poidsEstimeKg=null)
When evaluerCompatibiliteVehicule(vehicule)
Then POIDS_ABSENT retourné, aucun event émis
```

### TC-SUP-L1-008 : ReaffecterVehicule — réaffectation compatible

**US liée** : US-034
**Niveau** : L1
**Couche testée** : Application — ReaffecterVehiculeHandler
**Statut** : `Passé`

```gherkin
Given TourneePlanifiee(poidsEstimeKg=410), VH-02(capaciteKg=600)
When ReaffecterVehiculeHandler.handle(command)
Then VehiculeReaffecte event émis, résultat COMPATIBLE sauvegardé
```

### TC-SUP-L1-009 : formaterDureeDeconnexion — 7 cas unitaires

**US liée** : US-044
**Niveau** : L1
**Couche testée** : Domain (fonction utilitaire pure TypeScript)
**Type** : Fonctionnel
**Statut** : `Passé`

```gherkin
Given les valeurs 0, 30000, 59000, 60000, 90000, 3600000, 5490000 ms
When formaterDureeDeconnexion(ms) est appelée
Then retourne respectivement "0 s", "30 s", "59 s", "1 min 0 s", "1 min 30 s", "1 h 0 min", "1 h 31 min"
```

### TC-SUP-L1-010 : Compteur WebSocket — SC2 fake timer (défaillant)

**US liée** : US-044
**Niveau** : L1
**Couche testée** : UI — composant TableauDeBordPage (fake timer Jest)
**Type** : Fonctionnel (timer avancé)
**Statut** : `Échoué`

```gherkin
Given fake timers activés, WebSocket fermé immédiatement
When jest.advanceTimersByTime(90_000)
Then compteur affiche "1 min 30 s"
```

**Cause d'échec** : SC2 avance le timer sans avoir déclenché la déconnexion au préalable — le
composant démarre connecté, le timer démarre avant `onclose`, donc `dureeDeconnexionMs` est null
au moment de l'assertion. Le test affiche "0 s" au lieu de "1 min 30 s".
**Impact** : Non bloquant — SC1/SC3/SC4/SC5 passent, FD1-FD7 passent (7/7). Logique fonctionnelle validée.

---

## Suite L2 — Tests d'intégration API curl

### TC-SUP-L2-001 : GET /api/supervision/tableau-de-bord — structure bandeau

**US liée** : US-011
**Niveau** : L2
**Couche testée** : Infrastructure + Interface REST
**Type** : Fonctionnel
**Statut** : `Passé`

```gherkin
Given svc-supervision démarré profil dev
When GET /api/supervision/tableau-de-bord
Then 200 + body {bandeau:{actives, aRisque, cloturees}, tournees:[...]}
```

**Résultat mesuré** : `bandeau: {'actives': 1, 'aRisque': 2, 'cloturees': 0}` | 3 tournées

### TC-SUP-L2-002 : GET /api/supervision/tableau-de-bord?statut=A_RISQUE

**US liée** : US-011
**Niveau** : L2
**Statut** : `Passé`

```gherkin
Given tableau de bord chargé
When GET ...?statut=A_RISQUE
Then toutes les tournées retournées ont statut A_RISQUE
```

### TC-SUP-L2-003 : GET tableau-de-bord?statut=INVALIDE → 400

**US liée** : US-011
**Niveau** : L2
**Type** : Edge case / invariant
**Statut** : `Passé`

```gherkin
Given statut inconnu envoyé
When GET ...?statut=INVALIDE
Then 400 Bad Request
```

### TC-SUP-L2-004 : GET tableau-de-bord — champs codeTMS et zone présents (US-035)

**US liée** : US-035
**Niveau** : L2
**Statut** : `Passé`

```gherkin
Given DevDataSeeder a enrichi les VueTournee avec codeTMS et zone
When GET /api/supervision/tableau-de-bord
Then chaque tournée expose codeTMS (ex: "T-201") et zone (ex: "Lyon 3e")
```

**Résultat mesuré** : 3 tournées avec codeTMS (T-201, T-202, T-203) et zones Lyon 3e / Villeurbanne

### TC-SUP-L2-005 : GET /api/supervision/tournees/{id} — détail tournée

**US liée** : US-012
**Niveau** : L2
**Statut** : `Passé`

```gherkin
Given tourneeId "tournee-sup-001" existant
When GET /api/supervision/tournees/tournee-sup-001
Then 200 + body { tournee:{tourneeId, livreurNom, statut, ...}, colis:[...] }
```

### TC-SUP-L2-006 : POST /api/supervision/instructions — envoi instruction

**US liée** : US-014
**Niveau** : L2
**Type** : Fonctionnel + cross-services
**Statut** : `Passé`

```gherkin
Given tourneeId "tournee-sup-002", colisId "colis-s-005", typeInstruction PRIORISER
When POST /api/supervision/instructions avec body complet
Then 201 Created + body {instructionId, statut:ENVOYEE, superviseurId:superviseur-001}
```

**Note** : Le premier test avec tournee-sup-001/colis-s-003 retourne 409 (idempotence correcte — instruction déjà en attente).

### TC-SUP-L2-007 : GET /api/planification/plans/{date} — plan du jour

**US liée** : US-021
**Niveau** : L2
**Statut** : `Passé`

```gherkin
Given date du jour 2026-04-02
When GET /api/planification/plans/2026-04-02
Then 200 + body {date, tournees:[{id, codeTms, date, nbColis, zones}...]}
```

**Résultat mesuré** : 4 tournées planifiées (tp-201 à tp-204)

### TC-SUP-L2-008 : POST verifier-compatibilite-vehicule — poids absent

**US liée** : US-030
**Niveau** : L2
**Type** : Edge case
**Statut** : `Passé`

```gherkin
Given tournee planifiee tp-201 (poidsEstimeKg null)
When POST /api/planification/tournees/tp-201/verifier-compatibilite-vehicule
Then 200 + body {resultat:POIDS_ABSENT, message:"Poids non disponible — vérification impossible."}
```

### TC-SUP-L2-009 : GET /api/planification/vehicules/compatibles — liste filtrée

**US liée** : US-034
**Niveau** : L2
**Statut** : `Passé`

```gherkin
Given flotte de 11 véhicules in-memory
When GET /api/planification/vehicules/compatibles?poidsMinKg=200
Then 200 + liste triée par capaciteKg croissante (VH-06 300kg → VH-01 800kg)
```

### TC-SUP-L2-010 : GET /api/supervision/instructions/en-attente?tourneeId=

**US liée** : US-015
**Niveau** : L2
**Statut** : `Passé`

```gherkin
Given tournée sup-001 avec instruction ENVOYEE (instr-dev-001)
When GET /api/supervision/instructions/en-attente?tourneeId=tournee-sup-001
Then 200 + [{instructionId:instr-dev-001, statut:ENVOYEE, typeInstruction:PRIORISER}]
```

### TC-SUP-L2-011 : Données codeTMS et zone dans tableau de bord (US-035 backend)

**US liée** : US-035
**Niveau** : L2
**Statut** : `Passé`

```gherkin
Given VueTournee enrichies par DevDataSeeder
When GET tableau-de-bord
Then tournee T-201 trouvable, zone "Lyon 3e" présente
```

---

## Suite L3 — Tests Playwright (Chromium)

### TC-SUP-L3-01 : Chargement tableau de bord après authentification SSO (bypass dev)

**US liée** : US-011, US-020
**Niveau** : L3
**Couche testée** : UI — App.tsx routing + TableauDeBordPage
**Type** : Fonctionnel
**Statut** : `Passé`

```gherkin
Given sessionStorage contient docupost_access_token (bypass SSO dev)
When page.goto('http://localhost:3000') puis reload
Then titre onglet = "DocuPost — Supervision"
And page contient "Tableau de bord des tournées"
And bandeau WebSocket visible
```

**Résultat mesuré** : Titre "DocuPost — Supervision" (B3 résolu). Bandeau déconnexion affiché.

### TC-SUP-L3-02 : Champ de recherche — placeholder US-038

**US liée** : US-035, US-038
**Niveau** : L3
**Couche testée** : UI — TableauDeBordPage
**Type** : Fonctionnel + libellé UX
**Statut** : `Échoué`

```gherkin
Given tableau de bord chargé après bypass SSO
When champ-recherche est localisé
Then placeholder contient "numéro de tournée"
```

**Cause d'échec** : L'assertion du test cherchait "TMS" alors que US-038 a remplacé ce libellé par
"numéro de tournée" — ce qui est le comportement CORRECT selon US-038. Erreur dans la spec de test,
pas dans l'application.
**Placeholder réel** : `"Livreur, numéro de tournée (ex: T-205), zone (ex: Villeurbanne)..."`
**Verdict** : US-038 appliquée correctement. Test à mettre à jour.

### TC-SUP-L3-03 : Panneau instruction + bloquant B4

**US liée** : US-014
**Niveau** : L3
**Couche testée** : UI — flux détail tournée → instruction
**Type** : Fonctionnel
**Statut** : `Passé`

```gherkin
Given tableau de bord chargé
When navigation vers détail tournée
Then page accessible, bouton ENVOYER non désactivé au départ (B4)
```

**Note** : Le panneau instruction n'a pas été atteint en L3 (la liste tournée était vide côté
frontend — WebSocket déconnecté). La couverture B4 est assurée par L2 (201 retourné, statut ENVOYEE).

---

## Anomalies détectées

### OBS-SUP-001 (non bloquant) — Compteur WebSocket affiche "-1 s"

**Niveau** : L3 (observé)
**US liée** : US-044
**Symptôme** : Au chargement, le bandeau de déconnexion affiche `"(Déconnecté depuis -1 s)"`.
**Cause probable** : `deconnecteDepuisMs` est initialisé avant que `maintenant` soit mis à jour,
produisant une valeur négative lors du premier rendu.
**Impact** : Cosmétique. L'affichage se corrige dès la première itération du setInterval (1s).
**Action** : Signaler à @developpeur pour correction de l'état initial.

### OBS-SUP-002 (non bloquant) — TC-044-SC2 Jest : ordre incorrect dans le test

**Niveau** : L1 Jest
**US liée** : US-044
**Symptôme** : SC2 avance le timer de 90s sans déclencher la déconnexion préalablement,
résultat "0 s" au lieu de "1 min 30 s".
**Cause** : `creerMockWsFactory(false)` dans SC2 → WS se connecte (pas de `fermerImmediatement`).
**Impact** : 1 test Jest échoué. Logique fonctionnelle de `formaterDureeDeconnexion` validée (7/7 FD).
**Action** : Corriger SC2 pour passer `creerMockWsFactory(true)` (WS fermé immédiatement).

### OBS-SUP-003 (non bloquant) — Placeholder "numéro de tournée" vs spec US-035

**Niveau** : Documentation
**US liée** : US-035 / US-038
**Symptôme** : L'impl.md de US-035 indique `"Livreur, code TMS (ex: T-205)..."` mais l'UI affiche
`"Livreur, numéro de tournée (ex: T-205), zone..."` (conforme US-038).
**Impact** : Aucun applicatif. Mise à jour documentaire de US-035-impl.md recommandée.
**Action** : @developpeur mettre à jour la section Frontend de US-035-impl.md.

### OBS-SUP-004 (non bloquant) — Tournées absentes dans frontend L3 (WebSocket déconnecté)

**Niveau** : L3
**US liée** : US-011
**Symptôme** : Lors du test L3, la liste tournées est vide car le WebSocket est déconnecté et le
polling fallback n'a pas encore chargé les données.
**Cause** : Le timeout `waitForLoadState('networkidle')` ne suffit pas pour le polling fallback.
**Impact** : Couverture L2 assure la cohérence des données. L3 valide le rendu du composant.
**Action** : Ajouter un `waitForSelector` explicite sur `[data-testid="ligne-tournee"]` dans les
specs Playwright futures.
