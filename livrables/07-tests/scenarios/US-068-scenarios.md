# Scénarios de tests US-068 — Recevoir et consulter les messages broadcast sur l'application mobile

**Agent** : @qa
**Date de rédaction** : 2026-04-21
**US** : US-068 — Recevoir et consulter les messages broadcast sur l'application mobile
**Aggregates** : BroadcastMessage (MarquerBroadcastVu), BroadcastStatutLivraison
**Domain Events** : BroadcastVuEvent

---

## Pyramide de tests

| Niveau | Nb TCs | Outil | Objectif |
|--------|--------|-------|----------|
| L1 | 7 | `mvn test` (JUnit/Mockito) + Jest (RNTL) | Handler MarquerBroadcastVu, composants React Native |
| L2 | 3 | `curl` sur svc-supervision port 8082 | Endpoints POST /vu, GET /recus |
| L3 | 0 | — | L1+L2 couvrent tous les critères (FCM non testable E2E en dev) |

---

## TC-068-L1-01 : MarquerBroadcastVuHandler — transition statut ENVOYE → VU

**US liée** : US-068
**Niveau** : L1
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : BroadcastMessage / BroadcastVuEvent
**Type** : Fonctionnel
**Préconditions** : BroadcastMessage existant avec livreur-001 en destinataire, statut ENVOYE
**Étapes** : `MarquerBroadcastVuHandler.handle(cmd)` avec broadcastMessageId valide, livreurId=livreur-001
**Résultat attendu** : BroadcastVuEvent émis, statut persisté VU avec horodatageVu
**Statut** : À tester

```gherkin
Given un BroadcastMessage existe avec livreur-001 comme destinataire à l'état ENVOYE
When MarquerBroadcastVuHandler reçoit (broadcastMessageId, livreurId=livreur-001)
Then BroadcastVuEvent est émis avec (broadcastMessageId, livreurId, horodatageVu)
And broadcast_statut_livraison est mis à jour avec statut=VU pour livreur-001
```

---

## TC-068-L1-02 : MarquerBroadcastVuHandler — idempotence (double appel vu)

**US liée** : US-068
**Niveau** : L1
**Couche testée** : Application / Domaine
**Aggregate / Domain Event ciblé** : BroadcastMessage / BroadcastVuEvent
**Type** : Invariant domaine
**Préconditions** : BroadcastMessage déjà marqué VU pour livreur-001
**Étapes** : Second appel `MarquerBroadcastVuHandler.handle(cmd)` pour le même (id, livreurId)
**Résultat attendu** : Aucun second BroadcastVuEvent émis (idempotence), pas d'exception
**Statut** : À tester

```gherkin
Given le statut broadcast est déjà VU pour (broadcastMessageId, livreur-001)
When MarquerBroadcastVuHandler est invoqué une deuxième fois avec les mêmes paramètres
Then aucun BroadcastVuEvent supplémentaire n'est émis
And aucune exception n'est levée
```

---

## TC-068-L1-03 : MarquerBroadcastVuHandler — livreur non destinataire → LivreurNonDestinataireException

**US liée** : US-068
**Niveau** : L1
**Couche testée** : Application / Domaine
**Aggregate / Domain Event ciblé** : BroadcastMessage
**Type** : Invariant domaine / Sécurité
**Préconditions** : BroadcastMessage destiné à livreur-001, livreur-099 tente de marquer vu
**Étapes** : `MarquerBroadcastVuHandler.handle(cmd)` avec livreurId=livreur-099 (non destinataire)
**Résultat attendu** : `LivreurNonDestinataireException` levée, aucun BroadcastVuEvent émis
**Statut** : À tester

```gherkin
Given un BroadcastMessage avec destinataires=[livreur-001, livreur-002]
When MarquerBroadcastVuHandler est invoqué avec livreurId=livreur-099
Then LivreurNonDestinataireException est levée
And aucun BroadcastVuEvent n'est émis
```

---

## TC-068-L1-04 : MarquerBroadcastVuHandler — BroadcastMessage inconnu → BroadcastMessageInconnuException

**US liée** : US-068
**Niveau** : L1
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : BroadcastMessage
**Type** : Edge case
**Préconditions** : broadcastMessageId inexistant dans le repository
**Étapes** : `MarquerBroadcastVuHandler.handle(cmd)` avec un UUID inconnu
**Résultat attendu** : `BroadcastMessageInconnuException` levée
**Statut** : À tester

```gherkin
Given aucun BroadcastMessage n'existe pour l'id fourni
When MarquerBroadcastVuHandler est invoqué
Then BroadcastMessageInconnuException est levée
```

---

## TC-068-L1-05 : BroadcastOverlay — rendu null si message absent

**US liée** : US-068
**Niveau** : L1
**Couche testée** : UI (composant React Native)
**Type** : Rendu conditionnel
**Préconditions** : BroadcastOverlay rendu avec message=null
**Étapes** : Jest/RNTL — `render(<BroadcastOverlay message={null} />)`
**Résultat attendu** : composant ne rend rien (null)
**Statut** : À tester

