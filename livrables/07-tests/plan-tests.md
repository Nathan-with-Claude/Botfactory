# Plan de tests global — DocuPost MVP

**Produit par** : @qa
**Version** : 1.1
**Date de création** : 2026-03-19
**Dernière mise à jour** : 2026-03-20 (ajout US-001)

---

## 1. Stratégie générale

### Priorité de test (Domain-Driven)

Conformément aux principes DDD (Evans), la priorité de test est la suivante :

```
Domain Layer (invariants, aggregates, events)
  → Application Layer (orchestration, use cases)
    → Infrastructure Layer (repositories, mappers)
      → Interface Layer (API REST, DTOs)
        → Mobile / Frontend
          → E2E (parcours complet)
```

Les tests de la Domain Layer sont des **tests unitaires purs** (pas de base de données,
pas de réseau). Ils constituent le filet de sécurité le plus rapide et le plus robuste.

### Convention de nommage des tests (Ubiquitous Language)

Les noms de tests doivent utiliser les termes du domaine :

- Bon : `should_emit_TourneeDemarree_when_livreur_starts_tournee`
- Mauvais : `should_update_status_to_started`

Les Domain Events sont utilisés comme **oracle de test** : on vérifie les events émis
plutôt que l'état interne des agrégats lorsque c'est possible.

### Types de tests couverts

| Type | Outil | Scope |
|------|-------|-------|
| Tests unitaires domaine | JUnit 5 + AssertJ | Aggregates, invariants, Domain Events |
| Tests unitaires application | JUnit 5 + Mockito | Handlers, orchestration |
| Tests d'intégration API | Spring @WebMvcTest | Controllers, DTOs, HTTP codes |
| Tests composants mobile | Jest + Testing Library | Screens, composants React Native |
| Tests de performance | JMeter / Gatling | Endpoints critiques (NFR ENF-PERF-006) |
| Tests de sécurité | JUnit / manuel | RBAC, isolation des données (ENF-SEC-005) |
| Tests E2E | Playwright MCP (post-MVP) | Parcours complets livreur et superviseur |

---

## 2. Exigences Non Fonctionnelles clés à couvrir

| NFR | Exigence | Couverture test |
|-----|----------|-----------------|
| ENF-PERF-006 | API < 500ms (p95) lectures | Test de charge JMeter/Gatling |
| ENF-PERF-007 | 50 livreurs simultanés, 6 000 colis/j | Test de charge volumétrie |
| ENF-SEC-001 | OAuth2 / SSO obligatoire | TC-012 (401 si non authentifié) + tests US-019 |
| ENF-SEC-005 | RBAC livreur isolé à sa tournée | TC-025 (SecurityContext, pas URL) |
| ENF-DISP-001 | App mobile disponible > 99,5 % | Monitoring prod (hors scope tests fonctionnels) |
| ENF-OBS-001 | Logs structurés JSON | Vérification format log en recette |

---

## 3. Couverture par User Story

### US-001 — Consulter la liste des colis assignés à ma tournée

**Fichier scénarios** : `/livrables/07-tests/scenarios/US-001-scenarios.md`
**Fichier jeux de données** : `/livrables/07-tests/jeux-de-donnees.md` (JDD-001 à JDD-006)

| Indicateur | Valeur |
|-----------|--------|
| Nombre total de TCs | 25 |
| Couverture Domain | 5 TCs (TC-001 à TC-005) |
| Couverture Application | 4 TCs (TC-006 à TC-009) |
| Couverture Interface/API | 6 TCs (TC-010 à TC-014, dont TC-012 sécurité) |
| Couverture Mobile | 5 TCs (TC-015 à TC-019) |
| Edge cases et non-régression | 4 TCs (TC-020 à TC-023) |
| Performance | 1 TC (TC-024) |
| Sécurité | 1 TC (TC-025, inclus dans Interface) |

**Statut des TCs par mode d'exécution** :

| Mode | TCs | Détail |
|------|-----|--------|
| Automatisés — existants (JUnit + Jest) | TC-001 à TC-019 | `TourneeTest.java` (5), `ConsulterListeColisHandlerTest.java` (4), `TourneeControllerTest.java` (6), `ListeColisScreen.test.tsx` (5) |
| À automatiser — JMeter/Gatling | TC-024 | Test de charge 120 colis, JDD-003 |
| À automatiser — test de sécurité JUnit | TC-025 | Isolation SecurityContext vs paramètre URL |
| Manuel (dev local) | TC-022 | Idempotence DevDataSeeder au redémarrage |
| Vérification statique | TC-023 | Existence et compilation de `TourneeChargee.java` |

