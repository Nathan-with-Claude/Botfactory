# Scénarios de tests US-004 — Accéder au détail d'un colis

**US liée** : US-004 — Accéder au détail d'un colis et déclencher une action de livraison
**Bounded Context** : BC-01 Orchestration de Tournée
**Aggregate ciblé** : Colis (Entity dans Tournée) — US en lecture seule (aucun Domain Event)
**Numérotation** : TC-074 à TC-097 (continuation depuis TC-073 = fin US-003)

---

## Couverture

| Couche | TCs | Objets couverts |
|--------|-----|-----------------|
| Domain | TC-074 à TC-078 | Invariants Colis, `estTraite()`, transitions terminales |
| Application | TC-079 à TC-083 | `ConsulterDetailColisHandler`, exceptions |
| Infrastructure | TC-084 à TC-086 | Endpoint REST GET, codes HTTP |
| E2E | TC-087 à TC-097 | Parcours M-02 → M-03, actions, RGPD |

---

## TC-074 : Un colis à livrer expose `estTraite = false`

**US liée** : US-004
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Colis / aucun (lecture)
**Type** : Invariant domaine
**Préconditions** : Colis `colis-dev-001` avec statut `A_LIVRER` existe dans la Tournée
**Étapes** :
1. Construire un `Colis` avec statut `A_LIVRER`
2. Appeler `colis.estTraite()`

**Résultat attendu** : retourne `false`
**Statut** : Passé

```gherkin
Given un Colis avec statut "A_LIVRER"
When on appelle estTraite()
Then la valeur retournée est false
```

---

## TC-075 : Un colis livré expose `estTraite = true`

**US liée** : US-004
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Invariant domaine
**Préconditions** : Colis `colis-dev-004` avec statut `LIVRE`
**Étapes** :
1. Construire un `Colis` avec statut `LIVRE`
2. Appeler `colis.estTraite()`

**Résultat attendu** : retourne `true`
**Statut** : Passé

```gherkin
Given un Colis avec statut "LIVRE"
When on appelle estTraite()
Then la valeur retournée est true
```

---

## TC-076 : Un colis en échec expose `estTraite = true`

**US liée** : US-004
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Invariant domaine
**Préconditions** : Colis `colis-dev-005` avec statut `ECHEC`
**Étapes** :
1. Construire un `Colis` avec statut `ECHEC`
2. Appeler `colis.estTraite()`

**Résultat attendu** : retourne `true`
**Statut** : Passé

```gherkin
Given un Colis avec statut "ECHEC"
When on appelle estTraite()
Then la valeur retournée est true
```

---

## TC-077 : Le numéro de téléphone du destinataire ne doit jamais apparaître en clair dans le DTO

**US liée** : US-004
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Invariant domaine (RGPD)
**Préconditions** : `Colis` avec `Destinataire.telephoneChiffre` non nul
**Étapes** :
1. Construire un `Colis` avec destinataire ayant un numéro de téléphone
2. Vérifier que le champ `telephoneChiffre` n'est pas exposé directement en affichage clair

**Résultat attendu** : Le numéro est accessible en tant que donnée brute mais le frontend masque l'affichage — accès uniquement via `tel:` URI
**Statut** : Passé

```gherkin
Given un Colis avec destinataire ayant un numéro de téléphone "0612345678"
When on consulte l'écran M-03
Then aucun texte "0612345678" n'est affiché en clair dans l'interface
And le bouton "Appeler" est présent et ouvre "tel:0612345678"
```

---

## TC-078 : Un colis à livrer est toujours recherché dans le contexte de sa tournée

**US liée** : US-004
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Invariant domaine
**Préconditions** : `ColisId` existant mais dans une autre tournée
**Étapes** :
1. Rechercher le `ColisId` dans une `Tournée` qui ne le contient pas

**Résultat attendu** : `ColisNotFoundException` levée
**Statut** : Passé

```gherkin
Given un ColisId "colis-dev-001" existant dans la tournée "tournee-dev-001"
And une requête pour la tournée "tournee-autre-001" avec ce même ColisId
When ConsulterDetailColisHandler.handle() est appelé
Then ColisNotFoundException est levée
```

---

## TC-079 : `ConsulterDetailColisHandler` retourne le détail complet du colis

