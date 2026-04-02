<!-- Design System -->
# Design Brief — Interface Web Superviseur / Logisticien (DocuPost)

> Document destiné au designer Figma — Interface B uniquement.
> Produit par @ux — 2026-03-25.

## 1. Contexte produit
DocuPost est une plateforme de gestion de tournées de livraison pour La Docaposte. 
**Utilisateur cible** : Laurent Renaud — Responsable Exploitation Logistique / Superviseur.

## 2. Interface B — Application web superviseur / logisticien
**Objectif** : Préparer les tournées (< 30 min) et piloter la flotte en temps réel.
**Contraintes** : Détection d'anomalies en < 5s, WebSocket (LIVE/POLLING/OFFLINE), Grille 12 col (1280px).

## 3. Ecrans à concevoir

### W-04 : Vue liste des tournées du matin (Plan du jour)
- Liste des tournées importées du TMS.
- Bandeau de synthèse (Non affectées, Affectées, Lancées).
- Actions : Affecter, Lancer, Voir détail.
- Anomalies : Icône ⚠ + surlignage orange.

### W-05 : Détail d'une tournée à préparer
- Onglets : Composition (colis, zones, contraintes) / Affectation (sélecteur livreur/véhicule).
- Validation de compatibilité charge/véhicule.

### W-01 : Tableau de bord superviseur
- Vue temps réel des tournées actives.
- Statuts : EN COURS, A RISQUE (clignotant), CLOTUREE.
- Indicateur WebSocket permanent.

### W-02 : Détail d'une tournée (supervision)
- Onglets : Carte / Liste colis / Incidents.
- Suivi GPS et avancement précis.

### W-03 : Panneau d'envoi d'une instruction (modal)
- Types : Prioriser, Annuler, Reprogrammer.

