# Implémentation US-038 : Harmonisation libellés UX

## Contexte

US-038 — Harmoniser les libellés de l'interface avec le langage naturel terrain.
Feedbacks de Pierre Morel (30/03 et 01/04) et Laurent Renaud (01/04) identifient plusieurs libellés
techniques ou abrégés qui gênent la lisibilité en conditions réelles (soleil, déplacement, pression de temps).

Corrections purement visuelles — aucun enum, aucun Domain Event modifié.

Source : `/livrables/05-backlog/user-stories/US-038-harmonisation-libelles-ux.md`

## Bounded Context et couche ciblée

- **BC** : BC-01 Execution Tournee (mobile) + BC-03 Supervision (web)
- **Aggregate(s) modifiés** : aucun (corrections purement visuelles)
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Domain Layer
Aucun changement. Les enums restent intacts :
- `StatutInstruction.EXECUTEE` — inchangé
- `ResultatCompatibilite.DEPASSEMENT` — inchangé

### Application Layer
Aucun changement.

### Infrastructure Layer
Aucun changement.

### Interface Layer — API
Aucun changement.

### Frontend (mobile React Native)

**ColisItem.tsx** — badge statut colis :
- `A_REPRESENTER: 'A representer'` → `A_REPRESENTER: 'Repassage'`
- Correction SC1 : libellé "A repr." remplacé par "Repassage" dans la badge de la liste M-02

**MesConsignesScreen.tsx** — consignes livreur M-07 :
- `EXECUTEE: { label: 'Exécutée' }` → `EXECUTEE: { label: 'Traitée' }`
- Bouton action : `'Marquer exécutée'` → `'Traitée'`
- `accessibilityLabel` mis à jour : `"Marquer l'instruction comme traitée"`
- Corrections SC2 et SC3

### Frontend (web React)

**DetailTourneePlanifieePage.tsx** — W-05 :
- `'Capacité dépassée'` → `'Chargement trop lourd'` dans l'indicateur de compatibilité DEPASSEMENT (SC4)
- Ajout bouton "Télécharger la liste" (`data-testid="btn-telecharger-liste"`) avec export CSV (SC5)
- La fonction `telechargerListeCSV()` génère un Blob CSV côté client et déclenche le téléchargement

**TableauDeBordPage.tsx** — W-01 :
- `placeholder="Livreur, code TMS (ex: T-205)..."` → `placeholder="Livreur, numéro de tournée (ex: T-205)..."`
- Correction SC6

### Erreurs / invariants préservés
- `StatutInstruction.EXECUTEE` : enum inchangé — seul le libellé affiché change
- `ResultatCompatibilite.DEPASSEMENT` : type inchangé — seul le texte d'alerte change
- Recherche TMS dans TableauDeBordPage : logique inchangée, seul le placeholder change

## Tests

### Tests unitaires mobiles (React Native Testing Library)

Nouveau fichier : `/src/mobile/src/__tests__/US038.libelles.test.tsx`
- **SC1** : ColisItem affiche "Repassage" pour un colis A_REPRESENTER (via `getByTestId('colis-statut')`)
- **SC2** : MesConsignesScreen affiche "Traitée" dans le badge statut EXECUTEE (via `getByText`)
- **SC3** : MesConsignesScreen affiche "Traitée" sur le bouton d'action ENVOYEE (via `queryByText`)
- **SC3b** : bouton en mode sync affiche "Synchronisation…" (inchangé)
- 4 tests, tous verts

Fichier mis à jour : `/src/mobile/src/__tests__/MesConsignesScreen.test.tsx`
- Descriptions des tests SC4b, SC5, SC6, SC6b, SC7, SC10 mises à jour (libellés → "Traitée")
- Aucune assertion modifiée (les tests vérifient les testID, pas les textes)

### Tests web (svc-supervision)

**Bug Babel/TS pré-existant** (identifié US-044) : les tests svc-supervision ne s'exécutent pas
avec la configuration Babel de Create React App. Ce bug est antérieur à cette US.

Validation alternative effectuée via Node.js :

```bash
node -e "
const detail = require('fs').readFileSync('.../DetailTourneePlanifieePage.tsx', 'utf8');
console.log('Chargement trop lourd:', detail.includes('Chargement trop lourd'));  // true
console.log('btn-telecharger-liste:', detail.includes('btn-telecharger-liste'));   // true
console.log('Télécharger la liste:', detail.includes('Télécharger la liste'));    // true
..."
```

Toutes les vérifications : OK.

TODO : résoudre le bug Babel/TS de svc-supervision pour rendre les tests web exécutables.

### Résultats de la suite totale mobile

Avant US-038 : **325/325 tests verts**
Après US-038 : **329/329 tests verts** (+4 nouveaux, 0 régression)

## Commandes de lancement

```bash
# Tests mobiles US-038
cd src/mobile && npx jest --testPathPattern="US038" --no-coverage

# Suite complète mobile
cd src/mobile && npx jest --no-coverage

# Validation web (node.js)
node -e "
const fs = require('fs');
const d = fs.readFileSync('src/web/supervision/src/pages/DetailTourneePlanifieePage.tsx', 'utf8');
console.log('Chargement trop lourd:', d.includes('Chargement trop lourd'));
console.log('Télécharger la liste:', d.includes('Télécharger la liste'));
const t = fs.readFileSync('src/web/supervision/src/pages/TableauDeBordPage.tsx', 'utf8');
console.log('numéro de tournée:', t.includes('numéro de tournée'));
"
```

## Fichiers modifiés

| Fichier | Nature du changement |
|---------|---------------------|
| `src/mobile/src/components/ColisItem.tsx` | A_REPRESENTER → 'Repassage' |
| `src/mobile/src/screens/MesConsignesScreen.tsx` | EXECUTEE → 'Traitée' + bouton 'Traitée' |
| `src/web/supervision/src/pages/DetailTourneePlanifieePage.tsx` | 'Chargement trop lourd' + bouton 'Télécharger la liste' |
| `src/web/supervision/src/pages/TableauDeBordPage.tsx` | placeholder 'numéro de tournée' |
| `src/mobile/src/__tests__/US038.libelles.test.tsx` | Nouveau — 4 tests TDD |
| `src/mobile/src/__tests__/MesConsignesScreen.test.tsx` | Descriptions mises à jour |
