# Features DocuPost (par Epic)

> Document de référence — Version 1.1 — 2026-04-02
> Mis à jour par le Product Owner suite aux wireframes v1.3 (design_web_designer.md).
> Produit à partir des livrables vision, UX et architecture métier.
> Chaque Feature correspond à une capacité fonctionnelle d'un Bounded Context.
> Les termes sont issus de l'Ubiquitous Language (/livrables/03-architecture-metier/domain-model.md).

---

## EPIC-007 : Planification et Préparation des Tournées (interface web logisticien)

### F-018 : Import et visualisation du plan du jour

**Description** : En tant que responsable logistique, je veux que les tournées du TMS
soient importées automatiquement chaque matin à 6h00 et visualisables dans un tableau
de bord, afin d'avoir une vue complète du plan du jour sans saisie manuelle.

**Capability** : 7.1 Import et réception des tournées TMS
**Screens couverts** : W-04 (Vue liste des tournées du matin)
**Domain Events** : TournéeImportéeTMS
**Priorité MoSCoW** : Must Have
**Dépendances** : Intégration TMS (H6), EPIC-006 (authentification)

User Stories rattachées :
- US-021 : Visualiser le plan du jour importé depuis le TMS

---

### F-019 : Vérification de la composition des tournées

**Description** : En tant que responsable logistique, je veux vérifier la composition
de chaque tournée (nombre de colis, zones, contraintes horaires) et être alerté des
anomalies, afin de détecter les problèmes avant le départ des livreurs.

**Capability** : 7.2 Vérification de composition (anomalies colis/zones/contraintes)
**Screens couverts** : W-05 (onglet Composition)
**Domain Events** : CompositionVérifiée
**Priorité MoSCoW** : Should Have

User Stories rattachées :
- US-022 : Vérifier la composition d'une tournée avant affectation

---

### F-020 : Affectation livreur et véhicule

**Description** : En tant que responsable logistique, je veux affecter un livreur et
un véhicule à chaque tournée depuis l'interface web, afin de tracer l'affectation dans
le SI et d'assurer que chaque tournée a les ressources nécessaires.

**Capability** : 7.3 Affectation livreur / véhicule par tournée
**Screens couverts** : W-05 (onglet Affectation)
**Domain Events** : AffectationEnregistrée
**Priorité MoSCoW** : Must Have
**Contraintes** : Un livreur / un véhicule par tournée par jour (invariants BC-07)

User Stories rattachées :
- US-023 : Affecter un livreur et un véhicule à une tournée
- US-034 : Afficher une suggestion de réaffectation après un échec de compatibilité véhicule

---

### F-021 : Lancement des tournées

**Description** : En tant que responsable logistique, je veux lancer une ou plusieurs
tournées depuis le tableau de bord, afin de les rendre visibles dans l'application
mobile des livreurs concernés.

**Capability** : 7.4 Lancement des tournées
**Screens couverts** : W-04 (bouton Lancer), W-05 (bouton Valider et lancer)
**Domain Events** : TournéeLancée → TournéeChargée (BC-01)
**Priorité MoSCoW** : Must Have
**Contraintes** : Une tournée ne peut être lancée que si elle a une affectation complète

User Stories rattachées :
- US-024 : Lancer une tournée pour la rendre visible au livreur

---

## EPIC-001 : Exécution de la Tournée (application mobile livreur)

### F-001 : Chargement et prise en main de la tournée

**Description** : Permettre au livreur de consulter, dès son authentification, la liste
complète des colis assignés pour la journée, organisée par zone géographique, avec
l'indicateur de reste à livrer et l'estimation de fin de tournée.

**Capability** : 1.1.1 Chargement de la tournée + 1.1.3 Suivi de progression
**Screens couverts** : M-02 (Liste des colis de la tournée)
**Domain Events** : TournéeChargée, TournéeDémarrée
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-001 : Consulter la liste des colis assignés à ma tournée
- US-002 : Suivre ma progression en temps réel (reste à livrer et estimation de fin)

