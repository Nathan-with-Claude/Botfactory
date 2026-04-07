# Spécification Technique US-066 — Page état des livreurs (W-08)

> Document produit par @architecte-technique — 2026-04-06
> BC : BC-07 (Planification de Tournée), extension de svc-supervision
> Service cible : `svc-supervision` (port 8082)
> US de référence : /livrables/05-backlog/user-stories/US-066-page-etat-livreurs.md

---

## 1. Décisions d'architecture (tranché par @architecte-metier)

| Décision | Valeur retenue | Justification |
|----------|---------------|---------------|
| Source de vérité | BC-07 uniquement — `TourneePlanifieeJpaRepository` | Évite la double source BC-03 + BC-07 |
| Stratégie MVP | Agrégation à la volée (no read model persisté) | 6 livreurs, requête simple, cohérence immédiate |
| Référentiel livreurs | Bean Spring `LivreurReferentiel` (hardcodé en `dev`, substitutable) | BC-06/SSO non requis pour le MVP |
| EtatJournalierLivreur | Value Object calculé, jamais stocké | Conforme à l'Ubiquitous Language v1.2 |
| Transport temps réel | WebSocket STOMP existant `/topic/livreurs/etat` | Réutilise l'infrastructure US-057 |

---

## 2. Règle de dérivation de EtatJournalierLivreur

Pour chaque livreur du `LivreurReferentiel`, chercher dans `TourneePlanifieeJpaRepository`
la première `TourneePlanifiee` satisfaisant : `date == dateRequete AND livreurId == livreurId`.

```
si aucune TourneePlanifiee trouvée avec ce livreurId pour la date
    → EtatJournalierLivreur = SANS_TOURNEE

si TourneePlanifiee.statut == AFFECTEE
    → EtatJournalierLivreur = AFFECTE_NON_LANCE

si TourneePlanifiee.statut == LANCEE
    → EtatJournalierLivreur = EN_COURS

Note : statut NON_AFFECTEE ne compte pas (tournée sans livreur affecté
n'appartient pas encore à un livreur).
```

---

## 3. Endpoint backend

### 3.1 Signature

```
GET /api/supervision/livreurs/etat-du-jour?date={date}
```

| Paramètre | Type | Obligatoire | Valeur par défaut | Description |
|-----------|------|-------------|-------------------|-------------|
| `date` | String ISO 8601 (`yyyy-MM-dd`) | Non | date du jour serveur (`LocalDate.now()`) | Date pour laquelle dériver l'état |

**Accès** : `ROLE_SUPERVISEUR` ou `ROLE_DSI` (alignement avec `/api/planification/**`)

### 3.2 Réponse JSON (HTTP 200)

```json
[
  {
    "livreurId": "livreur-pierre-martin",
    "nomComplet": "Pierre Martin",
    "etat": "AFFECTE_NON_LANCE",
    "tourneePlanifieeId": "tp-202",
    "codeTms": "T-202"
  },
  {
    "livreurId": "livreur-paul-dupont",
    "nomComplet": "Paul Dupont",
    "etat": "EN_COURS",
    "tourneePlanifieeId": "tp-204",
    "codeTms": "T-204"
  },
  {
    "livreurId": "livreur-jean-moreau",
    "nomComplet": "Jean Moreau",
    "etat": "SANS_TOURNEE",
    "tourneePlanifieeId": null,
    "codeTms": null
  }
]
```

Les champs `tourneePlanifieeId` et `codeTms` sont `null` quand `etat == SANS_TOURNEE`.

### 3.3 Codes d'erreur

