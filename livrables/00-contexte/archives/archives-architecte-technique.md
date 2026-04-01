# Archives Cold Storage — @architecte-technique — DocuPost

> Journal actif : `/livrables/00-contexte/journaux/journal-architecte-technique.md`
> Contient : interventions archivées (> 7 jours)

---

## Interventions archivées

| Date | Version | Sujet | Fichiers |
|------|---------|-------|----------|
| 2026-03-19 | 1.0/1.1 | Création — architecture C4, ADR-001→009, NFR, schémas OMS/SSO/FCM | architecture-applicative.md, schemas-integration.md, design-decisions.md, exigences-non-fonctionnelles.md |
| 2026-03-20 | 1.1→1.2 | Ajout TMS : conteneur svc-planification, ImporteurTMS cron, ACL TMS, ADR-010/011, NFR DISP-004/PERF-010/RESIL-005/SEC-008 | architecture-applicative.md, schemas-integration.md, design-decisions.md, exigences-non-fonctionnelles.md |

---

## Décisions archivées

| Date | Décision | Justification |
|------|----------|---------------|
| 2026-03-19 | Offline-first mobile (SQLite) | Zones blanches fréquentes en péri-urbain (H5) |
| 2026-03-19 | Event sourcing immuable | Preuves opposables + audit réglementaire (Mme Dubois) |
| 2026-03-19 | ACL OMS côté DocuPost | Zéro modification du cœur OMS (M. Garnier) |
| 2026-03-19 | Microservices 1 service = 1 BC | Isolation domaines, déploiement indépendant |
| 2026-03-20 | ImporteurTMS en cron 6h00 (Spring @Scheduled) | Contrainte fenêtre matinale logisticien |
| 2026-03-20 | 3 retries auto (6h05/6h10/6h15) + alerte si échec | Résilience sans intervention humaine immédiate |
| 2026-03-20 | Endpoints /plans, /affectations réservés SUPERVISOR | Sécurité RBAC — livreur ne doit pas accéder à la planification |
