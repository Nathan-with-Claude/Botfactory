# Implémentation US-004 : Accéder au détail d'un colis

## Contexte

**User Story** : US-004 — Accéder au détail d'un colis et déclencher une action de livraison
**Epic** : EPIC-001 — Exécution de la Tournée
**Priorité** : Must Have
**Complexité** : S (3 points)

En tant que Pierre Morel (livreur terrain), je veux accéder au détail complet d'un colis
depuis la liste et déclencher en un geste l'action "LIVRER CE COLIS" ou "DÉCLARER UN ÉCHEC",
afin de réaliser la mise à jour de statut en moins de 45 secondes, sans friction, d'une seule main.

Liens :
- Spec : `/livrables/05-backlog/user-stories/US-004-acceder-detail-colis.md`
- Wireframe : `/livrables/02-ux/wireframes.md` — Écran M-03
- Architecture : `/livrables/04-architecture-technique/architecture-applicative.md`
- Domaine : `/livrables/03-architecture-metier/domain-model.md`

---

## Bounded Context et couche ciblée

- **BC** : BC-01 Orchestration de Tournée (Core Domain)
- **Aggregate(s) modifiés** : Tournée (lecture via Repository), Colis (Entity — lecture seule)
- **Domain Events émis** : aucun (US-004 est un use case de lecture pure)
- **Domain Events futurs** : LivraisonConfirmée (US-008), ÉchecLivraisonDéclaré (US-005)

---

## Décisions d'implémentation

### Domain Layer

Aucune modification du modèle de domaine. Les classes existantes `Colis`, `Adresse`,
`Destinataire`, `Contrainte`, `StatutColis` couvrent entièrement les besoins de US-004.

Le champ `estTraite()` de `Colis` (existant) est utilisé pour déterminer l'état terminal
et masquer les boutons d'action.

### Application Layer

Trois nouvelles classes créées :

**`ConsulterDetailColisCommand`** (record immuable) :
- Porte `TourneeId` et `ColisId`
- Le colis est toujours recherché dans le contexte de sa tournée (intégrité métier)

**`ConsulterDetailColisHandler`** :
- Charge la Tournée par `tourneeId` via `TourneeRepository.findById()`
- Cherche le Colis dans la liste des colis de la Tournée par `colisId`
- Lève `TourneeNotFoundException` si la tournée est introuvable
- Lève `ColisNotFoundException` (nouvelle) si le colis n'appartient pas à cette tournée
- Use case en lecture seule (`@Transactional(readOnly = true)`) — aucun Domain Event

**`ColisNotFoundException`** :
- Exception applicative levée quand le `colisId` ne correspond à aucun colis de la tournée
- Message explicite : `"Colis '{colisId}' introuvable dans la tournee '{tourneeId}'"`

### Infrastructure Layer

Aucune modification. `TourneeRepository.findById()` existait déjà (US-001).
Le repository charge automatiquement tous les colis de la tournée via JPA.

### Interface Layer — Backend

**`TourneeController`** enrichi avec :
- Nouveau constructeur incluant `ConsulterDetailColisHandler`
- Nouvel endpoint : `GET /api/tournees/{tourneeId}/colis/{colisId}`
- Retourne `ColisDTO` avec 200 ou 404 si tournée/colis introuvable

**`ColisDTO`** enrichi :
- Ajout du champ `estTraite` (boolean) — calculé depuis `Colis.estTraite()`
- Expose l'état terminal au frontend pour masquer les boutons d'action
- Masquage du numéro de téléphone : le champ `telephoneChiffre` est transmis tel quel,
  le masquage de l'affichage est à la charge du frontend (conformité RGPD)

### Frontend Mobile — Interface Layer

**`tourneeApi.ts`** enrichi :
- Nouvelle fonction `getDetailColis(tourneeId, colisId): Promise<ColisDTO>`
- Nouvelle classe `ColisNonTrouveError` (erreur métier 404)

**`tourneeTypes.ts`** enrichi :
- Champ `estTraite: boolean` ajouté à `ColisDTO` (miroir du backend)

