/**
 * @author Md Noushad Ansari
 * Salary Calculator - Statutory Bonus Validation (Separate Spec)
 *
 * Rule: If Monthly Basic <= 21000 → Statutory Bonus = ₹1,750/month, ₹21,000/year
 *       If Monthly Basic > 21000  → Statutory Bonus = ₹0/month, ₹0/year
 *
 * Covers all Category × Level combinations with Hyderabad + Jharkhand
 */

import SalaryCalculatorPage from '../PageObject/SalaryCalculatorPage.js';
import { test, expect } from '@playwright/test';
import { validdata, categories, levels, locations } from '../TestData/testData.js';
import fs from 'fs';
import path from 'path';

// Separate screenshot folder
const SB_SCREENSHOT_DIR = path.resolve('tests/Hiring_Tabulation_SalaryCalculator/screenshots/StatutoryBonus');
if (!fs.existsSync(SB_SCREENSHOT_DIR)) fs.mkdirSync(SB_SCREENSHOT_DIR, { recursive: true });

async function takeSBScreenshot(page, scenarioName) {
    const files = fs.readdirSync(SB_SCREENSHOT_DIR);
    files.filter(f => f.startsWith(scenarioName)).forEach(f => {
        fs.unlinkSync(path.join(SB_SCREENSHOT_DIR, f));
    });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${scenarioName}_${timestamp}.png`;

    const originalViewport = page.viewportSize();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(300);

    await page.evaluate(() => {
        document.body.style.zoom = '0.7';
        document.body.style.webkitFontSmoothing = 'antialiased';
        document.body.style.textRendering = 'optimizeLegibility';
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SB_SCREENSHOT_DIR, filename), fullPage: true, scale: 'css' });

    await page.evaluate(() => {
        document.body.style.zoom = '1';
        document.body.style.webkitFontSmoothing = '';
        document.body.style.textRendering = '';
    });
    await page.setViewportSize(originalViewport);
    await page.waitForTimeout(300);

    console.log(`📸 HD StatBonus Screenshot: screenshots/StatutoryBonus/${filename}`);
}

function parseCurrency(str) {
    if (!str || str === '-') return 0;
    return Number(str.replace(/[₹,\s]/g, ''));
}

const locationList = locations;
const testSets = [
    { annualFixed: '399999', label: '4L_Bonus_1750' },  // Basic ≤ 21000 → bonus = 1750
    { annualFixed: '888999', label: '9L_Bonus_0' },     // Basic > 21000 → bonus = 0
];
let scenarioCount = 1;

for (const testSet of testSets) {
for (const category of categories) {
    for (const level of levels) {
        for (const location of locationList) {
            const num = scenarioCount++;
            const catShort = category.replace('Non Sales - Technology or Product', 'NS_Tech')
                                     .replace('Non Sales - Rest', 'NS_Rest')
                                     .replace('Sales & AM', 'Sales_AM');

            test(`Scenario : ${num} | StatBonus | ${testSet.label} | Category: ${category} | Level: ${level} | Location: ${location}`, async ({ page }) => {
                test.setTimeout(120000);
                const user = new SalaryCalculatorPage(page, validdata);
                await user.URL();
                await user.login();
                await user.navigateToSalaryCalculator();

                await user.selectCategory(category);
                await user.selectLevel(level);
                await user.selectLocation(location);
                await user.enterAnnualFixed(testSet.annualFixed);

                    // Enter Annual Performance Pay
                    const perfInput = page.getByRole('textbox', { name: 'e.g. 500000 or' }).nth(1);
                    await perfInput.fill('2000');
                    await page.waitForTimeout(500);
                    console.log('✅ Entered Annual Performance Pay: ₹2000');

                await user.clickCalculateSalaryBreakup();

                const breakup = await user.captureAndPrintCompensationBreakup();

                // Extract values
                const actualMonthlyBasic = parseCurrency(breakup['Basic']?.monthly);
                const actualMonthlyBonus = parseCurrency(breakup['Statutory Bonus']?.monthly);
                const actualYearlyBonus = parseCurrency(breakup['Statutory Bonus']?.perAnnum);

                // Calculate expected
                const expectedMonthlyBonus = actualMonthlyBasic <= 21000 ? 1750 : 0;
                const expectedYearlyBonus = expectedMonthlyBonus * 12;

                const monthlyMatch = actualMonthlyBonus === expectedMonthlyBonus;
                const yearlyMatch = actualYearlyBonus === expectedYearlyBonus;
                const bonusMatch = monthlyMatch && yearlyMatch;

                console.log(`\n🔍 STATUTORY BONUS VALIDATION:`);
                console.log(`   Monthly Basic: ₹${actualMonthlyBasic.toLocaleString('en-IN')} ${actualMonthlyBasic <= 21000 ? '(<= 21,000 → ₹1,750)' : '(> 21,000 → ₹0)'}`);
                console.log(`   Bonus Monthly: Expected ₹${expectedMonthlyBonus.toLocaleString('en-IN')} | Actual ₹${actualMonthlyBonus.toLocaleString('en-IN')} → ${monthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
                console.log(`   Bonus Yearly : Expected ₹${expectedYearlyBonus.toLocaleString('en-IN')} | Actual ₹${actualYearlyBonus.toLocaleString('en-IN')} → ${yearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

                // Highlight Statutory Bonus row
                const color = bonusMatch ? '#E91E63' : 'red';
                const bg = bonusMatch ? 'rgba(233, 30, 99, 0.08)' : 'rgba(255, 0, 0, 0.08)';
                await page.evaluate(({ color, bg }) => {
                    const rows = document.querySelectorAll('[class*="breakupRow"]:not([class*="Values"]):not([class*="Label"])');
                    for (const row of rows) {
                        const label = row.querySelector('[class*="breakupRowLabel"]');
                        if (label && label.textContent.trim() === 'Statutory Bonus') {
                            row.style.border = `3px solid ${color}`;
                            row.style.borderRadius = '4px';
                            row.style.padding = '2px';
                            row.style.backgroundColor = bg;
                        }
                    }
                }, { color, bg });

                await takeSBScreenshot(page, `StatBonus_${num}_${testSet.label}_${catShort}_${level}_${location}`);
                expect(bonusMatch).toBeTruthy();
                console.log(`✅ Scenario ${num} complete\n`);
            });
        }
    }
}
}
