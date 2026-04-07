# Scénarios de tests US-037 : Historique des consignes livreur (écran M-07)

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-037 — Accéder à l'historique des consignes superviseur reçues dans la journée
**Bounded Context** : BC-04 Notification et Messaging (mobile — MesConsignesScreen M-07)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-037-01 | useConsignesLocales — ajout idempotent et tri décroissant | L1 | Passé |
| TC-037-02 | useConsignesLocales — badge compteur consignes non lues | L1 | Passé |
| TC-037-03 | useConsignesLocales — marquerToutesLues met à jour les statuts | L1 | Passé |
| TC-037-04 | useConsignesLocales — marquerExecutee délègue au callback | L1 | Passé |
| TC-037-05 | MesConsignesScreen — état vide affiche message dédié | L1 | Passé |
| TC-037-06 | MesConsignesScreen — liste affiche texte + badge statut + horodatage | L1 | Passé |
| TC-037-07 | MesConsignesScreen — bouton "Marquer exécutée" visible si ENVOYEE | L1 | Passé |
| TC-037-08 | MesConsignesScreen — navigation M-07→M-03 via onVoirColis | L1 | Passé |
| TC-037-09 | MesConsignesScreen — consigne sans colisId non interactive | L1 | Passé |
| TC-037-10 | MesConsignesScreen — bandeau offline si estHorsConnexion | L1 | Passé |
| TC-037-11 | BandeauInstructionOverlay — onConsignePersistee appelée au montage | L1 | Passé |
| TC-037-12 | PATCH prendre-en-compte appelé pour chaque consigne ENVOYEE | L1 | Passé |
| TC-037-13 | Réinitialisation à minuit via clé AsyncStorage par jour | L1 | Passé |

---

### TC-037-01 : useConsignesLocales — ajout idempotent et tri décroissant

**US liée** : US-037
**Niveau** : L1
**Couche testée** : Application Layer (hook useConsignesLocales)
**Aggregate / Domain Event ciblé** : InstructionRecue (Read Model local)
**Type** : Invariant domaine
**Préconditions** : Hook instancié avec AsyncStorage mock

**Étapes** :
1. Appeler ajouterConsigne(instruction-001)
2. Appeler ajouterConsigne(instruction-001) à nouveau (idempotence)
3. Appeler ajouterConsigne(instruction-002 — horodatage antérieur)
4. Vérifier l'ordre de la liste retournée

**Résultat attendu** : instruction-001 une seule fois. instruction-002 en second (tri décroissant par horodatage).

**Statut** : Passé

```gherkin
Given le hook useConsignesLocales est initialisé
When ajouterConsigne(instruction-001) est appelé deux fois
And ajouterConsigne(instruction-002) avec horodatage antérieur
Then la liste contient exactement 2 consignes
And instruction-001 (la plus récente) est en première position
And instruction-002 est en deuxième position
```

---

### TC-037-02 : Badge compteur consignes non lues

**US liée** : US-037
**Niveau** : L1
**Couche testée** : Application Layer (hook useConsignesLocales)
**Aggregate / Domain Event ciblé** : InstructionRecue (Read Model local)
**Type** : Fonctionnel (SC6)
**Préconditions** : 2 consignes au statut ENVOYEE, 1 au statut PRISE_EN_COMPTE

**Étapes** :
1. Ajouter 3 consignes avec statuts ENVOYEE, ENVOYEE, PRISE_EN_COMPTE
2. Vérifier la valeur retournée par le hook pour le badge

**Résultat attendu** : badge = 2 (uniquement les ENVOYEE)

**Statut** : Passé

```gherkin
Given 2 consignes ENVOYEE + 1 PRISE_EN_COMPTE
When MesConsignesScreen est affiché avec le hook
Then le badge rouge dans M-02 affiche "2"
```

---

### TC-037-05 : MesConsignesScreen — état vide affiche message dédié

**US liée** : US-037
**Niveau** : L1
**Couche testée** : Interface Layer (MesConsignesScreen)
**Aggregate / Domain Event ciblé** : InstructionRecue (Read Model local)
**Type** : Edge case (SC5d)
**Préconditions** : consignes=[], liste vide

**Étapes** :
1. Monter MesConsignesScreen avec consignes=[]
2. Vérifier l'affichage du message de liste vide

**Résultat attendu** : "Aucune consigne reçue aujourd'hui. Votre superviseur n'a pas envoyé d'instruction."

**Statut** : Passé

```gherkin
Given aucune InstructionRecue n'est présente
When MesConsignesScreen est affiché
Then le message "Aucune consigne reçue aujourd'hui. Votre superviseur n'a pas envoyé d'instruction." est affiché
```

---

### TC-037-06 : MesConsignesScreen — liste affiche texte + badge statut coloré

**US liée** : US-037
**Niveau** : L1
**Couche testée** : Interface Layer (MesConsignesScreen)
**Aggregate / Domain Event ciblé** : InstructionRecue (Read Model local)
**Type** : Fonctionnel (SC2 + SC5c)

