import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('Поток заказа: авторизация и оформление', () => {
  const ingredientsHarPath = join(__dirname, 'hars', 'ingridients.har');
  const orderHarPath = join(__dirname, 'hars', 'order.har');
  const userHarPath = join(__dirname, 'hars', 'users.har');

  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(ingredientsHarPath, {
      url: '**/api/ingredients',
      notFound: 'abort',
    });

    await page.routeFromHAR(orderHarPath, {
      url: '**/api/orders',
      notFound: 'abort',
    });

    await page.routeFromHAR(userHarPath, {
      url: '**/api/auth/user',
      notFound: 'abort',
    });

    await page.context().addCookies([
      {
        name: 'accessToken',
        value: 'test-access-token',
        url: 'http://localhost:4000',
      },
    ]);

    await page.evaluate(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
    });
  });

  test('создаёт заказ и проверяет успешное модальное окно с номером и сброс конструктора', async ({ page }) => {
    await page.goto('/');

    const ingredientCards = page.locator('.ingredient');
    await expect(ingredientCards.first()).toBeVisible();

    const bunName = 'Краторная булка N-200i';
    const pattyName = 'Биокотлета из марсианской Магнолии';

    const bunCard = ingredientCards.filter({ hasText: bunName }).first();
    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    const pattyCard = ingredientCards.filter({ hasText: pattyName }).first();
    await pattyCard.getByRole('button', { name: 'Добавить' }).click();

    const constructor = page.locator('.constructor');
    const bunTop = constructor.locator('[data-testid="constructor-bun-1"]');
    const bunBottom = constructor.locator('[data-testid="constructor-bun-2"]');
    const ingredientsList = constructor.locator('[data-testid="constructor-ingredients"] li');

    await expect(bunTop).toContainText(bunName);
    await expect(bunBottom).toContainText(bunName);
    await expect(ingredientsList).toHaveCount(1);
    await expect(ingredientsList.first()).toContainText(pattyName);

    const orderButton = page.getByRole('button', { name: 'Оформить заказ' });
    await expect(orderButton).toBeEnabled();
    await orderButton.click();

    const modal = page.locator('#modals [data-testid="modal-window"]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    const orderNumber = page.locator('#modals [data-testid="order-number"]');
    await expect(orderNumber).toHaveText('99999');

    await expect(ingredientsList).toHaveCount(0);
    await expect(bunTop.locator('p')).not.toHaveText(''); 
    await expect(bunBottom.locator('p')).not.toHaveText('');

    const closeBtn = page.locator('#modals button').filter({ hasText: 'Закрыть' }).first();
    await closeBtn.click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });
});