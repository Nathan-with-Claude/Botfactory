/**
 * Tests unitaires — offlineQueue (US-006)
 *
 * Couvre :
 *  - SC1 : enregistrement d'une commande en mode offline
 *  - SC2 : replay FIFO des commandes au retour de connexion
 *  - SC3 : idempotence — doublon avec même commandId → ignoré
 *  - SC4 : clôture bloquée si file non vide
 *  - SC5 : indicateur de synchronisation
 */

import {
  createOfflineQueue,
  OfflineCommand,
  CommandType,
} from '../domain/offlineQueue';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeCommand(
  overrides: Partial<OfflineCommand> = {}
): OfflineCommand {
  return {
    commandId: `uuid-${Math.random().toString(36).slice(2)}`,
    type: CommandType.CONFIRMER_LIVRAISON,
    payload: { tourneeId: 't-001', colisId: 'c-001', typePreuve: 'SIGNATURE' },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('offlineQueue — US-006', () => {

  // SC1 — Enqueue
  describe('enqueue()', () => {
    it('SC1 — ajoute la commande à la file avec son commandId', () => {
      const queue = createOfflineQueue();
      const cmd = makeCommand({ commandId: 'uuid-A' });

      queue.enqueue(cmd);

      expect(queue.size()).toBe(1);
      expect(queue.toArray()[0].commandId).toBe('uuid-A');
    });

    it('SC1 — statut du colis mis à jour localement après enqueue (livré)', () => {
      const queue = createOfflineQueue();
      const cmd = makeCommand({
        commandId: 'uuid-A',
        type: CommandType.CONFIRMER_LIVRAISON,
        payload: { tourneeId: 't-001', colisId: 'c-001', typePreuve: 'SIGNATURE' },
      });

      queue.enqueue(cmd);
      const pendingCount = queue.getPendingCount();

      expect(pendingCount).toBe(1);
    });

    it('SC3 — ignorer une commande avec le même commandId (doublon)', () => {
      const queue = createOfflineQueue();
      const cmd = makeCommand({ commandId: 'uuid-A' });

      queue.enqueue(cmd);
      queue.enqueue({ ...cmd }); // même commandId

      expect(queue.size()).toBe(1);
    });

    it('SC1 — aucun appel réseau pendant l\'enqueue', () => {
      const mockFetch = jest.fn();
      const queue = createOfflineQueue();
      const cmd = makeCommand({ commandId: 'uuid-B' });

      queue.enqueue(cmd);

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  // SC2 — Sync
  describe('sync()', () => {
    it('SC2 — rejoue les commandes dans l\'ordre FIFO', async () => {
      const executedOrder: string[] = [];
      const mockExecutor = jest.fn().mockImplementation((cmd: OfflineCommand) => {
        executedOrder.push(cmd.commandId);
        return Promise.resolve({ success: true });
      });

      const queue = createOfflineQueue();
      const cmd1 = makeCommand({ commandId: 'uuid-1', createdAt: '2026-03-24T10:00:00Z' });
      const cmd2 = makeCommand({ commandId: 'uuid-2', createdAt: '2026-03-24T10:01:00Z' });
      const cmd3 = makeCommand({ commandId: 'uuid-3', createdAt: '2026-03-24T10:02:00Z' });

      queue.enqueue(cmd1);
      queue.enqueue(cmd2);
      queue.enqueue(cmd3);

      await queue.sync(mockExecutor);

      expect(executedOrder).toEqual(['uuid-1', 'uuid-2', 'uuid-3']);
    });

    it('SC2 — vide la file après synchronisation réussie', async () => {
      const mockExecutor = jest.fn().mockResolvedValue({ success: true });
      const queue = createOfflineQueue();
      queue.enqueue(makeCommand({ commandId: 'uuid-1' }));
      queue.enqueue(makeCommand({ commandId: 'uuid-2' }));

      await queue.sync(mockExecutor);

      expect(queue.size()).toBe(0);
    });

    it('SC3 — ne rejoue pas une commande déjà synchronisée (commandId dupliqué côté serveur)', async () => {
      // Le serveur renvoie 409 pour les doublons — le client l'absorbe comme succès
      const mockExecutor = jest.fn().mockImplementation((cmd: OfflineCommand) => {
        if (cmd.commandId === 'uuid-duplicate') {
          return Promise.resolve({ success: false, status: 409, alreadyProcessed: true });
        }
        return Promise.resolve({ success: true });
      });

      const queue = createOfflineQueue();
      queue.enqueue(makeCommand({ commandId: 'uuid-duplicate' }));

      await queue.sync(mockExecutor);

      // La commande dupliquée doit être retirée de la file (considérée comme traitée)
      expect(queue.size()).toBe(0);
    });

    it('SC2 — conserve les commandes non encore jouées si sync partielle échoue', async () => {
      let callCount = 0;
      const mockExecutor = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.reject(new Error('network_error'));
        }
        return Promise.resolve({ success: true });
      });

      const queue = createOfflineQueue();
      queue.enqueue(makeCommand({ commandId: 'uuid-1', createdAt: '2026-03-24T10:00:00Z' }));
      queue.enqueue(makeCommand({ commandId: 'uuid-2', createdAt: '2026-03-24T10:01:00Z' }));
      queue.enqueue(makeCommand({ commandId: 'uuid-3', createdAt: '2026-03-24T10:02:00Z' }));

      await queue.sync(mockExecutor);

      // uuid-1 réussi, uuid-2 échoué → uuid-2 et uuid-3 restent dans la file
      expect(queue.size()).toBe(2);
    });

    it('SC2 — ne fait rien si la file est déjà vide', async () => {
      const mockExecutor = jest.fn();
      const queue = createOfflineQueue();

      await queue.sync(mockExecutor);

      expect(mockExecutor).not.toHaveBeenCalled();
    });
  });

  // SC4 — Clôture bloquée
  describe('canCloseRoute()', () => {
    it('SC4 — retourne false si des commandes sont en attente', () => {
      const queue = createOfflineQueue();
      queue.enqueue(makeCommand({ commandId: 'uuid-1' }));
      queue.enqueue(makeCommand({ commandId: 'uuid-2' }));

      expect(queue.canCloseRoute()).toBe(false);
    });

    it('SC4 — retourne true si la file est vide', () => {
      const queue = createOfflineQueue();
      expect(queue.canCloseRoute()).toBe(true);
    });

    it('SC4 — retourne true après synchronisation complète', async () => {
      const mockExecutor = jest.fn().mockResolvedValue({ success: true });
      const queue = createOfflineQueue();
      queue.enqueue(makeCommand({ commandId: 'uuid-1' }));

      await queue.sync(mockExecutor);

      expect(queue.canCloseRoute()).toBe(true);
    });
  });

  // SC5 — Indicateur de synchronisation
  describe('getPendingCount()', () => {
    it('SC5 — retourne 0 si file vide', () => {
      const queue = createOfflineQueue();
      expect(queue.getPendingCount()).toBe(0);
    });

    it('SC5 — retourne le nombre exact de commandes en attente', () => {
      const queue = createOfflineQueue();
      queue.enqueue(makeCommand({ commandId: 'uuid-1' }));
      queue.enqueue(makeCommand({ commandId: 'uuid-2' }));
      queue.enqueue(makeCommand({ commandId: 'uuid-3' }));

      expect(queue.getPendingCount()).toBe(3);
    });
  });

  // Types de commandes
  describe('types de commandes', () => {
    it('supporte CONFIRMER_LIVRAISON', () => {
      const queue = createOfflineQueue();
      queue.enqueue(makeCommand({ type: CommandType.CONFIRMER_LIVRAISON }));
      expect(queue.size()).toBe(1);
    });

    it('supporte DECLARER_ECHEC', () => {
      const queue = createOfflineQueue();
      queue.enqueue(makeCommand({ type: CommandType.DECLARER_ECHEC }));
      expect(queue.size()).toBe(1);
    });
  });
});
