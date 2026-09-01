import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('a página de login carrega', async ({ page }) => {
    await page.goto('/auth');
    await expect(page).toHaveTitle('EMSoft Pedido Web');
  });
});
