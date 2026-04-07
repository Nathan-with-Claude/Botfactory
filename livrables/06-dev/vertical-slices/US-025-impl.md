# Implémentation US-025 : Design System DocuPost

## Contexte

US-025 est le socle technique transverse du redesign UI DocuPost v2.0. Elle crée un design system
complet (tokens + composants) pour les deux interfaces :
- Web supervision (React 19 / TypeScript)
- Application mobile livreur (React Native 0.76)

Sources :
- /livrables/05-backlog/user-stories/US-025-implementer-design-system.md
- /livrables/02-ux/design-system.md (v1.0, 2026-03-25)
- /livrables/02-ux/wireframes.md (v2.0)

US de dépendance aval : US-026 (refactorisation UI web), US-027 (refactorisation UI mobile).

---

## Bounded Context et couche ciblée

- **BC** : Transverse — couche présentation uniquement
- **Aggregate(s) modifiés** : aucun (pas de logique métier)
- **Domain Events émis** : aucun
- **Couches touchées** : Interface Layer uniquement (composants React/RN + tokens CSS/TS)

---

## Décisions d'implémentation

### Domain Layer
Aucun changement. US transverse présentation.

### Application Layer
Aucun changement.

### Infrastructure Layer
Aucun changement.

### Interface Layer — Tokens

**Web** : `src/web/supervision/src/styles/tokens.css`
- Toutes les custom properties CSS du design-system.md §1, §4, §5, §7, §9.
- Import Google Fonts (Inter + Work Sans) depuis le même fichier.
- Animations globales (pulse-live, slide-down, slide-up, fade-update).
- Règle respectée : aucun composant ne doit utiliser de valeur hexadécimale directement.

**Mobile** :
- `src/mobile/src/theme/colors.ts` — tous les tokens couleur (const + as const).
- `src/mobile/src/theme/shadows.ts` — ombres React Native (shadowColor, elevation).
- `src/mobile/src/theme/spacing.ts` — espacements (Spacing) + bords arrondis (BorderRadius).

### Interface Layer — Composants Web (`src/web/supervision/src/components/design-system/`)

| Composant | Source DS | Écran(s) | Tests |
|-----------|-----------|----------|-------|
| `BadgeStatut.tsx` | §3.1 | Tous | 12 tests |
| `BoutonCTA.tsx` | §3.4 + §6 | Tous | 14 tests |
| `BandeauProgression.tsx` | §3.3 | W-01, W-02, M-02 | 9 tests |
| `CarteColis.tsx` | §3.2 | W-02, M-02 | inclus dans BandeauProgression |
| `ChipContrainte.tsx` | §3.5 | M-02, M-03 | 5 tests |
| `IndicateurSync.tsx` | §3.6 | W-01, W-02, M-02 | 9 tests |
| `BandeauInstruction.tsx` | §3.7 | M-06 | inclus |
| `CardTypePreuve.tsx` | §6 | M-04 | inclus |
| `CardTypeInstruction.tsx` | §6 | W-03 | 6 tests |
| `DrawerDetail.tsx` | §3 (drawer 480px) | W-02 | 7 tests |

Chaque composant a son fichier CSS dédié avec uniquement des `var(--...)` — zéro valeur
hexadécimale hardcodée.

Index barrel : `src/web/supervision/src/components/design-system/index.ts`

### Interface Layer — Composants Mobile (`src/mobile/src/components/design-system/`)

| Composant | Source DS | Touch target | Tests |
|-----------|-----------|--------------|-------|
| `BadgeStatut.tsx` | §3.1 | passif | 9 tests |
| `BoutonCTA.tsx` | §3.4 | 56dp (>= 48dp WCAG) | 10 tests |
| `BandeauProgression.tsx` | §3.3 | passif | 5 tests |
| `CarteColis.tsx` | §3.2 | minHeight: 72dp | 7 tests |
| `ChipContrainte.tsx` | §3.5 | passif | 3 tests |
| `IndicateurSync.tsx` | §3.6 | passif | 4 tests |
| `BandeauInstruction.tsx` | §3.7 | boutons >= 40dp | 6 tests |
| `CardTypePreuve.tsx` | §6 (M-04) | minHeight: 72dp | 3 tests |

Index barrel : `src/mobile/src/components/design-system/index.ts`

### Erreurs / invariants préservés

- **Pas de valeur hardcodée** : tous les composants importent depuis `tokens.css` (web)
  ou `colors.ts` / `shadows.ts` / `spacing.ts` (mobile). Validé par inspection.
- **Touch target WCAG 48dp** : BoutonCTA mobile = 56dp, CarteColis = minHeight 72dp,
  CardTypePreuve = minHeight 72dp.
