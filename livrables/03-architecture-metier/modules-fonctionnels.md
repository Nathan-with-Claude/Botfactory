# Architecture Fonctionnelle DocuPost — Modules Fonctionnels

> Document de référence — Version 1.0 — 2026-03-19
> Produit à partir des entretiens métier (Pierre livreur, Mme Dubois DSI, M. Garnier
> Architecte Technique, M. Renaud Responsable Exploitation Logistique), du domain model
> et de la capability map (/livrables/03-architecture-metier/).
>
> Ce document décrit le découpage fonctionnel en modules cohérents, alignés sur les
> Bounded Contexts du domain model. Chaque module est autonome sur son périmètre
> et communique avec les autres via des interfaces contractuelles explicites
> (événements de domaine, commandes, queries).
>
> Périmètre : MVP uniquement, sauf mention explicite post-MVP.

---

## Vue d'ensemble des modules

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION DocuPost                            │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              MODULE 1 — Orchestration de Tournée                │   │
│  │  [Core Domain]  Tournée · Colis · Statut · Incident             │   │
│  └────────────────────────┬──────────────────────────┬────────────┘   │
│           Events           │                          │ Commands        │
│                            ▼                          ▼                 │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────┐    │
│  │   MODULE 2      │  │    MODULE 3       │  │    MODULE 4        │    │
│  │  Gestion des    │  │  Supervision &    │  │  Notification &    │    │
│  │  Preuves        │  │  Pilotage         │  │  Messaging         │    │
│  │  [Supporting]   │  │  [Core Domain]    │  │  [Supporting]      │    │
│  └────────┬────────┘  └────────┬──────────┘  └────────┬───────────┘    │
│           │ Events              │ Events               │ Push            │
│           ▼                     ▼                      ▼                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              MODULE 5 — Intégration SI (OMS / ACL)              │   │
│  │  [Generic]  Event Store · API REST OMS                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌───────────────────────┐  ┌──────────────────────────────────────┐   │
│  │   MODULE 6            │  │  MODULE 7 — Reporting Opérationnel   │   │
│  │  Identité et Accès    │  │  [Supporting]                        │   │
│  │  [Generic / SSO]      │  │                                      │   │
│  └───────────────────────┘  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Module 1 — Orchestration de Tournée

**Bounded Context** : BC-01 Orchestration de Tournée
**Classification DDD** : Core Domain
**Plateforme** : Backend Java 21 / Spring Boot + Application mobile Android

### Responsabilité

Gérer le cycle de vie complet d'une tournée et de chaque colis qui la compose, depuis le
chargement de la tournée le matin jusqu'à la clôture en fin de journée. C'est le module
central de DocuPost.

"Le livreur est actuellement hors du SI dès son départ en tournée." (Vision produit)

### Entités et agrégats gérés

| Élément | Type DDD | Description |
|---|---|---|
| Tournée | Aggregate Root | Cycle de vie complet : chargée → démarrée → en cours → clôturée |
| Colis | Entity (dans Tournée) | Unité de livraison avec statut évolutif |
| Incident | Entity (dans Tournée) | Aléa terrain déclaré par le livreur |
| Adresse | Value Object | Adresse de livraison avec zone géographique |
| StatutColis | Value Object | à livrer / livré / échec / à représenter |
| MotifNonLivraison | Value Object | absent / accès impossible / refus / horaires |
| Disposition | Value Object | à représenter / tiers / retour dépôt |
| Avancement | Value Object | Calculé : colis traités / total + estimation fin |

### Capacités couvertes

- 1.1 Gestion de la tournée (chargement, organisation, progression, clôture)
- 1.2 Gestion du cycle de vie des colis (consultation, mise à jour statut, contraintes)
- 1.3 Gestion des échecs (motif normalisé, disposition, offline)

### Commandes exposées (API interne)