## 5. Contraintes design (v1.0)
- **Couleurs** : Primaire (#1D4ED8), Succès (#16A34A), Alerte (#DC2626), Avertissement (#D97706).
- **Typo** : Work Sans (Titres), Inter (Corps).
- **Composants** : BadgeStatut, BandeauProgression, IndicateurSync.

<!-- DocuPost Design Brief (PRD) -->
<!DOCTYPE html>

<html class="light" lang="fr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>DocuPost Logistics - Préparation</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;600;700;800&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          "on-secondary-container": "#3d4c83",
          "surface-container": "#eceef0",
          "tertiary-container": "#a73400",
          "error": "#ba1a1a",
          "on-primary-fixed-variant": "#0039b5",
          "on-primary-container": "#cad3ff",
          "primary-fixed-dim": "#b7c4ff",
          "surface-bright": "#f7f9fb",
          "on-background": "#191c1e",
          "outline": "#747686",
          "surface-container-highest": "#e0e3e5",
          "secondary-fixed-dim": "#b7c4ff",
          "on-tertiary-fixed": "#390c00",
          "on-primary": "#ffffff",
          "on-secondary-fixed": "#03164d",
          "on-surface-variant": "#434655",
          "surface-container-low": "#f2f4f6",
          "on-secondary-fixed-variant": "#35437b",
          "on-primary-fixed": "#001551",
          "surface-dim": "#d8dadc",
          "on-secondary": "#ffffff",
          "on-tertiary-container": "#ffc9b7",
          "surface-tint": "#2151da",
          "inverse-on-surface": "#eff1f3",
          "on-tertiary": "#ffffff",
          "on-error": "#ffffff",
          "error-container": "#ffdad6",
          "primary-container": "#1d4ed8",
          "surface-container-high": "#e6e8ea",
          "secondary-fixed": "#dce1ff",
          "on-surface": "#191c1e",
          "inverse-primary": "#b7c4ff",
          "primary": "#0037b0",
          "inverse-surface": "#2d3133",
          "on-tertiary-fixed-variant": "#832700",
          "on-error-container": "#93000a",
          "tertiary-fixed": "#ffdbcf",
          "outline-variant": "#c4c5d7",
          "background": "#f7f9fb",
          "surface": "#f7f9fb",
          "surface-container-lowest": "#ffffff",
          "primary-fixed": "#dce1ff",
          "tertiary": "#7f2500",
          "tertiary-fixed-dim": "#ffb59c",
          "surface-variant": "#e0e3e5",
          "secondary": "#4d5b94",
          "secondary-container": "#b0befe"
        },
        fontFamily: {
          "headline": ["Work Sans"],
          "body": ["Inter"],
          "label": ["Inter"]
        },
        borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem"},
      },
    },
  }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; background-color: #f7f9fb; }
        .font-headline { font-family: 'Work Sans', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-header { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
    </style>
</head>
<body class="text-on-surface antialiased">
<!-- TopAppBar -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-slate-50/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50">
<div class="flex items-center gap-8">
<div class="text-xl font-bold text-blue-800 tracking-tighter font-headline">DocuPost</div>
<nav class="hidden md:flex items-center gap-6">
<a class="text-blue-700 font-bold border-b-2 border-blue-700 h-16 flex items-center px-1 font-['Work_Sans'] tracking-tight" href="#">Plan du jour</a>
<a class="text-slate-500 font-medium hover:bg-slate-100 transition-colors h-16 flex items-center px-1 font-['Work_Sans'] tracking-tight" href="#">Historique</a>
</nav>
</div>
<div class="flex items-center gap-4">
<!-- Sync Badge -->
<div class="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/15">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
<span class="text-[0.6875rem] font-bold uppercase tracking-wider text-primary">LIVE</span>
</div>
<div class="flex items-center gap-2">
<button class="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all scale-95 active:opacity-80">
<span class="material-symbols-outlined" data-icon="sync">sync</span>
</button>
<button class="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all scale-95 active:opacity-80">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<div class="h-8 w-[1px] bg-slate-200 mx-1"></div>
<div class="flex items-center gap-3 pl-2">
<div class="text-right">
<div class="text-xs font-bold text-on-surface">Laurent Renaud</div>
<div class="text-[10px] text-slate-500 font-medium">Supervisor Mode</div>
</div>
<img alt="Laurent Renaud" class="w-8 h-8 rounded-full object-cover border border-slate-200" data-alt="Professional portrait of a middle-aged logistics supervisor in a modern office environment with soft lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjgnXBmnLE2A2eTovuxeKDZDYa9c-4oyfMdHkyQ5jRd556UqeKpveIKWBBc4FxfAeu20OQp0MgV0NFxzMaw2_0NdxBd0lOD7tHRaMYEnYWO-t5RKv2WBMbnE7fEkNyROt_KcWqm_tnybYxM8UrdzD_gzogmnbKiBoTtShXdMBC_dXx4t-C5gzl7RqRq2utnVOi_m9odjPhsL0QDKvFg7ePAtplSrlHKJQ52uU_Xk0mcRAJlStw_rNzShrxN7A7SBDU3KGMoy91-Ww"/>
</div>
</div>
</div>
</header>
<!-- SideNavBar -->
<aside class="fixed left-0 top-16 h-[calc(100vh-4rem)] flex flex-col p-4 gap-2 w-64 bg-slate-100 border-r border-slate-200/30">
<div class="space-y-1">
<a class="flex items-center gap-3 px-4 py-3 bg-white text-blue-700 font-semibold shadow-sm rounded-lg transition-all duration-200 ease-in-out" href="/preparation">
<span class="material-symbols-outlined" data-icon="pending_actions" style="font-variation-settings: 'FILL' 1;">pending_actions</span>
<span class="text-sm font-['Inter'] antialiased">Préparation</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-slate-200/50 rounded-lg transition-all duration-200 ease-in-out" href="/supervision">
<span class="material-symbols-outlined" data-icon="monitoring">monitoring</span>
<span class="text-sm font-['Inter'] antialiased">Supervision</span>
</a>
</div>
<div class="mt-auto space-y-1">
<a class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-slate-200/50 rounded-lg transition-all duration-200 ease-in-out" href="#">
<span class="material-symbols-outlined" data-icon="help">help</span>
<span class="text-sm font-['Inter'] antialiased">Aide</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-slate-200/50 rounded-lg transition-all duration-200 ease-in-out" href="#">
<span class="material-symbols-outlined" data-icon="logout">logout</span>
<span class="text-sm font-['Inter'] antialiased">Déconnexion</span>
</a>
</div>
</aside>
<!-- Main Content Canvas -->
<main class="ml-64 mt-16 p-8 min-h-screen">
<!-- Breadcrumbs -->
<nav class="mb-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
<span>Logistique</span>
<span class="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
<span class="text-on-surface font-semibold">Plan du jour</span>
</nav>
<!-- Synthesis Banner -->
<div class="mb-8 p-5 rounded-xl bg-tertiary-fixed flex items-center justify-between border-l-[6px] border-tertiary shadow-sm">
<div class="flex items-center gap-6">
<div class="flex flex-col">
<span class="text-[0.65rem] font-bold uppercase tracking-widest text-on-tertiary-fixed-variant">Alerte Préparation</span>
<span class="text-sm font-semibold text-on-tertiary-fixed">Il reste 3 tournées non affectées à un livreur.</span>
</div>
<div class="h-10 w-[1px] bg-tertiary-fixed-dim/30"></div>
<div class="flex gap-2">
<div class="bg-surface-container-lowest px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
<span class="text-xs font-bold text-slate-500">Toutes</span>
<span class="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">15</span>
</div>
<div class="bg-error-container px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
<span class="text-xs font-bold text-on-error-container">Non affectées</span>
<span class="bg-error text-white text-xs px-2 py-0.5 rounded-full font-bold">3</span>
</div>
<div class="bg-secondary-container px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
<span class="text-xs font-bold text-on-secondary-container">Affectées</span>
<span class="bg-secondary text-white text-xs px-2 py-0.5 rounded-full font-bold">8</span>
</div>
<div class="bg-primary-fixed-dim px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
<span class="text-xs font-bold text-on-primary-fixed">Lancées</span>
<span class="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">4</span>
</div>
</div>
</div>
<div class="flex gap-3">
<button class="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest text-primary font-bold text-sm rounded-md shadow-sm border border-outline-variant/15 hover:bg-primary-fixed transition-all">
<span class="material-symbols-outlined text-sm" data-icon="refresh">refresh</span>
                    Rafraîchir depuis TMS
                </button>
<!-- Disabled state: 'Lancer toutes' hidden/disabled because of non-affected items -->
<button class="flex items-center gap-2 px-4 py-2.5 bg-slate-200 text-slate-400 font-bold text-sm rounded-md cursor-not-allowed">
<span class="material-symbols-outlined text-sm" data-icon="play_arrow">play_arrow</span>
                    Lancer toutes les tournées
                </button>
</div>
</div>
<!-- Filters & Search -->
<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
<div class="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
<button class="px-5 py-2 text-sm font-semibold rounded-md bg-white shadow-sm text-primary">Todas</button>
<button class="px-5 py-2 text-sm font-medium text-slate-500 hover:text-on-surface transition-colors">Non affectées</button>
<button class="px-5 py-2 text-sm font-medium text-slate-500 hover:text-on-surface transition-colors">Affectées</button>
<button class="px-5 py-2 text-sm font-medium text-slate-500 hover:text-on-surface transition-colors">Lancées</button>
</div>
<div class="relative w-80">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" data-icon="search">search</span>
<input class="w-full pl-10 pr-4 py-2.5 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-slate-400" placeholder="Rechercher une tournée..." type="text"/>
</div>
</div>
<!-- Data Table Section -->
<div class="bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
<div class="overflow-x-auto">
<table class="w-full border-collapse text-left">
<thead>
<tr class="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500 border-b border-outline-variant/10">
<th class="py-4 px-6">Code TMS</th>
<th class="py-4 px-6">Colis</th>
<th class="py-4 px-6">Zones</th>
<th class="py-4 px-6">Statut</th>
<th class="py-4 px-6">Livreur / Véhicule</th>
<th class="py-4 px-6 text-right">Actions</th>
</tr>
</thead>
<tbody class="text-sm font-medium">
<!-- Row 1: Anomalie -->
<tr class="group hover:bg-surface-container-high transition-colors bg-tertiary-fixed/20 border-l-4 border-tertiary">
<td class="py-5 px-6 font-headline font-bold text-on-surface">
<div class="flex items-center gap-2">
                                    T-201
                                    <span class="material-symbols-outlined text-tertiary text-lg" data-icon="warning" title="Anomalie de charge">warning</span>
</div>
</td>
<td class="py-5 px-6 text-slate-600">34 colis</td>
<td class="py-5 px-6 text-slate-600">Lyon 3e, Lyon 6e</td>
<td class="py-5 px-6">
<span class="bg-error-container text-on-error-container text-[0.6875rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter">NON AFFECTEE</span>
</td>
<td class="py-5 px-6 text-slate-400 italic">—</td>
<td class="py-5 px-6 text-right space-x-4">
<button class="text-primary font-bold hover:underline transition-all">Affecter</button>
<button class="text-slate-500 font-medium hover:text-on-surface transition-all">Voir le détail</button>
</td>
</tr>
<!-- Row 2: Non Affectée Standard -->
<tr class="group hover:bg-surface-container-high transition-colors bg-white">
<td class="py-5 px-6 font-headline font-bold text-on-surface">T-202</td>
<td class="py-5 px-6 text-slate-600">12 colis</td>
<td class="py-5 px-6 text-slate-600">Villeurbanne</td>
<td class="py-5 px-6">
<span class="bg-error-container text-on-error-container text-[0.6875rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter">NON AFFECTEE</span>
</td>
<td class="py-5 px-6 text-slate-400 italic">—</td>
<td class="py-5 px-6 text-right space-x-4">
<button class="text-primary font-bold hover:underline transition-all">Affecter</button>
<button class="text-slate-500 font-medium hover:text-on-surface transition-all">Voir le détail</button>
</td>
</tr>
<!-- Row 3: Affectée -->
<tr class="group hover:bg-surface-container-high transition-colors bg-white">
<td class="py-5 px-6 font-headline font-bold text-on-surface">T-205</td>
<td class="py-5 px-6 text-slate-600">48 colis</td>
<td class="py-5 px-6 text-slate-600">Vénissieux, Corbas</td>
<td class="py-5 px-6">
<span class="bg-primary-container text-on-primary-container text-[0.6875rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter">AFFECTEE</span>
</td>
<td class="py-5 px-6">
<div class="flex items-center gap-2">
<span class="text-on-surface font-semibold">P. Morel</span>
<span class="text-xs text-slate-400">VH-07</span>
</div>
</td>
<td class="py-5 px-6 text-right space-x-4">
<button class="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded shadow-sm hover:shadow-md transition-all">Lancer →</button>
<button class="text-slate-500 font-medium hover:text-on-surface transition-all">Détail</button>
</td>
</tr>
<!-- Row 4: Affectée -->
<tr class="group hover:bg-surface-container-high transition-colors bg-white">
<td class="py-5 px-6 font-headline font-bold text-on-surface">T-208</td>
<td class="py-5 px-6 text-slate-600">29 colis</td>
<td class="py-5 px-6 text-slate-600">Bron, St-Priest</td>
<td class="py-5 px-6">
<span class="bg-primary-container text-on-primary-container text-[0.6875rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter">AFFECTEE</span>
</td>
<td class="py-5 px-6">
<div class="flex items-center gap-2">
<span class="text-on-surface font-semibold">J. Dubois</span>
<span class="text-xs text-slate-400">VH-12</span>
</div>
</td>
<td class="py-5 px-6 text-right space-x-4">
<button class="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded shadow-sm hover:shadow-md transition-all">Lancer →</button>
<button class="text-slate-500 font-medium hover:text-on-surface transition-all">Détail</button>
</td>
</tr>
<!-- Row 5: Lancée (Reduced Opacity) -->
<tr class="group hover:bg-surface-container-high transition-colors bg-white/60 opacity-60">
<td class="py-5 px-6 font-headline font-bold text-on-surface">T-198</td>
<td class="py-5 px-6 text-slate-600">52 colis</td>
<td class="py-5 px-6 text-slate-600">Lyon 2e, Lyon 7e</td>
<td class="py-5 px-6">
<span class="bg-secondary-container text-on-secondary-container text-[0.6875rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter">LANCEE</span>
</td>
<td class="py-5 px-6">
<div class="flex items-center gap-2">
<span class="text-on-surface font-semibold">M. Leroy</span>
<span class="text-xs text-slate-400">VH-04</span>
</div>
</td>
<td class="py-5 px-6 text-right space-x-4">
<button class="text-slate-500 font-medium hover:text-on-surface transition-all">Voir le détail</button>
</td>
</tr>
<!-- Row 6: Lancée (Reduced Opacity) -->
<tr class="group hover:bg-surface-container-high transition-colors bg-white/60 opacity-60">
<td class="py-5 px-6 font-headline font-bold text-on-surface">T-199</td>
<td class="py-5 px-6 text-slate-600">38 colis</td>
<td class="py-5 px-6 text-slate-600">Ecully, Tassin</td>
<td class="py-5 px-6">
<span class="bg-secondary-container text-on-secondary-container text-[0.6875rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter">LANCEE</span>
</td>
<td class="py-5 px-6">
<div class="flex items-center gap-2">
<span class="text-on-surface font-semibold">S. Atlan</span>
<span class="text-xs text-slate-400">VH-09</span>
</div>
</td>
<td class="py-5 px-6 text-right space-x-4">
<button class="text-slate-500 font-medium hover:text-on-surface transition-all">Voir le détail</button>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Pagination -->
<div class="p-6 flex flex-col items-center gap-4 bg-surface-container-lowest border-t border-outline-variant/10">
<button class="px-8 py-2.5 bg-white text-on-surface font-bold text-sm rounded-lg shadow-sm border border-outline-variant/20 hover:bg-slate-50 transition-all flex items-center gap-2">
                    Charger plus
                    <span class="material-symbols-outlined text-sm" data-icon="expand_more">expand_more</span>
</button>
<span class="text-[0.6875rem] font-bold text-slate-400 uppercase tracking-widest">Affichage 15 / 42 tournées</span>
</div>
</div>
<!-- Metric Cards Grid (Bottom section for high-end feel) -->
<div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
<div class="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/5">
<div class="flex justify-between items-start mb-4">
<span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Capacité Globale</span>
<span class="material-symbols-outlined text-primary" data-icon="local_shipping">local_shipping</span>
</div>
<div class="text-3xl font-bold font-headline text-on-surface mb-2">84%</div>
<div class="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
<div class="h-full bg-primary rounded-full" style="width: 84%"></div>
</div>
<p class="mt-3 text-[10px] font-medium text-slate-500">12 véhicules opérationnels sur 14</p>
</div>
<div class="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/5">
<div class="flex justify-between items-start mb-4">
<span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Colis en attente</span>
<span class="material-symbols-outlined text-tertiary" data-icon="package_2">package_2</span>
</div>
<div class="text-3xl font-bold font-headline text-on-surface mb-2">412</div>
<p class="text-xs text-slate-500 font-medium">+12% par rapport à hier (08:00)</p>
</div>
<div class="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/5">
<div class="flex justify-between items-start mb-4">
<span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimation de fin</span>
<span class="material-symbols-outlined text-secondary" data-icon="schedule">schedule</span>
</div>
<div class="text-3xl font-bold font-headline text-on-surface mb-2">18:45</div>
<p class="text-xs text-secondary font-bold flex items-center gap-1">
<span class="material-symbols-outlined text-sm" data-icon="trending_down">trending_down</span>
                    -15 min (Optimisation TMS)
                </p>
</div>
</div>
</main>
<!-- Contextual FAB - suppressed on detail/list page as per instructions, 
         but technically preparation is a primary dashboard view. 
         Included only if crucial for navigation flow. -->
</body></html>

<!-- W-04: Plan du jour (Préparation) -->
<!DOCTYPE html>

<html class="light" lang="fr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>DocuPost Logistics - Supervision Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;600;700;800&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "on-secondary-container": "#3d4c83",
              "surface-container": "#eceef0",
              "tertiary-container": "#a73400",
              "error": "#ba1a1a",
              "on-primary-fixed-variant": "#0039b5",
              "on-primary-container": "#cad3ff",
              "primary-fixed-dim": "#b7c4ff",
              "surface-bright": "#f7f9fb",
              "on-background": "#191c1e",
              "outline": "#747686",
              "surface-container-highest": "#e0e3e5",
              "secondary-fixed-dim": "#b7c4ff",
              "on-tertiary-fixed": "#390c00",
              "on-primary": "#ffffff",
              "on-secondary-fixed": "#03164d",
              "on-surface-variant": "#434655",
              "surface-container-low": "#f2f4f6",
              "on-secondary-fixed-variant": "#35437b",
              "on-primary-fixed": "#001551",
              "surface-dim": "#d8dadc",
              "on-secondary": "#ffffff",
              "on-tertiary-container": "#ffc9b7",
              "surface-tint": "#2151da",
              "inverse-on-surface": "#eff1f3",
              "on-tertiary": "#ffffff",
              "on-error": "#ffffff",
              "error-container": "#ffdad6",
              "primary-container": "#1d4ed8",
              "surface-container-high": "#e6e8ea",
              "secondary-fixed": "#dce1ff",
              "on-surface": "#191c1e",
              "inverse-primary": "#b7c4ff",
              "primary": "#0037b0",
              "inverse-surface": "#2d3133",
              "on-tertiary-fixed-variant": "#832700",
              "on-error-container": "#93000a",
              "tertiary-fixed": "#ffdbcf",
              "outline-variant": "#c4c5d7",
              "background": "#f7f9fb",
              "surface": "#f7f9fb",
              "surface-container-lowest": "#ffffff",
              "primary-fixed": "#dce1ff",
              "tertiary": "#7f2500",
              "tertiary-fixed-dim": "#ffb59c",
              "surface-variant": "#e0e3e5",
              "secondary": "#4d5b94",
              "secondary-container": "#b0befe"
            },
            fontFamily: {
              "headline": ["Work Sans"],
              "body": ["Inter"],
              "label": ["Inter"]
            },
            borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem"},
          },
        },
      }
    </script>
