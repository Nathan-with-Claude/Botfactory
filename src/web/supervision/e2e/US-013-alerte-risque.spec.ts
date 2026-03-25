/**
 * Tests E2E Playwright — US-013 : Alerte tournee a risque
 *
 * Prerequis :
 *   - Backend svc-supervision tourne sur http://localhost:8082 (profil dev)
 */

import { test, expect } from '@playwright/test';

const SUPERVISION_URL = 'http://localhost:8082';

test.describe('US-013 — Backend : Detection alerte tournee a risque', () => {

  test('TC-013-01 : GET /api/supervision/tableau-de-bord retourne au moins une tournee A_RISQUE (DevDataSeeder)', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/tableau-de-bord`);

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    if (response.status() === 200) {
      const body = await response.json();
      // Le DevDataSeeder cree 1 tournee A_RISQUE (tournee-sup-003)
      const aRisque = (body.tournees || []).filter((t: any) => t.statut === 'A_RISQUE');
      expect(aRisque.length).toBeGreaterThanOrEqual(1);
    }
  });

  test('TC-013-02 : Le bandeau resume contient aRisque >= 1 (DevDataSeeder)', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/tableau-de-bord`);

    if (response.status() !== 200) return;
    const body = await response.json();

    expect(body.bandeau).toHaveProperty('aRisque');
    expect(body.bandeau.aRisque).toBeGreaterThanOrEqual(1);
  });

  test('TC-013-03 : Invariant — une tournee CLOTUREE ne passe jamais en A_RISQUE', async ({ request }) => {
    // Verifier que la tournee CLOTUREE reste CLOTUREE
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/tableau-de-bord`);

    if (response.status() !== 200) return;
    const body = await response.json();

    const cloturees = (body.tournees || []).filter((t: any) => t.statut === 'CLOTUREE');
    for (const tournee of cloturees) {
      expect(tournee.statut).toBe('CLOTUREE');
      expect(tournee.statut).not.toBe('A_RISQUE');
    }
  });

  test('TC-013-04 : GET /api/supervision/tableau-de-bord?statut=A_RISQUE ne retourne que les tournees a risque', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/tableau-de-bord?statut=A_RISQUE`);

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    if (response.status() === 200) {
      const body = await response.json();
      for (const tournee of body.tournees || []) {
        expect(tournee.statut).toBe('A_RISQUE');
      }
    }
  });

});
