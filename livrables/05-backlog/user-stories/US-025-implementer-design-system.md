# US-025 : Implémenter le Design System DocuPost + Layout global web

**Epic** : EPIC-008 : Expérience Utilisateur et Cohérence Visuelle
**Feature** : F-022 : Design System et Tokens d'interface
**Bounded Context** : Transverse (frontend uniquement — aucun Bounded Context métier)
**Aggregate(s) touchés** : aucun (couche présentation uniquement)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : L

> Mis à jour le 2026-03-26 pour intégrer la vision designer UI web (wireframes v3.0) :
> layout global TopAppBar fixe + SideNavBar fixe, tokens Material Design 3 web.

---

## User Story

En tant que developpeur,
je veux disposer d'un ensemble de tokens, composants React/React Native et d'un layout global
web (TopAppBar fixe + SideNavBar fixe) issus du design-system.md et des wireframes v3.0,
afin que toutes les interfaces DocuPost (web supervision et application mobile livreur) soient
visuellement cohérentes, accessibles et maintenables.

---

## Contexte

Cette US est le socle technique du redesign v2.0. Elle ne touche aucun Bounded Context métier
mais conditionne l'implémentation de toutes les US de refactorisation UI (US-026, US-027).

Elle doit être livrée et validée avant que les US de refactorisation commencent.

