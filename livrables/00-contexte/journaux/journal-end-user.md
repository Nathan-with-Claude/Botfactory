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

| Date | US testée | Persona | Feedback | Priorité | Statut |
|------|-----------|---------|----------|----------|--------|
| 2026-03-19 | (général) | Pierre | Feedback initial général documenté | — | Archivé |
| 2026-03-20 | US-001 | Pierre Morel | 3 bloquants (ordre de passage, colis urgents invisibles, infos accès absentes), 5 améliorations, note 3/5 | Critique | Livré |

---

## Interventions réalisées

| Date | Sujet | Fichier |
|------|-------|---------|
| 2026-03-19 | Feedback initial (général) | /livrables/09-feedback/feedback-enduser.md |
| 2026-03-20 | Feedback US-001 — Liste des colis (Pierre Morel) | /livrables/09-feedback/feedback-US001-liste-colis-2026-03-20.md |

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
