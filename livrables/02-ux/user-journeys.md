# User Journeys DocuPost

> Document de référence — Version 1.0 — 2026-03-19
> Produit à partir des entretiens métier (Pierre livreur, Mme Dubois DSI, M. Garnier
> Architecte Technique, M. Renaud Responsable Exploitation) et des livrables de vision
> (/livrables/01-vision/).
>
> Chaque parcours est décrit en deux versions :
> - AS-IS : le parcours tel qu'il existe aujourd'hui, avec les pain points documentés.
> - TO-BE MVP : la cible pour le périmètre MVP défini.
>
> Les verbatims d'entretiens sont cités en italique pour ancrer les pain points dans la
> réalité terrain.

---

## Parcours 1 — Livreur : Exécuter une tournée

**Persona principal** : Pierre Morel (Livreur terrain)
**Déclencheur** : Arrivée au dépôt le matin, prise en charge du véhicule et des *colis*

---

### Version AS-IS (aujourd'hui)

| # | Étape           | Actions de Pierre                                              | Émotions         | Pain points                                                                                   |
|---|-----------------|----------------------------------------------------------------|------------------|-----------------------------------------------------------------------------------------------|
| 1 | Préparation     | Récupère la feuille de *tournée* papier au bureau, charge les *colis* dans le véhicule | Neutre / Routinier | Feuille parfois incomplète ou illisible. "Si je l'oublie ou qu'elle se mouille, je suis à poil." |
| 2 | Organisation    | Organise mentalement l'ordre des *arrêts* à partir de la feuille et de sa connaissance terrain | Charge mentale     | Aucun outil d'aide. Organisation entièrement mémorielle. Risque d'oubli de *colis* multiples. |
| 3 | Livraison       | Se rend à l'adresse, sonne, remet le *colis* au client, fait signer une fiche papier ou note la remise sur sa feuille | Exécution mécanique | Aucune traçabilité numérique. Si le client refuse de signer, rien n'est fait.                |
| 4 | Échec de livraison | Client absent : note « abs. » sur la feuille. Chaque livreur a ses propres abréviations | Frustration        | *Motifs de non-livraison* non normalisés. Impossible à analyser côté supervision.             |
| 5 | Suivi progression | Compte à la main les *colis* restants sur la feuille          | Anxiété légère     | Aucun indicateur de progression. Pierre ne sait pas s'il sera à l'heure.                      |
| 6 | Communication   | Appelle le superviseur en cas de problème, ou se tait         | Variable           | Pilotage entièrement par téléphone, non tracé, chronophage pour les deux parties.             |
| 7 | Fin de tournée  | Rentre au dépôt, remet la feuille papier au bureau            | Soulagement        | Saisie manuelle dans le SI le soir ou le lendemain. Double saisie. Données souvent incomplètes.|

**Pain points majeurs AS-IS :**
- Support papier illisible et inutilisable en conditions météo défavorables.
- Aucune vision du *reste à livrer* ni estimation de fin de *tournée*.
- *Motifs de non-livraison* hétérogènes et inexploitables.
- Aucune *preuve de livraison* numérique opposable.
- Téléphone personnel utilisé pour la communication, sans remboursement ni traçabilité.
- Rupture totale du SI : Pierre est hors du système dès qu'il quitte le dépôt.

---

### Version TO-BE MVP

