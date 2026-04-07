# Scénarios de tests US-038 : Harmonisation des libellés UX

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-038 — Harmoniser les libellés de l'interface avec le langage naturel terrain
**Bounded Context** : BC-01 Exécution Tournée (mobile) + BC-03 Supervision (web)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-038-01 | Onglet "Repassage" dans M-02 (A_REPRESENTER) | L1 | Passé |
| TC-038-02 | Badge statut "Traitée" dans M-07 (EXECUTEE) | L1 | Passé |
| TC-038-03 | Bouton "Traitée" dans M-07 (action) | L1 | Passé |
| TC-038-04 | Indicateur "Chargement trop lourd" dans W-05 | L1 | Passé |
| TC-038-05 | Bouton "Télécharger la liste" dans W-05 | L1 | Passé |
| TC-038-06 | Placeholder "numéro de tournée" dans W-01 | L1 | Passé |
| TC-038-07 | Enum StatutInstruction.EXECUTEE inchangé | L1 | Passé |
| TC-038-08 | Recherche TMS fonctionnelle malgré changement placeholder | L1 | Passé |

---

### TC-038-01 : Onglet "Repassage" dans M-02

**US liée** : US-038
**Niveau** : L1
**Couche testée** : Interface Layer (ColisItem.tsx — mobile)
**Aggregate / Domain Event ciblé** : aucun (libellé affichage pur)
**Type** : Fonctionnel (SC1)

**Étapes** :
1. Monter ColisItem avec statut A_REPRESENTER
2. Vérifier le texte affiché dans le badge statut

**Résultat attendu** : "Repassage" affiché. Ni "A repr." ni "A representer" ne sont visibles.

**Statut** : Passé

```gherkin
Given ColisItem avec statut A_REPRESENTER
When M-02 est affiché
Then getByTestId('colis-statut') affiche "Repassage"
And aucun texte "A repr." ou "A representer" n'est présent
```

---

### TC-038-02 : Badge statut "Traitée" dans M-07 (EXECUTEE)

**US liée** : US-038
**Niveau** : L1
**Couche testée** : Interface Layer (MesConsignesScreen.tsx — mobile)
**Aggregate / Domain Event ciblé** : StatutInstruction.EXECUTEE (enum inchangé)
**Type** : Fonctionnel (SC3)

**Étapes** :
1. Monter MesConsignesScreen avec consigne au statut EXECUTEE
2. Vérifier le texte du badge

**Résultat attendu** : Badge affiche "Traitée". L'enum interne EXECUTEE reste inchangé.

**Statut** : Passé

```gherkin
Given une consigne au statut EXECUTEE
When MesConsignesScreen est affiché
Then le badge affiche "Traitée"
And l'enum StatutInstruction.EXECUTEE reste inchangé
```

---

### TC-038-03 : Bouton "Traitée" comme action dans M-07

**US liée** : US-038
**Niveau** : L1
**Couche testée** : Interface Layer (MesConsignesScreen.tsx — mobile)
**Aggregate / Domain Event ciblé** : StatutInstruction.EXECUTEE
**Type** : Fonctionnel (SC2)

**Étapes** :
1. Monter MesConsignesScreen avec consigne au statut ENVOYEE
2. Vérifier le texte du bouton d'action

**Résultat attendu** : Bouton affiche "Traitée" (non "Marquer exécutée").

**Statut** : Passé

```gherkin
Given consigne au statut ENVOYEE (action disponible)
When MesConsignesScreen est affiché
Then le bouton d'action affiche "Traitée"
And accessibilityLabel est "Marquer l'instruction comme traitée"
```

---

### TC-038-04 : Indicateur "Chargement trop lourd" dans W-05

**US liée** : US-038
**Niveau** : L1
**Couche testée** : Interface Layer (DetailTourneePlanifieePage.tsx — web)
**Aggregate / Domain Event ciblé** : ResultatCompatibilite.DEPASSEMENT (enum inchangé)
**Type** : Fonctionnel (SC4)

**Étapes** :
1. Vérifier le contenu de DetailTourneePlanifieePage.tsx via lecture de fichier
2. Confirmer la présence de "Chargement trop lourd" et l'absence de "Dépassement détecté"

