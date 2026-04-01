# DocuPost AI Dev Chain — Configuration complète

## Contexte projet
DocuPost est une plateforme de gestion de tournées de livraison pour livreurs terrain et superviseurs logistiques.
Phase actuelle : définition complète et développement du MVP.
Objectif : reproduire la chaîne de valeur complète (Sponsor → Dev → Prod) avec des agents spécialisés.

## Agents disponibles

| Agent                | Fichier                           | Déclencher pour…                                   |
|----------------------|-----------------------------------|----------------------------------------------------|
| @sponsor             | .claude/agents/sponsor.md         | Vision business, KPIs, périmètre MVP               |
| @po                  | .claude/agents/po.md              | Epics, Features, User Stories, backlog SAFe        |
| @ux                  | .claude/agents/ux.md              | Personas, user journeys, wireframes textuels       |
| @architecte-metier   | .claude/agents/architecte-metier.md    | Domaines, entités, capability map           |
| @architecte-technique| .claude/agents/architecte-technique.md | Archi applicative, choix tech, intégrations |
| @developpeur         | .claude/agents/developpeur.md     | Implémentation US par US (vertical slices)         |
| @qa                  | .claude/agents/qa.md              | Plan de tests, scénarios, stratégie automatisée    |
| @devops              | .claude/agents/devops.md          | Pipeline CI/CD, environnements, déploiement        |
| @end-user            | .claude/agents/end-user.md        | Feedback terrain, validation ergonomie             |

## Chaîne de valeur (ordre séquentiel)

```text
[1] Sponsor ──→ [2] UX ──┐
                          ├──→ [4] Archi Technique ──→ [5] PO ──→ [6] Dev ──→ [7] QA ──→ [8] DevOps ──→ [9] End User
         [3] Archi Métier ┘
```

Étapes parallèles : 2 (UX) et 3 (Architecte Métier).
Boucle itérative : 6 (Dev) → 7 (QA) → 9 (End User) pour chaque User Story du MVP.

## Arborescence des livrables attendue

```text
/livrables/
├── 00-contexte/              # documents d’entreprise (optionnel)
├── 01-vision/                # Sponsor
│   ├── vision-produit.md
│   ├── kpis.md
│   └── perimetre-mvp.md
├── 02-ux/                    # UX
│   ├── personas.md
│   ├── user-journeys.md
│   └── wireframes.md
├── 03-architecture-metier/   # Architecte Métier
│   ├── domain-model.md
│   ├── capability-map.md
│   └── modules-fonctionnels.md
├── 04-architecture-technique/# Architecte Technique
│   ├── architecture-applicative.md
│   ├── schemas-integration.md
│   ├── design-decisions.md
│   └── exigences-non-fonctionnelles.md
├── 05-backlog/               # PO
│   ├── epics.md
│   ├── features.md
│   ├── definition-mvp.md
│   └── user-stories/
│       └── US-[NNN]-[slug].md
├── 06-dev/                   # Dev
│   └── vertical-slices/
│       └── US-[NNN]-impl.md
├── 07-tests/                 # QA
│   ├── plan-tests.md
│   ├── jeux-de-donnees.md
│   └── scenarios/
│       └── US-[NNN]-scenarios.md
├── 08-devops/                # DevOps
│   ├── pipeline-cicd.md
│   ├── strategie-deploiement.md
│   └── monitoring.md
├── 09-feedback/              # End User
│   └── feedback-[feature]-[date].md
└── README.md                 # récap global (optionnel)
```

## Règles absolues

- Chaque agent vérifie que ses inputs attendus sont présents avant de produire.
- Chaque livrable est autonome (compréhensible sans historique de chat).
- Le développeur et le QA ne traitent qu’une seule User Story par session.
- Les agents ne modifient pas les livrables des étapes précédentes.
- Format des User Stories : `livrables/05-backlog/user-stories/US-[NNN]-[slug].md`.
- Chaque US du MVP doit être liée à une issue GitHub (si MCP GitHub disponible).

## Prérequis Skills et MCP (recommandés)

### Skills recommandés (à installer dans `.claude/skills/`)

- obra/writing-plans
- obra/test-driven-development
- obra/systematic-debugging
- obra/subagent-driven-development
- obra/finishing-a-development-branch
- obra/requesting-code-review
- agile-v-product-owner
- ppt-visual

### MCP attendus (configurés via `claude mcp add` ou `.mcp.json`)

- filesystem : pointant sur la racine du projet DocuPost.
- github : connecté au repo DocuPost.
- playwright : pour les tests E2E (QA).

Exemple de commandes :