<style>
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      body {
        font-family: 'Inter', sans-serif;
        background-color: #f7f9fb;
      }
      .font-headline { font-family: 'Work Sans', sans-serif; }
      .glass-card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
      }
      .pulse-dot {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .4; }
      }
    </style>
</head>
<body class="text-on-surface antialiased overflow-x-hidden">
<!-- TopAppBar -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-800/50">
<div class="flex items-center gap-4">
<span class="text-xl font-bold text-blue-800 dark:text-blue-200 tracking-tighter font-headline">DocuPost</span>
<div class="h-6 w-[1px] bg-outline-variant/30"></div>
<div class="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full">
<span class="w-2 h-2 rounded-full bg-emerald-500 pulse-dot"></span>
<span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Live</span>
<span class="text-[10px] text-outline ml-1">Dernière mise à jour : il y a 5s</span>
</div>
</div>
<div class="flex items-center gap-6">
<div class="flex items-center gap-2">
<span class="text-xs font-medium text-outline">Alerte sonore</span>
<button class="w-10 h-5 bg-primary rounded-full relative transition-colors duration-200">
<span class="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></span>
</button>
</div>
<div class="flex items-center gap-3">
<button class="p-2 text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-full relative">
<span class="material-symbols-outlined">sync</span>
</button>
<button class="p-2 text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-full relative">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
</button>
<div class="flex items-center gap-2 ml-2 pl-4 border-l border-outline-variant/30">
<div class="text-right">
<p class="text-xs font-bold leading-tight">Laurent Renaud</p>
<p class="text-[10px] text-outline leading-tight">Supervisor Mode</p>
</div>
<img alt="Laurent Renaud" class="w-8 h-8 rounded-full object-cover grayscale" data-alt="professional headshot of a middle-aged male supervisor with short hair wearing a clean navy shirt in a bright office environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeGBjct8zmA_Nii093mt2t47aPIYrFkWGYdI8RyQAiQ5PJ5MNAFZZCY6uz4KbvcwDg-rsQUlON0x4ZTMYxsqGqss7WPxlciUXqVW4Y-F9Pc9y_JLEj6JHFAPbHzyg4areYZIgHc0jnoXoZKDl6meZV3aaQ9om4172z3Cx01S7pq45cdCXrNmGYbzxRTi5ioSwKQpnEKuNACG6AQefQYAXCKCh0oLpAcG4bihrwz379vSJQ-owoTU8vWGB3JSoGXkH_73hc6MAhMVE"/>
</div>
</div>
</div>
</header>
<!-- SideNavBar -->
<aside class="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-slate-100 dark:bg-slate-950 flex flex-col p-4 gap-2 border-r border-slate-200/30 dark:border-slate-800/30">
<div class="mb-6 px-2">
<h2 class="text-xs font-bold text-outline uppercase tracking-widest mb-4">Logistics Management</h2>
<nav class="flex flex-col gap-1">
<a class="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg transition-all" href="#">
<span class="material-symbols-outlined">pending_actions</span>
<span class="font-medium text-sm">Préparation</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 font-semibold shadow-sm rounded-lg transition-all" href="#">
<span class="material-symbols-outlined">monitoring</span>
<span class="font-medium text-sm">Supervision</span>
</a>
</nav>
</div>
<div class="mt-auto flex flex-col gap-1">
<a class="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg transition-all" href="#">
<span class="material-symbols-outlined">help</span>
<span class="font-medium text-sm">Aide</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg transition-all" href="#">
<span class="material-symbols-outlined">logout</span>
<span class="font-medium text-sm">Déconnexion</span>
</a>
</div>
</aside>
<!-- Main Content Canvas -->
<main class="ml-64 mt-16 p-8 min-h-[calc(100vh-4rem)]">
<!-- Breadcrumbs -->
<nav class="flex items-center gap-2 mb-6 text-xs text-outline">
<span>DocuPost</span>
<span class="material-symbols-outlined text-sm">chevron_right</span>
<span class="text-on-surface font-semibold">Supervision</span>
</nav>
<!-- Synthesis Banner -->
<section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
<div class="bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between border-l-4 border-primary shadow-sm">
<div>
<p class="text-xs font-bold text-outline uppercase tracking-wider mb-1">Active</p>
<p class="text-4xl font-headline font-bold text-primary">12</p>
</div>
<span class="material-symbols-outlined text-primary/20 text-5xl">local_shipping</span>
</div>
<div class="bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between border-l-4 border-emerald-500 shadow-sm">
<div>
<p class="text-xs font-bold text-outline uppercase tracking-wider mb-1">Clôturées</p>
<p class="text-4xl font-headline font-bold text-emerald-600">8</p>
</div>
<span class="material-symbols-outlined text-emerald-500/20 text-5xl">check_circle</span>
</div>
<div class="bg-tertiary-fixed p-6 rounded-xl flex items-center justify-between border-l-4 border-tertiary shadow-sm">
<div>
<p class="text-xs font-bold text-on-tertiary-fixed-variant uppercase tracking-wider mb-1">A risque</p>
<p class="text-4xl font-headline font-bold text-tertiary">2</p>
</div>
<span class="material-symbols-outlined text-tertiary/20 text-5xl">warning</span>
</div>
</section>
<!-- Search & Filter Controls -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
<div class="relative w-full md:w-96 group">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
<input class="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Rechercher un livreur..." type="text"/>
</div>
<div class="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl">
<button class="px-4 py-1.5 text-xs font-bold bg-white shadow-sm rounded-lg text-primary">Toutes</button>
<button class="px-4 py-1.5 text-xs font-medium text-outline hover:text-on-surface transition-colors">En cours</button>
<button class="px-4 py-1.5 text-xs font-medium text-outline hover:text-on-surface transition-colors">A risque</button>
<button class="px-4 py-1.5 text-xs font-medium text-outline hover:text-on-surface transition-colors">Clôturées</button>
</div>
<button class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-primary/20">
<span class="material-symbols-outlined text-sm">refresh</span>
                Rafraîchir
            </button>
</div>
<!-- Data Table Section -->
<div class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-low border-b border-outline-variant/10">
<th class="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Livreur</th>
<th class="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Tournée</th>
<th class="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Avancement</th>
<th class="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Statut</th>
<th class="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Activité</th>
<th class="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider text-right">Actions</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant/5">
<!-- Row 1: A RISQUE -->
<tr class="bg-orange-50/50 hover:bg-orange-100/40 transition-colors border-l-4 border-orange-500">
<td class="px-6 py-5">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">PM</div>
<span class="font-bold text-sm">P. Morel</span>
</div>
</td>
<td class="px-6 py-5">
<span class="text-xs font-bold px-2 py-1 bg-surface-container-high rounded text-on-surface-variant">T-042</span>
</td>
<td class="px-6 py-5">
<div class="w-48">
<div class="flex justify-between items-center mb-1">
<span class="text-[10px] font-bold text-outline">14 / 45 colis</span>
<span class="text-[10px] font-bold text-primary">31%</span>
</div>
<div class="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
<div class="h-full bg-primary rounded-full" style="width: 31%"></div>
</div>
</div>
</td>
<td class="px-6 py-5">
<div class="flex flex-col gap-1">
<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase w-fit pulse-dot">
<span class="w-1.5 h-1.5 rounded-full bg-error"></span>
                                        A RISQUE
                                    </span>
<span class="text-[10px] font-medium text-error">Retard 45min</span>
</div>
</td>
<td class="px-6 py-5 text-xs text-error font-medium">
                                il y a 3 min
                            </td>
<td class="px-6 py-5 text-right">
<button class="px-4 py-1.5 text-xs font-bold text-primary border border-primary/20 rounded-md hover:bg-primary hover:text-white transition-all">Voir</button>
</td>
</tr>
<!-- Row 2: A RISQUE -->
<tr class="bg-orange-50/50 hover:bg-orange-100/40 transition-colors border-l-4 border-orange-500">
<td class="px-6 py-5">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">JD</div>
<span class="font-bold text-sm">J. Dubois</span>
</div>
</td>
<td class="px-6 py-5">
<span class="text-xs font-bold px-2 py-1 bg-surface-container-high rounded text-on-surface-variant">T-058</span>
</td>
<td class="px-6 py-5">
<div class="w-48">
<div class="flex justify-between items-center mb-1">
<span class="text-[10px] font-bold text-outline">28 / 52 colis</span>
<span class="text-[10px] font-bold text-primary">54%</span>
</div>
<div class="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
<div class="h-full bg-primary rounded-full" style="width: 54%"></div>
</div>
</div>
</td>
<td class="px-6 py-5">
<div class="flex flex-col gap-1">
<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase w-fit pulse-dot">
<span class="w-1.5 h-1.5 rounded-full bg-error"></span>
                                        A RISQUE
                                    </span>
<span class="text-[10px] font-medium text-error">Anomalie scan</span>
</div>
</td>
<td class="px-6 py-5 text-xs text-on-surface-variant">
                                il y a 1 min
                            </td>
<td class="px-6 py-5 text-right">
<button class="px-4 py-1.5 text-xs font-bold text-primary border border-primary/20 rounded-md hover:bg-primary hover:text-white transition-all">Voir</button>
</td>
</tr>
<!-- Row 3: EN COURS -->
<tr class="hover:bg-slate-50 transition-colors">
<td class="px-6 py-5">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">LM</div>
<span class="font-bold text-sm">L. Martin</span>
</div>
</td>
<td class="px-6 py-5">
<span class="text-xs font-bold px-2 py-1 bg-surface-container-high rounded text-on-surface-variant">T-104</span>
</td>
<td class="px-6 py-5">
<div class="w-48">
<div class="flex justify-between items-center mb-1">
<span class="text-[10px] font-bold text-outline">42 / 50 colis</span>
<span class="text-[10px] font-bold text-primary">84%</span>
</div>
<div class="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
<div class="h-full bg-primary rounded-full" style="width: 84%"></div>
</div>
</div>
</td>
<td class="px-6 py-5">
<span class="px-2 py-1 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold uppercase">EN COURS</span>
</td>
<td class="px-6 py-5 text-xs text-on-tertiary-fixed-variant font-medium">
                                il y a 22 min
                            </td>
