# Scénarios de tests US-067 — Envoyer un broadcast à ses livreurs actifs

**Agent** : @qa
**Date de rédaction** : 2026-04-21
**US** : US-067 — Envoyer un broadcast à ses livreurs actifs depuis le tableau de bord
**Aggregate** : BroadcastMessage
**Domain Events** : BroadcastEnvoye

---

## Pyramide de tests

| Niveau | Nb TCs | Outil | Objectif |
|--------|--------|-------|----------|
| L1 | 5 | `mvn test` (JUnit/Mockito) | Invariants domaine, Application Service |
| L2 | 5 | `curl` sur svc-supervision port 8082 | Flux HTTP, erreurs 422, secteurs |
| L3 | 3 | Playwright (port 3000) | Navigation W-09, formulaire UI |

---

## TC-067-L1-01 : Nominal TOUS — BroadcastEnvoye émis avec 4 livreurs EN_COURS

**US liée** : US-067
**Niveau** : L1
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : BroadcastMessage / BroadcastEnvoye
**Type** : Fonctionnel
**Préconditions** : 4 livreurs EN_COURS mockés dans ConsulterEtatLivreursHandler
**Étapes** : `EnvoyerBroadcastHandler.handle(cmd)` avec type=ALERTE, ciblage=TOUS, texte valide
**Résultat attendu** : BroadcastMessage créé, BroadcastEnvoye collecté, FCM appelé avec 4 tokens
**Statut** : À tester

```gherkin
Given 4 livreurs sont EN_COURS dans BC-07 pour la date du jour
When EnvoyerBroadcastHandler reçoit une commande ALERTE ciblage=TOUS texte="Rue Gambetta barrée"
Then BroadcastEnvoye est émis avec type=ALERTE, livreurIds=[4 ids], nombreDestinataires=4
And FcmBroadcastAdapter.envoyerMulticast est appelé avec 4 tokens FCM
And BroadcastMessageRepository.save est appelé une fois
```

---

## TC-067-L1-02 : Nominal SECTEUR — 2 livreurs destinataires filtrés par secteur

**US liée** : US-067
**Niveau** : L1
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : BroadcastMessage / BroadcastEnvoye
**Type** : Fonctionnel
**Préconditions** : 4 livreurs EN_COURS, secteur SECT-IDF-02 contient 2 de ces livreurs
**Étapes** : `EnvoyerBroadcastHandler.handle(cmd)` avec type=CONSIGNE, ciblage=SECTEUR(SECT-IDF-02)
**Résultat attendu** : BroadcastEnvoye émis avec livreurIds=[2 ids du secteur], FCM appelé avec 2 tokens
**Statut** : À tester

```gherkin
Given 4 livreurs sont EN_COURS et le secteur SECT-IDF-02 contient 2 d'entre eux
When EnvoyerBroadcastHandler reçoit CONSIGNE ciblage=SECTEUR([SECT-IDF-02])
Then BroadcastEnvoye.livreurIds contient exactement les 2 livreurs du secteur
And FcmBroadcastAdapter.envoyerMulticast est appelé avec 2 tokens
```

---

## TC-067-L1-03 : Rejet — Aucun livreur actif dans le ciblage

**US liée** : US-067
**Niveau** : L1
**Couche testée** : Application / Domaine
**Aggregate / Domain Event ciblé** : BroadcastMessage
**Type** : Invariant domaine
**Préconditions** : Secteur SECT-IDF-02 sans livreur EN_COURS (ou 0 livreurs EN_COURS au total)
**Étapes** : `EnvoyerBroadcastHandler.handle(cmd)` avec ciblage résolvant 0 livreur
**Résultat attendu** : `AucunLivreurActifException` levée, BroadcastMessage non persisté, FCM non appelé
**Statut** : À tester

```gherkin
Given le secteur SECT-IDF-02 ne contient aucun livreur EN_COURS
When EnvoyerBroadcastHandler reçoit INFO ciblage=SECTEUR([SECT-IDF-02])
Then AucunLivreurActifException est levée
And BroadcastMessageRepository.save n'est pas appelé
And FcmBroadcastAdapter n'est pas appelé
And BroadcastEnvoye n'est pas émis
```

---

## TC-067-L1-04 : Rejet — Texte vide invalide