```bash
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /chemin/vers/docupost-ai
claude mcp add github -- npx -y @modelcontextprotocol/server-github
claude mcp add playwright -- npx -y @modelcontextprotocol/server-playwright
```

## Comportement si Skills ou MCP manquants

Si un Skill ou MCP référencé n’est pas disponible :

- Ne pas bloquer la tâche.
- Mentionner en début de réponse quelque chose comme :
  - "⚠️ Skill manquant : obra/test-driven-development (continuer sans)."
  - "⚠️ MCP manquant : playwright (tests E2E non exécutables)."
- Ajouter, si pertinent, une ligne TODO dans le livrable :
  - "TODO: installer/configurer [Skill/MCP] pour améliorer [usage]."
- Continuer en appliquant au mieux les bonnes pratiques décrites dans l’agent, en mode prompt pur.

## Règles de routing

Claude doit router automatiquement selon l’intention principale de la demande :

- Vision, KPIs, MVP → @sponsor
- Backlog, Epic, Feature, User Story → @po
- Personas, parcours, wireframes → @ux
- Domaines métier, capabilities, règles métier → @architecte-metier
- Architecture technique, stack, intégrations, NFR → @architecte-technique
- Implémentation code, tests unitaires d’une US → @developpeur
- Plan de tests, scénarios, jeux de données → @qa
- CI/CD, déploiement, environnements, monitoring → @devops
- Feedback terrain, ergonomie, usage réel → @end-user

## Hooks et garde-fous (intention)

- PreToolUse : vérifier les droits filesystem/github/playwright avant un appel MCP critique.
- SubagentStop : mettre à jour un changelog ou /livrables/README.md lorsqu’un livrable important est créé.
- ErrorEscalation : en cas de blocage (input manquant, ambiguïté majeure), demander explicitement l’arbitrage de l’utilisateur humain.

## Prompts de démarrage recommandés

### Lancer la phase Vision

@sponsor :
DocuPost est une plateforme de gestion de tournées de livraison
pour des livreurs terrain et leurs superviseurs. Les pain points actuels sont :
- [liste pain points]
Contraintes business : [budget, délais, pays, etc.].

Produis :
- vision-produit.md
- kpis.md
- perimetre-mvp.md
dans /livrables/01-vision/.

### Lancer UX & Architecte Métier après vision

@ux :
La vision produit est dans /livrables/01-vision/.
Conçois les personas, user journeys et wireframes textuels pour le périmètre MVP.

@architecte-metier :
La vision produit est dans /livrables/01-vision/.
À partir des user journeys, construis domain-model, capability-map
et modules-fonctionnels dans /livrables/03-architecture-metier/.

### Lancer l’architecture technique

@architecte-technique :
Les livrables UX sont dans /livrables/02-ux/
et l’architecture métier dans /livrables/03-architecture-metier/.
Contraintes SI DocuPost : [cloud, stack, sécurité].

Produis tous les livrables de /livrables/04-architecture-technique/.

### Lancer le backlog

@po :
La vision est dans /livrables/01-vision/,
les livrables UX dans /livrables/02-ux/,
et l’architecture métier dans /livrables/03-architecture-metier/.

Construit Epics, Features, User Stories priorisées pour le MVP,
ainsi que definition-mvp.md dans /livrables/05-backlog/.

### Implémentation d’une US (Dev + QA + End User)

@developpeur :
Implémente la User Story US-001.
Les spécifications sont dans /livrables/05-backlog/user-stories/US-001-*.md,
les wireframes dans /livrables/02-ux/wireframes.md,
l’architecture dans /livrables/04-architecture-technique/.

Applique TDD si possible et documente l’implémentation dans /livrables/06-dev/vertical-slices/US-001-impl.md.

@qa :
Teste la User Story US-001.
Inputs :
- /livrables/05-backlog/user-stories/US-001-*.md
- /livrables/06-dev/vertical-slices/US-001-impl.md
- /livrables/04-architecture-technique/exigences-non-fonctionnelles.md

Produis les scénarios et jeux de données dans /livrables/07-tests/.

@end-user :
Tu es un livreur qui teste la fonctionnalité correspondant à US-001.
Base-toi sur les écrans décrits dans /livrables/02-ux/wireframes.md
et sur ce que la fonctionnalité est censée faire.

Donne un feedback priorisé dans /livrables/09-feedback/.

## Métriques de maturité

- /livrables/01-vision/ complet → vision cadrée.
- /livrables/05-backlog/user-stories/ rempli et definition-mvp.md → backlog MVP prêt.
- premier vertical slice en prod (via Dev + QA + DevOps) → MVP en cours de vie.
- /livrables/09-feedback/ alimenté → boucle de feedback terrain active.
