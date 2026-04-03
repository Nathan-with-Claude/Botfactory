# Implémentation US-037 : Historique des consignes livreur

## Contexte

La US-037 répond au feedback terrain de Pierre Morel (2026-03-30) : le bandeau M-06 (US-016)
disparaît après 10 secondes, ce qui peut conduire à des consignes superviseur manquées.
L'objectif est de persister les consignes localement dès leur réception et d'offrir un écran
d'historique (M-07) accessible depuis la liste des colis.

Liens :
- US spec : `/livrables/05-backlog/user-stories/US-037-historique-consignes-livreur.md`
- US-015 impl : `/livrables/06-dev/vertical-slices/US-015-impl.md`
- US-016 impl : `/livrables/06-dev/vertical-slices/US-016-impl.md`

---

## Bounded Context et couche ciblée

- **BC** : BC-04 — Notification et Messaging (Supporting Domain) — côté mobile uniquement
- **Aggregate(s) modifiés** : aucun côté backend — Read Model local (AsyncStorage)
- **Domain Events émis** : aucun dans ce vertical slice (InstructionPriseEnCompte déféré — voir delta)

---

## Périmètre implémenté vs spécification US

| Scénario US | Statut | Notes |
|-------------|--------|-------|
| SC1 — Persistance à la réception | Implémenté | Via `onConsignePersistee` dans BandeauInstructionOverlay |
| SC2 — Accès depuis M-02 + liste M-07 | Implémenté | Bouton "Consignes" dans le bandeau de progression |
| SC3 — "Prise en compte" à l'ouverture | Implémenté | `prendreEnCompteNouvelles()` + PATCH backend |
| SC4 — "Exécutée" via bouton dans M-07 | Implémenté | PATCH `/api/supervision/instructions/{id}/executer` (endpoint US-015 existant) |
| SC5 — Navigation M-07 → M-03 | Implémenté | Bouton "Voir le colis" (prop `onVoirColis`) |
| SC5b — Consigne sans colis non interactive | Implémenté | Bouton absent si `colisId` vide ; affiche "Non associé à un colis" |
| SC5c — Badges de statut colorés | Implémenté | NOUVELLE=bleu, PRISE EN COMPTE=gris, EXECUTÉE=vert |
| SC5d — Liste vide | Implémenté (v1.3) | Message conforme au wireframe M-07 v1.3 |
| SC5e — Mode offline avec bandeau orange | Implémenté (v1.3) | Prop `estHorsConnexion` + bandeau `bandeau-offline-consignes` + message dédié |
| SC6 — Badge sur bouton | Implémenté | Badge rouge avec compteur des consignes non lues |
| SC7 — Réinitialisation à minuit | Implémenté implicitement | Clé AsyncStorage `consignes_jour_YYYY-MM-DD` : changement de jour = nouvelle clé vide |
| Texte libre consigne | Implémenté (v1.3) | Champ `texteConsigne` optionnel dans `InstructionMobileDTO` + affiché dans la ligne |

### Delta Sprint 5 — RÉSOLU (2026-03-30)
- **InstructionPriseEnCompte** : PATCH backend implémenté et câblé (voir section "Points déférés résolus").
- **Navigation M-07→M-03** : bouton "Voir le colis" implémenté (voir section "Points déférés résolus").

### Delta v1.3 (wireframe M-07 v1.3 — 2026-04-02)
- **Texte libre** : champ `texteConsigne` ajouté à `InstructionMobileDTO` + affiché dans `LigneConsigne`.
- **"Non associé à un colis"** : affiché lorsque `colisId` est vide (testID `non-associe-colis-{id}`).
- **Bandeau offline** : prop `estHorsConnexion` dans `MesConsignesScreen` + bandeau orange + message dédié.
- **Message liste vide** : corrigé pour correspondre exactement au wireframe M-07 v1.3.
- **`estHorsConnexion`** : transmis depuis `ListeColisScreen` via `syncStatus === 'offline'`.

---

## Décisions d'implémentation

### Domain Layer
Aucune modification au domaine BC-03 (svc-supervision).
Le mobile maintient un Read Model local (`ConsigneLocale`) qui étend `InstructionMobileDTO` avec le champ `lue: boolean`.

**Ajout v1.3** : champ `texteConsigne?: string` dans `InstructionMobileDTO` (optionnel, rétrocompatible).
Ce champ contient le texte libre rédigé par le superviseur (ex. "Prioriser le colis COLIS-042 — client urgent").

### Application Layer (mobile — hook)
- **Nouveau fichier** : `src/mobile/src/hooks/useConsignesLocales.ts`
  - Gère le cycle de vie complet : chargement AsyncStorage, ajout idempotent, tri décroissant, badge, marquerToutesLues, marquerExecutee.
  - `marquerExecuteeFn` injectable via paramètre pour les tests (pattern DI existant dans le projet).
  - Clé AsyncStorage : `consignes_jour_YYYY-MM-DD` — isolation par jour sans migration.

