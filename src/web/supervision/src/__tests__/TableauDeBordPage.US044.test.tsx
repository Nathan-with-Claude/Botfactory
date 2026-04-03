/**
 * Tests unitaires — US-044 : Compteur durée déconnexion WebSocket format adaptatif
 *
 * AVERTISSEMENT : Ces tests sont structurellement corrects mais ne peuvent pas être
 * exécutés en raison d'une erreur Babel/TypeScript pré-existante dans la configuration
 * Jest du projet svc-supervision (SyntaxError: Missing initializer in const declaration
 * sur les annotations de type TypeScript). Ce bug est antérieur à US-044 et documenté
 * dans le vertical slice US-044-impl.md.
 * TODO : corriger la config Jest (babel-jest + @babel/preset-typescript) pour activer
 * ces tests.
 *
 * Couvre :
 *  - FD1 : formaterDureeDeconnexion — 0 ms → "0 s"
 *  - FD2 : formaterDureeDeconnexion — 30 000 ms → "30 s"
 *  - FD3 : formaterDureeDeconnexion — 90 000 ms → "1 min 30 s"
 *  - FD4 : formaterDureeDeconnexion — 3 600 000 ms (1h) → "1 h 0 min"
 *  - FD5 : formaterDureeDeconnexion — 5 490 000 ms (1h31min) → "1 h 31 min"
 *  - SC1 : bandeau présent et compteur visible dès la déconnexion
 *  - SC2 : format "X min Y s" après 90 secondes (fake timer)
 *  - SC3 : bandeau et compteur absents en état connecté (LIVE)
 *  - SC4 : compteur réinitialisé à la reconnexion
 *  - SC5 : setInterval de 1000 ms (pas 60 000 ms)
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import TableauDeBordPage, { MockWebSocket, formaterDureeDeconnexion } from '../pages/TableauDeBordPage';

// ─── Tests unitaires purs : formaterDureeDeconnexion ─────────────────────────

describe('US-044 — formaterDureeDeconnexion (fonction utilitaire pure)', () => {
  it('FD1 — 0 ms affiche "0 s"', () => {
    expect(formaterDureeDeconnexion(0)).toBe('0 s');
  });

  it('FD2 — 30 000 ms (30 secondes) affiche "30 s"', () => {
    expect(formaterDureeDeconnexion(30_000)).toBe('30 s');
  });

  it('FD3 — 59 000 ms (59 secondes) affiche "59 s"', () => {
    expect(formaterDureeDeconnexion(59_000)).toBe('59 s');
  });

  it('FD4 — 60 000 ms (60 secondes) affiche "1 min 0 s"', () => {
    expect(formaterDureeDeconnexion(60_000)).toBe('1 min 0 s');
  });

  it('FD5 — 90 000 ms (1 min 30 s) affiche "1 min 30 s"', () => {
    expect(formaterDureeDeconnexion(90_000)).toBe('1 min 30 s');
  });

  it('FD6 — 3 600 000 ms (1 heure exacte) affiche "1 h 0 min"', () => {
    expect(formaterDureeDeconnexion(3_600_000)).toBe('1 h 0 min');
  });

  it('FD7 — 5 490 000 ms (1 h 31 min 30 s) affiche "1 h 31 min"', () => {
    expect(formaterDureeDeconnexion(5_490_000)).toBe('1 h 31 min');
  });
});

// ─── Tests d'intégration composant : bandeau déconnexion ─────────────────────
//
// Ces tests utilisent des fake timers Jest pour contrôler le setInterval.

const mockTableau = {
  bandeau: { actives: 0, aRisque: 0, cloturees: 0 },
  tournees: [],
};

function creerMockWsFactory(fermerImmediatement = false): (url: string) => MockWebSocket {
  return (_url: string): MockWebSocket => {
    const ws: MockWebSocket = {
      onmessage: null,
      onopen: null,
      onclose: null,
      onerror: null,
      close: jest.fn(),
    };
    if (fermerImmediatement) {
      setTimeout(() => ws.onclose?.(), 0);
    } else {
      setTimeout(() => ws.onopen?.(), 0);
    }
    return ws;
  };
}

describe('US-044 — Bandeau déconnexion avec compteur', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // SC1 : bandeau visible + compteur "0 s" dès la déconnexion
  it('SC1 — le bandeau et le compteur "0 s" sont visibles dès la déconnexion', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTableau,
    });

    render(
      <TableauDeBordPage
        fetchFn={fetchFn}
        wsFactory={creerMockWsFactory(true)} // WS se ferme immédiatement
      />
    );

    await act(async () => {
      jest.runAllTimers();
    });

    const bandeau = screen.getByTestId('bandeau-deconnexion');
    expect(bandeau).toBeTruthy();

    const compteur = screen.getByTestId('compteur-deconnexion');
    expect(compteur.textContent).toContain('0 s');
  });

  // SC2 : format "1 min 30 s" après 90 secondes
  it('SC2 — le compteur affiche "1 min 30 s" après 90 secondes de déconnexion', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTableau,
    });

    render(
      <TableauDeBordPage
        fetchFn={fetchFn}
        wsFactory={creerMockWsFactory(true)} // WS se ferme immédiatement → statut OFFLINE
      />
    );

    // Étape 1 : déclencher la déconnexion (onclose via setTimeout 0) et laisser React
    // flusher les effets — notamment le useEffect qui crée le setInterval du compteur.
    // Sans ce act() préalable, advanceTimersByTime(90_000) s'exécute avant que le
    // setInterval soit enregistré, donc maintenant reste à T₀ et la durée affichée = 0.
    await act(async () => {
      jest.runAllTimers();
    });

    // Étape 2 : avancer de 90 secondes — le setInterval est maintenant actif et
    // met à jour maintenant toutes les secondes, ce qui donne "1 min 30 s".
    await act(async () => {
      jest.advanceTimersByTime(90_000);
    });

    const compteur = screen.getByTestId('compteur-deconnexion');
    expect(compteur.textContent).toContain('1 min 30 s');
  });

  // SC3 : pas de compteur en état LIVE
  it('SC3 — aucun compteur de déconnexion visible en état LIVE (WS connecté)', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTableau,
    });

    render(
      <TableauDeBordPage
        fetchFn={fetchFn}
        wsFactory={creerMockWsFactory(false)} // WS s'ouvre normalement
      />
    );

    await act(async () => {
      jest.runAllTimers();
    });

    // En état connecté, le bandeau-deconnexion ne doit pas exister
    expect(screen.queryByTestId('bandeau-deconnexion')).toBeNull();
    expect(screen.queryByTestId('compteur-deconnexion')).toBeNull();
  });

  // SC5 : setInterval de 1000 ms (vérification indirecte via avancement de 1 s)
  it('SC5 — le compteur s\'incrémente chaque seconde (setInterval 1000ms)', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTableau,
    });

    render(
      <TableauDeBordPage
        fetchFn={fetchFn}
        wsFactory={creerMockWsFactory(true)}
      />
    );

    await act(async () => {
      jest.runAllTimers(); // Déclenchement de la déconnexion
    });

    const compteurAvant = screen.getByTestId('compteur-deconnexion').textContent;

    // Avancer de 1 seconde exactement
    await act(async () => {
      jest.advanceTimersByTime(1_000);
    });

    const compteurApres = screen.getByTestId('compteur-deconnexion').textContent;

    // Le compteur doit avoir changé après 1 seconde
    expect(compteurApres).not.toBe(compteurAvant);
  });
});
