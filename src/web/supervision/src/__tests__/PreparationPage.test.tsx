import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import PreparationPage, { PlanDuJourDTO, TourneePlanifieeDTO } from '../pages/PreparationPage';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);

function planMock(): PlanDuJourDTO {
  return {
    date: today,
    totalTournees: 4,
    nonAffectees: 2,
    affectees: 1,
    lancees: 1,
    tournees: [
      {
        id: 'tp-201', codeTms: 'T-201', date: today, nbColis: 34,
        zones: [{ nom: 'Lyon 3e', nbColis: 20 }, { nom: 'Lyon 6e', nbColis: 14 }],
        statut: 'NON_AFFECTEE',
        livreurId: null, livreurNom: null, vehiculeId: null,
        importeeLe: new Date().toISOString(),
        affecteeLe: null, lancee: null,
        compositionVerifiee: false, aDesAnomalies: false,
      },
      {
        id: 'tp-202', codeTms: 'T-202', date: today, nbColis: 28,
        zones: [{ nom: 'Villeurbanne', nbColis: 28 }],
        statut: 'AFFECTEE',
        livreurId: 'livreur-001', livreurNom: 'Pierre Morel', vehiculeId: 'VH-07',
        importeeLe: new Date().toISOString(),
        affecteeLe: new Date().toISOString(), lancee: null,
        compositionVerifiee: true, aDesAnomalies: false,
      },
      {
        id: 'tp-203', codeTms: 'T-203', date: today, nbColis: 41,
        zones: [{ nom: 'Lyon 8e', nbColis: 27 }],
        statut: 'NON_AFFECTEE',
        livreurId: null, livreurNom: null, vehiculeId: null,
        importeeLe: new Date().toISOString(),
        affecteeLe: null, lancee: null,
        compositionVerifiee: false, aDesAnomalies: true,
      },
      {
        id: 'tp-204', codeTms: 'T-204', date: today, nbColis: 22,
        zones: [{ nom: 'Lyon 2e', nbColis: 22 }],
        statut: 'LANCEE',
        livreurId: 'livreur-002', livreurNom: 'Paul Dupont', vehiculeId: 'VH-03',
        importeeLe: new Date().toISOString(),
        affecteeLe: new Date().toISOString(),
        lancee: new Date().toISOString(),
        compositionVerifiee: false, aDesAnomalies: false,
      },
    ],
  };
}

function mockFetch(data: unknown, status = 200) {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as unknown as Response);
}

// ─── Tests US-021 : Visualiser le plan du jour ────────────────────────────────

