import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('Модальные окна ингредиентов: открытие по ссылке и закрытие', () => {
  const ingredientsHarPath = join(__dirname, 'hars', 'ingridients.har');
  const usersHarPath = join(__dirname, 'hars', 'users.har');

  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(ingredientsHarPath, {
      url: '**/api/ingredients',
      notFound: 'abort',
    });

    await page.routeFromHAR(usersHarPath, {
      url:  '**/api/auth/user',
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

  test('открывает модалку по ссылке в карточке и проверяет нутриенты (булка)', async ({ page }) => {
    const bunName = 'Краторная булка N-200i';

    const ingredientsList = page.getByTestId('ingredients-content').locator('li');
    const bunCard = ingredientsList.filter({
      has: page.getByText(bunName, { exact: true }),
    });

    await bunCard.getByRole('link').click();

    const modal = page.locator('#modals > div').filter({
      has: page.getByRole('button', { name: 'Закрыть', exact: true }),
    });
    await expect(modal).toBeVisible({ timeout: 10000 });

    await expect(modal.getByRole('heading', { name: bunName, exact: true })).toBeVisible();
    await expect(modal).toContainText('420');
    await expect(modal).toContainText('80');
    await expect(modal).toContainText('24');
    await expect(modal).toContainText('53');

    await modal.getByRole('button', { name: 'Закрыть', exact: true }).click();
    await expect(modal).not.toBeVisible();
  });

  test('показывает разные ингредиенты при открытии по ссылкам и корректно закрывается', async ({ page }) => {
    const bunName = 'Краторная булка N-200i';
    const pattyName = 'Биокотлета из марсианской Магнолии';

    const ingredientsList = page.getByTestId('ingredients-content').locator('li');

    const bunCard = ingredientsList.filter({
      has: page.getByText(bunName, { exact: true }),
    });
    await bunCard.getByRole('link').click();

    const modal = page.locator('#modals > div').filter({
      has: page.getByRole('button', { name: 'Закрыть', exact: true }),
    });
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: bunName, exact: true })).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть', exact: true }).click();
    await expect(modal).not.toBeVisible();

    const pattyCard = ingredientsList.filter({
      has: page.getByText(pattyName, { exact: true }),
    });
    await pattyCard.getByRole('link').click();
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: pattyName, exact: true })).toBeVisible();
    await expect(modal).not.toContainText(bunName);

    await expect(modal).toContainText('4242');
    await expect(modal).toContainText('420');
    await expect(modal).toContainText('142');
    await expect(modal).toContainText('242');

    const overlay = page.locator('#modals [data-testid="modal-overlay"]');
    await overlay.click({ position: { x: 5, y: 5 } });
    await expect(modal).not.toBeVisible();
  });
});