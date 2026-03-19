# Features DocuPost (par Epic)

> Document de référence — Version 1.0 — 2026-03-19
> Produit par le Product Owner à partir des livrables vision, UX et architecture métier.
> Chaque Feature correspond à une capacité fonctionnelle d'un Bounded Context.
> Les termes sont issus de l'Ubiquitous Language (/livrables/03-architecture-metier/domain-model.md).

---

## EPIC-001 : Exécution de la Tournée (application mobile livreur)

### F-001 : Chargement et prise en main de la tournée

**Description** : Permettre au livreur de consulter, dès son authentification, la liste
complète des colis assignés pour la journée, organisée par zone géographique, avec
l'indicateur de reste à livrer et l'estimation de fin de tournée.

**Capability** : 1.1.1 Chargement de la tournée + 1.1.3 Suivi de progression
**Screens couverts** : M-02 (Liste des colis de la tournée)
**Domain Events** : TournéeChargée, TournéeDémarrée
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-001 : Consulter la liste des colis assignés à ma tournée
- US-002 : Suivre ma progression en temps réel (reste à livrer et estimation de fin)

---

### F-002 : Organisation des arrêts par zone

**Description** : Permettre au livreur de filtrer et trier dynamiquement la liste des
colis par zone géographique ou proximité, sans rechargement de la liste.

**Capability** : 1.1.2 Organisation des arrêts
**Screens couverts** : M-02 (onglets de filtre par zone)
**Domain Events** : aucun (navigation locale)
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-003 : Filtrer et organiser mes colis par zone géographique

---

### F-003 : Mise à jour du statut d'un colis

**Description** : Permettre au livreur de changer le statut d'un colis (livré, échec,
à représenter) en moins de 45 secondes depuis la liste de tournée, avec horodatage et
géolocalisation automatiques.

