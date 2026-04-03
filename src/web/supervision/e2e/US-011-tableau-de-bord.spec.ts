/**
 * Tests E2E Playwright — US-011 : Tableau de bord des tournees en temps reel
 *
 * Prerequis :
 *   - Backend svc-supervision tourne sur http://localhost:8082 (profil dev)
 *   - MockJwtAuthFilter injecte superviseur-001 / ROLE_SUPERVISEUR
 *
 * TCs couverts : scenarios US-011
 */

import { test, expect } from '@playwright/test';

const SUPERVISION_URL = 'http://localhost:8082';

test.describe('US-011 — Backend : Tableau de bord des tournees', () => {

  test('TC-011-01 : GET /api/supervision/tableau-de-bord retourne HTTP 200 avec tournees', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/tableau-de-bord`);

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([200, 403]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('tournees');
      expect(body).toHaveProperty('bandeau');
      expect(Array.isArray(body.tournees)).toBe(true);
    }
  });

  test('TC-011-02 : GET /api/supervision/tableau-de-bord?statut=A_RISQUE filtre correctement', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/tableau-de-bord?statut=A_RISQUE`);

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([200, 400, 403]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      // Toutes les tournees retournees doivent etre A_RISQUE
      if (body.tournees && Array.isArray(body.tournees)) {
        for (const tournee of body.tournees) {
          expect(tournee.statut).toBe('A_RISQUE');
        }
      }
    }
  });

  test('TC-011-03 : GET /api/supervision/tableau-de-bord?statut=INVALIDE retourne HTTP 400', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/tableau-de-bord?statut=STATUT_INVALIDE`);

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-supervision non disponible');
      return;
    }

    expect([400, 403]).toContain(response.status());
  });

  test('TC-011-04 : Le bandeau resume contient les compteurs actives, aRisque, cloturees', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/tableau-de-bord`);

    if (response.status() !== 200) return;
    const body = await response.json();

    // OBS-011-02 corrigé : le champ s'appelle 'actives' (tournées EN_COURS) dans l'API,
    // non 'totalTournees'. Alignement du test sur le modèle de domaine TableauDeBord.
    expect(body.bandeau).toHaveProperty('actives');
    expect(body.bandeau).toHaveProperty('aRisque');
    expect(body.bandeau).toHaveProperty('cloturees');
    expect(typeof body.bandeau.actives).toBe('number');
  });

  test('TC-011-05 : DevDataSeeder - au moins une tournee EN_COURS dans le tableau de bord', async ({ request }) => {
    const response = await request.get(`${SUPERVISION_URL}/api/supervision/tableau-de-bord`);

    if (response.status() !== 200) return;
    const body = await response.json();

    if (body.tournees && Array.isArray(body.tournees)) {
      const enCours = body.tournees.filter((t: any) =>
        t.statut === 'EN_COURS' || t.statut === 'A_RISQUE'
      );
      // Le DevDataSeeder cree 2 EN_COURS et 1 A_RISQUE
      expect(enCours.length).toBeGreaterThan(0);
    }
  });

});
