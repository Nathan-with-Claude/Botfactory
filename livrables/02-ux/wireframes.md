# Wireframes textuels DocuPost

> Document de référence — Version 1.1 — 2026-03-20
> Mis à jour suite à l'entretien complémentaire du 2026-03-20 avec M. Renaud :
> ajout des wireframes W-04 (Vue liste des tournées du matin) et W-05 (Détail d'une
> tournée à préparer) couvrant le Parcours 0 — Préparation des tournées (interface web,
> responsable logistique).
>
> Version 1.0 produite le 2026-03-19 à partir des personas (/livrables/02-ux/personas.md),
> des user journeys (/livrables/02-ux/user-journeys.md) et du périmètre MVP
> (/livrables/01-vision/perimetre-mvp.md).
>
> Conventions :
> - Les wireframes sont textuels et décrivent le layout, les zones, les composants et les
>   interactions principales.
> - Les termes en *italique* sont les termes du domaine (Ubiquitous Language).
> - Chaque écran est annoté avec les Domain Events qu'il déclenche ou affiche.
> - Les états spéciaux (liste vide, chargement, erreur réseau, mode offline) sont décrits
>   pour chaque écran.

---

## Interface web — Responsable logistique (Parcours 0)

---

### Écran W-04 : Vue liste des tournées du matin