**US liée** : US-067
**Niveau** : L1
**Couche testée** : Domaine
**Aggregate / Domain Event ciblé** : BroadcastMessage
**Type** : Invariant domaine
**Préconditions** : Commande avec texte=""
**Étapes** : `BroadcastMessage.envoyer(...)` avec texte vide
**Résultat attendu** : `IllegalArgumentException` levée avant persistance
**Statut** : À tester

```gherkin
Given une commande EnvoyerBroadcast avec texte=""
When BroadcastMessage.envoyer est invoqué
Then IllegalArgumentException est levée ("texte non vide requis")
And aucun BroadcastEnvoye n'est émis
```

---

## TC-067-L1-05 : Rejet — Texte supérieur à 280 caractères

**US liée** : US-067
**Niveau** : L1
**Couche testée** : Domaine
**Aggregate / Domain Event ciblé** : BroadcastMessage
**Type** : Invariant domaine
**Préconditions** : Commande avec texte de 281 caractères
**Étapes** : `BroadcastMessage.envoyer(...)` avec texte de 281 chars
**Résultat attendu** : `IllegalArgumentException` levée
**Statut** : À tester

```gherkin
Given une commande EnvoyerBroadcast avec un texte de 281 caractères
When BroadcastMessage.envoyer est invoqué
Then IllegalArgumentException est levée ("texte dépasse 280 caractères")
And aucun BroadcastEnvoye n'est émis
```

---

## TC-067-L2-01 : POST /broadcasts → 201 avec broadcastMessageId et nombreDestinataires

**US liée** : US-067
**Niveau** : L2
**Couche testée** : Infrastructure / Interface
**Type** : Fonctionnel cross-services
**Préconditions** : svc-supervision démarré profil dev, 6 livreurs seeder actifs
**Étapes** :
```bash
curl -s -X POST http://localhost:8082/api/supervision/broadcasts \
  -H "Content-Type: application/json" \
  -d '{"type":"ALERTE","texte":"Route D7 barrée","ciblage":{"type":"TOUS","secteurs":[]}}'
```
**Résultat attendu** : HTTP 201, body contient `broadcastMessageId`, `nombreDestinataires` > 0, `horodatageEnvoi`
**Statut** : À tester

```gherkin
Given svc-supervision est démarré en profil dev avec 6 livreurs seeder
When POST /api/supervision/broadcasts avec type=ALERTE, texte valide, ciblage=TOUS
Then HTTP 201 est retourné
And body.broadcastMessageId est non null
And body.nombreDestinataires > 0
And body.horodatageEnvoi est non null
```

---

## TC-067-L2-02 : POST /broadcasts avec secteur → destinataires filtrés

**US liée** : US-067
**Niveau** : L2
**Couche testée** : Infrastructure / Interface
**Type** : Fonctionnel
**Préconditions** : svc-supervision démarré profil dev, secteur SECT-IDF-02 seeder
**Étapes** :
```bash
curl -s -X POST http://localhost:8082/api/supervision/broadcasts \
  -H "Content-Type: application/json" \
  -d '{"type":"CONSIGNE","texte":"Consigne secteur","ciblage":{"type":"SECTEUR","secteurs":["SECT-IDF-02"]}}'
```
**Résultat attendu** : HTTP 201, `nombreDestinataires` correspond aux livreurs du secteur SECT-IDF-02
**Statut** : À tester

```gherkin
Given le secteur SECT-IDF-02 contient des livreurs actifs dans le seeder dev
When POST /broadcasts avec ciblage.type=SECTEUR et secteurs=["SECT-IDF-02"]
Then HTTP 201 et body.nombreDestinataires correspond aux livreurs du secteur
```

---

## TC-067-L2-03 : POST /broadcasts avec texte vide → 422 VALIDATION_ERROR

**US liée** : US-067
**Niveau** : L2
**Couche testée** : Interface / Domaine
**Type** : Edge case / Invariant
**Préconditions** : svc-supervision démarré
**Étapes** :
```bash
curl -s -X POST http://localhost:8082/api/supervision/broadcasts \
  -H "Content-Type: application/json" \
  -d '{"type":"INFO","texte":"","ciblage":{"type":"TOUS","secteurs":[]}}'
```
**Résultat attendu** : HTTP 422 ou 400, body contient code d'erreur VALIDATION_ERROR ou TEXTE_INVALIDE
**Statut** : À tester

```gherkin
Given une requête POST /broadcasts avec texte=""
When le handler traite la commande
Then HTTP 422 ou 400 est retourné
And body.error contient "TEXTE" ou "VALIDATION"
And aucun BroadcastMessage n'est persisté
```

