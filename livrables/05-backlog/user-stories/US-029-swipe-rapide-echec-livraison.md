# US-029 : Declarer rapidement un echec de livraison par swipe gauche

**Epic** : EPIC-001 : Execution de la Tournee (application mobile livreur)
**Feature** : F-004 : Declaration d'un echec de livraison avec motif normalise
**Bounded Context** : BC-01 Orchestration de Tournee (Core Domain)
**Aggregate(s) touchés** : Colis, Tournee
**Priorité** : Should Have
**Statut** : A affiner
**Complexité estimée** : S

---

## User Story

En tant que livreur,
je veux pouvoir initier la declaration d'un echec de livraison par un geste swipe-gauche
sur la CarteColis dans M-02,
afin de gagner du temps sur les cas courants (absent, acces impossible) sans naviguer
manuellement vers le detail du colis.

---

## Contexte

Besoin terrain identifie lors du redesign v2.0 (cf. evolution-design.md M-02 "Swipe gauche").
L'objectif de traitement d'un colis en moins de 45 secondes (KPI US-001) est difficile
a atteindre sur les cas d'echec quand il faut naviguer vers M-03 puis M-05.
Le swipe est un raccourci de navigation — il ouvre M-05 avec le Colis pre-selectionne.
Il ne constitue pas en lui-meme une declaration d'echec : le livreur doit toujours
confirmer dans M-05.

Cette US depend de la CarteColis creee dans US-025 (Design System) qui supporte
le geste swipe.

**Invariants a respecter** :

- L'EchecLivraisonDeclare ne peut etre emis qu'apres la confirmation dans M-05,
  jamais directement depuis le swipe.
- Le swipe ne doit pas etre declenche accidentellement : un seuil de 80px minimum
  de deplacement horizontal est requis.
- Le swipe-droit ou le release avant le seuil annule l'action et remet la CarteColis
  en position initiale.
- Le swipe n'est disponible que sur les colis dont le StatutColis est A_LIVRER.
  Les colis deja LIVRE ou ECHEC ne proposent pas de swipe.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Swipe gauche revele le bouton Echec

```gherkin
Given la liste M-02 avec un colis dont le StatutColis est A_LIVRER
When le livreur realise un swipe-gauche de plus de 80px sur la CarteColis
Then un bouton rouge "Echec" est revele a droite de la card
And la CarteColis reste en position decalee (translation) le temps que le livreur interagit
```

### Scenario 2 — Tap sur le bouton Echec ouvre M-05

```gherkin
Given la CarteColis en position swipee avec le bouton "Echec" visible
When le livreur tape sur le bouton "Echec"
Then l'ecran M-05 (Declaration d'echec) s'ouvre
And le Colis correspondant est pre-selectionne dans M-05
And aucun evenement EchecLivraisonDeclare n'est emis avant la confirmation dans M-05
```

### Scenario 3 — Swipe court ou release annule le geste

```gherkin
Given la liste M-02 avec un colis dont le StatutColis est A_LIVRER
When le livreur realise un swipe-gauche de moins de 80px et relache
Then la CarteColis revient en position initiale avec une animation de rappel
And le bouton "Echec" n'est pas visible
```

### Scenario 4 — Swipe-droit annule un swipe en cours

```gherkin
Given la CarteColis en position swipee avec le bouton "Echec" visible
When le livreur realise un swipe-droit
Then la CarteColis revient en position initiale
And le bouton "Echec" disparait
```

### Scenario 5 — Swipe non disponible sur colis deja traite

```gherkin
Given la liste M-02 avec un colis dont le StatutColis est LIVRE ou ECHEC
When le livreur tente un swipe-gauche sur cette CarteColis
Then aucun bouton d'action n'est revele
And la CarteColis reste immobile (swipe inactif)
```

---

## Précisions design (2026-03-25)

Suite au retour du designer externe (rapport delta `/livrables/02-ux/delta-designer-2026-03-25.md`),
les précisions suivantes s'appliquent à l'interaction swipe sur M-02.

### Confirmation de périmètre

Le designer externe n'a pas implémenté le swipe gauche dans ses maquettes HTML (interaction,
pas visuel). Cela ne remet pas en cause la US : le swipe reste prévu et est confirmé dans
le périmètre MVP (Should Have).

Le développeur doit implémenter le swipe sans référence visuelle designer — se baser
uniquement sur les wireframes v2.0 et les critères d'acceptation ci-dessus.

### Composants visuels à utiliser

| Zone | Composant DS | Précision designer |
| ---- | ------------ | ------------------ |
| CarteColis avec swipe | `CarteColis` (US-025) | Le composant `CarteColis` créé dans US-025 doit supporter le geste swipe (Reanimated / PanGestureHandler). Seuil 80px confirmé. |
| Bouton "Échec" révélé | Bloc action rouge | Fond `Colors.alerte` (#DC2626), icone warning, texte "Échec" — s'aligne sur la sémantique erreur du design system DocuPost (Option B, pas le rouge MD3). |
| Animation retour | Spring animation | Retour fluide en spring si swipe < 80px ou swipe-droit. |
| Footer M-02 | DC-02 `GlassEffectFooter` | Conforme à US-001 — le footer glass n'interfère pas avec le swipe (zone distincte). |

### Point de vigilance

Le GlassEffectFooter (DC-02) sur M-02 occupe la zone basse de l'écran. S'assurer que
la zone de swipe de la `CarteColis` ne chevauche pas la zone du footer fixe.

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#M-02
- Delta designer : /livrables/02-ux/delta-designer-2026-03-25.md#m-02--liste-des-colis-de-la-tournee
- Evolution Design : /livrables/02-ux/evolution-design.md (M-02 "Swipe gauche")
- US suggeree UX : evolution-design.md §2 US-suggeree-D
- Design System : /livrables/02-ux/design-system.md §3.2 (CarteColis — swipe support)
- Prerequis US : US-025-implementer-design-system.md (CarteColis avec swipe)
- US liee : US-005-declarer-echec-livraison.md (logique metier echec)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