**Persona** : Laurent Renaud (Responsable Exploitation Logistique)
**Objectif** : Visualiser l'ensemble des *tournées TMS* importées du matin, identifier
celles non encore affectées, et lancer les *affectations* depuis un tableau consolidé
**URL/Route** : /preparation
**Domain Events déclenchés** : TournéeImportéeTMS (à l'import), AffectationEnregistrée,
TournéeLancée
**Domain Events affichés** : TournéeImportéeTMS, TournéeVérifiée, AffectationEnregistrée

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  DocuPost Préparation  |  20/03/2026 — Matin  |  [Déconnexion] │  Header global
├─────────────────────────────────────────────────────────────────┤
│  Plan du jour : 12 tournées  |  3 non affectées  |  9 affectées │  Bandeau résumé
│  0 lancées                  |  [LANCER TOUTES LES TOURNÉES]     │  Bouton de lancement global
├─────────────────────────────────────────────────────────────────┤
│  Filtres : [Toutes] [Non affectées] [Affectées] [Lancées]       │  Filtres de liste
├──────────┬──────────┬──────────┬─────────────┬─────────────────┤
│ Tournée  │ Nb colis │ Zone(s)  │ Statut      │ Actions         │  En-tête tableau
├──────────┼──────────┼──────────┼─────────────┼─────────────────┤
│ T-201    │ 34 colis │ Lyon 3e  │ NON AFFECTÉE│ [Affecter] [Voir│
│          │          │ Lyon 6e  │  ●          │  détail]        │  Ligne non affectée — badge rouge
├──────────┼──────────┼──────────┼─────────────┼─────────────────┤
│ T-202    │ 28 colis │ Villeurbanne│ AFFECTÉE  │ P. Morel        │
│          │          │          │  ●          │ Véhicule VH-07  │  Ligne affectée — badge vert
│          │          │          │             │ [Voir détail] [Lancer]│
├──────────┼──────────┼──────────┼─────────────┼─────────────────┤
│ T-203    │ 41 colis │ Lyon 8e  │ NON AFFECTÉE│ [Affecter] [Voir│
│          │          │ Lyon 5e  │  ● ⚠ Charge │  détail]        │  Surbrillance orange : surcharge détectée
├──────────┼──────────┼──────────┼─────────────┼─────────────────┤
│ T-204    │ 22 colis │ Lyon 2e  │ LANCÉE      │ P. Dupont       │
│          │          │          │  ●          │ Véhicule VH-03  │  Ligne lancée — badge bleu, lecture seule
│          │          │          │             │ [Voir détail]   │
└──────────┴──────────┴──────────┴─────────────┴─────────────────┘
│  [Charger plus]                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Composants

- Header global : logo, titre "Préparation", date du matin, bouton de déconnexion.
- Bandeau résumé : compteurs en temps réel — total des *tournées TMS* importées, répartition
  par statut (non affectées, affectées, lancées). Bouton "LANCER TOUTES LES TOURNÉES"
  visible uniquement si aucune *tournée* n'est encore lancée et toutes sont affectées.
- Filtres par statut : Toutes, Non affectées, Affectées, Lancées.
- Tableau des *tournées TMS* :
  - Colonnes : code *tournée*, nombre de *colis*, zones couvertes, statut d'*affectation*
    (badge coloré), livreur assigné, *véhicule* assigné, actions disponibles.
  - Ligne *tournée* non affectée : badge rouge "NON AFFECTÉE". Boutons "Affecter" et
    "Voir détail".
  - Ligne *tournée* affectée : badge vert "AFFECTÉE". Livreur et *véhicule* affichés.
    Boutons "Voir détail" et "Lancer".
  - Ligne *tournée* avec anomalie détectée (surcharge) : surbrillance orange, icône
    alerte, libellé de l'anomalie (ex. "Charge dépassée").
  - Ligne *tournée* lancée : badge bleu "LANCÉE". Lecture seule. Bouton "Voir détail"
    uniquement.

#### Interactions principales

- Appui sur "Affecter" : ouvre W-05 (Détail d'une tournée à préparer) en mode affectation.
- Appui sur "Voir détail" : ouvre W-05 en mode consultation.
- Appui sur "Lancer" d'une *tournée* affectée : déclenche **TournéeLancée**. La *tournée*
  devient visible dans l'application mobile du livreur assigné. La ligne passe au statut
  "LANCÉE".
- Appui sur "LANCER TOUTES LES TOURNÉES" : déclenche **TournéeLancée** pour chaque
  *tournée* affectée non encore lancée. Confirmation demandée avant l'action.
- Appui sur un filtre : filtre la liste immédiatement.
- Import TMS automatique : les *tournées TMS* sont importées au chargement de la page
  ou sur action manuelle "Rafraîchir depuis TMS".

#### États spéciaux

- Import TMS non encore reçu : "Aucune tournée importée pour aujourd'hui. Import TMS
  en attente ou à déclencher manuellement."
- Toutes les *tournées* sont lancées : bannière verte "Toutes les tournées ont été lancées.
  Les livreurs ont reçu leur tournée."
- Anomalie sur une *tournée* : icône alerte sur la ligne + descriptif au survol (nombre
  de *colis* au-delà du seuil, zone inhabituelle).
- Perte de connexion serveur : bandeau rouge "Connexion perdue — Dernière synchronisation
  TMS à HH:MM".

**Termes du domaine annotés** : *tournée TMS*, *plan du jour*, *affectation*, *lancement de tournée*,
*véhicule*, *colis*, *zone*, *composition de tournée*

---

### Écran W-05 : Détail d'une tournée à préparer

**Persona** : Laurent Renaud (Responsable Exploitation Logistique)
**Objectif** : Vérifier la *composition de tournée*, affecter un livreur et un *véhicule*,
puis lancer la *tournée*
**URL/Route** : /preparation/tournee/:id
**Domain Events déclenchés** : TournéeVérifiée, AffectationEnregistrée, TournéeLancée

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [< Plan du jour]  Tournée T-203 — Non affectée  ⚠ Surcharge   │  Header + retour + statut
├─────────────────────────────────────────────────────────────────┤
│  Import TMS du 20/03/2026 à 06h14  |  41 colis  |  2 zones     │  Méta-données de la tournée
├─────────────────────────────────────────────────────────────────┤
│  [Composition]  [Affectation]                                   │  Onglets principaux
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Onglet Composition actif]                                      │
│                                                                  │
│  Zones couvertes                                                 │
│  ● Lyon 8e — 27 colis   ● Lyon 5e — 14 colis                   │  Répartition par zone
│                                                                  │
│  Contraintes horaires                                            │
│  ⚑ 6 colis avec horaire avant 10h00                             │  Contraintes détectées
│  ⚑ 3 colis avec horaire avant 12h00                             │
│                                                                  │
│  ⚠ Anomalie détectée : 41 colis dépasse le seuil de 35 pour    │  Bloc anomalie visible
│  ce type de tournée (zone péri-urbaine). Vérifier avant         │
│  de lancer.                                                      │
│                                                                  │
│  Liste des colis                                                 │
│  ┌────────┬───────────────────────────┬──────────┬───────────┐  │
│  │ Colis  │ Adresse                   │ Zone     │ Contrainte│  │
│  ├────────┼───────────────────────────┼──────────┼───────────┤  │
│  │ #01042 │ 8 Rue Moïse, Lyon 8e      │ Lyon 8e  │ Avant 10h │  │
│  ├────────┼───────────────────────────┼──────────┼───────────┤  │
│  │ #01043 │ 15 Cours Gambetta, Lyon 5e│ Lyon 5e  │ —         │  │
│  ├────────┼───────────────────────────┼──────────┼───────────┤  │
│  │ #01044 │ 3 Allée des Acacias, Lyon 5│ Lyon 5e │ Fragile   │  │
│  └────────┴───────────────────────────┴──────────┴───────────┘  │
│  [Voir tous les 41 colis]                                        │
└─────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────┐
│  [< Plan du jour]  Tournée T-203 — Non affectée                 │  Header
├─────────────────────────────────────────────────────────────────┤
│  [Composition]  [Affectation ●]                                 │  Onglet Affectation actif
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Livreur                                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Sélectionner un livreur disponible...             [▼]   │   │  Sélecteur livreur
│  └──────────────────────────────────────────────────────────┘   │
│  Livreurs disponibles : P. Morel, L. Petit, S. Roger (3/8)      │  Info disponibilité
│                                                                  │
│  Véhicule                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Sélectionner un véhicule disponible...            [▼]   │   │  Sélecteur véhicule
│  └──────────────────────────────────────────────────────────┘   │
│  Véhicules disponibles : VH-04, VH-07, VH-11 (3/6)             │  Info disponibilité
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌──────────────────────────────┐   │
│  │  VALIDER L'AFFECTATION │  │  VALIDER ET LANCER           │   │  Actions principales
│  └────────────────────────┘  └──────────────────────────────┘   │
│  Les deux boutons sont désactivés tant que livreur et véhicule  │
│  ne sont pas sélectionnés.                                       │
└─────────────────────────────────────────────────────────────────┘
```

#### Composants

**Onglet Composition**

- Header avec bouton retour vers W-04, identifiant de la *tournée*, statut, indicateur
  d'anomalie si présent.
- Méta-données : horodatage de l'import TMS, nombre total de *colis*, nombre de zones.
- Zones couvertes : liste des zones avec nombre de *colis* par zone.
- Contraintes horaires : liste des contraintes détectées (nombre de *colis* concernés
  par plage horaire).
- Bloc anomalie : encadré orange visible si une anomalie est détectée (surcharge,
  zone inhabituelle). Descriptif de l'anomalie et recommandation.
- Liste des *colis* de la *tournée* : tableau avec colonnes identifiant *colis*, adresse,
  zone, contrainte. Affichage paginé avec option "Voir tous".

**Onglet Affectation**

- Sélecteur "Livreur" : liste déroulante des livreurs disponibles ce matin avec leur nom.
  Libellé informatif du nombre de livreurs disponibles.
- Sélecteur "Véhicule" : liste déroulante des *véhicules* disponibles avec leur
  identifiant. Libellé informatif du nombre de *véhicules* disponibles.
- Bouton "VALIDER L'AFFECTATION" : enregistre l'*affectation* sans lancer la *tournée*.
  Déclenche **AffectationEnregistrée**. La *tournée* passe au statut "AFFECTÉE" dans W-04.
- Bouton "VALIDER ET LANCER" : enregistre l'*affectation* et lance la *tournée* en une
  seule action. Déclenche **AffectationEnregistrée** puis **TournéeLancée**. La *tournée*
  devient immédiatement visible dans l'application mobile du livreur assigné.

#### Interactions principales

- Bascule entre les onglets "Composition" et "Affectation" : sans rechargement.
- Sélection d'un livreur : déverrouille le sélecteur de *véhicule*.
- Sélection d'un *véhicule* : active les deux boutons d'action.
- "VALIDER L'AFFECTATION" : confirmation par toast "Affectation enregistrée pour T-203 —
  P. Morel / VH-07." Retour automatique vers W-04.
- "VALIDER ET LANCER" : confirmation demandée "Lancer la tournée T-203 pour P. Morel ?
  Cette action est irréversible." Puis toast de confirmation et retour vers W-04 avec
  la ligne passée en statut "LANCÉE".
- Retour vers W-04 via le bouton header : sans perte des données saisies si
  l'*affectation* n'est pas encore validée (confirmation demandée si modifications en cours).

#### États spéciaux

- Aucun livreur disponible : message "Aucun livreur disponible. Vérifiez les présences
  du matin avant d'affecter cette tournée." Boutons désactivés.
- Aucun *véhicule* disponible : message "Aucun véhicule disponible. Vérifiez le parc
  véhicule avant d'affecter cette tournée." Boutons désactivés.
- *Tournée* déjà lancée : les sélecteurs et boutons d'affectation sont remplacés par
  "Tournée lancée à HH:MM — [Livreur] / [Véhicule]". Lecture seule.
- Anomalie non acquittée : si le bloc anomalie est présent, le bouton "VALIDER ET
  LANCER" affiche un label "Lancer malgré l'anomalie" pour forcer la conscience de
  l'utilisateur sur le risque.

**Termes du domaine annotés** : *tournée TMS*, *composition de tournée*, *affectation*,
*lancement de tournée*, *véhicule*, *colis*, *zone*, *contrainte*, *vérification de composition*

---

## Application mobile Android — Livreur

---

### Écran M-01 : Authentification

**Persona** : Pierre Morel (Livreur terrain)
**Objectif** : Connexion sécurisée via SSO corporate avant de prendre en main la *tournée*
**Route** : /auth
**Domain Events** : aucun déclenché ici (pré-condition)

#### Layout

```
┌─────────────────────────────────────┐
│           [Logo DocuPost]           │  Header minimal — branding
│                                     │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   Se connecter              │   │  Bouton principal
│   │   (via compte Docaposte)    │   │  Redirection SSO OAuth2 corporate
│   └─────────────────────────────┘   │
│                                     │
│   v 1.0.0 — Docaposte              │  Footer : version applicative
└─────────────────────────────────────┘
```

#### Composants

- Logo DocuPost centré.
- Bouton "Se connecter via compte Docaposte" : déclenche le flux OAuth2 / SSO.
- Indicateur de chargement pendant la redirection SSO.
- Version de l'application en pied d'écran.

#### Interactions principales

- Appui sur le bouton : redirection vers la page SSO corporate. Retour automatique à la
  *liste des colis du jour* après authentification réussie.

#### États spéciaux

- Erreur SSO : message "Connexion impossible. Vérifiez votre réseau ou contactez le support."
  avec bouton "Réessayer".
- Chargement : spinner centré, bouton désactivé.

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
  - Icône de statut colorée : à livrer (bleu), livré (vert coché), échec (rouge croix),
    à représenter (orange).
  - Adresse principale, nom du destinataire.
  - Contrainte visible si présente (*fragile*, horaire, *document sensible*).
  - *Motif de non-livraison* affiché si statut = échec.
- Bouton "Scan colis" : accès rapide à la saisie par code-barres.
- Bouton "Clôturer la tournée" (visible uniquement si tous les *colis* sont traités).

#### Interactions principales

- Appui sur un item *colis* : navigation vers l'écran M-03 (Détail du colis).
- Appui sur un onglet de filtre : la liste se filtre immédiatement, sans rechargement.
- Réception d'une notification push *instruction* : bandeau de notification en haut de
  liste, actualisation automatique.

#### États spéciaux

- Liste vide (aucun *colis* assigné) : "Aucun colis assigné pour aujourd'hui. Contactez
  votre superviseur."
- Chargement initial : skeleton de liste, indicateur de synchronisation.
- Mode offline : bandeau orange "Hors connexion — Données locales" + icône de
  synchronisation en attente. Les actions sont toujours possibles (offline-first).
- Mise à jour temps réel : animation discrète sur l'item mis à jour sans rechargement
  de la page.

**Termes du domaine annotés** : *tournée*, *colis*, *reste à livrer*, *zone*, *statut*,
*contrainte*, *motif de non-livraison*, *document sensible*, *à représenter*

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
│  │     LIVRER CE COLIS           │  │  Action principale — couleur primaire
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

#### Layout

```
┌─────────────────────────────────────┐
│  [<]  Preuve de livraison           │  Header
├─────────────────────────────────────┤
│  Colis #00247 — M. Dupont           │  Rappel du contexte
├─────────────────────────────────────┤
│  Type de preuve                     │  Sélection du type
│  ( ) Signature du destinataire      │
│  ( ) Photo du colis déposé          │
│  ( ) Dépôt chez un tiers            │
│  ( ) Dépôt sécurisé                 │
├─────────────────────────────────────┤
│  [Zone de signature / capture]      │  Zone dynamique selon le type sélectionné
│  ┌─────────────────────────────┐   │
│  │                             │   │  Si signature : pad de signature tactile
│  │   Signez ici                │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│  [Effacer]                          │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │     CONFIRMER LA LIVRAISON    │  │  Bouton de validation — désactivé si pas de preuve
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### Composants

- Rappel du *colis* et du destinataire en contexte.
- Sélecteur de type de *preuve* : signature, photo, *tiers*, *dépôt sécurisé*.
- Zone dynamique selon le type :
  - Signature : pad tactile de signature numérique avec bouton "Effacer".
  - Photo : déclencheur de l'appareil photo natif Android.
  - Tiers : champ texte "Nom du tiers" + confirmation.
  - Dépôt sécurisé : description du lieu (sélection dans une liste ou champ libre).
- Bouton "CONFIRMER LA LIVRAISON" : désactivé tant qu'aucune *preuve* n'est capturée.

#### Interactions principales

- Sélection d'un type de preuve : affiche la zone de capture correspondante.
- Signature sur le pad : le bouton de confirmation devient actif.
- Photo capturée : affichage miniature de confirmation. Bouton actif.
- "CONFIRMER LA LIVRAISON" : horodatage et géolocalisation automatiques. Statut du *colis*
  passe à *livré*. *Événement* transmis à l'OMS. Retour automatique à M-02 avec mise à
  jour de l'indicateur de progression.

#### États spéciaux

- Mode offline : la *preuve* est stockée localement. Synchronisation différée avec
  indicateur "Synchronisation en attente". *Événement* rejoué dès retour de la connexion.
- Erreur de capture photo : "Impossible d'accéder à l'appareil photo. Vérifiez les
  autorisations."
- Erreur de géolocalisation : la livraison peut être confirmée sans coordonnées GPS si
  l'API de localisation est indisponible (dégradé documenté, alerte au superviseur).

**Termes du domaine annotés** : *preuve de livraison*, *signature numérique*, *tiers*,
*dépôt sécurisé*, *livré*, *horodatage*, *géolocalisation*, *événement*

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
│  ( ) À représenter (nouvelle tentative)
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
- Liste de *dispositions* : *à représenter*, dépôt chez *tiers*, retour au dépôt. Un
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
- Si *disposition* = *à représenter* : une entrée est créée dans la liste des *colis*
  en attente de seconde tentative.

**Termes du domaine annotés** : *motif de non-livraison*, *absent*, *accès impossible*,
*refus client*, *horaires dépassés*, *disposition*, *à représenter*, *échec*,
*incident*

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

- Bandeau overlay en haut de l'écran courant, de couleur distincte (bleu superviseur).
- Texte de l'*instruction* : action + *colis* concerné + adresse.
- Bouton "VOIR" : navigue directement vers M-03 (Détail du colis concerné).
- Disparition automatique après 10 secondes si Pierre n'interagit pas (la modification
  de la liste reste effective).

