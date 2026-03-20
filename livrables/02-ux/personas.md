# Personas DocuPost

> Document de référence — Version 1.1 — 2026-03-20
> Mis à jour suite à l'entretien complémentaire du 2026-03-20 avec M. Renaud :
> enrichissement du Persona 2 (Laurent Renaud) avec son rôle de préparation matinale
> des tournées (Parcours 0 — gestion TMS).
>
> Version 1.0 produite le 2026-03-19 à partir des entretiens métier avec Pierre (livreur
> Docaposte), Mme Dubois (DSI Docaposte), M. Garnier (Architecte Technique DSI),
> M. Renaud (Responsable Exploitation Logistique).
> Chaque persona est ancré dans les verbatims et observations terrain recueillis lors
> des entretiens. Les termes en italique sont les termes exacts du domaine, à conserver
> dans le modèle métier.

---

## Persona 1 — Pierre Morel, Livreur terrain

### Profil et contexte

- Nom fictif : Pierre Morel
- Rôle : Chauffeur-livreur terrain
- Ancienneté : 6 ans chez Docaposte
- Périmètre : Tournées urbaines et péri-urbaines
- Volume : 80 à 120 *colis* par journée
- Outil actuel : Feuille de *tournée* papier + smartphone personnel
- Connectivité : Variable selon les zones (zones blanches possibles en péri-urbain)
- Conditions d'usage : Mains souvent chargées, conditions météo défavorables fréquentes

### Objectifs

1. Savoir à tout moment combien de *colis* il lui reste à livrer et dans quel ordre les traiter.
2. Mettre à jour le statut d'un *colis* le plus vite possible, sans friction, pour ne pas perdre de temps entre deux arrêts.
3. Capturer une *preuve de livraison* valide (signature, photo, dépôt chez un *tiers*) sans avoir à ressortir un document papier.
4. Être informé immédiatement si le superviseur modifie sa *tournée* (ajout de *colis*, changement de priorité) sans devoir appeler.
5. Terminer sa *tournée* à l'heure prévue en gérant les aléas (absent, accès impossible) de façon structurée.

### Frustrations actuelles

- "Je sors avec une feuille de papier. Quand il pleut, elle est illisible au bout d'une heure."
  Source : entretien Pierre, pain point support papier.
- Aucune vision globale du *reste à livrer* : Pierre ne sait pas combien de *colis* il lui reste ni si sa *tournée* est en retard.
- Quand un client est absent, il n'y a pas de mot à cocher : Pierre invente ses propres abréviations, créant des incohérences dans le compte-rendu.
- Pierre utilise son téléphone personnel pour appeler les clients. Ni remboursé, ni tracé, ni sécurisé.
- Si le superviseur ajoute un *colis* en urgence en journée, Pierre l'apprend par un appel téléphonique, pas toujours au bon moment.
- Risque réel d'oublier un *colis* quand plusieurs *colis* sont destinés au même client dans des *bacs* différents.

### Contraintes terrain

- Interface mobile Android (parc matériel Docaposte, potentiellement BYOD).
- Réseau mobile dégradé ou absent sur certaines zones.
- Interactions avec l'application doivent être possibles d'une seule main, debout.
- L'application doit rester utilisable hors connexion et se synchroniser dès que le réseau revient (*mode offline-first*).
- Lisibilité impérative en plein soleil et pluie.

### Citation clé

> "Mon seul outil c'est ma feuille de route. Le problème c'est que si je l'oublie ou qu'elle se
> mouille, je suis à poil. Et si un colis s'ajoute en cours de journée, personne ne me prévient
> correctement."
> — Pierre, livreur terrain (entretien terrain)

### Termes du domaine captés

*tournée*, *colis*, *reste à livrer*, *preuve de livraison*, *motif de non-livraison*, *absent*,
*accès impossible*, *refus client*, *à représenter*, *tiers*, *dépôt sécurisé*, *bac*

---

## Persona 2 — Laurent Renaud, Responsable Exploitation Logistique

### Profil et contexte

- Nom fictif : Laurent Renaud (nom réel conservé, prénom fictif)
- Rôle : Responsable exploitation logistique, superviseur de flotte
- Périmètre : Préparation des *tournées* chaque matin (Parcours 0) et supervision
  de plusieurs livreurs et *tournées* simultanément en cours de journée (Parcours 2)
