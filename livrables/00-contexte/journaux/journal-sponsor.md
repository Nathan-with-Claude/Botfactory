# Journal de bord — @sponsor — DocuPost

> **RÈGLE** : Lire ce fichier EN DÉBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier remplace la relecture complète de `/livrables/01-vision/`.

---

## Contexte synthétisé

- **Produit** : DocuPost — plateforme de gestion de tournées de livraison (Docaposte)
- **Phase** : MVP en cours de développement
- **Livrables propriété** : `01-vision/` (vision-produit.md v1.1, kpis.md v1.1, perimetre-mvp.md v1.1)
- **Stack imposée** : Java 21 / Spring Boot 4.0.3 — React 19 / TypeScript 5.6 — Docker / Kubernetes — CI/CD GitHub Actions
- **Intégration SI** : OMS (API REST), TMS (API REST, H6 à valider), SSO corporate OAuth2

### Parcours MVP actifs (4 parcours)

| # | Parcours | Persona | Interface |
|---|----------|---------|-----------|
| 0 | Préparation des tournées (import TMS, affectation, lancement) | Responsable logistique | Web |
| 1 | Exécution de la tournée (prise en main, livraison, preuves, clôture) | Livreur | Mobile Android |
| 2 | Pilotage temps réel (tableau de bord, alertes, instructions) | Superviseur | Web |
| 3 | Intégration SI (OMS, historisation immuable, SSO) | Système | API |

### Core Domains identifiés

- **BC-01 Orchestration de Tournée** — exécution terrain (livreur)
- **BC-07 Planification de Tournée** — préparation matinale (logisticien)

---

## Décisions structurantes

| Date | Décision | Justification |
|------|----------|---------------|
| 2026-03-19 | MVP = 3 parcours initiaux (livreur, superviseur, SI) | Pain points prioritaires terrain + DSI |
| 2026-03-19 | Android uniquement en v1 (iOS = Release 2) | Parc matériel Docaposte |
| 2026-03-19 | Intégration limitée à l'OMS au MVP (pas CRM/ERP) | Maîtriser la complexité d'intégration |
| 2026-03-20 | Parcours 0 ajouté au MVP (Planification TMS) | Prérequis bloquant — oublié du cadrage initial |
| 2026-03-20 | Affectation automatique (algo dispatch) → post-MVP | Affectation manuelle suffisante pour le MVP |

### Hypothèses actives

| # | Hypothèse | Statut | Risque |
|---|-----------|--------|--------|
| H1 | Livreurs disposent d'Android (ou BYOD) | À valider DSI + RH | Blocage matériel |
| H2 | OMS expose API REST sans modif cœur | À valider M. Garnier | Retard intégration |
| H3 | Motifs non-livraison couvrent 90 % des cas | À valider terrain | Motifs manquants |
| H4 | SSO extensible aux livreurs terrain | À valider DSI | Blocage auth |
| H5 | Connectivité mobile suffisante sur zones tournée | À valider terrain | Stratégie offline |
| H6 | TMS expose API REST pour import tournées | À valider M. Garnier | Import manuel résiduel |

---

## Interventions réalisées

- **2026-03-19** v1.0 — Création initiale : vision, KPIs, périmètre MVP (3 parcours, 6 exclusions).
  Fichiers : vision-produit.md, kpis.md, perimetre-mvp.md
- **2026-03-20** v1.1 — Ajout Parcours 0 (Planification TMS) : pain point logisticien, KPIs, H6, second Core Domain.
  Fichiers : vision-produit.md, kpis.md, perimetre-mvp.md
- **2026-04-21** v1.2 — Arbitrage Broadcast superviseur vers livreurs (Karim B.) : incluse MVP, périmètre borné.
  Fichiers : perimetre-mvp.md

---

## Points d'attention — prochaines interventions

- **H6 doit être validée** avant tout développement du Module 8 (ImporteurTMS) — à escalader à M. Garnier
- **H4 (SSO livreurs)** : si invalide, prévoir mode dégradé d'authentification
- Si un nouveau parcours est découvert, vérifier l'impact sur les KPIs et le planning avant d'intégrer
