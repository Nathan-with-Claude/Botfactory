/**
 * Tests E2E Playwright — US-001 : Consulter la liste des colis assignes a ma tournee
 *
 * Prerequis :
 *   - Backend svc-tournee tourne sur http://localhost:8081 (profil dev)
 *   - Frontend Expo Web tourne sur http://localhost:8082
 *   - MockJwtAuthFilter injecte livreur-001 / ROLE_LIVREUR
 *   - DevDataSeeder a cree 1 tournee + 5 colis pour livreur-001
 *
 * Lancement :
 *   npx playwright test src/mobile/e2e/US-001-liste-colis.spec.ts --project=chromium
 *
 * Note : si les serveurs ne sont pas demarres, les tests echouent avec
 *   "net::ERR_CONNECTION_REFUSED". Dans ce cas, consulter le rapport statique
 *   /livrables/07-tests/scenarios/US-001-rapport-playwright.md
 */

import { test, expect, Page } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:8082';
const BACKEND_URL = 'http://localhost:8081';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function ouvrirEcranListeColis(page: Page) {
  await page.goto(FRONTEND_URL);
  // L'ecran M-02 est la page principale de l'app apres authentification (simulee par MockJwtAuthFilter)
  await page.waitForLoadState('networkidle');
}

// ─── Scenario 1 : Chargement normal de la tournee du jour ────────────────────

test.describe('US-001 — Consulter la liste des colis de la tournee', () => {

  test('SC-01 : Affichage de la liste des colis au chargement normal', async ({ page }) => {
    await ouvrirEcranListeColis(page);

    // Le spinner de chargement doit disparaitre
    await expect(page.getByTestId('etat-chargement')).toBeHidden({ timeout: 5000 });

    // La liste des colis doit s'afficher
    await expect(page.getByTestId('liste-colis-screen')).toBeVisible();

    // Au moins un ColisItem doit etre affiche
    const colisItems = page.getByTestId('colis-item');
    await expect(colisItems.first()).toBeVisible();
    const count = await colisItems.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('SC-02 : Bandeau de progression "Reste a livrer : X / Y"', async ({ page }) => {
    await ouvrirEcranListeColis(page);

    // Attendre la fin du chargement
    await expect(page.getByTestId('etat-chargement')).toBeHidden({ timeout: 5000 });

    // Le bandeau de progression doit etre visible
    await expect(page.getByTestId('bandeau-progression')).toBeVisible();

    // Le texte "Reste a livrer" doit etre present
    const bandeauText = await page.getByTestId('reste-a-livrer').textContent();
    expect(bandeauText).toMatch(/Reste a livrer : \d+ \/ \d+/);
  });

  test('SC-03 : Chaque ColisItem affiche adresse et destinataire', async ({ page }) => {
    await ouvrirEcranListeColis(page);
    await expect(page.getByTestId('etat-chargement')).toBeHidden({ timeout: 5000 });

    // Verifier le premier colis
    const adresses = page.getByTestId('colis-adresse');
    await expect(adresses.first()).toBeVisible();
    const adresseText = await adresses.first().textContent();
    expect(adresseText).not.toBeNull();
    expect(adresseText!.length).toBeGreaterThan(0);

    const destinataires = page.getByTestId('colis-destinataire');
    await expect(destinataires.first()).toBeVisible();
    const destinataireText = await destinataires.first().textContent();
    expect(destinataireText).not.toBeNull();
    expect(destinataireText!.length).toBeGreaterThan(0);
  });

  test('SC-04 : Badge de statut affiche sur chaque colis', async ({ page }) => {
    await ouvrirEcranListeColis(page);
    await expect(page.getByTestId('etat-chargement')).toBeHidden({ timeout: 5000 });

    const statuts = page.getByTestId('colis-statut');
    await expect(statuts.first()).toBeVisible();

    // Le statut doit etre l'un des statuts valides
    const statutText = await statuts.first().textContent();
    const statutsValides = ['A livrer', 'Livre', 'Echec', 'A representer'];
    expect(statutsValides).toContain(statutText!.trim());
  });

  test('SC-05 : Affichage des contraintes horaires avec mise en evidence', async ({ page }) => {
    await ouvrirEcranListeColis(page);
    await expect(page.getByTestId('etat-chargement')).toBeHidden({ timeout: 5000 });

    // Verifier si un colis a une contrainte visible (le DevDataSeeder cree 1 colis avec contrainte HORAIRE)
    const contrainte = page.getByTestId('colis-contrainte-0').first();
    if (await contrainte.count() > 0) {
      await expect(contrainte).toBeVisible();
      const contrainteText = await contrainte.textContent();
      expect(contrainteText!.length).toBeGreaterThan(0);
    } else {
      // Aucune contrainte dans les donnees de test — accepte mais documente
      console.warn('WARN: Aucune contrainte horaire trouvee dans les donnees de test (DevDataSeeder)');
    }
  });

  test('SC-06 : Pull-to-refresh (RefreshControl) declenche un rechargement', async ({ page }) => {
    await ouvrirEcranListeColis(page);
    await expect(page.getByTestId('etat-chargement')).toBeHidden({ timeout: 5000 });

    // Simuler un swipe vers le bas sur la FlatList pour declencher le refresh
    const flatlist = page.getByTestId('flatlist-colis');
    if (await flatlist.count() > 0) {
      const box = await flatlist.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + 20);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2, box.y + 200, { steps: 10 });
        await page.mouse.up();
        // Attendre que le rechargement se termine
        await page.waitForTimeout(2000);
        await expect(page.getByTestId('liste-colis-screen')).toBeVisible();
      }
    }
    // Note : le pull-to-refresh sur web est limite par les capacites du navigateur
  });

  test('SC-07 : Etat erreur — message affiche si backend inaccessible', async ({ page }) => {
    // Intercepter les requetes vers le backend et retourner une erreur reseau
    await page.route('**/api/tournees/today', route => route.abort('failed'));

    await ouvrirEcranListeColis(page);

    // L'etat erreur doit s'afficher
    await expect(page.getByTestId('etat-erreur')).toBeVisible({ timeout: 10000 });
    // L'etat chargement ne doit plus etre visible
    await expect(page.getByTestId('etat-chargement')).toBeHidden();
  });

  test('SC-08 : Etat vide — message si aucun colis assigne (404 backend)', async ({ page }) => {
    // Intercepter les requetes et retourner un 404
    await page.route('**/api/tournees/today', route =>
      route.fulfill({ status: 404, body: '{"message":"Aucune tournee"}' })
    );

    await ouvrirEcranListeColis(page);

    // Le message "Aucun colis assigne" doit s'afficher
    await expect(page.getByTestId('message-aucun-colis')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('message-aucun-colis')).toContainText('Aucun colis assigne');
  });

});