<td class="px-6 py-5 text-right">
<button class="px-4 py-1.5 text-xs font-bold text-primary border border-primary/20 rounded-md hover:bg-primary hover:text-white transition-all">Voir</button>
</td>
</tr>
<!-- Row 4: EN COURS (normal) -->
<tr class="hover:bg-slate-50 transition-colors">
<td class="px-6 py-5">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">SR</div>
<span class="font-bold text-sm">S. Robert</span>
</div>
</td>
<td class="px-6 py-5">
<span class="text-xs font-bold px-2 py-1 bg-surface-container-high rounded text-on-surface-variant">T-089</span>
</td>
<td class="px-6 py-5">
<div class="w-48">
<div class="flex justify-between items-center mb-1">
<span class="text-[10px] font-bold text-outline">12 / 48 colis</span>
<span class="text-[10px] font-bold text-primary">25%</span>
</div>
<div class="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
<div class="h-full bg-primary rounded-full" style="width: 25%"></div>
</div>
</div>
</td>
<td class="px-6 py-5">
<span class="px-2 py-1 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold uppercase">EN COURS</span>
</td>
<td class="px-6 py-5 text-xs text-on-surface-variant">
                                il y a 8 min
                            </td>
<td class="px-6 py-5 text-right">
<button class="px-4 py-1.5 text-xs font-bold text-primary border border-primary/20 rounded-md hover:bg-primary hover:text-white transition-all">Voir</button>
</td>
</tr>
<!-- Row 5: CLOTUREE -->
<tr class="opacity-60 bg-surface-container-low/30">
<td class="px-6 py-5">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">AB</div>
<span class="font-medium text-sm">A. Bernard</span>
</div>
</td>
<td class="px-6 py-5">
<span class="text-xs font-bold px-2 py-1 bg-surface-container-high rounded text-on-surface-variant">T-012</span>
</td>
<td class="px-6 py-5">
<div class="w-48">
<div class="flex justify-between items-center mb-1">
<span class="text-[10px] font-bold text-outline">35 / 35 colis</span>
<span class="text-[10px] font-bold text-emerald-600">100%</span>
</div>
<div class="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
<div class="h-full bg-emerald-500 rounded-full" style="width: 100%"></div>
</div>
</div>
</td>
<td class="px-6 py-5">
<span class="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">CLOTURÉE</span>
</td>
<td class="px-6 py-5 text-xs text-outline italic">
                                il y a 2h
                            </td>
<td class="px-6 py-5 text-right">
<!-- No actions for completed -->
</td>
</tr>
<!-- Row 6: CLOTUREE -->
<tr class="opacity-60 bg-surface-container-low/30">
<td class="px-6 py-5">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">HP</div>
<span class="font-medium text-sm">H. Petit</span>
</div>
</td>
<td class="px-6 py-5">
<span class="text-xs font-bold px-2 py-1 bg-surface-container-high rounded text-on-surface-variant">T-005</span>
</td>
<td class="px-6 py-5">
<div class="w-48">
<div class="flex justify-between items-center mb-1">
<span class="text-[10px] font-bold text-outline">48 / 48 colis</span>
<span class="text-[10px] font-bold text-emerald-600">100%</span>
</div>
<div class="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
<div class="h-full bg-emerald-500 rounded-full" style="width: 100%"></div>
</div>
</div>
</td>
<td class="px-6 py-5">
<span class="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">CLOTURÉE</span>
</td>
<td class="px-6 py-5 text-xs text-outline italic">
                                il y a 3h
                            </td>
<td class="px-6 py-5 text-right">
</td>
</tr>
</tbody>
</table>
</div>
<div class="p-6 border-t border-outline-variant/5 flex justify-center">
<button class="flex items-center gap-2 px-8 py-2.5 text-xs font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors rounded-lg">
                    Charger plus
                    <span class="material-symbols-outlined text-sm">expand_more</span>
</button>
</div>
</div>
</main>
<!-- Visual Polish: Map Overlay Section for High-End feel -->
<section class="ml-64 px-8 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
<div class="h-[400px] rounded-2xl overflow-hidden relative shadow-lg group">
<img alt="abstract dark cartography map with neon blue traffic lines" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" data-location="Paris" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYetldN3ccIo_woeaM-sD4gJ91PVT5YalPksZ5KY-uhAwpctHmX8tFx7rifUvHz08Pg_erUKbs0MSAMvms5j7xmJEVWR5gC8PG3-38YzF2txhoC_FE3cL6vJV9_cAn2zdlY0f8eo2Z6wzaPqVsQ0WwGWvsoP5c9ofIiCei7yCprG_1w38feZjSNlI4ITcu5eCoVHHn5uZ03FWlonHG7-kNv5Sb9mhvx9bfkIE5ZI7x80B1TXU8j13CUg4jA5uxyTX-v27gRdydYmE"/>
<div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-8">
<h3 class="text-white font-headline text-xl font-bold mb-2">Zone Nord - Secteur T-042</h3>
<p class="text-white/70 text-sm">Visualisation en temps réel des incidents de parcours.</p>
<div class="mt-4 flex gap-4">
<div class="px-3 py-1 bg-error/20 border border-error/30 rounded backdrop-blur text-error text-[10px] font-bold uppercase">2 Incidents</div>
<div class="px-3 py-1 bg-white/10 border border-white/20 rounded backdrop-blur text-white/80 text-[10px] font-bold uppercase">Zone Congestionnée</div>
</div>
</div>
</div>
<div class="flex flex-col gap-6">
<div class="glass-card p-8 rounded-2xl flex-1 flex flex-col border border-white shadow-sm">
<div class="flex items-center justify-between mb-8">
<h3 class="font-headline text-lg font-bold">Activité Récente</h3>
<span class="material-symbols-outlined text-outline">history</span>
</div>
<div class="space-y-6">
<div class="flex gap-4">
<div class="w-2 h-2 rounded-full bg-error mt-1.5 shrink-0"></div>
<div>
<p class="text-sm font-bold">Alerte Retard : P. Morel (T-042)</p>
<p class="text-[11px] text-outline mt-1">Immobilisé depuis 12 min - Zone industrielle Sud.</p>
<p class="text-[10px] font-bold text-primary mt-2">CONTACTER LIVREUR</p>
</div>
</div>
<div class="flex gap-4">
<div class="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
<div>
<p class="text-sm font-bold">Tournée Clôturée : A. Bernard</p>
<p class="text-[11px] text-outline mt-1">35 colis livrés sans anomalie. Retour agence à 10:45.</p>
</div>
</div>
<div class="flex gap-4">
<div class="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
<div>
<p class="text-sm font-bold">Sync Système OK</p>
<p class="text-[11px] text-outline mt-1">Dernière synchronisation des données de géolocalisation réussie.</p>
</div>
</div>
</div>
</div>
</div>
</section>
</body></html>

<!-- W-01: Tableau de bord (Supervision) -->
<!DOCTYPE html>

<html class="light" lang="fr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "on-secondary-container": "#3d4c83",
              "surface-container": "#eceef0",
              "tertiary-container": "#a73400",
              "error": "#ba1a1a",
              "on-primary-fixed-variant": "#0039b5",
              "on-primary-container": "#cad3ff",
              "primary-fixed-dim": "#b7c4ff",
              "surface-bright": "#f7f9fb",
              "on-background": "#191c1e",
              "outline": "#747686",
              "surface-container-highest": "#e0e3e5",
              "secondary-fixed-dim": "#b7c4ff",
              "on-tertiary-fixed": "#390c00",
              "on-primary": "#ffffff",
              "on-secondary-fixed": "#03164d",
              "on-surface-variant": "#434655",
              "surface-container-low": "#f2f4f6",
              "on-secondary-fixed-variant": "#35437b",
              "on-primary-fixed": "#001551",
              "surface-dim": "#d8dadc",
              "on-secondary": "#ffffff",
              "on-tertiary-container": "#ffc9b7",
              "surface-tint": "#2151da",
              "inverse-on-surface": "#eff1f3",
              "on-tertiary": "#ffffff",
              "on-error": "#ffffff",
              "error-container": "#ffdad6",
              "primary-container": "#1d4ed8",
              "surface-container-high": "#e6e8ea",
              "secondary-fixed": "#dce1ff",
              "on-surface": "#191c1e",
              "inverse-primary": "#b7c4ff",
              "primary": "#0037b0",
              "inverse-surface": "#2d3133",
              "on-tertiary-fixed-variant": "#832700",
              "on-error-container": "#93000a",
              "tertiary-fixed": "#ffdbcf",
              "outline-variant": "#c4c5d7",
              "background": "#f7f9fb",
              "surface": "#f7f9fb",
              "surface-container-lowest": "#ffffff",
              "primary-fixed": "#dce1ff",
              "tertiary": "#7f2500",
              "tertiary-fixed-dim": "#ffb59c",
              "surface-variant": "#e0e3e5",
              "secondary": "#4d5b94",
              "secondary-container": "#b0befe"
            },
            fontFamily: {
              "headline": ["Work Sans"],
              "body": ["Inter"],
              "label": ["Inter"]
            },
            borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem"},
          },
        },
      }
    </script>
<style>
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      .glass-panel {
        background: rgba(247, 249, 251, 0.8);
        backdrop-filter: blur(20px);
      }
      .pulse-live {
        box-shadow: 0 0 0 0 rgba(0, 55, 176, 0.4);
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 55, 176, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 55, 176, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 55, 176, 0); }
      }
    </style>
