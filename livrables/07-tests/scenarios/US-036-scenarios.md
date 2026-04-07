# Scénarios de tests US-036 : Card SSO rétractable après la première connexion

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-036 — Card SSO rétractable après la première connexion
**Bounded Context** : BC-06 Identité et Accès (mobile, ConnexionScreen M-01)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-036-01 | Première ouverture — card visible et dépliée | L1 | Passé |
| TC-036-02 | Après connexion réussie — hasConnectedOnce=true écrit | L1 | Passé |
| TC-036-03 | Ouverture suivante — card repliée par défaut | L1 | Passé |
| TC-036-04 | Toggle manuel depuis état replié | L1 | Passé |
| TC-036-05 | Toggle manuel depuis état ouvert | L1 | Passé |
| TC-036-06 | Persistance préférence cardSsoOuverte en AsyncStorage | L1 | Passé |
| TC-036-07 | Non-régression US-019 — bouton SSO toujours accessible | L1 | Passé |

---

### TC-036-01 : Première ouverture — card visible et dépliée

**US liée** : US-036
**Niveau** : L1
**Couche testée** : Interface Layer (React Native — ConnexionScreen)
**Aggregate / Domain Event ciblé** : PreferenceUtilisateur (Read Model AsyncStorage)
**Type** : Fonctionnel (CA-1)
**Préconditions** : AsyncStorage vide (hasConnectedOnce absent), cardOuverte=null → initialisation à true

**Étapes** :
1. Monter ConnexionScreen avec AsyncStorage mock vide
2. Attendre la résolution du useEffect de chargement
3. Vérifier l'état de la card

**Résultat attendu** : card-sso-info visible. card-sso-contenu visible. btn-toggle-card-sso présent.

**Statut** : Passé

```gherkin
Given AsyncStorage est vide (première ouverture)
When ConnexionScreen est monté
Then card-sso-info est visible
And card-sso-contenu est visible (card dépliée)
And btn-toggle-card-sso est présent
And btn-connexion-sso est visible
```

---

### TC-036-02 : Après connexion réussie — hasConnectedOnce=true écrit

**US liée** : US-036
**Niveau** : L1
**Couche testée** : Interface Layer (React Native)
**Aggregate / Domain Event ciblé** : PreferenceUtilisateur (AsyncStorage)
**Type** : Fonctionnel (CA-2)
**Préconditions** : ConnexionScreen monté, status passe à 'authenticated'

**Étapes** :
1. Simuler status='authenticated' via le mock authStore
2. Vérifier que AsyncStorage.setItem('hasConnectedOnce', 'true') est appelé

**Résultat attendu** : setItem('hasConnectedOnce', 'true') appelé exactement une fois.

**Statut** : Passé

```gherkin
Given ConnexionScreen est monté et hasConnectedOnce est absent d'AsyncStorage
When le status authStore passe à 'authenticated'
Then AsyncStorage.setItem est appelé avec ('hasConnectedOnce', 'true')
And setItem n'est pas appelé si hasConnectedOnce était déjà 'true' (pas de double écriture)
```

---

### TC-036-03 : Ouverture suivante — card repliée par défaut

**US liée** : US-036
**Niveau** : L1
**Couche testée** : Interface Layer (React Native)
**Aggregate / Domain Event ciblé** : PreferenceUtilisateur (AsyncStorage)
**Type** : Fonctionnel (CA-3)
**Préconditions** : hasConnectedOnce='true' dans AsyncStorage, cardSsoOuverte absent

**Étapes** :
1. Pré-remplir AsyncStorage mock avec hasConnectedOnce='true'
2. Monter ConnexionScreen
3. Vérifier que card-sso-contenu est masqué

**Résultat attendu** : card-sso-header visible (titre + chevron), card-sso-contenu masqué.

**Statut** : Passé

