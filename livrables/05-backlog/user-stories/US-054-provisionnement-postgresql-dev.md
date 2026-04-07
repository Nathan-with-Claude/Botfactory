# US-054 — Provisionner PostgreSQL en environnement de développement local

> Feature : F-DEV-002 — Infrastructure de persistance dev/prod
> Epic : EPIC-DEV-001 — Infrastructure et environnement de développement
> Priorité : P0 — Bloquant déploiement
> Complexité estimée : S
> Statut : À faire

## En tant que…

Développeur ou ingénieur DevOps préparant le déploiement de svc-supervision,

## Je veux…

disposer d'une instance PostgreSQL 16 locale provisionnée via Docker Compose, et que svc-supervision puisse démarrer en profil `prod` avec persistance réelle,

## Afin de…

valider le comportement de l'application avec la base de données cible avant tout déploiement, et détecter les éventuels problèmes de mapping JPA sur PostgreSQL (vs H2 in-memory).

## Contexte technique

**Écart as-built identifié (rapport-as-built-supervision.md, §8) :**

svc-supervision inclut le driver PostgreSQL dans son `pom.xml` mais aucune instance PostgreSQL n'est provisionnée. En développement, H2 in-memory est utilisé (`@Profile("dev")`). En production, le service démarrerait avec une base vide à chaque redémarrage.

Il n'existe pas de `docker-compose.yml` à la racine du projet ni dans `svc-supervision/`.

**Ce qui est attendu :**
- Un fichier `docker-compose.yml` (ou extension d'un fichier existant) exposant PostgreSQL 16 sur le port standard (5432 ou configurable).
- Un fichier `application-prod.yml` (ou variables d'environnement documentées) pour connecter svc-supervision à PostgreSQL.
- Un profil Spring `local-postgres` distinct de `dev` (H2) et de `prod` (PostgreSQL cloud) permettant les tests de migration JPA en local.

**Invariants à respecter :**
- Le profil `dev` avec H2 in-memory doit continuer à fonctionner sans modification.
- Les credentials PostgreSQL ne doivent pas être commités en dur — utiliser des variables d'environnement avec valeurs par défaut pour le dev local.
- Le DevDataSeeder ne doit s'exécuter qu'avec les profils `dev` ou `local-postgres` (pas en `prod`).

## Critères d'acceptation

**Scénario 1 — Démarrage avec PostgreSQL local**
- Given Docker est disponible sur le poste dev
- When on exécute `docker-compose up -d postgres`
- Then une instance PostgreSQL 16 est disponible sur le port configuré
- And svc-supervision démarre avec le profil `local-postgres` sans erreur

**Scénario 2 — Persistance entre redémarrages**
- Given svc-supervision tourne en profil `local-postgres` avec les données seed
- When on arrête puis redémarre le service
- Then les données persistées en base sont toujours présentes
- And l'événement de démarrage n'écrase pas les données existantes (DevDataSeeder idempotent ou désactivé)

**Scénario 3 — Profil dev H2 inchangé**
- Given la modification est appliquée
- When on démarre svc-supervision avec le profil `dev`
- Then H2 in-memory est utilisé (comportement inchangé)
- And tous les tests @WebMvcTest passent

**Scénario 4 — Mapping JPA PostgreSQL sans erreur**
- Given svc-supervision démarre avec le profil `local-postgres`
- When Hibernate génère le schéma (DDL auto ou Flyway)
- Then les tables `tournee_planifiee`, `vehicule`, `instruction`, `vue_tournee`, `processed_events` sont créées sans erreur
- And le DevDataSeeder insère les données de seed correctement

**Scénario 5 — Documentation du démarrage**
- Given le docker-compose et le profil `local-postgres` sont ajoutés
- When un nouveau développeur lit `/livrables/00-contexte/infrastructure-locale.md`
- Then les commandes de démarrage PostgreSQL local et le profil Spring à utiliser sont documentés

## Définition of Done

- [ ] `docker-compose.yml` créé ou mis à jour avec le service `postgres` (image 16-alpine, port configurable)
- [ ] Profil Spring `local-postgres` configuré dans `application-local-postgres.yml` (datasource PostgreSQL)
- [ ] Credentials via variables d'environnement (`.env.example` fourni, `.env` dans `.gitignore`)
- [ ] DevDataSeeder idempotent ou désactivé en profil `local-postgres` après premier démarrage
- [ ] `/livrables/00-contexte/infrastructure-locale.md` mis à jour avec les commandes de démarrage PostgreSQL
- [ ] Tests existants (@WebMvcTest) toujours verts avec profil `dev`

## Liens

- Rapport as-built : /livrables/04-architecture-technique/rapport-as-built-supervision.md#8-écarts-avec-larchitecture-cible
- Infrastructure locale : /livrables/00-contexte/infrastructure-locale.md
- Architecture technique : /livrables/04-architecture-technique/architecture-applicative.md
