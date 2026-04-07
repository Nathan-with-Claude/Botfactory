# US-053 — Corriger la reconstruction de TourneePlanifiee — poidsEstimeKg persisté

> Feature : F-020 — Vérification de compatibilité véhicule (BC-07)
> Epic : EPIC-007 — Planification et Préparation des Tournées
> Bounded Context : BC-07 — Planification
> Aggregate(s) touchés : TourneePlanifiee
> Priorité : P0 — Bloquant production
> Complexité estimée : S
> Statut : À faire

## En tant que…

Superviseur logistique utilisant le tableau de préparation des tournées,

## Je veux…

que la vérification de compatibilité véhicule fonctionne correctement pour toutes les tournées, y compris celles qui ont été persistées puis rechargées depuis la base de données,

## Afin de…

ne pas laisser passer des affectations de véhicule incohérentes avec le poids estimé de la tournée, et garantir l'intégrité du contrôle de surcharge.

## Contexte

**Écart as-built identifié (rapport-as-built-supervision.md, §8 et §9, point 6) :**

Le constructeur de reconstruction de `TourneePlanifiee` (utilisé par le mapper JPA lors du chargement depuis la base de données) ne restitue pas le champ `poidsEstimeKg` — il passe `null` à la place de la valeur stockée.

Conséquence : après redémarrage du service, toutes les tournées rechargées depuis la BDD ont `poidsEstimeKg = null`. Quand `VerifierCompatibiliteVehiculeHandler` est invoqué, l'Aggregate retourne `ResultatCompatibilite.POIDS_ABSENT` plutôt que `COMPATIBLE` ou `DEPASSEMENT`. Le contrôle de surcharge est silencieusement désactivé.

**Ce bug est présent dans :**
- `TourneePlanifiee.java` — constructeur de reconstruction (14 paramètres)
- `TourneePlanifieeMapper.java` — appel du constructeur depuis la couche infrastructure

**Invariants à respecter (Aggregate TourneePlanifiee) :**
- `poidsEstimeKg` doit être restitué fidèlement depuis la persistance.
- `verifierCompatibiliteVehicule(vehicule)` doit retourner `POIDS_ABSENT` uniquement si le poids n'a pas été renseigné lors de l'import TMS — pas parce qu'il n'a pas été récupéré depuis la BDD.
- Le Domain Event `CompatibiliteVehiculeVerifiee` ou `CompatibiliteVehiculeEchouee` émis doit être cohérent avec le poids réel de la tournée.

## Critères d'acceptation

**Scénario 1 — Reconstruction depuis BDD avec poids renseigné**
- Given une TourneePlanifiee avec `poidsEstimeKg = 320.0` a été persistée en base
- When le service redémarre et charge cette tournée via le repository JPA
- Then `tourneePlanifiee.getPoidsEstimeKg()` retourne `320.0`
- And l'événement `CompatibiliteVehiculeVerifiee` (ou `CompatibiliteVehiculeEchouee`) est émis avec le poids correct lors d'un appel à `verifierCompatibiliteVehicule`

**Scénario 2 — Compatibilité correcte après rechargement**
- Given une TourneePlanifiee avec `poidsEstimeKg = 320.0` et un véhicule de capacité 400 kg
- When la compatibilité est vérifiée après rechargement depuis BDD
- Then le résultat est `COMPATIBLE` (pas `POIDS_ABSENT`)
- And l'événement `CompatibiliteVehiculeVerifiee` est émis

**Scénario 3 — Surcharge détectée après rechargement**
- Given une TourneePlanifiee avec `poidsEstimeKg = 450.0` et un véhicule de capacité 400 kg
- When la compatibilité est vérifiée après rechargement depuis BDD
- Then le résultat est `DEPASSEMENT`
- And l'événement `CompatibiliteVehiculeEchouee` est émis avec le détail du dépassement

**Scénario 4 — Tournée sans poids (import TMS sans poids)**
- Given une TourneePlanifiee importée sans champ `poidsEstimeKg` (null depuis TMS)
- When la compatibilité est vérifiée
- Then le résultat est `POIDS_ABSENT` (comportement attendu et légitime)

**Scénario 5 — Tests domaine TourneePlanifieeTest verts**
- Given la correction est appliquée
- When on exécute `TourneePlanifieeTest.java` et `TourneePlanifieeUS030Test.java`
- Then les 25+ cas de test passent sans régression

## Définition of Done

- [ ] `TourneePlanifiee.java` : constructeur de reconstruction restitue `poidsEstimeKg` depuis le paramètre correspondant
- [ ] `TourneePlanifieeMapper.java` : appel du constructeur passe bien le champ `poidsEstimeKg` de l'entité JPA
- [ ] Tests domaine `TourneePlanifieeTest` et `TourneePlanifieeUS030Test` verts
- [ ] Test de non-régression ajouté : vérifier que `verifierCompatibiliteVehicule` retourne `COMPATIBLE` (pas `POIDS_ABSENT`) après reconstruction depuis mapper
- [ ] Testé en intégration : rechargement via seeder dev + appel POST `/api/planification/tournees/{id}/verifier-compatibilite-vehicule` retourne le bon résultat

## Liens

- Rapport as-built : /livrables/04-architecture-technique/rapport-as-built-supervision.md#8-écarts-avec-larchitecture-cible
- US liée : US-030 (vérification compatibilité véhicule), US-041 (poids estimé tableau préparation)
- Fichiers concernés :
  - `src/backend/svc-supervision/src/main/java/com/docapost/supervision/domain/planification/model/TourneePlanifiee.java`
  - `src/backend/svc-supervision/src/main/java/com/docapost/supervision/infrastructure/planification/TourneePlanifieeMapper.java`
