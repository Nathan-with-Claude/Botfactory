# US-064 — Conformité design W-05 (Détail tournée à préparer) supervision

**Epic** : E-02 — Préparation des tournées  
**Sprint** : Sprint 7  
**Priorité** : Haute  
**BC** : BC-07

---

## User Story

**En tant que** superviseur logistique,  
**je veux** que la page de détail d'une tournée à préparer (W-05) respecte le design system DocuPost,  
**afin de** disposer d'une interface cohérente avec le reste de la plateforme.

---

## Contexte

`DetailTourneePlanifieePage.tsx` utilise exclusivement des `style={{}}` inline bruts (pas de Tailwind, pas de tokens de couleur, pas de typographie). La source de vérité visuelle est `/livrables/02-ux/design_web_designer.md` — sections W-04 (lignes ~419–1330) pour la structure deux colonnes et les sélecteurs d'affectation, et W-05 (lignes ~1332–1777) pour le header, le status banner et les onglets.

---

## Critères d'acceptance

### Header & Breadcrumb

- [ ] Breadcrumb : `flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-2` + icône `chevron_right`
- [ ] Titre H1 : `text-3xl font-bold font-headline tracking-tight text-on-surface`
- [ ] Méta (date import, nb colis, zones) : icônes `person` et `local_shipping` Material Symbols + `text-sm text-on-surface-variant flex items-center gap-2`
- [ ] Bouton Retour : `flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-primary border border-primary/20 rounded-md font-semibold text-sm hover:bg-primary-fixed`

### Status Banner (anomalies / poids)

- [ ] Anomalie détectée : `bg-tertiary-fixed/20 p-5 rounded-xl border border-tertiary/10 flex gap-4 items-start`
- [ ] Icône `error` sur fond `bg-tertiary/10 p-2 rounded-lg text-tertiary`
- [ ] Titre anomalie : `text-sm font-bold text-tertiary mb-1`
- [ ] Description : `text-xs text-on-tertiary-fixed-variant leading-relaxed`
- [ ] Aucune anomalie : `bg-surface-container-low p-4 rounded-xl flex items-center gap-3 text-sm text-on-surface-variant` + icône `check_circle` verte

### Bandeau d'onglets (tab bar)

- [ ] Conteneur : `flex items-center gap-8 border-b border-outline-variant/15 mb-6`
- [ ] Onglet actif : `px-4 py-4 text-sm font-bold text-primary border-b-2 border-primary flex items-center gap-2`
- [ ] Onglet inactif : `px-4 py-4 text-sm font-medium text-on-surface-variant hover:text-primary border-b-2 border-transparent flex items-center gap-2 transition-colors`
- [ ] Icônes : `inventory_2` (Composition), `person_pin` (Affectation)
- [ ] Badge composition vérifiée : `bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold` + icône `check`

### Onglet Composition

**Zones**
- [ ] Chips zones : `px-3 py-1.5 bg-secondary-container/30 text-on-secondary-container text-[11px] font-semibold rounded-lg flex items-center gap-1.5` + icône `location_on`
- [ ] Container flex wrap : `flex flex-wrap gap-2 mb-6`

**Contraintes horaires**
- [ ] Chips contraintes : `px-3 py-1.5 bg-secondary-container/30 text-on-secondary-container text-[11px] font-semibold rounded-lg flex items-center gap-1.5` + icône `schedule`
- [ ] Fragile : `bg-tertiary-fixed/30 text-on-tertiary-fixed-variant` + icône `inventory_2`
- [ ] Signature : `bg-surface-container-high text-outline` + icône `signature`

**Table colis (aperçu)**
- [ ] Container : `bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden`
- [ ] Header table : `px-6 py-5 border-b border-outline-variant/10 flex justify-between items-center`
- [ ] Titre : `text-sm font-headline font-bold`
- [ ] Bouton CSV : `text-[11px] font-bold text-primary px-3 py-1 hover:bg-primary/5 rounded-md`
- [ ] En-têtes : `px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-wider bg-surface-container-low`
- [ ] Hover ligne : `hover:bg-surface-container-low/50 transition-colors`
- [ ] Badge zone : `px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold rounded uppercase`

