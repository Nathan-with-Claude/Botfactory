# Implémentation US-058 : CORS + sécurité endpoint interne

## Contexte

Deux problèmes de sécurité à corriger dans `svc-supervision` :
1. CORS hardcodé avec `allowedOriginPatterns("*")` — non externalisé pour la prod
2. Endpoint `/api/supervision/internal/**` ouvert sans authentification en prod

## Bounded Context et couche ciblée

- **BC** : BC-03 Supervision
- **Aggregate(s) modifiés** : aucun (infrastructure / sécurité)
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Interface Layer — SecurityConfig

**Fichier** : `src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/security/SecurityConfig.java`

CORS externalisé via `@Value("${app.cors.allowed-origins:*}")` :
```java
List<String> origins = Arrays.asList(allowedOriginsConfig.split(","));
config.setAllowedOriginPatterns(origins);
config.setAllowCredentials(!"*".equals(allowedOriginsConfig));
```

- En dev : `allowedOriginsConfig = "*"` → wildcard, credentials désactivés
- En prod : `allowedOriginsConfig = ${ALLOWED_ORIGINS:https://supervision.docupost.fr}`
  → origines explicites, credentials activés

### Interface Layer — InternalSecretFilter

**Fichier** : `src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/security/InternalSecretFilter.java`

Filtre `OncePerRequestFilter` appliqué sur `/api/supervision/internal/**` :

| Condition | Comportement |
|---|---|
| Secret = `"dev-secret-ignored"` | Bypass (profil dev) |
| Secret = `""` ou `null` | Bypass (INTERNAL_SECRET non configuré) |
| Secret configuré + header correct | 200 — accès accordé |
| Secret configuré + header absent | 403 + JSON `{"error":"Accès refusé..."}` |
| Secret configuré + header incorrect | 403 + JSON `{"error":"Accès refusé..."}` |
| Path hors `/api/supervision/internal/**` | Transparent (aucun contrôle) |

Correction apportée lors de cette session : ajout du bypass pour secret vide (`isBlank()`)
conformément à la spec "Si la propriété est vide (profil dev) → bypass".

### Infrastructure Layer — application.yml

**Fichier** : `src/backend/svc-supervision/src/main/resources/application.yml`

```yaml
# Profil dev
app:
  cors:
    allowed-origins: "*"
  internal:
    secret: dev-secret-ignored

# Profil prod
app:
  cors:
    allowed-origins: ${ALLOWED_ORIGINS:https://supervision.docupost.fr}
  internal:
    secret: ${INTERNAL_SECRET}
```

### Invariants préservés

- Profil dev inchangé : CORS `*`, endpoint interne ouvert
- `DevEventBridge` inchangé
- Tests existants non cassés (les tests MockMvc n'appellent pas l'endpoint interne)
- Aucune modification du write model ni du domain

## Tests

### Tests unitaires créés

**Fichier** : `src/backend/svc-supervision/src/test/java/com/docapost/supervision/interfaces/security/InternalSecretFilterTest.java`

| Scénario | Description |
|---|---|
| SC1 | Requête hors `/api/supervision/internal/**` : filtre transparent |
| SC2 | Secret DEV → bypass endpoint interne (toujours accepté) |
| SC3 | Secret vide → bypass (INTERNAL_SECRET non configuré) |
| SC4 | Prod + header correct → 200 |
| SC5 | Prod + header absent → 403 |
| SC6 | Prod + header incorrect → 403 |
| SC7 | Corps JSON de l'erreur 403 vérifié |

### Résultat

165/165 tests verts (dont 7 nouveaux pour InternalSecretFilter).

## Commandes de démarrage

```bash
# Dev (bypass automatique)
cd src/backend/svc-supervision
mvn spring-boot:run

# Prod (avec secret)
INTERNAL_SECRET=mon-secret-prod ALLOWED_ORIGINS=https://supervision.docupost.fr \
  mvn spring-boot:run -Dspring.profiles.active=prod
```

Test manuel endpoint interne (dev) :
```bash
curl -X POST http://localhost:8082/api/supervision/internal/vue-tournee/events \
  -H "Content-Type: application/json" \
  -d '{"eventId":"test-001","eventType":"COLIS_LIVRE","tourneeId":"T-001","livreurId":"l-001","colisId":"C-001","horodatage":"2026-04-04T00:00:00Z"}'
# Réponse attendue : 204 No Content
```

Test endpoint interne avec secret (prod) :
```bash
curl -X POST http://localhost:8082/api/supervision/internal/vue-tournee/events \
  -H "X-Internal-Secret: mon-secret-prod" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Sans header → 403
```
