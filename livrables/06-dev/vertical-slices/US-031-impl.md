# Implémentation US-031 : Intégrer les nouveaux composants visuels issus du retour designer externe

## Contexte

Suite au retour du designer externe (rapport delta `/livrables/02-ux/delta-designer-2026-03-25.md`),
cette US livre les composants visuels DC-01 à DC-07 identifiés dans la revue de design du 2026-03-25.
Ces composants sont des éléments de présentation pure — aucun Bounded Context métier n'est modifié.

**Brief source** : `/livrables/06-dev/brief-dev-retour-designer-2026-03-25.md`
**US source** : `/livrables/05-backlog/user-stories/US-031-nouveaux-composants-designer.md`

---

## Bounded Context et couche ciblée

- **BC** : Transverse — frontend uniquement (aucun Bounded Context métier)
- **Aggregate(s) modifiés** : aucun
- **Domain Events émis** : aucun
- **Couche** : Interface Layer (React Native — composants de présentation)

---

## Décisions d'implémentation

### Palette (Option B confirmée)

Conformément à la décision PO (`brief-dev-retour-designer-2026-03-25.md §1`) :
- `Colors.primaire = #1D4ED8` — inchangé
- `#0037b0` utilisé **uniquement** comme extrémité décorative du gradient `TacticalGradient`
- Aucun composant ne hardcode de valeur hexadécimale — tokens `Colors.*` exclusivement

### Domain Layer

Aucun changement — cette US est 100% présentation.

### Application Layer

Aucun changement.

### Infrastructure Layer

Aucun changement.

### Interface Layer — Composants créés

#### DC-02 — GlassEffectFooter (P0)

- **Fichier** : `src/mobile/src/components/design-system/GlassEffectFooter.tsx`
- **Spec** : fond `rgba(255,255,255,0.85)`, position `absolute bottom`, hauteur min 80px, shadow `-4px 20px`
- **Implémentation** : tentative d'import `expo-blur` (BlurView intensity=20) avec fallback fond blanc semi-transparent si non disponible
- **Decision** : fallback sans crash si `expo-blur` n'est pas installé (compatibilité env CI/test)

#### DC-04 — ContextBannerColis (P0)