#### Interactions principales

- Appui sur "VOIR" : navigation vers le détail du *colis* priorisé.
- Disparition du bandeau : la liste de *colis* est déjà mise à jour en arrière-plan.

---

## Interface web — Superviseur

---

### Écran W-01 : Tableau de bord des tournées

**Persona** : Laurent Renaud (Responsable Exploitation Logistique)
**Objectif** : Avoir une vue agrégée en temps réel de toutes les *tournées* du jour
et identifier immédiatement les *tournées à risque*
**URL/Route** : /supervision
**Domain Events affichés** : TournéeÀRisqueDétectée, AlerteDéclenchée, LivraisonConfirmée
(agrégés)

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  DocuPost Supervision  |  19/03/2026  |  [Déconnexion]          │  Header global
├─────────────────────────────────────────────────────────────────┤
│  Tournées du jour : 8 actives  |  2 clôturées  |  1 à risque  ◉ │  Bandeau résumé + alerte
├─────────────────────────────────────────────────────────────────┤
│  Filtres : [Toutes] [En cours] [À risque] [Clôturées]           │  Filtres de liste
├──────────┬──────────┬────────────┬─────────┬───────────┬────────┤
│ Livreur  │ Tournée  │ Avancement │ Statut  │ Dernière  │ Action │  En-tête tableau
│          │          │            │         │ activité  │        │
├──────────┼──────────┼────────────┼─────────┼───────────┼────────┤
│ P. Morel │ T-042    │ [████░░] 14/22 │ EN COURS │ Il y a 3 min │ [Voir] │
│          │          │ 63 %       │         │           │        │
├──────────┼──────────┼────────────┼─────────┼───────────┼────────┤
│ L. Petit │ T-043    │ [██░░░░] 6/20  │ À RISQUE │ Il y a 18 min │ [Voir] │
│          │          │ 30 %   ⚠   │         │           │        │  Ligne en surbrillance orange
├──────────┼──────────┼────────────┼─────────┼───────────┼────────┤
│ S. Roger │ T-044    │ [██████] 22/22 │ CLÔTURÉE │ Il y a 1h │ [Voir] │
└──────────┴──────────┴────────────┴─────────┴───────────┴────────┘
│  [Charger plus]                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Composants

