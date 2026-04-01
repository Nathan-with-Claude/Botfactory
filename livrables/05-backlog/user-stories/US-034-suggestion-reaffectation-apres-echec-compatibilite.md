# US-034 : Afficher une suggestion de reaffectation apres un echec de compatibilite vehicule

**Epic** : EPIC-007 : Planification et Preparation des Tournees (interface web logisticien)
**Feature** : F-020 : Affectation livreur et vehicule
**Bounded Context** : BC-07 Planification de Tournee (Core Domain)
**Aggregate(s) touchés** : TourneeTMS, Affectation, Vehicule
**Priorité** : Should Have
**Statut** : Prête
**Complexité estimée** : S

---

## User Story

En tant que responsable logistique,
je veux qu'un lien d'action "Reaffecter a un vehicule plus grand" soit propose directement
apres un echec de verification de compatibilite vehicule,
afin de pouvoir resoudre immediatement le probleme de surcharge sans quitter l'ecran ni naviguer manuellement.

---

## Contexte

Feedback terrain du 2026-03-30 (Laurent Renaud, Responsable Exploitation Logistique) :
quand la verification de compatibilite echoue (capacite vehicule depassee — US-030), le superviseur
se retrouve face a un message d'erreur sans aucune suggestion d'action. Il doit quitter W-05,
naviguer manuellement vers la liste des vehicules, identifier un vehicule de plus grande capacite,
revenir sur W-05 et recommencer l'affectation. Cette sequence prend plusieurs minutes en matin de
depart et augmente le risque d'erreur.

Cette US prolonge US-030 en ajoutant un chemin d'action au message d'erreur existant.
Elle ne modifie pas les invariants de l'Affectation — la logique de verification reste identique.

**Invariants a respecter** :
- Le lien "Reaffecter a un vehicule plus grand" n'est affiche que lorsque l'evenement
  `CompatibiliteVehiculeEchouee` a ete emis (depassement confirme).
- Cliquer sur ce lien pre-filtre la liste des vehicules disponibles sur les vehicules dont
  la capacite est superieure au poids estime de la TourneeTMS (lecture seule du domaine Vehicule).
- L'Affectation elle-meme n'est pas modifiee automatiquement : le responsable logistique
  doit confirmer la selection du nouveau vehicule (invariant d'affectation explicite inchange).
- Si aucun vehicule de capacite suffisante n'est disponible, le message "Aucun vehicule disponible
  pour cette capacite" est affiche dans le panneau de reaffectation.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Affichage du lien de suggestion apres depassement de capacite

```gherkin
Given le responsable logistique est sur W-05 onglet Affectation
And la TourneeTMS a un poids estime de 410 kg dans sa Composition de tournee
And l'evenement CompatibiliteVehiculeEchouee a ete emis suite a la selection d'un vehicule
  de 400 kg
When l'alerte inline de surcharge est affichee
Then un lien d'action "Reaffecter a un vehicule plus grand" est visible sous le message d'alerte
And ce lien est distinct visuellement du bouton "Affecter quand meme" (couleur primaire vs secondaire)
```

### Scenario 2 — Navigation vers la liste des vehicules compatibles

```gherkin
Given l'alerte de surcharge affichee avec le lien "Reaffecter a un vehicule plus grand"
When le responsable logistique clique sur ce lien
Then un panneau de selection de vehicule s'ouvre
And la liste est pre-filtree pour n'afficher que les vehicules dont la capacite est
  superieure ou egale a 410 kg
And chaque ligne de vehicule affiche son identifiant, sa capacite en kg et sa disponibilite
```

### Scenario 3 — Selection d'un vehicule compatible depuis le panneau

```gherkin
Given le panneau de vehicules compatibles est ouvert avec la liste pre-filtree
When le responsable logistique selectionne un vehicule de capacite 600 kg
Then l'Affectation est mise a jour avec le nouveau vehicule
And l'evenement CompatibiliteVehiculeVerifiee est emis avec le vehiculeId, le tourneeTMSId
  et le delta de marge (190 kg)
And l'alerte de surcharge disparait
And le bouton "Valider et Lancer" redevient actif
```

### Scenario 4 — Aucun vehicule de capacite suffisante disponible

```gherkin
Given l'alerte de surcharge affichee avec le lien "Reaffecter a un vehicule plus grand"
And aucun vehicule disponible n'a une capacite superieure ou egale a 410 kg
When le responsable logistique clique sur le lien
Then le panneau s'ouvre avec le message "Aucun vehicule disponible pour cette capacite"
And aucune ligne de vehicule n'est listee
And le bouton "Valider et Lancer" reste desactive
```

### Scenario 5 — Le lien est absent en cas de depassement accepte manuellement

```gherkin
Given l'alerte de surcharge affichee
When le responsable logistique clique sur "Affecter quand meme"
Then l'evenement CompatibiliteVehiculeEchouee est emis (comportement US-030 inchange)
And le lien "Reaffecter a un vehicule plus grand" est retire de l'interface
And l'alerte passe en mode avertissement non bloquant (comportement US-030 inchange)
```

---

## Definition of Done

- [ ] Le lien "Reaffecter a un vehicule plus grand" apparait exclusivement apres emission
      de l'evenement `CompatibiliteVehiculeEchouee`.
- [ ] Le panneau de selection est pre-filtre par capacite >= poids estime de la TourneeTMS.
- [ ] La selection d'un vehicule depuis le panneau declenche une nouvelle verification
      (evenement `CompatibiliteVehiculeVerifiee` emis si compatible).
- [ ] Le cas "aucun vehicule disponible" est gere et affiche un message explicite.
- [ ] Aucune regression sur les scenarios US-030 (scenarios 1 a 5).
- [ ] Tests unitaires sur le handler `VerifierCompatibiliteVehiculeHandler` couvrant
      les nouveaux cas de navigation.
- [ ] Tests E2E Playwright sur W-05 couvrant les scenarios 1 a 4 de cette US.

---

## Dépendances

- **US-030** (prerequis) : la logique de verification de compatibilite et l'emission de
  `CompatibiliteVehiculeEchouee` doivent etre implementees.
- **BC-07** : acces en lecture a la liste des vehicules disponibles (VehiculeRepository).

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#W-05
- Feedback source : /livrables/09-feedback/feedback-superviseur-2026-03-30.md
- US liee : /livrables/05-backlog/user-stories/US-030-verification-compatibilite-vehicule.md
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
