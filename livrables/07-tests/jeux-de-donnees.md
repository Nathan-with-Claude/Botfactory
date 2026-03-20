# Jeux de données de test — DocuPost

**Produit par** : @qa
**Date de création** : 2026-03-20
**Dernière mise à jour** : 2026-03-20 (US-001)

> Ce fichier centralise les jeux de données de test pour tous les scénarios QA.
> Il est alimenté au fur et à mesure des User Stories traitées.
> Les données sont exprimées en termes métier (Ubiquitous Language).

---

## Conventions

- Les identifiants techniques sont stables entre les sessions de test (pas de génération UUID aléatoire).
- La date `AUJOURD'HUI` désigne la date d'exécution du test (dynamique).
- Les contraintes de colis utilisent les valeurs du `TypeContrainte` défini dans le domaine.
- Le `StatutColis` initial normalisé est toujours `A_LIVRER` pour un colis nouvellement assigné.

---

## Jeux de données US-001 : Consulter la liste des colis assignés à ma tournée

### JDD-001 : Tournée standard Pierre Morel (5 colis)

**Usage** : TC-006, TC-010, TC-013, TC-014, TC-016, TC-019
**Profil** : dev (DevDataSeeder)
**Contexte** : Tournée nominale du livreur Pierre Morel pour valider le chargement normal.

```
Tournée :
  id           = TRN-2026-0001
  livreurId    = livreur-001
  date         = AUJOURD'HUI
  statut       = PLANIFIEE (avant appel demarrer()) → DEMARREE (après)

Colis 1 :
  id           = COL-001
  adresse      = "12 rue Victor Hugo, 75011 Paris"
  destinataire = "M. Dupont"
  statut       = A_LIVRER
  contraintes  = []
  estHoraire   = false

Colis 2 :
  id           = COL-002
  adresse      = "45 avenue Gambetta, 75020 Paris"
  destinataire = "Mme Martin"
  statut       = A_LIVRER
  contraintes  = [{ typeContrainte: "AVANT_14H00", estHoraire: true }]

Colis 3 :
  id           = COL-003
  adresse      = "8 rue de la Paix, 75002 Paris"
  destinataire = "Sté Renault SA"
  statut       = A_LIVRER
  contraintes  = [{ typeContrainte: "FRAGILE", estHoraire: false }]

Colis 4 :
  id           = COL-004
  adresse      = "67 boulevard Voltaire, 75011 Paris"
  destinataire = "M. Bernard"
  statut       = A_LIVRER
  contraintes  = []

Colis 5 :
  id           = COL-005
  adresse      = "3 place de la République, 75003 Paris"
  destinataire = "Mme Leroy"
  statut       = A_LIVRER
  contraintes  = [{ typeContrainte: "DOCUMENT_SENSIBLE", estHoraire: false }]
```

**Résultat attendu** :
- HTTP 200 avec `avancement.colisTotal=5`, `avancement.colisTraites=0`.
- Bandeau mobile : "Reste à livrer : 5 / 5".
- `estimationFin` == null (limitation MVP US-001).

---

### JDD-002 : Tournée vide — livreur sans tournée assignée

**Usage** : TC-007, TC-011, TC-017
**Profil** : dev / test
**Contexte** : Aucune tournée n'existe pour le livreur ciblé à la date du test.

```
Livreur      : livreur-999 (ou tout livreurId sans entrée en base pour AUJOURD'HUI)
Tournée      : aucune entrée en base pour (livreur-999, AUJOURD'HUI)
```

**Résultat attendu** :
- API : HTTP 404 Not Found + message métier.
- Application Layer : `TourneeNotFoundException` levée.
- Mobile : message "Aucun colis assigné pour aujourd'hui. Contactez votre superviseur."

---

### JDD-003 : Tournée de charge — 120 colis (test de performance)

**Usage** : TC-024
**Profil** : recette / charge
**Contexte** : Validation NFR ENF-PERF-006 — réponse API < 500ms (p95) pour un livreur à pleine volumétrie.

```
Tournée :
  id           = TRN-PERF-001
  livreurId    = livreur-perf-001
  date         = AUJOURD'HUI
  statut       = PLANIFIEE

Colis :
  Quantité     = 120
  Statut       = A_LIVRER (tous)
  Adresses     = Paris 11e (séquentielles : "1 rue de la Roquette, 75011 Paris" à "120 rue de la Roquette, 75011 Paris")
  Contraintes  = aucune (pour simplifier le test de charge)
  Destinataires = "Destinataire 001" à "Destinataire 120"
```

**Script de génération** : `DevDataSeeder` à adapter, ou script SQL de génération en masse.

**Résultat attendu** :
- p95 du temps de réponse < 500ms (ENF-PERF-006).
- p99 < 1 000ms.
- Aucune requête en timeout (> 5 000ms).
- Pas de `OutOfMemoryError` après 100 appels consécutifs.

---

### JDD-004 : Colis avec contraintes multiples

**Usage** : TC-020
**Profil** : dev / test
**Contexte** : Validation que l'API et le mobile affichent toutes les contraintes d'un colis multi-contraint.

```
Tournée :
  id           = TRN-2026-0002
  livreurId    = livreur-001
  date         = AUJOURD'HUI

Colis unique :
  id           = COL-MULTI-001
  adresse      = "22 rue du Faubourg Saint-Antoine, 75012 Paris"
  destinataire = "Cabinet Médical Dr. Moreau"
  statut       = A_LIVRER
  contraintes  = [
    { typeContrainte: "AVANT_9H00",          estHoraire: true  },
    { typeContrainte: "FRAGILE",              estHoraire: false },
    { typeContrainte: "DOCUMENT_SENSIBLE",    estHoraire: false }
  ]
```

**Résultat attendu** :
- API : `ColisDTO.contraintes` contient exactement 3 éléments.
- Mobile : 3 badges de contrainte affichés dans `ColisItem`.
- La contrainte `AVANT_9H00` est mise en évidence (style alerte).

---

### JDD-005 : Tournée avec 1 seul colis (cas limite domaine)

**Usage** : TC-021
**Profil** : dev / test
**Contexte** : Validation de l'invariant "au moins 1 colis" — la borne inférieure exacte.

```
Tournée :
  id           = TRN-2026-0003
  livreurId    = livreur-001
  date         = AUJOURD'HUI

Colis unique :
  id           = COL-SEUL-001
  adresse      = "1 place du Général de Gaulle, 75008 Paris"
  destinataire = "M. Unique"
  statut       = A_LIVRER
  contraintes  = []
```

**Résultat attendu** :
- `demarrer()` ne lève aucune exception.
- `TourneeDemarree` est émis.
- `calculerAvancement()` retourne `colisTotal=1`, `colisTraites=0`.

---

### JDD-006 : Tournée avec colis traités (LIVRE + ECHEC)

**Usage** : TC-005
**Profil** : test unitaire (domaine pur — pas de persistance)
**Contexte** : Validation du calcul d'avancement avec des statuts variés.

```
Tournée (en mémoire) :
  id           = TRN-TEST-AVANCEMENT
  livreurId    = livreur-001
  date         = AUJOURD'HUI

Colis :
  COL-A : statut = LIVRE
  COL-B : statut = LIVRE
  COL-C : statut = ECHEC
  COL-D : statut = A_LIVRER
  COL-E : statut = A_LIVRER
```

**Résultat attendu** :
- `calculerAvancement().colisTraites()` == 3 (COL-A + COL-B + COL-C).
- `calculerAvancement().colisTotal()` == 5.