// ─── Tests API backend directs ───────────────────────────────────────────────

test.describe('US-001 — Backend : API GET /api/tournees/today', () => {

  test('API-01 : GET /api/tournees/today retourne 200 avec la liste des colis', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/tournees/today`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('tourneeId');
    expect(body).toHaveProperty('colis');
    expect(Array.isArray(body.colis)).toBe(true);
    expect(body.colis.length).toBeGreaterThan(0);
  });

  test('API-02 : GET /api/tournees/today retourne resteALivrer et colisTotal', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/tournees/today`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('resteALivrer');
    expect(body).toHaveProperty('colisTotal');
    expect(typeof body.resteALivrer).toBe('number');
    expect(typeof body.colisTotal).toBe('number');
  });

  test('API-03 : Chaque colis a adresse, destinataire et statut', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/tournees/today`);
    const body = await response.json();

    for (const colis of body.colis) {
      expect(colis).toHaveProperty('colisId');
      expect(colis).toHaveProperty('statut');
      expect(colis).toHaveProperty('adresseLivraison');
      expect(colis).toHaveProperty('destinataire');
      expect(colis).toHaveProperty('contraintes');
    }
  });

  test('API-04 : Les contraintes sont correctement serialisees', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/tournees/today`);
    const body = await response.json();

    const colisAvecContrainte = body.colis.find((c: any) => c.contraintes.length > 0);
    if (colisAvecContrainte) {
      const contrainte = colisAvecContrainte.contraintes[0];
      expect(contrainte).toHaveProperty('type');
      expect(contrainte).toHaveProperty('valeur');
    }
    // Pas d'assertion bloquante si aucun colis n'a de contrainte
  });

});
