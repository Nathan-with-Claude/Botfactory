# Brief développeur — Retour designer externe — 2026-03-25

> Produit par @po — Session 2026-03-25.
> Destinataire : @developpeur.
> Source : rapport delta UX `/livrables/02-ux/delta-designer-2026-03-25.md`
>          + design system v1.2 `/livrables/02-ux/design-system.md`
>          + wireframes v2.1 `/livrables/02-ux/wireframes.md`

---

## Résumé exécutif

Le designer externe a livré 7 maquettes HTML/Tailwind (PRD + M-01 à M-06) avec Material
Design 3. Ces maquettes valident le fond fonctionnel des wireframes v2.0 mais introduisent
des écarts visuels documentés. Ce brief liste les changements à implémenter, en ordre de
priorité P0 → P1 → P2, et documente les décisions techniques arbitrées par le PO.

**Décision structurante — Palette de couleurs** : voir §1 ci-dessous.

---

## §1 — Décision palette : Option B retenue

### Contexte

Le designer a utilisé le système de couleurs Material Design 3, distinct de nos tokens
sémantiques DocuPost. Deux options étaient possibles :

**Option A — Aligner sur MD3** : adopter `#0037b0` comme couleur primaire.

- Impact : tous les composants utilisant `Colors.primaire` changent de teinte.
- US impactées : US-001, US-002, US-003, US-007, US-008.
- Avantage : cohérence parfaite avec les maquettes designer.
- Inconvénient : coût de migration élevé en milieu de sprint, risque de régression visuelle.

**Option B — Garder notre palette, adapter les assets HTML** : conserver `Colors.primaire
= #1D4ED8`. Les fichiers HTML du designer servent de référence de layout uniquement.

- Impact : quasi-nul sur le code existant.
- Inconvénient : écart résiduel avec les maquettes designer (nuance de bleu).
- Avantage : stabilité, pas de régression, décision réversible en v2.

### Décision PO : **Option B pour le MVP**

Garder `Colors.primaire = #1D4ED8`. Documenter l'écart pour une décision de design
system globale en v2 post-MVP (alignement MD3 complet).

**Fichiers non à modifier** :

- `src/mobile/src/theme/colors.ts` — `Colors.primaire` reste `#1D4ED8`
- `livrables/02-ux/design-system.md` — `--color-primaire` reste `#1D4ED8`

**Exception** : le gradient DC-01 `TacticalGradient` peut utiliser `#0037b0` comme
couleur de fin de gradient (usage décoratif uniquement, pas comme couleur primaire
standalone).

---

## §2 — Décisions visuelles par écran

### M-01 — Authentification (US-019)

| Élément | Décision | Action dev |
| ------- | --------- | ---------- |
| Bouton SSO | Option B — couleur plate `Colors.primaire` | Pas de changement si déjà implémenté |
| Card info contextuelle | Adopter | Ajouter bloc `border-l-4 border-primary` avec texte explicatif SSO |
| Logo carré + gradient | Demander validation brand | En attente — utiliser logo standard 80px en attendant |
| Image décorative | Hors MVP | Ne pas implémenter |
| Indicateur offline | Obligatoire | Bandeau "Vous êtes hors ligne" — requis wireframe v2.0, absent chez le designer |

### M-02 — Liste des colis (US-001, US-003, US-029)

