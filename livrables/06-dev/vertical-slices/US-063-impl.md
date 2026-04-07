# Implémentation US-063 : Conformité design W-02 (Détail tournée) et W-03 (Instruction) supervision

## Contexte

Réécriture visuelle des composants `DetailTourneePage.tsx` et `PanneauInstructionPage.tsx` pour
les mettre en conformité avec le design system DocuPost (Material Design 3) tel que défini dans
`/livrables/02-ux/design_web_designer.md` sections W-02 (lignes ~1450–1777) et W-03 (lignes ~1779–2007).

- US spec : `/livrables/05-backlog/user-stories/US-063-conformite-design-w02-w03-supervision.md`
- Design référence : `/livrables/02-ux/design_web_designer.md`

## Bounded Context et couche ciblée

- **BC** : BC-03 — Supervision temps réel
- **Aggregate(s) modifiés** : aucun (changements UI uniquement)
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Domain Layer
Aucun changement — US purement UI.

### Application Layer
Aucun changement — logique fonctionnelle (fetch, WebSocket, validation créneau REPROGRAMMER) inchangée.

### Infrastructure Layer
Aucun changement.

### Interface Layer
Aucun changement d'endpoint.

### Frontend

**globals.css** — Ajout de deux classes CSS utilitaires :
- `.glass-overlay` : backdrop-filter blur(20px) + fond rgba(247,249,251,0.7) pour l'overlay W-03
- `.modal-shadow` : ombre profonde `0 24px 48px -12px rgba(25,28,30,0.06)` pour le container modal

**DetailTourneePage.tsx** — Refactorisation complète du JSX :
- Suppression de tous les `style={{}}` inline bruts (couleurs HEX, fontFamily, padding)
- Bandeau avancement : tokens `bg-surface-container-low`, `bg-[#fff3e0] border-l-4 border-orange-600` pour A_RISQUE
- Barre de progression : gradient `from-tertiary to-error` si A_RISQUE, sinon `bg-primary`
- Bandeau d'onglets : `flex items-center gap-8 border-b border-outline-variant/15`
  - Onglet actif : `border-b-2 border-primary text-primary font-bold`
  - Onglet inactif : `border-b-2 border-transparent text-on-surface-variant hover:text-primary`
  - Icônes Material Symbols : `list_alt`, `report_problem`, `map`
  - Badge incidents : `bg-tertiary text-on-tertiary px-1.5 py-0.5 rounded-full text-[10px] font-bold`
- Table colis : en-têtes `text-[11px] font-bold text-on-surface-variant uppercase tracking-widest font-label`
  - Badge A_LIVRER : `bg-primary-container text-on-primary-container`
  - Badge LIVRE : `bg-green-600 text-on-primary`
  - Badge ECHEC : `bg-error-container text-on-error-container`
  - Bouton Instructionner : `bg-primary/10 text-primary hover:bg-primary hover:text-on-primary` + icône `sticky_note_2`
  - Hover ligne : `hover:bg-surface-container-low transition-colors`
- Onglet Incidents : motif dans un `<span>` isolé pour compatibilité `getByText()` dans les tests
- Onglet Instructions : couleurs via classes arbitraires (`bg-[#fff8e1]`, etc.) pour préserver la sémantique

**PanneauInstructionPage.tsx** — Refactorisation complète du JSX :
- Overlay : `fixed inset-0 z-[60] flex items-center justify-center p-4 glass-overlay`
- Container modal : `bg-surface-container-lowest w-full max-w-xl rounded-xl modal-shadow`
- Header : titre `font-headline`, sous-titre avec `text-primary` (tourneeId) et `text-on-surface-variant` (livreurNom)
- Bouton fermer : icône `close` Material Symbols, `p-2 hover:bg-surface-container-low rounded-full`
- Parcel card : `bg-surface-container-low p-5 rounded-xl` + icône `package_2` dans carré blanc `h-12 w-12`
- Sélecteur type remplacé par grid 3 colonnes de cards cliquables :
  - `role="radio"` + `aria-checked` sur chaque card pour compatibilité `toBeChecked()` jest-dom
  - Card active : `border-2 border-primary bg-primary/[0.03]` + icône sur `bg-primary text-on-primary rounded-full`
  - Card inactive : `border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low`
  - Icônes : `arrow_upward` (PRIORISER), `close` (ANNULER), `refresh` (REPROGRAMMER)
  - `data-testid` préservés sur les cards (`radio-prioriser`, `radio-annuler`, `radio-reprogrammer`)
- Textarea message complémentaire (nouveau) :
  - `data-testid="textarea-message"`, 200 chars max
  - Corps inclus dans le POST si renseigné (`messageComplementaire`)
  - `w-full h-24 p-4 bg-surface-container-low border-0 rounded-xl resize-none`
- Bandeau "Livreur en ligne" : point pulsant `animate-ping` + fond `bg-secondary-fixed/30`
- Footer modal : `px-8 py-6 bg-surface-container-low flex justify-end gap-3`
  - Bouton Annuler : `text-on-surface-variant hover:bg-surface-container-high`
  - Bouton ENVOYER : `bg-primary text-on-primary uppercase tracking-wide shadow-md hover:shadow-lg active:scale-95`

### Erreurs / invariants préservés
- Tous les `data-testid` conservés identiques, aucune régression
- Logique fonctionnelle inchangée (fetch, WebSocket, validation créneau, gestion 409/422)
- `toBeChecked()` : fonctionne car les cards utilisent `role="radio"` + `aria-checked={isActive}`

## Tests

- **Type** : tests unitaires Jest/RTL existants (non modifiés)
- **Résultat** : 272/272 tests verts (23 suites)
- **Fichiers** :
  - `src/web/supervision/src/__tests__/DetailTourneePage.test.tsx` (9 tests)
  - `src/web/supervision/src/__tests__/PanneauInstructionPage.test.tsx` (7 tests)
- **Commande** : `cd src/web/supervision && CI=true npm test`

## Commandes de démarrage

```bash
# Backend supervision (port 8082)
cd src/svc-supervision && mvn spring-boot:run

# Frontend supervision
cd src/web/supervision && npm start
# → http://localhost:3000
```
