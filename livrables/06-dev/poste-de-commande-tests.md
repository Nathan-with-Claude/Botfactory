---
# Poste de commande — Tests manuels DocuPost

> Ce fichier est destiné au Product Owner / Expert métier pour valider chaque US en local.
> Pour chaque US : suivre la check-list, noter les observations dans "Notes perso", puis remonter les blocages via le feedback structuré.

---

## Feature Broadcast Superviseur → Livreurs (US-067/068/069) — 2026-04-22

### Pré-requis

**Backend svc-supervision** :
```bash
cd c:/Github/Botfactory/src/backend/svc-supervision
JAVA_HOME="C:/Program Files/Java/jdk-23" mvn spring-boot:run -Dspring-boot.run.profiles=dev
# Disponible sur http://localhost:8082
# Le seeder crée automatiquement : 3 secteurs (SECT-IDF-01/02/03), 6 tokens FCM fictifs
```

**Frontend supervision** :
```bash
cd c:/Github/Botfactory/src/web/supervision
REACT_APP_API_URL=http://localhost:8082 REACT_APP_AUTH_BYPASS=true npm start
# Disponible sur http://localhost:3000
```

**Mobile livreur (Expo Web)** :
```bash
cd c:/Github/Botfactory/src/mobile
EXPO_PUBLIC_API_URL=http://localhost:8081 EXPO_PUBLIC_SUPERVISION_URL=http://localhost:8082 npx expo start --web --port 8083
# Disponible sur http://localhost:8083
```

> **Profil dev** : toutes les requêtes backend sont authentifiées comme `superviseur-001 / ROLE_SUPERVISEUR` automatiquement.
> **FCM simulé** : les messages push sont logués INFO (non envoyés) — comportement normal en dev.

---

### US-067 — Envoyer un broadcast à ses livreurs actifs (W-09)

**Anomalies connues avant test** :
- OBS-BROAD-001 : ciblage par secteur retourne 422 (livreurIds non stockés en base) — à ignorer pour le test SECTEUR
- OBS-BROAD-000 : corrigée (FcmBroadcastAdapter)

| # | Scénario | Action | Résultat attendu | Statut | Notes |
|---|----------|--------|-----------------|--------|-------|
| 1 | Ouvrir W-09 | Sur http://localhost:3000, cliquer "Broadcast" dans la barre de navigation gauche | Le panneau W-09 s'affiche avec formulaire de composition | ☐ | |
| 2 | Bouton ENVOYER inactif | Sur le formulaire W-09, saisir un texte sans sélectionner le type | Le bouton ENVOYER doit être grisé (disabled) | ☐ | |
| 3 | Sélectionner TypeBroadcast | Cliquer sur "ALERTE" | Le bouton ENVOYER devient actif | ☐ | |
| 4 | Envoi ALERTE vers tous | Sélectionner ALERTE, saisir "Rue Gambetta barrée", ciblage=Tous, cliquer ENVOYER | Toast "Message envoyé à 2 livreurs" — message apparaît dans l'historique | ☐ | |
| 5 | Compteur caractères | Saisir 280 caractères dans le textarea | Compteur affiche "280 / 280", bouton ENVOYER actif | ☐ | |
| 6 | Blocage > 280 caractères | Tenter de saisir un 281e caractère | Le champ n'accepte pas le caractère supplémentaire | ☐ | |
| 7 | Liste secteurs | Sélectionner le ciblage "Secteur" et observer la liste | SECT-IDF-01, SECT-IDF-02, SECT-IDF-03 disponibles (OBS-BROAD-001 : envoi échouera) | ☐ | |
| 8 | API directe — secteurs | `curl http://localhost:8082/api/supervision/broadcast-secteurs` | JSON avec 3 secteurs et leurs libellés | ☐ | |

---

### US-068 — Recevoir les broadcasts sur l'app mobile (M-08)

**Prérequis** : US-067 valide et au moins 1 broadcast envoyé.
**Anomalies connues** : OBS-BROAD-003 (projection statuts vide) — le compteur de non-lus peut ne pas se mettre à jour.

| # | Scénario | Action | Résultat attendu | Statut | Notes |
|---|----------|--------|-----------------|--------|-------|
| 1 | Ouvrir l'app mobile | http://localhost:8083 — se connecter comme Pierre Morel (livreur-002) | Écran M-02 (Liste des colis) affiché, icône campaign visible dans le header | ☐ | |
| 2 | Accéder à M-08 | Cliquer l'icône campaign dans le header | Écran M-08 (Zone messages) s'ouvre avec la liste des broadcasts du jour | ☐ | |
| 3 | Liste messages | Observer M-08 avec au moins 1 broadcast envoyé | Chaque item : badge coloré [ALERTE]/[INFO]/[CONSIGNE], heure, texte, "De : superviseur-001" | ☐ | |
| 4 | Aucun message | Tester M-08 sans broadcast envoyé (redémarrer svc-supervision) | Message "Votre superviseur n'a pas envoyé de message aujourd'hui." | ☐ | |
| 5 | API directe | `curl "http://localhost:8082/api/supervision/broadcasts/du-jour?date=$(date +%Y-%m-%d)"` | JSON avec broadcasts du jour, nombreDestinataires et nombreVus | ☐ | |

