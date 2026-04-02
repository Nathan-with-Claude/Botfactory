# Feedback : Application mobile livreur DocuPost

**Persona testé** : Pierre Morel — Livreur terrain, 6 ans d'ancienneté, Android, zones péri-urbaines
**Date** : 2026-04-01
**Périmètre testé** : Design system mobile (US-025), Refactorisation écrans livreur (US-026), Swipe rapide échec (US-029), Card SSO rétractable (US-036), Historique des consignes (US-037)

---

## Bloquants (à corriger avant livraison)

- **La signature est toujours simulée par un simple appui — problème non résolu.** Le feedback du 30/03 signalait l'absence du pad de tracé réel. D'après le code de US-026, la `SignaturePad` dispose maintenant d'une ligne de base pointillée et d'un texte d'aide, mais aucune mention de l'intégration `react-native-signature-canvas`. Le simple appui sans tracé reste un problème opposable : un destinataire peut contester n'avoir jamais signé. C'est un bloquant légal avant toute mise en production.

- **L'indicateur de statut réseau sur la liste des colis reste silencieux en zone blanche.** L'`IndicateurSync` est maintenant un composant du design system (US-025), ce qui est bien. Mais d'après l'implémentation de US-026, le composant reçoit `syncStatus="live"` en dur — il n'y a toujours pas de lecture réelle de la connectivité réseau dans `ListeColisScreen`. En zone rurale, si je coupe ma connexion, la liste n'affiche pas de bandeau "Hors ligne". Je ne sais pas si mes actions sont sauvegardées ou perdues. Le hook `useNetworkStatus` a été créé (US-026 cite `src/mobile/src/hooks/useNetworkStatus.ts`), mais son raccordement à `ListeColisScreen` n'est pas confirmé dans l'implémentation.

- **Le swipe gauche pour déclarer un échec est invisible sans découverte.** L'US-029 est implémentée et fonctionne techniquement, mais aucun indicateur visuel ne m'indique que le geste est possible. La zone rouge "Échec" n'apparaît qu'après un swipe de plus de 80 pixels — je ne peux pas deviner ça en arrivant devant une porte close. Même mes collègues les plus tech n'auraient pas idée de faire ce geste sans en être informés. Sans onboarding ou hint visuel (chevron, micro-label), la fonctionnalité existe mais ne sera jamais utilisée. C'est un bloquant d'adoption pour une US dont le but est d'accélérer la déclaration d'échec.

---

## Améliorations importantes

- **La card SSO rétractable (US-036) est bien implémentée — merci.** Elle se replie après la première connexion, se déplie au toucher du chevron. C'est exactement ce que je demandais. En revanche, j'aurais besoin que la card soit aussi rétractable manuellement dès la première utilisation (pas seulement après connexion) : le matin, quand j'ai déjà mon badge sous la main, je veux juste appuyer sur "Se connecter" sans lire les explications. Une option "Ne plus afficher" ou un bouton de réduction dès la première ouverture serait parfait.

- **Le bouton "Consignes" avec le badge rouge dans le bandeau de progression (US-037) est une bonne idée**, mais il risque d'être confondu avec le compteur de colis. Les deux badges visuels sont proches dans la même zone. En tournée rapide, je regarde le bandeau en moins d'une seconde — le badge "Consignes" doit se distinguer clairement. Une icône différente (cloche, message) plutôt qu'un simple badge numérique rouge m'aiderait à distinguer "j'ai des consignes non lues" de "il reste des colis".

- **L'écran des consignes (M-07) est bien structuré**, avec le bouton "Voir le colis" pour naviguer directement vers le détail. C'est exactement ce dont j'avais besoin après la fermeture du bandeau M-06. Un point qui manque encore : la date et l'heure d'émission de chaque consigne. Si j'ai trois consignes dans ma liste, je veux savoir laquelle est la plus récente. L'horodatage est stocké dans le modèle, il suffit de l'afficher.

- **L'onglet "A repr." reste ambigu.** Le feedback du 30/03 le signalait déjà, et US-026 n'a pas changé ce libellé. "A repr." n'est pas lisible au premier coup d'oeil. En conditions réelles (soleil, lunettes de vue, déplacement), ce raccourci ne passe pas. "Repassage" serait plus clair.

- **Le motif "Absent" n'est pas pré-sélectionné dans M-05 depuis le swipe.** L'implémentation US-029 indique que le motif "Absent" est pré-sélectionné à l'ouverture de M-05 via swipe. Si c'est bien le cas, c'est un gain réel — en pratique 80% de mes échecs sont "absent". Je signale ce point pour vérification lors des tests manuels, car la spec dit que c'est implémenté mais je ne peux pas le confirmer sans tester l'app en vrai.

- **Le bouton "Scanner un colis" dans le footer.** Il était mentionné comme bloquant au 30/03 (TODO non implémenté). Les US récentes (US-025 à US-037) ne semblent pas l'avoir adressé. S'il est toujours inactif, il doit être retiré de l'interface ou clairement désactivé avec un label explicatif. Un bouton visible qui ne fait rien est pire que son absence.

