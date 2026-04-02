# Archives Cold Storage — @architecte-metier — DocuPost

> Journal actif : `/livrables/00-contexte/journaux/journal-architecte-metier.md`
> Contient : interventions archivées (> 7 jours)

---

## Interventions archivées

| Date | Version | Sujet | Fichiers |
|------|---------|-------|----------|
| 2026-03-19 | 1.0 | Création — ubiquitous language, BC-01→06, context map, modèles détaillés, 7 modules, capability map 8 domaines | domain-model.md, capability-map.md, modules-fonctionnels.md |
| 2026-03-20 | 1.1 | Ajout BC-07 Planification de Tournée : 6 nouveaux termes, modèle PlanDuJour/TournéeTMS/Affectation/Véhicule, 5 invariants, 4 domain events, context map mise à jour, Module 8, capability Planification | domain-model.md, capability-map.md, modules-fonctionnels.md |

---

## Décisions archivées

| Date | Décision | Justification |
|------|----------|---------------|
| 2026-03-19 | BC-01 = Core Domain principal | Différenciateur DocuPost : connexion livreur/superviseur/SI temps réel |
| 2026-03-19 | BC-05 = ACL (Anti-Corruption Layer) OMS | Aucune modification du cœur OMS (M. Garnier) |
| 2026-03-19 | BC-06 = Generic Subdomain off-the-shelf | SSO OAuth2 imposé par DSI |
| 2026-03-20 | BC-07 = second Core Domain | Prérequis bloquant au Parcours 1 — oublié du cadrage initial |
| 2026-03-20 | TournéeLancée = seul point de couplage BC-07 → BC-01 | Isolation maximale entre planification et exécution |
