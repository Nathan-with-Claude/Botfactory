# Scénarios de tests US-059 : Upload photo multipart / gestion taille

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-059 — Migrer l'upload de photo preuve vers multipart (hors payload JSON)
**Bounded Context** : BC-01 Orchestration de Tournée (mobile) + BC-02 Preuves (svc-tournee)
**Décision MVP** : Augmentation limite Spring Boot (5MB/10MB) + double seuil console (500Ko/1Mo) + callback onPhotoTooLarge

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-059-01 | svc-tournee application.yml contient max-file-size=5MB | L1 | Passé |
| TC-059-02 | svc-supervision application.yml contient max-file-size=5MB | L1 | Passé |
| TC-059-03 | Photo > 1Mo → status 413 + onPhotoTooLarge appelé | L1 | Passé (mvp alternatif) |
| TC-059-04 | Photo 413 ne bloque pas les commandes suivantes | L1 | Passé |
| TC-059-05 | syncExecutor — tests existants non cassés | L1 | Passé |
| TC-059-06 | Livraison sans photo (signature) inchangée | L1 | Non régression |

---

### TC-059-01 : svc-tournee application.yml max-file-size=5MB

**Niveau** : L1 | **Type** : Configuration

```gherkin
Given src/backend/svc-tournee/src/main/resources/application.yml
When on vérifie la configuration
Then spring.servlet.multipart.max-file-size = 5MB
And spring.servlet.multipart.max-request-size = 10MB
```

**Statut** : Passé

---

### TC-059-02 : svc-supervision application.yml max-file-size=5MB

**Niveau** : L1 | **Type** : Configuration

```gherkin
Given src/backend/svc-supervision/src/main/resources/application.yml
When on vérifie la configuration
Then spring.servlet.multipart.max-file-size = 5MB
And spring.servlet.multipart.max-request-size = 10MB
```

**Statut** : Passé

---

### TC-059-03 : Photo > 1Mo → status 413 + callback

**Niveau** : L1 | **Type** : Fonctionnel (SC3)
**Note** : Implémentation MVP alternatif — pas de multipart en 2 étapes, mais double seuil côté syncExecutor

```gherkin
Given syncExecutor avec onPhotoTooLarge callback et photo > 1_334_000 chars base64
When syncExecutor traite la commande
Then le résultat est { success: false, status: 413 }
And onPhotoTooLarge est appelé
And la commande est retirée de la file (sans bloquer les suivantes)
And console.error est émis
```

**Statut** : Passé (MVP alternatif — OBS-AS-004 : pas de message UI si callback absent)

---

### TC-059-04 : Photo 413 ne bloque pas les commandes suivantes

**Niveau** : L1 | **Type** : Invariant

```gherkin
Given 3 commandes : cmd-1 (photo OK), cmd-2 (photo > 1Mo), cmd-3 (photo OK)
When syncExecutor traite la file
Then cmd-1 est envoyée avec succès
And cmd-2 retourne status=413 et est retirée de la file
And cmd-3 est envoyée avec succès (pas de break sur 413)
```

**Statut** : Passé

---

### TC-059-05 : syncExecutor — 6 tests existants non cassés

**Niveau** : L1 | **Type** : Non régression

```gherkin
Given syncExecutor modifié (onPhotoTooLarge optionnel + double seuil)
When on exécute syncExecutor.test.ts
Then 6/6 tests passent
```

**Statut** : Passé

---

### TC-059-06 : Livraison signature seule inchangée

**Niveau** : L1 | **Type** : Non régression (SC4)

```gherkin
Given CapturePreuveScreen avec signature base64 (taille acceptable)
When la livraison est confirmée
Then le flux existant fonctionne sans modification
```

**Statut** : Passé (non régression)