- Heure d'arrivée au dépôt : Entre 6h00 et 6h30, avant le départ des livreurs
- Volume de *tournées* à préparer chaque matin : 8 à 15 *tournées* selon les jours
- Outil actuel pour la préparation : Interface partielle du TMS (export incomplet),
  tableur Excel pour l'*affectation*, tableau papier mural pour la communication aux livreurs
- Outil actuel pour la supervision : Téléphone, tableur Excel, éventuellement interface
  partielle de l'OMS
- Lieu de travail : Bureau au dépôt, avec vue sur un tableau mural des *tournées*

### Objectifs

**Objectifs liés à la préparation matinale des tournées (Parcours 0)**

1. Recevoir et visualiser rapidement le *plan du jour* : toutes les *tournées TMS* importées
   avec leur composition (nombre de *colis*, zones géographiques, contraintes horaires).
2. Détecter immédiatement les *tournées* problématiques avant le départ des livreurs :
   *tournée* surchargée, zone inhabituelle, contrainte horaire incompatible.
3. Réaliser l'*affectation* (livreur + *véhicule*) pour chaque *tournée* rapidement et
   sans erreur, depuis une interface unique.
4. Lancer les *tournées* validées de façon formelle, les rendant visibles dans l'application
   mobile des livreurs concernés.

**Objectifs liés au pilotage temps réel (Parcours 2)**

5. Savoir en temps réel où en est chaque *tournée* du jour sans avoir à appeler chaque livreur.
6. Détecter immédiatement qu'une *tournée* va être en retard, avant qu'elle le soit, pour agir.
7. Envoyer une *instruction* structurée à un livreur (prioriser un *colis*, annuler, reprogrammer) directement depuis son écran.
8. Avoir des *motifs d'échec* normalisés pour pouvoir analyser les performances par zone, par livreur, par type d'incident.
9. Reconstituer l'historique d'un *incident* sans devoir rappeler le livreur a posteriori.

### Frustrations actuelles

**Frustrations liées à la préparation matinale (Parcours 0)**

- L'*affectation* des *tournées* aux livreurs et aux *véhicules* se fait sur un tableau papier
  ou un tableur, sans traçabilité et sans détection de conflit (livreur absent, *véhicule*
  indisponible).
- La *vérification de composition* de chaque *tournée* (nombre de *colis*, zones, contraintes
  horaires) est entièrement manuelle : Laurent compte à la main à partir d'exports Excel
  partiels du TMS.
- Aucun mécanisme de validation formelle avant le départ : une erreur d'*affectation* n'est
  découverte qu'après le départ du livreur, obligeant à un rappel téléphonique et parfois
  à un retour au dépôt.
- La communication du *plan du jour* aux livreurs se fait par affichage sur un tableau mural
  ou par appel : aucune transmission numérique directe.
- Quand une *tournée TMS* est mal composée (surcharge, zone trop large), Laurent n'a pas
  d'outil pour le détecter avant de valider ; il le découvre seulement quand le livreur appelle.

**Frustrations liées au pilotage temps réel (Parcours 2)**

- "Je pilote à l'aveugle. Je sais seulement ce que le livreur me dit quand il m'appelle."
  Source : entretien M. Renaud, pain point visibilité temps réel.
- Aucun outil pour anticiper : M. Renaud détecte les *tournées* en retard uniquement quand elles sont déjà en retard.
- En cas de livreur malade ou d'*incident*, la redistribution des *colis* non livrés se fait à la main, par téléphone, sans visibilité sur les capacités restantes.
- Les *motifs de non-livraison* remontés par les livreurs sont hétérogènes : impossible d'en tirer des analyses fiables.
- Le pilotage par téléphone génère des interruptions constantes, des erreurs de communication et une traçabilité nulle.

### Contraintes terrain

- Interface web, sur PC bureau ou tablette.
- Doit pouvoir surveiller plusieurs *tournées* en parallèle sur un même écran.
- Les alertes doivent être visibles sans que Laurent ait à consulter activement l'écran toutes les cinq minutes.
- Doit pouvoir agir en moins de 10 minutes sur un *incident* déclaré.
- La phase de préparation matinale est contrainte dans le temps : les livreurs partent
  entre 7h30 et 8h00 ; toutes les *tournées* doivent être lancées avant leur départ.

### Citation clé

