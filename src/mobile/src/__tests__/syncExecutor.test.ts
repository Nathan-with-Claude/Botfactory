/**
 * Tests unitaires — syncExecutor (US-006)
 *
 * Couvre :
 *  - Injection du header X-Command-Id dans les requêtes
 *  - Gestion du 409 (alreadyProcessed = true)
 *  - Routage CONFIRMER_LIVRAISON → POST /livraison
 *  - Routage DECLARER_ECHEC → POST /echec
 *  - Erreur réseau → exception propagée
 */

import { createSyncExecutor } from '../api/syncExecutor';
import { CommandType, OfflineCommand } from '../domain/offlineQueue';

function makeCmd(type: CommandType, overrides: Partial<OfflineCommand> = {}): OfflineCommand {
  return {
    commandId: 'uuid-test-001',
    type,
    payload: type === CommandType.CONFIRMER_LIVRAISON
      ? { tourneeId: 't-001', colisId: 'c-001', typePreuve: 'SIGNATURE' }
      : { tourneeId: 't-001', colisId: 'c-001', motif: 'ABSENT', disposition: 'A_REPRESENTER' },
    createdAt: '2026-03-24T10:00:00Z',
    ...overrides,
  };
}

describe('syncExecutor — US-006', () => {

  it('SC3 — injecte X-Command-Id dans le header', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ status: 200, ok: true });
    const executor = createSyncExecutor({ fetchFn: mockFetch as unknown as typeof fetch });
    const cmd = makeCmd(CommandType.CONFIRMER_LIVRAISON, { commandId: 'uuid-xyz' });

    await executor.execute(cmd);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/livraison'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-Command-Id': 'uuid-xyz' }),
      })
    );
  });

  it('SC3 — retourne alreadyProcessed=true si le serveur répond 409', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ status: 409, ok: false });
    const executor = createSyncExecutor({ fetchFn: mockFetch as unknown as typeof fetch });
    const cmd = makeCmd(CommandType.CONFIRMER_LIVRAISON);

    const result = await executor.execute(cmd);

    expect(result.alreadyProcessed).toBe(true);
    expect(result.status).toBe(409);
  });

  it('route CONFIRMER_LIVRAISON → POST /colis/{id}/livraison', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ status: 200, ok: true });
    const executor = createSyncExecutor({ fetchFn: mockFetch as unknown as typeof fetch });
    await executor.execute(makeCmd(CommandType.CONFIRMER_LIVRAISON));

    const [url] = (mockFetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/livraison');
    expect(url).toContain('/colis/c-001');
  });

  it('route DECLARER_ECHEC → POST /colis/{id}/echec', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ status: 200, ok: true });
    const executor = createSyncExecutor({ fetchFn: mockFetch as unknown as typeof fetch });
    await executor.execute(makeCmd(CommandType.DECLARER_ECHEC));

    const [url] = (mockFetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/echec');
  });

  it('SC2 — propagation de l\'erreur réseau (network_error)', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('fetch failed'));
    const executor = createSyncExecutor({ fetchFn: mockFetch as unknown as typeof fetch });

    await expect(executor.execute(makeCmd(CommandType.CONFIRMER_LIVRAISON))).rejects.toThrow('network_error');
  });

  it('retourne success=true pour une réponse 200', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ status: 200, ok: true });
    const executor = createSyncExecutor({ fetchFn: mockFetch as unknown as typeof fetch });

    const result = await executor.execute(makeCmd(CommandType.CONFIRMER_LIVRAISON));

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
  });
});
