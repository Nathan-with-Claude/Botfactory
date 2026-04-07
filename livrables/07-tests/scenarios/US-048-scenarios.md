# Scénarios de tests US-048 : Synchronisation données tournée supervision ↔ app mobile

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-048 — Synchronisation données tournée supervision ↔ app mobile livreur
**Bounded Context** : BC-07 → BC-01 (DevEventBridge), BC-06 (mobile)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-048-01 | T-204 propagée avec 22 colis vers svc-tournee | L2 | Passé |
| TC-048-02 | DevEventBridge ne crée pas de doublons (idempotence) | L2 | Passé |
| TC-048-03 | Message explicite "Aucune tournée" pour livreur-005 | L1 | Passé |
| TC-048-04 | DevEventBridge absent en profil prod | L2 | Passé |
| TC-048-05 | livreur-005 dans le picker dev mobile | L1 | Passé |

---

### TC-048-01 : T-204 propagée avec 22 colis vers svc-tournee

**Niveau** : L2 | **Type** : Fonctionnel cross-services (SC1+SC2)

**Préconditions** : svc-supervision + svc-tournee démarrés en profil dev

```bash
# Vérification L2
curl -s "http://localhost:8081/api/tournees?livreurId=livreur-002" | jq '.colis | length'
# Attendu : 22
```

```gherkin
Given svc-supervision et svc-tournee démarrés en profil dev
When le DevDataSeeder de svc-supervision s'exécute (T-204 LANCEE, livreur-002, 22 colis)
Then DevEventBridge.propaguerTourneeLancee est appelé
And GET /api/tournees?livreurId=livreur-002 retourne une tournée avec 22 colis
And tourneeId est identique dans BC-07 et BC-01
```

**Statut** : Passé

---

### TC-048-02 : DevEventBridge idempotent (pas de doublon)

**Niveau** : L2 | **Type** : Invariant (SC3)

```gherkin
Given une Tournee T-204 existe déjà dans svc-tournee
When DevEventBridge reçoit à nouveau TourneeLancee pour T-204
Then aucune Tournee supplémentaire n'est créée dans svc-tournee
And la réponse du controller est 200 OK (pas d'exception)
```

**Statut** : Passé

---

### TC-048-03 : Message explicite "Aucune tournée" pour livreur-005

**Niveau** : L1 | **Type** : Fonctionnel (SC4)

```gherkin
Given livreur-005 (Sophie Bernard) n'a aucune Tournee dans svc-tournee
When ListeColisScreen se charge pour livreur-005
Then l'app affiche "Aucune tournée n'a encore été commandée pour vous.\nVeuillez vous rapprocher de votre superviseur."
And aucun Colis n'est affiché
```

**Statut** : Passé

---

### TC-048-04 : DevEventBridge absent en profil prod

**Niveau** : L2 | **Type** : Sécurité (SC6)

```gherkin
Given svc-supervision démarré en profil prod
When POST /dev/tms/import est appelé
Then la réponse est HTTP 404 (endpoint dev absent)
```

**Statut** : Passé (vérifié par `@Profile("dev")` sur le controller)

---

### TC-048-05 : livreur-005 dans le picker dev mobile

**Niveau** : L1 | **Type** : Fonctionnel (SC5)

```gherkin
Given l'application mobile est lancée avec __DEV__=true
When ConnexionScreen est affiché
Then btn-dev-livreur-livreur-005 est présent
And le libellé est "Sophie Bernard" + "livreur-005"
```

**Statut** : Passé
