# US-031 : Intégrer les nouveaux composants visuels issus du retour designer externe

**Epic** : EPIC-008 — Expérience Utilisateur et Cohérence Visuelle
**Feature** : F-022 — Design System et Tokens d'interface
**Bounded Context** : Transverse (frontend uniquement — aucun Bounded Context métier)
**Aggregate(s) touchés** : aucun (couche présentation uniquement)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : M (5 points)

---

## User Story

En tant que développeur,
je veux disposer des nouveaux composants visuels DC-01 à DC-07 identifiés par le designer
externe (rapport delta 2026-03-25),
afin que les écrans M-01 à M-06 reflètent fidèlement les maquettes validées et offrent
une expérience visuelle cohérente aux livreurs terrain.

---

## Contexte

Le designer externe a livré 7 écrans HTML/Tailwind (PRD + M-01 à M-06) avec Material
Design 3. Le rapport delta (`/livrables/02-ux/delta-designer-2026-03-25.md`) identifie
8 nouveaux composants (DC-01 à DC-08). Cette US couvre les composants DC-01 à DC-07
retenus pour le MVP. DC-08 (CardImageAccueil — écran PRD) est hors périmètre MVP.

Cette US est un **complément de US-025** (Design System). Elle doit être livrée dans le
même sprint ou immédiatement après US-025.

**Décision palette retenue** : **Option B** — garder `Colors.primaire = #1D4ED8`.
Les maquettes HTML du designer servent de référence de layout, pas de référence couleur.
L'alignement MD3 complet (Option A) est documenté pour la v2 post-MVP.

**Invariants à respecter** :

- Aucun composant ne hardcode une valeur de couleur : seuls les tokens semantiques
  `Colors.*` (mobile) et `--color-*` (web) sont autorisés.
- Les composants DC-01 à DC-07 sont des composants de présentation pure — aucun
  Domain Event ne leur est associé.
- DC-06 (ImageContextuelle) est hors MVP — ne pas implémenter.
- DC-08 (CardImageAccueil / écran PRD) est hors MVP — ne pas implémenter.

---

## Composants à créer

| ID | Nom | Fichier cible | Écrans | Priorité |
| -- | --- | ------------- | ------ | -------- |
| DC-01 | `TacticalGradient` | `src/mobile/src/components/design-system/TacticalGradient.tsx` | M-01, M-06 | P1 — pattern identitaire (logo, bandeau M-06) |
| DC-02 | `GlassEffectFooter` | `src/mobile/src/components/design-system/GlassEffectFooter.tsx` | M-02, M-03, M-04, M-05 | P0 — 4 écrans utilisent ce footer |
| DC-03 | `SignatureGrid` | `src/mobile/src/components/design-system/SignatureGrid.tsx` | M-04 | P1 — fond du pad signature |
| DC-04 | `ContextBannerColis` | `src/mobile/src/components/design-system/ContextBannerColis.tsx` | M-04, M-05 | P0 — pattern répété 2 écrans |
| DC-05 | `BadgePrioriteHaute` | `src/mobile/src/components/design-system/BadgePrioriteHaute.tsx` | M-06 | P2 — hors MVP (nice to have) |
| DC-06 | `ImageContextuelle` | Non à créer | M-03 | Hors MVP |
| DC-07 | `MiniProgressBar` | `src/mobile/src/components/design-system/MiniProgressBar.tsx` | M-04 | P1 — avancement formulaire |

### Spécifications par composant

#### DC-01 — TacticalGradient

Dégradé identitaire DocuPost. Utilisé sur le logo M-01 et le bandeau M-06.

```
Direction : 135deg
Couleur début : Colors.primaire (#1D4ED8)
Couleur fin : #0037b0 (référence designer — utilisé uniquement pour les gradients,
             pas comme couleur primaire standalone)
Usage : LinearGradient React Native
```

#### DC-02 — GlassEffectFooter

Footer fixe translucide. Remplace le fond blanc simple sur 4 écrans.

```
Background : rgba(255, 255, 255, 0.85)
Blur : BlurView intensity=20 (expo-blur) ou backdrop-filter: blur(20px)
Shadow : 0 -4px 20px rgba(0, 0, 0, 0.08)
Position : absolute bottom, pleine largeur
Hauteur : 80px + safe area inset bottom
```

