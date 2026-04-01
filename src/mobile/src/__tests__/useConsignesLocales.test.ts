/**
 * Tests unitaires — useConsignesLocales (US-037)
 *
 * Couvre :
 * - SC1 : chargement initial depuis AsyncStorage
 * - SC2 : ajouterConsigne — nouvelle consigne persiste et remonte dans la liste
 * - SC3 : ajouterConsigne — idempotence (pas de doublon sur instructionId)
 * - SC4 : marquerToutesLues — passe lue=true sur toutes les consignes
 * - SC5 : marquerExecutee — PATCH backend + statut EXECUTEE local
 * - SC6 : marquerExecutee — syncEnCours passe true puis false
 * - SC7 : nombreNonLues — badge reflète les consignes non lues
 * - SC8 : clePourAujourdhui — format YYYY-MM-DD
 * - SC9 (delta Sprint 5) : prendreEnCompteNouvelles — PATCH prendre-en-compte pour chaque ENVOYEE
 * - SC10 (delta Sprint 5) : prendreEnCompteNouvelles — offline silencieux (erreur réseau ignorée)
 * - SC11 (delta Sprint 5) : prendreEnCompteNouvelles — statut local passe à PRISE_EN_COMPTE
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useConsignesLocales, clePourAujourdhui, ConsigneLocale } from '../hooks/useConsignesLocales';
import type { InstructionMobileDTO } from '../api/supervisionApi';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const instruction1: InstructionMobileDTO = {
  instructionId: 'instr-001',
  tourneeId: 'tournee-T001',
  colisId: 'colis-001',
  superviseurId: 'sup-001',
  typeInstruction: 'PRIORISER',
  statut: 'ENVOYEE',
  horodatage: '2026-03-30T09:00:00Z',
};

const instruction2: InstructionMobileDTO = {
  instructionId: 'instr-002',
  tourneeId: 'tournee-T001',
  colisId: 'colis-002',
  superviseurId: 'sup-001',
  typeInstruction: 'ANNULER',
  statut: 'ENVOYEE',
  horodatage: '2026-03-30T10:00:00Z',
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockAsyncStorage.clear();
});

// ─── SC8 : clePourAujourdhui ─────────────────────────────────────────────────

describe('clePourAujourdhui', () => {
  it('retourne une clé au format consignes_jour_YYYY-MM-DD', () => {
    const cle = clePourAujourdhui();
    expect(cle).toMatch(/^consignes_jour_\d{4}-\d{2}-\d{2}$/);
  });
});

// ─── Tests du hook ────────────────────────────────────────────────────────────

describe('useConsignesLocales', () => {
  // SC1 : chargement initial
  it('SC1 — charge les consignes depuis AsyncStorage au montage', async () => {
    const consigneExistante: ConsigneLocale = { ...instruction1, lue: true };
    mockAsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify([consigneExistante])
    );

    const { result } = renderHook(() => useConsignesLocales());

    await waitFor(() => {
      expect(result.current.consignes).toHaveLength(1);
    });
    expect(result.current.consignes[0].instructionId).toBe('instr-001');
  });

  // SC1 bis : AsyncStorage vide
  it('SC1b — retourne une liste vide si AsyncStorage vide', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useConsignesLocales());

    await waitFor(() => {
      expect(result.current.consignes).toHaveLength(0);
    });
  });

  // SC2 : ajouterConsigne
  it('SC2 — ajouterConsigne ajoute la consigne à la liste et persiste', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useConsignesLocales());

    await act(async () => {
      await result.current.ajouterConsigne(instruction1);
    });

    expect(result.current.consignes).toHaveLength(1);
    expect(result.current.consignes[0].instructionId).toBe('instr-001');
    expect(result.current.consignes[0].lue).toBe(false);
    expect(mockAsyncStorage.setItem).toHaveBeenCalled();
  });

  // SC3 : idempotence
  it('SC3 — ajouterConsigne est idempotent (pas de doublon)', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useConsignesLocales());

    await act(async () => {
      await result.current.ajouterConsigne(instruction1);
      await result.current.ajouterConsigne(instruction1);
    });

    expect(result.current.consignes).toHaveLength(1);
  });

  // SC3 bis : deux instructions distinctes
  it('SC3b — deux instructions distinctes donnent deux consignes', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useConsignesLocales());

    await act(async () => {
      await result.current.ajouterConsigne(instruction1);
      await result.current.ajouterConsigne(instruction2);
    });

    expect(result.current.consignes).toHaveLength(2);
  });

  // Tri décroissant
  it('liste triée par date décroissante (plus récente en premier)', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useConsignesLocales());

    await act(async () => {
      // instruction1 : 09:00, instruction2 : 10:00
      await result.current.ajouterConsigne(instruction1);
      await result.current.ajouterConsigne(instruction2);
    });

    // instruction2 (10:00) doit être en premier
    expect(result.current.consignes[0].instructionId).toBe('instr-002');
    expect(result.current.consignes[1].instructionId).toBe('instr-001');
  });

  // SC4 : marquerToutesLues
  it('SC4 — marquerToutesLues passe lue=true sur toutes les consignes', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useConsignesLocales());

    await act(async () => {
      await result.current.ajouterConsigne(instruction1);
      await result.current.ajouterConsigne(instruction2);
    });

    expect(result.current.nombreNonLues).toBe(2);

    await act(async () => {
      await result.current.marquerToutesLues();
    });

    expect(result.current.nombreNonLues).toBe(0);
    expect(result.current.consignes.every((c) => c.lue)).toBe(true);
  });

  // SC5 : marquerExecutee
  it('SC5 — marquerExecutee appelle le backend et passe le statut à EXECUTEE', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);
    const marquerExecuteeMock = jest.fn().mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      useConsignesLocales(marquerExecuteeMock)
    );

    await act(async () => {
      await result.current.ajouterConsigne(instruction1);
    });

    await act(async () => {
      await result.current.marquerExecutee('instr-001');
    });

    expect(marquerExecuteeMock).toHaveBeenCalledWith('instr-001');
    const consigne = result.current.consignes.find(
      (c) => c.instructionId === 'instr-001'
    );
    expect(consigne?.statut).toBe('EXECUTEE');
    expect(consigne?.lue).toBe(true);
  });

  // SC6 : syncEnCours
  it('SC6 — syncEnCours est true pendant marquerExecutee puis false à la fin', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);
    let resolveFn!: () => void;
    const marquerExecuteeMock = jest.fn(
      () => new Promise<void>((resolve) => { resolveFn = resolve; })
    );

    const { result } = renderHook(() =>
      useConsignesLocales(marquerExecuteeMock)
    );

    await act(async () => {
      await result.current.ajouterConsigne(instruction1);
    });

    // Démarrer l'action sans attendre la résolution
    act(() => {
      result.current.marquerExecutee('instr-001');
    });

    expect(result.current.syncEnCours).toBe(true);

    await act(async () => {
      resolveFn();
    });

    expect(result.current.syncEnCours).toBe(false);
  });

  // SC7 : badge nombreNonLues
  it('SC7 — nombreNonLues reflète les consignes avec lue=false', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useConsignesLocales());

    await act(async () => {
      await result.current.ajouterConsigne(instruction1);
      await result.current.ajouterConsigne(instruction2);
    });

    expect(result.current.nombreNonLues).toBe(2);

    await act(async () => {
      await result.current.marquerToutesLues();
    });

    expect(result.current.nombreNonLues).toBe(0);
  });

  // ─── SC9/SC10/SC11 : prendreEnCompteNouvelles (delta Sprint 5) ───────────

  // SC9 : appelle PATCH prendre-en-compte pour chaque consigne ENVOYEE
  it('SC9 — prendreEnCompteNouvelles appelle le backend pour chaque consigne ENVOYEE', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);
    const prendreEnCompteMock = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useConsignesLocales(undefined, prendreEnCompteMock)
    );

    await act(async () => {
      await result.current.ajouterConsigne(instruction1); // ENVOYEE
      await result.current.ajouterConsigne(instruction2); // ENVOYEE
    });

    await act(async () => {
      await result.current.prendreEnCompteNouvelles();
    });

    expect(prendreEnCompteMock).toHaveBeenCalledTimes(2);
    expect(prendreEnCompteMock).toHaveBeenCalledWith('instr-001');
    expect(prendreEnCompteMock).toHaveBeenCalledWith('instr-002');
  });

  // SC10 : offline silencieux — erreur réseau ignorée, statut reste ENVOYEE
  it('SC10 — prendreEnCompteNouvelles ignore les erreurs réseau (mode offline)', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);
    const prendreEnCompteMock = jest.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useConsignesLocales(undefined, prendreEnCompteMock)
    );

    await act(async () => {
      await result.current.ajouterConsigne(instruction1);
    });

    // Ne doit pas lever d'exception
    await act(async () => {
      await result.current.prendreEnCompteNouvelles();
    });

    // Statut reste ENVOYEE (offline : pas de changement local)
    expect(result.current.consignes[0].statut).toBe('ENVOYEE');
  });

  // SC11 : statut local passe à PRISE_EN_COMPTE après succès backend
  it('SC11 — prendreEnCompteNouvelles passe le statut local à PRISE_EN_COMPTE', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);
    const prendreEnCompteMock = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useConsignesLocales(undefined, prendreEnCompteMock)
    );

    await act(async () => {
      await result.current.ajouterConsigne(instruction1); // ENVOYEE
    });

    await act(async () => {
      await result.current.prendreEnCompteNouvelles();
    });

    const consigne = result.current.consignes.find(
      (c) => c.instructionId === 'instr-001'
    );
    expect(consigne?.statut).toBe('PRISE_EN_COMPTE');
  });
});
