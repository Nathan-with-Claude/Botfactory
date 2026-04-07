# Feedback : Application mobile DocuPost — Livreur terrain

**Persona testé** : Pierre Morel — Livreur terrain, 6 ans d'ancienneté, 80 à 120 colis par jour, Android (Samsung), zones péri-urbaines, souvent sans réseau 30 à 40 minutes d'affilée.
**Date** : 2026-04-05
**US couvertes dans ce tour** : US-046 (signature réelle), US-055 (navigation), US-056 (offline persistant), US-062 (compteur envois en attente), US-038 (libellés), US-043 (card SSO), US-025/design

---

## Mon contexte de journée

Je démarre à 6h30. Je prends mon téléphone, je lance DocuPost, je me connecte, et je dois être au premier colis avant 7h15. Je n'ai pas le temps de chercher comment ca marche. Quand quelque chose ne fonctionne pas, je l'enjambe et je passe à la suite — mais ca me reste en tête toute la journée, et si ca arrive trois fois dans la matinée, je perds confiance dans l'appli. Mon téléphone, c'est mon outil de travail. Je l'utilise avec des gants en hiver, parfois sous la pluie, souvent en marchant.

---

## Ce qui fonctionne bien

**La connexion est enfin stable.**
Depuis la correction du token de session (US-051), je ne me retrouve plus avec une liste vide à l'ouverture sans savoir pourquoi. Avant, j'attendais, je fermais, je rouvrais, je rappelais le superviseur. Maintenant ca charge et c'est tout. C'est le minimum attendu, mais ca fait du bien de l'avoir.

**Le mode hors-ligne tient au redémarrage (US-056).**
C'est la correction la plus importante pour mon quotidien. Sur mes tournées rurales, je peux perdre le réseau 40 minutes. Avant, si l'appli se fermait pendant ce temps — coup de fil entrant, batterie faible — toutes mes confirmations de livraisons disparaissaient. Depuis US-056, les actions restent même si l'appli redémarre. Je n'ai plus à me demander "est-ce que j'ai vraiment enregistré ce colis ou pas".

**Le compteur "envois en attente" est maintenant visible (US-062).**
Le badge OFFLINE dit maintenant "OFFLINE — 3 envois en attente". C'est exactement ce que j'avais demandé au feedback du 04/04. Quand je suis hors réseau depuis 20 minutes et que j'ai traité 6 colis, je vois "6 envois en attente". Je peux dire à mon superviseur par téléphone "oui, tout est enregistré, j'ai juste besoin de réseau pour transmettre". C'est la différence entre travailler avec confiance et travailler dans le flou.

**La vraie signature avec le doigt, enfin (US-046).**
C'est l'amélioration qui change quelque chose de concret pour ma responsabilité professionnelle. Je pose le téléphone, le destinataire trace avec le doigt, je vois le tracé à l'écran, je confirme. Avant, c'était un simple appui sur une zone grise — n'importe qui pouvait contester n'avoir rien signé. Maintenant j'ai un vrai tracé graphique. Si un destinataire dit "j'ai jamais signé", je peux montrer sa signature. C'est aussi simple que ca.

**La card SSO est moins encombrante (US-043).**
Ce truc de "Comment fonctionne la connexion ?" qui prenait la moitié de l'écran avant que je puisse appuyer sur Se connecter — maintenant je peux le replier. Le matin je n'ai pas envie de lire une explication. Je sais me connecter. Le chevron pour replier la carte, c'est un petit truc qui fait gagner 5 secondes chaque matin.

**L'indication "hors connexion" avec le bandeau orange.**
Le bandeau s'affiche maintenant clairement avec la mention hors ligne. En plein soleil sur la vitre de ma voiture, le bandeau orange c'est la bonne couleur — ca attire l'oeil sans gêner la lecture des adresses.

---

## Bloquants (a corriger avant livraison)

### B1 — Le bouton Retour Android reste imprévisible [BLOQUANT]

C'est le bloquant qui m'empêche de travailler normalement. US-055 a posé une fondation, mais "fondation posée" ca veut dire que la moitié fonctionne et l'autre moitié non. En pratique aujourd'hui :

- Depuis la liste des colis, appuyer sur Retour fonctionne (ca revient à la connexion).
- Depuis le détail d'un colis, appuyer sur Retour fait n'importe quoi — soit ca revient à la liste, soit ca ferme l'appli, selon le moment.
- Depuis le pad de signature, appuyer sur Retour alors que j'ai commencé à saisir une signature : l'appli se ferme parfois sans sauvegarder.

Avec des gants, avec des mains froides, j'appuie sur Retour souvent par accident. Le comportement aléatoire est pire que pas de Retour du tout, parce que je ne sais jamais ce qui va se passer. La migration R2 doit arriver rapidement.

---

## Améliorations importantes

### A1 — Le libellé "A repr." dans les onglets n'est toujours pas changé [IMPORTANT]

Ca fait quatre feedbacks. L'US-038 est dans le backlog depuis le 01/04. Toujours rien. Je vois "A repr." dans les onglets de filtre. En marchant, sans lunettes, a distance d'un bras, "A repr." ca veut dire quoi ? "A reprendre" ? "A réparer" ? "A représenter" ? Je dois m'arrêter et réfléchir. "Repassage", tout le monde comprend du premier coup. Ce n'est pas un caprice de ma part, c'est une question de sécurité de lecture.

### A2 — Le bouton "Scanner un colis" — son statut est flou [IMPORTANT]