</head>
<body class="bg-surface font-body text-on-surface antialiased">
<!-- TopAppBar -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-800/50">
<div class="flex items-center gap-4">
<span class="text-xl font-bold text-blue-800 dark:text-blue-200 tracking-tighter font-headline">DocuPost</span>
<div class="h-6 w-[1px] bg-outline-variant/30 mx-2"></div>
<div class="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full">
<span class="w-2 h-2 bg-primary rounded-full pulse-live"></span>
<span class="text-[10px] font-bold tracking-widest text-primary uppercase">LIVE</span>
</div>
</div>
<div class="flex items-center gap-6">
<div class="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-xl w-64 group focus-within:ring-2 ring-primary/20 transition-all">
<span class="material-symbols-outlined text-outline text-sm">search</span>
<input class="bg-transparent border-none focus:ring-0 text-xs w-full placeholder:text-outline" placeholder="Rechercher une tournée..." type="text"/>
</div>
<div class="flex items-center gap-2">
<button class="p-2 text-slate-500 hover:bg-slate-100 transition-colors rounded-lg relative">
<span class="material-symbols-outlined">sync</span>
</button>
<button class="p-2 text-slate-500 hover:bg-slate-100 transition-colors rounded-lg relative">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<div class="flex items-center gap-3 pl-4 border-l border-slate-200/50">
<div class="text-right">
<p class="text-xs font-semibold leading-none">Laurent Renaud</p>
<p class="text-[10px] text-outline mt-1 uppercase tracking-tighter">Supervisor</p>
</div>
<img alt="Laurent Renaud" class="w-9 h-9 rounded-full object-cover border border-outline-variant/20" data-alt="professional headshot of a middle-aged male logistics supervisor with a confident look and clean background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgEoDL9lYhJpwlRR4NgKcst8NTcwO4twF2esjabJcIb7Smsf6W4djyK6GGtCKDDhyF9gy3bSqaGc1N4-SyiqWchMeed_jRJWIyWHWCik5mn9O_2_fcdKZnvvNxM6aTb5tDNvRQ9ZTI6xkJdWQW-HslTZV2p59OCgUupnR9h5QV6nSGjTJmBLTUoGw5fEcrwXNFz3bFdLYOLyajKBVX7pZPB6qhpnb-YdWVmxrZyr4U9gSNfWoOkBt5_Gxz94PcepxKw7jHNgbxZjE"/>
</div>
</div>
</div>
</header>
<!-- SideNavBar -->
<aside class="fixed left-0 top-16 h-[calc(100vh-4rem)] flex flex-col p-4 gap-2 bg-slate-100 dark:bg-slate-950 w-64 border-r border-slate-200/30 dark:border-slate-800/30">
<div class="mb-6 px-2">
<h2 class="text-xs font-bold text-outline uppercase tracking-widest">DocuPost Logistics</h2>
<p class="text-[10px] text-primary font-medium">Supervisor Mode</p>
</div>
<nav class="flex-1 space-y-1">
<a class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 font-semibold shadow-sm rounded-lg transition-all duration-200 ease-in-out" href="#">
<span class="material-symbols-outlined text-lg">pending_actions</span>
<span class="text-sm">Préparation</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg transition-all" href="#">
<span class="material-symbols-outlined text-lg">monitoring</span>
<span class="text-sm">Supervision</span>
</a>
</nav>
<div class="mt-auto space-y-1 pt-4 border-t border-slate-200/30">
<a class="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 rounded-lg transition-all" href="#">
<span class="material-symbols-outlined text-lg">help</span>
<span class="text-sm">Aide</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-error/80 hover:bg-error-container/20 rounded-lg transition-all" href="#">
<span class="material-symbols-outlined text-lg">logout</span>
<span class="text-sm">Déconnexion</span>
</a>
</div>
</aside>
<!-- Main Canvas -->
<main class="ml-64 pt-16 min-h-screen">
<div class="p-8 max-w-7xl mx-auto">
<!-- Breadcrumbs & Title Section -->
<div class="mb-8">
<nav class="flex items-center gap-2 text-xs text-outline mb-4">
<a class="hover:text-primary transition-colors" href="#">Plan du jour</a>
<span class="material-symbols-outlined text-[14px]">chevron_right</span>
<span class="text-on-surface font-medium">Tournée T-203</span>
</nav>
<div class="flex items-end justify-between">
<div>
<div class="flex items-center gap-4 mb-2">
<h1 class="text-3xl font-headline font-semibold tracking-tight text-on-surface">Tournée T-203</h1>
<span class="px-3 py-1 bg-error text-on-primary text-[10px] font-bold rounded-full uppercase">NON AFFECTEE</span>
</div>
<div class="flex items-center gap-2 text-tertiary font-medium bg-tertiary-fixed/30 px-3 py-1.5 rounded-lg border border-tertiary/10">
<span class="material-symbols-outlined text-lg">warning</span>
<span class="text-xs">Anomalie de charge détectée</span>
</div>
</div>
<div class="flex gap-3">
<button class="px-5 py-2.5 bg-surface-container-high text-on-surface text-sm font-semibold rounded-md border border-outline-variant/30 hover:bg-surface-dim transition-all">
                            Valider l'affectation
                        </button>
<button class="px-6 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-md shadow-md hover:bg-primary/90 transition-all flex items-center gap-2">
                            Valider et lancer la tournée
                            <span class="material-symbols-outlined text-sm">rocket_launch</span>
</button>
</div>
</div>
</div>
<!-- Tabs Navigation -->
<div class="flex gap-8 border-b border-outline-variant/20 mb-8">
<button class="pb-4 text-sm font-bold text-primary border-b-2 border-primary relative">
                    Composition
                    <span class="absolute -top-1 -right-4 w-5 h-5 bg-primary/10 text-primary text-[10px] rounded-full flex items-center justify-center">84</span>
</button>
<button class="pb-4 text-sm font-medium text-outline hover:text-on-surface-variant transition-colors">
                    Affectation
                </button>
</div>
<!-- Dashboard Content: Grid -->
<div class="grid grid-cols-12 gap-6 items-start">
<!-- Left Column (8 units) -->
<div class="col-span-12 lg:col-span-8 space-y-6">
<!-- Top Section: Zones & Anomalie -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<!-- Zones Covered -->
<div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
<h3 class="text-sm font-headline font-bold mb-5 flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-lg">map</span>
                                Zones de livraison
                            </h3>
<div class="space-y-4">
<div class="space-y-1.5">
<div class="flex justify-between text-[11px] font-bold uppercase tracking-tighter">
<span>Zone Nord-Est (B-12)</span>
<span class="text-primary">65%</span>
</div>
<div class="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
<div class="h-full bg-primary w-[65%] rounded-full opacity-90"></div>
</div>
</div>
<div class="space-y-1.5">
<div class="flex justify-between text-[11px] font-bold uppercase tracking-tighter">
<span>Zone Centre-Ville (A-01)</span>
<span class="text-primary">35%</span>
</div>
<div class="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
<div class="h-full bg-primary w-[35%] rounded-full opacity-90"></div>
</div>
</div>
</div>
</div>
<!-- Contraintes -->
<div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
<h3 class="text-sm font-headline font-bold mb-5 flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-lg">assignment_late</span>
                                Contraintes majeures
                            </h3>
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1.5 bg-secondary-container/30 text-on-secondary-container text-[11px] font-semibold rounded-lg flex items-center gap-1.5">
<span class="material-symbols-outlined text-sm">schedule</span> Avant 10h00
                                </span>
<span class="px-3 py-1.5 bg-tertiary-fixed/30 text-on-tertiary-fixed-variant text-[11px] font-semibold rounded-lg flex items-center gap-1.5">
<span class="material-symbols-outlined text-sm">inventory_2</span> Colis fragile
                                </span>
<span class="px-3 py-1.5 bg-surface-container-high text-outline text-[11px] font-semibold rounded-lg flex items-center gap-1.5">
<span class="material-symbols-outlined text-sm">signature</span> Signature requise
                                </span>
</div>
</div>
</div>
<!-- Anomalie Box -->
<div class="bg-tertiary-fixed/20 p-5 rounded-xl border border-tertiary/10 flex gap-4 items-start">
<div class="bg-tertiary/10 p-2 rounded-lg">
<span class="material-symbols-outlined text-tertiary">error</span>
</div>
<div>
<p class="text-sm font-bold text-tertiary mb-1">Anomalie de charge détectée</p>
<p class="text-xs text-on-tertiary-fixed-variant leading-relaxed">Poids estimé (450kg) &gt; Capacité véhicule standard (350kg). <br/><strong>Recommandation:</strong> Affecter un véhicule de type VH-XX ou scinder la tournée en deux segments.</p>
</div>
</div>
<!-- Parcels Table -->
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
<div class="px-6 py-5 border-b border-outline-variant/10 flex justify-between items-center">
<h3 class="text-sm font-headline font-bold">Liste des colis (Aperçu)</h3>
<div class="flex gap-2">
<button class="p-1.5 text-outline hover:bg-surface-container rounded-md transition-all">
<span class="material-symbols-outlined text-lg">filter_list</span>
</button>
<button class="text-[11px] font-bold text-primary px-3 py-1 hover:bg-primary/5 rounded-md transition-all">Exporter CSV</button>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-low">
<th class="px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-wider">ID Colis</th>
<th class="px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-wider">Adresse</th>
<th class="px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-wider">Zone</th>
<th class="px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-wider">Contraintes</th>
<th class="px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-wider text-right">Poids</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant/10">
<tr class="hover:bg-surface-container-low/50 transition-colors">
<td class="px-6 py-4 text-xs font-semibold font-mono">#PX-9021</td>
<td class="px-6 py-4 text-xs">12 Rue de la République, 75001</td>
<td class="px-6 py-4">
<span class="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold rounded uppercase">A-01</span>
</td>
<td class="px-6 py-4">
<span class="text-[10px] bg-tertiary-container/10 text-tertiary-container font-bold px-1.5 py-0.5 rounded">Fragile</span>
</td>
<td class="px-6 py-4 text-xs font-medium text-right">12.5 kg</td>
</tr>
<tr class="hover:bg-surface-container-low/50 transition-colors">
<td class="px-6 py-4 text-xs font-semibold font-mono">#PX-9044</td>
<td class="px-6 py-4 text-xs">45 Bd Haussmann, 75009</td>
<td class="px-6 py-4">
<span class="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold rounded uppercase">A-01</span>
</td>
<td class="px-6 py-4">
<span class="text-[10px] bg-primary-container/10 text-primary-container font-bold px-1.5 py-0.5 rounded">Avant 10h</span>
</td>
<td class="px-6 py-4 text-xs font-medium text-right">4.2 kg</td>
</tr>
<tr class="hover:bg-surface-container-low/50 transition-colors">
<td class="px-6 py-4 text-xs font-semibold font-mono">#PX-9082</td>
<td class="px-6 py-4 text-xs">8 Square de l'Opéra, 75009</td>
<td class="px-6 py-4">
<span class="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold rounded uppercase">A-01</span>
</td>
<td class="px-6 py-4">
<span class="text-[10px] text-outline italic">Aucune</span>
</td>
<td class="px-6 py-4 text-xs font-medium text-right">32.0 kg</td>
</tr>
<tr class="hover:bg-surface-container-low/50 transition-colors">
<td class="px-6 py-4 text-xs font-semibold font-mono">#PX-9103</td>
<td class="px-6 py-4 text-xs">102 Avenue Kléber, 75116</td>
<td class="px-6 py-4">
<span class="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold rounded uppercase">B-12</span>
</td>
<td class="px-6 py-4">
<span class="text-[10px] bg-primary-container/10 text-primary-container font-bold px-1.5 py-0.5 rounded">Signature</span>
</td>
<td class="px-6 py-4 text-xs font-medium text-right">0.8 kg</td>
</tr>
<tr class="hover:bg-surface-container-low/50 transition-colors">
<td class="px-6 py-4 text-xs font-semibold font-mono">#PX-9115</td>
<td class="px-6 py-4 text-xs">5 Villa des Ternes, 75017</td>
<td class="px-6 py-4">
<span class="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold rounded uppercase">B-12</span>
</td>
<td class="px-6 py-4">
<span class="text-[10px] text-outline italic">Aucune</span>
</td>
<td class="px-6 py-4 text-xs font-medium text-right">15.4 kg</td>
</tr>
</tbody>
</table>
</div>
<div class="px-6 py-4 border-t border-outline-variant/10 bg-surface-container-low/30">
<button class="w-full text-center text-xs font-bold text-primary hover:underline">Voir tous les 84 colis</button>
</div>
</div>
</div>
<!-- Right Column (4 units) -->
<div class="col-span-12 lg:col-span-4 space-y-6">
<!-- Summary Card -->
<div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
<h3 class="text-sm font-headline font-bold mb-6">Récapitulatif</h3>
<div class="space-y-6">
<div class="flex items-center gap-4">
<div class="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
<span class="material-symbols-outlined">weight</span>
</div>
<div>
<p class="text-[10px] text-outline uppercase font-bold tracking-tighter">Poids estimé</p>
<p class="text-xl font-headline font-bold text-on-surface">450 kg</p>
</div>
</div>
<div class="flex items-center gap-4">
<div class="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
<span class="material-symbols-outlined">schedule</span>
</div>
<div>
<p class="text-[10px] text-outline uppercase font-bold tracking-tighter">Durée estimée</p>
<p class="text-xl font-headline font-bold text-on-surface">6h30</p>
</div>
</div>
<div class="flex items-center gap-4">
<div class="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
<span class="material-symbols-outlined">distance</span>
</div>
<div>
<p class="text-[10px] text-outline uppercase font-bold tracking-tighter">Distance</p>
<p class="text-xl font-headline font-bold text-on-surface">45 km</p>
</div>
</div>
</div>
</div>
<!-- Affectation Selectors -->
<div class="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
<h3 class="text-sm font-headline font-bold mb-5">Affectation rapide</h3>
<div class="space-y-4">
<div class="space-y-1.5">
<label class="text-[10px] font-bold text-outline uppercase">Livreur</label>
<div class="relative group">
<select class="w-full bg-white border border-outline-variant/50 rounded-lg py-2.5 px-4 text-sm appearance-none focus:ring-2 ring-primary/20 outline-none transition-all cursor-pointer">
<option disabled="" selected="" value="">Sélectionner un livreur</option>
<option>Jean Dupont (Disponible)</option>
<option>Marie Curie (En service)</option>
<option>Marc Veyrat (Disponible)</option>
</select>
<span class="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none">expand_more</span>
</div>
</div>
<div class="space-y-1.5">
<label class="text-[10px] font-bold text-outline uppercase">Véhicule</label>
<div class="relative group">
<select class="w-full bg-white border border-outline-variant/50 rounded-lg py-2.5 px-4 text-sm appearance-none focus:ring-2 ring-primary/20 outline-none transition-all cursor-pointer">
<option disabled="" selected="" value="">Sélectionner un véhicule</option>
<option>VH-001 (Standard)</option>
<option class="text-primary font-bold">VH-XX (Grande Capacité)</option>
<option>VH-012 (Standard)</option>
</select>
<span class="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none">expand_more</span>
</div>
<p class="text-[10px] text-tertiary font-medium mt-1">💡 Recommandé : VH-XX pour cette charge.</p>
</div>
</div>
</div>
<!-- Map Preview -->
<div class="relative h-48 rounded-xl overflow-hidden shadow-inner border border-outline-variant/20">
<img alt="Map View" class="w-full h-full object-cover grayscale opacity-50" data-alt="stylized modern digital city map of Paris with blue highlights on specific delivery routes and zones" data-location="Paris" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTWqeQLoFNdF8TUs6iCWZa9OzDNs1x4p18WxBjrUAEfNOd1PXvhKsj5BppuDXpjhhLDglleTjX8x3lBiE6_Emw1oWoV6qGeoRZXZNt8293E0axcInyLjLjirr6i4OV8K_8dVSsC8YO6-McKAbNYIWbm1yVSj-MA8nbcpaMgRjr10LCH1YXHcllxQzSK7_CFoPJOwktchg12HjcPnJ-FMwgRQM_QXGi8XCBZDMZ4D4ImPos_0XY6jbITBJ3co5vUlUH4Ycu2JlhKNE"/>
<div class="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
<div class="absolute inset-0 flex items-center justify-center">
<button class="bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-xs font-bold text-primary shadow-lg border border-primary/20 flex items-center gap-2">
<span class="material-symbols-outlined text-sm">open_in_full</span>
                                Agrandir la carte
                            </button>
