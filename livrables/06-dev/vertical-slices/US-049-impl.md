# Implémentation US-049 : Aligner les 6 profils livreurs de développement

## Contexte

Après US-047 (picker dev mobile) et US-048 (DevEventBridge), le projet disposait de 5 livreurs
dans le picker mobile (`livreur-001` à `livreur-005`) mais les seeders backend et les mocks
frontend étaient désalignés. Cette US porte l'extension canonique à 6 livreurs et aligne
tous les points d'entrée.

Livreur canonique ajouté : `livreur-006 / Lucas Petit`.

Specs : `/livrables/05-backlog/user-stories/US-049-6-livreurs-dev-coherents.md`

## Bounded Context et couche ciblée

- **BC** : BC-06 (Identité et Accès) pour le picker mobile / BC-07 (Planification) pour les seeders
- **Aggregate(s) modifiés** : aucun (infra de test uniquement)
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Mobile (`src/mobile/src/constants/devLivreurs.ts`)
- Ajout de `{ id: 'livreur-006', prenom: 'Lucas', nom: 'Petit' }` comme 6ème entrée dans `DEV_LIVREURS`.
- Le tableau passe de 5 à 6 entrées. `ConnexionScreen` itère sur ce tableau sans hard-coder le count — aucune autre modification nécessaire côté ConnexionScreen.

### Backend svc-supervision seeder
- Ajout de **VueTournee** `tournee-sup-005` (Sophie Bernard, Lyon 4e, EN_COURS) et `tournee-sup-006` (Lucas Petit, Lyon 7e, EN_COURS) via `vueTourneeRepository.save()`.
- Ajout de **TourneePlanifiee** `T-205` (livreur-005, AFFECTEE, 4 colis, VH-05) et `T-206` (livreur-006, AFFECTEE, 3 colis, VH-06).
- VueTournees créées manuellement (sans DevEventBridge) car svc-tournee ne crée pas de Tournee pour livreur-005/006 (cas "message vide" conservé pour US-048 SC5).

### Frontend web supervision (`src/web/supervision/src/pages/DetailTourneePlanifieePage.tsx`)
- Alignement de `livreursMock` avec les 6 livreurs canoniques et leurs vrais noms :
  - Pierre Martin (livreur-001) — AFFECTEE T-202
  - Paul Dupont (livreur-002) — LANCEE T-204
  - Marie Lambert (livreur-003) — disponible
  - Jean Moreau (livreur-004) — disponible
  - Sophie Bernard (livreur-005) — AFFECTEE T-205
  - Lucas Petit (livreur-006) — AFFECTEE T-206
- Les noms des livreurs 001-004 étaient des noms fictifs (`P. Morel`, `S. Roger`...) — corrigés pour correspondre aux IDs canoniques.

### Invariants respectés
- livreur-005 et livreur-006 n'ont pas de Tournee dans svc-tournee → affichage du message vide mobile (SC5 US-048 toujours valide).
- `@Profile("dev")` sur les deux seeders — pas de données de test en prod.
- Le 6e DevDataSeeder ne crée pas de Tournee pour livreur-006 conformément à SC3.

## Tests

### Mobile (Jest/React Native)
- **Nouveau** : `src/mobile/src/__tests__/ConnexionScreen.US049.test.tsx` — 6 tests
  - Vérifie que `DEV_LIVREURS` a 6 entrées
  - Vérifie que livreur-006 Lucas Petit est présent
  - Vérifie que les IDs vont de livreur-001 à livreur-006
  - Vérifie que ConnexionScreen affiche 6 boutons `btn-dev-livreur-livreur-00N`
- **Correctif** : `ListeColisScreen.test.tsx` — message "Aucun colis" mis à jour (US-048 avait changé le message sans mettre à jour ce test)

### Web supervision (React Testing Library)
- **Nouveau** (dans `DetailTourneePlanifieePage.test.tsx`) : 2 tests describe `US-049 (6 livreurs dev)`
  - Vérifie 7 options dans le select (6 livreurs + option vide)
  - Vérifie les IDs canoniques livreur-001..006
  - Vérifie les noms dans les options du select

### Backend svc-supervision
- Aucun test spécifique — les seeders sont testés indirectement par les tests d'intégration existants.

## Suite complète après cette US

- Mobile : 371/371 verts
- Web supervision : 272/272 verts
- Backend svc-supervision : 152/152 verts
