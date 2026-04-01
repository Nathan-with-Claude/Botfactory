# US-039 : Télécharger le bilan des tournées du jour depuis le tableau de bord

**Epic** : EPIC-003 : Supervision et Pilotage Temps Reel
**Feature** : F-009 : Tableau de bord des tournees du jour
**Bounded Context** : BC-03 Supervision (Core Domain)
**Aggregate(s) touches** : VueTournee (Read Model supervision)
**Priorite** : Should Have
**Statut** : Prete
**Complexite estimee** : M

---

## User Story

En tant que superviseur logistique,
je veux telecharger un fichier CSV de toutes les tournees du jour avec leur statut final
depuis le tableau de bord W-01,
afin de produire mon rapport de fin de journee sans avoir a ouvrir le detail de chaque
tournee individuellement.

---

## Contexte

Feedback terrain du 2026-04-01 (Laurent Renaud, Responsable Exploitation Logistique) :
l'export CSV de US-028 est disponible uniquement dans W-05 (detail d'une tournee planifiee),
ce qui couvre le cas d'usage "avant le depart" (composition d'une seule tournee).
Le vrai besoin quotidien de Laurent est en fin de journee (vers 19h) : depuis W-01,
exporter toutes les tournees du jour avec leur statut final pour son rapport de fin de journee.

Cette US ajoute un bouton "Telecharger le bilan du jour" dans W-01, distinct du bouton
"Telecharger la liste" de W-05 (US-028 / US-038).

**Contenu du CSV attendu** :
- Colonnes : `#Tournee, Livreur, NbColis, NbLivres, NbEchecs, StatutFinal`
- Une ligne par tournee du jour
- En-tetes en premiere ligne (BOM UTF-8)
- Nom de fichier : `bilan-tournees-AAAA-MM-JJ.csv`

**Invariants a respecter** :
- Le bouton "Telecharger le bilan du jour" est visible uniquement si au moins une tournee
  du jour est dans le Read Model VueTournee.
- Le telechargement est une operation de lecture pure sur le Read Model —
  aucun Domain Event n'est emis, aucun Aggregate n'est modifie.
- Le CSV ne contient que les tournees de la journee en cours (filtre sur la date du jour).

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Presence du bouton dans W-01

```gherkin
Given le superviseur est sur W-01 (tableau de bord)
And au moins une VueTournee existe pour la date du jour
When l'ecran W-01 est affiche
Then un bouton "Télécharger le bilan du jour" est visible dans la zone d'en-tete du tableau
```

### Scenario 2 — Telechargement du fichier CSV

```gherkin
Given le superviseur est sur W-01
And 5 tournees du jour existent dans le Read Model VueTournee
When il clique sur "Télécharger le bilan du jour"
Then un fichier CSV est telecharge avec le nom "bilan-tournees-AAAA-MM-JJ.csv"
And le fichier contient 6 lignes (1 en-tete + 5 tournees)
And les colonnes presentes sont : "#Tournee, Livreur, NbColis, NbLivres, NbEchecs, StatutFinal"
And le fichier est encode en UTF-8 avec BOM
```

### Scenario 3 — Respect du filtre date du jour

```gherkin
Given des tournees de la veille et du jour sont dans le Read Model
When le superviseur clique sur "Télécharger le bilan du jour"
Then seules les tournees du jour courant sont incluses dans le CSV
And les tournees des jours precedents n'apparaissent pas
```

### Scenario 4 — Bouton absent si aucune tournee du jour

```gherkin
Given aucune VueTournee n'existe pour la date du jour
When le superviseur ouvre W-01
Then le bouton "Télécharger le bilan du jour" n'est pas affiche
```

### Scenario 5 — Independance avec l'export W-05

```gherkin
Given le superviseur est sur W-01
When il telecharge le bilan du jour
Then le comportement de US-028 (export depuis W-05) est inchange
And les deux exports coexistent sans conflit
```

---

## Definition of Done

- [ ] Bouton "Telecharger le bilan du jour" implemente dans W-01 (TableauDeBordPage).
- [ ] Fonction utilitaire de generation CSV couvrant les colonnes definies.
- [ ] Filtre sur la date du jour applique au Read Model VueTournee.
- [ ] Bouton masque si aucune tournee du jour.
- [ ] Nom de fichier dynamique avec la date courante.
- [ ] Tests unitaires sur la fonction de generation CSV.
- [ ] Tests Jest sur TableauDeBordPage (presence bouton, scenario telechargement).
- [ ] Aucune regression sur US-028 (export W-05) ni sur US-035 (recherche multi-criteres W-01).

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#W-01
- Feedback source : /livrables/09-feedback/feedback-superviseur-2026-04-01.md
- US liees : US-028 (export composition depuis W-05), US-032 (synchronisation read model)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
