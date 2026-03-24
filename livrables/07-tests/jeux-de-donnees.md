# Jeux de données de test — DocuPost

**Produit par** : @qa
**Date de création** : 2026-03-20
**Dernière mise à jour** : 2026-03-23 (US-003)

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

---

## Jeux de données US-003 : Filtrer et organiser les colis par zone géographique

### JDD-US003-01 : Tournée standard 3 zones (22 colis) — Scénarios SC1 et SC2

**Usage** : TC-057, TC-058, TC-059, TC-060, TC-061, TC-062, TC-063
**Profil** : test composant (React Native Testing Library — mock API)
**Contexte** : Tournée nominale Pierre Morel — données conformes au scénario SC1 de la US-003 (22 colis répartis en 3 zones, 20 restants à livrer).

```
Tournée :
  tourneeId    = tournee-003
  livreurId    = livreur-001
  date         = 2026-03-23
  statut       = DEMARREE
  resteALivrer = 20
  colisTotal   = 22
  colisTraites = 2
  estimationFin = null

Zone A — 8 colis (tous A_LIVRER) :
  zone-a-1 : 1 Rue Alpha, 69001 Lyon — Zone A — A_LIVRER
  zone-a-2 : 2 Rue Alpha, 69001 Lyon — Zone A — A_LIVRER
  zone-a-3 : 3 Rue Alpha, 69001 Lyon — Zone A — A_LIVRER
  zone-a-4 : 4 Rue Alpha, 69001 Lyon — Zone A — A_LIVRER
  zone-a-5 : 5 Rue Alpha, 69001 Lyon — Zone A — A_LIVRER
  zone-a-6 : 6 Rue Alpha, 69001 Lyon — Zone A — A_LIVRER
  zone-a-7 : 7 Rue Alpha, 69001 Lyon — Zone A — A_LIVRER
  zone-a-8 : 8 Rue Alpha, 69001 Lyon — Zone A — A_LIVRER

Zone B — 9 colis (tous A_LIVRER) :
  zone-b-1 : 1 Rue Beta, 69002 Lyon — Zone B — A_LIVRER
  zone-b-2 : 2 Rue Beta, 69002 Lyon — Zone B — A_LIVRER
  zone-b-3 : 3 Rue Beta, 69002 Lyon — Zone B — A_LIVRER
  zone-b-4 : 4 Rue Beta, 69002 Lyon — Zone B — A_LIVRER
  zone-b-5 : 5 Rue Beta, 69002 Lyon — Zone B — A_LIVRER
  zone-b-6 : 6 Rue Beta, 69002 Lyon — Zone B — A_LIVRER
  zone-b-7 : 7 Rue Beta, 69002 Lyon — Zone B — A_LIVRER
  zone-b-8 : 8 Rue Beta, 69002 Lyon — Zone B — A_LIVRER
  zone-b-9 : 9 Rue Beta, 69002 Lyon — Zone B — A_LIVRER

Zone C — 5 colis (2 LIVRE + 3 A_LIVRER) :
  zone-c-1 : 1 Rue Gamma, 69003 Lyon — Zone C — LIVRE
  zone-c-2 : 2 Rue Gamma, 69003 Lyon — Zone C — LIVRE
  zone-c-3 : 3 Rue Gamma, 69003 Lyon — Zone C — A_LIVRER
  zone-c-4 : 4 Rue Gamma, 69003 Lyon — Zone C — A_LIVRER
  zone-c-5 : 5 Rue Gamma, 69003 Lyon — Zone C — A_LIVRER
```

---

### JDD-US003-02 : Tournée Zone C entièrement traitée — Scénario SC3

**Usage** : TC-064
**Profil** : test composant (React Native Testing Library — mock API)
**Contexte** : Variante de JDD-US003-01 où tous les colis de Zone C sont LIVRE (resteALivrer = 17).

```
Tournée :
  tourneeId    = tournee-003
  livreurId    = livreur-001
  date         = 2026-03-23
  statut       = DEMARREE
  resteALivrer = 17
  colisTotal   = 22
  colisTraites = 5
  estimationFin = null

Zone A — 8 colis (inchangé depuis JDD-US003-01, tous A_LIVRER)
Zone B — 9 colis (inchangé depuis JDD-US003-01, tous A_LIVRER)

Zone C — 5 colis (tous LIVRE) :
  zone-c-1 : 1 Rue Gamma, 69003 Lyon — Zone C — LIVRE
  zone-c-2 : 2 Rue Gamma, 69003 Lyon — Zone C — LIVRE
  zone-c-3 : 3 Rue Gamma, 69003 Lyon — Zone C — LIVRE
  zone-c-4 : 4 Rue Gamma, 69003 Lyon — Zone C — LIVRE
  zone-c-5 : 5 Rue Gamma, 69003 Lyon — Zone C — LIVRE
```

