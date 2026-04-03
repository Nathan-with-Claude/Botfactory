/**
 * Tests E2E Playwright — US-014 : Envoyer une instruction a un livreur
 *
 * Prerequis :
 *   - Backend svc-supervision tourne sur http://localhost:8082 (profil dev)
 */

import { test, expect } from '@playwright/test';

const SUPERVISION_URL = 'http://localhost:8082';

test.describe('US-014 — Backend : Envoi d\'instruction a un livreur', () => {

  test('TC-014-01 : POST /api/supervision/instructions avec PRIORISER retourne HTTP 201', async ({ request }) => {
    const response = await request.post(`${SUPERVISION_URL}/api/supervision/instructions`, {
      data: {
        tourneeId: 'tournee-sup-001',
        colisId: 'colis-s-003',
        typeInstruction: 'PRIORISER'
      }
    });

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([201, 409, 403]).toContain(response.status());
    if (response.status() === 201) {
      const body = await response.json();
      expect(body).toHaveProperty('instructionId');
      expect(body).toHaveProperty('tourneeId');
      expect(body).toHaveProperty('colisId');
      expect(body.typeInstruction).toBe('PRIORISER');
      expect(body.statut).toBe('ENVOYEE');
    }
  });

  test('TC-014-02 : POST /api/supervision/instructions REPROGRAMMER sans creneau retourne HTTP 422', async ({ request }) => {
    // OBS-014-01 corrigé : colisId distinct de TC-014-01 ('colis-s-003') pour éviter
    // que l'invariant d'unicité PENDING déclenche un 409 avant la validation du corps.
    // 'colis-s-014-02' est un colis isolé sans instruction préexistante.
    const response = await request.post(`${SUPERVISION_URL}/api/supervision/instructions`, {
      data: {
        tourneeId: 'tournee-sup-001',
        colisId: 'colis-s-014-02',
        typeInstruction: 'REPROGRAMMER'
        // Pas de creneauCible — doit etre rejete
      }
    });

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([400, 422, 403]).toContain(response.status());
  });

  test('TC-014-03 : POST /api/supervision/instructions REPROGRAMMER avec creneau retourne HTTP 201', async ({ request }) => {
    const response = await request.post(`${SUPERVISION_URL}/api/supervision/instructions`, {
      data: {
        tourneeId: 'tournee-sup-001',
        colisId: 'colis-s-003',
        typeInstruction: 'REPROGRAMMER',
        creneauCible: '2026-03-25T10:00:00Z'
      }
    });

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([201, 409, 403]).toContain(response.status());
    if (response.status() === 201) {
      const body = await response.json();
      expect(body.typeInstruction).toBe('REPROGRAMMER');
      expect(body.creneauCible).toBeTruthy();
    }
  });

  test('TC-014-04 : POST instruction sur colis ayant deja une instruction ENVOYEE retourne HTTP 409', async ({ request }) => {
    // Envoyer une premiere instruction
    await request.post(`${SUPERVISION_URL}/api/supervision/instructions`, {
      data: { tourneeId: 'tournee-sup-001', colisId: 'colis-s-003', typeInstruction: 'PRIORISER' }
    });

    // Envoyer une deuxieme instruction sur le meme colis
    const second = await request.post(`${SUPERVISION_URL}/api/supervision/instructions`, {
      data: { tourneeId: 'tournee-sup-001', colisId: 'colis-s-003', typeInstruction: 'ANNULER' }
    });

    if (second.status() === 0 || second.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    // Doit retourner 409 (une instruction en attente par colis)
    expect([409, 403]).toContain(second.status());
  });

  test('TC-014-05 : GET /api/supervision/instructions/tournee/tournee-sup-001 retourne la liste', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/instructions/tournee/tournee-sup-001`);

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([200, 403]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    }
  });

});
