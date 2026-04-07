# Scénarios de tests US-056 : Persistance de la file offline via AsyncStorage

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-056 — Persister la file offline entre sessions via AsyncStorage
**Bounded Context** : BC-01 Orchestration de Tournée (mobile — offlineQueue)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-056-01 | enqueue() persiste immédiatement via void persist() | L1 | Passé |
| TC-056-02 | initialize() charge les commandes depuis AsyncStorage | L1 | Passé |
| TC-056-03 | initialize() est idempotent (pas de doublon) | L1 | Passé |
| TC-056-04 | initialize() avec AsyncStorage vide ne plante pas | L1 | Passé |
| TC-056-05 | initialize() résiste à un JSON corrompu | L1 | Passé |
| TC-056-06 | canCloseRoute() retourne false après rechargement | L1 | Passé |
| TC-056-07 | Ordre FIFO préservé après rechargement depuis AsyncStorage | L1 | Passé |

---

### TC-056-01 : enqueue() persiste immédiatement

**Niveau** : L1 | **Type** : Invariant domaine

```gherkin
Given offlineQueue est initialisé avec un storage mock
When enqueue(commande-001) est appelé
Then storage.setItem est appelé avec la clé 'docupost_offline_queue'
And le contenu sérialisé contient commande-001
```

**Statut** : Passé

---

### TC-056-02 : initialize() charge depuis AsyncStorage

**Niveau** : L1 | **Type** : Fonctionnel (SC1)

```gherkin
Given AsyncStorage contient 2 commandes sérialisées (uuid-001, uuid-002)
When initialize() est appelé
Then la file mémoire contient exactement 2 commandes
And l'ordre original est préservé
```

**Statut** : Passé

---

### TC-056-03 : initialize() idempotent

**Niveau** : L1 | **Type** : Invariant (SC3)

```gherkin
Given initialize() a déjà été appelé et chargé 2 commandes
When initialize() est appelé une 2ème fois
Then la file contient toujours exactement 2 commandes (pas de doublon)
```

**Statut** : Passé

---

### TC-056-04 : initialize() avec AsyncStorage vide

**Niveau** : L1 | **Type** : Edge case

```gherkin
Given AsyncStorage est vide (getItem retourne null)
When initialize() est appelé
Then aucune exception n'est levée
And la file reste vide
```

**Statut** : Passé

---

### TC-056-05 : initialize() résiste à JSON corrompu

**Niveau** : L1 | **Type** : Edge case (résilience)

```gherkin
Given AsyncStorage contient "{invalid json" pour la clé offline_queue
When initialize() est appelé
Then aucune exception n'est propagée
And la file reste vide (fail-safe)
```

**Statut** : Passé

---

### TC-056-06 : canCloseRoute() false après initialize() avec commandes

**Niveau** : L1 | **Type** : Non régression

```gherkin
Given 2 commandes chargées depuis AsyncStorage via initialize()
When canCloseRoute() est appelé
Then retourne false (file non vide)
```

**Statut** : Passé

---

### TC-056-07 : Ordre FIFO préservé après rechargement

**Niveau** : L1 | **Type** : Invariant (SC1)

```gherkin
Given AsyncStorage contient cmd-1 (enfilée en premier) et cmd-2
When initialize() est appelé et dequeue() est appelé 2 fois
Then cmd-1 est défilée en premier (FIFO respecté)
```

**Statut** : Passé
