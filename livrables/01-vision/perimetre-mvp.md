# Perimetre MVP DocuPost

> Document de référence — Version 1.1 — 2026-03-20
> Mis à jour suite à l'entretien complémentaire du 2026-03-20 avec M. Renaud
> (Responsable Exploitation Logistique) : ajout du Parcours 0 (Préparation des tournées),
> mise à jour des exclusions post-MVP, ajout de l'hypothèse H6.
>
> Version 1.0 produite le 2026-03-19 à partir des entretiens métier avec Pierre (livreur),
> Mme Dubois (DSI), M. Garnier (Architecte Technique) et M. Renaud (Responsable
> Exploitation Logistique).

---

## Parcours inclus

### Parcours 0 — Responsable logistique : Preparation des tournees (interface web)

Ce parcours est un prérequis bloquant au Parcours 1. Sans affectation des tournées par le
responsable logistique, aucun livreur ne dispose d'une tournée dans DocuPost. Il répond
aux pain points de M. Renaud découverts lors de l'entretien complémentaire du 2026-03-20 :
processus d'affectation matinale entièrement manuel, hors SI, sans traçabilité.

| # | Etape du parcours | Fonctionnalites associees |
|---|---|---|
| 1 | Reception des tournees TMS | Visualisation de la liste des tournées importées depuis le TMS pour le jour J : nombre de colis, zones, contraintes horaires |
| 2 | Verification de la composition | Consultation du détail de chaque tournée : colis associés, zones géographiques couvertes, créneaux horaires contraints |
| 3 | Affectation livreur et vehicule | Association manuelle d'un livreur disponible et d'un véhicule à chaque tournée ; détection des conflits (livreur absent, véhicule indisponible) |
| 4 | Validation et lancement | Validation de l'ensemble des affectations et lancement des tournées : transmission aux applications mobiles des livreurs concernés |

### Parcours 1 — Livreur : Execution de la tournee (application mobile Android)

Ce parcours est le coeur du MVP. Il traite la rupture identifiée par Pierre (livreur) et par
M. Garnier (architecte technique) : le livreur est actuellement hors du SI dès son départ
en tournée.

| # | Etape du parcours | Fonctionnalites associees |
|---|---|---|
| 1 | Prise en main de la tournee | Consultation de la liste des colis assignés au livreur pour la journée |
| 2 | Organisation des arrets | Filtrage et tri de la liste par zone géographique / proximité |
| 3 | Livraison d'un colis | Mise à jour du statut colis : livré, échec, à représenter |
| 4 | Echec de livraison | Saisie du motif normalisé : absent, accès impossible, refus client, horaires dépassés |
| 5 | Preuve de livraison | Capture numérique : signature, photo, tiers identifié, dépôt sécurisé |
| 6 | Suivi de progression | Indicateur temps réel : colis restants et estimation horaire de fin de tournée |
| 7 | Reception d'instruction | Notification push en cas d'ajout de colis ou de changement de priorité envoyé par le superviseur |

### Parcours 2 — Superviseur / Responsable exploitation : Pilotage temps reel (interface web)

Ce parcours répond aux besoins de M. Renaud (responsable exploitation) et de Mme Dubois
(DSI). Il remplace le pilotage par téléphone par une interface de supervision structurée.

| # | Etape du parcours | Fonctionnalites associees |
|---|---|---|
| 1 | Vue globale | Tableau de bord web : liste des tournées du jour avec statut d'avancement en temps réel |
| 2 | Detail d'une tournee | Consultation des colis de la tournée (statuts, incidents, localisation du livreur) |
| 3 | Detection des risques | Alertes automatiques sur les tournées présentant un retard significatif |
| 4 | Instruction au livreur | Envoi d'une instruction simple : prioriser un colis, annuler, reprogrammer |

### Parcours 3 — Integration SI : Remontee des evenements

Ce parcours est requis pour que DocuPost soit une brique SI officielle (M. Garnier) et pour
garantir la conformité et l'exploitabilité des données (Mme Dubois).

