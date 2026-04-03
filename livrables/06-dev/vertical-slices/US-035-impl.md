# Implémentation US-035 : Recherche multi-critères dans le tableau de bord supervision

## Contexte

**User Story** : `/livrables/05-backlog/user-stories/US-035-recherche-multi-criteres-tableau-de-bord.md`

En tant que responsable logistique, je veux pouvoir rechercher une tournée dans le tableau de bord par nom de livreur, par code TMS ou par zone géographique, afin de retrouver rapidement une tournée spécifique sans avoir à parcourir l'ensemble du tableau.

**Feedback terrain source** : Laurent Renaud (2026-03-30) — la restriction au seul critère "livreur" devient pénalisante au-delà de 15 tournées simultanées.

**Dépendances** : US-011 (TableauDeBordPage, VueTournee Read Model) — prérequis satisfait.

---

## Bounded Context et couche ciblée

- **BC** : BC-03 Supervision et Pilotage (Core Domain)
- **Aggregate(s) modifiés** : VueTournee (Read Model — lecture seule, pas d'Aggregate modifié)
- **Domain Events émis** : aucun (opération de lecture pure)

---

## Décisions d'implémentation

### Domain Layer

**VueTournee** (`src/backend/svc-supervision/.../domain/model/VueTournee.java`) :
- Deux nouveaux champs ajoutés : `codeTMS` (String) et `zone` (String), tous deux optionnels (nullable).
- Nouveau constructeur à 8 paramètres. Le constructeur existant à 6 paramètres est conservé et délègue au constructeur complet avec `codeTMS=null, zone=null` — rétrocompatibilité totale, 0 test existant modifié.
- Deux getters ajoutés : `getCodeTMS()`, `getZone()`.

**Décision** : les champs `codeTMS` et `zone` sont nullable au niveau domaine. La recherche multi-critères est une opération de lecture sur le Read Model — elle n'émet pas de Domain Event et ne modifie aucun Aggregate. Conforme à l'invariant de la US : "opération de consultation (lecture seule)".

### Infrastructure Layer

**VueTourneeEntity** (`infrastructure/persistence/VueTourneeEntity.java`) :
- Deux nouvelles colonnes JPA : `code_tms` (VARCHAR nullable) et `zone` (VARCHAR nullable).
- Constructeur à 7 paramètres (existant) conservé — délègue au constructeur à 9 paramètres.
- Getters/setters ajoutés.

**VueTourneeRepositoryImpl** :
- `toDomain()` enrichi pour propager `codeTMS` et `zone` depuis l'entité vers le domaine.
- `save()` enrichi pour propager `codeTMS` et `zone` dans les deux sens (création + mise à jour).

**DevDataSeeder** :
- Les 3 tournées de supervision dev reçoivent `codeTMS` et `zone` :
  - tournee-sup-001 : T-201, Lyon 3e
  - tournee-sup-002 : T-202, Villeurbanne
  - tournee-sup-003 : T-203, Lyon 3e

### Interface Layer (backend)

**VueTourneeDTO** (`interfaces/dto/VueTourneeDTO.java`) :
- Record étendu avec deux champs supplémentaires : `codeTMS` (String) et `zone` (String).
- `from(VueTournee)` enrichi pour mapper ces champs depuis le domaine.
- Les valeurs null sont sérialisées en JSON comme propriétés absentes (comportement Jackson par défaut avec `@JsonInclude(NON_NULL)` implicite via `doesNotExist()` dans le test).

### Frontend (React / TypeScript)

**VueTourneeDTO** (interface TypeScript dans `TableauDeBordPage.tsx`) :
- Deux champs optionnels ajoutés : `codeTMS?: string` et `zone?: string`.

**Logique de filtrage** (fonction pure `correspondRecherche`) :
- Union (OU logique) sur `livreurNom`, `codeTMS`, `zone` — correspondance partielle, insensible à la casse.
- Intersection (ET logique) avec le filtre de statut existant — appliqué en chaîne de `.filter()`.
- Implémentée directement dans le composant (pas de hook séparé — logique trop simple pour justifier une extraction).

**Champ de recherche** :
- `data-testid="champ-recherche"` — input texte, mise à jour en temps réel via `onChange`.
- Pas de bouton "Rechercher" — comportement réactif immédiat.
- Placeholder : `"Livreur, numéro de tournée (ex: T-205), zone (ex: Villeurbanne)..."` (libellé mis à jour par US-038 — ancien libellé : "code TMS").

**Lien "Effacer la recherche"** :
- Affiché uniquement si `termeRecherche.trim().length > 0`.
- `data-testid="lien-effacer-recherche"` — remet `termeRecherche` à `""`.

**Message aucun résultat** :
- Distinct du message "Aucune tournée correspondant au filtre" (filtre de statut).
- `data-testid="message-aucun-resultat-recherche"` affiché si `rechercheActive && tourneesFiltrees.length === 0`.

**Bandeau résumé** : non affecté par la recherche — les compteurs `actives`, `aRisque`, `cloturees` proviennent de `tableau` (données brutes du serveur), pas de `tourneesFiltrees`.

### Erreurs / invariants préservés

- La recherche vide (`""` ou espaces seuls) ne filtre rien — toutes les tournées correspondent.
- L'ordre de priorité A_RISQUE > EN_COURS > CLOTUREE est maintenu après filtrage.
- L'alerte sonore US-013 n'est pas affectée — elle dépend de `tableau.aRisque`, pas de `tourneesFiltrees`.
- Aucune régression sur les 17 tests Jest existants (US-011, US-013, S1–S5).

---

## Tests

### Tests unitaires Jest (frontend) — TDD

**Fichier** : `src/web/supervision/src/__tests__/TableauDeBordPage.test.tsx`

Données de test enrichies avec `codeTMS` et `zone` sur les 3 tournées mock.

| Test | Scénario US-035 |
|------|----------------|
| SC1 — recherche par code TMS exact | T-202 → seule t-002 visible |
| SC1 — recherche partielle insensible à la casse | "t-20" → 3 tournées (T-201, T-202, T-203) |
| SC2 — recherche par zone (correspondance partielle) | "Villeurb" → seule t-002 visible |
| SC3 — recherche par nom livreur (comportement existant) | "Marie" → seule t-002 visible |
| SC4 — intersection avec filtre statut | filtre A_RISQUE + "Lyon 3" → seule t-003 visible |
| SC5 — aucun résultat → message + lien effacer | "XYZ999" → message-aucun-resultat-recherche |
| SC5 — bandeau résumé non affecté | compteurs inchangés après recherche |
| SC6 — effacement restaure toutes les tournées | clic lien-effacer-recherche → 3 lignes + input vide |
| Pas de bouton Rechercher | btn-rechercher absent du DOM |

**Résultat** : 26/26 tests verts (17 tests US-011/013 + 9 tests US-035). 0 régression.
Suite globale : **200/200** tests verts (19 suites).

### Tests @WebMvcTest (backend) — TDD

**Fichier** : `src/backend/svc-supervision/src/test/java/com/docapost/supervision/interfaces/SupervisionControllerTest.java`

| Test | Assertion |
|------|----------|
| codeTMS et zone exposés dans le JSON | `$.tournees[0].codeTMS == "T-201"`, `$.tournees[0].zone == "Lyon 3e"` |
| Rétrocompatibilité — null si non renseigné | `$.tournees[0].codeTMS` doesNotExist() |

Constructeur helper `tableauAvecTroisTournees()` enrichi avec codeTMS et zone.

---

## Notes techniques

- **Filtrage côté client** : la recherche multi-critères est implémentée côté frontend sur les données déjà chargées. Aucun endpoint backend modifié — le payload retourné par `GET /api/supervision/tableau-de-bord` contient déjà `codeTMS` et `zone` depuis ce vertical slice.
- **Pas de requête backend pour la recherche** : cohérent avec la nature Read Model du tableau de bord et le fonctionnement WebSocket déjà en place (les données sont poussées, pas paginées).
- **H2 DDL auto** : les colonnes `code_tms` et `zone` sont créées automatiquement en dev par Hibernate `ddl-auto: create-drop`. Aucune migration Flyway nécessaire pour le profil dev.
