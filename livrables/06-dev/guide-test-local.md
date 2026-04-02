# Guide de test local — DocuPost MVP

> Ce document vous permet de démarrer l'ensemble de la solution (backend + frontend) sur votre machine et de tester chaque fonctionnalité implémentée.

---

## Prérequis

| Outil | Version minimale | Vérification |
|-------|-----------------|--------------|
| Java (JDK) | 20+ | `java -version` |
| Maven | 3.9+ | `mvn -version` |
| Node.js | 18+ | `node -version` |
| npm | 9+ | `npm -version` |
| Expo CLI | inclus dans expo | `npx expo --version` |

---

## Architecture globale — Vue d'ensemble

```
                        ┌──────────────────────────────┐
                        │   NAVIGATEUR (superviseur)   │
                        │  http://localhost:3000        │
                        └──────────┬───────────────────┘
                                   │ HTTP + WebSocket
                                   ▼
┌──────────────────────────────────────────────────────────────┐
│                     svc-supervision                          │
│                     :8082                                    │
│  Tableau de bord, instructions, planification, WebSocket     │
└──────────────────────────────────────────────────────────────┘

                        ┌──────────────────────────────┐
                        │   APP MOBILE (livreur)       │
                        │  http://localhost:8084 (web) │
                        └──────────┬───────────────────┘
                                   │ HTTP REST
                                   ▼
┌──────────────────────────────────────────────────────────────┐
│                     svc-tournee                              │
│                     :8081                                    │
│  Liste colis, détail colis, livraison, échec, clôture        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                     svc-oms                                  │
│                     :8083                                    │
│  Event Store immuable, synchronisation OMS (background)      │
└──────────────────────────────────────────────────────────────┘
```

> **En mode dev**, chaque service utilise une base H2 in-memory (aucune installation de base de données requise). Les données de test sont injectées automatiquement au démarrage.

---

## 1. Démarrage des services backend

Ouvrir **3 terminaux séparés** et lancer chaque service dans l'ordre suivant.

### Terminal 1 — svc-tournee (port 8081)

```bash
cd src/backend/svc-tournee
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

**Attendre** le message : `Started SvcTourneeApplication` (environ 10-15 secondes).

**Ce service gère :**
- La tournée du jour du livreur
- La liste et le détail des colis
- La confirmation de livraison (avec signature, photo, tiers, dépôt sécurisé)
- La déclaration d'échec de livraison
- La clôture de tournée et le récapitulatif

**Données injectées au démarrage (DevDataSeeder) :**
- 1 tournée pour le livreur `livreur-001`
- 5 colis avec des statuts variés (A_LIVRER, LIVRE, ECHEC)
- Contraintes : créneau horaire, colis fragile, documents sensibles

---

### Terminal 2 — svc-supervision (port 8082)

```bash
cd src/backend/svc-supervision
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

**Attendre** le message : `Started SvcSupervisionApplication`.

**Ce service gère :**
- Le tableau de bord superviseur (vue agrégée de toutes les tournées)
- Le détail d'une tournée (bandeau avancement + liste colis + incidents)
- L'envoi d'instructions aux livreurs (texte libre, déviation, pause, retour dépôt)
- Le suivi de l'exécution des instructions
- La planification du jour (plan du jour, affectation livreur/véhicule, lancement tournée)
- Les notifications WebSocket temps réel vers l'interface web

---

### Terminal 3 — svc-oms (port 8083)

```bash
cd src/backend/svc-oms
mvn spring-boot:run
```

**Attendre** le message : `Started SvcOmsApplication`.

**Ce service gère :**
- L'enregistrement des événements métier dans un Event Store immuable
- La synchronisation asynchrone avec l'OMS externe (désactivée par défaut en dev : `oms.api.enabled=false`)
- Un poller toutes les 10 secondes qui tente de publier les événements en attente

> **Note** : En dev, le svc-oms tourne en autonomie complète. L'OMS externe simulée (`:9090`) n'est pas nécessaire.

---

## 2. Démarrage du frontend web (superviseur)

### Terminal 4 — Interface web supervision (port 3000)

```bash
cd src/web/supervision
npm install        # première fois uniquement
npm start
```

L'application s'ouvre automatiquement sur **http://localhost:3000**.

