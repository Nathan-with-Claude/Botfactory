# Design Brief — Consignes Fonctionnelles pour le Designer Figma

> Document destiné au designer Figma.
> Produit par @ux — 2026-03-25.
> Ce document est autonome : il contient l'intégralité des informations nécessaires
> pour créer les maquettes sans consulter le backlog ni les wireframes textuels.
>
> Source : wireframes.md v2.0, personas.md, user-journeys.md, backlog US-001 à US-030,
> design-system.md v1.0.

---

## 1. Contexte produit

### Le produit

DocuPost est une plateforme de gestion de tournées de livraison pour La Docaposte. Elle
couvre deux rôles complémentaires : les livreurs terrain qui exécutent les tournées, et
les responsables logistiques / superviseurs qui préparent et pilotent ces tournées depuis
un bureau.

Le problème central que DocuPost résout est la rupture de traçabilité entre le terrain et
le SI : aujourd'hui les livreurs travaillent avec une feuille de route papier, les
superviseurs pilotent par téléphone sans visibilité en temps réel, et les preuves de
livraison sont difficiles à retrouver en cas de litige.

### Les utilisateurs cibles

Deux personas principaux, un seul utilisateur web :

**Pierre Morel — Livreur terrain**
- 35 ans, VRP de tournée, 80 à 120 colis par jour.
- Smartphone Android (fourni par l'entreprise), utilisation mobile exclusive.
- Contexte d'usage : en mouvement, sol mouillé, soleil direct sur l'écran, parfois avec
  des gants. Connectivité variable (zones péri-urbaines à couverture réduite).
- Objectif quotidien : livrer ses colis le plus vite possible avec un minimum de friction
  administrative. Tolérance zéro aux formulaires complexes. Chaque action doit être
  réalisable en moins de 45 secondes.
- Frustrations actuelles : feuille de route mouillable, abréviations personnelles non
  exploitables, appels téléphoniques du superviseur au mauvais moment.

**Laurent Renaud — Responsable Exploitation Logistique / Superviseur**
- 48 ans, responsable d'un dépôt régional, gère 10 à 15 livreurs par jour.
- Poste fixe web, écran 1280px minimum. Deux moments de la journée avec des contextes
  différents :
  - Le matin (6h00–8h00) : préparation des tournées, affectation des livreurs et véhicules,
    lancement. Contrainte de temps forte : moins de 30 minutes pour tout préparer.
  - La journée (8h00–18h00) : supervision en temps réel, détection des tournées à risque,
    envoi d'instructions aux livreurs.
- Frustrations actuelles : pilotage à l'aveugle, détection tardive des retards, appels
  téléphoniques non tracés, preuves introuvables en cas de litige.

### Contexte technique

- Application mobile : React Native, Android (prioritaire), iOS (secondaire).
- Interface web de supervision : React, navigateur desktop, grille 1280px.
- Mode offline obligatoire sur mobile : toutes les actions doivent être exécutables sans
  réseau, avec synchronisation automatique au retour de connexion.
- Authentification : SSO corporate OAuth2 (Docaposte) pour les deux interfaces.

---

## 2. Les deux interfaces à concevoir

### Interface A — Application mobile livreur

**Objectif principal** : Permettre à Pierre de gérer sa tournée du jour de façon autonome
et rapide, depuis la prise en main des colis le matin jusqu'à la clôture de la tournée
en fin de journée.

**Contexte d'utilisation** : Smartphone Android, usage en extérieur, une seule main,
en mouvement. La lumière directe du soleil, les mains mouillées ou gantées sont des
contraintes réelles. L'écran peut être lu à bout de bras.

**Contraintes d'usage critiques** :
- Taille minimale de texte corps : 16px (lisibilité soleil / gant).
- Touch target minimum absolu : 48x48px pour tout élément interactif.
- Toutes les actions doivent être réalisables d'une seule main.
- Mode offline-first : l'application fonctionne sans réseau. Un indicateur permanent
  (badge LIVE / OFFLINE) est visible sur chaque écran principal.
- Pas de formulaires longs : maximum 2 choix obligatoires par écran d'action.
- Retour automatique vers la liste des colis après toute action (livraison, échec, preuve).

**Plateforme cible** : Android natif (grille 375px, safe area respectée, notch géré).

---

### Interface B — Application web superviseur / logisticien

**Objectif principal** : Permettre à Laurent de préparer les tournées du matin en moins
de 30 minutes et de piloter en temps réel la flotte pendant la journée sans passer par
le téléphone.

**Contexte d'utilisation** : Poste fixe bureau, grand écran 1280px, connexion réseau
stable, utilisation assise et posée. Deux modes d'usage selon l'heure :
- Mode "préparation" (6h00–8h00) : tableaux, formulaires, affectation rapide.
- Mode "supervision" (8h00–18h00) : tableau de bord en temps réel, alertes, instructions.

**Contraintes d'usage critiques** :
- La détection d'une tournée à risque doit être possible en moins de 5 secondes de lecture
  de l'écran (hiérarchie visuelle très forte sur les statuts critiques).
- Les données temps réel sont mises à jour via WebSocket. Un badge permanent indique
  l'état de la connexion (LIVE vert / POLLING orange / OFFLINE rouge).
- Grille 12 colonnes, gouttière 24px, largeur référence 1280px.
- Les actions irréversibles (lancement d'une tournée, envoi d'instruction) déclenchent
  une dialog de confirmation.

---

## 3. Liste des écrans à créer

### Interface web — Responsable logistique (Parcours 0 — Préparation du matin)

---

#### Ecran W-04 : Vue liste des tournées du matin (Plan du jour)

**Route** : `/preparation`
**User Stories associées** : US-021 (Visualiser le plan du jour), US-024 (Lancer une tournée)

**Fonctionnalités attendues** :
- Afficher la liste de toutes les tournées importées depuis le TMS pour la journée en cours.
- Pour chaque tournée : code tournée, nombre de colis, zones couvertes, statut d'affectation,
  livreur affecté (si affecté), véhicule affecté (si affecté), actions disponibles.
- Bandeau de synthèse en haut avec les compteurs : nombre de tournées non affectées,
  affectées, lancées.
- Filtres rapides par statut : Toutes / Non affectées / Affectées / Lancées.
- Champ de recherche par code de tournée.
- Bouton "Rafraîchir depuis TMS" pour déclencher un réimport manuel.
- Bouton "Lancer toutes les tournées" (visible uniquement si toutes les tournées sont
  affectées et aucune n'est encore lancée).
- Bouton "Lancer" par ligne de tournée (visible uniquement si la tournée est affectée).
- Bouton "Affecter" par ligne de tournée (visible uniquement si la tournée n'est pas
  encore affectée).
- Lien "Voir le détail" par ligne de tournée.
- Indication visuelle d'anomalie sur les tournées avec surcharge de colis (icône ⚠ +
  tooltip descriptif).
- Pagination "Charger plus" avec compteur "Affichage X / Y".

**Données affichées par ligne de tournée** :
- Code TMS de la tournée (ex : T-201)
- Nombre de colis (ex : 34 colis)
- Zone(s) principale(s) (ex : Lyon 3e, Lyon 6e)
- Badge statut : NON AFFECTEE (rouge) / AFFECTEE (vert) / LANCEE (bleu)
- Nom du livreur affecté + identifiant véhicule (si affectée)
- Icône ⚠ si anomalie de charge détectée

**Actions utilisateur** :
- Clic "Affecter" → navigation vers W-05 onglet Affectation.
- Clic "Voir le détail" → navigation vers W-05 onglet Composition (lecture seule).
- Clic "Lancer →" → dialog de confirmation "Lancer T-202 pour P. Morel ? Action
  irréversible." avec boutons [Annuler] et [Confirmer le lancement]. Déclenche
  l'événement TourneeLancée.
- Clic "Lancer toutes les tournées" → dialog de confirmation avec récapitulatif.
- Clic sur un chip de compteur (bandeau) → active le filtre correspondant.
- Clic "Rafraîchir depuis TMS" → indicateur de chargement, mise à jour du tableau.

**Règles métier visibles** :
- Le bouton "Lancer →" est désactivé pour les tournées non affectées.
- Le bouton "Lancer toutes les tournées" est absent si au moins une tournée n'est pas
  affectée.
- Les lignes de tournées lancées passent en lecture seule (opacité réduite, pas
  d'actions de modification).
- Le bandeau de synthèse passe en fond orange si le nombre de tournées non affectées
  est supérieur à zéro.
- Une tournée avec anomalie de charge affiche la ligne surlignée en orange clair +
  bordure gauche 4px orange.

**États à couvrir** :
- Etat normal : tableau avec tournées mixtes (non affectées, affectées, lancées).
- Import TMS non reçu : tableau vide + illustration + message "Aucune tournée importée
  pour aujourd'hui." + bouton "Forcer l'import".
- Import TMS échoué (3 tentatives) : alerte critique + lien vers saisie manuelle de
  secours. L'alerte doit apparaître avant 6h45.
- Toutes les tournées lancées : bandeau vert "Toutes les tournées ont été lancées." +
  animation discrète.
- Chargement initial : skeleton du tableau (5 lignes fantômes animées).
- Recherche sans résultat : message + lien "Réinitialiser les filtres".
- Perte de connexion serveur : bandeau rouge fixe en haut avec horodatage de la
  dernière synchronisation.

---

#### Ecran W-05 : Détail d'une tournée à préparer (Vérification et affectation)

**Route** : `/preparation/tournee/:id`
**User Stories associées** : US-022 (Vérifier la composition), US-023 (Affecter livreur /
véhicule), US-024 (Lancer la tournée), US-028 (Exporter CSV), US-030 (Vérification
compatibilité véhicule)

**Fonctionnalités attendues** :
Ecran à deux onglets : "Composition" et "Affectation".

**Onglet Composition :**
- Fil d'Ariane : Plan du jour > Tournée T-203.
- Badge statut en titre (NON AFFECTEE / AFFECTEE / LANCEE).
- Indicateur d'anomalie ⚠ visible dans le titre si anomalie détectée.
- Zones couvertes avec proportion de colis par zone (barres de progression).
- Contraintes horaires : liste des créneaux obligatoires (avant 10h00, avant 12h00...).
- Contraintes de type : indication "colis fragile".
- Encadré anomalie (si présente) : description détaillée de l'anomalie de charge +
  recommandation de vérification.
- Récapitulatif : poids estimé, durée estimée, distance estimée.
- Liste des colis avec colonnes : identifiant, adresse, zone, contrainte.
- Filtrage de la liste par zone ou contrainte via champ de recherche.
- Bouton "Exporter CSV" pour la liste des colis.
- Bouton "Voir tous les X colis" si la liste est tronquée (affiche les 3 premiers par
  défaut).

**Onglet Affectation :**
- Sélecteur de livreur disponible : dropdown avec nombre de livreurs disponibles affiché.
  Les livreurs déjà affectés à une autre tournée du jour sont visibles mais grisés et
  non sélectionnables, avec mention "Indisponible — T-XXX".
- Sélecteur de véhicule disponible : se déverrouille après sélection du livreur. Affiche
  la capacité du véhicule.
- Vérification de compatibilité : alerte si le poids estimé de la tournée dépasse la
  capacité du véhicule sélectionné.
- Champ "Remarque interne" (optionnel, 200 caractères max) : non transmis au livreur,
  pour usage interne logistique uniquement.
- Bouton "Valider l'affectation" (secondaire).
- Bouton "Valider et lancer la tournée" (primaire).
- Si anomalie non acquittée : le libellé du bouton de lancement devient "Lancer malgré
  l'anomalie ⚠" avec style avertissement.

**Données affichées** :
- Code de la tournée, statut, date d'import TMS, heure d'import.
- Nombre de colis total.
- Zones : liste + pourcentages.
- Contraintes horaires et de type.
- Pour chaque colis : identifiant, adresse complète, zone, contrainte (chip visuel).
- Compteurs disponibilité : "X livreurs disponibles (Y en service aujourd'hui)".

**Actions utilisateur** :
- Bascule d'onglet Composition / Affectation (sans rechargement).
- Sélection livreur → affiche sa charge du jour.
- Sélection véhicule → vérifie compatibilité avec la charge de la tournée.
- "Valider l'affectation" → toast succès + retour automatique vers W-04 après 1,5s.
- "Valider et lancer" → dialog de confirmation → événements AffectationEnregistrée puis
  TourneeLancée → toast + retour W-04.
- Retour sans sauvegarde → dialog "Abandonner les modifications ?" si modifications en cours.

**Règles métier visibles** :
- Les boutons "Valider l'affectation" et "Valider et lancer" sont désactivés tant que
  le livreur ET le véhicule ne sont pas sélectionnés.
- Un livreur déjà affecté à une autre tournée du même jour ne peut pas être sélectionné.
- Un véhicule déjà affecté ne peut pas être sélectionné.
- Si la tournée est déjà lancée : onglet Affectation remplacé par récapitulatif en lecture
  seule "Lancée le 20/03 à 06h45 — P. Morel / VH-07".
- Le bouton de lancement mentionne l'anomalie si elle n'a pas été acquittée.

**États à couvrir** :
- Etat normal : onglet Composition avec données, onglet Affectation avec sélecteurs actifs.
- Aucun livreur disponible : message inline "Aucun livreur disponible. Vérifiez les
  présences du matin." Boutons désactivés.
- Aucun véhicule disponible : message inline similaire.
- Tournée déjà lancée : onglet Affectation en lecture seule avec récapitulatif.
- Anomalie présente : encadré alerte orange visible dans Composition, libellé bouton
  lancement modifié dans Affectation.
- Chargement initial : skeleton deux colonnes + tableau skeleton.

---

### Interface web — Superviseur (Parcours 2 — Pilotage journée)

---

#### Ecran W-01 : Tableau de bord superviseur

**Route** : `/supervision`
**User Stories associées** : US-011 (Visualiser l'avancement), US-013 (Alerte tournée à
risque)

**Fonctionnalités attendues** :
- Vue agrégée en temps réel de toutes les tournées du jour.
- Bandeau de synthèse : nombre de tournées actives, clôturées, à risque. Mis à jour en
  temps réel.
- Badge d'état de la connexion : LIVE (point vert animé) si WebSocket actif, POLLING
  (orange) si fallback polling 30s, OFFLINE (rouge) si connexion perdue.
- Horodatage "Dernière mise à jour : il y a Xs".
- Bouton "Rafraîchir" manuel.
- Alerte sonore discrète au déclenchement d'une alerte (activable/désactivable).
- Filtres par statut : Toutes / En cours / A risque / Clôturées.
- Champ de recherche par nom de livreur.
- Tableau des tournées avec les colonnes : Livreur, Tournée, Avancement (barre + %),
  Statut (badge coloré), Activité (relatif, ex : "il y a 3 min"), Actions.
- Barre de progression par tournée avec couleur selon statut (bleu = en cours,
  orange = à risque, vert = clôturée).
- Mise en surbrillance automatique des tournées à risque (fond orange clair, bordure
  gauche 4px orange).
- Badge rouge clignotant sur les tournées à risque.
- Bouton "Voir" par ligne pour accéder au détail W-02.
- Tri automatique : tournées à risque affichées en premier.
- Pagination "Charger plus".

**Données affichées par ligne** :
- Nom du livreur (ex : P. Morel).
- Code tournée (ex : T-042).
- Barre de progression : X colis traités / Y total + pourcentage.
- Badge statut : EN COURS (bleu) / A RISQUE (rouge clignotant) / CLOTUREE (vert).
- Retard estimé si à risque (ex : "⚠ Retard 45min").
- Dernière activité (ex : "il y a 3 min" — passe rouge si > 15 min, rouge foncé si > 30 min).

**Actions utilisateur** :
- Clic [Voir] → navigation vers W-02.
- Clic sur filtre "A risque" → réordonne le tableau.
- Toggle alerte sonore dans le header utilisateur.
- Clic chip compteur dans le bandeau → active le filtre.

**Règles métier visibles** :
- Le bandeau passe en fond orange si au moins une tournée est à risque.
- L'alerte sonore se déclenche une seule fois par nouvelle alerte (pas en boucle).
- Une tournée clôturée n'a plus de bouton d'instruction et la ligne est grisée.
- Si silence livreur > 15 min : colonne "Activité" passe orange.
- Si silence livreur > 30 min : colonne "Activité" passe rouge + mention "Aucune
  activité depuis Xmin".

**États à couvrir** :
- Etat normal : tableau mixte avec tournées en cours, à risque, clôturées.
- Aucune tournée active : illustration neutre + "Aucune tournée en cours pour aujourd'hui."
- Perte de connexion WebSocket : bandeau rouge fixe + timestamp dernière synchronisation.
- Plusieurs alertes simultanées : toutes les tournées à risque en tête du tableau.
- Chargement initial : skeleton du tableau.
- Animation : flash léger sur la cellule mise à jour en temps réel.

---

#### Ecran W-02 : Détail d'une tournée (supervision)

**Route** : `/supervision/tournee/:id`
**User Stories associées** : US-012 (Détail tournée), US-013 (Alerte à risque sur détail),
US-014 (Accès au panneau d'instruction), US-015 (Suivi exécution instruction)

**Fonctionnalités attendues** :
- Fil d'Ariane : Supervision > Tournée T-043.
- Sous-titre : nom du livreur + identifiant du véhicule.
- Bandeau de statut : badge statut prominent (A RISQUE / EN COURS / CLOTUREE), barre de
  progression pleine largeur, retard estimé si > 0, indicateur d'activité livreur
  (dernière action, relatif).
- Badge livreur hors ligne si applicable.
- Indicateur WebSocket en bas de tableau.
- Trois onglets : Carte / Liste colis / Incidents.

**Onglet Liste colis :**
- Sous-filtres : Tous / A livrer / Livrés / Echecs.
- Champ de recherche par identifiant de colis.
- Pour chaque colis : identifiant, adresse, badge statut, horodatage si livré ou échoué,
  motif si échec, bouton [Instruction] si statut "à livrer".
- Mise à jour en temps réel du statut de chaque colis via WebSocket.

**Onglet Incidents :**
- Liste des incidents déclarés par le livreur : identifiant colis, adresse, motif,
  horodatage, note livreur si saisie.
- Badge numérique sur l'onglet (ex : "Incidents · 2").
- Chaque incident ouvre un panneau latéral (drawer 480px) avec le détail complet.

**Onglet Carte :**
- Vue cartographique avec position GPS du livreur en temps réel.
- Arrêts colorés selon statut (livré vert, à livrer bleu, échec rouge).
- NOTE pour le designer : cet onglet est en scope MVP mais sa maquette peut être
  simplifiée en V1 (placeholder cartographique acceptable).

**Données affichées** :
- Avancement : "X / Y colis — Z % — Retard estimé : Xmin" si à risque.
- Barre de progression en couleur sémantique.
- "Dernière activité livreur : il y a Xmin".
- Pour chaque colis "A livrer" : bouton [Instruction] actif.
- Pour chaque colis "Livré" : badge vert + horodatage.
- Pour chaque colis "Echec" : badge rouge + motif affiché sous le badge.

**Actions utilisateur** :
- Clic [Instruction] sur un colis → ouvre le modal W-03 avec le colis pré-rempli.
- Bascule d'onglet Carte / Liste / Incidents.
- Clic sur un incident → ouvre le drawer latéral de détail.
- Filtrage par statut de colis.
- Recherche par identifiant de colis.
- Retour vers W-01 via le fil d'Ariane.

**Règles métier visibles** :
- Le bouton [Instruction] est absent ou désactivé pour les colis au statut "Livré" ou "Echec".
- Tous les boutons [Instruction] sont désactivés si la tournée est clôturée.
- Si le livreur est hors ligne, un badge orange "Hors ligne" est affiché + mention de la
  dernière heure de contact.

**États à couvrir** :
- Etat normal : tournée en cours avec mix de colis (à livrer, livrés, échecs).
- Tournée à risque : bandeau alerte prominent, barre de progression orange.
- Tournée clôturée : bandeau vert "Clôturée à HH:MM ✓", boutons désactivés, données
  consultables.
- Livreur hors ligne : badge orange + horodatage dernier contact.
- Aucun colis dans un filtre : "Aucun colis pour ce filtre." + bouton "Tout afficher".
- Drawer incident ouvert : panneau latéral 480px avec motif, horodatage, note.

---

#### Ecran W-03 : Panneau d'envoi d'une instruction (modal)

**Route** : Modal par-dessus W-02 (pas de route propre)
**User Stories associées** : US-014 (Envoyer une instruction), US-015 (Suivi exécution)

**Fonctionnalités attendues** :
- Modal centré, largeur 540px, fond overlay translucide.
- En-tête : titre "Envoyer une instruction" + contexte (tournée + livreur) + bouton de
  fermeture ✕.
- Bloc "Colis concerné" : fiche lecture seule avec identifiant et adresse (pré-rempli
  depuis W-02).
- Sélecteur de type d'instruction : 3 cards cliquables en grille.
  - Card "Prioriser ce colis" (icône flèche haut).
  - Card "Annuler la livraison" (icône croix).
  - Card "Reprogrammer" (icône rotation).
- Champ conditionnel "Créneau cible" (date + heure) : apparaît uniquement si le type
  "Reprogrammer" est sélectionné.
- Champ "Message complémentaire" : optionnel, 200 caractères max, avec compteur restant.
- Bouton "Annuler" (secondaire).
- Bouton "ENVOYER L'INSTRUCTION" (primaire) — désactivé tant qu'aucun type n'est
  sélectionné.

**Données affichées** :
- Identifiant du colis (ex : #00312).
- Adresse du colis (ex : 25 Rue Victor Hugo, Lyon 3e).
- Tournée et livreur en contexte (ex : Tournée T-043 · L. Petit).
- Compteur de caractères du message (X / 200).

**Actions utilisateur** :
- Clic sur une card type d'instruction → sélection unique (les autres cards se désactivent).
- Sélection "Reprogrammer" → champ date/heure requis apparaît.
- Saisie du message complémentaire.
- [ENVOYER] → toast "Instruction envoyée à L. Petit." + fermeture automatique du modal.
- [Annuler] ou clic en dehors → fermeture sans action (si aucune modification).

**Règles métier visibles** :
- Le bouton "ENVOYER" est désactivé si aucun type n'est sélectionné.
- Si "Reprogrammer" est sélectionné et les champs date/heure sont vides : bouton
  désactivé + message "Veuillez renseigner la date et l'heure cibles".
- Si une instruction est déjà en attente sur ce colis : avertissement en haut du modal
  "Une instruction est en attente d'exécution. Confirmez avant d'en envoyer une nouvelle."
  + bouton "Forcer l'envoi quand même".
- Si le livreur est hors ligne : avertissement "Le livreur est actuellement hors ligne.
  L'instruction sera délivrée dès son retour en ligne."

**États à couvrir** :
- Etat normal : modal ouvert, colis pré-rempli, aucun type sélectionné.
- Type sélectionné (Prioriser ou Annuler) : bouton ENVOYER actif.
- Type Reprogrammer sélectionné : champ créneau visible + requis.
- Instruction en attente sur ce colis : bandeau avertissement en haut.
- Livreur hors ligne : bandeau informatif (non bloquant).
- Erreur réseau à l'envoi : message inline "Envoi impossible. Réessayez." + bouton
  "Réessayer".
- Envoi réussi : toast de confirmation + fermeture du modal.

---

### Application mobile livreur (Android)

---

#### Ecran M-01 : Authentification

**Route** : `/auth`
**User Stories associées** : US-019 (Authentification SSO mobile)

**Fonctionnalités attendues** :
- Ecran de démarrage et d'authentification via SSO corporate Docaposte.
- Logo DocuPost centré.
- Titre de bienvenue et sous-titre.
- Un seul bouton d'action : "Se connecter via compte Docaposte". Déclenche le flux
  OAuth2 / SSO (redirection vers la page SSO corporate).
- Version applicative en bas d'écran.

**Données affichées** :
- Logo DocuPost.
- "Bienvenue sur DocuPost" (titre).
- "Votre outil de tournée" (sous-titre).
- Numéro de version (ex : v 2.0.0 — Docaposte).

**Actions utilisateur** :
- Tap "Se connecter via compte Docaposte" → flux SSO OAuth2.

**Règles métier visibles** :
- Aucune connexion SSO n'est possible en mode offline (le bouton est désactivé si
  l'appareil est hors ligne au démarrage).

**États à couvrir** :
- Etat normal : bouton actif.
- Chargement (redirection SSO en cours) : spinner dans le bouton, label "Connexion en
  cours...", bouton désactivé.
- Erreur SSO : card d'erreur centrée avec icône alerte + message + bouton "Réessayer".
- Mode offline au démarrage : message "Vous êtes hors ligne. Reconnectez-vous avant de
  démarrer." Bouton désactivé.

---

#### Ecran M-02 : Liste des colis de la tournée

**Route** : `/tournee`
**User Stories associées** : US-001 (Consulter la liste des colis), US-002 (Suivre la
progression), US-003 (Filtrer par zone), US-006 (Mode offline), US-007 (Clôturer la
tournée), US-029 (Swipe rapide échec)

**Fonctionnalités attendues** :
- Ecran principal du livreur, affiché en permanence pendant la tournée.
- Header avec titre "Tournée du JJ/MM/AAAA", menu hamburger gauche, icône aide droite.
- Bandeau de progression : "Reste à livrer : X / Y", barre de progression, estimation
  de fin de tournée (ex : "Fin estimée : 17h30"), badge LIVE / OFFLINE.
- Filtres par zone en onglets scrollables horizontalement (Zone A, Zone B, Tous...).
- Compteur de colis par onglet.
- Liste de cards de colis :
  - Badge statut en haut à gauche (A LIVRER / LIVRE / ECHEC / A REPRESENTER).
  - Chip contrainte horaire si applicable (ex : ⚑ Avant 14h).
  - Adresse principale (texte gras).
  - Nom du destinataire + complément d'adresse.
  - Cards livrées : opacité réduite (0,7).
- Swipe gauche sur une card : action rapide "Déclarer un échec" (shortcut - US-029).
- Infinite scroll vers le bas.
- Footer fixe : bouton [Scan colis] + bouton [Clôturer la tournée] (uniquement visible
  si tous les colis sont traités).

**Données affichées** :
- Reste à livrer : X / Y colis.
- Estimation fin de tournée (HH:MM).
- Pour chaque colis : badge statut, contrainte horaire, adresse, destinataire.
- Badge LIVE (vert) / OFFLINE (orange) dans le bandeau de progression.
- En mode offline : horodatage des actions en attente de synchronisation.

**Actions utilisateur** :
- Tap sur une card → navigation vers M-03 (Détail du colis).
- Tap sur un onglet zone → filtre la liste (animation fade).
- Swipe gauche sur une card → action rapide "Déclarer un échec" (accès direct à M-05).
- Tap [Scan colis] → ouverture du scanner code-barres.
- Tap [Clôturer la tournée] → confirmation + clôture.
- Notification push reçue → overlay M-06 s'affiche par-dessus cet écran.

**Règles métier visibles** :
- Le bouton [Clôturer] n'est visible que si tous les colis sont au statut terminal
  (livré ou échec).
- L'indicateur passe OFFLINE (orange) automatiquement dès perte du réseau.
- Les actions (livraison, échec) restent disponibles en mode offline.

**États à couvrir** :
- Etat normal : liste mixte avec colis à livrer, livrés, en échec.
- Mode offline : bandeau orange fixe sous le header "Hors connexion — Données locales".
  Icône sync en attente. Toutes les actions disponibles.
- Synchronisation en cours : icône rotation dans le bandeau de progression.
- Liste vide : illustration + "Aucun colis assigné pour aujourd'hui. Contactez votre
  superviseur."
- Chargement initial : skeleton 5 cards animées.
- Mise à jour temps réel d'un colis : animation pulse sur l'item modifié.
- Colis clôturé par swipe : animation de sortie vers la gauche.

---

#### Ecran M-03 : Détail d'un colis

**Route** : `/tournee/colis/:id`
**User Stories associées** : US-004 (Accéder au détail), US-005 (Déclarer un échec),
US-008 (Capturer une signature)

**Fonctionnalités attendues** :
- Header : bouton retour chevron gauche, titre "Colis #XXXXX", badge statut aligné à
  droite.
- Section DESTINATAIRE : nom complet, adresse complète avec complément (appartement,
  étage).
- Bouton "Ouvrir la carte" → ouvre Google Maps avec coordonnées pré-remplies.
- Bouton "Appeler" → appel direct (numéro non exposé en clair).
- Section CONTRAINTES : chips de contrainte (ex : ⚑ Avant 14h, ⚑ Fragile). Masquée
  si aucune contrainte.
- Section HISTORIQUE DES TENTATIVES : liste chronologique des tentatives précédentes
  avec date, numéro de tentative et motif. Masquée si aucune tentative antérieure.
- Deux boutons d'action :
  - [LIVRER CE COLIS →] (bouton primaire).
  - [DECLARER UN ECHEC] (bouton secondaire, style outline, couleur alerte).

**Données affichées** :
- Identifiant du colis (ex : #00247).
- Nom du destinataire + adresse complète + complément.
- Contraintes actives (chips visuels).
- Historique des tentatives (si > 0) : date + numéro + motif.

**Actions utilisateur** :
- Tap [LIVRER CE COLIS →] → navigation vers M-04 (Capture de preuve).
- Tap [DECLARER UN ECHEC] → navigation vers M-05 (Déclaration d'échec).
- Tap "Ouvrir la carte" → ouvre l'app cartographique native.
- Tap "Appeler" → appel téléphonique direct.
- Tap retour chevron → retour vers M-02.

**Règles métier visibles** :
- Si le colis est déjà livré : les deux boutons sont remplacés par une card succès
  "Livré le JJ/MM à HH:MM ✓" (fond vert clair).
- Si le colis est en échec : card échec "Echec déclaré — Motif : [motif]" + bouton
  "Modifier la déclaration" si encore modifiable.
- Un colis au statut terminal (livré ou échec) ne peut pas être re-traité.

**États à couvrir** :
- Etat normal : colis à livrer, deux boutons d'action visibles.
- Colis déjà livré : card succès, pas de boutons d'action.
- Colis en échec : card échec avec motif.
- Chargement : skeleton de la fiche (3 sections).
- Mode offline : indicateur discret dans le header.

---

#### Ecran M-04 : Capture de la preuve de livraison

**Route** : `/tournee/colis/:id/preuve`
**User Stories associées** : US-008 (Signature numérique), US-009 (Photo ou tiers)

**Fonctionnalités attendues** :
- Header : bouton retour, titre "Preuve de livraison".
- Bandeau de rappel contexte : identifiant colis + nom du destinataire (lecture seule).
- Sélecteur de type de preuve : 4 cards en grille 2x2.
  - Card "Signature du destinataire".
  - Card "Photo du colis déposé".
  - Card "Remise à un tiers".
  - Card "Dépôt sécurisé".
- Zone dynamique selon le type sélectionné :
  - **Signature** : pad tactile (zone de dessin 240px de hauteur), ligne de base
    pointillée, bouton "Effacer la signature" sous le pad.
  - **Photo** : bouton "Prendre une photo" (déclenche la caméra native), preview après
    capture (80x80px miniature), bouton "Reprendre" sous la preview.
  - **Tiers** : champ texte "Nom du tiers" (obligatoire).
  - **Dépôt sécurisé** : champ texte libre "Description du lieu" ou liste déroulante.
- Bouton [CONFIRMER LA LIVRAISON ✓] : désactivé (grisé) si aucune preuve capturée.
  Fond vert quand actif.
- Caption sous le bouton : "Géolocalisation et horodatage enregistrés automatiquement."

**Données affichées** :
- Rappel : identifiant colis + nom destinataire (bandeau fixe).
- Zone de signature / preview photo / champ tiers selon le type sélectionné.

**Actions utilisateur** :
- Tap sur une card type → sélection (la zone dynamique change).
- Dessin sur le pad de signature.
- Tap "Effacer la signature" → remise à zéro du pad.
- Tap "Prendre une photo" → ouverture caméra native.
- Saisie nom du tiers.
- Tap [CONFIRMER LA LIVRAISON] → enregistrement de la preuve + événements + retour M-02.

**Règles métier visibles** :
- Le bouton [CONFIRMER LA LIVRAISON] reste désactivé tant qu'aucune preuve n'est
  capturée (pad de signature vide, pas de photo, champ tiers vide).
- L'horodatage et les coordonnées GPS sont capturés automatiquement et ne peuvent pas
  être modifiés manuellement.
- En l'absence de signal GPS, la confirmation reste possible avec un message informatif
  indiquant le mode dégradé.
- La preuve est immuable après confirmation (pas de bouton "modifier" après validation).

**États à couvrir** :
- Etat normal : sélecteur de type visible, aucun type sélectionné.
- Type Signature sélectionné, pad vide : bouton désactivé.
- Type Signature sélectionné, pad signé : bouton actif (fond vert).
- Type Photo sélectionné, photo prise : bouton actif + preview visible.
- Confirmation réussie : animation checkmark 1s puis retour automatique M-02.
- Mode offline : bandeau orange "Hors connexion — La preuve sera synchronisée au retour
  du réseau." Bouton confirmation disponible.
- Erreur caméra : message inline "Impossible d'accéder à l'appareil photo." + bouton
  "Paramètres".
- GPS indisponible : caption "Position GPS non disponible — livraison confirmée sans
  coordonnées (mode dégradé)."

---

#### Ecran M-05 : Déclaration d'un échec de livraison

**Route** : `/tournee/colis/:id/echec`
**User Stories associées** : US-005 (Déclarer un échec), US-029 (Swipe rapide)

**Fonctionnalités attendues** :
- Header avec barre supérieure colorée "alerte" (signal visuel fort que l'on est sur
  un écran d'échec), titre "Echec de livraison".
- Bandeau de rappel contexte : identifiant colis + nom destinataire.
- Section "MOTIF DE NON-LIVRAISON" (obligatoire, astérisque visible) :
  liste de 4 items radio.
  - Absent.
  - Accès impossible.
  - Refus du client.
  - Horaires dépassés.
- Section "QUE FAIRE DE CE COLIS ?" (obligatoire) : liste de 3 items radio.
  - A représenter.
  - Dépôt chez un tiers.
  - Retour au dépôt.
  - La section disposition se déverrouille uniquement après sélection du motif.
- Section "NOTE TERRAIN" (optionnel, 250 caractères max) : champ texte multiligne avec
  compteur de caractères en temps réel.
- Bouton [ENREGISTRER L'ECHEC] : style outline alerte, désactivé tant que motif et
  disposition ne sont pas sélectionnés.

**Données affichées** :
- Identifiant colis + nom destinataire.
- Liste des 4 motifs normalisés.
- Liste des 3 dispositions possibles.
- Compteur caractères : "X / 250".

**Actions utilisateur** :
- Sélection d'un motif → déverrouille la section disposition.
- Sélection d'une disposition.
- Saisie note optionnelle.
- Tap [ENREGISTRER L'ECHEC] → horodatage + géolocalisation auto + événements +
  notification superviseur + retour M-02.

**Règles métier visibles** :
- La section "Disposition" est grisée et non interactive avant qu'un motif soit sélectionné.
- Le bouton [ENREGISTRER L'ECHEC] est désactivé tant que motif ET disposition ne sont
  pas sélectionnés.
- Si la note dépasse 250 caractères : compteur passe rouge, bouton désactivé.
- L'action est disponible en mode offline (synchronisation différée).
- Un colis déjà en statut "échec" : le système affiche "Echec déjà déclaré — Motif : [motif]"
  et aucune nouvelle action n'est possible.

**États à couvrir** :
- Etat normal : motif non sélectionné, disposition grisée, bouton désactivé.
- Motif sélectionné : disposition active.
- Motif + disposition sélectionnés : bouton actif.
- Note trop longue (> 250 car.) : compteur rouge, bouton désactivé.
- Mode offline : bandeau orange "Hors connexion — L'échec sera synchronisé au retour
  du réseau." Actions disponibles.
- Disposition "A représenter" sélectionnée : toast informatif après enregistrement
  "Ce colis est marqué pour une nouvelle tentative."
- Colis déjà en échec : card d'état bloquant.

---

#### Ecran M-06 : Notification d'instruction reçue (composant overlay)

**Route** : Overlay — s'affiche par-dessus tout écran mobile
**User Stories associées** : US-016 (Notification push instruction)

**Fonctionnalités attendues** :
- Composant overlay (pas un écran plein) — s'affiche en haut de l'écran par-dessus
  l'écran courant, quel qu'il soit.
- Fond distinctif bleu foncé superviseur (différent du bleu primaire DocuPost).
- Icône superviseur + titre "INSTRUCTION SUPERVISEUR" en majuscules.
- Corps : type d'instruction (ex : "Prioriser le colis #00312") + adresse du colis.
- Deux boutons :
  - [VOIR →] : navigue vers M-03 du colis concerné.
  - [OK ✓] : acquitte la notification sans navigation.
- Barre de progression fine en bas de l'overlay : compte à rebours 10 secondes.
- Disparition automatique après 10 secondes si aucune interaction (glissement vers le
  haut).
- Swipe up sur l'overlay : fermeture rapide.

**Données affichées** :
- Type d'instruction (ex : Prioriser / Annuler / Reprogrammer).
- Identifiant du colis concerné.
- Adresse du colis.
- Compte à rebours visuel (10s).

**Actions utilisateur** :
- Tap [VOIR →] → navigation vers M-03 du colis.
- Tap [OK ✓] → acquittement, fermeture de l'overlay.
- Swipe up → fermeture rapide.
- Expiration (10s) → fermeture automatique + bandeau persistant discret dans M-02.

**Règles métier visibles** :
- L'overlay s'affiche par-dessus tout écran de l'application (même M-04 ou M-05).
- L'acquittement de la notification ne signifie pas l'exécution de l'instruction.
- La liste M-02 est déjà mise à jour au moment de la réception de la notification.

**États à couvrir** :
- Etat normal : overlay visible, compte à rebours actif.
- Interaction [VOIR] : fermeture + navigation.
- Interaction [OK] ou expiration : fermeture + bandeau discret persistant sur M-02.
- Swipe up : fermeture rapide animée.

---

## 4. Navigation et flux

### Points d'entrée

```
Application mobile (livreur) :
  M-01 (Authentification SSO)
    → succès SSO → M-02 (Liste des colis)

Interface web (superviseur / logisticien) :
  Page de connexion SSO Docaposte
    → rôle "superviseur" → choix entre :
        W-04 (Préparation — le matin)
        W-01 (Supervision — la journée)
```

### Flux principal mobile livreur (happy path)

```
M-01 (Authentification)
  |
  → M-02 (Liste des colis de la tournée)
      |
      → [tap sur une card] → M-03 (Détail d'un colis)
           |
           → [LIVRER CE COLIS] → M-04 (Capture de la preuve)
           |                         → [CONFIRMER] → retour M-02 ✓
           |
           → [DECLARER UN ECHEC] → M-05 (Déclaration d'échec)
                                       → [ENREGISTRER] → retour M-02 ✓
      |
      → [Clôturer la tournée] → confirmation → récapitulatif → fin
      |
      → [overlay M-06] (notification instruction)
           → [VOIR] → M-03 du colis concerné
           → [OK] → retour M-02
```

### Flux alternatif mobile — swipe rapide (US-029)

```
M-02 (Liste des colis)
  → [swipe gauche sur une card]
  → M-05 (Déclaration d'échec) avec motif pré-rempli "Absent"
  → [ENREGISTRER] → retour M-02 ✓
```

### Flux principal web logisticien — préparation du matin (happy path)

```
W-04 (Plan du jour)
  |
  → [Affecter] → W-05 (onglet Affectation ouvert par défaut)
      |
      → sélectionner livreur + véhicule
      |
      → [Valider l'affectation] → toast → retour W-04
      OU
      → [Valider et lancer] → confirmation → TourneeLancée → retour W-04
  |
  → [Voir le détail] → W-05 (onglet Composition)
      |
      → basculer vers onglet Affectation → affectation + lancement
  |
  → [Lancer →] sur ligne affectée → confirmation → TourneeLancée → W-04
  |
  → [Lancer toutes les tournées] → confirmation globale → toutes TourneeLancées → W-04
```

### Flux principal web superviseur — pilotage (happy path)

```
W-01 (Tableau de bord)
  |
  → [Voir] sur une tournée → W-02 (Détail de la tournée)
      |
      → [onglet Liste colis] → liste avec boutons [Instruction]
      |   → [Instruction] sur colis "A livrer" → modal W-03
      |       → sélectionner type → [ENVOYER] → toast → fermeture modal
      |
      → [onglet Incidents] → liste incidents + drawer détail
      |
      → [onglet Carte] → vue cartographique
  |
  → [filtre A risque] → tableau filtré sur tournées à risque
  |
  → alerte automatique (WebSocket) → surbrillance tournée + badge + son
```

### Flux alternatif web — offline logisticien

```
W-04 → perte connexion serveur → bandeau rouge "Connexion perdue"
  → les données affichées sont les dernières connues (lecture seule)
  → retour connexion → resynchronisation automatique → bandeau disparaît
```

### Flux alternatif mobile — mode offline livreur

```
M-02 → perte réseau → bandeau orange "Hors connexion"
  → toutes les actions de livraison / échec / preuve restent disponibles
  → événements stockés localement
  → retour réseau → synchronisation automatique → bandeau disparaît
    → indicateur "Synchronisation en cours" dans le bandeau de progression
```

---

## 5. Contraintes design

### Accessibilité terrain (mobile)

- **Taille de texte minimum** : 16px pour tout le corps de texte (lecture en plein soleil
  avec lunettes de soleil ou à bout de bras).
- **Touch target minimum absolu** : 48x48px pour tout élément interactif. Les boutons
  principaux font 56px de hauteur.
- **Contraste** : tous les textes sur fonds colorés doivent respecter WCAG AA minimum
  (ratio 4,5:1). Les badges de statut sont conçus avec texte foncé sur fond clair ou
  texte blanc sur fond foncé avec ratio suffisant.
- **Usage à une main** : les actions principales (boutons CTA) sont placées en bas
  d'écran dans la zone de confort du pouce. Pas d'action critique en haut d'écran hors
  de portée du pouce.
- **Feedback haptique** : les confirmations importantes (livraison confirmée, échec
  enregistré) déclenchent une vibration courte (non à modéliser en maquette mais à
  annoter).

### Accessibilité superviseur (web)

- Toutes les informations critiques (statut à risque) ne reposent pas uniquement sur la
  couleur : un badge textuel "A RISQUE" + une icône ⚠ sont toujours présents en
  complément de la couleur orange.
- L'alerte sonore est désactivable (toggle dans le header).
- Contrastes WCAG AA sur tous les composants.

### Responsive / plateformes cibles

- **Mobile** : Android prioritaire. Grille 375px. Safe area (notch + barre de navigation)
  respectée. Hauteur d'écran variable (360px à 900px) : les listes sont scrollables,
  les éléments fixes ne bloquent pas le contenu.
- **Web** : Desktop uniquement pour la V1. Grille 12 colonnes, largeur référence 1280px,
  gouttière 24px. Pas de version tablette ni mobile web requis au MVP.

### Identité visuelle — Design System DocuPost v1.0

Les tokens sémantiques ci-dessous sont la référence absolue. Ne pas utiliser de valeurs
brutes en dehors des tokens.

**Couleurs principales** :

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-primaire` | `#1D4ED8` | Boutons CTA, liens actifs, navigation |
| `--color-succes` | `#16A34A` | Statut LIVRE, CLOTURE, AFFECTE |
| `--color-alerte` | `#DC2626` | Statut ECHEC, NON AFFECTE, A RISQUE |
| `--color-avertissement` | `#D97706` | A REPRESENTER, anomalie de charge |
| `--color-info` | `#2563EB` | Statut A LIVRER, EN COURS |
| `--color-info-fonce` | `#1E3A8A` | Fond bandeau instruction superviseur |
| `--color-fond-alerte` | `#FEF3C7` | Bandeau plan du jour (anomalie) |
| `--color-surface-primary` | `#FFFFFF` | Fond principal (cartes, header) |
| `--color-surface-secondary` | `#F8FAFC` | Fond secondaire (lignes alternées) |

**Typographie** :
- Web : titres Work Sans SemiBold, corps Inter Regular.
- Mobile : Inter uniquement. Titre H1 : SemiBold 24px. Corps : Regular 16px minimum.
  Labels de section : SemiBold 12px uppercase.

**Composants design system existants** (déjà implémentés côté dev — les maquettes Figma
doivent s'aligner sur ces composants) :
- `BadgeStatut` : badge coloré selon statut (A LIVRER / LIVRE / ECHEC / EN COURS /
  A RISQUE / CLOTURE).
- `BoutonCTA` : bouton primaire plein, secondaire outline, tertiaire texte.
- `BandeauProgression` : barre + compteur + estimation + badge LIVE/OFFLINE.
- `CarteColis` : card colis avec badge, adresse, destinataire, contrainte.
- `ChipContrainte` : chip ⚑ avec label de contrainte.
- `IndicateurSync` : badge LIVE (vert) / POLLING (orange) / OFFLINE (rouge).
- `BandeauInstruction` : overlay notification instruction superviseur (mobile).
- `CardTypeInstruction` : card sélectionnable pour le type d'instruction (W-03).
- `CardTypePreuve` : card sélectionnable pour le type de preuve (M-04).
- `DrawerDetail` : panneau latéral 480px pour détail incident (W-02).

---

## 6. Priorités de conception

### Ecrans critiques MVP — à concevoir en premier (P0)

Ces écrans sont sur le chemin critique de toute démonstration du produit.

| Priorité | Ecran | Raison |
|----------|-------|--------|
| P0 | M-02 — Liste des colis | Ecran principal livreur, utilisé 100% du temps |
| P0 | M-03 — Détail d'un colis | Point de départ de toute action (livraison ou échec) |
| P0 | M-04 — Capture de preuve | Preuve de livraison = obligation légale et KPI central |
| P0 | M-05 — Déclaration échec | Flux de non-livraison = cas fréquent (15-20% des colis) |
| P0 | W-01 — Tableau de bord | Ecran de pilotage principal superviseur |
| P0 | W-04 — Plan du jour | Sans cet écran, aucune tournée ne peut démarrer |

### Ecrans importants MVP — à concevoir en second (P1)

| Priorité | Ecran | Raison |
|----------|-------|--------|
| P1 | M-01 — Authentification | Requis pour entrer dans l'application |
| P1 | M-06 — Notification instruction | Flux temps réel superviseur → livreur |
| P1 | W-02 — Détail tournée | Diagnostic superviseur avant d'envoyer une instruction |
| P1 | W-03 — Envoi instruction | Remplacement du téléphone = KPI de réduction appels |
| P1 | W-05 — Détail tournée à préparer | Préparation matinale : affectation + lancement |

### Ecrans pouvant être simplifiés en V1 (P2)

| Priorité | Ecran | Simplification acceptable |
|----------|-------|--------------------------|
| P2 | W-02 onglet Carte | Placeholder cartographique avec mention "Carte en V2" |
| P2 | M-02 scan colis | Bouton présent mais flux scanner en V2 |

### Etats pouvant être simplifiés en V1

Les états de chargement (skeleton) et les états vides peuvent utiliser des variantes
simplifiées en V1. Les états d'erreur (réseau, GPS, caméra) doivent être maquettés car
ils surviennent en production terrain.

---

## 7. Annexe — Termes du domaine (Ubiquitous Language)

Les termes ci-dessous sont les termes exacts utilisés par les utilisateurs sur le terrain.
Ils doivent apparaître tels quels dans les libellés de l'interface (pas de synonymes,
pas de reformulation).

| Terme | Définition utilisateur | Ecrans concernés |
|-------|----------------------|-----------------|
| Tournée | Ensemble des colis à livrer dans une journée, sur une zone donnée | Tous |
| Colis | Unité de livraison assignée à une adresse et un destinataire | M-02, M-03, M-04, M-05 |
| Plan du jour | L'ensemble des tournées du jour importées depuis le TMS | W-04 |
| TMS | Système de gestion de transport qui génère les tournées chaque matin | W-04 |
| Affectation | Liaison d'une tournée à un livreur et un véhicule | W-04, W-05 |
| Lancement | Action de rendre une tournée visible dans l'application livreur | W-04, W-05 |
| Reste à livrer | Nombre de colis non encore traités dans la tournée | M-02 |
| Motif de non-livraison | Raison normalisée d'un échec : Absent, Accès impossible, Refus client, Horaires dépassés | M-05 |
| Disposition | Ce que l'on fait du colis en cas d'échec : A représenter, Dépôt chez tiers, Retour dépôt | M-05 |
| A représenter | Colis à tenter à nouveau lors d'une prochaine tournée | M-02, M-05 |
| Preuve de livraison | Signature, photo, tiers ou dépôt sécurisé capturé au moment de la remise | M-04 |
| Tournée à risque | Tournée dont l'avancement réel est significativement en retard sur l'avancement attendu | W-01, W-02 |
| Instruction | Ordre structuré envoyé par le superviseur au livreur (Prioriser / Annuler / Reprogrammer) | W-03, M-06 |
| Incident | Echec de livraison notifié au superviseur | W-02, M-05 |
| Note terrain | Commentaire libre (250 car. max) saisi par le livreur lors d'un échec | M-05 |
| Zone | Secteur géographique regroupant plusieurs adresses dans une même tournée | M-02, W-05 |
| Véhicule | Moyen de transport affecté à une tournée (ex : VH-07) | W-05 |
| Contrainte | Condition de livraison spéciale (horaire limite, colis fragile) | M-03, W-05 |
| Acquittement | Action du livreur de confirmer la lecture d'une notification d'instruction | M-06 |
