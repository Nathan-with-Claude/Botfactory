# Scénarios de tests US-026

**US** : US-026 — Refactoriser les écrans livreur avec le Design System
**Contexte** : Refactorisation purement visuelle des écrans M-01 à M-06. Aucun changement
de logique métier. Les tests se concentrent sur (1) les nouveaux testIDs DS et (2) la
non-régression fonctionnelle des écrans existants.
**Prérequis** : US-025 validée (Design System disponible).
**Anomalies connues en entrée** : OBS-031-01 (ContextBannerColis hardcode non bloquant).

---

## TC-026-01 : BandeauProgression DS visible avec compteur "Reste à livrer"

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Tournée / aucun event (couche présentation)
**Type** : Fonctionnel — critère d'acceptation SC3
**Préconditions** : Tournée en cours avec 1 colis livré sur 2
**Étapes** :
1. Mock `getTourneeAujourdhui` → tournée `tournee-001` (2 colis, 1 livré, resteALivrer=1)
2. Rendre `<ListeColisScreen />`
3. Attendre la résolution du mock

**Résultat attendu** : testID `bandeau-compteur` présent avec texte contenant "Reste à livrer" et "1"
**Statut** : Passé

```gherkin
Given la tournée en cours avec 1 colis livré sur 2
When l'écran M-02 est affiché
Then le BandeauProgression indique "Reste à livrer : 1 / 2"
```

---

## TC-026-02 : BandeauProgression DS affiche l'estimation de fin

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Fonctionnel — critère d'acceptation SC3
**Préconditions** : Tournée avec `estimationFin = "17h30"`
**Étapes** :
1. Mock `getTourneeAujourdhui` → tournée avec `estimationFin: "17h30"`
2. Rendre `<ListeColisScreen />`
3. Attendre la résolution

**Résultat attendu** : testID `bandeau-fin-estimee` contient "17h30"
**Statut** : Passé

```gherkin
Given la tournée avec estimationFin "17h30"
When l'écran M-02 est affiché
Then le BandeauProgression affiche "17h30"
```

---

## TC-026-03 : BandeauProgression DS — estimation absente si null

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Edge case — SC3
**Préconditions** : Tournée avec `estimationFin = null`
**Étapes** :
1. Mock tournée avec `estimationFin: null`
2. Rendre `<ListeColisScreen />`
3. Vérifier l'absence du testID

**Résultat attendu** : `queryByTestId('bandeau-fin-estimee')` retourne null
**Statut** : Passé

```gherkin
Given la tournée sans estimation de fin
When l'écran M-02 est affiché
Then le testID "bandeau-fin-estimee" est absent
```

---

## TC-026-04 : CarteColis DS — rendu des colis dans la liste

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Fonctionnel — critère d'acceptation SC2
**Préconditions** : Tournée avec 2 colis (A_LIVRER + LIVRE)
**Étapes** :
1. Mock tournée avec 2 colis
2. Rendre `<ListeColisScreen />`
3. Compter les testIDs `carte-colis`

**Résultat attendu** : `getAllByTestId('carte-colis')` retourne 2 éléments
**Statut** : Passé

```gherkin
Given la liste des colis de la tournée affichée dans M-02
When les données sont chargées
Then 2 CarteColis DS sont rendues avec testID "carte-colis"
```

---

## TC-026-05 : CarteColis DS — adresse et destinataire accessibles

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Fonctionnel — SC2
**Préconditions** : Premier colis : adresse "12 Rue du Port, 69003 Lyon", destinataire "M. Dupont"
**Étapes** :
1. Mock tournée avec fixture standard
2. Rendre l'écran
3. Vérifier les testIDs `carte-colis-adresse` et `carte-colis-destinataire`

**Résultat attendu** :
- `carte-colis-adresse[0]` contient "12 Rue du Port, 69003 Lyon"
- `carte-colis-destinataire[0]` contient "M. Dupont"
**Statut** : Passé

```gherkin
Given un colis en position 1 de la liste
When CarteColis est rendu
Then l'adresse et le destinataire sont affichés via testIDs DS
```

---

## TC-026-06 : BadgeStatut DS — statuts A_LIVRER et LIVRE corrects

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Invariant domaine — SC2 (StatutColis via tokens sémantiques)
**Préconditions** : Tournée avec colis statut A_LIVRER et LIVRE
**Étapes** :
1. Rendre l'écran avec 2 colis
2. Récupérer tous `badge-statut`
3. Vérifier les labels UPPERCASE

**Résultat attendu** :
- `badge-statut[0]` contient "A LIVRER"
- `badge-statut[1]` contient "LIVRE"
**Statut** : Passé

