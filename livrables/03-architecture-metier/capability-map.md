# Capability Map DocuPost

> Document de référence — Version 1.0 — 2026-03-19
> Produit à partir des entretiens métier (Pierre livreur, Mme Dubois DSI, M. Garnier
> Architecte Technique, M. Renaud Responsable Exploitation Logistique), des livrables
> de vision (/livrables/01-vision/) et du domain model (/livrables/03-architecture-metier/domain-model.md).
>
> Une Business Capability Map représente CE QUE fait l'entreprise, indépendamment de
> comment elle le fait. Elle est stable dans le temps et sert de base pour aligner
> les investissements sur les priorités métier.
>
> Classification DDD :
> - Core Domain : différenciateur stratégique de DocuPost — investissement maximal.
> - Supporting Subdomain : nécessaire mais sans différenciation — modèle interne solide.
> - Generic Subdomain : solution off-the-shelf possible — minimiser l'investissement.

---

## Vue d'ensemble hiérarchique

```
DocuPost
├── 1. Gestion de l'exécution terrain           [Core Domain]
│   ├── 1.1 Gestion de la tournée
│   ├── 1.2 Gestion du cycle de vie des colis
│   └── 1.3 Gestion des échecs de livraison
├── 2. Capture et gestion des preuves           [Supporting]
│   ├── 2.1 Capture de preuve de livraison
│   └── 2.2 Accès aux preuves (support client)
├── 3. Supervision et pilotage temps réel       [Core Domain]
│   ├── 3.1 Tableau de bord des tournées
│   ├── 3.2 Détection des tournées à risque
│   └── 3.3 Instruction aux livreurs
├── 4. Notification et messaging                [Supporting]
│   ├── 4.1 Notification push livreur
│   └── 4.2 Alerte superviseur
├── 5. Intégration SI                           [Generic]
│   ├── 5.1 Synchronisation OMS
│   └── 5.2 Historisation des événements
├── 6. Gestion des utilisateurs                 [Supporting]
│   ├── 6.1 Authentification et accès
│   └── 6.2 Gestion des profils et rôles
├── 7. Reporting et analytique                  [Supporting]
│   ├── 7.1 Reporting opérationnel (superviseur)
│   └── 7.2 Analyse de performance (post-MVP)
└── 8. Géolocalisation et cartographie          [Generic]
    ├── 8.1 Localisation des arrêts
    └── 8.2 Suivi de position livreur (post-MVP)
```

---

## Détail des capacités

### Domaine 1 — Gestion de l'exécution terrain

**Classification** : Core Domain
**Bounded Context** : BC-01 Orchestration de Tournée
**Justification** : "Le livreur est actuellement hors du SI dès son départ en tournée."
(Vision produit). C'est le problème central que DocuPost résout. Aucune solution
générique ne couvre ce besoin métier spécifique à Docaposte.

| Capacité | Sous-capacité | Description | Périmètre | Source entretien |
|---|---|---|---|---|
| 1.1 Gestion de la tournée | 1.1.1 Chargement de la tournée | Mettre à disposition du livreur la liste complète des colis assignés pour la journée dès l'authentification | MVP | Pierre, M. Garnier |
| 1.1 Gestion de la tournée | 1.1.2 Organisation des arrêts | Filtrer et trier dynamiquement la liste des colis par zone géographique ou proximité | MVP | Pierre |
| 1.1 Gestion de la tournée | 1.1.3 Suivi de progression | Calculer et afficher en temps réel le nombre de colis restants et l'estimation de fin de tournée | MVP | Pierre, M. Renaud |
| 1.1 Gestion de la tournée | 1.1.4 Clôture de tournée | Finaliser la tournée avec récapitulatif et déclenchement de la synchronisation finale | MVP | M. Renaud, M. Garnier |
| 1.1 Gestion de la tournée | 1.1.5 Optimisation de l'ordre des arrêts | Calcul algorithmique de l'ordre optimal des arrêts (routage) | Post-MVP R2 | Pierre |
| 1.2 Gestion du cycle de vie des colis | 1.2.1 Consultation du détail d'un colis | Accéder aux informations complètes d'un colis : destinataire, adresse, contraintes, historique | MVP | Pierre |
| 1.2 Gestion du cycle de vie des colis | 1.2.2 Mise à jour du statut colis | Changer le statut d'un colis (livré, échec, à représenter) avec horodatage et géolocalisation | MVP | Pierre, M. Garnier |
| 1.2 Gestion du cycle de vie des colis | 1.2.3 Gestion des contraintes | Afficher et respecter les contraintes de livraison (horaire, fragile, document sensible) | MVP | Pierre, Mme Dubois |
| 1.3 Gestion des échecs de livraison | 1.3.1 Saisie du motif normalisé | Enregistrer le motif d'un échec parmi la liste normalisée (absent, accès impossible, refus, horaires) | MVP | Pierre, M. Renaud |
| 1.3 Gestion des échecs de livraison | 1.3.2 Choix de la disposition | Définir le devenir du colis en échec : à représenter, tiers, retour dépôt | MVP | Pierre |
| 1.3 Gestion des échecs de livraison | 1.3.3 Gestion du mode offline | Stocker les actions localement et rejouer les événements au retour de la connexion | MVP | M. Garnier, Pierre |

