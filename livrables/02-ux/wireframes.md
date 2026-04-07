# Wireframes textuels DocuPost

> Document de référence — Version 1.4 — 2026-04-06
> Produit à partir des personas (/livrables/02-ux/personas.md), des user journeys
> (/livrables/02-ux/user-journeys.md) et du périmètre MVP (/livrables/01-vision/perimetre-mvp.md).
> Mis à jour le 2026-04-02 (v1.3) : ajout M-07 (Mes consignes), mise à jour M-01 (card SSO
> rétractable avant connexion — US-043), M-02 (hint swipe — US-045), M-04 (pad signature réel —
> US-046), W-01 (compteur déconnexion WebSocket — US-044), horodatage M-07 (US-042).
> Mis à jour le 2026-04-06 (v1.4) : ajout W-08 (État des livreurs — US-066), entrée SideNavBar
> "Livreurs", tableau VueLivreur temps réel avec badges SANS_TOURNEE / AFFECTÉ / EN COURS.
>
> Conventions :
> - Les wireframes sont textuels et décrivent le layout, les zones, les composants et les
>   interactions principales.
> - Les termes en *italique* sont les termes du domaine (Ubiquitous Language).
> - Chaque écran est annoté avec les Domain Events qu'il déclenche ou affiche.
> - Les états spéciaux (liste vide, chargement, erreur réseau, mode offline) sont décrits
>   pour chaque écran.

---

## Système de design — Référence globale (Interface Web)

> Ces spécifications s'appliquent à tous les écrans web (W-01 à W-05).
> Source : design_web_designer.md v1.0 — 2026-03-25.

### Palette de couleurs

| Rôle | Valeur hex | Usage |
|------|------------|-------|
| Primaire | #0037B0 | Actions principales, liens actifs, barres de progression |
| Succès | #16A34A (emerald-600) | Statut CLÔTURÉE, 100 % avancement |
| Alerte critique | #BA1A1A (error) | Statut A RISQUE, erreurs, badges non affectés |
| Avertissement | #7F2500 (tertiary) | Anomalies de charge, icônes d'alerte |
| Surface principale | #F7F9FB | Fond de page |
| Surface carte | #FFFFFF | Cartes et panneaux |
| Surface conteneur | #ECEEF0 | Zones de liste, fonds secondaires |

### Typographie

| Usage | Police | Graisses |
|-------|--------|---------|
| Titres / Headlines | Work Sans | 600, 700, 800 |
| Corps, labels, données | Inter | 400, 500, 600, 700 |

### Shell de navigation (partagé W-01 à W-05)

