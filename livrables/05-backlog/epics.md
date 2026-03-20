# Epics DocuPost

> Document de référence — Version 1.1 — 2026-03-20
> Produit par le Product Owner à partir des livrables vision (/livrables/01-vision/),
> UX (/livrables/02-ux/) et architecture métier (/livrables/03-architecture-metier/).
>
> Chaque Epic est alignée sur un unique Bounded Context (DDD Evans).
> Les termes utilisés sont issus du glossaire de l'Ubiquitous Language défini dans
> /livrables/03-architecture-metier/domain-model.md.

---

## EPIC-007 : Planification et Préparation des Tournées (interface web logisticien)

**Bounded Context** : BC-07 Planification de Tournée (Core Domain)
**Objectif business** : Permettre au responsable logistique de réceptionner les tournées
générées par le TMS chaque matin, de vérifier leur composition, d'affecter un livreur
et un véhicule à chaque tournée, et de les lancer avant le départ des livreurs. Sans ce
parcours, aucune tournée n'est disponible dans l'application mobile du livreur.

**Problème résolu** : L'affectation des tournées se fait manuellement sur papier ou tableur
sans traçabilité, sans détection des anomalies et sans connexion au SI. Ce parcours est
le maillon manquant du cadrage initial.

**Capabilities couvertes** :
- 7.1 Import et réception des tournées TMS (import automatique 6h00, visualisation du plan du jour)
- 7.2 Vérification de composition (anomalies colis/zones/contraintes)
- 7.3 Affectation livreur / véhicule par tournée
- 7.4 Lancement des tournées (rend la tournée visible dans l'app mobile livreur)

**KPIs associés** :
- Temps moyen de préparation des tournées du matin < 30 minutes
- Taux d'affectation complète avant le départ des livreurs = 100 %
- Réduction des erreurs d'affectation vs baseline papier de 90 %

**Périmètre** : MVP

---

## EPIC-001 : Exécution de la Tournée (application mobile livreur)

**Bounded Context** : BC-01 Orchestration de Tournée (Core Domain)
**Objectif business** : Réintégrer le livreur dans la chaîne SI en lui fournissant une
application mobile offline-first permettant de prendre en main sa tournée, mettre à
jour le statut de chaque colis et suivre sa progression en temps réel, en moins de
45 secondes par colis.

**Problème résolu** : "Mon seul outil c'est ma feuille de route. Le problème c'est que
si je l'oublie ou qu'elle se mouille, je suis à poil." (Pierre, livreur terrain)

**Capabilities couvertes** :
- 1.1 Gestion de la tournée (chargement, organisation des arrêts, suivi de progression,
  clôture)
- 1.2 Gestion du cycle de vie des colis (consultation, mise à jour de statut, contraintes)
- 1.3 Gestion des échecs de livraison (motif normalisé, disposition, mode offline)

**KPIs associés** :
- Temps moyen de mise à jour d'un statut colis < 45 secondes
- Taux d'utilisation des motifs normalisés = 100 %
- Taux de disponibilité de l'application livreur > 99,5 %
- Score de satisfaction livreur > 4/5 après 4 semaines d'usage

**Périmètre** : MVP

---

## EPIC-002 : Capture et Accès aux Preuves de Livraison

**Bounded Context** : BC-02 Gestion des Preuves (Supporting Subdomain)
**Objectif business** : Permettre la capture numérique opposable de la preuve de livraison
(signature numérique, photo, tiers identifié, dépôt sécurisé) et rendre chaque preuve
accessible au support client en moins de 5 minutes pour la résolution des litiges.

**Problème résolu** : "Quand un client nous dit qu'il n'a pas reçu son colis, on met
parfois des heures à retrouver la preuve, si tant est qu'elle existe." (Mme Dubois, DSI)

**Capabilities couvertes** :
- 2.1 Capture de preuve de livraison (signature numérique, photo, tiers identifié,
  dépôt sécurisé, horodatage et géolocalisation automatiques)
- 2.2 Accès aux preuves (consultation par le support client)

**KPIs associés** :
- Taux de preuves de livraison capturées numériquement = 100 % des livraisons réussies
- Délai moyen de fourniture d'une preuve opposable < 5 minutes
- Réduction des litiges "colis non reçu" de 40 % vs baseline

**Périmètre** : MVP

---

## EPIC-003 : Supervision et Pilotage Temps Réel

**Bounded Context** : BC-03 Supervision (Core Domain)
**Objectif business** : Fournir au superviseur une interface web de pilotage temps réel
remplaçant le pilotage téléphonique, avec détection proactive des tournées à risque et
capacité d'envoi d'instructions structurées aux livreurs directement depuis le tableau
de bord.

**Problème résolu** : "Je pilote à l'aveugle. Je sais seulement ce que le livreur me dit
quand il m'appelle." (M. Renaud, Responsable Exploitation Logistique)

**Capabilities couvertes** :
- 3.1 Tableau de bord des tournées (vue agrégée temps réel, détail d'une tournée,
  récapitulatif de fin de journée)
- 3.2 Détection des tournées à risque (calcul automatique d'écart de délai, déclenchement
  d'alerte en moins de 15 minutes)
- 3.3 Instruction aux livreurs (envoi d'instruction structurée, suivi d'exécution)

**KPIs associés** :
- Délai moyen de détection d'une tournée à risque < 15 minutes
- Réduction des appels téléphoniques superviseur/livreur de 70 %
- Temps moyen de traitement d'un incident terrain < 10 minutes

**Périmètre** : MVP

---

## EPIC-004 : Notification et Messaging

**Bounded Context** : BC-04 Notification (Supporting Subdomain)
**Objectif business** : Assurer l'acheminement en temps réel des instructions du
superviseur vers le livreur (notification push) et des alertes automatiques vers le
tableau de bord superviseur, en supprimant le recours au téléphone.

**Problème résolu** : "Si le superviseur ajoute un colis en urgence en journée, Pierre
l'apprend par un appel téléphonique, pas toujours au bon moment." (entretien Pierre)

**Capabilities couvertes** :
- 4.1 Notification push livreur (transmission d'instruction, notification d'ajout de
  colis)
- 4.2 Alerte superviseur (alerte tournée à risque, alerte incident terrain)

**KPIs associés** :
- Taux d'alertes actionnées par le superviseur (mesure de référence au MVP)
- Réduction des appels téléphoniques superviseur/livreur de 70 %

**Périmètre** : MVP

---

## EPIC-005 : Intégration SI et Historisation Immuable

**Bounded Context** : BC-05 Intégration SI / OMS (Generic Subdomain)
**Objectif business** : Faire de DocuPost une brique SI officielle en synchronisant
chaque événement de livraison vers l'OMS en moins de 30 secondes, en historisant
tous les événements de façon immuable (qui, quoi, quand, géolocalisation) et en
rejouant automatiquement les événements produits hors connexion.

**Problème résolu** : "L'application livreur doit devenir une brique SI à part entière.
Tout événement terrain doit remonter dans l'OMS sans double saisie et sans toucher au
cœur applicatif." (M. Garnier, Architecte Technique DSI)

**Capabilities couvertes** :
- 5.1 Synchronisation OMS (émission d'événements normalisés, rejeu des événements en
  échec)
- 5.2 Historisation des événements (store immuable, audit et traçabilité)

**KPIs associés** :
- Taux de synchronisation OMS en temps réel > 99 %
- Taux de double saisie résiduelle = 0 %
- Complétude des événements historisés = 100 %
- Taux d'événements en échec de synchronisation rejoués avec succès > 99 %

**Périmètre** : MVP

---

## EPIC-006 : Authentification et Accès

**Bounded Context** : BC-06 Identité et Accès (Generic Subdomain)
**Objectif business** : Authentifier livreurs et superviseurs via le SSO corporate
OAuth2 et contrôler les droits d'accès par rôle (livreur mobile, superviseur web),
sans créer de comptes ad hoc hors du référentiel Docaposte.

**Problème résolu** : Absence d'authentification sécurisée pour les livreurs terrain.
Exigence DSI non négociable : "OAuth2 / SSO corporate obligatoire dès le MVP."
(M. Garnier)

**Capabilities couvertes** :
- 6.1 Authentification et accès (connexion via SSO corporate, gestion des droits par
  rôle)

**KPIs associés** :
- Disponibilité application livreur > 99,5 % pendant les plages horaires de tournée

**Périmètre** : MVP

---

## Récapitulatif

| Epic | Bounded Context | Classification DDD | Périmètre |
|------|-----------------|-------------------|-----------|
| EPIC-007 | Planification de Tournée | Core Domain | MVP |
| EPIC-001 | Orchestration de Tournée | Core Domain | MVP |
| EPIC-002 | Gestion des Preuves | Supporting Subdomain | MVP |
| EPIC-003 | Supervision | Core Domain | MVP |
| EPIC-004 | Notification | Supporting Subdomain | MVP |
| EPIC-005 | Intégration SI / OMS | Generic Subdomain | MVP |
| EPIC-006 | Identité et Accès | Generic Subdomain | MVP |
