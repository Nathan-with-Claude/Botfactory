# Corrections bloquants — Feedback terrain 2026-03-30

## Contexte

Suite aux feedbacks terrain du 2026-03-30 produits par l'agent @end-user (personas
Laurent Renaud — superviseur et Pierre Morel — livreur), 5 bloquants ont été identifiés
et corrigés dans cette session.

**Fichiers source des feedbacks** :
- `/livrables/09-feedback/feedback-superviseur-2026-03-30.md`
- `/livrables/09-feedback/feedback-livreur-2026-03-30.md`

---

## Bloquant 1 — WebSocket reconnexion automatique (web supervision)

**Symptôme** : Quand la connexion WS tombe, les données se gèlent silencieusement.
Le bandeau d'erreur n'offrait pas de moyen d'agir.

**Fichier modifié** : `src/web/supervision/src/pages/TableauDeBordPage.tsx`

**Décisions d'implémentation** :
- Hook `useTableauDeBord` : ajout d'une logique de reconnexion automatique avec
  backoff exponentiel (2s, 4s, 8s, 16s, 30s plafonné).
- Compteur de tentatives `tentativesReconnexion` exposé dans l'état du hook.
- Callback `reconnecterManuellement` : annule le timeout courant, ferme le WS
  existant, repart à zéro, recharge les données.
- Le `useEffect` principal utilise `[]` comme dépendances pour éviter les
  reconnexions en boucle — les callbacks capturent les dépendances via `useRef`.
- Correction couleur bandeau déconnexion : orange (#b45309) au lieu de rouge
  (#ba1a1a) pour distinguer alerte système et alerte métier (tournée à risque).

**Tests ajoutés** (`TableauDeBordPage.test.tsx`) :
- `Bloquant-1: affiche le bouton "Reconnecter" dans le bandeau déconnexion`
- `Bloquant-1: le bouton Reconnecter déclenche une reconnexion`
- `Bloquant-1: le bandeau déconnexion utilise la couleur orange`

---

## Bloquant 2 — Confirmation après envoi d'instruction (web supervision)

**Symptôme** : Après clic sur ENVOYER, rien ne confirmait visuellement le succès ;
le bouton restait actif, permettant les doublons.

**Fichier modifié** : `src/web/supervision/src/pages/PanneauInstructionPage.tsx`

**Décisions d'implémentation** :
- `peutEnvoyer` étendu : désactivé si `envoi === 'succes'` (en plus de `'loading'`).
  Empêche tout double-envoi après un succès.
- Toast succès enrichi : mention explicite du nom du livreur + "Le livreur a été
  notifié." + icône ✓ + rôle `status` + `aria-live="polite"` pour l'accessibilité.
- Le toast existait déjà mais était insuffisant (trop discret, bouton réactivé).

**Tests ajoutés** (`PanneauInstructionPage.test.tsx`) :
- `Bloquant-2: désactive le bouton ENVOYER après un envoi réussi`
- `Bloquant-2: le toast succès affiche "Le livreur a été notifié"`

---

## Bloquant 3 — Titre d'onglet navigateur absent (web supervision)

**Symptôme** : `<title>` générique "DocuPost Supervision" identique sur toutes
les pages — impossible de distinguer les onglets en salle de supervision.

**Fichiers modifiés** :
- `src/web/supervision/src/App.tsx` : ajout d'un `useEffect` qui met à jour
  `document.title` à chaque changement de route.

**Décisions d'implémentation** :
- Table `TITRES_PAR_PAGE` : mapping route → titre de la forme "DocuPost — [Page]".
- Mise à jour synchrone via `document.title` dans un `useEffect([route.page])`.
- Pas de dépendance externe (react-helmet non nécessaire ici).
- Le titre dans `index.html` reste "DocuPost Supervision" (valeur par défaut
  avant le premier rendu React).

**Titres définis** :
  - `tableau-de-bord`          → "DocuPost — Supervision"
  - `detail-tournee`           → "DocuPost — Détail tournée"
  - `instruction`              → "DocuPost — Envoyer une instruction"
  - `planification`            → "DocuPost — Plan du jour"
  - `detail-tournee-planifiee` → "DocuPost — Détail tournée planifiée"
  - `preuves`                  → "DocuPost — Preuves de livraison"
  - `connexion`                → "DocuPost — Connexion"
  - `auth-callback`            → "DocuPost — Connexion en cours…"

---

## Bloquant 4 — IndicateurSync hardcodé à "live" (mobile livreur)

**Symptôme** : `<IndicateurSync syncStatus="live" />` dans le header et le
`BandeauProgression` — l'indicateur ne reflétait jamais l'état réseau réel.
En zone blanche, le livreur voyait "LIVE" alors qu'il était hors connexion.

**Nouveaux fichiers** :
- `src/mobile/src/hooks/useNetworkStatus.ts` : hook `useNetworkStatus` qui écoute
  NetInfo via injection de dépendance (`netInfoSubscribeFn` prop). Dégradé gracieux
  si NetInfo non disponible (reste à 'live').
- `src/mobile/src/__tests__/useNetworkStatus.test.ts` : 5 tests unitaires.

**Fichier modifié** :
- `src/mobile/src/screens/ListeColisScreen.tsx` : import `useNetworkStatus`,
  appel du hook en tête de composant, `syncStatus` dynamique passé à
  `IndicateurSync` et `BandeauProgression`.

**Décisions d'implémentation** :
- Import dynamique de NetInfo (`require()`) pour éviter un crash si le module
  natif n'est pas lié (env CI, tests sans mock).
- `isConnected === null` traité comme `true` (fail-safe — vaut mieux afficher
  LIVE que bloquer l'interface sur incertitude réseau).

**Tests ajoutés** (`ListeColisScreen.test.tsx`) :
- `Bloquant-4: IndicateurSync affiche OFFLINE quand le réseau est indisponible`
- `Bloquant-4: IndicateurSync affiche LIVE quand le réseau est disponible`

---

## Bloquant 5 — Bouton "Scanner un colis" sans action (mobile livreur)

**Symptôme** : Un bouton visible (`testID="bouton-scanner-colis"`) déclenchait
un `// TODO` — comportement de no-op trompeur pour l'utilisateur.

**Fichier modifié** : `src/mobile/src/screens/ListeColisScreen.tsx`

**Décision** : Le bouton est masqué (retiré du JSX) jusqu'à implémentation
complète de l'action scanner (US-future). Un commentaire explique la raison
et indique la dépendance (`react-native-camera`).

**Test ajouté** (`ListeColisScreen.test.tsx`) :
- `Bloquant-5: le bouton "Scanner un colis" n'est pas rendu (non implémenté)`

---

## Dette technique signalée (non implémentée — dépendance US-010)

**Pad de signature non opposable** (feedback livreur) : la zone de signature MVP
(simple appui `TouchableOpacity`) ne constitue pas une preuve opposable
juridiquement. Cette dette est documentée dans :
`/livrables/06-dev/vertical-slices/US-008-impl.md` — section "Décisions
architecturales notables".

**Action requise** : @po doit créer ou prioriser une US dédiée à l'intégration
de `react-native-signature-canvas` avant toute mise en production terrain.

---

## Bilan tests

| Suite | Avant | Après | Delta |
|-------|-------|-------|-------|
| Jest mobile | 260 | 268 | +8 (bloquants 4+5 + hook) |
| Jest web | 194 | 199 | +5 (bloquants 1+2) |
| svc-supervision backend | 130 | 130 | 0 |
| svc-tournee backend | 112 | 112 | 0 |
