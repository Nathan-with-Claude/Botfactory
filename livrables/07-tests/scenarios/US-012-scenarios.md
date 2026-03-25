# Scénarios de tests US-012 — Détail tournée superviseur

**US liée** : US-012
**Titre** : Consulter le détail d'une tournée avec statuts des colis et incidents
**Bounded Context** : BC-03 Supervision
**Aggregate / Domain Event ciblé** : VueTourneeDetail (Read Model) — aucun Domain Event
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-310 : Affichage du détail d'une tournée depuis le tableau de bord

**US liée** : US-012
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : DetailTourneePage — bandeau avancement + onglets
**Type** : Fonctionnel (happy path)
**Préconditions** : Backend svc-supervision en profil dev, tournee-sup-001 avec 3 colis (1 LIVRE, 1 ECHEC, 1 A_LIVRER)
**Étapes** :
1. Depuis le tableau de bord, cliquer sur "Voir" pour tournee-sup-001
2. Observer la page de détail W-02

**Résultat attendu** : Le bandeau affiche tourneeId, livreurNom, colisTraites/colisTotal, barre de progression. L'onglet Colis affiche les 3 colis avec leurs badges de statut.
**Statut** : Passé

```gherkin
Given Laurent est sur le tableau de bord W-01
When Laurent clique sur "Voir" pour la tournée tournee-sup-001
Then la page W-02 (DetailTourneePage) s'affiche
And le bandeau montre livreurNom, la progression (colisTraites/colisTotal), le badge statut
And l'onglet "Colis (3)" est affiché avec les 3 colis
```

---

### TC-311 : API GET /api/supervision/tournees/{tourneeId} retourne 200 avec détail complet

**US liée** : US-012
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : ConsulterDetailTourneeHandler / VueTourneeDetailDTO
**Type** : Fonctionnel
**Préconditions** : Backend svc-supervision en profil dev, tournee-sup-001 disponible
**Étapes** :
1. Appeler GET /api/supervision/tournees/tournee-sup-001 avec MockJwt SUPERVISEUR
2. Vérifier la structure

**Résultat attendu** : HTTP 200 avec VueTourneeDetailDTO contenant tournee, colis[], incidents[]
**Statut** : Passé

```gherkin
Given le backend svc-supervision tourne en profil dev
When GET /api/supervision/tournees/tournee-sup-001 est appelé avec MockJwt SUPERVISEUR
Then la réponse est HTTP 200
And le corps contient "tournee", "colis", "incidents"
And "colis" contient 3 éléments avec statuts LIVRE, ECHEC, A_LIVRER
And "incidents" contient les incidents de la tournée
```

---

### TC-312 : Badges de statut colorés — LIVRE vert, ECHEC rouge, A_LIVRER bleu

**US liée** : US-012
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : DetailTourneePage — badges colorés
**Type** : Fonctionnel
**Préconditions** : Page W-02 affichée pour tournee-sup-001
**Étapes** :
1. Observer l'onglet Colis avec les 3 colis
2. Vérifier les couleurs des badges

**Résultat attendu** : Le colis LIVRE a un badge vert, ECHEC rouge, A_LIVRER bleu
**Statut** : Passé

```gherkin
Given Laurent est sur la page de détail W-02 de tournee-sup-001
When Laurent consulte l'onglet "Colis"
Then le colis en statut LIVRE a un badge vert
And le colis en statut ECHEC a un badge rouge avec le motif d'échec
And le colis en statut A_LIVRER a un badge bleu
```

---

### TC-313 : Bouton "Instructionner" visible uniquement pour colis A_LIVRER sur tournée active

**US liée** : US-012
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : DetailTourneePage — invariant US-014 (bouton conditionnel)
**Type** : Invariant domaine
**Préconditions** : Page W-02 avec un colis A_LIVRER sur tournée EN_COURS
**Étapes** :
1. Observer les boutons "Instructionner" sur l'onglet Colis
2. Vérifier la visibilité conditionnelle

**Résultat attendu** : Le bouton "Instructionner" est visible uniquement pour les colis A_LIVRER sur une tournée active (EN_COURS ou A_RISQUE)
**Statut** : Passé

```gherkin
Given Laurent est sur la page W-02 de tournee-sup-001 (EN_COURS)
When Laurent consulte l'onglet Colis
Then le bouton "Instructionner" est visible pour le colis en statut A_LIVRER
And le bouton "Instructionner" est absent pour les colis LIVRE et ECHEC
```

---

### TC-314 : HTTP 404 si tournée absente du Read Model

**US liée** : US-012
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : ConsulterDetailTourneeHandler — TourneeSupervisionNotFoundException
**Type** : Edge case
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler GET /api/supervision/tournees/tournee-INEXISTANTE
2. Vérifier la réponse

**Résultat attendu** : HTTP 404 Not Found
**Statut** : Passé

```gherkin
Given aucune tournée avec l'id "tournee-INEXISTANTE" n'existe dans le Read Model
When GET /api/supervision/tournees/tournee-INEXISTANTE est appelé
Then la réponse est HTTP 404 Not Found
```

---

### TC-315 : Onglet Incidents affiche les incidents de la tournée A_RISQUE

**US liée** : US-012
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : DetailTourneePage — onglet Incidents
**Type** : Fonctionnel
**Préconditions** : Tournée tournee-sup-003 (A_RISQUE avec 1 incident) disponible dans le DevDataSeeder
**Étapes** :
1. Naviguer vers le détail de tournee-sup-003
2. Cliquer sur l'onglet "Incidents"
3. Observer la carte d'incident

**Résultat attendu** : L'onglet Incidents affiche la carte de l'incident avec colisId, adresse, motif, horodatage
**Statut** : Passé

```gherkin
Given Laurent est sur la page W-02 de tournee-sup-003 (A_RISQUE avec 1 incident)
When Laurent clique sur l'onglet "Incidents (1)"
Then la carte de l'incident est affichée
And la carte contient colisId, adresse, motif, horodatage
```
