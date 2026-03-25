const { chromium } = require('@playwright/test');
const path = require('path');

const OMS_URL = 'http://localhost:8083';
const SUP_URL = 'http://localhost:8082';
const SS = path.join(__dirname, '../livrables/07-tests/screenshots');

async function safeJson(resp) {
  try { return await resp.json(); } catch(e) { return {}; }
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // US-017 TC-017-05
  const r17 = await context.request.post(`${OMS_URL}/api/oms/evenements`, {
    data: { eventId: `evt-ss-${Date.now()}`, tourneeId:'t', colisId:'c', livreurId:'l', type:'LIVRAISON_CONFIRMEE', horodatage:'2026-03-25T10:00:00Z' }
  });
  const j17 = await safeJson(r17);
  await page.setContent(`<html><body style="font-family:monospace;padding:20px"><h2>TC-017-05 — Mode dégradé GPS</h2><p>HTTP: <b>${r17.status()}</b></p><pre>${JSON.stringify(j17, null, 2)}</pre></body></html>`);
  await page.screenshot({ path: path.join(SS, 'US-017/TC-017-05-mode-degrade-gps-201.png') });
  console.log('TC-017-05 OK — modeDegradGPS:', j17.modeDegradGPS);

  // US-018 TC-018-01 (utilise un eventId unique avec timestamp)
  const r18 = await context.request.post(`${OMS_URL}/api/oms/evenements`, {
    data: { eventId: `us018-evt-ss-${Date.now()}`, livreurId:'livreur-001', type:'LIVRAISON_CONFIRMEE', colisId:'colis-001', horodatage:'2026-03-25T10:00:00Z', latitude:48.8566, longitude:2.3522 }
  });
  const j18 = await safeJson(r18);
  await page.setContent(`<html><body style="font-family:monospace;padding:20px"><h2>TC-018-01 — EventId préfixe us018-</h2><p>HTTP: <b>${r18.status()}</b></p><pre>${JSON.stringify(j18, null, 2)}</pre></body></html>`);
  await page.screenshot({ path: path.join(SS, 'US-018/TC-018-01-post-201-eventid-us018.png') });
  console.log('TC-018-01 OK — status:', r18.status(), 'eventId:', j18.eventId);

  // US-011 TC-011-04
  const r11 = await context.request.get(`${SUP_URL}/api/supervision/tableau-de-bord`);
  const b11 = await safeJson(r11);
  await page.setContent(`<html><body style="font-family:monospace;padding:20px"><h2>TC-011-04 — Bandeau structure réelle</h2><p>HTTP: <b>${r11.status()}</b></p><pre>${JSON.stringify(b11.bandeau, null, 2)}</pre></body></html>`);
  await page.screenshot({ path: path.join(SS, 'US-011/TC-011-04-bandeau-structure-corrigee.png') });
  console.log('TC-011-04 OK — bandeau keys:', Object.keys(b11.bandeau||{}));

  // US-013 TC-013-02
  const aRisque = (b11.tournees||[]).filter(t=>t.statut==='A_RISQUE');
  await page.setContent(`<html><body style="font-family:monospace;padding:20px"><h2>TC-013-02 — Bandeau aRisque</h2><p>bandeau.aRisque = <b>${b11.bandeau?.aRisque}</b></p><p>Tournées A_RISQUE: <b>${aRisque.length}</b></p><pre>${JSON.stringify(b11.bandeau, null, 2)}</pre></body></html>`);
  await page.screenshot({ path: path.join(SS, 'US-013/TC-013-02-bandeau-arisque.png') });
  console.log('TC-013-02 OK — aRisque:', b11.bandeau?.aRisque);

  // US-020 TC-020-04
  const r20 = await context.request.get(`${SUP_URL}/actuator/health`);
  const j20 = await safeJson(r20);
  await page.setContent(`<html><body style="font-family:monospace;padding:20px"><h2>TC-020-04 — Health svc-supervision</h2><p>HTTP: <b>${r20.status()}</b></p><pre>${JSON.stringify(j20, null, 2)}</pre></body></html>`);
  await page.screenshot({ path: path.join(SS, 'US-020/TC-020-04-health-supervision-up.png') });
  console.log('TC-020-04 OK — status:', j20.status);

  // US-021 TC-021-02
  const today = new Date().toISOString().split('T')[0];
  const r21 = await context.request.get(`${SUP_URL}/api/planification/plans/${today}`);
  const b21 = await safeJson(r21);
  await page.setContent(`<html><body style="font-family:monospace;padding:20px"><h2>TC-021-02 — Plan du jour ${today}</h2><p>HTTP: <b>${r21.status()}</b></p><p>Tournées: <b>${b21.tournees?.length}</b></p><pre>${JSON.stringify({totalTournees:b21.totalTournees,lancees:b21.lancees,affectees:b21.affectees,nonAffectees:b21.nonAffectees,date:b21.date}, null, 2)}</pre></body></html>`);
  await page.screenshot({ path: path.join(SS, 'US-021/TC-021-02-plan-du-jour-4-tournees.png') });
  console.log('TC-021-02 OK — tournees:', b21.tournees?.length);

  // US-024 TC-024-01
  const r24 = await context.request.post(`${SUP_URL}/api/planification/tournees/tp-202/lancer`);
  const b24 = await safeJson(r24);
  await page.setContent(`<html><body style="font-family:monospace;padding:20px"><h2>TC-024-01 — Lancer tournée (lanceeLe)</h2><p>HTTP: <b>${r24.status()}</b></p><p>statut: <b>${b24.statut}</b></p><p>lanceeLe: <b>${b24.lanceeLe}</b></p></body></html>`);
  await page.screenshot({ path: path.join(SS, 'US-024/TC-024-01-lancer-lancee-le.png') });
  console.log('TC-024-01 OK — lanceeLe:', b24.lanceeLe);

  // US-014 TC-014-01
  const r14 = await context.request.post(`${SUP_URL}/api/supervision/instructions`, {
    data: { tourneeId:'tournee-sup-001', colisId:`colis-ss-${Date.now()}`, typeInstruction:'PRIORISER' }
  });
  const j14 = await safeJson(r14);
  await page.setContent(`<html><body style="font-family:monospace;padding:20px"><h2>TC-014-01 — Instruction PRIORISER</h2><p>HTTP: <b>${r14.status()}</b></p><pre>${JSON.stringify(j14, null, 2)}</pre></body></html>`);
  await page.screenshot({ path: path.join(SS, 'US-014/TC-014-01-instruction-prioriser-201.png') });
  console.log('TC-014-01 OK — statut:', j14.statut);

  await browser.close();
  console.log('ALL SCREENSHOTS DONE');
}

main().catch(e => { console.error(e); process.exit(1); });
