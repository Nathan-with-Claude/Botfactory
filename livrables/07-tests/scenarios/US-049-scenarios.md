# Scénarios de tests US-049 : 6 profils livreurs de développement cohérents

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-049 — Aligner les 6 profils livreurs de développement entre mobile, svc-supervision et svc-tournee
**Bounded Context** : BC-06 (Identité et Accès) / BC-07 (Planification)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-049-01 | 6 boutons livreur dans le picker mobile | L1 | Passé |
| TC-049-02 | livreur-006 Lucas Petit présent dans DEV_LIVREURS | L1 | Passé |
| TC-049-03 | Seeder svc-supervision couvre 6 livreurs | L2 | Passé |
| TC-049-04 | livreurs-005 et 006 sans tournée dans svc-tournee | L2 | Passé |
| TC-049-05 | Picker affectation W-05 propose 7 options (6 livreurs + vide) | L1 | Passé |
| TC-049-06 | Seeders inactifs en profil prod | L2 | Passé |

---

### TC-049-01 : 6 boutons livreur dans le picker mobile

**Niveau** : L1 | **Type** : Fonctionnel (SC1)

```gherkin
Given l'application mobile est lancée avec __DEV__=true
When ConnexionScreen est affiché
Then le bloc section-dev-mode contient exactement 6 boutons livreurs
And les IDs sont livreur-001 à livreur-006
And les noms sont : Pierre Martin, Paul Dupont, Marie Lambert, Jean Moreau, Sophie Bernard, Lucas Petit
```

**Statut** : Passé

---

### TC-049-02 : livreur-006 Lucas Petit présent dans DEV_LIVREURS

**Niveau** : L1 | **Type** : Fonctionnel (SC1)

```gherkin
Given DEV_LIVREURS est importé
When on vérifie le tableau
Then DEV_LIVREURS.length = 6
And DEV_LIVREURS[5] = { id: 'livreur-006', prenom: 'Lucas', nom: 'Petit' }
```

**Statut** : Passé

---

### TC-049-03 : Seeder svc-supervision couvre 6 livreurs

**Niveau** : L2 | **Type** : Fonctionnel (SC2)

```bash
curl -s "http://localhost:8082/api/supervision/vue-tournees/livreur-005"
curl -s "http://localhost:8082/api/supervision/vue-tournees/livreur-006"
```

```gherkin
Given svc-supervision démarré en profil dev
When DevDataSeeder s'exécute
Then VueTournee pour livreur-005 (Sophie Bernard, Lyon 4e) est créée
And VueTournee pour livreur-006 (Lucas Petit, Lyon 7e) est créée
And TourneePlanifiee T-205 (livreur-005, AFFECTEE) et T-206 (livreur-006, AFFECTEE) existent
```

**Statut** : Passé

---

### TC-049-04 : livreurs-005 et 006 sans tournée dans svc-tournee

**Niveau** : L2 | **Type** : Invariant (SC3/SC5)

```gherkin
Given svc-tournee démarré en profil dev
When DevDataSeeder s'exécute
Then aucune Tournee n'existe pour livreur-005 ni livreur-006
And un livreur 005 ou 006 connecté à l'app mobile voit le message "Aucune tournée n'a encore été commandée"
```

**Statut** : Passé

---

### TC-049-05 : Picker affectation W-05 avec 6 livreurs

**Niveau** : L1 | **Type** : Fonctionnel (SC4)

```gherkin
Given DetailTourneePlanifieePage.tsx avec livreursMock aligné sur 6 livreurs canoniques
When le superviseur ouvre l'onglet Affectation d'une TourneePlanifiee
Then le menu déroulant contient exactement 7 options (1 option vide + 6 livreurs)
And les IDs canoniques livreur-001..006 sont présents
And les noms correspondent : Pierre Martin, Paul Dupont, Marie Lambert, Jean Moreau, Sophie Bernard, Lucas Petit
```

**Statut** : Passé

---

### TC-049-06 : Seeders inactifs en profil prod

**Niveau** : L2 | **Type** : Sécurité (SC6)

```gherkin
Given svc-tournee et svc-supervision démarrés en profil prod
When on vérifie la présence de données de test
Then aucun DevDataSeeder n'est instancié (@Profile("dev"))
And aucune donnée Pierre Martin, Paul Dupont... n'est présente en base
```

**Statut** : Passé (vérifié par `@Profile("dev")` sur les deux seeders)
