# Feedback : Interface web de supervision DocuPost

**Persona testé** : Laurent Renaud — Responsable Exploitation Logistique
**Date** : 2026-03-30
**Périmètre testé** : Tableau de bord (US-011), Plan du jour / Préparation (US-021, US-032), Envoi et suivi d'instructions (US-014, US-015, US-016), Export CSV (US-028), Vérification compatibilité véhicule (US-030)

---

## Bloquants (à corriger avant livraison)

- **Pas de nom d'écran visible dans l'onglet navigateur.** Quand j'ai plusieurs onglets ouverts (habituel en salle de supervision), je ne sais plus quel onglet est DocuPost et quel onglet est notre ERP. Le `<title>` de la page devrait afficher quelque chose de clair comme "DocuPost — Supervision" ou "DocuPost — Plan du jour".

- **La connexion WebSocket casse silencieusement.** Le bandeau rouge "Connexion temps réel indisponible" apparaît, mais il ne propose aucune action : pas de bouton "Reconnecter", pas de décompte de tentatives. En pratique, si je ne remarque pas le bandeau (petit texte sur fond rouge en haut d'une page chargée), je continue à piloter sur des données gelées sans le savoir. C'est un risque opérationnel majeur : je pourrais envoyer une instruction sur une tournée déjà clôturée.

- **Aucune confirmation visuelle après envoi d'une instruction.** L'US-014 dit que l'instruction passe à "Envoyée" — mais dans l'interface, après avoir cliqué le bouton d'envoi, rien ne confirme que ça a bien marché. J'attends un message temporaire du type "Instruction envoyée à Pierre Morel" ou un changement de statut immédiat visible. Sans ça, je reclique, je génère des doublons, et Pierre reçoit deux fois la même notification.

---

## Améliorations importantes

- **Le tableau de bord liste les tournées avec leur ID technique** (ex : `T-0042`). Moi je parle de "la tournée de Pierre" ou "la tournée Lyon 3e du matin". L'ID TMS ne me dit rien. Il faut que le nom du livreur soit la donnée principale, et l'ID TMS une info secondaire en petit.

- **Le filtre "A risque" dans le tableau de bord ne me dit pas pourquoi la tournée est à risque.** Je vois le badge rouge "A RISQUE" et le texte "Retard détecté" — mais quel retard ? De combien de minutes ? Sur combien de colis ? Je dois cliquer sur "Voir" pour le savoir. En supervision, j'ai 15 tournées à l'écran, je dois voir le problème sans cliquer.

- **Le Plan du jour (W-04) et le Tableau de bord (W-01) semblent être deux écrans séparés**, mais pour moi c'est le même flux. Le matin je prépare (affecte les livreurs, lance les tournées), puis je supervise. La séparation est logique, mais le passage de l'un à l'autre n'est pas fluide : quand je lance une tournée depuis W-04, je voudrais être redirigé automatiquement vers W-01 pour la voir passer en "En cours".

- **Le bandeau de déconnexion WebSocket utilise un fond rouge** (#ba1a1a) identique au rouge des "tournées à risque". Les codes couleur se confondent : une alerte système ressemble à une alerte métier. Il faudrait distinguer les deux (orange pour les alertes système, rouge pour les alertes métier).

- **L'export CSV (US-028) n'est pas accessible depuis le tableau de bord.** Je dois aller dans "Préparation" pour l'exporter. Le cas d'usage réel : en fin de journée, je veux exporter la liste des colis livrés/en échec pour mon rapport. Ce besoin naît sur le tableau de bord de supervision, pas sur la page de préparation matinale.

- **La vérification de compatibilité véhicule (US-030) est dans la page de détail de la tournée planifiée.** C'est logique. Mais si la vérification échoue (capacité dépassée), je ne sais pas quoi faire ensuite : il n'y a pas de suggestion d'action ("Réaffecter à un véhicule plus grand ?"). Je me retrouve avec un message d'erreur et aucun chemin pour le résoudre depuis l'écran.

- **Le champ de recherche cherche par "nom livreur" uniquement.** Dans mon quotidien, je cherche parfois par code TMS ("où est la tournée T-205 ?") ou par zone ("toutes les tournées sur Villeurbanne"). La recherche actuelle est trop restrictive.

- **L'indicateur "LIVE" dans la TopAppBar est discret.** Quand il passe en "OFFLINE" ou "POLLING", il change de couleur — mais ce badge est en haut à droite, et mon regard est sur le tableau au centre. Une notification plus visible (ou le bandeau rouge actuel, mieux positionné) serait plus efficace.

---

## Points positifs

- **Le bandeau résumé en 3 cases (Actives / Clôturées / A risque)** est ce dont j'ai besoin en premier coup d'oeil le matin. Je sais immédiatement où en est la journée sans lire un tableau entier. C'est exactement ce que j'attends d'un outil de supervision.

- **Les tournées "A risque" remontent automatiquement en tête de tableau.** Je n'ai pas à chercher — le problème vient à moi. Le fond orange par ligne est un bon signal visuel.

- **L'alerte sonore discrète (US-013) pour une nouvelle tournée à risque** est une très bonne idée. Je travaille souvent sur d'autres documents, j'ai l'écran en fond. Le bip me fait regarder l'écran sans être agressif.

- **La barre de progression par tournée** (X/Y colis, avec pourcentage) donne une lecture rapide de l'avancement. C'est beaucoup mieux qu'un statut texte seul.

- **Le Plan du jour avec les filtres Toutes / Non affectées / Affectées / Lancées** correspond exactement à mon flux de travail du matin. Je commence par "Non affectées", je traite chaque ligne, puis je passe à "Affectées" pour lancer. La logique est bonne.

- **Le statut des instructions (Envoyée / Exécutée) dans le détail de tournée** répond directement au problème que j'avais : avant, je devais rappeler le livreur pour savoir s'il avait vu. Maintenant je vois l'état en temps réel. C'est le gain le plus concret de l'outil.

---

## Termes que j'utilise naturellement (signal Ubiquitous Language)

| Ce que j'ai vu à l'écran | Ce que j'aurais dit moi | Différence significative ? |
|--------------------------|------------------------|---------------------------|
| "Tournée" (W-04, W-01) | "La tournée de Pierre" ou "la tournée Lyon" | Oui — l'ID TMS seul ne fait pas sens pour moi |
| "NON AFFECTÉE" (badge statut) | "Pas encore préparée" ou "à préparer" | Oui — "affectée" est technique, pas naturel |
| "Lancer" (bouton lancer tournée) | "Démarrer" ou "Envoyer le livreur" | Non — "lancer" est accepté |
| "A risque" (badge) | "En retard" ou "à surveiller" | Oui — "à risque" est vague, je dirais "en retard" |
| "Instruction" (feature envoi) | "Message" ou "consigne" ou "ordre" | Oui — "consigne" est le terme que j'utilise avec mes livreurs |
| "Prioriser" (type d'instruction) | "Passer en priorité" ou "traiter en premier" | Non — "prioriser" est compris |
| "Exécutée" (statut instruction) | "Pris en compte" ou "vu" | Oui — "exécutée" suppose l'action faite, "pris en compte" est plus précis pour l'accusé de lecture |
| "Composition vérifiée" (US-030) | "Chargement vérifié" | Oui — "composition" est un terme interne TMS, peu parlant |
| "TourneeLancee" (event) | [non visible] | — |
| "Plan du jour" (nom de l'onglet) | "Préparation du matin" ou "Planning" | Non — "plan du jour" est clair |
| "Avancement" (colonne tableau) | "Progression" | Non — les deux fonctionnent |
| "Activité" (colonne dernière action) | "Dernier mouvement" ou "dernière mise à jour" | Oui — "activité" est trop vague |

---

## Notes complémentaires terrain

**Sur le mode offline / perte de connexion** : je travaille depuis un poste fixe en salle, la connexion est en général stable. Mais le vendredi matin (pic de charge réseau), ça peut fluctuer. Le fait que le WebSocket se reconnecte automatiquement est bien — mais je voudrais savoir depuis combien de temps je suis déconnecté, pas juste "vous l'êtes". Un compteur "Déconnecté depuis 2 min 30" me donnerait une mesure pour décider si je dois agir.

**Sur les écrans de préparation** : la vérification de compatibilité véhicule (poids/volume) est un vrai besoin terrain. Mes livreurs chargent parfois trop et ça crée des problèmes en route. Avoir cette alerte avant le départ est une bonne chose. Mais la donnée "poids estimé" n'est pas affichée sur la ligne de tournée — je dois aller dans le détail pour la voir. Elle devrait être visible dans le tableau directement.
