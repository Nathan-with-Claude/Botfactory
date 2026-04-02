# KPIs DocuPost

> Document de référence — Version 1.0 — 2026-03-19
> Les indicateurs ci-dessous sont directement issus des pain points et enjeux exprimés lors
> des entretiens métier avec Pierre (livreur), Mme Dubois (DSI), M. Garnier (Architecte
> Technique) et M. Renaud (Responsable Exploitation Logistique). Chaque KPI est rattaché
> à l'objectif business qu'il mesure et à la source terrain qui le justifie.

---

## KPIs livreur — Efficacite et qualite d'execution terrain

| KPI | Definition | Cible MVP | Source entretien |
|---|---|---|---|
| Temps moyen de preparation de tournee | Durée entre l'arrivée du livreur et le départ effectif en tournée | Reduction de 30 % vs baseline papier | Pierre (livreur) |
| Taux de livraison au premier passage | Part des colis livrés sans nécessiter une seconde tentative | > 85 % | Pierre, M. Renaud |
| Taux d'echec de livraison evitable | Part des échecs liés à des motifs évitables (absence prévisible, horaire dépassé) | < 10 % des tentatives | Pierre, Mme Dubois |
| Temps moyen de saisie d'une preuve de livraison | Durée entre l'arrivée au point de livraison et la validation numérique | < 45 secondes | Pierre (livreur) |
| Taux de preuves de livraison capturees numeriquement | Part des livraisons clôturées avec une preuve numérique (signature, photo, tiers) | 100 % des livraisons réussies | Mme Dubois, M. Garnier |
| Taux d'utilisation des motifs normalises | Part des echecs de livraison enregistres avec un motif structure (vs champ libre ou absence de motif) | 100 % | Pierre, M. Renaud |

---

## KPIs superviseur — Pilotage et reactivite operationnelle

| KPI | Definition | Cible MVP | Source entretien |
|---|---|---|---|
| Delai moyen de detection d'une tournee a risque | Temps entre l'apparition d'un retard significatif et sa détection par le superviseur | < 15 minutes | M. Renaud |
| Nombre d'appels telephoniques superviseur / livreur par tournee | Indicateur de dépendance au pilotage vocal | Reduction de 70 % vs baseline | M. Renaud |
| Taux de tournees pilotees sans intervention manuelle | Part des tournées clôturées sans instruction corrective du superviseur | Mesure de référence au MVP, objectif cible à définir en post-MVP | M. Renaud |
| Temps moyen de traitement d'un incident terrain | Durée entre la déclaration d'un incident et la prise de décision superviseur | < 10 minutes | M. Renaud, Mme Dubois |
| Taux d'alertes actionnees | Part des alertes automatiques de tournées à risque ayant donné lieu à une instruction superviseur | Mesure de reference au MVP | M. Renaud |

---

## KPIs SI — Integration et fiabilite des donnees

| KPI | Definition | Cible MVP | Source entretien |
|---|---|---|---|
| Taux de synchronisation OMS en temps reel | Part des événements de livraison remontés dans l'OMS en moins de 30 secondes | > 99 % | M. Garnier |
| Taux de double saisie residuelle | Part des statuts colis encore saisis manuellement dans le SI après déploiement DocuPost | 0 % | Mme Dubois, M. Garnier |
| Taux de disponibilite de l'application livreur | Disponibilité de l'application mobile pendant les plages horaires de tournée | > 99,5 % | M. Garnier |
| Completude des evenements historises | Part des événements contenant les quatre attributs obligatoires (qui, quoi, quand, géolocalisation) | 100 % | M. Garnier, Mme Dubois |
| Taux d'evenements en echec de synchronisation rejoues avec succes | Part des événements non transmis en temps réel (zone blanche, coupure réseau) et rattrapés dans les 10 minutes | > 99 % | M. Garnier |

---

## KPIs qualite de service — Litiges et satisfaction client

| KPI | Definition | Cible MVP | Source entretien |
|---|---|---|---|
| Taux de litiges "colis non recu" | Part des livraisons faisant l'objet d'une réclamation client pour non-réception | Reduction de 40 % vs baseline | Mme Dubois |
| Delai moyen de fourniture d'une preuve opposable | Temps entre la demande de preuve par le support client et sa mise à disposition | < 5 minutes | Mme Dubois |
| Respect des SLA contractuels | Part des engagements horaires contractuels tenus sur les livraisons sensibles | > 95 % | Mme Dubois |

---

## KPI satisfaction livreur

| KPI | Definition | Cible MVP | Source entretien |
|---|---|---|---|
| Score de satisfaction livreur (eNPS simplifie) | Enquête courte post-tournée : "L'application vous a-t-elle facilité le travail ?" (note 1-5) | Score moyen > 4 / 5 apres 4 semaines d'usage | Pierre (livreur) |

---

## Modalites de mesure

- Les KPIs terrain (livreur, superviseur) sont mesurés dès la mise en production du MVP,
  à partir d'un échantillon de tournées pilotes.
- Les KPIs SI sont instrumentés via les logs applicatifs et les événements OMS dès le
  premier déploiement.
- Une baseline des indicateurs actuels (temps papier, nombre d'appels, litiges) doit être
  établie avant le lancement du MVP pour permettre la comparaison.
- Le score de satisfaction livreur est collecté via une micro-enquête in-app à la clôture
  de chaque tournée.
- Les KPIs marqués "Mesure de référence au MVP" n'ont pas d'objectif cible au démarrage :
  ils servent à établir la baseline et à fixer les objectifs pour la Release 2.
