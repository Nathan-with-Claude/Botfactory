# Journal de bord — @devops — DocuPost

> **RÈGLE** : Lire ce fichier EN DÉBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier donne le contexte CI/CD synthétisé et suit l'état des environnements.

---

## Contexte synthétisé

- **Livrables propriété** : `08-devops/`
  - pipeline-cicd.md (créé)
  - strategie-deploiement.md (créé)
  - monitoring.md (à compléter)
- **Environnements** : dev / recette / préprod / prod (imposés par M. Garnier)
- **CI/CD** : GitHub Actions
- **Infra** : Docker / Kubernetes
- **Contrainte critique** : interface web de planification disponible dès **6h00** (fenêtre matinale logisticien)

### Services à déployer

| Service | BC | Criticité | Contrainte démarrage |
|---------|----|-----------|----------------------|
| svc-planification | BC-07 | Haute | Avant 6h00 (cron import TMS à 6h00) |
| svc-tournee | BC-01 | Haute | Avant départ livreurs (~7h00) |
| svc-supervision | BC-03 | Haute | En continu journée |
| svc-preuves | BC-02 | Haute | En continu journée |
| svc-notification | BC-04 | Haute | En continu journée |
| svc-integration-oms | BC-05 | Haute | En continu journée |
| svc-identite (Keycloak) | BC-06 | Critique | Avant tout autre service |
| api-gateway | — | Critique | Avant tout autre service |
| app-mobile | BC-01 | — | Déploiement APK |
| app-web | BC-03/07 | Haute | Avant 6h00 |

---

## Interventions réalisées

| Date | Sujet | Fichiers |
|------|-------|----------|
| 2026-03-19 | Création pipeline CI/CD et stratégie de déploiement initiale | pipeline-cicd.md, strategie-deploiement.md |
| 2026-04-05 | Stratégie de déploiement GCP — environnements de test (integration, recette, staging) | strategie-deploiement-gcp-test.md |
| 2026-04-06 | Provisionnement GCP réel — projet docupost-recette-prod (Artifact Registry, Cloud SQL, secrets, IAM, Dockerfiles, cloudbuild.yaml) | infrastructure-locale.md (section GCP) |
| 2026-04-07 | Documentation déploiement manuel GCP sans GitHub — process opérationnel | deploiement-manuel-gcp.md, infrastructure-locale.md |
| 2026-04-07 | As-built Cloud Run complet — état réel services, env vars, bugs corrigés, limitations | as-built-cloudrun-recette.md |
| 2026-04-07 | Fix ALLOWED_ORIGINS svc-supervision (était placeholder) + correction noms secrets dans infra-locale | infrastructure-locale.md, svc-supervision (Cloud Run) |

---

## Décisions structurantes

| Date | Décision |
|------|----------|
| 2026-04-05 | Choix Cloud Run (vs GKE) pour les environnements de test : sans serveur, coût maîtrisé, suffisant pour le MVP (~36 à 151 €/mois selon env) |
| 2026-04-05 | 3 environnements GCP distincts : integration (branche develop), recette (release/*), staging (main pré-merge) |
| 2026-04-05 | Keycloak min-instances=1 obligatoire pour éviter cold start bloquant l'authentification |
| 2026-04-05 | Terraform + GitHub Actions comme outil IaC et CI/CD pour les déploiements GCP (doc théorique) |
| 2026-04-07 | Déploiement GCP sans GitHub : `gcloud builds submit` en manuel — pas de trigger automatique pour l'instant |

## Points d'attention — prochaines interventions

- **Fenêtre de maintenance interdite** : 05h45 → 07h15 (préparation tournées + départ livreurs)
- Le **svc-planification** doit démarrer avant le cron ImporteurTMS (6h00) → ordonnancement Kubernetes requis
- Prévoir une **alerte monitoring** si l'import TMS n'a pas réussi à 6h15 (3 retries épuisés)
- Le **déploiement APK Android** est un canal séparé à documenter (distribution interne Docaposte)
- Prévoir la stratégie de **rollback** en cas d'échec de déploiement en prod en pleine journée de livraison
- **Mock OMS** à créer pour environment integration (WireMock sur Cloud Run) — svc-integration-oms ne peut pas cibler le SI Docaposte en recette
- **Workload Identity Federation** à envisager pour remplacer les clés JSON SA dans GitHub Actions
- **Extinction automatique Cloud SQL** la nuit et le week-end à configurer pour réduire les coûts
