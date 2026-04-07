# Feedback : Interface web DocuPost — Supervision et préparation des tournées

**Persona testé** : Laurent Renaud — Responsable exploitation logistique, utilise DocuPost sur PC bureau (Chrome, écran 27 pouces), traite 15 à 20 tournées par jour, phase de préparation de 6h à 7h, supervision active toute la journée.
**Date** : 2026-04-05
**US couvertes dans ce tour** : US-039 (export CSV bilan), US-040 (CSV enrichi), US-041 (poids et alerte surcharge W-04), US-044 (compteur déconnexion WebSocket), US-025 (design system), US-038 (libellés)

---

## Mon contexte de journée

J'arrive au bureau à 5h50. J'ai jusqu'à 7h00 pour que toutes les tournées soient affectées et lancées. Ca fait 70 minutes pour 15 à 20 tournées. Ca ne pardonne pas les interfaces lentes ou les clics inutiles. Pendant la journée, je surveille mon tableau de bord en parallèle de mes autres tâches — je dois pouvoir voir d'un coup d'oeil si quelque chose cloche sans avoir besoin de fouiller. En fin de journée, je produis un rapport pour ma direction. Ce rapport, avant DocuPost, je le faisais à la main en 45 minutes. Si DocuPost peut me le sortir en un clic, ca change ma fin de journée.

---

## Ce qui fonctionne bien

**L'export CSV bilan en un clic (US-039).**
Le bouton "Télécharger le bilan du jour" est là dans le tableau de bord. J'appuie, ca télécharge un fichier `bilan-tournees-2026-04-05.csv`. Le fichier s'ouvre dans Excel sans manipulation. Les colonnes sont lisibles : numéro de tournée, livreur, nombre de colis, livrés, échecs, statut final. Mon rapport de fin de journée en 15 secondes au lieu de 45 minutes. C'est la fonctionnalité qui a le plus de valeur pour moi dans cette livraison.

**Le CSV de détail avec nom du destinataire et statut (US-040).**
Quand un client appelle pour savoir si son colis a été livré, je peux maintenant exporter le détail d'une tournée avec le nom du destinataire et le statut "Livré / Echec / En cours". Avant, le CSV n'avait que des identifiants internes. Je devais croiser avec un autre système. Maintenant, je peux répondre au téléphone en 30 secondes en cherchant dans le CSV.

**La colonne Poids dans W-04 et les alertes surcharge (US-041).**
C'est exactement ce dont j'avais besoin le matin. La colonne "Poids" est maintenant dans le tableau de préparation. L'icône orange (approche) et l'icône rouge (dépassement) me permettent de voir en un scan visuel quelles tournées ont un problème de charge avant même d'affecter un livreur. Avant, je découvrais le problème après l'affectation, ce qui m'obligeait à défaire et recommencer. Maintenant je le traite à la bonne étape.

**Le compteur de déconnexion WebSocket est utile (US-044).**
Quand la connexion temps réel se coupe, l'indicateur LIVE change et me montre depuis combien de temps je suis déconnecté. Ca m'évite de regarder des données périmées en croyant qu'elles sont fraîches. Avant je ne savais pas si le tableau de bord était à jour ou pas. Maintenant si l'indicateur dit "déconnecté depuis 3 min", je sais que je dois actualiser manuellement.

**Le design général de la supervision est propre et professionnel.**
Les couleurs des statuts de tournée sont cohérentes : rouge pulsant pour "A risque", vert pour "Clôturée", blanc sobre pour "En cours". Sur mon grand écran, le tableau de bord est lisible d'un coup d'oeil. Les badges de statut ont la bonne taille — je ne dois pas zoomer pour lire. Ca ressemble à un vrai outil professionnel, pas à un prototype.

**La recherche multi-critères fonctionne sans rechargement.**
Je peux chercher un livreur par nom, filtrer par statut, et la liste se met à jour immédiatement. Le matin quand je cherche "Morel" pour vérifier sa tournée, le résultat arrive avant que j'aie fini de taper. Bon comportement.

---

## Bloquants (a corriger avant livraison)

### B1 — Le bouton "Lancer toutes les tournées" reste désactivé trop longtemps [BLOQUANT]