| Code HTTP | Cas |
|-----------|-----|
| 200 | Succès — liste complète des livreurs |
| 400 | Paramètre `date` non parseable (format invalide) |
| 401 | Token JWT absent ou expiré |
| 403 | Rôle insuffisant (LIVREUR tente d'accéder) |

---

## 4. Classes et packages à créer dans svc-supervision

### 4.1 Domain Layer

**Package** : `com.docapost.supervision.domain.planification.model`

```java
// EtatJournalierLivreur.java — Value Object (enum)
// Package : com.docapost.supervision.domain.planification.model
public enum EtatJournalierLivreur {
    SANS_TOURNEE,
    AFFECTE_NON_LANCE,
    EN_COURS
}
```

```java
// VueLivreur.java — Read Model (Value Object immuable)
// Package : com.docapost.supervision.domain.planification.model
public record VueLivreur(
    String livreurId,
    String nomComplet,
    EtatJournalierLivreur etat,
    String tourneePlanifieeId,   // nullable
    String codeTms               // nullable
) {}
```

### 4.2 Domain Service (référentiel)

**Package** : `com.docapost.supervision.domain.planification.service`

```java
// LivreurReferentiel.java — Interface (port de lecture)
// Package : com.docapost.supervision.domain.planification.service
public interface LivreurReferentiel {
    /**
     * Retourne la liste complète des livreurs inscrits dans le système.
     * Stable sur la journée — appelé une fois par requête GET.
     */
    List<LivreurInfo> listerLivreurs();

    record LivreurInfo(String livreurId, String nomComplet) {}
}
```

### 4.3 Application Layer — Handler

**Package** : `com.docapost.supervision.application.planification`

```java
// ConsulterEtatLivreursHandler.java
// Package : com.docapost.supervision.application.planification
@Component
@RequiredArgsConstructor
public class ConsulterEtatLivreursHandler {

    private final LivreurReferentiel livreurReferentiel;
    private final TourneePlanifieeRepository tourneePlanifieeRepository;

    /**
     * Pour chaque livreur du référentiel, dérive son EtatJournalierLivreur
     * en interrogeant TourneePlanifieeRepository.
     *
     * @param date date du jour (LocalDate)
     * @return liste de VueLivreur, un élément par livreur du référentiel
     */
    public List<VueLivreur> handle(LocalDate date) {
        return livreurReferentiel.listerLivreurs().stream()
            .map(livreur -> deriveEtat(livreur, date))
            .toList();
    }

    private VueLivreur deriveEtat(LivreurReferentiel.LivreurInfo livreur, LocalDate date) {
        return tourneePlanifieeRepository
            .findByLivreurIdAndDate(livreur.livreurId(), date)
            .map(tp -> switch (tp.getStatut()) {
                case LANCEE    -> new VueLivreur(livreur.livreurId(), livreur.nomComplet(),
                                     EtatJournalierLivreur.EN_COURS,
                                     tp.getId(), tp.getCodeTms());
                case AFFECTEE  -> new VueLivreur(livreur.livreurId(), livreur.nomComplet(),
                                     EtatJournalierLivreur.AFFECTE_NON_LANCE,
                                     tp.getId(), tp.getCodeTms());
                default        -> sansToournee(livreur);
            })
            .orElseGet(() -> sansTournee(livreur));
    }

    private VueLivreur sansTournee(LivreurReferentiel.LivreurInfo livreur) {
        return new VueLivreur(livreur.livreurId(), livreur.nomComplet(),
                              EtatJournalierLivreur.SANS_TOURNEE, null, null);
    }
}
```

### 4.4 Infrastructure Layer — Implémentation LivreurReferentiel (profil dev)

**Package** : `com.docapost.supervision.infrastructure.dev`

```java
// DevLivreurReferentiel.java
// Package : com.docapost.supervision.infrastructure.dev
// Activation : @Profile("dev") uniquement
@Component
@Profile("dev")
public class DevLivreurReferentiel implements LivreurReferentiel {

    private static final List<LivreurInfo> REFERENTIEL = List.of(
        new LivreurInfo("livreur-pierre-martin",  "Pierre Martin"),
        new LivreurInfo("livreur-paul-dupont",    "Paul Dupont"),
        new LivreurInfo("livreur-marie-lambert",  "Marie Lambert"),
        new LivreurInfo("livreur-jean-moreau",    "Jean Moreau"),
        new LivreurInfo("livreur-sophie-bernard", "Sophie Bernard"),
        new LivreurInfo("livreur-lucas-petit",    "Lucas Petit")
    );

    @Override
    public List<LivreurInfo> listerLivreurs() {
        return REFERENTIEL;
    }
}
```

**Note prod** : Remplacer par `Bc06LivreurReferentiel implements LivreurReferentiel`
qui interroge BC-06/Keycloak via l'API d'administration. L'interface garantit
que le domaine ne dépend pas de Keycloak directement.

### 4.5 Extension TourneePlanifieeRepository

Dans `TourneePlanifieeRepository.java` (interface existante dans
`com.docapost.supervision.domain.planification.repository`), ajouter :

```java
/**
 * Retourne la TourneePlanifiee d'un livreur pour une date donnée.
 * Exclut les tournées au statut NON_AFFECTEE (pas encore assignées à un livreur).
 *
 * @param livreurId identifiant du livreur
 * @param date      date de la tournée
 * @return Optional vide si aucune tournée AFFECTEE ou LANCEE pour ce livreur à cette date
 */
Optional<TourneePlanifiee> findByLivreurIdAndDate(String livreurId, LocalDate date);
```

Dans `TourneePlanifieeJpaRepository.java` (interface Spring Data existante dans
`com.docapost.supervision.infrastructure.planification`), ajouter la requête JPQL :

```java
@Query("""
    SELECT tp FROM TourneePlanifieeEntity tp
    WHERE tp.livreurId = :livreurId
      AND tp.date = :date
      AND tp.statut IN ('AFFECTEE', 'LANCEE')
    ORDER BY tp.statut DESC
    LIMIT 1
    """)
Optional<TourneePlanifieeEntity> findAffecteeOrLanceeByLivreurIdAndDate(
    @Param("livreurId") String livreurId,
    @Param("date") LocalDate date
);
```

L'implémentation `TourneePlanifieeRepositoryImpl` délègue à cette requête.
`ORDER BY tp.statut DESC` place LANCEE avant AFFECTEE (tri alphabétique inverse)
— garantit qu'en cas de données incohérentes, EN_COURS prime sur AFFECTE_NON_LANCE.

### 4.6 Interface Layer — Controller

**Package** : `com.docapost.supervision.interfaces.rest`

```java
// LivreurEtatController.java
// Package : com.docapost.supervision.interfaces.rest
@RestController
@RequestMapping("/api/supervision/livreurs")
@RequiredArgsConstructor
public class LivreurEtatController {

    private final ConsulterEtatLivreursHandler handler;

    /**
     * GET /api/supervision/livreurs/etat-du-jour?date=yyyy-MM-dd
     * Retourne la liste de tous les livreurs du référentiel avec leur état du jour.
     * Accès : ROLE_SUPERVISEUR ou ROLE_DSI
     */
    @GetMapping("/etat-du-jour")
    @PreAuthorize("hasAnyRole('SUPERVISEUR', 'DSI')")
    public ResponseEntity<List<LivreurEtatDTO>> getEtatDuJour(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate dateEffective = (date != null) ? date : LocalDate.now();
        List<VueLivreur> vues = handler.handle(dateEffective);
        List<LivreurEtatDTO> dtos = vues.stream()
            .map(LivreurEtatDTO::fromDomain)
            .toList();
        return ResponseEntity.ok(dtos);
    }
}
```

**DTO** : `com.docapost.supervision.interfaces.dto`

```java
// LivreurEtatDTO.java
// Package : com.docapost.supervision.interfaces.dto
public record LivreurEtatDTO(
    String livreurId,
    String nomComplet,
    String etat,              // "SANS_TOURNEE" | "AFFECTE_NON_LANCE" | "EN_COURS"
    String tourneePlanifieeId,
    String codeTms
) {
    public static LivreurEtatDTO fromDomain(VueLivreur vue) {
        return new LivreurEtatDTO(
            vue.livreurId(),
            vue.nomComplet(),
            vue.etat().name(),
            vue.tourneePlanifieeId(),
            vue.codeTms()
        );
    }
}
```

---

## 5. Temps réel — Notification WebSocket STOMP

### 5.1 Canal cible

```
Topic STOMP : /topic/livreurs/etat
```

Ce topic est distinct de `/topic/tournees` (tableau de bord W-01).
Le client React souscrit à `/topic/livreurs/etat` lors du montage du composant W-08.

### 5.2 Payload WebSocket

```json
{
  "livreurId": "livreur-pierre-martin",
  "nomComplet": "Pierre Martin",
  "etat": "EN_COURS",
  "tourneePlanifieeId": "tp-202",
  "codeTms": "T-202"
}
```

Un message est émis pour **un seul livreur** (le livreur concerné par le changement),
pas la liste complète. Le frontend met à jour uniquement la ligne concernée.

### 5.3 Déclenchement côté serveur

Les handlers existants publient déjà les Domain Events BC-07 via
`ApplicationEventPublisher`. Ajouter un listener dédié dans la couche infrastructure :

**Package** : `com.docapost.supervision.infrastructure.websocket`

```java
// LivreurEtatWebSocketPublisher.java
// Package : com.docapost.supervision.infrastructure.websocket
@Component
@RequiredArgsConstructor
public class LivreurEtatWebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;
    private final ConsulterEtatLivreursHandler handler;

    /**
     * Écoute les Domain Events BC-07 qui modifient l'état d'un livreur.
     * Calcule le nouvel état et le pousse sur /topic/livreurs/etat.
     */
    @EventListener
    public void onAffectationEnregistree(AffectationEnregistree event) {
        pushEtatLivreur(event.getLivreurId(), event.getDate());
    }

    @EventListener
    public void onDesaffectationEnregistree(DesaffectationEnregistree event) {
        pushEtatLivreur(event.getLivreurId(), event.getDate());
    }

    @EventListener
    public void onTourneeLancee(TourneeLancee event) {
        pushEtatLivreur(event.getLivreurId(), event.getDate());
    }

    @EventListener
    public void onTourneeCloturee(TourneeCloturee event) {
        pushEtatLivreur(event.getLivreurId(), event.getDate());
    }

    private void pushEtatLivreur(String livreurId, LocalDate date) {
        // Recalcule l'état du livreur depuis la source de vérité BC-07
        handler.handle(date).stream()
            .filter(vue -> vue.livreurId().equals(livreurId))
            .findFirst()
            .map(LivreurEtatDTO::fromDomain)
            .ifPresent(dto ->
                messagingTemplate.convertAndSend("/topic/livreurs/etat", dto)
            );
    }
}
```

**Prérequis** : `SimpMessagingTemplate` est déjà disponible si `WebSocketConfig` est en place
(déclaré dans `spring-boot-starter-websocket`, dépendance existante dans `pom.xml`).

### 5.4 Vérification de WebSocketConfig

S'assurer que la classe `WebSocketConfig` (ou équivalent) configure bien STOMP :

```java
// Vérifier la présence de cette configuration dans svc-supervision
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }
}
```

Si `WebSocketConfig` n'est pas encore implémentée (écart identifié dans le rapport
as-built), la créer dans `com.docapost.supervision.infrastructure.websocket`.