**US liée** : US-004
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Fonctionnel
**Préconditions** : Tournée `tournee-dev-001` avec colis `colis-dev-001` en mémoire (mock repository)
**Étapes** :
1. Créer `ConsulterDetailColisCommand(tourneeId="tournee-dev-001", colisId="colis-dev-001")`
2. Appeler `handler.handle(command)`

**Résultat attendu** : Retourne un `Colis` avec adresse complète, destinataire, contraintes et statut corrects
**Statut** : Passé

```gherkin
Given la Tournée "tournee-dev-001" contient le colis "colis-dev-001"
And le repository (mock) retourne la tournée correctement
When handle(ConsulterDetailColisCommand) est appelé
Then le Colis retourné contient : adresseLivraison, destinataire, contraintes, statut A_LIVRER
And aucun Domain Event n'est émis
```

---

## TC-080 : `ConsulterDetailColisHandler` lève `TourneeNotFoundException` si tournée introuvable

**US liée** : US-004
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Edge case
**Préconditions** : Repository (mock) retourne `Optional.empty()` pour `tourneeId`
**Étapes** :
1. Créer `ConsulterDetailColisCommand(tourneeId="tournee-inexistante", colisId="colis-dev-001")`
2. Appeler `handler.handle(command)`

**Résultat attendu** : `TourneeNotFoundException` levée avec message explicite
**Statut** : Passé

```gherkin
Given le repository ne trouve pas la tournée "tournee-inexistante"
When handle(ConsulterDetailColisCommand) est appelé
Then TourneeNotFoundException est levée
```

---

## TC-081 : `ConsulterDetailColisHandler` lève `ColisNotFoundException` si colis absent de la tournée

**US liée** : US-004
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Edge case
**Préconditions** : Tournée trouvée mais sans le `colisId` cherché
**Étapes** :
1. Créer `ConsulterDetailColisCommand(tourneeId="tournee-dev-001", colisId="colis-inexistant")`
2. Appeler `handler.handle(command)`

**Résultat attendu** : `ColisNotFoundException` levée avec message `"Colis 'colis-inexistant' introuvable dans la tournee 'tournee-dev-001'"`
**Statut** : Passé

```gherkin
Given la Tournée "tournee-dev-001" ne contient pas le colis "colis-inexistant"
When handle(ConsulterDetailColisCommand) est appelé
Then ColisNotFoundException est levée avec le message métier explicite
```

---

## TC-082 : `ConsulterDetailColisHandler` retourne `estTraite = true` pour un colis livré

**US liée** : US-004
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Fonctionnel
**Préconditions** : `colis-dev-004` avec statut `LIVRE` dans la tournée
**Étapes** :
1. `ConsulterDetailColisCommand(tourneeId="tournee-dev-001", colisId="colis-dev-004")`
2. Appeler `handler.handle(command)`

**Résultat attendu** : `Colis.estTraite()` retourne `true`
**Statut** : Passé

```gherkin
Given le colis "colis-dev-004" a le statut "LIVRE"
When handle(ConsulterDetailColisCommand) est appelé
Then le Colis retourné a estTraite = true
```

---

## TC-083 : Le handler est en lecture seule — aucun Domain Event émis

**US liée** : US-004
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : aucun
**Type** : Non régression
**Préconditions** : Tournée et colis valides
**Étapes** :
1. Appeler `handler.handle(command)` pour tout colis valide

**Résultat attendu** : `tournee.pullDomainEvents()` retourne une liste vide après l'appel
**Statut** : Passé

```gherkin
Given une Tournée valide avec un Colis valide
When ConsulterDetailColisHandler.handle() est appelé
Then aucun Domain Event n'est collecté dans la Tournée
```

---

## TC-084 : `GET /api/tournees/{tourneeId}/colis/{colisId}` retourne 200 avec détail complet

**US liée** : US-004
**Couche testée** : Infrastructure
**Aggregate / Domain Event ciblé** : aucun
**Type** : Fonctionnel
**Préconditions** : Backend démarré, profil dev, DevDataSeeder exécuté
**Étapes** :
1. `GET http://localhost:8081/api/tournees/tournee-dev-001/colis/colis-dev-001`

