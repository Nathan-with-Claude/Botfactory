# Rapport d'exécution Playwright — US-005 : Déclarer un échec de livraison

**Date d'exécution** : 2026-03-24
**Environnement** :
- Backend : Spring Boot 3.4.3, port 8081, profil dev, JAVA_HOME `C:/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot`
- Frontend : Expo Web, port 8082
- Navigateur : Chromium (Playwright)
- Données de test : DevDataSeeder — tournee-dev-001, 5 colis (3 A_LIVRER, 1 LIVRE, 1 ECHEC au démarrage)

---

## Synthèse globale

| Métrique | Valeur |
|----------|--------|
| Tests exécutés | 5 |
| Tests passés | 5 |
| Tests échoués | 0 |
| Tests bloqués | 0 |
| Durée totale | ~23s |

**Résultat : 5/5 PASSÉ**

---

## Résultats par TC

| TC | Titre | Couche | Résultat | Durée | Notes |
|----|-------|--------|----------|-------|-------|
| TC-118 | Navigation vers M-05 depuis "DECLARER UN ECHEC" | E2E UI | Passé | 5.1s | `bouton-echec` cliqué dans M-03 — M-05 détecté via `bouton-enregistrer-echec` |
| TC-119 | Bouton désactivé sans motif ni disposition | E2E UI | Passé | 5.4s | `bouton-enregistrer-echec` disabled = true confirmé |
| TC-120 | Déclaration d'échec nominal (Absent / À représenter) | E2E UI | Passé | 9.0s | `motif-ABSENT` + `disposition-A_REPRESENTER` sélectionnés → bouton actif → retour M-02 |
| TC-121 | API POST /echec retourne 200 | E2E API | Passé | 117ms | HTTP 200, `statut: "ECHEC"`, `motifNonLivraison: "ABSENT"` |
| TC-122 | API POST /echec retourne 409 (déjà en ECHEC) | E2E API | Passé | 29ms | `colis-dev-005` déjà en ECHEC — HTTP 409 confirmé |

---

## Observations notables

### Invariant de transition (TC-122)
La transition `ECHEC → ECHEC` est correctement bloquée par le domaine (`TourneeInvariantException`) et traduite en HTTP 409 par le contrôleur REST.

### Navigation M-05 (TC-118)
`DeclarerEchecScreen` n'expose pas de `testID="declarer-echec-screen"` au niveau racine. La détection s'appuie sur `bouton-enregistrer-echec` (présent dès le montage de l'écran). Ce point d'attention est documenté pour l'implémentation.

### Bouton désactivé (TC-119)
`bouton-enregistrer-echec` est bien désactivé (`disabled = true`) tant que le motif ET la disposition ne sont pas tous deux sélectionnés. L'invariant frontend est respecté.

### Parcours complet TC-120
1. M-02 → clic sur colis A_LIVRER → M-03
2. M-03 → clic "DECLARER UN ECHEC" → M-05
3. M-05 → sélection ABSENT + A_REPRESENTER → bouton actif
4. Clic "ENREGISTRER L'ECHEC" → retour M-02 avec colis mis à jour
Log : `TC-120 : Bouton ENREGISTRER actif après sélection : true`

---

## Screenshots

| TC | Fichier |
|----|---------|
| TC-118 | `livrables/07-tests/screenshots/US-005/TC-118-navigation-m05.png` |
| TC-119 | `livrables/07-tests/screenshots/US-005/TC-119-bouton-desactive.png` |
| TC-120 | `livrables/07-tests/screenshots/US-005/TC-120-ecran-m05-ouvert.png` |
| TC-120 | `livrables/07-tests/screenshots/US-005/TC-120-apres-echec-declare.png` |

---

## Rapport HTML Playwright

Disponible dans : `/livrables/07-tests/rapports/index.html`

---

## Statuts mis à jour dans US-005-scenarios.md

| TC | Statut |
|----|--------|
| TC-118 | Passé |
| TC-119 | Passé |
| TC-120 | Passé |
| TC-121 | Passé |
| TC-122 | Passé |

Les TCs 098 à 117 (Domain, Application, Infrastructure) sont couverts par les tests unitaires Java (`DeclarerEchecLivraisonTest`, `DeclarerEchecLivraisonHandlerTest`, `EchecLivraisonControllerTest`) — 54/54 verts selon US-005-impl.md.