#### DC-03 — SignatureGrid

Fond en grille de points pour le pad de signature M-04. Composant CSS/SVG pur.

```
Pattern : radial-gradient points 4px de diamètre espacés 20x20px
Couleur points : rgba(0, 0, 0, 0.08) (très discrets)
Usage : background du View qui contient le Canvas de signature
```

#### DC-04 — ContextBannerColis

Bannière contextuelle identifiant le colis en cours. Présent sur M-04 et M-05.

```
Props : colisId (string), destinataire (string), variant ("neutre" | "erreur")
variant "neutre" (M-04) : border-left 4px Colors.primaire, fond --color-surface-secondary
variant "erreur" (M-05) : border-left 4px Colors.alerte, fond --color-alerte-leger
Icone : package_2 (Material Icons) ou equivalent
Label : "COLIS EN COURS" uppercase 10px
```

#### DC-05 — BadgePrioriteHaute (hors MVP)

Badge "Priorité Haute" sur M-06. Ne pas implémenter au MVP — documenter en TODO.

```
TODO post-MVP : badge 10px uppercase "Priorité Haute" en tertiary-fixed
               sur le BandeauInstruction M-06.
```

#### DC-07 — MiniProgressBar

Barre de progression fine indiquant l'avancement d'un formulaire.

```
Props : progress (0.0 à 1.0), color (Colors.primaire par défaut)
Hauteur : 4px (h-1)
Largeur : pleine largeur du conteneur
Usage M-04 : progress=0.75 (3 étapes sur 4 — type preuve sélectionné, signature tracée)
Bordures : radius 2px
```

---

## Critères d'acceptation (Gherkin)

### Scénario 1 — GlassEffectFooter rendu sur M-02

```gherkin
Given l'écran M-02 (Liste des colis) est affiché
When Pierre scrolle la liste de colis vers le bas
Then le footer reste fixe en bas d'écran
And le contenu de la liste est visible par transparence derrière le footer
And les boutons "Scanner un colis" et "Clôturer la tournée" sont cliquables
```

### Scénario 2 — ContextBannerColis variant neutre sur M-04

```gherkin
Given Pierre est sur l'écran M-04 (Capture de la preuve)
When l'écran est affiché
Then la bannière ContextBannerColis affiche l'ID du colis en cours
And la bannière a une bordure gauche de couleur Colors.primaire
And le label "COLIS EN COURS" est visible en uppercase
```

### Scénario 3 — ContextBannerColis variant erreur sur M-05

```gherkin
Given Pierre est sur l'écran M-05 (Déclaration d'un échec)
When l'écran est affiché
Then la bannière ContextBannerColis a une bordure gauche de couleur Colors.alerte
And le fond de la bannière est --color-alerte-leger
```

### Scénario 4 — MiniProgressBar sur M-04

```gherkin
Given Pierre est sur l'écran M-04 et a sélectionné le type de preuve "Signature"
And Pierre a tracé une signature sur le pad
When Pierre regarde la zone au-dessus du bouton CONFIRMER
Then la MiniProgressBar affiche une progression de 75% (3/4 étapes)
And la couleur de la barre est Colors.primaire
```

### Scénario 5 — SignatureGrid sur le pad M-04

```gherkin
Given Pierre est sur l'écran M-04 avec le pad de signature visible
When le pad est affiché vide (avant toute signature)
Then une grille de points discrets est visible en fond du pad
And les points n'interfèrent pas visuellement avec le tracé de signature
```

### Scénario 6 — DC-06 et DC-08 absents du MVP

```gherkin
Given l'application mobile est en production MVP
When les écrans M-03 et M-01 sont affichés
Then aucune image contextuelle de bâtiment n'est présente sur M-03
And aucun écran PRD (accueil branding) n'est présent avant M-01
```

---

## Liens

- Design System : /livrables/02-ux/design-system.md
- Delta designer : /livrables/02-ux/delta-designer-2026-03-25.md#3--nouveaux-composants-identifies-par-le-designer
- Prérequis US : US-025-implementer-design-system.md
- US impactées : US-001, US-002, US-005, US-008, US-015, US-016, US-019
- Brief développeur : /livrables/06-dev/brief-dev-retour-designer-2026-03-25.md
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
