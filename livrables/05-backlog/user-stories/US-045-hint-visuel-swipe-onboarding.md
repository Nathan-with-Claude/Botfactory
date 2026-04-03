# US-045 : Afficher un hint visuel de découverte du swipe pour les nouveaux utilisateurs

**Epic** : EPIC-001 : Execution de la Tournee (application mobile livreur)
**Feature** : F-004 : Declaration d'un echec de livraison avec motif normalise
**Bounded Context** : BC-01 Execution Tournee (Core Domain)
**Aggregate(s) touches** : (preference utilisateur — Read Model local AsyncStorage)
**Priorite** : Could Have
**Statut** : Prete
**Complexite estimee** : S
**Wireframe de référence** : /livrables/02-ux/wireframes.md#M-02 (v1.3 — 2026-04-02)

---

## User Story

En tant que livreur terrain qui utilise l'application pour la premiere fois,
je veux voir une indication visuelle qui me montre que je peux glisser vers la gauche
sur une carte colis pour declarer rapidement un echec de livraison,
afin de decouvrir cette fonctionnalite sans avoir a etre forme ou a chercher dans l'interface.

---

## Contexte

Feedback terrain du 2026-04-01 (Pierre Morel) et 2026-03-30 : le geste swipe gauche de
US-029 est bien calibre techniquement (seuil 80px, spring-back), mais il est totalement
invisible. Les utilisateurs ne devinent pas qu'un geste horizontal est possible sur les
cartes de la liste de colis. Sans onboarding ou hint visuel, cette fonctionnalite ne sera
pas adoptee spontanement.

Solution proposee par Pierre (feedback 01/04) : un hint textuel visible uniquement les
3 a 5 premieres fois ("Glisser vers la gauche pour declarer un probleme"), puis qui
disparait pour les utilisateurs experimentes. Le compteur d'utilisations est memorise
en AsyncStorage.

**Comportement detaille (wireframe M-02 v1.3)** :
- Un texte d'aide "← Glissez vers la gauche pour declarer un probleme" est affiche
  sous chaque carte colis, en typographie secondaire legere, uniquement si le
  compteur d'utilisations < SEUIL_HINT (3 utilisations).
- Le texte du hint est exactement : "← Glissez vers la gauche pour declarer un probleme"
  (fleche gauche + texte, en minuscules, non intrusif).
- Option visuelle (Could Have imbriquee) : une micro-animation "fremissement" de la carte
  au premier chargement de la liste (deplacement de 8px a gauche, puis spring-back) renforce
  la suggestion du geste. Cette animation se produit une seule fois au premier chargement.
- A chaque fois que le livreur utilise le swipe avec succes (seuil 80px atteint et
  ecran M-05 ouvert), le compteur s'incremente dans AsyncStorage.
- Quand compteur >= SEUIL_HINT : le hint textuel n'est plus affiche.
- Le SEUIL_HINT est une constante configurable (valeur par defaut : 3).

**Invariants a respecter** :
- Le hint est affiche uniquement si le compteur AsyncStorage `swipeHintCount` < SEUIL_HINT.
- Le compteur s'incremente uniquement lors d'une utilisation reussie du swipe
  (pas au simple chargement de la liste).
- Si AsyncStorage n'est pas disponible (mode degradé), le hint est affiche par defaut
  (fail-safe : mieux afficher le hint en trop que pas du tout).
- La fonctionnalite de swipe (US-029) est entierement preservee — cette US est
  un ajout d'affordance, pas une modification du geste.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Hint visible a la premiere utilisation avec texte exact

```gherkin
Given le livreur ouvre la liste de colis (M-02) pour la premiere fois
And le compteur swipeHintCount dans AsyncStorage est 0 (ou absent)
When M-02 est affiche
Then chaque carte colis affiche le texte "← Glissez vers la gauche pour déclarer un problème"
And le texte est affiche sous la carte, en typographie secondaire (leger, non intrusif)
```

### Scenario 2 — Hint toujours visible aux 2eme et 3eme utilisations

```gherkin
Given le compteur swipeHintCount est 1 ou 2
When M-02 est affiche
Then le hint est toujours visible sur les cartes colis
```

### Scenario 3 — Hint disparait apres SEUIL_HINT utilisations reussies

```gherkin
Given le livreur a utilise le swipe avec succes 3 fois (swipeHintCount = 3)
When M-02 est affiche
Then aucun hint textuel n'est affiche sur les cartes colis
And le swipe continue de fonctionner normalement
```

### Scenario 4 — Increment du compteur apres swipe reussi

```gherkin
Given swipeHintCount = 1 et le hint est visible
When le livreur effectue un swipe gauche reussi sur une carte (seuil 80px atteint)
And l'ecran M-05 (declaration echec) s'ouvre
Then swipeHintCount passe a 2 dans AsyncStorage
```

### Scenario 5 — Pas d'increment si swipe non abouti

```gherkin
Given swipeHintCount = 1 et le livreur effectue un swipe inferieur a 80px (spring-back)
When la carte revient a sa position initiale
Then swipeHintCount reste a 1 dans AsyncStorage
```

### Scenario 6 — Fail-safe si AsyncStorage indisponible

```gherkin
Given AsyncStorage est indisponible (mode degradé)
When M-02 est affiche
Then le hint est affiche sur les cartes colis (comportement par defaut)
```

---

## Definition of Done

- [ ] Hint textuel "← Glissez vers la gauche pour déclarer un problème" affiche si
      swipeHintCount < SEUIL_HINT (3), positionne sous chaque carte colis.
- [ ] SEUIL_HINT est une constante configurable dans le code.
- [ ] Compteur swipeHintCount gere dans AsyncStorage.
- [ ] Increment du compteur uniquement apres un swipe reussi (M-05 ouvert).
- [ ] Comportement fail-safe si AsyncStorage indisponible (hint affiche par defaut).
- [ ] Option : micro-animation fremissement 8px au premier chargement (Could Have).
- [ ] Tests unitaires sur la logique de hint (texte exact, increment, seuil, fail-safe).
- [ ] Aucune regression sur US-029 (swipe gauche echec livraison).
- [ ] Aucune interference avec l'icone "Mes consignes" et son badge rouge dans le header M-02.

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#M-02
- Feedback source livreur : /livrables/09-feedback/feedback-livreur-2026-04-01.md
- Feedback source livreur 30/03 : /livrables/09-feedback/feedback-livreur-2026-03-30.md
- US liees : US-029 (swipe rapide echec livraison — prerequis)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