Le bouton "Lancer toutes les tournées affectées" est grisé tant qu'au moins une tournée n'est pas affectée. C'est la logique documentée, et ca se tient. Le problème, c'est que le matin, il y a presque toujours 1 ou 2 tournées que je ne peux pas affecter immédiatement (livreur en retard, véhicule en panne). Je dois lancer les 13 autres sans toucher aux 2 en attente. Mais le bouton global reste bloqué à cause de ces 2.

Concrètement, je dois lancer chaque tournée une par une, ligne par ligne, en cherchant le bouton "Lancer" de chaque ligne dans le tableau. Sur 13 tournées, ca fait 13 clics sur des boutons positionnés différemment selon le scroll. Il me faut 8 minutes au lieu de 30 secondes.

La correction attendue : un bouton "Lancer toutes les tournées affectées" (les affectées uniquement), distinct d'un éventuel "Lancer toutes". Ou au moins une sélection multiple dans le tableau avec une action groupée.

### B2 — L'alerte surcharge s'affiche mais n'indique pas quel véhicule recommander sur W-04 [BLOQUANT]

L'icône rouge apparait dans la colonne Poids. Je vois "Chargement trop lourd — 450 kg / 350 kg". C'est bien. Mais la prochaine étape logique serait "quel véhicule je dois affecter à la place ?". L'information est disponible dans W-05 (onglet Affectation, sidebar, "Reco: VH-XX"). Mais sur W-04, il n'y a rien. Je dois cliquer sur "Affecter", aller dans W-05, lire la recommandation, revenir sur W-04 pour faire l'affectation. Trois écrans pour une action qui devrait se faire en un.

Ce que j'attends : dans le tooltip de l'icône rouge sur W-04, la recommandation de véhicule directement. "Chargement trop lourd — utiliser VH-XX (grande capacité)." Ou bien un mini-panel au survol.

---

## Améliorations importantes

### A1 — L'export CSV bilan ne contient pas les horaires de clôture [IMPORTANT]

Le CSV bilan (US-039) a les colonnes : numéro de tournée, livreur, nb colis, nb livrés, nb échecs, statut final. Tres bien. Mais ma direction me demande aussi "à quelle heure la tournée a été clôturée ?". Ca m'oblige à rouvrir le tableau de bord et noter à la main les heures pour chaque tournée clôturée. Une colonne "Heure clôture" dans le CSV bilan résoudrait le problème en une ligne.

### A2 — La notification d'instruction envoyée à un livreur n'a pas de confirmation [IMPORTANT]

Quand j'envoie une instruction à Pierre Morel ("Prioriser le colis #312"), j'appuie sur le bouton d'envoi et... rien. Pas de message "Instruction envoyée à Pierre Morel", pas de confirmation que le message est parti. Je dois aller dans le fil d'activité récente pour vérifier si l'instruction est apparue. C'est un retour trop indirect pour une action importante. Je veux une confirmation simple : "Instruction envoyée — Pierre Morel a reçu votre message."

### A3 — La durée de déconnexion WebSocket ne se met pas à jour en continu [IMPORTANT]

L'indicateur US-044 affiche "déconnecté depuis 3 min" mais le chiffre ne s'incrémente pas en temps réel — il se met à jour par sauts (toutes les 60 secondes environ). Si je regarde l'indicateur pendant 2 minutes, il reste figé sur le même chiffre. Je dois actualiser la page pour avoir le chiffre exact. Un compteur qui tourne en temps réel ("il y a 1 min... 2 min... 3 min...") serait plus rassurant et éviterait les questions "c'est à jour ou pas ?".

### A4 — Le filtre de recherche dans W-04 est trop strict [IMPORTANT]

Si je tape "T-20" pour trouver les tournées T-201 et T-203, ca fonctionne. Mais si je tape "morel" (minuscule) pour filtrer par livreur affecté, ca ne trouve rien parce que le nom est stocké "Morel". La recherche est sensible à la casse. Le matin à 6h15, je ne vais pas faire attention aux majuscules. La recherche doit être insensible à la casse, c'est un standard attendu.

### A5 — La liste des livreurs dans le sélecteur d'affectation n'est pas triée intuitivement [MINEUR]