- **Après la déclaration d'un échec via le swipe, aucune confirmation de retour.** Le feedback du 30/03 demandait un message "Échec enregistré — Votre superviseur a été notifié". Je ne vois pas cette confirmation dans US-029 ou US-026. Une fois que je valide M-05 après le swipe, est-ce que je reviens bien à la liste avec un retour visuel ? Ce point reste à vérifier.

- **Le design system unifié (US-025 + US-026) améliore visiblement la cohérence.** Les cartes colis sont plus propres, les badges de statut sont lisibles, les boutons CTA respectent bien la taille minimale 56dp. C'est une amélioration solide sur l'ensemble des écrans.

---

## Points positifs

- **La card SSO rétractable (US-036) est fonctionnelle et bien pensée.** La mémoire de préférence (AsyncStorage) fait que si je replie la card, elle reste repliée le lendemain. C'est du travail soigné.

- **L'historique des consignes (US-037) répond directement au problème du bandeau éphémère.** Plus besoin d'avoir l'oeil fixé sur l'écran pendant 10 secondes pour ne pas rater un message du superviseur. Je peux rouvrir la liste à tout moment. C'est le bon fonctionnement.

- **Le bouton "Marquer exécutée" dans M-07 est logique.** Quand j'ai traité la consigne, je peux confirmer sans repasser par le bandeau. La synchronisation backend silencieuse (sans bloquer mon action) est la bonne approche.

- **La navigation M-07 vers M-03 (bouton "Voir le colis")** est exactement ce qu'il faut. Depuis la liste des consignes, d'un clic j'accède au colis concerné. C'est fluide.

- **Le swipe gauche (US-029) est bien calibré techniquement.** Le seuil de 80 pixels évite les déclenchements accidentels. Le spring-back si le geste est trop court est un bon garde-fou. Le problème est la découvrabilité, pas la mécanique.

- **Les composants du design system (CarteColis, BandeauProgression, BadgeStatut) ont des touch targets conformes WCAG.** En tournée avec des gants, c'est une vraie amélioration par rapport aux éléments précédents.

- **L'animation checkmark après livraison confirmée** est toujours là et toujours satisfaisante. Ce petit détail compte beaucoup psychologiquement sur 80+ colis par jour.

---

## Termes que j'utilise naturellement (signal Ubiquitous Language)

| Ce que j'ai vu à l'écran | Ce que j'aurais dit moi | Difference significative ? |
|--------------------------|------------------------|---------------------------|
| "Mes consignes" (titre M-07) | "Mes messages du bureau" ou "Mes consignes" | Non — "consignes" est le bon terme |
| "Marquer exécutée" (bouton M-07) | "C'est fait" ou "Confirmé" | Oui — "exécutée" est formel, je dirais "c'est traité" |
| "Prise en compte" (statut consigne après lecture) | "Vue" ou "Lu" | Oui — "prise en compte" suppose une action, "vu" suffit pour l'accusé de lecture |
| "Swipe pour signaler" (non visible) | "Glisser vers la gauche pour déclarer un problème" | Oui — si un jour c'est écrit à l'écran, employer "glisser" plutôt que "swipe" |
| "Echec" (zone rouge du swipe) | "Problème" ou "Non livré" | Oui — même remarque que le 30/03 |
| "Historique des consignes" (nom de la fonctionnalité) | "Mes consignes du jour" | Non — les deux fonctionnent |
| "Card SSO rétractable" (terme technique) | [non visible par le livreur] | — |
| "A représenter" → "A repr." (onglet) | "Repassage" | Oui — pas changé depuis le 30/03 |

---

## Notes complémentaires terrain

**Sur le swipe et la découvrabilité** : la fonctionnalité US-029 est bien construite techniquement, mais sur le terrain elle ne sera pas découverte spontanément. Une micro-interaction d'onboarding (la carte qui "frémit" légèrement au premier chargement pour suggérer le geste) ou un texte d'aide visible uniquement les premiers jours ("Glissez vers la gauche pour déclarer un problème") serait suffisant. Inutile de surcharger l'UI pour les utilisateurs expérimentés — afficher ce hint uniquement les 3-5 premières fois.

**Sur l'offline et la synchronisation** : le hook `useNetworkStatus` existe dans la codebase (US-026 le mentionne) mais je ne suis pas certain qu'il soit branché à `ListeColisScreen`. En conditions réelles, c'est le premier test que je ferais : couper le wifi, tenter une livraison, vérifier que l'appli affiche "Hors ligne — vos actions seront synchronisées" plutôt qu'un spinner infini. C'est la fonctionnalité la plus critique pour mon quotidien en zone rurale.

**Sur la session de test** : je n'ai pas pu tester l'application en conditions réelles (expo start sur appareil physique) — ce feedback est basé sur la lecture des implémentations et des wireframes. Les points signalés comme "à vérifier" nécessitent une session de test manuel.
