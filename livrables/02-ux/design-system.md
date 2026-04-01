# Design System — DocuPost

> Version 1.2 — 2026-03-25
> Produit par @ux dans le cadre du redesign UI DocuPost v2.0.
> Ce design system est directement exploitable par les developpeurs React et React Native.
> Il regroupe les tokens semantiques, la typographie, les composants cles et les grilles.
>
> References : wireframes.md v2.1, personas.md, user-journeys.md.
> Exploitable avec : CSS custom properties (web), StyleSheet React Native (mobile).
>
> v1.2 — 2026-03-25 : Integration retour designer externe. Section §13 Material Design 3
> (tokens MD3, ecarts documentes, nouveaux composants DC-01 a DC-07).
> Rapport de delta complet : /livrables/02-ux/delta-designer-2026-03-25.md.

---

## 1. Palette de couleurs — Tokens semantiques

### Principe

Les couleurs sont definies en tokens semantiques, pas en valeurs brutes.
Le developpeur utilise `--color-succes` et non `#22C55E`.
Cela permet de changer le theme sans toucher aux composants.

### Tokens CSS (web)

```css
:root {
  /* Couleurs primaires — actions, navigation */
  --color-primaire:            #1D4ED8;  /* Bleu DocuPost — boutons CTA, liens actifs */
  --color-primaire-hover:      #1E40AF;  /* Survol bouton primaire */
  --color-primaire-leger:      #EFF6FF;  /* Fond selection/hover discret */

  /* Statuts metier — colis, tournee */
  --color-succes:              #16A34A;  /* LIVRE, CLOTURE, AFFECTE */
  --color-succes-leger:        #F0FDF4;  /* Fond card livree */
  --color-succes-fonce:        #14532D;  /* Texte sur fond succes leger */

  --color-alerte:              #DC2626;  /* ECHEC, NON AFFECTE, A RISQUE */
  --color-alerte-leger:        #FEF2F2;  /* Fond card echec */
  --color-alerte-fonce:        #7F1D1D;  /* Texte sur fond alerte leger */

  --color-avertissement:       #D97706;  /* A REPRESENTER, anomalie charge */
  --color-avertissement-leger: #FFFBEB;  /* Fond card avertissement */
  --color-avertissement-fonce: #78350F;  /* Texte sur fond avertissement */

  --color-info:                #2563EB;  /* A LIVRER, EN COURS, neutre */
  --color-info-leger:          #EFF6FF;  /* Fond card a livrer */
  --color-info-fonce:          #1E3A8A;  /* Fond bandeau instruction superviseur */

  /* Surfaces et fonds */
  --color-surface-primary:     #FFFFFF;  /* Fond principal — cartes, header */
  --color-surface-secondary:   #F8FAFC;  /* Fond secondaire — lignes tableau alternees */
  --color-fond-neutre:         #F1F5F9;  /* Bandeau plan du jour (normal) */
  --color-fond-alerte:         #FEF3C7;  /* Bandeau plan du jour (anomalie) */

  /* Texte */
  --color-texte-primaire:      #0F172A;  /* Corps de texte principal */
  --color-texte-secondaire:    #475569;  /* Labels secondaires, sous-titres */
  --color-texte-tertiaire:     #94A3B8;  /* Placeholders, captions, metadata */
  --color-texte-inverse:       #FFFFFF;  /* Texte sur fond colore */

  /* Bordures */
  --color-bordure-neutre:      #E2E8F0;  /* Bordures cartes, inputs par defaut */
  --color-bordure-focus:       #2563EB;  /* Bordure input au focus */
  --color-bordure-erreur:      #DC2626;  /* Bordure input invalide */

  /* Progression */
  --color-progres-encours:     #3B82F6;  /* Barre progression tournee en cours */
  --color-progres-risque:      #F59E0B;  /* Barre progression tournee a risque */
  --color-progres-done:        #16A34A;  /* Barre progression terminee */

  /* Liens */
  --color-lien:                #2563EB;
  --color-lien-visite:         #7C3AED;
}
```

### Tokens React Native (mobile)