</div>
</div>
</div>
</div>
</div>
</main>
</body></html>

<!-- W-05: Détail tournée (Préparation) -->
<!DOCTYPE html>

<html class="light" lang="fr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>DocuPost Logistics - Détail d'une tournée</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;600;700;800&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "on-secondary-container": "#3d4c83",
                        "surface-container": "#eceef0",
                        "tertiary-container": "#a73400",
                        "error": "#ba1a1a",
                        "on-primary-fixed-variant": "#0039b5",
                        "on-primary-container": "#cad3ff",
                        "primary-fixed-dim": "#b7c4ff",
                        "surface-bright": "#f7f9fb",
                        "on-background": "#191c1e",
                        "outline": "#747686",
                        "surface-container-highest": "#e0e3e5",
                        "secondary-fixed-dim": "#b7c4ff",
                        "on-tertiary-fixed": "#390c00",
                        "on-primary": "#ffffff",
                        "on-secondary-fixed": "#03164d",
                        "on-surface-variant": "#434655",
                        "surface-container-low": "#f2f4f6",
                        "on-secondary-fixed-variant": "#35437b",
                        "on-primary-fixed": "#001551",
                        "surface-dim": "#d8dadc",
                        "on-secondary": "#ffffff",
                        "on-tertiary-container": "#ffc9b7",
                        "surface-tint": "#2151da",
                        "inverse-on-surface": "#eff1f3",
                        "on-tertiary": "#ffffff",
                        "on-error": "#ffffff",
                        "error-container": "#ffdad6",
                        "primary-container": "#1d4ed8",
                        "surface-container-high": "#e6e8ea",
                        "secondary-fixed": "#dce1ff",
                        "on-surface": "#191c1e",
                        "inverse-primary": "#b7c4ff",
                        "primary": "#0037b0",
                        "inverse-surface": "#2d3133",
                        "on-tertiary-fixed-variant": "#832700",
                        "on-error-container": "#93000a",
                        "tertiary-fixed": "#ffdbcf",
                        "outline-variant": "#c4c5d7",
                        "background": "#f7f9fb",
                        "surface": "#f7f9fb",
                        "surface-container-lowest": "#ffffff",
                        "primary-fixed": "#dce1ff",
                        "tertiary": "#7f2500",
                        "tertiary-fixed-dim": "#ffb59c",
                        "surface-variant": "#e0e3e5",
                        "secondary": "#4d5b94",
                        "secondary-container": "#b0befe"
                    },
                    fontFamily: {
                        "headline": ["Work Sans"],
                        "body": ["Inter"],
                        "label": ["Inter"]
                    },
                    borderRadius: { "DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem" },
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .animate-pulse-subtle {
            animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-subtle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e0e3e5;
            border-radius: 10px;
        }
    </style>
</head>
<body class="bg-surface font-body text-on-surface antialiased">
<!-- TopAppBar Shell -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-800/50">
<div class="flex items-center gap-8">
<span class="text-xl font-bold text-blue-800 dark:text-blue-200 tracking-tighter font-headline">DocuPost</span>
<div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/15">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
</span>
<span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-label">LIVE</span>
<div class="w-px h-3 bg-outline-variant/30 mx-1"></div>
<span class="text-[11px] text-on-surface-variant">Dernière mise à jour : il y a 5s</span>
</div>
</div>
<div class="flex items-center gap-4">
<div class="flex items-center gap-2 mr-4">
<button class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
<span class="material-symbols-outlined">sync</span>
</button>
<button class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 relative">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-slate-50"></span>
</button>
<button class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
<span class="material-symbols-outlined">settings</span>
</button>
</div>
<div class="flex items-center gap-3 pl-4 border-l border-slate-200/50">
<div class="text-right">
<p class="text-sm font-semibold text-on-surface">Laurent Renaud</p>
<p class="text-[10px] uppercase tracking-widest text-on-surface-variant font-label">Supervisor Mode</p>
</div>
<img alt="Laurent Renaud" class="w-9 h-9 rounded-full object-cover border border-outline-variant/30" data-alt="Close-up portrait of a professional middle-aged man with short hair in a bright office setting with soft natural light" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDA_6F_mDrR4oQy0qvxA_MI-fwfQ9DFcsJj-mImVL1_PS4BHlI8ybRjBt3ergsb9kZXp-k22rqRVTlFWrFsyQuT-agXbclVa2AdXN9LxPKFxLLjQLudpHneYnDMzfEs89wq7ou20l6U4q4_tMrt91V8BTbOndvxq9UUn7QZMnVoeNh8cws21WhY9UcrHEXUaKOjcpPKxOtcCB-ztKiILGtrp4z27Vu4Z2NbAwj9lxIL5Fytl-x5Lc2MGTGG-JgiaccLthfrl7Y0SYY"/>
</div>
</div>
</header>
<!-- SideNavBar Shell -->
<aside class="fixed left-0 top-16 h-[calc(100vh-4rem)] flex flex-col p-4 gap-2 w-64 bg-slate-100 dark:bg-slate-950 border-r border-slate-200/30 dark:border-slate-800/30 font-['Inter'] text-sm antialiased z-40">
<nav class="flex-1 flex flex-col gap-1">
<a class="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200 ease-in-out" href="#">
<span class="material-symbols-outlined">pending_actions</span>
<span class="font-medium">Préparation</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 font-semibold shadow-sm rounded-lg transition-all duration-200 ease-in-out" href="#">
<span class="material-symbols-outlined">monitoring</span>
<span class="font-medium">Supervision</span>
</a>
</nav>
<div class="mt-auto flex flex-col gap-1 border-t border-slate-200/30 pt-4">
<a class="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200/50 rounded-lg transition-all" href="#">
<span class="material-symbols-outlined">help</span>
<span class="font-medium">Aide</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-200/50 rounded-lg transition-all" href="#">
<span class="material-symbols-outlined">logout</span>
<span class="font-medium">Déconnexion</span>
</a>
</div>
</aside>
<!-- Main Content Canvas -->
<main class="ml-64 pt-16 min-h-screen">
<div class="p-8 max-w-[1600px] mx-auto">
<!-- Breadcrumbs & Header Section -->
<div class="mb-8 flex justify-between items-end">
<div>
<nav class="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-2">
<span>Supervision</span>
<span class="material-symbols-outlined text-[14px]">chevron_right</span>
<span class="text-primary font-bold">Tournée T-043</span>
</nav>
<h1 class="text-3xl font-bold font-headline tracking-tight text-on-surface">Tournée T-043</h1>
<div class="flex items-center gap-4 mt-2">
<div class="flex items-center gap-2 text-sm text-on-surface-variant">
<span class="material-symbols-outlined text-lg">person</span>
<span class="font-medium">L. Petit (Livreur)</span>
</div>
<div class="w-1 h-1 bg-outline-variant rounded-full"></div>
<div class="flex items-center gap-2 text-sm text-on-surface-variant">
<span class="material-symbols-outlined text-lg">local_shipping</span>
<span class="font-medium">VH-07 (Véhicule)</span>
</div>
</div>
</div>
<div class="flex gap-3">
<button class="px-4 py-2 bg-surface-container-lowest text-primary border border-primary/20 rounded-md font-semibold text-sm hover:bg-primary-fixed transition-all flex items-center gap-2">
<span class="material-symbols-outlined text-lg">contact_phone</span>
                        Contacter le livreur
                    </button>