---

### US-069 — Consulter les statuts de lecture dans W-09

**Anomalies connues** : OBS-BROAD-003 (compteurs toujours 0, projection vide).

| # | Scénario | Action | Résultat attendu | Statut | Notes |
|---|----------|--------|-----------------|--------|-------|
| 1 | Historique W-09 | Après un envoi, consulter la section "Historique des broadcasts du jour" dans W-09 | Les broadcasts apparaissent avec badge, heure, texte tronqué, "Vu par 0/2 livreurs" | ☐ | |
| 2 | Détail nominatif | Cliquer le chevron [>] d'un broadcast | Panneau avec liste livreurs : Pierre Morel / EN ATTENTE, Paul Dupont / EN ATTENTE | ☐ | OBS-BROAD-003 : liste peut être vide |
| 3 | Mise à jour temps réel | Depuis M-08 livreur, consulter un message — observer W-09 superviseur | Compteur "Vu par N/M" devrait se mettre à jour (OBS-BROAD-003 bloque) | ☐ | |
| 4 | API historique | `curl "http://localhost:8082/api/supervision/broadcasts/du-jour?date=$(date +%Y-%m-%d)"` | JSON avec nombreVus et nombreDestinataires pour chaque broadcast | ☐ | |

---

### Anomalies actives à signaler au développeur

| Code | Sévérité | Description |
|------|----------|-------------|
| OBS-BROAD-001 | Bloquant | Ciblage secteur impossible — livreurIds absents de BroadcastSecteurEntity |
| OBS-BROAD-002 | Bloquant (test) | Endpoints ROLE_LIVREUR non testables en L2 avec MockJwtAuthFilter dev |
| OBS-BROAD-003 | Bloquant | BroadcastEnvoye non publié via ApplicationEventPublisher — projection statuts vide |

---

## Corrections As-Built (US-051 à US-059) — 2026-04-04

### Pré-requis communs

**Backend svc-supervision** :
```bash
cd /home/admin/Botfactory/src/backend/svc-supervision
mvn spring-boot:run -Dspring-boot.run.profiles=dev
# Disponible sur http://localhost:8082
```

**Backend svc-tournee** :
```bash
cd /home/admin/Botfactory/src/backend/svc-tournee
mvn spring-boot:run -Dspring-boot.run.profiles=dev
# Disponible sur http://localhost:8081
```

**Mobile (Expo Web)** :
```bash
cd /home/admin/Botfactory/src/mobile
npm install
npx expo start --web --port 8090
# Disponible sur http://localhost:8090
```

**PostgreSQL local (US-054 uniquement)** :
```bash
cd /home/admin/Botfactory/src/backend/svc-supervision
docker compose up -d
# PostgreSQL disponible sur localhost:5432
# Puis lancer svc-supervision avec :
SPRING_PROFILES_ACTIVE=local-postgres mvn spring-boot:run
```

---

### US-051 — Bearer token dans supervisionApi

| # | Scénario | Action | Résultat attendu | Statut | Notes perso |
|---|----------|--------|-----------------|--------|-------------|
| 1 | Polling instructions avec token | Ouvrir l'app mobile en tant que livreur-dev-001, attendre 10s | Aucune erreur 403 dans les logs svc-supervision — instructions récupérées sans erreur | ☐ | |
| 2 | Marquer instruction exécutée | Depuis DetailColisScreen, ouvrir un colis avec instruction active | Instruction marquée sans 403, retour 200 dans les logs backend | ☐ | |
| 3 | Prise en compte instruction | Ouvrir MesConsignesScreen | Instructions passent au statut PRISE_EN_COMPTE sans erreur réseau | ☐ | |
| 4 | Erreur silencieuse polling | Couper svc-supervision, observer ListeColisScreen | Pas d'écran d'erreur — la liste colis reste affichée normalement | ☐ | |

---

### US-052 — Dépendances package.json

| # | Scénario | Action | Résultat attendu | Statut | Notes perso |
|---|----------|--------|-----------------|--------|-------------|
| 1 | npm install propre | Supprimer `node_modules/` et relancer `npm install` dans `src/mobile/` | Pas d'erreur "package not found" — node_modules complet | ☐ | |
| 2 | App démarre sans erreur module | `npx expo start --web --port 8090` | Aucune erreur "Cannot resolve module 'react-native-app-auth'" ni "netinfo" | ☐ | |
| 3 | Tests Jest | `npm test` dans `src/mobile/` | Suite verte (tous les tests passants avant restent verts) | ☐ | |

---

### US-053 — Correction poidsEstimeKg

