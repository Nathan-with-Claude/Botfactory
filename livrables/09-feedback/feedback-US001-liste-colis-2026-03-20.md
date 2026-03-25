# Feedback : Liste des colis de ma tournée (US-001)

**Persona testé** : Pierre Morel — Livreur terrain
**Date** : 2026-03-20
**Contexte** : Premier test app DocuPost, 22 colis, Paris 11e/20e, 6h45 au dépôt

---

## Bloquants (à corriger avant livraison)

- **Je ne sais pas dans quel ordre faire mes livraisons.** La liste affiche mes 22 colis,
  d'accord, mais ils sont dans quel ordre ? Alphabétique ? Par numéro de colis ? Par zone ?
  Ma feuille de route papier, elle était triée dans l'ordre où je devais passer. Là j'arrive
  sur l'écran et je dois tout lire pour reconstituer mon itinéraire dans ma tête. A 6h45,
  j'ai pas le temps de réfléchir à ça, j'ai un chef qui attend. C'est bloquant pour moi.

- **Les 3 colis "Avant 14h00" ne sautent pas aux yeux.** Je vois bien qu'il y a une
  mention "Contrainte : Avant 14h" sur chaque item concerné, mais il faut que je fasse
  défiler toute la liste pour les trouver. Si je rate un de ces trois colis dans ma lecture
  rapide du matin, je risque de me retrouver à 14h02 devant une porte sans avoir livré
  la personne qui part l'après-midi. Il faut que ces colis urgents soient en haut de liste
  ou regroupés quelque part, pas noyés dans les 22 items. Je ne peux pas me permettre
  de les louper.

- **Pas de numéro de l'appart ou d'instruction d'accès dans la liste.** Sur ma feuille
  papier, j'avais souvent "code porte : 1234" ou "sonner au gardien" à côté de l'adresse.
  Dans la liste, je vois l'adresse et le nom du destinataire, mais rien d'autre. Je dois
  cliquer sur chaque colis pour avoir le détail ? Si je dois faire ça pour les 22 colis le
  matin au dépôt, ça va me prendre dix minutes et je pars en retard. Soit ces infos
  doivent être visibles dans la liste, soit il faut un moyen rapide de les scanner toutes
  d'un coup.

---

## Améliorations importantes

- **Le bandeau "Reste à livrer : 22 / 22" — je comprends ce que c'est, mais au départ
  de la tournée ça m'apporte rien.** Tout le monde sait qu'au départ c'est 22 sur 22.
  Ce compteur va prendre tout son sens en cours de journée. Ce qui m'aurait aidé le
  matin c'est plutôt un résumé du type "3 colis urgents avant 14h — 1 fragile — 1 recommandé".
  Ça, ça m'aurait permis de préparer ma tournée dans ma tête avant de monter dans le camion.

- **L'icône "à livrer" est un point bleu.** Je comprends pas ce que ça veut dire au
  premier coup d'oeil. Un point bleu, un carré vert coché, une croix rouge — faut que
  j'apprenne le code couleur. Sur ma feuille papier, c'était une case vide (à faire) ou
  barrée (fait). C'est pas forcément mieux, mais au moins c'était instinctif après six
  ans. Ici faut que je mémorise. Une icône plus parlante ou un label texte à côté aiderait
  pour les premiers jours.

- **Le filtre par zone géographique (onglets Zone A, Zone B, Zone C) est trop abstrait.**
  "Zone A" ça ne me dit rien. Moi je pense "Paris 11e" ou "Paris 20e", pas "Zone A". Si
  je suis sur deux arrondissements, je veux pouvoir filtrer par arrondissement ou par
  secteur que je reconnais, pas par une lettre attribuée par le système. Là je vais
  appuyer sur "Zone A" et je saurai pas à quoi ça correspond avant d'avoir vu les
  adresses.

- **Aucune indication du temps estimé par colis ou de l'heure recommandée de départ.**
  Je vois "Fin estimée : 17h30" dans le bandeau — bien. Mais je sais pas si cette
  estimation est réaliste vu les contraintes horaires. Pour les 3 colis "Avant 14h",
  j'aurais besoin de savoir si je dois les faire en premier ou si j'ai le temps de faire
  une autre zone d'abord. Ce calcul là, ma feuille papier ne le faisait pas non plus,
  mais j'avais l'expérience pour le faire dans ma tête. Un livreur plus junior que moi
  va galérer.

- **Je peux pas voir si le colis fragile (le vase) et le recommandé sont dans le camion
  depuis l'écran liste.** Je sais qu'ils sont dans ma tournée via l'app, mais je dois
  quand même aller physiquement vérifier que ces deux colis spéciaux sont bien chargés.
  Il n'y a pas de case à cocher "chargé en véhicule" dans la liste. C'est un vrai risque
  de partir sans eux.

---

## Points positifs

- **Tout s'ouvre automatiquement sur ma tournée du jour après connexion.** Je pensais
  devoir chercher, saisir un numéro de tournée, etc. Non — c'est direct. Ca c'est vraiment
  bien, ça me fait gagner du temps le matin.

- **Les contraintes sont affichées sur chaque colis sans avoir à cliquer.** Même si
  elles ne ressortent pas assez (voir bloquants), le fait qu'elles soient visibles
  directement dans la liste c'est un vrai plus par rapport à ma feuille papier où
  je devais chercher une annotation manuelle au crayon pas toujours lisible.

