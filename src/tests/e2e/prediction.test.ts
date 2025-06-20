import { test, expect, Page, Route } from '@playwright/test';
import { ModelOutput, RiskProfile } from '../../core/types/prediction';

test.describe('Prediction Flow', () => {
  const mockRiskProfile: RiskProfile = {
    type: 'moderate',
    maxStake: 1000,
    multiplier: 1,
    minConfidence: 0.7,
    maxRiskScore: 0.8,
    preferredSports: ['NBA'],
    preferredMarkets: ['moneyline'],
  };

  const mockPredictions: ModelOutput[] = [
    {
      type: 'model1',
      prediction: 0.8,
      confidence: 0.9,
      features: { feature1: 1, feature2: 2 },
    },
    {
      type: 'model2',
      prediction: 0.75,
      confidence: 0.85,
      features: { feature1: 1, feature2: 2 },
    },
  ];

  test.beforeEach(async ({ page }: { page: Page }) => {
    // Mock API responses
    await page.route('**/api/predictions', async (route: Route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockPredictions),
      });
    });

    await page.route('**/api/risk-profile', async (route: Route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockRiskProfile),
      });
    });

    // Navigate to predictions page
    await page.goto('/predictions');
  });

  test('displays prediction recommendations', async ({ page }: { page: Page }) => {
    // Wait for recommendations to load
    await page.waitForSelector('[data-testid="bet-recommendation-card"]');

    // Verify recommendation cards are displayed
    const cards = await page.$$('[data-testid="bet-recommendation-card"]');
    expect(cards.length).toBeGreaterThan(0);

    // Verify recommendation details
    const firstCard = cards[0];
    await expect(firstCard).toContainText('model1');
    await expect(firstCard).toContainText('90%');
    await expect(firstCard).toContainText('LOW');
  });

  test('filters recommendations by risk level', async ({ page }: { page: Page }) => {
    // Wait for recommendations to load
    await page.waitForSelector('[data-testid="bet-recommendation-card"]');

    // Select low risk filter
    await page.selectOption('[data-testid="risk-filter"]', 'low');

    // Verify filtered recommendations
    const cards = await page.$$('[data-testid="bet-recommendation-card"]');
    for (const card of cards) {
      const riskLevel = await card.$eval(
        '[data-testid="risk-level"]',
        (el: Element) => el.textContent
      );
      expect(riskLevel).toBe('LOW');
    }
  });

  test('sorts recommendations by confidence', async ({ page }: { page: Page }) => {
    // Wait for recommendations to load
    await page.waitForSelector('[data-testid="bet-recommendation-card"]');

    // Select confidence sort
    await page.selectOption('[data-testid="sort-select"]', 'confidence');

    // Verify sorted recommendations
    const confidences = await page.$$eval(
      '[data-testid="confidence-value"]',
      (elements: Element[]) => elements.map(el => parseFloat(el.textContent || '0'))
    );

    // Check if confidences are in descending order
    for (let i = 0; i < confidences.length - 1; i++) {
      expect(confidences[i]).toBeGreaterThanOrEqual(confidences[i + 1]);
    }
  });

  test('displays prediction explanation modal', async ({ page }: { page: Page }) => {
    // Wait for recommendations to load
    await page.waitForSelector('[data-testid="bet-recommendation-card"]');

    // Click view details button on first recommendation
    await page.click('[data-testid="view-details-button"]');

    // Verify modal is displayed
    await page.waitForSelector('[data-testid="prediction-explanation-modal"]');
    await expect(page.locator('[data-testid="prediction-explanation-modal"]')).toBeVisible();

    // Verify modal content
    await expect(page.locator('[data-testid="modal-title"]')).toContainText(
      'Prediction Explanation'
    );
    await expect(page.locator('[data-testid="prediction-value"]')).toContainText('85.0%');
    await expect(page.locator('[data-testid="confidence-value"]')).toContainText('90.0%');
  });

  test('switches between model explanations in modal', async ({ page }: { page: Page }) => {
    // Open modal
    await page.waitForSelector('[data-testid="bet-recommendation-card"]');
    await page.click('[data-testid="view-details-button"]');
    await page.waitForSelector('[data-testid="prediction-explanation-modal"]');

    // Switch to second model tab
    await page.click('text=model2');

    // Verify second model's explanation is displayed
    await expect(page.locator('[data-testid="model-name"]')).toContainText('model2');
    await expect(page.locator('[data-testid="model-confidence"]')).toContainText('80.0%');
  });

  test('handles API errors gracefully', async ({ page }: { page: Page }) => {
    // Mock API error
    await page.route('**/api/predictions', async (route: Route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    // Reload page
    await page.reload();

    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Failed to load recommendations'
    );
  });

  test('updates recommendations when risk profile changes', async ({ page }: { page: Page }) => {
    // Wait for initial recommendations
    await page.waitForSelector('[data-testid="bet-recommendation-card"]');

    // Mock new risk profile
    const newRiskProfile = {
      ...mockRiskProfile,
      maxStake: 500,
      multiplier: 0.8,
    };

    await page.route('**/api/risk-profile', async (route: Route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(newRiskProfile),
      });
    });

    // Trigger risk profile update
    await page.click('[data-testid="update-risk-profile"]');

    // Verify recommendations are updated
    await page.waitForSelector('[data-testid="bet-recommendation-card"]');
    const cards = await page.$$('[data-testid="bet-recommendation-card"]');
    expect(cards.length).toBeGreaterThan(0);

    // Verify stake amounts are within new limits
    const stakes = await page.$$eval('[data-testid="stake-amount"]', (elements: Element[]) =>
      elements.map(el => parseFloat(el.textContent?.replace(/[^0-9.-]+/g, '') || '0'))
    );

    for (const stake of stakes) {
      expect(stake).toBeLessThanOrEqual(newRiskProfile.maxStake);
    }
  });
});
