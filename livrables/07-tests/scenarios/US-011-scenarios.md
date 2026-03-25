# Scénarios de tests US-011 — Tableau de bord des tournées en temps réel

**US liée** : US-011
**Titre** : Tableau de bord des tournées en temps réel
**Bounded Context** : BC-03 Supervision
**Aggregate / Domain Event ciblé** : VueTournee (Read Model) — aucun Domain Event émis
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-300 : Affichage du tableau de bord W-01 avec bandeau résumé et liste tournées

**US liée** : US-011
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : TableauDeBordPage — BandeauResume + LigneTournee
**Type** : Fonctionnel (happy path)
**Préconditions** : Backend svc-supervision en profil dev, DevDataSeeder créé 3 VueTournee (2 EN_COURS, 1 A_RISQUE)
**Étapes** :
1. Naviguer vers http://localhost:3000 (tableau de bord W-01)
2. Observer le bandeau résumé et la liste

**Résultat attendu** : Le bandeau affiche les compteurs (actives=2, aRisque=1, cloturees=0). Les 3 tournées sont listées avec badges de statut. Les A_RISQUE apparaissent en tête.
**Statut** : Passé

```gherkin
Given Laurent est authentifié SUPERVISEUR et accède au tableau de bord W-01
And le DevDataSeeder a créé 2 tournées EN_COURS et 1 tournée A_RISQUE
When la page se charge
Then le bandeau résumé affiche actives=2, aRisque=1, cloturees=0
And les 3 tournées sont listées
And la tournée A_RISQUE apparaît en tête du tableau (tri prioritaire)
```

---

### TC-301 : API GET /api/supervision/tableau-de-bord retourne 200 avec la liste des tournées

**US liée** : US-011
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : ConsulterTableauDeBordHandler / TableauDeBordDTO
**Type** : Fonctionnel
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler GET /api/supervision/tableau-de-bord avec MockJwt SUPERVISEUR
2. Vérifier la structure de la réponse

**Résultat attendu** : HTTP 200 avec TableauDeBordDTO contenant bandeau et liste de VueTourneeDTO
**Statut** : Passé

```gherkin
Given le backend svc-supervision tourne en profil dev
When GET /api/supervision/tableau-de-bord est appelé avec MockJwt SUPERVISEUR
Then la réponse est HTTP 200
And le corps contient "actives", "aRisque", "cloturees", "tournees"
And chaque VueTourneeDTO contient "tourneeId", "statut", "livreurNom", "colisTraites", "colisTotal"
```

---

### TC-302 : Filtre par statut A_RISQUE — seules les tournées à risque retournées

**US liée** : US-011
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : ConsulterTableauDeBordHandler — filtre statut
**Type** : Fonctionnel
**Préconditions** : Backend svc-supervision en profil dev, une tournée A_RISQUE dans le DevDataSeeder
**Étapes** :
1. Appeler GET /api/supervision/tableau-de-bord?statut=A_RISQUE
2. Vérifier que seules les tournées A_RISQUE sont retournées

**Résultat attendu** : HTTP 200 avec uniquement les tournées A_RISQUE dans la liste
**Statut** : Passé

```gherkin
Given le DevDataSeeder a créé 2 tournées EN_COURS et 1 tournée A_RISQUE
When GET /api/supervision/tableau-de-bord?statut=A_RISQUE est appelé
Then la réponse est HTTP 200
And "tournees" ne contient que des tournées avec statut=A_RISQUE
And le count est 1
```

---

### TC-303 : Invariant — HTTP 403 si non SUPERVISEUR sur /api/supervision

**US liée** : US-011
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : SecurityConfig — ROLE_LIVREUR refusé
**Type** : Invariant domaine / Sécurité
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler GET /api/supervision/tableau-de-bord avec token LIVREUR
2. Vérifier la réponse

**Résultat attendu** : HTTP 403 Forbidden
**Statut** : Passé

```gherkin
Given Pierre est authentifié avec le rôle LIVREUR
When GET /api/supervision/tableau-de-bord est appelé avec son token
Then la réponse est HTTP 403 Forbidden
```

---

### TC-304 : HTTP 400 si statut inconnu dans le filtre

**US liée** : US-011
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : SupervisionController — validation filtre statut
**Type** : Edge case
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler GET /api/supervision/tableau-de-bord?statut=INVALIDE
2. Vérifier la réponse

**Résultat attendu** : HTTP 400 Bad Request
**Statut** : Passé

```gherkin
Given le backend svc-supervision tourne en profil dev
When GET /api/supervision/tableau-de-bord?statut=INVALIDE est appelé
Then la réponse est HTTP 400 Bad Request
```

---

### TC-305 : Bandeau rouge WebSocket déconnecté affiché si la connexion temps réel est perdue

**US liée** : US-011
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : useTableauDeBord — WebSocket fallback
**Type** : Edge case
**Préconditions** : Page W-01 chargée, WebSocket simulé comme déconnecté
**Étapes** :
1. Charger la page W-01
2. Simuler la déconnexion WebSocket
3. Observer l'interface

**Résultat attendu** : Le bandeau rouge "Connexion temps réel perdue" est affiché
**Statut** : Passé

```gherkin
Given Laurent est sur la page W-01 avec la connexion WebSocket active
When la connexion WebSocket est perdue (simulée)
Then un bandeau rouge de déconnexion est affiché sur la page
And le tableau de bord reste consultable (données en cache)
```
