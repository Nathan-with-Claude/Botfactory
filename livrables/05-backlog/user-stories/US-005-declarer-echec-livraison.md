# US-005 : Déclarer un échec de livraison avec motif normalisé et disposition

**Epic** : EPIC-001 — Exécution de la Tournée
**Feature** : F-004 — Déclaration d'un échec de livraison avec motif normalisé
**Bounded Context** : BC-01 Orchestration de Tournée
**Aggregate(s) touchés** : Colis (Entity dans Tournée), Incident (Entity)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : M (5 points)

---

## User Story

En tant que Pierre Morel (livreur terrain),
je veux déclarer un échec de livraison en sélectionnant un motif normalisé dans une
liste et en choisissant la disposition du colis,
afin que chaque échec soit tracé de façon structurée et exploitable par le superviseur,
sans que je doive inventer mes propres abréviations.

---

## Contexte

Aujourd'hui, Pierre note des abréviations personnelles (« abs », « acc. imp. ») qui
rendent les motifs inexploitables analytiquement. L'écran M-05 impose un choix
dans une liste normalisée : absent, accès impossible, refus client, horaires dépassés.
La disposition (à représenter, dépôt chez tiers, retour dépôt) est obligatoire. Un
champ note optionnel (250 caractères max) permet d'ajouter un contexte libre.

La déclaration d'échec génère un IncidentDéclaré et notifie automatiquement le
superviseur en temps réel.

**Invariants à respecter** :
- Le motif de non-livraison est obligatoire si le statut du Colis est "échec" (invariant
  agrégat Tournée).
- La disposition est obligatoire si le statut du Colis est "échec".
- La transition autorisée est : à livrer → échec. Un colis déjà en statut "livré" ou
  "échec" ne peut pas repasser en échec.
- Toute mise à jour de statut génère un événement horodaté et géolocalisé.
- Les motifs autorisés sont : Absent, AccesImpossible, RefusClient, HoraireDepasse.
- Les dispositions autorisées sont : ARepresenter, DepotChezTiers, RetourDepot.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Déclaration d'un échec standard (absent)

```gherkin
Given Pierre est sur l'écran M-03 du colis #00247 (statut "à livrer")
When Pierre appuie sur "DÉCLARER UN ÉCHEC"
And Pierre sélectionne le motif "Absent"
And Pierre sélectionne la disposition "À représenter"
And Pierre appuie sur "ENREGISTRER L'ÉCHEC"
Then l'événement ÉchecLivraisonDéclaré est émis avec motif = Absent et disposition =
     ARepresenter, horodatage et coordonnées GPS
And l'événement MotifEnregistré est émis avec colisId = #00247 et motif = Absent
And l'événement DispositionEnregistrée est émis avec colisId = #00247 et disposition =
     ARepresenter
And l'événement IncidentDéclaré est émis et notifié au superviseur
And le statut du colis #00247 passe à "échec" dans la liste M-02
And Pierre est redirigé vers M-02 avec la liste mise à jour
```

### Scénario 2 : Bouton "ENREGISTRER L'ÉCHEC" désactivé tant que le motif n'est pas choisi

```gherkin
Given Pierre est sur l'écran M-05 (Déclaration d'un échec)
When aucun motif de non-livraison n'est sélectionné
Then le bouton "ENREGISTRER L'ÉCHEC" est désactivé
And Pierre ne peut pas valider l'échec
```

### Scénario 3 : Saisie d'une note optionnelle

```gherkin
Given Pierre est sur l'écran M-05
And Pierre a sélectionné le motif "Accès impossible" et la disposition "Retour au dépôt"
When Pierre saisit une note "Portail code non fonctionnel" (40 caractères)
And Pierre appuie sur "ENREGISTRER L'ÉCHEC"
Then l'événement ÉchecLivraisonDéclaré est émis avec la note incluse dans le payload
And la note est visible dans le détail de l'incident côté superviseur (W-02)
```

### Scénario 4 : Déclaration d'échec en mode offline

```gherkin
Given Pierre est en zone blanche (aucune connexion réseau)
And Pierre est sur l'écran M-05
When Pierre sélectionne le motif "Absent" et la disposition "À représenter"
And Pierre appuie sur "ENREGISTRER L'ÉCHEC"
Then l'action est stockée localement dans WatermelonDB
And un indicateur "Synchronisation en attente — 1 action" est visible sur M-02
And dès que le réseau est rétabli, l'événement ÉchecLivraisonDéclaré est rejoué
And l'OMS reçoit l'événement normalisé en moins de 30 secondes après le retour de
     connexion
```

### Scénario 5 : Colis dont le statut est déjà "échec" — action bloquée

```gherkin
Given le colis #00247 a déjà le statut "échec" (motif : Absent)
When Pierre tente d'accéder à l'écran M-05 pour ce colis
Then le système affiche "Échec déjà déclaré — Motif : Absent"
And aucun événement ÉchecLivraisonDéclaré n'est émis
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-m-05--déclaration-dun-échec-de-livraison
- Parcours : /livrables/02-ux/user-journeys.md#parcours-3--livreur--déclarer-un-incident
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
