# Scénarios de tests US-045 : Hint visuel swipe pour les nouveaux utilisateurs

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-045 — Afficher un hint visuel de découverte du swipe pour les nouveaux utilisateurs
**Bounded Context** : BC-01 Exécution Tournée (mobile — M-02 ListeColisScreen)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-045-01 | Hint visible à la première utilisation (swipeHintCount=0) | L1 | Passé |
| TC-045-02 | Hint visible aux 2ème et 3ème utilisations | L1 | Passé |
| TC-045-03 | Hint absent après SEUIL_HINT utilisations (swipeHintCount >= 3) | L1 | Passé |
| TC-045-04 | Compteur incrémenté après swipe réussi (M-05 ouvert) | L1 | Passé |
| TC-045-05 | Pas d'incrément si swipe non abouti (< 80px) | L1 | Passé |
| TC-045-06 | Fail-safe si AsyncStorage indisponible → hint affiché | L1 | Passé |
| TC-045-07 | Texte exact du hint | L1 | Passé |

---

### TC-045-01 : Hint visible à la première utilisation

**US liée** : US-045
**Niveau** : L1
**Couche testée** : Interface Layer (ColisItem / ListeColisScreen)
**Aggregate / Domain Event ciblé** : PreferenceUtilisateur (AsyncStorage swipeHintCount)
**Type** : Fonctionnel (SC1)

**Étapes** :
1. AsyncStorage mock avec swipeHintCount absent (= 0)
2. Monter ListeColisScreen ou ColisItem
3. Vérifier la présence du hint textuel

**Résultat attendu** : Texte "← Glissez vers la gauche pour déclarer un problème" visible sous chaque carte colis.

**Statut** : Passé

```gherkin
Given swipeHintCount est absent d'AsyncStorage (= 0 par défaut)
When M-02 est affiché
Then chaque carte colis affiche "← Glissez vers la gauche pour déclarer un problème"
And le texte est en typographie secondaire légère
```

---

### TC-045-02 : Hint visible aux 2ème et 3ème utilisations

**US liée** : US-045
**Niveau** : L1
**Couche testée** : Interface Layer
**Type** : Fonctionnel (SC2)

**Étapes** :
1. Tester avec swipeHintCount=1, puis swipeHintCount=2
2. Vérifier que le hint est toujours visible dans les deux cas

**Résultat attendu** : Hint visible pour swipeHintCount < 3.

**Statut** : Passé

```gherkin
Given swipeHintCount = 1 OU 2
When M-02 est affiché
Then le hint est visible sur les cartes colis
```

---

### TC-045-03 : Hint absent après SEUIL_HINT utilisations

**US liée** : US-045
**Niveau** : L1
**Couche testée** : Interface Layer
**Type** : Fonctionnel (SC3)

**Étapes** :
1. AsyncStorage avec swipeHintCount=3
2. Monter M-02
3. Vérifier l'absence du hint

**Résultat attendu** : Aucun texte de hint sur les cartes. Le swipe fonctionne toujours.

**Statut** : Passé

```gherkin
Given swipeHintCount = 3 (SEUIL_HINT atteint)
When M-02 est affiché
Then aucun hint textuel n'est présent sur les cartes colis
And le swipe continue de fonctionner normalement (non-régression US-029)
```

---

### TC-045-04 : Compteur incrémenté après swipe réussi

**US liée** : US-045
**Niveau** : L1
**Couche testée** : Interface Layer + Application (hook swipeHint)
**Type** : Fonctionnel (SC4)

**Étapes** :
1. swipeHintCount=1 dans AsyncStorage
2. Déclencher un swipe réussi (seuil 80px atteint, M-05 ouvert)
3. Vérifier que swipeHintCount passe à 2

**Résultat attendu** : setItem('swipeHintCount', '2') appelé.

**Statut** : Passé

```gherkin
Given swipeHintCount = 1
When le livreur effectue un swipe réussi (seuil 80px atteint et M-05 ouvert)
Then AsyncStorage.setItem est appelé avec ('swipeHintCount', '2')
```

---

### TC-045-05 : Pas d'incrément si swipe non abouti

**US liée** : US-045
**Niveau** : L1
**Couche testée** : Interface Layer
**Type** : Invariant (SC5)

**Étapes** :
1. swipeHintCount=1
2. Simuler swipe < 80px (spring-back)
3. Vérifier que swipeHintCount reste à 1

**Résultat attendu** : swipeHintCount inchangé.

**Statut** : Passé

```gherkin
Given swipeHintCount = 1
When le livreur effectue un swipe inférieur à 80px (spring-back)
Then swipeHintCount reste à 1 dans AsyncStorage
```

---

### TC-045-06 : Fail-safe si AsyncStorage indisponible

**US liée** : US-045
**Niveau** : L1
**Couche testée** : Interface Layer (comportement dégradé)
**Type** : Edge case (SC6)

**Étapes** :
1. AsyncStorage mock qui lève une exception sur getItem
2. Monter M-02
3. Vérifier que le hint est affiché par défaut

**Résultat attendu** : Hint affiché par défaut (fail-safe).

**Statut** : Passé

```gherkin
Given AsyncStorage est indisponible (getItem lève une erreur)
When M-02 est affiché
Then le hint est affiché par défaut (comportement fail-safe)
```

---

### TC-045-07 : Texte exact du hint

**US liée** : US-045
**Niveau** : L1
**Couche testée** : Interface Layer
**Type** : Invariant UI

**Étapes** :
1. Monter M-02 avec swipeHintCount=0
2. Vérifier le texte exact du hint

**Résultat attendu** : Exactement "← Glissez vers la gauche pour déclarer un problème".

**Statut** : Passé

```gherkin
Given swipeHintCount = 0
When M-02 est affiché
Then le texte du hint est exactement "← Glissez vers la gauche pour déclarer un problème"
```
