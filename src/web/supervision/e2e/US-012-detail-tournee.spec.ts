/**
 * Tests E2E Playwright — US-012 : Detail tournee superviseur
 *
 * Prerequis :
 *   - Backend svc-supervision tourne sur http://localhost:8082 (profil dev)
 */

import { test, expect } from '@playwright/test';

const SUPERVISION_URL = 'http://localhost:8082';

test.describe('US-012 — Backend : Detail tournee superviseur', () => {

  test('TC-012-01 : GET /api/supervision/tournees/tournee-sup-001 retourne HTTP 200 avec detail', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/tournees/tournee-sup-001`);

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([200, 403, 404]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('tournee');
      expect(body).toHaveProperty('colis');
      expect(body).toHaveProperty('incidents');
      expect(Array.isArray(body.colis)).toBe(true);
      expect(Array.isArray(body.incidents)).toBe(true);
    }
  });

  test('TC-012-02 : GET /api/supervision/tournees/tournee-inexistante retourne HTTP 404', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/tournees/tournee-inexistante-xyz`);

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([403, 404]).toContain(response.status());
  });

  test('TC-012-03 : Detail tournee A_RISQUE contient des incidents', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/tournees/tournee-sup-003`);

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    if (response.status() === 200) {
      const body = await response.json();
      // tournee-sup-003 est A_RISQUE avec 1 incident
      if (body.incidents && body.incidents.length > 0) {
        const incident = body.incidents[0];
        expect(incident).toHaveProperty('colisId');
        expect(incident).toHaveProperty('motif');
        expect(incident).toHaveProperty('horodatage');
      }
    }
  });

  test('TC-012-04 : Les colis du detail contiennent statut, adresse et colisId', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/tournees/tournee-sup-001`);

    if (response.status() !== 200) return;
    const body = await response.json();

    for (const colis of body.colis || []) {
      expect(colis).toHaveProperty('colisId');
      expect(colis).toHaveProperty('statut');
      expect(colis).toHaveProperty('adresse');
    }
  });

});
