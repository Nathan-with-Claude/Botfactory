# Feedback terrain — Corrections As-Built
> Pierre Morel, livreur | 2026-04-04

---

## Ce qui s'améliore

**La connexion qui plante silencieusement, c'est réglé.**
Avant, quand je me connectais et que l'appli contactait le bureau pour récupérer mes colis, il pouvait se passer quelque chose de bizarre : la liste arrivait vide, ou certaines instructions du superviseur n'apparaissaient jamais, sans aucun message d'erreur. Je pensais que c'était réglé, mais en fait le téléphone n'envoyait pas correctement mon badge d'identification au serveur. Maintenant c'est corrigé. Ca m'évite de perdre dix minutes à redemander ma tournée par téléphone parce que l'appli n'a rien affiché.

**Le mode hors-ligne tient maintenant au redémarrage.**
C'est la correction qui m'intéresse le plus concrètement. Avant, si je scannais des colis sans réseau et que l'appli se fermait — batterie à plat, coup de fil entrant qui plante l'appli, peu importe — toutes mes actions locales disparaissaient. Je devais tout refaire. Maintenant les actions sont gardées même si l'appli redémarre. En tournée rurale où je passe 30-40 minutes sans réseau, c'est la correction que j'attendais depuis le premier feedback.

**Le bouton Retour Android, on avance.**
La fondation est posée. Ca ne fait pas tout encore, mais au moins quelqu'un a pris le sujet au sérieux. Sur mon Samsung, le bouton physique ne faisait rien ou fermait l'appli sans prévenir. Savoir qu'une migration complète est prévue, ca me rassure pour la suite.

---

## Ce qui me pose encore problème

### 1. Je ne vois toujours pas combien d'actions sont "en attente de synchro" [BLOQUANT]

La persistance est corrigée en dessous — mes actions ne disparaissent plus. Mais en surface, je ne vois toujours pas un compteur clair du type "3 actions en attente". Quand je suis hors ligne pendant 40 minutes et que j'ai déclaré 8 livraisons, je veux savoir que ces 8 actions sont bien stockées et combien il en reste à envoyer au bureau. Sans ce compteur visible, je ne peux pas confirmer à mon superviseur "oui tout est enregistré, attends que je retrouve le réseau". Je dois prendre les gens au mot. Ca ne suffit pas.

Concrètement : le badge OFFLINE est là, c'est bien. Mais il ne dit pas "OFFLINE — 8 en attente". Il dit juste OFFLINE. Ce n'est pas assez.

### 2. La signature reste simulée — problème légal toujours présent [BLOQUANT]

Ca fait trois sessions de feedback que je signale ce point. Je ne vais pas changer mon avis : appuyer une fois sur une zone vide ne constitue pas une signature. Si un destinataire conteste avoir signé, je ne pourrai pas prouver qu'il a tracé quoi que ce soit sur mon écran. Les corrections du 04/04 n'ont pas touché ce sujet. Je comprends que c'est une US distincte à créer, mais je le remets ici parce que c'est le risque le plus grave pour mon travail au quotidien.

### 3. Le bouton Retour Android n'est que partiellement géré [IMPORTANT]

La fondation est posée, mais "partiellement géré" en pratique ca veut dire : des fois ca marche, des fois ca ferme l'appli, des fois ca fait rien. En conditions réelles, avec des gants, en pleine rue, ce comportement imprévisible est pire que pas de bouton du tout. Je ne sais jamais ce qui va se passer. J'ai appris à ne plus appuyer dessus, mais ca reste une source de stress.

### 4. L'onglet "A repr." n'a toujours pas changé [IMPORTANT]

Trois feedbacks, aucun changement. L'US-038 est dans le backlog depuis le 01/04, mais rien n'a bougé. En tournée, quand je regarde ma liste à la volée, ce raccourci ne passe pas. "Repassage" c'est deux fois moins de caractères et tout le monde comprend du premier coup.

### 5. Le bouton "Scanner un colis" est-il encore inactif ? [IMPORTANT]

Je n'ai pas de confirmation que ce point a été traité. Le TODO était là au 30/03, au 01/04. Les corrections du 04/04 ne le mentionnent pas. Si ce bouton est encore visible et ne fait rien, il faut soit l'activer, soit le retirer de l'écran. Un bouton qui ne réagit pas me fait penser que l'appli est bloquée.

---

## Mes demandes prioritaires

| Priorité | Demande | Pourquoi c'est important pour moi |
|----------|---------|----------------------------------|
| 1 - Bloquant | Afficher le nombre d'actions en attente dans le badge OFFLINE | Sans ca je ne sais pas si mes 8 livraisons hors-ligne sont bien mémorisées |
| 2 - Bloquant | Intégrer le vrai pad de signature avec tracé du doigt | Risque légal direct — le destinataire peut contester n'avoir jamais signé |
| 3 - Important | Terminer la gestion du bouton Retour Android | Comportement imprévisible = stress permanent, surtout avec des gants |
| 4 - Important | Renommer "A repr." en "Repassage" dans les onglets | Lisibilité immédiate, sans réflexion, même en marchant |
| 5 - Important | Confirmer le statut du bouton "Scanner un colis" | Bouton visible mais inactif = confusion et perte de confiance dans l'appli |

---

## Note globale

**5,5/10**

Les corrections techniques du 04/04 sont solides : la persistance offline est la plus importante pour moi et elle est maintenant là. La connexion qui envoyait mal le token, corrigée, c'est le genre de bug invisible qui empoisonne la journée sans qu'on sache pourquoi. Mais les deux bloquants de fond — la signature et le compteur d'actions offline — ne sont pas résolus. Et l'onglet "A repr." qui traîne depuis le 30/03 sans être corrigé, ca commence à ressembler à de l'oubli. J'attends surtout la migration complète du bouton Retour et un vrai pad de signature. Quand ces deux points seront faits, je remonte facilement à 7,5 ou 8.

---

## Termes que j'utilise naturellement (signal Ubiquitous Language)

> A transmettre a l'Architecte Metier pour valider / enrichir le glossaire.

| Ce que j'ai vu a l'ecran | Ce que j'aurais dit moi | Difference significative ? |
|--------------------------|------------------------|---------------------------|
| "OFFLINE" (badge statut) | "Hors ligne" ou "Pas de réseau" | Non — les deux passent |
| "Actions en attente de synchronisation" (terme technique) | "Envois en attente" ou "Pas encore envoyé au bureau" | Oui — "synchronisation" est du jargon IT, "envoyé au bureau" c'est ce que je fais |
| "Persistance offline" (terme developpeur) | [non visible par le livreur] | — |
| "Migration react-navigation" (terme dev) | [non visible] | — |
| "Bearer token" (technique SSO) | "Mon badge de connexion" ou "ma session" | Oui — si ca apparaissait dans un message d'erreur, je ne comprendrais pas |
| "A repr." (onglet liste colis) | "Repassage" | Oui — signalé trois fois, toujours pas corrigé |