- **Fichier** : `src/mobile/src/components/design-system/ContextBannerColis.tsx`
- **Props** : `colisId`, `destinataire`, `variant: "neutre" | "erreur"`
- **Variant neutre** : bordure gauche 4px `Colors.primaire`, fond `Colors.surfaceSecondary` (#F8FAFC)
- **Variant erreur** : bordure gauche 4px `Colors.alerte`, fond `Colors.alerteLeger`
- **Label** : "COLIS EN COURS" uppercase 10px letterSpacing 0.8
- **Icone** : emoji 📦 (décision : pas de dépendance externe sur react-native-vector-icons pour le MVP)

#### DC-01 — TacticalGradient (P1)

- **Fichier** : `src/mobile/src/components/design-system/TacticalGradient.tsx`
- **Implémentation** : `expo-linear-gradient` avec fallback fond plat `Colors.primaire`
- **Colors** : `['#1D4ED8', '#0037b0']`, `start={x:0, y:0}`, `end={x:1, y:1}` (≈ 135deg)
- **Décision** : module optionnel — `try/catch` à l'import pour compatibilité environnements sans expo

#### DC-03 — SignatureGrid (P1)

- **Fichier** : `src/mobile/src/components/design-system/SignatureGrid.tsx`
- **Implémentation** : grille de petits View positionnés absolument (15 cols × 20 rows)
- **Décision** : pas de SVG natif ni de react-native-svg pour éviter une dépendance lourde — approximation visuelle suffisante pour le MVP
- **Points** : 4px de diamètre, `rgba(0,0,0,0.08)`, espacés 20px

#### DC-07 — MiniProgressBar (P1)

- **Fichier** : `src/mobile/src/components/design-system/MiniProgressBar.tsx`
- **Props** : `progress: number` (0.0–1.0), `color?: string` (défaut `Colors.primaire`)
- **Hauteur** : 4px, `borderRadius: 2`
- **Clamp** : valeurs hors [0,1] clampées automatiquement
- **Largeur fill** : `${Math.round(progress * 100)}%` — calculée en string %

#### DC-05 — BadgePrioriteHaute (hors MVP)

Non implémenté conformément à la décision PO (§3 brief). Documenté en TODO dans `index.ts`.

#### DC-06 / DC-08 — Hors MVP

Non implémentés.

### Barrel index.ts mis à jour

`src/mobile/src/components/design-system/index.ts` :
- Export de DC-01, DC-02, DC-03, DC-04, DC-07
- TODO post-MVP documenté pour DC-05, DC-06, DC-08

### Erreurs / invariants préservés

- Aucun composant ne hardcode de couleur hexadécimale — tous utilisent `Colors.*`
- L'exception `#0037b0` est documentée comme extrémité décorative exclusive du gradient
- `expo-blur` et `expo-linear-gradient` sont des dépendances optionnelles avec fallback
- Les composants DC sont de présentation pure — aucun Domain Event, aucun appel réseau

---

## Mise à jour M-02 (ListeColisScreen) — US-001 précisions design 2026-03-25

Conformément à `/livrables/05-backlog/user-stories/US-001-consulter-liste-colis-tournee.md` §"Précisions design 2026-03-25".

### Changements apportés à `src/mobile/src/screens/ListeColisScreen.tsx`

| Zone | Avant | Après |
|------|-------|-------|
| Header | Bandeau bleu `#1565C0`, padding 16px | Header dédié 64px, `Colors.primaire`, titre + IndicateurSync |
| Bandeau progression — compteur | `fontSize: 16, fontWeight: '700'` | Compteur `fontSize: 30, fontWeight: '900'` + séparateur + badge LIVE |
| Barre de progression | `height: 6px` | `height: 16px` |
| Footer | `TouchableOpacity` bouton `Cloture la tournee` inline | `GlassEffectFooter` (DC-02) avec 2 boutons |
| Libellés footer | `Cloture la tournee` | "Scanner un colis" + "Clôturer la tournée" |
| Couleurs hardcodées | `#2196F3`, `#388E3C`, `#616161`, `#D32F2F` | `Colors.*` |
| Pull-to-refresh color | `['#2196F3']` | `[Colors.primaire]` |
| Footer bouton cloture | Visible uniquement si `resteALivrer === 0` | Toujours visible, désactivé si conditions non remplies |
| Padding bottom liste | `paddingVertical: 8` | `paddingBottom: 96` (espace footer fixe) |

### Changements apportés à `CarteColis.tsx`

- Adresse : `fontSize: 14 → 20`, `fontWeight: '600' → '700'` (20px Bold — lisibilité terrain)

---

## Tests

### Types de tests

- **Tests unitaires Jest** (TDD — tests écrits avant implémentation)
- Framework : `@testing-library/react-native`

### Résultats

| Fichier test | Tests | Statut |
|---|---|---|
| `__tests__/GlassEffectFooter.test.tsx` | 8 | PASS |
| `__tests__/ContextBannerColis.test.tsx` | 7 | PASS |
| `__tests__/TacticalGradient.test.tsx` | 5 | PASS |
| `__tests__/SignatureGrid.test.tsx` | 7 | PASS |
| `__tests__/MiniProgressBar.test.tsx` | 9 | PASS |
| Régressions design system (13 suites) | 87 | PASS |

**Total nouveaux tests** : 36 tests — 36 PASS

### Couverture par scénario US-031

| Scénario | Couvert |
|---|---|
| SC1 — GlassEffectFooter rendu sur M-02 | Oui (tests unitaires + intégration dans ListeColisScreen) |
| SC2 — ContextBannerColis variant neutre sur M-04 | Oui (test bordure + label) |
| SC3 — ContextBannerColis variant erreur sur M-05 | Oui (test bordure alerte) |
| SC4 — MiniProgressBar sur M-04 | Oui (test 75%, 0%, 100%) |
| SC5 — SignatureGrid sur pad M-04 | Oui (tests rendu + children) |
| SC6 — DC-06 et DC-08 absents MVP | Oui (non implémentés + TODO documenté) |

### Commandes de lancement

```bash
# Lancer tous les tests nouveaux composants DC
cd src/mobile
npx jest --testPathPattern="GlassEffectFooter|ContextBannerColis|TacticalGradient|SignatureGrid|MiniProgressBar" --no-coverage

# Lancer toute la suite design system (régression)
npx jest --testPathPattern="components/design-system/__tests__" --no-coverage
```

---

## Notes techniques

### Dépendance expo-linear-gradient

`TacticalGradient` utilise `expo-linear-gradient` si disponible, sinon fallback.
Pour l'activer en production :

```bash
expo install expo-linear-gradient
```

### Dépendance expo-blur

`GlassEffectFooter` utilise `expo-blur` si disponible, sinon fallback rgba transparent.
Pour l'activer en production :

```bash
expo install expo-blur
```

### Test mock virtuel expo-linear-gradient

Le test `TacticalGradient.test.tsx` utilise `jest.mock(..., { virtual: true })`
pour simuler le module sans nécessiter l'installation réelle. Ce pattern est conforme
à la config Jest avec `jest-expo` preset.

---

*Implémenté par @developpeur — 2026-03-25*
