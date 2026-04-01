# Feedback : Application mobile livreur DocuPost

**Persona testé** : Pierre Morel — Livreur terrain
**Date** : 2026-03-30
**Périmètre testé** : Connexion SSO (US-019), Liste des colis (US-001), Filtre par zone (US-003), Détail d'un colis (US-002), Déclaration d'échec (US-005), Capture de signature (US-008), Réception d'instructions superviseur (US-015, US-016)

---

## Bloquants (à corriger avant livraison)

- **La signature est simulée par un simple appui sur la zone** — en production, si le destinataire appuie au mauvais endroit ou frôle l'écran, la signature est "capturée" sans qu'il ait vraiment signé. Le pad de signature réel (tracé du doigt) n'est pas encore intégré (note dans le code : "MVP, intégration react-native-signature-canvas à faire"). C'est un bloquant fonctionnel : un simple appui sans tracé ne constitue pas une preuve opposable. Le destinataire peut contester avoir signé. Il faut un vrai tracé avant la livraison en production.

- **Aucun indicateur offline visible sur l'écran de connexion ni sur la liste des colis.** Si je suis en zone blanche et que j'ouvre l'appli, j'obtiens un spinner de chargement indéfini ("Chargement de votre tournée...") qui ne se termine jamais. Je ne sais pas si c'est une panne de l'appli, mon réseau, ou le serveur. Le bandeau offline orange prévu dans les wireframes n'est pas affiché sur l'écran de liste (`ListeColisScreen` — l'`IndicateurSync` est présent dans le header mais il est toujours en état "live" côté code, sans lecture réelle du statut réseau). En tournée rurale, je passe régulièrement en zone blanche. C'est un bloquant quotidien.

- **Le bouton "Scanner un colis" dans le footer ne fait rien.** Il est présent avec l'icône appareil photo, mais un `// TODO US-028 : scanner un colis` est dans le code — aucune action déclenchée. Pour mes clients qui ont des codes-barres complexes, je ne peux pas utiliser ce bouton. Si un bouton est visible mais ne fait rien, c'est pire que son absence : je vais appuyer plusieurs fois en pensant que l'appli est bloquée.

---

## Améliorations importantes

- **L'écran de connexion n'affiche pas le nom de l'application de façon immersive.** Je vois "DocuPost" en grand et "Application Livreur" en dessous. C'est correct. Mais la card bleue "Comment ça fonctionne ?" explique le flux SSO avec un texte long. En tant que livreur qui utilise l'appli chaque matin depuis des semaines, ce texte explicatif ne m'apporte rien après la première fois. Il prend de la place et ralentit visuellement mon accès au bouton de connexion. Cet encart devrait être rétractable après la première connexion.

- **Le libellé du bouton de connexion est trop long.** "Se connecter via compte Docaposte" fait 38 caractères. Sur un petit écran (certains collègues ont des Redmi 10), le texte se coupe ou se compresse. "Connexion Docaposte" ou "Se connecter" suffirait — tout le monde dans l'entrepôt sait qu'on utilise nos comptes Docaposte.

- **L'onglet "A repr." dans la liste des colis** est abrégé. La première fois, je ne comprends pas ce que ça signifie. "A repr." veut dire "A représenter" — c'est un terme métier que je comprends, mais l'abréviation sur l'onglet n'est pas lisible. Soit j'affiche le texte complet avec un scroll horizontal (les onglets sont scrollables selon le code), soit j'utilise une abréviation plus claire comme "Repassage".

- **Après avoir déclaré un échec, je suis renvoyé directement à la liste.** Je ne vois pas de confirmation que mon échec a bien été enregistré. Un message bref ("Échec enregistré — Votre superviseur a été notifié") pendant 2-3 secondes serait rassurant. Sinon je me demande si ça a marché, je retourne dans le colis pour vérifier le statut — perte de temps.

- **Le swipe gauche pour aller directement à l'écran d'échec (US-029) est implémenté mais invisible.** Il n'y a aucun indicateur visuel que je peux swiper une carte colis. En terrain, je ne vais jamais découvrir ce geste par hasard. Une petite icône de flèche ou un micro-texte "Swipe pour signaler un échec" serait utile, au moins les premiers jours d'utilisation.

- **Sur l'écran de capture de preuve (M-04), je dois d'abord choisir un "type de preuve"** avant de voir le pad de signature. Les 4 options (Signature, Photo, Tiers identifié, Dépôt sécurisé) sont dans une grille 2x2. Dans 90% des cas, je prends une signature. Ce choix devrait être pré-sélectionné par défaut, ou la signature devrait être la première option visuellement dominante. Je ne devrais pas avoir à choisir à chaque colis.

- **Le bouton "Retour" sur l'écran de capture de signature (M-04) renvoie vers le détail du colis**, pas vers la liste. Si j'arrive à la signature après plusieurs étapes (liste > détail > preuve), le bouton retour sur M-04 renvoie bien vers le détail — mais si je veux retrouver la liste rapidement, je dois faire deux "retour". En tournée avec 30 colis par heure, chaque clic compte.

- **L'écran d'échec de livraison (M-05) a un header entièrement rouge.** C'est volontaire (signal contextuel). Mais en plein soleil, sur mon téléphone avec la luminosité pas au max, le texte blanc sur fond rouge (#ba1a1a) est difficile à lire, surtout le bouton retour en "rouge clair" sur fond rouge foncé. En conditions réelles (livraison d'été, soleil de face), c'est un vrai problème de lisibilité.

