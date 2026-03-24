# Implémentation US-010 : Consulter la preuve d'une livraison pour traiter un litige

## Contexte

US-010 — BC-02 (Preuves de livraison), collocalisé dans `svc-tournee`.
Persona : Sophie Dubois (support / superviseur) qui consulte une preuve dans le cadre d'un litige.

Inputs :
- `/livrables/05-backlog/user-stories/` (contexte US)
- `/livrables/04-architecture-technique/architecture-applicative.md`

## Bounded Context et couche ciblée

- **BC** : BC-02 (Gestion des Preuves) — collocalisé dans svc-tournee
- **Aggregate(s) modifiés** : aucun (lecture pure, PreuveLivraison est immuable)
- **Domain Events émis** : aucun (query uniquement)

## Décisions d'implémentation

### Domain Layer
- Aucune modification — PreuveLivraison immuable déjà implémentée (US-008/009)
- `PreuveLivraisonRepository.findByColisId()` déjà disponible

### Application Layer
- `ConsulterPreuveLivraisonQuery` : record contenant un `ColisId`
- `ConsulterPreuveLivraisonHandler` : délègue à `PreuveLivraisonRepository.findByColisId()`, lève `PreuveNotFoundException` si absent
- `PreuveNotFoundException` : exception levée → HTTP 404

### Infrastructure Layer
- Aucune modification — `PreuveLivraisonRepositoryImpl.findByColisId()` déjà présente

### Interface Layer
- `PreuveController` : nouveau controller `@RequestMapping("/api/preuves")`
  - `GET /api/preuves/livraison/{colisId}` → `PreuveDetailDTO`
  - `@PreAuthorize("hasAnyRole('SUPERVISEUR', 'SUPPORT')")` → HTTP 403 pour ROLE_LIVREUR
- `PreuveDetailDTO` : DTO enrichi (vs `PreuveLivraisonDTO` existant qui ne retournait que l'id/type/horodatage)
  - Ajout : `coordonneesGps`, `aperçuSignature` (Base64), `urlPhoto`, `hashIntegrite`, `nomTiers`, `descriptionDepot`
  - `@JsonInclude(NON_NULL)` : champs conditionnels selon le type
- `SecurityConfig` : `@EnableMethodSecurity` ajouté pour activer `@PreAuthorize`
  - Règle `requestMatchers("/api/preuves/**").hasAnyRole("SUPERVISEUR", "SUPPORT")` (double protection)

### Frontend
- `ConsulterPreuvePage.tsx` : composant React dans `src/web/supervision/src/pages/`
  - Champ de recherche par colisId + bouton Rechercher
  - Affichage conditionnel selon le type de preuve (signature img, url photo, nom tiers, description dépôt)
  - Gestion erreurs 403 / 404 / erreur réseau
  - Prop `fetchFn` injectable pour les tests

### Erreurs / invariants préservés
- HTTP 403 : rôle LIVREUR interdit (`@PreAuthorize` + `requestMatchers`)
- HTTP 404 : aucune preuve pour ce colisId (`PreuveNotFoundException`)
- Immuabilité : aucune écriture possible sur les preuves via cet endpoint

## Tests

### Backend (svc-tournee)
| Fichier | Tests | Résultat |
|---------|-------|----------|
| `ConsulterPreuveLivraisonHandlerTest.java` | 4 tests handler (SIGNATURE, PHOTO mode dégradé, NotFoundException, TIERS_IDENTIFIE) | Verts |
| `PreuveControllerTest.java` | 4 tests WebMvcTest (200 SUPERVISEUR, 200 SUPPORT, 404, 403 LIVREUR) | Verts |

Total backend après US-010 : **105/105 tests verts**

### Frontend (supervision-web)
| Fichier | Tests | Résultat |
|---------|-------|----------|
| `ConsulterPreuvePage.test.tsx` | 7 tests Jest (rendu initial, validation vide, SIGNATURE, 404, 403, PHOTO, TIERS_IDENTIFIE) | Verts |

Total frontend supervision : **7/7 tests verts**

## Commandes de lancement

```bash
# Backend (svc-tournee)
cd src/backend/svc-tournee
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn spring-boot:run -Dspring-boot.run.profiles=dev

# URL de test (rôle SUPERVISEUR ou SUPPORT requis)
# GET http://localhost:8081/api/preuves/livraison/{colisId}

# Tests backend
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn test

# Tests frontend
cd src/web/supervision
npm test -- --watchAll=false
```
