# Design Brief — Application Mobile Livreur (DocuPost)

> Document destiné au designer Figma — Interface A uniquement.
> Produit par @ux — 2026-03-25.
> Ce document est autonome : il contient l'intégralité des informations nécessaires
> pour concevoir l'application mobile sans consulter d'autre document.
>
> Source : design-brief-figma.md, wireframes.md v2.0, personas.md, user-journeys.md,
> backlog US-001 à US-009 et US-016 et US-019 et US-029, design-system.md v1.0.

---

## 1. Contexte produit

### Le produit

DocuPost est une plateforme de gestion de tournées de livraison pour La Docaposte. Elle
couvre deux rôles complémentaires : les livreurs terrain qui exécutent les tournées, et
les responsables logistiques / superviseurs qui préparent et pilotent ces tournées depuis
un bureau.

Le problème central que DocuPost résout est la rupture de traçabilité entre le terrain et
le SI : aujourd'hui les livreurs travaillent avec une feuille de route papier, les
superviseurs pilotent par téléphone sans visibilité en temps réel, et les preuves de
livraison sont difficiles à retrouver en cas de litige.

### L'utilisateur cible de cette interface

**Pierre Morel — Livreur terrain**
- 35 ans, VRP de tournée, 80 à 120 colis par jour.
- Smartphone Android (fourni par l'entreprise), utilisation mobile exclusive.
- Contexte d'usage : en mouvement, sol mouillé, soleil direct sur l'écran, parfois avec
  des gants. Connectivité variable (zones péri-urbaines à couverture réduite).
- Objectif quotidien : livrer ses colis le plus vite possible avec un minimum de friction
  administrative. Tolérance zéro aux formulaires complexes. Chaque action doit être
  réalisable en moins de 45 secondes.
- Frustrations actuelles : feuille de route mouillable, abréviations personnelles non
  exploitables, appels téléphoniques du superviseur au mauvais moment.

### Contexte technique

- Application mobile : React Native, Android (prioritaire), iOS (secondaire).
- Mode offline obligatoire sur mobile : toutes les actions doivent être exécutables sans
  réseau, avec synchronisation automatique au retour de connexion.
- Authentification : SSO corporate OAuth2 (Docaposte).

---

## 2. Interface A — Application mobile livreur

**Objectif principal** : Permettre à Pierre de gérer sa tournée du jour de façon autonome
et rapide, depuis la prise en main des colis le matin jusqu'à la clôture de la tournée
en fin de journée.

**Contexte d'utilisation** : Smartphone Android, usage en extérieur, une seule main,
en mouvement. La lumière directe du soleil, les mains mouillées ou gantées sont des
contraintes réelles. L'écran peut être lu à bout de bras.

**Contraintes d'usage critiques** :
- Taille minimale de texte corps : 16px (lisibilité soleil / gant).
- Touch target minimum absolu : 48x48px pour tout élément interactif.
- Toutes les actions doivent être réalisables d'une seule main.
- Mode offline-first : l'application fonctionne sans réseau. Un indicateur permanent
  (badge LIVE / OFFLINE) est visible sur chaque écran principal.
- Pas de formulaires longs : maximum 2 choix obligatoires par écran d'action.
- Retour automatique vers la liste des colis après toute action (livraison, échec, preuve).

**Plateforme cible** : Android natif (grille 375px, safe area respectée, notch géré).

---

## 3. Ecrans à concevoir

---

#### Ecran M-01 : Authentification

**Route** : `/auth`
**User Stories associées** : US-019 (Authentification SSO mobile)

**Fonctionnalités attendues** :
- Ecran de démarrage et d'authentification via SSO corporate Docaposte.
- Logo DocuPost centré.
- Titre de bienvenue et sous-titre.
- Un seul bouton d'action : "Se connecter via compte Docaposte". Déclenche le flux
  OAuth2 / SSO (redirection vers la page SSO corporate).
- Version applicative en bas d'écran.

**Données affichées** :
- Logo DocuPost.
- "Bienvenue sur DocuPost" (titre).
- "Votre outil de tournée" (sous-titre).
- Numéro de version (ex : v 2.0.0 — Docaposte).

**Actions utilisateur** :
- Tap "Se connecter via compte Docaposte" → flux SSO OAuth2.

**Règles métier visibles** :
- Aucune connexion SSO n'est possible en mode offline (le bouton est désactivé si
  l'appareil est hors ligne au démarrage).

**États à couvrir** :
- Etat normal : bouton actif.
- Chargement (redirection SSO en cours) : spinner dans le bouton, label "Connexion en
  cours...", bouton désactivé.
- Erreur SSO : card d'erreur centrée avec icône alerte + message + bouton "Réessayer".
- Mode offline au démarrage : message "Vous êtes hors ligne. Reconnectez-vous avant de
  démarrer." Bouton désactivé.

---

#### Ecran M-02 : Liste des colis de la tournée

**Route** : `/tournee`
**User Stories associées** : US-001 (Consulter la liste des colis), US-002 (Suivre la
progression), US-003 (Filtrer par zone), US-006 (Mode offline), US-007 (Clôturer la
tournée), US-029 (Swipe rapide échec)

**Fonctionnalités attendues** :
- Ecran principal du livreur, affiché en permanence pendant la tournée.
- Header avec titre "Tournée du JJ/MM/AAAA", menu hamburger gauche, icône aide droite.
- Bandeau de progression : "Reste à livrer : X / Y", barre de progression, estimation
  de fin de tournée (ex : "Fin estimée : 17h30"), badge LIVE / OFFLINE.
- Filtres par zone en onglets scrollables horizontalement (Zone A, Zone B, Tous...).
- Compteur de colis par onglet.
- Liste de cards de colis :
  - Badge statut en haut à gauche (A LIVRER / LIVRE / ECHEC / A REPRESENTER).
  - Chip contrainte horaire si applicable (ex : ⚑ Avant 14h).
  - Adresse principale (texte gras).
  - Nom du destinataire + complément d'adresse.
  - Cards livrées : opacité réduite (0,7).
- Swipe gauche sur une card : action rapide "Déclarer un échec" (shortcut - US-029).
- Infinite scroll vers le bas.
- Footer fixe : bouton [Scan colis] + bouton [Clôturer la tournée] (uniquement visible
  si tous les colis sont traités).

**Données affichées** :
- Reste à livrer : X / Y colis.
- Estimation fin de tournée (HH:MM).
- Pour chaque colis : badge statut, contrainte horaire, adresse, destinataire.
- Badge LIVE (vert) / OFFLINE (orange) dans le bandeau de progression.
- En mode offline : horodatage des actions en attente de synchronisation.

**Actions utilisateur** :
- Tap sur une card → navigation vers M-03 (Détail du colis).
- Tap sur un onglet zone → filtre la liste (animation fade).
- Swipe gauche sur une card → action rapide "Déclarer un échec" (accès direct à M-05).
- Tap [Scan colis] → ouverture du scanner code-barres.
- Tap [Clôturer la tournée] → confirmation + clôture.
- Notification push reçue → overlay M-06 s'affiche par-dessus cet écran.

**Règles métier visibles** :
- Le bouton [Clôturer] n'est visible que si tous les colis sont au statut terminal
  (livré ou échec).
- L'indicateur passe OFFLINE (orange) automatiquement dès perte du réseau.
- Les actions (livraison, échec) restent disponibles en mode offline.

**États à couvrir** :
- Etat normal : liste mixte avec colis à livrer, livrés, en échec.
- Mode offline : bandeau orange fixe sous le header "Hors connexion — Données locales".
  Icône sync en attente. Toutes les actions disponibles.
- Synchronisation en cours : icône rotation dans le bandeau de progression.
- Liste vide : illustration + "Aucun colis assigné pour aujourd'hui. Contactez votre
  superviseur."
- Chargement initial : skeleton 5 cards animées.
- Mise à jour temps réel d'un colis : animation pulse sur l'item modifié.
- Colis clôturé par swipe : animation de sortie vers la gauche.

---

#### Ecran M-03 : Détail d'un colis

**Route** : `/tournee/colis/:id`
**User Stories associées** : US-004 (Accéder au détail), US-005 (Déclarer un échec),
US-008 (Capturer une signature)

**Fonctionnalités attendues** :
- Header : bouton retour chevron gauche, titre "Colis #XXXXX", badge statut aligné à
  droite.
- Section DESTINATAIRE : nom complet, adresse complète avec complément (appartement,
  étage).
- Bouton "Ouvrir la carte" → ouvre Google Maps avec coordonnées pré-remplies.
- Bouton "Appeler" → appel direct (numéro non exposé en clair).
- Section CONTRAINTES : chips de contrainte (ex : ⚑ Avant 14h, ⚑ Fragile). Masquée
  si aucune contrainte.
- Section HISTORIQUE DES TENTATIVES : liste chronologique des tentatives précédentes
  avec date, numéro de tentative et motif. Masquée si aucune tentative antérieure.
- Deux boutons d'action :
  - [LIVRER CE COLIS →] (bouton primaire).
  - [DECLARER UN ECHEC] (bouton secondaire, style outline, couleur alerte).

**Données affichées** :
- Identifiant du colis (ex : #00247).
- Nom du destinataire + adresse complète + complément.
- Contraintes actives (chips visuels).
- Historique des tentatives (si > 0) : date + numéro + motif.

**Actions utilisateur** :
- Tap [LIVRER CE COLIS →] → navigation vers M-04 (Capture de preuve).
- Tap [DECLARER UN ECHEC] → navigation vers M-05 (Déclaration d'échec).
- Tap "Ouvrir la carte" → ouvre l'app cartographique native.
- Tap "Appeler" → appel téléphonique direct.
- Tap retour chevron → retour vers M-02.

**Règles métier visibles** :
- Si le colis est déjà livré : les deux boutons sont remplacés par une card succès
  "Livré le JJ/MM à HH:MM ✓" (fond vert clair).
- Si le colis est en échec : card échec "Echec déclaré — Motif : [motif]" + bouton
  "Modifier la déclaration" si encore modifiable.
- Un colis au statut terminal (livré ou échec) ne peut pas être re-traité.

**États à couvrir** :
- Etat normal : colis à livrer, deux boutons d'action visibles.
- Colis déjà livré : card succès, pas de boutons d'action.
- Colis en échec : card échec avec motif.
- Chargement : skeleton de la fiche (3 sections).
- Mode offline : indicateur discret dans le header.

---

#### Ecran M-04 : Capture de la preuve de livraison

**Route** : `/tournee/colis/:id/preuve`
**User Stories associées** : US-008 (Signature numérique), US-009 (Photo ou tiers)

**Fonctionnalités attendues** :
- Header : bouton retour, titre "Preuve de livraison".
- Bandeau de rappel contexte : identifiant colis + nom du destinataire (lecture seule).
- Sélecteur de type de preuve : 4 cards en grille 2x2.
  - Card "Signature du destinataire".
  - Card "Photo du colis déposé".
  - Card "Remise à un tiers".
  - Card "Dépôt sécurisé".
- Zone dynamique selon le type sélectionné :
  - **Signature** : pad tactile (zone de dessin 240px de hauteur), ligne de base
    pointillée, bouton "Effacer la signature" sous le pad.
  - **Photo** : bouton "Prendre une photo" (déclenche la caméra native), preview après
    capture (80x80px miniature), bouton "Reprendre" sous la preview.
  - **Tiers** : champ texte "Nom du tiers" (obligatoire).
  - **Dépôt sécurisé** : champ texte libre "Description du lieu" ou liste déroulante.
- Bouton [CONFIRMER LA LIVRAISON ✓] : désactivé (grisé) si aucune preuve capturée.
  Fond vert quand actif.
- Caption sous le bouton : "Géolocalisation et horodatage enregistrés automatiquement."

**Données affichées** :
- Rappel : identifiant colis + nom destinataire (bandeau fixe).
- Zone de signature / preview photo / champ tiers selon le type sélectionné.

**Actions utilisateur** :
- Tap sur une card type → sélection (la zone dynamique change).
- Dessin sur le pad de signature.
- Tap "Effacer la signature" → remise à zéro du pad.
- Tap "Prendre une photo" → ouverture caméra native.
- Saisie nom du tiers.
- Tap [CONFIRMER LA LIVRAISON] → enregistrement de la preuve + événements + retour M-02.

**Règles métier visibles** :
- Le bouton [CONFIRMER LA LIVRAISON] reste désactivé tant qu'aucune preuve n'est
  capturée (pad de signature vide, pas de photo, champ tiers vide).
- L'horodatage et les coordonnées GPS sont capturés automatiquement et ne peuvent pas
  être modifiés manuellement.
- En l'absence de signal GPS, la confirmation reste possible avec un message informatif
  indiquant le mode dégradé.
- La preuve est immuable après confirmation (pas de bouton "modifier" après validation).

**États à couvrir** :
- Etat normal : sélecteur de type visible, aucun type sélectionné.
- Type Signature sélectionné, pad vide : bouton désactivé.
- Type Signature sélectionné, pad signé : bouton actif (fond vert).
- Type Photo sélectionné, photo prise : bouton actif + preview visible.
- Confirmation réussie : animation checkmark 1s puis retour automatique M-02.
- Mode offline : bandeau orange "Hors connexion — La preuve sera synchronisée au retour
  du réseau." Bouton confirmation disponible.
- Erreur caméra : message inline "Impossible d'accéder à l'appareil photo." + bouton
  "Paramètres".
- GPS indisponible : caption "Position GPS non disponible — livraison confirmée sans
  coordonnées (mode dégradé)."

---

#### Ecran M-05 : Déclaration d'un échec de livraison

**Route** : `/tournee/colis/:id/echec`
**User Stories associées** : US-005 (Déclarer un échec), US-029 (Swipe rapide)

**Fonctionnalités attendues** :
- Header avec barre supérieure colorée "alerte" (signal visuel fort que l'on est sur
  un écran d'échec), titre "Echec de livraison".
- Bandeau de rappel contexte : identifiant colis + nom destinataire.
- Section "MOTIF DE NON-LIVRAISON" (obligatoire, astérisque visible) :
  liste de 4 items radio.
  - Absent.
  - Accès impossible.
  - Refus du client.
  - Horaires dépassés.
- Section "QUE FAIRE DE CE COLIS ?" (obligatoire) : liste de 3 items radio.
  - A représenter.
  - Dépôt chez un tiers.
  - Retour au dépôt.
  - La section disposition se déverrouille uniquement après sélection du motif.
- Section "NOTE TERRAIN" (optionnel, 250 caractères max) : champ texte multiligne avec
  compteur de caractères en temps réel.
- Bouton [ENREGISTRER L'ECHEC] : style outline alerte, désactivé tant que motif et
  disposition ne sont pas sélectionnés.

**Données affichées** :
- Identifiant colis + nom destinataire.
- Liste des 4 motifs normalisés.
- Liste des 3 dispositions possibles.
- Compteur caractères : "X / 250".

**Actions utilisateur** :
- Sélection d'un motif → déverrouille la section disposition.
- Sélection d'une disposition.
- Saisie note optionnelle.
- Tap [ENREGISTRER L'ECHEC] → horodatage + géolocalisation auto + événements +
  notification superviseur + retour M-02.

**Règles métier visibles** :
- La section "Disposition" est grisée et non interactive avant qu'un motif soit sélectionné.
- Le bouton [ENREGISTRER L'ECHEC] est désactivé tant que motif ET disposition ne sont
  pas sélectionnés.
- Si la note dépasse 250 caractères : compteur passe rouge, bouton désactivé.
- L'action est disponible en mode offline (synchronisation différée).
- Un colis déjà en statut "échec" : le système affiche "Echec déjà déclaré — Motif : [motif]"
  et aucune nouvelle action n'est possible.

**États à couvrir** :
- Etat normal : motif non sélectionné, disposition grisée, bouton désactivé.
- Motif sélectionné : disposition active.
- Motif + disposition sélectionnés : bouton actif.
- Note trop longue (> 250 car.) : compteur rouge, bouton désactivé.
- Mode offline : bandeau orange "Hors connexion — L'échec sera synchronisé au retour
  du réseau." Actions disponibles.
- Disposition "A représenter" sélectionnée : toast informatif après enregistrement
  "Ce colis est marqué pour une nouvelle tentative."
- Colis déjà en échec : card d'état bloquant.

---

#### Ecran M-06 : Notification d'instruction reçue (composant overlay)

**Route** : Overlay — s'affiche par-dessus tout écran mobile
**User Stories associées** : US-016 (Notification push instruction)

**Fonctionnalités attendues** :
- Composant overlay (pas un écran plein) — s'affiche en haut de l'écran par-dessus
  l'écran courant, quel qu'il soit.
- Fond distinctif bleu foncé superviseur (différent du bleu primaire DocuPost).
- Icône superviseur + titre "INSTRUCTION SUPERVISEUR" en majuscules.
- Corps : type d'instruction (ex : "Prioriser le colis #00312") + adresse du colis.
- Deux boutons :
  - [VOIR →] : navigue vers M-03 du colis concerné.
  - [OK ✓] : acquitte la notification sans navigation.
- Barre de progression fine en bas de l'overlay : compte à rebours 10 secondes.
- Disparition automatique après 10 secondes si aucune interaction (glissement vers le
  haut).
- Swipe up sur l'overlay : fermeture rapide.

**Données affichées** :
- Type d'instruction (ex : Prioriser / Annuler / Reprogrammer).
- Identifiant du colis concerné.
- Adresse du colis.
- Compte à rebours visuel (10s).

**Actions utilisateur** :
- Tap [VOIR →] → navigation vers M-03 du colis.
- Tap [OK ✓] → acquittement, fermeture de l'overlay.
- Swipe up → fermeture rapide.
- Expiration (10s) → fermeture automatique + bandeau persistant discret dans M-02.

**Règles métier visibles** :
- L'overlay s'affiche par-dessus tout écran de l'application (même M-04 ou M-05).
- L'acquittement de la notification ne signifie pas l'exécution de l'instruction.
- La liste M-02 est déjà mise à jour au moment de la réception de la notification.

**États à couvrir** :
- Etat normal : overlay visible, compte à rebours actif.
- Interaction [VOIR] : fermeture + navigation.
- Interaction [OK] ou expiration : fermeture + bandeau discret persistant sur M-02.
- Swipe up : fermeture rapide animée.

---

## 4. Navigation et flux

### Point d'entrée

```
Application mobile (livreur) :
  M-01 (Authentification SSO)
    → succès SSO → M-02 (Liste des colis)
```

### Flux principal mobile livreur (happy path)

```
M-01 (Authentification)
  |
  → M-02 (Liste des colis de la tournée)
      |
      → [tap sur une card] → M-03 (Détail d'un colis)
           |
           → [LIVRER CE COLIS] → M-04 (Capture de la preuve)
           |                         → [CONFIRMER] → retour M-02 ✓
           |
           → [DECLARER UN ECHEC] → M-05 (Déclaration d'échec)
                                       → [ENREGISTRER] → retour M-02 ✓
      |
      → [Clôturer la tournée] → confirmation → récapitulatif → fin
      |
      → [overlay M-06] (notification instruction)
           → [VOIR] → M-03 du colis concerné
           → [OK] → retour M-02
```

### Flux alternatif — swipe rapide (US-029)

```
M-02 (Liste des colis)
  → [swipe gauche sur une card]
  → M-05 (Déclaration d'échec) avec motif pré-rempli "Absent"
  → [ENREGISTRER] → retour M-02 ✓
```

### Flux alternatif — mode offline livreur

```
M-02 → perte réseau → bandeau orange "Hors connexion"
  → toutes les actions de livraison / échec / preuve restent disponibles
  → événements stockés localement
  → retour réseau → synchronisation automatique → bandeau disparaît
    → indicateur "Synchronisation en cours" dans le bandeau de progression
```

---

## 5. Contraintes design

### Accessibilité terrain (mobile)

- **Taille de texte minimum** : 16px pour tout le corps de texte (lecture en plein soleil
  avec lunettes de soleil ou à bout de bras).
- **Touch target minimum absolu** : 48x48px pour tout élément interactif. Les boutons
  principaux font 56px de hauteur.
- **Contraste** : tous les textes sur fonds colorés doivent respecter WCAG AA minimum
  (ratio 4,5:1). Les badges de statut sont conçus avec texte foncé sur fond clair ou
  texte blanc sur fond foncé avec ratio suffisant.
- **Usage à une main** : les actions principales (boutons CTA) sont placées en bas
  d'écran dans la zone de confort du pouce. Pas d'action critique en haut d'écran hors
  de portée du pouce.
- **Feedback haptique** : les confirmations importantes (livraison confirmée, échec
  enregistré) déclenchent une vibration courte (non à modéliser en maquette mais à
  annoter).

### Responsive / plateforme cible

- **Mobile** : Android prioritaire. Grille 375px. Safe area (notch + barre de navigation)
  respectée. Hauteur d'écran variable (360px à 900px) : les listes sont scrollables,
  les éléments fixes ne bloquent pas le contenu.

### Identité visuelle — Design System DocuPost v1.0

Les tokens sémantiques ci-dessous sont la référence absolue. Ne pas utiliser de valeurs
brutes en dehors des tokens.

**Couleurs principales** :

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-primaire` | `#1D4ED8` | Boutons CTA, liens actifs, navigation |
| `--color-succes` | `#16A34A` | Statut LIVRE, CLOTURE, AFFECTE |
| `--color-alerte` | `#DC2626` | Statut ECHEC, NON AFFECTE, A RISQUE |
| `--color-avertissement` | `#D97706` | A REPRESENTER, anomalie de charge |
| `--color-info` | `#2563EB` | Statut A LIVRER, EN COURS |
| `--color-info-fonce` | `#1E3A8A` | Fond bandeau instruction superviseur |
| `--color-fond-alerte` | `#FEF3C7` | Bandeau plan du jour (anomalie) |
| `--color-surface-primary` | `#FFFFFF` | Fond principal (cartes, header) |
| `--color-surface-secondary` | `#F8FAFC` | Fond secondaire (lignes alternées) |

**Typographie** :
- Mobile : Inter uniquement. Titre H1 : SemiBold 24px. Corps : Regular 16px minimum.
  Labels de section : SemiBold 12px uppercase.

**Composants design system existants** (déjà implémentés côté dev — les maquettes Figma
doivent s'aligner sur ces composants) :
- `BadgeStatut` : badge coloré selon statut (A LIVRER / LIVRE / ECHEC / EN COURS /
  A RISQUE / CLOTURE).
- `BoutonCTA` : bouton primaire plein, secondaire outline, tertiaire texte.
- `BandeauProgression` : barre + compteur + estimation + badge LIVE/OFFLINE.
- `CarteColis` : card colis avec badge, adresse, destinataire, contrainte.
- `ChipContrainte` : chip ⚑ avec label de contrainte.
- `IndicateurSync` : badge LIVE (vert) / POLLING (orange) / OFFLINE (rouge).
- `BandeauInstruction` : overlay notification instruction superviseur (mobile).
- `CardTypePreuve` : card sélectionnable pour le type de preuve (M-04).

---

## 6. Priorités de conception

### Ecrans critiques MVP — à concevoir en premier (P0)

| Priorité | Ecran | Raison |
|----------|-------|--------|
| P0 | M-02 — Liste des colis | Ecran principal livreur, utilisé 100% du temps |
| P0 | M-03 — Détail d'un colis | Point de départ de toute action (livraison ou échec) |
| P0 | M-04 — Capture de preuve | Preuve de livraison = obligation légale et KPI central |
| P0 | M-05 — Déclaration échec | Flux de non-livraison = cas fréquent (15-20% des colis) |

### Ecrans importants MVP — à concevoir en second (P1)

| Priorité | Ecran | Raison |
|----------|-------|--------|
| P1 | M-01 — Authentification | Requis pour entrer dans l'application |
| P1 | M-06 — Notification instruction | Flux temps réel superviseur → livreur |

### Ecrans pouvant être simplifiés en V1 (P2)

| Priorité | Ecran | Simplification acceptable |
|----------|-------|--------------------------|
| P2 | M-02 scan colis | Bouton présent mais flux scanner en V2 |

### Etats pouvant être simplifiés en V1

Les états de chargement (skeleton) et les états vides peuvent utiliser des variantes
simplifiées en V1. Les états d'erreur (GPS, caméra, réseau) doivent être maquettés car
ils surviennent en production terrain.

---

## 7. Glossaire — Termes du domaine (Ubiquitous Language)

Les termes ci-dessous sont les termes exacts utilisés par les utilisateurs sur le terrain.
Ils doivent apparaître tels quels dans les libellés de l'interface (pas de synonymes,
pas de reformulation).

| Terme | Définition utilisateur | Ecrans concernés |
|-------|----------------------|-----------------|
| Tournée | Ensemble des colis à livrer dans une journée, sur une zone donnée | Tous |
| Colis | Unité de livraison assignée à une adresse et un destinataire | M-02, M-03, M-04, M-05 |
| Reste à livrer | Nombre de colis non encore traités dans la tournée | M-02 |
| Motif de non-livraison | Raison normalisée d'un échec : Absent, Accès impossible, Refus client, Horaires dépassés | M-05 |
| Disposition | Ce que l'on fait du colis en cas d'échec : A représenter, Dépôt chez tiers, Retour dépôt | M-05 |
| A représenter | Colis à tenter à nouveau lors d'une prochaine tournée | M-02, M-05 |
| Preuve de livraison | Signature, photo, tiers ou dépôt sécurisé capturé au moment de la remise | M-04 |
| Instruction | Ordre structuré envoyé par le superviseur au livreur (Prioriser / Annuler / Reprogrammer) | M-06 |
| Incident | Echec de livraison notifié au superviseur | M-05 |
| Note terrain | Commentaire libre (250 car. max) saisi par le livreur lors d'un échec | M-05 |
| Zone | Secteur géographique regroupant plusieurs adresses dans une même tournée | M-02 |
| Contrainte | Condition de livraison spéciale (horaire limite, colis fragile) | M-03 |
| Acquittement | Action du livreur de confirmer la lecture d'une notification d'instruction | M-06 |
