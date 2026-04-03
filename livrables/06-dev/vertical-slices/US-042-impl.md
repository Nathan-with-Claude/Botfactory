# Implémentation US-042 : Horodatage adaptatif des consignes dans M-07

## Contexte

Feedback terrain du 2026-04-01 (Pierre Morel) : l'écran M-07 "Mes consignes" (livré par
US-037) affiche les consignes sans horodatage différencié. Quand plusieurs consignes sont
en attente, le livreur ne peut pas identifier laquelle est la plus récente.

US-042 améliore la fonction d'affichage de l'horodatage : format "HH:mm" si la consigne
est du jour courant, "JJ/MM HH:mm" si elle date d'un autre jour.

Liens :
- Spec : `/livrables/05-backlog/user-stories/US-042-horodatage-consignes-ecran-m07.md`
- Wireframe : `/livrables/02-ux/wireframes.md#M-07`
- US prérequis : US-037 (historique consignes livreur)

## Bounded Context et couche ciblée

- **BC** : BC-04 Notification et Messaging
- **Aggregate(s) modifiés** : aucun (modification d'affichage uniquement)
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Domain Layer

Aucune modification. Le champ `horodatage` de `ConsigneLocale` (Read Model local, défini
dans US-037) est réutilisé tel quel. La US-042 ne modifie pas le modèle de données.

### Application Layer

Aucune modification.

### Infrastructure Layer

Aucune modification.

### Interface Layer — Frontend Mobile

**Fichier modifié** : `src/mobile/src/screens/MesConsignesScreen.tsx`

1. **Remplacement de `formatHorodatage` par `formaterHorodatage` (exportée)** :
   - Signature : `formaterHorodatage(iso: string, maintenant: Date = new Date()): string`
   - Le paramètre `maintenant` est injectable pour les tests unitaires purs.
   - Logique : comparaison `getFullYear/getMonth/getDate` entre la date de la consigne et la
     référence `maintenant` (dates locales, pas UTC) pour éviter les ambiguïtés de fuseau.
   - Format "HH:mm" si même jour, "JJ/MM HH:mm" (JJ et MM avec zéro de remplissage) sinon.

2. **Ajout du `testID` sur le texte horodatage** :
   - Avant : aucun testID sur ce texte.
   - Après : `testID={`horodatage-${consigne.instructionId}`}`.
   - Permet les assertions de présence dans les tests composant.

3. **Aucun changement de style** : le style `ligneHorodatage` existant (fontSize=12,
   texteTertiaire, marginTop=4) correspond déjà à la typographie secondaire demandée.

### Erreurs / invariants préservés

- L'ordre de tri décroissant (la plus récente en premier) est délégué au hook
  `useConsignesLocales` — aucune modification.
- Le badge de comptage (`nombreNonLues`) reste inchangé.
- La navigation M-07→M-03 (US-037 delta) reste fonctionnelle.
- La fonction `formaterHorodatage` ne lève pas d'exception : bloc try/catch retourne `iso`
  en cas d'erreur de parsing.

## Tests

### Types : tests unitaires Jest (TDD)

**Fichier mis à jour** : `src/mobile/src/__tests__/MesConsignesScreen.test.tsx`

- Import ajouté : `formaterHorodatage` exportée depuis `MesConsignesScreen`.
- 5 nouveaux tests ajoutés dans `describe('US-042 — formaterHorodatage')` :
  - **FH1** : consigne du jour → format `^\d{2}:\d{2}$` (regex HH:mm)
  - **FH2** : consigne de la veille → format `^\d{2}\/\d{2} \d{2}:\d{2}$` (regex JJ/MM HH:mm)
    - Note : la date de test utilise 09:00 UTC (matin) pour éviter toute ambiguïté de fuseau
      (une consigne à 22:47 UTC le 01/04 est le 02/04 en Europe/Paris — serait faussement
      identifiée comme "du jour").
  - **FH3** : plusieurs heures du même jour → toutes au format HH:mm
  - **FH4** : testID `horodatage-instr-001` présent dans le rendu composant
  - **FH5** : les 3 consignes de la spec (09:00, 11:30, 14:45) ont leurs testIDs présents

**Résultats** :
- 21/21 tests verts (16 US-037 existants + 5 nouveaux US-042)
- Suite totale mobile : 315/315 → 315/315 (aucune régression)

## Commandes de lancement (tests manuels)

```bash
# Tests unitaires mobile uniquement
cd src/mobile && npx jest --testPathPattern="MesConsignesScreen" --no-coverage

# Suite mobile complète
cd src/mobile && npx jest --no-coverage
```

## Risques / Points d'attention

- La comparaison des dates est faite sur les dates **locales** du device (via `getFullYear/
  getMonth/getDate`). Si le device est dans un fuseau UTC+X, une consigne reçue à 23:30
  UTC la veille peut être considérée comme "du jour" (heure locale 01:30 du lendemain).
  Ce comportement est intentionnel et cohérent avec la perception du livreur.
