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

---

## Points d'attention — prochaines interventions

- **Fenêtre de maintenance interdite** : 05h45 → 07h15 (préparation tournées + départ livreurs)
- Le **svc-planification** doit démarrer avant le cron ImporteurTMS (6h00) → ordonnancement Kubernetes requis
- Prévoir une **alerte monitoring** si l'import TMS n'a pas réussi à 6h15 (3 retries épuisés)
- Le **déploiement APK Android** est un canal séparé à documenter (distribution interne Docaposte)
- Prévoir la stratégie de **rollback** en cas d'échec de déploiement en prod en pleine journée de livraison