```
┌──────────────────────────────────────────────────────────────────────┐
│ DocuPost  |  [● LIVE il y a 5s]           [sync] [notif] | Laurent  │  TopAppBar fixe — h-16, fond blanc/80 flou
│                                                             Renaud   │  Indicateur LIVE pulsant (WebSocket)
├──────────┬───────────────────────────────────────────────────────────┤
│  [■] Pré-│                                                           │
│  paration│                      ZONE PRINCIPALE                      │  SideNavBar fixe — w-64, fond slate-100
│  [ ] Sup-│                                                           │  2 entrées : Préparation / Supervision
│  ervision│                                                           │  Entrée active : fond blanc, texte bleu
│  ────────│                                                           │
│  [?] Aide│                                                           │
│  [⏻] Déco│                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

**Composants transversaux :**
- TopAppBar : logo "DocuPost" (Work Sans, bleu marine), badge LIVE pulsant (point vert animé + texte "LIVE"), icônes sync et notifications (avec badge rouge si alertes), avatar + nom "Laurent Renaud" + label "Supervisor Mode".
- SideNavBar : entrée active surlignée fond blanc, shadow-sm, texte primary. Entrées inactives fond transparent, hover fond slate-200.
- Fil d'Ariane (breadcrumb) sous le TopAppBar : "Logistique > [Page courante]".

---

## Application mobile Android — Livreur

---

### Écran M-01 : Authentification

**Persona** : Pierre Morel (Livreur terrain)
**Objectif** : Connexion sécurisée via SSO corporate avant de prendre en main la *tournée*
**Route** : /auth
**Domain Events** : aucun déclenché ici (pré-condition)
**US liées** : US-019 (SSO mobile), US-036 (card SSO rétractable post-connexion), US-043
(card SSO rétractable avant connexion)

#### Layout — Card SSO étendue (état initial)

```
┌─────────────────────────────────────┐
│           [Logo DocuPost]           │  Header minimal — branding
│                                     │
│   ┌─────────────────────────────┐   │  Card SSO — fond blanc, bordure discrète
│   │  Comment fonctionne         │  [^]│  Chevron haut — bouton "Réduire" visible
│   │  la connexion ?             │   │  dès la première ouverture (US-043)
│   │                             │   │
│   │  Votre compte Docaposte     │   │
│   │  est utilisé pour vous      │   │  Explications SSO
│   │  identifier de façon        │   │
│   │  sécurisée.                 │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   Se connecter              │   │  Bouton principal toujours visible
│   │   (via compte Docaposte)    │   │  Redirection SSO OAuth2 corporate
│   └─────────────────────────────┘   │
│                                     │
│   v 1.0.0 — Docaposte              │  Footer : version applicative
└─────────────────────────────────────┘
```

#### Layout — Card SSO repliée (après appui sur [^])

```
┌─────────────────────────────────────┐
│           [Logo DocuPost]           │
│                                     │
│   ┌─────────────────────────────┐   │  Card SSO repliée — 1 ligne visible
│   │  Comment fonctionne... [v]  │   │  Chevron bas — bouton "Déplier"
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   Se connecter              │   │  Bouton principal — toujours accessible
│   │   (via compte Docaposte)    │   │
│   └─────────────────────────────┘   │
│                                     │
│   v 1.0.0 — Docaposte              │
└─────────────────────────────────────┘
```

#### Composants

- Logo DocuPost centré.
- Card SSO explicative avec bouton chevron [^] / [v] visible dès la première ouverture.
  - État étendu (défaut) : texte explicatif SSO visible, chevron haut [^] = "Réduire".
  - État replié (après appui [^]) : seule la ligne de titre est visible, chevron bas [v].
  - Le repliage avant connexion est temporaire (session courante) — non mémorisé en
    AsyncStorage (voir US-043). Après une première connexion réussie, US-036 prend le
    relais et mémorise l'état replié.
- Bouton "Se connecter via compte Docaposte" : toujours visible et accessible, que la card
  soit étendue ou repliée.
- Indicateur de chargement pendant la redirection SSO.
- Version de l'application en pied d'écran.

#### Interactions principales

- Appui sur [^] : card SSO se replie immédiatement (session courante, non mémorisé).
- Appui sur [v] : card SSO se déploie à nouveau.
- Appui sur "Se connecter" : redirection vers la page SSO corporate. Retour automatique à la
  *liste des colis du jour* après authentification réussie.

#### États spéciaux

- Erreur SSO : message "Connexion impossible. Vérifiez votre réseau ou contactez le support."
  avec bouton "Réessayer".
- Chargement : spinner centré, bouton désactivé.
- Première connexion réussie : la card SSO est mémorisée repliée (AsyncStorage — US-036).
  Les ouvertures suivantes démarrent avec la card repliée.

**Termes du domaine annotés** : *connexion*, *tournée*, *SSO corporate*

---

### Écran M-02 : Liste des colis de la tournée

**Persona** : Pierre Morel (Livreur terrain)
**Objectif** : Voir rapidement l'ensemble des *colis* de sa *tournée* du jour, leur état et
les filtrer par zone
**Route** : /tournee
**Domain Events déclenchés** : TournéeDémarrée (au premier accès), TournéeChargée

#### Layout

```
┌─────────────────────────────────────┐
│  [Menu]  Tournée du 19/03/2026  [?] │  Header : titre, date, aide
├─────────────────────────────────────┤
│  Reste à livrer : 14 / 22 colis     │  Bandeau progression : compteur dynamique
│  Fin estimée : 17h30                │  Estimation horaire de fin de tournée
├─────────────────────────────────────┤
│  [Zone A] [Zone B] [Zone C] [Tous]  │  Filtres par zone géographique (onglets)
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ [•] 12 Rue du Port, Lyon 3e   │  │  Item colis — Statut : à livrer
│  │     M. Dupont – Apt 3B        │  │  Adresse, destinataire
│  │     Contrainte : Avant 14h    │  │  Contrainte horaire visible
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ [✓] 4 Allée des Roses         │  │  Item colis — Statut : livré
│  │     Mme Martin                │  │  Grisé / coché
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ [✗] 8 Cours Gambetta          │  │  Item colis — Statut : échec
│  │     M. Leroy – Absent         │  │  Motif affiché sous l'adresse
│  └───────────────────────────────┘  │
│              [+ d'items]            │
├─────────────────────────────────────┤
│  [Scan colis]       [Clôturer]      │  Actions globales footer
└─────────────────────────────────────┘
```

#### Composants

- Header avec titre de la *tournée* et date.
- Bandeau de progression dynamique : "X *colis* restants / Y total" + estimation horaire
  de fin.
- Onglets de filtre par zone géographique (libellés issus du référentiel adresse).
- Liste des *colis* :
  - Icône de statut colorée : à livrer (bleu primaire #0037B0), livré (vert #16A34A), échec
    (rouge #BA1A1A), à représenter (orange/tertiary).
  - Adresse principale, nom du destinataire.
  - Contrainte visible si présente (*fragile*, horaire, *document sensible*).
  - *Motif de non-livraison* affiché si statut = échec.
- Bouton "Scan colis" : accès rapide à la saisie par code-barres.
- Bouton "Clôturer la tournée" (visible uniquement si tous les *colis* sont traités).

#### Interactions principales

- Appui sur un item *colis* : navigation vers l'écran M-03 (Détail du colis).
- Swipe gauche sur un item *colis* (seuil 80px) : déclenche l'écran M-05 (Déclaration
  d'un échec de livraison) sans passer par M-03 — geste rapide issu de US-029.
- Appui sur l'icône "Mes consignes" dans le header : navigation vers M-07 (Mes consignes).
  Un badge rouge indique le nombre de *consignes* avec statut "Nouvelle".
- Appui sur un onglet de filtre : la liste se filtre immédiatement, sans rechargement.
- Réception d'une notification push *instruction* : bandeau de notification en haut de
  liste, actualisation automatique.

#### Hint visuel swipe (US-045 — onboarding)

```
┌───────────────────────────────┐
│ [•] 12 Rue du Port, Lyon 3e   │  Item colis
│     M. Dupont – Apt 3B        │
│     Contrainte : Avant 14h    │
│                               │
│  ← Glissez vers la gauche     │  Hint textuel — typographie secondaire légère
│    pour déclarer un problème  │  Affiché uniquement si swipeHintCount < 3
└───────────────────────────────┘
```

- Le hint est affiché sous les cartes *colis* uniquement si `swipeHintCount < SEUIL_HINT`
  (valeur par défaut : 3, configurable).
- À chaque swipe réussi (seuil 80px atteint, M-05 ouvert), `swipeHintCount` s'incrémente
  dans AsyncStorage.
- Quand `swipeHintCount >= SEUIL_HINT` : le hint disparaît définitivement.
- Option : une micro-animation "frémissement" de la carte (8px gauche, spring-back) au
  premier chargement de la liste renforce la suggestion du geste.

#### États spéciaux

- Liste vide (aucun *colis* assigné) : "Aucun colis assigné pour aujourd'hui. Contactez
  votre superviseur."
- Chargement initial : skeleton de liste, indicateur de synchronisation.
- Mode offline : bandeau orange "Hors connexion — Données locales" + icône de
  synchronisation en attente. Les actions sont toujours possibles (offline-first).
- Mise à jour temps réel : animation discrète sur l'item mis à jour sans rechargement
  de la page.
- *Consignes* nouvelles : badge rouge sur l'icône "Mes consignes" dans le header
  indiquant le nombre de *consignes* non lues.

**Termes du domaine annotés** : *tournée*, *colis*, *reste à livrer*, *zone*, *statut*,
*contrainte*, *motif de non-livraison*, *document sensible*, *à représenter*, *consigne*

---

### Écran M-03 : Détail d'un colis

**Persona** : Pierre Morel (Livreur terrain)
**Objectif** : Consulter les informations complètes d'un *colis* et déclencher l'action
de livraison ou d'échec
**Route** : /tournee/colis/:id
**Domain Events déclenchés** : LivraisonConfirmée, ÉchecLivraisonDéclaré

#### Layout

```
┌─────────────────────────────────────┐
│  [<]  Colis #00247                  │  Header : retour + identifiant colis
├─────────────────────────────────────┤
│  Destinataire : M. Dupont           │  Section destinataire
│  12 Rue du Port, Lyon 3e — Apt 3B   │
│  Tél : [appeler] (numéro masqué)    │  Appel possible sans accès au numéro brut
├─────────────────────────────────────┤
│  Contraintes                        │  Section contraintes
│  ⚑ Avant 14h00                      │
│  ⚑ Fragile                          │
├─────────────────────────────────────┤
│  [Voir sur la carte]                │  Lien vers carte (Google Maps ou équivalent)
├─────────────────────────────────────┤
│  Historique                         │  Section historique (si déjà tenté)
│  19/03 09:42 — Tentative — Absent   │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │     LIVRER CE COLIS           │  │  Action principale — couleur primaire (#0037B0)
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │     DÉCLARER UN ÉCHEC         │  │  Action secondaire — couleur neutre
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### Composants

- Header avec bouton retour et identifiant du *colis*.
- Section destinataire : nom, adresse complète, numéro d'appartement, bouton d'appel
  (numéro masqué, accessible via l'application, non exposé en clair).
- Section contraintes : liste des contraintes actives (horaire, *fragile*, *document
  sensible*).
- Lien "Voir sur la carte" : ouvre l'application de navigation externe avec l'adresse
  pré-remplie.
- Historique des tentatives précédentes sur ce *colis*.
- Bouton principal "LIVRER CE COLIS" : navigue vers M-04 (Capture de la preuve).
- Bouton secondaire "DÉCLARER UN ÉCHEC" : navigue vers M-05 (Motif de non-livraison).

#### Interactions principales

- "LIVRER CE COLIS" : accède à M-04.
- "DÉCLARER UN ÉCHEC" : accède à M-05.
- "Voir sur la carte" : ouvre Google Maps / équivalent avec l'adresse.
- Bouton retour : revient à M-02 sans modification.

#### États spéciaux

- *Colis* déjà livré : les deux boutons sont remplacés par "Ce colis a été livré à HH:MM".
- *Colis* déjà en échec : les deux boutons sont remplacés par "Échec déclaré — Motif :
  [motif]".
- Chargement du détail : skeleton de fiche.

**Termes du domaine annotés** : *colis*, *destinataire*, *contrainte*, *fragile*,
*document sensible*, *historique*, *tentative*

---

### Écran M-04 : Capture de la preuve de livraison

**Persona** : Pierre Morel (Livreur terrain)
**Objectif** : Capturer la *preuve de livraison* de façon rapide et opposable
**Route** : /tournee/colis/:id/preuve
**Domain Events déclenchés** : PreuveCapturée, LivraisonConfirmée, SynchronisationOMS
**US liées** : US-008 (capture signature), US-009 (photo / tiers), US-046 (pad signature réel)

#### Layout — type sélectionné : Signature du destinataire

```
┌─────────────────────────────────────┐
│  [<]  Preuve de livraison           │  Header
├─────────────────────────────────────┤
│  Colis #00247 — M. Dupont           │  Rappel du contexte
├─────────────────────────────────────┤
│  Type de preuve                     │  Sélection du type
│  (•) Signature du destinataire      │
│  ( ) Photo du colis déposé          │
│  ( ) Dépôt chez un tiers            │
│  ( ) Dépôt sécurisé                 │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │  Composant react-native-signature-canvas
│  │                             │   │  WebView embarqué — canvas HTML5
│  │   Signez ici avec le doigt  │   │  Tracé en temps réel visible
│  │                             │   │  (US-046 : remplace le TouchableOpacity simulé)
│  │   ┌──────────────────────┐  │   │
│  │   │  [tracé visible]     │  │   │  Le tracé du destinataire est visible en direct
│  │   └──────────────────────┘  │   │
│  └─────────────────────────────┘   │
│  [Effacer]                          │  Déclenche onEmpty → pad remis à zéro
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │     CONFIRMER LA LIVRAISON    │  │  Désactivé si onEmpty = true (aucun tracé)
│  └───────────────────────────────┘  │  Actif dès qu'un tracé est présent
└─────────────────────────────────────┘
```

#### Composants

- Rappel du *colis* et du destinataire en contexte.
- Sélecteur de type de *preuve* : signature, photo, *tiers*, *dépôt sécurisé*.
- Zone dynamique selon le type :
  - Signature (*signature numérique*) : composant `react-native-signature-canvas` (WebView
    avec canvas HTML5). Le destinataire trace avec le doigt. Tracé visible en temps réel.
    Bouton "Effacer" : déclenche `clearSignature()`, remet `onEmpty = true`, désactive le
    bouton de confirmation. La signature est exportée en base64 PNG via `readSignature()` à
    la validation — invariant légal : tracé non nul obligatoire.
  - Photo : déclencheur de l'appareil photo natif Android. Aperçu miniature après capture.
  - Tiers : champ texte "Nom du tiers" + confirmation.
  - Dépôt sécurisé : description du lieu (sélection dans une liste ou champ libre).
- Bouton "CONFIRMER LA LIVRAISON" :
  - Désactivé si `onEmpty = true` (signature) ou si aucune donnée capturée (autres types).
  - Actif dès qu'un tracé est présent (signature) ou une donnée capturée (autres types).

#### Interactions principales

- Sélection d'un type de preuve : affiche la zone de capture correspondante.
- Trace sur le pad de signature : tracé visible en temps réel, bouton de confirmation actif.
- Appui sur "Effacer" : pad remis à zéro, bouton de confirmation désactivé.
- Photo capturée : affichage miniature de confirmation. Bouton actif.
- "CONFIRMER LA LIVRAISON" :
  - Pour la signature : `readSignature()` appelé → base64 PNG transmis au
    `ConfirmerLivraisonHandler` avec type = SignatureNumerique.
  - Horodatage et géolocalisation capturés automatiquement.
  - Statut du *colis* passe à *livré*. *Événement PreuveCapturée* puis *LivraisonConfirmée*
    transmis. Retour automatique à M-02 avec mise à jour de l'indicateur de progression.

#### États spéciaux

- Pad vide (onEmpty = true) : bouton "CONFIRMER LA LIVRAISON" grisé, non interactif.
- Mode offline : la *preuve* (base64 PNG inclus) est stockée localement. Synchronisation
  différée avec indicateur "Synchronisation en attente". *Événement* rejoué dès retour.
- Erreur de capture photo : "Impossible d'accéder à l'appareil photo. Vérifiez les
  autorisations."
- Erreur de géolocalisation : la livraison peut être confirmée sans coordonnées GPS si
  l'API de localisation est indisponible (dégradé documenté, alerte au superviseur).

**Termes du domaine annotés** : *preuve de livraison*, *signature numérique*, *tiers*,
*dépôt sécurisé*, *livré*, *horodatage*, *géolocalisation*, *événement*, *tracé*

---

### Écran M-05 : Déclaration d'un échec de livraison

**Persona** : Pierre Morel (Livreur terrain)
**Objectif** : Enregistrer un *échec de livraison* avec un *motif normalisé* et choisir
la *disposition* du *colis*
**Route** : /tournee/colis/:id/echec
**Domain Events déclenchés** : ÉchecLivraisonDéclaré, MotifEnregistré,
DispositionEnregistrée, IncidentNotifiéSuperviseur

#### Layout

```
┌─────────────────────────────────────┐
│  [<]  Échec de livraison            │  Header
├─────────────────────────────────────┤
│  Colis #00247 — M. Dupont           │  Rappel du contexte
├─────────────────────────────────────┤
│  Motif de non-livraison             │  Section motif — liste normalisée
│  ( ) Absent                         │
│  ( ) Accès impossible               │
│  ( ) Refus du client                │
│  ( ) Horaires dépassés              │
├─────────────────────────────────────┤
│  Que faire de ce colis ?            │  Section disposition
│  ( ) Repassage (nouvelle tentative) │
│  ( ) Dépôt chez un tiers            │
│  ( ) Retour au dépôt                │
├─────────────────────────────────────┤
│  Note (optionnel)                   │  Champ texte libre limité (250 car.)
│  ┌─────────────────────────────┐   │
│  │ ...                         │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │     ENREGISTRER L'ÉCHEC       │  │  Désactivé tant que motif non sélectionné
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### Composants

- Rappel du *colis* et du destinataire en contexte.
- Liste de *motifs de non-livraison* normalisés : absent, accès impossible, refus client,
  horaires dépassés. Un seul choix obligatoire.
- Liste de *dispositions* : *repassage*, dépôt chez *tiers*, retour au dépôt. Un
  seul choix obligatoire.
- Champ note optionnel (250 caractères max) pour précisions terrain.
- Bouton "ENREGISTRER L'ÉCHEC" : désactivé tant que le *motif* n'est pas sélectionné.

#### Interactions principales

- Sélection du *motif* : déverrouille la section *disposition*.
- "ENREGISTRER L'ÉCHEC" : horodatage et géolocalisation automatiques. Statut du *colis*
  passe à *échec*. *Événement* transmis à l'OMS. Superviseur notifié en temps réel.
  Retour automatique à M-02 avec mise à jour de la liste.

#### États spéciaux

- Mode offline : l'*échec* est stocké localement. Synchronisation différée. Indicateur
  "Synchronisation en attente".
- Si *disposition* = *repassage* : une entrée est créée dans la liste des *colis*
  en attente de seconde tentative.

**Termes du domaine annotés** : *motif de non-livraison*, *absent*, *accès impossible*,
*refus client*, *horaires dépassés*, *disposition*, *repassage*, *échec*, *incident*

---

### Écran M-06 : Notification d'instruction reçue

**Persona** : Pierre Morel (Livreur terrain)
**Objectif** : Informer Pierre en temps réel qu'une *instruction* du superviseur modifie
sa *tournée*
**Route** : Composant overlay / notification push — affiché par-dessus tout écran
**Domain Events affichés** : InstructionReçue, TournéeModifiée

#### Layout

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │
│  │  INSTRUCTION SUPERVISEUR    │   │  Bandeau en haut de l'écran courant
│  │  Prioriser le colis #00312  │   │  Texte de l'instruction
│  │  25 Rue Victor Hugo         │   │
│  │                [VOIR]       │   │  Bouton "Voir" : accède au détail du colis
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### Composants

- Bandeau overlay en haut de l'écran courant, couleur distincte (bleu primaire #0037B0).
- Texte de l'*instruction* : action + *colis* concerné + adresse.
- Bouton "VOIR" : navigue directement vers M-03 (Détail du colis concerné).
- Disparition automatique après 10 secondes si Pierre n'interagit pas (la modification
  de la liste reste effective).

#### Interactions principales

- Appui sur "VOIR" : navigation vers le détail du *colis* priorisé.
- Disparition du bandeau : la liste de *colis* est déjà mise à jour en arrière-plan.

---

### Écran M-07 : Mes consignes (historique des instructions reçues)

**Persona** : Pierre Morel (Livreur terrain)
**Objectif** : Consulter l'ensemble des *consignes* reçues dans la journée, ne jamais en
manquer une, voir leur statut d'exécution et leur horodatage de réception
**Route** : /tournee/consignes
**Domain Events affichés** : InstructionReçue (Read Model local InstructionRecue)
**Domain Events déclenchés** : InstructionPriseEnCompte (à l'ouverture de l'écran)
**US liées** : US-037 (historique consignes), US-042 (horodatage d'émission)

#### Layout

```
┌─────────────────────────────────────┐
│  [<]  Mes consignes                 │  Header — titre, bouton retour vers M-02
│                                     │
│  Aujourd'hui — 3 consignes          │  Résumé du jour
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ [NOUVELLE]                    │  │  Badge statut — bleu primaire
│  │ Prioriser le colis COLIS-042  │  │  Texte de la consigne
│  │ 25 Rue Victor Hugo            │  │
│  │                   14:35       │  │  Horodatage réception — format HH:mm (jour J)
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ [PRISE EN COMPTE]             │  │  Badge statut — gris neutre
│  │ Éviter la Rue du Port (travaux│  │
│  │ Non associé à un colis        │  │  Si aucun colis associé
│  │                   11:22       │  │  Horodatage réception — format HH:mm
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ [EXÉCUTÉE]                    │  │  Badge statut — vert success
│  │ Appeler M. Leroy avant passage│  │
│  │ COLIS-031                     │  │
│  │                   09:07       │  │  Horodatage réception — format HH:mm
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### Composants

- Header avec bouton retour [<] vers M-02.
- Résumé du jour : nombre de *consignes* reçues dans la journée.
- Liste des *consignes* par ordre chronologique inverse (la plus récente en premier) :
  - Badge de statut : NOUVELLE (bleu primaire), PRISE EN COMPTE (gris), EXÉCUTÉE (vert).
  - Texte de la *consigne* (action demandée par le superviseur).
  - Code *colis* associé si applicable, sinon "Non associé à un colis".
  - Horodatage de réception (champ `horodatageReception` du Read Model local) :
    - Format "HH:mm" si la consigne est du jour courant (ex. "14:35").
    - Format "JJ/MM HH:mm" si hors du jour courant (cas exceptionnel — ex. "31/03 22:47").

#### Règles de statut des consignes

| Statut | Déclencheur | Domain Event |
|--------|-------------|--------------|
| NOUVELLE | Réception de l'*instruction* via WebSocket / push | InstructionReçue |
| PRISE EN COMPTE | Ouverture de M-07 et consigne visible (lecture confirmée) | InstructionPriseEnCompte |
| EXÉCUTÉE | LivraisonConfirmée ou ÉchecLivraisonDéclaré sur le *colis* cible | (réaction automatique) |

#### Interactions principales

- Ouverture de l'écran : toutes les *consignes* visibles avec statut NOUVELLE passent à
  PRISE EN COMPTE. L'événement `InstructionPriseEnCompte` est émis vers le superviseur.
- Appui sur une *consigne* avec *colis* associé : navigation vers M-03 (Détail du colis).
- Appui sur le bouton retour [<] : retour vers M-02. Le badge de *consignes* nouvelles est
  mis à jour (badge rouge disparaît si toutes les consignes sont prises en compte).

#### États spéciaux

- Liste vide : "Aucune consigne reçue aujourd'hui. Votre superviseur n'a pas envoyé
  d'instruction."
- Mode offline : les *consignes* reçues avant la perte de connexion restent accessibles
  (stockage local). Les nouvelles *consignes* ne peuvent pas arriver en mode offline (canal
  WebSocket / push indisponible) — indicateur "Hors connexion" en bandeau orange.
- *Consignes* de la veille (cas marginal, avant réinitialisation minuit) : horodatage au
  format "JJ/MM HH:mm" pour distinguer du jour courant.

**Termes du domaine annotés** : *consigne*, *instruction*, *colis*, *statut*, *tournée*,
*NOUVELLE*, *PRISE EN COMPTE*, *EXÉCUTÉE*, *horodatage de réception*

---

## Interface web — Superviseur / Logisticien

> Design visuel de référence : /livrables/02-ux/design_web_designer.md
> Shell commun à tous les écrans : voir section "Système de design" en tête de ce document.

---

### Écran W-04 : Plan du jour — Liste des tournées à préparer

**Persona** : Laurent Renaud (Responsable Exploitation Logistique — mode matin)
**Objectif** : Voir toutes les *tournées* importées du TMS, identifier les non affectées,
déclencher les *affectations* et *lancer* les *tournées* prêtes en moins de 30 minutes
**URL/Route** : /preparation
**Domain Events déclenchés** : TournéeAffectée, TourneeLancée, ImportTMSRafraîchi

#### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ DocuPost | [● LIVE]                    [sync][notif] | Laurent Renaud│  TopAppBar
│          Plan du jour | Historique                                   │  Nav horizontal dans la barre
├──────────┬───────────────────────────────────────────────────────────┤
│          │  Logistique > Plan du jour                                │  Fil d'Ariane
│  [■] Pré-├───────────────────────────────────────────────────────────┤
│  paration│  ┌──────────────────────────────────────────────────────┐│  Bandeau d'alerte Préparation
│  [ ] Sup │  │ ⚠ Alerte Préparation                                 ││  fond tertiary-fixed (orange pâle)
│  ervision│  │ Il reste 3 tournées non affectées à un livreur.      ││  bordure gauche orange (#7F2500)
│          │  └──────────────────────────────────────────────────────┘│
│  ────────│                                                           │
│  [?] Aide│  ┌─────────┐ ┌────────────────┐ ┌──────────┐ ┌────────┐│  Chips synthèse
│  [⏻] Déco│  │ Toutes  │ │ Non affectées  │ │ Affectées│ │Lancées ││  fond coloré par statut
│          │  │   15    │ │      3         │ │    8     │ │   4    ││  badges numériques
│          │  └─────────┘ └────────────────┘ └──────────┘ └────────┘│
│          │  [Rafraîchir depuis TMS]  [Lancer toutes — désactivé]    │  Actions globales
│          ├───────────────────────────────────────────────────────────┤
│          │  [Toutes][Non affectées][Affectées][Lancées] [Recherche] │  Filtres + champ de recherche
│          ├───────────────────────────────────────────────────────────┤
│          │  ┌─────────────────────────────────────────────────────┐ │
│          │  │ Code TMS | Colis | Zones | Statut | Livreur/Véhicule│ │  Tableau des tournées
│          │  ├─────────────────────────────────────────────────────┤ │
│          │  │ T-201 ⚠  |  34   | Lyon  | NON AFF| —         | [Affecter][Voir]│
│          │  │ (fond orange pâle, bordure gauche tertiary)          │ │  Ligne anomalie charge
│          │  ├─────────────────────────────────────────────────────┤ │
│          │  │ T-202    |  12   | VBN   | NON AFF| —         | [Affecter][Voir]│
│          │  ├─────────────────────────────────────────────────────┤ │
│          │  │ T-205    |  48   | Vén.  | AFFECT.| P. Morel VH-07|[Lancer→][Détail]│
│          │  ├─────────────────────────────────────────────────────┤ │
│          │  │ T-198    |  52   | Lyon  | LANCEE | M. Leroy VH-04|[Voir détail]│
│          │  │ (ligne à 60% opacité — tournée en cours)             │ │
│          │  └─────────────────────────────────────────────────────┘ │
│          │  [Charger plus] — Affichage X / Y tournées               │  Pagination
│          ├───────────────────────────────────────────────────────────┤
│          │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────┐ │  3 cartes métriques en bas
│          │  │ Capacité Globale │ │ Colis en attente  │ │Estimation│ │
│          │  │      84%         │ │       412         │ │  18:45   │ │
│          │  └──────────────────┘ └──────────────────┘ └──────────┘ │
└──────────┴───────────────────────────────────────────────────────────┘
```

#### Composants

- TopAppBar : logo DocuPost, navigation "Plan du jour | Historique", badge LIVE pulsant,
  icônes sync/notifications, profil Laurent Renaud avec avatar.
- Bandeau d'alerte Préparation : fond tertiary-fixed (orange pâle), bordure gauche orange
  (#7F2500). Affiché uniquement si des *tournées* sont non affectées. Texte :
  "Il reste N tournées non affectées à un livreur."
- Chips de synthèse (4 pills horizontales) :
  - "Toutes" : fond neutre, badge gris avec le total.
  - "Non affectées" : fond error-container (rouge pâle), badge rouge.
  - "Affectées" : fond secondary-container (bleu pâle), badge bleu.
  - "Lancées" : fond primary-fixed-dim (bleu clair), badge primaire.
- Boutons d'action globale :
  - "Rafraîchir depuis TMS" : bouton secondaire avec icône refresh.
  - "Lancer toutes les tournées" : désactivé (gris) tant que des *tournées* ne sont pas
    affectées.
- Filtres : barre de filtres segmentée (Toutes / Non affectées / Affectées / Lancées) +
  champ de recherche (icône loupe, placeholder "Rechercher une tournée...").
- Tableau des *tournées* :
  - Colonnes : Code TMS, Colis (nombre), Zones, Statut (badge coloré), Livreur / Véhicule,
    Actions.
  - Ligne *tournée* avec anomalie (charge excessive) : fond orange pâle tertiary-fixed,
    bordure gauche tertiary. Icône ⚠ "warning" à côté du code TMS. Action = "Affecter".
  - Ligne NON AFFECTÉE standard : fond blanc. Badge "NON AFFECTEE" rouge (error-container).
  - Ligne AFFECTÉE : badge "AFFECTEE" bleu (primary-container). Colonne livreur renseignée
    (nom + code véhicule). Action principale = bouton "Lancer →" (bleu primaire, shadow).
  - Ligne LANCÉE : 60% opacité. Badge "LANCEE" bleu secondaire. Seule action = "Voir le
    détail".
- Pagination : bouton "Charger plus" centré + compteur "Affichage X / Y tournées".
- Cartes métriques (grille 3 colonnes en bas de page) :
  - Capacité Globale : pourcentage + barre de progression + "N véhicules sur M".
  - Colis en attente : nombre total + variation vs hier.
  - Estimation de fin : heure estimée + variation (optimisation TMS).

#### Interactions principales

- Appui "Affecter" sur une *tournée* NON AFFECTÉE : ouvre W-05 (Détail de la tournée à
  préparer) sur l'onglet "Affectation".
- Appui "Voir le détail" / "Détail" : ouvre W-05 sur l'onglet "Composition".
- Appui "Lancer →" sur une *tournée* AFFECTÉE : déclenche TourneeLancée. Badge passe à
  LANCÉE. Bouton disparaît. Ligne passe à 60% opacité.
- Appui "Rafraîchir depuis TMS" : rafraîchit la liste depuis le TMS.
- Filtre / recherche : filtre la liste en temps réel côté client.

#### États spéciaux

- Aucune *tournée* : "Aucune tournée planifiée pour aujourd'hui."
- Import TMS en cours : spinner sur le bouton Rafraîchir.
- Import TMS échoué : bandeau rouge "Import TMS impossible — Dernière synchronisation
  à HH:MM. Réessayez."
- Toutes les *tournées* affectées : bandeau d'alerte disparaît. Bouton "Lancer toutes"
  s'active.

**Termes du domaine annotés** : *tournée*, *plan du jour*, *non affectée*, *affectée*,
*lancée*, *anomalie de charge*, *code TMS*, *livreur*, *véhicule*

---

### Écran W-05 : Détail d'une tournée à préparer (Composition / Affectation)

**Persona** : Laurent Renaud (Responsable Exploitation Logistique — mode matin)
**Objectif** : Vérifier la composition d'une *tournée*, détecter les anomalies, affecter
un livreur et un véhicule compatibles, puis valider et lancer la *tournée*
**URL/Route** : /preparation/tournee/:id
**Domain Events déclenchés** : TournéeAffectée, TourneeLancée, AnomalieChargeDétectée

#### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ DocuPost | [● LIVE il y a 5s]              [sync][notif]| L. Renaud │  TopAppBar
├──────────┬───────────────────────────────────────────────────────────┤
│          │  Plan du jour > Tournée T-203                             │  Fil d'Ariane
│  [ ] Pré-├───────────────────────────────────────────────────────────┤
│  paration│  Tournée T-203  [NON AFFECTÉE]                           │  Titre + badge statut
│  [■] Sup │  [⚠ Anomalie de charge détectée]                         │  Chip d'anomalie (fond orange)
│  ervision│  [Valider l'affectation]  [Valider et lancer →]          │  Actions en-tête
│          ├─────────────────────┬─────────────────────────────────────┤
│  ────────│  Composition (84)   │  Affectation                        │  Onglets
│  [?] Aide├─────────────────────┘─────────────────────────────────────┤
│  [⏻] Déco│                                                           │
│          │  Grille 12 colonnes (8 + 4)                               │
│          │  ┌──────────────────────────────────┬────────────────────┐│
│          │  │ Col 8 — Composition               │ Col 4 — Sidebar    ││
│          │  │                                   │                    ││
│          │  │ [Zones de livraison]              │ [Récapitulatif]    ││
│          │  │  Zone Nord-Est (B-12) ████ 65%   │  Poids : 450 kg   ││
│          │  │  Zone Centre-Ville (A-01) ██ 35% │  Durée : 6h30     ││
│          │  │                                   │  Distance : 45 km  ││
│          │  │ [Contraintes majeures]            │                    ││
│          │  │  [⏰ Avant 10h] [📦 Fragile]      │ [Affectation rapide]│
│          │  │  [✍ Signature requise]            │  Livreur : [select]││
│          │  │                                   │  Véhicule: [select]││
│          │  │ [⚠ Anomalie]                      │  💡 Reco: VH-XX   ││
│          │  │  Poids 450kg > cap. véhicule std  │                    ││
│          │  │  Reco: véhicule grande capacité   │ [Aperçu carte]    ││
│          │  │                                   │  [Agrandir]        ││
│          │  │ [Liste des colis — Aperçu]        │                    ││
│          │  │  ID | Adresse | Zone | Contraintes| Poids             ││
│          │  │  #PX-9021 | 12 Rue Rép. | A-01 | Fragile | 12.5 kg  ││
│          │  │  #PX-9044 | 45 Bd Hauss.| A-01 | Avant 10h | 4.2 kg ││
│          │  │  [Voir tous les 84 colis]         │                    ││
│          │  └──────────────────────────────────┴────────────────────┘│
└──────────┴───────────────────────────────────────────────────────────┘
```

#### Composants

- Header de page :
  - Titre "Tournée T-XXX" (Work Sans, bold, 3xl) + badge statut (NON AFFECTÉE en rouge,
    AFFECTÉE en bleu).
  - Chip d'anomalie (si présente) : fond tertiary-fixed, icône warning orange, texte
    "Anomalie de charge détectée".
  - Boutons d'action : "Valider l'affectation" (secondaire, fond surface-container-high)
    et "Valider et lancer la tournée" (primaire, shadow, icône rocket_launch).
- Onglets : "Composition (N)" avec compteur de *colis* + "Affectation". Onglet actif :
  texte bleu primaire + bordure inférieure bleue.
- Colonne principale (8/12) — onglet Composition :
  - Carte "Zones de livraison" : une barre de progression par zone géographique
    (nom + pourcentage + barre primaire).
  - Carte "Contraintes majeures" : chips colorées pour chaque contrainte active
    (horaire = bleu secondary, fragile = orange tertiary, signature = gris neutre).
  - Bloc anomalie (si présente) : fond tertiary-fixed/20, icône error orange, description
    du problème + recommandation (ex. "Affecter VH-XX ou scinder la tournée").
  - Tableau "Liste des colis" (aperçu) : colonnes ID Colis, Adresse, Zone (badge gris),
    Contraintes (chip colorée), Poids. Lien "Voir tous les N colis" en pied de tableau.
- Colonne latérale (4/12) :
  - Carte "Récapitulatif" : 3 métriques verticales avec icônes (poids estimé, durée
    estimée, distance).
  - Carte "Affectation rapide" :
    - Sélecteur livreur (select dropdown avec liste "Prénom Nom (Disponible / En service)").
    - Sélecteur véhicule (select dropdown avec code et type, recommandation en dessous
      si anomalie de charge).
  - Aperçu carte : image de carte en grisé avec bouton "Agrandir la carte" centré.

#### Interactions principales

- Onglet "Composition" : affiche le détail des *colis*, zones et contraintes.
- Onglet "Affectation" : affiche les sélecteurs livreur et véhicule avec validation de
  compatibilité charge/véhicule.
- Sélection livreur + véhicule : valide la compatibilité charge — si incompatible, affiche
  l'anomalie dans le bloc d'alerte.
- "Valider l'affectation" : enregistre livreur + véhicule sans lancer. Statut passe à
  AFFECTÉE. Retour à W-04.
- "Valider et lancer la tournée" : enregistre l'affectation ET déclenche TourneeLancée.
  Statut passe à LANCÉE. Retour à W-04.
- "Agrandir la carte" : ouvre la vue carte en plein écran ou dans un onglet dédié.

#### États spéciaux

- *Tournée* sans anomalie : le bloc anomalie n'est pas affiché.
- Liste de livreurs vide : message "Aucun livreur disponible." dans le select.
- *Tournée* déjà LANCÉE : tous les boutons d'action sont désactivés. Bandeau "Tournée
  lancée à HH:MM".

**Termes du domaine annotés** : *tournée*, *composition*, *affectation*, *livreur*,
*véhicule*, *zone de livraison*, *contrainte*, *anomalie de charge*, *fragile*,
*poids estimé*, *capacité véhicule*

---

### Écran W-01 : Tableau de bord des tournées en cours (Supervision)

**Persona** : Laurent Renaud (Responsable Exploitation Logistique — mode journée)
**Objectif** : Avoir une vue agrégée en temps réel de toutes les *tournées* du jour
et identifier immédiatement les *tournées à risque*
**URL/Route** : /supervision
**Domain Events affichés** : TournéeÀRisqueDétectée, AlerteDéclenchée, LivraisonConfirmée
(agrégés)
**US liées** : US-011 (tableau de bord), US-035 (recherche multi-critères), US-039 (export
CSV), US-044 (compteur durée déconnexion WebSocket)

#### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ DocuPost | [● LIVE]                            [sync][notif]|LRenaud│  TopAppBar
├──────────┬───────────────────────────────────────────────────────────┤
│          │  DocuPost > Supervision                                   │  Fil d'Ariane
│  [ ] Pré │                                                           │
│  paration│  ┌───────────────────────┐ ┌──────────────────┐ ┌──────┐│  3 cartes KPI
│  [■] Sup │  │ Actives          [🚚] │ │ Clôturées   [✓]  │ │À ris │  │
│  ervision│  │ 12 (bleu)             │ │ 8 (vert)         │ │ que  ││
│          │  │ (bordure bleue gauche)│ │ (bordure verte)  │ │ 2    ││
│  ────────│  └───────────────────────┘ └──────────────────┘ └──────┘│
│  [?] Aide│                                                   (orange)│
│  [⏻] Déco│  [🔍 Rechercher un livreur]  [Toutes][En cours][À risque]│  Filtres + bouton Rafraîchir
│          │  [Clôturées]  [Rafraîchir ↺]                             │
│          ├───────────────────────────────────────────────────────────┤
│          │  ┌─────────────────────────────────────────────────────┐ │
│          │  │ Livreur | Tournée | Avancement | Statut | Activité  │ │  Tableau temps réel
│          │  ├─────────────────────────────────────────────────────┤ │
│          │  │ [PM] P.Morel | T-042 | ████░░ 31% | [● A RISQUE]   │ │  Ligne A RISQUE
│          │  │               14/45 colis     | Retard 45min | 3min│ │  fond orange-50, bordure orange
│          │  │ [Voir]                                              │ │  badge pulsant rouge
│          │  ├─────────────────────────────────────────────────────┤ │
│          │  │ [JD] J.Dubois| T-058 | ████░░ 54% | [● A RISQUE]   │ │
│          │  │               28/52 colis    | Anomalie scan | 1min│ │
│          │  ├─────────────────────────────────────────────────────┤ │
│          │  │ [LM] L.Martin| T-104 | ████████ 84%| [EN COURS]    │ │  Ligne EN COURS
│          │  │               42/50 colis    | il y a 22min        │ │  fond blanc
│          │  ├─────────────────────────────────────────────────────┤ │
│          │  │ [AB] A.Bernard T-012 | ██████ 100%| [CLÔTURÉE]     │ │  Ligne CLÔTURÉE
│          │  │               35/35 colis    | il y a 2h           │ │  fond gris 60% opacité
│          │  └─────────────────────────────────────────────────────┘ │
│          │  [Charger plus ▾]                                         │
└──────────┴───────────────────────────────────────────────────────────┘

Bas d'écran : [Carte — Secteur T-042] + [Activité Récente : fil d'événements]
```

#### Composants

- 3 cartes KPI en haut (grid 3 colonnes) :
  - Actives : fond blanc, bordure gauche bleue primaire, icône local_shipping, nombre en
    bleu primaire (Work Sans bold 4xl).
  - Clôturées : fond blanc, bordure gauche emerald, icône check_circle, nombre en vert.
  - À risque : fond tertiary-fixed (orange pâle), bordure gauche tertiary, icône warning,
    nombre en orange. Visible même à zéro pour rassurer.
- Barre de recherche + filtres : champ de recherche "Rechercher un livreur...", filtres
  segmentés (Toutes / En cours / À risque / Clôturées), bouton "Rafraîchir" (bleu
  primaire avec icône refresh).
- Tableau des *tournées* :
  - Colonnes : Livreur (avatar initiales + nom), Tournée (badge code), Avancement (barre
    de progression + X/Y colis + pourcentage), Statut (badge), Activité (délai), Actions.
  - Lignes A RISQUE : fond orange-50/50, bordure gauche orange-500. Badge "A RISQUE"
    pulsant (animation ping) en rouge, sous-texte du motif (Retard Xmin, Anomalie scan...).
    Bouton "Voir" en bleu.
  - Lignes EN COURS : fond blanc, hover slate-50.
  - Lignes CLÔTURÉES : fond surface-container-low, 60% opacité. Barre de progression
    verte à 100%. Pas de bouton d'action.
  - Avancement pour CLÔTURÉE : barre emerald-500 (vert, 100%), pourcentage affiché en vert.
- Pagination : bouton "Charger plus" avec icône expand_more.
- Section basse (hors tableau) :
  - Carte de zone : image de carte avec overlay gradient, compteur incidents, tag "Zone
    Congestionnée".
  - Panneau "Activité Récente" : fil d'événements horodatés (points colorés : rouge =
    alerte, vert = clôture, bleu = sync).

#### Interactions principales

- Appui "Voir" d'une *tournée* : navigation vers W-02 (Détail de la tournée en supervision).
- Appui sur un filtre : filtre la liste immédiatement.
- Mise à jour automatique en temps réel (WebSocket). Délai affiché dans le badge LIVE.
- Bouton "Rafraîchir" : force le rechargement.
- Alerte sonore configurable (toggle dans le TopAppBar, activé par défaut).

#### États spéciaux

- Aucune *tournée* active : "Aucune tournée en cours pour aujourd'hui."
- Perte de connexion WebSocket (US-044) :
  - Badge LIVE passe de vert à rouge, texte "HORS LIGNE".
  - Bandeau d'alerte rouge en haut de la zone principale :
    ```
    ┌──────────────────────────────────────────────────────────────────────┐
    │  ⚠ Connexion temps réel indisponible — Déconnecté depuis 3 min 42 s │  Bandeau rouge
    │  Les données affichées peuvent ne pas être à jour.                   │  compteur incrémenté
    └──────────────────────────────────────────────────────────────────────┘  toutes les secondes
    ```
  - Format du compteur (état local, non persisté) :
    - < 60 s : "Déconnecté depuis X s"
    - >= 60 s : "Déconnecté depuis X min Y s"
    - >= 3600 s : "Déconnecté depuis X h Y min"
  - Le compteur démarre à zéro dès le passage du statut LIVE → OFFLINE / POLLING.
  - À la reconnexion (retour en statut LIVE) : bandeau disparaît, compteur réinitialisé.
- Plusieurs alertes simultanées : les lignes A RISQUE remontent en tête du tableau (tri
  automatique par criticité).

**Termes du domaine annotés** : *tournée*, *tournée à risque*, *avancement de tournée*,
*alerte*, *colis*, *statut*, *activité*, *déconnexion*, *connexion temps réel*

---

### Écran W-02 : Détail d'une tournée en supervision

**Persona** : Laurent Renaud (Responsable Exploitation Logistique)
**Objectif** : Voir le détail complet d'une *tournée* : statuts des *colis*, *incidents*,
localisation du livreur, contacter le livreur, et envoyer des *instructions*
**URL/Route** : /supervision/tournee/:id
**Domain Events déclenchés** : InstructionEnvoyée, TournéeModifiée

#### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ DocuPost | [● LIVE il y a 5s]              [sync][notif]| L. Renaud │  TopAppBar
├──────────┬───────────────────────────────────────────────────────────┤
│          │  Plan du jour > Tournée T-043                             │  Fil d'Ariane
│  [ ] Pré │  Tournée T-043             [Contacter le livreur][Export]│  Titre + actions
│  paration│  [👤 L. Petit (Livreur)]  [🚚 VH-07 (Véhicule)]         │  Sous-titre livreur/véhicule
│  [■] Sup │                                                           │
│  ervision│  ┌──────────────────────────────────────────────────────┐│  Bandeau statut A RISQUE
│          │  │ [■ A RISQUE] 32/56 colis livrés | Retard 45min       ││  fond error-container/40
│  ────────│  │ Avancement 57% ████████████████░░░░░░░░░░░░           ││  badge pulsant
│  [?] Aide│  │ Dernière activité : il y a 3 min                      ││  barre gradient orange → rouge
│  [⏻] Déco│  └──────────────────────────────────────────────────────┘│
│          ├───────────────────────────────────────────────────────────┤
│          │  [🗺 Carte] [📋 Liste colis] [⚠ Incidents (2)]           │  Onglets
│          ├───────────────────────────────────────────────────────────┤
│          │  ← Onglet "Liste colis" actif →                          │
│          │  [Tous][À livrer][Livrés][Échecs]  [🔍 Rechercher...]    │  Sous-filtres
│          │  ┌─────────────────────────────────────────────────────┐ │
│          │  │ ID Colis | Destinataire & Adresse | Statut | Act.   │ │
│          │  ├─────────────────────────────────────────────────────┤ │
│          │  │ #00312   | Mme Durand — 25 R. Victor Hugo | A LIVRER│ │  Ligne À LIVRER
│          │  │           Passage prévu : 14:15           | [Instruct.│  Action : bouton Instruction
│          │  ├─────────────────────────────────────────────────────┤ │
│          │  │ #00298   | Boulangerie Le Pain d'Or        | LIVRÉ ✓ │ │  Ligne LIVRÉ — grisée 70%
│          │  │           Remis en main propre : 11:34    | [👁]     │ │
│          │  ├─────────────────────────────────────────────────────┤ │
│          │  │ #00305   | J-M. Lopez — 3bis Pl. Bellecour| ECHEC   │ │  Ligne ECHEC
│          │  │           Tentative à 12:45               | Absent   │ │  motif en rouge italique
│          │  │                                           | [↺]      │ │  action : relancer
│          │  └─────────────────────────────────────────────────────┘ │
│          │  Page : [<] [1] [2] [3] [>]  — Affichage 5/56 colis     │  Pagination
└──────────┴───────────────────────────────────────────────────────────┘

Bas de page : [● WebSocket Connecté — Flux Temps Réel] (pill fixe en bas à droite)
```

#### Composants

- Header de page :
  - Titre "Tournée T-XXX" (Work Sans bold 3xl) + sous-titre livreur (icône personne) et
    véhicule (icône camion).
  - Bouton "Contacter le livreur" (secondaire, icône contact_phone).
  - Bouton "Exporter le rapport" (primaire, icône ios_share).
- Bandeau statut A RISQUE (si applicable) : fond error-container/40, icône warning
  remplie, badge "A RISQUE" pulsant (rouge, bold), compteur X/Y *colis* livrés, alerte
  retard en rouge uppercase, barre de progression gradient orange → rouge avec shadow
  rouge.
- Onglets de navigation (avec icônes Material Symbols) :
  - Carte (icône map) : affiche la carte GPS en temps réel.
  - Liste colis (icône list_alt) : tableau des *colis* avec sous-filtres.
  - Incidents (icône report_problem) : badge rouge avec le nombre d'*incidents* non
    résolus.
- Tableau Liste colis :
  - Sous-filtres internes (Tous / À livrer / Livrés / Échecs) + champ de recherche.
  - Colonnes : ID Colis, Destinataire & Adresse, Statut (badge pill), Dernière Activité,
    Actions.
  - Ligne À LIVRER : badge "A LIVRER" bleu primaire-container. Action = bouton "Instruction"
    (fond primary/10, icône sticky_note_2, hover = bleu plein).
  - Ligne LIVRÉ : fond surface-container-low, 70% opacité. Badge vert foncé "LIVRÉ".
    Horodatage de la livraison. Action = icône visibilité.
  - Ligne ECHEC : badge "ECHEC" rouge (error-container). *Motif* en rouge italique sous
    le badge. Horodatage de la tentative. Action = icône rafraîchissement (relancer).
  - Pagination numérotée (précédent / pages / suivant).
- Indicateur WebSocket fixe (bottom-right) : pill flottante fond blanc/80 flou, point
  pulsant bleu, texte "Flux Temps Réel — WebSocket Connecté".

#### Interactions principales

- Appui "Instruction" d'un *colis* À LIVRER : ouvre le panneau modal W-03.
- Onglet "Carte" : affiche la carte avec position GPS du livreur et *arrêts* de la
  *tournée*.
- Onglet "Incidents" : liste les *incidents* avec *motif* et horodatage.
- "Contacter le livreur" : déclenche l'appel ou l'envoi d'un message au livreur.
- "Exporter le rapport" : génère un PDF/CSV du bilan de la *tournée*.
- Mise à jour en temps réel via WebSocket : statuts des *colis* actualisés sans rechargement.

#### États spéciaux

- *Tournée* CLÔTURÉE : tous les boutons d'action désactivés. Bandeau "Tournée clôturée à
  HH:MM" remplace le bandeau A RISQUE. Badge vert CLÔTURÉE.
- Livreur hors ligne (aucune activité depuis X minutes) : indicateur "Dernier contact il
  y a X min" en orange dans le bandeau statut.
- WebSocket déconnecté : pill WebSocket passe en rouge "Déconnecté — Reconnexion..."

**Termes du domaine annotés** : *tournée*, *colis*, *statut*, *incident*, *motif*,
*instruction*, *arrêt*, *avancement de tournée*, *livreur*, *véhicule*

---

### Écran W-03 : Panneau d'envoi d'une instruction

**Persona** : Laurent Renaud (Responsable Exploitation Logistique)
**Objectif** : Envoyer une *instruction* structurée au livreur sur un *colis* précis
**URL/Route** : panneau modal affiché par-dessus W-02
**Domain Events déclenchés** : InstructionEnvoyée, TournéeModifiée

#### Layout

```
┌─────────────────────────────────────┐
│  Envoyer une instruction            │  Titre du panneau modal
│                               [✕]   │  Bouton fermer
├─────────────────────────────────────┤
│  Colis #00312 — 25 Rue Victor Hugo  │  Rappel du contexte
├─────────────────────────────────────┤
│  Type d'instruction                 │
│  ( ) Prioriser ce colis             │
│  ( ) Annuler la livraison           │
│  ( ) Reprogrammer                   │
├─────────────────────────────────────┤
│  [Si reprogrammer] Créneau cible :  │  Champ conditionnel
│  [ Date ] [ Heure ]                 │
├─────────────────────────────────────┤
│  Message complémentaire (optionnel) │
│  ┌─────────────────────────────┐   │
│  │ ...                         │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  ┌────────────┐  ┌───────────────┐  │
│  │  Annuler   │  │  ENVOYER      │  │  Actions du panneau
│  └────────────┘  └───────────────┘  │
└─────────────────────────────────────┘
```

#### Composants

- Titre et bouton de fermeture [✕].
- Rappel du *colis* concerné (identifiant + adresse).
- Sélecteur de type d'*instruction* : prioriser, annuler, reprogrammer.
- Champ conditionnel : si "reprogrammer" sélectionné, affiche les champs date et heure
  du créneau cible.
- Champ message complémentaire optionnel (200 caractères max).
- Bouton "ENVOYER" : désactivé tant que le type n'est pas sélectionné. Couleur primaire
  (#0037B0) une fois actif.
- Bouton "Annuler" : secondaire, ferme le panneau sans action.

#### Interactions principales

- Sélection de "reprogrammer" : affiche les champs date/heure.
- "ENVOYER" : transmet l'*instruction* au livreur via notification push. Historise
  l'*instruction* avec horodatage et identité du superviseur. Ferme le panneau. Toast
  de confirmation "Instruction envoyée à P. Morel."
- "Annuler" ou [✕] : ferme le panneau sans action.

#### États spéciaux

- Erreur d'envoi (réseau) : message "Envoi impossible. Réessayez." Bouton "Réessayer".
- *Instruction* déjà en cours sur ce *colis* : message d'avertissement "Une instruction
  est en attente d'exécution. Attendez la confirmation du livreur avant d'en envoyer
  une nouvelle."

**Termes du domaine annotés** : *instruction*, *prioriser*, *annuler*, *reprogrammer*,
*colis*, *notification push*

---

## Récapitulatif des écrans MVP

| Écran | Plateforme | Persona    | Parcours(s) couverts | Domain Events principaux                     |
|-------|-----------|------------|----------------------|----------------------------------------------|
| M-01  | Mobile    | Livreur    | P1 — Authentification | — (US-019, US-036, US-043)                 |
| M-02  | Mobile    | Livreur    | P1 — Liste tournée   | TournéeDémarrée, TournéeChargée (US-045 hint swipe) |
| M-03  | Mobile    | Livreur    | P1 — Détail colis    | (déclencheur vers M-04 ou M-05)              |
| M-04  | Mobile    | Livreur    | P1, P4 — Preuve      | PreuveCapturée, LivraisonConfirmée, SynchronisationOMS (US-046 pad réel) |
| M-05  | Mobile    | Livreur    | P1, P3 — Échec       | ÉchecLivraisonDéclaré, MotifEnregistré, DispositionEnregistrée |
| M-06  | Mobile    | Livreur    | P5 — Instruction     | InstructionReçue, TournéeModifiée            |
| M-07  | Mobile    | Livreur    | P5 — Consignes       | InstructionPriseEnCompte (US-037, US-042)    |
| W-01  | Web       | Superviseur| P2 — Tableau de bord | TournéeÀRisqueDétectée, AlerteDéclenchée (US-044 compteur déco.) |
| W-02  | Web       | Superviseur| P2 — Détail tournée  | (affiche tous les événements de la tournée)  |
| W-03  | Web       | Superviseur| P5 — Instruction     | InstructionEnvoyée, TournéeModifiée          |
| W-04  | Web       | Logisticien| P0 — Plan du jour    | TournéeAffectée, TourneeLancée, ImportTMSRafraîchi |
| W-05  | Web       | Logisticien| P0 — Détail préparation | TournéeAffectée, TourneeLancée, AnomalieChargeDétectée |

---

## Notes de conception transversales

### Design System — Tokens clés (Interface Web)

Les tokens suivants sont issus du design visuel du web designer et doivent être repris
tels quels par les développeurs front-end React/TypeScript :

| Token | Valeur | Usage |
|-------|--------|-------|
| primary | #0037B0 | Actions principales, barres de progression, liens actifs |
| error | #BA1A1A | Statut A RISQUE, badges non affectés, erreurs |
| tertiary | #7F2500 | Anomalies de charge, icônes d'avertissement |
| emerald-600 | #16A34A | Statut CLÔTURÉE, progression 100% |
| surface | #F7F9FB | Fond de page global |
| surface-container-lowest | #FFFFFF | Cartes et panneaux |
| outline-variant | #C4C5D7 | Bordures discrètes |

Typographies : `font-headline` = Work Sans (titres, codes de tournées), `font-body`/`font-label`
= Inter (tout le reste).

Rayons de bordure : DEFAULT = 0.125rem, lg = 0.25rem, xl = 0.5rem, full = 0.75rem.

### Offline-first (mobile)

Toutes les actions du livreur (livraison, échec, preuve) doivent être réalisables sans
connexion réseau. Les *événements* sont stockés localement et rejoués dès le retour de
la connexion (stratégie "event store local"). Un indicateur permanent de l'état de
synchronisation est visible sur M-02. Justification : "Les zones péri-urbaines ont une
connectivité variable." (M. Garnier, entretien terrain)

### Rapidité d'interaction mobile

Chaque action de mise à jour d'un *colis* (livré ou échec) doit être complétable en
moins de 45 secondes depuis l'écran M-02 jusqu'à la confirmation. C'est le KPI terrain
défini dans /livrables/01-vision/kpis.md. Les interactions doivent être possibles d'une
seule main.

### Mise à jour temps réel (web)

Le tableau de bord superviseur (W-01) et le détail de *tournée* (W-02) sont mis à jour
en temps réel via WebSocket. L'indicateur LIVE pulsant dans la TopAppBar affiche le délai
depuis la dernière synchronisation ("il y a Xs"). En cas de déconnexion, l'indicateur
passe au rouge et un bandeau d'alerte informe Laurent. L'objectif de latence est inférieur
à 30 secondes entre l'action terrain et la mise à jour de l'écran superviseur.

### Navigation et structure de l'application web

L'application web est organisée en deux sections principales accessibles via la SideNavBar :
- Préparation (/preparation) : accès via icône "pending_actions". Vue plan du jour +
  détail des *tournées* à préparer.
- Supervision (/supervision) : accès via icône "monitoring". Vue tableau de bord +
  détail des *tournées* en cours.

Cette séparation reflète les deux moments de la journée de Laurent Renaud (cf. journal
de bord : mode matin = préparation, mode journée = supervision).

### Gestion des états dégradés

Chaque écran doit avoir un état explicite pour : chargement, liste vide, erreur réseau,
mode offline. Ces états ne doivent jamais bloquer l'utilisateur sans lui indiquer ce qui
se passe et ce qu'il peut faire.

---

### Écran W-08 : État des livreurs

**Persona** : Laurent Renaud (Responsable Exploitation Logistique — mode journée)
**Objectif** : Visualiser en un coup d'oeil l'état du jour de tous les livreurs
(SANS_TOURNEE, AFFECTE_NON_LANCE, EN_COURS) sans croiser deux écrans, et identifier
rapidement les livreurs disponibles à affecter à une nouvelle *tournée*
**URL/Route** : /supervision/livreurs
**Domain Events affichés** : AffectationEnregistree, DesaffectationEnregistree,
TourneeLancee, TourneeClôturee (via Read Model VueLivreur)
**Domain Events déclenchés** : (aucun — écran lecture seule)
**US liées** : US-066 (page état livreurs)

#### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ DocuPost | [● LIVE il y a 5s]              [sync][notif]| L. Renaud │  TopAppBar
├──────────┬───────────────────────────────────────────────────────────┤
│          │  DocuPost > Supervision > État des livreurs               │  Fil d'Ariane
│  [ ] Pré │                                                           │
│  paration│  État des livreurs — Lundi 06/04/2026                    │  Titre page (Work Sans 700)
│  [■] Sup │                                                           │
│  ervision│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐│  Bandeau 3 tuiles
│  [►] Liv │  │ Sans tournée    │ │ Affectés        │ │ En cours    ││
│    reurs │  │       1   (gris)│ │       4   (bleu)│ │       1     ││
│          │  │ (fond surface-  │ │ (fond primary-  │ │ (fond emera ││  (fond emerald-50,
│  ────────│  │  container-low) │ │  container)     │ │  ld-50)     ││   bordure emerald)
│  [?] Aide│  └─────────────────┘ └─────────────────┘ └─────────────┘│
│  [⏻] Déco│                                                           │
│          │  [Tous (6)] [Sans tournée] [Affectés] [En cours]         │  Filtres rapides
│          │                              [Rafraîchir ↺]              │  (chip segmenté, même style W-01)
│          ├───────────────────────────────────────────────────────────┤
│          │  ┌─────────────────────────────────────────────────────┐ │
│          │  │ Livreur          │ État              │ Action        │ │  Tableau livreurs
│          │  ├──────────────────┼───────────────────┼───────────────┤ │
│          │  │ [PM] Pierre      │ [● EN COURS]      │ [Voir tournée]│ │  Ligne EN COURS
│          │  │      Martin      │  T-201            │               │ │  fond emerald-50/40
│          │  │                  │  (fond vert #1B5E │               │ │  bordure gauche emerald-600
│          │  │                  │   20, texte blanc)│               │ │
│          │  ├──────────────────┼───────────────────┼───────────────┤ │
│          │  │ [PD] Paul        │ [● EN COURS]      │ [Voir tournée]│ │
│          │  │      Dupont      │  T-204 [🔗 mobile]│               │ │  Indicateur mobile connecté
│          │  ├──────────────────┼───────────────────┼───────────────┤ │
│          │  │ [JM] Jean        │ [AFFECTÉ]         │ [Voir prépa]  │ │  Ligne AFFECTÉ
│          │  │      Moreau      │  T-202            │               │ │  fond primary-container/20
│          │  │                  │  (fond #E8F0FE,   │               │ │  bordure gauche #0037B0
│          │  │                  │   texte #0037B0)  │               │ │
│          │  ├──────────────────┼───────────────────┼───────────────┤ │
│          │  │ [SB] Sophie      │ [AFFECTÉ]         │ [Voir prépa]  │ │
│          │  │      Bernard     │  T-205            │               │ │
│          │  ├──────────────────┼───────────────────┼───────────────┤ │
│          │  │ [LP] Lucas       │ [AFFECTÉ]         │ [Voir prépa]  │ │
│          │  │      Petit       │  T-206            │               │ │
│          │  ├──────────────────┼───────────────────┼───────────────┤ │
│          │  │ [ML] Marie       │ [SANS TOURNÉE]    │ [Affecter]    │ │  Ligne SANS_TOURNEE
│          │  │      Lambert     │  —                │               │ │  fond surface-container-low
│          │  │                  │  (fond #EEEEEE,   │               │ │  pas de bordure colorée
│          │  │                  │   texte #616161)  │               │ │
│          │  └─────────────────────────────────────────────────────┘ │
│          │  [● WebSocket Connecté — Flux Temps Réel]  (pill bas-droit)│
└──────────┴───────────────────────────────────────────────────────────┘
```

#### Composants

##### SideNavBar — entrée "Livreurs"

Une troisième entrée est ajoutée dans la SideNavBar sous "Supervision" :
- Icône : `group` (Material Symbols).
- Libellé : "Livreurs".
- Route active : fond blanc, texte bleu primaire, shadow-sm (même règle que les autres
  entrées actives).
- Accessible depuis W-01 et W-04 via ce lien de navigation.

##### Bandeau 3 tuiles (KPI synthèse)

Grille 3 colonnes identique aux cartes KPI de W-01 :
- Tuile "Sans tournée" : fond surface-container-low (#ECEEF0), bordure gauche gris-600
  (#757575), icône `person_off`, nombre en gris-700 (Work Sans bold 4xl).
- Tuile "Affectés" : fond primary-container (#E8F0FE), bordure gauche primary (#0037B0),
  icône `assignment_ind`, nombre en primary (Work Sans bold 4xl).
- Tuile "En cours" : fond emerald-50, bordure gauche emerald-600 (#16A34A), icône
  `directions_run`, nombre en emerald-700 (Work Sans bold 4xl).

Chaque tuile est cliquable et active le filtre correspondant dans la liste.

##### Filtres rapides

Chips segmentés horizontaux (même composant que W-01 et W-04) :
- "Tous (N)" : fond neutre, badge gris.
- "Sans tournée" : fond surface-container-low, badge gris-600.
- "Affectés" : fond primary-container, badge primary.
- "En cours" : fond emerald-50, badge emerald-600.
Le chip actif porte une bordure inférieure bleue (#0037B0) et texte bleu.

Bouton "Rafraîchir" à droite : bouton secondaire, icône `refresh`.

##### Tableau des livreurs

Colonnes : Livreur (avatar initiales + nom complet), État (badge pill + codeTMS ou "—"),
Action.

- **Avatar initiales** : cercle 40px, fond primary-container, texte primary bold. Initiales
  dérivées du nom complet (ex. "PM" pour Pierre Martin).

- **Ligne EN_COURS** :
  - Fond : emerald-50/40.
  - Bordure gauche 3px : emerald-600 (#16A34A).
  - Badge "EN COURS" : fond #1B5E20, texte blanc, pill arrondi. Sous le badge : codeTMS
    (ex. "T-201") en texte sm gris.
  - Si le livreur a son application mobile connectée : icône `smartphone` bleue après le
    codeTMS avec tooltip "Application mobile connectée".
  - Action : bouton "Voir tournée" (fond primary/10, hover fond primary, texte primary).
    Redirige vers W-02 (Détail tournée superviseur).

- **Ligne AFFECTE_NON_LANCE** :
  - Fond : primary-container/20 (#E8F0FE à 20%).
  - Bordure gauche 3px : primary (#0037B0).
  - Badge "AFFECTÉ" : fond primary-container (#E8F0FE), texte primary (#0037B0), pill
    arrondi. Sous le badge : codeTMS en texte sm gris.
  - Action : bouton "Voir prépa" (fond surface-container-high, icône `open_in_new`).
    Redirige vers W-05 (Détail tournée à préparer).

- **Ligne SANS_TOURNEE** :
  - Fond : surface-container-low (#ECEEF0), opacité normale.
  - Pas de bordure colorée.
  - Badge "SANS TOURNÉE" : fond #EEEEEE, texte #616161, pill arrondi. Colonne codeTMS :
    tiret "—".
  - Action : bouton "Affecter" (fond primary, texte blanc, icône `add`).
    Redirige vers W-04 (/preparation) avec le filtre "Non affectées" présélectionné.

- **Tri par défaut** : EN_COURS en tête, puis AFFECTE_NON_LANCE, puis SANS_TOURNEE.
  Au sein de chaque groupe : ordre alphabétique du nom.

##### Mise à jour temps réel

Même mécanique que W-01 : canal WebSocket STOMP `/topic/livreurs/etat`. Quand un
Domain Event modifie l'état d'un livreur, la ligne se met à jour sans rechargement.
Transition visuelle : flash de fond (opacity 0 → 1 en 300ms) sur la ligne modifiée.
Indicateur WebSocket fixe (bottom-right) : pill flottante fond blanc/80 flou, point
pulsant vert, texte "Flux Temps Réel — WebSocket Connecté".

#### Interactions principales

- Clic sur une tuile KPI : active le filtre correspondant et fait défiler jusqu'au tableau.
- Clic sur un chip filtre : filtre la liste immédiatement (côté client, sans rechargement).
- Clic "Voir tournée" (ligne EN_COURS) : navigation SPA vers W-02 avec l'id de la
  *tournée*.
- Clic "Voir prépa" (ligne AFFECTE_NON_LANCE) : navigation SPA vers W-05 avec l'id de la
  *tournée planifiée*.
- Clic "Affecter" (ligne SANS_TOURNEE) : navigation vers W-04 (/preparation) avec
  paramètre ?filtre=NON_AFFECTEE présélectionné.
- Clic "Rafraîchir" : force un rechargement depuis l'API
  GET /api/supervision/livreurs/etat-du-jour.
- Retour : bouton "← Retour" dans le fil d'Ariane ramène à W-01 (/supervision).

#### États spéciaux

- **Chargement initial** : squelette (skeleton loader) pour chaque ligne du tableau,
  3 tuiles KPI affichent "—". Spinner sur le bouton Rafraîchir.
- **Liste vide** (aucun livreur inscrit) : illustration neutre centrée +
  "Aucun livreur enregistré pour cette date."
- **Filtre actif sans résultat** (ex. filtre "En cours" et aucune tournée lancée) :
  "Aucun livreur dans cet état pour aujourd'hui."
  Lien "Voir tous les livreurs" pour effacer le filtre.
- **Erreur réseau** : bannière rouge en haut de zone principale :
  "Impossible de charger l'état des livreurs. Dernière mise à jour : HH:MM. [Réessayer]"
- **Perte WebSocket** : même comportement que W-01 — badge LIVE passe rouge, bandeau
  "Connexion temps réel indisponible — Déconnecté depuis X s". Les données restent
  affichées (dernier état connu) mais un avertissement signale qu'elles peuvent être
  obsolètes.
- **Accès non autorisé** (rôle livreur) : redirection vers la page d'accueil mobile +
  message "Accès non autorisé".

#### Navigation entrante / sortante

| Depuis | Vers W-08 | Comment |
|--------|-----------|---------|
| W-01 Tableau de bord | /supervision/livreurs | Entrée "Livreurs" dans la SideNavBar |
| W-04 Plan du jour | /supervision/livreurs | Entrée "Livreurs" dans la SideNavBar |
| W-02 Détail tournée | /supervision/livreurs | Bouton retour ou SideNavBar |

| Depuis W-08 | Vers | Déclencheur |
|-------------|------|-------------|
| Bouton "Voir tournée" | W-02 /supervision/tournee/:id | Ligne EN_COURS |
| Bouton "Voir prépa" | W-05 /preparation/tournee/:id | Ligne AFFECTE_NON_LANCE |
| Bouton "Affecter" | W-04 /preparation?filtre=NON_AFFECTEE | Ligne SANS_TOURNEE |
| Fil d'Ariane "Supervision" | W-01 /supervision | Lien breadcrumb |

**Termes du domaine annotés** : *livreur*, *état du jour*, *SANS_TOURNEE*,
*AFFECTE_NON_LANCE*, *EN_COURS*, *VueLivreur*, *tournée planifiée*, *codeTMS*,
*AffectationEnregistree*, *DesaffectationEnregistree*, *TourneeLancee*, *TourneeClôturee*
