# Evolution Design — DocuPost UI v2.0

> Document produit le 2026-03-25 par @ux.
> Synthese des changements UI entre la v1.1 (wireframes initiaux) et la v2.0 (redesign).
> Destination : PO (@po) et Developpeur (@developpeur).

---

## 1. Changements UI par ecran — Avant / Apres

### W-04 : Vue liste des tournees du matin

| Element | v1.1 (avant) | v2.0 (apres) | Impact |
|---------|-------------|-------------|--------|
| Header | Titre + date + bouton deconnexion simple | Header 64px avec avatar, nom utilisateur, menu deroulant | UX — reconnaissance de l'utilisateur connecte |
| Bandeau resume | Compteurs textuels statiques | Chips cliquables agissant comme filtres rapides | UX — raccourci vers les tournees non affectees |
| Bouton "Lancer toutes" | Visible en permanence | Visible uniquement si conditions remplies (toutes affectees, aucune lancee) | Reduction des erreurs |
| Colonne Statut | Badge texte coloré | Badge avec point (●) + couleur semantique depuis design-system.md | Coherence design system |
| Ligne anomalie | Surbrillance orange + texte | Fond --color-fond-alerte + bordure gauche 4px + tooltip au survol | Meilleure salience visuelle |
| Filtre Recherche | Absent | Champ de recherche en temps reel | Nouvelle fonctionnalite |
| Bouton "Rafraichir TMS" | Dans le header | Dans la zone filtres, libelle + icone rotation | Meilleure decouverte |
| Empty state | Message texte simple | Illustration + message + bouton "Forcer l'import" | Guidance utilisateur |
| Pagination | "Charger plus" seul | "Charger plus" + compteur "Affichage X / Y" | Orientation utilisateur |

---

### W-05 : Detail d'une tournee a preparer

| Element | v1.1 (avant) | v2.0 (apres) | Impact |
|---------|-------------|-------------|--------|
| Header | Titre + statut + retour | Fil d'Ariane complet + statut inline + indicateur anomalie | Orientation dans la navigation |
| Onglet Composition | Zones + contraintes lineaires | Layout 2 colonnes : zones+contraintes a gauche, anomalie+recap a droite | Meilleure densite d'information |
| Barres de repartition | Absent | Barres proportionnelles par zone | Visualisation rapide de la charge |
| Recap tournee | Absent | Bloc : poids estime, duree estimee, distance estimee | Information cle pour l'affectation |
| Export CSV | Absent | Bouton "Exporter CSV" sur la liste des colis | Besoin terrain (reporting) |
| Onglet Affectation | Formulaire basique | Formulaire structure, compteurs de disponibilite, champ remarque interne | Contexte de decision ameliore |
| Bouton "Valider et Lancer" anomalie | Label generique | Label "Lancer malgre l'anomalie ⚠" avec fond --color-avertissement | Prise de conscience forcee |
| Verification compatibilite vehicule | Absent | Alerte si poids estime > capacite vehicule | Prevention d'incident |
| Navigation retour avec modifications | Perte silencieuse | Dialog de confirmation "Abandonner les modifications ?" | Prevention de perte de donnees |

---

### W-01 : Tableau de bord superviseur

| Element | v1.1 (avant) | v2.0 (apres) | Impact |
|---------|-------------|-------------|--------|
| Bandeau resume | Compteurs statiques + point rouge | Fond dynamique (--color-fond-alerte si risque), compteurs cliquables | Attention immediatement dirigee |
| Badge LIVE | Absent | Badge [●LIVE] / [●POLLING] / [●ERREUR] avec animation pulse | Fiabilite percue |
| Ligne "A risque" | Surbrillance orange | Fond + bordure gauche 4px + tri automatique en haut | Salience renforcee |
| Barre progression | Texte "X/Y + %" | Barre graphique coloree + valeurs | Lecture instantanee |
| Colonne Activite | "Il y a X min" | "Il y a X min" + rouge si > 15min + alerte si > 30min | Detection silence livreur |
| Alerte sonore | Mentionnee | Toggle activation/desactivation dans le menu utilisateur | Controle utilisateur |

---

### W-02 : Detail d'une tournee (supervision)

| Element | v1.1 (avant) | v2.0 (apres) | Impact |
|---------|-------------|-------------|--------|
| Badge retard | Texte "Retard estimé : Xmin" | Badge rouge gras + barre progression --color-alerte | Urgence visible |
| Sous-filtres colis | Absent | Filtres A livrer / Livres / Echecs + recherche | Navigation dans les colis |
| Badge statut LIVRE | Texte "Livré ✓" | Badge vert + horodatage de livraison | Tracabilite |
| Badge statut ECHEC | Texte "Echec ✗ + motif" | Badge rouge + motif sous le badge | Coherence |
| Onglet Incidents | Badge numerique absent | Badge avec compteur [Incidents · 2] | Attention dirigee |
| Detail incident | Navigation | Panneau lateral (drawer) 480px | Fluidite — sans perdre le contexte |
| Indicateur WebSocket | Absent | [●LIVE] en bas du tableau | Fiabilite percue |

