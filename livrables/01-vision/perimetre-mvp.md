# Perimetre MVP DocuPost

> Document de référence — Version 1.2 — 2026-04-21
> Produit à partir des entretiens métier avec Pierre (livreur), Mme Dubois (DSI),
> M. Garnier (Architecte Technique), M. Renaud (Responsable Exploitation Logistique)
> et Karim B. (Superviseur logistique terrain, Île-de-France Sud).

---

## Parcours inclus

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
Il est complété par la feature Broadcast (voir section dédiée ci-dessous) suite à l'entretien
avec Karim B. du 21/04/2026.

| # | Etape du parcours | Fonctionnalites associees |
|---|---|---|
| 1 | Vue globale | Tableau de bord web : liste des tournées du jour avec statut d'avancement en temps réel |
| 2 | Detail d'une tournee | Consultation des colis de la tournée (statuts, incidents, localisation du livreur) |
| 3 | Detection des risques | Alertes automatiques sur les tournées présentant un retard significatif |
| 4 | Instruction au livreur | Envoi d'une instruction simple : prioriser un colis, annuler, reprogrammer |
| 5 | Broadcast groupe | Envoi d'un message d'alerte ou d'information à N livreurs simultanément (tous ou par secteur), avec statut "vu" et historique du jour |

---

### Feature : Broadcast superviseur → livreurs

> Décision d'arbitrage @sponsor — 2026-04-21 — Source : entretien Karim B.
> (Entretien_broadcast_superviseur_21_04.md, synthese-entretiens.md §[2026-04-21])

#### Décision : incluse dans le MVP

##### Justification business

Le besoin de communication de masse vers les livreurs est une lacune structurelle identifiée
dans le Parcours 2 tel que défini initialement. L'étape 4 existante (instruction au livreur)
couvre un livreur sur un colis précis. Elle ne couvre pas les alertes opérationnelles de zone
ou de journée, qui sont indépendantes de tout colis (fermeture de voie, fermeture anticipée
du dépôt, incident matériel, consigne de sécurité).

Sans cette feature, les superviseurs continueront d'utiliser WhatsApp informel et le téléphone
dès les premières semaines de déploiement, compromettant directement l'adoption de la
plateforme. Ce risque d'adoption est jugé plus élevé que le risque de charge planning.

Par ailleurs, l'infrastructure push (FCM) est déjà en place pour le Parcours 1 (notifications
livreur). L'extension à un modèle broadcast ne nécessite pas de refonte de l'infrastructure.

Fréquence terrain confirmée : 2 à 4 incidents par semaine nécessitant une communication
urgente. Signal renforcé : 3 superviseurs de la même agence expriment le même besoin.

#### Scope retenu pour le MVP

| Critère | Décision MVP |
|---|---|
| Ciblage | Tous les livreurs actifs du jour + par secteur prédéfini (liste fixe à configurer) |
| Canal | Notification push via FCM — app en arrière-plan couverte |
| Type de message | Libellé normalisé (Alerte / Info / Consigne) + texte libre (max 280 caractères) |
| Statut de lecture | Statut "vu" par livreur visible depuis le tableau de bord superviseur |
| Historique | Messages de la journée consultables depuis le tableau de bord superviseur |
| Expérience livreur | Zone dédiée dans l'app mobile pour consulter les messages reçus tout au long de la tournée |
| Nombre de clics | Maximum 3 clics depuis le tableau de bord superviseur pour envoyer |
| Sens de communication | Unidirectionnel uniquement (pas de réponse livreur) |

#### Hors scope MVP (report en Release 2)

- Sélection manuelle livreur par livreur (ciblage individuel multiple) — Release 2
- Programmation différée d'un message — Release 2
- Gabarits de messages réutilisables — Release 2
- Export ou archivage long terme des broadcasts — Release 2

#### Contraintes et dépendances

- Dépend de l'infrastructure FCM déjà mise en place pour le Parcours 1.
- Nouveau concept métier : `BroadcastMessage` — Aggregate Root à modéliser dans le
  BC-Supervision (BC-03) ou dans un sous-domaine "Communication opérationnelle" à trancher
  par @architecte-metier.
- La notion de "secteur prédéfini" doit être alignée avec le modèle de données existant des
  tournées (zones géographiques déjà codifiées dans le TMS ou à définir dans DocuPost).
- Le statut "vu" implique un read model côté backend (événement FCM delivery receipt ou
  accusé de réception app mobile) — à spécifier avec @architecte-technique.

#### Classification DDD de la feature

| Domaine pressenti                                      | Type                 | Justification                    |
|--------------------------------------------------------|----------------------|----------------------------------|
| BroadcastMessage (Communication opérationnelle groupe) | Supporting Subdomain | Voir note de classification (1). |

> **(1)** Logique bornée — envoi, ciblage, statut de lecture — sans différenciation
> concurrentielle propre. Pattern standard qui s'appuie sur le Core Domain
> (Orchestration de tournée) pour connaître les livreurs actifs et leurs zones.

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
| Redistribution automatique de colis entre livreurs | Nécessite une logique de capacité et de contraintes véhicule non spécifiée | Release 3 |
| Integration CRM et ERP | Phase 1 limitée à l'OMS pour maîtriser la complexité d'intégration | Release 2 |
| Application iOS | Android prioritaire sur le parc matériel actuel des livreurs Docaposte | Release 2 |
| Gestion des vehicules et capacites de chargement | Hors scope de la gestion terrain des colis | Release 3 |
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

---

## Classification strategique des domaines (DDD)

| Domaine pressenti | Type | Justification business |
|---|---|---|
| Orchestration de tournee en temps reel | **Core Domain** | C'est le differenciateur central de DocuPost : connecter livreur, superviseur et SI en temps reel avec une logique de statut, d'alerte et d'instruction. Aucun outil generique ne couvre ce besoin metier specifique a Docaposte. Investissement maximal en conception DDD justifie. |
| Gestion des preuves de livraison | Supporting Subdomain | Necessaire au Core (conditions d'opposabilite juridique) mais la logique metier est relativement stable et bornee. Peut etre concu en modele riche interne mais sans l'investissement du Core. |
| Gestion des utilisateurs (livreurs, superviseurs) | Supporting Subdomain | Necessaire mais sans differentiation : affectation, profils, roles. |
| Notification et messaging (push, instruction) | Supporting Subdomain | Supporte le Core Domain mais peut s'appuyer sur des patterns standards (event-driven, message broker). |
| Authentification / SSO | Generic Subdomain | Solution off-the-shelf imposee par la DSI (OAuth2 / SSO corporate). Aucune conception specifique requise. |
| Cartographie / geolocalisation | Generic Subdomain | Service tiers standard (Google Maps, Mapbox ou equivalent). Aucune conception specifique requise. |
| Integration OMS (API REST) | Generic Subdomain | Adapter d'integration standard. La logique metier est dans l'OMS, pas dans DocuPost. Implementer via un Anti-Corruption Layer sans modele riche. |

> **Core Domain identifie : Orchestration de tournee en temps reel.**
>
> C'est le sous-domaine qui justifie l'existence de DocuPost. Il concentre la logique de
> gestion d'etat des colis, de detection de risque, de transmission d'instructions et de
> synchronisation en temps reel entre les acteurs. C'est ici que doit se concentrer
> l'investissement en modelisation DDD (Aggregats, Value Objects, Domain Events).
> Les autres sous-domaines doivent etre traites de maniere plus legere ou deleguee a des
> solutions existantes.
