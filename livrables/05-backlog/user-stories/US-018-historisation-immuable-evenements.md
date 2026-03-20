# US-018 : Garantir l'historisation immuable de chaque événement de livraison

**Epic** : EPIC-005 — Intégration SI et Historisation Immuable
**Feature** : F-016 — Historisation immuable des événements de livraison
**Bounded Context** : BC-05 Intégration SI / OMS
**Aggregate(s) touchés** : EvenementLivraison (Value Object immuable, Event Store)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : M (5 points)

---

## User Story

En tant que Sophie Dubois (DSI / donneur d'ordre),
je veux que chaque événement de livraison soit stocké de façon immuable dans le système
avec les quatre attributs obligatoires (qui, quoi, quand, géolocalisation),
afin de pouvoir auditer complètement l'historique de n'importe quel colis ou tournée
en moins de 5 minutes en cas de litige ou d'audit réglementaire.

---

## Contexte

Aujourd'hui les preuves de livraison ne sont pas immédiatement disponibles et les
événements ne sont pas historisés de façon structurée. Le BC-05 maintient un Event
Store PostgreSQL en mode append-only : aucun événement ne peut être modifié ou supprimé
après insertion. Chaque événement contient obligatoirement : livreurId (qui), action et
colisId (quoi), horodatage (quand), coordonnées GPS (géolocalisation).

**Invariants à respecter** :
- Aucun événement ne peut être modifié ou supprimé après création (immuabilité absolue).
- Chaque événement contient les 4 attributs obligatoires : qui, quoi, quand,
  géolocalisation. L'absence de coordonnées GPS (mode dégradé) est documentée mais ne
  bloque pas l'enregistrement.
- La complétude des événements historisés doit être = 100 %.
- L'audit doit permettre la reconstitution complète de l'historique d'un colis ou d'une
  tournée.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Historisation complète d'un événement LivraisonConfirmée

```gherkin
Given l'événement LivraisonConfirmée est émis pour le colis #00247
When le BC-05 traite cet événement
Then un enregistrement immuable est créé dans l'Event Store avec :
     - qui : livreurId = Pierre (identifiant)
     - quoi : action = "LivraisonConfirmée", colisId = #00247
     - quand : horodatage ISO 8601 exact
     - géolocalisation : latitude et longitude au moment de la capture
And le taux de complétude des événements historisés reste = 100 %
```

### Scénario 2 : Immuabilité — tentative de modification rejetée

```gherkin
Given un événement LivraisonConfirmée pour le colis #00247 est enregistré dans l'Event
     Store
When une tentative de mise à jour (UPDATE) ou suppression (DELETE) de cet enregistrement
     est effectuée (via API ou accès direct base de données)
Then l'opération est rejetée par la contrainte append-only de l'Event Store
And l'événement original reste intact et inchangé
And une alerte de sécurité est journalisée
```

### Scénario 3 : Reconstitution de l'historique complet d'un colis pour audit

```gherkin
Given le colis #00247 a traversé les états : "à livrer" → "échec" (Absent) → "livré"
     (second passage)
When Sophie recherche l'historique du colis #00247 depuis l'interface d'audit
Then l'historique complet est affiché en ordre chronologique :
     - 19/03 09:15 — TournéeDémarrée — Pierre — [coordonnées]
     - 19/03 10:42 — ÉchecLivraisonDéclaré — Pierre — Absent — [coordonnées]
     - 19/03 11:20 — LivraisonConfirmée — Pierre — SignatureNumerique — [coordonnées]
And la consultation de cet historique prend moins de 5 minutes
```

### Scénario 4 : Événement en mode dégradé GPS — coordonnées manquantes documentées

```gherkin
Given Pierre a confirmé une livraison en zone sans GPS disponible
When l'événement LivraisonConfirmée est enregistré dans l'Event Store
Then l'enregistrement est créé avec le champ coordonnées = null et un attribut
     "modeDegradGPS" = true
And les 3 autres attributs obligatoires (qui, quoi, quand) sont présents et complets
And l'événement est comptabilisé comme "complet avec dégradation" dans les métriques
     de complétude
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md (flux SI — hors périmètre wireframe)
- Parcours : /livrables/02-ux/user-journeys.md#parcours-4--livreur--capturer-une-preuve-de-livraison
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
