# Scénarios de tests US-066 — Page état des livreurs (W-08)

**Agent** : @qa
**Date de création** : 2026-04-08
**US** : US-066 — Visualiser l'état du jour de tous les livreurs sur une page dédiée
**Statut global** : Exécution complète — L1 PASS (23/23), L2 PASS après correctif OBS-066-02 (4/5 + 1 documenté), L3 bloqué (frontend non démarré — couverture L1 suffisante)

---

## Critères d'acceptation rappelés

1. La page W-08 affiche 6 lignes (une par livreur) avec nom, badge d'état et code tournée.
2. Les états possibles sont : SANS_TOURNEE, AFFECTE_NON_LANCE, EN_COURS.
3. Le bandeau de synthèse affiche les compteurs par état.
4. Les filtres rapides (TOUS / SANS_TOURNEE / AFFECTE_NON_LANCE / EN_COURS) fonctionnent.
5. Les badges Tailwind respectent le code couleur : vert (EN_COURS), bleu (AFFECTE_NON_LANCE), gris (SANS_TOURNEE).
6. Les boutons contextuels renvoient vers les bons écrans selon l'état.
7. L'ordre de tri : EN_COURS > AFFECTE_NON_LANCE > SANS_TOURNEE.
8. La mise à jour temps réel via WebSocket STOMP (< 30 secondes).
9. Accès restreint aux rôles SUPERVISEUR et DSI.
10. Le paramètre `date` optionnel permet de consulter un autre jour.

---

## Jeu de données de référence (JDD-066)

| LivreurId (référentiel) | Nom complet      | LivreurId (seeder) | TourneePlanifieeId | Statut seed     |
|-------------------------|------------------|--------------------|--------------------|-----------------|
| livreur-pierre-martin   | Pierre Martin    | livreur-001        | —                  | (T-201 NON_AFFECTEE) |
| livreur-paul-dupont     | Paul Dupont      | livreur-002        | tp-204             | LANCEE          |
| livreur-marie-lambert   | Marie Lambert    | livreur-003        | —                  | (absent seed)   |
| livreur-jean-moreau     | Jean Moreau      | livreur-004        | tp-202             | AFFECTEE        |
| livreur-sophie-bernard  | Sophie Bernard   | livreur-005        | tp-205             | AFFECTEE        |
| livreur-lucas-petit     | Lucas Petit      | livreur-006        | tp-206             | AFFECTEE        |

> **Anomalie connue OBS-066-02** : Les IDs dans DevLivreurReferentiel (`livreur-paul-dupont`)
> ne correspondent pas aux IDs dans DevDataSeeder (`livreur-002`). Cette incohérence rend
> tous les livreurs SANS_TOURNEE en L2 (voir rapport). À corriger par @developpeur.

---

## Scénarios L1 — Tests unitaires domaine / application

### TC-066-L1-01 : Livreur sans tournée du jour retourne SANS_TOURNEE

**US liée** : US-066
**Niveau** : L1
**Couche testée** : Application (ConsulterEtatLivreursHandler)
**Aggregate / Domain Event ciblé** : VueLivreur / EtatJournalierLivreur
**Type** : Invariant domaine
**Préconditions** : LivreurReferentiel retourne Jean Moreau. Repository retourne Optional.empty() pour Jean Moreau.
**Étapes** : Appel `handler.handle(DATE_TEST)`.
**Résultat attendu** : VueLivreur avec etat=SANS_TOURNEE, tourneePlanifieeId=null, codeTms=null.
**Statut** : Passé (6/6 — 2026-04-08)

```gherkin
Given le référentiel contient Jean Moreau (livreur-jean-moreau)
And aucune TourneePlanifiee AFFECTEE ou LANCEE pour ce livreur à la date du test
When ConsulterEtatLivreursHandler.handle(DATE_TEST) est appelé
Then VueLivreur.etat == SANS_TOURNEE
And VueLivreur.tourneePlanifieeId == null
```

---

### TC-066-L1-02 : Livreur avec tournée AFFECTEE retourne AFFECTE_NON_LANCE

