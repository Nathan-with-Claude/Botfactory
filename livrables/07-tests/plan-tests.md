# Plan de tests — DocuPost MVP

**Produit par** : @qa
**Date de création** : 2026-04-22
**Dernière mise à jour** : 2026-04-22 (Feature Broadcast US-067/068/069)

---

## Vision globale

| Feature | US | Scénarios | L1 | L2 | L3 | Statut |
|---------|----|-----------|----|----|----|--------|
| Feature Broadcast Superviseur | US-067 | 13 TCs | 5 | 5 | 3 | Partielle |
| Feature Broadcast Livreur | US-068 | 10 TCs | 7 | 3 | 0 | Partielle |
| Feature Broadcast Statuts | US-069 | 11 TCs | 6 | 3 | 2 | Partielle |

> Pour les US-001 à US-066 : voir le journal QA et les fichiers de scénarios dans `livrables/07-tests/scenarios/`.

---

## Synthèse par feature

### Feature Broadcast Superviseur → Livreurs (US-067/068/069) — 2026-04-22

**Services impliqués** : svc-supervision (port 8082), frontend-supervision (port 3000), expo-web (port 8083)
**Stack tests** : mvn test (Java 23) + Jest/RNTL (mobile) + Playwright (L3 — non exécuté)

#### Résultats L1

| Suite | Tests | Résultat |
|-------|-------|----------|
| EnvoyerBroadcastHandlerTest | 5/5 | PASS |
| BroadcastEnvoyeEventHandlerTest | 3/3 | PASS |
| BroadcastVuEventHandlerTest | 4/4 | PASS |
| BroadcastOverlay.test.tsx (RNTL) | 4/4 | PASS |
| MessagesSuperviseursScreen.test.tsx (RNTL) | 3/3 | PASS |
| **Total L1** | **19/19** | **PASS** |

#### Résultats L2

| TC | Endpoint | Résultat |
|----|----------|----------|
| TC-067-L2-01 | POST /broadcasts TOUS → 201 | PASS |
| TC-067-L2-02 | POST /broadcasts SECTEUR → filtre | FAIL (OBS-BROAD-001) |
| TC-067-L2-03 | POST /broadcasts texte vide → 422 | PASS |
| TC-067-L2-04 | GET /broadcast-secteurs → 200 3 secteurs | PASS |
| TC-067-L2-05 | POST /broadcasts AUCUN_LIVREUR_ACTIF → 422 | PASS |
| TC-068-L2-01 | POST /broadcasts/{id}/vu destinataire | Bloqué (OBS-BROAD-002) |
| TC-068-L2-02 | POST /broadcasts/{id}/vu non-destinataire → 403 | Bloqué (OBS-BROAD-002) |
| TC-068-L2-03 | GET /broadcasts/recus?date=... | Bloqué (OBS-BROAD-002) |
| TC-069-L2-01 | GET /broadcasts/du-jour → 200 | PASS |
| TC-069-L2-02 | GET /broadcasts/{id}/statuts → [] | PASS endpoint / FAIL données (OBS-BROAD-003) |
| TC-069-L2-03 | Cohérence compteurs après /vu | Bloqué (OBS-BROAD-002 + OBS-BROAD-003) |

#### Anomalies actives (bloquantes)

| Code | Description | Impact |
|------|-------------|--------|
| OBS-BROAD-000 | FcmBroadcastAdapter @Autowired Object → NoUniqueBeanDefinition (CORRIGÉE) | Démarrage service |
| OBS-BROAD-001 | livreurIds absents de BroadcastSecteurEntity → ciblage secteur retourne 422 | US-067 scénario 2 |
| OBS-BROAD-002 | MockJwtAuthFilter dev ROLE_SUPERVISEUR uniquement → endpoints LIVREUR bloqués | US-068 L2 |
| OBS-BROAD-003 | BroadcastEnvoye non publié via ApplicationEventPublisher → projection statuts vide | US-069 données |

#### Verdict feature broadcast

| US | Verdict | Condition |
|----|---------|-----------|
| US-067 | Partielle | L1 5/5 PASS, L2 4/5 PASS (OBS-BROAD-001 bloquant sur ciblage secteur) |
| US-068 | Partielle | L1 7/7 PASS, L2 0/3 bloqués (OBS-BROAD-002), logique domaine validée |
| US-069 | Partielle | L1 7/7 PASS, L2 1/3 données correctes (OBS-BROAD-003 bloquant projection) |

**Prochaine action** : Demander à @developpeur de corriger OBS-BROAD-001/002/003, puis rejouer les TCs L2 concernés.

---

## Corrections requises avant re-run

### OBS-BROAD-001 — Ciblage secteur (BroadcastSecteurEntity)

```java
// BroadcastSecteurEntity.java : ajouter @ElementCollection
@ElementCollection
@CollectionTable(name = "broadcast_secteur_livreur",
    joinColumns = @JoinColumn(name = "code_secteur"))
@Column(name = "livreur_id")
private List<String> livreurIds = new ArrayList<>();
```

```java
// BroadcastSecteurRepositoryImpl.java : mapper livreurIds
.map(e -> new BroadcastSecteur(e.getCodeSecteur(), e.getLibelle(), e.isActif(), e.getLivreurIds()))
```

```java
// DevDataSeeder.java : remplir les affectations livreur-secteur
// Exemple : livreur-002 et livreur-004 (EN_COURS) dans SECT-IDF-02
```

### OBS-BROAD-002 — MockJwtAuthFilter multi-rôles

```java
// MockJwtAuthFilter.java : lire le rôle depuis le header X-Mock-Role (optionnel)
String mockRole = request.getHeader("X-Mock-Role");
String mockId = request.getHeader("X-Mock-Id");
// Si absent → fallback superviseur-001 / ROLE_SUPERVISEUR
```

### OBS-BROAD-003 — Publication ApplicationEventPublisher

```java
// EnvoyerBroadcastHandler.java : ajouter ApplicationEventPublisher
private final ApplicationEventPublisher applicationEventPublisher;

// Dans handle(), après save() et AVANT clearEvenements() :
message.getEvenements().forEach(applicationEventPublisher::publishEvent);
message.clearEvenements();
```
