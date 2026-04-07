# Scénarios de tests US-042 : Horodatage adaptatif des consignes dans M-07

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-042 — Afficher la date et l'heure d'émission de chaque consigne dans M-07
**Bounded Context** : BC-04 Notification et Messaging (mobile — MesConsignesScreen M-07)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-042-01 | Format "HH:mm" pour consignes du jour | L1 | Passé |
| TC-042-02 | Format "JJ/MM HH:mm" pour consignes hors du jour | L1 | Passé |
| TC-042-03 | Ordre chronologique inverse confirmé avec horodatage | L1 | Passé |
| TC-042-04 | Horodatage sous le texte de chaque consigne | L1 | Passé |

---

### TC-042-01 : Format "HH:mm" pour consignes du jour

**US liée** : US-042
**Niveau** : L1
**Couche testée** : Interface Layer (MesConsignesScreen — formateur horodatage)
**Aggregate / Domain Event ciblé** : InstructionRecue (Read Model local — horodatageReception)
**Type** : Fonctionnel (SC1)

**Étapes** :
1. Créer une consigne avec horodatageReception = aujourd'hui à 14:35
2. Monter MesConsignesScreen
3. Vérifier le format affiché

**Résultat attendu** : "14:35" affiché (pas de date si consigne du jour).

**Statut** : Passé

```gherkin
Given une InstructionRecue avec horodatageReception = aujourd'hui 14:35
When MesConsignesScreen est affiché
Then l'horodatage affiché est "14:35" (format HH:mm)
And l'horodatage est placé sous le texte de la consigne
```

---

### TC-042-02 : Format "JJ/MM HH:mm" pour consignes hors du jour

**US liée** : US-042
**Niveau** : L1
**Couche testée** : Interface Layer (MesConsignesScreen — formateur horodatage)
**Aggregate / Domain Event ciblé** : InstructionRecue (Read Model local)
**Type** : Edge case (SC3)

**Étapes** :
1. Créer une consigne avec horodatageReception = veille à 22:47
2. Monter MesConsignesScreen
3. Vérifier le format affiché

**Résultat attendu** : "31/03 22:47" ou équivalent format JJ/MM HH:mm.

**Statut** : Passé

```gherkin
Given une InstructionRecue avec horodatageReception = veille 22:47
When MesConsignesScreen est affiché
Then l'horodatage affiché est au format "JJ/MM HH:mm" (ex: "31/03 22:47")
```

---

### TC-042-03 : Ordre chronologique inverse confirmé avec horodatage

**US liée** : US-042
**Niveau** : L1
**Couche testée** : Application Layer (useConsignesLocales — tri)
**Aggregate / Domain Event ciblé** : InstructionRecue (Read Model local)
**Type** : Non régression (SC2)

**Étapes** :
1. Créer 3 consignes avec horodatages 09:00, 11:30, 14:45
2. Monter MesConsignesScreen
3. Vérifier l'ordre d'affichage

**Résultat attendu** : 14:45 en premier, 11:30 en second, 09:00 en troisième.

**Statut** : Passé

```gherkin
Given 3 consignes reçues à 09:00, 11:30 et 14:45
When MesConsignesScreen est affiché
Then la consigne de 14:45 est en première position
And la consigne de 11:30 est en deuxième position
And la consigne de 09:00 est en troisième position
```

---

### TC-042-04 : Horodatage positionné sous le texte

**US liée** : US-042
**Niveau** : L1
**Couche testée** : Interface Layer (MesConsignesScreen)
**Aggregate / Domain Event ciblé** : InstructionRecue (Read Model local)
**Type** : Fonctionnel (CA - placement)

**Étapes** :
1. Monter MesConsignesScreen avec consignes ayant un texteConsigne
2. Vérifier la présence de l'horodatage en tant qu'élément distinct sous le texte

**Résultat attendu** : L'horodatage est placé sous le texte de la consigne, en typographie secondaire.

**Statut** : Passé

```gherkin
Given MesConsignesScreen affiche une consigne avec texteConsigne et horodatageReception
When M-07 est affiché
Then l'horodatage est présent sous le texte de la consigne
And le style est secondaire / léger (non intrusif)
```
