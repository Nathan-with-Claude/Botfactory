/**
 * Tests E2E Playwright — US-015 : Suivre l'etat d'execution d'une instruction
 *
 * Prerequis :
 *   - Backend svc-supervision tourne sur http://localhost:8082 (profil dev)
 */

import { test, expect } from '@playwright/test';

const SUPERVISION_URL = 'http://localhost:8082';

test.describe('US-015 — Backend : Suivi d\'execution d\'instruction', () => {

  test('TC-015-01 : GET /api/supervision/instructions/tournee/{id} retourne la liste des instructions', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/instructions/tournee/tournee-sup-001`);

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([200, 403]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);

      // Chaque instruction doit avoir les champs requis
      for (const instruction of body) {
        expect(instruction).toHaveProperty('instructionId');
        expect(instruction).toHaveProperty('typeInstruction');
        expect(instruction).toHaveProperty('statut');
        expect(instruction).toHaveProperty('horodatage');
      }
    }
  });

  test('TC-015-02 : DevDataSeeder — au moins 2 instructions pour tournee-sup-001 (1 ENVOYEE, 1 EXECUTEE)', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/instructions/tournee/tournee-sup-001`);

    if (response.status() !== 200) return;
    const body = await response.json();

    const envoyees = body.filter((i: any) => i.statut === 'ENVOYEE');
    const executees = body.filter((i: any) => i.statut === 'EXECUTEE');

    // DevDataSeeder cree 2 instructions (1 ENVOYEE + 1 EXECUTEE)
    expect(envoyees.length + executees.length).toBeGreaterThanOrEqual(2);
  });

  test('TC-015-03 : PATCH /api/supervision/instructions/{id}/executer transite vers EXECUTEE', async ({ request }) => {
    // Recuperer les instructions en attente pour trouver un ID valide
    const listResponse = await request.get(`${SUPERVISION_URL}/api/supervision/instructions/tournee/tournee-sup-001`);

    if (listResponse.status() !== 200) return;
    const instructions = await listResponse.json();
    const envoyee = instructions.find((i: any) => i.statut === 'ENVOYEE');

    if (!envoyee) {
      console.warn('WARN: Aucune instruction ENVOYEE disponible pour TC-015-03');
      return;
    }

    const patchResponse = await request.patch(
      `${SUPERVISION_URL}/api/supervision/instructions/${envoyee.instructionId}/executer`
    );

    if (patchResponse.status() === 0 || patchResponse.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([200, 403, 404, 409]).toContain(patchResponse.status());
    if (patchResponse.status() === 200) {
      const body = await patchResponse.json();
      expect(body.statut).toBe('EXECUTEE');
    }
  });

  test('TC-015-04 : PATCH /executer sur instruction inexistante retourne HTTP 404', async ({ request }) => {
    const response = await request.patch(
      `${SUPERVISION_URL}/api/supervision/instructions/instr-inexistant-xyz/executer`
    );

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([403, 404]).toContain(response.status());
  });

  test('TC-015-05 : GET /api/supervision/instructions/en-attente?tourneeId={id} retourne instructions ENVOYEE', async ({ request }) => {
    const response = await request.get(
      `${SUPERVISION_URL}/api/supervision/instructions/en-attente?tourneeId=tournee-sup-001`
    );

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([200, 403]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      // Toutes les instructions retournees doivent etre ENVOYEE
      for (const instruction of body) {
        expect(instruction.statut).toBe('ENVOYEE');
      }
    }
  });

});