---

### W-03 : Panneau d'envoi d'une instruction

| Element | v1.1 (avant) | v2.0 (apres) | Impact |
|---------|-------------|-------------|--------|
| Sélecteur type instruction | Radio buttons classiques | Cards cliquables avec icone semantique | Meilleure affordance |
| Compteur message | Absent | Compteur "X / 200" en temps reel | Guidage utilisateur |
| Contexte livreur | "L. Petit" dans le titre | Titre + sous-titre "Tournee T-043 · L. Petit" | Contexte explicite |
| Etat livreur hors ligne | Non prevu | Avertissement "L'instruction sera delivree des son retour en ligne" | Gestion du cas mobile |
| Instruction deja en attente | Message bloquant | Avertissement + bouton "Forcer l'envoi quand meme" | Flexibilite superviseur |
| Fermeture modal | Bouton [✕] seul | Clic overlay + [✕] + bouton Annuler | 3 points de sortie |

---

### M-01 : Authentification

| Element | v1.1 (avant) | v2.0 (apres) | Impact |
|---------|-------------|-------------|--------|
| Layout | Logo + bouton basiques | Logo 80px + titre H1 + sous-titre + version | Accueil professionnel |
| Bouton connexion | Hauteur non specifiee | 56px — touch target confortable | Accessibilite |
| Etat offline | Non prevu | Message "Vous etes hors ligne" | Guidage utilisateur |

---

### M-02 : Liste des colis de la tournee

| Element | v1.1 (avant) | v2.0 (apres) | Impact |
|---------|-------------|-------------|--------|
| Bandeau progression | Label + barre + estimation | Label + barre coloree semantique + indicateur sync | Statut complet en un coup d'oeil |
| Indicateur sync | Absent | [●LIVE] / [●OFFLINE] dans le bandeau | Transparence technique |
| Cards colis | Items liste simples | Cards avec ombre, statut, contrainte, horodatage | Hierarchie visuelle |
| Badge statut | Icone seule (●✓✗) | Badge complet "A LIVRER" / "LIVRE HH:MM" / "ECHEC Absent" | Lisibilite |
| Colis LIVRE | Grise | Grisee + horodatage livraison | Confirmation visuelle |
| Swipe gauche | Absent | Action rapide "Declarer un echec" | Efficacite terrain |
| Footer | Scan + Cloturer | Scan + Cloturer (conditionnel — visible si tous traites) | Reduction confusion |
| Bandeau mode offline | Bandeau orange generique | Bandeau sous le header avec icone sync en attente | Positioning clair |
| Onglets zone | Onglets simples | Onglets avec compteur par zone, scrollables | Orientation immediate |

---

### M-03 : Detail d'un colis

| Element | v1.1 (avant) | v2.0 (apres) | Impact |
|---------|-------------|-------------|--------|
| Header | Titre + retour | Titre + retour + badge statut | Etat visible sans scroller |
| Section destinataire | Nom + adresse | Nom prominent (20px) + adresse + 2 CTAs en ligne [Carte] [Appeler] | Actions rapides |
| Boutons navigation | Ouvrir carte | "Ouvrir la carte ↗" stylise + "Appeler ☎" | UX plus claire |
| Chips contraintes | Liste "⚑ Avant 14h" | Chips colorees --color-avertissement | Coherence design system |
| Historique | Section visible toujours | Masquee si aucun historique (moins de bruit) | Reduction charge cognitive |
| Bouton LIVRER | Bouton standard | 56px plein --color-primaire avec chevron droit | CTA principal renforce |
| Bouton ECHEC | Bouton standard | 56px outline --color-alerte | Distinction claire primaire/secondaire |
| Colis deja livre | Remplacement texte | Card succes avec fond --color-succes-leger | Retour visuel positif |

---

### M-04 : Capture de la preuve de livraison

| Element | v1.1 (avant) | v2.0 (apres) | Impact |
|---------|-------------|-------------|--------|
| Sélecteur type preuve | Radio buttons | Cards 2x2 avec icone | Meilleure affordance |
| Pad signature | Zone generique | Pad 240px avec ligne de base pointillee, trait 3px | Qualite de signature |
| Bouton confirmation | Desactive si pas de preuve | Fond --color-succes quand actif (signal positif) | Feedback visuel renforce |
| Caption geolocalisation | Absent | "Geolocalisation et horodatage enregistres automatiquement." | Transparence |
| Confirmation reussie | Retour auto | Animation checkmark 1s + retour auto M-02 | Satisfaction utilisateur |
| Erreur GPS | Non detaillee | "Mode degrade — livraison confirmee sans coordonnees" + alerte superviseur | Gestion explicite |