```typescript
// src/mobile/theme/colors.ts
export const Colors = {
  // Primaire
  primaire:            '#1D4ED8',
  primaireHover:       '#1E40AF',
  primaireLeger:       '#EFF6FF',

  // Statuts metier
  succes:              '#16A34A',
  succesLeger:         '#F0FDF4',
  succesFonce:         '#14532D',

  alerte:              '#DC2626',
  alerteLeger:         '#FEF2F2',
  alerteFonce:         '#7F1D1D',

  avertissement:       '#D97706',
  avertissementLeger:  '#FFFBEB',
  avertissementFonce:  '#78350F',

  info:                '#2563EB',
  infoLeger:           '#EFF6FF',
  infoFonce:           '#1E3A8A',

  // Surfaces
  surfacePrimary:      '#FFFFFF',
  surfaceSecondary:    '#F8FAFC',
  fondNeutre:          '#F1F5F9',
  fondAlerte:          '#FEF3C7',

  // Texte
  textePrimaire:       '#0F172A',
  texteSecondaire:     '#475569',
  texteTertiaire:      '#94A3B8',
  texteInverse:        '#FFFFFF',

  // Bordures
  bordureNeutre:       '#E2E8F0',
  bordurefocus:        '#2563EB',
  bordureErreur:       '#DC2626',

  // Progression
  progresEncours:      '#3B82F6',
  progresRisque:       '#F59E0B',
  progresDone:         '#16A34A',
} as const;
```

### Tableau semantique des statuts *colis* et *tournee*

| Statut domaine      | Token couleur          | Usage                          |
|---------------------|------------------------|--------------------------------|
| A LIVRER            | --color-info           | Badge statut, filtre           |
| LIVRE               | --color-succes         | Badge, barre progression       |
| ECHEC               | --color-alerte         | Badge, fond card               |
| A REPRESENTER       | --color-avertissement  | Badge, chip                    |
| EN COURS            | --color-progres-encours| Barre progression, badge       |
| A RISQUE            | --color-alerte         | Badge, fond ligne tableau      |
| AFFECTEE            | --color-succes         | Badge W-04, chip               |
| NON AFFECTEE        | --color-alerte         | Badge W-04, chip               |
| LANCEE              | --color-info           | Badge W-04, chip               |
| CLOTUREE            | --color-succes         | Badge W-01, barre 100 %        |
| HORS LIGNE (livreur)| --color-avertissement  | Indicateur W-01/W-02           |

---

## 2. Typographie

### Principes

- Famille principale : **Inter** (corps, UI) — Google Fonts, open source.
- Famille titre : **Work Sans** (titres H1 web uniquement) — Google Fonts.
- Taille minimum corps mobile : 16px (lisibilite soleil, gants).
- Taille minimum caption : 12px (metadata, compteurs).

### Echelle typographique — Web (1280px)

| Token          | Famille    | Taille | Poids      | Hauteur ligne | Usage                          |
|----------------|-----------|--------|------------|---------------|--------------------------------|
| --text-h1      | Work Sans  | 28px   | SemiBold   | 1.3           | Titres de page (/preparation)  |
| --text-h2      | Work Sans  | 22px   | SemiBold   | 1.35          | Titres de section              |
| --text-h3      | Inter      | 18px   | SemiBold   | 1.4           | Sous-sections, titres onglets  |
| --text-body-lg | Inter      | 16px   | Regular    | 1.6           | Corps de texte principal       |
| --text-body-sm | Inter      | 14px   | Regular    | 1.5           | Labels secondaires, tableaux   |
| --text-label   | Inter      | 12px   | SemiBold   | 1.4           | Labels de section (uppercase)  |
| --text-caption | Inter      | 12px   | Regular    | 1.3           | Metadata, compteurs, timestamps|
| --text-button  | Inter      | 14px   | SemiBold   | 1.0           | Boutons CTA                    |
| --text-badge   | Inter      | 12px   | SemiBold   | 1.0           | Badges statut                  |

### Echelle typographique — Mobile (375px)

| Token              | Famille | Taille | Poids    | Usage                           |
|--------------------|---------|--------|----------|---------------------------------|
| --text-m-h1        | Inter   | 24px   | SemiBold | Titre ecran auth (M-01)         |
| --text-m-h2        | Inter   | 20px   | SemiBold | Nom destinataire (M-03)         |
| --text-m-h3        | Inter   | 18px   | SemiBold | Compteur reste a livrer (M-02)  |
| --text-m-body      | Inter   | 16px   | Regular  | Adresses, corps principal       |
| --text-m-label     | Inter   | 14px   | Regular  | Destinataire, metadata          |
| --text-m-caption   | Inter   | 12px   | Regular  | Timestamps, compteurs           |
| --text-m-badge     | Inter   | 12px   | SemiBold | Badges statut, chips contrainte |
| --text-m-button    | Inter   | 16px   | SemiBold | Boutons CTA mobile (LIVRER etc.)|
| --text-m-section   | Inter   | 12px   | SemiBold | Labels section uppercase        |

---

## 3. Composants reutilisables

### 3.1 Badge statut