**Résultat attendu (TC-064)** :
- Filtre Zone C : 5 colis visibles, 0 avec statut A_LIVRER.
- Bandeau : "Reste à livrer : 17 / 22" (inchangé par le filtre).

---

### JDD-US003-03 : Tournée sans zones définies — Edge case

**Usage** : TC-065
**Profil** : test composant (React Native Testing Library — mock API)
**Contexte** : Tournée dont tous les colis ont `zoneGeographique = null`. Permet de valider que la barre d'onglets est absente.

```
Tournée :
  tourneeId    = tournee-003
  livreurId    = livreur-001
  date         = 2026-03-23
  statut       = DEMARREE
  resteALivrer = 20
  colisTotal   = 22
  colisTraites = 2
  estimationFin = null

Colis (22 colis) :
  Tous les colis sont identiques à JDD-US003-01 mais avec zoneGeographique = null
  dans leur adresseLivraison.
```

**Résultat attendu (TC-065)** :
- `onglets-zones` absent du rendu (queryByTestId retourne null).
- `flatlist-colis` présent et affiche tous les 22 colis.
- Aucune erreur React levée.

---

### JDD-US003-04 : DevDataSeeder — 5 colis 3 zones (tests manuels + E2E)

**Usage** : TC-070, TC-071, TC-072, TC-073 (E2E), tests manuels poste de commande
**Profil** : dev (DevDataSeeder Spring Boot — profil `dev`)
**Contexte** : Données injectées automatiquement au démarrage du backend en profil dev. Représentatif d'une petite tournée pour valider visuellement les fonctionnalités.

```
Tournée :
  id           = (généré par le DevDataSeeder)
  livreurId    = LIV-001
  date         = AUJOURD'HUI
  statut       = PLANIFIEE

Colis :
  colis-dev-001 :
    adresse       = 12 Rue du Port, 69003 Lyon
    zone          = Zone A
    statut        = A_LIVRER
    destinataire  = M. Bertrand

  colis-dev-002 :
    adresse       = 4 Allée des Roses, 69006 Lyon
    zone          = Zone B
    statut        = A_LIVRER
    destinataire  = Mme Faure

  colis-dev-003 :
    adresse       = 8 Cours Gambetta, 69007 Lyon
    zone          = Zone B
    statut        = A_LIVRER
    destinataire  = M. Rousseau

  colis-dev-004 :
    adresse       = 23 Avenue Jean Jaurès, 69007 Lyon
    zone          = Zone C
    statut        = LIVRE
    destinataire  = Mme Chen

  colis-dev-005 :
    adresse       = 7 Rue de la République, 69002 Lyon
    zone          = Zone A
    statut        = ECHEC
    destinataire  = M. Petit
```

**Répartition attendue** :
- Zone A : 2 colis (colis-001 A_LIVRER, colis-005 ECHEC)
- Zone B : 2 colis (colis-002 et colis-003 A_LIVRER)
- Zone C : 1 colis (colis-004 LIVRE)
- resteALivrer = 3 (A_LIVRER uniquement), colisTotal = 5

**URL de vérification** :
```
GET http://localhost:8080/api/tournees/today
```

---

### JDD-US003-05 : Logique pure — Données de test pour extraireZonesDisponibles

**Usage** : TC-046 à TC-056 (tests unitaires domain `filtreZone.domain.test.ts`)
**Profil** : test unitaire pur (pas de persistance, pas de React)
**Contexte** : Jeux de données en mémoire pour tester les fonctions pures du domaine.

```
Jeu A — 4 colis avec doublons et ordre non alphabétique :
  c1 : zoneGeographique = 'Zone C'
  c2 : zoneGeographique = 'Zone A'
  c3 : zoneGeographique = 'Zone B'
  c4 : zoneGeographique = 'Zone A'  ← doublon
  → extraireZonesDisponibles → ['Zone A', 'Zone B', 'Zone C']

Jeu B — colis avec zone null :
  c1 : zoneGeographique = 'Zone A'
  c2 : zoneGeographique = null
  c3 : zoneGeographique = 'Zone B'
  → extraireZonesDisponibles → ['Zone A', 'Zone B']

Jeu C — zones vides et espaces :
  c1 : zoneGeographique = 'Zone A'
  c2 : zoneGeographique = ''
  c3 : zoneGeographique = '   '
  → extraireZonesDisponibles → ['Zone A']

Jeu D — filtrerColisByZone ZONE_TOUS :
  5 colis (Zone A ×2, Zone B ×1, Zone C ×1, sans zone ×1)
  filtreZone = ZONE_TOUS
  → tous les 5 colis retournés (même référence)

Jeu E — filtrerColisByZone 'Zone Inexistante' :
  5 colis sans colis de 'Zone Inexistante'
  filtreZone = 'Zone Inexistante'
  → [] (liste vide, pas d'erreur)
```
