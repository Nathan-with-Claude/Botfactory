# Scénarios de tests US-058 : CORS + sécurité endpoint interne

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-058 — Restreindre CORS et sécuriser l'endpoint interne en production
**Bounded Context** : BC-03 Supervision (svc-supervision, port 8082)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-058-01 | Filtre transparent sur path hors /internal/** | L1 | Passé |
| TC-058-02 | Secret DEV → bypass endpoint interne | L1 | Passé |
| TC-058-03 | Secret vide → bypass (INTERNAL_SECRET non configuré) | L1 | Passé |
| TC-058-04 | Prod + header correct → 200 | L1 | Passé |
| TC-058-05 | Prod + header absent → 403 | L1 | Passé |
| TC-058-06 | Prod + header incorrect → 403 | L1 | Passé |
| TC-058-07 | Corps JSON de l'erreur 403 vérifié | L1 | Passé |
| TC-058-08 | CORS * préservé en dev | L2 | Passé |

---

### TC-058-01 : Filtre transparent hors /internal/**

**Niveau** : L1 | **Type** : Fonctionnel (SC5)

```gherkin
Given InternalSecretFilter est configuré
When une requête arrive sur /api/supervision/tableau-de-bord
Then le filtre laisse passer sans contrôle
And la chaîne de filtres Spring continue normalement
```

**Statut** : Passé

---

### TC-058-02 : Secret DEV → bypass

**Niveau** : L1 | **Type** : Fonctionnel (SC5)

```gherkin
Given secret = "dev-secret-ignored"
When une requête arrive sur /api/supervision/internal/...
Then la requête est acceptée sans vérification du header X-Internal-Secret
```

**Statut** : Passé

---

### TC-058-03 : Secret vide → bypass

**Niveau** : L1 | **Type** : Edge case

```gherkin
Given INTERNAL_SECRET est vide ou non configuré
When une requête arrive sur /api/supervision/internal/...
Then la requête est acceptée (bypass — INTERNAL_SECRET non configuré)
```

**Statut** : Passé

---

### TC-058-04 : Prod + header correct → 200

**Niveau** : L1 | **Type** : Fonctionnel (SC3)

```gherkin
Given secret = "mon-secret-prod"
When une requête arrive avec X-Internal-Secret: mon-secret-prod
Then la requête est acceptée (200)
```

**Statut** : Passé

---

### TC-058-05 : Prod + header absent → 403

**Niveau** : L1 | **Type** : Sécurité (SC4)

```gherkin
Given secret = "mon-secret-prod"
When une requête arrive sans header X-Internal-Secret
Then la réponse est 403
And le corps JSON contient {"error":"Accès refusé..."}
```

**Statut** : Passé

---

### TC-058-06 : Prod + header incorrect → 403

**Niveau** : L1 | **Type** : Sécurité (SC4)

```gherkin
Given secret = "mon-secret-prod"
When une requête arrive avec X-Internal-Secret: mauvais-secret
Then la réponse est 403
```

**Statut** : Passé

---

### TC-058-07 : Corps JSON de l'erreur 403

**Niveau** : L1 | **Type** : Sécurité

```gherkin
Given secret configuré + header absent
When la requête est rejetée (403)
Then le corps JSON contient le champ "error" avec un message explicite
```

**Statut** : Passé

---

### TC-058-08 : CORS * préservé en dev

**Niveau** : L2 | **Type** : Non régression (SC2)

```bash
# Dev : OPTIONS depuis n'importe quelle origine
curl -s -X OPTIONS http://localhost:8082/api/supervision/tableau-de-bord \
  -H "Origin: http://localhost:4000" \
  -H "Access-Control-Request-Method: GET" -v 2>&1 | grep "access-control"
# Attendu : Access-Control-Allow-Origin: *
```

**Statut** : Passé