**Ce frontend contient :**
- Page de connexion (mode dev : cliquer "Connexion" sans identifiants)
- Tableau de bord des tournées en cours
- Détail d'une tournée avec bandeau de progression
- Panneau d'envoi d'instructions aux livreurs
- Interface de planification du jour (affectation livreur/véhicule, lancement)
- Mises à jour en temps réel via WebSocket (STOMP)

---

## 3. Démarrage du frontend mobile (livreur)

### Terminal 5 — Application mobile React Native / Expo (port 8084)

```bash
cd src/mobile
npm install        # première fois uniquement
npm start
```

Expo démarre et affiche un QR code. Options :

| Option | Usage |
|--------|-------|
| Appuyer `w` | Ouvrir dans le navigateur (recommandé pour tester) |
| Scanner le QR | Tester sur vrai téléphone (app Expo Go) |
| Appuyer `a` | Lancer sur émulateur Android |
| Appuyer `i` | Lancer sur simulateur iOS (macOS uniquement) |

> Pour les tests depuis le navigateur, l'application sera accessible sur **http://localhost:8084** (ou le port affiché par Expo).

**Ce frontend contient :**

- Sélecteur de compte livreur (mode dev) : choisir parmi `livreur-001`, `livreur-002`, `livreur-003`
- Écran de connexion SSO mock : cliquer **Se connecter** pour s'authentifier
- Liste des colis de la tournée du jour
- Détail d'un colis (adresse, destinataire, contraintes)
- Capture de signature numérique
- Déclaration d'échec de livraison (avec motif et disposition)
- Récapitulatif de tournée (clôture)
- Bandeau de notification pour les instructions du superviseur

---

## 4. Vérification de l'état des services

Après démarrage, vérifier que chaque service répond :

```bash
# svc-tournee
curl http://localhost:8081/api/tournees/today \
  -H "Authorization: Bearer mock-livreur-001"

# svc-supervision
curl http://localhost:8082/api/supervision/tableau-de-bord

# svc-oms — H2 console
# Ouvrir : http://localhost:8083/h2-console
# JDBC URL : jdbc:h2:mem:omsdb
# User : sa / Password : (vide)
```

---

## 5. Référence des endpoints REST

### svc-tournee (:8081)