```gherkin
Given BroadcastOverlay reçoit prop message=null
When le composant est rendu
Then aucun élément UI n'est affiché
```

---

## TC-068-L1-06 : BroadcastOverlay — badge coloré selon TypeBroadcast

**US liée** : US-068
**Niveau** : L1
**Couche testée** : UI (composant React Native)
**Type** : Rendu conditionnel
**Préconditions** : BroadcastOverlay rendu avec message={type:"ALERTE", texte:"..."}
**Étapes** : Jest/RNTL — vérifier que le badge "[ALERTE]" est visible avec couleur rouge
**Résultat attendu** : Text "[ALERTE]" présent, style backgroundColor rouge
**Statut** : À tester

```gherkin
Given BroadcastOverlay reçoit message={type:"ALERTE", texte:"Incident terrain"}
When le composant est rendu
Then le badge "[ALERTE]" est visible
And la couleur de badge correspond à ALERTE (rouge)
```

---

## TC-068-L1-07 : MessagesSuperviseursScreen — marquage automatique VU au montage

**US liée** : US-068
**Niveau** : L1
**Couche testée** : UI (composant React Native)
**Type** : Fonctionnel
**Préconditions** : MessagesSuperviseursScreen monté avec 2 messages non lus
**Étapes** : Jest/RNTL — `render(<MessagesSuperviseursScreen />)`, vérifier appels POST /vu
**Résultat attendu** : 2 appels POST /broadcasts/{id}/vu émis automatiquement au montage du composant
**Statut** : À tester

```gherkin
Given MessagesSuperviseursScreen reçoit 2 BroadcastMessages non lus
When le composant se monte (componentDidMount / useEffect)
Then POST /broadcasts/{id}/vu est appelé pour chaque message non lu
And le badge de l'icône campaign passe à 0
```

---

## TC-068-L2-01 : POST /broadcasts/{id}/vu → 204 (livreur destinataire)

**US liée** : US-068
**Niveau** : L2
**Couche testée** : Infrastructure / Interface
**Type** : Fonctionnel cross-services
**Préconditions** : svc-supervision démarré, broadcast créé avec livreur-001 en destinataire
**Étapes** :
```bash
# 1. Créer un broadcast
BROADCAST_ID=$(curl -s -X POST http://localhost:8082/api/supervision/broadcasts \
  -H "Content-Type: application/json" \
  -d '{"type":"INFO","texte":"Test broadcast vu","ciblage":{"type":"TOUS","secteurs":[]}}' \
  | jq -r '.broadcastMessageId')

# 2. Marquer vu par livreur-001
curl -s -X POST http://localhost:8082/api/supervision/broadcasts/$BROADCAST_ID/vu \
  -H "Content-Type: application/json" \
  -d '{"livreurId":"livreur-001"}'
```
**Résultat attendu** : HTTP 204 (acquittement silencieux)
**Statut** : À tester

```gherkin
Given un BroadcastMessage existe avec livreur-001 en destinataire
When POST /api/supervision/broadcasts/{id}/vu avec livreurId=livreur-001
Then HTTP 204 est retourné
And le statut broadcast pour livreur-001 passe à VU
```

---

## TC-068-L2-02 : POST /broadcasts/{id}/vu avec livreur non destinataire → 403

**US liée** : US-068
**Niveau** : L2
**Couche testée** : Infrastructure / Interface / Sécurité
**Type** : Invariant domaine / Sécurité
**Préconditions** : broadcast créé ciblage SECTEUR(SECT-IDF-01), livreur-006 n'est pas dans ce secteur
**Étapes** :
```bash
curl -s -X POST http://localhost:8082/api/supervision/broadcasts/$BROADCAST_ID/vu \
  -H "Content-Type: application/json" \
  -d '{"livreurId":"livreur-999"}'
```
**Résultat attendu** : HTTP 403 Forbidden
**Statut** : À tester

```gherkin
Given un broadcast destiné aux livreurs de SECT-IDF-01
When POST /vu avec livreurId=livreur-999 (non destinataire)
Then HTTP 403 est retourné
And aucun BroadcastVuEvent n'est émis
```

---

## TC-068-L2-03 : GET /broadcasts/recus?date=YYYY-MM-DD → liste broadcasts livreur

**US liée** : US-068
**Niveau** : L2
**Couche testée** : Infrastructure / Interface
**Type** : Fonctionnel
**Préconditions** : svc-supervision démarré, broadcast existant pour la date courante avec livreur-001
**Étapes** :
```bash
curl -s "http://localhost:8082/api/supervision/broadcasts/recus?date=2026-04-21" \
  -H "X-Livreur-Id: livreur-001"
```
**Résultat attendu** : HTTP 200, liste de BroadcastRecuDTO avec statut VU ou ENVOYE par livreur
**Statut** : À tester

```gherkin
Given au moins un broadcast existe pour la date du jour avec livreur-001 en destinataire
When GET /broadcasts/recus?date=2026-04-21 avec livreurId=livreur-001
Then HTTP 200 est retourné
And la liste contient les broadcasts du jour pour ce livreur
And chaque item a broadcastMessageId, type, texte, statut (VU/ENVOYE), horodatageEnvoi
```