### Infrastructure Layer (mobile)
- **AsyncStorage** : déjà provisionné dans le projet (mock via `moduleNameMapper`).
- Pas de nouvelle dépendance npm.

### Interface Layer (mobile)
- **Nouveau fichier** : `src/mobile/src/screens/MesConsignesScreen.tsx` (réécriture de l'ébauche L9)
  - Composant stateless — toute logique de persistance déléguée au hook.
  - Props : `consignes`, `onRetour`, `onMarquerExecutee`, `syncEnCours`.
  - `onConsignePersistee` optionnelle dans `BandeauInstructionOverlay` pour rétrocompatibilité.
- **Fichier modifié** : `src/mobile/src/components/BandeauInstructionOverlay.tsx`
  - Ajout prop optionnelle `onConsignePersistee?: (instruction) => Promise<void>`.
  - Appelée au montage du composant (dans `useEffect`) — persistance silencieuse.
- **Fichier modifié** : `src/mobile/src/screens/ListeColisScreen.tsx`
  - Import `useConsignesLocales` + `MesConsignesScreen`.
  - Ajout état de navigation `{ ecran: 'mesConsignes' }`.
  - Bouton "Consignes" dans le bandeau de progression avec badge rouge.
  - Transmission de `onConsignePersistee={ajouterConsigne}` au `BandeauInstructionOverlay`.

### Frontend — pattern visuel

- Consigne non lue : fond `avertissementLeger` + bordure gauche `avertissement` (orange).
- Consigne lue / EXECUTEE : fond `surfacePrimary` + bordure gauche `primaire` (bleu).
- Badge statut : fond coloré avec opacité 20% + texte coloré en majuscule.
- Bouton "Marquer exécutée" : présent uniquement pour `statut === 'ENVOYEE'`, désactivé si `syncEnCours`.

### Erreurs / invariants préservés
- **Idempotence** : `ajouterConsigne()` ne duplique jamais une consigne avec le même `instructionId`.
- **Tri** : tri décroissant par `horodatage` garanti à chaque mutation.
- **Persistance silencieuse** : les erreurs AsyncStorage ne bloquent jamais le livreur.
- **Sync silencieuse** : le PATCH backend en cas d'erreur laisse la consigne au statut `ENVOYEE` (l'état local est cohérent, pas de corruption).
- **Rétrocompatibilité US-016** : `onConsignePersistee` est optionnelle — les tests existants du `BandeauInstructionOverlay` passent sans modification.

---

## Tests

### Nouveaux fichiers de test

| Fichier | Tests | Couverture |
|---------|-------|-----------|
| `src/mobile/src/__tests__/useConsignesLocales.test.ts` | 11 tests | SC1-SC8 du hook : chargement, ajout, idempotence, tri, marquerToutesLues, marquerExecutee, syncEnCours, badge, clePourAujourdhui |
| `src/mobile/src/__tests__/MesConsignesScreen.test.tsx` | 12 tests | SC1-SC10 : état vide, affichage, badges statut, bouton Exécutée (visible/masqué), appel callback, bouton Retour, compteur, disabled pendant sync |

### Suites impactées (non-régression vérifiée)

| Fichier | Tests | Résultat |
|---------|-------|---------|
| `BandeauInstructionOverlay.test.tsx` | 5 tests | Verts — prop `onConsignePersistee` optionnelle, aucun test modifié |
| `ListeColisScreen.test.tsx` | 13 tests | Verts — les mocks existants (`jest.mock('../api/tourneeApi')`) couvrent le hook via mock supervisionApi |

### Résultat suite complète
- **303/303 tests verts** au moment de la session initiale (mode `--runInBand`)
- **310/310 tests verts** après delta Sprint 5 (7 nouveaux tests)
- **352/352 tests verts** après delta v1.3 (10 nouveaux tests : SC-TX1, SC-TX2, SC-OFF1, SC-OFF2, SC-OFF3, SC1-MSG + 4 ajustements fixtures)
- Flaky timeout observé en mode parallèle sur `FiltreZone.test.tsx` : problème préexistant (contention setInterval), non introduit par cette US.

---

---

## Points déférés résolus (2026-03-30)

### Point 1 — PATCH InstructionPriseEnCompte

**Backend** : l'endpoint `PATCH /api/supervision/instructions/{id}/prendre-en-compte` était déjà
implémenté dans une session précédente (`InstructionController`, `PrendreEnCompteInstructionHandler`,
`PrendreEnCompteInstructionCommand`). Les tests `@WebMvcTest` correspondants sont dans
`InstructionControllerTest.java` (2 cas : 200 avec statut PRISE_EN_COMPTE, 404 si inconnu).

**Mobile — supervisionApi.ts** :
- Ajout de la fonction `prendreEnCompteInstruction(instructionId)` — `PATCH .../prendre-en-compte`.
- Même pattern que `marquerInstructionExecutee` : 409 ignoré (idempotent), autres erreurs propagées.

