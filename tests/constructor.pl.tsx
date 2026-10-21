import { test, expect } from '@playwright/test';
import path from 'path';

test('интеграционный тест: kонструктор бургера (с HAR-моком)', async ({
  page
}) => {
  const harPath = path.join(__dirname, 'hars', 'ingredients.har');

  await page.routeFromHAR(harPath, {
    url: '**/api/ingredients',
    notFound: 'abort'
  });

  await page.goto('/');

  const ingredientCards = page.getByTestId('ingredient-card');
  await expect(ingredientCards.first()).toBeVisible();
  await expect(ingredientCards).toHaveCount(15);

  const bunCard = ingredientCards.filter({ hasText: /булка/i }).first();
  await bunCard.getByRole('button', { name: 'Добавить' }).click();

  const constructorBunTop = page.getByTestId('constructor-bun-top');
  const constructorBunBottom = page.getByTestId('constructor-bun-bottom');
  const constructorItems = page.getByTestId('constructor-item');

  await expect(constructorBunTop).toContainText(/булка/i);
  await expect(constructorBunBottom).toContainText(/булка/i);
  await expect(constructorItems).toHaveCount(0);

  const pattyCard = ingredientCards.filter({ hasText: /котлета/i }).first();
  const pattyName = /котлета/i;
  await pattyCard.getByRole('button', { name: 'Добавить' }).click();

  await expect(constructorItems).toHaveCount(1);
  await expect(constructorItems.filter({ hasText: pattyName })).toHaveCount(1);

  const bunPrice = 1255;
  const pattyPrice = 424;
  const expectedTotalPrice = bunPrice * 2 + pattyPrice;

  const totalPrice = page.getByTestId('total-price').locator('p');
  await expect(totalPrice).toHaveText(String(expectedTotalPrice));
});