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
