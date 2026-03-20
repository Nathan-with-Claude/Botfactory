# Définition du MVP DocuPost

> Document de référence — Version 1.1 — 2026-03-20
> Produit par le Product Owner à partir des livrables vision (/livrables/01-vision/),
> UX (/livrables/02-ux/), architecture métier (/livrables/03-architecture-metier/),
> architecture technique (/livrables/04-architecture-technique/) et des entretiens
> métier (/livrables/00-Entretiens métier/).
>
> Ce document définit le périmètre précis du MVP DocuPost : ce qui est dedans, ce qui
> est dehors, et les critères de succès mesurables à la mise en production.

---

## Objectifs business du MVP

Le MVP DocuPost répond à une rupture structurelle identifiée lors des entretiens : dès
qu'un livreur quitte le dépôt, il sort du système d'information de l'entreprise. Le MVP
vise à réintégrer le livreur dans la chaîne SI et à remplacer le pilotage téléphonique
du superviseur par une plateforme numérique en temps réel.

### KPIs cibles au MVP

| KPI | Cible MVP | Source entretien |
|-----|-----------|-----------------|
| Temps moyen de préparation des tournées du matin | < 30 minutes | M. Renaud |
| Taux d'affectation complète avant le départ des livreurs | 100 % | M. Renaud |
| Réduction des erreurs d'affectation vs baseline papier | 90 % | M. Renaud |
| Temps moyen de mise à jour d'un statut colis | < 45 secondes | Pierre (livreur) |
| Taux d'utilisation des motifs de non-livraison normalisés | 100 % | Pierre, M. Renaud |
| Taux de preuves de livraison capturées numériquement | 100 % des livraisons réussies | Mme Dubois, M. Garnier |
| Délai moyen de détection d'une tournée à risque | < 15 minutes | M. Renaud |
| Taux de synchronisation OMS en temps réel | > 99 % | M. Garnier |
| Taux de double saisie résiduelle | 0 % | Mme Dubois, M. Garnier |
| Complétude des événements historisés (4 attributs) | 100 % | M. Garnier, Mme Dubois |
| Taux d'événements en échec rejoués avec succès | > 99 % | M. Garnier |
| Délai moyen de fourniture d'une preuve opposable | < 5 minutes | Mme Dubois |
| Score de satisfaction livreur (enquête in-app) | > 4 / 5 après 4 semaines | Pierre (livreur) |
| Réduction des appels superviseur / livreur | - 70 % vs baseline | M. Renaud |

### KPIs en mesure de référence (baseline à établir au MVP)

Ces indicateurs n'ont pas d'objectif cible au démarrage. Ils servent à établir la
baseline pour les objectifs de la Release 2.

- Taux de tournées pilotées sans intervention manuelle
- Taux d'alertes actionnées par le superviseur
- Réduction des litiges "colis non reçu" (baseline papier à mesurer avant déploiement)

---

## Contenu du MVP

### Epics incluses (7 Epics)

| Epic | Bounded Context | Classification DDD |
|------|-----------------|-------------------|
| EPIC-007 — Planification et Préparation des Tournées | BC-07 Planification de Tournée | Core Domain |
| EPIC-001 — Exécution de la Tournée | BC-01 Orchestration de Tournée | Core Domain |
| EPIC-002 — Capture et Accès aux Preuves de Livraison | BC-02 Gestion des Preuves | Supporting Subdomain |
| EPIC-003 — Supervision et Pilotage Temps Réel | BC-03 Supervision | Core Domain |
| EPIC-004 — Notification et Messaging | BC-04 Notification | Supporting Subdomain |
| EPIC-005 — Intégration SI et Historisation Immuable | BC-05 Intégration SI / OMS | Generic Subdomain |
| EPIC-006 — Authentification et Accès | BC-06 Identité et Accès | Generic Subdomain |

### Features incluses (21 features, toutes Must Have sauf F-008 et F-019)

