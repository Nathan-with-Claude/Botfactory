# Implémentation US-003 : Filtrer et organiser mes colis par zone géographique

## Contexte

**User Story** : En tant que Pierre Morel (livreur terrain), je veux filtrer la liste de mes colis par zone géographique en appuyant sur un onglet, afin d'organiser mes arrêts par secteur et réduire mes temps de déplacement sans outil externe.

**Sprint** : Sprint 1
**Complexité** : S (3 points)
**Priorité** : Must Have
**BC** : BC-01 Orchestration de Tournée

**Liens** :
- US : /livrables/05-backlog/user-stories/US-003-filtrer-colis-par-zone.md
- Wireframe : /livrables/02-ux/wireframes.md#écran-m-02--liste-des-colis-de-la-tournée
- US précédentes : US-001 et US-002 (impl : /livrables/06-dev/vertical-slices/)

---

## Bounded Context et couche ciblée

- **BC** : BC-01 Orchestration de Tournée
- **Aggregate(s) modifiés** : Tournée (aucune modification — lecture seule)
- **Domain Events émis** : aucun (invariant US-003 : le filtrage ne génère pas d'événement)
- **Couche principale** : Interface Layer (mobile) — logique de domaine pur extraite dans `domain/filtreZone.ts`

---

## Analyse des gaps US-002 → US-003

Le domaine et l'infrastructure étaient déjà en place :
- Value Object `Adresse` contient déjà `zoneGeographique` (string nullable)
- DTO `AdresseDTO` expose déjà `zoneGeographique`
- La liste des colis est déjà chargée depuis l'API au lancement de l'écran M-02

**Ce que US-003 a ajouté :**
1. Logique de domaine pur `filtreZone.ts` (extraction de zones + filtrage local)
2. Composant `FiltreZones` (barre d'onglets horizontale scrollable)
3. État `zoneActive` dans `ListeColisScreen` + dérivation `colisAffiches` par `useMemo`
4. Configuration Jest : exclusion du dossier `e2e/` de Jest (fix collatéral)
5. FlatList : ajout de `initialNumToRender=50` pour permettre le rendu de 22+ colis dans les tests

---

## Décisions d'implémentation

### Domain Layer (mobile)

**`/src/mobile/src/domain/filtreZone.ts`** (nouveau) :
- `ZONE_TOUS = 'TOUS'` : constante du filtre "sans restriction"
- `extraireZonesDisponibles(colis: ColisDTO[]): string[]` : extrait les zones distinctes et triées alphabétiquement, exclut les zones null/vides
- `filtrerColisByZone(colis, filtreZone): ColisDTO[]` : filtre local pur, retourne les mêmes références (pas de copie)
- Invariant DDD : fonctions pures, sans état, sans effets de bord, sans appel réseau

**Pourquoi dans `domain/` et pas directement dans le composant ?**
La logique d'extraction et de filtrage reflète une règle métier du domaine ("un colis appartient à exactement une zone géographique"). La placer dans `domain/` permet de la tester indépendamment de React et la rend réutilisable (ex. futur écran superviseur).

### Interface Layer — Composant

**`/src/mobile/src/components/FiltreZones.tsx`** (nouveau) :
- Barre d'onglets horizontale scrollable (`ScrollView horizontal`)
- Onglet "Tous" toujours en premier, puis zones triées
- Props : `zones`, `zoneActive`, `onZoneChange`
- `accessibilityRole="tab"` + `accessibilityState={{ selected }}` pour l'accessibilité et les tests
- `testID="onglet-{zone}"` pour les tests automatisés

**`/src/mobile/src/screens/ListeColisScreen.tsx`** (modifié) :
- Nouvel état : `zoneActive: FiltreZone` (initialisé à `ZONE_TOUS`)
- `zonesDisponibles` calculé par `useMemo` depuis les colis de la tournée
- `colisAffiches` calculé par `useMemo` depuis `filtrerColisByZone`
- La FlatList consomme `colisAffiches` (vue filtrée) au lieu de `tournee.colis`
- Le bandeau "Reste à livrer" lit toujours `tournee.resteALivrer` et `tournee.colisTotal` (total global, invariant US-003)
- La barre d'onglets `FiltreZones` est affichée uniquement si `zonesDisponibles.length > 0`

### Erreurs / invariants préservés

| Invariant | Vérification |
|---|---|
| Le filtrage ne modifie pas le StatutColis | `filtrerColisByZone` retourne des références sans mutation |
| Aucun Domain Event n'est émis lors du filtrage | Pas d'appel API, pas de dispatch d'événement |
| L'onglet "Tous" est actif par défaut | `useState<FiltreZone>(ZONE_TOUS)` |
| "Reste à livrer" = total tournée, pas zone filtrée | `tournee.resteALivrer` est lu depuis le DTO (inchangé) |
| Le filtrage est instantané sans rechargement | `useMemo` réactif sur `zoneActive` — aucun effet de bord |
| Un colis sans zone n'apparaît pas dans les onglets | `extraireZonesDisponibles` exclut null/vide |

---

## Tests

### Tests de domaine (unitaires purs)
- **Fichier** : `/src/mobile/src/__tests__/filtreZone.domain.test.ts`
- 12 tests — `extraireZonesDisponibles` (6 tests) + `filtrerColisByZone` (6 tests)
- Indépendants de React — testent la logique métier pure
- **Résultat** : 12/12 verts

### Tests de composant (React Native Testing Library)
- **Fichier** : `/src/mobile/src/__tests__/FiltreZone.test.tsx`
- 9 tests couvrant les 3 scénarios Gherkin de l'US-003 :
  - SC1 : filtrage par zone (8 colis Zone A visibles, bandeau global préservé, pas d'appel API)
  - SC2 : retour à "Tous" (22 colis visibles, statuts terminaux préservés)
  - SC3 : zone sans colis restants (colis avec statuts terminaux visibles)
  - Bonus : onglet "Tous" actif par défaut, pas d'onglets si aucune zone définie
- **Résultat** : 9/9 verts

### Régression US-001 + US-002
- **Fichier** : `/src/mobile/src/__tests__/ListeColisScreen.test.tsx`
- 13/13 tests verts après les modifications de `ListeColisScreen`

### Backend (non modifié)
- 23/23 tests Spring Boot verts (aucune modification backend pour US-003)

**Total** : 34/34 tests Jest mobiles verts + 23/23 tests Spring Boot verts

---

## Poste de commande tests manuels

### Lancer l'application en local

**1. Backend :**
```bash
# Depuis le répertoire src/backend/svc-tournee/
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" \
  mvn spring-boot:run -Dspring-boot.run.profiles=dev
# URL backend : http://localhost:8080
# Profil "dev" active MockJwtAuthFilter + DevDataSeeder (5 colis, 3 zones)
```

**2. Mobile (Expo) :**
```bash
cd src/mobile
npm install      # si première fois
npm start        # Expo DevTools
# Android : appuyer sur "a" pour lancer l'émulateur Android
# Ou scanner le QR code avec Expo Go
```

### Données de test (DevDataSeeder)
La tournée de test contient 5 colis répartis en 3 zones :

| Colis | Zone | Statut initial | Adresse |
|---|---|---|---|
| colis-dev-001 | Zone A | A_LIVRER | 12 Rue du Port, 69003 Lyon |
| colis-dev-002 | Zone B | A_LIVRER | 4 Allée des Roses, 69006 Lyon |
| colis-dev-003 | Zone B | A_LIVRER | 8 Cours Gambetta, 69007 Lyon |
| colis-dev-004 | Zone C | LIVRE | 23 Avenue Jean Jaurès, 69007 Lyon |
| colis-dev-005 | Zone A | ECHEC | 7 Rue de la République, 69002 Lyon |

### Scénarios à vérifier manuellement

**SC1 — Filtrage par zone :**
1. L'écran M-02 affiche 3 onglets (Zone A, Zone B, Zone C) + "Tous"
2. L'onglet "Tous" est actif par défaut — 5 colis visibles
3. Appuyer sur "Zone A" → 2 colis visibles (colis-001 et colis-005)
4. Le bandeau "Reste à livrer : 3 / 5" est inchangé (total tournée, pas du filtre)
5. Appuyer sur "Zone B" → 2 colis visibles (colis-002 et colis-003)

**SC2 — Retour à la vue complète :**
1. Depuis Zone A active, appuyer sur "Tous"
2. Les 5 colis sont à nouveau visibles avec leurs statuts corrects

**SC3 — Zone avec tous les colis traités :**
1. Appuyer sur "Zone C"
2. 1 seul colis visible (colis-004) avec statut "Livré" (grisé)
3. Aucun colis "A livrer" dans cette vue

### URLs de vérification directe (API backend)
```
GET http://localhost:8080/api/tournees/today
Authorization: Bearer (géré automatiquement par MockJwtAuthFilter en profil dev)
```
Vérifier le champ `adresseLivraison.zoneGeographique` dans chaque colis du JSON retourné.
