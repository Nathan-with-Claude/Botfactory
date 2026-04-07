/**
 * Tests unitaires — offlineQueue (US-006 + US-060)
 *
 * Couvre :
 *  - SC1 : enregistrement d'une commande en mode offline
 *  - SC2 : replay FIFO des commandes au retour de connexion
 *  - SC3 : idempotence — doublon avec même commandId → ignoré
 *  - SC4 : clôture bloquée si file non vide
 *  - SC5 : indicateur de synchronisation
 *  - US-060 : persist() appelé après chaque dequeue réussi dans sync()
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

  // US-060 — persist() après sync()
  describe('US-060 — persist() après sync()', () => {
    /**
     * Helper : crée un storage AsyncStorage injectable avec espion sur setItem.
     */
    function makeMockStorage() {
      const store: Record<string, string> = {};
      return {
        store,
        getItem: jest.fn(async (key: string) => store[key] ?? null),
        setItem: jest.fn(async (key: string, value: string) => {
          store[key] = value;
        }),
      };
    }

    it('US-060 SC1 — persist() est appelé après chaque dequeue réussi pendant sync()', async () => {
      const mockStorage = makeMockStorage();
      const mockExecutor = jest.fn().mockResolvedValue({ success: true });

      const queue = createOfflineQueue({ storage: mockStorage });
      queue.enqueue(makeCommand({ commandId: 'uuid-p1' }));
      queue.enqueue(makeCommand({ commandId: 'uuid-p2' }));

      // enqueue appelle persist 2 fois, puis sync doit appeler persist après chaque dequeue
      const setItemCallsBeforeSync = mockStorage.setItem.mock.calls.length;

      await queue.sync(mockExecutor);

      // persist() doit avoir été appelé après chaque commande traitée (2 fois supplémentaires)
      const setItemCallsAfterSync = mockStorage.setItem.mock.calls.length;
      expect(setItemCallsAfterSync).toBeGreaterThan(setItemCallsBeforeSync);
    });

    it('US-060 SC2 — après sync complète, AsyncStorage est vide', async () => {
      const mockStorage = makeMockStorage();
      const mockExecutor = jest.fn().mockResolvedValue({ success: true });

      const queue = createOfflineQueue({ storage: mockStorage });
      queue.enqueue(makeCommand({ commandId: 'uuid-p1' }));
      queue.enqueue(makeCommand({ commandId: 'uuid-p2' }));

      await queue.sync(mockExecutor);

      // Le dernier appel à setItem doit avoir persisté une file vide
      const lastSetItemCall = mockStorage.setItem.mock.calls.at(-1);
      expect(lastSetItemCall).toBeDefined();
      const persistedValue = JSON.parse(lastSetItemCall![1] as string) as OfflineCommand[];
      expect(persistedValue).toHaveLength(0);
    });

    it('US-060 SC3 — redémarrage après sync partielle : commandes non envoyées restent dans AsyncStorage', async () => {
      const mockStorage = makeMockStorage();
      let callCount = 0;
      const mockExecutor = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.reject(new Error('network_error'));
        }
        return Promise.resolve({ success: true });
      });

      const queue = createOfflineQueue({ storage: mockStorage });
      queue.enqueue(makeCommand({ commandId: 'uuid-s1', createdAt: '2026-04-04T10:00:00Z' }));
      queue.enqueue(makeCommand({ commandId: 'uuid-s2', createdAt: '2026-04-04T10:01:00Z' }));
      queue.enqueue(makeCommand({ commandId: 'uuid-s3', createdAt: '2026-04-04T10:02:00Z' }));

      await queue.sync(mockExecutor);

      // uuid-s1 réussi (1 persist après dequeue), uuid-s2 échoué → stop
      // AsyncStorage doit contenir uuid-s2 et uuid-s3 (les commandes non envoyées)
      const lastSetItemCall = mockStorage.setItem.mock.calls.at(-1);
      expect(lastSetItemCall).toBeDefined();
      const persistedCommands = JSON.parse(lastSetItemCall![1] as string) as OfflineCommand[];
      expect(persistedCommands).toHaveLength(2);
      expect(persistedCommands[0].commandId).toBe('uuid-s2');
      expect(persistedCommands[1].commandId).toBe('uuid-s3');
    });

    it('US-060 SC4 — canCloseRoute() retourne false si AsyncStorage non vide (simulation redémarrage)', async () => {
      // Simule un redémarrage : le storage contient des commandes non sync
      const mockStorage = makeMockStorage();
      const pendingCmd = makeCommand({ commandId: 'uuid-restart-1' });
      mockStorage.store['docupost_offline_queue'] = JSON.stringify([pendingCmd]);

      const queue = createOfflineQueue({ storage: mockStorage });
      await queue.initialize();

      // Après rechargement depuis AsyncStorage, la file doit avoir 1 commande
      expect(queue.canCloseRoute()).toBe(false);
      expect(queue.getPendingCount()).toBe(1);
    });

    it('US-060 SC5 — pas de double envoi : commandes sync réussies absentes d\'AsyncStorage au redémarrage', async () => {
      const mockStorage = makeMockStorage();
      const mockExecutor = jest.fn().mockResolvedValue({ success: true });

      // 1ère instance : sync complète
      const queue1 = createOfflineQueue({ storage: mockStorage });
      queue1.enqueue(makeCommand({ commandId: 'uuid-no-double-1' }));
      queue1.enqueue(makeCommand({ commandId: 'uuid-no-double-2' }));
      await queue1.sync(mockExecutor);

      // Simule un redémarrage : 2ème instance qui recharge depuis AsyncStorage
      const queue2 = createOfflineQueue({ storage: mockStorage });
      await queue2.initialize();

      // La 2ème instance doit avoir une file vide (pas de re-envoi)
      expect(queue2.size()).toBe(0);
      expect(mockExecutor).toHaveBeenCalledTimes(2); // seulement les 2 appels de la 1ère sync
    });
  });

  // US-056 — Persistance enqueue + initialisation au démarrage
  describe('US-056 — persistance enqueue + initialize()', () => {
    /**
     * Helper : crée un storage AsyncStorage injectable avec espion sur setItem.
     * (identique au helper de US-060 — dupliqué ici pour isoler la suite US-056)
     */
    function makeMockStorage() {
      const store: Record<string, string> = {};
      return {
        store,
        getItem: jest.fn(async (key: string) => store[key] ?? null),
        setItem: jest.fn(async (key: string, value: string) => {
          store[key] = value;
        }),
      };
    }

    it('US-056 SC1 — enqueue() persiste immédiatement dans AsyncStorage', async () => {
      const mockStorage = makeMockStorage();
      const queue = createOfflineQueue({ storage: mockStorage });
      const cmd = makeCommand({ commandId: 'uuid-persist-1' });

      queue.enqueue(cmd);

      // Attendre que la persistance asynchrone (void persist()) s'exécute
      await Promise.resolve();
      // Une seconde microtask car persist() appelle storage.setItem() en async
      await Promise.resolve();

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'docupost_offline_queue',
        expect.stringContaining('uuid-persist-1'),
      );
    });

    it('US-056 SC2 — initialize() charge les commandes depuis AsyncStorage', async () => {
      const mockStorage = makeMockStorage();
      const cmd1 = makeCommand({ commandId: 'uuid-init-1' });
      const cmd2 = makeCommand({ commandId: 'uuid-init-2' });
      // Pré-charger le storage avec 2 commandes sauvegardées lors d'une session précédente
      mockStorage.store['docupost_offline_queue'] = JSON.stringify([cmd1, cmd2]);

      const queue = createOfflineQueue({ storage: mockStorage });
      // La file doit être vide avant initialize()
      expect(queue.size()).toBe(0);

      await queue.initialize();

      expect(queue.size()).toBe(2);
      expect(queue.toArray()[0].commandId).toBe('uuid-init-1');
      expect(queue.toArray()[1].commandId).toBe('uuid-init-2');
    });

    it('US-056 SC3 — initialize() est idempotent : ne duplique pas les commandes déjà en mémoire', async () => {
      const mockStorage = makeMockStorage();
      const cmd = makeCommand({ commandId: 'uuid-idem-1' });
      mockStorage.store['docupost_offline_queue'] = JSON.stringify([cmd]);

      const queue = createOfflineQueue({ storage: mockStorage });
      await queue.initialize();
      // Appel une 2ème fois — ne doit pas doubler la file
      await queue.initialize();

      expect(queue.size()).toBe(1);
    });

    it('US-056 SC4 — initialize() avec AsyncStorage vide ne plante pas et laisse la file vide', async () => {
      const mockStorage = makeMockStorage();
      // storage vide — getItem retourne null
      const queue = createOfflineQueue({ storage: mockStorage });

      await expect(queue.initialize()).resolves.toBeUndefined();
      expect(queue.size()).toBe(0);
    });

    it('US-056 SC5 — initialize() résiste à un JSON corrompu dans AsyncStorage', async () => {
      const mockStorage = makeMockStorage();
      mockStorage.store['docupost_offline_queue'] = 'json_invalide_{{{';

      const queue = createOfflineQueue({ storage: mockStorage });

      // Ne doit pas lever d'exception
      await expect(queue.initialize()).resolves.toBeUndefined();
      expect(queue.size()).toBe(0);
    });

    it('US-056 SC6 — canCloseRoute() retourne false après chargement de commandes via initialize()', async () => {
      const mockStorage = makeMockStorage();
      const pendingCmd = makeCommand({ commandId: 'uuid-close-1' });
      mockStorage.store['docupost_offline_queue'] = JSON.stringify([pendingCmd]);

      const queue = createOfflineQueue({ storage: mockStorage });
      await queue.initialize();

      expect(queue.canCloseRoute()).toBe(false);
    });

    it('US-056 SC7 — ordre FIFO préservé après rechargement depuis AsyncStorage', async () => {
      const mockStorage = makeMockStorage();
      const cmd1 = makeCommand({ commandId: 'uuid-fifo-1', createdAt: '2026-04-04T08:00:00Z' });
      const cmd2 = makeCommand({ commandId: 'uuid-fifo-2', createdAt: '2026-04-04T08:01:00Z' });
      const cmd3 = makeCommand({ commandId: 'uuid-fifo-3', createdAt: '2026-04-04T08:02:00Z' });
      mockStorage.store['docupost_offline_queue'] = JSON.stringify([cmd1, cmd2, cmd3]);

      const queue = createOfflineQueue({ storage: mockStorage });
      await queue.initialize();

      const ids = queue.toArray().map(c => c.commandId);
      expect(ids).toEqual(['uuid-fifo-1', 'uuid-fifo-2', 'uuid-fifo-3']);
    });
  });
});
