# Scénarios de tests US-044 — Compteur durée déconnexion WebSocket format adaptatif

**Agent** : @qa
**Date de création** : 2026-04-03
**Dernière exécution** : 2026-04-03

---

## Historique de statut

| Version | Date | Résultat | Note |
|---|---|---|---|
| v1.0 | 2026-04-02 | 10/11 (SC2 échec) | SC2 bug d'ordre d'exécution Jest fake timers |
| v2.0 | 2026-04-03 | 11/11 PASS | Correction SC2 appliquée par @developpeur |

---

## Synthèse d'exécution (v2.0)

| Suite | Niveau | Outil | Tests | Résultat |
|---|---|---|---|---|
| TableauDeBordPage.US044.test.tsx | L1 | Jest (React + fake timers) | 11/11 | PASS |
| **TOTAL** | | | **11/11** | **PASS** |

**Verdict US-044** : Validée — 11/11 tests verts après correction du bug SC2 (ordre d'exécution Jest fake timers).

---

### TC-044-FD1 : formaterDureeDeconnexion — 0 ms affiche "0 s"

**US liée** : US-044
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Invariant domaine
**Préconditions** : Fonction `formaterDureeDeconnexion` exportée
**Étapes** : Appeler avec `0`
**Résultat attendu** : `"0 s"`
**Statut** : Passé

```gherkin
Given une durée de déconnexion de 0 ms
When formaterDureeDeconnexion est appelée
Then le résultat est "0 s"
```

---

### TC-044-FD2 : 30 000 ms affiche "30 s"

**US liée** : US-044
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Type** : Fonctionnel
**Préconditions** : aucune
**Étapes** : Appeler avec `30_000`
**Résultat attendu** : `"30 s"`
**Statut** : Passé

---

### TC-044-FD3 : 59 000 ms affiche "59 s"

**US liée** : US-044
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Type** : Edge case
**Préconditions** : aucune
**Étapes** : Appeler avec `59_000`
**Résultat attendu** : `"59 s"`
**Statut** : Passé

---

### TC-044-FD4 : 60 000 ms affiche "1 min 0 s"

**US liée** : US-044
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Type** : Edge case (seuil 60 s)
**Préconditions** : aucune
**Étapes** : Appeler avec `60_000`
**Résultat attendu** : `"1 min 0 s"`
**Statut** : Passé

---

### TC-044-FD5 : 90 000 ms affiche "1 min 30 s"

**US liée** : US-044
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Type** : Fonctionnel
**Préconditions** : aucune
**Étapes** : Appeler avec `90_000`
**Résultat attendu** : `"1 min 30 s"`
**Statut** : Passé

---

### TC-044-FD6 : 3 600 000 ms affiche "1 h 0 min"

**US liée** : US-044
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Type** : Edge case (seuil 1 h)
**Préconditions** : aucune
**Étapes** : Appeler avec `3_600_000`
**Résultat attendu** : `"1 h 0 min"`
**Statut** : Passé

---

### TC-044-FD7 : 5 490 000 ms affiche "1 h 31 min"

**US liée** : US-044
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Type** : Fonctionnel
**Préconditions** : aucune
**Étapes** : Appeler avec `5_490_000`
**Résultat attendu** : `"1 h 31 min"`
**Statut** : Passé

---

### TC-044-SC1 : Bandeau et compteur "0 s" visibles dès la déconnexion

**US liée** : US-044
**Niveau** : L1
**Couche testée** : UI / Application (composant avec fake timers)
**Aggregate / Domain Event ciblé** : aucun (état local composant)
**Type** : Fonctionnel
**Préconditions** : WebSocket se déconnecte (`ws.onclose`)
**Étapes** :
1. Monter `TableauDeBordPage` avec fake timers Jest
2. Simuler `ws.onclose`
3. Vérifier l'apparition du bandeau de déconnexion avec compteur "0 s"
**Résultat attendu** : Bandeau visible avec texte "(Déconnecté depuis 0 s)"
**Statut** : Passé

```gherkin
Given le superviseur consulte le tableau de bord en temps réel
When la connexion WebSocket est perdue
Then le bandeau "Connexion temps réel indisponible" apparaît avec "(Déconnecté depuis 0 s)"
```

---

### TC-044-SC2 : Compteur affiche "1 min 30 s" après 90 secondes de déconnexion

**US liée** : US-044
**Niveau** : L1
**Couche testée** : UI / Application (composant avec fake timers)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Fonctionnel
**Préconditions** : WS déconnecté, fake timers actifs
**Étapes** :
1. Simuler `ws.onclose`
2. Exécuter `jest.runAllTimers()` pour flusher les effets React
3. Avancer de `90_000 ms` via `jest.advanceTimersByTime`
4. Vérifier le texte du compteur
**Résultat attendu** : "(Déconnecté depuis 1 min 30 s)"
**Statut** : Passé (corrigé v2.0 — ajout runAllTimers avant advanceTimersByTime)

```gherkin
Given le WebSocket est déconnecté depuis 90 secondes
When le superviseur observe le bandeau
Then le compteur affiche "(Déconnecté depuis 1 min 30 s)"
```

---

### TC-044-SC3 : Aucun compteur visible en état LIVE (WS connecté)

**US liée** : US-044
**Niveau** : L1
**Couche testée** : UI / Application
**Aggregate / Domain Event ciblé** : aucun
**Type** : Invariant domaine
**Préconditions** : WebSocket connecté (`connecte = true`)
**Étapes** :
1. Monter le composant avec WS connecté
2. Vérifier l'absence du bandeau de déconnexion
**Résultat attendu** : Aucun bandeau, aucun compteur visible
**Statut** : Passé

```gherkin
Given la connexion WebSocket est active
When le superviseur consulte le tableau de bord
Then aucun bandeau de déconnexion ni compteur n'est affiché
```

---

### TC-044-SC5 : Compteur s'incrémente chaque seconde (setInterval 1000ms)

**US liée** : US-044
**Niveau** : L1
**Couche testée** : UI / Application (composant avec fake timers)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Fonctionnel
**Préconditions** : WS déconnecté, fake timers actifs
**Étapes** :
1. Simuler déconnexion
2. Avancer de 1s, vérifier "1 s"
3. Avancer de 1s supplémentaire, vérifier "2 s"
**Résultat attendu** : Compteur s'incrémente d'une seconde à chaque `setInterval` (1000ms)
**Statut** : Passé

```gherkin
Given le WebSocket est déconnecté
When une seconde s'écoule
Then le compteur affiche une seconde de plus
```