| Commande | Déclencheur | Préconditions |
|---|---|---|
| ChargerTournee(livreurId, date) | Authentification livreur | Livreur authentifié, tournée assignée |
| DemarrerTournee(tourneeId) | Premier accès liste | Tournée chargée, au moins 1 colis |
| ConfirmerLivraison(colisId, preuveLivraisonId) | Livreur valide une livraison | Colis à statut "à livrer", preuve capturée |
| DeclarerEchec(colisId, motif, disposition) | Livreur déclare un échec | Colis à statut "à livrer", motif obligatoire |
| AppliquerInstruction(instructionId) | Instruction reçue | Instruction valide, tournée active |
| CloturerTournee(tourneeId) | Livreur clôture | Tous les colis dans un statut terminal |

### Queries exposées

| Query | Réponse |
|---|---|
| GetTourneeDuJour(livreurId) | Tournée complète avec liste des colis |
| GetDetailColis(colisId) | Détail colis + historique tentatives |
| GetAvancement(tourneeId) | Avancement calculé + estimation fin |

### Domain Events émis

TournéeChargée, TournéeDémarrée, LivraisonConfirmée, ÉchecLivraisonDéclaré,
MotifEnregistré, DispositionEnregistrée, IncidentDéclaré, TournéeModifiée, TournéeClôturée

### Interactions avec autres modules

| Module cible | Type | Mécanisme | Données échangées |
|---|---|---|---|
| Module 2 — Gestion des Preuves | Event (consommateur) | PreuveCapturée → déclenche ConfirmerLivraison | preuveLivraisonId |
| Module 3 — Supervision | Event (émetteur) | Domain Events → tableau de bord | Tous les events de tournée |
| Module 4 — Notification | Command (consommateur) | InstructionReçue → AppliquerInstruction | instructionId, type, colisId |
| Module 5 — Intégration SI | Event (émetteur) | Tous events de statut → OMS | événements normalisés |
| Module 6 — Identité | Query (consommateur) | Token OAuth2 → identité livreur | livreurId, rôle |

### Règles métier critiques

1. Statut normalisé obligatoire — aucun champ libre pour les motifs.
2. Transition de statut unidirectionnelle : à livrer → livré ou à livrer → échec.
3. Clôture impossible si au moins un colis est encore "à livrer".
4. Mode offline-first : toutes les actions sont réalisables sans connexion.

---

## Module 2 — Gestion des Preuves de Livraison

**Bounded Context** : BC-02 Gestion des Preuves
**Classification DDD** : Supporting Subdomain
**Plateforme** : Backend Java 21 / Spring Boot + composant natif Android

### Responsabilité

Capturer, stocker et garantir l'opposabilité des preuves de livraison numériques.
Chaque preuve est immuable après création.

"On a besoin que chaque livraison produise une preuve opposable avec horodatage et
géolocalisation. Aujourd'hui, en cas de litige, on est souvent démunis." (Mme Dubois)

### Entités et agrégats gérés

| Élément | Type DDD | Description |
|---|---|---|
| PreuveLivraison | Aggregate Root | Preuve immuable associée à un colis livré |
| TypePreuve | Value Object | signature / photo / tiers / dépôt sécurisé |
| SignatureNumerique | Value Object | Image de signature, capturée sur pad tactile |
| PhotoPreuve | Value Object | URL + hash d'intégrité de la photo |
| TiersIdentifié | Value Object | Nom et adresse du tiers ayant réceptionné |
| DepotSecurisé | Value Object | Description du lieu de dépôt |
| Coordonnees | Value Object | Latitude / longitude au moment de la capture |

### Capacités couvertes

- 2.1 Capture de preuve de livraison (4 types)
- 2.2 Accès aux preuves par le support client (< 5 minutes)

### Commandes exposées

| Commande | Déclencheur | Préconditions |
|---|---|---|
| CapturePreuve(colisId, type, donnees) | Livreur valide la preuve sur M-04 | Colis en cours de livraison, au moins un type de preuve fourni |

### Queries exposées

