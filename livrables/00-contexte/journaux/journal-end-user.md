# Journal de bord — @end-user — DocuPost

> **REGLE** : Lire ce fichier EN DEBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier synthétise le profil des utilisateurs terrain et suit les feedbacks collectés.

---

## Contexte synthétisé

- **Livrables propriété** : `09-feedback/`
- **Utilisateurs terrain principaux** :
  - **Pierre Morel** — livreur, 6 ans d'ancienneté, 80-120 colis/jour, Android, zones péri-urbaines, offline fréquent
  - **Laurent Renaud** — responsable logistique, préparation 6h00-7h00, supervision journée, interface web PC bureau
- **Wireframes de référence** : `/livrables/02-ux/wireframes.md` (M-01 à M-06 pour Pierre, W-01 à W-05 pour Laurent)

### Critères de satisfaction terrain (extraits entretiens)

| Persona | Critère | Source |
|---------|---------|--------|
| Pierre | Mise à jour statut < 45 sec, d'une main | Entretien terrain |
| Pierre | Lisibilité en plein soleil et pluie | Entretien terrain |
| Pierre | Fonctionnel sans réseau (offline) | Entretien terrain |
| Laurent | Préparation tournées < 30 min le matin | Entretien logistique 20/03 |
| Laurent | Détection retard < 15 min | Entretien terrain |
| Laurent | Instruction sans appel téléphonique | Entretien terrain |

---

## Suivi des feedbacks

| Date       | US testée        | Persona        | Résumé                                                                                                                                 | Priorité | Statut                |
| ---------- | ---------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------- |
| 2026-03-19 | (général)        | Pierre         | Feedback initial général documenté                                                                                                     | —        | Archivé               |
| 2026-03-20 | US-001           | Pierre Morel   | 3 bloquants (ordre de passage, colis urgents invisibles, infos accès absentes), 5 améliorations, note 3/5                              | Critique | Livré                 |
| 2026-03-30 | US-001 à US-021  | Pierre Morel   | 3 bloquants (signature simulée, offline invisible, bouton scanner inactif) + 8 améliorations                                           | Critique | Adressé (B2+B3 corrigés 01/04 ; B1 signature persistant ; US-034/036/037 implémentées ; nouvelles US créées) |
| 2026-03-30 | US-011 à US-032  | Laurent Renaud | 3 bloquants (titre onglet, WebSocket sans bouton, pas de confirmation instruction) + 8 améliorations                                   | Critique | Adressé (B1 déjà résolu ; B2+B3 corrigés 01/04 ; US-034/035 implémentées ; nouvelles US créées) |
| 2026-04-04 | US-051, US-055, US-056 | Pierre Morel | 2 bloquants (compteur offline invisible, signature simulée persistante) + 3 importants (bouton Retour partiel, "A repr.", bouton Scanner) — note 5.5/10 | Critique | Adressé (US-046 signature réelle livré ; US-062 compteur livré ; Retour Android R2 en cours) |
| 2026-04-05 | US-046, US-055, US-056, US-062, US-038, US-043 | Pierre Morel | 1 bloquant (Retour Android R2 partiel) + 4 importants (libellés "A repr.", bouton Scanner, navigation preuve, horodatage consignes) — note 7/10 | Important | En cours |
| 2026-04-05 | US-039, US-040, US-041, US-044 | Laurent Renaud | 2 bloquants (lancement groupé des tournées affectées, recommandation véhicule manquante W-04) + 3 importants (heure clôture CSV, confirmation instruction, compteur WS temps réel) — note 7.5/10 | Important | En cours |
| 2026-04-01 | US-025 à US-037  | Pierre Morel   | 3 bloquants (signature toujours simulée, offline silencieux, swipe invisible) + 7 améliorations                                        | Critique | B2+B6 corrigés le 01/04 ; B1 (signature) — US manquante à créer ; améliorations → US-038/042/043/045 en backlog |
| 2026-04-01 | US-027 à US-035  | Laurent Renaud | 3 bloquants persistants (titre onglet, WebSocket, confirmation instruction) + 6 améliorations dont livreurId US-032                    | Critique | B1 (livreurId)+B4+B5 corrigés le 01/04 ; B3 déjà résolu avant session ; améliorations → US-039/040/041/044 en backlog |

---

## Interventions réalisées

| Date       | Sujet                                                       | Fichier                                                                    |
| ---------- | ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| 2026-03-19 | Feedback initial (général)                                  | /livrables/09-feedback/feedback-enduser.md                                 |
| 2026-03-20 | Feedback US-001 — Liste des colis (Pierre Morel)            | /livrables/09-feedback/feedback-US001-liste-colis-2026-03-20.md            |
| 2026-04-01 | Feedback livreur US-025/026/029/036/037 (Pierre Morel)      | /livrables/09-feedback/feedback-livreur-2026-04-01.md                      |
| 2026-04-01 | Feedback superviseur US-027/028/030/032/034/035 (L. Renaud) | /livrables/09-feedback/feedback-superviseur-2026-04-01.md                  |
| 2026-04-04 | Feedback corrections as-built 04/04 — US-051/055/056 (Pierre Morel) | /livrables/09-feedback/feedback-corrections-as-built-2026-04-04.md |
| 2026-04-02 | Mise à jour journal — bilan corrections bloquants 01/04 + état backlog US-038→US-045 | /livrables/00-contexte/journaux/journal-end-user.md |
| 2026-04-05 | Feedback livreur mobile — US-046/055/056/062/038/043 (Pierre Morel) | /livrables/09-feedback/feedback-mobile-livreur-2026-04-05.md |
| 2026-04-05 | Feedback superviseur web — US-039/040/041/044 (Laurent Renaud) | /livrables/09-feedback/feedback-supervision-superviseur-2026-04-05.md |