Le design system est défini dans `/livrables/02-ux/design-system.md` (v1.0, 2026-03-25).
Les wireframes v3.0 (2026-03-26) précisent le layout global web adopté depuis la vision
du designer UI : TopAppBar fixe h-16 + SideNavBar fixe w-64 + Main ml-64 mt-16 p-8,
avec les tokens Material Design 3 (palette primaire : `primary` #0037b0).

### Layout global web — composants à créer

**TopAppBar** (`src/web/supervision/src/components/layout/TopAppBar.tsx`)
- Fixe top-0, full-width, h-16 (64px), z-50.
- Fond : bg-slate-50/80 + backdrop-blur-xl + shadow-sm + border-b border-slate-200/50.
- Contenu gauche : logo "DocuPost" (text-xl font-bold text-blue-800 font-headline)
  + nav principale (onglets "Plan du jour" / "Historique").
- Contenu droit : IndicateurSync (badge LIVE/POLLING/OFFLINE) + bouton sync (Material
  Symbols `sync`) + bouton notifications (`notifications`) + profil (avatar + nom).
- Onglet actif : text-blue-700 font-bold border-b-2 border-blue-700 h-16.
- Onglet inactif : text-slate-500 font-medium hover:bg-slate-100.

**SideNavBar** (`src/web/supervision/src/components/layout/SideNavBar.tsx`)
- Fixe left-0 top-16, h-[calc(100vh-4rem)], w-64, flex flex-col p-4 gap-2.
- Fond : bg-slate-100 + border-r border-slate-200/30.
- Item actif : bg-white text-blue-700 font-semibold shadow-sm rounded-lg.
- Item inactif : text-slate-600 hover:text-blue-600 hover:bg-slate-200/50 rounded-lg.
- Icône Material Symbols Outlined à gauche de chaque item.
- Bas : liens Aide et Déconnexion séparés via mt-auto.
- Routes : Préparation (/preparation), Supervision (/supervision), Aide, Déconnexion.

**IndicateurSync web** (extension du composant existant)
- LIVE : point animate-ping bg-primary + label "LIVE" text-primary, fond
  bg-surface-container-high border border-outline-variant/15 rounded-full.
- POLLING : point orange statique + label "POLLING".
- OFFLINE : point rouge + label "OFFLINE".
- Horodatage "Dernière mise à jour : il y a Xs" affiché en inline (écran Supervision).

**Invariants à respecter** :
- Aucun composant ne doit hardcoder une valeur de couleur, typographie ou espacement :
  seuls les tokens semantiques sont autorisés.
- Les tokens CSS doivent etre declares sur `:root` (web) et exportés depuis `colors.ts`
  et `shadows.ts` (mobile).
- Tout composant interactif mobile doit respecter un touch target minimum de 48x48px
  (WCAG, mentionne dans design-system.md §10).
- Le ratio de contraste texte/fond doit etre >= 4.5:1 (WCAG AA).
- Le Main content doit toujours avoir ml-64 mt-16 p-8 pour ne pas être masqué par
  la TopAppBar ou la SideNavBar.
- Les tokens MD3 web (`primary` #0037b0, `background` #f7f9fb, etc.) sont définis dans
  `tokens.css` et référencés via Tailwind config (extend.colors).

---

## Livraisons attendues

### Tokens

- **Web** : `src/web/supervision/src/styles/tokens.css`
  — toutes les custom properties CSS definies dans design-system.md §1, §4, §5, §7, §9.
- **Mobile** : `src/mobile/src/theme/colors.ts` + `src/mobile/src/theme/shadows.ts`
  — tous les tokens Typescript definis dans design-system.md §1 et §5.

### Composants a creer

| Composant | Interface | Ecran(s) reference | Source design-system.md |
|-----------|-----------|-------------------|-------------------------|
| `BadgeStatut` | Web + Mobile | Tous | §3.1 |
| `CarteColis` | Mobile | M-02 | §3.2 |
| `BandeauProgression` | Web + Mobile | M-02, W-01, W-02 | §3.3 |
| `BoutonCTA` | Web + Mobile | Tous | §3.4 |
| `ChipContrainte` | Mobile | M-02, M-03 | §3.5 |
| `IndicateurSync` | Web + Mobile | M-02, W-01, W-02 | §3.6 |
| `BandeauInstruction` | Mobile | M-06 | §3.7 |
| `CardTypePreuve` | Mobile | M-04 | §6 (selecteurs) |
| `CardTypeInstruction` | Web | W-03 | §6 (selecteurs) |
| `DrawerDetail` | Web | W-02 | §3 (drawer 480px) |

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Tokens CSS disponibles sur le web

```gherkin
Given les fichiers sources web dans src/web/supervision/src/styles/
When le developpeur importe tokens.css dans l'application
Then toutes les custom properties CSS du design-system.md §1 sont accessibles
  (ex : --color-primaire, --color-alerte, --color-succes, --color-fond-alerte)
And aucune valeur hexadecimale n'est hardcodee dans les composants React web
```

### Scenario 2 — Tokens TypeScript disponibles sur mobile

```gherkin
Given les fichiers src/mobile/src/theme/colors.ts et shadows.ts
When le developpeur importe Colors ou Shadows dans un composant React Native
Then tous les tokens definis dans design-system.md §1 et §5 sont disponibles et types
And aucune valeur hexadecimale n'est hardcodee dans les composants React Native
```

### Scenario 3 — BadgeStatut rendu correctement

```gherkin
Given un BadgeStatut avec variant="alerte" et label="ECHEC"
When le composant est rendu
Then le fond est --color-alerte-leger
And le texte est --color-alerte
And le rayon de bordure est --radius-sm (4px)
And le point colore est present (icon=true par defaut)
```

### Scenario 4 — BoutonCTA desactive inaccessible

```gherkin
Given un BoutonCTA avec disabled=true
When l'utilisateur tente de cliquer ou tapper dessus
Then aucun evenement onPress n'est declenche
And l'opacite du composant est 0.4
And l'attribut aria-disabled est present (web)
```

### Scenario 5 — CarteColis touch target conforme

```gherkin
Given une CarteColis rendue sur mobile
When on mesure la zone interactive
Then la hauteur minimum est 72px
And le padding interne est 12px 16px
And le rayon de bordure est 12px
```

### Scenario 6 — IndicateurSync etat OFFLINE

```gherkin
Given un IndicateurSync avec syncStatus="offline"
When le composant est rendu
Then le point est de couleur --color-alerte (rouge)
And le label affiche "OFFLINE"
And aucune animation pulse n'est presente
```

### Scenario 7 — DrawerDetail ouverture et fermeture (web)

```gherkin
Given la vue W-02 avec un incident visible dans la liste
When le superviseur clique sur un incident
Then le DrawerDetail s'ouvre a droite en 480px de large
And le contenu affiche le motif, l'horodatage et la note terrain
When le superviseur clique sur le bouton [X] ou en dehors du drawer
Then le DrawerDetail se ferme sans navigation
```

### Scenario 8 — TopAppBar rendue correctement (web)

```gherkin
Given l'application web superviseur chargee dans le navigateur
When n'importe quelle route /preparation ou /supervision est affichee
Then la TopAppBar est fixe en haut (position fixed top-0 z-50) avec h-16
And le logo "DocuPost" est visible en text-blue-800 font-headline
And l'IndicateurSync (badge LIVE) est visible a droite
And le profil utilisateur (avatar + nom) est visible a l'extreme droite
And le Main content est decale de ml-64 mt-16 pour ne pas etre masque
```

### Scenario 9 — SideNavBar active selon la route (web)

```gherkin
Given l'application web superviseur sur la route /preparation
When la SideNavBar est rendue
Then l'item "Preparation" a le style actif (bg-white text-blue-700 font-semibold shadow-sm)
And l'item "Supervision" a le style inactif (text-slate-600)
When l'utilisateur navigue vers /supervision
Then l'item "Supervision" prend le style actif
And l'item "Preparation" prend le style inactif
```

### Scenario 10 — IndicateurSync transite entre etats LIVE / POLLING / OFFLINE (web)

```gherkin
Given le composant IndicateurSync sur un ecran web
When la connexion WebSocket est active
Then le point affiche animate-ping bg-primary et le label "LIVE" en text-primary
When la connexion WebSocket est perdue et le polling est actif
Then le point est orange statique et le label affiche "POLLING"
When le polling echoue egalement
Then le point est rouge et le label affiche "OFFLINE"
```

---

## Liens

- Design System : /livrables/02-ux/design-system.md
- Evolution Design : /livrables/02-ux/evolution-design.md §3 (composants a creer)
- Wireframes : /livrables/02-ux/wireframes.md (v3.0 — structure navigation globale)
- Design web designer : /livrables/02-ux/design_web_designer.md
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