---

## 6. Sécurité — Ajout dans SecurityConfig

Ajouter le pattern `/api/supervision/livreurs/**` dans `SecurityConfig.java`.
Ce pattern doit être inséré **avant** le catch-all `/api/supervision/**` (qui existe déjà).

```java
// Dans SecurityConfig.java, dans la chaîne authorizeHttpRequests :
.requestMatchers(HttpMethod.GET, "/api/supervision/livreurs/etat-du-jour")
    .hasAnyRole("SUPERVISEUR", "DSI")
// ou en utilisant le catch-all existant :
// /api/supervision/** → SUPERVISEUR, DSI couvre déjà ce pattern.
```

Le catch-all `/api/supervision/**` couvre déjà ce endpoint. Aucune modification
de `SecurityConfig` n'est requise si la règle existante s'applique correctement.
Vérifier l'ordre des règles au démarrage via les logs Spring Security.

---

## 7. Seed de données dev (DevDataSeeder)

Aligner le seed BC-07 avec l'Ubiquitous Language US-066 pour rendre les tests manuels
cohérents avec les scénarios Gherkin.

**État cible après seed (BC-07 — TourneePlanifiee) :**

| tourneePlanifieeId | codeTms | Statut | livreurId | Attendu sur W-08 |
|-------------------|---------|--------|-----------|-----------------|
| tp-201 | T-201 | AFFECTEE | livreur-pierre-martin | AFFECTE_NON_LANCE |
| tp-202 | T-202 | AFFECTEE | livreur-marie-lambert | AFFECTE_NON_LANCE |
| tp-204 | T-204 | LANCEE | livreur-paul-dupont | EN_COURS |
| tp-205 | T-205 | AFFECTEE | livreur-sophie-bernard | AFFECTE_NON_LANCE |
| tp-206 | T-206 | AFFECTEE | livreur-lucas-petit | AFFECTE_NON_LANCE |
| (aucune) | — | — | livreur-jean-moreau | SANS_TOURNEE |