- Header global : logo, date, bouton de déconnexion.
- Bandeau résumé : compteurs en temps réel (actives, clôturées, *à risque*). Indicateur
  visuel d'alerte active (point rouge clignotant si *tournée à risque*).
- Filtres par statut : Toutes, En cours, *À risque*, Clôturées.
- Tableau des *tournées* :
  - Colonnes : Livreur, Identifiant *tournée*, Avancement (barre de progression + X/Y
    *colis*), Statut (badge coloré), Dernière activité, Action.
  - Ligne *tournée à risque* : surbrillance orange, icône alerte.
  - Mise à jour en temps réel (WebSocket ou polling court).
- Bouton "Voir" sur chaque ligne : navigue vers W-02 (Détail d'une tournée).

#### Interactions principales

- Appui sur "Voir" d'une *tournée* : navigation vers W-02.
- Appui sur un filtre : filtre la liste immédiatement.
- Mise à jour automatique toutes les 30 secondes minimum (ou temps réel si WebSocket).
- Alerte sonore discrète à l'apparition d'une nouvelle *tournée à risque*.

#### États spéciaux

- Aucune *tournée* active : "Aucune tournée en cours pour aujourd'hui."
- Perte de connexion serveur : bandeau rouge "Données non actualisées — Reconnexion en
  cours..." avec horodatage de la dernière synchronisation.
- Plusieurs alertes simultanées : liste des *tournées à risque* en haut du tableau,
  avant les autres.

**Termes du domaine annotés** : *tournée*, *tournée à risque*, *avancement de tournée*,
*alerte*, *colis*, *statut*

---

### Écran W-02 : Détail d'une tournée

**Persona** : Laurent Renaud (Responsable Exploitation Logistique)
**Objectif** : Voir le détail complet d'une *tournée* : statuts des *colis*, *incidents*,
localisation du livreur, et envoyer des *instructions*
**URL/Route** : /supervision/tournee/:id
**Domain Events déclenchés** : InstructionEnvoyée, TournéeModifiée

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [< Tableau de bord]  Tournée T-043 — L. Petit                  │  Header + retour
├─────────────────────────────────────────────────────────────────┤
│  Avancement : 6 / 20 colis — 30 %  ⚠ Retard estimé : 45 min    │  Bandeau statut tournée
├─────────────────────────────────────────────────────────────────┤
│  [Carte]  [Liste colis]  [Incidents]                            │  Onglets de navigation
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Onglet Liste colis actif]                                      │
│                                                                  │
│  ┌─────────┬───────────────────────────┬──────────┬──────────┐  │
│  │ # Colis │ Adresse                   │ Statut   │ Action   │  │
│  ├─────────┼───────────────────────────┼──────────┼──────────┤  │
│  │ #00312  │ 25 Rue Victor Hugo        │ À livrer │ [Instruc.│  │
│  │         │                           │          │  tionner]│  │
│  ├─────────┼───────────────────────────┼──────────┼──────────┤  │
│  │ #00247  │ 12 Rue du Port            │ Livré ✓  │ —        │  │
│  ├─────────┼───────────────────────────┼──────────┼──────────┤  │
│  │ #00198  │ 8 Cours Gambetta          │ Échec ✗  │ [Voir]   │  │
│  │         │                           │ Absent   │          │  │
│  └─────────┴───────────────────────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

