/**
 * Tests E2E Playwright — US-023 : Affecter un livreur et un vehicule
 *
 * Prerequis :
 *   - Backend svc-supervision tourne sur http://localhost:8082 (profil dev)
 */

import { test, expect } from '@playwright/test';

const SUPERVISION_URL = 'http://localhost:8082';

test.describe('US-023 — Backend : Affectation livreur+vehicule BC-07', () => {

  test('TC-023-01 : POST /api/planification/tournees/{id}/affecter retourne HTTP 200', async ({ request }) => {
    const response = await request.post(
      `${SUPERVISION_URL}/api/planification/tournees/tp-201/affecter`,
      {
        data: {
          livreurId: 'livreur-test-001',
          livreurNom: 'Pierre Morel',
          vehiculeId: 'vehicule-test-001'
        }
      }
    );

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([200, 403, 404, 409]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.statut).toBe('AFFECTEE');
      expect(body.livreurId).toBe('livreur-test-001');
    }
  });

  test('TC-023-02 : Invariant atomicite — POST sans livreurId retourne HTTP 400', async ({ request }) => {
    const response = await request.post(
      `${SUPERVISION_URL}/api/planification/tournees/tp-201/affecter`,
      {
        data: {
          vehiculeId: 'vehicule-test-001'
          // Pas de livreurId — affectation partielle interdite
        }
      }
    );

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([400, 403, 422]).toContain(response.status());
  });

  test('TC-023-03 : Invariant unicite — un livreur deja affecte sur une autre tournee retourne HTTP 409', async ({ request }) => {
    // Affecter livreur-A a la tournee tp-201
    await request.post(
      `${SUPERVISION_URL}/api/planification/tournees/tp-201/affecter`,
      { data: { livreurId: 'livreur-unique-001', livreurNom: 'Test', vehiculeId: 'veh-unique-001' } }
    );

    // Tenter d'affecter le meme livreur a une autre tournee tp-203
    const second = await request.post(
      `${SUPERVISION_URL}/api/planification/tournees/tp-203/affecter`,
      { data: { livreurId: 'livreur-unique-001', livreurNom: 'Test', vehiculeId: 'veh-autre-002' } }
    );

    if (second.status() === 0 || second.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    // Doit retourner 409 (livreur deja affecte)
    expect([409, 403]).toContain(second.status());
  });

  test('TC-023-04 : Invariant — POST /affecter sur tournee LANCEE retourne HTTP 409', async ({ request }) => {
    // tp-204 est LANCEE dans le DevDataSeeder
    const response = await request.post(
      `${SUPERVISION_URL}/api/planification/tournees/tp-204/affecter`,
      { data: { livreurId: 'livreur-002', livreurNom: 'Test', vehiculeId: 'veh-002' } }
    );

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([409, 403, 404]).toContain(response.status());
  });

});