**`DetailColisScreen.tsx`** (nouvel écran M-03) :
- Props : `tourneeId`, `colisId`, `onRetour`, `onLivrer?`, `onEchec?`
- États : chargement, succès, erreur
- Section destinataire : nom, adresse complète, complément d'adresse, bouton d'appel
- Le numéro de téléphone n'est JAMAIS affiché en clair — `Linking.openURL('tel:...')` uniquement
- Section contraintes : affichée uniquement si contraintes présentes
- Bouton "Voir sur la carte" : ouvre Google Maps via `Linking.openURL`
- Boutons d'action `LIVRER CE COLIS` / `DÉCLARER UN ÉCHEC` : absents si `estTraite === true`
- Message de statut terminal si `estTraite === true` (LIVRE, ECHEC, A_REPRESENTER)
- TODO `onLivrer` : navigue vers M-04 (US-008 — Capture de la preuve)
- TODO `onEchec` : navigue vers M-05 (US-005 — Déclaration d'un échec)

**`ColisItem.tsx`** mis à jour :
- Prop `onPress?: (colisId: string) => void` ajoutée (US-004)
- `View` remplacé par `TouchableOpacity` (item navigable)
- `estTraite` lit désormais `colis.estTraite` (champ DTO) au lieu de `colis.statut !== 'A_LIVRER'`

**`ListeColisScreen.tsx`** mis à jour :
- Import de `DetailColisScreen`
- État de navigation interne `NavigationColis : 'liste' | 'detail'`
- `ouvrirDetailColis(colisId)` : navigue vers le détail en mémorisant `tourneeId`
- `revenirALaListe()` : retour à la liste sans rechargement
- `ColisItem` reçoit `onPress={ouvrirDetailColis}`

### Erreurs / invariants préservés

| Invariant | Comment préservé |
|---|---|
| Colis livré/échec → boutons désactivés | `estTraite` dans ColisDTO → frontend masque les boutons |
| Transitions de statut autorisées | Non concerné (US-004 est lecture seule) |
| Numéro de téléphone masqué (RGPD) | `telephoneChiffre` non affiché, accessible via `tel:` uniquement |
| Colis recherché dans sa tournée | `ConsulterDetailColisHandler` charge la tournée par ID puis filtre les colis |

---

## Tests

### Backend — Tests unitaires

**`ConsulterDetailColisHandlerTest`** (5 tests) :
- `handle()` retourne le colis correspondant au `colisId`
- `handle()` retourne les infos complètes (adresse, destinataire, contraintes)
- `handle()` lève `TourneeNotFoundException` si tournée introuvable
- `handle()` lève `ColisNotFoundException` si colis introuvable dans la tournée
- `handle()` retourne le colis avec statut terminal `LIVRE`

**`DetailColisControllerTest`** (6 tests) :
- `GET /api/tournees/{tourneeId}/colis/{colisId}` retourne 200 avec les détails
- Retourne les contraintes actives du colis
- Retourne `estTraite: true` pour un colis livré
- Retourne 404 si tournée introuvable
- Retourne 404 si colis introuvable dans la tournée
- Retourne 401 si non authentifié

**Total backend** : 34/34 tests verts (23 existants + 11 nouveaux US-004)

### Frontend — Tests Jest

**`DetailColisScreen.test.tsx`** (16 tests) :
- SC1 : affichage nom destinataire, adresse complète, complément, ID colis dans le header, boutons d'action
- SC2 : colis livré — boutons absents, message statut terminal
- SC3 : colis en échec — boutons absents, message statut terminal
- SC4 : contraintes affichées, section absente si aucune contrainte
- SC5 : bouton d'appel présent, numéro brut absent de l'affichage (RGPD)
- SC6 : état de chargement
- SC7 : état d'erreur réseau, erreur 404
- Navigation : `getDetailColis` appelé avec les bons paramètres, bouton retour

**Total mobile** : 50/50 tests verts (34 existants + 16 nouveaux US-004)

---

## Commandes de lancement (tests manuels)

### Démarrer le backend

```bash
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot"
cd src/backend/svc-tournee
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Démarrer le frontend mobile

```bash
cd src/mobile
npx expo start
```

### URLs à utiliser pour tester

```
# Liste des colis (US-001, US-002, US-003)
GET http://localhost:8081/api/tournees/today

# Détail d'un colis (US-004)
GET http://localhost:8081/api/tournees/tournee-test-001/colis/colis-001
GET http://localhost:8081/api/tournees/tournee-test-001/colis/colis-004   (statut LIVRE)
GET http://localhost:8081/api/tournees/tournee-test-001/colis/colis-005   (statut ECHEC)
GET http://localhost:8081/api/tournees/tournee-test-001/colis/colis-inexistant  (404)
```

Le `DevDataSeeder` crée automatiquement :
- colis-001, colis-002, colis-003 : statut `A_LIVRER` (boutons visibles)
- colis-004 : statut `LIVRE` (boutons absents, message "Ce colis a ete livre")
- colis-005 : statut `ECHEC` (boutons absents, message "Echec de livraison declare")

---

## Scénarios de tests manuels

| Scénario | Action | Résultat attendu |
|---|---|---|
| SC1 | Taper sur un colis "A livrer" dans la liste | Écran M-03 s'ouvre avec le nom, l'adresse, le complément et les contraintes |
| SC2 | Ouvrir un colis avec statut "Livre" | Boutons absents, message "Ce colis a ete livre" |
| SC3 | Ouvrir un colis avec statut "Echec" | Boutons absents, message "Echec de livraison declare" |
| SC4 | Vérifier l'affichage du numéro de téléphone | Numéro invisible, bouton "Appeler" présent |
| SC5 | Appuyer sur "Voir sur la carte" | Google Maps s'ouvre avec l'adresse pré-remplie |
| SC6 | Appuyer sur le bouton retour | Retour à la liste sans rechargement |
| SC7 | GET colis inexistant (API) | 404 Not Found |