**Limitations connues intégrées dans les scénarios** :
- `estimationFin` == null : comportement attendu, TC-004 et TC-010 le documentent.
- `TourneeChargee` non publié vers BC-03 : TC-023 vérifie uniquement l'existence de la classe.
- `MockJwtAuthFilter` : TC-012 et TC-025 doivent être rejoués avec OAuth2 réel quand US-019 est livrée.

---

## 4. Backlog des US à traiter (plan prévisionnel)

| US | Titre court | Scénarios | JDD | Priorité |
|----|-------------|-----------|-----|----------|
| US-001 | Consulter liste colis | Rédigés (25 TCs) | Prêts (JDD-001 à JDD-006) | Fait |
| US-002 | Suivre ma progression | À faire | À faire | Must Have |
| US-003 | Filtrer par zone | À faire | À faire | Must Have |
| US-004 | Détail colis | À faire | À faire | Must Have |
| US-005 | Déclarer échec livraison | À faire | À faire | Must Have |
| US-006 | Mode offline + sync | À faire | À faire | Must Have |
| US-007 | Clôturer tournée | À faire | À faire | Must Have |
| US-008 | Capturer signature numérique | À faire | À faire | Must Have |
| US-009 | Capturer photo / tiers | À faire | À faire | Must Have |
| US-010 | Consulter preuve litige | À faire | À faire | Must Have |
| US-011 | Tableau de bord tournées | À faire | À faire | Must Have |
| US-012 | Détail tournée superviseur | À faire | À faire | Must Have |
| US-013 | Alerte tournée à risque | À faire | À faire | Must Have |
| US-014 | Envoyer instruction livreur | À faire | À faire | Should Have |
| US-015 | Suivre exécution instruction | À faire | À faire | Should Have |
| US-016 | Notification push instruction | À faire | À faire | Should Have |
| US-017 | Synchronisation OMS | À faire | À faire | Must Have |
| US-018 | Historisation immuable événements | À faire | À faire | Must Have |
| US-019 | Authentification SSO mobile | À faire | À faire | Must Have |
| US-020 | Authentification SSO web | À faire | À faire | Must Have |
| US-021 | Visualiser plan du jour | À faire | À faire | Must Have |
| US-022 | Vérifier composition tournée | À faire | À faire | Must Have |
| US-023 | Affecter livreur + véhicule | À faire | À faire | Must Have |
| US-024 | Lancer tournée | À faire | À faire | Must Have |

---

## 5. Outillage et infrastructure de test

### Backend (Java)
- **Framework** : JUnit 5 + AssertJ + Mockito
- **Tests d'intégration** : Spring `@WebMvcTest`, `@DataJpaTest`
- **Base de données test** : H2 in-memory (profil `test`)
- **Sécurité** : `MockMvc` avec `@WithMockUser` ou `MockJwtAuthFilter`

### Mobile (React Native)
- **Framework** : Jest + React Native Testing Library
- **Mocking API** : `jest.mock('../api/tourneeApi')`
- **Couverture** : `jest --coverage`

### Performance
- **Outil recommandé** : Gatling (Scala DSL) ou JMeter
- **Environnement** : recette isolée (pas de prod)
- **Métriques cibles** : p50, p95, p99 — seuil ENF-PERF-006 (< 500ms p95)

### E2E (post-MVP)
- **Outil** : Playwright (MCP playwright si disponible)
- **Scope** : Parcours livreur complet (M-01 → M-10) et parcours superviseur (W-01 → W-05)

---

## 6. Définition du "Test Passé"

Un scénario est considéré **Passé** lorsque :
1. Le test automatisé s'exécute sans erreur dans le pipeline CI.
2. Ou, pour les tests manuels, un testeur a exécuté les étapes et confirmé le résultat attendu.

Un scénario est **Échoué** lorsque :
1. Le résultat observé diffère du résultat attendu.
2. Une exception inattendue est levée.
3. Un Domain Event attendu n'est pas émis (ou l'inverse).

---

## 7. TODO

- TODO: installer/configurer MCP Playwright pour automatiser les tests E2E des parcours livreur et superviseur.
- TODO: mettre en place Gatling dans le pipeline CI pour les tests de charge (TC-024 et équivalents sur les US suivantes).
- TODO: rejouer TC-012 et TC-025 avec le vrai SSO Keycloak quand US-019 est implémentée.
- TODO: créer un test d'intégration JPA (`@DataJpaTest`) pour TC-022 (idempotence DevDataSeeder) en remplacement du test manuel.
