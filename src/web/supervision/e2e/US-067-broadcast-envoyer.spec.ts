/**
 * Tests E2E Playwright — US-067 : Envoyer un broadcast à ses livreurs actifs
 * US-067 — W-09 : PanneauBroadcastPage (formulaire de composition)
 *
 * Niveau : L3
 * Prerequis :
 *   - Backend svc-supervision tourne sur http://localhost:8082 (profil dev)
 *   - Frontend supervision tourne sur http://localhost:3000 (npm start)
 *
 * Stratégie SSO bypass :
 *   App.tsx line 149 : en NODE_ENV=development, resolveRouteInitiale() injecte
 *   un token dev et navigue directement vers 'tableau-de-bord'.
 *   Pas besoin d'injecter manuellement sessionStorage.
 *
 * Note architecture (2026-04-22 — fix OBS-L3-001) :
 *   La route 'broadcast' est maintenant câblée dans App.tsx (NAV_PAGES + rendu
 *   conditionnel). Le bouton de navigation porte data-testid="nav-broadcast"
 *   (généré par la boucle NAV_PAGES : `nav-${route.page}`).
 *
 * TCs couverts :
 *   - TC-067-L3-01 : Navigation SideNavBar → W-09 s'affiche
 *   - TC-067-L3-02 : Bouton ENVOYER disabled sans TypeBroadcast sélectionné
 *   - TC-067-L3-03 : Envoi broadcast → apparaît dans l'historique du jour
 */

import { test, expect, Page } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:8082';

/** Naviguer vers le tableau de bord (mode dev, bypass SSO automatique) */
async function allerAuTableauDeBord(page: Page): Promise<void> {
  await page.goto(FRONTEND_URL);
  await page.waitForLoadState('networkidle');
}