**Attention** : dans le seed actuel (`DevDataSeeder`), tp-202 est affectée à `Pierre Martin`
et tp-201 est NON_AFFECTEE. Il faudra mettre à jour le seeder pour que tp-201 soit AFFECTEE
à `livreur-pierre-martin` et tp-202 à `livreur-marie-lambert`, conformément aux scénarios
Gherkin de US-066.

---

## 8. Frontend React — Intégration attendue

### 8.1 Appel REST initial

```typescript
// src/api/livreurEtatApi.ts
// Fichier à créer dans src/web/supervision/src/api/
export interface LivreurEtatDTO {
  livreurId: string;
  nomComplet: string;
  etat: 'SANS_TOURNEE' | 'AFFECTE_NON_LANCE' | 'EN_COURS';
  tourneePlanifieeId: string | null;
  codeTms: string | null;
}

export async function fetchEtatLivreurs(date?: string): Promise<LivreurEtatDTO[]> {
  const params = date ? `?date=${date}` : '';
  const response = await supervisionApi.get<LivreurEtatDTO[]>(
    `/api/supervision/livreurs/etat-du-jour${params}`
  );
  return response.data;
}
```

`supervisionApi` est l'instance Axios existante pointant sur `http://localhost:8082`
(cf. infrastructure-locale.md).

