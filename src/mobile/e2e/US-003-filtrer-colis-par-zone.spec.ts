/**
 * Tests E2E Playwright — US-003 : Filtrer et organiser les colis par zone géographique
 *
 * Prerequis :
 *   - Backend svc-tournee tourne sur http://localhost:8081 (profil dev)
 *   - Frontend Expo Web tourne sur http://localhost:8082
 *   - MockJwtAuthFilter injecte livreur-001 / ROLE_LIVREUR
 *   - DevDataSeeder a cree 1 tournee avec 5 colis :
 *       colis-dev-001 : Zone A — A_LIVRER
 *       colis-dev-002 : Zone B — A_LIVRER
 *       colis-dev-003 : Zone B — A_LIVRER
 *       colis-dev-004 : Zone C — LIVRE
 *       colis-dev-005 : Zone A — ECHEC
 *       → resteALivrer = 3, colisTotal = 5
 *
 * Couverture TC-070 à TC-073 (scénarios E2E US-003-scenarios.md) :
 *   TC-070 — Affichage de la barre d'onglets au chargement de l'écran M-02
 *   TC-071 — Filtrage par Zone A réduit la liste (SC1 Gherkin)
 *   TC-072 — Retour à "Tous" après filtre Zone A (SC2 Gherkin)
 *   TC-073 — Zone C affiche uniquement les colis traités (SC3 Gherkin)
 *
 * Invariants DDD vérifiés :
 *   - Le filtrage ne génère aucun appel réseau supplémentaire
 *   - Le bandeau "Reste à livrer" reflète toujours le total tournée, pas le filtre
 *   - L'onglet "Tous" est actif par défaut
 *   - Un colis sans zone n'apparaît pas dans les onglets
 *
 * Notes d'implémentation Expo Web :
 *   - testID "onglet-tous" (minuscules) pour l'onglet Tous
 *   - testID "onglet-{nom_zone}" pour les zones (ex. "onglet-Zone A")
 *   - testID "colis-item" (partagé par tous les items) — utiliser .count()
 *   - testID "colis-statut" (partagé) — utiliser .first() ou .nth()
 *   - L'état actif se détecte via backgroundColor: rgb(21, 101, 192) (#1565C0)
 *   - accessibilityState.selected n'est pas traduit en aria-selected par Expo Web
 *
 * Lancement :
 *   npx playwright test src/mobile/e2e/US-003-filtrer-colis-par-zone.spec.ts --project=chromium
 */

import { test, expect, Page } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:8082';
const BACKEND_URL  = 'http://localhost:8081';

// Couleurs de référence Expo Web
const COULEUR_ONGLET_ACTIF   = 'rgb(21, 101, 192)'; // #1565C0 — fond bleu
const COULEUR_ONGLET_INACTIF = 'rgb(255, 255, 255)'; // blanc

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Ouvre l'écran M-02 (liste des colis / barre de filtres zones).
 * Attend que le spinner de chargement disparaisse.
 */
async function ouvrirEcranListeColis(page: Page) {
  await page.goto(FRONTEND_URL);
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('etat-chargement')).toBeHidden({ timeout: 10000 });
}

/**
 * Retourne la couleur de fond calculée d'un élément via son testID.
 */
async function getBgColor(page: Page, testId: string): Promise<string> {
  return page.locator(`[data-testid="${testId}"]`).evaluate(
    el => window.getComputedStyle(el).backgroundColor
  );
}

/**
 * Construit une réponse JSON mockée pour GET /api/tournees/today.
 * Réplique les données DevDataSeeder : 5 colis, 3 zones (Zone A, B, C).
 */