---

### Domaine 2 — Capture et gestion des preuves

**Classification** : Supporting Subdomain
**Bounded Context** : BC-02 Gestion des Preuves
**Justification** : "Toute livraison doit produire une preuve opposable (horodatage,
géolocalisation, identité)." (Mme Dubois). Nécessaire au Core Domain mais logique bornée
et stable.

| Capacité | Sous-capacité | Description | Périmètre | Source entretien |
|---|---|---|---|---|
| 2.1 Capture de preuve | 2.1.1 Signature numérique | Capturer la signature du destinataire sur l'écran tactile de l'application | MVP | Pierre, Mme Dubois |
| 2.1 Capture de preuve | 2.1.2 Photo du colis | Prendre une photo du colis déposé comme preuve | MVP | Pierre, Mme Dubois |
| 2.1 Capture de preuve | 2.1.3 Identification d'un tiers | Enregistrer le nom et l'accord d'un voisin ou tiers ayant réceptionné le colis | MVP | Pierre |
| 2.1 Capture de preuve | 2.1.4 Dépôt sécurisé | Documenter le lieu de dépôt sécurisé en l'absence du destinataire | MVP | Pierre |
| 2.1 Capture de preuve | 2.1.5 Horodatage et géolocalisation automatiques | Enrichir toute preuve avec l'horodatage et les coordonnées GPS au moment de la capture | MVP | M. Garnier, Mme Dubois |
| 2.2 Accès aux preuves | 2.2.1 Consultation de preuve par le support | Permettre au support client de retrouver et consulter la preuve d'une livraison en moins de 5 minutes | MVP | Mme Dubois |
| 2.2 Accès aux preuves | 2.2.2 Portail client de suivi | Interface permettant au client final de suivre sa livraison en autonomie | Post-MVP R3 | Mme Dubois |

---

### Domaine 3 — Supervision et pilotage temps réel

**Classification** : Core Domain
**Bounded Context** : BC-03 Supervision
**Justification** : "Je pilote à l'aveugle. Je sais seulement ce que le livreur me dit
quand il m'appelle." (M. Renaud). La supervision temps réel avec détection proactive est
un différenciateur central de DocuPost.

| Capacité | Sous-capacité | Description | Périmètre | Source entretien |
|---|---|---|---|---|
| 3.1 Tableau de bord des tournées | 3.1.1 Vue agrégée des tournées du jour | Afficher en temps réel la liste des tournées actives avec avancement, statut et dernière activité | MVP | M. Renaud, Mme Dubois |
| 3.1 Tableau de bord des tournées | 3.1.2 Détail d'une tournée | Consulter le détail complet d'une tournée : colis, statuts, incidents, localisation livreur | MVP | M. Renaud |
| 3.1 Tableau de bord des tournées | 3.1.3 Récapitulatif de fin de journée | Synthèse des performances de la journée : taux de livraison, échecs, incidents par tournée | MVP | M. Renaud, Mme Dubois |
| 3.2 Détection des tournées à risque | 3.2.1 Calcul automatique d'écart de délai | Calculer en continu l'écart entre l'avancement réel et l'avancement attendu de chaque tournée | MVP | M. Renaud |
| 3.2 Détection des tournées à risque | 3.2.2 Déclenchement d'alerte | Notifier automatiquement le superviseur dès détection d'un risque de retard (< 15 min) | MVP | M. Renaud |
| 3.2 Détection des tournées à risque | 3.2.3 Analyse de performance avancée | Benchmarking inter-tournées, analyse par zone, livreur, secteur | Post-MVP R2 | M. Renaud, Mme Dubois |
| 3.3 Instruction aux livreurs | 3.3.1 Envoi d'instruction structurée | Envoyer au livreur une instruction normalisée : prioriser, annuler, reprogrammer un colis | MVP | M. Renaud |
| 3.3 Instruction aux livreurs | 3.3.2 Suivi de l'exécution d'instruction | Suivre l'état d'une instruction : envoyée, prise en compte, exécutée | MVP | M. Renaud |
| 3.3 Instruction aux livreurs | 3.3.3 Redistribution automatique de colis | Redistribuer automatiquement les colis entre livreurs en cas d'incident humain | Post-MVP R3 | M. Renaud |