| # | Scénario | Action | Résultat attendu | Statut | Notes perso |
|---|----------|--------|-----------------|--------|-------------|
| 1 | Tests unitaires TourneePlanifiee | `mvn test -pl svc-supervision` | 22 tests TourneePlanifieeTest PASS (BUILD SUCCESS) | ☐ | |
| 2 | Vérification compatibilité après rechargement | Démarrer svc-supervision (profil dev), appeler `POST /api/planification/tournees/{id}/verifier-compatibilite-vehicule` | Résultat `COMPATIBLE` ou `DEPASSEMENT` — pas `POIDS_ABSENT` pour les tournées avec poids seed | ☐ | |
| 3 | API curl test | `curl -s -X POST http://localhost:8082/api/planification/tournees/T-001/verifier-compatibilite-vehicule -H "Content-Type: application/json" -d '{"vehiculeId":"V-001"}'` | Réponse JSON avec `resultat != "POIDS_ABSENT"` si tournée a un poids | ☐ | |

---

### US-054 — PostgreSQL local

| # | Scénario | Action | Résultat attendu | Statut | Notes perso |
|---|----------|--------|-----------------|--------|-------------|
| 1 | Démarrage Docker PostgreSQL | `docker compose up -d` dans `src/backend/svc-supervision/` | Container `docupost-supervision-db` running et `healthy` | ☐ | |
| 2 | svc-supervision profil local-postgres | `SPRING_PROFILES_ACTIVE=local-postgres mvn spring-boot:run` | Application démarre, tables créées par Hibernate, données seed insérées | ☐ | |
| 3 | Persistance entre redémarrages | Arrêter puis redémarrer svc-supervision (sans stopper Docker) | Les données précédemment créées sont présentes via `GET /api/planification/tournees/{date}` | ☐ | |
| 4 | Profil dev inchangé | `mvn test` sans profil spécial | Tous les tests @WebMvcTest passent (H2 utilisé, 154 tests) | ☐ | |

---

### US-055 — Navigation react-navigation

| # | Scénario | Action | Résultat attendu | Statut | Notes perso |
|---|----------|--------|-----------------|--------|-------------|
| 1 | App démarre avec NavigationContainer | Lancer l'app mobile | Aucune erreur de navigation au démarrage, ConnexionScreen affichée | ☐ | |
| 2 | Navigation ConnexionScreen → ListeColisScreen | Se connecter en tant que livreur-dev-001 | Transition vers ListeColisScreen après login | ☐ | |
| 3 | Migration partielle documentée | Ouvrir DetailColisScreen depuis ListeColisScreen | Le retour Android depuis les sous-écrans est géré par l'état interne (prévu R2) | ☐ | |

---

### US-056 — Persistance offlineQueue AsyncStorage

| # | Scénario | Action | Résultat attendu | Statut | Notes perso |
|---|----------|--------|-----------------|--------|-------------|
| 1 | Enqueue en mode offline | Couper le réseau simulé, confirmer 2 livraisons dans l'app | Compteur "En attente" affiche 2 | ☐ | |
| 2 | Persistance après kill app | Forcer la fermeture de l'app, la rouvrir | Le compteur "En attente" affiche toujours 2 (rechargement AsyncStorage) | ☐ | |
| 3 | Sync automatique au retour réseau | Rétablir le réseau, observer | Les 2 commandes sont synchronisées, compteur revient à 0 | ☐ | |
| 4 | Clôture bloquée si file non vide | Avec des commandes en attente, tenter la clôture | Bouton clôture désactivé ou message d'avertissement affiché | ☐ | |

---

### US-057 — WebSocket STOMP (déjà implémenté)

| # | Scénario | Action | Résultat attendu | Statut | Notes perso |
|---|----------|--------|-----------------|--------|-------------|
| 1 | Connexion WebSocket active | Ouvrir le tableau de bord supervision http://localhost:3000 | Indicateur "En direct" affiché (US-044) | ☐ | |
| 2 | Mise à jour temps réel | Déclencher un événement TMS via DevTmsController, observer le tableau de bord | Mise à jour visible sans rechargement de page | ☐ | |

---

### US-058 — CORS et sécurité endpoint interne

| # | Scénario | Action | Résultat attendu | Statut | Notes perso |
|---|----------|--------|-----------------|--------|-------------|
| 1 | CORS dev — toutes origines | `curl -H "Origin: http://external.test" -X OPTIONS http://localhost:8082/api/supervision/tableau-de-bord` | Header `Access-Control-Allow-Origin` présent dans la réponse | ☐ | |
| 2 | Endpoint interne sans secret (dev) | `curl -X POST http://localhost:8082/api/supervision/internal/vue-tournee/events -H "Content-Type: application/json" -d '{}'` | Réponse non-403 (filtre bypass en dev) | ☐ | |
| 3 | Tests de sécurité | `mvn test -pl svc-supervision` | 154 tests PASS (BUILD SUCCESS) | ☐ | |

---

### US-059 — Upload photo multipart

| # | Scénario | Action | Résultat attendu | Statut | Notes perso |
|---|----------|--------|-----------------|--------|-------------|
| 1 | Photo < 5MB acceptée | Capturer une photo et confirmer la livraison via l'app mobile | Livraison confirmée sans erreur 413 | ☐ | |
| 2 | Limite Spring configurée | `grep -r "max-file-size" src/backend/svc-supervision/src/main/resources/` | Affiche `max-file-size: 5MB` dans application.yml | ☐ | |
| 3 | Livraison sans photo inchangée | Confirmer une livraison avec signature uniquement | Flux signature inchangé, livraison confirmée | ☐ | |

