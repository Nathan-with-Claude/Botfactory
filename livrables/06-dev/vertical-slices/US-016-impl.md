# Implémentation US-016 : Recevoir une notification push quand le superviseur modifie ma tournée

## Contexte

US-016 — BC-04 Notification (MVP collocalisé dans BC-03 via polling), écran M-06 (BandeauInstructionOverlay).
Persona : Pierre Morel (livreur terrain) reçoit une alerte quand Laurent lui envoie une instruction.

Inputs :
- `/livrables/05-backlog/user-stories/US-016-notification-push-instruction.md`
- `/livrables/02-ux/wireframes.md` (section M-06)
- `/livrables/04-architecture-technique/architecture-applicative.md`

## Bounded Context et couche ciblée

- **BC** : BC-04 Notification — MVP collocalisé dans `svc-supervision` (port 8082)
- **Aggregate(s) modifiés** : aucun (lecture seule — polling)
- **Domain Events émis** : `InstructionReçue` (côté mobile, non persisté — simulé par le changement de statut via US-015)

## Décisions d'implémentation

### Note FCM déféré

Firebase Cloud Messaging (FCM) n'est pas provisionné dans le MVP.
Le push natif (Android) est remplacé par un **polling HTTP** depuis l'application mobile :
- Le livreur interroge `GET /api/supervision/instructions/en-attente?tourneeId={id}` toutes les **10 secondes**
- Quand une nouvelle instruction ENVOYEE apparaît (non encore vue), le bandeau M-06 est affiché
- TODO Sprint 3 : remplacer par Kafka Consumer → micro-service FCM → push natif Android

### Backend (partagé avec US-015)

- `ConsulterInstructionsEnAttenteQuery/Handler` : retourne les instructions au statut ENVOYEE pour une tournée (implémenté dans US-015)
- `GET /api/supervision/instructions/en-attente?tourneeId={id}` : endpoint LIVREUR (implémenté dans US-015)

### Frontend Mobile

- **`supervisionApi.ts`** (nouveau, `src/mobile/src/api/`) :
  - `getInstructionsEnAttente(tourneeId)` : GET /instructions/en-attente → `InstructionMobileDTO[]`
  - `marquerInstructionExecutee(instructionId)` : PATCH /instructions/{id}/executer
  - URL de base : `EXPO_PUBLIC_SUPERVISION_URL` (default `http://10.0.2.2:8082`)
  - Défensif : erreurs silencieuses, `Array.isArray` guard

- **`BandeauInstructionOverlay.tsx`** (nouveau, `src/mobile/src/components/`) — composant M-06 :
  - Animation slide-down via `Animated.spring`
  - Fermeture automatique après 10 secondes (configurable via `autoFermetureMs` pour les tests)
  - Bouton "VOIR" → navigue vers M-03 (DetailColisScreen du colis concerné)
  - Bouton "×" → ferme sans naviguer
  - `testID` : `bandeau-instruction-overlay`, `titre-instruction`, `message-instruction`, `bouton-voir-instruction`, `bouton-fermer-bandeau`

- **`ListeColisScreen.tsx`** (modifié) :
  - Import `BandeauInstructionOverlay` + `getInstructionsEnAttente`
  - État `instructionAffichee: InstructionMobileDTO | null` + `instructionsVues: Set<string>` (ref)
  - `useEffect` polling : `setInterval(10s)` — actif seulement si étatType === 'succes'
  - Déduplication : un instructionId ne déclenche le bandeau qu'une seule fois par session
  - Le bandeau est rendu en tête du container principal (z-index élevé via `position: absolute` dans ses styles)
  - Bouton "VOIR" : ferme le bandeau + ouvre `DetailColisScreen` pour le colis concerné

### Erreurs / invariants préservés

- Bandeau disparu automatiquement après 10 s si Pierre n'interagit pas (via `setTimeout` + `clearTimeout` sur VOIR/×)
- La modification de la liste persiste même après disparition du bandeau (le rafraîchissement de la tournée sur M-03 recharge les statuts)
- Déduplication `instructionsVues` : le même instructionId n'affiche jamais deux fois le bandeau dans la session
- Offline : en l'absence de connexion, `getInstructionsEnAttente` retourne `[]` silencieusement (pas de crash)

## Tests

### Frontend Mobile

| Fichier | Tests | Résultat |
|---------|-------|----------|
| `BandeauInstructionOverlay.test.tsx` | 5 tests (rendu, onVoir, onFermer, auto-fermeture timer, bouton VOIR) | Verts |

### Backend

| Fichier | Tests | Résultat |
|---------|-------|----------|
| `InstructionControllerTest.java` | 1 test `GET /en-attente` (partagé US-015) | Vert |

## Commandes de lancement

```bash
# Tests frontend mobile
cd src/mobile && npx jest BandeauInstructionOverlay --no-coverage

# Application mobile (émulateur Android)
cd src/mobile && npx expo start --android

# Simuler une instruction depuis le backend
# POST http://localhost:8082/api/supervision/instructions
# Body: {"tourneeId":"tournee-001","colisId":"colis-s-003","typeInstruction":"PRIORISER"}
# Le polling mobile la détectera dans les 10 secondes

# Variables d'environnement pour pointer vers svc-supervision depuis l'émulateur
# EXPO_PUBLIC_SUPERVISION_URL=http://10.0.2.2:8082
```

## Limites MVP

| Fonctionnalité | Statut |
|----------------|--------|
| Polling HTTP (10s) | Implémenté |
| Bandeau overlay M-06 | Implémenté |
| Auto-fermeture 10s | Implémenté |
| Navigation VOIR → M-03 | Implémenté |
| FCM push natif Android | TODO Sprint 3 |
| Notification en arrière-plan (barre système) | TODO Sprint 3 (nécessite FCM) |
| Mode offline — queue push | TODO Sprint 3 |