| # | Etape | Fonctionnalites associees |
|---|---|---|
| 1 | Emission d'evenements | Chaque changement de statut colis génère un événement normalisé transmis à l'OMS via API REST |
| 2 | Historisation | Chaque événement est historisé de manière immuable avec : livreur, action, horodatage, géolocalisation |
| 3 | Authentification | Connexion via OAuth2 / SSO corporate pour les livreurs et les superviseurs |

---

## Parcours exclus (post-MVP)

Ces parcours ont été identifiés comme pertinents lors des entretiens mais sont exclus du MVP
pour maintenir la faisabilité du premier déploiement.

| Parcours exclu | Justification | Release envisagee |
|---|---|---|
| Optimisation automatique de l'ordre des arrets (routage) | Complexité algorithmique élevée ; les livreurs adaptent déjà leur ordre par expérience terrain | Release 2 |
| Notification proactive du client final (SMS, email) avant passage | Nécessite une intégration CRM et une gestion du consentement RGPD supplémentaire | Release 2 |
| Reprogrammation en ligne par le client final | Parcours client externe hors périmètre MVP | Release 3 |
| Analyse de performance avancee (benchmarking inter-tournees) | Les KPIs de base sont suffisants pour la phase d'apprentissage MVP | Release 2 |
| Affectation automatique optimisee (algorithme de dispatch) | L'affectation manuelle est dans le MVP (Parcours 0) ; l'optimisation algorithmique nécessite un modèle de contraintes véhicule/capacité non spécifié à ce stade | Release 3 |
| Integration CRM et ERP | Phase 1 limitée à l'OMS pour maîtriser la complexité d'intégration | Release 2 |
| Application iOS | Android prioritaire sur le parc matériel actuel des livreurs Docaposte | Release 2 |
| Gestion des vehicules et capacites de chargement | Hors scope de la gestion terrain des colis ; la gestion de disponibilité véhicule dans le Parcours 0 est limitée à une liste statique | Release 3 |
| Facturation automatisee | Dépend de l'intégration ERP (post-MVP) | Release 3 |
| Portail client de suivi en autonomie | Parcours client externe, hors périmètre MVP | Release 3 |

---

## Contraintes de planning

| Contrainte | Detail |
|---|---|
| Environnements requis | dev / recette / préprod / prod (imposé par M. Garnier) |
| Plateforme mobile cible MVP | Android uniquement |
| Normes de securite | OAuth2 / SSO corporate obligatoire dès le MVP |
| Conformite donnees | RGPD : chiffrement TLS/HTTPS, données personnelles (géolocalisation) minimisées et consentement documenté |
| Stack technique imposee | Java 21 / Spring Boot 4.0.3 — React 19 / TypeScript 5.6 — Docker / Kubernetes — CI/CD GitHub Actions |
| Integration SI | API REST uniquement, sans modification du cœur OMS |
| Observabilite | Modalités à définir avec M. Garnier (mentionné comme exigence, périmètre non encore spécifié) |

---

## Hypotheses