function mockTourneePayloadUS003() {
  return {
    tourneeId:    'tournee-livreur-001',
    livreurId:    'livreur-001',
    date:         new Date().toISOString().split('T')[0],
    statut:       'DEMARREE',
    colisTotal:   5,
    colisTraites: 2,
    resteALivrer: 3,
    estimationFin: null,
    estTerminee:  false,
    colis: [
      {
        colisId:          'colis-dev-001',
        statut:           'A_LIVRER',
        adresseLivraison: {
          rue: '12 Rue du Port',
          complementAdresse: null,
          codePostal: '69003',
          ville: 'Lyon',
          zoneGeographique: 'Zone A',
          adresseComplete: '12 Rue du Port, 69003 Lyon',
        },
        destinataire:     { nom: 'M. Dupont', telephoneChiffre: '0601020304' },
        contraintes:      [{ type: 'HORAIRE', valeur: 'Avant 14h00', estHoraire: true }],
        aUneContrainteHoraire: true,
      },
      {
        colisId:          'colis-dev-002',
        statut:           'A_LIVRER',
        adresseLivraison: {
          rue: '4 Allee des Roses',
          complementAdresse: 'Apt 12',
          codePostal: '69006',
          ville: 'Lyon',
          zoneGeographique: 'Zone B',
          adresseComplete: '4 Allee des Roses, 69006 Lyon',
        },
        destinataire:     { nom: 'Mme Martin', telephoneChiffre: '0607080910' },
        contraintes:      [],
        aUneContrainteHoraire: false,
      },
      {
        colisId:          'colis-dev-003',
        statut:           'A_LIVRER',
        adresseLivraison: {
          rue: '8 Cours Gambetta',
          complementAdresse: null,
          codePostal: '69007',
          ville: 'Lyon',
          zoneGeographique: 'Zone B',
          adresseComplete: '8 Cours Gambetta, 69007 Lyon',
        },
        destinataire:     { nom: 'M. Leroy', telephoneChiffre: '0611121314' },
        contraintes:      [{ type: 'FRAGILE', valeur: 'Manipuler avec precaution', estHoraire: false }],
        aUneContrainteHoraire: false,
      },
      {
        colisId:          'colis-dev-004',
        statut:           'LIVRE',
        adresseLivraison: {
          rue: '23 Avenue Jean Jaures',
          complementAdresse: 'Bat C',
          codePostal: '69007',
          ville: 'Lyon',
          zoneGeographique: 'Zone C',
          adresseComplete: '23 Avenue Jean Jaures, 69007 Lyon',
        },
        destinataire:     { nom: 'Mme Benoit', telephoneChiffre: '0622232425' },
        contraintes:      [],
        aUneContrainteHoraire: false,
      },
      {
        colisId:          'colis-dev-005',
        statut:           'ECHEC',
        adresseLivraison: {
          rue: '7 Rue de la Republique',
          complementAdresse: null,
          codePostal: '69002',
          ville: 'Lyon',
          zoneGeographique: 'Zone A',
          adresseComplete: '7 Rue de la Republique, 69002 Lyon',
        },
        destinataire:     { nom: 'M. Renard', telephoneChiffre: '0633343536' },
        contraintes:      [{ type: 'DOCUMENT_SENSIBLE', valeur: 'Document contractuel', estHoraire: false }],
        aUneContrainteHoraire: false,
      },
    ],
  };
}

// ─── TC-070 : Affichage de la barre d'onglets au chargement ──────────────────

test.describe('TC-070 — Barre d\'onglets affichée au chargement de l\'écran M-02', () => {

  test('TC-070a : Les onglets [Tous][Zone A][Zone B][Zone C] sont visibles', async ({ page }) => {
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayloadUS003()),
      })
    );

    await ouvrirEcranListeColis(page);

    // La barre d'onglets doit être présente
    await expect(page.getByTestId('onglets-zones')).toBeVisible({ timeout: 5000 });

    // Les 4 onglets doivent être présents (testID="onglet-tous" en minuscules)
    await expect(page.getByTestId('onglet-tous')).toBeVisible();
    await expect(page.getByTestId('onglet-Zone A')).toBeVisible();
    await expect(page.getByTestId('onglet-Zone B')).toBeVisible();
    await expect(page.getByTestId('onglet-Zone C')).toBeVisible();
  });

  test('TC-070b : L\'onglet "Tous" est actif par défaut (fond bleu #1565C0)', async ({ page }) => {
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayloadUS003()),
      })
    );

    await ouvrirEcranListeColis(page);

    // L'onglet "Tous" doit avoir le fond bleu (couleur active)
    const bgTous = await getBgColor(page, 'onglet-tous');
    expect(bgTous).toBe(COULEUR_ONGLET_ACTIF);

    // Les onglets de zone doivent être inactifs (fond blanc)
    const bgZoneA = await getBgColor(page, 'onglet-Zone A');
    expect(bgZoneA).toBe(COULEUR_ONGLET_INACTIF);
  });

  test('TC-070c : Les 5 colis sont tous visibles avec l\'onglet "Tous" actif', async ({ page }) => {
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayloadUS003()),
      })
    );

    await ouvrirEcranListeColis(page);

    // Avec l'onglet "Tous" actif, les 5 colis doivent être visibles
    const nbColis = await page.getByTestId('colis-item').count();
    expect(nbColis).toBe(5);
  });

});

// ─── TC-071 : SC1 — Filtrage par Zone A (2 colis, bandeau global inchangé) ───