---

### Domaine 4 — Notification et messaging

**Classification** : Supporting Subdomain
**Bounded Context** : BC-04 Notification
**Justification** : Supporte le Core Domain mais s'appuie sur des patterns standards
event-driven. Aucune logique métier différenciante.

| Capacité | Sous-capacité | Description | Périmètre | Source entretien |
|---|---|---|---|---|
| 4.1 Notification push livreur | 4.1.1 Transmission d'instruction | Livrer une instruction du superviseur au livreur via notification push | MVP | M. Renaud, Pierre |
| 4.1 Notification push livreur | 4.1.2 Notification d'ajout de colis | Informer le livreur de l'ajout d'un colis urgent à sa tournée | MVP | Pierre |
| 4.1 Notification push livreur | 4.1.3 Notification client final avant passage | Informer le destinataire par SMS ou email avant le passage du livreur | Post-MVP R2 | M. Renaud |
| 4.2 Alerte superviseur | 4.2.1 Alerte tournée à risque | Notifier le superviseur sur le tableau de bord (visuel + sonore) | MVP | M. Renaud |
| 4.2 Alerte superviseur | 4.2.2 Alerte incident terrain | Notifier le superviseur à la déclaration d'un incident par le livreur | MVP | M. Renaud |

---

### Domaine 5 — Intégration SI

**Classification** : Generic Subdomain
**Bounded Context** : BC-05 Intégration SI / OMS
**Justification** : "L'application livreur doit devenir une brique SI à part entière. Tout
événement terrain doit remonter dans l'OMS sans double saisie." (M. Garnier). Adapter
standard, pas de logique métier DocuPost.

| Capacité | Sous-capacité | Description | Périmètre | Source entretien |
|---|---|---|---|---|
| 5.1 Synchronisation OMS | 5.1.1 Émission d'événements normalisés | Transmettre chaque changement de statut colis à l'OMS via API REST en moins de 30 secondes | MVP | M. Garnier |
| 5.1 Synchronisation OMS | 5.1.2 Rejeu des événements en échec | Rejouer automatiquement les événements non transmis (zone blanche) dès le retour de connexion | MVP | M. Garnier |
| 5.1 Synchronisation OMS | 5.1.3 Intégration CRM et ERP | Étendre la synchronisation au CRM et à l'ERP en plus de l'OMS | Post-MVP R2 | M. Garnier, Mme Dubois |
| 5.2 Historisation des événements | 5.2.1 Store d'événements immuable | Historiser chaque événement de livraison de façon immuable avec les 4 attributs obligatoires (qui, quoi, quand, géolocalisation) | MVP | M. Garnier, Mme Dubois |
| 5.2 Historisation des événements | 5.2.2 Audit et traçabilité | Permettre la reconstitution complète de l'historique d'un colis ou d'une tournée pour les besoins d'audit | MVP | Mme Dubois, M. Garnier |

---

### Domaine 6 — Gestion des utilisateurs