Dans W-05 onglet Affectation, le sélecteur livreur liste les noms dans un ordre que je ne comprends pas (ni alphabétique, ni par disponibilité). Je dois parcourir toute la liste pour trouver "Morel". Si la liste était triée "Disponible en premier, puis par nom alphabétique", je gagnerais 3 clics par tournée. Sur 13 tournées le matin, ca fait 39 clics en moins.

---

## Points positifs

- Export CSV bilan US-039 : c'est la fonctionnalité qui a le plus de valeur concrète pour ma fin de journée.
- CSV enrichi US-040 : répond à un besoin réel de traçabilité destinataire.
- Colonne Poids + alertes US-041 : changement de paradigme pour la préparation, je gère les anomalies au bon moment.
- Compteur déconnexion WebSocket US-044 : donne de la confiance dans la fraîcheur des données.
- Le tableau de bord W-01 est lisible et professionnel. L'indicateur "A risque" pulsant attire l'attention sans être agressif.
- Le fil d'Ariane (breadcrumb) aide quand je dois expliquer où je suis à quelqu'un au téléphone ("je suis sur Plan du jour > Tournée T-203").

---

## Priorisation — Top 3 a corriger en urgence

| Rang | Problème | Pourquoi c'est urgent |
|------|----------|----------------------|
| 1 | Bouton "Lancer les tournées affectées" (lancement groupé des seules affectées) | 13 clics au lieu d'1 chaque matin = 8 minutes perdues en phase critique |
| 2 | Recommandation de véhicule dans le tooltip W-04 | Evite 3 navigations d'écrans pour résoudre une anomalie de charge |
| 3 | Confirmation d'envoi d'instruction au livreur | Action critique sans retour = je ne sais pas si le livreur a reçu la consigne |

---

## Note globale du jour

**7,5/10** (contre 6,5/10 lors du feedback du 01/04)

Les fonctionnalités d'export (US-039, US-040) et l'alerte surcharge (US-041) sont de vraies améliorations métier. Le matin de préparation est plus fluide, le rapport de fin de journée se fait en 15 secondes. Ce qui me manque encore, c'est la possibilité de lancer plusieurs tournées en une seule action — le bloquant B1 est quotidien et concret. Quand ce point sera résolu avec une recommandation de véhicule directement dans W-04, je monte à 9/10 facilement.

---

## Termes que j'utilise naturellement (signal Ubiquitous Language)

> A transmettre a l'Architecte Metier pour valider / enrichir le glossaire.

| Ce que j'ai vu a l'ecran | Ce que j'aurais dit moi | Difference significative ? |
|--------------------------|------------------------|---------------------------|
| "Lancer toutes les tournées" | "Démarrer les tournées" ou "Mettre en route" | Mineur — "lancer" est compris |
| "Anomalie de charge détectée" | "Surcharge" ou "Trop lourd pour le véhicule" | Oui — "anomalie" est vague, "surcharge" est précis |
| "Affectation" (onglet W-05) | "Attribuer un livreur" ou "Qui part avec cette tournée ?" | Oui — "affectation" est un terme RH/logistique, pas de terrain |
| "Composition" (onglet W-05) | "Contenu de la tournée" ou "Ce qu'il y a dedans" | Oui — "composition" est joli mais abstrait |
| "Bilan du jour" (export CSV) | "Rapport de fin de journée" ou "Récap du jour" | Mineur — les deux passent |
| "A risque" (badge statut) | "En retard" ou "Problème" | Oui — "à risque" peut couvrir plusieurs choses, je préfère savoir si c'est un retard ou autre chose |
| "Instruction" (envoi superviseur) | "Consigne" ou "Message" ou "Ordre de mission" | Mineur — "instruction" est clair |
| "Rafraîchir depuis TMS" | "Mettre à jour depuis le logiciel de tournées" | Oui — "TMS" est un acronyme que les nouveaux ne connaissent pas toujours |
| "Tournée non affectée" | "Tournée sans livreur" | Oui — "affectée" est précis mais "sans livreur" est plus immédiat |
| "Clôturée" (statut tournée) | "Terminée" | Mineur — "clôturée" est compris par les habitués, "terminée" serait plus accessible |