| Élément | Décision | Action dev |
| ------- | --------- | ---------- |
| Header fond | Adopter bleu | Fond `Colors.primaire` (#1D4ED8), hauteur 64px |
| Compteur progression | Adopter 30px Black | `text-3xl font-black` pour le nombre |
| Barre progression | Adopter hauteur 16px | Hauteur 16px, couleur plate `Colors.primaire` |
| Badge LIVE | Adopter animé | Pill `animate-pulse`, couleur `Colors.succes` |
| CarteColis adresse | Adopter 20px Bold | `text-xl font-bold` |
| CarteColis contrainte urgente | Option B | Conserver `--color-avertissement-leger` (orange) |
| Footer libellés | Franciser | "Scanner un colis" + "Clôturer la tournée" |
| Footer fond | DC-02 adopter | `GlassEffectFooter` (voir §3) |
| Swipe gauche | Confirmer périmètre | Reste prévu dans US-029 — non présent dans les maquettes designer (interaction) |
| Indicateur offline | Obligatoire | Bandeau orange sous header |

### M-03 — Détail d'un colis (US-002, US-003)

| Élément | Décision | Action dev |
| ------- | --------- | ---------- |
| Bloc destinataire | Card encapsulante | `border-l-4 border-primary rounded-xl p-6` |
| Nom destinataire | Adopter 24px Black | `text-2xl font-black` |
| Adresse | Adopter 18px Medium | `text-lg font-medium` |
| Appartement chip | Adopter | Chip `bg-surface-container-low rounded-lg` |
| Boutons Carte/Appel | Adopter grille | Grille 2 colonnes, hauteur 56px |
| Bouton LIVRER | Option B couleur plate | `Colors.primaire` — pas de gradient |
| Bouton DÉCLARER UN ÉCHEC | Option B | `--color-alerte` (#DC2626) — pas `#ba1a1a` |
| Image contextuelle bâtiment | Hors MVP | Ne pas implémenter |
| Footer | DC-02 adopter | `GlassEffectFooter` |

### M-04 — Capture de la preuve (US-008)

| Élément | Décision | Action dev |
| ------- | --------- | ---------- |
| Rappel contexte colis | DC-04 adopter | `ContextBannerColis` variant neutre (bordure primaire) |
| Sélecteur type preuve non sélectionné | Adopter grayscale | `grayscale` Tailwind / filtre CSS |
| Pad signature | DC-03 adopter | `SignatureGrid` en fond |
| Bouton effacer | Repositionner | En haut à droite du pad (pas sous le pad) |
| Bouton CONFIRMER LA LIVRAISON | **Option B — garder #16A34A** | `Colors.succes` (#16A34A) — lisibilité en extérieur. Pas le vert sombre MD3. |
| MiniProgressBar | DC-07 adopter | Au-dessus du bouton confirmation, progress=0.75 |
| Footer | DC-02 adopter | `GlassEffectFooter` |
| Indicateur offline | Obligatoire | Absent chez le designer — requis wireframe v2.0 |

### M-05 — Déclaration d'un échec (US-005)

| Élément | Décision | Action dev |
| ------- | --------- | ---------- |
| Header | **Adopter rouge intégral** | Fond `--color-alerte-header` (#ba1a1a) — signal contextuel fort. Écart intentionnel vs wireframe v2.0 (qui prescrivait bandeau 4px). |
| Bannière contexte colis | DC-04 adopter | `ContextBannerColis` variant erreur (bordure rouge) |
| Limite note | Étendre à 250 chars | Validation frontend ET backend à mettre à jour |
| Bouton ENREGISTRER L'ÉCHEC | Adopter outline rouge | `border-2 border-error text-error` |
| Footer | DC-02 adopter | `GlassEffectFooter` |

### M-06 — Notification instruction (US-015, US-016)

| Élément | Décision | Action dev |
| ------- | --------- | ---------- |
| Background | Adopter flouté | M-02 en fond, `grayscale opacity-40 backdrop-blur-sm` |
| Label "Action Requise" | Adopter | Ajouter au-dessus du corps instruction |
| CTA "VOIR L'ITINÉRAIRE" | **Adopter** | Nouveau bouton primaire — ouvre la navigation vers l'adresse du colis |
| Countdown | Barre visuelle | Barre de progression verte décroissante (10s) |
| Badge Priorité Haute | DC-05 — hors MVP | Ne pas implémenter |

---

## §3 — Composants DC-01 à DC-07 à créer (US-031)

Voir le détail complet dans :
`/livrables/05-backlog/user-stories/US-031-nouveaux-composants-designer.md`

### Résumé priorisation

| Composant | Priorité | Sprint cible |
| --------- | -------- | ------------ |
| DC-02 `GlassEffectFooter` | **P0** | Même sprint que US-025 |
| DC-04 `ContextBannerColis` | **P0** | Même sprint que US-025 |
| DC-01 `TacticalGradient` | P1 | Sprint US-031 |
| DC-03 `SignatureGrid` | P1 | Sprint US-031 |
| DC-07 `MiniProgressBar` | P1 | Sprint US-031 |
| DC-05 `BadgePrioriteHaute` | P2 — hors MVP | Post-MVP |
| DC-06 `ImageContextuelle` | Hors MVP | Post-MVP |
| DC-08 `CardImageAccueil` | Hors MVP | Post-MVP |

---

## §4 — US à traiter en priorité

### P0 — Bloquant (à traiter en premier)

1. **US-025** — Implémenter le Design System (tokens + composants de base)
   Prérequis absolu de toutes les US suivantes.
   Ajouter DC-02 (`GlassEffectFooter`) et DC-04 (`ContextBannerColis`) dans cette US.

2. **US-031** — Nouveaux composants designer (DC-01, DC-03, DC-07)
   À livrer dans le même sprint ou immédiatement après US-025.

### P1 — Important (sprint suivant)

3. **US-026** — Refactoriser écrans livreur (design v2.0)
   Appliquer toutes les décisions de ce brief sur M-01 à M-05.
   Dépend de US-025 + US-031.

4. **US-008** — Capturer signature numérique
   Repositionner bouton effacer + SignatureGrid + MiniProgressBar + ContextBannerColis.

5. **US-005** — Déclarer échec livraison
   Header rouge + ContextBannerColis + limite note 250 chars (backend inclus).

### P1 — Important (même sprint)

6. **US-016** — Notification push instruction
   Ajouter CTA "VOIR L'ITINÉRAIRE" + background flouté + label "Action Requise".

7. **US-019** — Authentification SSO mobile
   Ajouter card info contextuelle + indicateur offline (obligatoire).

### P2 — Should Have

8. **US-029** — Swipe rapide échec livraison
   Confirmer implémentation swipe dans CarteColis (US-025 prérequis).

---

## §5 — Points d'attention transverses

### Indicateur offline — non implémenté par le designer

Le designer externe n'a pas prévu l'indicateur offline sur M-01, M-02 et M-04.
Cet indicateur est **obligatoire** selon les wireframes v2.0 (BC-06 offline mode).
Le développeur doit l'implémenter sur ces 3 écrans indépendamment des maquettes designer.

### Francisation M-02 footer

Les libellés anglais "Scan Package" et "Finish Tour" des maquettes designer sont à
franciser : "Scanner un colis" et "Clôturer la tournée". Ne pas utiliser les libellés
anglais même en développement.

### Backend — limite note M-05

La note de l'écran M-05 passe de 200 à 250 caractères. La validation doit être mise
à jour côté :

- Frontend React Native : `maxLength={250}`
- Backend svc-tournée : contrainte JPA `@Column(length = 250)` ou validation Bean

### Écran PRD — hors MVP

Le designer a créé un écran d'accueil branding (PRD) avant M-01, non prévu dans les
wireframes v2.0. Décision PO : **hors périmètre MVP**. L'application démarre directement
sur M-01 (authentification SSO).

### Token --color-alerte-header

Le header rouge de M-05 nécessite un nouveau token `--color-alerte-header: #ba1a1a`
dans le design system. À ajouter dans US-025 (tokens CSS + TypeScript).

---

## §6 — Éléments définitivement hors MVP

Les éléments suivants ne doivent pas être implémentés dans le MVP :

- Écran PRD (accueil branding DocuPost)
- DC-06 `ImageContextuelle` (image bâtiment sur M-03 — données non disponibles en prod)
- DC-08 `CardImageAccueil` (image logistique sur PRD)
- DC-05 `BadgePrioriteHaute` (badge M-06 — nice to have)
- Alignement complet palette MD3 (Option A) — reporté en v2

---

*Brief produit par @po — 2026-03-25*