> "Quand je vois qu'une tournée est en retard, c'est souvent trop tard. Je voudrais
> être prévenu avant, pas après."
> — M. Renaud, responsable exploitation (entretien terrain)

### Termes du domaine captés

**Préparation matinale (Parcours 0)**

*tournée TMS*, *plan du jour*, *affectation*, *vérification de composition*, *lancement de tournée*,
*véhicule*, *composition de tournée*

**Supervision temps réel (Parcours 2)**

*tournée*, *tournée à risque*, *incident*, *instruction*, *prioriser*, *reprogrammer*,
*annuler*, *motif de non-livraison*, *colis restants livrables*, *redistribution*,
*avancement de tournée*

---

## Persona 3 — Sophie Dubois, DSI / Donneur d'ordre

### Profil et contexte

- Nom fictif : Sophie Dubois (nom réel conservé, prénom fictif)
- Rôle : Directrice des Systèmes d'Information, donneur d'ordre pour le projet DocuPost
- Périmètre : Qualité globale du service, gestion des litiges, conformité réglementaire, pilotage stratégique
- Outil actuel : Rapports consolidés, interface OMS partielle, emails de support
- Lieu de travail : Siège Docaposte

### Objectifs

1. Pouvoir fournir une *preuve de livraison opposable* au support client en moins de 5 minutes lors d'un litige.
2. Garantir que les *événements de livraison* sont historisés de façon immuable avec tous les attributs requis (qui, quoi, quand, géolocalisation).
3. Supprimer la double saisie manuelle dans les SI internes (OMS, CRM) en faisant de DocuPost une brique SI officielle.
4. Respecter les *SLA contractuels* sur les livraisons de documents sensibles.
5. Disposer d'un *reporting* par tournée et par secteur pour le pilotage stratégique et les audits.

### Frustrations actuelles

- "Quand un client nous dit qu'il n'a pas reçu son colis, on met parfois des heures à retrouver la preuve, si tant est qu'elle existe."
  Source : entretien Mme Dubois, pain point preuves de livraison.
- La double saisie dans les SI internes est une source d'erreurs et de charge inutile.
- La faible standardisation des *incidents* de livraison rend les audits réglementaires longs et incertains.
- Aucune visibilité temps réel sur l'état des *tournées* : impossible de piloter de façon proactive la qualité de service.
- Les livraisons de documents sensibles n'ont pas de garantie d'opposabilité de la *preuve*.

### Contraintes

- Conformité RGPD obligatoire (géolocalisation, données personnelles).
- Authentification via SSO corporate (OAuth2), pas de création de comptes ad hoc.
- Les *événements* doivent être immuables et auditables.
- Les *preuves de livraison* doivent être accessibles en moins de 5 minutes par le support client.

### Citation clé

> "On a besoin que chaque livraison produise une preuve opposable avec horodatage et
> géolocalisation. Aujourd'hui, en cas de litige, on est souvent démunis."
> — Mme Dubois, DSI Docaposte (entretien terrain)

### Termes du domaine captés

*preuve de livraison opposable*, *événement de livraison*, *historisation immuable*,
*double saisie*, *SLA contractuel*, *audit*, *litige colis non reçu*, *document sensible*,
*reporting*

---

## Persona 4 — Éric Garnier, Architecte Technique DSI

> Note : Ce persona est un utilisateur indirect de DocuPost. Il n'utilise pas l'application
> au quotidien mais ses exigences contraignent fortement les décisions d'architecture et
> d'intégration. Il est inclus ici pour documenter ses besoins et les traduire en contraintes
> non fonctionnelles pour le PO et l'architecte technique.

### Profil et contexte

- Nom fictif : Éric Garnier (nom réel conservé, prénom fictif)
- Rôle : Architecte Technique DSI
- Périmètre : Cohérence du SI livraison, orchestration OMS / WMS / TMS / CRM / ERP
- Outil actuel : Documentation d'architecture, interfaces d'administration SI

### Objectifs

1. Que DocuPost devienne une *brique SI officielle* : chaque *changement de statut colis* génère un *événement* synchronisé vers l'OMS.
2. Zéro modification du cœur OMS : intégration exclusivement via API REST / ESB.
3. *Traçabilité technique* complète : tous les *événements* sont immuables et historisés.
4. Authentification via SSO corporate (OAuth2) pour tous les utilisateurs.
5. Conformité aux normes SI : environnements dev / recette / préprod / prod, stack Java 21 / Spring Boot, React 19 / TypeScript.

