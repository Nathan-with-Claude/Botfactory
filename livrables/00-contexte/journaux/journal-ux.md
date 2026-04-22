# Journal de bord — @ux — DocuPost

> **RÈGLE** : Lire ce fichier EN DÉBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier remplace la relecture complète de `/livrables/02-ux/`.

---

## Contexte synthétisé

- **Livrables propriété** : `02-ux/` (personas.md v1.1, user-journeys.md v1.3, wireframes.md v1.5)
- **Personas actifs** : 4 (Pierre livreur, Laurent/Karim superviseur, Sophie DSI, Éric architecte)
- **Parcours documentés** : 8 (Parcours 0 à 7)
- **Wireframes** : 14 écrans (M-01→M-08 mobile, W-01→W-05 + W-08 + W-09 web)

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
| W-08 | État des livreurs | Web | Parcours 6 |

---

## Décisions structurantes

| Date | Décision | Justification |
|------|----------|---------------|
| 2026-03-19 | Laurent Renaud = persona unique couvrant supervision ET logistique | Même personne physique, deux moments de la journée |
| 2026-03-19 | Wireframes textuels uniquement (pas de maquettes visuelles) | Phase de cadrage — spécifications fonctionnelles d'abord |
| 2026-03-19 | M-03 intègre motifs normalisés (liste fermée) | Besoin M. Renaud : motifs analysables, pas de texte libre |
| 2026-03-20 | W-04 : statut d'affectation visible en 1 coup d'œil (code couleur textuel) | Contrainte temporelle : Laurent a < 30 min le matin |
| 2026-03-20 | W-05 : 2 onglets Composition / Affectation | Séparer vérification et affectation pour clarté mentale |
| 2026-04-02 | M-01 : repliage card SSO avant connexion = session courante uniquement, non mémorisé | US-043 — distinction avec le mémorisation post-connexion (US-036) |
| 2026-04-02 | M-07 : horodatage affiché = horodatageReception (local) et non horodatage serveur | US-042 — l'horodatage pertinent pour le livreur est celui de la réception |
| 2026-04-02 | W-01 : compteur déconnexion WebSocket = état local du composant, non persisté | US-044 — donnée volatile, utile sur le moment, inutile au rechargement |
| 2026-04-06 | W-08 : écran lecture seule — aucune action d'affectation n'est déclenchée depuis cet écran | Invariant US-066 : séparation lecture (BC-03) / écriture (BC-07). Affecter = redirection W-04. |
| 2026-04-06 | W-08 : tri par défaut EN_COURS > AFFECTE_NON_LANCE > SANS_TOURNEE | Les livreurs actifs sont les plus utiles à surveiller ; les livreurs sans tournée sont en bas car l'urgence est moindre |
| 2026-04-06 | W-08 : troisième entrée SideNavBar "Livreurs" sous "Supervision" | Cohérence shell : W-08 est une page autonome, pas un sous-onglet de W-01 |

---

## Interventions réalisées

| Date | Version | Sujet | Fichiers |
|------|---------|-------|----------|
| 2026-03-19 | 1.0 | Création — 4 personas, 5 parcours (1→5), 9 wireframes (M-01→M-06, W-01→W-03) | personas.md, user-journeys.md, wireframes.md |
| 2026-03-20 | 1.1 | Ajout Parcours 0 : enrichissement persona Laurent (rôle préparation), Parcours 0 AS-IS/TO-BE, wireframes W-04 et W-05 | personas.md, user-journeys.md, wireframes.md |
| 2026-04-02 | 1.3 | Mise à jour wireframes : M-01 card SSO rétractable avant connexion (US-043), M-02 hint swipe onboarding (US-045), M-04 pad signature réel react-native-signature-canvas (US-046), M-07 NOUVEAU écran "Mes consignes" avec horodatage (US-037, US-042), W-01 compteur déconnexion WebSocket (US-044) | wireframes.md |
| 2026-04-06 | 1.4 | Wireframe W-08 "État des livreurs" (US-066) : tableau VueLivreur temps réel, 3 tuiles KPI, filtres rapides, badges SANS_TOURNEE/AFFECTÉ/EN COURS, navigation W-04/W-05/W-02. Parcours 6 "Vérifier la disponibilité des livreurs". Glossaire enrichi (8 nouveaux termes). | wireframes.md, user-journeys.md |
| 2026-04-21 | 1.5 | Feature Broadcast MVP (@sponsor 2026-04-21) : Parcours 7 "Superviseur : Envoyer un broadcast", wireframe W-09 (panneau broadcast superviseur web), wireframe M-08 (zone messages broadcast mobile livreur), enrichissement persona superviseur (Karim B.), 13 nouveaux termes Ubiquitous Language (broadcast, alerte, info, consigne, ciblage, secteur, livreurs actifs, statut vu, historique broadcast…). | personas.md, user-journeys.md, wireframes.md |

---

## Points d'attention — prochaines interventions

- **M-08 livré** — Prochain écran mobile si besoin : M-09 (récapitulatif de clôture enrichi, hors scope actuel)
- Le persona **Laurent/Karim** a deux modes : matin (Parcours 0, préparation) / journée (Parcours 2, supervision) — ne pas confondre les contextes
- Le **mode offline** (Pierre) doit être reflété dans tout wireframe mobile : M-08 documente le comportement offline (messages FCM non reçus, stockage local des messages déjà reçus)
- Les **états d'erreur** (import TMS échoué, livreur indisponible) doivent figurer dans tout wireframe W-04/W-05 ajouté
- US-043 (card SSO avant connexion) et US-036 (post-connexion) forment un comportement composite — tout nouveau wireframe M-01 doit documenter les deux états
- La **dette technique pad signature** (US-046) est soldée côté wireframe : M-04 documente maintenant le composant react-native-signature-canvas avec ses invariants légaux
- **W-08 (US-066)** : wireframe complet livré. @architecte-metier doit confirmer la position de VueLivreur dans BC-03, @architecte-technique doit valider l'endpoint GET /api/supervision/livreurs/etat-du-jour
- **SideNavBar** : quatre entrées désormais (Préparation / Supervision / Livreurs / Broadcast) — le développeur doit mettre à jour le composant NavBar React pour ajouter l'entrée "Broadcast" avec icône `campaign`
- **W-09 / M-08 (Broadcast)** : wireframes livrés — prochaines étapes :
  - @architecte-metier : confirmer rattachement BroadcastMessage dans BC-03 (déjà fait v1.3) et valider les nouveaux Domain Events BroadcastEnvoyé / BroadcastLu
  - @architecte-technique : spécifier l'endpoint POST /api/supervision/broadcasts et le mécanisme d'accusé de réception FCM pour le statut "vu"
  - @po : créer les User Stories pour W-09 et M-08 dans le backlog
- **Parcours 7** enrichit l'Ubiquitous Language : 13 termes nouveaux (broadcast, message broadcast, alerte, info, consigne, ciblage, secteur, livreurs actifs, statut vu, historique broadcast…) — transmis à @architecte-metier via le glossaire user-journeys.md