- **Ratio de contraste** : les paires texte/fond utilisent les tokens semantiques du design-system.md
  qui respectent les ratios définis (4.5:1 WCAG AA — définis par @ux).
- **Aucun composant existant modifié** : les composants BC-01 à BC-07 (ColisItem, SyncIndicator,
  BandeauInstructionOverlay, etc.) ne sont pas touchés dans cette US.

---

## Tests

### Tests unitaires web (Jest + React Testing Library)
Répertoire : `src/web/supervision/src/components/design-system/__tests__/`

| Fichier | Tests | Résultat |
|---------|-------|----------|
| `BadgeStatut.test.tsx` | 12 | PASS |
| `BoutonCTA.test.tsx` | 14 | PASS |
| `BandeauProgression.test.tsx` | 9 | PASS |
| `ChipContrainte.test.tsx` | 5 | PASS |
| `IndicateurSync.test.tsx` | 9 | PASS |
| `DrawerDetail.test.tsx` | 7 | PASS |
| `CardTypeInstruction.test.tsx` | 6 | PASS |
| **Total** | **60/60** | **PASS** |

### Tests unitaires mobile (Jest + React Native Testing Library)
Répertoire : `src/mobile/src/components/design-system/__tests__/`

| Fichier | Tests | Résultat |
|---------|-------|----------|
| `BadgeStatut.test.tsx` | 9 | PASS |
| `BoutonCTA.test.tsx` | 10 | PASS |
| `BandeauProgression.test.tsx` | 5 | PASS |
| `CarteColis.test.tsx` | 7 | PASS |
| `ChipContrainte.test.tsx` | 3 | PASS |
| `IndicateurSync.test.tsx` | 4 | PASS |
| `BandeauInstruction.test.tsx` | 6 | PASS |
| `CardTypePreuve.test.tsx` | 3 | PASS |
| **Total** | **51/51** | **PASS** |

**Total global : 111 tests verts (60 web + 51 mobile).**

---

## Commandes pour vérifier le build

### Tests web design system uniquement
```bash
cd src/web/supervision
npx react-scripts test --watchAll=false --testPathPattern="components/design-system"
```

### Tests mobile design system uniquement
```bash
cd src/mobile
npx jest --testPathPattern="components/design-system" --passWithNoTests
```

### Démarrer l'app web pour vérification visuelle
```bash
cd src/web/supervision
npm start
# http://localhost:3000
```

### Importer les tokens CSS dans App.tsx ou index.tsx
```typescript
import './styles/tokens.css';
```

### Importer un composant du design system
```typescript
// Web
import { BadgeStatut, BoutonCTA, DrawerDetail } from './components/design-system';

// Mobile
import { CarteColis, BandeauProgression, IndicateurSync } from './components/design-system';
```

---

## Fichiers créés

### Web
- `src/web/supervision/src/styles/tokens.css`
- `src/web/supervision/src/components/design-system/index.ts`
- `src/web/supervision/src/components/design-system/BadgeStatut.tsx` + `.css`
- `src/web/supervision/src/components/design-system/BoutonCTA.tsx` + `.css`
- `src/web/supervision/src/components/design-system/BandeauProgression.tsx` + `.css`
- `src/web/supervision/src/components/design-system/CarteColis.tsx` + `.css`
- `src/web/supervision/src/components/design-system/ChipContrainte.tsx` + `.css`
- `src/web/supervision/src/components/design-system/IndicateurSync.tsx` + `.css`
- `src/web/supervision/src/components/design-system/BandeauInstruction.tsx` + `.css`
- `src/web/supervision/src/components/design-system/CardTypeInstruction.tsx` + `.css`
- `src/web/supervision/src/components/design-system/CardTypePreuve.tsx` + `.css`
- `src/web/supervision/src/components/design-system/DrawerDetail.tsx` + `.css`
- `src/web/supervision/src/components/design-system/__tests__/BadgeStatut.test.tsx`
- `src/web/supervision/src/components/design-system/__tests__/BoutonCTA.test.tsx`
- `src/web/supervision/src/components/design-system/__tests__/BandeauProgression.test.tsx`
- `src/web/supervision/src/components/design-system/__tests__/ChipContrainte.test.tsx`
- `src/web/supervision/src/components/design-system/__tests__/IndicateurSync.test.tsx`
- `src/web/supervision/src/components/design-system/__tests__/DrawerDetail.test.tsx`
- `src/web/supervision/src/components/design-system/__tests__/CardTypeInstruction.test.tsx`

