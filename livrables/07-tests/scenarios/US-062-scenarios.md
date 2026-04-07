# Scénarios de tests US-062 : Compteur d'envois en attente dans IndicateurSync

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-062 — Afficher le compteur d'envois en attente dans IndicateurSync
**Bounded Context** : BC-01 Orchestration de Tournée (mobile — IndicateurSync design system)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-062-01 | LIVE sans pendingCount → pas de compteur | L1 | Passé |
| TC-062-02 | LIVE avec pendingCount=0 → pas de compteur | L1 | Passé |
| TC-062-03 | OFFLINE pendingCount > 0 → affiche "N envois en attente" | L1 | Passé |
| TC-062-04 | OFFLINE pendingCount = 1 → singulier "1 envoi en attente" | L1 | Passé |
| TC-062-05 | OFFLINE sans pendingCount → pas de compteur | L1 | Passé |
| TC-062-06 | OFFLINE pendingCount = 0 → pas de compteur | L1 | Passé |
| TC-062-07 | testID sync-pending-count présent si > 0 | L1 | Passé |

---

### TC-062-01 : LIVE sans pendingCount → pas de compteur

**Niveau** : L1 | **Type** : Fonctionnel (SC5)

```gherkin
Given IndicateurSync avec syncStatus="live" et pendingCount absent
When le composant est affiché
Then le badge affiche "LIVE"
And aucun compteur n'est affiché
```

**Statut** : Passé

---

### TC-062-02 : LIVE avec pendingCount=0 → pas de compteur

**Niveau** : L1 | **Type** : Fonctionnel (SC5)

```gherkin
Given IndicateurSync avec syncStatus="live" et pendingCount=0
When le composant est affiché
Then le badge affiche "LIVE"
And sync-pending-count est absent du DOM
```

**Statut** : Passé

---

### TC-062-03 : OFFLINE pendingCount > 0 → affiche le compteur

**Niveau** : L1 | **Type** : Fonctionnel (SC1)

```gherkin
Given IndicateurSync avec syncStatus="offline" et pendingCount=8
When le composant est affiché
Then le badge affiche "OFFLINE" avec un élément indiquant "8"
And le libellé utilise "en attente" (pas "synchronisation")
And sync-pending-count est présent
```

**Statut** : Passé

---

### TC-062-04 : OFFLINE pendingCount=1 → singulier

**Niveau** : L1 | **Type** : Fonctionnel (terminologie terrain)

```gherkin
Given IndicateurSync avec syncStatus="offline" et pendingCount=1
When le composant est affiché
Then le libellé affiche "1 envoi en attente" (singulier, pas "envois")
```

**Statut** : Passé

---

### TC-062-05 : OFFLINE sans pendingCount → pas de compteur

**Niveau** : L1 | **Type** : Edge case (SC2)

```gherkin
Given IndicateurSync avec syncStatus="offline" et pendingCount absent
When le composant est affiché
Then le badge affiche "OFFLINE" sans compteur
```

**Statut** : Passé

---

### TC-062-06 : OFFLINE pendingCount=0 → pas de compteur

**Niveau** : L1 | **Type** : Edge case (SC2)

```gherkin
Given IndicateurSync avec syncStatus="offline" et pendingCount=0
When le composant est affiché
Then le badge affiche "OFFLINE" sans compteur
And sync-pending-count est absent
```

**Statut** : Passé

---

### TC-062-07 : testID sync-pending-count présent si > 0

**Niveau** : L1 | **Type** : Invariant UI

```gherkin
Given IndicateurSync avec syncStatus="offline" et pendingCount=5
When le composant est affiché
Then getByTestId('sync-pending-count') ne lève pas d'erreur
And l'élément contient le chiffre 5
```

**Statut** : Passé