### 8.2 Souscription WebSocket STOMP

```typescript
// Dans le composant EtatLivreursPage.tsx (nouveau)
// src/web/supervision/src/pages/EtatLivreursPage.tsx

// Après chargement initial via fetchEtatLivreurs(),
// souscrire au topic STOMP pour les mises à jour unitaires :
client.subscribe('/topic/livreurs/etat', (message) => {
  const update: LivreurEtatDTO = JSON.parse(message.body);
  setLivreurs(prev =>
    prev.map(l => l.livreurId === update.livreurId ? update : l)
  );
});
```

### 8.3 Route React

Ajouter dans le routeur principal (`App.tsx` ou équivalent) :

```typescript
<Route path="/etat-livreurs" element={<EtatLivreursPage />} />
```

Et dans la `SideNavBar`, une nouvelle entrée :

```typescript
{ label: 'Livreurs', path: '/etat-livreurs', icon: <PeopleIcon /> }
```

---

## 9. Tests à produire (@developpeur + @qa)

### Tests unitaires domaine

| Classe | Cas à couvrir |
|--------|--------------|
| `ConsulterEtatLivreursHandlerTest` | 6 livreurs dont 1 SANS_TOURNEE, 4 AFFECTE_NON_LANCE, 1 EN_COURS — vérifier liste et états |
| `ConsulterEtatLivreursHandlerTest` | Livreur avec TourneePlanifiee NON_AFFECTEE → état SANS_TOURNEE |
| `ConsulterEtatLivreursHandlerTest` | Date demandée ≠ date du jour → scope filtré correctement |
| `DevLivreurReferentielTest` | Vérifier que les 6 livreurs sont présents avec les bons IDs |

