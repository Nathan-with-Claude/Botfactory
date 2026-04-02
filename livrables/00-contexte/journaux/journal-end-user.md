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
| 2026-03-30 | US-001 à US-021  | Pierre Morel   | 3 bloquants (signature simulée, offline invisible, bouton scanner inactif) + 8 améliorations                                           | Critique | Partiellement adressé |
| 2026-03-30 | US-011 à US-032  | Laurent Renaud | 3 bloquants (titre onglet, WebSocket sans bouton, pas de confirmation instruction) + 8 améliorations                                   | Critique | Partiellement adressé |
| 2026-04-01 | US-025 à US-037  | Pierre Morel   | 3 bloquants (signature toujours simulée, offline silencieux, swipe invisible) + 7 améliorations                                        | Critique | En attente            |
| 2026-04-01 | US-027 à US-035  | Laurent Renaud | 3 bloquants persistants (titre onglet, WebSocket, confirmation instruction) + 6 améliorations dont livreurId US-032                    | Critique | En attente            |

---

## Interventions réalisées

| Date       | Sujet                                                       | Fichier                                                                    |
| ---------- | ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| 2026-03-19 | Feedback initial (général)                                  | /livrables/09-feedback/feedback-enduser.md                                 |
| 2026-03-20 | Feedback US-001 — Liste des colis (Pierre Morel)            | /livrables/09-feedback/feedback-US001-liste-colis-2026-03-20.md            |
| 2026-04-01 | Feedback livreur US-025/026/029/036/037 (Pierre Morel)      | /livrables/09-feedback/feedback-livreur-2026-04-01.md                      |
| 2026-04-01 | Feedback superviseur US-027/028/030/032/034/035 (L. Renaud) | /livrables/09-feedback/feedback-superviseur-2026-04-01.md                  |

---

## Points d'attention — prochaines interventions

- Tester **chaque US avec le bon persona** : US-001→009, US-016 → Pierre ; US-021→024, US-011→015 → Laurent
- Signaler tout écran qui nécessite **plus de 3 taps** pour une action fréquente chez Pierre
- Pour Laurent : signaler tout flux qui dépasse **5 minutes** pour une action de préparation matinale
- Les feedbacks doivent être **priorisés** (critique / important / mineur) et liés à une US
- Format fichier feedback : `/livrables/09-feedback/feedback-[US ou feature]-[date].md`

### Points issus du feedback US-001 (à surveiller sur les prochaines US)

- Vérifier si l'**ordre de passage** est explicitement présent dans les écrans M-03 et au-delà
- Vérifier que les **colis avec contrainte horaire** remontent en tête de liste ou font l'objet d'un regroupement visible
- Confirmer que le terme **"Zone A / Zone B"** sera remplacé par des libellés géographiques réels (arrondissement, secteur)
- Vérifier que **"Clôturer la tournée"** est compris intuitivement — envisager "Terminer ma journée" ou "Boucler la tournée"
- Vérifier que **"Document sensible"** sera décliné en "Recommandé" / "Lettre recommandée" dans les étiquettes affichées

### Points issus des feedbacks du 2026-04-01 (bloquants persistants à surveiller)

- **Signature numérique** : intégration `react-native-signature-canvas` toujours absente — bloquant légal avant mise en production
- **Indicateur offline** : `useNetworkStatus` créé mais raccordement à `ListeColisScreen` à confirmer — vérifier lors du prochain test manuel
- **Swipe découvrabilité** : aucun hint visuel pour le swipe gauche US-029 — risque d'adoption nulle sans onboarding
- **Titre onglet navigateur** : `<title>` HTML toujours absent dans les pages web — correction triviale, bloquant quotidien superviseur
- **Bouton "Reconnecter" WebSocket** : absent après 3 feedbacks successifs — risque opérationnel supervision
- **livreurId littéral US-032** : `"livreur"` affiché à la place du nom réel si VueTournee créée automatiquement — à corriger avant prod
- **Export CSV depuis tableau de bord W-01** : cas d'usage fin de journée non couvert (US-028 couvre uniquement W-05)