**Utilisation** : W-04, W-01, M-02, M-03, W-02.
**Description** : Etiquette coloree indiquant le statut d'un *colis* ou d'une *tournee*.

```
Structure :
[● Icone] [Libelle statut]

Proprietes :
- variant: 'succes' | 'alerte' | 'avertissement' | 'info' | 'neutre'
- size: 'sm' | 'md'
- icon: boolean (affichage du point colore)

Rendu visuel :
┌──────────────┐
│ ● A LIVRER   │   fond --color-info-leger, texte --color-info, bords 4px
└──────────────┘
Hauteur sm : 20px, padding 4px 8px
Hauteur md : 24px, padding 4px 10px
```

**Props React** :
```typescript
interface BadgeStatutProps {
  variant: 'succes' | 'alerte' | 'avertissement' | 'info' | 'neutre';
  label: string;          // Ex : "A LIVRER", "AFFECTEE"
  size?: 'sm' | 'md';
  pulse?: boolean;        // Animation clignotante pour "A RISQUE"
}
```

---

### 3.2 Carte colis (mobile)

**Utilisation** : M-02 (liste des *colis*).
**Description** : Card cliquable representant un *colis* dans la liste de la *tournee*.

```
Structure :
┌─────────────────────────────────────┐
│ [BadgeStatut]       [ChipContrainte]│  Ligne 1
│ Adresse principale                  │  Ligne 2 — texte gras
│ Destinataire — appartement          │  Ligne 3 — texte secondaire
└─────────────────────────────────────┘

Proprietes :
- statut: StatutColis
- adresse: string
- destinataire: string
- appartement?: string
- contrainte?: ContrainteType[]
- onPress: () => void
```

**Props React Native** :
```typescript
interface CarteColis {
  colisId: string;
  statut: 'A_LIVRER' | 'LIVRE' | 'ECHEC' | 'A_REPRESENTER';
  adresse: string;
  destinataire: string;
  appartement?: string;
  contraintes?: ('AVANT_10H' | 'AVANT_12H' | 'AVANT_14H' | 'FRAGILE' | 'DOCUMENT_SENSIBLE')[];
  horodatage?: string;   // Affiche si statut = LIVRE ou ECHEC
  motif?: string;        // Affiche si statut = ECHEC
  onPress: () => void;
}

Styles :
- fond: Colors.surfacePrimary
- bords: 12px
- ombre: shadowCardSm
- hauteur minimum: 72px (touch target)
- padding: 12px 16px
- colis LIVRE: opacity 0.7
- colis ECHEC: bordure gauche 3px Colors.alerte
```

---

### 3.3 Bandeau de progression

**Utilisation** : M-02 (bandeau mobile), W-01 colonne avancement, W-02 bandeau.
**Description** : Indicateur visuel de l'*avancement de tournee*.

```
Structure :
┌─────────────────────────────────────┐
│ Reste a livrer : X / Y              │  Label
│ ████████░░░░  63 %                  │  Barre de progression
│ Fin estimee : HH:MM  [●LIVE]        │  Meta + indicateur sync
└─────────────────────────────────────┘
```

**Props React/React Native** :
```typescript
interface BandeauProgression {
  resteLivrer: number;
  total: number;
  pourcentage: number;        // 0-100
  finEstimee?: string;        // Format "HH:MM"
  statut: 'encours' | 'arisque' | 'cloturee';
  syncStatus: 'live' | 'offline' | 'polling';
}

Regles visuelles barre :
- statut 'encours' : --color-progres-encours
- statut 'arisque' : --color-progres-risque
- statut 'cloturee' : --color-progres-done
- Hauteur barre web : 8px  |  mobile : 6px
- Bords arrondis : 4px full
```

---

### 3.4 Bouton CTA

**Utilisation** : tous les ecrans.
**Description** : Bouton d'action principal et secondaire.

```
Variantes :
[LIVRER CE COLIS →]     primaire — fond --color-primaire, texte blanc
[DECLARER UN ECHEC]     secondaire — bordure --color-alerte, texte --color-alerte
[Voir detail]           tertiaire — texte --color-lien, pas de fond ni bordure
[Affecter]              outline — bordure --color-primaire, texte --color-primaire

Tailles :
- Mobile : hauteur 56px, bords 12px, texte --text-m-button
- Web    : hauteur 40px, bords 8px,  texte --text-button
- Large  : hauteur 48px, bords 10px (W-05 actions)

Etat desactive : opacity 0.4, cursor not-allowed
Etat loading : spinner 16px remplace le label, desactive
```

