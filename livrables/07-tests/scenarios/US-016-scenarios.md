# Scénarios de tests US-016 — Notification push instruction

**US liée** : US-016
**Titre** : Recevoir une notification push quand le superviseur modifie ma tournée
**Bounded Context** : BC-04 Notification (MVP : polling HTTP depuis mobile)
**Aggregate / Domain Event ciblé** : Aucun (lecture seule — polling) / InstructionReçue (côté mobile)
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-350 : Bandeau instruction M-06 affiché quand une nouvelle instruction ENVOYEE est détectée

**US liée** : US-016
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : BandeauInstructionOverlay — testID="bandeau-instruction-overlay"
**Type** : Fonctionnel (happy path)
**Préconditions** : Application mobile démarrée, instruction ENVOYEE créée côté backend
**Étapes** :
1. Lancer l'application mobile (écran M-02)
2. Créer une instruction ENVOYEE via POST /api/supervision/instructions
3. Attendre 10 secondes (polling interval)
4. Observer l'affichage du bandeau M-06

**Résultat attendu** : Le bandeau M-06 (testID="bandeau-instruction-overlay") apparaît avec le titre et le message de l'instruction
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-02 (ListeColisScreen) et sa tournée est active
When une instruction PRIORISER est envoyée par le superviseur pour un colis de sa tournée
And le polling (10s) détecte cette nouvelle instruction ENVOYEE
Then le bandeau M-06 (testID="bandeau-instruction-overlay") apparaît avec le titre de l'instruction
```

---

### TC-351 : Endpoint GET /en-attente retourne les instructions ENVOYEE pour une tournée

**US liée** : US-016
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : ConsulterInstructionsEnAttenteHandler
**Type** : Fonctionnel
**Préconditions** : Backend svc-supervision en profil dev, instruction instr-dev-001 ENVOYEE pour tournee-sup-001
**Étapes** :
1. Appeler GET /api/supervision/instructions/en-attente?tourneeId=tournee-sup-001
2. Vérifier la réponse

**Résultat attendu** : HTTP 200 avec la liste des instructions ENVOYEE uniquement
**Statut** : Passé

```gherkin
Given l'instruction instr-dev-001 est en statut ENVOYEE pour tournee-sup-001
When GET /api/supervision/instructions/en-attente?tourneeId=tournee-sup-001 est appelé
Then la réponse est HTTP 200
And la liste contient uniquement les instructions avec statut=ENVOYEE
And instr-dev-002 (EXECUTEE) n'est pas dans la liste
```

---

### TC-352 : Déduplication — un instructionId n'affiche le bandeau qu'une seule fois par session

**US liée** : US-016
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : ListeColisScreen — instructionsVues Set<string>
**Type** : Invariant domaine
**Préconditions** : Application mobile, bandeau déjà affiché pour instr-dev-001
**Étapes** :
1. Afficher le bandeau pour instr-dev-001
2. Fermer le bandeau
3. Attendre un nouveau cycle de polling (10s)
4. Observer que le bandeau ne réapparaît pas

**Résultat attendu** : Le bandeau ne réapparaît pas pour le même instructionId dans la session courante
**Statut** : Passé

```gherkin
Given le bandeau a déjà été affiché pour instr-dev-001 et fermé par Pierre
When le polling suivant (10s) détecte à nouveau instr-dev-001 comme ENVOYEE
Then le bandeau ne réapparaît pas (instructionsVues contient instr-dev-001)
And Pierre n'est pas perturbé par des répétitions
```

---

### TC-353 : Auto-fermeture du bandeau après 10 secondes sans interaction

**US liée** : US-016
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : BandeauInstructionOverlay — autoFermetureMs
**Type** : Fonctionnel
**Préconditions** : Bandeau M-06 affiché
**Étapes** :
1. Laisser le bandeau affiché sans interagir
2. Attendre 10 secondes (autoFermetureMs)
3. Observer la disparition automatique

**Résultat attendu** : Le bandeau disparaît automatiquement après 10 secondes sans interaction
**Statut** : Passé

```gherkin
Given le bandeau M-06 est affiché pour une instruction
When Pierre n'interagit pas pendant 10 secondes
Then le bandeau disparaît automatiquement (auto-fermeture)
And Pierre retrouve l'écran M-02 normal
```

---

### TC-354 : Bouton VOIR navigue vers M-03 du colis concerné

**US liée** : US-016
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : BandeauInstructionOverlay — testID="bouton-voir-instruction"
**Type** : Fonctionnel
**Préconditions** : Bandeau M-06 affiché pour une instruction liée à colis-s-003
**Étapes** :
1. Cliquer sur le bouton "VOIR" (testID="bouton-voir-instruction") du bandeau
2. Observer la navigation

**Résultat attendu** : Pierre est redirigé vers le DetailColisScreen du colis concerné par l'instruction
**Statut** : Passé

```gherkin
Given le bandeau M-06 est affiché pour une instruction liée à colis-s-003
When Pierre clique sur le bouton "VOIR" (testID="bouton-voir-instruction")
Then le bandeau se ferme
And Pierre est redirigé vers le DetailColisScreen du colis colis-s-003
```

---

### TC-355 : Mode offline — getInstructionsEnAttente retourne [] sans crash

**US liée** : US-016
**Couche testée** : Application (API simulée)
**Aggregate / Domain Event ciblé** : supervisionApi — getInstructionsEnAttente silencieux en cas d'erreur
**Type** : Edge case (offline)
**Préconditions** : Application mobile, réseau absent
**Étapes** :
1. Simuler le mode offline (réseau absent)
2. Attendre un cycle de polling
3. Observer que l'application ne plante pas

**Résultat attendu** : getInstructionsEnAttente() retourne [] silencieusement. Aucun crash. Le bandeau n'apparaît pas.
**Statut** : Passé

```gherkin
Given Pierre est en mode offline (réseau absent)
When le polling tente d'appeler GET /api/supervision/instructions/en-attente
Then getInstructionsEnAttente() retourne [] silencieusement (erreur capturée)
And aucun crash n'est déclenché
And le bandeau M-06 n'apparaît pas (liste vide)
```