Au feedback du 30/03, j'avais signalé ce bouton comme inactif. Au 01/04, toujours pas de confirmation. Au 04/04, les corrections n'en parlaient pas. Aujourd'hui je vois le bouton en bas de la liste des colis. Quand j'appuie dessus, que se passe-t-il exactement ? Est-ce qu'il ouvre le scanner du téléphone ou est-ce qu'il ne fait rien ? Si c'est une fonctionnalité prévue pour plus tard, retirez le bouton. Un bouton présent qui ne fait rien me fait croire que l'appli est bloquée.

### A3 — La navigation entre les écrans de preuve est trop linéaire [IMPORTANT]

Scénario concret : je suis sur le pad de signature, le destinataire me dit "attendez je préfère que vous preniez une photo". Je veux changer le type de preuve. Il n'y a pas de retour propre vers le sélecteur de type. Je dois quitter, tout perdre, et recommencer depuis le détail du colis. Ce sont 3 ou 4 taps perdus. Ca arrive plusieurs fois par semaine. Un bouton "Changer de type" sur l'écran de capture résoudrait le problème.

### A4 — L'horodatage des consignes n'est pas toujours lisible [IMPORTANT]

Dans M-07 (Mes consignes), les consignes affichent l'heure au format "HH:mm". C'est bien pour aujourd'hui. Mais si j'arrive le matin et qu'il y a une consigne de la veille au soir (ca arrive quand un superviseur prépare le lendemain), elle s'affiche avec "JJ/MM HH:mm". Le problème c'est que visuellement ca ressemble aux consignes du jour — je dois lire attentivement pour voir la différence. Un badge "Hier" ou une séparation visuelle entre les consignes du jour et celles de la veille éviterait la confusion.

### A5 — Manque de feedback visuel après confirmation de livraison [MINEUR]

Quand j'appuie sur "CONFIRMER LA LIVRAISON", l'appli revient à la liste des colis avec le colis coché. Mais pendant une ou deux secondes, il se passe quoi exactement ? L'appli traite ? Elle envoie ? Elle a enregistré ? Il n'y a pas de message court du type "Livraison enregistrée !" avant de revenir à la liste. Ce serait rassurant, surtout quand je suis hors ligne — savoir explicitement "c'est enregistré, ca partira quand tu retrouves le réseau".

---

## Points positifs

- La signature réelle (US-046) : c'était le bloquant légal le plus grave, il est résolu.
- Le compteur offline (US-062) : répond exactement à ma demande du 04/04.
- La persistance offline (US-056) : protège mon travail en zone sans réseau.
- La connexion stable (US-051) : élimine les 10 minutes perdues le matin.
- La card SSO pliable (US-043) : petit gain, vrai confort quotidien.
- Le design global est plus propre et lisible qu'avant — les couleurs des statuts (vert livré, rouge échec, bleu en cours) sont claires même en plein soleil.

---

## Priorisation — Top 3 a corriger en urgence

| Rang | Problème | Pourquoi c'est urgent |
|------|----------|----------------------|
| 1 | Bouton Retour Android — terminer la migration R2 | Comportement imprévisible = risque de perte de données et stress permanent |
| 2 | Renommer "A repr." en "Repassage" (US-038) | Bloque la lecture rapide, signalé 4 fois, correction triviale, aucune excuse pour attendre |
| 3 | Clarifier le statut du bouton "Scanner un colis" | Bouton visible mais comportement flou = perte de confiance dans l'appli |

---

## Note globale du jour

**7/10** (contre 5,5/10 le 04/04)

Les deux bloquants du 04/04 sont maintenant résolus : le pad de signature et le compteur offline. C'est une vraie progression. Je reste bloqué sur le Retour Android et sur des libellés qui n'ont toujours pas bougé depuis le 30/03. Quand la migration R2 du Retour Android sera faite et que "A repr." deviendra "Repassage", je monte à 8,5 sans hésiter.

---

## Termes que j'utilise naturellement (signal Ubiquitous Language)

> A transmettre a l'Architecte Metier pour valider / enrichir le glossaire.

| Ce que j'ai vu a l'ecran | Ce que j'aurais dit moi | Difference significative ? |
|--------------------------|------------------------|---------------------------|
| "OFFLINE" (badge) | "Hors ligne" ou "Pas de réseau" | Non — les deux passent en terrain |
| "N envois en attente" (US-062) | "N pas encore envoyé au bureau" | Non — "envois en attente" est compris |
| "A repr." (onglet filtre) | "Repassage" | Oui — signalé 4 fois, toujours pas corrigé |
| "CONFIRMER LA LIVRAISON" | "Valider la livraison" ou "C'est livré" | Mineur — les deux passent |
| "Preuve de livraison" (titre écran) | "Signer la livraison" ou "Justificatif" | Oui — "preuve" est un terme juridique que je n'emploie pas naturellement |
| "Déclarer un échec" (bouton) | "Signaler un problème" ou "Pas pu livrer" | Oui — "échec" est fort, "problème" est plus naturel |
| "Consignes" (écran M-07) | "Mes instructions" ou "Ce que m'a dit le chef" | Mineur — "consignes" est acceptable |
| "Disposition du colis" (écran M-05) | "Que faire du colis ?" | Oui — "disposition" est un mot de bureau |
| "Dépôt sécurisé" (type de preuve) | "Boite aux lettres" ou "Voisin" ou "Coffre" | Oui — trop vague, il me faudrait des options concrètes |