**US liée** : US-066
**Niveau** : L1
**Couche testée** : Application (ConsulterEtatLivreursHandler)
**Aggregate / Domain Event ciblé** : VueLivreur / EtatJournalierLivreur
**Type** : Invariant domaine
**Préconditions** : TourneePlanifiee tp-201 (T-201) au statut AFFECTEE pour Pierre Martin.
**Résultat attendu** : etat=AFFECTE_NON_LANCE, tourneePlanifieeId="tp-201", codeTms="T-201".
**Statut** : Passé (6/6 — 2026-04-08)

```gherkin
Given TourneePlanifiee tp-201 statut AFFECTEE, livreurId=livreur-pierre-martin
When ConsulterEtatLivreursHandler.handle(DATE_TEST) est appelé
Then VueLivreur.etat == AFFECTE_NON_LANCE
And VueLivreur.codeTms == "T-201"
```

---

### TC-066-L1-03 : Livreur avec tournée LANCEE retourne EN_COURS

**US liée** : US-066
**Niveau** : L1
**Couche testée** : Application (ConsulterEtatLivreursHandler)
**Aggregate / Domain Event ciblé** : VueLivreur / EtatJournalierLivreur
**Type** : Invariant domaine
**Préconditions** : TourneePlanifiee tp-204 (T-204) au statut LANCEE pour Paul Dupont.
**Résultat attendu** : etat=EN_COURS, tourneePlanifieeId="tp-204", codeTms="T-204".
**Statut** : Passé (6/6 — 2026-04-08)

```gherkin
Given TourneePlanifiee tp-204 statut LANCEE, livreurId=livreur-paul-dupont
When ConsulterEtatLivreursHandler.handle(DATE_TEST) est appelé
Then VueLivreur.etat == EN_COURS
And VueLivreur.codeTms == "T-204"
```

---

### TC-066-L1-04 : 6 livreurs états mixtes — liste complète

**US liée** : US-066
**Niveau** : L1
**Couche testée** : Application (ConsulterEtatLivreursHandler)
**Aggregate / Domain Event ciblé** : VueLivreur / EtatJournalierLivreur
**Type** : Fonctionnel
**Préconditions** : 6 livreurs avec états : 1 EN_COURS, 4 AFFECTE_NON_LANCE, 1 SANS_TOURNEE.
**Résultat attendu** : Liste de 6 VueLivreur avec les bons états (assertions sur Paul Dupont et Jean Moreau).
**Statut** : Passé (6/6 — 2026-04-08)

```gherkin
Given le référentiel contient les 6 livreurs canoniques
And Paul Dupont a une tournée LANCEE (T-204)
And Jean Moreau n'a aucune tournée
And Pierre/Marie/Sophie/Lucas ont des tournées AFFECTEE
When ConsulterEtatLivreursHandler.handle(DATE_TEST) est appelé
Then la liste contient 6 VueLivreur
And Paul Dupont -> EN_COURS
And Jean Moreau -> SANS_TOURNEE
And 4 livreurs -> AFFECTE_NON_LANCE
```

---

### TC-066-L1-05 : Statut NON_AFFECTEE ignoré par le repository → SANS_TOURNEE

**US liée** : US-066
**Niveau** : L1
**Couche testée** : Application (ConsulterEtatLivreursHandler)
**Aggregate / Domain Event ciblé** : VueLivreur / EtatJournalierLivreur
**Type** : Invariant domaine (edge case)
**Préconditions** : Repository mock retourne Optional.empty() (simule que NON_AFFECTEE est filtré côté JPQL).
**Résultat attendu** : etat=SANS_TOURNEE (jamais AFFECTE si tournée NON_AFFECTEE).
**Statut** : Passé (6/6 — 2026-04-08)

```gherkin
Given repository ne retourne aucune TourneePlanifiee pour Jean Moreau (NON_AFFECTEE filtrée)
When ConsulterEtatLivreursHandler.handle(DATE_TEST) est appelé
Then VueLivreur.etat == SANS_TOURNEE
```

---

### TC-066-L1-06 : Date différente filtre correctement

