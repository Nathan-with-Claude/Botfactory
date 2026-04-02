# US-027 : Refactoriser les ecrans superviseur avec le nouveau design (vision designer web)

**Epic** : EPIC-003 : Supervision et Pilotage Temps Reel
**Feature** : F-022 : Design System et Tokens d'interface
**Bounded Context** : BC-03 Supervision (Core Domain) + BC-07 Planification de Tournee
**Aggregate(s) touchés** : Tournee (supervision), PlanDuJour, TourneeTMS
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : L

> Mis a jour le 2026-03-26 — integration vision designer UI web (wireframes v3.0).
> Prerequis : US-025 (TopAppBar + SideNavBar + tokens MD3 web).

---

## User Story

En tant que superviseur,
je veux que le tableau de bord (W-01), l'ecran de detail de tournee (W-02), le panneau
d'instruction (W-03), le plan du jour (W-04) et l'ecran de detail a preparer (W-05)
affichent le nouveau design defini dans la vision designer UI web (wireframes v3.0),
afin que je percoive immediatement les tournees a risque et les anomalies de preparation
en moins de 5 secondes, et que je prepare les tournees du matin en moins de 30 minutes.

---

## Contexte

Cette US applique le design system (US-025, prerequis obligatoire) sur les ecrans web
W-01 a W-05 du parcours superviseur et logisticien.

Les changements couverts :

**W-01 (Tableau de bord superviseur — route /supervision)** :
- IndicateurSync dans le header (via US-025 TopAppBar) : LIVE / POLLING / OFFLINE + horodatage
  "Derniere mise a jour : il y a Xs" affiche en inline sur cet ecran.
- Toggle alerte sonore dans le header (button w-10 h-5 bg-primary rounded-full).
- Cards synthese (grid 3 colonnes mb-12) :
  - ACTIVE : bg-surface-container-lowest border-l-4 border-primary, valeur text-primary text-4xl
    font-headline, icone local_shipping opacity/20.
  - CLOTUREES : meme fond, border-l-4 border-emerald, valeur text-emerald-600.
  - A RISQUE : bg-tertiary-fixed border-l-4 border-tertiary, valeur text-tertiary.
- Barre filtres : champ recherche livreur (w-96) + onglets [Toutes] [En cours] [A risque]
  [Cloturees] + bouton [Rafraichir] bg-primary text-white.
- Tableau bg-surface-container-lowest rounded-xl shadow-sm.
  Colonnes : Livreur (avatar + nom) | Tournee | Avancement (BandeauProgression w-48) |
  Statut (BadgeStatut) | Activite | Actions.
- Ligne A RISQUE : bg-orange-50/50 hover:bg-orange-100/40 border-l-4 border-orange-500.
  Badge : bg-error-container text-on-error-container rounded-full + pulse-dot bg-error.
  Retard en text-error font-bold. Activite en text-error si > 15 min.
- Ligne EN COURS : hover:bg-slate-50.
  Badge : bg-primary-container text-on-primary-container rounded-full.
- Ligne CLOTUREE : bg-surface-container-low/30 opacity-60. Aucune action.
  Barre progression bg-emerald-500. Badge bg-emerald-100 text-emerald-700.
- BandeauProgression (w-48) :
  Compteur text-[10px] font-bold text-outline. Pourcentage text-[10px] font-bold text-primary
  (text-emerald-600 si 100%). Barre h-1.5 rounded-full fill bg-primary (bg-emerald-500 si cloturee).
- Avatar livreur : cercle w-8 h-8 bg-slate-200, initiales font-bold text-xs rounded-full.
- Silence livreur > 30 min : cellule Activite rouge + "Aucune activite depuis Xmin".
  SilenceLivreurDetecte emis si > 30 min. TourneeARisque si > 45 min.
- Section bas (grid 2 colonnes) : carte zone (h-400px rounded-2xl) + Activite Recente (glass-card).
- Mise a jour auto : WebSocket prioritaire, fallback polling 30s.
- Animation flash legere sur cellule mise a jour en temps reel.