| # | Étape                   | Actions de Pierre                                                                               | Système DocuPost                                                                                  | Émotions attendues    | Opportunités / Domain Events                             |
|---|-------------------------|-------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|-----------------------|----------------------------------------------------------|
| 1 | Authentification        | Ouvre l'application, se connecte via SSO corporate                                             | Authentification OAuth2 / SSO. Chargement de la *tournée* du jour.                                | Confiance / Simplicité | **TournéeChargée**                                       |
| 2 | Prise en main de la tournée | Consulte la liste de ses *colis* du jour sur l'application mobile                          | Affiche la liste des *colis* avec statut initial, adresse, contraintes (*fragile*, *horaire*)     | Clarté / Maîtrise     | **TournéeDémarrée**                                      |
| 3 | Organisation des arrêts | Filtre la liste par zone géographique ou proximité                                             | Tri et filtrage dynamique de la liste. Indicateur du nombre total de *colis*.                     | Efficacité            | —                                                        |
| 4 | Livraison réussie       | Arrive chez le client, remet le *colis*, capture la *preuve* (signature numérique ou photo)    | Horodatage, géolocalisation, capture de la *preuve*. Mise à jour du statut : *livré*.             | Satisfaction / Rapidité | **LivraisonConfirmée**, **PreuveCapturée**               |
| 5 | Échec de livraison      | Sélectionne le *motif de non-livraison* normalisé dans une liste                               | Enregistre le motif structuré. Statut du *colis* : *échec*. Propose les options : *à représenter*, reprogrammer. | Neutre / Guidé       | **ÉchecLivraisonDéclaré**, **MotifEnregistré**           |
| 6 | Suivi de progression    | Consulte l'indicateur de *reste à livrer* et l'estimation de fin de *tournée*                  | Calcule et affiche en temps réel : X *colis* restants, fin estimée à HH:MM.                       | Sérénité              | —                                                        |
| 7 | Réception d'instruction | Reçoit une notification push du superviseur (ajout de *colis*, changement de priorité)        | Affiche l'*instruction* structurée. Mise à jour automatique de la liste de *colis*.               | Réactivité            | **InstructionReçue**, **TournéeModifiée**                |
| 8 | Clôture de tournée      | Termine sa *tournée*, voit le récapitulatif (livrés, échecs, incidents)                        | Synthèse de *tournée* affichée. *Événements* synchronisés avec l'OMS. Micro-enquête satisfaction. | Accomplissement       | **TournéeClôturée**, **SynchronisationOMS**              |

---

**Domain Events identifiés (Parcours 1) :**
TournéeChargée, TournéeDémarrée, LivraisonConfirmée, PreuveCapturée,
ÉchecLivraisonDéclaré, MotifEnregistré, InstructionReçue, TournéeModifiée, TournéeClôturée,
SynchronisationOMS

**Termes du domaine captés :**
*tournée*, *colis*, *arrêt*, *reste à livrer*, *preuve de livraison*, *motif de non-livraison*,
*à représenter*, *livré*, *échec*, *instruction*, *fragile*, *horaire*, *tiers*

**Frontières de Bounded Contexts suggérées :**
- Passage de l'étape 3 (organisation) à l'étape 4 (livraison) : transition du contexte
  "Planification de tournée" vers "Exécution de livraison".
- L'étape 8 (synchronisation OMS) marque la frontière entre le contexte "Orchestration
  de tournée" et le contexte "Intégration SI" (Anti-Corruption Layer OMS).

---

## Parcours 2 — Superviseur : Piloter les tournées en temps réel

**Persona principal** : Laurent Renaud (Responsable Exploitation Logistique)
**Déclencheur** : Démarrage de la journée de livraison, livreurs partis en tournée

---

### Version AS-IS (aujourd'hui)

| # | Étape                    | Actions de Laurent                                           | Émotions        | Pain points                                                                                        |
|---|--------------------------|--------------------------------------------------------------|-----------------|----------------------------------------------------------------------------------------------------|
| 1 | Ouverture de journée     | Lance les *tournées*, livreurs partent avec feuille papier  | Neutre           | Dès le départ, Laurent perd la visibilité : "Je pilote à l'aveugle."                              |
| 2 | Suivi en journée         | Attend les appels des livreurs ou appelle lui-même          | Anxiété chronique | Pilotage entièrement téléphonique. Non tracé. Interrompt les livreurs dans leur travail.          |
| 3 | Détection d'un retard    | Apprend qu'une *tournée* est en retard quand elle est déjà en retard | Stress réactif  | Aucune détection proactive. Trop tard pour corriger efficacement.                                 |
| 4 | Gestion d'un incident    | Appelle le livreur, gère verbalement, note sur un papier    | Frustration      | Aucune traçabilité de la décision prise. Risque d'erreur de communication.                        |
| 5 | Redistribution de colis  | Contacte un autre livreur, lui transmet verbalement les *colis* à récupérer | Charge maximale  | Aucun outil. Redistribution approximative. Risque de *colis* oubliés.                            |
| 6 | Fin de journée           | Consolide les résultats à partir des feuilles papier retournées | Épuisement      | Données incomplètes, *motifs* hétérogènes. Analyse quasi impossible.                              |

**Pain points majeurs AS-IS :**
- Zéro visibilité temps réel sur l'*avancement de tournée*.
- Pilotage entièrement par téléphone : chronophage, non tracé, source d'erreurs.
- Détection des *tournées à risque* toujours post-facto.
- *Motifs de non-livraison* inexploitables analytiquement.
- Redistribution manuelle des *colis* en cas d'*incident* humain (livreur malade).

