import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import DetailTourneePlanifieePage, {
  TourneePlanifieeDetailDTO,
  LivreurDisponible,
  VehiculeDisponible,
  CompatibiliteVehiculeDTO,
  VehiculeCompatibleDTO
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

// ─── Tests US-030 : Vérification compatibilité véhicule ───────────────────────

describe('DetailTourneePlanifieePage — US-030', () => {

  function detailAvecPoids(poidsEstimeKg: number): TourneePlanifieeDetailDTO {
    return {
      ...detailMock(),
      poidsEstimeKg,
    };
  }

  it('affiche l\'indicateur COMPATIBLE quand la vérification retourne compatible', async () => {
    const compatibleResponse: CompatibiliteVehiculeDTO = {
      resultat: 'COMPATIBLE', poidsEstimeKg: 350, capaciteKg: 600,
      margeOuDepassementKg: 250, vehiculeId: 'VH-07', message: 'Compatible',
    };

    const fetchFn = jest.fn().mockImplementation((_url: string, options?: RequestInit) => {
      if (options?.method === 'POST' && (_url as string).includes('verifier-compatibilite')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => compatibleResponse } as unknown as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => detailAvecPoids(350) } as unknown as Response);
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

    // Sélectionner livreur puis véhicule → déclenche la vérification
    await act(async () => {
      fireEvent.change(screen.getByTestId('select-livreur'), { target: { value: 'livreur-001' } });
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('select-vehicule'), { target: { value: 'VH-07' } });
    });

    await waitFor(() => {
      expect(screen.getByTestId('indicateur-compatibilite-COMPATIBLE')).toBeTruthy();
    });
  });

  it('affiche l\'indicateur DEPASSEMENT et le bouton "Réaffecter" quand dépassement détecté', async () => {
    const depassementResponse: CompatibiliteVehiculeDTO = {
      resultat: 'DEPASSEMENT', poidsEstimeKg: 410, capaciteKg: 400,
      margeOuDepassementKg: 10, vehiculeId: 'VH-09', message: 'VH-09 : capacité 400 kg, tournée 410 kg.',
    };

    const fetchFn = jest.fn().mockImplementation((_url: string, options?: RequestInit) => {
      if (options?.method === 'POST' && (_url as string).includes('verifier-compatibilite')) {
        return Promise.resolve({ ok: false, status: 409, json: async () => depassementResponse } as unknown as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => detailAvecPoids(410) } as unknown as Response);
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

    await waitFor(() => {
      expect(screen.getByTestId('indicateur-compatibilite-DEPASSEMENT')).toBeTruthy();
      expect(screen.getByTestId('btn-reaffecter-vehicule-plus-grand')).toBeTruthy();
    });
  });

  it('le bouton "Valider et Lancer" est désactivé si dépassement non forcé', async () => {
    const depassementResponse: CompatibiliteVehiculeDTO = {
      resultat: 'DEPASSEMENT', poidsEstimeKg: 410, capaciteKg: 400,
      margeOuDepassementKg: 10, vehiculeId: 'VH-09', message: 'Surcharge.',
    };

    const fetchFn = jest.fn().mockImplementation((_url: string, options?: RequestInit) => {
      if (options?.method === 'POST' && (_url as string).includes('verifier-compatibilite')) {
        return Promise.resolve({ ok: false, status: 409, json: async () => depassementResponse } as unknown as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => detailAvecPoids(410) } as unknown as Response);
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

    await waitFor(() => {
      const btnLancer = screen.getByTestId('btn-valider-et-lancer') as HTMLButtonElement;
      expect(btnLancer.disabled).toBe(true);
    });
  });
});

// ─── Tests US-034 : Réaffectation vers un véhicule plus grand ─────────────────

describe('DetailTourneePlanifieePage — US-034', () => {

  function detailAvecPoids(poidsEstimeKg: number): TourneePlanifieeDetailDTO {
    return { ...detailMock(), poidsEstimeKg };
  }

  const depassementInitial: CompatibiliteVehiculeDTO = {
    resultat: 'DEPASSEMENT', poidsEstimeKg: 410, capaciteKg: 400,
    margeOuDepassementKg: 10, vehiculeId: 'VH-09', message: 'Surcharge.',
  };

  const vehiculesCompatiblesMock: VehiculeCompatibleDTO[] = [
    { vehiculeId: 'VH-02', immatriculation: 'VH-02', capaciteKg: 600, typeVehicule: 'FOURGON', disponible: true },
    { vehiculeId: 'VH-01', immatriculation: 'VH-01', capaciteKg: 800, typeVehicule: 'FOURGON', disponible: true },
  ];

  it('SC1 — le bouton "Réaffecter à un véhicule plus grand" est visible après dépassement', async () => {
    const fetchFn = jest.fn().mockImplementation((_url: string, options?: RequestInit) => {
      if (options?.method === 'POST' && (_url as string).includes('verifier-compatibilite')) {
        return Promise.resolve({ ok: false, status: 409, json: async () => depassementInitial } as unknown as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => detailAvecPoids(410) } as unknown as Response);
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

    await waitFor(() => {
      expect(screen.getByTestId('btn-reaffecter-vehicule-plus-grand')).toBeTruthy();
    });
  });

  it('SC2 — cliquer sur "Réaffecter" ouvre le panneau avec la liste filtrée', async () => {
    const fetchFn = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
      if (options?.method === 'POST' && (url as string).includes('verifier-compatibilite')) {
        return Promise.resolve({ ok: false, status: 409, json: async () => depassementInitial } as unknown as Response);
      }
      if ((url as string).includes('vehicules/compatibles')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => vehiculesCompatiblesMock } as unknown as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => detailAvecPoids(410) } as unknown as Response);
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
      fireEvent.change(screen.getByTestId('select-vehicule'), { target: { value: 'VH-07' } });
    });

    await waitFor(() => screen.getByTestId('btn-reaffecter-vehicule-plus-grand'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-reaffecter-vehicule-plus-grand'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('panneau-reaffectation')).toBeTruthy();
      expect(screen.getByTestId('liste-vehicules-compatibles')).toBeTruthy();
      expect(screen.getByTestId('vehicule-compatible-VH-02')).toBeTruthy();
      expect(screen.getByTestId('vehicule-compatible-VH-01')).toBeTruthy();
    });
  });

  it('SC3 — sélectionner un véhicule compatible ferme le panneau et affiche succès', async () => {
    const compatibleApresReaffectation: CompatibiliteVehiculeDTO = {
      resultat: 'COMPATIBLE', poidsEstimeKg: 410, capaciteKg: 600,
      margeOuDepassementKg: 190, vehiculeId: 'VH-02', message: 'Compatible.',
    };

    const fetchFn = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
      if (options?.method === 'POST' && (url as string).includes('verifier-compatibilite')) {
        return Promise.resolve({ ok: false, status: 409, json: async () => depassementInitial } as unknown as Response);
      }
      if ((url as string).includes('vehicules/compatibles')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => vehiculesCompatiblesMock } as unknown as Response);
      }
      if (options?.method === 'POST' && (url as string).includes('reaffecter-vehicule')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => compatibleApresReaffectation } as unknown as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => detailAvecPoids(410) } as unknown as Response);
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
      fireEvent.change(screen.getByTestId('select-vehicule'), { target: { value: 'VH-07' } });
    });
    await waitFor(() => screen.getByTestId('btn-reaffecter-vehicule-plus-grand'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-reaffecter-vehicule-plus-grand'));
    });
    await waitFor(() => screen.getByTestId('btn-selectionner-vehicule-VH-02'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-selectionner-vehicule-VH-02'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('message-succes')).toBeTruthy();
      expect(screen.queryByTestId('panneau-reaffectation')).toBeNull();
    });
  });

  it('SC4 — le panneau affiche "Aucun véhicule disponible" si liste vide', async () => {
    const fetchFn = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
      if (options?.method === 'POST' && (url as string).includes('verifier-compatibilite')) {
        return Promise.resolve({ ok: false, status: 409, json: async () => depassementInitial } as unknown as Response);
      }
      if ((url as string).includes('vehicules/compatibles')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => [] } as unknown as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => detailAvecPoids(410) } as unknown as Response);
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
      fireEvent.change(screen.getByTestId('select-vehicule'), { target: { value: 'VH-07' } });
    });
    await waitFor(() => screen.getByTestId('btn-reaffecter-vehicule-plus-grand'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-reaffecter-vehicule-plus-grand'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('panneau-reaffectation')).toBeTruthy();
      expect(screen.getByTestId('aucun-vehicule-disponible')).toBeTruthy();
    });
  });

  it('SC5 — le bouton "Réaffecter" disparaît après forçage via "Affecter quand même"', async () => {
    const depassementForce: CompatibiliteVehiculeDTO = {
      resultat: 'DEPASSEMENT', poidsEstimeKg: 410, capaciteKg: 400,
      margeOuDepassementKg: 10, vehiculeId: 'VH-09', message: 'Dépassement forcé.',
    };

    let appelCount = 0;
    const fetchFn = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
      if (options?.method === 'POST' && (url as string).includes('verifier-compatibilite')) {
        appelCount++;
        const rep = appelCount === 1 ? depassementInitial : depassementForce;
        return Promise.resolve({ ok: true, status: 200, json: async () => rep } as unknown as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => detailAvecPoids(410) } as unknown as Response);
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
      fireEvent.change(screen.getByTestId('select-vehicule'), { target: { value: 'VH-07' } });
    });
    await waitFor(() => screen.getByTestId('btn-affecter-quand-meme'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-affecter-quand-meme'));
    });

    await waitFor(() => {
      // Après forçage, le bouton "Réaffecter" disparaît
      expect(screen.queryByTestId('btn-reaffecter-vehicule-plus-grand')).toBeNull();
    });
  });
});

