1. Entretien Pierre – Livreur Docuposte
Actions métier clés
Préparer et exécuter une tournée de livraison (du chargement à la remise client).
Livrer colis par colis avec gestion des aléas terrain (absence, accès, contraintes horaires).
Mettre à jour le statut de chaque colis (livré, échec, à représenter, incident).
Gérer les preuves de livraison (signature, photo, voisin, dépôt).
Communiquer en fin de tournée les résultats et incidents à la logistique.
Adapter la tournée en fonction du terrain (regroupements géographiques, priorités).
Problématiques clés
Aucune vision globale de la tournée en cours (reste à livrer, priorités).
Support papier : perte de temps, erreurs, illisibilité, inutilisable sous la pluie.
Absence de différenciation claire des motifs de non‑livraison.
Risque d’oubli (colis multiples pour un client, retours mélangés).
Aucune mise à jour en temps réel en cas d’ajout ou de changement de priorité.
Usage du téléphone personnel pour contacter les clients.
Enjeux métier
Accélérer la tournée sans dégrader la qualité de service.
Réduire les échecs de livraison évitables.
Sécuriser les preuves de remise.
Diminuer la charge mentale du livreur.
Éviter les litiges liés aux oublis ou aux informations manquantes.
Key insights / règles métier à implémenter
Chaque colis doit avoir un statut normalisé et horodaté.
Le livreur doit disposer d’une liste dynamique des colis restants, filtrable par zone/proximité.
Les motifs de non‑livraison doivent être structurés (absent, accès impossible, refus, horaires).
Possibilité de reprogrammation explicite (date, créneau, nouvelle adresse).
Gestion native des preuves de livraison (signature, photo, tiers).
Suivi spécifique des colis nécessitant signature ou présentant des contraintes (fragile, horaires).
Indicateur temps réel : reste à livrer / estimation fin de tournée
2. Entretien Mme Dubois – DSI Docaposte (Donneur d’ordre)
Actions métier clés
Superviser la qualité globale du service de livraison.
Suivre l’avancement des tournées en journée.
Gérer les litiges clients et les audits post‑livraison.
Garantir la conformité réglementaire (documents sensibles).
Alimenter les KPI opérationnels et contractuels.
Problématiques clés
Aucune visibilité temps réel sur l’état des tournées.
Preuves de livraison non immédiatement disponibles.
Double saisie manuelle dans les SI internes.
Difficulté à corréler retards, secteurs, livreurs et tournées.
Faible standardisation des incidents de livraison.
Enjeux métier
Réduction des litiges « colis non reçus ».
Sécurisation juridique des livraisons sensibles.
Amélioration de la qualité perçue par les clients finaux.
Pilotage proactif (avant la fin de tournée).
Respect des engagements contractuels et SLA.
Key insights / règles métier à implémenter
Toute livraison doit produire une preuve opposable (horodatage, géolocalisation, identité).
Les statuts colis doivent être remontés en temps réel dans le SI.
Les événements de livraison doivent être historisés (qui / quoi / quand).
Les motifs d’échec doivent être normalisés et exploitables analytiquement.
Vision agrégée requise : par tournée, zone, jour, livreur.
Le support client doit pouvoir consulter le statut en direct.
 
3. Entretien M. Garnier – Architecte Technique DSI
Actions métier clés
Garantir la cohérence du SI livraison.
Orchestrer les flux OMS / WMS / TMS / CRM / ERP.
Valider les intégrations futures.
Assurer la traçabilité technique des événements livraison.
Problématiques clés
Rupture complète du SI une fois la tournée démarrée.
Remontée terrain hors SI cœur (papier, scan, ressaisie).
Désynchronisation entre OMS, CRM et ERP.
Ajouts urgents de colis non poussés au livreur.
Référentiel adresse non exposée au terrain.
Enjeux métier
Réintégrer le livreur dans la chaîne SI.
Éviter toute double saisie.
Garantir la cohérence des statuts inter‑applications.
Permettre l’audit et la facturation fiable.
Key insights / règles métier à implémenter
L’application livreur devient une brique SI officielle.
Tout changement de statut colis doit générer un événement synchronisé vers l’OMS.
Les flux doivent passer par API / ESB, sans modification du cœur OMS.
Les contraintes adresse / horaires doivent être visibles côté terrain.
Les événements doivent être immutables et historisés (auditabilité).
Contraintes / Exigences techniques
·   	Back-end : Java 21 / Spring Boot 4.0.3
·       Front-end : React 19 / Typescript 5.6
·       DevOps : Docker / Kubernetes / CI/CD GitHub Actions
·       Sécurité : Oauth2 / SSO corporate, gestion des données conformes à RGPD, chiffrements des données (TLS, HTTPS)
·       Architecture : DDD
·       Intégration : API REST
·       Observabilité imposée: ...
·       Normes sur les environnements : dev / recette / préprod / prod
 
4. Entretien M. Renaud – Responsable Exploitation Logistique
Actions métier clés
Affecter livreurs et véhicules.
Piloter les tournées en journée.
Gérer les aléas (retards, incidents, absences).
Replanifier et prioriser les livraisons.
Consolider les résultats de fin de tournée.
Problématiques clés
Aucune visibilité temps réel sur l’avancement réel.
Pilotage uniquement par téléphone.
Motifs de non‑livraison hétérogènes et non exploitables.
Impossible d’anticiper les tournées à risque.
Redistribution complexe en cas d’incident humain (livreur malade).
Enjeux métier
Anticiper plutôt que subir les retards.
Sécuriser les clients à engagement horaire.
Améliorer l’efficacité globale des tournées.
Objectiver la performance (zone, tournée, livreur).
Key insights / règles métier à implémenter
Suivi temps réel de l’avancement de chaque tournée.
Capacité à envoyer des instructions au livreur (prioriser, annuler, reprogrammer).
Statuts et incidents strictement normalisés.
Historisation des performances par secteur et tournée.
Visualisation claire des colis restants livrables vs non livrables.