### Frustrations actuelles

- Rupture complète du SI une fois la *tournée* démarrée : toute la remontée terrain se fait hors OMS.
- Désynchronisation entre OMS, CRM et ERP sur les statuts *colis*.
- Les ajouts urgents de *colis* ne sont pas poussés au livreur.
- Le *référentiel adresse* n'est pas exposé sur le terrain.

### Contraintes

- Stack imposée : Java 21 / Spring Boot 4.0.3, React 19 / TypeScript 5.6, Docker / Kubernetes, CI/CD GitHub Actions.
- Sécurité : OAuth2 / SSO, TLS/HTTPS, conformité RGPD.
- Architecture DDD.
- Intégration via API REST uniquement.
- Observabilité : modalités à définir (mentionnée comme exigence dans les entretiens).

### Citation clé

> "L'application livreur doit devenir une brique SI à part entière. Tout événement terrain
> doit remonter dans l'OMS sans double saisie et sans toucher au cœur applicatif."
> — M. Garnier, Architecte Technique DSI (entretien terrain)

### Termes du domaine captés

*brique SI*, *événement*, *changement de statut colis*, *synchronisation OMS*,
*référentiel adresse*, *traçabilité technique*, *Anti-Corruption Layer*, *ESB*

---

## Glossaire terrain — Termes issus des personas

> Ces termes sont la matière première de l'Ubiquitous Language. Ils doivent être transmis
> à l'Architecte Métier pour intégration dans le modèle de domaine.

| Terme terrain              | Définition selon l'utilisateur                                                          | Persona source     |
|----------------------------|-----------------------------------------------------------------------------------------|---------------------|
| Tournée                    | Ensemble des colis à livrer par un livreur sur une journée, organisé par zone           | Pierre, Laurent     |
| Tournée TMS                | Tournée générée automatiquement par le TMS chaque matin, avant affectation             | Laurent             |
| Plan du jour               | Ensemble des tournées TMS à affecter et lancer avant le départ des livreurs            | Laurent             |
| Affectation                | Opération consistant à associer un livreur et un véhicule à une tournée TMS            | Laurent             |
| Vérification de composition| Contrôle manuel de la cohérence d'une tournée : nombre de colis, zones, contraintes    | Laurent             |
| Lancement de tournée       | Acte formel de validation d'une tournée affectée, la rendant visible aux livreurs      | Laurent             |
| Véhicule                   | Moyen de transport affecté à une tournée, avec son propre identifiant                  | Laurent             |
| Composition de tournée     | Détail du contenu d'une tournée : nombre de colis, zones géographiques, contraintes    | Laurent             |
| Colis                      | Unité de livraison assignée à un livreur avec adresse, contraintes et statut            | Pierre              |
| Reste à livrer             | Nombre de colis non encore traités dans la tournée en cours                             | Pierre, Laurent     |
| Motif de non-livraison     | Raison normalisée d'un échec : absent, accès impossible, refus, horaires               | Pierre, Laurent     |
| Preuve de livraison        | Élément numérique opposable : signature, photo, tiers identifié, dépôt                 | Pierre, Sophie      |
| Incident                   | Aléa terrain significatif signalé par le livreur (accès, refus, urgence)               | Pierre, Laurent     |
| Instruction                | Ordre structuré envoyé par le superviseur au livreur (prioriser, annuler…)             | Laurent             |
| Tournée à risque           | Tournée détectée comme susceptible de dépasser les délais contractuels                  | Laurent             |
| À représenter              | Statut d'un colis dont la livraison a échoué et doit être retenté                      | Pierre              |
| Tiers                      | Voisin ou tiers identifié chez qui un colis est déposé en l'absence du client          | Pierre              |
| Dépôt sécurisé             | Lieu de dépôt d'un colis en l'absence du destinataire, documenté et tracé              | Pierre              |
| SLA contractuel            | Engagement de niveau de service sur les délais de livraison                             | Sophie              |
| Événement de livraison     | Fait métier immuable : changement de statut, preuve capturée, incident déclaré         | Sophie, Éric        |
| Brique SI                  | Composant applicatif intégré dans le SI de l'entreprise via API officielle              | Éric                |
| Avancement de tournée      | Pourcentage ou nombre de colis traités par rapport au total de la tournée               | Laurent             |