---

### M-05 : Declaration d'un echec de livraison

| Element | v1.1 (avant) | v2.0 (apres) | Impact |
|---------|-------------|-------------|--------|
| Header | Standard | Barre superieure --color-alerte | Signal visuel "zone critique" |
| Labels section | Textes simples | UPPERCASE 12px + asterisque obligatoire visible | Clarte du formulaire |
| Radio items | Standard | 48px hauteur, fond colore au choix --color-alerte-leger | Touch target + feedback |
| Section disposition | Toujours visible | Grisee et non interactive avant selection motif | Guidage sequentiel |
| Compteur note | Absent | "X / 250" en temps reel, rouge si depassement | Previent l'echec de validation |
| Confirmation A representer | Absent | Toast "Ce colis est marque pour une nouvelle tentative." | Information proactive |

---

### M-06 : Notification d'instruction recue

| Element | v1.1 (avant) | v2.0 (apres) | Impact |
|---------|-------------|-------------|--------|
| Fond | Couleur superviseur non specifiee | --color-info-fonce (bleu distinctif) | Identification immediate |
| Actions | 1 bouton [VOIR] | 2 boutons [VOIR →] + [OK ✓] | Acquittement possible sans navigation |
| Countdown | Disparition auto 10s | Barre de decompte visible | Transparence temporelle |
| Animation entree/sortie | Non specifiee | Slide-down 300ms / slide-up 200ms | Fluidite |
| Swipe | Absent | Swipe up pour fermer | Geste naturel mobile |

---

## 2. Nouvelles User Stories suggerees au PO

> Ces US n'existaient pas dans le backlog v1.x. Elles emergent du redesign v2.0.
> A creer dans /livrables/05-backlog/user-stories/.

### US suggeree A — Export CSV de la composition de tournee

**Contexte** : W-05, onglet Composition.
**User Story** :
En tant que responsable logistique, je veux pouvoir exporter en CSV la liste des *colis*
d'une *tournee* afin de l'imprimer ou de la transmettre en cas de defaillance systeme.
**Acceptance criteria** :
- Bouton "Exporter CSV" visible dans W-05 onglet Composition.
- Fichier genere : colonnes #Colis, Adresse, Zone, Contrainte.
- Nom fichier : `tournee-[ID]-[date].csv`.
**Domain Events** : CompositionExportee.
**Priorite suggeree** : Must Have.

---

### US suggeree B — Toggle alerte sonore superviseur

**Contexte** : W-01, menu utilisateur.
**User Story** :
En tant que superviseur, je veux pouvoir activer ou desactiver les alertes sonores des
*tournees a risque* afin de gerer les notifications selon mon environnement de travail.
**Acceptance criteria** :
- Toggle dans le menu utilisateur (avatar dropdown).
- Preference sauvegardee en base par utilisateur.
- Sans le toggle : aucune alerte sonore sur TourneeARisqueDetectee.
**Domain Events** : PreferenceSonorisationModifiee.
**Priorite suggeree** : Should Have.

---

### US suggeree C — Verification de compatibilite vehicule/charge

**Contexte** : W-05, onglet Affectation.
**User Story** :
En tant que responsable logistique, je veux etre alerte si le *vehicule* selectionne
depasse sa capacite de charge par rapport au poids estime de la *tournee*, afin d'eviter
les incidents logistiques.
**Acceptance criteria** :
- Alerte inline si poids estime > capacite vehicule.
- Message : "VH-07 : capacite 400 kg, tournee estimee 410 kg — risque de surcharge."
- Bouton "Affecter quand meme" disponible pour passer outre.
**Domain Events** : CompatibiliteVehiculeVerifiee, CompatibiliteVehiculeEchouee.
**Priorite suggeree** : Should Have.

---

### US suggeree D — Swipe rapide "Declarer echec" sur la liste colis

**Contexte** : M-02, geste swipe gauche sur une card.
**User Story** :
En tant que livreur, je veux pouvoir declarer un *echec de livraison* par un swipe gauche
sur un *colis* dans la liste, afin de gagner du temps sur les cas courants (absent).
**Acceptance criteria** :
- Swipe gauche de 80px sur une card : revele un bouton rouge "Echec".
- Tap sur "Echec" : ouvre M-05 directement avec le colis pre-selectionne.
- Swipe droit ou release : annule le swipe.
**Priorite suggeree** : Could Have.

---

### US suggeree E — Indicateur de silence livreur (> 30 min sans activite)