### Tests contrôleur (@WebMvcTest)

| Cas | Attendu |
|-----|---------|
| GET /api/supervision/livreurs/etat-du-jour sans param date | HTTP 200, liste 6 éléments |
| GET avec date=2026-04-06 | HTTP 200, liste filtrée pour cette date |
| GET avec date invalide | HTTP 400 |
| GET avec rôle LIVREUR | HTTP 403 |
| GET sans token | HTTP 401 |

### Tests WebSocket (post-MVP ou manuelsl)

- Vérifier que `AffectationEnregistree` déclenche bien un message sur `/topic/livreurs/etat`
- Vérifier que `TourneeLancee` change le badge de AFFECTE_NON_LANCE à EN_COURS

---

## 10. Résumé des fichiers à créer / modifier

### Fichiers à CRÉER

| Fichier | Package | Type |
|---------|---------|------|
| `EtatJournalierLivreur.java` | `domain.planification.model` | Enum (Value Object) |
| `VueLivreur.java` | `domain.planification.model` | Record (Read Model) |
| `LivreurReferentiel.java` | `domain.planification.service` | Interface (port) |
| `ConsulterEtatLivreursHandler.java` | `application.planification` | Application Service |
| `DevLivreurReferentiel.java` | `infrastructure.dev` | Impl @Profile("dev") |
| `LivreurEtatWebSocketPublisher.java` | `infrastructure.websocket` | Event Listener |
| `LivreurEtatController.java` | `interfaces.rest` | REST Controller |
| `LivreurEtatDTO.java` | `interfaces.dto` | DTO record |
| `livreurEtatApi.ts` | `src/api/` (frontend) | API client TypeScript |
| `EtatLivreursPage.tsx` | `src/pages/` (frontend) | Composant React |

### Fichiers à MODIFIER

| Fichier | Modification |
|---------|-------------|
| `TourneePlanifieeRepository.java` | + méthode `findByLivreurIdAndDate` |
| `TourneePlanifieeJpaRepository.java` | + requête JPQL `findAffecteeOrLanceeByLivreurIdAndDate` |
| `TourneePlanifieeRepositoryImpl.java` | Implémenter la délégation vers JPA |
| `DevDataSeeder.java` | Aligner les livreurIds des TourneePlanifiees avec le référentiel |
| `WebSocketConfig.java` | Créer si absent (écart as-built identifié) |
| `App.tsx` (frontend) | + route `/etat-livreurs` |
| `SideNavBar.tsx` (frontend) | + entrée "Livreurs" |

---

## 11. Contraintes de non-régression

- Aucune modification des handlers existants (`AffecterLivreurVehiculeHandler`,
  `LancerTourneeHandler`, `DesaffecterTourneeHandler`) : le `LivreurEtatWebSocketPublisher`
  écoute les Domain Events via `@EventListener` — couplage nul sur les handlers.
- La requête JPQL est additive dans `TourneePlanifieeJpaRepository` — zéro impact
  sur les requêtes existantes.
- Le `DevLivreurReferentiel` est activé uniquement avec `@Profile("dev")` — aucun
  risque d'activation accidentelle en prod.

---

## 12. NFR applicables

| Réf | Exigence | Cible US-066 |
|-----|----------|-------------|
| ENF-PERF-001 | Latence page W-08 | < 500 ms (6 livreurs, requête simple — aucun index nécessaire au MVP) |
| ENF-PERF-WS | Mise à jour WebSocket après Domain Event | < 30 secondes (SLA W-08 Scénario 2) |
| ENF-SEC-008 | Endpoint réservé SUPERVISEUR / DSI | `@PreAuthorize("hasAnyRole('SUPERVISEUR', 'DSI')")` |
| ENF-DISP-001 | Disponibilité interface web | > 99,5 % (héritée) |