---

## US-003 : Filtrer et organiser mes colis par zone géographique

### Pré-requis

**Backend** :
```bash
cd C:/Github/Botfactory/src/backend/svc-tournee
JAVA_HOME="C:/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn spring-boot:run -Dspring-boot.run.profiles=dev
# Endpoint disponible sur http://localhost:8080
# Le DevDataSeeder crée 5 colis répartis en 3 zones :
#   Zone A : colis-001 (A_LIVRER), colis-005 (ECHEC)
#   Zone B : colis-002 (A_LIVRER), colis-003 (A_LIVRER)
#   Zone C : colis-004 (LIVRE)
```

**Frontend mobile** :
```bash
cd C:/Github/Botfactory/src/mobile
npm install
npx expo start
# Ouvrir l'app sur simulateur Android ou Expo Go
# Naviguer vers l'écran "Liste des colis" (M-02)
```

---

### Check-list de tests manuels

| # | Scénario | Action | Résultat attendu | Statut | Notes perso |
|---|----------|--------|-----------------|--------|-------------|
| 1 | Affichage des onglets | Ouvrir l'écran M-02 | La barre d'onglets affiche : [Zone A] [Zone B] [Zone C] [Tous] | ☐ | |
| 2 | Onglet "Tous" par défaut | Observer l'état initial | L'onglet "Tous" est actif (fond bleu) — les 5 colis sont visibles | ☐ | |
| 3 | SC1 : Filtrage Zone A | Appuyer sur "Zone A" | 2 colis visibles (12 Rue du Port + 7 Rue de la République) | ☐ | |
| 4 | SC1 : Bandeau global inchangé | Avec Zone A active, observer le bandeau | Bandeau affiche toujours "Reste à livrer : 3 / 5" (pas 1 / 2) | ☐ | |
| 5 | SC1 : Filtrage Zone B | Appuyer sur "Zone B" | 2 colis visibles (4 Allée des Roses + 8 Cours Gambetta) | ☐ | |
| 6 | SC1 : Filtrage Zone C | Appuyer sur "Zone C" | 1 colis visible (23 Avenue Jean Jaurès) avec statut "Livré" (grisé) | ☐ | |
| 7 | SC1 : Instantané sans rechargement | Observer le changement lors de l'appui sur un onglet | La liste change immédiatement, pas de spinner de chargement | ☐ | |
| 8 | SC2 : Retour à "Tous" | Depuis Zone A, appuyer sur "Tous" | Les 5 colis sont à nouveau visibles avec leurs statuts corrects | ☐ | |
| 9 | SC3 : Zone complète | Appuyer sur Zone C (tous ses colis sont traités) | La Zone C affiche le colis avec statut terminal "Livré" — aucun colis "À livrer" | ☐ | |
| 10 | Vérification onglet actif | Passer de Zone A à Zone B | L'onglet Zone A perd son fond bleu, Zone B l'acquiert | ☐ | |
| 11 | API brute — zones | `GET http://localhost:8080/api/tournees/today` | JSON : chaque colis a `adresseLivraison.zoneGeographique` renseigné (Zone A / B / C) | ☐ | |

---

### Limitations connues — à NE PAS signaler comme bugs

- **Nombre de zones dans les tests DevDataSeeder** : 3 zones (A, B, C) avec 5 colis. Suffisant pour valider les scénarios, pas représentatif d'une tournée réelle (22 colis).
- **Scroll horizontal** : si l'écran est étroit, la barre d'onglets est scrollable horizontalement. Ce comportement est attendu.
- **Persistance du filtre actif** : si l'utilisateur quitte l'écran et revient, le filtre revient à "Tous". La persistance du filtre n'est pas dans le périmètre de cette US.

---

### Feedback structuré

> Remplir après les tests

