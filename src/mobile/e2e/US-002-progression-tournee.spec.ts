/**
 * Tests E2E Playwright — US-002 : Suivre ma progression en temps réel
 *
 * Prerequis :
 *   - Backend svc-tournee tourne sur http://localhost:8081 (profil dev)
 *   - Frontend Expo Web tourne sur http://localhost:8082
 *   - MockJwtAuthFilter injecte livreur-001 / ROLE_LIVREUR
 *   - DevDataSeeder a cree 1 tournee avec 5 colis : 3 A_LIVRER, 1 LIVRE, 1 ECHEC
 *     → bandeau attendu : "Reste a livrer : 3 / 5"
 *
 * Couverture :
 *   SC1 — Bandeau affiche "Reste a livrer : 3 / 5" (données DevDataSeeder)
 *   SC2 — Bouton "Cloturer la tournée" absent quand resteALivrer > 0
 *   SC3 — Estimation de fin affichée (ou "--" si null en MVP)
 *   SC4 — Via page.route(), mock resteALivrer=0 → bouton "Cloturer" visible
 *
 * Lancement :
 *   npx playwright test src/mobile/e2e/US-002-progression-tournee.spec.ts --project=chromium
 *
 * Note : si les serveurs ne sont pas demarres, les tests echouent avec
 *   "net::ERR_CONNECTION_REFUSED". Dans ce cas, consulter le rapport statique
 *   /livrables/07-tests/scenarios/US-002-rapport-playwright.md
 */

import { test, expect, Page } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:8082';
const BACKEND_URL  = 'http://localhost:8081';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Ouvre l'écran M-02 (liste des colis / bandeau de progression).
 * Attend que l'app soit hydratée (networkidle) avant de poursuivre.
 */
async function ouvrirEcranProgression(page: Page) {
  await page.goto(FRONTEND_URL);
  await page.waitForLoadState('networkidle');
}

/**
 * Construit une réponse JSON mockée pour GET /api/tournees/today.
 * resteALivrer : nombre de colis au statut A_LIVRER
 * estTerminee  : true si resteALivrer === 0
 */
function mockTourneePayload(resteALivrer: number, colisTotal: number, estimationFin: string | null) {
  const colis = Array.from({ length: colisTotal }, (_, i) => ({
    colisId:          `colis-mock-00${i + 1}`,
    statut:           i < resteALivrer ? 'A_LIVRER' : 'LIVRE',
    adresseLivraison: {
      rue: `${i + 1} Rue de la Paix`,
      complementAdresse: null,
      codePostal: '69001',
      ville: 'Lyon',
      zoneGeographique: 'Zone A',
      adresseComplete: `${i + 1} Rue de la Paix, 69001 Lyon`,
    },
    destinataire:     { nom: `Destinataire ${i + 1}`, telephoneChiffre: '0600000000' },
    contraintes:      [],
    aUneContrainteHoraire: false,
  }));
  return {
    tourneeId:    'tournee-livreur-001',
    livreurId:    'livreur-001',
    date:         new Date().toISOString().split('T')[0],
    statut:       'DEMARREE',
    colisTotal,
    colisTraites: colisTotal - resteALivrer,
    resteALivrer,
    estimationFin,
    estTerminee:  resteALivrer === 0,
    colis,
  };
}

// ─── SC1 : Bandeau "Reste a livrer : 3 / 5" avec données DevDataSeeder ───────

test.describe('US-002 — Bandeau de progression (données réelles DevDataSeeder)', () => {

  test('SC1 : Le bandeau affiche "Reste a livrer : 3 / 5" au chargement', async ({ page }) => {
    await ouvrirEcranProgression(page);

    // Attendre la fin du chargement (spinner disparu)
    await expect(page.getByTestId('etat-chargement')).toBeHidden({ timeout: 5000 });

    // Le bandeau de progression doit être visible
    await expect(page.getByTestId('bandeau-progression')).toBeVisible();

    // Le compteur "reste a livrer" doit afficher 3 / 5
    // (DevDataSeeder : 3 A_LIVRER, 1 LIVRE, 1 ECHEC → colisTotal=5, resteALivrer=3)
    const bandeauText = await page.getByTestId('reste-a-livrer').textContent();
    expect(bandeauText).toMatch(/Reste a livrer : 3 \/ 5/);
  });

  test('SC1b : Le bandeau "Reste a livrer" respecte le format "X / Y"', async ({ page }) => {
    await ouvrirEcranProgression(page);
    await expect(page.getByTestId('etat-chargement')).toBeHidden({ timeout: 5000 });

    // Le texte doit correspondre au patron générique "Reste a livrer : <entier> / <entier>"
    const bandeauText = await page.getByTestId('reste-a-livrer').textContent();
    expect(bandeauText).toMatch(/Reste a livrer : \d+ \/ \d+/);
  });

});

// ─── SC2 : Bouton "Clôturer la tournée" absent quand resteALivrer > 0 ────────

test.describe('US-002 — Bouton Clôturer absent (resteALivrer > 0)', () => {

  test('SC2 : Le bouton "Cloturer la tournee" n\'est pas visible si colis restants', async ({ page }) => {
    await ouvrirEcranProgression(page);
    await expect(page.getByTestId('etat-chargement')).toBeHidden({ timeout: 5000 });

    // Avec resteALivrer = 3 (données DevDataSeeder), le bouton NE DOIT PAS être visible
    const boutonCloture = page.getByTestId('bouton-cloture');
    await expect(boutonCloture).toBeHidden();
  });

});

// ─── SC3 : Estimation de fin de tournée affichée (ou "--") ───────────────────