**Mobile — useConsignesLocales.ts** :
- Nouveau paramètre injectable `prendreEnCompteFn` (2ème paramètre, default = `prendreEnCompteInstruction`).
- Nouvelle fonction `prendreEnCompteNouvelles()` :
  - Filtre les consignes au statut `ENVOYEE`.
  - Appelle `PATCH prendre-en-compte` pour chacune via `Promise.allSettled`.
  - Si succès : statut local passe à `PRISE_EN_COMPTE` + persistance AsyncStorage.
  - Si échec (offline) : silencieux, statut reste `ENVOYEE`, réessai à la prochaine ouverture.
- Exposée dans `UseConsignesLocalesResult`.

**Mobile — ListeColisScreen.tsx** :
- Destructure `prendreEnCompteNouvelles` depuis le hook.
- `useEffect` déclenché quand `navigation.ecran === 'mesConsignes'` : appelle `prendreEnCompteNouvelles()` silencieusement.

**Invariants** :
- Offline : statut local reste `ENVOYEE`, la consigne reste visible dans le badge — réessai automatique à la prochaine ouverture de MesConsignesScreen.
- Idempotence backend : 409 ignoré si l'instruction est déjà `PRISE_EN_COMPTE`.

### Point 2 — Navigation M-07 → M-03

**Mobile — MesConsignesScreen.tsx** :
- Nouvelle prop optionnelle `onVoirColis?: (colisId: string) => void`.
- Nouveau bouton `btn-voir-colis-{instructionId}` visible uniquement si `onVoirColis` fourni **et** `colisId` non vide.
- Style : bouton outline (bordure primaire, fond blanc) pour le différencier du bouton "Marquer exécutée" (fond primaire).
- Container `boutonsBas` en `flexDirection: 'row'` pour aligner les deux boutons.

**Mobile — ListeColisScreen.tsx** :
- Passage de `onVoirColis` à `MesConsignesScreen` : navigue vers `{ ecran: 'detail', tourneeId, colisId }` si `etat.type === 'succes'`.

**Comportement attendu** :
- Depuis M-07, le livreur appuie sur "Voir le colis" d'une consigne avec colis.
- Navigation vers M-03 (DetailColisScreen) avec le `colisId` et `tourneeId` courant.
- Retour depuis M-03 revient à la liste M-02 (comportement standard de `onRetour`).

### Nouveaux tests (delta Sprint 5)

| Fichier | Tests ajoutés | Description |
|---------|---------------|-------------|
| `useConsignesLocales.test.ts` | SC9, SC10, SC11 | PATCH appelé pour chaque ENVOYEE ; offline silencieux ; statut local PRISE_EN_COMPTE après succès |
| `MesConsignesScreen.test.tsx` | SC11, SC12, SC13, SC14 | Bouton "Voir le colis" visible/absent selon colisId et prop ; appel callback avec colisId ; absent si prop non fournie |

**Suite complète après delta** : **310/310 tests verts** (7 nouveaux tests mobiles).

---

## Fichiers créés / modifiés

### Créés
- `src/mobile/src/hooks/useConsignesLocales.ts`
- `src/mobile/src/__tests__/useConsignesLocales.test.ts`
- `src/mobile/src/__tests__/MesConsignesScreen.test.tsx`
- `livrables/06-dev/vertical-slices/US-037-impl.md` (ce fichier)

### Modifiés
- `src/mobile/src/screens/MesConsignesScreen.tsx` (réécriture : ajout stateless props, bouton Exécutée ; delta Sprint 5 : prop onVoirColis + bouton "Voir le colis" ; delta v1.3 : texteConsigne, "Non associé à un colis", bandeau offline, message liste vide conforme)
- `src/mobile/src/components/BandeauInstructionOverlay.tsx` (ajout prop optionnelle `onConsignePersistee`)
- `src/mobile/src/screens/ListeColisScreen.tsx` (navigation mesConsignes, bouton badge, hook ; delta Sprint 5 : prendreEnCompteNouvelles useEffect + onVoirColis ; delta v1.3 : prop estHorsConnexion transmise)
- `src/mobile/src/hooks/useConsignesLocales.ts` (delta Sprint 5 : prendreEnCompteNouvelles + prendreEnCompteFn injectable)
- `src/mobile/src/api/supervisionApi.ts` (delta Sprint 5 : prendreEnCompteInstruction ; delta v1.3 : champ texteConsigne optionnel dans InstructionMobileDTO)
- `src/mobile/src/__tests__/useConsignesLocales.test.ts` (delta Sprint 5 : SC9, SC10, SC11)
- `src/mobile/src/__tests__/MesConsignesScreen.test.tsx` (delta Sprint 5 : SC11-SC14 ; delta v1.3 : SC-TX1, SC-TX2, SC-OFF1, SC-OFF2, SC-OFF3, SC1-MSG)
