# US-012 : Consulter le détail d'une tournée avec statuts des colis et incidents

**Epic** : EPIC-003 — Supervision et Pilotage Temps Réel
**Feature** : F-010 — Consultation du détail d'une tournée
**Bounded Context** : BC-03 Supervision
**Aggregate(s) touchés** : VueTournee (Read Model), VueColis (Read Model)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : M (5 points)

---

## User Story

En tant que Laurent Renaud (responsable exploitation logistique),
je veux consulter le détail complet d'une tournée sélectionnée depuis le tableau de
bord, avec la liste des colis et leurs statuts, les incidents déclarés et la position
du livreur,
afin de comprendre rapidement la situation d'une tournée et décider d'une action
corrective en moins de 10 minutes.

---

## Contexte

L'écran W-02 est l'écran de diagnostic. Il permet à Laurent de passer d'une vue
globale (W-01) à la vue détaillée d'une tournée spécifique. La liste des colis affiche
les statuts en temps réel. L'onglet "Incidents" liste tous les incidents déclarés par
le livreur avec leur motif et horodatage. Le bouton "Instructionner" n'est disponible
que pour les colis au statut "à livrer".

**Invariants à respecter** :
- VueTournee est un Read Model construit à partir des Domain Events du BC-01.
- Il ne requête jamais directement le modèle d'écriture de l'Orchestration de Tournée.
- Le bouton "Instructionner" n'est disponible que sur les colis dont le statut est
  "à livrer" dans une tournée active.
- Seuls les utilisateurs avec le rôle "superviseur" ou "DSI" peuvent accéder à W-02.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Affichage du détail d'une tournée

```gherkin
Given Laurent est sur l'écran W-01 et clique sur "Voir" pour la tournée T-043 (L. Petit)
When l'écran W-02 s'affiche
Then le bandeau de statut indique "Avancement : 6 / 20 colis — 30 % — Retard estimé :
     45 min"
And la liste de colis affiche pour chaque colis : identifiant, adresse, statut
And les colis au statut "À livrer" ont un bouton "Instructionner" actif
And les colis au statut "Livré" affichent le badge vert sans bouton d'action
And les colis au statut "Échec" affichent le motif de non-livraison sous le badge
```

### Scénario 2 : Consultation de l'onglet Incidents

```gherkin
Given Laurent est sur l'écran W-02 de la tournée T-043
And 1 incident a été déclaré par le livreur (accès impossible, colis #00198)
When Laurent clique sur l'onglet "Incidents"
Then l'incident est affiché avec :
     - Identifiant du colis : #00198
     - Adresse : 8 Cours Gambetta
     - Motif : Accès impossible
     - Horodatage de la déclaration
     - Note optionnelle si saisie par le livreur
```

### Scénario 3 : Mise à jour temps réel du statut d'un colis

```gherkin
Given Laurent est sur l'écran W-02 et la tournée T-043 est active
When Pierre confirme la livraison du colis #00312 (événement LivraisonConfirmée émis)
Then le statut du colis #00312 passe de "À livrer" à "Livré ✓" en moins de 30 secondes
And le bandeau d'avancement est mis à jour automatiquement
And aucun rechargement manuel n'est nécessaire
```

### Scénario 4 : Navigation vers le panneau d'instruction

```gherkin
Given Laurent est sur l'écran W-02 et consulte le colis #00312 (statut "À livrer")
When Laurent clique sur "Instructionner" pour le colis #00312
Then le panneau modal W-03 (Envoi d'instruction) s'ouvre avec le contexte du colis
     #00312 pré-rempli
And le focus est positionné sur le sélecteur de type d'instruction
```

### Scénario 5 : Tournée clôturée — boutons désactivés

```gherkin
Given la tournée T-044 (S. Roger) a été clôturée à 15h30
When Laurent consulte le détail de la tournée T-044
Then tous les boutons "Instructionner" sont désactivés
And le bandeau affiche "Tournée clôturée à 15h30"
And les données historiques des colis et incidents restent consultables
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-w-02--détail-dune-tournée
- Parcours : /livrables/02-ux/user-journeys.md#parcours-2--superviseur--piloter-les-tournées-en-temps-réel
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