**Bloquants** (empêchent la validation de l'US) :
- [ ] aucun pour l'instant

**Anomalies non bloquantes** :
- [ ] aucune pour l'instant

**Améliorations souhaitées** (futures US) :
- [ ] Mémoriser le filtre de zone actif lors de la navigation entre écrans
- [ ] Afficher le nombre de colis par zone dans l'onglet (ex. "Zone A (2)")
- [ ] Afficher le nombre de colis restants par zone dans l'onglet

---

## US-002 : Suivre ma progression en temps réel

### Pré-requis

**Backend** :
```bash
cd C:/Github/Botfactory/src/backend/svc-tournee
./mvnw spring-boot:run
# Endpoint disponible sur http://localhost:8080
# Le DevDataSeeder crée automatiquement une tournée de test avec 5 colis :
#   - 3 au statut A_LIVRER
#   - 1 au statut LIVRE
#   - 1 au statut ECHEC
# => Bandeau attendu : "Reste à livrer : 3 / 5"
```

**Frontend mobile** :
```bash
cd C:/Github/Botfactory/src/mobile
npm install
npx expo start
# Ouvrir l'app sur simulateur iOS/Android ou Expo Go
# Naviguer vers l'écran "Liste des colis" (M-02)
```

> Note : JDK 21 recommandé. Avec JDK 25, les tests `TourneeControllerTest` restent rouges
> (BUG-002 infra — voir Limitations connues). Le backend fonctionne normalement à l'exécution.

---

### Check-list de tests manuels

| # | Scénario | Action | Résultat attendu | Statut | Notes perso |
|---|----------|--------|-----------------|--------|-------------|
| 1 | SC1 : Affichage initial du bandeau | Lancer le backend + mobile. Ouvrir l'écran M-02 | Bandeau affiche "Reste à livrer : 3 / 5" (données DevDataSeeder) | ☐ | |
| 2 | SC1 : Estimation fin de tournée | Observer le champ "Fin estimée" dans le bandeau | Le champ affiche "--" ou est absent (MVP — estimation null attendue) | ☐ | |
| 3 | SC1 : Total colis correct | Vérifier le total affiché | Le total affiché est 5 (colisTotal du DevDataSeeder) | ☐ | |
| 4 | SC4 : Bouton Clôture absent (colis restants) | Vérifier l'écran M-02 avec des colis restants | Le bouton "Clôturer la tournée" n'est PAS visible | ☐ | |
| 5 | SC4 : Bouton Clôture visible (tous traités) | Appeler l'API pour passer tous les colis à LIVRE ou ECHEC, puis recharger l'écran | Le bouton "Clôturer la tournée" apparaît en vert | ☐ | |
| 6 | SC4 : Accessibilité du bouton Clôture | Inspecter le bouton Clôture quand il est visible (outils dev Expo ou inspecteur React Native) | `accessibilityRole="button"` et `accessibilityLabel` présents | ☐ | |
| 7 | Invariant : resteALivrer — exclusion ECHEC | Vérifier que les colis au statut ECHEC ne sont pas comptés dans le reste | Bandeau : seuls les colis A_LIVRER sont comptés (pas ECHEC, pas LIVRE, pas A_REPRESENTER) | ☐ | |
| 8 | Invariant : Avancement non modifiable manuellement | Tenter de patcher directement le champ resteALivrer via l'API REST | L'API ne propose pas d'endpoint PATCH sur l'avancement — le serveur renvoie 404 ou 405 | ☐ | |
| 9 | Vérification API brute | `GET http://localhost:8080/api/tournees/{id}` (avec header `X-Livreur-Id: LIV-001`) | JSON contient `resteALivrer: 3`, `colisTotal: 5`, `estimationFin: null` | ☐ | |
| 10 | Affichage état vide | Appeler l'API avec un ID de tournée inexistant ou une tournée sans colis | Écran M-02 affiche le message vide prévu — aucun bandeau de progression | ☐ | |

---

### Limitations connues — à NE PAS signaler comme bugs

- **BUG-002 (infra)** : `TourneeControllerTest` reste rouge en raison de l'incompatibilité Spring ASM 9.x / Java 25 (format .class 69). Cela n'affecte pas le comportement à l'exécution. Solution recommandée : JDK 21.
- **Estimation de fin de tournée** : retourne `null` dans le MVP. La cadence de livraison n'est pas encore disponible. Afficher "--" ou masquer le champ est le comportement attendu.
- **Bouton "Clôturer la tournée"** : l'action associée est un TODO pour US-007 (clôture de tournée non encore implémentée). Tester uniquement la visibilité/masquage du bouton, pas son action.
- **Mise à jour temps réel (SC2, SC3)** : le bandeau se met à jour uniquement après rechargement de l'écran dans le MVP. La mise à jour sans rechargement (SSE ou WebSocket) n'est pas implémentée à ce stade.

---

### Feedback structuré

> Remplir après les tests

**Bloquants** (empêchent la validation de l'US) :
- [ ] aucun pour l'instant

**Anomalies non bloquantes** :
- [ ] aucune pour l'instant

**Améliorations souhaitées** (futures US) :
- [ ] Mise à jour temps réel du bandeau sans rechargement (SC2, SC3 — US-002 non couverts en MVP)
- [ ] Affichage de l'estimation de fin de tournée (US-002, cadence à implémenter)
- [ ] Action du bouton "Clôturer la tournée" (US-007)

---

## US-008 + US-009 : Capturer la preuve de livraison (signature, photo, tiers, dépôt)

### Pré-requis

**Backend** :
```bash
cd C:/Github/Botfactory/src/backend/svc-tournee
JAVA_HOME="C:/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn spring-boot:run -Dspring-boot.run.profiles=dev
# Endpoint disponible sur http://localhost:8081
# Le DevDataSeeder crée 5 colis — au moins 1 en statut A_LIVRER (colis-001 ou colis-002)
```

**Frontend mobile** :
```bash
cd C:/Github/Botfactory/src/mobile
npm install
npx expo start
# Ouvrir l'app sur simulateur Android ou Expo Go
# Parcours : Ecran M-02 (Liste) → appuyer sur colis A_LIVRER → Ecran M-03 (Détail) → bouton "LIVRER CE COLIS" → Ecran M-04 (Preuve)
```

**Endpoint de test direct** :
```bash
# SC1 : Signature
curl -X POST http://localhost:8081/api/tournees/TRN-2026-001/colis/colis-001/livraison \
  -H "Content-Type: application/json" \
  -d '{"typePreuve":"SIGNATURE","donneesSignature":"AAAA..."}'
# Réponse 200 : { "preuveLivraisonId": "...", "colisId": "colis-001", "typePreuve": "SIGNATURE", "modeDegradeGps": true }

# SC2 : Tiers identifié
curl -X POST http://localhost:8081/api/tournees/TRN-2026-001/colis/colis-002/livraison \
  -H "Content-Type: application/json" \
  -d '{"typePreuve":"TIERS_IDENTIFIE","nomTiers":"Mme Leroy"}'

# Confirmer que le statut du colis est maintenant LIVRE :
curl http://localhost:8081/api/tournees/TRN-2026-001/colis/colis-001
# JSON : { "statut": "LIVRE", "estTraite": true }
```

---

### Check-list de tests manuels

| # | Scénario | Action | Résultat attendu | Statut | Notes perso |
|---|----------|--------|-----------------|--------|-------------|
| 1 | Accès écran M-04 | Sur M-03, appuyer sur "LIVRER CE COLIS" | Écran M-04 "Preuve de livraison" s'ouvre avec les 4 types de preuve | ☐ | |
| 2 | US-008 SC1 : Sélection SIGNATURE | Appuyer sur "Signature du destinataire" | Le type est surligné, une zone "Pad de signature" apparaît | ☐ | |
| 3 | US-008 SC2 : Bouton désactivé sans signature | Observer le bouton CONFIRMER après sélection SIGNATURE | Bouton CONFIRMER est grisé (désactivé) tant que la zone de signature est vide | ☐ | |
| 4 | US-008 SC3 : Signature + confirmation | Signer dans la zone puis appuyer CONFIRMER | Spinner de confirmation → retour à M-02 avec le colis passé en statut "Livré" | ☐ | |
| 5 | US-008 SC3 : Effacer signature | Après avoir signé, appuyer sur "Effacer" | La zone de signature revient vide, le bouton CONFIRMER se désactive | ☐ | |
| 6 | US-009 SC2 : Sélection TIERS_IDENTIFIE | Appuyer sur "Dépôt chez un tiers" | Le type est surligné, un champ texte "Nom du tiers" apparaît | ☐ | |
| 7 | US-009 SC2 : Bouton actif quand nom renseigné | Saisir "Mme Leroy" dans le champ nom tiers | Le bouton CONFIRMER devient actif (coloré) | ☐ | |
| 8 | US-009 SC3 : Bouton désactivé si nom vide | Sélectionner TIERS_IDENTIFIE sans saisir de nom | Le bouton CONFIRMER reste grisé | ☐ | |
| 9 | US-009 SC4 : Sélection DEPOT_SECURISE | Appuyer sur "Dépôt sécurisé" | Un champ texte "Description de l'emplacement" apparaît | ☐ | |
| 10 | US-009 SC4 : Bouton actif quand description | Saisir "Boite aux lettres n°3" | Le bouton CONFIRMER devient actif | ☐ | |
| 11 | US-009 : Sélection PHOTO | Appuyer sur "Photo du colis déposé" | Le bouton "Ouvrir la caméra" apparaît | ☐ | |
| 12 | Navigation retour | Appuyer sur le bouton retour depuis M-04 | Retour à M-03 (Détail colis) sans modification du statut | ☐ | |
| 13 | Invariant : double confirmation | Appeler l'API livraison 2 fois pour le même colis | 2e appel retourne HTTP 409 (Livraison déjà confirmée) | ☐ | |
| 14 | Invariant : colis ECHEC non livrable | Tenter POST /livraison sur un colis en statut ECHEC | HTTP 409 (TourneeInvariantException — transition interdite) | ☐ | |
| 15 | Bandeau mis à jour après livraison | Après confirmation signature, revenir sur M-02 | Bandeau "Reste à livrer" décrémenté de 1 | ☐ | |

---

### Limitations connues — à NE PAS signaler comme bugs

- **Pad de signature (MVP)** : la zone de signature est simulée par un bouton "Appuyer pour signer". L'intégration du vrai canvas de signature (react-native-signature-canvas) est prévue en US-010.
- **Capture photo** : le bouton "Ouvrir la caméra" est présent mais n'ouvre pas encore la caméra native (expo-image-picker non intégré). Fonctionnalité complète prévue en US-010.
- **GPS mode dégradé** : toutes les preuves du MVP sont enregistrées sans coordonnées GPS (`modeDegradeGps: true`). L'accès GPS natif est prévu en US-010.
- **Upload de photo** : même quand l'appareil photo sera intégré, l'upload S3 est non encore provisionné.

---

### Feedback structuré

> Remplir après les tests

**Bloquants** (empêchent la validation de l'US) :
- [ ] aucun pour l'instant

**Anomalies non bloquantes** :
- [ ] aucune pour l'instant

**Améliorations souhaitées** (futures US) :
- [ ] Intégrer le vrai canvas de signature react-native-signature-canvas (US-010)
- [ ] Capture photo native via expo-image-picker (US-010)
- [ ] GPS automatique en mode normal — latitude/longitude dans la preuve (US-010)

---

---

## US-010 : Consulter les preuves de livraison en cas de litige

### Pré-requis

Backend svc-tournee sur port 8081 (profil dev).

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Accès superviseur | GET http://localhost:8081/api/preuves/colis/colis-001 | HTTP 200 avec la preuve | PASS |
| 2 | Accès livreur refusé | GET avec header X-Role: LIVREUR | HTTP 403 Forbidden | PASS |
| 3 | Colis inexistant | GET /api/preuves/colis/inexistant | HTTP 404 Not Found | PASS |
| 4 | Immuabilité | PUT /api/preuves/... | HTTP 405 Method Not Allowed | PASS |

---

## US-011 : Tableau de bord de supervision

### Pré-requis

Backend svc-supervision sur port 8082 (profil dev).

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Tableau de bord | GET http://localhost:8082/api/supervision/tableau-de-bord | HTTP 200 avec tournees[] | PASS |
| 2 | Compteurs | body.actives, body.aRisque, body.cloturees | Valeurs numériques | PASS |
| 3 | Bandeau wrapper | body.bandeau | ABSENT (structure plate) | FAIL (spec vs impl) |

---

## US-012 : Consulter le detail d'une tournee

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Detail tournee | GET http://localhost:8082/api/supervision/tournees/tournee-sup-001 | HTTP 200 + champs details | PASS |
| 2 | Tournee inexistante | GET /api/supervision/tournees/INEXISTANT | HTTP 404 | PASS |
| 3 | RBAC livreur | GET avec ROLE_LIVREUR | HTTP 403 | PASS |

---

## US-013 : Alertes tournees a risque

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Tournee A_RISQUE | GET /api/supervision/tableau-de-bord | body.tournees contient A_RISQUE | PASS |
| 2 | Compteur aRisque | body.aRisque | >= 1 (tournee-sup-003) | PASS |

---

## US-014 : Envoyer une instruction a un livreur

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Instruction PRIORITAIRE | POST /api/supervision/instructions | HTTP 201 | PASS |
| 2 | REPROGRAMMER sans creneau | POST sans nouveauCreneau | HTTP 422 ou 400 | PARTIEL (400 recu) |
| 3 | Double PENDING | 2e instruction PENDING meme tournee | HTTP 409 | PASS |

---

## US-015 : Suivre l'execution d'une instruction

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Liste instructions | GET /api/supervision/instructions | HTTP 200 avec statuts | PASS |
| 2 | Marquer executee | PATCH /api/supervision/instructions/{id}/executer | HTTP 200 | PASS |
| 3 | Vue livreur | GET /instructions/en-attente?tourneeId=X | HTTP 200 | PASS |

---

## US-016 : Notification push instruction livreur

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Polling endpoint | GET /instructions/en-attente?tourneeId=X | HTTP 200 | PASS |
| 2 | Bandeau overlay | testID="bandeau-instruction-overlay" | Visible si instruction | PASS |
| 3 | Bouton VOIR | testID="bouton-voir-instruction" | Accessible | PASS |

---

## US-017 : Synchronisation OMS

### Pré-requis

Backend svc-oms sur port 8083 (profil dev).

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Creer evenement | POST http://localhost:8083/api/oms/evenements | HTTP 201 | PASS |
| 2 | Idempotence | Renvoi meme eventId | HTTP 409 | PASS |
| 3 | Historique colis | GET /api/oms/evenements/colis/colis-001 | Liste ASC | PASS |
| 4 | Mode degrade GPS | POST sans coordonnees | HTTP 201 (body vide) | PARTIEL (pas de modeDegradGPS dans reponse) |

---

## US-018 : Historisation immuable OMS

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Immuabilite PUT | PUT /api/oms/evenements/... | HTTP 405 | PASS |
| 2 | Immuabilite DELETE | DELETE /api/oms/evenements/... | HTTP 405 | PASS |
| 3 | Ordre chronologique | GET /api/oms/evenements/colis/{id} | Timestamps ASC | PASS |

---

## US-019 : Authentification SSO mobile

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Sans token | GET http://localhost:8081/api/tournees/today | HTTP 401 | PASS |
| 2 | RBAC LIVREUR | GET /api/supervision/** avec ROLE_LIVREUR | HTTP 403 | PASS |
| 3 | Avec MockJwt | GET /api/tournees/today (dev) | HTTP 200 | PASS |
| 4 | App mobile | Ouvrir http://localhost:8090 | App chargee | PASS |

---

## US-020 : Authentification SSO web supervision

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Health check | GET http://localhost:8082/actuator/health | HTTP 200 | PASS |
| 2 | Dashboard superviseur | GET /api/supervision/tableau-de-bord | HTTP 200 | PASS |
| 3 | Bandeau | body.bandeau present | ABSENT (structure plate) | FAIL (spec) |

---

## US-021 : Plan du jour

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Plan du jour | GET http://localhost:8082/api/planification/plans/2026-03-25 | HTTP 200 | PASS |
| 2 | Date invalide | GET /api/planification/plans/not-a-date | HTTP 400 | PASS |
| 3 | Tournees | body.tournees.length >= 4 | FAIL (seeder date fixe) | FAIL (OBS-021-01) |

---

## US-022 : Composition d'une tournee

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Detail tournee | GET http://localhost:8082/api/planification/tournees/tp-201 | HTTP 200 + zones[], contraintes | PASS |
| 2 | Valider composition | POST /composition/valider | compositionVerifiee=true | PASS |
| 3 | 404 inexistante | GET /api/planification/tournees/INEXISTANT | HTTP 404 | PASS |

---

## US-023 : Affecter livreur et vehicule

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Affectation reussie | POST /tournees/tp-201/affecter {"livreurId":"X","vehiculeId":"Y"} | HTTP 200 + AFFECTEE | PASS |
| 2 | Sans livreurId | POST sans livreurId | HTTP 400 | PASS |
| 3 | Livreur double | Affecter meme livreur 2 tournees | HTTP 409 | PASS |
| 4 | Tournee LANCEE | POST sur tp-204 | HTTP 409 | PASS |

---

## US-024 : Lancer une tournee

### Check-list de tests manuels

| # | Scénario | URL / Action | Résultat attendu | Statut |
|---|----------|-------------|-----------------|--------|
| 1 | Lancer AFFECTEE | POST /tournees/tp-202/lancer | HTTP 200 + LANCEE | PARTIEL (lanceeLe absent) |
| 2 | NON_AFFECTEE | POST sur tp-203 | HTTP 409 | PASS |
| 3 | Lancer-toutes | POST /plans/2026-03-25/lancer-toutes | HTTP 200 + nbTourneesLancees | PASS |
| 4 | Date invalide | POST /plans/not-a-date/lancer-toutes | HTTP 400 | PASS |

---

## US-066 : Page état des livreurs (W-08)

### Prérequis

```bash
# Démarrer svc-supervision (port 8082)
cd /home/admin/Botfactory/src/backend/svc-supervision
JAVA_HOME="/usr/lib/jvm/java-21-openjdk-arm64" \
  mvn spring-boot:run -Dspring-boot.run.profiles=dev &

# Attendre que le service soit prêt (environ 50s)
curl http://localhost:8082/actuator/health

# Démarrer le frontend supervision (port 3000)
cd /home/admin/Botfactory/src/web/supervision
REACT_APP_API_URL=http://localhost:8082 npm start
```

### URLs à tester

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Tableau de bord superviseur |
| Cliquer "Livreurs" dans la nav | Page W-08 état des livreurs |
| `http://localhost:8082/api/supervision/livreurs/etat-du-jour` | API backend |
| `http://localhost:8082/api/supervision/livreurs/etat-du-jour?date=2026-04-08` | API avec date explicite |

### Check-list de tests manuels

| # | Scénario | Action | Résultat attendu | Statut |
|---|----------|--------|-----------------|--------|
| 1 | Accès W-08 depuis nav | Cliquer "Livreurs" depuis W-01 | Page W-08 s'affiche sans rechargement complet | A tester |
| 2 | 6 livreurs affichés | Consulter W-08 | 6 lignes, une par livreur avec nom + badge état | A tester |
| 3 | Bandeau compteurs | Observer le bandeau en haut | Compteurs 1/4/1 (SANS/AFFECTE/EN_COURS) cohérents | A tester |
| 4 | Badge EN_COURS vert | Observer Paul Dupont | Badge vert "EN COURS — T-204" | A tester |
| 5 | Badge AFFECTE bleu | Observer Pierre Martin | Badge bleu "AFFECTE — T-201" | A tester |
| 6 | Badge SANS_TOURNEE gris | Observer Jean Moreau | Badge gris "SANS TOURNEE" | A tester |
| 7 | Filtre "Sans tournee" | Cliquer filtre SANS_TOURNEE | Seul Jean Moreau visible | A tester |
| 8 | Retour "Tous" | Cliquer filtre TOUS | 6 lignes de nouveau affichees | A tester |
| 9 | Bouton Affecter | Cliquer "Affecter" sur Jean Moreau | Redirection vers W-04 (planification) | A tester |
| 10 | Bouton Voir tournee | Cliquer "Voir tournée" sur Paul Dupont | Redirection vers W-02 (detail tournee) | A tester |
| 11 | Retour tableau de bord | Cliquer "Retour au tableau de bord" | Retour sur W-01 | A tester |
| 12 | API directe | curl avec token Bearer | HTTP 200, 6 livreurs (apres correction OBS-066-02) | FAIL (bug OBS-066-02) |

### Notes

> **Anomalie bloquante OBS-066-02** : L'API `/api/supervision/livreurs/etat-du-jour` retourne
> tous les livreurs avec l'état SANS_TOURNEE car les IDs dans `DevLivreurReferentiel`
> (`livreur-paul-dupont`) ne correspondent pas aux IDs du `DevDataSeeder` (`livreur-002`).
> Demander à @developpeur de corriger `DevLivreurReferentiel.java` avant de valider les
> tests manuels 3 à 12.

### Token Bearer pour tester l'API en direct

```bash
curl -H "Authorization: Bearer dev-token-superviseur" \
  http://localhost:8082/api/supervision/livreurs/etat-du-jour
```

