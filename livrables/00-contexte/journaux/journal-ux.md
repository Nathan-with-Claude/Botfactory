# Journal de bord — @ux — DocuPost

> **RÈGLE** : Lire ce fichier EN DÉBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier remplace la relecture complète de `/livrables/02-ux/`.

---

## Contexte synthétisé

- **Livrables propriété** : `02-ux/` (personas.md v1.1, user-journeys.md v1.1, wireframes.md v1.1)
- **Personas actifs** : 4 (Pierre livreur, Laurent logisticien/superviseur, Sophie DSI, Éric architecte)
- **Parcours documentés** : 6 (Parcours 0 à 5)
- **Wireframes** : 11 écrans (M-01→M-06 mobile, W-01→W-05 web)

### Personas en résumé

| Persona | Rôle | Interface | Parcours couverts |
|---------|------|-----------|-------------------|
| Pierre Morel | Livreur terrain (80-120 colis/jour, Android, offline) | Mobile | 1, 3, 4 |
| Laurent Renaud | Responsable logistique (préparation 6h00) + superviseur (pilotage journée) | Web | 0, 2, 5 |
| Sophie Dubois | DSI / Donneur d'ordre (litiges, conformité, reporting) | — | — |
| Éric Garnier | Architecte Technique DSI (SI, OMS, non-fonctionnel) | — | — |

### Wireframes en résumé

| Réf | Nom | Interface | Parcours |
|-----|-----|-----------|---------|
| M-01 | Liste des colis de la tournée | Mobile | Parcours 1 |
| M-02 | Détail d'un colis | Mobile | Parcours 1 |
| M-03 | Déclaration d'un échec de livraison | Mobile | Parcours 3 |
| M-04 | Capture de preuve — Signature | Mobile | Parcours 4 |
| M-05 | Capture de preuve — Photo / Tiers | Mobile | Parcours 4 |
| M-06 | Récapitulatif de clôture de tournée | Mobile | Parcours 1 |
| W-01 | Tableau de bord superviseur | Web | Parcours 2 |
| W-02 | Détail d'une tournée (superviseur) | Web | Parcours 2 |
| W-03 | Envoi d'une instruction | Web | Parcours 5 |
| W-04 | Vue liste des tournées du matin | Web | Parcours 0 |
| W-05 | Détail d'une tournée à préparer (affectation) | Web | Parcours 0 |

---

## Décisions structurantes

| Date | Décision | Justification |
|------|----------|---------------|
| 2026-03-19 | Laurent Renaud = persona unique couvrant supervision ET logistique | Même personne physique, deux moments de la journée |
| 2026-03-19 | Wireframes textuels uniquement (pas de maquettes visuelles) | Phase de cadrage — spécifications fonctionnelles d'abord |
| 2026-03-19 | M-03 intègre motifs normalisés (liste fermée) | Besoin M. Renaud : motifs analysables, pas de texte libre |
| 2026-03-20 | W-04 : statut d'affectation visible en 1 coup d'œil (code couleur textuel) | Contrainte temporelle : Laurent a < 30 min le matin |
| 2026-03-20 | W-05 : 2 onglets Composition / Affectation | Séparer vérification et affectation pour clarté mentale |

---

## Interventions réalisées

| Date | Version | Sujet | Fichiers |
|------|---------|-------|----------|
| 2026-03-19 | 1.0 | Création — 4 personas, 5 parcours (1→5), 9 wireframes (M-01→M-06, W-01→W-03) | personas.md, user-journeys.md, wireframes.md |
| 2026-03-20 | 1.1 | Ajout Parcours 0 : enrichissement persona Laurent (rôle préparation), Parcours 0 AS-IS/TO-BE, wireframes W-04 et W-05 | personas.md, user-journeys.md, wireframes.md |

---

## Points d'attention — prochaines interventions

- Si une US implique un **nouvel écran**, lui assigner la prochaine référence disponible (M-07 ou W-06)
- Le persona **Laurent** a deux modes : matin (Parcours 0, préparation) / journée (Parcours 2, supervision) — ne pas confondre les contextes
- Le **mode offline** (Pierre) doit être reflété dans tout wireframe mobile : indiquer l'état de synchronisation
- Les **états d'erreur** (import TMS échoué, livreur indisponible) doivent figurer dans tout wireframe W-04/W-05 ajouté
