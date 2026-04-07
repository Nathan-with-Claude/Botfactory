# Implémentation US-064 : Conformité design W-05 (Détail tournée à préparer)

## Contexte

Réécriture complète du rendu JSX de `DetailTourneePlanifieePage.tsx` pour remplacer tous les
`style={{}}` inline et variables de style statiques par des classes Tailwind CSS + tokens du
design system DocuPost (Material Design 3).

La logique fonctionnelle (fetch, validation, compatibilité US-030, réaffectation US-034,
désaffectation US-050, export CSV) est intacte. Aucun `data-testid` n'a été modifié.

## Bounded Context et couche ciblée

- **BC** : BC-07 Planification (interface web supervision)
- **Aggregate(s) modifiés** : aucun (couche présentation uniquement)
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Suppressions

Les variables de style statique suivantes ont été supprimées du bas du fichier :
- `ongletStyle` — remplacé par des classes conditionnelles dans le JSX
- `h3Style` — remplacé par `text-sm font-bold text-on-surface-variant mb-2`
- `btnPrimaire` — remplacé par `px-5 py-2.5 bg-primary text-on-primary rounded-md font-semibold text-sm hover:opacity-90 shadow-sm flex items-center gap-2`
- `btnSecondaire` — remplacé par classes surface-container/outline-variant
- `btnSecondaireOrange` — remplacé par `bg-[#fff3e0] text-amber-900 border border-orange-300`
- `btnSucces` — fusionné dans btnPrimaire (même look, icône `play_arrow`)
- `selectStyle` — remplacé par `w-full bg-white border border-outline-variant/50 rounded-lg py-2.5 px-4 text-sm appearance-none focus:ring-2 focus:ring-primary/20 outline-none`

### Seuls `style={{}}` restants

Aucun : toutes les valeurs sont exprimables en Tailwind. Aucune valeur dynamique calculée
(ex: largeur barre de progression) n'était présente dans ce composant.

### Tokens utilisés

| Token | Usage |
|-------|-------|
| `bg-primary` / `text-on-primary` | Boutons primaires, onglet actif |
| `bg-surface-container-low` | Card sélecteurs affectation, méta-info |
| `border-outline-variant/10` | Bordures cards |
| `text-on-surface-variant` | Labels, textes secondaires |
| `bg-error-container/40` / `text-error` | Message erreur, statut NON_AFFECTEE, msg dépassement |
| `bg-tertiary-fixed/20` / `border-tertiary/10` / `text-tertiary` | Boîte anomalie |
| `text-emerald-*` / `bg-emerald-*` | Statut AFFECTEE, message succès, "Aucune anomalie" |
| `bg-[#fff3e0]` | Section désaffectation, bouton "Affecter quand même" (valeur arbitraire) |

### Structure du rendu W-05

- **Header** : bouton retour avec icône `arrow_back`, titre avec couleur statut conditionnelle
- **Méta** : card `surface-container-low` avec infos tournée
- **Messages** : succès en `emerald-50`, erreur en `error-container/40`
- **Tab bar** : classes conditionnelles `border-b-2 border-primary` (actif) vs `border-transparent` (inactif), icônes `inventory_2` / `person_pin`
- **Onglet Composition** : zones en chips `surface-container`, anomalies en `tertiary-fixed/20`
- **Onglet Affectation** : sélecteurs dans card `surface-container-low` avec labels uppercase 10px, icône `expand_more` absolue
- **Indicateur compatibilité** : `emerald-50` (COMPATIBLE) / `error-container/40` (DEPASSEMENT)
- **Panneau réaffectation** : bordure `primary/30`, fond `primary-fixed/10`
- **Bouton Désaffecter** : `bg-error/10 text-error border-error/20` avec hover vers `bg-error text-on-error`

### Helpers ajoutés

Deux helpers purs ont été extraits pour éviter la logique inline dans le JSX :
- `statutLabel(statut)` : retourne le libellé français du statut
- `statutColorClass(statut)` : retourne la classe Tailwind de couleur selon le statut

## Tests

- **Type** : tests unitaires existants (26 tests, fichier `DetailTourneePlanifieePage.test.tsx`)
- **Résultat** : 26/26 PASS — zéro régression
- **Suite complète** : 272/272 PASS
- Les tests vérifient les `data-testid` (sémantique), pas les classes CSS — conformément à la règle "jsdom ne charge pas Tailwind"

## Commandes pour tester localement

```bash
cd src/web/supervision
npm start
# Naviguer vers : http://localhost:3000 → Plan du jour → cliquer sur une tournée
```

Tests :
```bash
cd src/web/supervision && CI=true npm test -- --testPathPattern=DetailTourneePlanifieePage
```