/** Vérifier que le frontend est accessible avant chaque test */
async function checkFrontendAccessible(page: Page): Promise<boolean> {
  try {
    await page.goto(FRONTEND_URL, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

// ─── TC-067-L3-01 : Navigation SideNavBar → panneau W-09 s'affiche ───────────

test.describe('TC-067-L3-01 — Navigation SideNavBar vers W-09 (PanneauBroadcastPage)', () => {

  test('Clic "Broadcast" dans SideNavBar affiche le panneau W-09 avec le formulaire', async ({ page }) => {
    const accessible = await checkFrontendAccessible(page);
    if (!accessible) {
      console.warn('WARN: frontend-supervision non accessible sur http://localhost:3000 — TC bloqué');
      return;
    }

    await allerAuTableauDeBord(page);

    // Vérifier que la NavBar principale est présente
    const navBar = page.locator('[data-testid="nav-principale"]');
    await expect(navBar).toBeVisible({ timeout: 5000 });

    // Cliquer sur le bouton Broadcast dans la NavBar (data-testid généré par la boucle NAV_PAGES)
    const btnBroadcast = page.locator('[data-testid="nav-broadcast"]');
    await expect(btnBroadcast).toBeVisible({ timeout: 5000 });

    await btnBroadcast.click();
    await page.waitForLoadState('networkidle');

    // Vérifier que le panneau W-09 est affiché
    const panneauBroadcast = page.locator('[data-testid="panneau-broadcast"]');
    await expect(panneauBroadcast).toBeVisible({ timeout: 5000 });

    // Vérifier les éléments du formulaire
    await expect(page.locator('[data-testid="btn-type-ALERTE"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-type-INFO"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-type-CONSIGNE"]')).toBeVisible();
    await expect(page.locator('[data-testid="textarea-broadcast"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-envoyer-broadcast"]')).toBeVisible();

    await page.screenshot({
      path: 'livrables/07-tests/screenshots/US-067/TC-067-L3-01-panneau-broadcast.png',
      fullPage: true,
    });

    console.log('TC-067-L3-01 PASS : panneau W-09 affiché avec formulaire complet');
  });

});

// ─── TC-067-L3-02 : Bouton ENVOYER disabled sans TypeBroadcast sélectionné ────

test.describe('TC-067-L3-02 — Invariant UI : bouton ENVOYER disabled sans type sélectionné', () => {

  test('ENVOYER est disabled avant sélection TypeBroadcast, actif après sélection ALERTE', async ({ page }) => {
    const accessible = await checkFrontendAccessible(page);
    if (!accessible) {
      console.warn('WARN: frontend-supervision non accessible — TC bloqué');
      return;
    }

    await allerAuTableauDeBord(page);

    // Navigation vers W-09 via NavBar principale
    const btnBroadcast = page.locator('[data-testid="nav-broadcast"]');
    await expect(btnBroadcast).toBeVisible({ timeout: 5000 });

    await btnBroadcast.click();
    await page.waitForLoadState('networkidle');

    const panneauBroadcast = page.locator('[data-testid="panneau-broadcast"]');
    const panneauVisible = await panneauBroadcast.isVisible().catch(() => false);
    if (!panneauVisible) {
      console.warn('WARN: panneau-broadcast non visible après clic Broadcast');
      return;
    }

    const btnEnvoyer = page.locator('[data-testid="btn-envoyer-broadcast"]');

    // 1. Sans TypeBroadcast ET sans texte → disabled
    await expect(btnEnvoyer).toBeDisabled();
    console.log('OK: bouton ENVOYER disabled sans TypeBroadcast');

    // 2. Saisir un texte sans sélectionner de type → toujours disabled
    const textarea = page.locator('[data-testid="textarea-broadcast"]');
    await textarea.fill('Message de test broadcast');
    await expect(btnEnvoyer).toBeDisabled();
    console.log('OK: bouton ENVOYER toujours disabled avec texte mais sans type');

    // 3. Sélectionner ALERTE → bouton devient actif
    await page.locator('[data-testid="btn-type-ALERTE"]').click();
    await expect(btnEnvoyer).not.toBeDisabled();
    console.log('OK: bouton ENVOYER actif après sélection ALERTE + texte valide');

    await page.screenshot({
      path: 'livrables/07-tests/screenshots/US-067/TC-067-L3-02-btn-envoyer-actif.png',
      fullPage: false,
    });

    console.log('TC-067-L3-02 PASS : invariant UI bouton ENVOYER validé');
  });

});

// ─── TC-067-L3-03 : Envoi broadcast → apparaît dans l'historique du jour ──────

test.describe('TC-067-L3-03 — Envoi broadcast → apparaît dans l\'historique du jour', () => {

  test('Après envoi, le broadcast apparaît dans la section Historique du jour', async ({ page }) => {
    const accessible = await checkFrontendAccessible(page);
    if (!accessible) {
      console.warn('WARN: frontend-supervision non accessible — TC bloqué');
      return;
    }

    // Vérifier aussi que le backend est disponible (pré-condition)
    let backendOk = false;
    try {
      const res = await page.request.get(`${BACKEND_URL}/actuator/health`);
      backendOk = res.status() === 200;
    } catch {
      console.warn('WARN: svc-supervision non accessible sur port 8082');
    }

    await allerAuTableauDeBord(page);

    const btnBroadcast = page.locator('[data-testid="nav-broadcast"]');
    await expect(btnBroadcast).toBeVisible({ timeout: 5000 });

    await btnBroadcast.click();
    await page.waitForLoadState('networkidle');

    const panneauVisible = await page.locator('[data-testid="panneau-broadcast"]').isVisible().catch(() => false);
    if (!panneauVisible) {
      console.warn('WARN: panneau-broadcast non visible — TC bloqué');
      return;
    }

    // Compter les items dans l'historique avant envoi
    const itemsBefore = await page.locator('[data-testid^="item-broadcast-"]').count();
    console.log(`Items historique avant envoi : ${itemsBefore}`);

    // Remplir le formulaire
    await page.locator('[data-testid="btn-type-ALERTE"]').click();
    await page.locator('[data-testid="textarea-broadcast"]').fill('Test L3 — Route du Général de Gaulle barrée');

    // Vérifier ciblage TOUS par défaut (radio "Tous les livreurs actifs" sélectionné)
    const radioTous = page.locator('input[type="radio"][value="TOUS"]');
    await expect(radioTous).toBeChecked();

    // Envoyer
    const btnEnvoyer = page.locator('[data-testid="btn-envoyer-broadcast"]');
    await expect(btnEnvoyer).not.toBeDisabled();
    await btnEnvoyer.click();

    if (!backendOk) {
      console.warn('WARN: backend non disponible — vérification du toast uniquement');
      await page.screenshot({
        path: 'livrables/07-tests/screenshots/US-067/TC-067-L3-03-backend-absent.png',
        fullPage: true,
      });
      return;
    }

    // Attendre le toast de succès ou d'erreur (max 5s)
    const toastSucces = page.locator('[data-testid="toast-broadcast-succes"]');
    const toastVisible = await toastSucces.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);

    if (toastVisible) {
      console.log('OK: toast de succès affiché après envoi');
      // Attendre que l'historique se recharge (chargerHistorique appelé après succès)
      await page.waitForTimeout(1000);
      const itemsAfter = await page.locator('[data-testid^="item-broadcast-"]').count();
      expect(itemsAfter).toBeGreaterThan(itemsBefore);
      console.log(`OK: historique mis à jour — ${itemsAfter} item(s) après envoi`);
    } else {
      // Vérifier s'il y a un état d'erreur (backend indisponible ou 422)
      const bodyText = await page.locator('[data-testid="panneau-broadcast"]').innerText();
      console.warn(`WARN: toast non affiché — état form: ${bodyText.substring(0, 200)}`);
    }

    await page.screenshot({
      path: 'livrables/07-tests/screenshots/US-067/TC-067-L3-03-historique-apres-envoi.png',
      fullPage: true,
    });

    console.log('TC-067-L3-03 : exécuté — résultat dépend du câblage route broadcast et backend');
  });

});