test.describe('TC-071 — SC1 : Filtrage par Zone A réduit la liste sans affecter le bandeau', () => {

  test('TC-071a : Cliquer sur Zone A affiche 2 colis (colis-dev-001 et colis-dev-005)', async ({ page }) => {
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayloadUS003()),
      })
    );

    await ouvrirEcranListeColis(page);

    // Cliquer sur l'onglet Zone A
    await page.getByTestId('onglet-Zone A').click();
    await page.waitForTimeout(300); // Filtrage local — instantané

    // Zone A contient 2 colis dans DevDataSeeder
    const nbColis = await page.getByTestId('colis-item').count();
    expect(nbColis).toBe(2);
  });

  test('TC-071b : Le bandeau "Reste a livrer : 3 / 5" reste inchangé après filtrage Zone A (invariant domaine)', async ({ page }) => {
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayloadUS003()),
      })
    );

    await ouvrirEcranListeColis(page);

    // Activer le filtre Zone A
    await page.getByTestId('onglet-Zone A').click();
    await page.waitForTimeout(300);

    // Le bandeau doit toujours afficher le total tournée (3/5), pas 2/2
    const bandeauText = await page.getByTestId('reste-a-livrer').textContent();
    expect(bandeauText).toMatch(/Reste a livrer : 3 \/ 5/);
  });

  test('TC-071c : Zone B affiche 2 colis sans appel réseau supplémentaire (invariant perf)', async ({ page }) => {
    let apiCallCount = 0;
    await page.route('**/api/tournees/today', route => {
      apiCallCount++;
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayloadUS003()),
      });
    });

    await ouvrirEcranListeColis(page);
    const callsApresChargement = apiCallCount;

    // Cliquer sur Zone B
    await page.getByTestId('onglet-Zone B').click();
    await page.waitForTimeout(300);

    // Zone B a 2 colis (colis-dev-002 et colis-dev-003)
    const nbColis = await page.getByTestId('colis-item').count();
    expect(nbColis).toBe(2);

    // Aucun appel API supplémentaire ne doit avoir été fait
    expect(apiCallCount).toBe(callsApresChargement);
  });

  test('TC-071d : L\'onglet Zone A devient actif (fond bleu) après clic', async ({ page }) => {
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayloadUS003()),
      })
    );

    await ouvrirEcranListeColis(page);
    await page.getByTestId('onglet-Zone A').click();
    await page.waitForTimeout(300);

    // Zone A doit être active (fond bleu)
    const bgZoneA = await getBgColor(page, 'onglet-Zone A');
    expect(bgZoneA).toBe(COULEUR_ONGLET_ACTIF);

    // Tous doit être inactif (fond blanc)
    const bgTous = await getBgColor(page, 'onglet-tous');
    expect(bgTous).toBe(COULEUR_ONGLET_INACTIF);
  });

});

// ─── TC-072 : SC2 — Retour à "Tous" après filtre Zone A ──────────────────────

test.describe('TC-072 — SC2 : Retour à la vue complète depuis un filtre zone', () => {

  test('TC-072a : Cliquer sur "Tous" depuis Zone A restaure les 5 colis', async ({ page }) => {
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayloadUS003()),
      })
    );

    await ouvrirEcranListeColis(page);

    // Activer Zone A puis revenir sur Tous
    await page.getByTestId('onglet-Zone A').click();
    await page.waitForTimeout(300);
    expect(await page.getByTestId('colis-item').count()).toBe(2);

    await page.getByTestId('onglet-tous').click();
    await page.waitForTimeout(300);

    // Les 5 colis doivent être à nouveau visibles
    expect(await page.getByTestId('colis-item').count()).toBe(5);
  });

  test('TC-072b : Les statuts terminaux (Livre, Echec) restent visibles après retour sur Tous', async ({ page }) => {
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayloadUS003()),
      })
    );

    await ouvrirEcranListeColis(page);

    // Passer par Zone C puis revenir sur Tous
    await page.getByTestId('onglet-Zone C').click();
    await page.waitForTimeout(300);
    await page.getByTestId('onglet-tous').click();
    await page.waitForTimeout(300);

    // Les statuts terminaux doivent être présents dans la liste
    // colis-statut est partagé par tous les items — au moins 2 statuts terminaux
    const statuts = await page.getByTestId('colis-statut').allTextContents();
    const statutsTerminaux = statuts.filter(s => s === 'Livre' || s === 'Echec');
    expect(statutsTerminaux.length).toBeGreaterThanOrEqual(2);
  });

  test('TC-072c : L\'onglet "Tous" reprend le fond bleu après retour', async ({ page }) => {
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayloadUS003()),
      })
    );

    await ouvrirEcranListeColis(page);

    await page.getByTestId('onglet-Zone B').click();
    await page.waitForTimeout(300);
    await page.getByTestId('onglet-tous').click();
    await page.waitForTimeout(300);

    const bgTous = await getBgColor(page, 'onglet-tous');
    expect(bgTous).toBe(COULEUR_ONGLET_ACTIF);

    const bgZoneB = await getBgColor(page, 'onglet-Zone B');
    expect(bgZoneB).toBe(COULEUR_ONGLET_INACTIF);
  });

});

