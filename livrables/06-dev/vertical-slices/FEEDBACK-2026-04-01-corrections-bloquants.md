# Corrections bloquants — Feedback terrain 2026-04-01

## Contexte

Suite aux feedbacks terrain du 2026-04-01 produits par l'agent @end-user (personas
Laurent Renaud — superviseur et Pierre Morel — livreur), 6 bloquants ont été identifiés
et corrigés dans cette session.

**Fichiers source des feedbacks** :
- `/livrables/09-feedback/feedback-superviseur-2026-04-01.md`
- `/livrables/09-feedback/feedback-livreur-2026-04-01.md`

---

## Bloquant 1 — livreurId hardcodé "livreur" dans SupervisionNotifier (US-032)

**Symptome** : Les événements envoyés à svc-supervision portaient `livreurId = "livreur"` en dur.
La `VueTournee` côté superviseur affichait donc le même nom pour tous les livreurs.

**Cause racine** : `SupervisionNotifier` avait été créé dans US-032 mais n'était jamais injecté
dans `TourneeController`. Les handlers d'événements (`/echec`, `/livraison`, `/cloture`)
passaient `"livreur"` en dur.

**Correction** :

Fichier : `src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/rest/TourneeController.java`

- Import `SupervisionNotifier` ajouté.
- `SupervisionNotifier supervisionNotifier` ajouté comme paramètre du constructeur.
- Paramètre `Authentication authentication` ajouté aux endpoints `/echec`, `/livraison`, `/cloture`.
- `String livreurId = authentication != null ? authentication.getName() : "inconnu";` utilisé pour tous les appels.
- `supervisionNotifier.notifierAsync(...)` appelé après chaque action avec le vrai `livreurId`.

Fichiers tests mis à jour (ajout `@MockBean SupervisionNotifier`) :
- `TourneeControllerTest.java`
- `EchecLivraisonControllerTest.java`
- `ConfirmerLivraisonControllerTest.java`
- `CloturerTourneeControllerTest.java`
- `DetailColisControllerTest.java`
- `SecurityConfigTest.java`

**Résultats tests** : 32/32 tests backend svc-tournee verts (BUILD SUCCESS).

---

## Bloquant 2 — useNetworkStatus non raccordé a ListeColisScreen

**Symptome** : Le hook `useNetworkStatus` (créé US-026) existait mais n'était jamais appelé
dans `ListeColisScreen`. L'`IndicateurSync` recevait `syncStatus="live"` en dur, sans refléter
la connectivité réelle du livreur.

**Correction** :

Fichier : `src/mobile/src/screens/ListeColisScreen.tsx`

- Import `useNetworkStatus` et `IndicateurSync` ajoutés.
- Import `AsyncStorage` ajouté (partage du contexte avec Bloquant 6).
- `const syncStatus = useNetworkStatus();` appelé au niveau du composant.
- Bandeau hors-ligne rendu conditionnellement avant `BandeauInstructionOverlay` :
  ```tsx
  {syncStatus === 'offline' && (
    <View style={styles.bandeauHorsLigne} testID="bandeau-hors-ligne">
      <IndicateurSync syncStatus="offline" />
      <Text style={styles.bandeauHorsLigneTexte}>
        Hors ligne — vos actions seront synchronisees
      </Text>
    </View>
  )}
  ```
- Styles `bandeauHorsLigne` et `bandeauHorsLigneTexte` ajoutés.

---

## Bloquant 3 — Titre de page absent sur app web superviseur

**Statut** : Deja corrige dans une session precedente.

`App.tsx` contient deja `TITRES_PAR_PAGE` + `useEffect` qui appelle `document.title = ...`
lors de chaque changement de route. Aucune modification requise.

---

## Bloquant 4 — Bouton ENVOYER non desactive apres succes + toast incomplet

**Symptome** : Apres un envoi réussi, le bouton ENVOYER restait actif et pouvait être recliqué,
provoquant un doublon d'instruction. Le toast de succès n'indiquait pas que le livreur avait
été notifié.

**Correction** :

Fichier : `src/web/supervision/src/pages/PanneauInstructionPage.tsx`

- Condition `peutEnvoyer` modifiée pour inclure `envoi !== 'succes'` :
  ```ts
  const peutEnvoyer = creneauValide && envoi !== 'loading' && envoi !== 'succes';
  ```
- Toast succès enrichi avec confirmation de notification livreur et accessibilité :
  ```tsx
  <div data-testid="toast-succes" role="status" aria-live="polite"
       style={{...display:'flex', gap:8}}>
    <span>✓</span>
    <span>Instruction envoyée{livreurNom ? ` à ${livreurNom}` : ''}.
          Le livreur a été notifié.</span>
  </div>
  ```

Fichier : `src/web/supervision/src/__tests__/PanneauInstructionPage.test.tsx`

- Test `Bloquant-4: désactive le bouton ENVOYER après un envoi réussi` ajouté.
- Test `Bloquant-4: le toast succès affiche "Le livreur a été notifié"` ajouté.

---

## Bloquant 5 — WebSocket sans bouton "Reconnecter" ni compteur de déconnexion

