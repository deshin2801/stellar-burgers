import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('Конструктор бургера: сборка и расчёт цены', () => {
  const ingredientsHarPath = join(__dirname, 'hars', 'ingridients.har');
  const usersHarPath = join(__dirname, 'hars', 'users.har');

  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(ingredientsHarPath, {
      url: '**/api/ingredients',
      notFound: 'abort',
    });

    await page.routeFromHAR(usersHarPath, {
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

    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    await page.goto('/');
  });

  test('добавляет булку и котлету, проверяет отображение и итоговую цену', async ({ page }) => {
    const ingredientsList = page.getByTestId('ingredients-content').locator('li');
    await expect(ingredientsList.first()).toBeVisible();

    const bunName = 'Краторная булка N-200i';
    const pattyName = 'Биокотлета из марсианской Магнолии';

    const fillingList = page.getByTestId('constructor-ingredients');
    await expect(fillingList.getByText('Выберите начинку', { exact: true })).toBeVisible();

    const bunCard = ingredientsList.filter({
      has: page.getByText(bunName, { exact: true }),
    });
    await bunCard.getByRole('button', { name: 'Добавить', exact: true }).click();

    const constructor = page.getByTestId('constructor');
    const bunTop = constructor.getByTestId('constructor-bun-1');
    const bunBottom = constructor.getByTestId('constructor-bun-2');

    await expect(bunTop).toContainText(bunName);
    await expect(bunBottom).toContainText(bunName);

    await expect(fillingList.getByText('Выберите начинку', { exact: true })).toBeVisible();
    await expect(fillingList.locator('li')).toHaveCount(1);

    const pattyCard = ingredientsList.filter({
      has: page.getByText(pattyName, { exact: true }),
    });
    await pattyCard.getByRole('button', { name: 'Добавить', exact: true }).click();

    const ingredientsItems = fillingList.locator('li');
    await expect(ingredientsItems).toHaveCount(1);
    await expect(ingredientsItems.first()).toContainText(pattyName);
    await expect(fillingList.getByText('Выберите начинку', { exact: true })).not.toBeVisible();

    const bunPrice = 1255;
    const pattyPrice = 424;
    const expectedTotalPrice = bunPrice * 2 + pattyPrice;

    const totalPrice = page.getByTestId('order-summ').locator('p');
    await expect(totalPrice).toContainText(String(expectedTotalPrice));
  });
});