#### Composants

- Header avec bouton retour vers W-01 et identifiant de la *tournée* + livreur.
- Bandeau statut : avancement (X/Y *colis*, %), alerte de retard estimé si *tournée à
  risque*.
- Onglets : Carte (localisation temps réel du livreur), Liste *colis* (détail par item),
  Incidents (liste des *incidents* déclarés).
- Tableau de *colis* :
  - Colonnes : identifiant, adresse, statut (badge coloré + *motif* si échec), action.
  - Bouton "Instructionner" sur les *colis* à statut "À livrer".
  - Bouton "Voir" sur les *colis* en *échec* : affiche le détail de l'*incident*.
- Mise à jour en temps réel des statuts.

#### Interactions principales

- Appui sur "Instructionner" d'un *colis* : ouvre le panneau W-03 (Envoi d'instruction).
- Appui sur l'onglet "Carte" : affiche la carte avec la position du livreur et les
  *arrêts* de la *tournée*.
- Appui sur l'onglet "Incidents" : liste les *incidents* déclarés avec *motif* et
  horodatage.

#### États spéciaux

- Tournée clôturée : tous les boutons d'action sont désactivés. Bandeau "Tournée
  clôturée à HH:MM".
- Livreur hors ligne (aucune activité depuis X minutes) : indicateur "Dernier contact
  il y a X min" sur le bandeau de statut.

