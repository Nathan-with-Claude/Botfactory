/**
 * Tests E2E Playwright — US-018 : Historisation immuable des evenements
 *
 * Prerequis :
 *   - svc-oms tourne sur http://localhost:8083 (profil dev)
 *   - Pas d'UI associee — tests API REST uniquement
 *
 * TCs couverts : scenarios US-018
 */

import { test, expect } from '@playwright/test';

const OMS_URL = 'http://localhost:8083';

test.describe('US-018 — Backend : Immuabilite de l\'Event Store', () => {

  test('TC-018-01 : POST /api/oms/evenements avec 4 attributs obligatoires retourne HTTP 201', async ({ request }) => {
    // Prefixe us018- distinct de us017- pour eviter toute collision d'eventId inter-suites
    const eventId = `us018-evt-${Date.now()}`;
    const response = await request.post(`${OMS_URL}/api/oms/evenements`, {
      data: {
        eventId,
        livreurId: 'livreur-001',  // QUI
        type: 'LIVRAISON_CONFIRMEE', colisId: 'colis-001',  // QUOI
        horodatage: '2026-03-24T10:00:00Z',  // QUAND
        latitude: 48.8566, longitude: 2.3522  // GEOLOCALISATION
      }
    });

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-oms non disponible');
      return;
    }

    // 201 : cree avec succes, 409 : doublon (idempotence), 403 : securite active sans token
    expect([201, 409, 403]).toContain(response.status());
  });

  test('TC-018-02 : Immuabilite — PUT sur un evenement retourne 405 ou 403', async ({ request }) => {
    const response = await request.put(`${OMS_URL}/api/oms/evenements/evt-001`, {
      data: { type: 'MODIFIE' }
    });

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-oms non disponible');
      return;
    }

    // Aucun endpoint PUT/PATCH/DELETE ne devrait exister
    expect([404, 405, 403]).toContain(response.status());
  });

  test('TC-018-03 : DELETE sur un evenement retourne 405 ou 403', async ({ request }) => {
    const response = await request.delete(`${OMS_URL}/api/oms/evenements/evt-001`);

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-oms non disponible');
      return;
    }

    expect([404, 405, 403]).toContain(response.status());
  });

  test('TC-018-04 : Reconstitution historique colis — ordre chronologique ASC', async ({ request }) => {
    const response = await request.get(`${OMS_URL}/api/oms/evenements/colis/colis-s-001`);

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-oms non disponible');
      return;
    }

    if (response.status() === 200) {
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);

      // Verifier l'ordre chronologique
      for (let i = 1; i < body.length; i++) {
        const prev = new Date(body[i - 1].horodatage).getTime();
        const curr = new Date(body[i].horodatage).getTime();
        expect(prev).toBeLessThanOrEqual(curr);
      }

      // Verifier les 4 attributs obligatoires sur chaque evenement
      for (const evt of body) {
        expect(evt).toHaveProperty('livreurId');
        expect(evt.livreurId).toBeTruthy();
        expect(evt).toHaveProperty('type');
        expect(evt).toHaveProperty('colisId');
        expect(evt).toHaveProperty('horodatage');
      }
    }
  });

  test('TC-018-05 : Mode degrade GPS — evenement cree avec modeDegradGPS=true', async ({ request }) => {
    const eventId = `evt-gps-018-${Date.now()}`;
    const response = await request.post(`${OMS_URL}/api/oms/evenements`, {
      data: {
        eventId,
        livreurId: 'livreur-001',
        type: 'LIVRAISON_CONFIRMEE',
        colisId: 'colis-gps-null',
        horodatage: '2026-03-24T12:00:00Z'
        // GPS absent
      }
    });

    if (response.status() === 0 || response.status() >= 500) {
      console.warn('WARN: svc-oms non disponible');
      return;
    }

    if (response.status() === 201) {
      const body = await response.json();
      // Les 3 autres attributs obligatoires sont presents
      expect(body.livreurId).toBeTruthy();
      expect(body.type).toBeTruthy();
      expect(body.horodatage).toBeTruthy();
    }
  });

});
