# Scénarios de tests US-031

**US** : US-031 — Intégrer les nouveaux composants visuels issus du retour designer externe
**Date de rédaction** : 2026-03-29
**Agent** : @qa

---

## Analyse de périmètre

### Bounded Context et couche

US-031 est 100% présentation (Interface Layer). Aucun Aggregate, aucun Domain Event, aucun appel réseau.

Conséquences sur la pyramide :
- **L1** : totalité des assertions (logique de rendu, props, styles, invariants no-hex)
- **L2** : non applicable (aucun endpoint consommé)
- **L3** : non applicable (pas d'interaction UI propre à ces composants — intégration dans les écrans est couverte par US-001, US-005, US-008)

### Composants ciblés

| ID | Composant | Fichier | Priorité | Statut |
|----|-----------|---------|----------|--------|
| DC-01 | TacticalGradient | `design-system/TacticalGradient.tsx` | P1 | Implémenté |
| DC-02 | GlassEffectFooter | `design-system/GlassEffectFooter.tsx` | P0 | Implémenté |
| DC-03 | SignatureGrid | `design-system/SignatureGrid.tsx` | P1 | Implémenté |
| DC-04 | ContextBannerColis | `design-system/ContextBannerColis.tsx` | P0 | Implémenté |
| DC-05 | BadgePrioriteHaute | — | P2 | Hors MVP (TODO documenté) |
| DC-06 | ImageContextuelle | — | — | Hors MVP |
| DC-07 | MiniProgressBar | `design-system/MiniProgressBar.tsx` | P1 | Implémenté |
| DC-08 | CardImageAccueil | — | — | Hors MVP |

### Signalement TopAppBar / SideNavBar (context US-025)

Le contexte de la tâche demande de signaler si US-031 couvre `TopAppBar.tsx` et `SideNavBar.tsx`,
absents de `src/web/supervision/src/components/layout/`.

**Réponse : non.** US-031 couvre exclusivement des composants React Native mobile (DC-01 à DC-07).
`TopAppBar` et `SideNavBar` sont des composants web supervision — hors périmètre US-031.
Ces composants font partie de US-026/US-027 (refactorisation écrans superviseur).
L'anomalie OBS-025-02 (TopAppBar/SideNavBar absents) reste ouverte sur US-026/US-027.

---

## Jeux de données

| ID | Usage | Valeurs |
|----|-------|---------|
| JDD-031-01 | ContextBannerColis neutre | colisId="C-042", destinataire="Jean Dupont", variant="neutre" |
| JDD-031-02 | ContextBannerColis erreur | colisId="C-099", destinataire="Marie Leroy", variant="erreur" |
| JDD-031-03 | MiniProgressBar M-04 | progress=0.75 (3 étapes sur 4) |
| JDD-031-04 | MiniProgressBar limites | progress=0, 1, 1.5, -0.5 |
| JDD-031-05 | TacticalGradient | colors=['#1D4ED8', '#0037b0'] |

---

## Scénarios de test

---

### TC-031-01 : GlassEffectFooter — rendu de base et enfants

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (composant de présentation)
**Aggregate / Domain Event ciblé** : aucun — composant DC-02
**Type** : Fonctionnel
**Préconditions** : bibliothèque @testing-library/react-native disponible
**Étapes** : render `<GlassEffectFooter>` avec deux enfants textuels
**Résultat attendu** : testID `glass-effect-footer` présent, textes enfants rendus
**Statut** : Passé

```gherkin
Given GlassEffectFooter est rendu avec deux boutons en enfants
When le composant est monté
Then le testID "glass-effect-footer" est détectable
And les textes "Scanner un colis" et "Cloturer la tournee" sont visibles
```

---

### TC-031-02 : GlassEffectFooter — position absolute et dimensions

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (style)
**Aggregate / Domain Event ciblé** : aucun — composant DC-02
**Type** : Invariant de présentation
**Préconditions** : composant monté
**Étapes** : inspecter les props.style du noeud racine
**Résultat attendu** : `position='absolute'`, `bottom=0`, `left=0`, `right=0`, `minHeight >= 80`
**Statut** : Passé

```gherkin
Given GlassEffectFooter est monté
When on inspecte les styles du noeud racine
Then position est "absolute"
And bottom est 0
And left est 0 et right est 0
And minHeight est supérieur ou égal à 80
```

---

### TC-031-03 : GlassEffectFooter — testID personnalisable

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (props)
**Aggregate / Domain Event ciblé** : aucun — composant DC-02
**Type** : Fonctionnel
**Préconditions** : prop testID="mon-footer" passée
**Étapes** : render avec testID personnalisé
**Résultat attendu** : noeud détectable via `getByTestId("mon-footer")`
**Statut** : Passé

```gherkin
Given GlassEffectFooter est rendu avec testID="mon-footer"
When on cherche le noeud par testID
Then "mon-footer" est trouvé
```

---

### TC-031-04 : ContextBannerColis — rendu colisId et destinataire

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (composant de présentation)
**Aggregate / Domain Event ciblé** : aucun — composant DC-04
**Type** : Fonctionnel
**Préconditions** : JDD-031-01
**Étapes** : render avec colisId="C-042", destinataire="Jean Dupont", variant="neutre"
**Résultat attendu** : textes "C-042" et "Jean Dupont" visibles, label testID "context-banner-label" présent
**Statut** : Passé

```gherkin
Given ContextBannerColis est rendu avec colisId="C-042" et destinataire="Jean Dupont"
When le composant est monté
Then le texte "C-042" est visible
And le texte "Jean Dupont" est visible
And le testID "context-banner-label" est présent
```

---

### TC-031-05 : ContextBannerColis — variant neutre (bordure Colors.primaire)

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (style + token)
**Aggregate / Domain Event ciblé** : aucun — composant DC-04
**Type** : Invariant de présentation / token
**Préconditions** : JDD-031-01
**Étapes** : render variant="neutre", inspecter borderLeftColor et borderLeftWidth
**Résultat attendu** : `borderLeftColor='#1D4ED8'` (Colors.primaire), `borderLeftWidth=4`
**Statut** : Passé

```gherkin
Given ContextBannerColis est rendu avec variant="neutre"
When on inspecte le style de la bannière
Then borderLeftColor est "#1D4ED8" (Colors.primaire)
And borderLeftWidth est 4
```

---

### TC-031-06 : ContextBannerColis — variant erreur (bordure Colors.alerte)

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (style + token)
**Aggregate / Domain Event ciblé** : aucun — composant DC-04
**Type** : Invariant de présentation / token
**Préconditions** : JDD-031-02
**Étapes** : render variant="erreur", inspecter borderLeftColor
**Résultat attendu** : `borderLeftColor='#DC2626'` (Colors.alerte)
**Statut** : Passé

```gherkin
Given ContextBannerColis est rendu avec variant="erreur"
When on inspecte le style de la bannière
Then borderLeftColor est "#DC2626" (Colors.alerte)
```

---

### TC-031-07 : ContextBannerColis — accessibilityLabel

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (accessibilité)
**Aggregate / Domain Event ciblé** : aucun — composant DC-04
**Type** : Fonctionnel
**Préconditions** : JDD-031-01
**Étapes** : render, récupérer par `getByLabelText`
**Résultat attendu** : noeud trouvé via `"Colis en cours C-042 pour Jean Dupont"`
**Statut** : Passé

```gherkin
Given ContextBannerColis est rendu avec colisId="C-042" et destinataire="Jean Dupont"
When on cherche par accessibilityLabel
Then "Colis en cours C-042 pour Jean Dupont" est trouvé
```

---

### TC-031-08 : MiniProgressBar — rendu de base (75%)

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (composant de présentation)
**Aggregate / Domain Event ciblé** : aucun — composant DC-07
**Type** : Fonctionnel
**Préconditions** : JDD-031-03
**Étapes** : render `<MiniProgressBar progress={0.75} />`
**Résultat attendu** : testID `mini-progress-bar` et `mini-progress-bar-fill` présents
**Statut** : Passé

```gherkin
Given MiniProgressBar est rendu avec progress=0.75
When le composant est monté
Then le conteneur "mini-progress-bar" est détectable
And la barre "mini-progress-bar-fill" est détectable
```

---

### TC-031-09 : MiniProgressBar — largeur proportionnelle (75%, 0%, 100%)

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (logique de calcul)
**Aggregate / Domain Event ciblé** : aucun — composant DC-07
**Type** : Invariant de présentation
**Préconditions** : JDD-031-03, JDD-031-04
**Étapes** : tester progress=0.75, 0, 1
**Résultat attendu** : width de la fill = '75%', '0%', '100%' respectivement
**Statut** : Passé

```gherkin
Given MiniProgressBar est rendu avec progress=0.75 / 0 / 1
When on inspecte le style de la barre fill
Then la width est respectivement "75%", "0%", "100%"
```

---

### TC-031-10 : MiniProgressBar — clamp hors limites

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (edge case)
**Aggregate / Domain Event ciblé** : aucun — composant DC-07
**Type** : Edge case
**Préconditions** : JDD-031-04
**Étapes** : render progress=1.5 et progress=-0.5
**Résultat attendu** : width='100%' pour 1.5, width='0%' pour -0.5
**Statut** : Passé

```gherkin
Given MiniProgressBar est rendu avec progress=1.5 (dépasse max)
When on inspecte la fill
Then width est "100%"

Given MiniProgressBar est rendu avec progress=-0.5 (sous min)
When on inspecte la fill
Then width est "0%"
```

---

### TC-031-11 : MiniProgressBar — style (hauteur 4px, borderRadius 2)

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (style)
**Aggregate / Domain Event ciblé** : aucun — composant DC-07
**Type** : Invariant de présentation
**Préconditions** : composant monté
**Étapes** : inspecter styles conteneur
**Résultat attendu** : `height=4`, `borderRadius=2`
**Statut** : Passé

```gherkin
Given MiniProgressBar est rendu
When on inspecte le style du conteneur
Then height est 4
And borderRadius est 2
```

---

### TC-031-12 : MiniProgressBar — couleur par défaut et couleur custom

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (token)
**Aggregate / Domain Event ciblé** : aucun — composant DC-07
**Type** : Invariant token
**Préconditions** : Colors.primaire = '#1D4ED8'
**Étapes** : render sans prop color, puis avec color='#16A34A'
**Résultat attendu** : backgroundColor='#1D4ED8' par défaut, '#16A34A' avec prop
**Statut** : Passé

```gherkin
Given MiniProgressBar est rendu sans prop color
When on inspecte la backgroundColor de la fill
Then elle est "#1D4ED8" (Colors.primaire)

Given MiniProgressBar est rendu avec color="#16A34A"
When on inspecte la fill
Then backgroundColor est "#16A34A"
```

---

### TC-031-13 : TacticalGradient — rendu et enfants

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (composant de présentation)
**Aggregate / Domain Event ciblé** : aucun — composant DC-01
**Type** : Fonctionnel
**Préconditions** : mock expo-linear-gradient (virtual: true)
**Étapes** : render `<TacticalGradient>` avec un texte enfant
**Résultat attendu** : testID `tactical-gradient` présent, texte enfant rendu
**Statut** : Passé

```gherkin
Given TacticalGradient est rendu avec mock expo-linear-gradient
When le composant est monté
Then "tactical-gradient" est détectable
And les enfants sont rendus
```

---

### TC-031-14 : TacticalGradient — couleurs gradient (#1D4ED8 et #0037b0)

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (token gradient)
**Aggregate / Domain Event ciblé** : aucun — composant DC-01
**Type** : Invariant de présentation
**Préconditions** : JDD-031-05
**Étapes** : inspecter prop data-colors du mock LinearGradient
**Résultat attendu** : tableau contient '#1D4ED8' et '#0037b0'
**Statut** : Passé

```gherkin
Given TacticalGradient est rendu
When on inspecte les couleurs du gradient via data-colors
Then '#1D4ED8' est présent dans le tableau
And '#0037b0' est présent dans le tableau
```

---

### TC-031-15 : TacticalGradient — props style et testID personnalisables

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (props)
**Aggregate / Domain Event ciblé** : aucun — composant DC-01
**Type** : Fonctionnel
**Préconditions** : composant monté
**Étapes** : render avec style={width:200, height:60} et testID="mon-gradient"
**Résultat attendu** : noeud détectable, style appliqué sans erreur
**Statut** : Passé

```gherkin
Given TacticalGradient est rendu avec testID="mon-gradient"
When on cherche par testID
Then "mon-gradient" est trouvé
```

---

### TC-031-16 : SignatureGrid — rendu de base et enfants

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (composant de présentation)
**Aggregate / Domain Event ciblé** : aucun — composant DC-03
**Type** : Fonctionnel
**Préconditions** : composant monté
**Étapes** : render `<SignatureGrid>` avec un texte enfant
**Résultat attendu** : testID `signature-grid` présent, enfant visible
**Statut** : Passé

```gherkin
Given SignatureGrid est rendu avec un enfant texte
When le composant est monté
Then "signature-grid" est détectable
And le texte enfant est visible
```

---

### TC-031-17 : SignatureGrid — flex:1 (occupe tout l'espace disponible)

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (style)
**Aggregate / Domain Event ciblé** : aucun — composant DC-03
**Type** : Invariant de présentation
**Préconditions** : composant monté
**Étapes** : inspecter style.flex du noeud racine
**Résultat attendu** : `flex=1`
**Statut** : Passé

```gherkin
Given SignatureGrid est montée
When on inspecte le style
Then flex est 1
```

---

### TC-031-18 : SignatureGrid — testID et style personnalisables

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (props)
**Aggregate / Domain Event ciblé** : aucun — composant DC-03
**Type** : Fonctionnel
**Préconditions** : props testID et style passées
**Étapes** : render avec testID="mon-pad" et style={height:300}
**Résultat attendu** : noeud détectable, pas d'erreur de rendu
**Statut** : Passé

```gherkin
Given SignatureGrid est rendue avec testID="mon-pad"
When on cherche par testID
Then "mon-pad" est trouvé
And le style height=300 est accepté sans erreur
```

---

### TC-031-19 : Barrel index.ts — exports DC-01 à DC-07 présents

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (contrat public du design system)
**Aggregate / Domain Event ciblé** : aucun — barrel export
**Type** : Invariant de contrat
**Préconditions** : fichier `design-system/index.ts` existant
**Étapes** : vérifier les exports présents dans index.ts
**Résultat attendu** : TacticalGradient, GlassEffectFooter, SignatureGrid, ContextBannerColis, MiniProgressBar exportés ; DC-05/DC-06/DC-08 listés en TODO post-MVP
**Statut** : Passé

```gherkin
Given le fichier index.ts du design system est lu
When on vérifie les exports
Then TacticalGradient, GlassEffectFooter, SignatureGrid, ContextBannerColis, MiniProgressBar sont exportés
And DC-05, DC-06, DC-08 sont documentés en TODO post-MVP (non implémentés)
```

---

### TC-031-20 : Invariant no-hex — ContextBannerColis.tsx (OBS-031-01)

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (invariant token)
**Aggregate / Domain Event ciblé** : aucun — composant DC-04
**Type** : Invariant domaine (non régression design system)
**Préconditions** : lecture de `ContextBannerColis.tsx`
**Étapes** : inspecter la valeur backgroundColor du containerNeutre
**Résultat attendu** : backgroundColor devrait utiliser `Colors.surfaceSecondary` — valeur '#F8FAFC' hardcodée détectée (non bloquant : valeur identique au token)
**Statut** : Échoué (non bloquant — OBS-031-01)

```gherkin
Given ContextBannerColis.tsx est inspecté
When on cherche les valeurs hexadécimales hardcodées hors gradient
Then backgroundColor: '#F8FAFC' est présent dans containerNeutre
And cette valeur est identique à Colors.surfaceSecondary mais n'utilise pas le token
```

---

### TC-031-21 : Régression design system — 13 suites existantes

**US liée** : US-031
**Niveau** : L1
**Couche testée** : Interface (non régression)
**Aggregate / Domain Event ciblé** : aucun — suites existantes US-025
**Type** : Non régression
**Préconditions** : suites design-system existantes (BadgeStatut, BoutonCTA, etc.)
**Étapes** : `npx jest --testPathPattern="components/design-system"` (toutes suites)
**Résultat attendu** : 101 tests PASS, 0 régression introduite par US-031
**Statut** : Passé

```gherkin
Given les 13 suites du design system sont exécutées
When on lance npx jest --testPathPattern="components/design-system"
Then 101 tests passent
And 0 régression n'est introduite
```

---

## Synthèse des TC

| TC | Composant | Type | Niveau | Statut |
|----|-----------|------|--------|--------|
| TC-031-01 | GlassEffectFooter | Fonctionnel | L1 | Passé |
| TC-031-02 | GlassEffectFooter | Invariant style | L1 | Passé |
| TC-031-03 | GlassEffectFooter | Fonctionnel (props) | L1 | Passé |
| TC-031-04 | ContextBannerColis | Fonctionnel | L1 | Passé |
| TC-031-05 | ContextBannerColis | Invariant token | L1 | Passé |
| TC-031-06 | ContextBannerColis | Invariant token | L1 | Passé |
| TC-031-07 | ContextBannerColis | Accessibilité | L1 | Passé |
| TC-031-08 | MiniProgressBar | Fonctionnel | L1 | Passé |
| TC-031-09 | MiniProgressBar | Invariant calcul | L1 | Passé |
| TC-031-10 | MiniProgressBar | Edge case | L1 | Passé |
| TC-031-11 | MiniProgressBar | Invariant style | L1 | Passé |
| TC-031-12 | MiniProgressBar | Invariant token | L1 | Passé |
| TC-031-13 | TacticalGradient | Fonctionnel | L1 | Passé |
| TC-031-14 | TacticalGradient | Invariant token | L1 | Passé |
| TC-031-15 | TacticalGradient | Fonctionnel (props) | L1 | Passé |
| TC-031-16 | SignatureGrid | Fonctionnel | L1 | Passé |
| TC-031-17 | SignatureGrid | Invariant style | L1 | Passé |
| TC-031-18 | SignatureGrid | Fonctionnel (props) | L1 | Passé |
| TC-031-19 | Barrel index.ts | Invariant contrat | L1 | Passé |
| TC-031-20 | ContextBannerColis | Invariant no-hex | L1 | Échoué (non bloquant) |
| TC-031-21 | Suite design system | Non régression | L1 | Passé |

**Total** : 21 TC — 20 Passé / 1 Échoué non bloquant
**L2** : non applicable
**L3** : non applicable
