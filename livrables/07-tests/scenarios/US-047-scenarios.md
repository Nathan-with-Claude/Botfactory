# Scénarios de tests US-047 : Sélecteur livreur en mode développement

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-047 — Sélectionner un compte livreur en mode développement
**Bounded Context** : BC-06 Identité et Accès (mobile — ConnexionScreen dev picker)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-047-01 | section-dev-mode visible en mode __DEV__=true | L1 | Passé |
| TC-047-02 | section-dev-mode absent en mode production | L1 | Passé |
| TC-047-03 | Connexion via sélection livreur dev | L1 | Passé |
| TC-047-04 | livreurId dans les headers API après sélection | L1 | Passé |
| TC-047-05 | Accessibilité des boutons livreur | L1 | Passé |

---

### TC-047-01 : section-dev-mode visible en mode __DEV__=true

**Niveau** : L1 | **Type** : Fonctionnel (SC1)

```gherkin
Given l'application est lancée avec __DEV__=true
And devLivreurs contient 4 livreurs (Pierre Martin, Paul Dupont, Marie Lambert, Jean Moreau)
When ConnexionScreen est affiché
Then section-dev-mode est visible
And 4 boutons btn-dev-livreur-{id} sont présents
And chaque bouton affiche le nom complet + identifiant technique
```

**Statut** : Passé

---

### TC-047-02 : section-dev-mode absent en production

**Niveau** : L1 | **Type** : Invariant (SC2)

```gherkin
Given devLivreurs est undefined (mode production)
When ConnexionScreen est affiché
Then section-dev-mode est absent du DOM
And btn-connexion-sso est présent normalement
```

**Statut** : Passé

---

### TC-047-03 : Connexion via sélection livreur dev

**Niveau** : L1 | **Type** : Fonctionnel (SC3)

```gherkin
Given ConnexionScreen est affiché en mode dev avec devLivreurs
When l'utilisateur appuie sur btn-dev-livreur-livreur-001 (Pierre Martin)
Then onDevLivreurSelected est appelé avec livreurId="livreur-001"
And un faux JWT est créé avec sub="livreur-001" et roles=["LIVREUR"]
And le statut authStore passe à "authenticated"
```

**Statut** : Passé

---

### TC-047-04 : livreurId dans le payload du token

**Niveau** : L1 | **Type** : Fonctionnel (SC4)

```gherkin
Given connexion via picker avec Marie Lambert (livreur-003)
When decodeJwtPayload() est appelé sur le faux JWT
Then payload.sub = "livreur-003"
And payload.roles = ["LIVREUR"]
```

**Statut** : Passé

---

### TC-047-05 : Accessibilité des boutons livreur

**Niveau** : L1 | **Type** : Non-fonctionnel (SC5)

```gherkin
Given ConnexionScreen en mode dev
When on inspecte les boutons dev
Then chaque bouton a accessibilityRole="button"
And chaque bouton a un accessibilityLabel "Se connecter en tant que [Prénom] [Nom]"
```

**Statut** : Passé
