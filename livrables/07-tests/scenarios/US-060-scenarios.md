# Scénarios de tests US-060 : Correction persist() manquant après sync()

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-060 — Corriger l'appel persist() manquant après sync() dans offlineQueue
**Bounded Context** : BC-01 Orchestration de Tournée (mobile — offlineQueue domaine)
**Priorité** : P0 — Bloquant production (double envoi de commandes)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-060-01 | persist() appelé après chaque dequeue réussi pendant sync() | L1 | Passé |
| TC-060-02 | Après sync complète, AsyncStorage est vide | L1 | Passé |
| TC-060-03 | Sync partielle : commandes non envoyées restent dans AsyncStorage | L1 | Passé |
| TC-060-04 | canCloseRoute() false si AsyncStorage non vide (simulation redémarrage) | L1 | Passé |
| TC-060-05 | Pas de double envoi au redémarrage après sync réussie | L1 | Passé |

---

### TC-060-01 : persist() appelé après chaque dequeue réussi

**Niveau** : L1 | **Type** : Invariant domaine (SC1)

```gherkin
Given 3 commandes dans la file offline et AsyncStorage peuplé
When sync() est exécuté et les 3 commandes sont envoyées avec succès
Then storage.setItem est appelé à chaque dequeue réussi (> 1 fois)
And après chaque appel, AsyncStorage ne contient plus la commande défilée
```

**Statut** : Passé

---

### TC-060-02 : Après sync complète, AsyncStorage est vide

**Niveau** : L1 | **Type** : Invariant (SC1+SC2)

```gherkin
Given 3 commandes synchronisées avec succès
When sync() se termine
Then le dernier appel à storage.setItem contient une liste vide "[]"
And AsyncStorage ne contient plus aucune commande
```

**Statut** : Passé

---

### TC-060-03 : Sync partielle conserve les commandes restantes

**Niveau** : L1 | **Type** : Invariant (SC3)

```gherkin
Given 4 commandes : 2 envoyées avec succès, réseau perdu avant les 2 suivantes
When sync() s'interrompt (erreur réseau → break)
Then AsyncStorage contient exactement les 2 commandes non encore envoyées
And les 2 commandes envoyées ne sont plus dans AsyncStorage
```

**Statut** : Passé

---

### TC-060-04 : canCloseRoute() false si AsyncStorage non vide

**Niveau** : L1 | **Type** : Non régression (SC4)

```gherkin
Given sync partielle : 2 commandes restent dans AsyncStorage
When initialize() est appelé (simulation redémarrage)
And canCloseRoute() est évalué
Then retourne false (commandes persistées en attente)
```

**Statut** : Passé

---

### TC-060-05 : Pas de double envoi au redémarrage

**Niveau** : L1 | **Type** : Invariant critique (SC2)

```gherkin
Given 2 commandes synchronisées avec succès par une 1ère instance de la file
When une 2ème instance offlineQueue est créée et initialize() est appelé
Then la 2ème instance charge une file vide depuis AsyncStorage
And executor n'est appelé que 2 fois (0 fois par la 2ème instance)
```

**Statut** : Passé
