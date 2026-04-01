# Rapport de delta — Designer externe — 2026-03-25

> Produit par @ux — Session 2026-03-25.
> Auteur : Agent UX DocuPost.
> Objectif : documenter les ecarts entre les maquettes HTML/Tailwind livrées par le designer
> externe (`design_mobile_designer.md`) et les wireframes textuels v2.0 (`wireframes.md`)
> + le design system v1.1 (`design-system.md`).
>
> Ce rapport est destiné au PO et au développeur pour prioriser les ajustements.

---

## Synthese executif

Le designer a produit 7 ecrans HTML complets (PRD + M-01 a M-06) avec Tailwind CSS et
Material Design 3. Les ecrans respectent globalement les wireframes v2.0 sur le fond
fonctionnel. Les ecarts principaux portent sur :

1. **Palette de couleurs** : systeme MD3 distinct de nos tokens semantiques — reconciliation
   requise (voir §1).
2. **Couleur du bouton CONFIRMER LA LIVRAISON** : le designer utilise un vert `from-tertiary-container
   to-tertiary` (#006b2c / #00501f) — different de notre `Colors.succes` (#16A34A).
3. **Header M-05** : fond rouge `bg-error` (#ba1a1a) — different de notre BarreHeaderAlerte
   (bandeau 4px rouge, header fond standard).
4. **Nouveaux patterns visuels** : gradient tactique, glass-effect footer, grille signature,
   image contextuelle sur M-03, badge PRIORITE HAUTE sur M-06.
5. **Footer M-02** : libelle "Scan Package" et "Finish Tour" en anglais — a franciser.
6. **Ecran PRD** : ecran d'accueil supplémentaire non prévu dans les wireframes v2.0.

---

## §1 — Delta palette de couleurs

### Comparaison token primaire

| Token / Role | Wireframes v2.0 (notre DS) | Designer MD3 | Ecart |
|---|---|---|---|
| Couleur primaire | `#1D4ED8` (primaire) | `#0037b0` (primary) | -20 lightness — bleu plus sombre |
| Container primaire | (absent) | `#1d4ed8` (primary-container) | Correspond a notre primaire ! |
| Succes / Confirmation | `#16A34A` (succes) | `from-tertiary-container to-tertiary` : `#006b2c`/`#00501f` | Vert fonce vs vert vif — decalage semantique |
| Erreur | `#DC2626` (alerte) | `#ba1a1a` (error) | Proche mais distinct |
| Fond surface | `#FFFFFF` (surfacePrimary) | `#f7f9fb` (surface / surface-bright) | Blanc pur vs gris tres clair |
| Fond secondaire | `#F8FAFC` (surfaceSecondary) | `#f2f4f6` (surface-container-low) | Tres proches |
| Texte principal | `#0F172A` (textePrimaire) | `#191c1e` (on-surface) | Quasi-identiques |

### Recommandation PO / Dev

**Option A — Aligner sur le designer MD3** : adopter `#0037b0` comme `Colors.primaire`.
Impact : tous les composants utilisant `Colors.primaire` changent de teinte.
User Stories impactées : US-001, US-002, US-003, US-007, US-008.

**Option B — Garder notre palette, adapter les assets HTML** : le développeur implémente
avec nos tokens existants. Les fichiers HTML du designer servent de référence de layout
uniquement, pas de référence couleur.

**Recommandation @ux** : Option B pour le MVP (moindre coût). Documenter l'ecart pour
une décision de design system globale en v2 post-MVP.

---

## §2 — Delta écran par écran

### PRD (ecran accueil — non dans wireframes v2.0)

| Element | Designer | Wireframe v2.0 | Statut |
|---|---|---|---|
| Ecran accueil branding | Présent (logo + hero + CTA) | Absent (pas de wireframe dédié) | NOUVEAU |

**Impact** : le designer a prévu un écran d'accueil avant M-01. Cet écran n'est pas dans
le périmètre MVP des wireframes. A soumettre au PO pour arbitrage : intégrer ou ignorer.
**US suggérée** : "US-PRD : Ecran d'accueil branding DocuPost" (hors MVP probable).

---

### M-01 — Authentification

| Element | Designer | Wireframe v2.0 | Ecart |
|---|---|---|---|
| Logo | Carré 80x80px gradient tactique + icone `description` | "Logo DocuPost hauteur 80px" | Designer : logo carré + gradient. Notre DS : logo standard. A clarifier avec brand. |
| Titre | "Bienvenue sur DocuPost" Inter Black 4xl | Inter SemiBold 24px | Poids de fonte plus fort (Black vs SemiBold). Acceptable. |
| Bouton SSO | gradient tactique (#0037b0 → #1D4ED8), icone `vpn_key` | Plein --color-primaire, hauteur 56px | Gradient vs couleur plate. Nouveau pattern. |
| Card info contextuelle | Bloc bleu border-left-4 avec texte explicatif | Absent dans wireframe | NOUVEAU element. Pertinent UX. |
| Image decorative | Image logistique grayscale + barres visuelles | Absent dans wireframe | NOUVEAU element decoratif. |
| Version | "v 2.0.0 — Docaposte" | Caption 12px | Conforme. |
| Indicateur offline | Absent | Requis (wireframe v2.0) | MANQUE : le designer n'a pas prévu le message "Vous etes hors ligne" |

**US impactées** : US-019 (SSO mobile).

---

### M-02 — Liste des colis de la tournee

| Element | Designer | Wireframe v2.0 | Ecart |
|---|---|---|---|
| Header | `bg-blue-700` (class Tailwind) hauteur h-16 (64px) | fond --color-surface-primary, hauteur 56px | Fond bleu vs fond blanc. Hauteur 64px vs 56px. |
| Titre header | "Tournée du 25/03/2026" Inter SemiBold xl | Titre tournee + date Inter SemiBold 16px | Conforme en substance. |
| Bandeau progression | Card blanche `surface-container-lowest`, rounded-xl, label "Reste à livrer : 42/120", font-black text-3xl | Bandeau fond --color-surface-secondary, label "Reste a livrer X/Y" 18px SemiBold | Police très grande (3xl = 30px) vs 18px. Card arrondie vs bandeau. |
| Badge LIVE | `bg-tertiary-fixed text-on-tertiary-fixed` pill vert clair + animate-pulse | `[●LIVE]` indicateur vert / orange | Designer : pill animé vert clair (tertiary-fixed). Conforme au concept. |
| Barre de progression | `bg-gradient-to-r from-primary to-primary-container` h-4 | Hauteur 8px, couleur dynamique | Designer : gradient + hauteur 16px. Notre DS : 8px + couleur plate. |
| Fin estimée | "Fin estimée : 17h30" + badge LIVE séparés | "Fin estimee : HH:MM · [●LIVE]" en ligne | Disposition légèrement différente. |
| Filtres zone | Onglets scrollables pills, actif `bg-primary` blanc | Onglets scrollables, actif fond --color-primaire | Conforme. Pills au lieu d'onglets carrés. |
| CarteColis — statut | `bg-secondary-container text-on-secondary-container` (bleu lavande) | Badge sémantique (info/succes/alerte/avertissement) | Couleur statut A LIVRER très différente : bleu lavande designer vs bleu info notre DS. |
| CarteColis — LIVRE | `bg-tertiary text-on-tertiary` + opacity-60 | fond --color-succes-leger, opacity 0.7 | Couleur LIVRE : vert MD3 sombre (`#00501f`) vs notre vert clair (#16A34A). Ecart sémantique. |
| CarteColis — bordure gauche | `w-1 bg-primary` 4px left | Pas de bordure gauche dans wireframe (ajouté dans design system v1.1) | Conforme au delta v2.1. |
| Adresse dans card | `text-xl font-bold` (20px Bold) | "Adresse principale — 16px Bold" | 20px vs 16px. Designer agrandit l'adresse. |
| Contrainte urgente | Chip `bg-error-container text-on-error-container` avec icone flag | Chip --color-avertissement-leger | Couleur différente : rouge error vs orange avertissement. |
| Footer actions | "Scan Package" + "Finish Tour" (anglais) | "Scan colis" + "Cloturer la tournee" | Libellés en anglais chez le designer — a franciser. |
| Footer fond | `bg-white/85 backdrop-blur-xl` glass-effect | Fond blanc simple | Nouveau pattern glass-effect. |
| Swipe gauche | Non visible dans le HTML | Décrit dans wireframe v2.0 | Non implémenté par le designer (interaction, pas visuel). |
| Indicateur offline | Non présent dans M-02 designer | Requis : bandeau orange sous header | MANQUE. |

**US impactées** : US-001 (liste colis), US-029 (swipe rapide).

---

### M-03 — Detail d'un colis (dans le fichier designer : ecran entre M-02 et M-04)

> Note : dans le fichier designer, l'ordre HTML est PRD → M-01 → M-02 (progression) →
> M-04 (preuve) → M-03 (detail colis) → M-05 (echec). L'ecran M-03 du designer
> correspond bien au detail colis mais est positionné après M-04 dans le fichier.

| Element | Designer | Wireframe v2.0 | Ecart |
|---|---|---|---|
| Header | `bg-blue-700` + badge statut dans le header | Header + badge statut à droite | Conforme en substance. Fond bleu même que M-02. |
| Barre de progression | `h-1.5 bg-surface-container` pleine largeur sous header | Absent dans wireframe M-03 | NOUVEAU element : mini barre de progression positionnelle. |
| Section Destinataire | Card `border-l-4 border-primary` p-6 rounded-xl | Section sans card encapsulante | Designer encapsule dans une card Material avec bordure gauche primaire. |
| Nom destinataire | `text-2xl font-black` (24px Black) | Inter SemiBold 20px | 24px Black vs 20px SemiBold. Plus bold. |
| Adresse | `text-lg font-medium` (18px Medium) | Inter Regular 16px | 18px Medium vs 16px Regular. Plus grand. |
| Apartement | Chip `bg-surface-container-low px-3 py-1.5 rounded-lg` | Inline dans l'adresse | Designer met l'appartement dans un chip dédié. Plus lisible. |
| Boutons Carte / Appel | Grille 2 colonnes, fond `surface-container-highest`, h-14 | 2 CTAs inline, boutons tertiaires (lien stylisé) | Designer : boutons carrés en grille. Notre DS : liens stylisés. Meilleure affordance designer. |
| Chips contraintes | `bg-error-container text-on-error-container` pills rondes | Chips --color-avertissement-leger icone ⚑ | Couleur : rouge error vs orange avertissement. Designer semble utiliser error pour les contraintes horaires urgentes. |
| Image contextuelle batiment | Image photo du batiment grayscale + overlay gradient | Absent dans wireframe | NOUVEAU element de contextualisation visuelle. Peut ne pas etre disponible en production. |
| Section Historique | Card avec icone `block` (rouge) + tentative 1 | Items liste avec séparateur | Designer encapsule chaque tentative dans une micro-card. |
| Bouton LIVRER CE COLIS | `bg-gradient-to-br from-primary to-primary-container` h-[56px] | Plein --color-primaire 56px | Gradient bleu vs couleur plate. |
| Bouton DECLARER UN ECHEC | `border-2 border-error text-error` h-[56px] | Outline --color-alerte | `error: #ba1a1a` vs `--color-alerte: #DC2626`. Proches mais distincts. |
| Footer fond | `bg-white/85 backdrop-blur-xl` glass-effect | Fond blanc | Nouveau pattern glass-effect. |

**US impactées** : US-002 (detail colis), US-003 (livraison), US-008 (capture signature).

---

### M-04 — Capture de la preuve de livraison

| Element | Designer | Wireframe v2.0 | Ecart |
|---|---|---|---|
| Header | `bg-primary-container` (#1D4ED8) fond bleu primaire container | Header standard | Designer : fond bleu sur le header de M-04 (différent de M-02/M-03 qui utilisent blue-700). |
| Rappel contexte colis | Card `border-l-4 border-primary` arrondie avec label et colis ID | Bandeau fond --color-surface-secondary 48px | Designer : card plus visuelle avec icone package_2. Notre DS : bandeau simple. |
| Label rappel | "COLIS EN COURS" uppercase + nom et ID | "Colis #XXXXX — Nom du destinataire" | Libellé différent mais conforme à l'esprit. |
| Selecteur type preuve | Grille 2x2, card selectionnee `border-2 border-primary ring-4` | Grille 2x2, card selectionnee fond --color-primaire-leger + bordure 2px | Conforme. Designer ajoute ring-4 (halo). |
| Icones type preuve | `draw` (signature), `photo_camera`, `group`, `door_front` | Non spécifié (icones génériques) | Icones MD3 explicites — bonne précision. |
| Card non selectionnee | `grayscale hover:grayscale-0` | Fond blanc, bordure --color-bordure-neutre | Designer : grayscale effect au lieu de simple bordure neutre. Différent. |
| Pad signature | Fond blanc, grille pointillée `.signature-grid`, ligne de base | Pad HTML Canvas, fond blanc, ligne base pointillée | Conforme. Designer ajoute grille de points en background. |
| Bouton effacer signature | En haut a droite du pad, `bg-surface-container-high` | Sous le pad "Effacer la signature" | Position différente : en-tête vs sous le pad. |
| Bouton CONFIRMER LA LIVRAISON | `bg-gradient-to-br from-tertiary-container to-tertiary` VERT FONCE | --color-succes (#16A34A) | ECART IMPORTANT : vert sombre MD3 (#006b2c) vs notre vert vif (#16A34A). |
| Barre de progression mini | `bg-primary w-[75%] h-1` au-dessus du bouton confirmation | Absent dans wireframe | NOUVEAU element de progression de formulaire. |
| Footer fond | `bg-white/85 backdrop-blur-xl` glass-effect | Fond blanc simple | Nouveau pattern glass-effect. |
| Caption geolocalisation | Footer `bg-surface-container-low` avec icone location_on | Caption simple sous le bouton | Designer : card dédiée en bas de page. Notre DS : caption inline. |
| Badge LIVE / OFFLINE | Absent | Requis dans wireframe (indicateur offline) | MANQUE. |

**US impactées** : US-008 (capture de signature / preuve).

---

### M-05 — Declaration d'un echec de livraison

| Element | Designer | Wireframe v2.0 | Ecart |
|---|---|---|---|
| Header | `bg-error text-on-error` (#ba1a1a rouge) | Header standard + BarreHeaderAlerte (4px rouge) | ECART MAJEUR : designer colore tout le header en rouge. Notre DS : header standard + bandeau 4px. |
| Rappel contexte | `bg-error-container text-on-error-container border-l-4 border-error` | Non spécifié dans wireframe M-05 | NOUVEAU element conforme à M-04 pattern. |
| Section MOTIF | Radio buttons comme dans wireframe | Radio buttons | Conforme. |
| Motifs disponibles | Absent, Accès impossible, Refus du client, Horaires dépassés | Absent, Accès impossible, Refus du client, Horaires dépassés | Identique. |
| Motif selectionné | `border-2 border-primary ring-2 ring-primary/10` | Cards cliquables (wireframe v2.0) | Conforme au pattern card-radio. |
| Section DISPOSITION | Radios A représenter / Dépôt chez tiers / Retour au dépôt | Dispositions (wireframe) | Conforme. |
| Section NOTE | Textarea 250 char max, compteur en haut droite | Champ texte libre 200 char (wireframe M-05) | 250 vs 200 char : designer a élargi la limite. |
| Bouton action | "ENREGISTRER L'ECHEC" `border-2 border-error text-error` outline | Non spécifié précisément | Designer : bouton outline rouge, pas plein. |
| Footer fond | `bg-white/85 backdrop-blur-xl` glass-effect | Fond blanc simple | Nouveau pattern glass-effect. |

**US impactées** : US-005 (déclaration échec).

---

### M-06 — Notification d'instruction recue

| Element | Designer | Wireframe v2.0 | Ecart |
|---|---|---|---|
| Background flou | M-02 en arrière-plan, grayscale opacity-40 + blur | "Overlay bleu foncé" dans wireframe | Designer : background = M-02 flouté. Notre DS : overlay couleur unie. |
| Card overlay | `bg-on-primary-fixed-variant` + border-white/10 | Overlay fond --color-info-fonce (#1E3A8A) | Couleurs différentes mais dans le même registre bleu sombre. |
| Badge Priorité | "Priorité Haute" `text-tertiary-fixed` 10px | Absent dans wireframe v2.0 | NOUVEAU element de priorisation. |
| Titre instruction | "INSTRUCTION SUPERVISEUR" extrabold | "Instruction superviseur" | Conforme en substance, poids plus fort. |
| Corps instruction | Label "Action Requise" + texte instruction gros + adresse | Titre + texte instruction + bouton OK | Conforme. Designer ajoute label "Action Requise". |
| Bouton primaire | "VOIR L'ITINÉRAIRE" + flèche droite | Absent dans wireframe (seulement OK) | NOUVEAU CTA primaire. Notre wireframe n'a que "OK". Pertinent fonctionnellement. |
| Bouton secondaire | "OK" avec icone check | "OK" | Conforme. |
| Countdown | Barre de progression verte au bas de la card | "Compte à rebours 10s" (design-brief) | Designer : barre visuelle (pas de chiffre). Notre brief : 10s countdown. |
| Backdrop | `bg-on-surface/40 backdrop-blur-sm` | Non spécifié précisément | Nouveau detail : opacity 40% + blur sur le fond. |

**US impactées** : US-015/US-016 (instruction superviseur + notification livreur).

---

## §3 — Nouveaux composants identifies par le designer

Ces composants n'existent pas dans le design system v1.1 et nécessitent une définition.

| ID | Nom | Description | Ecrans | Priorité |
|---|---|---|---|---|
| DC-01 | TacticalGradient | Dégradé `#0037b0 → #1D4ED8` 135deg — utilisé pour logo, boutons primaires, bandeau M-06 | M-01, M-02, M-03, M-06 | HAUTE — pattern identitaire |
| DC-02 | GlassEffectFooter | Footer fixe `bg-white/85 backdrop-blur-xl shadow-[0_-4px_20px...]` | M-02, M-03, M-04, M-05 | HAUTE — 4 écrans |
| DC-03 | SignatureGrid | Background CSS `radial-gradient` points 20x20px sur pad signature | M-04 | MOYENNE — detail esthétique |
| DC-04 | ContextBannerColis | Card border-left-4 + icone package_2 + label "COLIS EN COURS" | M-04, M-05 | HAUTE — pattern répété |
| DC-05 | BadgePrioriteHaute | Label 10px black uppercase "Priorité Haute" en tertiary-fixed | M-06 | MOYENNE |
| DC-06 | ImageContextuelle | Zone image batiment/lieu grayscale avec overlay gradient | M-03 | BASSE — dépend de data |
| DC-07 | MiniProgressBar | Barre h-1 ou h-1.5 pleine largeur indiquant avancement formulaire | M-04 | MOYENNE |
| DC-08 | CardImageAccueil | Zone image logistique grayscale + barres visuelles PRD | PRD | BASSE — hors MVP probable |

---

## §4 — Ecarts qui impactent des User Stories existantes

| User Story | Ecran | Nature de l'impact | Action requise |
|---|---|---|---|
| US-001 (Liste colis) | M-02 | Header fond bleu (vs blanc), carteColis couleurs différentes, footer libellés anglais | Décision couleur header + francisation footer |
| US-002 (Detail colis) | M-03 | Appartement en chip, image contextuelle, boutons grille | Implémenter chip appartement (petit effort). Image : hors MVP. |
| US-003 (Livrer un colis) | M-03 | Bouton LIVRER gradient (vs couleur plate) | Choisir gradient ou couleur plate |
| US-005 (Déclarer échec) | M-05 | Header tout rouge vs bandeau 4px + limite note 250 vs 200 chars | Choix header echec + ajuster limite backend |
| US-008 (Capture signature) | M-04 | Bouton CONFIRMER couleur vert sombre vs #16A34A, card contexte, grille signature | Harmoniser couleur confirmation |
| US-015/016 (Instruction) | M-06 | CTA "VOIR L'ITINÉRAIRE" nouveau, background flouté | Implémenter CTA navigation carte (pertinent) |
| US-019 (SSO mobile) | M-01 | Bouton gradient vs couleur plate, card info contextuelle | Choisir gradient ou plat |
| US-029 (Swipe rapide) | M-02 | Swipe absent du HTML designer | Confirmer au développeur que swipe reste prévu |

---

## §5 — Tokens modifiés qui nécessitent une mise à jour du code existant

Si la décision est d'aligner sur le designer (Option A §1), les fichiers suivants
sont à mettre à jour :

| Fichier | Token | Valeur actuelle | Valeur designer |
|---|---|---|---|
| `src/mobile/src/theme/colors.ts` | `Colors.primaire` | `#1D4ED8` | `#0037b0` |
| `src/mobile/src/theme/colors.ts` | `Colors.succes` (bouton confirmation M-04) | `#16A34A` | `#006b2c` (tertiary-container) |
| `src/mobile/src/theme/colors.ts` | `Colors.alerte` (header M-05) | fond standard | `#ba1a1a` (error) — si header rouge adopté |
| `livrables/02-ux/design-system.md` | `--color-primaire` | `#1D4ED8` | `#0037b0` |

---

## §6 — Recommandations priorisées pour le PO

### Décisions bloquantes (a trancher avant dev)

1. **Couleur primaire** : `#1D4ED8` (notre DS) ou `#0037b0` (designer MD3) ?
   Recommandation : `#0037b0` car plus accessible (meilleur contraste WCAG) et cohérent MD3.

2. **Header M-05 Echec** : header tout rouge (`bg-error`) ou header standard +
   BarreHeaderAlerte 4px ?
   Recommandation : header tout rouge (designer) — signal contextuel plus fort, décision
   designer externe intentionnelle.

3. **Bouton CONFIRMER LA LIVRAISON** : vert vif `#16A34A` ou vert sombre MD3 (`#006b2c`) ?
   Recommandation : garder `#16A34A` pour la lisibilité en extérieur (contraste soleil).

### Améliorations a intégrer sans discussion

- GlassEffectFooter sur les 4 écrans (détail esthétique, pas de coût fonctionnel).
- ContextBannerColis sur M-04 et M-05 (améliore la cohérence contextuelle).
- Chip pour l'appartement sur M-03 (meilleure lisibilité).
- CTA "VOIR L'ITINÉRAIRE" sur M-06 (fonctionnel et pertinent).
- Franciser footer M-02 : "Scanner un colis" / "Clôturer la tournée".

### Elements a laisser hors MVP

- Image contextuelle batiment M-03 (dépend de données non disponibles).
- Ecran PRD/accueil branding (pas de valeur fonctionnelle MVP).
- Badge Priorité Haute M-06 (nice to have).

---

## §7 — Glossaire des nouveaux termes terrain

| Terme designer | Terme wireframe v2.0 | Statut |
|---|---|---|
| "Scan Package" | "Scanner un colis" | Francisation requise |
| "Finish Tour" | "Clôturer la tournée" | Francisation requise |
| "Méthode de validation" | "Type de preuve" | Synonyme — à uniformiser |
| "Action Requise" | (absent) | Nouveau terme domaine sur M-06 |
| "Identité Colis" | (absent, implicite) | Nouveau label sur M-05 context banner |
| "Priorité Haute" | (absent) | Nouveau concept sur M-06 — à valider avec PO |

---

*Rapport produit par @ux — 2026-03-25 — Version 1.0*
