/**
 * @author Md Noushad Ansari
 * Salary Calculator - All Category × Level × Location Combinations
 */

import SalaryCalculatorPage from '../PageObject/SalaryCalculatorPage.js';
import { test, expect } from '@playwright/test';
import { validdata, categories, levels, locations, defaultAnnualFixed } from '../TestData/testData.js';

// ─── Scenario 1 : Navigate to Salary Calculator ──────────────────────────────

test('Scenario : 1 Login and navigate to Salary Calculator', async ({ page }) => {
    const user = new SalaryCalculatorPage(page, validdata);
    await user.URL();
    await user.login();
    await user.navigateToSalaryCalculator();
    await user.takeScreenshot('Scenario_1_Salary_Calculator_Landing');
});

// ─── Generate test for every Category × Level × Location ─────────────────────

let scenarioCount = 2;

for (const category of categories) {
    for (const level of levels) {
        for (const location of locations) {
            const num = scenarioCount++;
            const catShort = category.replace('Non Sales - Technology or Product', 'NS_Tech')
                                     .replace('Non Sales - Rest', 'NS_Rest')
                                     .replace('Sales & AM', 'Sales_AM')
                                     .replace(/ /g, '_');

            test(`Scenario : ${num} | Category: ${category} | Level: ${level} | Location: ${location}`, async ({ page }) => {
                test.setTimeout(120000);
                const user = new SalaryCalculatorPage(page, validdata);
                await user.URL();
                await user.login();
                await user.navigateToSalaryCalculator();

                console.log(`\n🔹 Scenario ${num}: Category = ${category} | Level = ${level} | Location = ${location}`);

                const screenshotName = `Scenario_${num}_${catShort}_${level}_${location}`;
                const { breakup, validation } = await user.fullSalaryCalculatorFlow(
                    category, level, location, defaultAnnualFixed, screenshotName, '2000'
                );

                expect(Object.keys(breakup).length).toBeGreaterThan(0);
                expect(validation.basicMatch).toBeTruthy();
                expect(validation.hraMatch).toBeTruthy();
                expect(validation.gmcGpaMatch).toBeTruthy();
                expect(validation.gtliMatch).toBeTruthy();
                expect(validation.gratuityMatch).toBeTruthy();
                expect(validation.statutoryBonusMatch).toBeTruthy();
                expect(validation.mobileAllowanceMatch).toBeTruthy();
                expect(validation.perfIncentiveMatch).toBeTruthy();

                console.log(`✅ Scenario ${num} PASSED: ${category} + ${level} + ${location}\n`);
            });
        }
    }
}