- **La section "Disposition" sur l'écran d'échec est grisée tant que le motif n'est pas sélectionné.** C'est logique UX, mais la section grisée n'est pas masquée — elle occupe de l'espace et peut être confondue avec un contenu inactif permanent. Un nouveau livreur pourrait ne pas comprendre qu'il faut d'abord choisir un motif pour débloquer la disposition. Un texte d'aide ("Choisissez d'abord un motif") améliorerait la compréhension.

- **Le bandeau d'instruction superviseur (M-06) disparaît automatiquement après 10 secondes.** Si je suis en train de monter dans mon camion ou de chercher un numéro de rue, je peux manquer le message. 10 secondes c'est court. Je voudrais pouvoir accéder à l'instruction depuis un historique des consignes, même après la fermeture du bandeau.

---

## Points positifs

- **La liste des colis se charge vite** et les colis sont clairement présentés avec l'adresse en grand, le nom du destinataire, et le badge de statut coloré. C'est lisible même en marchant.

- **Les onglets par statut (Tous / A livrer / Livre / Echec / A repr.) avec les compteurs** me donnent une vue rapide de l'avancement de ma tournée sans avoir à compter moi-même. En fin de journée, je vois d'un coup d'oeil "Livré : 18 / Echec : 2 / Reste : 3".

- **Le filtre par zone géographique** est très pratique. Quand je travaille sur un secteur précis avant de passer au suivant, je n'ai plus besoin de faire défiler toute la liste pour trouver les colis de ma zone. C'est un vrai gain de temps.

- **Le BandeauProgression ("Reste à livrer : X / Y")** est le premier truc que je regarde en ouvrant la liste. Je sais exactement où j'en suis. Le pourcentage en plus c'est bien pour la motivation.

- **L'animation checkmark vert après confirmation d'une livraison** est satisfaisante. C'est un petit détail mais ça donne une confirmation claire et agréable que le colis est bien "coché". Ça donne envie de passer au suivant.