test.describe('US-002 — Estimation de fin de tournée', () => {

  test('SC3 : La zone estimation-fin est présente et affiche une valeur ou "--"', async ({ page }) => {
    await ouvrirEcranProgression(page);
    await expect(page.getByTestId('etat-chargement')).toBeHidden({ timeout: 5000 });

    // Le composant estimation-fin doit être dans le DOM (même si null → "--")
    await expect(page.getByTestId('estimation-fin')).toBeVisible();

    const texteEstimation = await page.getByTestId('estimation-fin').textContent();
    expect(texteEstimation).not.toBeNull();

    // Deux cas acceptés dans le MVP :
    //   • "--"                         si estimationFin === null (comportement attendu MVP)
    //   • format "Fin estimée : HH:MM" si le Domain Service retourne une heure
    const isNullMvp   = texteEstimation!.trim() === '--';
    const isHeureFmt  = /Fin estim.e : \d{2}:\d{2}/.test(texteEstimation!);
    expect(isNullMvp || isHeureFmt).toBe(true);
  });

  test('SC3b : estimationFin null → affichage "--" sans erreur (comportement MVP attendu)', async ({ page }) => {
    // Mocker la réponse avec estimationFin = null
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayload(3, 5, null)),
      })
    );

    await ouvrirEcranProgression(page);

    // L'écran ne doit pas planter
    await expect(page.getByTestId('etat-erreur')).toBeHidden({ timeout: 10000 });

    // La zone estimation-fin doit afficher "--"
    const texteEstimation = await page.getByTestId('estimation-fin').textContent();
    expect(texteEstimation!.trim()).toBe('--');
  });

});

// ─── SC4 : Mock resteALivrer=0 → bouton "Clôturer" visible ──────────────────

test.describe('US-002 — Bouton Clôturer visible quand tous les colis sont traités', () => {

  test('SC4 : resteALivrer=0 via mock API → bouton "Cloturer la tournee" apparait', async ({ page }) => {
    // Intercepter GET /api/tournees/today et retourner resteALivrer=0, estTerminee=true
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayload(0, 5, null)),
      })
    );

    await ouvrirEcranProgression(page);

    // Attendre que l'app ne soit plus en cours de chargement
    await expect(page.getByTestId('etat-chargement')).toBeHidden({ timeout: 5000 });

    // Le bandeau doit afficher 0 / 5
    const bandeauText = await page.getByTestId('reste-a-livrer').textContent();
    expect(bandeauText).toMatch(/Reste a livrer : 0 \/ 5/);

    // Le bouton "Cloturer la tournée" DOIT être visible
    await expect(page.getByTestId('bouton-cloture')).toBeVisible();
  });

  test('SC4b : Le bouton "Cloturer" est accessible (accessibilityRole=button)', async ({ page }) => {
    // Même mock que SC4
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayload(0, 5, null)),
      })
    );

    await ouvrirEcranProgression(page);
    await expect(page.getByTestId('etat-chargement')).toBeHidden({ timeout: 5000 });

    const bouton = page.getByTestId('bouton-cloture');
    await expect(bouton).toBeVisible();

    // Le bouton doit avoir un rôle ARIA "button"
    await expect(bouton).toHaveAttribute('role', 'button');
  });

  test('SC4c : resteALivrer=1 via mock → bouton "Cloturer" reste masqué', async ({ page }) => {
    // Vérification de la borne : 1 colis restant → bouton toujours absent
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayload(1, 5, null)),
      })
    );

    await ouvrirEcranProgression(page);
    await expect(page.getByTestId('etat-chargement')).toBeHidden({ timeout: 5000 });

    await expect(page.getByTestId('bouton-cloture')).toBeHidden();
  });

});

// ─── Tests API backend directs ────────────────────────────────────────────────

test.describe('US-002 — Backend : API GET /api/tournees/today (champs Avancement)', () => {

  test('API-US002-01 : La réponse contient resteALivrer = 3 (DevDataSeeder)', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/tournees/today`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('resteALivrer');
    // DevDataSeeder : 3 A_LIVRER, 1 LIVRE, 1 ECHEC → resteALivrer = 3
    expect(body.resteALivrer).toBe(3);
  });

  test('API-US002-02 : La réponse contient colisTotal = 5', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/tournees/today`);
    const body = await response.json();
    expect(body).toHaveProperty('colisTotal');
    expect(body.colisTotal).toBe(5);
  });

  test('API-US002-03 : estimationFin est null dans le MVP (cadence non calculée)', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/tournees/today`);
    const body = await response.json();
    // Comportement MVP attendu : estimationFin === null
    // (AvancementCalculator retourne null faute de cadence historique)
    expect(body.estimationFin).toBeNull();
  });

  test('API-US002-04 : estTerminee est false quand resteALivrer > 0', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/tournees/today`);
    const body = await response.json();
    // resteALivrer = 3 → estTerminee doit être false
    if (body.resteALivrer > 0) {
      expect(body.estTerminee).toBe(false);
    }
  });

  test('API-US002-05 : Statuts des colis: 3 A_LIVRER, 1 LIVRE, 1 ECHEC (invariant DevDataSeeder)', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/tournees/today`);
    const body = await response.json();

    const statutsValides = ['A_LIVRER', 'LIVRE', 'ECHEC', 'A_REPRESENTER'];
    for (const colis of body.colis) {
      expect(statutsValides).toContain(colis.statut);
    }

    const aLivrer      = body.colis.filter((c: any) => c.statut === 'A_LIVRER').length;
    const livre        = body.colis.filter((c: any) => c.statut === 'LIVRE').length;
    const echec        = body.colis.filter((c: any) => c.statut === 'ECHEC').length;
    expect(aLivrer).toBe(3);
    expect(livre).toBe(1);
    expect(echec).toBe(1);
  });

});
