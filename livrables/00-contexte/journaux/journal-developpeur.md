# Journal de bord — @developpeur — DocuPost

> **RÈGLE** : Lire ce fichier EN DÉBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier donne le contexte technique synthétisé et suit l'avancement des implémentations.

---

## Contexte synthétisé

- **Stack** : Java 21 / Spring Boot 4.0.3 (backend) — React 19 / TypeScript 5.6 (frontend) — React Native / Android (mobile)
- **Architecture** : DDD hexagonale, microservices, 1 service par Bounded Context
- **Pattern offline** : SQLite mobile + sync queue (app livreur uniquement)
- **Auth** : Spring Security + OAuth2 JWT (token validé à l'API Gateway)
- **Event bus** : Kafka (à confirmer) — Domain Events immuables
- **Fichiers d'archi à lire pour chaque US** :
  - BC concerné : `/livrables/03-architecture-metier/domain-model.md`
  - Endpoints + NFR : `/livrables/04-architecture-technique/architecture-applicative.md`
  - US specs : `/livrables/05-backlog/user-stories/US-[NNN]-*.md`
  - Wireframes : `/livrables/02-ux/wireframes.md`

### Ordre d'implémentation recommandé (dépendances)

```
US-019/020 (SSO auth)
  → US-021/023/024 (planification — prérequis livreur)
    → US-001/002/003/004 (app livreur — consultation)
      → US-008/009 (preuves)
        → US-005/006/007 (échecs, offline, clôture)
          → US-011/012/013/014/015 (supervision)
            → US-016 (notifications push)
              → US-017/018 (OMS, historisation)
```

---

## Suivi des User Stories

| US | Titre court | BC | Statut | Sprint | Branche git | Notes |
|----|-------------|-----|--------|--------|-------------|-------|
| US-019 | Auth SSO mobile | BC-06 | À faire | — | — | Keycloak OAuth2 |
| US-020 | Auth SSO web | BC-06 | À faire | — | — | Keycloak OAuth2 |
| US-021 | Visualiser plan du jour | BC-07 | À faire | — | — | Dépend de l'API TMS (H6) |
| US-022 | Vérifier composition | BC-07 | À faire | — | — | Should Have |
| US-023 | Affecter livreur + véhicule | BC-07 | À faire | — | — | Invariant : 1 livreur/tournée/jour |
| US-024 | Lancer tournée | BC-07 | À faire | — | — | Event TournéeLancée → BC-01 |
| US-001 | Consulter liste colis | BC-01 | Implémenté | Sprint 1 | feature/US-001 | Mock auth + DataSeeder dev. Voir US-001-impl.md |
| US-002 | Suivre progression | BC-01 | Implémenté | Sprint 1 | feature/US-001 | AvancementCalculator + bouton Clôture mobile. 6+3 tests backend vert. BUG-002 (Spring ASM Java 25) documenté. |
| US-003 | Filtrer par zone | BC-01 | À faire | — | — | Écran M-01 (filtres) |
| US-004 | Détail colis | BC-01 | À faire | — | — | Écran M-02 |
| US-005 | Déclarer échec | BC-01 | À faire | — | — | Écran M-03, motifs normalisés |
| US-006 | Mode offline | BC-01 | À faire | — | — | SQLite + sync queue, taille L |
| US-007 | Clôturer tournée | BC-01 | À faire | — | — | Écran M-06 |
| US-008 | Capturer signature | BC-02 | À faire | — | — | Écran M-04 |
| US-009 | Capturer photo/tiers | BC-02 | À faire | — | — | Écran M-05 |
| US-010 | Consulter preuve | BC-02 | À faire | — | — | Should Have |
| US-011 | Tableau de bord | BC-03 | À faire | — | — | Écran W-01 |
| US-012 | Détail tournée superviseur | BC-03 | À faire | — | — | Écran W-02 |
| US-013 | Alerte tournée à risque | BC-03 | À faire | — | — | < 15 min |
| US-014 | Envoyer instruction | BC-03 | À faire | — | — | Écran W-03 |
| US-015 | Suivre instruction | BC-03 | À faire | — | — | |
| US-016 | Notification push | BC-04 | À faire | — | — | FCM |
| US-017 | Sync OMS | BC-05 | À faire | — | — | < 30 sec, ACL |
| US-018 | Historisation immuable | BC-05 | À faire | — | — | Event store |

**Légende statuts** : `À faire` | `En cours` | `Implémenté` | `Testé` | `Livré`

---

## Interventions réalisées

| Date | US | Action | Fichier impl |
|------|----|--------|--------------|
| 2026-03-20 | US-001 | Initialisation monorepo + implémentation complète (domain, application, infrastructure, interfaces, mobile) | /livrables/06-dev/vertical-slices/US-001-impl.md |
| 2026-03-20 | US-002 | Domain Service AvancementCalculator + bouton Clôture mobile (SC4) + bugfixes BUG-002 (tests) | /livrables/06-dev/vertical-slices/US-002-impl.md |

---

## Décisions techniques prises

*(à remplir au fil des implémentations)*

| Date | US | Décision | Justification |
|------|----|----------|---------------|
| 2026-03-20 | US-001 | MockJwtAuthFilter (@Profile dev) injecte livreur-001/ROLE_LIVREUR | US-019 (SSO) non encore implémentée — TODO supprimer quand US-019 faite |
| 2026-03-20 | US-001 | DevDataSeeder (@Profile dev) crée la tournée de test avec 5 colis | BC-07 (Planification) non encore implémenté — TODO supprimer quand US-024 faite |
| 2026-03-20 | US-001 | Spring Boot 3.4.3 au lieu de 4.0.3 | Spring Boot 4.x non disponible en Q1 2026 — migrer dès disponibilité |
| 2026-03-20 | US-001 | H2 en mémoire (dev) + PostgreSQL (prod) dans application.yml | Pas de dépendance infra en développement local |
| 2026-03-20 | US-001 | Pattern collect-and-publish pour les Domain Events | Domaine pur sans dépendance Spring — Application Service orchestre la publication |
| 2026-03-20 | US-002 | AvancementCalculator créé en Domain Service (domain/service/) | Encapsule la logique de calcul d'avancement hors de l'Aggregate — séparation de responsabilité DDD |
| 2026-03-20 | US-002 | estimationFin = null dans le MVP | Cadence moyenne non disponible sans historique de livraison — fonctionnalité future US-XXX |
| 2026-03-20 | US-002 | BUG-002 : TourneeControllerTest non résolu (Spring ASM + Java 25) | Spring Boot 3.4.x + ASM 9.x incompatible avec .class Java 25 (format 69). Workaround partiel. Solution : JDK 21 ou Spring Boot 3.5+ |

---

## Points d'attention

- Les **noms de classes et méthodes** DOIVENT correspondre à l'Ubiquitous Language (domain-model.md) — jamais d'abstraction technique (`DeliveryManager`, `ProcessingService` interdit)
- Tout changement de statut colis DOIT générer un Domain Event horodaté + géolocalisé
- Le **mode offline** (US-006) est transversal — à anticiper dès US-001 dans l'architecture mobile
- Documenter chaque implémentation dans `/livrables/06-dev/vertical-slices/US-[NNN]-impl.md`
- Mettre à jour ce journal après chaque US : statut → `Implémenté`, branche git, décisions prises
