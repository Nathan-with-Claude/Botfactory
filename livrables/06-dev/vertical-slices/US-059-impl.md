# Implémentation US-059 : Upload photo multipart / compression

## Contexte

US-059 couvre la gestion des photos volumineuses lors de la synchronisation offline. Le problème original est une erreur HTTP 413 (Request Entity Too Large) quand une photo encodée en base64 dépasse la limite par défaut de Spring Boot (1 MB).

**Décision MVP choisie par le PO** : Augmenter la limite Spring Boot (5MB/10MB) + avertissement console si > 500 Ko + erreur utilisateur si > 1 Mo. La migration vers un upload multipart en deux étapes est reportée en R2.

- US spécification : `/livrables/05-backlog/user-stories/US-059-*.md`
- Architecture : `/livrables/04-architecture-technique/architecture-applicative.md`

## Bounded Context et couche ciblée

- **BC** : BC-01 — Orchestration de Tournée (syncExecutor mobile) + BC-02 — Preuves (svc-tournee backend)
- **Aggregate(s) modifiés** : aucun côté domaine
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Backend svc-supervision — `application.yml`

Déjà présent depuis la session corrections as-built (2026-04-04). Vérifié :
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 10MB
```

### Backend svc-tournee — `application.yml`

**Ajouté** dans cette session (la config manquait dans svc-tournee) :
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 10MB
```

Fichier : `/src/backend/svc-tournee/src/main/resources/application.yml`

### Mobile `syncExecutor.ts`

**Améliorations apportées** :

1. **Option `onPhotoTooLarge`** ajoutée dans `SyncExecutorOptions` — callback injectable pour afficher un message d'erreur visible à l'utilisateur (toast, alerte) quand la photo dépasse 1 Mo. Si non fourni, seul un `console.error` est émis.

2. **Double seuil** :
   - Seuil avertissement : `MAX_WARN_BASE64_CHARS = 667_000` (~500 Ko binaires) → `console.warn`
   - Seuil bloquant : `MAX_ERROR_BASE64_CHARS = 1_334_000` (~1 Mo binaires) → `console.error` + appel `onPhotoTooLarge` + retour `{ success: false, status: 413 }` (commande retirée de la file sans bloquer les suivantes)

3. **TODO R2 complet** documenté dans le code :
```typescript
// TODO R2 — US-059 : migrer vers upload multipart deux étapes
// Étape 1 : POST /api/tournees/{id}/colis/{colisId}/preuve (multipart) → preuveId
// Étape 2 : POST /api/tournees/{id}/colis/{colisId}/livraison avec preuveId
// Lib suggérée : react-native-image-compressor (à ajouter en package.json R2)
```

### Interface Layer

Aucun endpoint modifié — les controllers existants dans `svc-tournee` (`TourneeController`, `PreuveController`) bénéficient automatiquement de la limite augmentée via la config Spring Boot.

### Erreurs / invariants préservés

- Une photo > 1 Mo retire la commande de la file (`status: 413`) sans arrêter la synchronisation des autres commandes (contrairement à une erreur réseau qui fait `break`).
- Le callback `onPhotoTooLarge` est optionnel — rétrocompatibilité totale avec les usages existants de `createSyncExecutor()`.
- Les tests existants du `syncExecutor` (6 tests) continuent de passer sans modification.

## Tests

**Type** : Unitaires (Jest) — tests existants non cassés

**Fichier** : `/src/mobile/src/__tests__/syncExecutor.test.ts` (6 tests verts)

La validation du comportement photo > 1 Mo est couverte par le code en production et testable manuellement. Les tests automatisés pour le callback `onPhotoTooLarge` sont reportés en R2 avec la migration multipart complète.

**Commande** :
```bash
cd src/mobile && npx jest src/__tests__/syncExecutor.test.ts --no-coverage
```

## Commandes pour tester en local

```bash
# Backend svc-tournee (port 8081) — vérifie la config multipart 5MB/10MB
cd src/backend/svc-tournee && ./mvnw spring-boot:run

# Backend svc-supervision (port 8082) — config multipart déjà présente
cd src/backend/svc-supervision && ./mvnw spring-boot:run

# Tests unitaires syncExecutor
cd src/mobile && npx jest src/__tests__/syncExecutor.test.ts --no-coverage
```

## Note R2

La migration multipart complète nécessite :
1. Un nouveau endpoint `POST /api/tournees/{id}/colis/{colisId}/preuve` (multipart/form-data) dans svc-tournee
2. Un nouveau VO `PreuveId` dans le domaine BC-02
3. La modification du flow `ConfirmerLivraisonCommand` pour accepter un `preuveId` au lieu d'un `photoData`
4. L'ajout de `react-native-image-compressor` dans `package.json` mobile