---

## Points d'attention — prochaines interventions

- Tester **chaque US avec le bon persona** : US-001→009, US-016 → Pierre ; US-021→024, US-011→015 → Laurent
- Signaler tout écran qui nécessite **plus de 3 taps** pour une action fréquente chez Pierre
- Pour Laurent : signaler tout flux qui dépasse **5 minutes** pour une action de préparation matinale
- Les feedbacks doivent être **priorisés** (critique / important / mineur) et liés à une US
- Format fichier feedback : `/livrables/09-feedback/feedback-[US ou feature]-[date].md`

### Points issus du feedback du 2026-04-05 — état initial

**Livreur (Pierre Morel) — bloquant actif :**
- **Retour Android R2** : migration BackHandler ajoutée dans les 5 sous-écrans (session dev 05/04), mais test terrain complet à confirmer.

**Livreur (Pierre Morel) — améliorations à traiter :**
- US-038 "A repr." -> "Repassage" : toujours en backlog, signalé 4 fois, correction triviale — à escalader @po
- Bouton "Scanner un colis" : statut fonctionnel à confirmer (@developpeur)
- Navigation retour dans M-04 (changer de type de preuve) : besoin d'une US dédiée
- Horodatage consignes M-07 : séparation visuelle jour courant / veille

**Superviseur (Laurent Renaud) — bloquants actifs :**
- Lancement groupé des tournées affectées (pas toutes) : US à créer @po
- Recommandation de véhicule dans tooltip W-04 : US à créer @po

**Superviseur (Laurent Renaud) — améliorations à traiter :**
- Colonne "Heure clôture" dans CSV bilan US-039 : enrichissement à demander @dev
- Confirmation envoi instruction au livreur : US à créer @po
- Compteur WS temps réel (vs sauts 60s) : amélioration US-044 à signaler @dev
- Recherche insensible à la casse dans W-04 : bug mineur @dev
- Tri livreurs "disponibles en premier" dans sélecteur W-05 : amélioration UX

### Points issus du feedback US-001 (à surveiller sur les prochaines US)

- Vérifier si l'**ordre de passage** est explicitement présent dans les écrans M-03 et au-delà
- Vérifier que les **colis avec contrainte horaire** remontent en tête de liste ou font l'objet d'un regroupement visible
- Confirmer que le terme **"Zone A / Zone B"** sera remplacé par des libellés géographiques réels (arrondissement, secteur)
- Vérifier que **"Clôturer la tournée"** est compris intuitivement — envisager "Terminer ma journée" ou "Boucler la tournée"
- Vérifier que **"Document sensible"** sera décliné en "Recommandé" / "Lettre recommandée" dans les étiquettes affichées

### Points issus des feedbacks du 2026-04-01 — état au 2026-04-02

**Bloquants résolus (session dev 01/04 14:30–14:38Z) :**
- ~~**Indicateur offline**~~ : `useNetworkStatus()` raccordé à `ListeColisScreen` + bandeau hors-ligne — ✅ Corrigé
- ~~**Swipe découvrabilité**~~ : hint "← Glisser" conditionnel (5 premières sessions AsyncStorage) — ✅ Corrigé
- ~~**Titre onglet navigateur**~~ : `TITRES_PAR_PAGE` + `document.title` dans App.tsx — ✅ Déjà corrigé avant 01/04
- ~~**Bouton "Reconnecter" WebSocket**~~ : `reconnecterManuellement()` + `compteur-deconnexion` ajoutés — ✅ Corrigé
- ~~**livreurId littéral US-032**~~ : injection `SupervisionNotifier` + `authentication.getName()` — ✅ Corrigé

**Bloquant légal persistant — CRITIQUE :**
- **Signature numérique** : intégration `react-native-signature-canvas` toujours absente après 3 feedbacks (20/03, 30/03, 01/04) — aucune US dans le backlog — **US à créer (@po)**

**Améliorations en backlog (US créées 01/04, non encore implémentées) :**
- US-038 : harmonisation libellés UX ("A repr."→"Repassage", "Exécutée"→"Traitée")
- US-039 : export CSV depuis tableau de bord W-01 (fin de journée Laurent)
- US-040 : enrichissement CSV colonnes Destinataire + Statut final
- US-041 : poids estimé + alerte surcharge dans W-04
- US-042 : horodatage consignes dans M-07 (XS — à implémenter)
- US-043 : card SSO rétractable avant connexion (S — à implémenter)
- US-044 : compteur durée déconnexion WebSocket format adaptatif (S — partiellement couvert bloquant 5, à compléter)
- US-045 : hint visuel swipe (déjà implémenté en pratique comme bloquant 6)

**Points signalés sans US :**
- Ordre de passage dans la liste des colis (feedback 20/03, jamais formalisé)
- Badge "Consignes" à distinguer visuellement du compteur colis (01/04 Pierre)
- Placeholder de recherche trop long (01/04 Laurent)