**Termes du domaine annotés** : *tournée*, *colis*, *statut*, *incident*, *motif*,
*instruction*, *arrêt*, *avancement de tournée*

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

- Titre et bouton de fermeture.
- Rappel du *colis* concerné (identifiant + adresse).
- Sélecteur de type d'*instruction* : prioriser, annuler, reprogrammer.
- Champ conditionnel : si "reprogrammer" sélectionné, affiche les champs date et heure
  du créneau cible.
- Champ message complémentaire optionnel (200 caractères max).
- Bouton "ENVOYER" : désactivé tant que le type n'est pas sélectionné.

#### Interactions principales

- Sélection de "reprogrammer" : affiche les champs date/heure.
- "ENVOYER" : transmet l'*instruction* au livreur via notification push. Historise
  l'*instruction* avec horodatage et identité du superviseur. Ferme le panneau. Confirme
  l'envoi par un toast "Instruction envoyée à P. Morel."
- "Annuler" ou [✕] : ferme le panneau sans action.

#### États spéciaux

- Erreur d'envoi (réseau) : message "Envoi impossible. Réessayez." Bouton "Réessayer"
  affiché.
- Instruction déjà en cours sur ce *colis* : message "Une instruction est en attente
  d'exécution. Attendez la confirmation du livreur avant d'en envoyer une nouvelle."