| Feature | Epic | Priorité MoSCoW |
|---------|------|-----------------|
| F-018 : Import et visualisation du plan du jour | EPIC-007 | Must Have |
| F-019 : Vérification de la composition des tournées | EPIC-007 | Should Have |
| F-020 : Affectation livreur et véhicule | EPIC-007 | Must Have |
| F-021 : Lancement des tournées | EPIC-007 | Must Have |
| F-001 : Chargement et prise en main de la tournée | EPIC-001 | Must Have |
| F-002 : Organisation des arrêts par zone | EPIC-001 | Must Have |
| F-003 : Mise à jour du statut d'un colis | EPIC-001 | Must Have |
| F-004 : Déclaration d'un échec avec motif normalisé | EPIC-001 | Must Have |
| F-005 : Mode offline et synchronisation différée | EPIC-001 | Must Have |
| F-006 : Clôture de tournée | EPIC-001 | Must Have |
| F-007 : Capture de la preuve de livraison | EPIC-002 | Must Have |
| F-008 : Accès aux preuves par le support client | EPIC-002 | Should Have |
| F-009 : Tableau de bord des tournées du jour | EPIC-003 | Must Have |
| F-010 : Consultation du détail d'une tournée | EPIC-003 | Must Have |
| F-011 : Détection automatique des tournées à risque | EPIC-003 | Must Have |
| F-012 : Envoi d'une instruction structurée au livreur | EPIC-003 | Must Have |
| F-013 : Notification push d'instruction au livreur | EPIC-004 | Must Have |
| F-014 : Alerte automatique superviseur | EPIC-004 | Must Have |
| F-015 : Synchronisation des événements vers l'OMS | EPIC-005 | Must Have |
| F-016 : Historisation immuable des événements | EPIC-005 | Must Have |
| F-017 : Connexion SSO et contrôle d'accès par rôle | EPIC-006 | Must Have |

### User Stories incluses (24 User Stories)

| US | Titre | Feature | Priorité | Complexité |
|----|-------|---------|----------|-----------|
| US-021 | Visualiser le plan du jour importé depuis le TMS | F-018 | Must Have | M (5 pts) |
| US-022 | Vérifier la composition d'une tournée avant affectation | F-019 | Should Have | S (3 pts) |
| US-023 | Affecter un livreur et un véhicule à une tournée | F-020 | Must Have | M (5 pts) |
| US-024 | Lancer une tournée pour la rendre visible au livreur | F-021 | Must Have | S (3 pts) |
| US-001 | Consulter la liste des colis assignés à ma tournée | F-001 | Must Have | M (5 pts) |
| US-002 | Suivre ma progression en temps réel | F-001 | Must Have | S (3 pts) |
| US-003 | Filtrer et organiser mes colis par zone géographique | F-002 | Must Have | S (3 pts) |
| US-004 | Accéder au détail d'un colis et déclencher une action | F-003 | Must Have | S (3 pts) |
| US-005 | Déclarer un échec de livraison avec motif normalisé et disposition | F-004 | Must Have | M (5 pts) |
| US-006 | Continuer à livrer en zone blanche et synchroniser au retour | F-005 | Must Have | L (8 pts) |
| US-007 | Clôturer ma tournée et consulter le récapitulatif | F-006 | Must Have | S (3 pts) |
| US-008 | Capturer une signature numérique comme preuve de livraison | F-007 | Must Have | M (5 pts) |
| US-009 | Capturer une photo ou identifier un tiers comme preuve | F-007 | Must Have | M (5 pts) |
| US-010 | Consulter la preuve d'une livraison pour traiter un litige | F-008 | Should Have | S (3 pts) |
| US-011 | Visualiser l'avancement de toutes les tournées en temps réel | F-009 | Must Have | L (8 pts) |
| US-012 | Consulter le détail d'une tournée avec statuts et incidents | F-010 | Must Have | M (5 pts) |
| US-013 | Recevoir une alerte automatique dès qu'une tournée est à risque | F-011 | Must Have | L (8 pts) |
| US-014 | Envoyer une instruction structurée à un livreur | F-012 | Must Have | M (5 pts) |
| US-015 | Suivre l'état d'exécution d'une instruction envoyée | F-012 | Must Have | S (3 pts) |
| US-016 | Recevoir une notification push quand le superviseur modifie ma tournée | F-013 | Must Have | M (5 pts) |
| US-017 | Synchroniser automatiquement les événements de livraison vers l'OMS | F-015 | Must Have | L (8 pts) |
| US-018 | Garantir l'historisation immuable de chaque événement | F-016 | Must Have | M (5 pts) |
| US-019 | M'authentifier via SSO depuis l'application mobile | F-017 | Must Have | S (3 pts) |
| US-020 | M'authentifier via SSO depuis l'interface web de supervision | F-017 | Must Have | S (3 pts) |

**Total estimé MVP : 119 points (Story Points)**
**Répartition : 22 Must Have + 2 Should Have**

---

## Plateformes et interfaces du MVP

| Interface | Technologie | Utilisateurs | Statut |
|-----------|------------|--------------|--------|
| Application mobile Android (et iOS via React Native) | React Native / TypeScript | Livreurs terrain | MVP |
| Interface web de supervision | React 19 / TypeScript | Superviseurs, DSI | MVP |
| API Backend | Java 21 / Spring Boot 4 | (consommé par mobile et web) | MVP |
| Intégration OMS via API REST | Anti-Corruption Layer | SI Docaposte | MVP |

