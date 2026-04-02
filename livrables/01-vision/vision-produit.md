# Vision Produit DocuPost

> Document de référence — Version 1.0 — 2026-03-19
> Produit à partir des entretiens métier : Pierre (livreur Docaposte), Mme Dubois (DSI Docaposte),
> M. Garnier (Architecte Technique DSI), M. Renaud (Responsable Exploitation Logistique).

---

## Problematique metier

DocuPost opère aujourd'hui avec une rupture structurelle dans sa chaîne SI : dès qu'un livreur
quitte le dépôt, il sort du système d'information de l'entreprise.

Les conséquences concrètes identifiées lors des entretiens sont les suivantes.

**Côté livreur (Pierre)**
- Tournée gérée sur support papier : perte de temps, erreurs, illisibilité en conditions météo.
- Aucune vision globale du reste à livrer ni des priorités en cours de journée.
- Motifs de non-livraison non différenciés : impossibilité de distinguer un refus client d'une
  absence prévisible.
- Usage du téléphone personnel pour contacter les clients, sans traçabilité ni remboursement.
- Ajouts ou changements de priorité non transmis en cours de tournée.
- Risque d'oubli de colis multiples pour un même client, retours mélangés.

**Côté supervision (M. Renaud)**
- Pilotage exclusivement par téléphone : aucune visibilité temps réel sur l'avancement.
- Impossibilité d'anticiper les tournées à risque avant qu'elles soient en échec.
- Redistribution de colis en cas d'incident humain (livreur malade) gérée manuellement et
  approximativement.
- Motifs de non-livraison hétérogènes et inexploitables analytiquement.

**Côté DSI / Donneur d'ordre (Mme Dubois)**
- Preuves de livraison non immédiatement disponibles, fragilisant la défense en cas de litige.
- Double saisie manuelle dans les SI internes, source d'erreurs et de perte de temps.
- Difficulté à corréler retards, secteurs, livreurs et tournées pour un pilotage proactif.
- Faible standardisation des incidents, rendant les audits réglementaires difficiles.
- Livraisons de documents sensibles sans garantie d'opposabilité de la preuve.

**Côté SI (M. Garnier)**
- Rupture complète du flux SI une fois la tournée démarrée : remontée terrain hors OMS.
- Désynchronisation entre OMS, CRM et ERP sur les statuts colis.
- Ajouts urgents de colis non poussés au livreur.
- Référentiel adresse non exposé sur le terrain.

---

## Opportunite business

DocuPost dispose d'une opportunité de repositionner son service de livraison comme une
offre numérique à qualité de service traçable et opposable, là où la concurrence reste
en grande partie sur des processus papier ou semi-digitaux.

Les bénéfices attendus sont :

- **Réduction des litiges** : preuves numériques horodatées et géolocalisées accessibles en
  moins de 5 minutes par le support client (source : Mme Dubois).
- **Gain de productivité livreur** : réduction du temps de préparation de tournée et de la
  charge mentale, permettant un traitement plus rapide de la liste de colis.
- **Pilotage proactif** : détection des tournées à risque en moins de 15 minutes, remplaçant
  le pilotage téléphonique réactif (source : M. Renaud).
- **Réintégration du livreur dans le SI** : fin de la rupture SI terrain, zéro double saisie,
  cohérence inter-applications en temps réel (source : M. Garnier).
- **Sécurisation juridique** : chaque livraison produit un événement immuable avec attributs
  complets (qui, quoi, quand, géolocalisation), couvrant les obligations réglementaires pour
  les livraisons de documents sensibles (source : Mme Dubois).
- **Amélioration de la satisfaction livreur** : réduction de la charge administrative et
  des outils de substitution (téléphone personnel), facteur de fidélisation.

---

## Vision cible (6-12 mois)

DocuPost est une plateforme numérique de gestion de tournées de livraison qui connecte en
temps réel le livreur terrain, le superviseur logistique et le SI de l'entreprise (OMS,
CRM, ERP).

Le livreur dispose d'une application mobile Android qui :
- lui présente sa tournée de façon dynamique, organisée par zone et par priorité ;
- lui permet de mettre à jour le statut de chaque colis en moins de 45 secondes ;
- capture les preuves de livraison de façon opposable (signature, photo, tiers) ;
- reçoit en temps réel les instructions du superviseur sans appel téléphonique.

Le superviseur dispose d'une interface web qui :
- lui donne une vision agrégée de toutes les tournées du jour en temps réel ;
- le prévient automatiquement dès qu'une tournée présente un risque de retard ;
- lui permet d'envoyer des instructions structurées aux livreurs directement.