| # | Hypothese | Risque si invalide | Action de validation |
|---|---|---|---|
| H1 | Les livreurs Docaposte disposent d'un smartphone Android fourni par l'entreprise ou acceptent d'utiliser le leur dans un cadre BYOD encadré | Blocage matériel : retard de déploiement terrain | Confirmer avec la DSI et le responsable RH avant le lancement du développement |
| H2 | L'OMS expose une API REST permettant la réception d'événements de statut colis sans modification de son cœur applicatif | Retard d'intégration significatif | Obtenir la documentation API OMS et valider avec M. Garnier dès la phase d'architecture technique |
| H3 | Les motifs de non-livraison identifiés (absent, accès impossible, refus, horaires) couvrent 90 % des cas terrain réels | Motifs manquants entraînant des contournements livreur | Valider avec Pierre et M. Renaud sur un échantillon de tournées réelles avant développement |
| H4 | Le SSO corporate peut être étendu aux livreurs terrain (population potentiellement sans compte SI actif) | Blocage authentification : nécessité d'un mode dégradé | Confirmer la couverture du SSO auprès de la DSI avant la phase d'architecture |
| H5 | La connectivité réseau mobile est suffisante sur les zones de tournée pour garantir la remontée temps réel | Ruptures de synchronisation fréquentes en zones blanches | Définir une stratégie offline-first dans l'architecture technique si les zones concernées sont significatives |
| H6 | Le TMS expose une API ou un flux d'export (fichier structuré, webhook) permettant l'import automatique des tournées du jour dans DocuPost sans ressaisie manuelle | Import manuel des tournées : charge opérationnelle résiduelle pour M. Renaud et risque d'erreur de saisie | Obtenir la documentation d'interface du TMS et confirmer le mode d'exposition avec M. Garnier et M. Renaud avant la phase d'architecture technique |

---

## Classification strategique des domaines (DDD)

| Domaine pressenti | Type | Justification business |
|---|---|---|
| Orchestration de tournee en temps reel | **Core Domain** | C'est le differenciateur central de DocuPost : connecter livreur, superviseur et SI en temps reel avec une logique de statut, d'alerte et d'instruction. Aucun outil generique ne couvre ce besoin metier specifique a Docaposte. Investissement maximal en conception DDD justifie. |
| Preparation et affectation des tournees | **Core Domain** | Constitue le "Parcours 0" sans lequel aucune tournee ne peut etre executee. La logique d'affectation (livreur, vehicule, contraintes TMS) et de validation avant depart est specifique au metier de Docaposte et conditionne l'ensemble de la chaine de valeur. A traiter avec le meme niveau d'investissement DDD que l'orchestration temps reel. |
| Gestion des preuves de livraison | Supporting Subdomain | Necessaire au Core (conditions d'opposabilite juridique) mais la logique metier est relativement stable et bornee. Peut etre concu en modele riche interne mais sans l'investissement du Core. |
| Gestion des utilisateurs (livreurs, superviseurs) | Supporting Subdomain | Necessaire mais sans differentiation : affectation, profils, roles. |
| Notification et messaging (push, instruction) | Supporting Subdomain | Supporte le Core Domain mais peut s'appuyer sur des patterns standards (event-driven, message broker). |
| Authentification / SSO | Generic Subdomain | Solution off-the-shelf imposee par la DSI (OAuth2 / SSO corporate). Aucune conception specifique requise. |
| Cartographie / geolocalisation | Generic Subdomain | Service tiers standard (Google Maps, Mapbox ou equivalent). Aucune conception specifique requise. |
| Integration OMS (API REST) | Generic Subdomain | Adapter d'integration standard. La logique metier est dans l'OMS, pas dans DocuPost. Implementer via un Anti-Corruption Layer sans modele riche. |
| Integration TMS (import tournees) | Generic Subdomain | Adaptateur d'import entrant. La generation des tournees appartient au TMS. DocuPost consomme le flux sans reimplementer la logique de routage. Implementer via un Anti-Corruption Layer. |

> **Core Domain identifie : Orchestration de tournee en temps reel ET Preparation / affectation
> des tournees.**
>
> Ces deux sous-domaines forment ensemble l'avantage concurrentiel de DocuPost : ils couvrent
> le cycle de vie complet d'une tournee, de la preparation au depot jusqu'a la cloture terrain.
> L'orchestration temps reel concentre la logique de gestion d'etat des colis, de detection
> de risque, de transmission d'instructions et de synchronisation. La preparation des tournees
> concentre la logique d'import TMS, de verification et d'affectation qui conditionne l'execution.
> Les deux doivent faire l'objet d'un investissement maximal en modelisation DDD (Agregats,
> Value Objects, Domain Events). Les autres sous-domaines doivent etre traites de maniere
> plus legere ou deleguee a des solutions existantes.


---