---

## Contraintes techniques du MVP

| Contrainte | Détail |
|------------|--------|
| Stack technique | Java 21 / Spring Boot 4.0.3 — React 19 / TypeScript 5.6 — React Native |
| DevOps | Docker / Kubernetes — CI/CD GitHub Actions |
| Sécurité | OAuth2 / SSO corporate obligatoire — TLS/HTTPS — conformité RGPD |
| Intégration SI | API REST uniquement, sans modification du cœur OMS |
| Environnements | dev / recette / préprod / prod |
| Offline-first mobile | WatermelonDB (SQLite) + Background fetch |
| Notifications push | Firebase Cloud Messaging (iOS + Android) |

---

## Hors périmètre MVP (releases ultérieures)

| Fonctionnalité exclue | Justification | Release envisagée |
|-----------------------|---------------|-------------------|
| Optimisation automatique de l'ordre des arrêts (routage) | Complexité algorithmique élevée | Release 2 |
| Notification proactive du client final (SMS, email) | Nécessite intégration CRM + RGPD | Release 2 |
| Analyse de performance avancée (benchmarking inter-tournées) | Base suffisante pour la phase d'apprentissage | Release 2 |
| Intégration CRM et ERP | Phase 1 limitée à l'OMS | Release 2 |
| Redistribution automatique de colis entre livreurs | Logique capacité/contrainte véhicule non spécifiée | Release 3 |
| Reprogrammation en ligne par le client final | Parcours client externe hors périmètre | Release 3 |
| Portail client de suivi en autonomie | Parcours client externe hors périmètre | Release 3 |
| Gestion des véhicules et capacités de chargement | Hors scope de la gestion terrain des colis | Release 3 |
| Facturation automatisée | Dépend de l'intégration ERP (post-MVP) | Release 3 |

### Note sur l'intégration du Parcours 0 (mise à jour Version 1.1)

Un entretien complémentaire du 19/03/2026 avec le responsable logistique
(/livrables/00-Entretiens métier/Entretiens_logistique_19_03.md) a révélé un pan
métier non couvert par le MVP initial : la gestion de la préparation des tournées en
amont (affectation des colis aux livreurs, aux véhicules et aux tournées à partir des
données TMS).

Ce besoin est désormais **intégré au périmètre MVP** (version 1.1) sous le nom
Parcours 0 "Préparation des tournées". Il constitue un prérequis bloquant au Parcours 1
(exécution livreur) : sans tournée lancée, aucune tournée n'est visible dans l'app mobile.
EPIC-007 et les US-021 à US-024 couvrent ce parcours.

---

## Hypothèses à valider avant le démarrage du développement

| # | Hypothèse | Risque si invalide | Responsable validation |
|---|-----------|-------------------|----------------------|
| H1 | Les livreurs disposent d'un smartphone Android (fourni ou BYOD encadré) | Blocage matériel | DSI + RH |
| H2 | L'OMS expose une API REST pour la réception d'événements sans modification de son cœur | Retard d'intégration significatif | M. Garnier |
| H3 | Les 4 motifs de non-livraison couvrent 90 % des cas terrain réels | Motifs manquants → contournements livreur | Pierre + M. Renaud |
| H4 | Le SSO corporate peut être étendu aux livreurs terrain | Blocage authentification | DSI |
| H5 | La connectivité réseau mobile est suffisante sur les zones de tournée | Ruptures fréquentes → stratégie offline renforcée | M. Garnier |
| H6 | Le TMS expose une API REST permettant l'import des tournées du matin avant 6h00 | Import impossible → saisie manuelle de secours uniquement | M. Garnier, M. Renaud |

---

## Définition of Done (DoD) appliquée à chaque User Story MVP

Une User Story est considérée terminée (Done) quand :

1. Le code est implémenté, revu et mergé sur la branche principale.
2. Les tests unitaires couvrent les invariants du domaine (taux > 80 %).
3. Les scénarios Gherkin de la US sont automatisés et passent en vert.
4. La US est déployée en environnement "recette" et validée fonctionnellement par le PO.
5. Les Domain Events attendus sont effectivement émis et vérifiables dans le store
   d'événements.
6. L'accessibilité mobile est testée (usage d'une seule main, lisibilité en plein soleil).
7. Le mode offline est testé pour les US concernées (US-006, US-008, US-009).
8. La conformité RGPD est vérifiée pour les US manipulant des données personnelles.