**Résultat attendu** : "Chargement trop lourd" présent dans le fichier TSX. L'enum DEPASSEMENT reste inchangé.

**Statut** : Passé

```gherkin
Given DetailTourneePlanifieePage.tsx implémenté
When on vérifie le texte de l'indicateur de compatibilité DEPASSEMENT
Then "Chargement trop lourd" est présent
And "Dépassement détecté" est absent
And ResultatCompatibilite.DEPASSEMENT reste inchangé
```

---

### TC-038-05 : Bouton "Télécharger la liste" dans W-05

**US liée** : US-038
**Niveau** : L1
**Couche testée** : Interface Layer (DetailTourneePlanifieePage.tsx — web)
**Aggregate / Domain Event ciblé** : CompositionExportee
**Type** : Fonctionnel (SC5)

**Étapes** :
1. Vérifier la présence de "btn-telecharger-liste" et "Télécharger la liste" dans le fichier TSX
2. Confirmer que le clic déclenche le téléchargement CSV (comportement identique à "Exporter CSV")

**Résultat attendu** : data-testid="btn-telecharger-liste" et texte "Télécharger la liste" présents.

**Statut** : Passé

```gherkin
Given DetailTourneePlanifieePage.tsx implémenté
When on vérifie le bouton d'export
Then btn-telecharger-liste est présent
And le texte "Télécharger la liste" est affiché
And le clic déclenche telechargerListeCSV() → téléchargement Blob CSV
```

---

### TC-038-06 : Placeholder "numéro de tournée" dans W-01

**US liée** : US-038
**Niveau** : L1
**Couche testée** : Interface Layer (TableauDeBordPage.tsx — web)
**Aggregate / Domain Event ciblé** : VueTournee (Read Model)
**Type** : Fonctionnel (SC6)

**Étapes** :
1. Vérifier la présence de "numéro de tournée" dans le placeholder du champ-recherche

**Résultat attendu** : placeholder contient "numéro de tournée". L'ancien "code TMS" est absent.

**Statut** : Passé

```gherkin
Given TableauDeBordPage.tsx implémenté
When on vérifie le placeholder de champ-recherche
Then le placeholder contient "numéro de tournée"
And "code TMS" n'apparaît plus dans le placeholder
And la recherche par valeur TMS (ex: "T-205") continue de fonctionner
```

---

### TC-038-07 : Enum StatutInstruction.EXECUTEE inchangé (invariant)

**US liée** : US-038
**Niveau** : L1
**Couche testée** : Domain Layer
**Aggregate / Domain Event ciblé** : StatutInstruction
**Type** : Invariant domaine
**Préconditions** : Codebase existant

**Étapes** :
1. Vérifier que StatutInstruction.EXECUTEE n'a pas été renommé ou supprimé
2. Vérifier que les tests existants utilisant EXECUTEE passent encore

**Résultat attendu** : L'enum EXECUTEE est inchangé. 329/329 tests verts après US-038.

**Statut** : Passé

```gherkin
Given US-038 est implémentée
When on vérifie l'enum StatutInstruction
Then EXECUTEE existe toujours avec la même valeur
And les tests existants référençant EXECUTEE passent (aucune régression)
```

---

### TC-038-08 : Recherche TMS fonctionnelle malgré changement placeholder

**US liée** : US-038
**Niveau** : L1
**Couche testée** : Interface Layer (TableauDeBordPage.tsx — web)
**Aggregate / Domain Event ciblé** : VueTournee (Read Model)
**Type** : Non régression
**Préconditions** : Tests US-035 existants

**Étapes** :
1. Exécuter les tests US-035 après US-038
2. Vérifier qu'aucune régression n'est introduite

**Résultat attendu** : Les 9 tests US-035 de TableauDeBordPage.test.tsx passent encore.

**Statut** : Passé

```gherkin
Given TableauDeBordPage.tsx avec placeholder "numéro de tournée" (US-038)
When on exécute les tests US-035 (recherche T-202, Villeurb, Marie...)
Then tous les tests US-035 passent (aucune régression)
```