- **Le statut "livré / à livrer / échec" est visible d'un coup d'oeil.** En cours de
  journée, quand je reviens dans la liste après une livraison, je verrai tout de suite
  ce qui est fait et ce qu'il reste. Ca c'est une vraie amélioration sur le papier où
  je rayais à la main et c'était parfois illisible.

- **Le bouton "Scan colis" en bas d'écran est bien placé.** Accessible d'une main sans
  avoir à monter en haut de la liste. J'utilise souvent le scan pour retrouver un colis
  rapidement sans faire défiler toute la liste.

- **L'estimation "Fin estimée : 17h30" dans le bandeau.** Sur ma feuille papier j'avais
  jamais ça. Si l'estimation est fiable, c'est une info que mon chef va apprécier autant
  que moi. Je saurai si je suis dans les temps sans avoir à l'appeler.

---

## Termes que j'utilise naturellement (signal Ubiquitous Language)

> A transmettre a l'Architecte Metier pour valider / enrichir le glossaire.

| Ce que j'ai vu a l'ecran         | Ce que j'aurais dit moi              | Difference significative ? |
|----------------------------------|--------------------------------------|---------------------------|
| "Reste a livrer"                 | "Ce qui me reste" ou "mon reste"     | Non — assez proche        |
| "Contrainte : Avant 14h"         | "Urgent avant 14h" ou "a faire avant 14h" | Oui — "contrainte" c'est un mot de bureau, pas de terrain |
| "Zone A / Zone B / Zone C"       | "Le 11e" / "Le 20e" / "Gambetta"    | Oui — les zones abstraites ne correspondent pas à ma representation mentale du terrain |
| "Statut : a livrer"              | "A faire" ou "pas encore fait"       | Non — acceptable          |
| "Cloturer la tournee"            | "Finir ma journee" ou "boucler"      | Oui — "cloturer" c'est administratif, peu naturel |
| "Document sensible"              | "Recommande" ou "lettre recommandee" | Oui — "document sensible" est trop vague, "recommande" est le vrai mot metier |
| "Motif de non-livraison"         | "Pourquoi j'ai pas pu livrer"        | Oui — formulation trop technique pour un livreur |
| "Tournee du 19/03/2026"          | "Ma tournee du jour"                 | Non — la date est utile en relecture |

---

## Ce qui me manque par rapport a ma feuille de route papier

- **L'ordre de passage preconise.** Ma feuille papier etait triee dans un ordre logique
  (rue par rue, quartier par quartier). L'app ne me montre pas d'ordre. Je dois le
  reconstituer moi-meme.

- **Un recapitulatif rapide des points d'attention du jour.** Sur ma feuille, le chef
  ecrivait parfois a la main "attention : recommande lot 3, fragile lot 7". Dans l'app
  il n'y a pas d'equivalent visible a l'ouverture — juste la liste complete.

- **La confirmation visuelle que les colis speciaux sont bien charges.** La feuille
  papier, je la cochais au chargement. Ici il n'y a rien pour verifier le chargement
  avant de partir.

- **Un moyen de noter une info contextuelle sur un colis** (ex. "client m'a dit hier
  qu'il est la le matin seulement"). Sur le papier je griffonnais a cote de l'adresse.
  Ici pas de champ de note libre visible.

- **Le poids ou l'encombrement des colis.** Sur la feuille, je savais qui avait les
  colis lourds pour les mettre en dernier dans le camion. L'app ne me donne pas cette
  info — je le decouvre en chargeant.

---

## Ce qui est mieux que ma feuille de route papier

- **Ca ne peut pas se mouiller ou se dechirer.** C'est la premiere chose que je
  me suis dit. Six ans avec des feuilles illisibles quand il pleut — ca c'est regle.

- **Le statut se met a jour en temps reel.** Plus besoin de rayer a la main ou de
  corriger au stylo. Ca reste propre et lisible toute la journee.

- **Je vois l'estimation de fin de tournee.** Rien que ca, ca change tout pour
  anticiper mes pauses et appeler ma femme.

- **Les contraintes horaires sont affichees directement.** Meme si elles pourraient
  mieux ressortir, au moins elles sont la — sur ma feuille papier elles etaient
  parfois oubliees ou notees en tout petit.

- **Si mon chef ajoute un colis en cours de journee, je le verrai dans l'app.**
  Fini les appels au mauvais moment. C'est un gain enorme.

- **Accessible d'une seule main.** La liste defiles, le scan est en bas — j'ai pas
  besoin de mes deux mains pour consulter. Avec un colis sous le bras, c'est appréciable.

---

## Ma note globale

**3 / 5**

L'app demarre bien — le chargement automatique de ma tournee et les statuts visibles
sont de vraies ameliorations sur le papier. Mais pour quelqu'un qui n'a jamais utilise
d'app de tournee et qui part a 6h45 avec 22 colis, le manque d'ordre de passage et
l'invisibilite des colis urgents sont des problemes serieux. Je pourrais travailler avec,
mais je risque de louper une livraison urgente le temps de prendre mes marques. Avec
l'ordre de passage et un bandeau recapitulatif des urgences en haut de liste, je passerais
a 4/5 sans hesiter.
