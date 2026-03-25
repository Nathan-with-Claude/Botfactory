# Scénarios de tests US-015 — Suivre l'exécution d'une instruction

**US liée** : US-015
**Titre** : Suivre l'état d'exécution d'une instruction envoyée à un livreur
**Bounded Context** : BC-03 Supervision
**Aggregate / Domain Event ciblé** : Instruction / InstructionExecutee
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-340 : Marquer une instruction ENVOYEE comme EXECUTEE — InstructionExecutee émis

**US liée** : US-015
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : Instruction.marquerExecutee() / InstructionExecutee
**Type** : Fonctionnel (happy path)
**Préconditions** : Backend svc-supervision en profil dev, instruction instr-dev-001 en statut ENVOYEE
**Étapes** :
1. Appeler PATCH /api/supervision/instructions/instr-dev-001/executer
2. Vérifier la réponse

**Résultat attendu** : HTTP 200 avec InstructionDTO.statut=EXECUTEE
**Statut** : Passé

```gherkin
Given l'instruction instr-dev-001 est en statut ENVOYEE
When PATCH /api/supervision/instructions/instr-dev-001/executer est appelé
Then la réponse est HTTP 200
And "statut" = "EXECUTEE" dans l'InstructionDTO
And un Domain Event InstructionExecutee est collecté
And un broadcast WebSocket est envoyé sur /topic/tableau-de-bord
```

---

### TC-341 : Invariant — transition EXECUTEE → EXECUTEE impossible → HTTP 409

**US liée** : US-015
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : Instruction.marquerExecutee() — IllegalStateException si statut != ENVOYEE
**Type** : Invariant domaine
**Préconditions** : Instruction instr-dev-002 déjà en statut EXECUTEE dans le DevDataSeeder
**Étapes** :
1. Appeler PATCH /api/supervision/instructions/instr-dev-002/executer
2. Vérifier la réponse

**Résultat attendu** : HTTP 409 Conflict — transition invalide depuis EXECUTEE
**Statut** : Passé

```gherkin
Given l'instruction instr-dev-002 est déjà en statut EXECUTEE
When PATCH /api/supervision/instructions/instr-dev-002/executer est appelé
Then la réponse est HTTP 409 Conflict
And IllegalStateException est levée par le domaine (transition EXECUTEE → EXECUTEE interdite)
```

---

### TC-342 : HTTP 404 si instruction inconnue

**US liée** : US-015
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : MarquerInstructionExecuteeHandler — InstructionNotFoundException
**Type** : Edge case
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler PATCH /api/supervision/instructions/instr-INEXISTANTE/executer
2. Vérifier la réponse

**Résultat attendu** : HTTP 404 Not Found
**Statut** : Passé

```gherkin
Given aucune instruction avec l'id "instr-INEXISTANTE" n'existe
When PATCH /api/supervision/instructions/instr-INEXISTANTE/executer est appelé
Then la réponse est HTTP 404 Not Found
```

---

### TC-343 : Liste des instructions d'une tournée accessible au SUPERVISEUR

**US liée** : US-015
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : ConsulterInstructionsParTourneeHandler
**Type** : Fonctionnel
**Préconditions** : Backend svc-supervision en profil dev, tournee-sup-001 avec 2 instructions (ENVOYEE + EXECUTEE)
**Étapes** :
1. Appeler GET /api/supervision/instructions/tournee/tournee-sup-001 avec MockJwt SUPERVISEUR
2. Vérifier la liste retournée

**Résultat attendu** : HTTP 200 avec 2 InstructionDTO triées par horodatage
**Statut** : Passé

```gherkin
Given tournee-sup-001 a 2 instructions (instr-dev-001 ENVOYEE + instr-dev-002 EXECUTEE)
When GET /api/supervision/instructions/tournee/tournee-sup-001 est appelé
Then la réponse est HTTP 200
And 2 instructions sont retournées, triées par horodatage
And instr-dev-001 a statut=ENVOYEE
And instr-dev-002 a statut=EXECUTEE
```

---

### TC-344 : Onglet Instructions dans la page W-02 — badge orange si instructions ENVOYEE

**US liée** : US-015
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : DetailTourneePage — onglet Instructions avec badge count
**Type** : Fonctionnel
**Préconditions** : Page W-02 pour tournee-sup-001, instruction instr-dev-001 en statut ENVOYEE
**Étapes** :
1. Naviguer vers la page de détail W-02 de tournee-sup-001
2. Observer l'onglet Instructions
3. Cliquer sur l'onglet

**Résultat attendu** : Le badge orange sur l'onglet Instructions indique le nombre d'instructions ENVOYEE. La liste affiche les instructions avec leurs badges de statut (En attente / Exécutée).
**Statut** : Passé

```gherkin
Given Laurent est sur la page W-02 de tournee-sup-001
And 1 instruction est en statut ENVOYEE
When Laurent observe l'onglet Instructions
Then un badge orange indique "(1)" sur le bouton de l'onglet
When Laurent clique sur l'onglet Instructions
Then la liste des instructions est affichée avec les statuts "En attente" et "Exécutée"
```

---

### TC-345 : Exécution automatique côté mobile — DetailColisScreen marque l'instruction EXECUTEE

**US liée** : US-015
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : DetailColisScreen — marquerInstructionExecutee (silencieux)
**Type** : Fonctionnel
**Préconditions** : Application mobile démarrée, instruction ENVOYEE pour colis-s-003
**Étapes** :
1. Naviguer vers le DetailColisScreen du colis colis-s-003
2. Observer les logs réseau (appel PATCH /executer silencieux)
3. Vérifier que l'instruction est marquée EXECUTEE côté backend

**Résultat attendu** : L'instruction est automatiquement marquée EXECUTEE quand Pierre consulte le colis concerné (transparent pour l'utilisateur)
**Statut** : Passé

```gherkin
Given une instruction ENVOYEE existe pour le colis colis-s-003 dans tournee-sup-001
When Pierre navigue vers le DetailColisScreen du colis colis-s-003
Then l'application appelle silencieusement PATCH /executer pour marquer l'instruction EXECUTEE
And aucune UI spécifique n'est affichée à Pierre (transparent)
And GET /api/supervision/instructions/tournee/tournee-sup-001 montre instr-dev-001 EXECUTEE
```
