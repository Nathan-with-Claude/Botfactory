# Journal de bord — @po — DocuPost

> **RÈGLE** : Lire ce fichier EN DÉBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier remplace la relecture complète de `/livrables/05-backlog/`.

---

## Contexte synthétisé

- **Livrables propriété** : `05-backlog/`
- **État backlog MVP** : 7 Epics / 21 Features / 24 User Stories / 119 story points
- **Prochaine US libre** : US-025

### Récapitulatif Epics

| Epic | Titre | BC | Périmètre | US liées |
|------|-------|-----|-----------|----------|
| EPIC-007 | Planification et Préparation des Tournées | BC-07 | MVP | US-021→024 |
| EPIC-001 | Exécution de la Tournée (app mobile livreur) | BC-01 | MVP | US-001→007 |
| EPIC-002 | Capture et Accès aux Preuves de Livraison | BC-02 | MVP | US-008→010 |
| EPIC-003 | Supervision et Pilotage Temps Réel | BC-03 | MVP | US-011→015 |
| EPIC-004 | Notification et Messaging | BC-04 | MVP | US-016 |
| EPIC-005 | Intégration SI et Historisation Immuable | BC-05 | MVP | US-017→018 |
| EPIC-006 | Authentification et Accès | BC-06 | MVP | US-019→020 |

### Suivi des User Stories

| US | Titre court | Epic | Taille | Priorité | Statut |
|----|-------------|------|--------|----------|--------|
| US-021 | Visualiser plan du jour (TMS) | E-007 | M | Must | À faire |
| US-022 | Vérifier composition tournée | E-007 | S | Should | À faire |
| US-023 | Affecter livreur + véhicule | E-007 | M | Must | À faire |
| US-024 | Lancer tournée → visible livreur | E-007 | S | Must | À faire |
| US-001 | Consulter liste colis tournée | E-001 | M | Must | À faire |
| US-002 | Suivre progression temps réel | E-001 | S | Must | À faire |
| US-003 | Filtrer colis par zone | E-001 | S | Must | À faire |
| US-004 | Accéder au détail d'un colis | E-001 | S | Must | À faire |
| US-005 | Déclarer échec livraison | E-001 | M | Must | À faire |
| US-006 | Mode offline + synchronisation | E-001 | L | Must | À faire |
| US-007 | Clôturer tournée | E-001 | S | Must | À faire |
| US-008 | Capturer signature numérique | E-002 | M | Must | À faire |
| US-009 | Capturer photo ou tiers | E-002 | M | Must | À faire |
| US-010 | Consulter preuve (litige) | E-002 | S | Should | À faire |
| US-011 | Tableau de bord tournées | E-003 | L | Must | À faire |
| US-012 | Détail tournée superviseur | E-003 | M | Must | À faire |
| US-013 | Alerte tournée à risque | E-003 | L | Must | À faire |
| US-014 | Envoyer instruction livreur | E-003 | M | Must | À faire |
| US-015 | Suivre exécution instruction | E-003 | S | Must | À faire |
| US-016 | Notification push instruction | E-004 | M | Must | À faire |
| US-017 | Synchronisation OMS | E-005 | L | Must | À faire |
| US-018 | Historisation immuable événements | E-005 | M | Must | À faire |
| US-019 | Authentification SSO mobile | E-006 | S | Must | À faire |
| US-020 | Authentification SSO web | E-006 | S | Must | À faire |

---

## Décisions structurantes

| Date | Décision | Justification |
|------|----------|---------------|
| 2026-03-19 | US-006 (offline) taille L — non découpée | Complexité offline-first transversale, doit rester unitaire |
| 2026-03-19 | US-010 "Should Have" (not Must) | Support client peut utiliser solutions intermédiaires en attendant |
| 2026-03-19 | 1 US = 1 Bounded Context | Cohérence DDD, éviter les US transversales |
| 2026-03-20 | EPIC-007 en tête du backlog (Parcours 0 = prérequis) | Dépendance technique : US-021→024 doivent être implémentées avant que les livreurs puissent utiliser l'app |
| 2026-03-20 | US-022 "Should Have" (vérification composition) | Affectation et lancement sont bloquants, vérification détaillée peut être allégée au MVP |

---

## Interventions réalisées

| Date | Version | Sujet | Fichiers |
|------|---------|-------|----------|
| 2026-03-19 | 1.0 | Création backlog initial — 6 Epics, 17 Features, 20 US (US-001→020), definition-mvp | epics.md, features.md, US-001→020, definition-mvp.md |
| 2026-03-20 | 1.1 | Ajout Parcours 0 — EPIC-007, F-018→021, US-021→024, definition-mvp mise à jour (24 US, 119 pts) | epics.md, features.md, US-021→024, definition-mvp.md |

---

## Points d'attention — prochaines interventions

- **EPIC-007 est un prérequis** : US-021, US-023, US-024 doivent être développées avant US-001 (le livreur ne peut pas consulter sa tournée si personne ne l'a lancée)
- Ordre de développement recommandé : US-019/020 (SSO) → US-021/023/024 (planification) → US-001 (livreur)
- **US-025+** à créer si de nouvelles US émergent — partir de la prochaine Feature disponible (F-022)
- Toute nouvelle US doit avoir ses critères d'acceptation en format GIVEN/WHEN/THEN