- **Le header rouge sur l'écran d'échec** (même si c'est difficile à lire en plein soleil) est un bon signal contextuel : je sais tout de suite que je suis sur un écran "problème", ça diminue le risque de valider une livraison par erreur.

- **Le banneau instruction superviseur (M-06) qui arrive par-dessus l'écran courant** est moins intrusif qu'un appel téléphonique. Je vois l'instruction, j'appuie sur "VOIR" et je suis directement sur le colis concerné. C'est fluide.

- **L'écran de connexion explique clairement le flux SSO** avec la card bleue "Comment ça fonctionne ?". Pour les nouveaux livreurs qui ne connaissent pas le SSO, c'est rassurant — ils comprennent qu'ils n'ont pas à créer un nouveau compte.

- **La détection de la tournée vide** ("Aucun colis assigné pour aujourd'hui. Contactez votre superviseur.") avec un message clair est bien pensée. Pas de plantage, pas d'écran blanc — un message actionnable.

---

## Termes que j'utilise naturellement (signal Ubiquitous Language)

| Ce que j'ai vu à l'écran | Ce que j'aurais dit moi | Différence significative ? |
|--------------------------|------------------------|---------------------------|
| "Ma tournée" (header M-02) | "Mon chargement" ou "mes livraisons du jour" | Oui — "tournée" est le terme que j'utilise aussi, pas de problème |
| "Reste à livrer : X / Y" (bandeau) | "Il me reste X colis" | Non — les deux fonctionnent |
| "A livrer" (statut colis) | "A faire" ou "pas encore livré" | Non — "à livrer" est clair |
| "Echec" (statut colis) | "Non livré" ou "raté" | Oui — "échec" fait très officiel, en tournée je dis "ça a pas passé" |
| "A représenter" (statut colis + onglet) | "Repassage" ou "à rerepasser" | Oui — "à représenter" est compris mais peu naturel |
| "Déclarer un échec" (bouton M-03) | "Signaler un problème" ou "marquer non livré" | Oui — "déclarer" fait administratif, "signaler" est plus naturel |
| "ENREGISTRER L'ECHEC" (bouton M-05) | "Valider" ou "Confirmer le problème" | Oui — le verbe "enregistrer" est inhabituel terrain |
| "Disposition" (section M-05) | "Que fait-on du colis ?" | Oui — "disposition" est technique, pas naturel |
| "A représenter" (disposition) | "Repasser demain" | Oui — même remarque |
| "Dépôt chez tiers" (disposition) | "Chez le voisin" ou "laissé au gardien" | Oui — "tiers" est juridique, en réalité c'est "chez quelqu'un d'autre" |
| "Retour dépôt" (disposition) | "Ramener au dépôt" | Non — compris |
| "Preuve de livraison" (header M-04) | "Signature" ou "je fais signer" | Oui — "preuve" est plus large, en pratique je "fais signer" |
| "Instruction superviseur" (bandeau M-06) | "Message du chef" ou "consigne" | Oui — "instruction" est formel, dans le camion je parle de "message du bureau" |
| "Action Requise" (label bandeau M-06) | "A faire" ou "consigne urgente" | Oui — "Action requise" c'est du jargon IT |
| "CONFIRMER LA LIVRAISON" (bouton M-04) | "C'est livré" ou "Valider" | Oui — trop formel mais compris |

---

## Notes complémentaires terrain

**Conditions d'utilisation réelles** : j'utilise l'appli avec des gants de travail (hiver), sous la pluie, parfois avec l'écran en plein soleil. Les boutons doivent être grands (les CTA 56px et les touch targets 48px sont bien), les contrastes élevés (le rouge sur rouge de M-05 pose problème), et les actions principales accessibles en 1 à 2 taps maximum.

**Sur la signature numérique** : faire signer quelqu'un sur un téléphone, c'est souvent compliqué. Le destinataire hésite, ne sait pas comment tenir le téléphone, fait des gestes maladroits. Le pad de signature doit être grand (180px c'est bien), avec une ligne de base visible pour guider le geste. Ce qui me manque : un message pour le destinataire du type "Signez dans le cadre ci-dessous". Là, la zone de signature affiche "Signez ici" en petit au centre — mais si le destinataire ne voit pas bien, il ne sait pas où signer.

**Sur le mode offline** : en zone rurale je peux passer 30-40 minutes sans réseau. Aujourd'hui l'appli semble bloquer dans ce cas. J'ai besoin de savoir que mes actions sont bien sauvegardées localement et se synchroniseront dès que j'aurai du réseau. Le compteur "1 action en attente de synchronisation" mentionné dans la US-005 scénario 4 n'est pas visible — est-il implémenté ?
