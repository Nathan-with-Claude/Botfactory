# Scénarios de tests US-010 — Consulter la preuve d'une livraison

**US liée** : US-010
**Titre** : Consulter la preuve d'une livraison pour traiter un litige
**Bounded Context** : BC-02 Gestion des Preuves de Livraison
**Aggregate / Domain Event ciblé** : PreuveLivraison (immuable, lecture pure) — aucun Domain Event
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-290 : Consultation de preuve SIGNATURE par un SUPERVISEUR — HTTP 200

**US liée** : US-010
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : ConsulterPreuveLivraisonHandler / PreuveDetailDTO
**Type** : Fonctionnel (happy path)
**Préconditions** : Backend svc-tournee en profil dev, une livraison avec preuve SIGNATURE persistée
**Étapes** :
1. Créer une preuve SIGNATURE via POST /livraison pour un colis A_LIVRER
2. Appeler GET /api/preuves/livraison/{colisId} avec le token MockJwt SUPERVISEUR
3. Vérifier la réponse

**Résultat attendu** : HTTP 200 avec PreuveDetailDTO contenant typePreuve=SIGNATURE, aperçuSignature (Base64)
**Statut** : Passé

```gherkin
Given une PreuveLivraison de type SIGNATURE a été capturée pour le colis colis-test-preuve
When GET /api/preuves/livraison/colis-test-preuve est appelé avec MockJwt SUPERVISEUR
Then la réponse est HTTP 200
And "typePreuve" = "SIGNATURE"
And "aperçuSignature" est présent (Base64)
And "modeDegradeGps" est présent (boolean)
```

---

### TC-291 : Invariant — rôle LIVREUR interdit sur /api/preuves — HTTP 403

**US liée** : US-010
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : PreuveController — @PreAuthorize SUPERVISEUR/SUPPORT
**Type** : Invariant domaine / Sécurité
**Préconditions** : Backend svc-tournee en profil dev
**Étapes** :
1. Appeler GET /api/preuves/livraison/{colisId} avec le token MockJwt LIVREUR
2. Vérifier la réponse

**Résultat attendu** : HTTP 403 Forbidden — le rôle LIVREUR est explicitement interdit
**Statut** : Passé

```gherkin
Given Pierre est authentifié avec le rôle LIVREUR
When GET /api/preuves/livraison/{colisId} est appelé avec son token
Then la réponse est HTTP 403 Forbidden
And aucune donnée de preuve n'est retournée
```

---

### TC-292 : Preuve introuvable — HTTP 404

**US liée** : US-010
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : ConsulterPreuveLivraisonHandler — PreuveNotFoundException
**Type** : Edge case
**Préconditions** : Backend svc-tournee en profil dev
**Étapes** :
1. Appeler GET /api/preuves/livraison/colis-INEXISTANT avec le token SUPERVISEUR
2. Vérifier la réponse

**Résultat attendu** : HTTP 404 Not Found
**Statut** : Passé

```gherkin
Given aucune preuve n'existe pour le colis "colis-INEXISTANT"
When GET /api/preuves/livraison/colis-INEXISTANT est appelé avec MockJwt SUPERVISEUR
Then la réponse est HTTP 404 Not Found
```

---

### TC-293 : Consultation de preuve TIERS_IDENTIFIE — champs nomTiers présents

**US liée** : US-010
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : ConsulterPreuveLivraisonHandler / PreuveDetailDTO — @JsonInclude(NON_NULL)
**Type** : Fonctionnel
**Préconditions** : Une preuve TIERS_IDENTIFIE persistée (créée via POST /livraison)
**Étapes** :
1. Créer une preuve TIERS_IDENTIFIE pour un colis A_LIVRER (nomTiers="Mme Leroy")
2. Appeler GET /api/preuves/livraison/{colisId}
3. Vérifier le champ nomTiers

**Résultat attendu** : HTTP 200 avec nomTiers="Mme Leroy". Les champs signature, urlPhoto, descriptionDepot sont absents (NON_NULL).
**Statut** : Passé

```gherkin
Given une preuve TIERS_IDENTIFIE avec nomTiers="Mme Leroy" est persistée pour colis-tiers-test
When GET /api/preuves/livraison/colis-tiers-test est appelé
Then la réponse est HTTP 200
And "typePreuve" = "TIERS_IDENTIFIE"
And "nomTiers" = "Mme Leroy"
And "aperçuSignature" est absent (null non sérialisé)
```

---

### TC-294 : Interface de consultation preuve dans la webapp (ConsulterPreuvePage)

**US liée** : US-010
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : ConsulterPreuvePage — recherche par colisId
**Type** : Fonctionnel
**Préconditions** : Frontend web supervision démarré, backend svc-tournee disponible
**Étapes** :
1. Naviguer vers la page de consultation des preuves
2. Saisir un colisId existant
3. Cliquer sur "Rechercher"
4. Observer l'affichage de la preuve

**Résultat attendu** : Les informations de la preuve sont affichées (typePreuve, horodatage, données spécifiques selon le type)
**Statut** : Passé

```gherkin
Given Sophie est sur la page de consultation des preuves (ConsulterPreuvePage)
When Sophie saisit un colisId valide et clique sur "Rechercher"
Then les détails de la preuve sont affichés (type, horodatage, données)
And l'affichage est conditionnel selon le type de preuve (signature img, nom tiers, description dépôt)
```

---

### TC-295 : Immuabilité — aucun endpoint d'écriture sur /api/preuves

**US liée** : US-010
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : PreuveController — lecture seule
**Type** : Invariant domaine / Sécurité
**Préconditions** : Backend svc-tournee en profil dev
**Étapes** :
1. Tenter un appel DELETE /api/preuves/livraison/{colisId}
2. Tenter un appel PUT /api/preuves/livraison/{colisId}

**Résultat attendu** : HTTP 405 Method Not Allowed — aucune opération d'écriture sur les preuves
**Statut** : Passé

```gherkin
Given le PreuveController est uniquement configuré pour la lecture
When DELETE /api/preuves/livraison/{colisId} est appelé
Then la réponse est HTTP 405 Method Not Allowed
And aucune preuve n'est supprimée (immuabilité garantie)
```