<button class="px-4 py-2 bg-primary text-on-primary rounded-md font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-sm">
<span class="material-symbols-outlined text-lg">ios_share</span>
                        Exporter le rapport
                    </button>
</div>
</div>
<!-- Status Banner - Layered Authority -->
<section class="bg-error-container/40 p-6 rounded-xl border border-error/10 mb-8 relative overflow-hidden">
<div class="absolute top-0 right-0 w-64 h-full opacity-5 pointer-events-none">
<span class="material-symbols-outlined text-[180px] -mr-16 -mt-8" style="font-variation-settings: 'FILL' 1;">warning</span>
</div>
<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
<div class="flex items-center gap-5">
<div class="bg-error text-on-error px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm shadow-lg animate-pulse-subtle">
<span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">warning</span>
                            A RISQUE
                        </div>
<div>
<div class="flex items-baseline gap-2">
<span class="text-3xl font-bold font-headline text-on-error-container">32 / 56</span>
<span class="text-sm font-medium text-on-error-container/70">colis livrés</span>
</div>
<p class="text-xs font-bold text-error uppercase tracking-wider mt-1">Retard estimé : 45min</p>
</div>
</div>
<div class="flex-1 max-w-md">
<div class="flex justify-between items-center mb-2">
<span class="text-xs font-bold text-on-error-container/80 uppercase font-label">Avancement 57%</span>
<span class="text-[11px] text-on-error-container/60">Dernière activité : il y a 3 min</span>
</div>
<div class="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
<div class="h-full bg-gradient-to-r from-tertiary to-error w-[57%] rounded-full shadow-[0_0_8px_rgba(186,26,26,0.3)]"></div>
</div>
</div>
</div>
</section>
<!-- Navigation Tabs Section -->
<div class="flex items-center gap-8 border-b border-outline-variant/15 mb-6">
<button class="px-4 py-4 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 border-b-2 border-transparent">
<span class="material-symbols-outlined text-xl">map</span>
                    Carte
                </button>
<button class="px-4 py-4 text-sm font-bold text-primary border-b-2 border-primary flex items-center gap-2">
<span class="material-symbols-outlined text-xl">list_alt</span>
                    Liste colis
                </button>
<button class="px-4 py-4 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 border-b-2 border-transparent">
<span class="material-symbols-outlined text-xl">report_problem</span>
                    Incidents
                    <span class="bg-tertiary text-on-tertiary px-1.5 py-0.5 rounded-full text-[10px]">2</span>
</button>
</div>
<!-- Content Area - Data Focus -->
<div class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10">
<!-- Sub-filters & Search -->
<div class="p-4 bg-surface-container-low/50 flex flex-wrap items-center justify-between gap-4">
<div class="flex p-1 bg-surface-container rounded-lg">
<button class="px-4 py-1.5 text-xs font-bold bg-surface-container-lowest text-primary rounded-md shadow-sm">Tous</button>
<button class="px-4 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface">A livrer</button>
<button class="px-4 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface">Livrés</button>
<button class="px-4 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface">Échecs</button>
</div>
<div class="relative w-full max-w-xs">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
<input class="w-full pl-10 pr-4 py-2 text-sm bg-surface-container-lowest border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-outline" placeholder="Rechercher un colis ou une adresse..." type="text"/>
</div>
</div>
<!-- Data Table -->
<div class="overflow-x-auto">
<table class="w-full border-collapse">
<thead>
<tr class="bg-surface-container-low text-left">
<th class="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest font-label">Parcel ID</th>
<th class="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest font-label">Destinataire &amp; Adresse</th>
<th class="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest font-label">Statut</th>
<th class="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest font-label">Dernière Activité</th>
<th class="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest font-label text-right">Actions</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant/10">
<!-- Row 1: A LIVRER with Action -->
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="px-6 py-5">
<span class="text-sm font-bold text-primary">#00312</span>
</td>
<td class="px-6 py-5">
<div class="flex flex-col">
<span class="text-sm font-semibold text-on-surface">Mme Sophie Durand</span>
<span class="text-xs text-on-surface-variant">25 Rue Victor Hugo, Lyon 3e</span>
</div>
</td>
<td class="px-6 py-5">
<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-container text-on-primary-container uppercase tracking-wider">
                                        A LIVRER
                                    </span>
</td>
<td class="px-6 py-5">
<div class="flex items-center gap-2 text-xs text-on-surface-variant">
<span class="material-symbols-outlined text-sm">schedule</span>
                                        Passage prévu : 14:15
                                    </div>
</td>
<td class="px-6 py-5 text-right">
<button class="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-md hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1 ml-auto">
<span class="material-symbols-outlined text-sm">sticky_note_2</span>
                                        Instruction
                                    </button>
</td>
</tr>
<!-- Row 2: LIVRÉ (Greyed) -->
<tr class="bg-surface-container-low/30 transition-colors opacity-70">
<td class="px-6 py-5">
<span class="text-sm font-bold text-outline">#00298</span>
</td>
<td class="px-6 py-5">
<div class="flex flex-col">
<span class="text-sm font-semibold text-on-surface">Boulangerie "Le Pain d'Or"</span>
<span class="text-xs text-on-surface-variant">12 Avenue Jean Jaurès, Lyon 7e</span>
</div>
</td>
<td class="px-6 py-5">
<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-600 text-on-primary uppercase tracking-wider">
                                        LIVRÉ
                                    </span>
</td>
<td class="px-6 py-5">
<div class="flex items-center gap-2 text-xs text-on-surface-variant">
<span class="material-symbols-outlined text-sm">check_circle</span>
                                        Remis en main propre : 11:34
                                    </div>
</td>
<td class="px-6 py-5 text-right">
<button class="p-2 text-outline hover:text-primary transition-colors">
<span class="material-symbols-outlined">visibility</span>
</button>
</td>
</tr>
<!-- Row 3: ECHEC with Motif -->
<tr class="hover:bg-surface-container-low transition-colors">
<td class="px-6 py-5">
<span class="text-sm font-bold text-primary">#00305</span>
</td>
<td class="px-6 py-5">
<div class="flex flex-col">
<span class="text-sm font-semibold text-on-surface">Jean-Marc Lopez</span>
<span class="text-xs text-on-surface-variant">3 bis Place Bellecour, Lyon 2e</span>
</div>
</td>
<td class="px-6 py-5">
<div class="flex flex-col items-start gap-1">
<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-error-container text-on-error-container uppercase tracking-wider">
                                            ECHEC
                                        </span>
<span class="text-[10px] text-error font-medium italic">Motif : Destinataire absent</span>
</div>
</td>
<td class="px-6 py-5">
<div class="flex items-center gap-2 text-xs text-on-surface-variant">
<span class="material-symbols-outlined text-sm">history_toggle_off</span>
                                        Tentative à 12:45
                                    </div>
</td>
<td class="px-6 py-5 text-right">
<button class="p-2 text-outline hover:text-error transition-colors">
<span class="material-symbols-outlined">refresh</span>
</button>
</td>
</tr>
<!-- Row 4: A LIVRER -->
<tr class="hover:bg-surface-container-low transition-colors">
<td class="px-6 py-5">
<span class="text-sm font-bold text-primary">#00315</span>
</td>
<td class="px-6 py-5">
<div class="flex flex-col">
<span class="text-sm font-semibold text-on-surface">Cabinet Médical Dr. Weiss</span>
<span class="text-xs text-on-surface-variant">88 Cours Lafayette, Lyon 3e</span>
</div>
</td>
<td class="px-6 py-5">
<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-container text-on-primary-container uppercase tracking-wider">
                                        A LIVRER
                                    </span>
</td>
<td class="px-6 py-5">
<div class="flex items-center gap-2 text-xs text-on-surface-variant">
<span class="material-symbols-outlined text-sm">schedule</span>
                                        En attente
                                    </div>
</td>
<td class="px-6 py-5 text-right">
<button class="p-2 text-outline hover:text-primary transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<!-- Row 5: A LIVRER -->
<tr class="hover:bg-surface-container-low transition-colors">
<td class="px-6 py-5">
<span class="text-sm font-bold text-primary">#00318</span>
</td>
<td class="px-6 py-5">
<div class="flex flex-col">
<span class="text-sm font-semibold text-on-surface">Marie-Claire Fontaine</span>
<span class="text-xs text-on-surface-variant">42 Rue de Marseille, Lyon 7e</span>
</div>
</td>
<td class="px-6 py-5">
<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-container text-on-primary-container uppercase tracking-wider">
                                        A LIVRER
                                    </span>
</td>
<td class="px-6 py-5">
<div class="flex items-center gap-2 text-xs text-on-surface-variant">
<span class="material-symbols-outlined text-sm">schedule</span>
                                        En attente
                                    </div>
</td>
<td class="px-6 py-5 text-right">
<button class="p-2 text-outline hover:text-primary transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Table Footer -->
<div class="px-6 py-4 bg-surface-container-low/30 border-t border-outline-variant/10 flex justify-between items-center">
<span class="text-xs text-on-surface-variant">Affichage de 5 sur 56 colis</span>
<div class="flex gap-2">
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 text-outline hover:bg-white">
<span class="material-symbols-outlined text-sm">chevron_left</span>
</button>
<button class="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary text-xs font-bold">1</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 text-on-surface-variant hover:bg-white text-xs">2</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 text-on-surface-variant hover:bg-white text-xs">3</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 text-outline hover:bg-white">
<span class="material-symbols-outlined text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
</main>
<!-- Bottom WebSocket Indicator Shell -->
<div class="fixed bottom-6 right-6 z-50">
<div class="flex items-center gap-3 px-4 py-2 bg-surface-container-lowest/80 backdrop-blur-md rounded-full border border-outline-variant/20 shadow-xl">
<span class="relative flex h-3 w-3">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span class="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
</span>
<div class="flex flex-col">
<span class="text-[10px] font-bold text-primary leading-none uppercase tracking-tighter">Flux Temps Réel</span>
<span class="text-[9px] text-on-surface-variant leading-none mt-0.5">WebSocket Connecté</span>
</div>
</div>
</div>
</body></html>