**Résultat attendu** : HTTP 200, body JSON avec `colisId`, `statut`, `adresseLivraison`, `destinataire`, `contraintes`, `estTraite: false`
**Statut** : Passé

```gherkin
Given le backend est démarré avec le profil dev
And le colis "colis-dev-001" existe dans la tournée "tournee-dev-001"
When GET /api/tournees/tournee-dev-001/colis/colis-dev-001
Then HTTP 200
And le body contient colisId, statut "A_LIVRER", adresseLivraison, destinataire, contraintes, estTraite: false
```

---

## TC-085 : `GET` retourne 404 si tournée introuvable

**US liée** : US-004
**Couche testée** : Infrastructure
**Aggregate / Domain Event ciblé** : aucun
**Type** : Edge case
**Préconditions** : Backend démarré
**Étapes** :
1. `GET http://localhost:8081/api/tournees/tournee-inexistante/colis/colis-dev-001`

**Résultat attendu** : HTTP 404
**Statut** : Passé

```gherkin
Given la tournée "tournee-inexistante" n'existe pas
When GET /api/tournees/tournee-inexistante/colis/colis-dev-001
Then HTTP 404
```

---

## TC-086 : `GET` retourne 404 si colis introuvable dans la tournée

**US liée** : US-004
**Couche testée** : Infrastructure
**Aggregate / Domain Event ciblé** : aucun
**Type** : Edge case
**Préconditions** : Backend démarré, tournée `tournee-dev-001` existe
**Étapes** :
1. `GET http://localhost:8081/api/tournees/tournee-dev-001/colis/colis-inexistant`

**Résultat attendu** : HTTP 404
**Statut** : Passé

```gherkin
Given la tournée "tournee-dev-001" existe mais ne contient pas "colis-inexistant"
When GET /api/tournees/tournee-dev-001/colis/colis-inexistant
Then HTTP 404
```

---

## TC-087 : E2E — Navigation M-02 vers M-03 en appuyant sur un colis

**US liée** : US-004
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Colis (lecture) / aucun
**Type** : Fonctionnel
**Préconditions** : Backend et Expo Web démarrés
**Étapes** :
1. Ouvrir `http://localhost:8082`
2. Attendre la liste M-02
3. Appuyer sur le premier `colis-item`

**Résultat attendu** : L'écran M-03 s'affiche avec `testID="detail-colis-screen"` visible
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-02 (liste des colis)
When Pierre appuie sur le premier colis de la liste
Then l'écran M-03 (detail-colis-screen) s'affiche
```

---

## TC-088 : E2E — L'écran M-03 affiche nom destinataire et adresse complète

**US liée** : US-004
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Fonctionnel
**Préconditions** : M-03 ouvert sur `colis-dev-001`
**Étapes** :
1. Naviguer vers M-03 (colis-dev-001)
2. Vérifier `testID="detail-destinataire-nom"` et `testID="detail-adresse"`

**Résultat attendu** : Nom destinataire et adresse affichés, non vides
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-03 du colis "colis-dev-001"
When l'écran est chargé
Then le nom du destinataire est visible et non vide
And l'adresse complète est visible et non vide
```

---

## TC-089 : E2E — Boutons d'action présents pour un colis à livrer

**US liée** : US-004
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Fonctionnel
**Préconditions** : M-03 ouvert sur `colis-dev-001` (statut `A_LIVRER`)
**Étapes** :
1. Naviguer vers M-03 (colis-dev-001)
2. Vérifier `testID="btn-livrer"` et `testID="btn-echec"`

**Résultat attendu** : Les deux boutons sont visibles et actifs
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-03 du colis "colis-dev-001" (statut A_LIVRER)
When l'écran est chargé
Then le bouton "LIVRER CE COLIS" est visible
And le bouton "DECLARER UN ECHEC" est visible
```

---

## TC-090 : E2E — Boutons d'action absents pour un colis livré

**US liée** : US-004
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Invariant domaine en E2E
**Préconditions** : M-03 ouvert sur `colis-dev-004` (statut `LIVRE`)
**Étapes** :
1. Naviguer vers M-03 (colis-dev-004)
2. Vérifier absence de `testID="btn-livrer"` et `testID="btn-echec"`

**Résultat attendu** : Les boutons sont absents ; un message de statut terminal est affiché
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-03 du colis "colis-dev-004" (statut LIVRE)
When l'écran est chargé
Then le bouton "LIVRER CE COLIS" est absent
And le bouton "DECLARER UN ECHEC" est absent
And un message de statut terminal est affiché
```

