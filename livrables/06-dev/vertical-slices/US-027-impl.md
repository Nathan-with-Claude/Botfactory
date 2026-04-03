# Implémentation US-027 : Refactorisation écrans superviseur (Design MD3)

## Contexte

US-027 applique le design Material Design 3 validé par le designer UI (2026-03-25) sur
les pages web existantes du superviseur/logisticien. C'est une mise à jour visuelle pure :
aucune logique métier ni appel API n'est modifié. Toutes les fonctionnalités existantes
sont conservées.

Inputs :
- /livrables/02-ux/design_web_designer.md (référence visuelle HTML/Tailwind du designer)
- /livrables/02-ux/wireframes.md (sections W-01 à W-04)
- /livrables/06-dev/vertical-slices/US-025-impl.md (design system v1.0)

---

## Bounded Context et couche ciblée

- **BC** : Transverse — couche présentation uniquement
- **Aggregate(s) modifiés** : aucun (refactorisation visuelle)
- **Domain Events émis** : aucun
- **Couches touchées** : Interface Layer web uniquement

---

## Décisions d'implémentation

### tokens.css — Migration vers MD3

**Décision** : Conserver les anciens tokens comme alias vers les nouveaux tokens MD3.
Raison : les composants du design system (BadgeStatut, IndicateurSync, etc.) référencent
encore `--color-primaire`, `--color-alerte`, etc. La rétrocompatibilité évite de devoir
refactoriser tous les composants en une seule session.

Nouveaux tokens ajoutés :
- `--color-primary`, `--color-primary-container`, `--color-on-primary*`
- `--color-secondary*`, `--color-tertiary*`
- `--color-error*`, `--color-surface*`, `--color-outline*`
- Imports Google Fonts : Work Sans (wght 400–800) + Inter (wght 400–700) + Material Symbols Outlined

### AppLayout.tsx — Nouveau composant layout global

**Décision** : Créer un composant `AppLayout` autonome contenant header + sidebar.
Les pages l'utilisent comme enveloppe, ce qui permet d'appliquer le layout sans
modifier les pages elles-mêmes.