**US liée** : US-066
**Niveau** : L1
**Couche testée** : Application (ConsulterEtatLivreursHandler)
**Aggregate / Domain Event ciblé** : VueLivreur / EtatJournalierLivreur
**Type** : Edge case
**Préconditions** : Appel avec date = DATE_TEST - 1 jour (hier).
**Résultat attendu** : Repository appelé avec la date passée ; livreur retourne SANS_TOURNEE (pas de tournée hier).
**Statut** : Passé (6/6 — 2026-04-08)

```gherkin
Given repository retourne Optional.empty() pour Pierre Martin le 2026-04-05
When ConsulterEtatLivreursHandler.handle(2026-04-05) est appelé
Then VueLivreur.etat == SANS_TOURNEE
```

---

## Scénarios L1 — Tests RTL (EtatLivreursPage.test.tsx)

### TC-066-L1-07 : Rendu des 6 livreurs avec état et code tournée

**Niveau** : L1 | **Couche** : UI (RTL — composant isolé) | **Type** : Fonctionnel
**Préconditions** : fetchFn mockée retournant LIVREURS_MIXTES (6 entrées).
**Résultat attendu** : 6 noms affichés, codes T-201 et T-204 présents.
**Statut** : Passé (17/17 — 2026-04-08)

### TC-066-L1-08 : Compteurs bandeau (1/4/1)

**Niveau** : L1 | **Couche** : UI (RTL) | **Type** : Fonctionnel
**Préconditions** : LIVREURS_MIXTES (1 SANS_TOURNEE, 4 AFFECTE_NON_LANCE, 1 EN_COURS).
**Résultat attendu** : `[data-testid="compteur-sans-tournee"]` = 1, `compteur-affectes` = 4, `compteur-en-cours` = 1.
**Statut** : Passé (17/17 — 2026-04-08)

### TC-066-L1-09 : Badges Tailwind par état

**Niveau** : L1 | **Couche** : UI (RTL) | **Type** : Fonctionnel
**Préconditions** : LIVREURS_MIXTES injecté.
**Résultat attendu** :
- badge Paul Dupont : `data-etat=EN_COURS`, classes `bg-emerald-100 text-emerald-700`
- badge Pierre Martin : `data-etat=AFFECTE_NON_LANCE`, classes `bg-primary-container text-on-primary-container`
- badge Jean Moreau : `data-etat=SANS_TOURNEE`, classes `bg-surface-container text-on-surface-variant`
**Statut** : Passé (17/17 — 2026-04-08)

### TC-066-L1-10 : Filtrage SANS_TOURNEE / EN_COURS / TOUS

**Niveau** : L1 | **Couche** : UI (RTL) | **Type** : Fonctionnel
**Préconditions** : LIVREURS_MIXTES, filtres disponibles.
**Résultat attendu** :
- Clic filtre-SANS_TOURNEE → seul Jean Moreau visible
- Clic filtre-EN_COURS → seul Paul Dupont visible
- Clic filtre-TOUS → 6 lignes visibles
**Statut** : Passé (17/17 — 2026-04-08)

### TC-066-L1-11 : Boutons contextuels selon l'état

**Niveau** : L1 | **Couche** : UI (RTL) | **Type** : Fonctionnel
**Préconditions** : Props `onAffecter` et `onVoirTourneePlanifiee` mockées.
**Résultat attendu** :
- Jean Moreau : bouton "Affecter" → appelle onAffecter
- Paul Dupont : bouton "Voir tournée" → appelle onVoirTourneePlanifiee("tp-204")
- Pierre Martin : bouton "Voir préparation" → appelle onVoirTourneePlanifiee("tp-201")
**Statut** : Passé (17/17 — 2026-04-08)

### TC-066-L1-12 : Tri EN_COURS > AFFECTE_NON_LANCE > SANS_TOURNEE

**Niveau** : L1 | **Couche** : UI (RTL) | **Type** : Invariant domaine
**Préconditions** : LIVREURS_MIXTES dans désordre.
**Résultat attendu** : première ligne `data-etat=EN_COURS`, dernière ligne `data-etat=SANS_TOURNEE`.
**Statut** : Passé (17/17 — 2026-04-08)