---

## TC-091 : E2E — Boutons d'action absents pour un colis en échec

**US liée** : US-004
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Invariant domaine en E2E
**Préconditions** : M-03 ouvert sur `colis-dev-005` (statut `ECHEC`)
**Étapes** :
1. Naviguer vers M-03 (colis-dev-005)

**Résultat attendu** : Boutons absents, message "Echec de livraison declare" visible
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-03 du colis "colis-dev-005" (statut ECHEC)
When l'écran est chargé
Then le bouton "LIVRER CE COLIS" est absent
And le bouton "DECLARER UN ECHEC" est absent
And le message de statut terminal est affiché
```

---

## TC-092 : E2E — Le numéro de téléphone n'est pas affiché en clair (RGPD)

**US liée** : US-004
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Sécurité (RGPD)
**Préconditions** : M-03 ouvert
**Étapes** :
1. Naviguer vers M-03 (colis-dev-001)
2. Rechercher dans le DOM tout texte correspondant à un numéro de téléphone

**Résultat attendu** : Aucun numéro de téléphone affiché en clair ; bouton "Appeler" présent
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-03
When l'écran est chargé
Then aucun numéro de téléphone n'est visible en texte brut
And le bouton "Appeler" est présent (accès via Linking.openURL tel:)
```

---

## TC-093 : E2E — Retour à la liste depuis M-03 sans rechargement

**US liée** : US-004
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : aucun
**Type** : Fonctionnel
**Préconditions** : Pierre est sur M-03
**Étapes** :
1. Naviguer vers M-03
2. Appuyer sur `testID="btn-retour"`

**Résultat attendu** : L'écran M-02 réapparaît sans déclenchement d'un nouvel appel API
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-03
When Pierre appuie sur le bouton retour
Then l'écran M-02 s'affiche
And aucun appel GET /api/tournees/today n'est déclenché
```

---

## TC-094 : E2E — API GET détail colis retourne 200 (colis-dev-001)

**US liée** : US-004
**Couche testée** : E2E (API directe)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Fonctionnel
**Préconditions** : Backend démarré
**Étapes** :
1. `GET http://localhost:8081/api/tournees/tournee-dev-001/colis/colis-dev-001`

**Résultat attendu** : HTTP 200, `estTraite: false`, `statut: "A_LIVRER"`
**Statut** : Passé

---

## TC-095 : E2E — API GET détail colis livré retourne `estTraite: true`

**US liée** : US-004
**Couche testée** : E2E (API directe)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Fonctionnel
**Préconditions** : Backend démarré, `colis-dev-004` statut LIVRE
**Étapes** :
1. `GET http://localhost:8081/api/tournees/tournee-dev-001/colis/colis-dev-004`

**Résultat attendu** : HTTP 200, `estTraite: true`, `statut: "LIVRE"`
**Statut** : Passé

---

## TC-096 : E2E — API GET colis inexistant retourne 404

**US liée** : US-004
**Couche testée** : E2E (API directe)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Edge case
**Préconditions** : Backend démarré
**Étapes** :
1. `GET http://localhost:8081/api/tournees/tournee-dev-001/colis/colis-inexistant`

**Résultat attendu** : HTTP 404
**Statut** : Passé

---

## TC-097 : E2E — Contraintes affichées pour un colis avec contrainte horaire

**US liée** : US-004
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Fonctionnel
**Préconditions** : Colis avec contrainte HORAIRE dans le DevDataSeeder
**Étapes** :
1. Naviguer vers M-03 sur un colis avec contrainte horaire

**Résultat attendu** : Section contraintes visible avec la valeur de la contrainte
**Statut** : Passé

```gherkin
Given le colis a une contrainte de type "HORAIRE" avec valeur "Avant 14h00"
When Pierre est sur l'écran M-03
Then la section "Contraintes" est visible
And la contrainte "Avant 14h00" est affichée
```