---

### Version TO-BE MVP

| # | Étape                        | Actions de Laurent                                                               | Système DocuPost                                                                                           | Émotions attendues | Opportunités / Domain Events                          |
|---|------------------------------|----------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|--------------------|-------------------------------------------------------|
| 1 | Ouverture de journée         | Ouvre le tableau de bord web, consulte l'état de toutes les *tournées* du jour  | Affiche la liste des *tournées* actives avec *avancement* en temps réel (% de *colis* traités, statuts).   | Maîtrise           | —                                                     |
| 2 | Suivi en temps réel          | Observe l'évolution des *tournées* sans appel téléphonique                       | Met à jour les statuts *colis* en continu dès remontée terrain. Indicateurs visuels par *tournée*.         | Sérénité           | —                                                     |
| 3 | Détection d'une tournée à risque | Reçoit une alerte automatique sur une *tournée à risque*                    | Détecte automatiquement les écarts de délai. Déclenche une alerte visuelle et sonore sur le tableau de bord. | Réactivité rapide  | **TournéeÀRisqueDétectée**, **AlerteDéclenchée**      |
| 4 | Consultation du détail       | Clique sur la *tournée* concernée pour voir le détail                            | Affiche la liste des *colis* de la *tournée* avec statuts, *incidents*, *motifs* et position du livreur.   | Compréhension      | —                                                     |
| 5 | Envoi d'une instruction      | Sélectionne un *colis* et envoie une *instruction* : prioriser, annuler, reprogrammer | Transmet l'*instruction* au livreur via notification push. Historise l'action.                        | Contrôle           | **InstructionEnvoyée**, **TournéeModifiée**            |
| 6 | Traitement d'un incident     | Consulte l'*incident* déclaré par le livreur, prend une décision                | Affiche l'*incident* structuré avec *motif*, horodatage, *colis* concerné. Permet une réponse rapide.      | Efficacité         | **IncidentConsulté**, **DécisionPrise**               |
| 7 | Fin de journée               | Consulte le récapitulatif des *tournées* clôturées                               | Synthèse : taux de livraison, *échecs*, *incidents*, *motifs* par *tournée*.                               | Accomplissement    | —                                                     |

---

**Domain Events identifiés (Parcours 2) :**
TournéeÀRisqueDétectée, AlerteDéclenchée, InstructionEnvoyée, TournéeModifiée,
IncidentConsulté, DécisionPrise

**Termes du domaine captés :**
*tournée à risque*, *avancement de tournée*, *instruction*, *incident*, *tableau de bord*,
*alerte*, *prioriser*, *annuler*, *reprogrammer*, *colis restants livrables*

**Frontières de Bounded Contexts suggérées :**
- La détection automatique d'une *tournée à risque* (étape 3) est une frontière interne au
  Core Domain : logique de calcul d'écart de délai séparée de la logique d'exécution terrain.
- L'envoi d'une *instruction* (étape 5) marque la frontière entre le contexte "Supervision"
  et le contexte "Notification / Messaging" (Supporting Subdomain).

---

## Parcours 3 — Livreur : Déclarer un incident

**Persona principal** : Pierre Morel (Livreur terrain)
**Déclencheur** : Pierre rencontre un aléa terrain empêchant la livraison d'un *colis*
(accès impossible, client qui refuse, *colis* endommagé)

---

### Version AS-IS (aujourd'hui)

| # | Étape                  | Actions de Pierre                                         | Émotions    | Pain points                                                                          |
|---|------------------------|-----------------------------------------------------------|-------------|--------------------------------------------------------------------------------------|
| 1 | Constat de l'aléa      | Constate qu'il ne peut pas livrer                        | Frustration  | Aucun protocole clair. Pierre improvise.                                             |
| 2 | Notation               | Note à la main sur la feuille (« ab » pour absent, etc.) | Résignation  | Abréviations personnelles. Non normalisé. Non tracé numériquement.                  |
| 3 | Appel superviseur      | Appelle M. Renaud si l'aléa est grave                    | Anxiété      | Interruption des deux parties. Aucune trace. Décision verbale non documentée.       |
| 4 | Suite                  | Continue sa *tournée*, espère se souvenir de revenir     | Incertitude  | Risque d'oubli. *Colis* « perdu dans le système ».                                  |

---

### Version TO-BE MVP