**Contexte** : W-01, colonne Activite.
**User Story** :
En tant que superviseur, je veux etre alerte visuellement si un livreur n'a enregistre
aucune activite depuis plus de 30 minutes, afin de detecter un incident terrain potentiel.
**Acceptance criteria** :
- Cellule "Activite" passe en rouge si > 30 min.
- Mention "Aucune activite depuis Xmin" dans la cellule.
- Tournee automatiquement classee "A risque" si silence > 45 min.
**Domain Events** : SilenceLivreurDetecte.
**Priorite suggeree** : Must Have.

---

### US suggeree F — Panneau lateral detail incident (W-02)

**Contexte** : W-02, onglet Incidents.
**User Story** :
En tant que superviseur, je veux voir le detail complet d'un *incident* dans un panneau
lateral sans quitter la vue de la *tournee*, afin de conserver le contexte global.
**Acceptance criteria** :
- Clic sur un incident : ouvre un drawer 480px a droite.
- Contenu : motif, horodatage, note terrain, photo si presente.
- Fermeture : bouton [✕] ou clic en dehors.
**Priorite suggeree** : Should Have.

---

## 3. Composants React / React Native a creer ou modifier

> Destination : @developpeur.

### Composants a creer (nouveaux)

| Composant          | Interface | Ecran(s) | Description |
|--------------------|-----------|---------|-------------|
| `BadgeStatut`      | Web + Mobile | Tous | Badge semantique statut (cf. design-system §3.1) |
| `CarteColis`       | Mobile | M-02 | Card colis avec statut, adresse, contrainte, swipe (cf. §3.2) |
| `BandeauProgression` | Web + Mobile | M-02, W-01, W-02 | Barre de progression avec label et indicateur sync (cf. §3.3) |
| `BoutonCTA`        | Web + Mobile | Tous | Bouton d'action avec variantes (cf. §3.4) |
| `ChipContrainte`   | Mobile | M-02, M-03 | Chip contrainte horaire/fragile/sensible (cf. §3.5) |
| `IndicateurSync`   | Web + Mobile | M-02, W-01, W-02 | Indicateur LIVE/POLLING/OFFLINE (cf. §3.6) |
| `BandeauInstruction` | Mobile | M-06 | Overlay notification instruction (cf. §3.7) |
| `CardTypePreuve`   | Mobile | M-04 | Card selectionnable type de preuve |
| `CardTypeInstruction` | Web | W-03 | Card selectionnable type d'instruction |
| `DrawerDetail`     | Web | W-02 | Panneau lateral incident 480px |

### Composants a modifier (existants)

| Composant existant | Interface | Modification |
|--------------------|-----------|-------------|
| `TourneeListItem` (W-04) | Web | Ajouter tooltip anomalie, bordure gauche conditionnelle, actions en ligne |
| `TourneeRow` (W-01) | Web | Ajouter fond dynamique, barre progression coloree, indicateur silence |
| `ColisListItem` (M-02) | Mobile | Migrer vers `CarteColis` avec swipe support |
| `ColisDetailView` (M-03) | Mobile | Ajouter badge statut header, chips contraintes, masquage historique vide |
| `ModalInstruction` (W-03) | Web | Migrer radio → `CardTypeInstruction`, ajouter compteur caracteres |
| `SignaturePad` (M-04) | Mobile | Ajouter ligne de base pointillee, epaisseur 3px |

### Tokens a implementer

Le developpeur doit implementer les tokens CSS du design-system.md dans :
- Web : `src/web/supervision/src/styles/tokens.css` (CSS custom properties).
- Mobile : `src/mobile/src/theme/colors.ts` + `src/mobile/src/theme/shadows.ts`.

---

## Recapitulatif des priorites de mise en oeuvre

| Priorite | Element | Ecran(s) | Impact metier |
|----------|---------|----------|---------------|
| 1 — Critique | Composants `BadgeStatut`, `BoutonCTA`, tokens couleurs | Tous | Coherence visuelle base |
| 1 — Critique | Indicateur sync LIVE/OFFLINE | M-02, W-01 | Fiabilite percue (offline-first) |
| 2 — Important | `CarteColis` avec statut complet et horodatage | M-02 | Lisibilite en condition terrain |
| 2 — Important | Fond dynamique bandeau W-01 + tri auto tournees a risque | W-01 | Detectiondela situation critique |
| 2 — Important | Cards type instruction W-03 | W-03 | Reduction erreur de saisie superviseur |
| 3 — Utile | Layout 2 colonnes W-05 + recap tournee | W-05 | Prise de decision affectation |
| 3 — Utile | Swipe echec rapide M-02 | M-02 | Gain de temps terrain (< 45s KPI) |
| 3 — Utile | Panneau lateral incident W-02 | W-02 | Fluidite supervision |
| 4 — Nice to have | Animation checkmark M-04 | M-04 | Satisfaction utilisateur |
| 4 — Nice to have | Export CSV W-05 | W-05 | Besoin logistique secondaire |