**Termes du domaine annotés** : *instruction*, *prioriser*, *annuler*, *reprogrammer*,
*colis*, *notification push*

---

## Récapitulatif des écrans MVP

| Écran | Plateforme | Persona              | Parcours(s) couverts             | Domain Events principaux                                          |
|-------|-----------|----------------------|----------------------------------|-------------------------------------------------------------------|
| W-04  | Web       | Resp. logistique     | P0 — Liste tournées matin        | TournéeImportéeTMS, AffectationEnregistrée, TournéeLancée         |
| W-05  | Web       | Resp. logistique     | P0 — Détail tournée à préparer   | TournéeVérifiée, AffectationEnregistrée, TournéeLancée            |
| M-01  | Mobile    | Livreur              | P1 — Authentification            | —                                                                 |
| M-02  | Mobile    | Livreur              | P1 — Liste tournée               | TournéeDémarrée, TournéeChargée                                   |
| M-03  | Mobile    | Livreur              | P1 — Détail colis                | (déclencheur vers M-04 ou M-05)                                   |
| M-04  | Mobile    | Livreur              | P1, P4 — Preuve                  | PreuveCapturée, LivraisonConfirmée, SynchronisationOMS            |
| M-05  | Mobile    | Livreur              | P1, P3 — Échec                   | ÉchecLivraisonDéclaré, MotifEnregistré, DispositionEnregistrée    |
| M-06  | Mobile    | Livreur              | P5 — Instruction                 | InstructionReçue, TournéeModifiée                                 |
| W-01  | Web       | Superviseur          | P2 — Tableau de bord             | TournéeÀRisqueDétectée, AlerteDéclenchée                          |
| W-02  | Web       | Superviseur          | P2 — Détail tournée              | (affiche tous les événements de la tournée)                       |
| W-03  | Web       | Superviseur          | P5 — Instruction                 | InstructionEnvoyée, TournéeModifiée                               |

---

## Notes de conception transversales

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
en temps réel. La technologie (WebSocket ou Server-Sent Events) est à définir par
l'Architecte Technique, mais l'expérience cible est une latence inférieure à 30 secondes
entre l'action terrain et la mise à jour de l'écran superviseur.

### Gestion des états dégradés
Chaque écran doit avoir un état explicite pour : chargement, liste vide, erreur réseau,
mode offline. Ces états ne doivent jamais bloquer l'utilisateur sans lui indiquer ce qui
se passe et ce qu'il peut faire.

### Interface de préparation (web — responsable logistique)
Les écrans W-04 et W-05 sont utilisés sous contrainte de temps (les livreurs partent
entre 7h30 et 8h00). La conception doit privilégier la densité d'information et la
rapidité des interactions : sélecteurs pré-filtrés sur les ressources disponibles,
confirmation en une ou deux actions, retour visuel immédiat sur chaque *affectation*
et chaque *lancement de tournée*.