**Props React** :
```typescript
interface BoutonCTA {
  variant: 'primaire' | 'secondaire' | 'tertiaire' | 'outline' | 'danger';
  size: 'sm' | 'md' | 'lg';
  label: string;
  icon?: ReactNode;       // Icone optionnelle (gauche ou droite)
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}
```

---

### 3.5 Chip de contrainte

**Utilisation** : M-02 (items liste), M-03 (section contraintes).
**Description** : Etiquette compacte pour les *contraintes* d'un *colis*.

```
Structure :
┌──────────────┐
│ ⚑ Avant 14h  │   fond --color-avertissement-leger, texte --color-avertissement
└──────────────┘
ou
┌────────────┐
│ ⚑ Fragile  │
└────────────┘

Proprietes :
- type: 'horaire' | 'fragile' | 'document_sensible'
- valeur?: string  // ex : "14h00" pour le type horaire
```

---

### 3.6 Indicateur de synchronisation

**Utilisation** : M-02 bandeau (mobile), W-01 / W-02 (web).
**Description** : Indique l'etat de connexion et de synchronisation.

```
Etats :
[● LIVE]        point vert anime — WebSocket actif
[● POLLING]     point orange — fallback polling 30s
[● OFFLINE]     point rouge — hors connexion
[↻ SYNC]        icone rotation — synchronisation en cours

Rendu :
- Point : cercle 8px, animation pulse si LIVE
- Label : --text-caption, --color-texte-secondaire
- Taille totale : 24px de hauteur (chip compact)
```

---

### 3.7 Bandeau notification instruction (M-06)

**Utilisation** : M-06 overlay.
**Description** : Overlay en haut de l'ecran pour les *instructions* superviseur.

```
Structure :
┌────────────────────────────────────────┐
│ [Icone] INSTRUCTION SUPERVISEUR        │  Fond --color-info-fonce, texte blanc
│  Prioriser le colis #00312             │  Texte instruction
│  25 Rue Victor Hugo                    │
│              [VOIR →]    [OK ✓]        │  2 boutons
│ ████████████████░░░  (countdown 10s)  │  Barre de decompte
└────────────────────────────────────────┘

Animations :
- Entree : slide-down depuis le haut, 300ms ease-out
- Sortie : slide-up, 200ms ease-in
- Barre countdown : diminution lineaire sur 10s
```

---

## 4. Grille et espacement

### Web (1280px)

```
Grille : 12 colonnes
Gouttiere : 24px
Marge laterale : 32px (ecrans larges), 16px (tablettes)
Largeur contenu max : 1216px

Espacements standards (multiples de 4px) :
--space-1 :  4px   (micro — icones, chips internes)
--space-2 :  8px   (compact — separateurs, padding interne badge)
--space-3 : 12px   (normal — padding card interne)
--space-4 : 16px   (standard — espacement entre composants)
--space-5 : 20px
--space-6 : 24px   (gouttiere — espacement sections)
--space-8 : 32px   (large — padding page)
--space-12: 48px   (xlarge — espacement ecrans)
```

### Mobile (375px)

```
Grille : 4 colonnes
Gouttiere : 12px
Marge laterale : 16px
Safe area haut : variable (notch iOS / Android)
Safe area bas : variable (home indicator)

Header fixe : 56px
Footer fixe : 72px + safe area bas
Bandeau progression (M-02) : 80px

Espacements standards :
--space-m-1 :  4px
--space-m-2 :  8px
--space-m-3 : 12px   (padding interne card)
--space-m-4 : 16px   (marge laterale page)
--space-m-5 : 20px
--space-m-6 : 24px   (espacement entre sections)
```

---

## 5. Ombres (shadows)

```css
:root {
  --shadow-card-sm:    0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-card-md:    0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-modal:      0 20px 60px rgba(0,0,0,0.15);
  --shadow-overlay:    0 8px 24px rgba(0,0,0,0.20);
  --shadow-header:     0 1px 3px rgba(0,0,0,0.10);
  --shadow-dropdown:   0 4px 16px rgba(0,0,0,0.12);
}
```

React Native :
```typescript
export const Shadows = {
  cardSm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardMd: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  overlay: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 12,
    elevation: 8,
  },
};
```

---

## 6. Etats interactifs

### Boutons

| Etat     | Visuel                                           |
|----------|--------------------------------------------------|
| Default  | Fond + texte selon variant                       |
| Hover    | Fond assombri -10% (web uniquement)             |
| Focus    | Outline 2px --color-bordure-focus, offset 2px   |
| Active   | Fond assombri -20% + legende translateY(1px)    |
| Disabled | Opacity 0.4, cursor not-allowed, pas d'evenement|
| Loading  | Spinner 16px, label masque, desactive           |