---

## TC-067-L2-04 : GET /broadcast-secteurs → 200 avec les 3 secteurs du seeder

**US liée** : US-067
**Niveau** : L2
**Couche testée** : Infrastructure / Interface
**Type** : Fonctionnel
**Préconditions** : svc-supervision démarré, seeder a inséré SECT-IDF-01, 02, 03
**Étapes** :
```bash
curl -s http://localhost:8082/api/supervision/broadcast-secteurs
```
**Résultat attendu** : HTTP 200, array de 3 secteurs avec codeSecteur, libelle, actif=true
**Statut** : À tester

```gherkin
Given svc-supervision est démarré avec le seeder dev
When GET /api/supervision/broadcast-secteurs
Then HTTP 200 est retourné
And la liste contient au moins SECT-IDF-01, SECT-IDF-02, SECT-IDF-03
And chaque secteur a codeSecteur, libelle, actif=true
```

---

## TC-067-L2-05 : POST /broadcasts ciblage SECTEUR vide → 422 AUCUN_LIVREUR_ACTIF

**US liée** : US-067
**Niveau** : L2
**Couche testée** : Application / Interface
**Type** : Edge case
**Préconditions** : svc-supervision démarré, secteur avec 0 livreur EN_COURS
**Étapes** : POST avec un ciblage SECTEUR dont aucun livreur n'est EN_COURS
**Résultat attendu** : HTTP 422, body.error = "AUCUN_LIVREUR_ACTIF"
**Statut** : À tester

```gherkin
Given aucun livreur n'est EN_COURS dans le secteur ciblé
When POST /broadcasts avec ce ciblage
Then HTTP 422 est retourné
And body.error = "AUCUN_LIVREUR_ACTIF"
```

---

## TC-067-L3-01 : W-09 s'ouvre depuis la SideNavBar

**US liée** : US-067
**Niveau** : L3
**Couche testée** : UI
**Type** : Navigation
**Préconditions** : frontend-supervision démarré port 3000, svc-supervision démarré port 8082
**Étapes** : Playwright — naviguer vers http://localhost:3000, cliquer "Broadcast" dans SideNavBar
**Résultat attendu** : Le panneau W-09 (PanneauBroadcastPage) s'affiche avec formulaire de composition
**Statut** : À tester

```gherkin
Given le superviseur est sur le tableau de bord W-01 (http://localhost:3000)
When il clique sur l'entrée "Broadcast" dans la SideNavBar
Then le panneau W-09 s'affiche avec le formulaire de composition (sélecteur TypeBroadcast, textarea, bouton ENVOYER)
```

---

## TC-067-L3-02 : Bouton ENVOYER désactivé sans TypeBroadcast sélectionné

**US liée** : US-067
**Niveau** : L3
**Couche testée** : UI
**Type** : Invariant UI
**Préconditions** : panneau W-09 ouvert
**Étapes** : Playwright — saisir un texte valide et un ciblage sans sélectionner TypeBroadcast
**Résultat attendu** : bouton ENVOYER disabled tant que TypeBroadcast est absent
**Statut** : À tester

```gherkin
Given le panneau W-09 est ouvert
And aucun TypeBroadcast n'est sélectionné
When le superviseur saisit un texte valide et sélectionne un ciblage
Then le bouton ENVOYER est disabled (attribut disabled=true)
When il sélectionne "ALERTE"
Then le bouton ENVOYER devient actif (disabled=false)
```

---

## TC-067-L3-03 : Envoi broadcast → apparaît dans l'historique du jour

**US liée** : US-067
**Niveau** : L3
**Couche testée** : UI
**Type** : Fonctionnel UI
**Préconditions** : panneau W-09 ouvert, svc-supervision démarré
**Étapes** : Playwright — remplir formulaire et soumettre, vérifier l'historique
**Résultat attendu** : le broadcast envoyé apparaît dans la section "Historique des broadcasts du jour"
**Statut** : À tester

```gherkin
Given le panneau W-09 est ouvert
When le superviseur sélectionne ALERTE, saisit un texte valide, sélectionne ciblage TOUS, et clique ENVOYER
Then un toast "Message envoyé à N livreurs" s'affiche
And le broadcast apparaît en tête de l'historique avec le badge ALERTE et l'heure d'envoi
```