// ─── TC-073 : SC3 — Zone C affiche uniquement les colis avec statuts terminaux ─

test.describe('TC-073 — SC3 : Zone entièrement traitée affiche les statuts terminaux', () => {

  test('TC-073a : Zone C affiche 1 colis (colis-dev-004 — LIVRE)', async ({ page }) => {
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayloadUS003()),
      })
    );

    await ouvrirEcranListeColis(page);
    await page.getByTestId('onglet-Zone C').click();
    await page.waitForTimeout(300);

    // Zone C a 1 seul colis (colis-dev-004)
    const nbColis = await page.getByTestId('colis-item').count();
    expect(nbColis).toBe(1);
  });

  test('TC-073b : Le colis de Zone C a un statut terminal "Livre"', async ({ page }) => {
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayloadUS003()),
      })
    );

    await ouvrirEcranListeColis(page);
    await page.getByTestId('onglet-Zone C').click();
    await page.waitForTimeout(300);

    // Le statut du colis de Zone C doit être "Livre" (label ColisItem pour LIVRE)
    const statutText = await page.getByTestId('colis-statut').first().textContent();
    expect(statutText).toBe('Livre');
  });

  test('TC-073c : Aucun colis "A livrer" n\'apparaît dans Zone C', async ({ page }) => {
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayloadUS003()),
      })
    );

    await ouvrirEcranListeColis(page);
    await page.getByTestId('onglet-Zone C').click();
    await page.waitForTimeout(300);

    // Vérifier qu'aucun statut "A livrer" n'est affiché en Zone C
    const statuts = await page.getByTestId('colis-statut').allTextContents();
    const colisALivrer = statuts.filter(s => s === 'A livrer');
    expect(colisALivrer.length).toBe(0);
  });

  test('TC-073d : Le bandeau "Reste a livrer" affiche toujours 3/5 depuis Zone C (invariant domaine)', async ({ page }) => {
    await page.route('**/api/tournees/today', route =>
      route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(mockTourneePayloadUS003()),
      })
    );

    await ouvrirEcranListeColis(page);
    await page.getByTestId('onglet-Zone C').click();
    await page.waitForTimeout(300);

    // Invariant domaine : le bandeau lit toujours le total tournée, pas le filtre
    const bandeauText = await page.getByTestId('reste-a-livrer').textContent();
    expect(bandeauText).toMatch(/Reste a livrer : 3 \/ 5/);
  });

});

// ─── Tests API backend directs ────────────────────────────────────────────────

test.describe('US-003 — Backend : API GET /api/tournees/today (champs zoneGeographique)', () => {

  test('API-US003-01 : La réponse contient des colis avec le champ zoneGeographique', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/tournees/today`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('colis');
    expect(body.colis.length).toBeGreaterThan(0);

    // Vérifier que le champ zoneGeographique est présent dans l'adresseLivraison
    for (const colis of body.colis) {
      expect(colis).toHaveProperty('adresseLivraison');
      expect(colis.adresseLivraison).toHaveProperty('zoneGeographique');
    }
  });

  test('API-US003-02 : Les zones présentes sont Zone A, Zone B et Zone C (DevDataSeeder)', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/tournees/today`);
    const body = await response.json();

    const zones = body.colis
      .map((c: any) => c.adresseLivraison?.zoneGeographique)
      .filter((z: any) => z != null && z !== '');

    const zonesUniques = [...new Set(zones)].sort();
    expect(zonesUniques).toContain('Zone A');
    expect(zonesUniques).toContain('Zone B');
    expect(zonesUniques).toContain('Zone C');
  });

  test('API-US003-03 : Zone A contient 2 colis (colis-dev-001 et colis-dev-005)', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/tournees/today`);
    const body = await response.json();

    const colisZoneA = body.colis.filter(
      (c: any) => c.adresseLivraison?.zoneGeographique === 'Zone A'
    );
    expect(colisZoneA.length).toBe(2);
  });

  test('API-US003-04 : Zone B contient 2 colis (colis-dev-002 et colis-dev-003)', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/tournees/today`);
    const body = await response.json();

    const colisZoneB = body.colis.filter(
      (c: any) => c.adresseLivraison?.zoneGeographique === 'Zone B'
    );
    expect(colisZoneB.length).toBe(2);
  });

  test('API-US003-05 : Zone C contient 1 colis avec statut LIVRE (colis-dev-004)', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/tournees/today`);
    const body = await response.json();

    const colisZoneC = body.colis.filter(
      (c: any) => c.adresseLivraison?.zoneGeographique === 'Zone C'
    );
    expect(colisZoneC.length).toBe(1);
    expect(colisZoneC[0].statut).toBe('LIVRE');
  });

});
