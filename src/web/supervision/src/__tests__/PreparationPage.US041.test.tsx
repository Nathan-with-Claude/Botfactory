/**
 * Tests TDD — US-041 : Poids estimé et alerte de surcharge dans le tableau de préparation W-04
 *
 * Ces tests couvrent :
 *   SC1 — Colonne "Poids" visible dans le tableau W-04 avec valeur en kg
 *   SC2 — Icône d'alerte rouge si poids > capacité véhicule (surcharge critique)
 *   SC3 — Icône d'alerte orange si poids >= 95% de la capacité (seuil d'approche)
 *   SC4 — Aucune alerte si charge normale (< 95%)
 *   SC5 — Aucune alerte ni capacité si véhicule non affecté
 *
 * Tests unitaires sur calculerNiveauAlerte (fonction pure)
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import PreparationPage, { TourneePlanifieeDTO } from '../pages/PreparationPage';
import {
  calculerNiveauAlerte,
  NiveauAlerte,
} from '../utils/alerteSurcharge';

// ─── Tests unitaires — calculerNiveauAlerte ───────────────────────────────────

describe('calculerNiveauAlerte (US-041 — fonction pure)', () => {

  it('retourne AUCUNE si pas de véhicule affecté (capacite null)', () => {
    expect(calculerNiveauAlerte(800, null)).toBe<NiveauAlerte>('AUCUNE');
  });

  it('retourne AUCUNE si pas de véhicule affecté (capacite undefined)', () => {
    expect(calculerNiveauAlerte(800, undefined)).toBe<NiveauAlerte>('AUCUNE');
  });

  it('retourne AUCUNE si poids < 95% de la capacité', () => {
    // 700 kg / 800 kg = 87.5% → sous le seuil d'alerte (95%)
    expect(calculerNiveauAlerte(700, 800)).toBe<NiveauAlerte>('AUCUNE');
  });

  it('retourne APPROCHE si poids = exactement 95% de la capacité', () => {
    // 760 kg / 800 kg = 95% → seuil d'alerte (APPROCHE)
    expect(calculerNiveauAlerte(760, 800)).toBe<NiveauAlerte>('APPROCHE');
  });

  it('retourne APPROCHE si poids >= 95% et <= 100% de la capacité', () => {
    // 775 kg / 800 kg = 96.875% → APPROCHE
    expect(calculerNiveauAlerte(775, 800)).toBe<NiveauAlerte>('APPROCHE');
  });

  it('retourne CRITIQUE si poids > 100% de la capacité', () => {
    // 850 kg / 800 kg = 106.25% → CRITIQUE
    expect(calculerNiveauAlerte(850, 800)).toBe<NiveauAlerte>('CRITIQUE');
  });

  it('retourne AUCUNE si poids = exactement 100% (pas encore dépassé)', () => {
    // 800 kg / 800 kg = exactement 100% → encore dans APPROCHE (non dépassé)
    expect(calculerNiveauAlerte(800, 800)).toBe<NiveauAlerte>('APPROCHE');
  });

  it('retourne AUCUNE si poids à 0 kg', () => {
    expect(calculerNiveauAlerte(0, 800)).toBe<NiveauAlerte>('AUCUNE');
  });
});

// ─── Helpers & fixtures ───────────────────────────────────────────────────────

function tourneeMock(overrides: Partial<TourneePlanifieeDTO> = {}): TourneePlanifieeDTO {
  return {
    id: 'tp-001',
    codeTms: 'T-205',
    date: new Date().toISOString().slice(0, 10),
    nbColis: 30,
    zones: [{ nom: 'Lyon 8e', nbColis: 30 }],
    statut: 'AFFECTEE',
    livreurId: 'livreur-001',
    livreurNom: 'Pierre Morel',
    vehiculeId: 'VH-07',
    importeeLe: new Date().toISOString(),
    affecteeLe: new Date().toISOString(),
    lancee: null,
    compositionVerifiee: true,
    aDesAnomalies: false,
    poidsEstimeKg: 400,
    capaciteVehiculeKg: 800,
    ...overrides,
  };
}

function mockFetch(tournees: TourneePlanifieeDTO[]): typeof fetch {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      date: new Date().toISOString().slice(0, 10),
      totalTournees: tournees.length,
      nonAffectees: 0,
      affectees: tournees.length,
      lancees: 0,
      tournees,
    }),
  } as unknown as Response) as unknown as typeof fetch;
}

// ─── Tests intégration — PreparationPage W-04 ────────────────────────────────

describe('PreparationPage — colonne Poids (US-041)', () => {

  it('SC1 : la colonne "Poids" est visible dans l\'en-tête du tableau', async () => {
    await act(async () => {
      render(
        <PreparationPage fetchFn={mockFetch([tourneeMock()])} />
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('colonne-poids-entete')).toBeInTheDocument();
    });
  });

  it('SC1 : le poids estimé est affiché en kg dans la cellule de la tournée', async () => {
    await act(async () => {
      render(
        <PreparationPage fetchFn={mockFetch([tourneeMock({ poidsEstimeKg: 400 })])} />
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('poids-tp-001')).toBeInTheDocument();
      expect(screen.getByTestId('poids-tp-001').textContent).toContain('400');
    });
  });

  it('SC4 : aucune icône d\'alerte si charge normale (< 95%)', async () => {
    await act(async () => {
      render(
        <PreparationPage
          fetchFn={mockFetch([tourneeMock({ poidsEstimeKg: 400, capaciteVehiculeKg: 800 })])}
        />
      );
    });
    await waitFor(() => {
      expect(screen.queryByTestId('alerte-surcharge-tp-001')).not.toBeInTheDocument();
    });
  });

  it('SC3 : icône d\'alerte APPROCHE (orange) si poids >= 95% de la capacité', async () => {
    await act(async () => {
      render(
        <PreparationPage
          fetchFn={mockFetch([tourneeMock({ poidsEstimeKg: 775, capaciteVehiculeKg: 800 })])}
        />
      );
    });
    await waitFor(() => {
      const alerte = screen.getByTestId('alerte-surcharge-tp-001');
      expect(alerte).toBeInTheDocument();
      expect(alerte.getAttribute('data-niveau')).toBe('APPROCHE');
    });
  });

  it('SC2 : icône d\'alerte CRITIQUE (rouge) si poids > capacité', async () => {
    await act(async () => {
      render(
        <PreparationPage
          fetchFn={mockFetch([tourneeMock({ poidsEstimeKg: 850, capaciteVehiculeKg: 800 })])}
        />
      );
    });
    await waitFor(() => {
      const alerte = screen.getByTestId('alerte-surcharge-tp-001');
      expect(alerte).toBeInTheDocument();
      expect(alerte.getAttribute('data-niveau')).toBe('CRITIQUE');
    });
  });

  it('SC5 : aucune alerte si véhicule non affecté (capaciteVehiculeKg absent)', async () => {
    await act(async () => {
      render(
        <PreparationPage
          fetchFn={mockFetch([tourneeMock({ vehiculeId: null, capaciteVehiculeKg: undefined })])}
        />
      );
    });
    await waitFor(() => {
      // Pas d'icône d'alerte surcharge
      expect(screen.queryByTestId('alerte-surcharge-tp-001')).not.toBeInTheDocument();
    });
  });
});
