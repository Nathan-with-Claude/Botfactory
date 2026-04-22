# Compte rendu d'entretien — Besoin "Broadcast superviseur → livreurs"

**Date** : 14 avril 2026
**Interlocuteur** : Karim B., Superviseur logistique terrain — Agence Île-de-France Sud
**Durée** : 45 minutes
**Support** : Visio + partage d'écran (outil actuel de suivi)
**Animateur** : Équipe produit DocuPost

---

## Contexte de l'entretien

Entretien exploratoire visant à identifier des besoins non exprimés lors du cadrage initial.
Karim supervise une équipe de 18 livreurs répartis sur 3 secteurs géographiques distincts.
Il utilise la plateforme de supervision DocuPost depuis la phase pilote.

---

## Verbatims clés

> "Mon problème numéro un en journée, c'est quand il se passe quelque chose sur le terrain et que je dois le faire savoir à tout le monde vite. Là aujourd'hui j'ai pas d'autre choix que d'appeler les livreurs un par un, ou d'espérer qu'ils lisent le groupe WhatsApp."

> "Ce matin j'ai eu une rue barrée en urgence — travaux RATP, aucun panneau la veille. J'ai mis 20 minutes à joindre les 6 livreurs concernés. Pendant ce temps, deux d'entre eux étaient déjà bloqués."

> "Je veux pas non plus les appeler pour tout et n'importe quoi, ils conduisent. Un message qui s'affiche sur leur écran au bon moment, c'est tout ce que je demande."

> "Des fois c'est pas juste une zone, c'est tous les livreurs de la journée que je veux prévenir — par exemple quand le dépôt ferme plus tôt, ou qu'on a un problème de scanner."

> "Si je pouvais écrire un message depuis mon tableau de bord et choisir 'tous les livreurs' ou 'les livreurs du secteur 2', ce serait parfait. Comme un SMS groupé mais dans l'appli."

> "Et s'il y a moyen de savoir qu'ils l'ont vu, encore mieux. Parce que là j'envoie un message WhatsApp et je sais même pas si le livreur a son téléphone en mode silencieux."

---

## Besoins identifiés

### Besoin principal
Pouvoir envoyer un message d'information ou d'alerte depuis l'interface superviseur vers un ou plusieurs livreurs, sans avoir à les appeler individuellement.

### Critères exprimés par Karim

| Critère | Détail |
|---|---|
| **Ciblage** | Tous les livreurs actifs du jour / par secteur géographique / sélection manuelle |
| **Canal** | Notification push sur l'app mobile livreur (pas un SMS) |
| **Urgence** | Le message doit s'afficher de façon visible même si l'app est en arrière-plan |
| **Confirmation** | Voir qui a lu le message (statut "vu") |
| **Historique** | Retrouver les messages envoyés dans la journée en cas de litige |
| **Rapidité** | Maximum 3 clics depuis le tableau de bord superviseur pour envoyer |

### Cas d'usage cités

1. **Fermeture de voie** — rue ou route bloquée non planifiée → ciblage par zone géographique
2. **Fermeture anticipée du dépôt** — tous les livreurs actifs doivent rentrer avant l'heure X
3. **Incident scanner / matériel** — signaler un dysfonctionnement d'outil à tout le monde
4. **Consigne de sécurité ponctuelle** — ex. intempéries, ne pas livrer en sous-sol
5. **Modification d'une adresse de dépôt relais** — information critique qui change en cours de journée

---

## Ce que Karim ne veut PAS

- Un canal de communication bidirectionnel complexe ("je veux pas gérer une boîte de réception, je veux juste envoyer")
- Des alertes automatiques sans validation humaine ("c'est moi qui décide quand et quoi envoyer")

---

## Éléments de contexte supplémentaires

- L'agence Île-de-France Sud gère en moyenne **120 points de livraison par jour** répartis sur **3 secteurs**.
- Les incidents terrain nécessitant une communication urgente arrivent **2 à 4 fois par semaine** selon Karim.
- Actuellement : groupe WhatsApp informel + appels téléphoniques directs. Aucun traçage.
- Karim a mentionné que **deux autres superviseurs de son agence** ont le même problème.

---

## Points d'attention pour le produit

- Attention à ne pas transformer cet outil en canal de micro-management — les livreurs pourraient mal le percevoir. Karim suggère de limiter l'usage aux **messages informatifs et d'alerte opérationnelle**.
- La notification push ne doit pas exiger que le livreur soit sur l'écran actif de l'app.
- Prévoir un **libellé de type de message** (Alerte / Info / Consigne) pour que le livreur sache immédiatement la nature de la communication.
- Le livreur pourra avoir une zone dédié aux messages du superviseur et pourra les consulters tout au long de sa tournée.