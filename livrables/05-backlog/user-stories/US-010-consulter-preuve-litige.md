# US-010 : Consulter la preuve d'une livraison pour traiter un litige

**Epic** : EPIC-002 — Capture et Accès aux Preuves de Livraison
**Feature** : F-008 — Accès aux preuves par le support client
**Bounded Context** : BC-02 Gestion des Preuves
**Aggregate(s) touchés** : PreuveLivraison (Aggregate Root — lecture seule)
**Priorité** : Should Have
**Statut** : Prête
**Complexité estimée** : S (3 points)

---

## User Story

En tant que Sophie Dubois (DSI / support client Docaposte),
je veux retrouver et consulter la preuve de livraison d'un colis en moins de 5 minutes
à partir de l'identifiant du colis,
afin de traiter rapidement les litiges "colis non reçu" sans dépendre d'un support
papier introuvable.

---

## Contexte

Aujourd'hui, en cas de litige, retrouver une preuve de livraison peut prendre des
heures. Avec DocuPost, chaque preuve est stockée de façon immuable dans le store objet
(MinIO) avec ses métadonnées (horodatage, géolocalisation, type de preuve, identité du
livreur). L'accès se fait via l'interface web de supervision par identifiant de colis.

La PreuveLivraison est une lecture seule pour le support : aucune modification n'est
possible (immuabilité juridique).

**Invariants à respecter** :
- Une PreuveLivraison est immuable après création. Aucune modification ne peut être
  effectuée via cette interface.
- L'accès aux preuves est restreint aux rôles autorisés (superviseur, support client,
  DSI) via le contrôle d'accès basé sur les rôles.
- Les coordonnées GPS et l'identité du destinataire doivent respecter les exigences
  RGPD : affichage minimal, accès journalisé.
- Délai d'accès cible : < 5 minutes depuis la demande.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Consultation d'une preuve existante par identifiant de colis

```gherkin
Given Sophie est authentifiée sur l'interface web avec le rôle "support"
And la PreuveLivraison du colis #00247 existe avec type = SignatureNumerique
When Sophie saisit l'identifiant "#00247" dans le champ de recherche
And Sophie valide la recherche
Then les métadonnées de la PreuveLivraison s'affichent en moins de 5 minutes :
     - Type de preuve : Signature numérique
     - Horodatage : date et heure de la capture
     - Livreur : identifiant et nom
     - Coordonnées GPS : latitude et longitude (ou "non disponibles" en mode dégradé)
And la signature numérique est affichée en aperçu dans l'interface
```

### Scénario 2 : Colis sans preuve de livraison (livraison non confirmée)

```gherkin
Given Sophie recherche la preuve du colis #00312
And le colis #00312 a le statut "à livrer" (aucune tentative de livraison)
When Sophie effectue la recherche
Then le système affiche "Aucune preuve de livraison disponible pour ce colis. Statut
     actuel : à livrer."
And aucun accès non autorisé à des données partielles n'est possible
```

### Scénario 3 : Preuve de type photo accessible

```gherkin
Given la PreuveLivraison du colis #00198 est de type Photo
And l'URL de la photo est stockée dans le store objet (MinIO)
When Sophie consulte la preuve du colis #00198
Then la miniature de la photo est affichée dans l'interface
And un bouton "Télécharger la photo" permet d'obtenir la preuve en haute résolution
And le hash d'intégrité est affiché pour garantir la non-altération
```

### Scénario 4 : Accès refusé pour un rôle non autorisé

```gherkin
Given un utilisateur authentifié avec le rôle "livreur" tente d'accéder au module de
     consultation des preuves
When il soumet une requête vers l'API de consultation des preuves
Then le système retourne une erreur 403 Forbidden
And aucune donnée de PreuveLivraison n'est exposée
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md (interface web support — hors wireframes MVP détaillés)
- Parcours : /livrables/02-ux/user-journeys.md#parcours-1--livreur--exécuter-une-tournée
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
