# Journal de bord — @po — DocuPost

> **RÈGLE** : Lire ce fichier EN DÉBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier remplace la relecture complète de `/livrables/05-backlog/`.

---

## Contexte synthétisé

- **Livrables propriété** : `05-backlog/`
- **État backlog MVP** : 8 Epics / 29 Features / 66 User Stories (MVP + corrections as-built)
- **Prochaine US libre** : US-067

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
> ← Entrées antérieures au 2026-04-03 archivées dans [archives/journal-po-2026-04.md]
| 2026-04-03 | US-050 rattachée à EPIC-007 / F-020 | Désaffectation = inverse de US-023 — même Feature, même BC-07 |
| 2026-04-03 | 6e livreur = livreur-006 / Lucas Petit | Besoin de 2 livreurs sans tournée (005 + 006) pour couvrir le cas onboarding |
| 2026-04-03 | DesaffectationEnregistree historisé dans BC-05 | Auditabilité obligatoire — aligne avec invariant US-018 |
| 2026-04-04 | 5 écarts P0 identifiés dans rapports as-built + 4 écarts P1 | US-051→059 créées pour corriger avant déploiement prod |
| 2026-04-04 | BC-07 fusionné svc-supervision accepté en P2 pour MVP | Dette technique documentée, split prévu R2 |
| 2026-04-04 | react-navigation obligatoire avant mise en prod (P1, pas R2) | Bouton retour Android = régression UX bloquante terrain |
| 2026-04-04 | Spring Boot 3.4.3 conservé (Spring Boot 4 non GA) | Décision dev correcte — mettre à jour ADR DD-001 (@architecte-technique) |
| 2026-04-04 | US-061 créée en P0 malgré doublon US-046 | US-046 "Prête" jamais implémentée (4e signal terrain) — US-061 force la priorisation P0 |
| 2026-04-04 | Terminologie terrain établie : "envois en attente" remplace "synchronisation" | Jargon IT incompris des livreurs — documenté dans corrections-as-built, à appliquer côté dev |
| 2026-04-04 | US-060 créée en P0 distinct de US-056 | persist() après sync = risque double envoi — sous-cas non couvert par US-056 (persistance à l'enqueue) |
| 2026-04-06 | US-065 : traçabilité backlog pour corrections as-built supervision (Terminée) | 4 anomalies détectées en test manuel et corrigées directement en code — US créée pour non-régression et auditabilité |
| 2026-04-06 | US-066 : nouveau besoin superviseur — page état des livreurs (Should Have) | Besoin exprimé terrain — dérivé de TourneePlanifiee BC-07 + VueTournee BC-03. VueLivreur Read Model à valider par @architecte-metier. Agents notifiés : @ux, @architecte-metier, @architecte-technique, @developpeur |

---

## Interventions réalisées

> ← Entrées antérieures archivées dans [archives/journal-po-2026-04.md]

| Date | Version | Sujet | Fichiers |
|------|---------|-------|----------|
> ← Entrées US-048 à US-053 archivées dans [archives/journal-po-2026-04.md]
| 2026-04-04 | 1.7 | Création US-054 — provisionnement PostgreSQL dev (P0/S) | US-054-provisionnement-postgresql-dev.md |
| 2026-04-04 | 1.7 | Création US-055 — migration react-navigation Stack (P1/M) | US-055-migration-navigation-react-navigation.md |
| 2026-04-04 | 1.7 | Création US-056 — persistance offlineQueue AsyncStorage (P1/S) | US-056-persistance-offline-queue-async-storage.md |
| 2026-04-04 | 1.7 | Création US-057 — WebSocket STOMP tableau de bord temps réel (P1/L) | US-057-websocket-stomp-tableau-de-bord-temps-reel.md |
| 2026-04-04 | 1.7 | Création US-058 — CORS restrictif + sécurité endpoint interne (P1/S) | US-058-cors-securite-endpoint-interne.md |
| 2026-04-04 | 1.7 | Création US-059 — upload photo multipart (P1/M) | US-059-upload-photo-multipart.md |
| 2026-04-04 | 1.8 | Création US-060 — correction persist() manquant après sync() dans offlineQueue (P0/XS) | US-060-correction-persist-apres-sync-offline-queue.md |
| 2026-04-04 | 1.8 | Création US-061 — brancher react-native-signature-canvas dans CapturePreuveScreen (P0/S, relance US-046) | US-061-brancher-signature-reelle-capture-preuve.md |
| 2026-04-04 | 1.8 | Création US-062 — compteur envois en attente dans IndicateurSync (P1/S) | US-062-compteur-envois-en-attente-indicateur-sync.md |
| 2026-04-04 | 1.8 | Ajout règles de libellé UX (terminologie terrain vs jargon IT) + nouvelles US dans corrections-as-built-2026-04.md | corrections-as-built-2026-04.md |
| 2026-04-06 | 1.9 | Création US-065 — traçabilité backlog des 4 anomalies de cohérence supervision (codeTMS, double affectation, VueTournees fantômes, blocage UI) | US-065-correction-coherence-supervision-donnees.md |
| 2026-04-06 | 2.0 | Création US-066 — page état des livreurs W-08 (SANS_TOURNEE / AFFECTE_NON_LANCE / EN_COURS), Should Have / M | US-066-page-etat-livreurs.md |

---

## Points d'attention — prochaines interventions

- **EPIC-007 est un prérequis** : US-021, US-023, US-024 doivent être développées avant US-001
- Ordre de développement recommandé : US-019/020 (SSO) → US-021/023/024 (planification) → US-001 (livreur)
- **US-067** prochaine US libre
- Toute nouvelle US doit avoir ses critères d'acceptation en format GIVEN/WHEN/THEN
- **Sprint corrections as-built P0** : US-051 → US-052 → US-053 → US-054 → US-060 → US-061 (traiter en priorité absolue)
- **Sprint stabilisation P1** : US-058 → US-056 → US-062 → US-055 → US-059 → US-057 (avant démo terrain)
- **US-061 relance US-046** : US-046 ("Prête") n'a pas été implémentée — US-061 force la priorisation P0
- **Règles libellé UX** : documentées dans corrections-as-built-2026-04.md — appliquer dès la prochaine session dev (IndicateurSync, messages status offline)
- **US-065 Terminée** : traçabilité backlog des 4 anomalies supervision. Les règles de non-régression listées dans US-065 doivent être intégrées aux critères de revue de code pour toute modification de `TableauDeBordPage`, `DetailTourneePlanifieePage` et `DevDataSeeder`.
- @architecte-technique doit mettre à jour ADR DD-001 (Spring Boot 3.4.3 + BC-07 fusionné)

### US-034 à US-050 — feedbacks terrain et besoins dev (synthèse)

> Détail complet dans les fichiers US-034→050.md — ne lire que si la tâche le justifie.

| US | Titre court | Priorité | Taille | Statut |
|----|-------------|----------|--------|--------|
| US-034 | Suggestion réaffectation après échec compatibilité | Should | S | À faire |
| US-035 | Recherche multi-critères tableau de bord | Should | S | À faire |
| US-036 | Card SSO rétractable après 1ère connexion | Could | S | À faire |
| US-037 | Historique consignes livreur (M-07) | Should | M | À faire |
| US-038 | Harmonisation libellés UX | Should | S | À faire |
| US-039 | Export CSV bilan W-01 | Should | M | À faire |
| US-040 | Enrichir colonnes CSV export | Should | S | À faire |
| US-041 | Poids estimé + alerte surcharge W-04 | Should | M | À faire |
| US-042 | Horodatage consignes M-07 | Should | XS | À faire |
| US-043 | Card SSO rétractable avant connexion | Should | S | À faire |
| US-044 | Compteur durée déconnexion WebSocket | Should | S | À faire |
| US-045 | Hint visuel swipe onboarding | Could | S | À faire |
| US-046 | Pad tracé réel signature numérique M-04 | Must | M | À faire |
| US-047 | Sélecteur livreur mode dev mobile | Must | S | Terminée |
| US-048 | Sync supervision ↔ mobile livreur | Must | M | Prête |
| US-049 | 6 livreurs dev cohérents (mobile + supervision) | Must | S | Prête |
| US-050 | Désaffecter livreur d'une tournée planifiée | Should | S | Prête |

Points d'attention clés :
- US-034 post-US-030 — prérequis : US-030 implémentée.
- US-046 bloquant légal — pad de tracé réel obligatoire.
- US-049 bloquant tests manuels — aligner avant tout test de flux.

### Bugs à traiter par @developpeur (pas de nouvelles US)

- Offline silencieux dans ListeColisScreen (US-006 / US-026) : hook useNetworkStatus non branché.
- Confirmation après envoi instruction (US-014) : retour visuel manquant.
- livreurId littéral dans US-032 : "livreur" affiché à la place du nom réel.
