# Journal de bord — @architecte-metier — DocuPost

> **RÈGLE** : Lire ce fichier EN DÉBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier remplace la relecture complète de `/livrables/03-architecture-metier/`.

---

## Contexte synthétisé

- **Livrables propriété** : `03-architecture-metier/` (domain-model.md v1.1, capability-map.md v1.1, modules-fonctionnels.md v1.1)
- **Bounded Contexts** : 7 (BC-01 à BC-07)
- **Modules fonctionnels** : 8 (M1 à M8)
- **Core Domains** : BC-01 (Orchestration de Tournée) + BC-07 (Planification de Tournée)

### Carte des Bounded Contexts

| BC | Nom | Classification | Aggregate Roots | Module |
|----|-----|----------------|-----------------|--------|
| BC-01 | Orchestration de Tournée | **Core Domain** | Tournée, Colis | M1 |
| BC-02 | Gestion des Preuves | Supporting | PreuveLivraison | M2 |
| BC-03 | Supervision | Supporting | TableauDeBord, Instruction | M3 |
| BC-04 | Notification | Supporting | — (service transit) | M4 |
| BC-05 | Intégration SI / OMS | Generic | — (adapter) | M5 |
| BC-06 | Identité et Accès | Generic | — (off-the-shelf SSO) | M6 |
| BC-07 | Planification de Tournée | **Core Domain** | PlanDuJour, Affectation | M8 |

### Context Map (relations clés)

```
TMS_Externe ──[ACL]──> BC-07
BC-07 ──[TournéeLancée / Customer-Supplier]──> BC-01
BC-01 ──[Customer-Supplier / Events]──> BC-03
BC-01 ──[Published Language]──> BC-05
BC-03 ──[Customer-Supplier]──> BC-04
BC-04 ──[Customer-Supplier]──> BC-01
BC-05 ──[ACL]──> OMS_Externe
BC-06 ──[Shared Kernel]──> tous BCs
```

### Domain Events par BC (inventaire résumé)

| BC | Events émis |
|----|-------------|
| BC-07 | TournéeImportéeTMS, CompositionVérifiée, AffectationEnregistrée, **TournéeLancée** |
| BC-01 | TournéeChargée, TournéeDémarrée, LivraisonConfirmée, ÉchecLivraisonDéclaré, MotifEnregistré, DispositionEnregistrée, IncidentDéclaré, TournéeModifiée, **TournéeClôturée** |
| BC-02 | PreuveCapturée |
| BC-03 | TournéeÀRisqueDétectée, AlerteDéclenchée, InstructionEnvoyée, InstructionExécutée |
| BC-04 | InstructionReçue, NotificationEnvoyée |

### Invariants critiques à ne jamais violer

1. Un livreur ne peut être affecté qu'à une seule tournée par jour (BC-07)
2. Un véhicule ne peut être affecté qu'à une seule tournée par jour (BC-07)
3. TournéeTMS non lancée → pas visible dans l'app livreur (BC-07 → BC-01)
4. Colis "livré" → PreuveLivraisonId obligatoire (BC-01)
5. Motif non-livraison obligatoire si statut "échec" (BC-01)
6. PreuveLivraison immuable après création (BC-02)

---

## Décisions structurantes

| Date | Décision | Justification |
|------|----------|---------------|
| 2026-03-19 | BC-01 = Core Domain principal | Différenciateur DocuPost : connexion livreur/superviseur/SI temps réel |
| 2026-03-19 | BC-05 = ACL (Anti-Corruption Layer) OMS | Aucune modification du cœur OMS (M. Garnier) |
| 2026-03-19 | BC-06 = Generic Subdomain off-the-shelf | SSO OAuth2 imposé par DSI |
| 2026-03-20 | BC-07 = second Core Domain | Prérequis bloquant au Parcours 1 — oublié du cadrage initial |
| 2026-03-20 | TournéeLancée = seul point de couplage BC-07 → BC-01 | Isolation maximale entre planification et exécution |

---

## Interventions réalisées

| Date | Version | Sujet | Fichiers |
|------|---------|-------|----------|
| 2026-03-19 | 1.0 | Création — ubiquitous language, BC-01→06, context map, modèles détaillés, 7 modules, capability map 8 domaines | domain-model.md, capability-map.md, modules-fonctionnels.md |
| 2026-03-20 | 1.1 | Ajout BC-07 Planification de Tournée : 6 nouveaux termes, modèle PlanDuJour/TournéeTMS/Affectation/Véhicule, 5 invariants, 4 domain events, context map mise à jour, Module 8, capability Planification | domain-model.md, capability-map.md, modules-fonctionnels.md |

---

## Points d'attention — prochaines interventions

- Toute nouvelle entité doit être ajoutée à l'**Ubiquitous Language** avant d'être utilisée dans une US ou du code
- Le **module véhicule** est actuellement minimal (référentiel simple) — pas d'optimisation de capacité au MVP
- Le **couplage BC-07 → BC-01** se fait uniquement via l'event `TournéeLancée` — ne pas créer d'appel direct
- Si un nouveau Bounded Context est nécessaire, vérifier sa classification (Core / Supporting / Generic) et mettre à jour la Context Map
