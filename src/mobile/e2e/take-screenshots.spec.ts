import { test, expect } from '@playwright/test';

test.describe('Screenshots critiques', () => {

  test('TC-019-05 : App mobile chargee', async ({ page }) => {
    await page.goto('http://localhost:8090');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-019/TC-019-05-app-mobile-chargee.png', fullPage: true });
  });

  test('TC-006-01 : Mode offline - bandeau', async ({ page }) => {
    await page.goto('http://localhost:8090');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-006/TC-006-01-app-mobile-online.png', fullPage: true });
  });

  test('TC-016-01 : App mobile polling', async ({ page }) => {
    await page.goto('http://localhost:8090');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-016/TC-016-01-app-mobile-vue-liste.png', fullPage: true });
  });

  test('TC-008-01 : health svc-tournee', async ({ request }) => {
    const r = await request.get('http://localhost:8081/actuator/health');
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.status).toBe('UP');
  });

  test('TC-011-01 : health svc-supervision', async ({ request }) => {
    const r = await request.get('http://localhost:8082/actuator/health');
    expect(r.status()).toBe(200);
  });

  test('TC-017-01 : health svc-oms', async ({ request }) => {
    const r = await request.get('http://localhost:8083/actuator/health');
    expect(r.status()).toBe(200);
  });

  test('TC-020-04 : supervision dashboard screenshot', async ({ page }) => {
    // Prendre screenshot de la response JSON du dashboard
    await page.goto('http://localhost:8082/api/supervision/tableau-de-bord');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-020/TC-020-01-supervision-dashboard.png', fullPage: true });
  });

  test('TC-021-01 : planification plan du jour', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    await page.goto(`http://localhost:8082/api/planification/plans/${today}`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-021/TC-021-01-plan-du-jour.png', fullPage: true });
  });

  test('TC-022-01 : composition tournee tp-201', async ({ page }) => {
    await page.goto('http://localhost:8082/api/planification/tournees/tp-201');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-022/TC-022-01-composition-tp201.png', fullPage: true });
  });

  test('TC-011-01 : tableau de bord screenshot', async ({ page }) => {
    await page.goto('http://localhost:8082/api/supervision/tableau-de-bord');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-011/TC-011-01-tableau-de-bord.png', fullPage: true });
  });

  test('TC-013-01 : alerte risque screenshot', async ({ page }) => {
    await page.goto('http://localhost:8082/api/supervision/tableau-de-bord');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-013/TC-013-01-alerte-a-risque.png', fullPage: true });
  });

  test('TC-024-01 : lancer tournee tp-202', async ({ page }) => {
    await page.goto('http://localhost:8082/api/planification/tournees/tp-202');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-024/TC-024-01-tournee-tp202.png', fullPage: true });
  });

  test('TC-023-01 : affecter livreur tp-201', async ({ page }) => {
    await page.goto('http://localhost:8082/api/planification/tournees/tp-201');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-023/TC-023-01-tournee-tp201-affectation.png', fullPage: true });
  });

  test('TC-010-01 : preuve litige access check', async ({ page }) => {
    await page.goto('http://localhost:8081/api/preuves/colis/colis-001');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-010/TC-010-01-preuve-litige.png', fullPage: true });
  });

  test('TC-012-01 : detail tournee screenshot', async ({ page }) => {
    await page.goto('http://localhost:8082/api/supervision/tournees/tournee-sup-001');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-012/TC-012-01-detail-tournee.png', fullPage: true });
  });

  test('TC-014-01 : instructions endpoint', async ({ page }) => {
    await page.goto('http://localhost:8082/api/supervision/instructions');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-014/TC-014-01-liste-instructions.png', fullPage: true });
  });

  test('TC-015-01 : instructions en attente', async ({ page }) => {
    await page.goto('http://localhost:8082/instructions/en-attente?tourneeId=tournee-sup-001');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-015/TC-015-01-instructions-en-attente.png', fullPage: true });
  });

  test('TC-017-03 : oms evenements colis', async ({ page }) => {
    await page.goto('http://localhost:8083/api/oms/evenements/colis/colis-001');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-017/TC-017-03-oms-evenements-colis.png', fullPage: true });
  });

  test('TC-018-04 : oms historique immuable', async ({ page }) => {
    await page.goto('http://localhost:8083/api/oms/evenements/colis/colis-001');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'livrables/07-tests/screenshots/US-018/TC-018-04-historique-immuable.png', fullPage: true });
  });

});