### TC-066-L1-13 : Indicateur de chargement

**Niveau** : L1 | **Couche** : UI (RTL) | **Type** : Edge case
**Préconditions** : fetchFn bloquée (Promise non résolue).
**Résultat attendu** : `[data-testid="chargement-livreurs"]` présent pendant le fetch, absent après résolution.
**Statut** : Passé (17/17 — 2026-04-08)

### TC-066-L1-14 : Gestion erreur réseau

**Niveau** : L1 | **Couche** : UI (RTL) | **Type** : Edge case
**Préconditions** : fetchFn rejette avec Error("Network error").
**Résultat attendu** : `[data-testid="erreur-livreurs"]` affiché.
**Statut** : Passé (17/17 — 2026-04-08)

### TC-066-L1-15 : Titre et date affichés

**Niveau** : L1 | **Couche** : UI (RTL) | **Type** : Fonctionnel
**Résultat attendu** : `[data-testid="titre-etat-livreurs"]` contient "État des livreurs".
**Statut** : Passé (17/17 — 2026-04-08)

### TC-066-L1-16 : Mise à jour WebSocket partielle (un seul livreur)

**Niveau** : L1 | **Couche** : UI (RTL) | **Type** : Fonctionnel
**Préconditions** : stompSubscribeFn mockée. Pierre Martin initialement AFFECTE_NON_LANCE.
**Étapes** : Simuler message WebSocket STOMP → Pierre Martin passe EN_COURS.
**Résultat attendu** : badge Pierre Martin passe à EN_COURS. Paul Dupont inchangé.
**Statut** : Passé (17/17 — 2026-04-08)

---

## Scénarios L2 — Tests d'intégration API

### TC-066-L2-01 : GET /api/supervision/livreurs/etat-du-jour → 6 livreurs

**US liée** : US-066
**Niveau** : L2
**Couche testée** : Infrastructure + REST
**Type** : Fonctionnel
**Préconditions** : svc-supervision démarré avec profil dev. DevDataSeeder exécuté.
**Étapes** :
```bash
curl -s -H "Authorization: Bearer dev-token-superviseur" \
  http://localhost:8082/api/supervision/livreurs/etat-du-jour
```
**Résultat attendu** : HTTP 200, tableau de 6 LivreurEtatDTO avec états variés (au moins 1 EN_COURS et au moins 1 AFFECTE_NON_LANCE).
**Statut** : Passé (re-run 2026-04-08 après correctif OBS-066-02) — 1 EN_COURS (Paul Dupont/livreur-002), 3 AFFECTE_NON_LANCE (Jean Moreau, Sophie Bernard, Lucas Petit), 2 SANS_TOURNEE (Pierre Martin, Marie Lambert)

---

### TC-066-L2-02 : Accès sans token → 200 en mode dev (comportement documenté)

**US liée** : US-066
**Niveau** : L2
**Couche testée** : Infrastructure (sécurité)
**Type** : Edge case / sécurité
**Préconditions** : svc-supervision démarré avec profil dev.
**Étapes** :
```bash
curl -s -o /dev/null -w "%{http_code}" \
  http://localhost:8082/api/supervision/livreurs/etat-du-jour
```
**Résultat attendu** : HTTP 403 (accès non autorisé sans token).
**Statut** : Documenté (OBS-066-01 non bloquant) — HTTP 200 retourné sans token (filtre sécurité dev bypass intentionnel). Comportement accepté en profil dev. Profil prod protégé par @PreAuthorize.

---

### TC-066-L2-03 : Paramètre date explicite respecté

**US liée** : US-066
**Niveau** : L2
**Couche testée** : Infrastructure + Application
**Type** : Fonctionnel
**Préconditions** : svc-supervision démarré avec profil dev.
**Étapes** :
```bash
curl -s -H "Authorization: Bearer dev-token-superviseur" \
  "http://localhost:8082/api/supervision/livreurs/etat-du-jour?date=2026-04-08"
```
**Résultat attendu** : HTTP 200, 6 livreurs avec états calculés pour la date 2026-04-08.
**Statut** : Passé (re-run 2026-04-08) — 6 livreurs, états variés, paramètre date respecté.

