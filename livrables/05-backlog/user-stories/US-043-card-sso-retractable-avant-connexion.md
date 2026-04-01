# US-043 : Permettre de replier la card SSO dès la première ouverture avant toute connexion

**Epic** : EPIC-006 : Authentification et Acces
**Feature** : F-017 : Connexion SSO corporate et controle d'acces par role
**Bounded Context** : BC-06 Authentification et Acces (Generic Subdomain)
**Aggregate(s) touches** : PreferenceUtilisateur (Read Model local AsyncStorage)
**Priorite** : Should Have
**Statut** : Prete
**Complexite estimee** : S

---

## User Story

En tant que livreur terrain,
je veux pouvoir replier manuellement la card SSO explicative des la premiere ouverture
de l'application, avant meme de me connecter,
afin de cacher les explications quand je n'en ai pas besoin et acceder directement
au bouton de connexion.

---

## Contexte

Feedback terrain du 2026-04-01 (Pierre Morel) : US-036 a bien implemente la card SSO
retractable apres la premiere connexion reussie. La card se replie en memoire (AsyncStorage)
apres connexion. Mais Pierre signale un besoin complementaire : le matin, quand il a deja
son badge sous la main, il veut pouvoir appuyer directement sur "Se connecter" sans lire
les explications. Il veut un bouton de reduction disponible des la premiere ouverture,
meme si aucune connexion n'a encore eu lieu.

**Comportement cible** :
- A la premiere ouverture de l'application (ConnexionScreen), la card SSO est affichee
  en mode etendu (comportement actuel US-036 preserve).
- Un bouton "Fermer" ou une icone de reduction (chevron haut) est visible sur la card
  des la premiere ouverture.
- Si le livreur appuie sur ce bouton, la card se replie IMMEDIATEMENT (dans la session
  courante).
- Ce repliage manuel de la premiere session n'est PAS memorise en AsyncStorage —
  a la prochaine ouverture de l'application, la card est a nouveau etendue si aucune
  connexion reussie n'a encore eu lieu.
- Apres une premiere connexion reussie, le comportement d'US-036 reprend le dessus :
  la card est memorisee comme repliee en AsyncStorage.

**Distinction cle avec US-036** :
- US-036 : repliage apres connexion reussie → memorise en AsyncStorage
- US-043 : repliage avant connexion (session courante uniquement) → non memorise

**Invariants a respecter** :
- Le bouton "Se connecter" reste accessible a tout moment, que la card soit etendue ou repliee.
- Le chevron de la card indique l'etat : pointe vers le haut si etendue (peut etre repliee),
  vers le bas si repliee (peut etre etendue).
- La logique de memorisation AsyncStorage de US-036 est preservee intacte.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Bouton de reduction present des la premiere ouverture

```gherkin
Given l'application est ouverte pour la premiere fois (aucune connexion precedente en AsyncStorage)
When ConnexionScreen est affiche
Then la card SSO est affichee en mode etendu (comportement US-036 preserve)
And un bouton de reduction (chevron ou icone "Fermer") est visible sur la card
```

### Scenario 2 — Repliage immediat a la premiere session

```gherkin
Given ConnexionScreen est affiche avec la card SSO etendue (premiere session)
When le livreur appuie sur le bouton de reduction
Then la card SSO se replie immediatement dans la session courante
And le bouton "Se connecter" reste visible et accessible
And aucune valeur n'est ecrite en AsyncStorage pour le statut de la card
```

### Scenario 3 — Re-ouverture de l'application sans connexion

```gherkin
Given le livreur a replie la card SSO manuellement sans se connecter
And il ferme puis re-ouvre l'application
When ConnexionScreen est affiche a nouveau
Then la card SSO est affichee en mode etendu (repliage non memorise)
```

### Scenario 4 — Connexion reussie apres repliage manuel

```gherkin
Given le livreur a replie la card SSO manuellement
And il clique sur "Se connecter" et se connecte avec succes
When ConnexionScreen est affiche lors de la session suivante
Then la card SSO est affichee en mode replie (comportement US-036 — memorise en AsyncStorage)
```

### Scenario 5 — Card etendue/repliee restent fonctionnelles

```gherkin
Given la card SSO est en mode replie (manuel ou memorise)
When le livreur appuie sur le chevron bas
Then la card se re-etend et affiche les explications SSO
And le bouton de reduction est a nouveau visible
```

---

## Definition of Done

- [ ] Bouton de reduction present sur la card SSO des la premiere ouverture.
- [ ] Repliage immediat dans la session courante (state local, non AsyncStorage).
- [ ] Aucune ecriture AsyncStorage lors d'un repliage avant connexion.
- [ ] Comportement AsyncStorage de US-036 preserve apres connexion reussie.
- [ ] Tests unitaires sur ConnexionScreen couvrant les 5 scenarios.
- [ ] Aucune regression sur US-036 (memorisation apres connexion) et US-019 (authentification SSO).

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#M-01
- Feedback source : /livrables/09-feedback/feedback-livreur-2026-04-01.md
- US liees : US-036 (card SSO retractable apres connexion — prerequis), US-019 (authentification SSO mobile)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
