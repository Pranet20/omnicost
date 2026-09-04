// tests/e2e.spec.ts
import { test, expect } from '@playwright/test';

test.describe('OmniCost Critical Workflows', () => {
  test('Dashboard loads and displays critical UI components', async ({ page }) => {
    // Navigate to our local dev server
    await page.goto('http://localhost:5173');

    // Check if the shell loaded
    await expect(page.getByText('Platform Overview')).toBeVisible();
    await expect(page.getByText('Telemetry Stream: ACTIVE')).toBeVisible();
    
    // Check if the AG Grid loaded our MSW data
    await expect(page.getByText('prod-api-gateway-node')).toBeVisible();
    
    // Check if the charts rendered
    await expect(page.getByText('Spend by Provider')).toBeVisible();
    await expect(page.getByText('LLM Token Distribution')).toBeVisible();
  });
});