**Classification** : Supporting Subdomain
**Bounded Context** : BC-06 Identité et Accès (Generic pour l'authentification)
**Justification** : Nécessaire mais sans différenciation. L'authentification délègue au
SSO corporate.

| Capacité | Sous-capacité | Description | Périmètre | Source entretien |
|---|---|---|---|---|
| 6.1 Authentification et accès | 6.1.1 Connexion via SSO corporate | Authentifier livreurs et superviseurs via OAuth2 / SSO Docaposte | MVP | M. Garnier, Mme Dubois |
| 6.1 Authentification et accès | 6.1.2 Gestion des droits par rôle | Contrôle d'accès basé sur le rôle : livreur (mobile), superviseur (web), admin | MVP | M. Garnier |
| 6.2 Gestion des profils | 6.2.1 Profil livreur | Gérer les données de profil et l'affectation à une tournée | MVP | M. Renaud |
| 6.2 Gestion des profils | 6.2.2 Gestion des véhicules et capacités | Associer livreur et véhicule, gérer les capacités de chargement | Post-MVP R3 | M. Renaud |

---

### Domaine 7 — Reporting et analytique

**Classification** : Supporting Subdomain
**Justification** : "Alimenter les KPIs opérationnels et contractuels." (Mme Dubois).
Nécessaire mais les besoins MVP sont couverts par les vues de supervision.

| Capacité | Sous-capacité | Description | Périmètre | Source entretien |
|---|---|---|---|---|
| 7.1 Reporting opérationnel | 7.1.1 KPIs temps réel superviseur | Taux de livraison, échecs, incidents du jour accessibles depuis le tableau de bord | MVP | M. Renaud, Mme Dubois |
| 7.1 Reporting opérationnel | 7.1.2 Récapitulatif de tournée | Synthèse individuelle par tournée clôturée : livré / échec / incidents | MVP | M. Renaud |
| 7.2 Analyse de performance | 7.2.1 Benchmarking inter-tournées | Comparaison des performances par zone, livreur, période | Post-MVP R2 | Mme Dubois |
| 7.2 Analyse de performance | 7.2.2 Facturation automatisée | Générer les éléments de facturation depuis les événements historisés | Post-MVP R3 | Mme Dubois |

---

### Domaine 8 — Géolocalisation et cartographie

**Classification** : Generic Subdomain
**Justification** : Service tiers standard. Aucune conception spécifique requise pour DocuPost.

| Capacité | Sous-capacité | Description | Périmètre | Source entretien |
|---|---|---|---|---|
| 8.1 Localisation des arrêts | 8.1.1 Affichage de l'adresse sur carte | Ouvrir la navigation externe (Google Maps ou équivalent) avec l'adresse pré-remplie | MVP | Pierre |
| 8.1 Localisation des arrêts | 8.1.2 Géolocalisation automatique lors des actions | Capturer les coordonnées GPS au moment de chaque action de livraison ou échec | MVP | M. Garnier, Mme Dubois |
| 8.2 Suivi de position livreur | 8.2.1 Position temps réel sur tableau de bord | Afficher la position du livreur sur la carte de la tournée (superviseur) | MVP | M. Renaud |
| 8.2 Suivi de position livreur | 8.2.2 Optimisation de tournée basée sur la position | Intégrer la position temps réel dans le calcul de l'ordre optimal des arrêts | Post-MVP R2 | Pierre |

---

## Synthèse stratégique

| Domaine | Classification | Périmètre MVP | Investissement recommandé |
|---|---|---|---|
| 1. Gestion de l'exécution terrain | Core Domain | Oui (complet) | Maximal — modèle DDD riche, TDD, revues approfondies |
| 2. Capture et gestion des preuves | Supporting | Oui (capture et accès support) | Fort — modèle interne solide, immuabilité garantie |
| 3. Supervision et pilotage temps réel | Core Domain | Oui (tableau de bord, alertes, instructions) | Maximal — logique de détection complexe |
| 4. Notification et messaging | Supporting | Oui (push livreur, alertes superviseur) | Modéré — patterns standards event-driven |
| 5. Intégration SI | Generic | Oui (OMS uniquement) | Faible — adapter standard, Anti-Corruption Layer |
| 6. Gestion des utilisateurs | Supporting | Oui (SSO, rôles) | Faible — délégation au SSO corporate |
| 7. Reporting et analytique | Supporting | Partiel (KPIs opérationnels) | Modéré MVP, Fort post-MVP R2 |
| 8. Géolocalisation et cartographie | Generic | Oui (navigation, géoloc. capture) | Faible — service tiers standard |

> **Core Domain identifié : Domaines 1 et 3 (Gestion de l'exécution terrain +
> Supervision temps réel).**
> Ces deux domaines constituent le coeur différenciateur de DocuPost et doivent concentrer
> l'essentiel de l'investissement en modélisation, conception et qualité.
> Source : "Orchestration de tournée en temps réel — c'est le différenciateur central de
> DocuPost." (perimetre-mvp.md, Classification stratégique DDD)
