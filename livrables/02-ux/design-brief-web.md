# Design Brief — Interface Web Superviseur / Logisticien (DocuPost)

> Document destiné au designer Figma — Interface B uniquement.
> Produit par @ux — 2026-03-25.
> Ce document est autonome : il contient l'intégralité des informations nécessaires
> pour concevoir l'interface web sans consulter d'autre document.
>
> Source : design-brief-figma.md, wireframes.md v2.0, personas.md, user-journeys.md,
> backlog US-011 à US-015 et US-021 à US-030, design-system.md v1.0.

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

### L'utilisateur cible de cette interface

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

- Interface web de supervision : React, navigateur desktop, grille 1280px.
- Authentification : SSO corporate OAuth2 (Docaposte).
- Les données temps réel sont mises à jour via WebSocket. Un badge permanent indique
  l'état de la connexion (LIVE vert / POLLING orange / OFFLINE rouge).

---

## 2. Interface B — Application web superviseur / logisticien

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

## 3. Ecrans à concevoir

### Parcours 0 — Préparation du matin

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

### Parcours 2 — Pilotage journée

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

## 4. Navigation et flux

### Point d'entrée

```
Interface web (superviseur / logisticien) :
  Page de connexion SSO Docaposte
    → rôle "superviseur" → choix entre :
        W-04 (Préparation — le matin)
        W-01 (Supervision — la journée)
```

### Flux principal logisticien — préparation du matin (happy path)

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

### Flux principal superviseur — pilotage (happy path)

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

### Flux alternatif — offline logisticien

```
W-04 → perte connexion serveur → bandeau rouge "Connexion perdue"
  → les données affichées sont les dernières connues (lecture seule)
  → retour connexion → resynchronisation automatique → bandeau disparaît
```

---

## 5. Contraintes design

### Accessibilité superviseur (web)

- Toutes les informations critiques (statut à risque) ne reposent pas uniquement sur la
  couleur : un badge textuel "A RISQUE" + une icône ⚠ sont toujours présents en
  complément de la couleur orange.
- L'alerte sonore est désactivable (toggle dans le header).
- Contrastes WCAG AA sur tous les composants.

### Responsive / plateforme cible

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

**Composants design system existants** (déjà implémentés côté dev — les maquettes Figma
doivent s'aligner sur ces composants) :
- `BadgeStatut` : badge coloré selon statut (A LIVRER / LIVRE / ECHEC / EN COURS /
  A RISQUE / CLOTURE).
- `BoutonCTA` : bouton primaire plein, secondaire outline, tertiaire texte.
- `BandeauProgression` : barre + compteur + estimation + badge LIVE/OFFLINE.
- `CarteColis` : card colis avec badge, adresse, destinataire, contrainte.
- `ChipContrainte` : chip ⚑ avec label de contrainte.
- `IndicateurSync` : badge LIVE (vert) / POLLING (orange) / OFFLINE (rouge).
- `CardTypeInstruction` : card sélectionnable pour le type d'instruction (W-03).
- `DrawerDetail` : panneau latéral 480px pour détail incident (W-02).

---

## 6. Priorités de conception

### Ecrans critiques MVP — à concevoir en premier (P0)

| Priorité | Ecran | Raison |
|----------|-------|--------|
| P0 | W-01 — Tableau de bord | Ecran de pilotage principal superviseur |
| P0 | W-04 — Plan du jour | Sans cet écran, aucune tournée ne peut démarrer |

### Ecrans importants MVP — à concevoir en second (P1)

| Priorité | Ecran | Raison |
|----------|-------|--------|
| P1 | W-02 — Détail tournée | Diagnostic superviseur avant d'envoyer une instruction |
| P1 | W-03 — Envoi instruction | Remplacement du téléphone = KPI de réduction appels |
| P1 | W-05 — Détail tournée à préparer | Préparation matinale : affectation + lancement |

### Ecrans pouvant être simplifiés en V1 (P2)

| Priorité | Ecran | Simplification acceptable |
|----------|-------|--------------------------|
| P2 | W-02 onglet Carte | Placeholder cartographique avec mention "Carte en V2" |

### Etats pouvant être simplifiés en V1

Les états de chargement (skeleton) et les états vides peuvent utiliser des variantes
simplifiées en V1. Les états d'erreur (réseau) doivent être maquettés car
ils surviennent en production terrain.

---

## 7. Glossaire — Termes du domaine (Ubiquitous Language)

Les termes ci-dessous sont les termes exacts utilisés par les utilisateurs sur le terrain.
Ils doivent apparaître tels quels dans les libellés de l'interface (pas de synonymes,
pas de reformulation).

| Terme | Définition utilisateur | Ecrans concernés |
|-------|----------------------|-----------------|
| Tournée | Ensemble des colis à livrer dans une journée, sur une zone donnée | Tous |
| Colis | Unité de livraison assignée à une adresse et un destinataire | W-02, W-03, W-05 |
| Plan du jour | L'ensemble des tournées du jour importées depuis le TMS | W-04 |
| TMS | Système de gestion de transport qui génère les tournées chaque matin | W-04 |
| Affectation | Liaison d'une tournée à un livreur et un véhicule | W-04, W-05 |
| Lancement | Action de rendre une tournée visible dans l'application livreur | W-04, W-05 |
| Tournée à risque | Tournée dont l'avancement réel est significativement en retard sur l'avancement attendu | W-01, W-02 |
| Instruction | Ordre structuré envoyé par le superviseur au livreur (Prioriser / Annuler / Reprogrammer) | W-03 |
| Incident | Echec de livraison notifié au superviseur | W-02 |
| Zone | Secteur géographique regroupant plusieurs adresses dans une même tournée | W-05 |
| Véhicule | Moyen de transport affecté à une tournée (ex : VH-07) | W-05 |
| Contrainte | Condition de livraison spéciale (horaire limite, colis fragile) | W-05 |