// ─── Tests US-049 : 6 livreurs dev alignés ────────────────────────────────────

describe('DetailTourneePlanifieePage — US-049 (6 livreurs dev)', () => {

  it('SC4 — le mock par défaut contient exactement 6 livreurs', async () => {
    // Tester que le composant sans prop livreurs affiche bien les 6 options
    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-201"
          fetchFn={mockFetch(detailMock('NON_AFFECTEE'))}
        />
      );
    });

    fireEvent.click(screen.getByTestId('onglet-affectation'));

    const select = screen.getByTestId('select-livreur') as HTMLSelectElement;
    // 6 livreurs + 1 option vide = 7 options
    expect(select.options.length).toBe(7);
    // Vérifier les IDs canoniques
    const ids = Array.from(select.options).map(o => o.value).filter(v => v !== '');
    expect(ids).toEqual([
      'livreur-001', 'livreur-002', 'livreur-003',
      'livreur-004', 'livreur-005', 'livreur-006',
    ]);
  });

  it('SC4 — les noms canoniques correspondent aux IDs officiels', async () => {
    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-201"
          fetchFn={mockFetch(detailMock('NON_AFFECTEE'))}
        />
      );
    });

    fireEvent.click(screen.getByTestId('onglet-affectation'));

    const select = screen.getByTestId('select-livreur') as HTMLSelectElement;
    const texteOptions = Array.from(select.options).map(o => o.text);
    expect(texteOptions.some(t => t.includes('Pierre Martin'))).toBe(true);
    expect(texteOptions.some(t => t.includes('Paul Dupont'))).toBe(true);
    expect(texteOptions.some(t => t.includes('Marie Lambert'))).toBe(true);
    expect(texteOptions.some(t => t.includes('Jean Moreau'))).toBe(true);
    expect(texteOptions.some(t => t.includes('Sophie Bernard'))).toBe(true);
    expect(texteOptions.some(t => t.includes('Lucas Petit'))).toBe(true);
  });
});