| # | Étape                      | Actions de Pierre                                                                 | Système DocuPost                                                                           | Émotions attendues | Domain Events                                         |
|---|----------------------------|-----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|--------------------|-------------------------------------------------------|
| 1 | Constat de l'aléa          | Sélectionne le *colis* dans la liste, appuie sur "Déclarer un échec"             | Affiche la liste des *motifs de non-livraison* normalisés.                                  | Guidé / Serein     | —                                                     |
| 2 | Saisie du motif            | Sélectionne le *motif* : absent, accès impossible, refus client, horaires dépassés | Enregistre le *motif* structuré avec horodatage et géolocalisation.                       | Rapide / Sans friction | **MotifEnregistré**, **ÉchecLivraisonDéclaré**    |
| 3 | Choix de la suite          | Indique la disposition : *à représenter*, dépôt chez *tiers*, retour dépôt       | Met à jour le statut du *colis*. Synchronise l'*événement* vers l'OMS.                    | Maîtrise           | **DispositionEnregistrée**, **SynchronisationOMS**   |
| 4 | Notification superviseur   | (Automatique) Le superviseur voit l'*incident* sur son tableau de bord            | Transmet l'*incident* au tableau de bord superviseur en temps réel.                       | Décharge mentale   | **IncidentNotifiéSuperviseur**                        |

---

**Domain Events identifiés (Parcours 3) :**
ÉchecLivraisonDéclaré, MotifEnregistré, DispositionEnregistrée, SynchronisationOMS,
IncidentNotifiéSuperviseur

**Termes du domaine captés :**
*motif de non-livraison*, *absent*, *accès impossible*, *refus client*, *horaires dépassés*,
*à représenter*, *tiers*, *disposition*, *incident*

---

## Parcours 4 — Livreur : Capturer une preuve de livraison

**Persona principal** : Pierre Morel (Livreur terrain)
**Déclencheur** : Client présent, livraison physique réussie, besoin de la tracer numériquement

---

### Version AS-IS (aujourd'hui)

| # | Étape                | Actions de Pierre                               | Pain points                                                                           |
|---|----------------------|-------------------------------------------------|---------------------------------------------------------------------------------------|
| 1 | Remise du colis      | Remet le *colis* au client                      | —                                                                                     |
| 2 | Signature papier     | Tend la feuille de *tournée*, fait signer le client | Feuille souvent sale ou mouillée. Signature illisible. Aucune valeur probante forte. |
| 3 | Note                 | Note « livré » sur la feuille                   | Non horodaté, non géolocalisé. Non disponible immédiatement pour le support client.  |

---

### Version TO-BE MVP

| # | Étape                      | Actions de Pierre                                                       | Système DocuPost                                                                              | Domain Events                          |
|---|----------------------------|-------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|----------------------------------------|
| 1 | Remise du colis             | Remet le *colis* au client                                              | —                                                                                             | —                                      |
| 2 | Capture de la preuve        | Choisit le type de *preuve* : signature numérique, photo, *tiers* identifié, *dépôt sécurisé* | Affiche le composant de capture adapté au type choisi.                   | —                                      |
| 3 | Signature numérique         | Le client signe sur l'écran de l'application                            | Capture la signature. Horodatage automatique. Géolocalisation.                                | **PreuveCapturée**                     |
| 4 | Validation                  | Confirme la livraison                                                   | Statut du *colis* passe à *livré*. *Événement* transmis à l'OMS en moins de 30 secondes.     | **LivraisonConfirmée**, **SynchronisationOMS** |

---

**Domain Events identifiés (Parcours 4) :**
PreuveCapturée, LivraisonConfirmée, SynchronisationOMS

**Termes du domaine captés :**
*preuve de livraison*, *signature numérique*, *tiers identifié*, *dépôt sécurisé*,
*horodatage*, *géolocalisation*, *livré*

---

## Parcours 5 — Superviseur : Envoyer une instruction à un livreur

**Persona principal** : Laurent Renaud (Responsable Exploitation Logistique)
**Déclencheur** : Laurent détecte un problème ou reçoit une demande urgente nécessitant
de modifier la *tournée* d'un livreur en cours de journée

---

### Version AS-IS (aujourd'hui)

| # | Étape              | Actions de Laurent                                   | Pain points                                                                    |
|---|--------------------|------------------------------------------------------|--------------------------------------------------------------------------------|
| 1 | Décision           | Décide d'ajouter un *colis* urgent ou de changer une priorité | —                                                                    |
| 2 | Appel téléphonique | Appelle le livreur, lui dicte l'*instruction*        | Interrompt le livreur en pleine livraison. Risque d'erreur d'écoute. Non tracé.|
| 3 | Suivi              | Attend le retour du livreur par téléphone            | Aucun suivi de l'exécution de l'*instruction*. Incertitude totale.             |

