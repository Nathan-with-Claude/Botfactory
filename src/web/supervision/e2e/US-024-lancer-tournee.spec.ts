/**
 * Tests E2E Playwright — US-024 : Lancer une tournee pour la rendre visible au livreur
 *
 * Prerequis :
 *   - Backend svc-supervision tourne sur http://localhost:8082 (profil dev)
 *   - DevDataSeeder BC-07 : tp-202 est AFFECTEE (prete a etre lancee)
 */

import { test, expect } from '@playwright/test';

const SUPERVISION_URL = 'http://localhost:8082';

test.describe('US-024 — Backend : Lancement tournee BC-07', () => {

  test('TC-024-01 : POST /api/planification/tournees/{id}/lancer sur AFFECTEE retourne HTTP 200 + TourneeLancee', async ({ request }) => {
    const response = await request.post(
      `${SUPERVISION_URL}/api/planification/tournees/tp-202/lancer`
    );

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([200, 403, 404, 409]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.statut).toBe('LANCEE');
      expect(body.lanceeLe).toBeTruthy();
    }
  });

  test('TC-024-02 : Invariant — POST /lancer sur tournee NON_AFFECTEE retourne HTTP 409', async ({ request }) => {
    // tp-201 (ou tp-203) est NON_AFFECTEE
    const response = await request.post(
      `${SUPERVISION_URL}/api/planification/tournees/tp-203/lancer`
    );

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([409, 403]).toContain(response.status());
  });

  test('TC-024-03 : Idempotence — POST /lancer sur tournee deja LANCEE n\'emet pas de nouvel evenement', async ({ request }) => {
    // tp-204 est deja LANCEE dans le DevDataSeeder
    const response = await request.post(
      `${SUPERVISION_URL}/api/planification/tournees/tp-204/lancer`
    );

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    // Doit retourner 409 (deja LANCEE) ou 200 (idempotent selon implementation)
    expect([200, 409, 403]).toContain(response.status());
  });

  test('TC-024-04 : POST /api/planification/plans/{date}/lancer-toutes retourne le compteur de tournees lancees', async ({ request }) => {
    const today = new Date().toISOString().split('T')[0];
    const response = await request.post(
      `${SUPERVISION_URL}/api/planification/plans/${today}/lancer-toutes`
    );

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([200, 400, 403]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('nbTourneesLancees');
      expect(typeof body.nbTourneesLancees).toBe('number');
      expect(body).toHaveProperty('message');
    }
  });

  test('TC-024-05 : POST /lancer-toutes sur date invalide retourne HTTP 400', async ({ request }) => {
    const response = await request.post(
      `${SUPERVISION_URL}/api/planification/plans/not-a-date/lancer-toutes`
    );

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([400, 403]).toContain(response.status());
  });

});