**Symptome** : Lorsque la connexion WebSocket tombait, le superviseur voyait un bandeau rouge
mais ne pouvait pas relancer la connexion manuellement ni savoir depuis combien de temps
les données étaient figées.

**Correction** :

Fichier : `src/web/supervision/src/pages/TableauDeBordPage.tsx`

- `UseTableauDeBordResult` étendu avec `reconnecterManuellement: () => void` et `deconnecteDepuisMs: number | null`.
- `useTableauDeBord` refactorisé : extraction de `connecterWs()` en callback stable, ajout de `deconnecteDepuisMs` state (timestamp posé à chaque `onclose`/`onerror`), `reconnecterManuellement` réinitialise et reconnecte.
- Composant `TableauDeBordPage` : state `maintenant` mis à jour toutes les 60 secondes pour
  calculer `minutesDeconnecte`.
- Bandeau déconnexion enrichi :
  ```tsx
  {!connecte && !chargement && (
    <div data-testid="bandeau-deconnexion" style={{...display:'flex', gap:12}}>
      <span style={{flex:1}}>
        Connexion temps réel indisponible...
        {minutesDeconnecte !== null && minutesDeconnecte > 0 && (
          <span data-testid="compteur-deconnexion">
            (Déconnecté depuis {minutesDeconnecte} min)
          </span>
        )}
      </span>
      <button data-testid="btn-reconnecter" onClick={reconnecterManuellement}>
        Reconnecter
      </button>
    </div>
  )}
  ```

Fichier : `src/web/supervision/src/__tests__/TableauDeBordPage.test.tsx`

- Test `Bloquant-5: affiche le bouton "Reconnecter"` ajouté.
- Test `Bloquant-5: le bouton Reconnecter recharge les données` ajouté.

---

## Bloquant 6 — Hint visuel swipe absent ou toujours affiché (US-029)

**Symptome** : Le hint "← Glisser" pour le swipe rapide d'échec (US-029) soit n'apparaissait
pas, soit apparaissait à chaque session, ce qui le rendait intrusif après la phase d'onboarding.

**Correction** :

Fichier : `src/mobile/src/screens/ListeColisScreen.tsx`

- Constantes `SWIPE_HINT_MAX_SESSIONS = 5` et `SWIPE_HINT_KEY = '@docupost/swipe_hint_count'` ajoutées.
- State `afficherHintSwipe` initialisé à `false`.
- `useEffect` au montage : lit le compteur de sessions dans AsyncStorage, affiche le hint si
  `sessions < 5`, incrémente le compteur.
- Prop `afficherHintSwipe={afficherHintSwipe && item.statut === 'A_LIVRER'}` passée à `ColisItem`
  dans le `renderItem` de la FlatList.
- Prop `onSwipeEchec` passée conditionnellement (uniquement pour les colis `A_LIVRER`).

Fichier : `src/mobile/src/components/ColisItem.tsx`

- Props `afficherHintSwipe?: boolean` et `onSwipeEchec?: (colisId: string) => void` ajoutées.
- Implémentation PanResponder (swipe gauche, seuil 80px) intégrée dans `ColisItem`,
  suivant le même pattern que `CarteColis` (US-029).
- Hint textuel `← Glisser` rendu conditionnellement quand `afficherHintSwipe` est vrai.
- Deux chemins de rendu : avec zone rouge (si `onSwipeEchec`) ou TouchableOpacity simple.

Fichier : `src/mobile/src/components/design-system/CarteColis.tsx`

- Prop `afficherHintSwipe?: boolean` ajoutée (default `false`), remplace la valeur `true` codée en dur.

**Résultats tests** : 18/18 tests mobiles concernés verts (ListeColisScreen + useNetworkStatus).

---

## Note — Tests web supervision (pre-existing failures)

Les 30 suites de tests Jest du front web supervision (`src/web/supervision`) échouent
avec une erreur Babel/TypeScript (`Unexpected token :` sur les types TS). Ce problème
est **pre-existant** à cette session (confirmé via `git stash` + run à vide :
30/30 failures avant nos modifications). Il s'agit d'un problème de configuration
`babel.config.js` / `jest.config.js` sans `ts-jest`. Aucune régression introduite.

---

## Résumé des fichiers modifiés

### Backend
- `svc-tournee/interfaces/rest/TourneeController.java` — injection SupervisionNotifier + livreurId réel
- `svc-tournee/interfaces/TourneeControllerTest.java` + 5 autres suites — @MockBean SupervisionNotifier

### Mobile
- `src/mobile/src/screens/ListeColisScreen.tsx` — useNetworkStatus + bandeau hors-ligne + hint swipe
- `src/mobile/src/components/ColisItem.tsx` — PanResponder swipe + hint swipe
- `src/mobile/src/components/design-system/CarteColis.tsx` — prop afficherHintSwipe

### Web
- `src/web/supervision/src/pages/PanneauInstructionPage.tsx` — bouton desactive apres succes + toast
- `src/web/supervision/src/pages/TableauDeBordPage.tsx` — bouton Reconnecter + compteur déconnexion
- `src/web/supervision/src/__tests__/PanneauInstructionPage.test.tsx` — 2 tests Bloquant-4
- `src/web/supervision/src/__tests__/TableauDeBordPage.test.tsx` — 2 tests Bloquant-5
