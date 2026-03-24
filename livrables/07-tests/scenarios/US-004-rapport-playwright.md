# Rapport d'exécution Playwright — US-004 : Accéder au détail d'un colis

**Date d'exécution** : 2026-03-24
**Environnement** :
- Backend : Spring Boot 3.4.3, port 8081, profil dev, JAVA_HOME `C:/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot`
- Frontend : Expo Web, port 8082
- Navigateur : Chromium (Playwright)
- Données de test : DevDataSeeder — tournee-dev-001, 5 colis (Zone A x2, Zone B x2, Zone C x1)

---

## Synthèse globale

| Métrique | Valeur |
|----------|--------|
| Tests exécutés | 11 |
| Tests passés | 11 |
| Tests échoués | 0 |
| Tests bloqués | 0 |
| Durée totale | ~35s |

**Résultat : 11/11 PASSÉ**

---

## Résultats par TC

| TC | Titre | Couche | Résultat | Durée | Notes |
|----|-------|--------|----------|-------|-------|
| TC-087 | Navigation M-02 vers M-03 | E2E UI | Passé | 4.6s | Détection via `bouton-retour` (pas de testID racine `detail-colis-screen`) |
| TC-088 | M-03 affiche destinataire et adresse | E2E UI | Passé | 3.6s | testIDs réels : `destinataire-nom`, `adresse-complete` |
| TC-089 | Boutons d'action présents (colis A_LIVRER) | E2E UI | Passé | 3.6s | `bouton-livrer` + `bouton-echec` visibles |
| TC-090 | Boutons d'action absents (colis LIVRE) | E2E UI | Passé | 3.5s | `colis-dev-004` — boutons absents confirmés |
| TC-091 | Boutons d'action absents (colis ECHEC) | E2E UI | Passé | 3.5s | `colis-dev-005` — boutons absents confirmés |
| TC-092 | Téléphone non affiché en clair (RGPD) | E2E UI | Passé | 3.5s | Aucun pattern `06/07` trouvé dans le DOM visible — `bouton-appel` présent |
| TC-093 | Retour à la liste sans rechargement | E2E UI | Passé | 4.1s | 0 appel API supplémentaire après retour |
| TC-094 | API GET détail colis retourne 200 | E2E API | Passé | 125ms | Format JSON complet vérifié (statut peut être A_LIVRER ou ECHEC) |
| TC-095 | API GET colis livré retourne estTraite: true | E2E API | Passé | 37ms | `colis-dev-004` : `estTraite: true`, `statut: "LIVRE"` |
| TC-096 | API GET colis inexistant retourne 404 | E2E API | Passé | 33ms | HTTP 404 confirmé |
| TC-097 | Contraintes affichées pour un colis avec contrainte | E2E UI | Passé | 3.5s | `section-contraintes` visible sur `colis-dev-001` (contrainte HORAIRE "Avant 14h00") |

---

## Observations notables

### Invariant RGPD (TC-092)
Le numéro `0601020304` du destinataire n'apparaît **pas** dans le DOM visible. Log : `TC-092 : Numéro dans le contenu de la page (inclut href) : false`. L'invariant RGPD est respecté — le numéro est accessible uniquement via `Linking.openURL('tel:...')`.

### Absence de testID racine sur M-03
`DetailColisScreen` n'expose pas de `testID="detail-colis-screen"` au niveau de la vue racine. La détection E2E s'appuie sur `bouton-retour` (toujours présent dans les trois états de l'écran : chargement, erreur, succès).

### Retour sans rechargement (TC-093)
0 appel supplémentaire à `/api/tournees/today` après le clic sur `bouton-retour`. La navigation interne (`NavigationColis`) fonctionne correctement.

---

## Screenshots

| TC | Fichier |
|----|---------|
| TC-087 | `livrables/07-tests/screenshots/US-004/TC-087-navigation-detail-colis.png` |
| TC-088 | `livrables/07-tests/screenshots/US-004/TC-088-detail-destinataire-adresse.png` |
| TC-089 | `livrables/07-tests/screenshots/US-004/TC-089-boutons-action-a-livrer.png` |
| TC-090 | `livrables/07-tests/screenshots/US-004/TC-090-boutons-absents-livre.png` |
| TC-091 | `livrables/07-tests/screenshots/US-004/TC-091-boutons-absents-echec.png` |
| TC-092 | `livrables/07-tests/screenshots/US-004/TC-092-telephone-masque-rgpd.png` |
| TC-093 | `livrables/07-tests/screenshots/US-004/TC-093-retour-liste.png` |
| TC-097 | `livrables/07-tests/screenshots/US-004/TC-097-contraintes-affichees.png` |

---

## Rapport HTML Playwright

Disponible dans : `/livrables/07-tests/rapports/index.html`

---

## Statuts mis à jour dans US-004-scenarios.md

| TC | Statut |
|----|--------|
| TC-087 | Passé |
| TC-088 | Passé |
| TC-089 | Passé |
| TC-090 | Passé |
| TC-091 | Passé |
| TC-092 | Passé |
| TC-093 | Passé |
| TC-094 | Passé |
| TC-095 | Passé |
| TC-096 | Passé |
| TC-097 | Passé |

Les TCs 074 à 086 (Domain, Application, Infrastructure) sont couverts par les tests unitaires Java (`ConsulterDetailColisHandlerTest`, `DetailColisControllerTest`) — 34/34 verts selon US-004-impl.md.