**W-02 (Detail d'une tournee — supervision)** :
- Badge retard rouge gras + barre --color-alerte.
- Sous-filtres colis : A livrer / Livres / Echecs + recherche.
- Badge LIVRE vert + horodatage ; badge ECHEC rouge + motif.
- Onglet Incidents : badge numerique [Incidents · N].
- DrawerDetail 480px pour le detail d'un incident (cf. US suggeree F de l'UX).
- Indicateur WebSocket [●LIVE] en bas du tableau.

**W-03 (Panneau envoi instruction)** :
- Cards cliquables CardTypeInstruction (remplacement des radio buttons).
- Compteur message "X / 200" en temps reel.
- Contexte livreur : sous-titre "Tournee T-043 · L. Petit".
- Avertissement si livreur hors ligne.
- Avertissement si instruction deja en attente + bouton "Forcer l'envoi quand meme".
- 3 points de sortie : bouton [X], clic overlay, bouton Annuler.

**W-04 (Plan du jour — Liste des tournees du matin)** :
- Bandeau synthese : bg-tertiary-fixed + border-l-[6px] border-tertiary + rounded-xl shadow-sm.
  Visible uniquement si non-affectees > 0. Remplace par bandeau vert si toutes lancees.
- Chips compteurs dans le bandeau (cliquables) : [Toutes bg-surface-container-low],
  [Non affectees bg-error-container badge bg-error], [Affectees bg-secondary-container
  badge bg-secondary], [Lancees bg-primary-fixed-dim badge bg-primary].
  Clic chip = active le filtre correspondant dans le tableau.
- Bouton "Rafraichir depuis TMS" : bg-surface-container-lowest text-primary border
  border-outline-variant/15 rounded-md shadow-sm. Icone sync animee pendant le refresh.
- Bouton "Lancer toutes" : desactive (bg-slate-200 text-slate-400 cursor-not-allowed)
  tant que non-affectees > 0. Actif uniquement si toutes affectees et aucune lancee.
- Filtres tableau rapides : onglets [Toutes] [Non affectees] [Affectees] [Lancees]
  + champ recherche temps reel (bg-white border-none rounded-xl shadow-sm w-80).
- Tableau bg-surface-container-low rounded-xl shadow-sm overflow-hidden.
  Colonnes : Code TMS | Colis | Zones | Statut | Livreur/Vehicule | Actions (droite).
- Badge NON AFFECTEE : bg-error-container text-on-error-container rounded-full uppercase.
- Badge AFFECTEE : bg-primary-container text-on-primary-container rounded-full uppercase.
- Badge LANCEE : bg-secondary-container text-on-secondary-container rounded-full uppercase.
- Ligne anomalie : bg-tertiary-fixed/20 + border-l-4 border-tertiary + icone warning
  (Material Symbols) text-tertiary dans la cellule Code TMS.
- Ligne lancee : opacity-60 sur tr entiere. Seule action : "Voir le detail".
- Actions ligne non affectee : [Affecter] (text-primary font-bold) + [Voir le detail].
- Actions ligne affectee : [Lancer ->] (bg-primary text-white rounded px-4 py-1.5) + [Detail].
  Clic Lancer : dialog confirmation "Lancer T-XXX pour [Livreur] ? Action irreversible."
  [Annuler] [Confirmer le lancement] — declenche TourneeLancee.
- Pagination "Charger plus" : footer bg-surface-container-lowest border-t
  border-outline-variant/10 + compteur "Affichage X / Y tournees".
- Cards metriques bas de page (grid 3 colonnes mt-12) :
  - Capacite Globale (icon local_shipping, progression barres).
  - Colis en attente (icon package_2, delta vs veille).
  - Estimation de fin (icon schedule, delta TMS).
  Fond bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/5.
- Empty state : tableau vide + message + bouton "Forcer l'import".
- Perte connexion : bandeau rouge fixe "Connexion perdue — Derniere sync TMS a HH:MM".
- Chargement initial : skeleton 5 lignes fantomes dans le tableau.
- Polling TMS automatique toutes les 2 minutes.

