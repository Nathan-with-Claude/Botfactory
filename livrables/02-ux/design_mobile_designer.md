<!-- Design System -->
# Design Brief — Application Mobile Livreur (DocuPost)
> Document destiné au designer Figma — Interface A uniquement.
> Produit par @ux — 2026-03-25.

## 1. Contexte produit
DocuPost est une plateforme de gestion de tournées de livraison pour La Docaposte.
Utilisateur cible : Pierre Morel, livreur terrain (35 ans, 80-120 colis/jour, Android).
Contraintes : usage extérieur (soleil, gants, une main), mode offline obligatoire.

## 2. Contraintes Design Critiques
- Taille texte corps : 16px min.
- Touch target : 48x48px min.
- Usage une main : actions principales en bas.
- Mode offline-first : badge LIVE/OFFLINE permanent.
- Formulaires courts : max 2 choix par écran d'action.

## 3. Système de Design (Tokens)
- Primaire : #1D4ED8 (Bleu)
- Succès : #16A34A (Vert)
- Alerte : #DC2626 (Rouge)
- Avertissement : #D97706 (Orange)
- Info : #2563EB (Bleu clair)
- Info Foncé : #1E3A8A (Bandeau instruction)
- Typo : Inter (H1 24px SemiBold, Corps 16px Regular).

## 4. Ecrans à concevoir
- M-01 : Authentification SSO
- M-02 : Liste des colis (Header progress, Filtres zone, Cards, Footer Scan/Clôture)
- M-03 : Détail colis (Infos destinataire, Maps, Appel, Actions Livrer/Echec)
- M-04 : Capture de preuve (Sélecteur 4 types, Zone dynamique signature/photo)
- M-05 : Déclaration échec (Motifs, Dispositions, Note terrain)
- M-06 : Notification instruction (Overlay bleu foncé, compte à rebours 10s)

<!-- PRD - DocuPost Mobile App -->
<!DOCTYPE html>