**Boutons action**
- [ ] Valider composition : `px-5 py-2.5 bg-primary text-on-primary rounded-md font-semibold text-sm hover:opacity-90 shadow-sm flex items-center gap-2`
- [ ] Déjà vérifié (disabled) : `px-5 py-2.5 bg-surface-container text-outline rounded-md font-semibold text-sm cursor-not-allowed flex items-center gap-2` + icône `check`

### Onglet Affectation

**Card sélecteurs**
- [ ] Container : `bg-surface-container-low p-6 rounded-xl border border-outline-variant/10`
- [ ] Titre section : `text-sm font-headline font-bold mb-5`
- [ ] Label select : `text-[10px] font-bold text-outline uppercase`
- [ ] Select livreur : `w-full bg-white border border-outline-variant/50 rounded-lg py-2.5 px-4 text-sm appearance-none focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer`
- [ ] Icône expand : `material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none` (`expand_more`)
- [ ] Wrapper select : `relative group`

**Indicateur compatibilité véhicule (US-030)**
- [ ] Compatible : `bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 text-sm`
- [ ] Dépassement : `bg-error-container/40 border border-error/10 p-4 rounded-xl` + `text-sm font-bold text-on-error-container`
- [ ] Bouton réaffecter : `px-4 py-2 bg-primary text-on-primary rounded-md font-semibold text-sm hover:opacity-90 flex items-center gap-2`
- [ ] Bouton forcer quand même : `px-4 py-2 bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30 rounded-md font-semibold text-sm hover:bg-surface-container`

**Panneau réaffectation (US-034)**
- [ ] Container : `border border-primary/20 rounded-xl p-5 bg-primary-fixed/10 mb-4`
- [ ] Titre : `text-sm font-headline font-bold text-primary`
- [ ] Liste véhicules compatibles : cards `bg-white rounded-lg p-4 border border-outline-variant/20 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer flex justify-between items-center`

**Section désaffectation (US-050)**
- [ ] Container : `bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 flex items-center justify-between gap-4 mb-4`
- [ ] Texte livreur affecté : `text-sm text-on-surface-variant`
- [ ] Bouton désaffecter : `px-4 py-2 bg-error/10 text-error border border-error/20 rounded-md font-semibold text-sm hover:bg-error hover:text-on-error transition-all`

**Boutons principaux**
- [ ] Affecter seulement : `px-5 py-2.5 bg-surface-container-lowest text-primary border border-primary/20 rounded-md font-semibold text-sm hover:bg-primary-fixed flex items-center gap-2`
- [ ] Affecter et lancer : `px-5 py-2.5 bg-primary text-on-primary rounded-md font-semibold text-sm hover:opacity-90 shadow-sm flex items-center gap-2` + icône `play_arrow`
- [ ] Disabled : `opacity-50 cursor-not-allowed`

**Tournée LANCEE (readonly)**
- [ ] Banner : `bg-secondary-container/30 p-5 rounded-xl border border-secondary/10 text-sm text-on-secondary-container`

### Messages feedback

- [ ] Succès : `mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2` + icône `check_circle`
- [ ] Erreur : `mb-4 p-4 rounded-xl bg-error-container border border-error/20 text-on-error-container text-sm font-medium`

---

## Contraintes techniques

- **Ne pas casser les tests** : tous les `data-testid` restent identiques et inchangés
- La logique fonctionnelle (fetch, validation, compatibilité, réaffectation, désaffectation, export CSV) ne change pas
- Tailwind + tokens de couleur déjà configurés dans `tailwind.config.js` de supervision
- Supprimer les variables inline `const ongletStyle`, `const btnPrimaire`, `const btnSecondaire`, `const selectStyle`, `const h3Style` — remplacer par des classes Tailwind directement

## Fichiers à modifier

- `src/web/supervision/src/pages/DetailTourneePlanifieePage.tsx`

## Fichier de référence design

`/livrables/02-ux/design_web_designer.md` — sections W-04 (lignes ~1050–1330 : colonne affectation) et W-05 (lignes ~1332–1777 : layout global, header, status banner)

---

## Definition of Done

- [ ] Page entièrement en classes Tailwind avec tokens de couleur — zéro `style={{}}` inline restant (sauf les cas dynamiques comme la largeur de barre de progression ou les couleurs calculées au runtime)
- [ ] Tous les `data-testid` inchangés — zéro régression
- [ ] `CI=true npm test` dans `src/web/supervision` : 100% verts
