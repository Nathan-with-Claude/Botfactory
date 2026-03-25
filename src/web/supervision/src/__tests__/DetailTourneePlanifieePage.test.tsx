import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import DetailTourneePlanifieePage, {
  TourneePlanifieeDetailDTO,
  LivreurDisponible,
  VehiculeDisponible
} from '../pages/DetailTourneePlanifieePage';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);

function detailMock(statut = 'NON_AFFECTEE'): TourneePlanifieeDetailDTO {
  return {
    id: 'tp-203', codeTms: 'T-203', date: today, nbColis: 41,
    zones: [{ nom: 'Lyon 8e', nbColis: 27 }, { nom: 'Lyon 5e', nbColis: 14 }],
    contraintes: [
      { libelle: 'Livraison avant 10h00', nbColisAffectes: 6 },
      { libelle: 'Livraison avant 12h00', nbColisAffectes: 3 },
    ],
    anomalies: [{ code: 'SURCHARGE', description: '41 colis dépasse le seuil de 35' }],
    statut,
    livreurId: statut !== 'NON_AFFECTEE' ? 'livreur-001' : null,
    livreurNom: statut !== 'NON_AFFECTEE' ? 'Pierre Morel' : null,
    vehiculeId: statut !== 'NON_AFFECTEE' ? 'VH-07' : null,
    importeeLe: new Date().toISOString(),
    affecteeLe: statut !== 'NON_AFFECTEE' ? new Date().toISOString() : null,
    lancee: statut === 'LANCEE' ? new Date().toISOString() : null,
    compositionVerifiee: statut !== 'NON_AFFECTEE',
  };
}

const livreurs: LivreurDisponible[] = [
  { id: 'livreur-001', nom: 'P. Morel', disponible: true },
  { id: 'livreur-002', nom: 'L. Petit', disponible: true },
  { id: 'livreur-003', nom: 'J. Dupont', disponible: false, tourneeAffectee: 'T-042' },
];

const vehicules: VehiculeDisponible[] = [
  { id: 'VH-07', disponible: true },
  { id: 'VH-04', disponible: true },
  { id: 'VH-03', disponible: false, tourneeAffectee: 'T-204' },
];

function mockFetch(data: unknown, status = 200) {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as unknown as Response);
}

// ─── Tests US-022 : Vérifier composition ──────────────────────────────────────

describe('DetailTourneePlanifieePage — US-022', () => {

  it('affiche les zones couvertes de la tournée', async () => {
    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-203"
          fetchFn={mockFetch(detailMock())}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    expect(screen.getByText(/Lyon 8e/)).toBeTruthy();
    expect(screen.getByText(/Lyon 5e/)).toBeTruthy();
  });

  it('affiche les contraintes horaires', async () => {
    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-203"
          fetchFn={mockFetch(detailMock())}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    expect(screen.getByText(/Livraison avant 10h00/)).toBeTruthy();
  });

  it('affiche l\'anomalie SURCHARGE dans le bloc anomalies', async () => {
    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-203"
          fetchFn={mockFetch(detailMock())}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    expect(screen.getByTestId('anomalie-SURCHARGE')).toBeTruthy();
  });

  it('affiche "Aucune anomalie détectée" pour une tournée sans anomalie', async () => {
    const detailSansAnomalie = { ...detailMock(), anomalies: [] };
    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-201"
          fetchFn={mockFetch(detailSansAnomalie)}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    expect(screen.getByTestId('aucune-anomalie')).toBeTruthy();
  });

  it('valider la composition envoie POST et met à jour l\'état', async () => {
    const detailVerifie = { ...detailMock(), compositionVerifiee: true };
    let callCount = 0;
    const fetchFn = jest.fn().mockImplementation((_url: string, options?: RequestInit) => {
      if (options?.method === 'POST') {
        return Promise.resolve({ ok: true, status: 200, json: async () => detailVerifie } as unknown as Response);
      }
      callCount++;
      const data = callCount === 1 ? detailMock() : detailVerifie;
      return Promise.resolve({ ok: true, status: 200, json: async () => data } as unknown as Response);
    });

    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-203"
          fetchFn={fetchFn}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-valider-composition'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('message-succes')).toBeTruthy();
    });
  });

  it('affiche l\'indicateur d\'anomalie dans le header si anomalies présentes', async () => {
    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-203"
          fetchFn={mockFetch(detailMock())}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    expect(screen.getByTestId('indicateur-anomalie')).toBeTruthy();
  });
});

// ─── Tests US-023 : Affecter livreur + véhicule ───────────────────────────────

describe('DetailTourneePlanifieePage — US-023', () => {

  it('bascule sur l\'onglet Affectation quand on clique dessus', async () => {
    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-203"
          fetchFn={mockFetch(detailMock())}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    fireEvent.click(screen.getByTestId('onglet-affectation'));
    expect(screen.getByTestId('contenu-affectation')).toBeTruthy();
  });

  it('les boutons sont désactivés sans sélection de livreur ET véhicule', async () => {
    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-203"
          fetchFn={mockFetch(detailMock())}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    fireEvent.click(screen.getByTestId('onglet-affectation'));

    const btnAffecter = screen.getByTestId('btn-valider-affectation') as HTMLButtonElement;
    const btnLancer = screen.getByTestId('btn-valider-et-lancer') as HTMLButtonElement;

    expect(btnAffecter.disabled).toBe(true);
    expect(btnLancer.disabled).toBe(true);
  });

  it('affiche le message de livreur indisponible dans la liste', async () => {
    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-203"
          fetchFn={mockFetch(detailMock())}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    fireEvent.click(screen.getByTestId('onglet-affectation'));
    // J. Dupont indisponible apparaît dans le select (option) et dans l'info disponibilité
    const livreurSelect = screen.getByTestId('select-livreur');
    expect(livreurSelect.textContent).toContain('J. Dupont');
    expect(livreurSelect.textContent).toContain('Indisponible');
  });

  it('affiche "lecture seule" pour une tournée LANCEE', async () => {
    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-203"
          fetchFn={mockFetch(detailMock('LANCEE'))}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    fireEvent.click(screen.getByTestId('onglet-affectation'));
    expect(screen.getByTestId('tournee-lancee-readonly')).toBeTruthy();
  });

  it('enregistre l\'affectation et affiche un message de succès', async () => {
    const detailApresAffectation = detailMock('AFFECTEE');
    let postCount = 0;
    const fetchFn = jest.fn().mockImplementation((_url: string, options?: RequestInit) => {
      if (options?.method === 'POST') {
        postCount++;
        return Promise.resolve({ ok: true, status: 200, json: async () => detailApresAffectation } as unknown as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => (postCount === 0 ? detailMock() : detailApresAffectation) } as unknown as Response);
    });

    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-203"
          fetchFn={fetchFn}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    fireEvent.click(screen.getByTestId('onglet-affectation'));

    await act(async () => {
      fireEvent.change(screen.getByTestId('select-livreur'), { target: { value: 'livreur-001' } });
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('select-vehicule'), { target: { value: 'VH-07' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-valider-affectation'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('message-succes')).toBeTruthy();
    });
  });
});
