import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('Конструктор бургера: сборка и расчёт цены', () => {
  const harPath = join(__dirname, 'hars', 'ingridients.har');

  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(harPath, {
      url: '**/api/ingredients',
      notFound: 'abort',
    });
    await page.goto('/');
  });

  test('добавляет булку и котлету, проверяет отображение и итоговую цену', async ({ page }) => {
    const ingredientCards = page.locator('.ingredient'); // или другой общий класс карточек
    await expect(ingredientCards.first()).toBeVisible();
  
    const bunCard = ingredientCards.filter({ hasText: /булка/i }).first();
    const bunTextRaw = await bunCard.locator('p').last().textContent();
    if (!bunTextRaw) throw new Error('Не удалось получить имя булки из карточки');
    const bunName = bunTextRaw;

    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    const constructor = page.locator('.constructor');
    const bunTop = constructor.locator('[data-testid="constructor-bun-1"]');
    const bunBottom = constructor.locator('[data-testid="constructor-bun-2"]');

    await expect(bunTop).toContainText(bunName);
    await expect(bunBottom).toContainText(bunName);

    const ingredientsList = constructor.locator('[data-testid="constructor-ingredients"] li');
    await expect(ingredientsList).toHaveCount(0);

    const pattyCard = ingredientCards.filter({ hasText: /котлета/i }).first();
    const pattyTextRaw = await pattyCard.locator('p').last().textContent();
    if (!pattyTextRaw) throw new Error('Не удалось получить имя котлеты из карточки');
    const pattyName = pattyTextRaw;

    await pattyCard.getByRole('button', { name: 'Добавить' }).click();

    await expect(ingredientsList).toHaveCount(1);
    await expect(ingredientsList.first()).toContainText(pattyName);

    const bunPrice = 1255;
    const pattyPrice = 424;
    const expectedTotalPrice = bunPrice * 2 + pattyPrice;

    const totalPriceLocator = page.locator('[data-testid="order-summ"] p');
    await expect(totalPriceLocator).toContainText(String(expectedTotalPrice));
  });
});