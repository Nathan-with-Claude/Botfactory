# US-040 : Enrichir le CSV exporté avec le nom du destinataire et le statut final de livraison

**Epic** : EPIC-007 : Planification et Preparation des Tournees
**Feature** : F-019 : Verification de la composition des tournees
**Bounded Context** : BC-07 Planification (Supporting Domain)
**Aggregate(s) touches** : TourneePlanifiee (lecture), ColisComposition (lecture)
**Priorite** : Should Have
**Statut** : Prete
**Complexite estimee** : S

---

## User Story

En tant que superviseur logistique,
je veux que le fichier CSV telechargé depuis le detail d'une tournee (W-05)
contienne le nom du destinataire et le statut final de chaque colis (livre / echec),
afin de pouvoir utiliser ce fichier directement pour mes rapports de fin de journee
sans avoir a completer les donnees manuellement.

---

## Contexte

Feedback terrain du 2026-04-01 (Laurent Renaud) : le CSV genere par US-028 contient
les colonnes `#Colis, Adresse, Zone, Contrainte`. Ces colonnes couvrent le besoin
"avant depart" (verifier la composition). Pour le rapport de fin de journee, Laurent
a besoin de deux informations supplementaires sur chaque colis :
1. Le nom du destinataire (pour identifier le colis dans le rapport client)
2. Le statut final (Livre / Echec) pour calculer le taux de livraison de la tournee

Ces donnees sont disponibles dans le modele de donnees ; il s'agit uniquement de les
inclure dans le fichier CSV genere.

**Colonnes actuelles (US-028)** : `#Colis, Adresse, Zone, Contrainte`
**Colonnes cibles (cette US)** : `#Colis, Destinataire, Adresse, Zone, Contrainte, Statut`

**Invariants a respecter** :
- L'ordre des colonnes existantes est preserve (on ajoute Destinataire apres #Colis,
  et Statut en derniere colonne).
- Si le statut final n'est pas encore connu (tournee en cours), la colonne Statut
  affiche la valeur "En cours".
- Si le nom du destinataire est absent du modele, la colonne affiche une chaine vide.
- L'evenement `CompositionExportee` reste le Domain Event emis lors du telechargement.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Presence des colonnes enrichies dans le CSV

```gherkin
Given le superviseur est sur W-05 (detail d'une tournee)
And la tournee contient 3 colis avec des noms de destinataires connus
When il clique sur "Télécharger la liste"
Then le fichier CSV telecharge contient les colonnes :
  "#Colis, Destinataire, Adresse, Zone, Contrainte, Statut"
And la colonne Destinataire contient le nom du destinataire pour chaque colis
```

### Scenario 2 — Statut "Livré" present dans le CSV

```gherkin
Given le superviseur est sur W-05 pour une tournee terminee
And le colis COLIS-001 a le statut LivraisonConfirmee
When il clique sur "Télécharger la liste"
Then la ligne du colis COLIS-001 dans le CSV contient "Livré" dans la colonne Statut
And l'evenement CompositionExportee est emis
```

### Scenario 3 — Statut "Echec" present dans le CSV

```gherkin
Given le colis COLIS-002 a le statut EchecLivraisonDeclare
When le CSV est genere
Then la ligne du colis COLIS-002 dans le CSV contient "Échec" dans la colonne Statut
```

### Scenario 4 — Statut "En cours" pour colis non encore traite

```gherkin
Given la tournee est en cours
And le colis COLIS-003 n'a pas encore ete traite
When le CSV est genere
Then la ligne du colis COLIS-003 dans le CSV contient "En cours" dans la colonne Statut
```

### Scenario 5 — Retrocompatibilite du format

```gherkin
Given le CSV genere avant cette US avait le format "#Colis, Adresse, Zone, Contrainte"
When cette US est deployee
Then le nouveau format "#Colis, Destinataire, Adresse, Zone, Contrainte, Statut" est produit
And les tests existants sur la generation CSV sont mis a jour en consequence
```

---

## Definition of Done

- [ ] Colonne "Destinataire" ajoutee en 2eme position dans le CSV genere par US-028.
- [ ] Colonne "Statut" ajoutee en derniere position avec les valeurs "Livre" / "Echec" / "En cours".
- [ ] Valeur par defaut chaine vide si nom destinataire absent.
- [ ] Tests unitaires sur la fonction de generation CSV mis a jour.
- [ ] Tests Jest sur DetailTourneePlanifieePage mis a jour.
- [ ] Aucune regression sur le telechargement existant (format, encodage BOM UTF-8, CRLF).

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#W-05
- Feedback source : /livrables/09-feedback/feedback-superviseur-2026-04-01.md
- US liees : US-028 (export CSV composition, W-05), US-039 (bilan tableau de bord W-01)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
