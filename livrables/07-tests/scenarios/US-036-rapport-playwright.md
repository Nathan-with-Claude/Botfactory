# Rapport de tests — US-036 : Card SSO rétractable après la première connexion

**Agent** : @qa
**Date d'exécution** : 2026-04-05
**US** : US-036 — Card SSO rétractable après la première connexion
**Bounded Context** : BC-06 Identité et Accès (mobile — ConnexionScreen M-01)

---

## Synthèse globale

| Suite | Niveau | Outil | Tests | Résultat |
|-------|--------|-------|-------|----------|
| ConnexionScreen.US036.test.tsx | L1 | Jest (RNTL) | 16/16 | PASS |
| Suite mobile complète (non régression) | L1 | Jest | 280/280 | PASS |
| **TOTAL** | | | **296/296** | **PASS** |

**Note L3** : Non exécuté — couverture L1 complète (16/16 tests sur les 6 CA). L3 Playwright sur Expo Web n'apporte pas de valeur supplémentaire pour un comportement AsyncStorage pur.

**Verdict US-036** : Validée — Les 6 critères d'acceptation sont couverts par 16 tests Jest. Aucune régression US-019 détectée. Suite mobile totale : 280/280.

---

## Résultats détaillés par TC

| TC | Description | Niveau | Résultat | Durée |
|----|-------------|--------|----------|-------|
| TC-036-01 | Première ouverture card visible dépliée | L1 | PASS | 15ms |
| TC-036-02 | hasConnectedOnce=true écrit après auth | L1 | PASS | 12ms |
| TC-036-03 | Ouvertures suivantes card repliée | L1 | PASS | 11ms |
| TC-036-04 | Toggle depuis replié → visible | L1 | PASS | 9ms |
| TC-036-05 | Toggle depuis ouvert → masqué | L1 | PASS | 9ms |
| TC-036-06 | Préférence cardSsoOuverte restorée | L1 | PASS | 13ms |
| TC-036-07 | Non-régression bouton SSO accessible | L1 | PASS | 8ms |

---

## Notes techniques

- `moduleNameMapper` branché dans `package.json` pour mapper `@react-native-async-storage/async-storage` vers le mock existant.
- Le mock `asyncStorageMock.ts` fournit un store en mémoire avec `jest.fn()` trackables. Isolation par `clear()` en `beforeEach`.
- Logique de priorité : préférence explicite (`cardSsoOuverte`) > comportement par défaut (ouvert si première fois, replié sinon).
- `onLoginSuccess` continue d'être appelé exactement une fois quand status==='authenticated' (invariant US-019 préservé).

## Anomalies détectées

Aucune anomalie.

## Recommandations

1. Si `@react-native-async-storage/async-storage` est ajouté en dépendance explicite (bare React Native), mettre à jour le `moduleNameMapper` en conséquence.
2. Tester en conditions réelles (appareil physique) que la préférence survit à un kill de l'application par l'OS.
