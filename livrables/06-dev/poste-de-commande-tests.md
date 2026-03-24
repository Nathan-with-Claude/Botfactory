---
# Poste de commande — Tests manuels DocuPost

> Ce fichier est destiné au Product Owner / Expert métier pour valider chaque US en local.
> Pour chaque US : suivre la check-list, noter les observations dans "Notes perso", puis remonter les blocages via le feedback structuré.

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
