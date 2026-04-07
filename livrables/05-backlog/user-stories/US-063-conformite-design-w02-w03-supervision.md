# US-063 — Conformité design W-02 (Détail tournée) et W-03 (Instruction) supervision

**Epic** : E-03 — Supervision temps réel  
**Sprint** : Sprint 7  
**Priorité** : Haute  
**BC** : BC-03

---

## User Story

**En tant que** superviseur logistique,  
**je veux** que les pages de détail tournée (W-02) et d'envoi d'instruction (W-03) respectent le design system DocuPost,  
**afin de** disposer d'une interface cohérente, lisible et conforme au brief design validé.

---

## Contexte

Les composants `DetailTourneePage.tsx` et `PanneauInstructionPage.tsx` ont été implémentés avec des `style={{}}` inline bruts (sans Tailwind, sans tokens de couleur, sans typographie). La source de vérité visuelle est `/livrables/02-ux/design_web_designer.md` — sections W-02 (lignes ~1450–1777) et W-03 (lignes ~1779–2007).

---

## Critères d'acceptance

### W-02 — DetailTourneePage

**Bandeau d'onglets (tab bar)**
- [ ] Conteneur : `flex items-center gap-8 border-b border-outline-variant/15 mb-6`
- [ ] Onglet actif : `border-b-2 border-primary text-primary font-bold`
- [ ] Onglet inactif : `border-b-2 border-transparent text-on-surface-variant hover:text-primary`
- [ ] Icônes Material Symbols : `map` (Carte), `list_alt` (Liste colis), `report_problem` (Incidents)
- [ ] Badge compteur incidents : `bg-tertiary text-on-tertiary px-1.5 py-0.5 rounded-full text-[10px]`

**Table colis**
- [ ] En-têtes : `text-[11px] font-bold text-on-surface-variant uppercase tracking-widest font-label`
- [ ] Cellules : `px-6 py-5`
- [ ] Badge A_LIVRER : `inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-container text-on-primary-container uppercase`
- [ ] Badge LIVRE : `bg-green-600 text-on-primary`
- [ ] Badge ECHEC : `bg-error-container text-on-error-container` + motif en `text-error italic text-[10px]`
- [ ] Bouton Instruction : `px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-md hover:bg-primary hover:text-on-primary` + icône `sticky_note_2`
- [ ] Hover ligne : `hover:bg-surface-container-low transition-colors`

**Bandeau avancement**
- [ ] Utiliser le composant `BandeauProgression` existant ou appliquer les tokens : `bg-surface-container-low rounded-xl`
- [ ] Barre de progression A_RISQUE : gradient `from-tertiary to-error`

**Typographie et layout**
- [ ] Font headline : `font-headline` (Work Sans) pour les titres
- [ ] Font body : `font-body` / `font-label` (Inter)
- [ ] Tokens couleur : remplacer toutes les couleurs HEX brutes par les tokens CSS du design system

---

### W-03 — PanneauInstructionPage

**Overlay**
- [ ] `fixed inset-0 z-[60] flex items-center justify-center p-4` avec classe `glass-overlay` (backdrop-filter blur)

**Modal container**
- [ ] `bg-surface-container-lowest w-full max-w-xl rounded-xl modal-shadow overflow-hidden flex flex-col`

**Header modal**
- [ ] Titre : `text-2xl font-semibold font-headline text-on-surface tracking-tight`
- [ ] Sous-titre : tourneeId en `text-sm font-medium text-primary` + livreurNom en `text-sm text-on-surface-variant`
- [ ] Bouton fermer : icône Material Symbols `close`, `p-2 hover:bg-surface-container-low rounded-full`

**Parcel Card**
- [ ] Card colis : `bg-surface-container-low p-5 rounded-xl flex items-center justify-between`
- [ ] Icône `package_2` (Material Symbols) dans un carré blanc `h-12 w-12 bg-white rounded-lg`
- [ ] ID colis : `text-xs font-bold font-label text-outline uppercase tracking-wider`

**Sélecteur type d'instruction — grid cards (remplace les radio buttons)**
- [ ] Grid 3 colonnes : `grid grid-cols-3 gap-3`
- [ ] Card active : `border-2 border-primary bg-primary/[0.03]` + icône sur fond `bg-primary text-on-primary rounded-full`
- [ ] Card inactive : `border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low`
- [ ] Icônes : `arrow_upward` (PRIORISER), `close` (ANNULER), `refresh` (REPROGRAMMER)
- [ ] Label : `text-xs font-bold text-outline font-label uppercase tracking-widest`

**Textarea message complémentaire** (nouveau champ — optionnel)
- [ ] `w-full h-24 p-4 bg-surface-container-low border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 resize-none`
- [ ] Placeholder : "Ajouter une précision pour le livreur..."
- [ ] Compteur caractères : `0 / 200` (limiter à 200 chars, envoyer dans le body si renseigné)

**Bandeau "Livreur en ligne"**
- [ ] `flex items-center gap-3 px-4 py-3 bg-secondary-fixed/30 rounded-lg`
- [ ] Point pulsant : `animate-ping` + point fixe `bg-primary`
- [ ] Texte : "Livreur en ligne — L'instruction sera transmise instantanément."

**Footer modal**
- [ ] Séparé du body : `px-8 py-6 bg-surface-container-low flex justify-end gap-3`
- [ ] Bouton Annuler : `text-on-surface-variant hover:bg-surface-container-high`
- [ ] Bouton ENVOYER : `bg-primary text-on-primary uppercase tracking-wide shadow-md hover:shadow-lg active:scale-95`

**CSS global à ajouter dans index.css (ou App.css)**
```css
.glass-overlay {
  background: rgba(247, 249, 251, 0.7);
  backdrop-filter: blur(20px);
}
.modal-shadow {
  box-shadow: 0 24px 48px -12px rgba(25, 28, 30, 0.06);
}
```

---

## Contraintes techniques

- **Ne pas casser les tests existants** : les `data-testid` doivent rester identiques
- Le comportement fonctionnel (logique, endpoints, WebSocket) ne change pas
- Tailwind est déjà configuré dans `src/web/supervision` — les tokens de couleur sont définis dans `tailwind.config.js` (ou dans le HTML du design_web_designer.md)
- Material Symbols est déjà chargé via Google Fonts dans le projet supervision
- **Vérifier** que les tokens Tailwind (`primary`, `on-surface`, `surface-container`, etc.) sont bien dans `tailwind.config.js` — si absent, les ajouter depuis la config du design_web_designer.md (lignes 56-150)

---

## Fichiers à modifier

- `src/web/supervision/src/pages/DetailTourneePage.tsx`
- `src/web/supervision/src/pages/PanneauInstructionPage.tsx`
- `src/web/supervision/src/index.css` (ou équivalent) — ajouter `.glass-overlay` et `.modal-shadow`
- `tailwind.config.js` de supervision — vérifier/ajouter les tokens couleur

## Fichier de référence design

`/livrables/02-ux/design_web_designer.md` — sections W-02 (lignes 1450–1777) et W-03 (lignes 1779–2007)

---

## Definition of Done

- [ ] `DetailTourneePage` : bandeau onglets avec indicateur bottom + icônes + table stylisée conforme W-02
- [ ] `PanneauInstructionPage` : overlay glass + cards instruction grid + parcel card + textarea + bandeau livreur en ligne + footer modal conforme W-03
- [ ] Tous les `data-testid` inchangés — zéro régression sur les tests existants
- [ ] `CI=true npm test` dans `src/web/supervision` : 100% verts
