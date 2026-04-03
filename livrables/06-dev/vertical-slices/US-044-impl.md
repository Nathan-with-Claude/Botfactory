# Implémentation US-044 : Compteur durée déconnexion WebSocket format adaptatif

## Contexte

Feedback terrain du 2026-04-01 (Laurent Renaud) : le bandeau "Connexion temps réel
indisponible" (livré lors d'un correctif bloquant de session 30/03) affiche l'information
de déconnexion mais sans durée. Le superviseur ne peut pas évaluer l'impact de la
déconnexion (30 s ≠ 5 min).

US-044 ajoute un compteur qui s'incrémente chaque seconde avec un format adaptatif :
- < 60 s : "X s"
- >= 60 s : "X min Y s"
- >= 3600 s : "X h Y min"

Liens :
- Spec : `/livrables/05-backlog/user-stories/US-044-indicateur-duree-deconnexion-websocket.md`
- Wireframe : `/livrables/02-ux/wireframes.md#W-01`
- US liées : US-011 (tableau de bord temps réel), US-032 (synchronisation read model)

## Bounded Context et couche ciblée

- **BC** : BC-03 Supervision (Core Domain)
- **Aggregate(s) modifiés** : aucun (état local navigateur uniquement)
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Interface Layer — Frontend Web (supervision)

**Fichier modifié** : `src/web/supervision/src/pages/TableauDeBordPage.tsx`

1. **Extraction et export de `formaterDureeDeconnexion(ms: number): string`** :
   - Fonction pure, sans dépendance externe.
   - Positionnée en tête du fichier, avant l'import React, pour être facilement importable.
   - Logique :
     ```
     totalSecondes = Math.floor(ms / 1000)
     < 60s    → "X s"
     < 3600s  → "X min Y s"   (Y = totalSecondes % 60)
     >= 3600s → "X h Y min"   (X = totalMinutes / 60, Y = totalMinutes % 60)
     ```

2. **setInterval passé de 60 000 ms à 1 000 ms** :
   - Avant (bloquant 5) : `setInterval(..., 60_000)` → granularité insuffisante pour "X s"
   - Après : `setInterval(..., 1_000)` → mise à jour chaque seconde.
   - Le cleanup `return () => clearInterval(timer)` est maintenu (pas de memory leak au
     démontage).

3. **State `maintenant` réinitialisé à la reconnexion** :
   - Quand `connecte=true` ou `deconnecteDepuisMs=null`, `setMaintenant(Date.now())` est
     appelé et le timer ne démarre pas → compteur remis à zéro.

4. **Affichage dans le bandeau** :
   - Avant : `minutesDeconnecte > 0` (ne s'affichait pas pendant la première minute)
   - Après : `dureeDeconnexionMs !== null` (s'affiche dès la déconnexion, y compris "0 s")
   - Texte : `(Déconnecté depuis {formaterDureeDeconnexion(dureeDeconnexionMs)})`

### Erreurs / invariants préservés

- Le compteur est un état local du composant, jamais persisté ni transmis au backend.
- La réinitialisation est immédiate lors du retour en état LIVE (ws.onopen → setDeconnecteDepuisMs(null)).
- Le bouton "Reconnecter" (bloquant 5 précédent) reste présent et fonctionnel.
- Aucun appel réseau généré par le compteur.

## Tests

### Résultats (2026-04-03)

Tous les tests passent : **11/11** dans `TableauDeBordPage.US044.test.tsx`,
**265/265** dans la suite complète du projet web supervision.

### Bug SC2 — corrigé le 2026-04-03

**Symptôme** : le test SC2 ("compteur affiche '1 min 30 s' après 90 secondes") affichait
"0 s" au lieu de "1 min 30 s".

**Cause racine** (investigation systématique) :

`jest.advanceTimersByTime(90_000)` est **synchrone**. À ce moment, voici l'ordre
d'exécution :

1. `setTimeout(0)` (le `ws.onclose`) s'exécute → met à jour le state React
   (`connecte=false`, `deconnecteDepuisMs=T₀`).
2. **Les `useEffect` React ne flush pas de manière synchrone** — ils sont différés après
   le rendu.
3. Donc pendant tout `advanceTimersByTime(90_000)`, le `setInterval(() => setMaintenant(Date.now()), 1_000)` du composant **n'est pas encore enregistré** dans la file de timers fake.
4. À la fin de `act()`, React flush les effets → le `useEffect` crée le `setInterval` —
   mais le temps fake est déjà à T₀+90s, le setInterval ne s'est jamais déclenché.
5. `maintenant` reste à T₀, `deconnecteDepuisMs` = T₀ → `dureeDeconnexionMs = 0`.

**Fix appliqué** (dans le test SC2 uniquement) :

Ajout d'un `act(async () => { jest.runAllTimers(); })` **avant** `advanceTimersByTime`,
ce qui force React à flusher le rendu et créer le `setInterval` avant d'avancer les 90s.

```tsx
// Étape 1 : déclencher la déconnexion et laisser React flusher les effets
await act(async () => {
  jest.runAllTimers();
});

// Étape 2 : avancer de 90 secondes (le setInterval est maintenant actif)
await act(async () => {
  jest.advanceTimersByTime(90_000);
});
```

**Fichier modifié** : `src/web/supervision/src/__tests__/TableauDeBordPage.US044.test.tsx`
(lignes 136-149)

### Validation de `formaterDureeDeconnexion`

7 tests unitaires purs (FD1→FD7) :

| Entrée | Sortie attendue | Résultat |
|--------|----------------|----------|
| 0 ms | "0 s" | PASS |
| 30 000 ms | "30 s" | PASS |
| 59 000 ms | "59 s" | PASS |
| 60 000 ms | "1 min 0 s" | PASS |
| 90 000 ms | "1 min 30 s" | PASS |
| 3 600 000 ms | "1 h 0 min" | PASS |
| 5 490 000 ms | "1 h 31 min" | PASS |

### Fichier de tests

`src/web/supervision/src/__tests__/TableauDeBordPage.US044.test.tsx`

Contient :
- 7 tests unitaires purs sur `formaterDureeDeconnexion` (FD1→FD7)
- 4 tests d'intégration composant avec fake timers Jest (SC1, SC2, SC3, SC5)

## Commandes de lancement (tests manuels)

```bash
# Vérifier le compilateur TypeScript (pas d'erreur sur nos fichiers)
cd src/web/supervision && npx tsc --noEmit 2>&1 | grep TableauDeBordPage

# Démarrer le serveur supervision pour tests manuels
cd src/backend/svc-supervision && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
# puis : http://localhost:3001 (app web supervision)
```

Pour simuler une déconnexion WebSocket en test manuel : couper le backend et observer le
bandeau qui apparaît avec le compteur en secondes.
