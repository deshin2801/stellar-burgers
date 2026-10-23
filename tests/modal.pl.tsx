import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('Модальные окна ингредиентов: отображение и закрытие', () => {
  const harPath = join(__dirname, 'hars', 'ingridients.har');

  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(harPath, {
      url: '**/api/ingredients',
      notFound: 'abort',
    });
    await page.goto('/');
  });

  test('открывает модалку ингредиента и показывает корректные нутриенты (булка)', async ({ page }) => {
    const bunName = 'Краторная булка N-200i';
    const bunCard = page.locator('.ingredient').filter({ hasText: bunName }).first();
    await bunCard.click();


    const modal = page.locator('#modals [data-testid="modal-window"]');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await expect(modal).toContainText(bunName);

    await expect(modal).toContainText('420');
    await expect(modal).toContainText('80');  
    await expect(modal).toContainText('24');  
    await expect(modal).toContainText('53');
  });

  test('показывает разные ингредиенты при клике на разные карточки', async ({ page }) => {
    const bunName = 'Краторная булка N-200i';
    const pattyName = 'Биокотлета из марсианской Магнолии';

    const bunCard = page.locator('.ingredient').filter({ hasText: bunName }).first();
    await bunCard.click();
    const modal = page.locator('#modals [data-testid="modal-window"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(bunName);

    const closeBtn = page.locator('#modals button').filter({ hasText: 'Закрыть' }).first();
    await closeBtn.click();
    await expect(modal).not.toBeVisible();

    const pattyCard = page.locator('.ingredient').filter({ hasText: pattyName }).first();
    await pattyCard.click();
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(pattyName);
    await expect(modal).not.toContainText(bunName);

    await expect(modal).toContainText('4242'); 
    await expect(modal).toContainText('420');  
    await expect(modal).toContainText('142'); 
    await expect(modal).toContainText('242'); 

    // Закрытие по оверлею
    const overlay = page.locator('#modals [data-testid="modal-overlay"]');
    await overlay.click({ position: { x: 5, y: 5 } });
    await expect(modal).not.toBeVisible();
  });
});