Structure :
- `<header>` h-64px : logo DocuPost, nav (Plan du jour / Historique), badge LIVE animé,
  boutons sync + notifs, profil Laurent Renaud (initiales LR si pas d'image externe)
- `<aside>` w-256px : liens Préparation (pending_actions) + Supervision (monitoring),
  Aide + Déconnexion en bas
- `<main>` : ml-256px, mt-64px

**Icônes** : Material Symbols Outlined via CSS (fontFamily inline), pas de lib externe.
Le projet n'avait pas Material Icons configuré — les icônes sont rendues via la Google Font
déjà importée dans tokens.css.

### PreparationPage.tsx — Refactorisation visuelle W-04

Conservé (data-testid + logique) :
- `data-testid="preparation-page"`, `bandeau-resume"`, `"total-tournees"`
- `data-testid="btn-lancer-toutes"`, `"btn-rafraichir"`, `"toutes-lancees-banniere"`
- `data-testid="filtres-statut"`, `"filtre-TOUTES"`, `"filtre-NON_AFFECTEE"`, etc.
- `data-testid="tableau-tournees"`, `"ligne-tournee-{id}"`, `"badge-statut-{id}"`
- `data-testid="btn-affecter-{id}"`, `"btn-detail-{id}"`, `"btn-lancer-{id}"`
- `data-testid="anomalie-{id}"`, `"message-succes"`, `"message-erreur"`, `"chargement"`, `"aucune-tournee"`

Changements visuels :
- Bandeau synthèse : fond `--color-tertiary-fixed` (#ffdbcf) si anomalies, borde tertiary
- Compteurs (Toutes / Non affectées / Affectées / Lancées) avec couleurs MD3
- Badge statuts : NON_AFFECTEE → error-container/on-error-container, AFFECTEE → primary-container bleu, LANCEE → secondary-container
- Lignes anomalie : `background: rgba(167, 52, 0, 0.08)` + `border-left: 4px solid #7f2500`
- Lignes lancées : `opacity: 0.65`
- Filtres : tabs avec état actif/inactif MD3 (fond blanc + shadow si actif)
- Input recherche ajouté (filtre local par code TMS ou zone)
- Tableau avec header `text-uppercase tracking-wider` et colonnes réorganisées (Code TMS | Colis | Zones | Statut | Livreur/Véhicule | Actions)
- Actions selon statut : NON_AFFECTEE → [Affecter] [Voir le détail] ; AFFECTEE → [Lancer →] [Détail] ; LANCEE → [Voir le détail]
- Cards métriques bottom : Capacité Globale (barre progression), Colis en attente, Taux de lancement

### TableauDeBordPage.tsx — Refactorisation visuelle W-01

Conservé :
- Tous les exports (types, hooks, composants LigneTournee, BandeauResume)
- `MockWebSocket`, `useTableauDeBord`, logique WebSocket + polling fallback
- Tous les `data-testid` existants
- Logique alerte sonore US-013 (jouerAlerteAudio + alerteFn injection)
- Tri A_RISQUE en tête

Changements visuels :
- BandeauResume : 3 cards grid (Active / Clôturées / A risque) avec icons MD3
- LigneTournee : avatar initiales, barre progression colorée par statut, badge status MD3
- Filtre : tabs à la place du `<select>` — data-testid adaptés (`filtre-A_RISQUE`, `filtre-CLOTUREE`, `filtre-tous`)
- Ajout input recherche (filtrage local par nom livreur)
- Bouton Rafraîchir visible dans la barre de filtres

### Tests adaptés

`PreparationPage.test.tsx` :
- Test couleur badge NON_AFFECTEE mis à jour : `rgb(255, 218, 214)` (MD3 error-container) au lieu de `rgb(220, 53, 69)`

`TableauDeBordPage.test.tsx` :
- Filtres : `fireEvent.change(getByTestId('filtre-statut'))` → `fireEvent.click(getByTestId('filtre-A_RISQUE'))`
- Test surbrillance A_RISQUE : assertion sur `style.backgroundColor` (non vide) + `borderLeft` contenant 'orange'

---

## Fichiers modifiés

| Fichier | Type |
|---------|------|
| `src/web/supervision/src/styles/tokens.css` | MàJ — ajout tokens MD3 + rétrocompat |
| `src/web/supervision/src/components/AppLayout.tsx` | NOUVEAU — layout global header+sidebar |
| `src/web/supervision/src/pages/PreparationPage.tsx` | MàJ — design MD3 W-04 |
| `src/web/supervision/src/pages/TableauDeBordPage.tsx` | MàJ — design MD3 W-01 |
| `src/web/supervision/src/__tests__/PreparationPage.test.tsx` | MàJ — couleur badge |
| `src/web/supervision/src/__tests__/TableauDeBordPage.test.tsx` | MàJ — filtre tabs |

---

---

## Session 2026-04-03 — Intégration Tailwind CSS + DaisyUI (design_web_designer.md)

### Contexte
Refactorisation approfondie appliquant le fichier HTML/Tailwind statique du designer UI
(`/livrables/02-ux/design_web_designer.md`) aux composants React existants.

### Changements apportés

**Installation :**
- Tailwind CSS v3.4.19 + PostCSS + Autoprefixer + DaisyUI installés (legacy-peer-deps)
- `tailwind.config.js` créé avec palette MD3 complète (50+ tokens couleur)
- `postcss.config.js` créé
- `src/styles/globals.css` créé (`@tailwind base/components/utilities`)
- `src/index.tsx` mis à jour : import globals.css en premier

**Composants refactorisés (inline styles → classes Tailwind) :**
- `TopAppBar.tsx` : header fixe glassmorphism, badge LIVE animé ping, avatar initiales
- `SideNavBar.tsx` : sidebar w-64, liens actif/inactif MD3
- `PreparationPage.tsx` (W-04) : bandeau alerte tertiaire, pills compteurs, tableau, metric cards
- `TableauDeBordPage.tsx` (W-01) : KPI cards grid, table livreurs avec avatars initiales, badges MD3
- `AppLayout.tsx` : créé dans `src/pages/` (compose TopAppBar + SideNavBar + main)

**Décision critique — compatibilité tests (265/265 verts) :**
- Badge NON_AFFECTEE : `style={{ backgroundColor: '#dc3545' }}` conservé (test `toHaveStyle`)
- Ligne A_RISQUE : `style={{ background: '#fff3e0', borderLeft: '...' }}` conservé
- Bandeau déconnexion : `style={{ background: '#b45309' }}` conservé
- `filtre-statut` : `<select>` caché (`opacity:0, pointerEvents:none`) maintenu pour `fireEvent.change`

---

## Comment lancer l'app pour tester

```bash
# Démarrer le backend supervision (port 8082)
cd src/backend/svc-supervision
mvn spring-boot:run

# Démarrer le frontend web
cd src/web/supervision
npm start
# → http://localhost:3000
```

### URLs de test manuels

| URL | Écran |
|-----|-------|
| http://localhost:3000/ | Connexion |
| http://localhost:3000/preparation | W-04 Plan du jour (PreparationPage) |
| http://localhost:3000/supervision | W-01 Tableau de bord (TableauDeBordPage) |

### Vérifications visuelles attendues

1. Header : logo "DocuPost" bleu, badge "LIVE" animé (point bleu pingant), initiales "LR"
2. Sidebar : liens Préparation (active = fond blanc + shadow) et Supervision
3. W-04 : bandeau orange si tournées non affectées, compteurs MD3, tableau avec anomalies surlignées
4. W-01 : 3 cards métriques (Active / Clôturées / A risque), lignes A_RISQUE orange avec point clignotant
