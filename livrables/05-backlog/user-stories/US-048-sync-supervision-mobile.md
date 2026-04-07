# US-048 : Synchronisation données tournée supervision ↔ app mobile livreur

**Epic** : EPIC-DEV-001 — Infrastructure de test et observabilité (dev/test uniquement)
**Feature** : F-DEV-001 — Simulateur TMS et pont d'événements inter-BC (périmètre dev/test, hors prod)
**Bounded Context** : BC-03 (Supervision) → BC-01 (Orchestration de Tournée)
**Aggregate(s) touchés** : VueTournee (BC-03), Tournee (BC-01), Colis (BC-01)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : M

---

## User Story

En tant que développeur DocuPost,
je veux que la tournée lancée depuis l'interface de supervision soit immédiatement visible
dans l'application mobile livreur avec le même nombre de colis,
afin de valider le flux complet supervision ↔ mobile sans incohérence de données entre les
deux contextes.

---

## Contexte

### Problème observé

Les seeders de données dev de `svc-supervision` et `svc-tournee` sont indépendants l'un
de l'autre. Conséquence directe : la supervision affiche la tournée T-204 avec **22 colis**
pour `livreur-002` (Paul Dupont), tandis que l'app mobile livreur, connectée en tant que
`livreur-002`, ne voit que **4 colis** (seed `tournee-dev-002` dans `svc-tournee`).

Ce désalignement rend impossible la validation du flux métier complet
(lancer une tournée depuis W-04 → voir les colis dans l'app mobile), qui est un prérequis
pour tester US-001, US-024 et US-011.

Cette US est complémentaire à US-033 (SimulateurTMS + DevEventBridge) : US-033 pose
l'architecture du pont ; US-048 résout le cas concret de désynchronisation constaté et
ajoute les exigences UX du message "sans tournée".

### Règles métier du domaine (invariants)

- Une **Tournee** (BC-01) ne peut être créée que si elle dispose d'un `livreurId` valide
  et d'au moins un **Colis**. (Invariant de l'Aggregate Tournee.)
- L'identifiant `tourneeId` doit être **identique** dans BC-07, BC-01 et BC-03 :
  le pont d'événements `DevEventBridge` ne doit pas générer un nouvel identifiant.
- L'idempotence doit être garantie : un double déclenchement du pont pour le même
  `tourneeId` ne doit pas créer deux `Tournee` dans BC-01.
- Le `DevEventBridge` et les seeders de données dev ne doivent **jamais** être actifs
  en profil `prod`. L'annotation `@Profile("dev")` est obligatoire sur tous les beans
  et endpoints concernés.
- Le message affiché à un livreur sans tournée affectée doit être précis et orienté
  action : le message générique actuel est insuffisant.

### Liens avec US existantes

- **US-033** : pose l'architecture DevEventBridge et le simulateur TMS. US-048 en est
  un delta fonctionnel : déclencher le pont au démarrage et corriger les seeders.
- **US-047** : ajoute un 5ème livreur (`livreur-005`) sans tournée dans le picker dev
  mobile pour tester le cas "pas de tournée affectée".
- **US-001** : la liste des colis affichée sur mobile doit refléter la Tournee créée
  dans BC-01 via le pont.
- **US-024** : lancer une tournée depuis W-04 doit être visible côté livreur — prérequis
  couvert par le DevEventBridge.

---

## Critères d'acceptation (Gherkin)

### SC1 — Cohérence du nombre de colis entre supervision et mobile

```gherkin
Scenario: La tournée lancée depuis supervision affiche le même nombre de colis sur mobile
  Given l'application tourne en profil "dev"
  And le DevEventBridge est actif (déclenché au démarrage ou par le simulateur TMS)
  And la supervision affiche la TourneePlanifiee T-204 avec 22 colis pour livreur-002
  When le responsable logistique lance la tournée T-204 depuis W-04
  Then l'event TourneeLancee est émis dans BC-07
  And le DevEventBridge propage l'event vers BC-01
  And une Tournee avec 22 Colis et livreurId="livreur-002" est créée dans svc-tournee
  And l'app mobile connectée en tant que livreur-002 (Paul Dupont) affiche 22 colis
  And l'event TourneeDemarree est émis dans BC-01
```

