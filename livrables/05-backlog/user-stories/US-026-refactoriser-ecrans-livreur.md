# US-026 : Refactoriser les ecrans livreur avec le nouveau design

**Epic** : EPIC-001 : Execution de la Tournee (application mobile livreur)
**Feature** : F-022 : Design System et Tokens d'interface
**Bounded Context** : BC-01 Orchestration de Tournee (Core Domain)
**Aggregate(s) touchés** : Tournee, Colis
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : L

---

## User Story

En tant que livreur,
je veux que l'application mobile affiche mes ecrans de tournee avec le nouveau design
defini dans le design system DocuPost v2.0,
afin que je puisse lire les statuts des colis, les contraintes et mon avancement en un coup
d'oeil meme en condition terrain difficile (soleil, gants, conduite).

---

## Contexte

Cette US applique le design system (US-025, prerequis obligatoire) sur les ecrans mobiles
M-01 a M-08 du parcours livreur.

Les changements couvrent :
- M-01 (Authentification) : layout professionnel, etat offline, bouton 56px.
- M-02 (Liste des colis) : CarteColis avec statut complet, swipe, BandeauProgression,
  IndicateurSync, onglets avec compteurs, bandeau offline positionne.
- M-03 (Detail d'un colis) : badge statut dans le header, CTAs 56px, ChipContrainte,
  section historique masquee si vide, card succes sur colis livre.
- M-04 (Capture preuve) : CardTypePreuve 2x2, SignaturePad ameliore (ligne de base,
  trait 3px), animation checkmark, caption geolocalisation, gestion erreur GPS.
- M-05 (Declaration echec) : header --color-alerte, sections UPPERCASE + asterisque,
  items 48px, compteur note /250, confirmation toast "A representer".
- M-06 (Notification instruction) : fond --color-info-fonce, 2 boutons, countdown,
  animations slide-down/up, swipe up pour fermer.

**Prerequis** : US-025 (Design System) doit etre terminee et validee.

**Invariants a respecter** :
- Aucun changement de logique metier : seule la couche presentation est modifiee.
- Le StatutColis (a livrer, livre, echec, a representer) doit etre affiche via
  BadgeStatut avec les tokens semantiques corrects (cf. design-system.md §1 tableau).
- Le geste swipe-gauche sur CarteColis (M-02) ne declenche que la navigation vers
  M-05 avec le Colis pre-selectionne — il n'emet aucun EchecLivraisonDeclare directement.
- En mode offline, l'IndicateurSync doit afficher OFFLINE et le bandeau de synchronisation
  doit etre visible au-dessus de la liste, sans bloquer les actions.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — M-01 : ecran d'authentification conforme

```gherkin
Given l'ecran M-01 ouvert sur un appareil mobile
When aucune connexion reseau n'est disponible
Then le message "Vous etes hors ligne" est visible sous le bouton SSO
And le bouton SSO a une hauteur de 56px
And le logo DocuPost fait 80px et est suivi du titre H1 et du sous-titre
```

### Scenario 2 — M-02 : CarteColis avec badge statut correct

```gherkin
Given la liste des colis de la tournee affichee dans M-02
When un colis a le statut A_LIVRER
Then sa CarteColis affiche un BadgeStatut variant="info" avec label "A LIVRER"
When un colis a le statut LIVRE
Then sa CarteColis est grisee (opacity 0.7) et affiche l'horodatage de livraison
When un colis a le statut ECHEC
Then sa CarteColis a une bordure gauche 3px de couleur --color-alerte
```

### Scenario 3 — M-02 : BandeauProgression et IndicateurSync visibles

```gherkin
Given la tournee en cours avec X colis livres sur Y total
When l'ecran M-02 est affiche
Then le BandeauProgression indique "Reste a livrer : (Y-X) / Y"
And la barre de progression est coloree --color-progres-encours si statut 'encours'
And l'IndicateurSync affiche [●LIVE] si la connexion WebSocket est active
And l'IndicateurSync affiche [●OFFLINE] si la connexion est absente
```

### Scenario 4 — M-03 : badge statut visible dans le header du detail colis

```gherkin
Given l'ecran M-03 ouvert pour un colis dont le StatutColis est ECHEC
When le header de M-03 est rendu
Then un BadgeStatut variant="alerte" est visible dans le header
And les ChipContrainte colorees sont affichees si le colis a des contraintes
And la section Historique est masquee si aucun evenement n'existe pour ce colis
```

### Scenario 5 — M-04 : preuve capturee avec confirmation visuelle

```gherkin
Given l'ecran M-04 ouvert pour capturer une preuve de livraison
When le livreur signe dans le SignaturePad
Then la ligne de base pointillee est visible et le trait a une epaisseur de 3px
When le livreur confirme la preuve
Then l'evenement PreuveCapturee est emis
And une animation checkmark de 1 seconde est jouee avant le retour vers M-02
And la caption "Geolocalisation et horodatage enregistres automatiquement." est visible
```

### Scenario 6 — M-04 : gestion de l'erreur GPS

```gherkin
Given l'ecran M-04 et le GPS indisponible sur l'appareil
When le livreur confirme la preuve
Then le message "Mode degrade — livraison confirmee sans coordonnees" est affiche
And une alerte est envoyee au superviseur (IncidentDeclare sans coordonnees GPS)
And l'evenement PreuveCapturee est quand meme emis (sans geolocalisation)
```

### Scenario 7 — M-05 : formulaire echec conforme

```gherkin
Given l'ecran M-05 ouvert pour declarer un echec
When le livreur n'a pas encore selectionne de motif
Then la section Disposition est grisee et non interactive
When le livreur selectionne le motif "Absent"
Then la section Disposition devient interactive
And le compteur de la note affiche "0 / 250"
When le livreur saisit une note depassant 250 caracteres
Then le compteur passe en rouge
```

### Scenario 8 — M-06 : bandeau instruction avec countdown

```gherkin
Given le livreur utilise M-02 et le superviseur envoie une instruction
When l'evenement InstructionRecue est recu par l'application mobile
Then le BandeauInstruction s'affiche avec animation slide-down 300ms
And le fond est --color-info-fonce
And deux boutons [VOIR] et [OK] sont visibles
And une barre de decompte de 10 secondes diminue lineairement
When les 10 secondes s'ecoulent sans action
Then le BandeauInstruction disparait avec animation slide-up 200ms
```

---

## Liens

- Wireframes : /livrables/02-ux/wireframes.md#M-01 a #M-06
- Evolution Design : /livrables/02-ux/evolution-design.md (sections M-01 a M-06)
- Design System : /livrables/02-ux/design-system.md
- Prerequis US : US-025-implementer-design-system.md
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
