import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('Поток заказа: сборка, оформление и очистка конструктора', () => {
  const ingredientsHarPath = join(__dirname, 'hars', 'ingridients.har');
  const usersHarPath = join(__dirname, 'hars', 'users.har');
  const orderHarPath = join(__dirname, 'hars', 'order.har');

  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(ingredientsHarPath, {
      url: '**/api/ingredients',
      notFound: 'abort',
    });

    await page.routeFromHAR(usersHarPath, {
      url: 'https://norma.ffapi.ru/api/auth/user',
      notFound: 'abort',
    });

    await page.routeFromHAR(orderHarPath, {
      url: 'https://norma.ffapi.ru/api/orders',
      notFound: 'abort',
    });

    await page.context().addCookies([
      {
        name: 'accessToken',
        value: 'test-access-token',
        url: 'http://localhost:4000',
      },
    ]);

    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    await page.goto('/');
  });

  test('создаёт заказ и очищает конструктор', async ({ page }) => {
    const bunName = 'Краторная булка N-200i';
    const pattyName = 'Биокотлета из марсианской Магнолии';

    const cards = page.getByTestId('ingredients-content').locator('li');

    for (const name of [bunName, pattyName]) {
      const card = cards.filter({ has: page.getByText(name, { exact: true }) });
      await card.getByRole('button', { name: 'Добавить', exact: true }).click();
    }

    const constructor = page.getByTestId('constructor');

    await expect(constructor.getByTestId('constructor-bun-1')).toContainText(bunName);
    await expect(constructor.getByTestId('constructor-ingredients')).toContainText(pattyName);

    const orderButton = constructor.getByRole('button', { name: 'Оформить заказ', exact: true });
    await expect(orderButton).toBeEnabled();
    await orderButton.click();

    const modal = page.locator('#modals > div').filter({
      has: page.getByRole('button', { name: 'Закрыть', exact: true }),
    });
    await expect(modal).toBeVisible({ timeout: 10000 });

    const orderNumber = modal.getByTestId('order-number');
    await expect(orderNumber).toHaveText('99999');

    await expect(constructor.getByTestId('constructor-bun-1')).toHaveCount(0);
    await expect(constructor.getByTestId('constructor-bun-2')).toHaveCount(0);

    await expect(constructor.getByText('Выберите булки', { exact: true })).toHaveCount(2);

    const fillings = constructor.getByTestId('constructor-ingredients');
    await expect(fillings.getByText('Выберите начинку', { exact: true })).toBeVisible();
    await expect(fillings.locator('li')).toHaveCount(1);
    await expect(fillings.getByText(pattyName, { exact: true })).toHaveCount(0);

    await modal.getByRole('button', { name: 'Закрыть', exact: true }).click();

    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });
});