# Journal de bord — @qa — DocuPost

> **RÈGLE** : Lire ce fichier EN DÉBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier donne le contexte de test synthétisé et suit l'avancement des scénarios.

---

## Contexte synthétisé

- **Livrables propriété** : `07-tests/`
  - plan-tests.md (créé et mis à jour — v1.1 avec US-001)
  - scenarios/ (alimenté : US-001-scenarios.md créé)
  - jeux-de-donnees.md (créé — JDD-001 à JDD-006)
- **NFR clés à tester** : statut < 45 sec, sync OMS < 30 sec, alerte risque < 15 min, preuve < 5 min, disponibilité > 99,5 %
- **Stratégie** : TDD (tests unitaires + intégration par US), E2E Playwright (post-MVP ou si MCP disponible)

---

## Suivi des scénarios de test par US

| US | Titre court | Scénarios créés | Jeux de données | Statut |
|----|-------------|-----------------|-----------------|--------|
| US-021 | Visualiser plan du jour | Non | Non | À faire |
| US-022 | Vérifier composition | Non | Non | À faire |
| US-023 | Affecter livreur + véhicule | Non | Non | À faire |
| US-024 | Lancer tournée | Non | Non | À faire |
| US-001 | Consulter liste colis | Oui (25 TCs) | Oui (JDD-001 à JDD-006) | Scénarios rédigés + Jeux de données prêts |
| US-002 | Suivre progression | Non | Non | À faire |
| US-003 | Filtrer par zone | Non | Non | À faire |
| US-004 | Détail colis | Non | Non | À faire |
| US-005 | Déclarer échec | Non | Non | À faire |
| US-006 | Mode offline | Non | Non | À faire |
| US-007 | Clôturer tournée | Non | Non | À faire |
| US-008 | Capturer signature | Non | Non | À faire |
| US-009 | Capturer photo/tiers | Non | Non | À faire |
| US-010 | Consulter preuve | Non | Non | À faire |
| US-011 | Tableau de bord | Non | Non | À faire |
| US-012 | Détail tournée superviseur | Non | Non | À faire |
| US-013 | Alerte tournée à risque | Non | Non | À faire |
| US-014 | Envoyer instruction | Non | Non | À faire |
| US-015 | Suivre instruction | Non | Non | À faire |
| US-016 | Notification push | Non | Non | À faire |
| US-017 | Sync OMS | Non | Non | À faire |
| US-018 | Historisation immuable | Non | Non | À faire |
| US-019 | Authentification SSO mobile | Non | Non | À faire |
| US-020 | Authentification SSO web | Non | Non | À faire |

**Légende statuts** : `À faire` | `Scénarios rédigés` | `Jeux de données prêts` | `Exécutés` | `Validés`

---

## Interventions réalisées

| Date | US | Action | Fichier |
|------|----|--------|---------|
| 2026-03-19 | — | Création plan-tests.md initial | /livrables/07-tests/plan-tests.md |
| 2026-03-20 | US-001 | Rédaction 25 scénarios de test (TC-001 à TC-025) | /livrables/07-tests/scenarios/US-001-scenarios.md |
| 2026-03-20 | US-001 | Création jeux de données JDD-001 à JDD-006 | /livrables/07-tests/jeux-de-donnees.md |
| 2026-03-20 | US-001 | Mise à jour plan-tests.md v1.1 (section US-001) | /livrables/07-tests/plan-tests.md |

---

## Points d'attention

- Chaque scénario QA doit valider les **critères d'acceptation GIVEN/WHEN/THEN** de l'US.
- Les **invariants DDD** (domain-model.md) sont des cas de test obligatoires (ex. : tenter de lancer une tournée sans affectation → doit échouer).
- Le **mode offline** (US-006) nécessite des scénarios spécifiques : actions hors connexion, reconnexion, ordre de synchronisation.
- Les **NFR de performance** doivent être couvertes par au moins 1 test de charge par endpoint critique.
- Si MCP Playwright disponible, les scénarios web (W-01 à W-05) peuvent être automatisés en E2E.

### Points d'attention spécifiques US-001

- `estimationFin` == null est le comportement attendu dans US-001 (sera implémenté en US-002).
- `TourneeChargee` est défini mais non publié vers BC-03 (TC-023 vérifie uniquement l'existence de la classe).
- `MockJwtAuthFilter` : TC-012 et TC-025 doivent être rejoués avec OAuth2 réel quand US-019 est implémentée.
- TC-024 (perf) et TC-025 (sécurité isolation) nécessitent un outillage supplémentaire non encore mis en place.