### Inputs (formulaires)

| Etat     | Visuel                                               |
|----------|------------------------------------------------------|
| Default  | Bordure 1px --color-bordure-neutre                   |
| Focus    | Bordure 2px --color-bordure-focus, ombre focus legere|
| Filled   | Fond --color-surface-secondary                       |
| Error    | Bordure 2px --color-bordure-erreur + message dessous |
| Disabled | Fond --color-surface-secondary, opacity 0.5          |

### Cards (mobile)

| Etat      | Visuel                                       |
|-----------|----------------------------------------------|
| Default   | Fond blanc, ombre --shadow-card-sm           |
| Pressed   | Scale(0.98), ombre reduite, fond #F8FAFC     |
| Swipe     | Translation + reveal action arriere-plan     |

### Selecteurs de type (W-03, M-04)

| Etat        | Visuel                                              |
|-------------|-----------------------------------------------------|
| Default     | Fond blanc, bordure --color-bordure-neutre 1px      |
| Selected    | Fond --color-primaire-leger, bordure --color-primaire 2px |
| Hover (web) | Fond --color-surface-secondary                      |

---

## 7. Animations et transitions

```css
/* Transitions standards */
--transition-fast:   150ms ease-in-out;   /* Hover, focus */
--transition-normal: 250ms ease-in-out;   /* Apparitions, disparitions */
--transition-slow:   400ms ease-in-out;   /* Modaux, overlays */

/* Animations specifiques */
.pulse-live {
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.slide-down {
  animation: slideDown 300ms ease-out;
}
@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.fade-update {
  animation: fadeUpdate 600ms ease-in-out;
}
@keyframes fadeUpdate {
  0%   { background-color: #DBEAFE; }  /* Bleu leger pour signaler la mise a jour */
  100% { background-color: transparent; }
}
```

---

## 8. Icones

- Librairie recommandee : **Lucide React** (web) et **@lucide/react-native** (mobile).
- Taille standard : 20px (inline boutons), 24px (navigation), 16px (badges).

| Usage                        | Icone Lucide          |
|------------------------------|-----------------------|
| Menu                         | `Menu`                |
| Retour                       | `ChevronLeft`         |
| Alerte / anomalie            | `AlertTriangle`       |
| Succes / valide              | `CheckCircle`         |
| Echec                        | `XCircle`             |
| Contrainte horaire           | `Clock`               |
| Fragile                      | `Package`             |
| Document sensible            | `FileText`            |
| Instruction superviseur      | `Bell`                |
| Localisation                 | `MapPin`              |
| Appel                        | `Phone`               |
| Scanner code-barre           | `Scan`                |
| Synchronisation              | `RefreshCw`           |
| Connexion perdue             | `WifiOff`             |
| Signature                    | `PenLine`             |
| Photo                        | `Camera`              |
| Depot tiers                  | `Users`               |
| Depot securise               | `Lock`                |
| Lancer tournee               | `Play`                |
| Cloturer tournee             | `CheckSquare`         |
| Envoyer instruction          | `Send`                |

---

## 9. Bords arrondis (border-radius)

```css
:root {
  --radius-sm:   4px;   /* Badges, chips */
  --radius-md:   8px;   /* Boutons web, inputs */
  --radius-lg:  12px;   /* Cards mobile, boutons mobile */
  --radius-xl:  16px;   /* Modaux, overlays */
  --radius-full: 9999px; /* Pills, points status */
}
```

---

## 10. Accessibilite — regles minimum