**Étapes** :
1. Monter MesConsignesScreen avec 3 consignes aux statuts ENVOYEE, PRISE_EN_COMPTE, EXECUTEE
2. Vérifier les badges visuels

**Résultat attendu** : Badge ENVOYEE=bleu, PRISE_EN_COMPTE=gris, EXECUTEE=vert. texteConsigne affiché.

**Statut** : Passé

```gherkin
Given 3 consignes aux statuts ENVOYEE, PRISE_EN_COMPTE, EXECUTEE
When MesConsignesScreen est affiché
Then chaque consigne affiche son badge de statut coloré
And texteConsigne est affiché pour chaque consigne
```

---

### TC-037-08 : Navigation M-07→M-03 via onVoirColis

**US liée** : US-037
**Niveau** : L1
**Couche testée** : Interface Layer (MesConsignesScreen)
**Aggregate / Domain Event ciblé** : InstructionRecue (Read Model local)
**Type** : Fonctionnel (SC5)

**Étapes** :
1. Monter MesConsignesScreen avec onVoirColis callback et consigne avec colisId
2. Cliquer sur btn-voir-colis-{instructionId}
3. Vérifier que onVoirColis est appelé avec le bon colisId

**Résultat attendu** : onVoirColis appelé avec colisId de la consigne

**Statut** : Passé

```gherkin
Given MesConsignesScreen affiché avec onVoirColis fourni et consigne avec colisId="COLIS-042"
When le livreur appuie sur btn-voir-colis-{id}
Then onVoirColis est appelé avec colisId="COLIS-042"
```

---

### TC-037-09 : Consigne sans colisId non interactive

**US liée** : US-037
**Niveau** : L1
**Couche testée** : Interface Layer (MesConsignesScreen)
**Aggregate / Domain Event ciblé** : InstructionRecue (Read Model local)
**Type** : Edge case (SC5b)

**Étapes** :
1. Monter MesConsignesScreen avec consigne sans colisId
2. Vérifier l'absence de btn-voir-colis et la présence du message "Non associé à un colis"

**Résultat attendu** : btn-voir-colis absent. testID="non-associe-colis-{id}" présent.

**Statut** : Passé

```gherkin
Given consigne C-002 sans colisId
When MesConsignesScreen est affiché
Then btn-voir-colis-C-002 est absent
And non-associe-colis-C-002 est visible avec texte "Non associé à un colis"
```

---

### TC-037-10 : Bandeau offline si estHorsConnexion=true

**US liée** : US-037
**Niveau** : L1
**Couche testée** : Interface Layer (MesConsignesScreen)
**Aggregate / Domain Event ciblé** : InstructionRecue (Read Model local)
**Type** : Edge case (SC5e)

**Étapes** :
1. Monter MesConsignesScreen avec estHorsConnexion=true
2. Vérifier le bandeau orange

**Résultat attendu** : bandeau-offline-consignes visible. Message "Les nouvelles consignes ne peuvent pas arriver en mode hors connexion." affiché.

**Statut** : Passé

```gherkin
Given estHorsConnexion=true
When MesConsignesScreen est affiché
Then bandeau-offline-consignes orange est visible
And "Les nouvelles consignes ne peuvent pas arriver en mode hors connexion." est affiché
```

---

### TC-037-12 : PATCH prendre-en-compte appelé pour chaque consigne ENVOYEE

**US liée** : US-037
**Niveau** : L1
**Couche testée** : Application Layer (useConsignesLocales — prendreEnCompteNouvelles)
**Aggregate / Domain Event ciblé** : InstructionPriseEnCompte
**Type** : Fonctionnel (SC3)

**Étapes** :
1. 2 consignes ENVOYEE dans le hook
2. Appeler prendreEnCompteNouvelles()
3. Vérifier les appels PATCH

**Résultat attendu** : prendreEnCompteFn appelé pour chacune. Statuts locaux passent à PRISE_EN_COMPTE.

**Statut** : Passé

```gherkin
Given 2 consignes au statut ENVOYEE
When prendreEnCompteNouvelles() est appelé
Then prendreEnCompteFn est appelé 2 fois (une par consigne ENVOYEE)
And les statuts locaux passent à PRISE_EN_COMPTE
And AsyncStorage est mis à jour
```

---

### TC-037-13 : Réinitialisation à minuit via clé par jour

**US liée** : US-037
**Niveau** : L1
**Couche testée** : Application Layer (useConsignesLocales — clé AsyncStorage)
**Aggregate / Domain Event ciblé** : InstructionRecue (Read Model local)
**Type** : Edge case (SC7)

**Étapes** :
1. Vérifier que la clé AsyncStorage est formattée `consignes_jour_YYYY-MM-DD`
2. Simuler un changement de date
3. Vérifier que la nouvelle clé retourne une liste vide

**Résultat attendu** : La clé du jour J+1 est vide — réinitialisation implicite sans migration.

**Statut** : Passé

```gherkin
Given des consignes existent pour la clé "consignes_jour_2026-04-05"
When on demande les consignes pour "consignes_jour_2026-04-06"
Then la liste est vide (nouvelle clé = nouveau jour)
And le message liste vide est affiché dans MesConsignesScreen
```