// ─── Tests US-050 : Désaffecter un livreur ────────────────────────────────────

describe('DetailTourneePlanifieePage — US-050 (Désaffectation)', () => {

  function detailAffecte(): TourneePlanifieeDetailDTO {
    return {
      id: 'tp-202', codeTms: 'T-202', date: today, nbColis: 28,
      zones: [{ nom: 'Villeurbanne', nbColis: 28 }],
      contraintes: [], anomalies: [],
      statut: 'AFFECTEE',
      livreurId: 'livreur-001',
      livreurNom: 'Pierre Martin',
      vehiculeId: 'VH-07',
      importeeLe: new Date().toISOString(),
      affecteeLe: new Date().toISOString(),
      lancee: null,
      compositionVerifiee: true,
    };
  }

  it('SC1 — le bouton "Désaffecter" est visible pour une tournée AFFECTEE', async () => {
    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-202"
          fetchFn={mockFetch(detailAffecte())}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    fireEvent.click(screen.getByTestId('onglet-affectation'));

    expect(screen.getByTestId('btn-desaffecter')).toBeTruthy();
    expect(screen.getByTestId('section-desaffectation')).toBeTruthy();
  });

  it('SC4 — le bouton "Désaffecter" est absent pour une tournée NON_AFFECTEE', async () => {
    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-201"
          fetchFn={mockFetch(detailMock('NON_AFFECTEE'))}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    fireEvent.click(screen.getByTestId('onglet-affectation'));

    expect(screen.queryByTestId('btn-desaffecter')).toBeNull();
  });

  it('SC3 — une tournée LANCEE affiche le message d\'impossibilité de désaffectation', async () => {
    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-204"
          fetchFn={mockFetch(detailMock('LANCEE'))}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    fireEvent.click(screen.getByTestId('onglet-affectation'));

    expect(screen.getByTestId('msg-tournee-en-cours')).toBeTruthy();
    expect(screen.queryByTestId('btn-desaffecter')).toBeNull();
  });

  it('SC2 — cliquer "Désaffecter" et confirmer appelle DELETE /affectation', async () => {
    window.confirm = jest.fn().mockReturnValue(true);

    const detailDesaffecte = { ...detailAffecte(), statut: 'NON_AFFECTEE', livreurId: null, livreurNom: null, vehiculeId: null };

    let fetchCallCount = 0;
    const fetchFn = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
      fetchCallCount++;
      if (options?.method === 'DELETE') {
        return Promise.resolve({ ok: true, status: 200, json: async () => detailDesaffecte } as unknown as Response);
      }
      const data = fetchCallCount === 1 ? detailAffecte() : detailDesaffecte;
      return Promise.resolve({ ok: true, status: 200, json: async () => data } as unknown as Response);
    });

    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-202"
          fetchFn={fetchFn}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    fireEvent.click(screen.getByTestId('onglet-affectation'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-desaffecter'));
    });

    // Vérifier que DELETE a été appelé sur /affectation
    const deleteCall = (fetchFn as jest.Mock).mock.calls.find(
      (call: [string, RequestInit?]) => call[1]?.method === 'DELETE'
    );
    expect(deleteCall).toBeTruthy();
    expect(deleteCall[0]).toContain('/affectation');
  });

  it('SC3 — erreur 409 lors de la désaffectation affiche un message d\'erreur', async () => {
    window.confirm = jest.fn().mockReturnValue(true);

    const fetchFn = jest.fn().mockImplementation((_url: string, options?: RequestInit) => {
      if (options?.method === 'DELETE') {
        return Promise.resolve({ ok: false, status: 409, json: async () => ({}) } as unknown as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => detailAffecte() } as unknown as Response);
    });

    await act(async () => {
      render(
        <DetailTourneePlanifieePage
          tourneePlanifieeId="tp-202"
          fetchFn={fetchFn}
          livreurs={livreurs}
          vehicules={vehicules}
        />
      );
    });

    fireEvent.click(screen.getByTestId('onglet-affectation'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-desaffecter'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('message-erreur')).toBeTruthy();
    });
  });
});