---

### Version TO-BE MVP

| # | Étape                      | Actions de Laurent                                                          | Système DocuPost                                                                           | Domain Events                              |
|---|----------------------------|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|--------------------------------------------|
| 1 | Identification du besoin    | Identifie le *colis* à prioriser depuis le détail de la *tournée*          | Affiche le *colis* avec son statut actuel et sa position dans la liste.                    | —                                          |
| 2 | Envoi de l'instruction      | Sélectionne l'action : prioriser, annuler, reprogrammer. Valide.           | Transmet l'*instruction* structurée au livreur via notification push. Historise l'action.  | **InstructionEnvoyée**                     |
| 3 | Réception par le livreur    | (Côté Pierre) Notification push reçue, liste de *colis* mise à jour        | Met à jour dynamiquement la liste de *colis* de Pierre.                                    | **InstructionReçue**, **TournéeModifiée**   |
| 4 | Confirmation d'exécution    | Laurent voit que Pierre a pris en compte l'*instruction*                    | Met à jour l'état de l'*instruction* sur le tableau de bord : envoyée → prise en compte.   | **InstructionExécutée**                    |

---

**Domain Events identifiés (Parcours 5) :**
InstructionEnvoyée, InstructionReçue, TournéeModifiée, InstructionExécutée

**Termes du domaine captés :**
*instruction*, *prioriser*, *annuler*, *reprogrammer*, *notification push*

---

## Glossaire terrain — Ubiquitous Language (brouillon)

> Ces termes doivent être transmis à l'Architecte Métier pour intégration dans le modèle
> de domaine (entités, événements, agrégats).

| Terme terrain            | Définition selon l'utilisateur                                                        | Contexte d'usage            |
|--------------------------|--------------------------------------------------------------------------------------|-----------------------------|
| Tournée                  | Ensemble des colis à livrer par un livreur sur une journée, organisé par zone        | Parcours 1, 2, 3, 4, 5      |
| Colis                    | Unité de livraison avec adresse, contraintes et statut évolutif                       | Tous les parcours            |
| Reste à livrer           | Nombre de colis non encore traités dans la tournée en cours                           | Parcours 1                  |
| Arrêt                    | Point géographique d'une livraison dans la tournée                                    | Parcours 1                  |
| Motif de non-livraison   | Raison normalisée d'un échec : absent, accès impossible, refus, horaires             | Parcours 1, 3               |
| À représenter            | Statut indiquant qu'une nouvelle tentative de livraison doit être planifiée           | Parcours 1, 3               |
| Preuve de livraison      | Élément numérique opposable capturé lors d'une livraison réussie                     | Parcours 1, 4               |
| Incident                 | Aléa terrain significatif déclaré par le livreur                                     | Parcours 3                  |
| Instruction              | Ordre structuré transmis par le superviseur au livreur via l'application              | Parcours 2, 5               |
| Tournée à risque         | Tournée dont l'avancement suggère un dépassement des délais contractuels              | Parcours 2                  |
| Avancement de tournée    | Indicateur temps réel du nombre de colis traités par rapport au total                 | Parcours 1, 2               |
| Tiers                    | Voisin ou personne identifiée chez qui un colis est déposé avec accord               | Parcours 3, 4               |
| Dépôt sécurisé           | Lieu de dépôt documenté et tracé en l'absence du destinataire                        | Parcours 3, 4               |
| Disposition              | Décision prise sur un colis en échec : à représenter, retour dépôt, tiers            | Parcours 3                  |
| Événement de livraison   | Fait métier immuable généré à chaque changement d'état significatif                   | Parcours 4, SI              |
| Synchronisation OMS      | Transmission d'un événement vers l'OMS via API REST en moins de 30 secondes          | Parcours 1, 3, 4            |
| Tableau de bord          | Vue agrégée des tournées en cours utilisée par le superviseur                        | Parcours 2                  |
| Alerte                   | Signal automatique notifiant le superviseur d'une tournée à risque                    | Parcours 2                  |
| Signature numérique      | Capture de la signature du client directement sur l'écran de l'application mobile    | Parcours 4                  |
| Notification push        | Message envoyé à l'application du livreur depuis le superviseur ou le système        | Parcours 1, 5               |
