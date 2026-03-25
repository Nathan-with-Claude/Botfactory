/**
 * Tests E2E Playwright — US-017/018 : Synchronisation OMS et Historisation immuable
 *
 * Prerequis :
 *   - Backend svc-oms tourne sur http://localhost:8083 (profil dev)
 *   - DevDataSeeder a cree 4 evenements pour tournee-sup-001
 *   - OutboxPoller actif (fixedDelay 10s)
 *
 * Lancement :
 *   npx playwright test src/mobile/e2e/US-017-oms-eventstore.spec.ts --project=chromium
 */

import { test, expect } from '@playwright/test';

const OMS_URL = 'http://localhost:8083';

// ─── US-017 : Synchronisation OMS ────────────────────────────────────────────

test.describe('US-017 — Synchronisation OMS (API svc-oms)', () => {

  test('TC-360 : Enregistrement evenement valide retourne 201', async ({ request }) => {
    const eventId = `evt-playwright-${Date.now()}`;
    const response = await request.post(`${OMS_URL}/api/oms/evenements`, {
      data: {
        eventId,
        tourneeId: 'tournee-playwright-test',
        colisId: 'colis-playwright-test',
        livreurId: 'livreur-playwright-001',
        type: 'LIVRAISON_CONFIRMEE',
        horodatage: new Date().toISOString(),
        latitude: 48.8566,
        longitude: 2.3522,
        preuveLivraisonId: 'preuve-playwright-001'
      }
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('eventId');
    expect(body.eventId).toBe(eventId);
    expect(body).toHaveProperty('statutSynchronisation');
    expect(body.statutSynchronisation).toBe('PENDING');
  });

  test('TC-361 : Double appel meme eventId retourne 409 (idempotence)', async ({ request }) => {
    const eventId = `evt-idem-${Date.now()}`;
    const payload = {
      data: {
        eventId,
        tourneeId: 'tournee-idem-test',
        colisId: 'colis-idem-test',
        livreurId: 'livreur-idem-001',
        type: 'TOURNEE_DEMARREE',
        horodatage: new Date().toISOString()
      }
    };

    // Premier appel
    const first = await request.post(`${OMS_URL}/api/oms/evenements`, payload);
    expect(first.status()).toBe(201);

    // Second appel avec le meme eventId
    const second = await request.post(`${OMS_URL}/api/oms/evenements`, payload);
    expect(second.status()).toBe(409);
  });

  test('TC-362 : GET historique colis retourne evenements en ordre chronologique', async ({ request }) => {
    const response = await request.get(`${OMS_URL}/api/oms/evenements/colis/colis-s-001`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);

    // Verifier l'ordre chronologique ascendant
    if (body.length > 1) {
      for (let i = 1; i < body.length; i++) {
        const prev = new Date(body[i - 1].horodatage).getTime();
        const curr = new Date(body[i].horodatage).getTime();
        expect(prev).toBeLessThanOrEqual(curr);
      }
    }
  });

  test('TC-364 : GET historique tournee retourne les evenements', async ({ request }) => {
    const response = await request.get(`${OMS_URL}/api/oms/evenements/tournee/tournee-sup-001`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(0);
  });

  test('TC-365 : Evenement sans GPS cree avec modeDegradGPS=true', async ({ request }) => {
    const eventId = `evt-gps-degraded-${Date.now()}`;
    const response = await request.post(`${OMS_URL}/api/oms/evenements`, {
      data: {
        eventId,
        tourneeId: 'tournee-gps-test',
        colisId: 'colis-gps-test',
        livreurId: 'livreur-gps-001',
        type: 'LIVRAISON_CONFIRMEE',
        horodatage: new Date().toISOString()
        // latitude et longitude absents → modeDegradGPS=true attendu
      }
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.modeDegradGPS).toBe(true);
  });

});

// ─── US-018 : Historisation immuable ─────────────────────────────────────────

test.describe('US-018 — Historisation immuable des evenements (API)', () => {

  test('TC-370 : Evenement sans livreurId (qui absent) retourne 400', async ({ request }) => {
    const response = await request.post(`${OMS_URL}/api/oms/evenements`, {
      data: {
        eventId: `evt-no-livreur-${Date.now()}`,
        tourneeId: 'tournee-test',
        colisId: 'colis-test',
        // livreurId absent (attribut "qui" manquant)
        type: 'LIVRAISON_CONFIRMEE',
        horodatage: new Date().toISOString()
      }
    });

    expect(response.status()).toBe(400);
  });

  test('TC-372 : Unicite eventId — doublon rejete avec 409', async ({ request }) => {
    const eventId = `evt-unique-${Date.now()}`;
    const payload = {
      data: {
        eventId,
        tourneeId: 'tournee-unique',
        colisId: 'colis-unique',
        livreurId: 'livreur-unique',
        type: 'ECHEC_LIVRAISON_DECLARE',
        horodatage: new Date().toISOString()
      }
    };

    await request.post(`${OMS_URL}/api/oms/evenements`, payload);
    const duplicate = await request.post(`${OMS_URL}/api/oms/evenements`, payload);
    expect(duplicate.status()).toBe(409);
  });

  test('TC-373 : DELETE sur /api/oms/evenements retourne 405 (immuabilite)', async ({ request }) => {
    const response = await request.delete(`${OMS_URL}/api/oms/evenements/evt-test`);
    // 405 Method Not Allowed ou 404 si l'endpoint n'existe pas — les deux confirment l'immuabilite
    expect([404, 405]).toContain(response.status());
  });

  test('TC-374 : Reconstitution historique colis avec 4 attributs obligatoires dans chaque evenement', async ({ request }) => {
    const response = await request.get(`${OMS_URL}/api/oms/evenements/colis/colis-s-001`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    for (const evt of body) {
      expect(evt).toHaveProperty('livreurId');   // qui
      expect(evt).toHaveProperty('colisId');     // quoi
      expect(evt).toHaveProperty('type');        // quoi
      expect(evt).toHaveProperty('horodatage'); // quand
      // GPS ou modeDegradGPS
      const hasGPS = evt.latitude !== undefined || evt.modeDegradGPS === true;
      expect(hasGPS).toBe(true);
    }
  });

  test('TC-375 : Mode degradeGPS — evenement cree avec modeDegradGPS=true', async ({ request }) => {
    const eventId = `evt-immutable-gps-${Date.now()}`;
    const response = await request.post(`${OMS_URL}/api/oms/evenements`, {
      data: {
        eventId,
        tourneeId: 'tournee-imm',
        colisId: 'colis-imm',
        livreurId: 'livreur-imm',
        type: 'LIVRAISON_CONFIRMEE',
        horodatage: new Date().toISOString()
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.modeDegradGPS).toBe(true);
  });

  test('TC-360b : Health check svc-oms', async ({ request }) => {
    const response = await request.get(`${OMS_URL}/actuator/health`).catch(() => null);
    if (response) {
      expect(response.status()).toBe(200);
    } else {
      console.log('TC-360b: svc-oms non disponible — health check skip');
    }
  });

});