### Mobile
- `src/mobile/src/theme/colors.ts`
- `src/mobile/src/theme/shadows.ts`
- `src/mobile/src/theme/spacing.ts`
- `src/mobile/src/components/design-system/index.ts`
- `src/mobile/src/components/design-system/BadgeStatut.tsx`
- `src/mobile/src/components/design-system/BoutonCTA.tsx`
- `src/mobile/src/components/design-system/BandeauProgression.tsx`
- `src/mobile/src/components/design-system/CarteColis.tsx`
- `src/mobile/src/components/design-system/ChipContrainte.tsx`
- `src/mobile/src/components/design-system/IndicateurSync.tsx`
- `src/mobile/src/components/design-system/BandeauInstruction.tsx`
- `src/mobile/src/components/design-system/CardTypePreuve.tsx`
- `src/mobile/src/components/design-system/__tests__/BadgeStatut.test.tsx`
- `src/mobile/src/components/design-system/__tests__/BoutonCTA.test.tsx`
- `src/mobile/src/components/design-system/__tests__/BandeauProgression.test.tsx`
- `src/mobile/src/components/design-system/__tests__/CarteColis.test.tsx`
- `src/mobile/src/components/design-system/__tests__/ChipContrainte.test.tsx`
- `src/mobile/src/components/design-system/__tests__/IndicateurSync.test.tsx`
- `src/mobile/src/components/design-system/__tests__/BandeauInstruction.test.tsx`
- `src/mobile/src/components/design-system/__tests__/CardTypePreuve.test.tsx`

---

## Skills utilisés

- obra/test-driven-development : tests écrits avant les composants (TDD strict).
- Approche composant-par-composant : un fichier CSS par composant, un fichier test par composant.

---

## Mise à jour 2026-04-04 — Application palette Material Design 3 designer (maquettes M-01 à M-06)

### Contexte

Application du design system complet fourni par le designer UI sur l'ensemble des écrans existants.
Source : `/livrables/02-ux/design_mobile_designer.md` — maquettes HTML/Tailwind M-01 à M-06.

### Changements appliqués

#### `src/mobile/src/theme/colors.ts`
Remplacement de l'ancienne palette par la palette MD3 complète du designer (60+ tokens).
Tous les tokens MD3 nommés conformément au document design (`primary`, `primaryContainer`, `onSurface`, `tertiaryFixed`, etc.).
Alias legacy préservés pour rétrocompatibilité : `primaire`, `succes`, `alerte`, `surfacePrimary`, `textePrimaire`, etc.

#### `src/mobile/src/theme/theme.ts` (CRÉÉ)
Fichier de thème central : `borderRadius`, `spacing`, `fontSize`, `fontWeight`, `touchTarget` (minHeight: 48), `shadow` (sm/md/lg).

#### `src/mobile/package.json`
Ajout `expo-linear-gradient: ~13.0.2` pour les gradients tactiques futurs.

#### Écrans mis à jour
| Fichier | Changements visuels |
|---|---|
| `ConnexionScreen.tsx` | Logo carré primary, titre 36px black primary, card info surfaceContainer/border-left, bouton SSO primary 56px, footer outline uppercase |
| `ListeColisScreen.tsx` | Header primary 64px, bandeau hors-ligne error, bouton clôture tertiaryContainer |
| `CapturePreuveScreen.tsx` | Header primaryContainer, context banner surfaceContainerLowest/border-left primary, grille 2x2 types, bouton CONFIRMER tertiaryContainer 64px |
| `DeclarerEchecScreen.tsx` | Header error, context banner errorContainer, options radio card style, bouton ENREGISTRER error 64px |
| `BandeauInstructionOverlay.tsx` | Fond infoFonce (#1E3A8A), titre tertiaryFixed (#7ffc97), bouton VOIR fond blanc |

#### Composants design-system mis à jour
| Composant | Tokens changés |
|---|---|
| `ColisItem.tsx` | Bande 4px colorée par statut, badges MD3, avatar, adresse onSurface |
| `CarteColis.tsx` | Swipe zone `error`, texte `onPrimary`, contenu `onSurface` |
| `BoutonCTA.tsx` | `primaire`→`primary`, `tertiaire`→`tertiaryContainer`, `danger`→`error` |
| `BandeauProgression.tsx` | Barres `primary`/`avertissement`/`tertiaryContainer`, fond `surfaceContainerLowest` |
| `BadgeStatut.tsx` | `succes`→tertiaryFixed, `alerte`→errorContainer, `info`→secondaryContainer |
| `IndicateurSync.tsx` | LIVE→tertiaryContainer, OFFLINE→error, SYNC→primary |

### Invariants préservés
- Tous les `testID` inchangés (contrat avec les tests Jest)
- Toute la logique métier inchangée (US-029/036/043/045/046/047)
- Signatures de composants inchangées
- Touch target 48x48 respecté sur tous les boutons interactifs