> **Authentification dev** : header `Authorization: Bearer mock-livreur-001` (injecté automatiquement par l'app mobile).

| Méthode | URL | Description | US |
|---------|-----|-------------|-----|
| GET | `/api/tournees/today` | Tournée du jour du livreur connecté | US-001 |
| GET | `/api/tournees/{tourneeId}/colis/{colisId}` | Détail d'un colis | US-004 |
| POST | `/api/tournees/{tourneeId}/colis/{colisId}/livraison` | Confirmer livraison (avec preuve) | US-008/009 |
| POST | `/api/tournees/{tourneeId}/colis/{colisId}/echec` | Déclarer échec | US-005 |
| POST | `/api/tournees/{tourneeId}/cloture` | Clôturer la tournée | US-007 |
| POST | `/api/preuves` | Uploader une preuve (photo/signature) | US-009 |

#### Exemples de requêtes cURL

**Récupérer la tournée du jour :**
```bash
curl http://localhost:8081/api/tournees/today \
  -H "Authorization: Bearer mock-livreur-001"
```

**Confirmer une livraison avec signature :**
```bash
curl -X POST http://localhost:8081/api/tournees/{tourneeId}/colis/{colisId}/livraison \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-livreur-001" \
  -d '{
    "typePreuve": "SIGNATURE",
    "donneesSignature": "data:image/png;base64,iVBORw0K...",
    "coordonneesGps": { "latitude": 48.8566, "longitude": 2.3522 }
  }'
```

**Déclarer un échec :**
```bash
curl -X POST http://localhost:8081/api/tournees/{tourneeId}/colis/{colisId}/echec \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-livreur-001" \
  -d '{
    "motif": "ABSENT",
    "disposition": "A_REPRESENTER",
    "noteLibre": "Sonnette hors service, avis de passage laissé"
  }'
```

**Clôturer la tournée :**
```bash
curl -X POST http://localhost:8081/api/tournees/{tourneeId}/cloture \
  -H "Authorization: Bearer mock-livreur-001"
```

---

### svc-supervision (:8082)

> **Authentification dev** : aucun header requis (MockJwtAuthFilter en dev).

| Méthode | URL | Description | US |
|---------|-----|-------------|-----|
| GET | `/api/supervision/tableau-de-bord` | Tableau de bord (toutes tournées) | US-011 |
| GET | `/api/supervision/tableau-de-bord?statut=A_RISQUE` | Filtrer par statut | US-011 |
| GET | `/api/supervision/tournees/{tourneeId}` | Détail d'une tournée | US-012 |
| POST | `/api/supervision/instructions` | Envoyer une instruction à un livreur | US-014 |
| GET | `/api/supervision/instructions/{tourneeId}` | Instructions d'une tournée | US-015 |
| GET | `/api/supervision/instructions/en-attente` | Toutes les instructions en attente | US-015 |
| POST | `/api/supervision/instructions/{id}/executee` | Marquer instruction exécutée | US-015 |
| GET | `/api/planification/plan-du-jour` | Plan du jour (tournées planifiées) | US-021 |
| GET | `/api/planification/tournees/{id}` | Détail tournée planifiée | US-021 |
| POST | `/api/planification/tournees/{id}/affecter` | Affecter livreur et véhicule | US-022 |
| POST | `/api/planification/tournees/{id}/valider-composition` | Valider la composition | US-023 |
| POST | `/api/planification/tournees/{id}/lancer` | Lancer une tournée | US-024 |

#### Exemples de requêtes cURL

**Tableau de bord :**
```bash
curl http://localhost:8082/api/supervision/tableau-de-bord
```

**Envoyer une instruction :**
```bash
curl -X POST http://localhost:8082/api/supervision/instructions \
  -H "Content-Type: application/json" \
  -d '{
    "tourneeId": "{tourneeId}",
    "livreurId": "livreur-001",
    "type": "TEXTE_LIBRE",
    "contenu": "Attention : déviation sur la rue Nationale, prendre par la rue du Marché"
  }'
```

**WebSocket (temps réel) :**
- Endpoint STOMP : `ws://localhost:8082/ws`
- Topic superviseur : `/topic/supervision`
- Topic livreur : `/topic/livreur/{livreurId}`

---

### svc-oms (:8083)

> Ce service est en arrière-plan. Il n'expose pas d'API publique utilisée par les frontends.

- Console H2 : **http://localhost:8083/h2-console**
  - JDBC URL : `jdbc:h2:mem:omsdb`
  - User : `sa` / Password : *(vide)*
- Surveiller les logs pour voir les événements enregistrés et tentatives de synchronisation.

---

## 6. Consoles H2 (base de données en mémoire)

Utiles pour inspecter l'état des données à tout moment.

| Service | URL | JDBC URL |
|---------|-----|----------|
| svc-tournee | http://localhost:8081/h2-console | `jdbc:h2:mem:docupost-tournee` |
| svc-supervision | http://localhost:8082/h2-console | `jdbc:h2:mem:supervision_dev` |
| svc-oms | http://localhost:8083/h2-console | `jdbc:h2:mem:omsdb` |

Pour chacune : User = `sa`, Password = *(laisser vide)*, cliquer **Connect**.

---

## 7. Scénarios de test bout en bout

### Scénario A — Livreur : Consulter et livrer un colis

1. Ouvrir l'app mobile (http://localhost:8084)
2. Se connecter (mode dev : identifiants fictifs)
3. Vérifier la liste de colis de la tournée (5 colis chargés)
4. Taper sur un colis au statut **A_LIVRER**
5. Consulter le détail (adresse, destinataire, contraintes)
6. Appuyer sur **Livrer** → choisir **Signature**
7. Signer sur l'écran → confirmer
8. Vérifier que le statut du colis passe à **LIVRE** dans la liste
9. Répéter pour tous les colis restants
10. Lancer la **clôture de tournée** → vérifier le récapitulatif

---

### Scénario B — Livreur : Déclarer un échec

1. Sélectionner un colis **A_LIVRER**
2. Appuyer sur **Échec de livraison**
3. Choisir le motif : `ABSENT`
4. Choisir la disposition : `A_REPRESENTER`
5. Ajouter une note libre (optionnel)
6. Confirmer → le colis passe au statut **ECHEC**

---

### Scénario C — Superviseur : Tableau de bord et instruction

1. Ouvrir l'interface web (http://localhost:3000)
2. Se connecter (mode dev : cliquer Connexion)
3. Consulter le **tableau de bord** : voir les tournées en cours
4. Cliquer sur une tournée → voir le détail (avancement, colis, incidents)
5. Envoyer une **instruction** au livreur (ex. : "Déviation rue Nationale")
6. Sur l'app mobile (autre onglet), vérifier l'apparition du bandeau d'instruction
7. Marquer l'instruction comme exécutée côté livreur
8. Sur le tableau de bord web, vérifier que l'instruction est marquée **EXECUTEE**

---

### Scénario D — Superviseur : Planification du jour

1. Ouvrir http://localhost:3000 → section **Planification**
2. Consulter le plan du jour (tournées injectées par le seeder : T-201, T-202, T-203, T-204)
3. Affecter un livreur et un véhicule à une tournée `NON_AFFECTEE`
4. Valider la composition (vérification des contraintes)
5. Lancer la tournée → voir Scénario E pour la vérifier bout en bout

---

### Scénario E — Bout en bout : TMS → Planification → Supervision → Livreur

> **Pré-requis** : svc-tournee (:8081), svc-supervision (:8082), frontend web (:3000) et app mobile (:8084) tous démarrés (voir section 2).
>
> Ouvrir deux onglets : **onglet A** = <http://localhost:3000> (superviseur) · **onglet B** = <http://localhost:8084> (livreur).

#### Étape 1 — Repartir de zéro (seed restauré)

1. [Onglet A] Aller sur <http://localhost:3000> → se connecter → cliquer **Planification**
2. [Onglet A] Cliquer **Réinitialiser** (barre d'outils, en haut à droite du bandeau)
3. [Onglet A] Confirmer la pop-up → message vert *"Données réinitialisées"*
4. [Onglet A] La liste affiche exactement **4 tournées seed** : `T-201`, `T-202`, `T-203`, `T-204` au statut **NON AFFECTÉE**

> Le bouton Réinitialiser purge toutes les données puis réinjecte le jeu de données seed complet (tournées planifiées + VueTournees + colis + instructions). Ce n'est pas un effacement total.

#### Étape 2 — Importer des tournées depuis le TMS simulé

1. [Onglet A] Cliquer **Simuler import TMS** (bouton à côté de "Réinitialiser")
2. [Onglet A] Attendre le message vert : *"3 tournée(s) importée(s) depuis le TMS simulé"*
3. [Onglet A] Trois nouvelles tournées `T-SIM-xxx` apparaissent en plus des 4 seed → total **7 tournées**

#### Étape 3 — Affecter un livreur et un véhicule

1. [Onglet A] Cliquer **Voir détail** sur l'une des tournées (seed ou importée)
2. [Onglet A] Onglet **Affectation** → choisir un livreur dans la liste déroulante (`livreur-001`, `livreur-002` ou `livreur-003`) et un véhicule disponible
3. [Onglet A] Cliquer **Valider l'affectation** → message *"Affectation enregistrée"* — tournée passe au statut **AFFECTÉE**

> Les livreurs disponibles sont les 3 comptes dev : `livreur-001` (Pierre Martin), `livreur-002` (Paul Dupont), `livreur-003` (Sophie Bernard).

#### Étape 4 — Lancer la tournée

1. [Onglet A] Revenir sur la liste → cliquer **Lancer** sur la tournée affectée
2. [Onglet A] Message vert : *"Tournée xxx lancée avec succès"* — statut **LANCÉE**

> En arrière-plan : `DevEventBridge` crée une `VueTournee` dans le tableau de bord supervision ET crée les colis placeholder (`A_LIVRER`) dans `svc-tournee` via HTTP.

#### Étape 5 — Vérifier dans le tableau de bord Supervision

1. [Onglet A] Cliquer **Supervision** dans la barre de navigation
2. [Onglet A] La tournée lancée est visible : nom du livreur, statut **EN COURS**, progression **0/N colis**
3. [Onglet A] Le compteur de colis affiche un nombre **> 0** — si `0/0 colis` s'affiche, c'est un bug DevEventBridge

#### Étape 6 — Le livreur voit sa tournée

1. [Onglet B] Aller sur <http://localhost:8084>
2. [Onglet B] **Sélecteur de compte** : cliquer sur le livreur affecté à l'étape 3 (ex. *Pierre Martin (livreur-001)*)
3. [Onglet B] Écran **Se connecter** : cliquer le bouton SSO mock → la liste de colis s'affiche
4. [Onglet B] Les colis de la tournée sont visibles au statut **À LIVRER**

#### Étape 7 — Livrer un colis (US-032 : mise à jour du read model supervision)

1. [Onglet B] Taper sur un colis **À LIVRER** → voir le détail
2. [Onglet B] Appuyer **Livrer** → choisir **Signature** → signer → **Confirmer**
3. [Onglet B] Le colis passe au statut **LIVRÉ**
4. [Onglet A] Retourner sur le tableau de bord → la progression a avancé : compteur `colisTraites` incrémenté (US-032)
5. [Onglet A] Dans le détail de la tournée, le colis livré affiche le statut **LIVRE**

#### Étape 8 — Envoyer une instruction au livreur

1. [Onglet A] Détail de la tournée → **Envoyer une instruction**
2. [Onglet A] Type : `TEXTE_LIBRE` · Contenu : `Attention déviation rue de la Paix` → confirmer
3. [Onglet A] L'instruction apparaît au statut **ENVOYÉE**
4. [Onglet B] Un bandeau orange s'affiche en haut de l'écran → appuyer **Marquer exécutée**
5. [Onglet A] L'instruction passe au statut **EXÉCUTÉE**

#### Étape 9 — Clôturer la tournée (US-032 : statut CLOTUREE)

1. [Onglet B] Une fois tous les colis traités → appuyer **Clôturer la tournée** → confirmer le récapitulatif
2. [Onglet A] La tournée passe au statut **CLÔTURÉE** dans le tableau de bord (US-032 : `VueTourneeEventHandler` applique l'événement `TOURNEE_CLOTUREE`)

#### Résultat attendu

| Étape              | Supervision (web)                        | Mobile (livreur)                  |
|--------------------|------------------------------------------|-----------------------------------|
| Après reset        | 4 tournées seed restaurées               | —                                 |
| Après import TMS   | +3 tournées T-SIM-xxx                    | —                                 |
| Après lancement    | VueTournee EN COURS, N/N colis (N > 0)   | Tournée + colis A_LIVRER visibles |
| Après livraison    | colisTraites incrémenté (US-032)         | Colis passe à LIVRÉ               |
| Après instruction  | Instruction ENVOYÉE                      | Bandeau orange affiché            |
| Après clôture      | Tournée CLÔTURÉE (US-032)                | Récapitulatif affiché             |

---

## 8. Lancer les tests automatisés

### Tests unitaires backend

```bash
# svc-tournee
cd src/backend/svc-tournee && mvn test

# svc-supervision
cd src/backend/svc-supervision && mvn test

# svc-oms
cd src/backend/svc-oms && mvn test
```

### Tests unitaires frontend mobile

```bash
cd src/mobile
npm test
```

### Tests E2E Playwright — App mobile

> Pré-requis : svc-tournee sur :8081 + app mobile sur :8084

```bash
# Depuis la racine du projet
npx playwright test --project=chromium
```

### Tests E2E Playwright — Interface supervision

> Pré-requis : svc-supervision sur :8082 + frontend web sur :3000

```bash
npx playwright test --config=playwright.supervision.config.ts --project=chromium
```

---

## 9. Dépannage fréquent

| Problème | Cause probable | Solution |
|----------|---------------|---------|
| `Port 8081 already in use` | Un service tourne déjà | `npx kill-port 8081` ou redémarrer |
| `404 sur /api/tournees/today` | Livreur non reconnu | Vérifier le header `Authorization: Bearer mock-livreur-001` |
| `409 Conflict` sur livraison | Colis déjà livré ou en échec | Choisir un colis au statut `A_LIVRER` |
| App mobile ne charge pas les colis | `EXPO_PUBLIC_API_URL` mal configuré | Vérifier `src/mobile/.env` → `EXPO_PUBLIC_API_URL=http://localhost:8081` |
| Tableau de bord vide | svc-supervision non démarré | Démarrer le terminal 2 |
| WebSocket non connecté | STOMP endpoint inaccessible | Vérifier que svc-supervision est démarré et que le port 8082 est libre |
| H2 console inaccessible | Profil dev non actif | Vérifier `-Dspring-boot.run.profiles=dev` dans la commande Maven |

---

## 10. Identifiants dev par défaut

| Composant | Valeur |
|-----------|--------|
| Livreur mock (svc-tournee) | `livreur-001` (dans le token JWT simulé) |
| H2 username | `sa` |
| H2 password | *(vide)* |
| Superviseur mock | rôle `ROLE_SUPERVISEUR` injecté automatiquement |
| OMS externe | désactivée (`oms.api.enabled=false`) |

> En production, l'authentification est assurée par Keycloak SSO (`sso.docaposte.fr`). En dev, le `MockJwtAuthFilter` simule un utilisateur authentifié sans token réel.
