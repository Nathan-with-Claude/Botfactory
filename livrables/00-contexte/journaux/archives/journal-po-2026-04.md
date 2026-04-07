# Archive — Journal @po — 2026-04

> Archivé le 2026-04-02. Source : journal-po.md

## Interventions archivées

| Date | Version | Sujet | Fichiers |
|------|---------|-------|----------|
| 2026-03-19 | 1.0 | Création backlog initial — 6 Epics, 17 Features, 20 US (US-001→020), definition-mvp | epics.md, features.md, US-001→020, definition-mvp.md |
| 2026-03-20 | 1.1 | Ajout Parcours 0 — EPIC-007, F-018→021, US-021→024, definition-mvp mise à jour (24 US, 119 pts) | epics.md, features.md, US-021→024, definition-mvp.md |
| 2026-03-30 | 1.2 | Création US-034→037 issues du feedback terrain 2026-03-30 (4 améliorations non implémentées) | US-034 à US-037, features.md, journal-po.md |
| 2026-04-02 | 1.3 | Création US-046 — bloquant légal signature numerique (pad réel react-native-signature-canvas) | US-046-signature-numerique-pad-reel.md, features.md |
| 2026-04-02 | 1.4 | Mise à jour US-037, US-043, US-045 suite wireframes v1.3 + résolution conflit features.md | US-037, US-043, US-045, features.md |
| 2026-04-03 | 1.5 | Création US-048 — sync supervision ↔ mobile livreur (DevEventBridge + message "sans tournée" + livreur-005) | US-048-sync-supervision-mobile.md |
| 2026-04-03 | 1.6 | Création US-049 — alignement 6 livreurs dev (mobile + supervision + seeders) | US-049-6-livreurs-dev-coherents.md |
| 2026-04-03 | 1.6 | Création US-050 — désaffectation livreur tournée planifiée (W-05 supervision) | US-050-desaffecter-livreur-tournee-planifiee.md |
| 2026-04-04 | 1.7 | Analyse rapports as-built supervision + mobile — plan de corrections priorisé P0/P1/P2 | corrections-as-built-2026-04.md |
| 2026-04-04 | 1.7 | Création US-051 — Bearer token supervisionApi (P0/XS) | US-051-bearer-token-supervision-api.md |
| 2026-04-04 | 1.7 | Création US-052 — dépendances package.json manquantes (P0/XS) | US-052-dependances-package-json-manquantes.md |

## Décisions archivées

| Date | Décision | Justification |
|------|----------|---------------|
| 2026-03-19 | US-006 (offline) taille L — non découpée | Complexité offline-first transversale, doit rester unitaire |
| 2026-03-19 | US-010 "Should Have" (not Must) | Support client peut utiliser solutions intermédiaires en attendant |
| 2026-03-19 | 1 US = 1 Bounded Context | Cohérence DDD, éviter les US transversales |
| 2026-03-20 | EPIC-007 en tête du backlog (Parcours 0 = prérequis) | Dépendance technique : US-021→024 doivent être implémentées avant que les livreurs puissent utiliser l'app |
| 2026-03-20 | US-022 "Should Have" (vérification composition) | Affectation et lancement sont bloquants, vérification détaillée peut être allégée au MVP |
| 2026-04-01 | Corrections de libelles regroupees en US-038 | Nature homogene — affichage pur |
| 2026-04-01 | EPIC-008 "Qualite UX et Accessibilite" creee | Pour accueillir les US sans BC metier propre |
| 2026-04-01 | US-042 est un delta sur US-037 terminee | Nouvelle US plutot que rouverture |
| 2026-04-01 | US-043 est distinct de US-036 | Comportement session vs memorise AsyncStorage |
| 2026-04-01 | US-045 priorisee Could Have | Affordance visuelle, non bloquant fonctionnel |
| 2026-04-02 | US-046 classee Must Have (bloquant legal) | SignatureNumerique sans tracé non opposable |
| 2026-04-02 | US-037 enrichie avec scenarios M-07 complets | Wireframes v1.3 precisent M-07 (badges statut, liste vide, offline, retour M-02) |
| 2026-04-02 | US-043 enrichie avec specs chevron [^]/[v] | Wireframes v1.3 precisent le composant visuel de la card SSO |
| 2026-04-02 | US-045 : texte exact hint et micro-animation | Wireframes v1.3 precisent "← Glissez vers la gauche..." et animation 8px |
| 2026-04-02 | Conflit git dans features.md resolu | Marqueurs upstream/stashed supprimés, version 1.1 |
| 2026-04-03 | US-049 rattachée à EPIC-DEV-001 / F-DEV-001 | Infrastructure dev — pas un Epic métier, alignement avec US-047/048 |
