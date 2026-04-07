# Scénarios de tests US-043 : Card SSO rétractable dès la première ouverture avant connexion

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-043 — Permettre de replier la card SSO dès la première ouverture avant toute connexion
**Bounded Context** : BC-06 Identité et Accès (mobile — ConnexionScreen M-01)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-043-01 | Chevron haut visible dès la première ouverture | L1 | Passé |
| TC-043-02 | Appui sur chevron haut replie la card sans AsyncStorage | L1 | Passé |
| TC-043-03 | Re-ouverture sans connexion : card re-étendue | L1 | Passé |
| TC-043-04 | Connexion réussie après repliage → mémorisation AsyncStorage | L1 | Passé |
| TC-043-05 | Chevron bas redéploie la card | L1 | Passé |
| TC-043-06 | Bouton connexion toujours accessible | L1 | Passé |

---

### TC-043-01 : Chevron haut visible dès la première ouverture

**US liée** : US-043
**Niveau** : L1
**Couche testée** : Interface Layer (ConnexionScreen)
**Type** : Fonctionnel (SC1)

**Étapes** :
1. Monter ConnexionScreen avec AsyncStorage vide (première ouverture)
2. Vérifier la présence du chevron haut

**Résultat attendu** : card SSO ouverte + chevron haut [^] visible. Texte SSO complet affiché.

**Statut** : Passé

```gherkin
Given AsyncStorage vide (première ouverture, aucune connexion précédente)
When ConnexionScreen est affiché
Then la card SSO est en mode étendu
And le chevron haut [^] est visible en haut à droite de la card
And le bouton "Se connecter (via compte Docaposte)" est visible
```

---

### TC-043-02 : Appui sur chevron haut replie la card sans écriture AsyncStorage

**US liée** : US-043
**Niveau** : L1
**Couche testée** : Interface Layer (ConnexionScreen)
**Type** : Invariant UI (SC2)

**Étapes** :
1. Appuyer sur le chevron haut dans la première session
2. Vérifier que la card est repliée
3. Vérifier qu'aucun setItem n'est appelé pour cardSsoOuverte

**Résultat attendu** : card repliée, chevron bas visible. Aucune écriture AsyncStorage pour cardSsoOuverte.

**Statut** : Passé

```gherkin
Given ConnexionScreen en première session avec card étendue
When le livreur appuie sur le chevron haut
Then la card se replie immédiatement
And seule la ligne "Comment fonctionne... [v]" est visible
And AsyncStorage.setItem n'est PAS appelé pour 'cardSsoOuverte'
And bouton connexion reste visible
```

---

### TC-043-03 : Re-ouverture sans connexion : card re-étendue

**US liée** : US-043
**Niveau** : L1
**Couche testée** : Interface Layer (ConnexionScreen)
**Type** : Non régression (SC3)

**Étapes** :
1. Simuler une re-ouverture sans connexion (hasConnectedOnce absent, cardSsoOuverte absent)
2. Vérifier que la card est à nouveau étendue

**Résultat attendu** : card étendue (repliage de session courante non mémorisé).

**Statut** : Passé

```gherkin
Given le livreur a replié la card sans se connecter
And AsyncStorage ne contient ni hasConnectedOnce ni cardSsoOuverte
When ConnexionScreen est de nouveau affiché (nouvelle session)
Then la card SSO est en mode étendu
```

---

### TC-043-04 : Connexion réussie après repliage → mémorisation AsyncStorage (US-036)

**US liée** : US-043
**Niveau** : L1
**Couche testée** : Interface Layer (ConnexionScreen)
**Type** : Non régression US-036 (SC4)

**Étapes** :
1. Replier la card manuellement (première session)
2. Se connecter avec succès
3. Vérifier que hasConnectedOnce='true' est écrit
4. Simuler re-ouverture : vérifier card repliée (US-036 behavior)

**Résultat attendu** : Après connexion réussie, hasConnectedOnce='true' est mémorisé. Card repliée à la session suivante (US-036 comportement intact).

**Statut** : Passé

```gherkin
Given le livreur a replié la card et clique sur "Se connecter"
When la connexion est réussie (status='authenticated')
Then hasConnectedOnce='true' est écrit en AsyncStorage (US-036)
And à la session suivante, la card est repliée par défaut (US-036 intact)
```

---

### TC-043-05 : Chevron bas redéploie la card

**US liée** : US-043
**Niveau** : L1
**Couche testée** : Interface Layer (ConnexionScreen)
**Type** : Fonctionnel (SC5)

**Étapes** :
1. Replier la card (chevron bas visible)
2. Appuyer sur le chevron bas
3. Vérifier que la card se redéploie

**Résultat attendu** : card redéployée, chevron haut visible à nouveau.

**Statut** : Passé

```gherkin
Given la card SSO est repliée (chevron bas visible)
When le livreur appuie sur le chevron bas
Then la card se redéploie et affiche le texte SSO complet
And le chevron haut est à nouveau visible
And bouton connexion reste visible
```

---

### TC-043-06 : Bouton connexion toujours accessible

**US liée** : US-043
**Niveau** : L1
**Couche testée** : Interface Layer (ConnexionScreen)
**Type** : Invariant UI (SC6)

**Étapes** :
1. Vérifier btn-connexion-sso dans l'état étendu
2. Vérifier btn-connexion-sso dans l'état replié

**Résultat attendu** : btn-connexion-sso visible dans les deux états.

**Statut** : Passé

```gherkin
Given ConnexionScreen en état étendu OU replié
When ConnexionScreen est affiché
Then btn-connexion-sso est toujours visible et interactif
And l'appui déclenche la redirection SSO OAuth2
```