- Ratio de contraste texte/fond : minimum 4.5:1 (WCAG AA).
- Touch target mobile : minimum 48x48px pour tout element interactif.
- Labels ARIA obligatoires sur les icones seules et les boutons sans texte visible.
- Focus visible : outline 2px en web, toujours visible (ne pas supprimer l'outline par defaut).
- Messages d'erreur : texte, pas uniquement couleur (icone + texte).
- Etats loading : aria-busy, spinner avec aria-label "Chargement en cours".

---

## 11. Responsivite (web)

| Breakpoint    | Largeur   | Adaptation                                       |
|---------------|-----------|--------------------------------------------------|
| Desktop       | >= 1280px | Layout complet 12 colonnes, tableaux denses      |
| Tablette      | 768-1279px| Colonnes reduites, actions condensees, pagination|
| Mobile web    | < 768px   | Non prioritaire (usage prevu sur app native)     |

---

## 12. Apports Stitch — delta v1.1

> Section ajoutee le 2026-03-25 apres analyse du projet Stitch (ID : 8827380679149044714).
> Ces precisions completent le design system v1.0 sans modifier les decisions existantes.

### 12.1 Corrections et confirmations de tokens

Les ecrans Stitch confirment les tokens v1.0 et apportent les precisions suivantes :

| Token | Valeur v1.0 | Confirmation Stitch | Precision |
|-------|-------------|---------------------|-----------|
| `Colors.succes` | `#16A34A` | Confirme | Bouton CONFIRMER LA LIVRAISON actif (M-04) |
| `Colors.alerte` | `#DC2626` | Confirme | Barre header M-05 + item radio selectionne |
| `Colors.infoFonce` | `#1E3A8A` | Confirme | Fond overlay M-06 (pas `Colors.primaire`) |
| `Colors.surfaceSecondary` | `#F8FAFC` | Confirme | Bandeau contexte M-04 et M-05 |
| Adresse dans CarteColis | Inter Regular 16px | Corrige | Inter SemiBold 16px (poids 600, pas Regular) |

### 12.2 Valeurs numeriques precisees

Les ecrans Stitch precisent les valeurs suivantes qui n'etaient pas explicites en v1.0 :

```
Barre alerte header M-05 : hauteur 4px (au-dessus du header)
Overlay M-06 border-radius bas : 16px (pas de rayon en haut)
Barre countdown M-06 : hauteur 3px, border-radius inherit bas overlay
Pad de signature M-04 : hauteur 240px, trait 3px, ligne base a 80% hauteur
CarteColis — swipe threshold : 80px, zone action 80px de large
CarteColis — bordure echec : gauche 3px Colors.alerte
CardTypePreuve : hauteur 80px, grille 2x2, gap 12px
Bandeau contexte (M-04, M-05) : hauteur 48px
```

### 12.3 Nouveau composant — BandeauContexteColis

Identifie dans M-04 et M-05 comme composant reutilisable :

```typescript
interface BandeauContexteColis {
  colisId: string;    // ex: "#00247"
  destinataire: string;
}

Styles :
- fond: Colors.surfaceSecondary   // #F8FAFC
- hauteur: 48px
- paddingHorizontal: 16px
- texte: Inter SemiBold 14px Colors.textePrimaire
- format: "Colis #XXXXX — Nom Destinataire"
```

### 12.4 Nouveau composant — BarreHeaderAlerte

Identifie dans M-05 comme indicateur contextuel fort :

```typescript
interface BarreHeaderAlerte {
  color?: string;   // default Colors.alerte (#DC2626)
  height?: number;  // default 4
}

// Positionnement : au-dessus du header fixe (StatusBar area ou AbsoluteTop)
// Usage : M-05 uniquement — signal visuel "ecran dangereux / echec"
```

### 12.5 Etats bouton confirmer — precision M-04

Le bouton CONFIRMER LA LIVRAISON a deux etats visuels distincts :

```
Desactive :
  backgroundColor: Colors.bordureNeutre    // #E2E8F0
  color:           Colors.texteTertiaire   // #94A3B8
  opacity:         0.6

Actif :
  backgroundColor: Colors.succes           // #16A34A  (pas primaire !)
  color:           Colors.texteInverse     // #FFFFFF
  opacity:         1.0
```

Note importante : le bouton confirmer utilise `Colors.succes` et non `Colors.primaire`.
Cette distinction est specifique a M-04 — tous les autres CTA primaires utilisent
`Colors.primaire` (#1D4ED8).

### 12.6 Comportement post-fermeture overlay M-06

Nouveau sous-composant identifie : **BandeauInstructionPersistant** (distinct de BandeauInstruction).

```typescript
interface BandeauInstructionPersistant {
  instructionType: string;   // "Prioriser"
  colisId: string;           // "#00312"
  onVoir: () => void;
}

Styles :
- hauteur: 32px
- fond: Colors.primaireLeger     // #EFF6FF
- texte: Colors.infoFonce        // #1E3A8A
- Inter Regular 12px
- icone Bell 16px
- bouton "Voir" : tertiaire, meme couleur
- disparait au tap [Voir] ou au prochain scroll vers le bas
```

---

---

## 13. Material Design 3 — Integration retour designer externe (v1.2)

> Section ajoutee le 2026-03-25 suite a la livraison des maquettes HTML/Tailwind
> par le designer externe. Source : `design_mobile_designer.md`.
> Rapport de delta complet : `/livrables/02-ux/delta-designer-2026-03-25.md`.

### 13.1 Systeme de tokens MD3 applique par le designer

Le designer a utilise le systeme de couleurs Material Design 3 via Tailwind CSS.
Voici les tokens MD3 et leur correspondance avec notre design system.

#### Tokens MD3 cles

| Token MD3 (Tailwind) | Valeur hex | Correspondance DS DocuPost | Statut |
| -------------------- | ---------- | -------------------------- | ------ |
| `primary` | `#0037b0` | `--color-primaire: #1D4ED8` | ECART — bleu plus sombre |
| `primary-container` | `#1d4ed8` | `--color-primaire: #1D4ED8` | IDENTIQUE a notre primaire |
| `on-primary` | `#ffffff` | `--color-texte-inverse` | Conforme |
| `tertiary` | `#00501f` | (absent) | Nouveau — vert fonce MD3 |
| `tertiary-container` | `#006b2c` | (absent) | Nouveau — vert fonce container |
| `tertiary-fixed` | `#7ffc97` | (absent) | Vert clair anime (badge LIVE) |
| `error` | `#ba1a1a` | `--color-alerte: #DC2626` | ECART — rouge plus sombre |
| `error-container` | `#ffdad6` | `--color-alerte-leger: #FEF2F2` | Proches |
| `surface` | `#f7f9fb` | `--color-surface-primary: #FFFFFF` | ECART — gris tres clair vs blanc pur |
| `surface-container-lowest` | `#ffffff` | `--color-surface-primary: #FFFFFF` | Identique |
| `surface-container` | `#eceef0` | `--color-surface-secondary: #F8FAFC` | Proches |
| `on-surface` | `#191c1e` | `--color-texte-primaire: #0F172A` | Quasi-identiques |
| `on-surface-variant` | `#434655` | `--color-texte-secondaire: #475569` | Quasi-identiques |
| `outline` | `#747686` | (absent, proche tertiaire) | Nouveau |
| `outline-variant` | `#c4c5d7` | `--color-bordure-neutre: #E2E8F0` | Proches |
| `secondary` | `#4059aa` | (absent) | Nouveau — bleu secondaire MD3 |
| `secondary-container` | `#8fa7fe` | (absent) | Lavande — badge A LIVRER |

#### Decision de reconciliation (recommandation @ux v1.2)

**Couleur primaire** : maintenir `#1D4ED8` pour le MVP. Documenter `#0037b0` comme
candidate pour la v2 apres validation accessibilite WCAG sur tous les composants.

**Couleur succes / confirmation** : maintenir `Colors.succes: #16A34A` (#16A34A).
Le vert sombre MD3 (`tertiary-container: #006b2c`) est insuffisamment contrasté
en exterieur soleil (usage livreur terrain).

**Couleur erreur** : aligner sur `#ba1a1a` (MD3) pour le header M-05 uniquement,
en tant que token contextuel `--color-header-echec`. Garder `--color-alerte: #DC2626`
pour les badges et bordures.

**Fond surface** : adopter `#f7f9fb` (MD3) comme `--color-surface-primary` a la place
de `#FFFFFF`. Difference imperceptible visuellement, mais cohérence avec le designer.

### 13.2 Nouveaux tokens a ajouter au design system

```css
:root {
  /* Tokens issus du retour designer externe — v1.2 */
  --color-header-echec:        #ba1a1a;  /* Header M-05 uniquement — fond rouge contextuel */
  --color-live-badge:          #7ffc97;  /* Badge LIVE animate — tertiary-fixed MD3 */
  --color-live-badge-texte:    #002109;  /* Texte sur badge LIVE */
  --color-surface-primary:     #f7f9fb;  /* Mis a jour : gris tres clair (MD3 surface) */
  --color-outline:             #747686;  /* Contour neutre MD3 */
  --color-outline-variant:     #c4c5d7;  /* Contour leger MD3 */
}
```

```typescript
// src/mobile/theme/colors.ts — ajouts v1.2
export const Colors = {
  // ... tokens existants ...

  // Ajouts retour designer v1.2
  headerEchec:         '#ba1a1a',   // Fond header M-05
  liveBadge:           '#7ffc97',   // Badge LIVE (tertiary-fixed MD3)
  liveBadgeTexte:      '#002109',   // Texte badge LIVE
  outline:             '#747686',   // Contour neutre
  outlineVariant:      '#c4c5d7',   // Contour leger
} as const;
```

### 13.3 Nouveaux composants identifies par le designer

Les composants suivants ont ete identifies dans les maquettes HTML du designer.
Ils completent le catalogue existant (3.1 a 3.7 + 12.x).

#### DC-01 TacticalGradient

**Description** : Dégradé directionnel identitaire DocuPost. Utilise pour le logo M-01,
les boutons primaires enrichis et le fond overlay M-06.

```
CSS : linear-gradient(135deg, #0037b0 0%, #1D4ED8 100%)
Tailwind : tactical-gradient (classe custom)
Utilisation : logo, bouton SSO M-01, bouton LIVRER M-03, overlay M-06
Note : si la couleur primaire reste #1D4ED8, le gradient devient #1D4ED8 -> #1E40AF
```

#### DC-02 GlassEffectFooter

**Description** : Footer fixe avec effet verre depoli. Applique sur M-02, M-03, M-04, M-05.

```
CSS :
  background: rgba(255, 255, 255, 0.85)
  backdrop-filter: blur(20px)
  box-shadow: 0 -4px 20px 0 rgba(0,0,0,0.06)
  border-radius: 0 0 0 0 / top: rounded-t-xl

Tailwind : bg-white/85 backdrop-blur-xl shadow-[0_-4px_20px_0_rgba(0,0,0,0.06)]

Props React Native :
- position: 'absolute', bottom: 0
- backgroundColor: 'rgba(255,255,255,0.85)'
- Necessite react-native-blur ou expo-blur pour backdrop-filter
```

#### DC-03 SignatureGrid

**Description** : Fond pointille du pad de signature (M-04). Repere visuel pour le livreur.

```
CSS :
  background-image: radial-gradient(circle, #c4c5d7 1px, transparent 1px)
  background-size: 20px 20px

React Native : pattern a reproduire via SVG ou image PNG tileable
```

#### DC-04 ContextBannerColis

**Description** : Bandeau de contexte colis en haut des ecrans d'action (M-04, M-05).
Rappelle l'identite du colis en cours sans quitter l'ecran.

```
Structure :
[Icone package_2]  [Label "COLIS EN COURS"]
                   [ID colis — Nom destinataire]

Proprietes :
- colisId: string
- nomDestinataire: string
- variant: 'neutre' | 'alerte'  (bordure primary vs error)

Styles :
- fond: Colors.surfacePrimary (#f7f9fb ou #FFFFFF)
- bordure gauche 4px: Colors.primaire (neutre) | Colors.headerEchec (alerte)
- icone: Material package_2, couleur = bordure
- label: 10px SemiBold uppercase, --color-texte-secondaire
- id+nom: 16px Bold, --color-texte-primaire
- padding: 20px, bords arrondis 12px, ombre sm
```

#### DC-05 BadgePrioriteHaute

**Description** : Micro-label de priorite sur la carte overlay M-06.

```
Structure : [texte "Priorité Haute"]

Styles :
- font-size: 10px
- font-weight: Black (900)
- text-transform: uppercase
- letter-spacing: 0.2em
- couleur: Colors.liveBadge (#7ffc97)
```

#### DC-06 ImageContextuelle

**Description** : Zone d'image contextuelle (photo du batiment/lieu) sur M-03.
Dépend de données externes non disponibles pour le MVP.

```text
Statut : HORS MVP — a prevoir en backlog post-MVP
Structure : image grayscale opacity-80 + overlay gradient noir/transparent + label zone
Dimensions : pleine largeur, hauteur 192px (h-48), bords arrondis 16px
```

#### DC-07 MiniProgressBar

**Description** : Barre de progression fine indiquant l'avancement d'un formulaire
(M-04 capture preuve). Distincte de la barre de progression de tournee.

```text
Structure : barre h-1 ou h-1.5, pleine largeur, au-dessus du footer fixe

Proprietes :
- progress: number (0-100)
- couleur: Colors.primaire

Styles :
- hauteur: 4px (h-1)
- fond: Colors.bordureNeutre
- fill: Colors.primaire
- bords arrondis: full
```

---

## Changelog design system

| Version | Date | Changements |
| ------- | ---- | ----------- |
| 1.0 | 2026-03-25 | Creation initiale — palette, typographie, composants 3.1 a 3.7, grille, ombres, etats interactifs, animations, icones |
| 1.1 | 2026-03-25 | Apports Stitch : corrections tokens (adresse SemiBold, bouton confirmer succes vs primaire), valeurs numeriques precisees, 3 nouveaux composants (BandeauContexteColis, BarreHeaderAlerte, BandeauInstructionPersistant) |
| 1.2 | 2026-03-25 | Retour designer externe : section 13 MD3, tokens MD3 documentes, 7 nouveaux composants (DC-01 TacticalGradient, DC-02 GlassEffectFooter, DC-03 SignatureGrid, DC-04 ContextBannerColis, DC-05 BadgePrioriteHaute, DC-06 ImageContextuelle, DC-07 MiniProgressBar), decision couleur primaire documentee |
