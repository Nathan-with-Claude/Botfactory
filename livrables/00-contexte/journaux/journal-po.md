# Journal de bord — @po — DocuPost

> **RÈGLE** : Lire ce fichier EN DÉBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier remplace la relecture complète de `/livrables/05-backlog/`.

---

## Contexte synthétisé

- **Livrables propriété** : `05-backlog/`
- **État backlog MVP** : 8 Epics / 29 Features / 46 User Stories (MVP inchangé) + feedbacks terrain intégrés
- **Prochaine US libre** : US-047

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
| EPIC-008 | Qualité UX et Accessibilité | transverse | Post-MVP | US-038 |

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

> ← Entrées antérieures archivées dans [archives/journal-po-2026-04.md]

| Date | Décision | Justification |
|------|----------|---------------|
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

---

## Interventions réalisées

> ← Entrées antérieures archivées dans [archives/journal-po-2026-04.md]

| Date | Version | Sujet | Fichiers |
|------|---------|-------|----------|
| 2026-04-02 | 1.4 | Mise à jour US-037, US-043, US-045 suite wireframes v1.3 + résolution conflit features.md | US-037, US-043, US-045, features.md |

---

## Points d'attention — prochaines interventions

- **EPIC-007 est un prérequis** : US-021, US-023, US-024 doivent être développées avant US-001
- Ordre de développement recommandé : US-019/020 (SSO) → US-021/023/024 (planification) → US-001 (livreur)
- **US-047+** prochaine US libre
- Toute nouvelle US doit avoir ses critères d'acceptation en format GIVEN/WHEN/THEN

### US-034 à US-037 — feedback terrain 2026-03-30

| US | Titre court | Epic | Feature | BC | Priorité | Taille | Source |
|----|-------------|------|---------|-----|----------|--------|--------|
| US-034 | Suggestion réaffectation après échec compatibilité | EPIC-007 | F-020 | BC-07 | Should Have | S | Feedback superviseur |
| US-035 | Recherche multi-critères tableau de bord | EPIC-003 | F-009 | BC-03 | Should Have | S | Feedback superviseur |
| US-036 | Card SSO rétractable après 1ère connexion | EPIC-006 | F-017 | BC-06 | Could Have | S | Feedback livreur |
| US-037 | Historique consignes livreur (écran M-07) | EPIC-004 | F-013 | BC-04 | Should Have | M | Feedback livreur |

- US-034 est un post-US-030 — prérequis : US-030 implémentée.
- US-037 émet `InstructionPriseEnCompte` : alignement nécessaire avec US-015 (côté superviseur).
- US-036 : vérifier présence de `@react-native-async-storage/async-storage` avant implémentation.

---

### US-038 à US-046 — feedbacks terrain 2026-04-01 et 2026-04-02

| US | Titre court | Epic | Feature | BC | Priorité | Taille | Source |
|----|-------------|------|---------|-----|----------|--------|--------|
| US-038 | Harmonisation libellés UX | EPIC-008 | F-022 | BC-01 / BC-03 | Should Have | S | Feedback livreur + superviseur |
| US-039 | Export CSV bilan tableau de bord (W-01) | EPIC-003 | F-023 | BC-03 | Should Have | M | Feedback superviseur |
| US-040 | Enrichir colonnes CSV export (destinataire + statut) | EPIC-007 | F-024 | BC-07 | Should Have | S | Feedback superviseur |
| US-041 | Poids estimé + alerte surcharge dans W-04 | EPIC-007 | F-025 | BC-07 | Should Have | M | Feedback superviseur |
| US-042 | Horodatage consignes dans M-07 | EPIC-004 | F-027 | BC-04 | Should Have | XS | Feedback livreur |
| US-043 | Card SSO rétractable avant connexion | EPIC-006 | F-028 | BC-06 | Should Have | S | Feedback livreur |
| US-044 | Compteur durée déconnexion WebSocket | EPIC-003 | F-026 | BC-03 | Should Have | S | Feedback superviseur |
| US-045 | Hint visuel swipe onboarding | EPIC-001 | F-029 | BC-01 | Could Have | S | Feedback livreur |
| US-046 | Pad de tracé réel signature numérique dans M-04 | EPIC-002 | F-007 | BC-02 | Must Have | M | Dette technique US-008 + 3x feedback Pierre Morel |

Prochaine US libre : US-047

Bugs à traiter par @developpeur (pas de nouvelles US) :

- Signature simulée (US-008) : pad de tracé réel non intégré → remplacé par US-046.
- Offline silencieux dans ListeColisScreen (US-006 / US-026) : hook useNetworkStatus non branché.
- Confirmation après envoi instruction (US-014) : retour visuel manquant.
- livreurId littéral dans US-032 : "livreur" affiché à la place du nom réel.