| Query | Réponse |
|---|---|
| GetPreuveByColis(colisId) | PreuveLivraison complète avec metadata |
| GetPreuveByTournee(tourneeId) | Liste des preuves de la tournée |

### Domain Events émis

PreuveCapturée (contient : preuveLivraisonId, colisId, type, horodatage, coordonnees,
livreurId)

### Interactions avec autres modules

| Module cible | Type | Mécanisme | Données échangées |
|---|---|---|---|
| Module 1 — Orchestration | Event (émetteur) | PreuveCapturée → déclenchement ConfirmerLivraison | preuveLivraisonId |
| Module 5 — Intégration SI | Event (émetteur) | PreuveCapturée → historisation immuable | preuveLivraisonId + metadata |

### Règles métier critiques

1. Une preuve est obligatoire pour confirmer toute livraison.
2. Horodatage et coordonnées sont capturés automatiquement — non modifiables.
3. Une PreuveLivraison est immuable après création (opposabilité juridique).
4. Mode dégradé GPS documenté : livraison confirmable sans coordonnées avec alerte
   automatique au superviseur.

---

## Module 3 — Supervision et Pilotage

**Bounded Context** : BC-03 Supervision
**Classification DDD** : Core Domain
**Plateforme** : Backend Java 21 / Spring Boot + Frontend React 19 / TypeScript (web)

### Responsabilité

Agréger l'avancement de toutes les tournées en temps réel, détecter automatiquement les
tournées à risque, permettre l'envoi d'instructions structurées aux livreurs. Remplace
le pilotage par téléphone.

"Je pilote à l'aveugle. Je sais seulement ce que le livreur me dit quand il m'appelle."
(M. Renaud)

### Entités et agrégats gérés

| Élément | Type DDD | Description |
|---|---|---|
| VueTournee | Read Model | Projection agrégée de l'état d'une tournée pour le superviseur |
| VueColis | Read Model | Projection de l'état d'un colis dans le contexte supervision |
| Instruction | Aggregate Root | Ordre structuré envoyé par le superviseur |
| TypeInstruction | Value Object | prioriser / annuler / reprogrammer |
| StatutInstruction | Value Object | envoyée / prise en compte / exécutée |

### Capacités couvertes