### SC2 — Déclenchement automatique du DevEventBridge au démarrage en profil dev

```gherkin
Scenario: Le pont d'événements se déclenche au démarrage sans action manuelle
  Given l'application tourne en profil "dev"
  And les deux seeders (svc-supervision et svc-tournee) sont actifs
  When svc-supervision démarre
  Then le DevEventBridge propage les TourneesPlanifiees seedées qui ont le statut LANCEE
  And pour chaque TourneePlanifiee propagée, une Tournee correspondante existe dans BC-01
  And l'identifiant tourneeId est identique dans BC-07, BC-01 et BC-03
```

### SC3 — Idempotence du DevEventBridge

```gherkin
Scenario: Un double démarrage ou un double appel du pont ne crée pas de doublons
  Given une Tournee avec tourneeId="tournee-t204" existe déjà dans svc-tournee (BC-01)
  When le DevEventBridge reçoit à nouveau l'event TourneeLancee pour tourneeId="tournee-t204"
  Then aucune Tournee supplémentaire n'est créée dans BC-01
  And aucun événement d'erreur n'est émis
```

### SC4 — Message explicite quand aucune tournée n'est affectée

```gherkin
Scenario: Le livreur voit un message explicite quand aucune tournée n'est affectée
  Given le livreur "livreur-005" est authentifié dans l'app mobile
  And aucune Tournee n'est associée à livreur-005 dans BC-01
  When l'écran ListeColisScreen se charge
  Then l'app affiche le message :
    "Aucune tournée n'a encore été commandée pour vous. Veuillez vous rapprocher de votre superviseur."
  And aucun Colis n'est affiché
  And l'event AucuneTourneeAffectee est journalisé dans BC-01
```

### SC5 — Le livreur-005 est disponible dans le sélecteur dev mobile

```gherkin
Scenario: Le picker dev mobile propose un 5ème livreur sans tournée
  Given l'application mobile est lancée avec __DEV__ === true
  When l'écran de connexion s'affiche
  Then le picker dev contient un 5ème bouton avec testID="btn-dev-livreur-livreur-005"
  And le libellé affiché est "Sophie Bernard" (ou équivalent) et l'identifiant "livreur-005"
  And livreur-005 n'a aucune Tournee seedée dans svc-tournee
```

### SC6 — Absence du DevEventBridge en profil production

```gherkin
Scenario: Le pont n'est pas actif en profil production
  Given l'application tourne en profil "prod"
  When svc-supervision démarre
  Then aucun bean DevEventBridge n'est instancié
  And l'endpoint POST /dev/tms/import retourne HTTP 404
```

---

## Notes techniques

- Le **DevEventBridge** doit être implémenté comme `@Component @Profile("dev")` dans
  `svc-supervision`. Il écoute les `ApplicationEvent` internes (`TourneeLancee`) et appelle
  par HTTP interne `POST svc-tournee/internal/tournees` pour créer la Tournee dans BC-01.
- Le seed `svc-supervision` doit servir de **source de vérité** pour les données de
  développement : les colis de `svc-tournee` doivent être générés à partir du seed
  `svc-supervision` (même tourneeId, même livreurId, même nombre de colis), et non
  plus de façon indépendante.
- La constante `DEV_LIVREURS` dans `src/mobile/src/constants/devLivreurs.ts` doit être
  enrichie avec un 5ème compte `livreur-005` (sans tournée) pour couvrir le SC5.
- Le message "Aucune tournée n'a encore été commandée pour vous..." doit remplacer le
  message générique actuel dans `ListeColisScreen` lorsque l'API renvoie une liste vide.
- Référence implémentation DevEventBridge : US-033 (Option B recommandée).

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md (écran M-01 ListeColisScreen)
- US liées : US-033 (DevEventBridge), US-047 (picker dev livreur), US-001 (liste colis), US-024 (lancer tournée)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
- Seeder backend : src/backend/svc-tournee/src/main/java/com/docapost/tournee/infrastructure/seeder/DevDataSeeder.java
- Picker mobile : src/mobile/src/constants/devLivreurs.ts
- Écran mobile : src/mobile/src/screens/ConnexionScreen.tsx