**W-05 (Detail d'une tournee a preparer)** :
- Fil d'Ariane complet + statut inline.
- Layout 2 colonnes : zones+contraintes a gauche, anomalie+recap a droite.
- Barres de repartition proportionnelles par zone.
- Bloc recap : poids estime, duree estimee, distance estimee.
- Formulaire affectation structure avec compteurs de disponibilite et champ remarque interne.
- Bouton "Lancer malgre l'anomalie" avec fond --color-avertissement si anomalie detectee.
- Dialog de confirmation "Abandonner les modifications ?" si navigation avec modifications non sauvegardees.

**Prerequis** : US-025 (Design System) doit etre terminee et validee.

**Invariants a respecter** :
- Aucun changement de logique metier : seule la couche presentation est modifiee.
- Le tri automatique des tournees a risque en tete du tableau W-01 est strictement visuel
  (ordre d'affichage) et ne modifie pas l'ordre dans l'Aggregate ni les Domain Events.
- Le toggle alerte sonore ne doit pas emettre de Domain Event metier — c'est une preference
  utilisateur persistee en base, separee des evenements du domaine.
- Le DrawerDetail W-02 est lecture seule : il n'emet aucun evenement en s'ouvrant.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — W-01 : bandeau alerte dynamique

```gherkin
Given le tableau de bord W-01 avec au moins une TourneeARisque
When la vue est affichee ou rafraichie
Then le fond du bandeau resume est --color-fond-alerte
And la tournee a risque est affichee en premiere position du tableau
And sa ligne a un fond --color-alerte-leger et une bordure gauche 4px
```

### Scenario 2 — W-01 : indicateur LIVE/POLLING/ERREUR

```gherkin
Given le superviseur consulte W-01 avec une connexion WebSocket active
Then le badge [●LIVE] est affiche avec animation pulse
When la connexion WebSocket est perdue et le fallback polling est actif
Then le badge affiche [●POLLING] sans animation pulse
When le polling echoue egalement
Then le badge affiche [●ERREUR] en rouge
```

### Scenario 3 — W-01 : colonne Activite silence livreur

```gherkin
Given un livreur dont la derniere activite remonte a plus de 30 minutes
When le tableau W-01 est affiche
Then la cellule Activite est en rouge et indique "Aucune activite depuis X min"
And l'evenement SilenceLivreurDetecte est emis si le silence depasse 30 minutes
And la tournee est automatiquement classee TourneeARisque si le silence depasse 45 minutes
```

### Scenario 4 — W-02 : DrawerDetail incident ouverture

```gherkin
Given la vue W-02 avec des incidents dans l'onglet Incidents
When le superviseur clique sur un incident dans la liste
Then le DrawerDetail s'ouvre a 480px a droite sans navigation
And le drawer affiche le motif, l'horodatage, la note terrain et la photo si presente
And l'evenement TourneeARisqueDetectee n'est pas emis par cette action
When le superviseur clique en dehors du drawer ou sur [X]
Then le drawer se ferme sans modifier la tournee
```

### Scenario 5 — W-03 : cards instruction et compteur caracteres

```gherkin
Given le panneau W-03 ouvert pour envoyer une instruction
When le superviseur voit les types d'instruction disponibles
Then les options sont affichees sous forme de CardTypeInstruction (pas de radio buttons)
When le superviseur saisit le message de l'instruction
Then un compteur "X / 200" est mis a jour en temps reel
When le livreur destinataire est hors ligne
Then un avertissement "L'instruction sera delivree des son retour en ligne" est affiche
```

### Scenario 6 — W-04 : bouton "Lancer toutes" conditionnel

```gherkin
Given la page W-04 avec des tournees dont certaines ne sont pas encore affectees
When la liste est affichee
Then le bouton "Lancer toutes les tournees" est masque ou desactive
When toutes les tournees du plan du jour ont une Affectation complete et aucune n'est lancee
Then le bouton "Lancer toutes les tournees" devient visible et actif
When le logisticien clique sur ce bouton
Then l'evenement TourneeLancee est emis pour chaque tournee non encore lancee
```

### Scenario 7 — W-05 : dialog confirmation abandon modifications

```gherkin
Given le logisticien a modifie l'affectation d'une tournee dans W-05
When il clique sur "Retour" ou tente de naviguer vers une autre page
Then un dialog "Abandonner les modifications ?" s'affiche avec les options [Rester] [Abandonner]
When il choisit [Abandonner]
Then la navigation s'effectue et les modifications non sauvegardees sont perdues
When il choisit [Rester]
Then le dialog se ferme et il reste sur W-05
```

### Scenario 8 — W-05 : toggle alerte sonore

```gherkin
Given le menu utilisateur (avatar dropdown) dans W-01
When le superviseur active le toggle "Alertes sonores"
Then l'evenement PreferenceSonorisationModifiee est emis avec valeur=true
And la preference est sauvegardee en base de donnees pour cet utilisateur
When une nouvelle TourneeARisqueDetectee se produit
Then une alerte sonore est jouee uniquement si la preference est activee
```

---

### Scenario 9 — W-04 : bandeau synthese alerte preparation

```gherkin
Given la page W-04 Plan du jour avec 3 tournees non affectees sur 15
When la vue est affichee
Then le BandeauSynthese est visible avec fond bg-tertiary-fixed et border-l-[6px] border-tertiary
And le message "Il reste 3 tournees non affectees a un livreur." est affiche
And 4 chips compteurs sont visibles : [Toutes 15] [Non affectees 3] [Affectees 8] [Lancees 4]
And le bouton "Lancer toutes les tournees" est desactive (bg-slate-200 cursor-not-allowed)
When toutes les tournees sont affectees et aucune n'est lancee
Then le bouton "Lancer toutes" devient actif (bg-primary text-white)
When toutes les tournees sont lancees
Then le BandeauSynthese est remplace par un bandeau vert "Toutes les tournees ont ete lancees."
```

### Scenario 10 — W-04 : clic chip filtre bandeau

```gherkin
Given le BandeauSynthese affiche sur W-04
When le logisticien clique sur le chip "Non affectees"
Then le tableau est filtre pour n'afficher que les tournees avec statut NON AFFECTEE
And l'onglet filtre "Non affectees" dans la barre filtre est selectionne (bg-white shadow-sm)
When le logisticien clique sur le chip "Toutes"
Then tous les statuts sont affiches dans le tableau
```

### Scenario 11 — W-04 : ligne anomalie avec icone warning

```gherkin
Given une TourneeTMS T-201 avec une anomalie de charge dans le plan du jour
When le tableau W-04 est affiche
Then la ligne T-201 a un fond bg-tertiary-fixed/20 et une bordure gauche border-tertiary 4px
And l'icone Material Symbols "warning" est visible en text-tertiary dans la cellule Code TMS
And le BadgeStatut affiche "NON AFFECTEE" en bg-error-container text-on-error-container
```

### Scenario 12 — W-04 : cards metriques bas de page

```gherkin
Given le plan du jour W-04 completement charge
When la page est scrollee jusqu'en bas
Then 3 cards metriques sont affichees en grid 3 colonnes
And la card "Capacite Globale" affiche le ratio vehicules disponibles et une barre de progression
And la card "Colis en attente" affiche le total avec un delta vs la veille
And la card "Estimation de fin" affiche l'heure prevue de cloture de toutes les tournees
```

### Scenario 13 — W-01 : cards synthese A RISQUE

```gherkin
Given le tableau de bord W-01 avec 2 tournees a risque sur 12 actives
When la vue est affichee
Then la card "A RISQUE" a un fond bg-tertiary-fixed et une bordure border-tertiary
And la valeur affichee est 2 en text-tertiary text-4xl font-headline
And les lignes A RISQUE sont en tete du tableau avec bg-orange-50/50 border-l-4 border-orange-500
And chaque ligne A RISQUE a un BadgeStatut bg-error-container avec un pulse-dot clignotant
```

---

## Liens

- Wireframes : /livrables/02-ux/wireframes.md#W-01 a #W-05 (v3.0 — 2026-03-26)
- Design web designer : /livrables/02-ux/design_web_designer.md
- Evolution Design : /livrables/02-ux/evolution-design.md (sections W-01 a W-05)
- Design System : /livrables/02-ux/design-system.md
- US suggerees UX : evolution-design.md §2 (US-B silence livreur, US-F drawer incident)
- Prerequis US : US-025-implementer-design-system.md (TopAppBar + SideNavBar + tokens MD3)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
