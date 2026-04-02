# US-038 : Harmoniser les libellés de l'interface avec le langage naturel terrain

**Epic** : EPIC-008 : Qualite UX et Accessibilite
**Feature** : F-022 : Harmonisation du langage de l'interface avec l'Ubiquitous Language terrain
**Bounded Context** : BC-01 Execution Tournee (mobile) + BC-03 Supervision (web)
**Aggregate(s) touches** : (lecture / affichage — aucun Aggregate metier modifie)
**Priorite** : Should Have
**Statut** : Prete
**Complexite estimee** : S

---

## User Story

En tant que livreur terrain ou superviseur logistique,
je veux que les libelles affiches a l'ecran correspondent aux termes que j'utilise
naturellement sur le terrain,
afin de reduire la charge cognitive et les erreurs d'interpretation en conditions reelles
(soleil, deplacement, pression de temps).

---

## Contexte

Feedbacks terrain du 2026-03-30 (Pierre Morel) et du 2026-04-01 (Pierre Morel et Laurent Renaud)
identifient plusieurs libelles techniques ou abbrevies qui genent la lisibilite en conditions reelles.

Cette US couvre un ensemble de corrections de libellés cohérentes qui ne modifient aucun
comportement fonctionnel — uniquement les textes affichés à l'ecran.

**Liste des corrections de libelles** :

| Ecran | Libelle actuel | Libelle propose | Composant cible |
|-------|---------------|-----------------|-----------------|
| M-02 (onglet liste colis) | "A repr." | "Repassage" | onglet filtre |
| M-07 (bouton statut consigne) | "Exécutée" (bouton action) | "Traitée" | bouton M-07 |
| M-07 (statut consigne apres execution) | "Executee" | "Traitee" | BadgeStatut consigne |
| W-05 (indicateur compatibilite) | "Dépassement détecté" | "Chargement trop lourd" | BadgeCompatibilite |
| W-05 (bouton export) | "Exporter CSV" | "Télécharger la liste" | bouton export |
| W-01 (champ recherche) | "code TMS" (placeholder) | "numéro de tournée" | placeholder US-035 |

**Signal source** :
- "A repr." : signale les 30/03 et 01/04 par Pierre Morel — non corrige dans US-026.
- "Exécutée" : Pierre dit "c'est traite" ou "confirmé" — "exécutée" est trop formel.
- "Dépassement détecté" : Laurent dit "trop lourd" ou "chargement trop lourd".
- "Exporter CSV" : Laurent dit "Télécharger la liste" — "CSV" est un terme technique
  que les superviseurs moins techniques ne reconnaissent pas.
- "code TMS" : Laurent signale que ses collègues moins techniques ne savent pas ce que
  "TMS" signifie — "numéro de tournée" est le terme metier.

**Invariants a respecter** :
- Ces corrections sont purement visuelles (libellés affichés). Aucun identifiant technique,
  aucun Domain Event, aucune valeur d'enum ne doit être modifié.
- Les valeurs internes (ex. `StatutInstruction.EXECUTEE`) restent inchangées.
- L'Ubiquitous Language (domain-model.md) peut être enrichi des termes "Traitée" et
  "Repassage" comme synonymes d'affichage de "Executee" et "A representer".

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Onglet "Repassage" dans M-02

```gherkin
Given le livreur est sur M-02 (liste de colis de la tournee)
And des colis ont le statut "A representer"
When l'ecran M-02 est affiche
Then l'onglet de filtre affiche le libelle "Repassage"
And aucun onglet n'affiche "A repr." ni "A representer" en forme abbreviee
```

### Scenario 2 — Bouton "Traitee" dans M-07

```gherkin
Given le livreur est sur M-07 (ecran "Mes consignes")
And une consigne C-001 est au statut "Prise en compte" ou "Nouvelle"
When l'ecran M-07 est affiche
Then le bouton d'action sur la consigne affiche "Traitée" (et non "Marquer exécutée")
```

### Scenario 3 — Badge statut "Traitee" dans M-07

```gherkin
Given le livreur a marque une consigne comme traitee
When M-07 affiche la consigne
Then le badge de statut affiche "Traitée" (et non "Executee")
And la valeur interne StatutInstruction.EXECUTEE reste inchangee
```

### Scenario 4 — Indicateur "Chargement trop lourd" dans W-05

```gherkin
Given le superviseur est sur W-05 (detail tournee planifiee)
And la verification de compatibilite vehicule a detecte un depassement
When l'ecran W-05 affiche l'indicateur de compatibilite
Then l'indicateur affiche "Chargement trop lourd" (et non "Depassement détecté")
And l'indicateur reste en couleur d'alerte (orange / rouge)
```

### Scenario 5 — Bouton "Telecharger la liste" dans W-05

```gherkin
Given le superviseur est sur W-05 (onglet Composition)
When l'ecran W-05 est affiche
Then le bouton d'export affiche "Télécharger la liste" (et non "Exporter CSV")
And le clic sur ce bouton declenche le telechargement du fichier CSV
And l'evenement CompositionExportee est emis
```

### Scenario 6 — Placeholder "numéro de tournée" dans W-01

```gherkin
Given le superviseur est sur W-01 (tableau de bord)
When le champ de recherche multi-criteres est affiche
Then le placeholder contient "numéro de tournée" en remplacement de "code TMS"
And la recherche par valeur TMS (ex. "T-205") continue de fonctionner
```

---

## Definition of Done

- [ ] Onglet "Repassage" affiche dans M-02 a la place de "A repr." ou "A representer".
- [ ] Bouton et badge "Traitee" affiches dans M-07 — enum interne StatutInstruction.EXECUTEE inchange.
- [ ] Indicateur "Chargement trop lourd" affiches dans W-05 — enum ResultatCompatibilite.DEPASSEMENT inchange.
- [ ] Bouton "Telecharger la liste" dans W-05 — comportement identique a "Exporter CSV".
- [ ] Placeholder "numero de tournee" dans W-01 — recherche TMS inchangee.
- [ ] Tests unitaires mis a jour pour refléter les nouveaux libellés.
- [ ] Aucune regression sur les fonctionnalites liées (US-003, US-030, US-028, US-035, US-037).

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#M-02, #W-05, #W-01
- Feedback source livreur : /livrables/09-feedback/feedback-livreur-2026-04-01.md
- Feedback source superviseur : /livrables/09-feedback/feedback-superviseur-2026-04-01.md
- US liées : US-003 (filtre zone), US-028 (export CSV), US-030 (compatibilite vehicule), US-035 (recherche), US-037 (historique consignes)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
