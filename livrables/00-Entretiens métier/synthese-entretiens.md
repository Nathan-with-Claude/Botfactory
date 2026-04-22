# Synthèse des entretiens métier — DocuPost

> Ce document centralise les nouveaux besoins métier découverts après le cadrage initial.
> Chaque entrée référence l'entretien source et la date de découverte.

---

## [2026-03-20] Gestion en amont des tournées TMS — Responsable logistique

**Source** : Entretien logistique du 20/03/2026 (`Entretiens_logistique_20_03.md`)
**Interlocuteur** : Responsable logistique (non nommé dans l'entretien)
**Découverte** : Besoin oublié lors du cadrage initial

### Résumé du besoin

Un pan entier du métier de la gestion logistique avait été omis du périmètre initial :
la **préparation quotidienne des tournées** avant le départ des livreurs.

Chaque matin, le responsable logistique effectue les actions suivantes :

1. **Réception de la liste des tournées** générée automatiquement par le TMS
   (Transport Management System).

2. **Vérification de la composition de chaque tournée** :
   - Nombre de colis par tournée
   - Zones géographiques couvertes
   - Contraintes horaires spécifiques

3. **Affectation des ressources à chaque tournée** :
   - Un livreur par tournée
   - Un véhicule par tournée

### Impact identifié

Ce besoin constitue un **Parcours 0** : il est un prérequis direct au Parcours 1 (exécution
de la tournée par le livreur). Sans ce parcours, les livreurs n'ont pas de tournée assignée
dans DocuPost.

**Impact sur les livrables existants :**
- `/livrables/01-vision/` : ajout d'un pain point côté responsable logistique + nouveau parcours
- `/livrables/02-ux/` : mise à jour du persona Laurent Renaud + ajout d'un parcours "Préparer les tournées du jour" + nouveaux wireframes
- `/livrables/03-architecture-metier/` : nouveau domaine "Planification de Tournée", intégration TMS
- `/livrables/04-architecture-technique/` : nouvelle intégration TMS (import), nouveaux ADR
- `/livrables/05-backlog/` : nouvelle Epic, nouvelles Features, nouvelles User Stories

### Décision de cadrage

Ce besoin est **inclus dans le MVP** : il est bloquant pour le fonctionnement de l'application.
Sans affectation des tournées, le Parcours 1 (livreur) ne peut pas démarrer.

---

## [2026-04-21] Broadcast superviseur → livreurs — Superviseur terrain Île-de-France Sud

**Source** : Entretien broadcast du 21/04/2026 (`Entretien_broadcast_superviseur_21_04.md`)
**Interlocuteur** : Karim B., Superviseur logistique terrain — Agence Île-de-France Sud
**Découverte** : Besoin non exprimé lors du cadrage initial

### Résumé du besoin

Le superviseur a besoin d'envoyer un **message d'alerte ou d'information opérationnelle** à un groupe de livreurs simultanément, sans appel individuel. Ce besoin est distinct des US-014/016 (instructions sur colis individuel) : le broadcast est **non lié à un colis**, cible **N livreurs** et nécessite un nouveau concept métier.

Critères exprimés :
- **Ciblage** : tous les livreurs actifs / par secteur géographique / sélection manuelle
- **Canal** : notification push (app en arrière-plan incluse)
- **Type de message** : libellé normalisé (Alerte / Info / Consigne) + texte libre
- **Confirmation** : statut "vu" par livreur
- **Historique** : messages de la journée consultables
- **Rapidité** : max 3 clics depuis le tableau de bord superviseur

### Cas d'usage cités

1. Fermeture de voie (rue barrée) → ciblage par zone
2. Fermeture anticipée du dépôt → tous les livreurs actifs
3. Incident scanner / matériel → tous les livreurs actifs
4. Consigne de sécurité ponctuelle → tous ou sélection
5. Modification d'une adresse de dépôt relais → critique, tous

### Ce que Karim ne veut PAS

- Communication bidirectionnelle (pas de boîte de réception)
- Alertes automatiques sans validation humaine

### Impact identifié

**Nouveau concept métier** : `BroadcastMessage` (Aggregate Root, BC-03 Supervision étendu ou nouveau BC-05)

**Impact sur les livrables existants :**
- `/livrables/01-vision/` : nouveau pain point superviseur + ajustement périmètre MVP
- `/livrables/02-ux/` : nouveau wireframe tableau de bord superviseur (panneau broadcast) + nouvelle zone messages sur mobile livreur
- `/livrables/03-architecture-metier/` : nouveau aggregate `BroadcastMessage`, nouvelle capability "Communication opérationnelle groupe"
- `/livrables/04-architecture-technique/` : nouvelle route API `/api/broadcast`, extension FCM pour ciblage multi-livreurs, nouveau read model statut "vu"
- `/livrables/05-backlog/` : nouvelles US (envoi broadcast superviseur, réception broadcast livreur, historique broadcast)

### Décision de cadrage

À arbitrer par @sponsor : MVP ou itération suivante ?
Karim signale que **2 autres superviseurs de son agence** ont le même besoin — impact terrain confirmé.

---