Le SI reçoit chaque événement de livraison via API REST dans les 30 secondes suivant
sa capture terrain, sans double saisie, et les stocke de façon immuable pour l'audit,
la facturation et le pilotage analytique.

---

## Utilisateurs cibles

### Pierre — Livreur terrain
Profil : chauffeur-livreur, 6 ans d'ancienneté, habitué aux tournées urbaines et
péri-urbaines. Gère en moyenne 80 à 120 colis par journée. Principal utilisateur de
l'application mobile. Peu à l'aise avec des interfaces complexes ; valorise la rapidité
et la fiabilité de l'outil. Travaille souvent dans des conditions défavorables (pluie,
mains chargées, réseau variable).

Besoins prioritaires : liste de tournée claire, mise à jour de statut rapide, preuve
de livraison sans friction, indicateur de progression.

### M. Renaud — Responsable exploitation logistique
Profil : supervisor de flotte, suit simultanément plusieurs livreurs et tournées.
Intervient en cas d'aléa (retard, incident, livreur absent). Utilisateur de l'interface
web de supervision. A besoin d'information structurée pour décider vite.

Besoins prioritaires : vue globale temps réel, alertes proactives, capacité d'instruction
vers les livreurs.

### Mme Dubois — DSI / Donneur d'ordre
Profil : responsable de la qualité globale du service, des audits et des engagements
contractuels. Accède aux données consolidées pour le pilotage stratégique et la
gestion des litiges.

Besoins prioritaires : preuves opposables disponibles immédiatement, statuts normalisés,
reporting par tournée et par secteur, respect des SLA contractuels.

### M. Garnier — Architecte Technique DSI
Profil : garant de la cohérence du SI livraison. Valide les intégrations OMS / CRM / ERP.
Exige la traçabilité technique et la conformité aux standards de l'entreprise.

Besoins prioritaires : API REST fiable, événements immuables, authentification via SSO
corporate, aucune modification du cœur OMS.

---

## Perimetre MVP (fonctionnel)

Le MVP couvre trois parcours prioritaires, directement issus des pain points exprimés
lors des entretiens.

**Parcours 1 — Livreur : Exécution de tournée (application mobile Android)**
- Consultation de la liste des colis assignés pour la journée.
- Organisation des arrêts par zone géographique ou proximité.
- Mise à jour du statut de chaque colis : livré, échec, à représenter.
- Saisie du motif de non-livraison normalisé : absent, accès impossible, refus client,
  horaires dépassés.
- Capture numérique de la preuve de livraison : signature, photo, tiers identifié,
  dépôt sécurisé.
- Indicateur temps réel du reste à livrer et estimation de fin de tournée.
- Réception de notifications push (ajout de colis, changement de priorité).

**Parcours 2 — Superviseur : Pilotage temps réel (interface web)**
- Tableau de bord des tournées du jour avec avancement en temps réel.
- Consultation du détail d'une tournée : statuts colis, incidents, position du livreur.
- Alertes automatiques sur les tournées à risque de retard.
- Envoi d'instructions structurées au livreur : prioriser, annuler, reprogrammer.

**Parcours 3 — Intégration SI**
- Emission d'un événement OMS normalisé à chaque changement de statut colis (API REST,
  < 30 secondes).
- Historisation immuable de chaque événement : livreur, action, horodatage, géolocalisation.
- Authentification via OAuth2 / SSO corporate pour livreurs et superviseurs.

---

## Hors perimetre MVP (releases ulterieures)

Les éléments suivants ont été exprimés comme pertinents lors des entretiens mais sont
exclus du MVP pour maîtriser la complexité et tenir les délais de premier déploiement.

- Optimisation automatique de l'ordre des arrêts (routage algorithmique) — Release 2.
- Notification proactive du client final avant passage (SMS, email) — Release 2.
- Reprogrammation en ligne par le client final — Release 3.
- Analyse de performance avancée et benchmarking inter-tournées — Release 2.
- Redistribution automatique de colis entre livreurs — Release 3.
- Intégration CRM et ERP (MVP limité à l'OMS) — Release 2.
- Application iOS (Android prioritaire sur le parc matériel actuel) — Release 2.
- Gestion des véhicules et capacités de chargement — Release 3.
- Facturation automatisée (dépend de l'intégration ERP) — Release 3.
- Portail client de suivi en autonomie — Release 3.
