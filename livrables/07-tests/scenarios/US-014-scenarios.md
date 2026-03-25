# Scénarios de tests US-014 — Envoyer une instruction à un livreur

**US liée** : US-014
**Titre** : Envoyer une instruction structurée à un livreur
**Bounded Context** : BC-03 Supervision
**Aggregate / Domain Event ciblé** : Instruction / InstructionEnvoyee
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-330 : Envoi d'une instruction PRIORISER — InstructionEnvoyee collecté

**US liée** : US-014
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : Instruction.envoyer() / InstructionEnvoyee
**Type** : Fonctionnel (happy path)
**Préconditions** : Backend svc-supervision en profil dev, colis colis-s-003 en statut A_LIVRER
**Étapes** :
1. Appeler POST /api/supervision/instructions avec tourneeId="tournee-sup-001", colisId="colis-s-003", typeInstruction="PRIORISER"
2. Vérifier la réponse

**Résultat attendu** : HTTP 201 Created avec InstructionCreeDTO (instructionId, statut=ENVOYEE, type=PRIORISER)
**Statut** : Passé

```gherkin
Given Laurent est authentifié SUPERVISEUR
And le colis colis-s-003 est en statut A_LIVRER dans tournee-sup-001
When POST /api/supervision/instructions est appelé avec typeInstruction=PRIORISER
Then la réponse est HTTP 201 Created
And "statut" = "ENVOYEE"
And "typeInstruction" = "PRIORISER"
And un Domain Event InstructionEnvoyee est collecté
```

---

### TC-331 : Invariant — REPROGRAMMER sans créneau → HTTP 422

**US liée** : US-014
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : Instruction.envoyer() — IllegalArgumentException si REPROGRAMMER sans creneauCible
**Type** : Invariant domaine
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler POST /api/supervision/instructions avec typeInstruction=REPROGRAMMER et sans creneauCible
2. Vérifier la réponse

**Résultat attendu** : HTTP 422 Unprocessable Entity
**Statut** : Passé

```gherkin
Given Laurent veut envoyer une instruction REPROGRAMMER
When POST /api/supervision/instructions est appelé avec typeInstruction=REPROGRAMMER et creneauCible=null
Then la réponse est HTTP 422 Unprocessable Entity
And IllegalArgumentException est levée par le domaine (REPROGRAMMER nécessite un créneau)
```

---

### TC-332 : Invariant — une seule instruction ENVOYEE par colis → HTTP 409 si doublon

**US liée** : US-014
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : EnvoyerInstructionHandler — InstructionDejaEnAttenteException → HTTP 409
**Type** : Invariant domaine
**Préconditions** : Une instruction ENVOYEE déjà en base pour colis-s-003
**Étapes** :
1. Envoyer une première instruction PRIORISER pour colis-s-003
2. Tenter d'envoyer une deuxième instruction pour le même colis
3. Vérifier la réponse

**Résultat attendu** : HTTP 409 Conflict — une seule instruction en attente par colis
**Statut** : Passé

```gherkin
Given une instruction ENVOYEE existe déjà pour le colis colis-s-003
When POST /api/supervision/instructions est appelé avec le même colisId="colis-s-003"
Then la réponse est HTTP 409 Conflict
And InstructionDejaEnAttenteException est levée
And une seule instruction reste en base pour ce colis
```

---

### TC-333 : Invariant — rôle LIVREUR interdit sur POST /api/supervision/instructions → HTTP 403

**US liée** : US-014
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : SecurityConfig — ROLE_LIVREUR refusé sur POST instructions
**Type** : Invariant domaine / Sécurité
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler POST /api/supervision/instructions avec token MockJwt LIVREUR
2. Vérifier la réponse

**Résultat attendu** : HTTP 403 Forbidden
**Statut** : Passé

```gherkin
Given Pierre est authentifié avec le rôle LIVREUR
When POST /api/supervision/instructions est appelé avec son token
Then la réponse est HTTP 403 Forbidden
And aucune instruction n'est créée
```

---

### TC-334 : PanneauInstructionPage — bouton ENVOYER désactivé si REPROGRAMMER sans créneau (UI)

**US liée** : US-014
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : PanneauInstructionPage — validation UI côté client
**Type** : Fonctionnel
**Préconditions** : Page W-03 (PanneauInstructionPage) affichée
**Étapes** :
1. Ouvrir le panneau d'instruction pour un colis A_LIVRER
2. Sélectionner le type REPROGRAMMER
3. Ne pas renseigner le créneau
4. Observer l'état du bouton ENVOYER

**Résultat attendu** : Le bouton ENVOYER est désactivé. Le message d'avertissement (data-testid="message-creneau-requis") est visible.
**Statut** : Passé

```gherkin
Given Laurent est sur le panneau d'instruction (data-testid="panneau-instruction")
When Laurent sélectionne le type "REPROGRAMMER" sans renseigner de créneau
Then le bouton "ENVOYER" est désactivé
And le message "Créneau requis" (data-testid="message-creneau-requis") est visible
```

---

### TC-335 : Toast de succès affiché après envoi réussi

**US liée** : US-014
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : PanneauInstructionPage — toast (data-testid="toast-succes")
**Type** : Fonctionnel
**Préconditions** : Page W-03 ouverte, backend disponible
**Étapes** :
1. Sélectionner PRIORISER et cliquer sur ENVOYER
2. Observer le toast de succès

**Résultat attendu** : Le toast succès (data-testid="toast-succes") avec le nom du livreur est affiché après 201
**Statut** : Passé

```gherkin
Given Laurent a sélectionné le type PRIORISER dans le panneau instruction
When Laurent clique sur "ENVOYER"
And le backend retourne HTTP 201
Then le toast de succès (data-testid="toast-succes") est affiché avec le nom du livreur
And le panneau peut être fermé
```