```gherkin
Given un colis A_LIVRER et un colis LIVRE
When CarteColis les affiche
Then BadgeStatut affiche "A LIVRER" et "LIVRE" en UPPERCASE
```

---

## TC-026-07 : ChipContrainte DS — contrainte horaire visible dans CarteColis

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Fonctionnel — SC2
**Préconditions** : Premier colis avec contrainte HORAIRE "Avant 14h00"
**Étapes** :
1. Mock tournée avec colis ayant 1 contrainte horaire
2. Rendre l'écran
3. Compter les `chip-contrainte`

**Résultat attendu** : 1 seul `chip-contrainte` visible (colis 2 n'a pas de contrainte)
**Statut** : Passé

```gherkin
Given un colis avec contrainte HORAIRE
When CarteColis est rendu
Then un ChipContrainte DS est affiché avec testID "chip-contrainte"
```

---

## TC-026-08 : Non-régression M-02 — filtre zone Zone A (8 colis)

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Non régression — SC1 US-003
**Préconditions** : Tournée 3 zones (8 Zone A + 9 Zone B + 5 Zone C)
**Étapes** :
1. Rendre `<ListeColisScreen />`
2. Appuyer sur `onglet-Zone A`
3. Compter les `carte-colis`

**Résultat attendu** : exactement 8 CarteColis après filtre Zone A
**Statut** : Passé

```gherkin
Given la tournée avec 22 colis répartis en 3 zones
When le livreur sélectionne l'onglet Zone A
Then seules les 8 CarteColis de Zone A sont affichées
```

---

## TC-026-09 : Non-régression M-02 — bandeau invariant au filtre de zone

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Non régression — invariant US-003
**Préconditions** : Tournée 3 zones, resteALivrer = 20 (total tournée)
**Étapes** :
1. Rendre l'écran
2. Appuyer sur Zone A
3. Vérifier `bandeau-compteur`

**Résultat attendu** : `bandeau-compteur` affiche toujours "20" (total tournée, pas le filtre)
**Statut** : Passé

```gherkin
Given la liste filtrée sur Zone A (8 colis)
When le BandeauProgression DS est affiché
Then il affiche le total tournée (20) et non le total filtré (8)
```

---

## TC-026-10 : Non-régression M-02 — retour à l'onglet "Tous" après filtre

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Non régression — SC2 US-003
**Préconditions** : Filtre actif sur Zone A
**Étapes** :
1. Appuyer Zone A → 8 CarteColis
2. Appuyer onglet Tous
3. Compter les `carte-colis`

**Résultat attendu** : 22 CarteColis après retour sur "Tous"
**Statut** : Passé

```gherkin
Given le filtre Zone A actif
When le livreur appuie sur l'onglet Tous
Then toutes les 22 CarteColis sont de nouveau visibles
```

---

## TC-026-11 : Non-régression M-02 — bouton Clôture désactivé si resteALivrer > 0

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Non régression — SC4 US-002
**Préconditions** : Tournée avec resteALivrer = 1
**Étapes** :
1. Rendre l'écran
2. Récupérer `bouton-cloture`
3. Vérifier l'état disabled

**Résultat attendu** : `accessibilityState.disabled` ou prop `disabled` = true
**Statut** : Passé

```gherkin
Given la tournée avec 1 colis encore à livrer
When GlassEffectFooter est affiché
Then le bouton Clôture est désactivé
```

---

## TC-026-12 : Non-régression M-02 — bouton Clôture activé si resteALivrer = 0

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Non régression — SC4 US-002
**Préconditions** : Tournée avec tous les colis traités
**Étapes** :
1. Mock tournée avec resteALivrer = 0
2. Rendre l'écran
3. Vérifier `bouton-cloture`

**Résultat attendu** : testID `bouton-cloture` présent
**Statut** : Passé

```gherkin
Given la tournée avec tous les colis traités
When GlassEffectFooter est affiché
Then le bouton Clôture est visible (resteALivrer = 0)
```

---

## TC-026-13 : BadgeStatut DS dans DetailColisScreen (M-03) — statut ECHEC

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Fonctionnel — critère d'acceptation SC4
**Préconditions** : Écran M-03 ouvert sur un colis ECHEC
**Étapes** :
1. Mock `getDetailColis` → colis ECHEC
2. Rendre `<DetailColisScreen />`
3. Attendre chargement
4. Vérifier la présence du message statut terminal

**Résultat attendu** : `message-statut-terminal` contient "Echec"
**Statut** : Passé

```gherkin
Given l'écran M-03 ouvert pour un colis ECHEC
When le header est rendu
Then le message de statut terminal contient "Echec"
```

---

## TC-026-14 : ChipContrainte DS dans DetailColisScreen (M-03) — 2 contraintes

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Fonctionnel — critère d'acceptation SC4
**Préconditions** : Colis avec 2 contraintes (HORAIRE + FRAGILE)
**Étapes** :
1. Mock colis avec `contraintes: [{HORAIRE}, {FRAGILE}]`
2. Rendre M-03
3. Récupérer tous `chip-contrainte`

**Résultat attendu** :
- 2 ChipContrainte DS rendus
- chip[0] contient "Avant" (contrainte horaire)
- chip[1] contient "Fragile"
**Statut** : Passé

```gherkin
Given un colis avec contraintes HORAIRE et FRAGILE
When DetailColisScreen est rendu
Then 2 ChipContrainte DS sont visibles avec les valeurs correctes
```

---

## TC-026-15 : Section contraintes absente si colis sans contrainte (M-03)

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Colis / aucun
**Type** : Edge case — SC4 (section Historique masquée si vide)
**Préconditions** : Colis LIVRE sans contraintes
**Étapes** :
1. Mock colis LIVRE avec `contraintes: []`
2. Rendre M-03
3. Vérifier l'absence de `section-contraintes`

**Résultat attendu** : `queryByTestId('section-contraintes')` retourne null
**Statut** : Passé

```gherkin
Given un colis sans contraintes
When DetailColisScreen est rendu
Then la section contraintes est masquée
```

---

## TC-026-16 : CardTypePreuve DS (M-04) — 4 types sélectionnables

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Colis / PreuveCapturee (déclenchée en aval)
**Type** : Fonctionnel — critère d'acceptation SC5
**Préconditions** : Écran M-04 ouvert
**Étapes** :
1. Rendre `<CapturePreuveScreen checkmarkDelayMs={0} />`
2. Vérifier la présence des 4 testIDs `type-preuve-{TYPE}`

**Résultat attendu** :
- `type-preuve-SIGNATURE` présent
- `type-preuve-PHOTO` présent
- `type-preuve-TIERS_IDENTIFIE` présent
- `type-preuve-DEPOT_SECURISE` présent
**Statut** : Passé

```gherkin
Given l'écran M-04 ouvert
When CardTypePreuve DS est rendu
Then les 4 types sont accessibles via leurs testIDs DS
```

---

## TC-026-17 : SignaturePad (M-04) — bouton CONFIRMER désactivé avant signature

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Colis / PreuveCapturee
**Type** : Invariant domaine — SC5 (pas de PreuveCapturee sans signature)
**Préconditions** : Type SIGNATURE sélectionné, pad vide
**Étapes** :
1. Sélectionner SIGNATURE
2. Vérifier l'état du bouton CONFIRMER

**Résultat attendu** : `bouton-confirmer-livraison` disabled = true
**Statut** : Passé

```gherkin
Given le type SIGNATURE sélectionné dans M-04
When le pad est vide
Then le bouton CONFIRMER est désactivé
```

---

## TC-026-18 : SignaturePad (M-04) — flux complet PreuveCapturee

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Colis / PreuveCapturee
**Type** : Fonctionnel — SC5 (événement émis après confirmation)
**Préconditions** : Signature saisie dans le pad
**Étapes** :
1. Sélectionner SIGNATURE
2. Simuler `signatureCapturee` sur le pad
3. Appuyer sur CONFIRMER
4. Vérifier l'appel API et le callback

**Résultat attendu** :
- `confirmerLivraison` appelé avec `typePreuve: 'SIGNATURE'`
- `onLivraisonConfirmee` appelé avec l'ID preuve
**Statut** : Passé

```gherkin
Given le livreur confirme la preuve avec signature
When il appuie sur CONFIRMER
Then PreuveCapturee est émis (via appel API confirmerLivraison)
```

---

## TC-026-19 : BandeauInstruction DS (M-06) — affichage titre et texte instruction

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : InstructionRecue / aucun event domaine mobile
**Type** : Fonctionnel — critère d'acceptation SC8
**Préconditions** : Instruction PRIORISER reçue
**Étapes** :
1. Rendre `<BandeauInstructionOverlay instruction={instructionPrioriser} />`
2. Vérifier les testIDs DS

**Résultat attendu** :
- `bandeau-instruction-overlay` présent
- `bandeau-instruction` présent
- `bandeau-instruction-texte` contient "Prioriser"
**Statut** : Passé

```gherkin
Given l'événement InstructionRecue avec type PRIORISER
When BandeauInstruction DS est rendu
Then le texte "Prioriser" est visible dans le bandeau
```

---

## TC-026-20 : BandeauInstruction DS (M-06) — bouton VOIR avec colisId

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : InstructionRecue / aucun
**Type** : Fonctionnel — SC8 (deux boutons [VOIR] et [OK])
**Préconditions** : Bandeau visible
**Étapes** :
1. Appuyer sur `bandeau-instruction-voir`
2. Vérifier l'appel `onVoir`

**Résultat attendu** : `onVoir` appelé avec `'colis-s-003'`
**Statut** : Passé

```gherkin
Given le bandeau BandeauInstruction DS visible
When le livreur appuie sur VOIR
Then onVoir est appelé avec le colisId associé à l'instruction
```

---

## TC-026-21 : BandeauInstruction DS (M-06) — fermeture par bouton OK

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : InstructionRecue / aucun
**Type** : Fonctionnel — SC8 (fermeture animation slide-up)
**Préconditions** : Bandeau visible, `fermetureAnimationMs={0}` pour bypass animation
**Étapes** :
1. Appuyer sur `bandeau-instruction-ok`
2. Vérifier `onFermer`

**Résultat attendu** : `onFermer` appelé immédiatement
**Statut** : Passé

```gherkin
Given le bandeau BandeauInstruction DS visible
When le livreur appuie sur OK
Then le bandeau se ferme (onFermer appelé)
```

---

## TC-026-22 : BandeauInstruction DS (M-06) — fermeture automatique après timeout

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : InstructionRecue / aucun
**Type** : Fonctionnel — SC8 (barre de décompte 10 secondes)
**Préconditions** : `autoFermetureMs={500}`, `fermetureAnimationMs={0}`
**Étapes** :
1. Rendre le bandeau
2. Avancer les timers de 600ms avec `jest.advanceTimersByTime`
3. Vérifier `onFermer`

**Résultat attendu** : `onFermer` appelé après l'expiration du délai
**Statut** : Passé

```gherkin
Given le bandeau BandeauInstruction DS visible avec countdown
When les 10 secondes s'écoulent sans action du livreur
Then le bandeau disparaît automatiquement (onFermer appelé)
```

---

## TC-026-23 : BandeauInstruction DS (M-06) — label "Action Requise" présent

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : InstructionRecue / aucun
**Type** : Fonctionnel — précisions design 2026-03-25
**Préconditions** : Bandeau visible
**Étapes** :
1. Vérifier la présence du testID `bandeau-instruction-label-action-requise`

**Résultat attendu** : label "Action Requise" visible au-dessus du texte instruction
**Statut** : Passé

```gherkin
Given le bandeau BandeauInstruction DS visible
When il est rendu
Then le label "Action Requise" est affiché au-dessus du message
```

---

## TC-026-24 : BandeauInstruction DS (M-06) — barre countdown visuelle présente

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : InstructionRecue / aucun
**Type** : Fonctionnel — précisions design 2026-03-25
**Préconditions** : Bandeau visible
**Étapes** :
1. Vérifier la présence du testID `bandeau-instruction-countdown`

**Résultat attendu** : barre verte décroissante visible (pas de chiffres)
**Statut** : Passé

```gherkin
Given le bandeau BandeauInstruction DS visible
When il est rendu
Then une barre de progression visuelle verte est affichée
```

---

## TC-026-25 : Non-régression M-05 — DeclarerEchecScreen non régressé

**US liée** : US-026
**Niveau** : L1
**Couche testée** : UI / Interface Layer mobile
**Aggregate / Domain Event ciblé** : Colis / EchecLivraisonDeclare
**Type** : Non régression — écran M-05
**Préconditions** : Écran DeclarerEchecScreen disponible dans la suite de tests
**Étapes** :
1. Exécuter la suite `npx jest --testPathPattern=EchecLivraison`
2. Vérifier que tous les tests passent

**Résultat attendu** : Tous les tests EchecLivraison PASS (logique métier inchangée)
**Statut** : Passé (vérifié via exécution globale 257/257)

```gherkin
Given les écrans M-05 refactorisés avec tokens DS
When la suite de tests Jest est exécutée
Then aucune régression n'est introduite sur la logique métier
```

---

## Stratégie L2 — non applicable

L'US-026 est une refactorisation purement visuelle (Interface Layer). Aucun endpoint n'est
modifié. Les Aggregates Tournée et Colis ne sont pas touchés. Aucun test L2 n'est requis.

## Stratégie L3 — non applicable

L'ensemble des critères d'acceptation sont couverts par les tests L1 RNTL. Les testIDs DS
permettent d'inspecter chaque composant sans recourir à Playwright. Max 3 TC L3 par US —
utilisation réservée aux interactions UI impossibles à tester autrement, ce qui n'est pas
le cas ici.