```gherkin
Given AsyncStorage contient hasConnectedOnce='true' et cardSsoOuverte absent
When ConnexionScreen est monté
Then card-sso-contenu est masqué (card repliée)
And card-sso-header est visible avec le chevron
And btn-connexion-sso est visible
```

---

### TC-036-04 : Toggle depuis état replié — contenu devient visible

**US liée** : US-036
**Niveau** : L1
**Couche testée** : Interface Layer (React Native)
**Aggregate / Domain Event ciblé** : PreferenceUtilisateur (AsyncStorage)
**Type** : Fonctionnel (CA-4)
**Préconditions** : card repliée (hasConnectedOnce='true')

**Étapes** :
1. Cliquer sur btn-toggle-card-sso
2. Vérifier que card-sso-contenu est maintenant visible

**Résultat attendu** : card-sso-contenu visible après toggle.

**Statut** : Passé

```gherkin
Given card SSO est repliée (hasConnectedOnce='true')
When le livreur appuie sur btn-toggle-card-sso
Then card-sso-contenu devient visible
And AsyncStorage.setItem est appelé avec ('cardSsoOuverte', 'true')
```

---

### TC-036-05 : Toggle depuis état ouvert — contenu devient masqué

**US liée** : US-036
**Niveau** : L1
**Couche testée** : Interface Layer (React Native)
**Aggregate / Domain Event ciblé** : PreferenceUtilisateur (AsyncStorage)
**Type** : Fonctionnel (CA-4 — inverse)
**Préconditions** : card ouverte (première ouverture)

**Étapes** :
1. Cliquer sur btn-toggle-card-sso depuis l'état ouvert
2. Vérifier que card-sso-contenu est masqué

**Résultat attendu** : card-sso-contenu masqué. AsyncStorage.setItem('cardSsoOuverte', 'false') appelé.

**Statut** : Passé

```gherkin
Given card SSO est ouverte
When le livreur appuie sur btn-toggle-card-sso
Then card-sso-contenu est masqué
And AsyncStorage.setItem est appelé avec ('cardSsoOuverte', 'false')
```

---

### TC-036-06 : Persistance préférence cardSsoOuverte restorée au chargement

**US liée** : US-036
**Niveau** : L1
**Couche testée** : Interface Layer (React Native)
**Aggregate / Domain Event ciblé** : PreferenceUtilisateur (AsyncStorage)
**Type** : Fonctionnel (CA-5)
**Préconditions** : hasConnectedOnce='true', cardSsoOuverte='true'

**Étapes** :
1. Pré-remplir AsyncStorage avec cardSsoOuverte='true'
2. Monter ConnexionScreen
3. Vérifier que card-sso-contenu est visible (préférence explicite prime sur défaut)

**Résultat attendu** : card-sso-contenu visible (préférence explicite 'true' prime sur le comportement par défaut "replié si déjà connecté").

**Statut** : Passé

```gherkin
Given hasConnectedOnce='true' ET cardSsoOuverte='true' dans AsyncStorage
When ConnexionScreen est monté
Then card-sso-contenu est visible (préférence explicite prime)
```

---

### TC-036-07 : Non-régression US-019 — bouton SSO toujours accessible

**US liée** : US-036
**Niveau** : L1
**Couche testée** : Interface Layer (React Native)
**Aggregate / Domain Event ciblé** : AuthStore (onLoginSuccess)
**Type** : Non régression
**Préconditions** : Tous états de la card (ouverte / repliée)

**Étapes** :
1. Monter ConnexionScreen en état ouvert
2. Vérifier que btn-connexion-sso est visible
3. Monter ConnexionScreen en état replié
4. Vérifier que btn-connexion-sso est visible

**Résultat attendu** : btn-connexion-sso visible dans tous les états de la card.

**Statut** : Passé

```gherkin
Given ConnexionScreen en état card ouverte OU card repliée
When ConnexionScreen est affiché
Then btn-connexion-sso est toujours visible et interactif
And spinner d'authentification est présent (non-régression indicator authStore)
```
