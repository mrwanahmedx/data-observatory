import { test, expect } from '@playwright/test';

const routes = [
  '/',
  '/finance.html',
  '/score.html',
  '/risk.html',
  '/people.html',
  '/credit-lab.html',
  '/credit-methodology.html'
];

for (const route of routes) {
  test(`${route} loads without browser runtime failures`, async ({ page, baseURL }) => {
    const pageErrors = [];
    const consoleErrors = [];
    const failedLocalRequests = [];

    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('requestfailed', request => {
      const url = new URL(request.url());
      if (url.origin === new URL(baseURL).origin) {
        failedLocalRequests.push(`${request.method()} ${url.pathname}: ${request.failure()?.errorText || 'failed'}`);
      }
    });

    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(failedLocalRequests).toEqual([]);
    await expect(page.locator('body')).not.toBeEmpty();
  });
}

test('iScore dashboard initializes and opens the SQL studio', async ({ page }) => {
  await page.goto('/score.html', { waitUntil: 'networkidle' });

  await expect(page.locator('#load-status')).not.toContainText('could not load');
  await expect(page.locator('#load-status')).not.toContainText('initialization failed');
  await expect(page.locator('#overview-kpis .kpi')).toHaveCount(4);
  await expect(page.locator('#overview-kpis')).toContainText('Borrowers');
  await expect(page.locator('#performance-kpis')).toContainText('ROC AUC');

  const codeButton = page.locator('[data-panel="code"]');
  await codeButton.click();
  await expect(page.locator('#panel-code')).toBeVisible();
  await expect(page.locator('#language')).toBeVisible();

  await page.locator('#language').selectOption('sql');
  await expect(page.locator('#source-select option')).toHaveCount(14);
  await expect(page.locator('#source-code')).not.toBeEmpty();
  await expect(page.locator('#sql-results')).not.toBeEmpty();
});

test('Suez year selection updates the dashboard without overflow errors', async ({ page }) => {
  await page.goto('/finance.html', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-year]').first()).toBeVisible();

  const yearButtons = page.locator('[data-year]');
  expect(await yearButtons.count()).toBeGreaterThan(1);

  await yearButtons.nth(1).click();
  await expect(yearButtons.nth(1)).toHaveClass(/active|selected/);
  await expect(page.locator('svg').first()).toBeVisible();
});


test('iScore code deep link initializes the requested panel', async ({ page }) => {
  await page.goto('/score.html#panel-code', { waitUntil: 'networkidle' });
  await expect(page.locator('#panel-code')).toBeVisible();
  await expect(page.locator('[data-panel="code"]')).toHaveClass(/active/);
  await expect(page.locator('#language')).toHaveValue('sql');
  await expect(page.locator('#source-select option')).toHaveCount(14);
});

test('credit-risk SQL playground updates the displayed predicate', async ({ page }) => {
  await page.goto('/risk.html', { waitUntil: 'networkidle' });
  const slider = page.locator('#score-filter');
  await slider.fill('700');
  await slider.dispatchEvent('input');
  await expect(page.locator('#score-output')).toHaveText('700');
  await expect(page.locator('.query-example')).toContainText('CreditScore >= 700');
  await expect(page.locator('.query-example')).toContainText('ROW_NUMBER() OVER');
  await expect(page.locator('.query-example')).toContainText('HAVING COUNT(*) <> 1');
});

test('mobile iScore view renders without horizontal document overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/score.html', { waitUntil: 'networkidle' });
  await expect(page.locator('#overview-kpis .kpi')).toHaveCount(4);
  const dimensions = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth + 1);
});

test('mobile home and finance pages remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/finance.html']) {
    await page.goto(route, { waitUntil: 'networkidle' });
    await expect(page.locator('body')).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth + 2);
  }
});