<!-- W-02: Détail tournée (Supervision) -->
<!DOCTYPE html>

<html class="light" lang="fr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;600;700;800&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "on-secondary-container": "#3d4c83",
              "surface-container": "#eceef0",
              "tertiary-container": "#a73400",
              "error": "#ba1a1a",
              "on-primary-fixed-variant": "#0039b5",
              "on-primary-container": "#cad3ff",
              "primary-fixed-dim": "#b7c4ff",
              "surface-bright": "#f7f9fb",
              "on-background": "#191c1e",
              "outline": "#747686",
              "surface-container-highest": "#e0e3e5",
              "secondary-fixed-dim": "#b7c4ff",
              "on-tertiary-fixed": "#390c00",
              "on-primary": "#ffffff",
              "on-secondary-fixed": "#03164d",
              "on-surface-variant": "#434655",
              "surface-container-low": "#f2f4f6",
              "on-secondary-fixed-variant": "#35437b",
              "on-primary-fixed": "#001551",
              "surface-dim": "#d8dadc",
              "on-secondary": "#ffffff",
              "on-tertiary-container": "#ffc9b7",
              "surface-tint": "#2151da",
              "inverse-on-surface": "#eff1f3",
              "on-tertiary": "#ffffff",
              "on-error": "#ffffff",
              "error-container": "#ffdad6",
              "primary-container": "#1d4ed8",
              "surface-container-high": "#e6e8ea",
              "secondary-fixed": "#dce1ff",
              "on-surface": "#191c1e",
              "inverse-primary": "#b7c4ff",
              "primary": "#0037b0",
              "inverse-surface": "#2d3133",
              "on-tertiary-fixed-variant": "#832700",
              "on-error-container": "#93000a",
              "tertiary-fixed": "#ffdbcf",
              "outline-variant": "#c4c5d7",
              "background": "#f7f9fb",
              "surface": "#f7f9fb",
              "surface-container-lowest": "#ffffff",
              "primary-fixed": "#dce1ff",
              "tertiary": "#7f2500",
              "tertiary-fixed-dim": "#ffb59c",
              "surface-variant": "#e0e3e5",
              "secondary": "#4d5b94",
              "secondary-container": "#b0befe"
            },
            fontFamily: {
              "headline": ["Work Sans"],
              "body": ["Inter"],
              "label": ["Inter"]
            },
            borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem"},
          },
        },
      }
    </script>
<style>
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      .glass-overlay {
        background: rgba(247, 249, 251, 0.7);
        backdrop-filter: blur(20px);
      }
      .modal-shadow {
        box-shadow: 0 24px 48px -12px rgba(25, 28, 30, 0.06);
      }
    </style>
</head>
<body class="bg-surface font-body text-on-surface antialiased overflow-hidden">
<!-- Background Screen W-02 (Blurred Context) -->
<div class="fixed inset-0 z-0 flex blur-md opacity-40 select-none pointer-events-none">
<!-- SideNav Simulation -->
<aside class="fixed left-0 top-16 h-[calc(100vh-4rem)] flex flex-col p-4 gap-2 bg-slate-100 w-64 border-r border-slate-200/30">
<div class="p-3 mb-4">
<div class="h-10 w-10 bg-slate-300 rounded-full mb-2"></div>
<div class="h-4 w-24 bg-slate-300 rounded"></div>
</div>
<div class="space-y-2">
<div class="h-10 w-full bg-white rounded-lg"></div>
<div class="h-10 w-full bg-slate-200 rounded-lg"></div>
</div>
</aside>
<!-- Main Content Simulation -->
<main class="ml-64 mt-16 p-12 w-full grid grid-cols-12 gap-8">
<header class="col-span-12 flex justify-between items-end mb-4">
<div class="space-y-2">
<div class="h-8 w-48 bg-slate-300 rounded"></div>
<div class="h-4 w-32 bg-slate-200 rounded"></div>
</div>
<div class="h-12 w-64 bg-slate-300 rounded-xl"></div>
</header>
<div class="col-span-8 space-y-6">
<div class="h-96 w-full bg-white rounded-xl shadow-sm"></div>
<div class="h-64 w-full bg-white rounded-xl shadow-sm"></div>
</div>
<div class="col-span-4 space-y-6">
<div class="h-[600px] w-full bg-white rounded-xl shadow-sm"></div>
</div>
</main>
</div>
<!-- TopAppBar -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-slate-50/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50">
<div class="flex items-center gap-4">
<span class="text-xl font-bold text-blue-800 tracking-tighter font-headline">DocuPost</span>
<nav class="hidden md:flex gap-6 ml-8">
<a class="text-slate-500 font-medium hover:bg-slate-100 transition-colors px-3 py-1 rounded" href="#">Tableau de bord</a>
<a class="text-blue-700 font-bold border-b-2 border-blue-700 px-3 py-1" href="#">Supervision</a>
</nav>
</div>
<div class="flex items-center gap-4">
<div class="relative">
<span class="material-symbols-outlined text-on-surface-variant p-2 hover:bg-slate-100 rounded-full cursor-pointer transition-all active:opacity-80 scale-95" data-icon="sync">sync</span>
</div>
<span class="material-symbols-outlined text-on-surface-variant p-2 hover:bg-slate-100 rounded-full cursor-pointer transition-all active:opacity-80 scale-95" data-icon="notifications">notifications</span>
<div class="flex items-center gap-3 pl-4 border-l border-slate-200">
<span class="text-sm font-medium text-on-surface">Laurent Renaud</span>
<img alt="Profile" class="h-8 w-8 rounded-full object-cover" data-alt="professional portrait of a male logistics supervisor in a clean corporate setting, soft studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYe3ywMEQkCmkGjrvvdSjHMQOLWUhHEzUnx3R2n3uvLlBbk5O54eJa9U2fF9-aKO-LzNY3dC8tkdTUCwBbiOU8e3rEKa45j51cfnjurjx4-OqpLO1oMKtEBEpuCl3TKl78ZCOhpLOKbMK2CCcfDeY0DE9FWqbfZ5ZgfSCYC8TNshodBGa92N8gkebLI2Dr-BrTakl2UOn5FNkc_nafMEoQ31XH7hFoUa1U8TNAOUmkocSonPl00UcqY1HbdE_kSh5rIM7aOAqnlCo"/>
</div>
</div>
</header>
<!-- Modal Overlay -->
<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 glass-overlay">
<!-- Modal Container -->
<div class="bg-surface-container-lowest w-full max-w-xl rounded-xl modal-shadow overflow-hidden flex flex-col">
<!-- Modal Header -->
<div class="px-8 pt-8 pb-4 flex justify-between items-start">
<div>
<h2 class="text-2xl font-semibold font-headline text-on-surface tracking-tight">Envoyer une instruction</h2>
<div class="flex items-center gap-2 mt-1">
<span class="text-sm font-medium text-primary">Tournée T-043</span>
<span class="text-outline-variant text-xs">•</span>
<span class="text-sm text-on-surface-variant">L. Petit</span>
</div>
</div>
<button class="p-2 hover:bg-surface-container-low rounded-full transition-colors text-outline">
<span class="material-symbols-outlined" data-icon="close">close</span>
</button>
</div>
<!-- Modal Body -->
<div class="px-8 pb-8 space-y-6">
<!-- Parcel Card -->
<div class="bg-surface-container-low p-5 rounded-xl flex items-center justify-between">
<div class="flex items-center gap-4">
<div class="h-12 w-12 bg-white rounded-lg flex items-center justify-center text-primary">
<span class="material-symbols-outlined" data-icon="package_2">package_2</span>
</div>
<div>
<p class="text-xs font-bold font-label text-outline uppercase tracking-wider">Colis ID #00312</p>
<p class="text-sm font-semibold text-on-surface">25 Rue Victor Hugo, Lyon 3e</p>
</div>
</div>
<div class="px-3 py-1 bg-primary-container rounded-full">
<span class="text-[10px] font-bold text-on-primary-container font-label uppercase">En cours</span>
</div>
</div>
<!-- Action Selection Grid -->
<div class="space-y-3">
<label class="text-xs font-bold text-outline font-label uppercase tracking-widest px-1">Type d'instruction</label>
<div class="grid grid-cols-3 gap-3">
<!-- Card: Prioritize -->
<div class="border-2 border-primary bg-primary/[0.03] p-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-sm">
<div class="h-10 w-10 bg-primary text-on-primary rounded-full flex items-center justify-center">
<span class="material-symbols-outlined" data-icon="arrow_upward">arrow_upward</span>
</div>
<span class="text-xs font-semibold text-primary text-center">Prioriser ce colis</span>
</div>
<!-- Card: Cancel -->
<div class="border border-outline-variant bg-surface-container-lowest p-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-surface-container-low">
<div class="h-10 w-10 bg-surface-container-highest text-on-surface-variant rounded-full flex items-center justify-center">
<span class="material-symbols-outlined" data-icon="close">close</span>
</div>
<span class="text-xs font-medium text-on-surface-variant text-center">Annuler la livraison</span>
</div>
<!-- Card: Reschedule -->
<div class="border border-outline-variant bg-surface-container-lowest p-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-surface-container-low">
<div class="h-10 w-10 bg-surface-container-highest text-on-surface-variant rounded-full flex items-center justify-center">
<span class="material-symbols-outlined" data-icon="refresh">refresh</span>
</div>
<span class="text-xs font-medium text-on-surface-variant text-center">Reprogrammer</span>
</div>
</div>
</div>
<!-- Message Complementaire -->
<div class="space-y-2">
<div class="flex justify-between items-center px-1">
<label class="text-xs font-bold text-outline font-label uppercase tracking-widest">Message complémentaire</label>
<span class="text-[10px] font-medium text-outline-variant">0 / 200</span>
</div>
<textarea class="w-full h-24 p-4 bg-surface-container-low border-0 rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/50 resize-none" placeholder="Ajouter une précision pour le livreur..."></textarea>
</div>
<!-- Information Banner (Live Indicator) -->
<div class="flex items-center gap-3 px-4 py-3 bg-secondary-fixed/30 rounded-lg">
<div class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</div>
<p class="text-xs font-medium text-on-secondary-fixed-variant">Livreur en ligne — L'instruction sera transmise instantanément.</p>
</div>
</div>
<!-- Modal Footer -->
<div class="px-8 py-6 bg-surface-container-low flex justify-end gap-3">
<button class="px-6 py-2.5 rounded-md text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors">
                    Annuler
                </button>
<button class="px-8 py-2.5 rounded-md text-sm font-bold bg-primary text-on-primary hover:bg-primary-container transition-all shadow-md hover:shadow-lg active:scale-95 uppercase tracking-wide">
                    ENVOYER L'INSTRUCTION
                </button>
</div>
</div>
</div>
</body></html>