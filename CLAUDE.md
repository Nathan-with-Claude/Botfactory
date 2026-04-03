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
├── 00-contexte/              # documents d’entreprise + journaux agents
│   ├── infrastructure-locale.md  # ← SOURCE DE VÉRITÉ : ports, URLs, protocoles de démarrage
│   └── journaux/
│       ├── journal-sponsor.md
│       ├── journal-ux.md
│       ├── journal-architecte-metier.md
│       ├── journal-architecte-technique.md
│       ├── journal-po.md
│       ├── journal-developpeur.md
│       ├── journal-qa.md
│       ├── journal-devops.md
│       └── journal-end-user.md
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
- Les agents ne modifient pas les livrables des étapes précédentes, si besoin, il peut appeler l'agent concerné pour apporter son avis et une modification
- Format des User Stories : `livrables/05-backlog/user-stories/US-[NNN]-[slug].md`.
- Chaque US du MVP doit être liée à une issue GitHub (si MCP GitHub disponible).
- **Ports et protocoles de démarrage** : toujours lire `/livrables/00-contexte/infrastructure-locale.md`.
  Ne jamais dupliquer ces informations dans un fichier d’agent ou de livrable.
  Quand un port change, mettre à jour ce fichier uniquement.

## Prérequis Skills et MCP (recommandés)

### Skills recommandés (à installer dans `.claude/skills/`)

- obra/writing-plans
- obra/test-driven-development
- obra/systematic-debugging
- obra/subagent-driven-development
- obra/finishing-a-development-branch
- obra/requesting-code-review
- agile-v-product-owner

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

## Gestion des nouveaux besoins métier (en cours de cadrage)

Quand un nouveau besoin métier apparaît (ex. rôle oublié, nouveau parcours clé) :

1. L’ajouter dans /livrables/00-entretiens/synthese-entretiens.md avec la date.
2. Si impact business majeur → demander à @sponsor de mettre à jour vision + périmètre MVP.
3. Demander à @ux de mettre à jour personas, user journeys, wireframes concernés.
4. Demander à @architecte-metier de mettre à jour domain-model, capability-map,
   modules-fonctionnels.
5. Demander à @architecte-technique de mettre à jour architecture-applicative,
   schemas-integration, design-decisions, exigences-non-fonctionnelles.
6. Demander à @po de créer / ajuster les Epics, Features et User Stories
   correspondantes dans 05-backlog/.

Ne jamais modifier directement le code ou le backlog sans passer par cette mini-chaîne.

## Journaux de bord des agents

Chaque agent dispose d’un fichier de journal dans `/livrables/00-contexte/journaux/` :

| Agent | Journal |
|-------|---------|
| @sponsor | `journal-sponsor.md` |
| @ux | `journal-ux.md` |
| @architecte-metier | `journal-architecte-metier.md` |
| @architecte-technique | `journal-architecte-technique.md` |
| @po | `journal-po.md` |
| @developpeur | `journal-developpeur.md` |
| @qa | `journal-qa.md` |
| @devops | `journal-devops.md` |
| @end-user | `journal-end-user.md` |

### Règle obligatoire — protocole de session

**EN DÉBUT de session** :
1. Lire son journal de bord (`/livrables/00-contexte/journaux/journal-[agent].md`).
2. Ne PAS relire l’intégralité des livrables déjà synthétisés dans le journal — sauf si la tâche demandée le justifie explicitement.

**EN FIN de session** :
1. Mettre à jour son journal :
   - Section **"Interventions réalisées"** : ajouter la ligne de l’intervention (date, version, sujet, fichiers)
   - Section **"Décisions structurantes"** : ajouter toute décision non triviale prise pendant la session
   - Section **"Suivi des travaux"** (si applicable) : mettre à jour les statuts (@developpeur, @qa)
   - Section **"Points d’attention"** : mettre à jour si de nouveaux risques ou dépendances ont été identifiés
2. Ajouter une entrée dans `/livrables/CHANGELOG-actions-agents.md`.

### Archivage automatique des journaux

**Seuil** : 150 lignes. En fin de session, avant de mettre à jour le journal, vérifier le nombre de lignes :

```bash
wc -l /livrables/00-contexte/journaux/journal-[agent].md
```

Si le fichier dépasse 150 lignes, déclencher l'archivage :

1. **Créer ou compléter** `/livrables/00-contexte/journaux/archives/journal-[agent]-[YYYY-MM].md`
   (YYYY-MM = mois courant, ex. `2026-04`)
   Format attendu :
   ```markdown
   # Archive — Journal @[agent] — [YYYY-MM]
   > Archivé le [date ISO]. Source : journal-[agent].md

   ## Interventions archivées
   | Date | … |
   | --- | … |
   [lignes archivées]

   ## Décisions archivées
   | Date | … |
   | --- | … |
   [lignes archivées]
   ```

2. **Déplacer dans l'archive** :
   - `## Interventions réalisées` : toutes les lignes de tableau **sauf les 10 dernières**
   - `## Décisions techniques prises` / `## Décisions structurantes` : toutes les lignes **sauf les 10 dernières**

3. **Dans le journal principal**, remplacer les lignes déplacées par une seule ligne de référence :
   `> ← Entrées antérieures archivées dans [archives/journal-[agent]-[YYYY-MM].md]`

4. **Ne jamais archiver** : `## Contexte synthétisé`, `## Suivi des User Stories` / `## Suivi des travaux`, `## Points d'attention`.

> Le but est de garder chaque journal sous 150 lignes pour limiter la consommation de tokens en début de session.

### Format CHANGELOG

Toutes les actions importantes réalisées par les agents
doivent être journalisées dans /livrables/CHANGELOG-actions-agents.md.

Format attendu d’une entrée :

- [date ISO] [agent] [type d’action] → [fichier(s) impacté(s)]
  [résumé très court]

Exemple :
- 2026-03-19T22:15Z @ux UPDATE → /livrables/02-ux/user-journeys.md
  Ajout du parcours "Préparer les tournées du jour" pour le respo logistique.

### Règle CHANGELOG pour tous les agents

Après chaque modification de fichier dans /livrables/,
ajouter une ligne dans /livrables/CHANGELOG-actions-agents.md
en suivant le format ci-dessus.

## Poste de commande tests manuels (Product / Expert métier)

Pour chaque User Story livrée :

1. Le développeur indique dans US-[NNN]-impl.md :
   - les commandes pour lancer l'app en local
   - les URLs à utiliser pour tester
2. @qa génère une check-list de tests manuels simple dans
   /livrables/06-dev/poste-de-commande-tests.md (section pour la US).
3. @qa effectue l'ensemble des tests avec Playwright en suivant les consignes de test et si jamais il y a des erreurs, demande à @dev de corriger
4. Le feedback structuré (bloquants / améliorations) est ensuite
   transformé en feedback end-user via @end-user et en nouvelles US via @po.