---

### F-002 : Organisation des arrêts par zone

**Description** : Permettre au livreur de filtrer et trier dynamiquement la liste des
colis par zone géographique ou proximité, sans rechargement de la liste.

**Capability** : 1.1.2 Organisation des arrêts
**Screens couverts** : M-02 (onglets de filtre par zone)
**Domain Events** : aucun (navigation locale)
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-003 : Filtrer et organiser mes colis par zone géographique

---

### F-003 : Mise à jour du statut d'un colis

**Description** : Permettre au livreur de changer le statut d'un colis (livré, échec,
à représenter) en moins de 45 secondes depuis la liste de tournée, avec horodatage et
géolocalisation automatiques.

**Capability** : 1.2.2 Mise à jour du statut colis
**Screens couverts** : M-03 (Détail d'un colis)
**Domain Events** : LivraisonConfirmée, ÉchecLivraisonDéclaré
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-004 : Accéder au détail d'un colis et déclencher une action de livraison

---

### F-004 : Déclaration d'un échec de livraison avec motif normalisé

**Description** : Permettre au livreur de déclarer un échec de livraison en sélectionnant
un motif normalisé (absent, accès impossible, refus client, horaires dépassés) et en
choisissant la disposition du colis (à représenter, dépôt chez tiers, retour dépôt).

**Capability** : 1.3.1 Saisie du motif normalisé + 1.3.2 Choix de la disposition
**Screens couverts** : M-05 (Déclaration d'un échec de livraison)
**Domain Events** : ÉchecLivraisonDéclaré, MotifEnregistré, DispositionEnregistrée
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-005 : Déclarer un échec de livraison avec motif normalisé et disposition

---

### F-005 : Mode offline et synchronisation différée

**Description** : Permettre au livreur d'exécuter toutes les actions terrain (livraison,
échec, preuve) sans connexion réseau, stocker les événements localement et les rejouer
automatiquement dès le retour de connexion.

**Capability** : 1.3.3 Gestion du mode offline
**Screens couverts** : M-02 (indicateur de synchronisation), M-04, M-05
**Domain Events** : SynchronisationOMS (différée)
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-006 : Continuer à livrer en zone blanche et synchroniser dès le retour de connexion

---

### F-006 : Clôture de tournée

**Description** : Permettre au livreur de clôturer sa tournée une fois tous les colis
traités, avec affichage du récapitulatif (livrés, échecs, incidents) et déclenchement
de la synchronisation finale vers l'OMS.

**Capability** : 1.1.4 Clôture de tournée
**Screens couverts** : M-02 (bouton Clôturer)
**Domain Events** : TournéeClôturée, SynchronisationOMS
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-007 : Clôturer ma tournée et consulter le récapitulatif

---

## EPIC-002 : Capture et Accès aux Preuves de Livraison

### F-007 : Capture de la preuve de livraison

**Description** : Permettre au livreur de capturer une preuve de livraison numérique
opposable selon le type adapté à la situation : signature numérique, photo du colis
déposé, identification d'un tiers, description d'un dépôt sécurisé. Chaque preuve
est automatiquement horodatée et géolocalisée.

**Capability** : 2.1.1 à 2.1.5 (Capture de preuve — tous types)
**Screens couverts** : M-04 (Capture de la preuve de livraison)
**Domain Events** : PreuveCapturée, LivraisonConfirmée
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-008 : Capturer une signature numérique comme preuve de livraison
- US-009 : Capturer une photo ou identifier un tiers comme preuve de livraison
- US-046 : Integrer le pad de trace reel pour la capture de signature numerique dans M-04
  (Must Have — bloquant legal — remplace la dette technique pad simule de US-008)

---

### F-008 : Accès aux preuves par le support client

**Description** : Permettre au support client (DSI / Mme Dubois) de retrouver et
consulter la preuve d'une livraison en moins de 5 minutes à partir de l'identifiant
du colis.

**Capability** : 2.2.1 Consultation de preuve par le support
**Screens couverts** : interface web de consultation (support)
**Domain Events** : (lecture seule — aucun événement émis)
**Priorité MoSCoW** : Should Have

User Stories rattachées :
- US-010 : Consulter la preuve d'une livraison pour traiter un litige

---

## EPIC-003 : Supervision et Pilotage Temps Réel

### F-009 : Tableau de bord des tournées du jour

**Description** : Permettre au superviseur de visualiser en temps réel la liste de toutes
les tournées actives du jour avec l'avancement de chaque tournée, le statut et la dernière
activité, et de filtrer par statut (en cours, à risque, clôturées).

**Capability** : 3.1.1 Vue agrégée des tournées du jour + 3.1.3 Récapitulatif de fin
de journée
**Screens couverts** : W-01 (Tableau de bord des tournées)
**Domain Events affichés** : TournéeÀRisqueDétectée, AlerteDéclenchée, LivraisonConfirmée
(agrégés)
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-011 : Visualiser l'avancement de toutes les tournées du jour en temps réel
- US-035 : Rechercher une tournée par nom de livreur, code TMS ou zone géographique

---

### F-010 : Consultation du détail d'une tournée

**Description** : Permettre au superviseur de consulter le détail complet d'une tournée
sélectionnée : liste des colis avec statuts, incidents déclarés, motifs de non-livraison
et position du livreur.

**Capability** : 3.1.2 Détail d'une tournée
**Screens couverts** : W-02 (Détail d'une tournée)
**Domain Events affichés** : tous les événements de la tournée sélectionnée
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-012 : Consulter le détail d'une tournée avec statuts des colis et incidents

---

### F-011 : Détection automatique des tournées à risque

**Description** : Calculer en continu l'écart entre l'avancement réel et l'avancement
attendu de chaque tournée et déclencher automatiquement une alerte visuelle et sonore
sur le tableau de bord superviseur en moins de 15 minutes dès détection d'un risque.

**Capability** : 3.2.1 Calcul automatique d'écart de délai + 3.2.2 Déclenchement
d'alerte
**Screens couverts** : W-01 (bandeau alerte), W-02 (bandeau retard estimé)
**Domain Events** : TournéeÀRisqueDétectée, AlerteDéclenchée
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-013 : Recevoir une alerte automatique dès qu'une tournée est à risque de retard

---

### F-012 : Envoi d'une instruction structurée au livreur

**Description** : Permettre au superviseur de sélectionner un colis dans une tournée
active et d'envoyer au livreur une instruction normalisée (prioriser, annuler,
reprogrammer) avec suivi de son état d'exécution (envoyée, prise en compte, exécutée).

**Capability** : 3.3.1 Envoi d'instruction structurée + 3.3.2 Suivi de l'exécution
**Screens couverts** : W-03 (Panneau d'envoi d'instruction)
**Domain Events** : InstructionEnvoyée, InstructionExécutée
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-014 : Envoyer une instruction structurée à un livreur depuis le tableau de bord
- US-015 : Suivre l'état d'exécution d'une instruction envoyée à un livreur

---

## EPIC-004 : Notification et Messaging

### F-013 : Notification push d'instruction au livreur

**Description** : Livrer en temps réel une notification push au livreur lorsque le
superviseur envoie une instruction, avec affichage d'un bandeau overlay sur l'écran
courant de l'application mobile et mise à jour automatique de la liste de colis.
L'historique des consignes du jour est consultable depuis l'écran M-07 "Mes consignes"
(accessible depuis le header de M-02), avec badges de statut NOUVELLE / PRISE EN COMPTE /
EXÉCUTÉE, horodatage adaptatif et navigation vers le colis associé.

**Capability** : 4.1.1 Transmission d'instruction + 4.1.2 Notification d'ajout de colis
**Screens couverts** : M-06 (Notification d'instruction reçue), M-07 (Mes consignes — wireframe v1.3)
**Domain Events** : InstructionReçue, InstructionPriseEnCompte, TournéeModifiée
**Priorité MoSCoW** : Must Have
**Design** : /livrables/02-ux/wireframes.md#M-07, /livrables/02-ux/design_web_designer.md

User Stories rattachées :
- US-016 : Recevoir une notification push quand le superviseur modifie ma tournée
- US-037 : Accéder à l'historique des consignes superviseur reçues dans la journée
- US-042 : Afficher la date et l'heure d'émission de chaque consigne dans M-07

---

### F-014 : Alerte automatique superviseur sur tournée à risque

**Description** : Notifier le superviseur sur son tableau de bord (alerte visuelle +
sonore) à l'apparition d'une tournée à risque et lors de la déclaration d'un incident
terrain par un livreur.

**Capability** : 4.2.1 Alerte tournée à risque + 4.2.2 Alerte incident terrain
**Screens couverts** : W-01 (bandeau alerte, indicateur sonore)
**Domain Events** : AlerteDéclenchée, IncidentDéclaré (notifié)
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- (couvert par US-013 et US-012 — pas de US dédiée supplémentaire au MVP)

---

## EPIC-005 : Intégration SI et Historisation Immuable

### F-015 : Synchronisation des événements vers l'OMS

**Description** : Transmettre chaque changement de statut colis à l'OMS via API REST
en moins de 30 secondes, avec rejeu automatique des événements produits hors connexion
(zone blanche) dès le retour de connexion réseau.

**Capability** : 5.1.1 Émission d'événements normalisés + 5.1.2 Rejeu des événements
en échec
**Domain Events** : SynchronisationOMS (tous les événements terrain)
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-017 : Synchroniser automatiquement les événements de livraison vers l'OMS

---

### F-016 : Historisation immuable des événements de livraison

**Description** : Stocker chaque événement de livraison de façon immuable dans le
store d'événements avec les quatre attributs obligatoires (qui, quoi, quand,
géolocalisation), pour garantir l'auditabilité complète de chaque tournée.

**Capability** : 5.2.1 Store d'événements immuable + 5.2.2 Audit et traçabilité
**Domain Events** : tous les Domain Events significatifs
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-018 : Garantir l'historisation immuable de chaque événement de livraison

---

## EPIC-006 : Authentification et Accès

### F-017 : Connexion SSO corporate et contrôle d'accès par rôle

**Description** : Authentifier les livreurs (application mobile) et les superviseurs
(interface web) via OAuth2 / SSO corporate Docaposte et appliquer un contrôle d'accès
par rôle : livreur (accès mobile uniquement), superviseur (accès web uniquement).

**Capability** : 6.1.1 Connexion via SSO corporate + 6.1.2 Gestion des droits par rôle
**Screens couverts** : M-01 (Authentification mobile)
**Domain Events** : aucun (Generic Subdomain)
**Priorité MoSCoW** : Must Have

User Stories rattachées :
- US-019 : M'authentifier via mon compte Docaposte (SSO) depuis l'application mobile
- US-020 : M'authentifier via mon compte Docaposte (SSO) depuis l'interface web de
  supervision
- US-036 : Masquer automatiquement la card explicative SSO après la première connexion réussie

---

---

## EPIC-008 : Qualite UX et Accessibilite

> Epic creee le 2026-04-01 suite aux feedbacks terrain Pierre Morel et Laurent Renaud.
> Couvre les ajustements de langage et les affordances visuelles qui ameliorent
> l'adoption sans modifier de comportement fonctionnel.

### F-022 : Harmonisation du langage de l'interface avec l'Ubiquitous Language terrain

**Description** : En tant qu'utilisateur (livreur ou superviseur), je veux que les libelles
affiches correspondent aux termes que j'utilise naturellement sur le terrain, afin de reduire
la charge cognitive et les erreurs d'interpretation en conditions reelles.

**Capability** : Transverse (UX — tous BC)
**Screens couverts** : M-02, M-07, W-05, W-01
**Domain Events** : aucun (corrections de libelles uniquement)
**Priorite MoSCoW** : Should Have
**Dependances** : US-003 (filtre zone), US-028 (export), US-030 (compatibilite), US-035 (recherche), US-037 (consignes)

User Stories rattachees :
- US-038 : Harmoniser les libelles de l'interface avec le langage naturel terrain

---

## EPIC-003 : Supervision et Pilotage Temps Reel (complement post-feedback)

> Features supplementaires identifiees lors des feedbacks terrain du 2026-04-01.

### F-023 : Bilan de fin de journee exportable depuis le tableau de bord

**Description** : En tant que superviseur logistique, je veux telecharger un fichier CSV
de toutes les tournees du jour depuis W-01, afin de produire mon rapport de fin de journee
en une action depuis le tableau de bord.

**Capability** : 3.1.3 Recapitulatif de fin de journee
**Screens couverts** : W-01 (Tableau de bord)
**Domain Events** : (lecture seule — aucun evenement emis)
**Priorite MoSCoW** : Should Have
**Dependances** : US-032 (synchronisation read model VueTournee)

User Stories rattachees :
- US-039 : Telecharger le bilan des tournees du jour depuis le tableau de bord

---

### F-024 : Enrichissement du CSV de composition avec statuts de livraison

**Description** : En tant que superviseur logistique, je veux que le fichier CSV exporte
depuis le detail d'une tournee inclue le nom du destinataire et le statut final de chaque
colis, afin de l'utiliser directement pour mes rapports sans saisie complementaire.

**Capability** : 7.2 Verification de composition (enrichissement colonnes)
**Screens couverts** : W-05 (onglet Composition)
**Domain Events** : CompositionExportee (enrichi)
**Priorite MoSCoW** : Should Have
**Dependances** : US-028 (export CSV composition)

User Stories rattachees :
- US-040 : Enrichir le CSV exporte avec le nom du destinataire et le statut final

---

### F-025 : Indicateur de poids et alerte de surcharge dans le tableau de preparation

**Description** : En tant que superviseur logistique, je veux voir le poids estime de
chaque tournee directement dans le tableau de preparation W-04 avec une alerte visuelle
si ce poids depasse la capacite vehicule, afin de detecter les surcharges sans ouvrir
chaque detail.

**Capability** : 7.2 Verification de composition + 7.3 Affectation vehicule
**Screens couverts** : W-04 (tableau de preparation)
**Domain Events** : reference a CompatibiliteVehiculeEchouee (lecture)
**Priorite MoSCoW** : Should Have
**Dependances** : US-023 (affectation vehicule), US-030 (compatibilite vehicule)

User Stories rattachees :

- US-041 : Afficher le poids estime et une alerte de surcharge dans le tableau de preparation

---

### F-026 : Compteur de duree de deconnexion WebSocket dans le bandeau superviseur

**Description** : En tant que superviseur logistique, je veux voir depuis combien de temps
la connexion temps reel est indisponible dans le bandeau d'alerte, afin d'evaluer l'impact
sur la fraicheur de mes donnees.

**Capability** : 3.1.1 Vue agregee des tournees du jour (resilience WebSocket)
**Screens couverts** : W-01 (bandeau OFFLINE / POLLING)
**Domain Events** : aucun (etat local navigateur)
**Priorite MoSCoW** : Should Have
**Dependances** : US-032 (synchronisation read model)

User Stories rattachees :

- US-044 : Afficher un compteur de duree de deconnexion WebSocket dans le bandeau superviseur

---

## EPIC-004 : Notification et Messaging (complement post-feedback)

### F-027 : Horodatage des consignes dans l'historique livreur

**Description** : En tant que livreur terrain, je veux voir la date et l'heure d'emission
de chaque consigne dans M-07, afin de savoir laquelle est la plus recente et de prioriser
mon attention.

**Capability** : 4.1.2 Notification et historique (enrichissement affichage)
**Screens couverts** : M-07 (Mes consignes)
**Domain Events** : aucun (enrichissement lecture seule du Read Model)
**Priorite MoSCoW** : Should Have
**Dependances** : US-037 (historique consignes livreur)

User Stories rattachees :
- US-042 : Afficher la date et l'heure d'emission de chaque consigne dans M-07

---

## EPIC-006 : Authentification et Acces (complement post-feedback)

### F-028 : Repliage manuel de la card SSO avant toute connexion

**Description** : En tant que livreur terrain, je veux pouvoir replier la card SSO des
la premiere ouverture, avant de me connecter, afin d'acceder directement au bouton de
connexion quand j'ai deja mes identifiants en main. La card presente un chevron haut [^]
visible en etat etendu (par defaut) et un chevron bas [v] en etat replie. Le bouton
"Se connecter" reste accessible a tout moment, quel que soit l'etat de la card.

**Capability** : 6.1.1 Connexion SSO (UX onboarding)
**Screens couverts** : M-01 (Connexion mobile — wireframe v1.3)
**Domain Events** : aucun
**Priorite MoSCoW** : Should Have
**Dependances** : US-036 (card SSO retractable apres connexion)
**Design** : /livrables/02-ux/wireframes.md#M-01, /livrables/02-ux/design_web_designer.md

User Stories rattachees :

- US-043 : Permettre de replier la card SSO des la premiere ouverture avant toute connexion

---

## EPIC-001 : Execution de la Tournee (complement post-feedback)

### F-029 : Hint visuel de decouverte du swipe pour les nouveaux utilisateurs

**Description** : En tant que livreur qui utilise l'application pour la premiere fois, je
veux voir une indication visuelle sur les cartes colis pour decouvrir le geste swipe gauche,
afin d'adopter la fonctionnalite de declaration rapide d'echec sans formation prealable.
Le hint affiche le texte exact "← Glissez vers la gauche pour declarer un probleme" sous
chaque carte colis, disparait apres 3 utilisations reussies (seuil configurable), et inclut
une option de micro-animation fremissement 8px au premier chargement.

**Capability** : 1.3.1 Saisie du motif normalise (onboarding gestuel)
**Screens couverts** : M-02 (liste des colis — wireframe v1.3)
**Domain Events** : aucun (affordance visuelle uniquement)
**Priorite MoSCoW** : Could Have
**Dependances** : US-029 (swipe rapide echec livraison)
**Design** : /livrables/02-ux/wireframes.md#M-02, /livrables/02-ux/design_web_designer.md

User Stories rattachees :

- US-045 : Afficher un hint visuel de decouverte du swipe pour les nouveaux utilisateurs

---

## EPIC-003 : Supervision et Pilotage Temps Reel (ajout 2026-04-21)

### F-030 : Broadcast superviseur vers livreurs actifs

**Description** : Permettre au superviseur d'envoyer en moins de 3 clics un message
operationnel (alerte, information, consigne) vers tous ses livreurs actifs ou vers les
livreurs d'un secteur predéfini, depuis le tableau de bord web (W-09 panneau lateral).
Les livreurs recoivent la notification push (FCM, app arriere-plan incluse) et peuvent
consulter les messages dans la zone dediee M-08 de l'application mobile. Le superviseur
suit en temps reel combien de livreurs ont vu chaque message depuis l'historique du jour
dans W-09.

**Capability** : 3.5.1 Envoi de broadcast groupe / 3.5.2 Ciblage par secteur /
3.5.3 Suivi de lecture / 3.5.4 Historique broadcasts du jour / 3.5.5 Reception et
consultation livreur
**Screens couverts** : W-09 (panneau superviseur web), M-08 (zone messages livreur mobile),
overlay broadcast sur M-02/M-03/M-04/M-05
**Domain Events** : BroadcastEnvoye, BroadcastVu
**Priorite MoSCoW** : Must Have
**Bounded Context** : BC-03 Supervision (Aggregate BroadcastMessage), BC-04 Notification
**Contraintes** : ENF-BROADCAST-001 a 006, DD-012 (BroadcastVu REST), DD-013 (FCM
sendEachForMulticast), DD-014 (secteurs config statique)
**Dépendances** : US-057 (WebSocket STOMP — temps reel), US-016 (FCM adapter), US-049
(referentiel livreurs dev)

User Stories rattachees :

- US-067 : Envoyer un broadcast a ses livreurs actifs depuis le tableau de bord (Must Have / M)
- US-068 : Recevoir et consulter les messages broadcast sur l'application mobile (Must Have / M)
- US-069 : Consulter les statuts de lecture des broadcasts envoyes (Must Have / S)

---

## Récapitulatif des Features par priorité MoSCoW

| Feature | Epic | Priorité | Périmètre |
|---------|------|----------|-----------|
| F-001 : Chargement et prise en main de la tournée | EPIC-001 | Must Have | MVP |
| F-002 : Organisation des arrêts par zone | EPIC-001 | Must Have | MVP |
| F-003 : Mise à jour du statut d'un colis | EPIC-001 | Must Have | MVP |
| F-004 : Déclaration d'un échec avec motif normalisé | EPIC-001 | Must Have | MVP |
| F-005 : Mode offline et synchronisation différée | EPIC-001 | Must Have | MVP |
| F-006 : Clôture de tournée | EPIC-001 | Must Have | MVP |
| F-007 : Capture de la preuve de livraison | EPIC-002 | Must Have | MVP |
| F-008 : Accès aux preuves par le support client | EPIC-002 | Should Have | MVP |
| F-009 : Tableau de bord des tournées du jour | EPIC-003 | Must Have | MVP |
| F-010 : Consultation du détail d'une tournée | EPIC-003 | Must Have | MVP |
| F-011 : Détection automatique des tournées à risque | EPIC-003 | Must Have | MVP |
| F-012 : Envoi d'une instruction structurée | EPIC-003 | Must Have | MVP |
| F-013 : Notification push d'instruction | EPIC-004 | Must Have | MVP |
| F-014 : Alerte automatique superviseur | EPIC-004 | Must Have | MVP |
| F-015 : Synchronisation des événements vers l'OMS | EPIC-005 | Must Have | MVP |
| F-016 : Historisation immuable des événements | EPIC-005 | Must Have | MVP |
| F-017 : Connexion SSO et contrôle d'accès par rôle | EPIC-006 | Must Have | MVP |
| F-022 : Harmonisation du langage de l'interface | EPIC-008 | Should Have | Post-MVP Sprint 6 |
| F-023 : Bilan de fin de journee exportable (W-01) | EPIC-003 | Should Have | Post-MVP Sprint 6 |
| F-024 : Enrichissement CSV colonnes statut/destinataire | EPIC-007 | Should Have | Post-MVP Sprint 6 |
| F-025 : Poids estimé et alerte surcharge dans W-04 | EPIC-007 | Should Have | Post-MVP Sprint 6 |
| F-026 : Compteur duree deconnexion WebSocket | EPIC-003 | Should Have | Post-MVP Sprint 6 |
| F-027 : Horodatage consignes dans M-07 | EPIC-004 | Should Have | Post-MVP Sprint 6 |
| F-028 : Repliage card SSO avant connexion | EPIC-006 | Should Have | Post-MVP Sprint 6 |
| F-029 : Hint visuel swipe onboarding | EPIC-001 | Could Have | Post-MVP Sprint 7 |
| F-030 : Broadcast superviseur vers livreurs actifs | EPIC-003 | Must Have | MVP |