**Capability** : 1.2.2 Mise à jour du statut colis
**Screens couverts** : M-03 (Détail d'un colis)
**Domain Events** : LivraisonConfirmée, ÉchecLivraisonDéclaré
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-004 : Accéder au détail d'un colis et déclencher une action de livraison

---

### F-004 : Déclaration d'un échec de livraison avec motif normalisé

**Description** : Permettre au livreur de déclarer un échec de livraison en sélectionnant
un motif normalisé (absent, accès impossible, refus client, horaires dépassés) et en
choisissant la disposition du colis (à représenter, dépôt chez tiers, retour dépôt).

**Capability** : 1.3.1 Saisie du motif normalisé + 1.3.2 Choix de la disposition
**Screens couverts** : M-05 (Déclaration d'un échec de livraison)
**Domain Events** : ÉchecLivraisonDéclaré, MotifEnregistré, DispositionEnregistrée
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-005 : Déclarer un échec de livraison avec motif normalisé et disposition

---

### F-005 : Mode offline et synchronisation différée

**Description** : Permettre au livreur d'exécuter toutes les actions terrain (livraison,
échec, preuve) sans connexion réseau, stocker les événements localement et les rejouer
automatiquement dès le retour de connexion.

**Capability** : 1.3.3 Gestion du mode offline
**Screens couverts** : M-02 (indicateur de synchronisation), M-04, M-05
**Domain Events** : SynchronisationOMS (différée)
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-006 : Continuer à livrer en zone blanche et synchroniser dès le retour de connexion

---

### F-006 : Clôture de tournée

**Description** : Permettre au livreur de clôturer sa tournée une fois tous les colis
traités, avec affichage du récapitulatif (livrés, échecs, incidents) et déclenchement
de la synchronisation finale vers l'OMS.

**Capability** : 1.1.4 Clôture de tournée
**Screens couverts** : M-02 (bouton Clôturer)
**Domain Events** : TournéeClôturée, SynchronisationOMS
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-007 : Clôturer ma tournée et consulter le récapitulatif

---

## EPIC-002 : Capture et Accès aux Preuves de Livraison

### F-007 : Capture de la preuve de livraison

**Description** : Permettre au livreur de capturer une preuve de livraison numérique
opposable selon le type adapté à la situation : signature numérique, photo du colis
déposé, identification d'un tiers, description d'un dépôt sécurisé. Chaque preuve
est automatiquement horodatée et géolocalisée.

**Capability** : 2.1.1 à 2.1.5 (Capture de preuve — tous types)
**Screens couverts** : M-04 (Capture de la preuve de livraison)
**Domain Events** : PreuveCapturée, LivraisonConfirmée
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-008 : Capturer une signature numérique comme preuve de livraison
- US-009 : Capturer une photo ou identifier un tiers comme preuve de livraison

---

### F-008 : Accès aux preuves par le support client

**Description** : Permettre au support client (DSI / Mme Dubois) de retrouver et
consulter la preuve d'une livraison en moins de 5 minutes à partir de l'identifiant
du colis.

**Capability** : 2.2.1 Consultation de preuve par le support
**Screens couverts** : interface web de consultation (support)
**Domain Events** : (lecture seule — aucun événement émis)
**Priorité MoSCoW** : Should Have

User Stories rattachées :
- US-010 : Consulter la preuve d'une livraison pour traiter un litige

---

## EPIC-003 : Supervision et Pilotage Temps Réel

### F-009 : Tableau de bord des tournées du jour

**Description** : Permettre au superviseur de visualiser en temps réel la liste de toutes
les tournées actives du jour avec l'avancement de chaque tournée, le statut et la dernière
activité, et de filtrer par statut (en cours, à risque, clôturées).

**Capability** : 3.1.1 Vue agrégée des tournées du jour + 3.1.3 Récapitulatif de fin
de journée
**Screens couverts** : W-01 (Tableau de bord des tournées)
**Domain Events affichés** : TournéeÀRisqueDétectée, AlerteDéclenchée, LivraisonConfirmée
(agrégés)
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-011 : Visualiser l'avancement de toutes les tournées du jour en temps réel

---

### F-010 : Consultation du détail d'une tournée

**Description** : Permettre au superviseur de consulter le détail complet d'une tournée
sélectionnée : liste des colis avec statuts, incidents déclarés, motifs de non-livraison
et position du livreur.

**Capability** : 3.1.2 Détail d'une tournée
**Screens couverts** : W-02 (Détail d'une tournée)
**Domain Events affichés** : tous les événements de la tournée sélectionnée
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-012 : Consulter le détail d'une tournée avec statuts des colis et incidents

---

### F-011 : Détection automatique des tournées à risque

**Description** : Calculer en continu l'écart entre l'avancement réel et l'avancement
attendu de chaque tournée et déclencher automatiquement une alerte visuelle et sonore
sur le tableau de bord superviseur en moins de 15 minutes dès détection d'un risque.

**Capability** : 3.2.1 Calcul automatique d'écart de délai + 3.2.2 Déclenchement
d'alerte
**Screens couverts** : W-01 (bandeau alerte), W-02 (bandeau retard estimé)
**Domain Events** : TournéeÀRisqueDétectée, AlerteDéclenchée
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-013 : Recevoir une alerte automatique dès qu'une tournée est à risque de retard

---

### F-012 : Envoi d'une instruction structurée au livreur

**Description** : Permettre au superviseur de sélectionner un colis dans une tournée
active et d'envoyer au livreur une instruction normalisée (prioriser, annuler,
reprogrammer) avec suivi de son état d'exécution (envoyée, prise en compte, exécutée).

**Capability** : 3.3.1 Envoi d'instruction structurée + 3.3.2 Suivi de l'exécution
**Screens couverts** : W-03 (Panneau d'envoi d'instruction)
**Domain Events** : InstructionEnvoyée, InstructionExécutée
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-014 : Envoyer une instruction structurée à un livreur depuis le tableau de bord
- US-015 : Suivre l'état d'exécution d'une instruction envoyée à un livreur

---

## EPIC-004 : Notification et Messaging

### F-013 : Notification push d'instruction au livreur

**Description** : Livrer en temps réel une notification push au livreur lorsque le
superviseur envoie une instruction, avec affichage d'un bandeau overlay sur l'écran
courant de l'application mobile et mise à jour automatique de la liste de colis.

**Capability** : 4.1.1 Transmission d'instruction + 4.1.2 Notification d'ajout de colis
**Screens couverts** : M-06 (Notification d'instruction reçue)
**Domain Events** : InstructionReçue, TournéeModifiée
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-016 : Recevoir une notification push quand le superviseur modifie ma tournée

---

### F-014 : Alerte automatique superviseur sur tournée à risque

**Description** : Notifier le superviseur sur son tableau de bord (alerte visuelle +
sonore) à l'apparition d'une tournée à risque et lors de la déclaration d'un incident
terrain par un livreur.

**Capability** : 4.2.1 Alerte tournée à risque + 4.2.2 Alerte incident terrain
**Screens couverts** : W-01 (bandeau alerte, indicateur sonore)
**Domain Events** : AlerteDéclenchée, IncidentDéclaré (notifié)
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- (couvert par US-013 et US-012 — pas de US dédiée supplémentaire au MVP)

---

## EPIC-005 : Intégration SI et Historisation Immuable

### F-015 : Synchronisation des événements vers l'OMS

**Description** : Transmettre chaque changement de statut colis à l'OMS via API REST
en moins de 30 secondes, avec rejeu automatique des événements produits hors connexion
(zone blanche) dès le retour de connexion réseau.

**Capability** : 5.1.1 Émission d'événements normalisés + 5.1.2 Rejeu des événements
en échec
**Domain Events** : SynchronisationOMS (tous les événements terrain)
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-017 : Synchroniser automatiquement les événements de livraison vers l'OMS

---

### F-016 : Historisation immuable des événements de livraison

**Description** : Stocker chaque événement de livraison de façon immuable dans le
store d'événements avec les quatre attributs obligatoires (qui, quoi, quand,
géolocalisation), pour garantir l'auditabilité complète de chaque tournée.

**Capability** : 5.2.1 Store d'événements immuable + 5.2.2 Audit et traçabilité
**Domain Events** : tous les Domain Events significatifs
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-018 : Garantir l'historisation immuable de chaque événement de livraison

---

## EPIC-006 : Authentification et Accès

### F-017 : Connexion SSO corporate et contrôle d'accès par rôle

**Description** : Authentifier les livreurs (application mobile) et les superviseurs
(interface web) via OAuth2 / SSO corporate Docaposte et appliquer un contrôle d'accès
par rôle : livreur (accès mobile uniquement), superviseur (accès web uniquement).

**Capability** : 6.1.1 Connexion via SSO corporate + 6.1.2 Gestion des droits par rôle
**Screens couverts** : M-01 (Authentification mobile)
**Domain Events** : aucun (Generic Subdomain)
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-019 : M'authentifier via mon compte Docaposte (SSO) depuis l'application mobile
- US-020 : M'authentifier via mon compte Docaposte (SSO) depuis l'interface web de
  supervision

---

## Récapitulatif des Features par priorité MoSCoW

| Feature | Epic | Priorité | Périmètre |
|---------|------|----------|-----------|
| F-001 : Chargement et prise en main de la tournée | EPIC-001 | Must Have | MVP |
| F-002 : Organisation des arrêts par zone | EPIC-001 | Must Have | MVP |
| F-003 : Mise à jour du statut d'un colis | EPIC-001 | Must Have | MVP |
| F-004 : Déclaration d'un échec avec motif normalisé | EPIC-001 | Must Have | MVP |
| F-005 : Mode offline et synchronisation différée | EPIC-001 | Must Have | MVP |
| F-006 : Clôture de tournée | EPIC-001 | Must Have | MVP |
| F-007 : Capture de la preuve de livraison | EPIC-002 | Must Have | MVP |
| F-008 : Accès aux preuves par le support client | EPIC-002 | Should Have | MVP |
| F-009 : Tableau de bord des tournées du jour | EPIC-003 | Must Have | MVP |
| F-010 : Consultation du détail d'une tournée | EPIC-003 | Must Have | MVP |
| F-011 : Détection automatique des tournées à risque | EPIC-003 | Must Have | MVP |
| F-012 : Envoi d'une instruction structurée | EPIC-003 | Must Have | MVP |
| F-013 : Notification push d'instruction | EPIC-004 | Must Have | MVP |
| F-014 : Alerte automatique superviseur | EPIC-004 | Must Have | MVP |
| F-015 : Synchronisation des événements vers l'OMS | EPIC-005 | Must Have | MVP |
| F-016 : Historisation immuable des événements | EPIC-005 | Must Have | MVP |
| F-017 : Connexion SSO et contrôle d'accès par rôle | EPIC-006 | Must Have | MVP |