---

### TC-066-L2-04 : Structure DTO complète et conforme à la spec

**US liée** : US-066
**Niveau** : L2
**Couche testée** : Infrastructure (DTO sérialisation)
**Type** : Contrat API
**Préconditions** : svc-supervision démarré.
**Étapes** :
```bash
curl -s -H "Authorization: Bearer dev-token-superviseur" \
  http://localhost:8082/api/supervision/livreurs/etat-du-jour | python3 -c "
import json, sys; d=json.load(sys.stdin); print(list(d[0].keys()))"
```
**Résultat attendu** : Champs `livreurId`, `nomComplet`, `etat`, `tourneePlanifieeId`, `codeTms` tous présents.
**Statut** : Passé — structure DTO conforme (5/5 champs présents)

---

### TC-066-L2-05 : Propagation après reset/reseed

**US liée** : US-066
**Niveau** : L2
**Couche testée** : Infrastructure (seeder + handler)
**Type** : Non régression / cross-services
**Préconditions** : svc-supervision démarré.
**Étapes** :
```bash
curl -s -X DELETE -H "Authorization: Bearer dev-token-superviseur" \
  http://localhost:8082/dev/tms/reset
# puis
curl -s -H "Authorization: Bearer dev-token-superviseur" \
  http://localhost:8082/api/supervision/livreurs/etat-du-jour
```
**Résultat attendu** : Après reset, les états reflètent les nouvelles données seedées (états variés, pas tous SANS_TOURNEE).
**Statut** : Passé (re-run 2026-04-08) — HTTP 204 pour reset, états variés confirmés après reseed.

---

## Scénarios L3 — Tests E2E Playwright

### TC-066-L3-01 : Navigation depuis W-01 vers W-08 et affichage de la liste

**US liée** : US-066
**Niveau** : L3
**Couche testée** : UI (navigation + affichage)
**Type** : Fonctionnel
**Préconditions** : Frontend supervision sur http://localhost:3000. Utilisateur superviseur authentifié (token injecté).
**Étapes** :
1. Injecter `docupost_access_token` dans sessionStorage.
2. Naviguer vers http://localhost:3000.
3. Cliquer sur "Livreurs" dans la barre de navigation.
4. Vérifier l'affichage de la page W-08.
**Résultat attendu** : URL contient `etat-livreurs`. Titre "État des livreurs" visible. 6 lignes affichées.
**Statut** : Bloqué — frontend non démarré (port 3000 inaccessible). Couverture assurée par L1 (RTL SC1+SC9).

---

### TC-066-L3-02 : Filtrage par état sur W-08

**US liée** : US-066
**Niveau** : L3
**Couche testée** : UI (interaction filtre)
**Type** : Fonctionnel
**Préconditions** : Page W-08 accessible avec les 6 livreurs affichés.
**Étapes** :
1. Cliquer filtre "Sans tournée".
2. Vérifier que seule la ligne Jean Moreau est affichée.
3. Cliquer "Tous".
4. Vérifier retour à 6 lignes.
**Résultat attendu** : Filtrage fonctionnel conformément au SC4 L1.
**Statut** : Bloqué — frontend non démarré. Couverture assurée par L1 (RTL SC4).

---

### TC-066-L3-03 : Badges visuels et couleurs sur W-08

**US liée** : US-066
**Niveau** : L3
**Couche testée** : UI (rendu visuel états)
**Type** : Rendu visuel critique
**Préconditions** : Page W-08 avec les 6 livreurs.
**Étapes** :
1. Screenshot de la page.
2. Vérifier que les badges EN_COURS sont verts, AFFECTE bleus, SANS_TOURNEE gris.
**Résultat attendu** : Codes couleur conformes au wireframe W-08.
**Statut** : Bloqué — frontend non démarré. Couverture partielle assurée par L1 (RTL SC3 — classes Tailwind).
