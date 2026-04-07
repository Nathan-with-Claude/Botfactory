# Implémentation US-048 : Synchronisation données tournée supervision ↔ app mobile livreur

## Contexte

**Problème corrigé** : les seeders de développement des deux services backend étaient indépendants et déconnectés, ce qui provoquait une incohérence lors des tests en local :

- `svc-supervision/DevDataSeeder` créait T-204 (LANCÉE, livreur-002, **22 colis**) directement en base sans passer par le `DevEventBridge`.
- `svc-tournee/DevDataSeeder` créait `tournee-dev-002` pour livreur-002 avec **4 colis** et un ID différent.
- Résultat : l'app mobile (Paul Dupont) affichait 4 colis au lieu de 22.

**Cause racine** : le `DevEventBridge` (svc-supervision) — qui propage `TourneeLancee` vers svc-tournee via HTTP — existait déjà mais n'était jamais appelé lors du seeding.

Liens :
- `/livrables/05-backlog/user-stories/US-048-*.md` (si créée)
- Implémentation `DevEventBridge` : US-033

## Bounded Context et couche ciblée

- **BC** : BC-07 Planification (svc-supervision, seeder) + BC-01 Tournée (svc-tournee, seeder) + BC-06 SSO Mobile (devLivreurs)
- **Aggregate(s) modifiés** : aucun (modification de l'Infrastructure Layer uniquement)
- **Domain Events impliqués** : `TourneeLancee` (BC-07 → BC-01 via DevEventBridge, déjà existant)

## Décisions d'implémentation

### Infrastructure Layer — svc-supervision DevDataSeeder

**Fichier** : `src/backend/svc-supervision/src/main/java/com/docapost/supervision/infrastructure/seeder/DevDataSeeder.java`

- `DevEventBridge` injecté via constructeur (nouveau paramètre en dernière position).
- Import ajouté : `TourneeLancee` (domain event BC-07) et `DevEventBridge`.
- La création directe de la `VueTournee` pour T-204 est remplacée par un appel à `devEventBridge.propaguerTourneeLancee(eventT204)`.
- L'event construit porte : `tourneePlanifieeId="tp-204"`, `codeTms="T-204"`, `livreurId="livreur-002"`, `livreurNom="Paul Dupont"`, `superviseurId="seeder-dev"`, `nbColis=22`.
- Idempotence : si la VueTournee T-204 existe déjà en BC-03, le bridge log INFO et skip (comportement `DevEventBridge.propaguerVersBC03`).
- Résilience : si svc-tournee est éteint lors du démarrage de svc-supervision, `propaguerVersBC01` log WARN sans propager l'exception. Le seed ne bloque pas.

### Infrastructure Layer — svc-tournee DevDataSeeder

**Fichier** : `src/backend/svc-tournee/src/main/java/com/docapost/tournee/infrastructure/seeder/DevDataSeeder.java`

- Méthode `seedLivreur002` réécrite pour créer la tournée avec l'ID exact `"T-204"` (au lieu de `"tournee-dev-002"`).
- 22 colis créés avec les IDs `T-204-C-001` à `T-204-C-022` (pattern conforme aux VueColis créés par `DevEventBridge.propaguerVersBC03`).
- Zone : `"Lyon 2e"` — cohérent avec la TourneePlanifiee tp-204.
- 20 colis `A_LIVRER`, 1 colis `LIVRE` (T-204-C-022), contraintes variées (HORAIRE, FRAGILE, DOCUMENT_SENSIBLE).
- Idempotence conservée : si une tournée existe déjà pour livreur-002 à la date du jour, le seeder skip.

**Note de séquencement** : en conditions normales, svc-supervision démarre et appelle svc-tournee via `DevEventBridge.propaguerVersBC01`. Si svc-tournee démarre après svc-supervision, son propre `DevDataSeeder.seedLivreur002` détecte que la tournée `T-204` est déjà créée (via `findByLivreurIdAndDate`) et skip proprement (idempotence).

Si l'ordre de démarrage est inversé (svc-tournee démarre en premier), `seedLivreur002` crée T-204 avec 22 colis. Quand svc-supervision démarre ensuite, `DevEventBridge.propaguerVersBC01` appelle `DevTourneeController.creerTourneeDevTms` qui détecte l'ID existant et retourne 200 OK (idempotence au niveau du controller).

### Interface Layer — Mobile (React Native)

**Fichier** : `src/mobile/src/screens/ListeColisScreen.tsx`

- Message "état vide" (`etat.type === 'vide'`) modifié :
  - Avant : `"Aucun colis assigne pour aujourd'hui.\nContactez votre superviseur."`
  - Après : `"Aucune tournée n'a encore été commandée pour vous.\nVeuillez vous rapprocher de votre superviseur."`
- Formulation plus précise : distingue l'absence de tournée planifiée de l'absence de colis sur une tournée existante. Aligné avec le vocabulaire métier DocuPost.

**Fichier** : `src/mobile/src/constants/devLivreurs.ts`

- Ajout de `{ id: 'livreur-005', prenom: 'Sophie', nom: 'Bernard' }`.
- `livreur-005` n'a pas de tournée seeded → permet de tester le message "Aucune tournée n'a encore été commandée pour vous" en sélectionnant Sophie Bernard dans le picker dev.

### Erreurs / invariants préservés

- Aucun Domain Object n'est modifié. Toutes les modifications sont dans l'Infrastructure Layer (seeders) et l'Interface Layer (mobile).
- L'invariant "une seule tournée par livreur par jour" est préservé : le check `findByLivreurIdAndDate` n'est pas modifié.
- L'idempotence du `DevEventBridge` n'est pas modifiée.
- La résilience HTTP de `propaguerVersBC01` n'est pas modifiée.

## Tests

Les modifications portant sur des seeders de données de développement (non testés unitairement par convention), les tests d'intégration existants ne sont pas impactés.

**Vérification manuelle recommandée** :

1. Démarrer svc-supervision (port 8082) + svc-tournee (port 8081) en profil `dev`.
2. Vérifier les logs de démarrage de svc-supervision : chercher `[DevEventBridge] propagation TourneeLancee tourneeId=T-204`.
3. Appeler `GET http://localhost:8081/api/tournees?livreurId=livreur-002` — doit retourner T-204 avec 22 colis.
4. Dans l'app mobile, connexion en tant que Paul Dupont (livreur-002) — doit afficher 22 colis.
5. Dans l'app mobile, connexion en tant que Sophie Bernard (livreur-005) — doit afficher le message "Aucune tournée n'a encore été commandée pour vous."

**Aucun test unitaire new** : les seeders sont des composants d'infrastructure de développement, non couverts par la stratégie de test unitaire du projet (pattern établi pour tous les seeders existants).

## Commandes pour tester

```bash
# Démarrer svc-tournee
cd /home/admin/Botfactory/src/backend/svc-tournee
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Démarrer svc-supervision
cd /home/admin/Botfactory/src/backend/svc-supervision
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Vérifier que T-204 a 22 colis dans svc-tournee
curl http://localhost:8081/api/tournees?livreurId=livreur-002
```