- 3.1 Tableau de bord des tournées (vue agrégée, détail, récapitulatif)
- 3.2 Détection des tournées à risque (calcul d'écart, déclenchement alerte)
- 3.3 Instruction aux livreurs (envoi, suivi d'exécution)

### Commandes exposées

| Commande | Déclencheur | Préconditions |
|---|---|---|
| EnvoyerInstruction(tourneeId, colisId, type, superviseurId) | Superviseur valide W-03 | Tournée active, colis "à livrer", pas d'instruction en cours |

### Queries exposées

| Query | Réponse |
|---|---|
| GetTableauDeBord(date) | Liste des VueTournee du jour avec statuts agrégés |
| GetDetailTournee(tourneeId) | VueTournee + liste VueColis + incidents |
| GetInstructionsEnCours(tourneeId) | Instructions actives non exécutées |

### Domain Events émis

TournéeÀRisqueDétectée, AlerteDéclenchée, InstructionEnvoyée, InstructionExécutée

### Domain Events consommés

TournéeDémarrée, LivraisonConfirmée, ÉchecLivraisonDéclaré, IncidentDéclaré,
TournéeClôturée (depuis Module 1)

### Interactions avec autres modules

| Module cible | Type | Mécanisme | Données échangées |
|---|---|---|---|
| Module 1 — Orchestration | Event (consommateur) | Events tournée → mise à jour VueTournee | Tous les events de tournée |
| Module 4 — Notification | Command (émetteur) | InstructionEnvoyée → push livreur | instructionId, livreurId, contenu |
| Module 4 — Notification | Event (émetteur) | AlerteDéclenchée → notification superviseur | tourneeId, type alerte |
| Module 7 — Reporting | Event (émetteur) | TournéeClôturée → agrégation KPIs | Données de synthèse tournée |

### Règles métier critiques

1. Un colis ne peut recevoir qu'une seule Instruction en attente à la fois.
2. Instruction de type "reprogrammer" requiert obligatoirement un créneau cible.
3. La détection d'une tournée à risque doit déclencher une alerte en moins de 15 minutes.
4. Toute instruction est historisée avec l'identité du superviseur émetteur.
5. Le tableau de bord est mis à jour en moins de 30 secondes après toute action terrain.

---

## Module 4 — Notification et Messaging

**Bounded Context** : BC-04 Notification
**Classification DDD** : Supporting Subdomain
**Plateforme** : Backend Java 21 / Spring Boot (service de transit)

### Responsabilité

Acheminer les notifications push vers les livreurs (instructions, ajouts de colis) et
les alertes vers le superviseur (tournées à risque, incidents). Ce module découple
l'émetteur du canal de livraison.

### Entités gérées

Ce module ne possède pas d'agrégat propre. Il est un service de transit.

| Élément | Type | Description |
|---|---|---|
| NotificationPush | Value Object | Message push formaté pour l'app Android livreur |
| AlerteSupervision | Value Object | Signal visuel/sonore pour le tableau de bord web |

### Capacités couvertes

- 4.1 Notification push livreur (instruction, ajout de colis)
- 4.2 Alerte superviseur (tournée à risque, incident terrain)

### Commandes reçues

| Commande source | Action | Résultat |
|---|---|---|
| InstructionEnvoyée (Module 3) | Envoyer push au livreur concerné | InstructionReçue côté livreur |
| AlerteDéclenchée (Module 3) | Notifier le tableau de bord superviseur | Mise à jour visuelle/sonore W-01 |
| IncidentDéclaré (Module 1) | Notifier le superviseur | Indicateur incident sur W-01 |

### Domain Events émis

InstructionReçue (confirmant la livraison de la notification au livreur)

### Interactions avec autres modules

| Module cible | Type | Mécanisme | Données échangées |
|---|---|---|---|
| Module 1 — Orchestration | Event (émetteur) | InstructionReçue → AppliquerInstruction | instructionId |
| Module 3 — Supervision | Event (consommateur) | InstructionEnvoyée, AlerteDéclenchée | instructionId, tourneeId |

---

## Module 5 — Intégration SI (OMS / ACL)

**Bounded Context** : BC-05 Intégration SI / OMS
**Classification DDD** : Generic Subdomain
**Plateforme** : Backend Java 21 / Spring Boot (Anti-Corruption Layer)

### Responsabilité

Traduire les événements DocuPost en appels API REST vers l'OMS externe, sans modifier
le cœur OMS. Garantir l'historisation immuable de chaque événement de livraison.

"Tout changement de statut colis doit générer un événement synchronisé vers l'OMS. Les
flux doivent passer par API / ESB, sans modification du cœur OMS." (M. Garnier)

### Entités gérées

| Élément | Type | Description |
|---|---|---|
| EvenementLivraison | Value Object immuable | Représentation immuable d'un fait métier : qui / quoi / quand / coordonnées |
| StatutSynchronisation | Value Object | pending / synchronized / failed / retried |

### Capacités couvertes

- 5.1 Synchronisation OMS (émission normalisée, rejeu en cas d'échec)
- 5.2 Historisation des événements (store immuable, audit)

### Events consommés et actions correspondantes

| Event source | Action | SLA |
|---|---|---|
| LivraisonConfirmée (Module 1) | Appel API REST OMS + historisation | < 30 secondes |
| ÉchecLivraisonDéclaré (Module 1) | Appel API REST OMS + historisation | < 30 secondes |
| PreuveCapturée (Module 2) | Attachement de la preuve à l'événement OMS | < 30 secondes |
| TournéeClôturée (Module 1) | Appel API REST OMS (synthèse tournée) | < 30 secondes |
| Tout event en échec de transmission | Mise en queue de rejeu | Rattrapage < 10 minutes |

### Interactions avec autres modules

| Module source | Type | Mécanisme |
|---|---|---|
| Module 1 — Orchestration | Event (consommateur) | Tous events de statut colis |
| Module 2 — Gestion des Preuves | Event (consommateur) | PreuveCapturée |
| OMS Externe | API REST (émetteur) | POST /statuts, POST /événements (ACL) |

### Règles critiques

1. Chaque événement contient obligatoirement : livreurId, action, horodatage, coordonnées.
2. Aucun événement ne peut être modifié ou supprimé après création (immuabilité).
3. Les événements non transmis en temps réel sont mis en queue et rejoués dès retour
   de connexion (stratégie at-least-once delivery).
4. Ce module ne contient aucune logique métier DocuPost : il traduit et route.

---

## Module 6 — Identité et Accès

**Bounded Context** : BC-06 Identité et Accès
**Classification DDD** : Generic Subdomain (délégation SSO)
**Plateforme** : Délégation au SSO corporate OAuth2 (Docaposte)

### Responsabilité

Authentifier livreurs et superviseurs via le SSO corporate. Exposer l'identité
authentifiée aux autres modules sous forme de token JWT.

"Authentification via OAuth2 / SSO corporate pour livreurs et superviseurs." (M. Garnier)

### Capacités couvertes

- 6.1 Authentification et accès (SSO OAuth2, droits par rôle)
- 6.2 Profil livreur (affectation à une tournée)

### Interface contractuelle

| Interface | Description |
|---|---|
| Token JWT | Contient : userId, rôle (LIVREUR / SUPERVISEUR / ADMIN), expiration |
| Shared Kernel | Le userId (LivreurId / SuperviseurId) est utilisé par tous les modules comme clé d'identité |

### Interactions avec autres modules

Tous les modules consomment le token JWT pour identifier l'acteur. Aucun module ne doit
gérer lui-même l'authentification.

---

## Module 7 — Reporting Opérationnel

**Classification DDD** : Supporting Subdomain
**Plateforme** : Backend Java 21 / Spring Boot + Frontend React 19 / TypeScript (web)

### Responsabilité

Agréger et exposer les KPIs opérationnels du jour pour le superviseur et la DSI : taux
de livraison, taux d'échec, incidents, respect des SLA.

"Alimenter les KPIs opérationnels et contractuels." (Mme Dubois)

### Capacités couvertes (MVP)

- 7.1.1 KPIs temps réel superviseur (taux livraison, échecs, incidents)
- 7.1.2 Récapitulatif de tournée clôturée

### Events consommés

TournéeClôturée, LivraisonConfirmée, ÉchecLivraisonDéclaré (depuis Module 1 via event bus)

### Queries exposées

| Query | Réponse |
|---|---|
| GetKpisDuJour(date) | Taux de livraison, nombre d'échecs, incidents, alertes |
| GetRecapTournee(tourneeId) | Synthèse complète d'une tournée clôturée |

---

## Matrice de dépendances inter-modules

> Lecture : la cellule (ligne X, colonne Y) indique comment le module X dépend du module Y.
> "Events" = consomme les événements. "Commands" = envoie des commandes. "Queries" = requêtes.
> "-" = pas de dépendance directe.

|  | M1 Orchestration | M2 Preuves | M3 Supervision | M4 Notification | M5 Intégration SI | M6 Identité | M7 Reporting |
|---|---|---|---|---|---|---|---|
| **M1 Orchestration** | — | Events (PreuveCapturée) | Commands (ApplInstr.) | Events (InstructionReçue) | Events (tous statuts) | Queries (token) | — |
| **M2 Preuves** | Commands (ConfirmerLivraison) | — | — | — | Events (PreuveCapturée) | Queries (token) | — |
| **M3 Supervision** | Events (tous events tournée) | Events (PreuveCapturée) | — | Commands (InstrEnvoyée) | — | Queries (token) | Events (clôture) |
| **M4 Notification** | Commands (AppliquerInstr.) | — | Events (InstrEnvoyée, AlerteDéclenchée) | — | — | — | — |
| **M5 Intégration SI** | Events (consommateur) | Events (consommateur) | — | — | — | — | — |
| **M6 Identité** | — | — | — | — | — | — | — |
| **M7 Reporting** | Events (consommateur) | — | — | — | — | — | — |

---

## Interfaces contractuelles — Récapitulatif

### Événements de domaine (bus d'événements interne)

Ces événements constituent le contrat entre modules. Ils sont immuables et versionnés.

| Événement | Émetteur | Consommateurs | Payload minimum |
|---|---|---|---|
| TournéeChargée | M1 | M3 | tourneeId, livreurId, date, nombreColis |
| TournéeDémarrée | M1 | M3, M5 | tourneeId, livreurId, horodatage |
| LivraisonConfirmée | M1 | M3, M5 | tourneeId, colisId, preuveLivraisonId, horodatage, coordonnees |
| ÉchecLivraisonDéclaré | M1 | M3, M5 | tourneeId, colisId, motif, disposition, horodatage, coordonnees |
| IncidentDéclaré | M1 | M3, M4, M5 | incidentId, colisId, motif, note, horodatage |
| TournéeModifiée | M1 | M3, M5 | tourneeId, instructionId, modification |
| TournéeClôturée | M1 | M3, M5, M7 | tourneeId, recap, horodatage |
| PreuveCapturée | M2 | M1, M5 | preuveLivraisonId, colisId, type, horodatage, coordonnees |
| TournéeÀRisqueDétectée | M3 | M4 | tourneeId, retardEstime, horodatage |
| AlerteDéclenchée | M3 | M4 | tourneeId, superviseurId |
| InstructionEnvoyée | M3 | M4 | instructionId, livreurId, type, colisId |
| InstructionReçue | M4 | M1 | instructionId |
| InstructionExécutée | M3 | (tableau de bord) | instructionId, horodatage |

### Commandes (interfaces synchrones entre modules)

| Commande | Émetteur | Destinataire | Préconditions |
|---|---|---|---|
| ChargerTournee | App Mobile (livreur) | M1 | Livreur authentifié, date valide |
| CapturePreuve | App Mobile (livreur) | M2 | Colis en cours de livraison |
| ConfirmerLivraison | M2 (via PreuveCapturée) | M1 | Preuve valide capturée |
| EnvoyerInstruction | Interface Web (superviseur) | M3 | Tournée active, colis à livrer |
| AppliquerInstruction | M4 (via InstructionReçue) | M1 | Instruction valide, tournée active |

---

## Principes d'architecture fonctionnelle

### 1. Séparation Command / Query (CQRS allégé)
Le Module 3 (Supervision) maintient ses propres Read Models (VueTournee, VueColis)
construits à partir des Domain Events du Module 1. La supervision ne requête jamais
directement le modèle d'écriture de l'Orchestration.

### 2. Anti-Corruption Layer OMS (Module 5)
Le Module 5 est le seul point d'intégration avec l'OMS externe. Aucun autre module
ne connaît le format ou le protocole de l'OMS. Cette isolation protège le modèle
DocuPost de toute évolution de l'OMS externe.
"Les flux doivent passer par API / ESB, sans modification du cœur OMS." (M. Garnier)

### 3. Offline-first (Module 1 + Module 2)
Les Modules 1 et 2 fonctionnent en mode offline sur l'application mobile. Les
commandes et événements sont stockés localement (event store local) et rejoués dès
le retour de la connexion. Le Module 5 gère le rejeu vers l'OMS.

### 4. Immutabilité des événements
Tout Domain Event créé dans n'importe quel module est immuable. Aucune modification
ni suppression n'est autorisée après création. Cette règle est technique ET métier
(opposabilité juridique, audit).

### 5. Identité partagée via Shared Kernel
L'identité (livreurId, superviseurId) est le seul Shared Kernel entre modules.
Elle est fournie par le Module 6 (SSO) et consommée sans transformation par tous
les autres modules.