<html class="light" lang="fr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "surface-bright": "#f7f9fb",
                        "on-surface-variant": "#434655",
                        "tertiary": "#00501f",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a",
                        "surface-variant": "#e0e3e5",
                        "surface-tint": "#2151da",
                        "surface-container-high": "#e6e8ea",
                        "primary": "#0037b0",
                        "inverse-surface": "#2d3133",
                        "on-secondary": "#ffffff",
                        "on-surface": "#191c1e",
                        "on-error-container": "#93000a",
                        "on-primary": "#ffffff",
                        "on-tertiary": "#ffffff",
                        "tertiary-fixed": "#7ffc97",
                        "secondary-container": "#8fa7fe",
                        "surface-container-lowest": "#ffffff",
                        "on-secondary-fixed": "#00164e",
                        "on-tertiary-fixed-variant": "#005320",
                        "on-error": "#ffffff",
                        "on-secondary-fixed-variant": "#264191",
                        "surface-container-highest": "#e0e3e5",
                        "surface-dim": "#d8dadc",
                        "tertiary-container": "#006b2c",
                        "background": "#f7f9fb",
                        "inverse-on-surface": "#eff1f3",
                        "on-primary-fixed": "#001551",
                        "primary-container": "#1d4ed8",
                        "surface-container": "#eceef0",
                        "primary-fixed-dim": "#b7c4ff",
                        "on-background": "#191c1e",
                        "surface-container-low": "#f2f4f6",
                        "outline-variant": "#c4c5d7",
                        "outline": "#747686",
                        "on-primary-fixed-variant": "#0039b5",
                        "secondary-fixed-dim": "#b6c4ff",
                        "tertiary-fixed-dim": "#62df7d",
                        "on-primary-container": "#cad3ff",
                        "primary-fixed": "#dce1ff",
                        "inverse-primary": "#b7c4ff",
                        "on-tertiary-container": "#71ee8a",
                        "secondary": "#4059aa",
                        "on-secondary-container": "#1d3989",
                        "surface": "#f7f9fb",
                        "on-tertiary-fixed": "#002109",
                        "secondary-fixed": "#dce1ff"
                    },
                    fontFamily: {
                        "headline": ["Inter"],
                        "body": ["Inter"],
                        "label": ["Inter"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
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
            -webkit-font-smoothing: antialiased;
        }
        .tactical-gradient {
            background: linear-gradient(135deg, #0037b0 0%, #1D4ED8 100%);
        }
        .glass-effect {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-between p-8">
<!-- Top Spacer for alignment -->
<div class="w-full pt-12 flex flex-col items-center">
<!-- Logo Branding: Tactical Monolith Style -->
<div class="mb-12 flex flex-col items-center">
<div class="w-20 h-20 tactical-gradient rounded-xl flex items-center justify-center shadow-lg mb-6">
<span class="material-symbols-outlined text-white text-5xl" style="font-variation-settings: 'FILL' 1;">
                    description
                </span>
</div>
<h1 class="text-4xl font-black tracking-tighter text-primary">DocuPost</h1>
</div>
<!-- Hero Section -->
<div class="text-center space-y-3 mb-16">
<h2 class="text-[1.5rem] font-semibold tracking-tight text-on-surface leading-tight">Bienvenue sur DocuPost</h2>
<p class="text-lg text-on-surface-variant font-medium">Votre outil de tournée</p>
</div>
<!-- Content Canvas: Login Action -->
<div class="w-full max-w-sm space-y-6">
<!-- Tactical Monolith Action Card -->
<div class="bg-surface-container-lowest p-1 rounded-xl shadow-sm border border-outline-variant/15">
<button class="w-full h-[56px] tactical-gradient text-white rounded-lg flex items-center justify-center gap-3 font-bold tracking-wide transition-all active:scale-95 shadow-md">
<span class="material-symbols-outlined text-2xl">vpn_key</span>
<span>Se connecter via compte Docaposte</span>
</button>
</div>
<!-- Background Decorative Element (Tonal Layering) -->
<div class="mt-8 p-6 bg-surface-container rounded-xl border-l-4 border-primary">
<div class="flex gap-4 items-start">
<span class="material-symbols-outlined text-primary">info</span>
<p class="text-sm leading-relaxed text-on-surface-variant font-medium">
                        Utilisez vos identifiants professionnels pour accéder à votre itinéraire et scanner vos colis en toute sécurité.
                    </p>
</div>
</div>
</div>
</div>
<!-- Decorative Illustration (Bento-style visual anchor) -->
<div class="w-full max-w-xs h-40 overflow-hidden rounded-2xl relative mb-12">
<div class="absolute inset-0 tactical-gradient opacity-10"></div>
<img alt="delivery logistic background" class="w-full h-full object-cover grayscale opacity-30 mix-blend-overlay" data-alt="abstract close-up of high-tech logistics facility with blue lighting and industrial steel structures in a clean modern style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiNkGZUnf_kvp5hlXqEQ_JXrijn3R1AJuQ2-2gU52Nx4cue2EgdjS4Rj8uOchVVZ23RwP9b0PMcQtlwtJoSOKmhbTTLw_U4GP7mr13JcnBLgGu1WMKdjmlcVLo_VFh2lk_U6LLYuyd9wMGtKWW0hBpg0m3XzbDhFYlwbV9LXAFM8gnlAEvgsRmm_xZhkXwveHVBHn4eUy9MAQQsjH9L-dAWd8dJGwQMLv4KSNoVURAbHgjdHUfM7JwbfO5Cstdl_78WYDjSwpjq-M"/>
<div class="absolute inset-0 flex items-center justify-center">
<div class="flex gap-2">
<div class="w-2 h-8 bg-primary/20 rounded-full"></div>
<div class="w-2 h-12 bg-primary rounded-full"></div>
<div class="w-2 h-6 bg-primary/40 rounded-full"></div>
</div>
</div>
</div>
<!-- Footer: Versioning & Legal -->
<footer class="w-full flex flex-col items-center gap-4 pb-4">
<div class="w-12 h-1 bg-surface-container-highest rounded-full mb-2"></div>
<p class="text-[0.75rem] font-bold uppercase tracking-widest text-outline">
            v 2.0.0 — Docaposte
        </p>
</footer>
</body></html>

<!-- M-01: Authentification SSO -->
<!DOCTYPE html>

<html class="light" lang="fr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "surface-bright": "#f7f9fb",
              "on-surface-variant": "#434655",
              "tertiary": "#00501f",
              "error-container": "#ffdad6",
              "error": "#ba1a1a",
              "surface-variant": "#e0e3e5",
              "surface-tint": "#2151da",
              "surface-container-high": "#e6e8ea",
              "primary": "#0037b0",
              "inverse-surface": "#2d3133",
              "on-secondary": "#ffffff",
              "on-surface": "#191c1e",
              "on-error-container": "#93000a",
              "on-primary": "#ffffff",
              "on-tertiary": "#ffffff",
              "tertiary-fixed": "#7ffc97",
              "secondary-container": "#8fa7fe",
              "surface-container-lowest": "#ffffff",
              "on-secondary-fixed": "#00164e",
              "on-tertiary-fixed-variant": "#005320",
              "on-error": "#ffffff",
              "on-secondary-fixed-variant": "#264191",
              "surface-container-highest": "#e0e3e5",
              "surface-dim": "#d8dadc",
              "tertiary-container": "#006b2c",
              "background": "#f7f9fb",
              "inverse-on-surface": "#eff1f3",
              "on-primary-fixed": "#001551",
              "primary-container": "#1d4ed8",
              "surface-container": "#eceef0",
              "primary-fixed-dim": "#b7c4ff",
              "on-background": "#191c1e",
              "surface-container-low": "#f2f4f6",
              "outline-variant": "#c4c5d7",
              "outline": "#747686",
              "on-primary-fixed-variant": "#0039b5",
              "secondary-fixed-dim": "#b6c4ff",
              "tertiary-fixed-dim": "#62df7d",
              "on-primary-container": "#cad3ff",
              "primary-fixed": "#dce1ff",
              "inverse-primary": "#b7c4ff",
              "on-tertiary-container": "#71ee8a",
              "secondary": "#4059aa",
              "on-secondary-container": "#1d3989",
              "surface": "#f7f9fb",
              "on-tertiary-fixed": "#002109",
              "secondary-fixed": "#dce1ff"
            },
            fontFamily: {
              "headline": ["Inter"],
              "body": ["Inter"],
              "label": ["Inter"]
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
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
        -webkit-tap-highlight-color: transparent;
      }
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface text-on-surface min-h-screen pb-32">
<!-- TopAppBar (Mapped from Shared Components) -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-blue-700 dark:bg-blue-900 text-white shadow-none">
<div class="flex items-center gap-4">
<button class="w-12 h-12 flex items-center justify-center hover:bg-blue-800 transition-colors scale-95 active:opacity-80 rounded-full">
<span class="material-symbols-outlined" data-icon="menu">menu</span>
</button>
<h1 class="font-['Inter'] font-semibold tracking-tight text-xl">Tournée du 25/03/2026</h1>
</div>
<button class="w-12 h-12 flex items-center justify-center hover:bg-blue-800 transition-colors scale-95 active:opacity-80 rounded-full">
<span class="material-symbols-outlined" data-icon="help">help</span>
</button>
</header>
<main class="pt-20 px-4 space-y-6">
<!-- Progression Monolith -->
<section class="bg-surface-container-lowest rounded-xl p-5 shadow-sm space-y-4">
<div class="flex justify-between items-start">
<div class="space-y-1">
<p class="text-on-surface-variant text-sm font-bold uppercase tracking-wider">Progression</p>
<h2 class="text-3xl font-black text-primary tracking-tighter">Reste à livrer : 42 / 120</h2>
</div>
<div class="flex items-center gap-2 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-bold animate-pulse">
<span class="w-2 h-2 bg-on-tertiary-fixed rounded-full"></span>
                    LIVE
                </div>
</div>
<div class="w-full bg-surface-container-high h-4 rounded-full overflow-hidden">
<div class="bg-gradient-to-r from-primary to-primary-container h-full rounded-full" style="width: 35%"></div>
</div>
<div class="flex justify-between items-center pt-2">
<div class="flex items-center gap-2 text-on-surface-variant">
<span class="material-symbols-outlined text-lg" data-icon="schedule">schedule</span>
<span class="font-medium">Fin estimée : <span class="text-on-surface font-bold">17h30</span></span>
</div>
<span class="text-primary font-bold">35%</span>
</div>
</section>
<!-- Zone Tabs (Horizontal scroll) -->
<nav class="flex overflow-x-auto no-scrollbar gap-3 pb-2 -mx-4 px-4">
<button class="flex-shrink-0 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md transition-transform active:scale-95">
                Tous (42)
            </button>
<button class="flex-shrink-0 px-6 py-3 rounded-xl bg-surface-container text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-colors active:scale-95">
                Zone A (12)
            </button>
<button class="flex-shrink-0 px-6 py-3 rounded-xl bg-surface-container text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-colors active:scale-95">
                Zone B (18)
            </button>
<button class="flex-shrink-0 px-6 py-3 rounded-xl bg-surface-container text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-colors active:scale-95">
                Zone C (12)
            </button>
</nav>
<!-- List of Cards -->
<div class="space-y-4 pb-8">
<!-- Card 1: Urgent -->
<article class="relative bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-3 group transition-all active:bg-surface-container">
<div class="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"></div>
<div class="flex justify-between items-center">
<span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase">A LIVRER</span>
<div class="flex items-center gap-1 bg-error-container text-on-error-container px-3 py-1 rounded-lg text-xs font-bold">
<span class="material-symbols-outlined text-sm" data-icon="flag" style="font-variation-settings: 'FILL' 1;">flag</span>
                        Avant 14h
                    </div>
</div>
<div>
<h3 class="text-xl font-bold text-on-surface leading-tight">12 Avenue du General de Gaulle</h3>
<p class="text-on-surface-variant font-medium">Paris</p>
</div>
<div class="flex items-center gap-3 pt-2">
<div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
<span class="material-symbols-outlined text-on-surface-variant" data-icon="person">person</span>
</div>
<div>
<p class="font-bold text-on-surface">Marc Dupont</p>
<p class="text-sm text-on-surface-variant">Appt 4B, 3e étage</p>
</div>
</div>
</article>
<!-- Card 2: Standard -->
<article class="relative bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-3 transition-all active:bg-surface-container">
<div class="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"></div>
<div class="flex justify-between items-center">
<span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase">A LIVRER</span>
<span class="text-on-surface-variant text-xs font-bold">#49201</span>
</div>
<div>
<h3 class="text-xl font-bold text-on-surface leading-tight">45 Rue de la Liberté</h3>
<p class="text-on-surface-variant font-medium">Lyon</p>
</div>
<div class="flex items-center gap-3 pt-2">
<div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
<span class="material-symbols-outlined text-on-surface-variant" data-icon="person">person</span>
</div>
<div>
<p class="font-bold text-on-surface">Marie Lefebvre</p>
</div>
</div>
</article>
<!-- Card 3: Delivered -->
<article class="relative bg-surface-container-lowest opacity-60 rounded-xl p-5 shadow-sm flex flex-col gap-3">
<div class="absolute left-0 top-0 bottom-0 w-1 bg-tertiary-container rounded-l-xl"></div>
<div class="flex justify-between items-center">
<span class="bg-tertiary text-on-tertiary px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase">LIVRE</span>
<span class="text-on-surface-variant text-xs font-bold">Livré à 09:42</span>
</div>
<div>
<h3 class="text-xl font-bold text-on-surface leading-tight">8 Bis Boulevard Raspail</h3>
<p class="text-on-surface-variant font-medium">Paris</p>
</div>
<div class="flex items-center gap-3 pt-2">
<div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
<span class="material-symbols-outlined text-on-surface-variant" data-icon="person">person</span>
</div>
<div>
<p class="font-bold text-on-surface">Jean Martin</p>
</div>
</div>
</article>
</div>
</main>
<!-- BottomNavBar (Mapped from Shared Components) -->
<footer class="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 gap-4 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-t-xl shadow-[0_-4px_20px_0_rgba(0,0,0,0.06)]">
<!-- Scan Package (Active Interaction) -->
<button class="flex-1 flex flex-col items-center justify-center bg-blue-700 text-white rounded-xl h-[64px] px-6 transition-all active:scale-95 shadow-lg group">
<span class="material-symbols-outlined text-2xl mb-1" data-icon="qr_code_scanner">qr_code_scanner</span>
<span class="font-['Inter'] font-bold text-xs uppercase tracking-wider">Scan Package</span>
</button>
<!-- Finish Tour (Inactive/Disabled Logic) -->
<button class="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl h-[64px] px-6 cursor-not-allowed" disabled="" title="Tous les colis doivent être livrés">
<span class="material-symbols-outlined text-2xl mb-1" data-icon="task_alt">task_alt</span>
<span class="font-['Inter'] font-bold text-xs uppercase tracking-wider">Finish Tour</span>
</button>
</footer>
</body></html>

<!-- M-02: Liste des colis -->
<!DOCTYPE html>

<html class="light" lang="fr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "surface-bright": "#f7f9fb",
              "on-surface-variant": "#434655",
              "tertiary": "#00501f",
              "error-container": "#ffdad6",
              "error": "#ba1a1a",
              "surface-variant": "#e0e3e5",
              "surface-tint": "#2151da",
              "surface-container-high": "#e6e8ea",
              "primary": "#0037b0",
              "inverse-surface": "#2d3133",
              "on-secondary": "#ffffff",
              "on-surface": "#191c1e",
              "on-error-container": "#93000a",
              "on-primary": "#ffffff",
              "on-tertiary": "#ffffff",
              "tertiary-fixed": "#7ffc97",
              "secondary-container": "#8fa7fe",
              "surface-container-lowest": "#ffffff",
              "on-secondary-fixed": "#00164e",
              "on-tertiary-fixed-variant": "#005320",
              "on-error": "#ffffff",
              "on-secondary-fixed-variant": "#264191",
              "surface-container-highest": "#e0e3e5",
              "surface-dim": "#d8dadc",
              "tertiary-container": "#006b2c",
              "background": "#f7f9fb",
              "inverse-on-surface": "#eff1f3",
              "on-primary-fixed": "#001551",
              "primary-container": "#1d4ed8",
              "surface-container": "#eceef0",
              "primary-fixed-dim": "#b7c4ff",
              "on-background": "#191c1e",
              "surface-container-low": "#f2f4f6",
              "outline-variant": "#c4c5d7",
              "outline": "#747686",
              "on-primary-fixed-variant": "#0039b5",
              "secondary-fixed-dim": "#b6c4ff",
              "tertiary-fixed-dim": "#62df7d",
              "on-primary-container": "#cad3ff",
              "primary-fixed": "#dce1ff",
              "inverse-primary": "#b7c4ff",
              "on-tertiary-container": "#71ee8a",
              "secondary": "#4059aa",
              "on-secondary-container": "#1d3989",
              "surface": "#f7f9fb",
              "on-tertiary-fixed": "#002109",
              "secondary-fixed": "#dce1ff"
            },
            fontFamily: {
              "headline": ["Inter"],
              "body": ["Inter"],
              "label": ["Inter"]
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .tactical-shadow { box-shadow: 0 4px 24px -2px rgba(0, 0, 0, 0.08); }
        .signature-grid { background-image: radial-gradient(circle, #c4c5d7 1px, transparent 1px); background-size: 20px 20px; }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface text-on-surface min-h-screen flex flex-col">
<!-- TopAppBar -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-primary-container shadow-none">
<div class="flex items-center gap-4">
<button class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors active:scale-95">
<span class="material-symbols-outlined text-white">arrow_back</span>
</button>
<h1 class="text-white font-['Inter'] font-semibold tracking-tight text-xl">Preuve de livraison</h1>
</div>
<button class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors active:scale-95">
<span class="material-symbols-outlined text-white">help</span>
</button>
</header>
<!-- Main Content Canvas -->
<main class="flex-grow pt-20 pb-24 px-4 max-w-lg mx-auto w-full">
<!-- Context Banner: Tactical Monolith Style -->
<section class="bg-surface-container-lowest rounded-xl p-5 mb-8 tactical-shadow flex items-center gap-4 border-l-4 border-primary">
<div class="bg-primary-container/10 p-3 rounded-lg">
<span class="material-symbols-outlined text-primary text-3xl">package_2</span>
</div>
<div>
<p class="text-on-surface-variant font-bold text-xs uppercase tracking-widest mb-0.5">COLIS EN COURS</p>
<h2 class="text-on-surface font-extrabold text-xl tracking-tight">Colis #00247 - Marc Dupont</h2>
</div>
</section>
<!-- Proof Type Selector: 2x2 Bento Grid -->
<section class="mb-10">
<h3 class="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-4 px-1">Méthode de validation</h3>
<div class="grid grid-cols-2 gap-4">
<!-- Signature - Selected State -->
<div class="relative bg-surface-container-lowest p-5 rounded-xl border-2 border-primary ring-4 ring-primary/5 flex flex-col items-center justify-center text-center gap-3 active:scale-[0.98] transition-transform">
<span class="material-symbols-outlined text-primary text-3xl">draw</span>
<span class="font-bold text-sm tracking-tight text-primary">Signature</span>
<div class="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5">
<span class="material-symbols-outlined text-xs" style="font-variation-settings: 'wght' 700">check</span>
</div>
</div>
<!-- Photo -->
<div class="bg-surface-container p-5 rounded-xl flex flex-col items-center justify-center text-center gap-3 grayscale hover:grayscale-0 transition-all cursor-pointer">
<span class="material-symbols-outlined text-on-surface-variant text-3xl">photo_camera</span>
<span class="font-semibold text-sm tracking-tight text-on-surface-variant">Photo du colis</span>
</div>
<!-- Third Party -->
<div class="bg-surface-container p-5 rounded-xl flex flex-col items-center justify-center text-center gap-3 grayscale hover:grayscale-0 transition-all cursor-pointer">
<span class="material-symbols-outlined text-on-surface-variant text-3xl">group</span>
<span class="font-semibold text-sm tracking-tight text-on-surface-variant text-wrap">Remise à un tiers</span>
</div>
<!-- Secure Deposit -->
<div class="bg-surface-container p-5 rounded-xl flex flex-col items-center justify-center text-center gap-3 grayscale hover:grayscale-0 transition-all cursor-pointer">
<span class="material-symbols-outlined text-on-surface-variant text-3xl">door_front</span>
<span class="font-semibold text-sm tracking-tight text-on-surface-variant">Dépôt sécurisé</span>
</div>
</div>
</section>
<!-- Dynamic Area: Signature Pad -->
<section class="mb-10">
<div class="flex justify-between items-end mb-4 px-1">
<h3 class="font-bold text-sm uppercase tracking-wider text-on-surface-variant">Signature client</h3>
<button class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-bold text-xs uppercase tracking-tight hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined text-sm">backspace</span>
                    Effacer la signature
                </button>
</div>
<div class="relative h-60 w-full bg-white rounded-xl border-2 border-dashed border-outline-variant signature-grid flex flex-col items-center justify-end pb-8 overflow-hidden tactical-shadow">
<!-- Visual Anchor: Baseline -->
<div class="w-4/5 border-b-2 border-outline-variant border-dotted mb-4"></div>
<p class="text-on-surface-variant/40 font-medium text-sm pointer-events-none select-none">Signez à l'intérieur du cadre</p>
<!-- Mock Signature Path -->
<svg class="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewbox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
<path class="text-primary" d="M50 120 Q 80 80, 110 120 T 170 120 T 230 120 T 350 110" fill="transparent" stroke="currentColor" stroke-width="4"></path>
</svg>
</div>
</section>
<!-- Metadata Footer -->
<footer class="flex items-start gap-3 px-2 py-4 bg-surface-container-low rounded-lg mb-8">
<span class="material-symbols-outlined text-primary text-xl" style="font-variation-settings: 'FILL' 1">location_on</span>
<p class="text-on-surface-variant font-medium text-sm leading-relaxed">
                Géolocalisation et horodatage enregistrés automatiquement.
            </p>
</footer>
</main>
<!-- Fixed Bottom Action Bar -->
<div class="fixed bottom-0 w-full z-50 bg-white/85 backdrop-blur-xl px-4 pb-8 pt-4 flex flex-col gap-4 shadow-[0_-4px_20px_0_rgba(0,0,0,0.06)]">
<!-- Progress Indicator -->
<div class="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
<div class="bg-primary w-[75%] h-full"></div>
</div>
<!-- Primary Action Button: CONFIRMER LA LIVRAISON -->
<!-- Note: Shown as enabled/active for the design's sake, but styled high-vis -->
<button class="w-full h-16 bg-gradient-to-br from-tertiary-container to-tertiary text-white rounded-xl flex items-center justify-center gap-3 tactical-shadow hover:brightness-110 active:scale-95 transition-all">
<span class="font-['Inter'] font-black text-lg uppercase tracking-widest">CONFIRMER LA LIVRAISON</span>
<span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'wght' 700">check_circle</span>
</button>
</div>
</body></html>

<!-- M-04: Capture de preuve -->
<!DOCTYPE html>

<html class="light" lang="fr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "surface-bright": "#f7f9fb",
              "on-surface-variant": "#434655",
              "tertiary": "#00501f",
              "error-container": "#ffdad6",
              "error": "#ba1a1a",
              "surface-variant": "#e0e3e5",
              "surface-tint": "#2151da",
              "surface-container-high": "#e6e8ea",
              "primary": "#0037b0",
              "inverse-surface": "#2d3133",
              "on-secondary": "#ffffff",
              "on-surface": "#191c1e",
              "on-error-container": "#93000a",
              "on-primary": "#ffffff",
              "on-tertiary": "#ffffff",
              "tertiary-fixed": "#7ffc97",
              "secondary-container": "#8fa7fe",
              "surface-container-lowest": "#ffffff",
              "on-secondary-fixed": "#00164e",
              "on-tertiary-fixed-variant": "#005320",
              "on-error": "#ffffff",
              "on-secondary-fixed-variant": "#264191",
              "surface-container-highest": "#e0e3e5",
              "surface-dim": "#d8dadc",
              "tertiary-container": "#006b2c",
              "background": "#f7f9fb",
              "inverse-on-surface": "#eff1f3",
              "on-primary-fixed": "#001551",
              "primary-container": "#1d4ed8",
              "surface-container": "#eceef0",
              "primary-fixed-dim": "#b7c4ff",
              "on-background": "#191c1e",
              "surface-container-low": "#f2f4f6",
              "outline-variant": "#c4c5d7",
              "outline": "#747686",
              "on-primary-fixed-variant": "#0039b5",
              "secondary-fixed-dim": "#b6c4ff",
              "tertiary-fixed-dim": "#62df7d",
              "on-primary-container": "#cad3ff",
              "primary-fixed": "#dce1ff",
              "inverse-primary": "#b7c4ff",
              "on-tertiary-container": "#71ee8a",
              "secondary": "#4059aa",
              "on-secondary-container": "#1d3989",
              "surface": "#f7f9fb",
              "on-tertiary-fixed": "#002109",
              "secondary-fixed": "#dce1ff"
            },
            fontFamily: {
              "headline": ["Inter"],
              "body": ["Inter"],
              "label": ["Inter"]
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      body { font-family: 'Inter', sans-serif; }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface text-on-surface min-h-screen pb-40">
<!-- Top Navigation Bar (Shared Component Strategy) -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-blue-700 dark:bg-blue-900 text-white shadow-none">
<div class="flex items-center gap-4">
<button class="hover:bg-blue-800 transition-colors p-2 rounded-full active:opacity-80 scale-95">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<h1 class="font-['Inter'] font-semibold tracking-tight text-xl">Colis #00247</h1>
</div>
<div class="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-lg font-bold text-xs tracking-wider uppercase">
            A LIVRER
        </div>
</header>
<main class="pt-20 px-4 space-y-6">
<!-- Progress Monolith -->
<div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mb-8">
<div class="h-full bg-primary-container w-2/3"></div>
</div>
<!-- Section DESTINATAIRE: Tactical Monolith Card -->
<section class="space-y-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">person</span>
<h2 class="text-on-surface-variant font-bold text-sm uppercase tracking-widest">DESTINATAIRE</h2>
</div>
<div class="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-primary">
<div class="mb-6">
<p class="text-2xl font-black text-on-surface tracking-tight mb-1">Marc Dupont</p>
<p class="text-lg text-on-surface font-medium leading-tight">12 Avenue du General de Gaulle</p>
<p class="text-lg text-on-surface font-medium mb-2">75008 Paris</p>
<div class="inline-flex bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface-variant font-semibold text-sm">
                        Appt 4B, 3e étage
                    </div>
</div>
<!-- Action Buttons Grid -->
<div class="grid grid-cols-2 gap-4">
<button class="flex items-center justify-center gap-2 bg-surface-container-highest text-on-surface h-14 rounded-xl font-bold hover:bg-surface-container-high transition-colors active:scale-95">
<span class="material-symbols-outlined">map</span>
                        Ouvrir la carte
                    </button>
<button class="flex items-center justify-center gap-2 bg-surface-container-highest text-on-surface h-14 rounded-xl font-bold hover:bg-surface-container-high transition-colors active:scale-95">
<span class="material-symbols-outlined">call</span>
                        Appeler
                    </button>
</div>
</div>
</section>
<!-- Section CONTRAINTES -->
<section class="space-y-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">priority_high</span>
<h2 class="text-on-surface-variant font-bold text-sm uppercase tracking-widest">CONTRAINTES</h2>
</div>
<div class="flex flex-wrap gap-3">
<div class="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-full font-bold text-base">
<span class="material-symbols-outlined text-xl">schedule</span>
                    Avant 14h
                </div>
<div class="flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-full font-bold text-base border-2 border-outline-variant/20">
<span class="material-symbols-outlined text-xl">warning</span>
                    Fragile
                </div>
</div>
</section>
<!-- Package Context Visualization -->
<div class="w-full h-48 rounded-2xl overflow-hidden relative shadow-inner bg-surface-container-low">
<img class="w-full h-full object-cover grayscale opacity-80" data-alt="Modern apartment building facade in Paris with limestone walls and classic balconies under clear bright daylight" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-ymN-4a2OSKzwU88jaEn_m66aatJ1RBjiMlb-GKPspy45LW066Jd-f-Js2TzWgWyMnq-JolIxcPlca1PLnEXzOAiVTq7HBRIP_gfyv2SnRTT2ItuN9YFwCUgl5vknhPO5mI8w3CNSJ6KMJ8EozJw0YyFXPY3kIa7AKPMZw4PS3bpr2kP3UkNI1CXKtv249k3ApPBN5DoOM2rlZoSLEnuCkVnnX--RIVAbeeC1bjvzUUJuJZtZ2v2l0LZLlHcCdJre2vfYNqVj-BE"/>
<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
<div class="flex items-center gap-2 text-white">
<span class="material-symbols-outlined">location_on</span>
<span class="font-bold text-sm">Zone de livraison : 8ème Arrondissement</span>
</div>
</div>
</div>
<!-- Section HISTORIQUE -->
<section class="space-y-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">history</span>
<h2 class="text-on-surface-variant font-bold text-sm uppercase tracking-widest">HISTORIQUE</h2>
</div>
<div class="bg-surface-container-low rounded-xl p-4">
<div class="flex items-start gap-4">
<div class="bg-error/10 p-2 rounded-lg">
<span class="material-symbols-outlined text-error">block</span>
</div>
<div class="flex-1">
<p class="font-black text-on-surface">24/03 - Tentative 1: Absent</p>
<p class="text-on-surface-variant text-sm mt-1">Livreur : J. Martin - 15:42</p>
</div>
</div>
</div>
</section>
</main>
<!-- Actions (Bottom Fixed) -->
<footer class="fixed bottom-0 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl z-50 p-4 space-y-3 shadow-[0_-4px_20px_0_rgba(0,0,0,0.06)] rounded-t-2xl">
<button class="w-full h-[56px] bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-black text-lg flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all">
            LIVRER CE COLIS
            <span class="material-symbols-outlined">arrow_forward</span>
</button>
<button class="w-full h-[56px] bg-white border-2 border-error text-error rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
<span class="material-symbols-outlined">report</span>
            DECLARER UN ECHEC
        </button>
</footer>
<!-- Bottom Nav Spacing -->
<div class="h-4 pb-safe"></div>
</body></html>

<!-- M-03: Détail d'un colis -->
<!DOCTYPE html>

<html class="light" lang="fr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "surface-bright": "#f7f9fb",
              "on-surface-variant": "#434655",
              "tertiary": "#00501f",
              "error-container": "#ffdad6",
              "error": "#ba1a1a",
              "surface-variant": "#e0e3e5",
              "surface-tint": "#2151da",
              "surface-container-high": "#e6e8ea",
              "primary": "#0037b0",
              "inverse-surface": "#2d3133",
              "on-secondary": "#ffffff",
              "on-surface": "#191c1e",
              "on-error-container": "#93000a",
              "on-primary": "#ffffff",
              "on-tertiary": "#ffffff",
              "tertiary-fixed": "#7ffc97",
              "secondary-container": "#8fa7fe",
              "surface-container-lowest": "#ffffff",
              "on-secondary-fixed": "#00164e",
              "on-tertiary-fixed-variant": "#005320",
              "on-error": "#ffffff",
              "on-secondary-fixed-variant": "#264191",
              "surface-container-highest": "#e0e3e5",
              "surface-dim": "#d8dadc",
              "tertiary-container": "#006b2c",
              "background": "#f7f9fb",
              "inverse-on-surface": "#eff1f3",
              "on-primary-fixed": "#001551",
              "primary-container": "#1d4ed8",
              "surface-container": "#eceef0",
              "primary-fixed-dim": "#b7c4ff",
              "on-background": "#191c1e",
              "surface-container-low": "#f2f4f6",
              "outline-variant": "#c4c5d7",
              "outline": "#747686",
              "on-primary-fixed-variant": "#0039b5",
              "secondary-fixed-dim": "#b6c4ff",
              "tertiary-fixed-dim": "#62df7d",
              "on-primary-container": "#cad3ff",
              "primary-fixed": "#dce1ff",
              "inverse-primary": "#b7c4ff",
              "on-tertiary-container": "#71ee8a",
              "secondary": "#4059aa",
              "on-secondary-container": "#1d3989",
              "surface": "#f7f9fb",
              "on-tertiary-fixed": "#002109",
              "secondary-fixed": "#dce1ff"
            },
            fontFamily: {
              "headline": ["Inter"],
              "body": ["Inter"],
              "label": ["Inter"]
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            line-height: 1;
            text-transform: none;
            letter-spacing: normal;
            word-wrap: normal;
            white-space: nowrap;
            direction: ltr;
        }
        body { font-family: 'Inter', sans-serif; }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface text-on-surface min-h-screen pb-32">
<!-- TopAppBar (Customized for Error State) -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-error text-on-error shadow-none">
<div class="flex items-center gap-4">
<button class="flex items-center justify-center w-10 h-10 active:opacity-80 transition-opacity">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<h1 class="font-headline font-semibold tracking-tight text-xl">Echec de livraison</h1>
</div>
<button class="flex items-center justify-center w-10 h-10 active:opacity-80 transition-opacity">
<span class="material-symbols-outlined">help</span>
</button>
</header>
<main class="pt-20 px-4 space-y-6 max-w-lg mx-auto">
<!-- Context Banner -->
<section class="bg-error-container text-on-error-container p-6 rounded-xl flex items-center gap-4 border-l-4 border-error">
<span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">package_2</span>
<div>
<p class="font-label text-xs uppercase tracking-wider opacity-80">Identité Colis</p>
<h2 class="font-headline font-bold text-lg">Colis #00247 - Marc Dupont</h2>
</div>
</section>
<!-- Section MOTIF -->
<section class="space-y-4">
<div class="flex items-center justify-between">
<h3 class="font-headline font-semibold text-lg flex items-center gap-2">
<span class="material-symbols-outlined text-primary">report</span>
                    MOTIF DE L'ECHEC
                </h3>
</div>
<div class="space-y-3">
<!-- Radio Absent (Selected) -->
<label class="flex items-center justify-between p-5 bg-surface-container-lowest rounded-xl border-2 border-primary ring-2 ring-primary/10 transition-all cursor-pointer">
<div class="flex items-center gap-4">
<span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">person_off</span>
<span class="font-body font-bold text-lg">Absent</span>
</div>
<div class="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
<div class="w-3 h-3 bg-primary rounded-full"></div>
</div>
<input checked="" class="hidden" name="motif" type="radio" value="absent"/>
</label>
<!-- Radio Accès impossible -->
<label class="flex items-center justify-between p-5 bg-surface-container-low rounded-xl active:bg-surface-container-high transition-all cursor-pointer">
<div class="flex items-center gap-4 text-on-surface-variant">
<span class="material-symbols-outlined">lock</span>
<span class="font-body font-medium text-lg">Accès impossible</span>
</div>
<div class="w-6 h-6 rounded-full border-2 border-outline-variant"></div>
<input class="hidden" name="motif" type="radio" value="acces"/>
</label>
<!-- Radio Refus du client -->
<label class="flex items-center justify-between p-5 bg-surface-container-low rounded-xl active:bg-surface-container-high transition-all cursor-pointer">
<div class="flex items-center gap-4 text-on-surface-variant">
<span class="material-symbols-outlined">block</span>
<span class="font-body font-medium text-lg">Refus du client</span>
</div>
<div class="w-6 h-6 rounded-full border-2 border-outline-variant"></div>
<input class="hidden" name="motif" type="radio" value="refus"/>
</label>
<!-- Radio Horaires dépassés -->
<label class="flex items-center justify-between p-5 bg-surface-container-low rounded-xl active:bg-surface-container-high transition-all cursor-pointer">
<div class="flex items-center gap-4 text-on-surface-variant">
<span class="material-symbols-outlined">schedule</span>
<span class="font-body font-medium text-lg">Horaires dépassés</span>
</div>
<div class="w-6 h-6 rounded-full border-2 border-outline-variant"></div>
<input class="hidden" name="motif" type="radio" value="horaires"/>
</label>
</div>
</section>
<!-- Section DISPOSITION -->
<section class="space-y-4 pt-4">
<h3 class="font-headline font-semibold text-lg flex items-center gap-2">
<span class="material-symbols-outlined text-primary">swap_horiz</span>
                DISPOSITION
            </h3>
<div class="grid grid-cols-1 gap-3">
<!-- A représenter -->
<label class="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl cursor-pointer">
<input class="w-5 h-5 text-primary border-outline focus:ring-primary" name="dispo" type="radio" value="repres"/>
<span class="font-body font-medium text-lg">A représenter</span>
</label>
<!-- Dépôt chez tiers -->
<label class="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl cursor-pointer">
<input class="w-5 h-5 text-primary border-outline focus:ring-primary" name="dispo" type="radio" value="tiers"/>
<span class="font-body font-medium text-lg">Dépôt chez tiers</span>
</label>
<!-- Retour au dépôt -->
<label class="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl cursor-pointer">
<input class="w-5 h-5 text-primary border-outline focus:ring-primary" name="dispo" type="radio" value="retour"/>
<span class="font-body font-medium text-lg">Retour au dépôt</span>
</label>
</div>
</section>
<!-- Section NOTE -->
<section class="space-y-4 pt-4">
<div class="flex justify-between items-center">
<h3 class="font-headline font-semibold text-lg flex items-center gap-2">
<span class="material-symbols-outlined text-primary">edit_note</span>
                    NOTE
                </h3>
<span class="font-label text-xs font-bold text-outline">0 / 250</span>
</div>
<div class="relative">
<textarea class="w-full bg-surface-container-low border-none rounded-xl p-4 font-body text-lg focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/40" placeholder="Précisez les circonstances de l'échec..." rows="4"></textarea>
<div class="absolute bottom-0 left-0 w-full h-1 bg-primary/20 rounded-b-xl overflow-hidden">
<div class="h-full bg-primary w-0"></div>
</div>
</div>
</section>
</main>
<!-- Bottom Action Bar (Sticky) -->
<div class="fixed bottom-0 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl px-6 pb-8 pt-4 shadow-[0_-4px_20px_0_rgba(0,0,0,0.06)] flex flex-col gap-4">
<button class="w-full h-14 rounded-xl border-2 border-error text-error font-headline font-black tracking-tighter text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform">
<span class="material-symbols-outlined">save</span>
            ENREGISTRER L'ECHEC
        </button>
</div>
</body></html>

<!-- M-05: Déclaration d'échec -->
<!DOCTYPE html>

<html class="light" lang="fr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "surface-bright": "#f7f9fb",
              "on-surface-variant": "#434655",
              "tertiary": "#00501f",
              "error-container": "#ffdad6",
              "error": "#ba1a1a",
              "surface-variant": "#e0e3e5",
              "surface-tint": "#2151da",
              "surface-container-high": "#e6e8ea",
              "primary": "#0037b0",
              "inverse-surface": "#2d3133",
              "on-secondary": "#ffffff",
              "on-surface": "#191c1e",
              "on-error-container": "#93000a",
              "on-primary": "#ffffff",
              "on-tertiary": "#ffffff",
              "tertiary-fixed": "#7ffc97",
              "secondary-container": "#8fa7fe",
              "surface-container-lowest": "#ffffff",
              "on-secondary-fixed": "#00164e",
              "on-tertiary-fixed-variant": "#005320",
              "on-error": "#ffffff",
              "on-secondary-fixed-variant": "#264191",
              "surface-container-highest": "#e0e3e5",
              "surface-dim": "#d8dadc",
              "tertiary-container": "#006b2c",
              "background": "#f7f9fb",
              "inverse-on-surface": "#eff1f3",
              "on-primary-fixed": "#001551",
              "primary-container": "#1d4ed8",
              "surface-container": "#eceef0",
              "primary-fixed-dim": "#b7c4ff",
              "on-background": "#191c1e",
              "surface-container-low": "#f2f4f6",
              "outline-variant": "#c4c5d7",
              "outline": "#747686",
              "on-primary-fixed-variant": "#0039b5",
              "secondary-fixed-dim": "#b6c4ff",
              "tertiary-fixed-dim": "#62df7d",
              "on-primary-container": "#cad3ff",
              "primary-fixed": "#dce1ff",
              "inverse-primary": "#b7c4ff",
              "on-tertiary-container": "#71ee8a",
              "secondary": "#4059aa",
              "on-secondary-container": "#1d3989",
              "surface": "#f7f9fb",
              "on-tertiary-fixed": "#002109",
              "secondary-fixed": "#dce1ff"
            },
            fontFamily: {
              "headline": ["Inter"],
              "body": ["Inter"],
              "label": ["Inter"]
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      .font-black { font-weight: 900; }
      .tracking-tighter { letter-spacing: -0.05em; }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background font-body min-h-screen relative overflow-hidden">
<!-- Background: M-02 Package List (Blurred) -->
<div class="fixed inset-0 z-0 flex flex-col pointer-events-none grayscale opacity-40">
<!-- TopAppBar Placeholder -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-blue-700">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-white">menu</span>
<h1 class="text-white font-['Inter'] font-semibold tracking-tight text-xl">DocuPost</h1>
</div>
<span class="material-symbols-outlined text-white">help</span>
</header>
<!-- List Content Simulation -->
<main class="mt-20 px-6 space-y-6">
<div class="h-24 bg-surface-container-highest rounded-xl border-l-4 border-primary"></div>
<div class="h-24 bg-surface-container-highest rounded-xl border-l-4 border-primary"></div>
<div class="h-24 bg-surface-container-highest rounded-xl border-l-4 border-primary"></div>
<div class="h-24 bg-surface-container-highest rounded-xl border-l-4 border-primary"></div>
</main>
</div>
<!-- M-06 OVERLAY: Notification d'instruction -->
<div class="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-on-surface/40 backdrop-blur-sm">
<!-- The Tactical Monolith Overlay Card -->
<div class="w-full max-w-md bg-on-primary-fixed-variant rounded-xl overflow-hidden shadow-2xl flex flex-col relative border border-white/10">
<!-- Header Section -->
<div class="p-6 pb-4 flex items-center gap-4">
<div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
<span class="material-symbols-outlined text-tertiary-fixed text-3xl" data-weight="fill" style="font-variation-settings: 'FILL' 1;">supervisor_account</span>
</div>
<div>
<span class="text-tertiary-fixed text-[10px] font-black uppercase tracking-[0.2em]">Priorité Haute</span>
<h2 class="text-white font-headline font-extrabold text-xl tracking-tight leading-tight">INSTRUCTION SUPERVISEUR</h2>
</div>
</div>
<!-- Body Section -->
<div class="px-6 py-8 bg-primary/20 backdrop-brightness-125">
<div class="space-y-4">
<div class="space-y-1">
<p class="text-primary-fixed text-sm font-label uppercase tracking-wider">Action Requise</p>
<p class="text-white text-2xl font-black leading-tight">Prioriser le colis #00312</p>
</div>
<div class="flex items-start gap-3 pt-4 border-t border-white/5">
<span class="material-symbols-outlined text-blue-200 mt-1">location_on</span>
<div>
<p class="text-white font-semibold text-lg">45 Rue de la Liberté</p>
<p class="text-blue-100/70 text-base">Lyon, 69002</p>
</div>
</div>
</div>
</div>
<!-- Action Buttons -->
<div class="p-6 flex flex-col gap-3">
<!-- Primary Action -->
<button class="w-full h-16 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-between px-6 active:scale-[0.98] transition-transform">
<span class="text-white font-black text-lg tracking-wide">VOIR L'ITINÉRAIRE</span>
<span class="material-symbols-outlined text-white text-2xl">arrow_forward</span>
</button>
<!-- Secondary Action -->
<button class="w-full h-16 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center px-6 active:scale-[0.98] transition-transform">
<span class="text-white font-bold text-lg">OK</span>
<span class="material-symbols-outlined text-white ml-2 text-xl" style="font-variation-settings: 'wght' 700;">check</span>
</button>
</div>
<!-- Countdown Progress Bar -->
<div class="h-1.5 w-full bg-white/10 overflow-hidden">
<div class="h-full bg-tertiary-fixed-dim w-3/4"></div>
</div>
</div>
</div>
<!-- App Shell - Suppressed on Task Focused Overlay (As per Mandate) -->
<!-- Navigation hidden to prioritize the critical instruction focus -->
</body></html>