describe('PreparationPage — US-021', () => {

  it('affiche le bandeau résumé avec les compteurs du plan du jour', async () => {
    const fetchFn = mockFetch(planMock());

    await act(async () => {
      render(<PreparationPage fetchFn={fetchFn} />);
    });

    expect(screen.getByTestId('bandeau-resume')).toBeTruthy();
    expect(screen.getByTestId('total-tournees').textContent).toBe('4');
  });

  it('affiche les 4 lignes de tournées dans le tableau', async () => {
    await act(async () => {
      render(<PreparationPage fetchFn={mockFetch(planMock())} />);
    });

    expect(screen.getByTestId('ligne-tournee-tp-201')).toBeTruthy();
    expect(screen.getByTestId('ligne-tournee-tp-202')).toBeTruthy();
    expect(screen.getByTestId('ligne-tournee-tp-203')).toBeTruthy();
    expect(screen.getByTestId('ligne-tournee-tp-204')).toBeTruthy();
  });

  it('affiche le badge NON AFFECTÉE en rouge pour T-201', async () => {
    await act(async () => {
      render(<PreparationPage fetchFn={mockFetch(planMock())} />);
    });

    const badge = screen.getByTestId('badge-statut-tp-201');
    expect(badge.textContent).toBe('NON AFFECTÉE');
    expect(badge.style.backgroundColor).toBe('rgb(220, 53, 69)');
  });

  it('affiche le badge AFFECTÉE en vert pour T-202', async () => {
    await act(async () => {
      render(<PreparationPage fetchFn={mockFetch(planMock())} />);
    });

    const badge = screen.getByTestId('badge-statut-tp-202');
    expect(badge.textContent).toBe('AFFECTÉE');
  });

  it('affiche le badge LANCÉE en bleu pour T-204', async () => {
    await act(async () => {
      render(<PreparationPage fetchFn={mockFetch(planMock())} />);
    });

    const badge = screen.getByTestId('badge-statut-tp-204');
    expect(badge.textContent).toBe('LANCÉE');
  });

  it('affiche l\'icône d\'anomalie pour T-203 (surcharge)', async () => {
    await act(async () => {
      render(<PreparationPage fetchFn={mockFetch(planMock())} />);
    });

    expect(screen.getByTestId('anomalie-tp-203')).toBeTruthy();
  });

  it('affiche "Aucune tournée" quand le plan est vide', async () => {
    const planVide: PlanDuJourDTO = { date: today, totalTournees: 0, nonAffectees: 0, affectees: 0, lancees: 0, tournees: [] };
    await act(async () => {
      render(<PreparationPage fetchFn={mockFetch(planVide)} />);
    });

    expect(screen.getByTestId('aucune-tournee')).toBeTruthy();
  });

  it('affiche le bouton LANCER pour T-202 (AFFECTEE)', async () => {
    await act(async () => {
      render(<PreparationPage fetchFn={mockFetch(planMock())} />);
    });

    expect(screen.getByTestId('btn-lancer-tp-202')).toBeTruthy();
  });

  it('affiche le bouton Affecter pour T-201 (NON_AFFECTEE)', async () => {
    await act(async () => {
      render(<PreparationPage fetchFn={mockFetch(planMock())} />);
    });

    expect(screen.getByTestId('btn-affecter-tp-201')).toBeTruthy();
  });

  it('appelle onAffecter avec l\'id quand on clique sur Affecter', async () => {
    const onAffecter = jest.fn();
    await act(async () => {
      render(<PreparationPage fetchFn={mockFetch(planMock())} onAffecter={onAffecter} />);
    });

    fireEvent.click(screen.getByTestId('btn-affecter-tp-201'));
    expect(onAffecter).toHaveBeenCalledWith('tp-201');
  });

  it('appelle onVoirDetail avec l\'id quand on clique sur Voir détail', async () => {
    const onVoirDetail = jest.fn();
    await act(async () => {
      render(<PreparationPage fetchFn={mockFetch(planMock())} onVoirDetail={onVoirDetail} />);
    });

    fireEvent.click(screen.getByTestId('btn-detail-tp-201'));
    expect(onVoirDetail).toHaveBeenCalledWith('tp-201');
  });

  it('affiche un message d\'erreur si le chargement échoue', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error('Network error'));
    await act(async () => {
      render(<PreparationPage fetchFn={fetchFn} />);
    });

    expect(screen.getByTestId('message-erreur')).toBeTruthy();
  });
});

// ─── Tests US-024 : Lancer tournée ────────────────────────────────────────────

describe('PreparationPage — US-024', () => {

  it('affiche le bouton LANCER TOUTES si des tournées sont AFFECTEES et aucune LANCEE', async () => {
    const planSansLancees: PlanDuJourDTO = {
      ...planMock(),
      lancees: 0,
      tournees: planMock().tournees.filter(t => t.statut !== 'LANCEE').map(t =>
        t.statut === 'AFFECTEE' ? t : t
      ),
    };

    await act(async () => {
      render(<PreparationPage fetchFn={mockFetch(planSansLancees)} />);
    });

    expect(screen.getByTestId('btn-lancer-toutes')).toBeTruthy();
  });

  it('lance une tournée individuelle et affiche un message de succès', async () => {
    let callCount = 0;
    const fetchFn = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
      if (options?.method === 'POST') {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({}) } as unknown as Response);
      }
      callCount++;
      return Promise.resolve({ ok: true, status: 200, json: async () => planMock() } as unknown as Response);
    });

    await act(async () => {
      render(<PreparationPage fetchFn={fetchFn} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-lancer-tp-202'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('message-succes')).toBeTruthy();
    });
  });
});
