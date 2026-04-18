/**
 * @author Md Noushad Ansari
 * Salary Calculator - LTA (Leave Travel Allowance) Validation
 *
 * Meal = "Yes":
 *   monthlyFixed >= 41800 AND <= 83333 → LTA = 2000
 *   monthlyFixed > 83333 AND <= 166667 → LTA = 3000
 *   monthlyFixed > 166667              → LTA = 4000
 *   else                               → LTA = 0
 *
 * Meal = "No":
 *   monthlyFixed >= 42017 AND <= 83333 → LTA = 2000
 *   monthlyFixed > 83333 AND <= 166667 → LTA = 3000
 *   monthlyFixed > 166667              → LTA = 4000
 *   else                               → LTA = 0
 */

import SalaryCalculatorPage from '../PageObject/SalaryCalculatorPage.js';
import { test, expect } from '@playwright/test';
import { validdata, categories, levels, locations } from '../TestData/testData.js';
import fs from 'fs';
import path from 'path';

// Separate screenshot folder
const LTA_DIR = path.resolve('tests/Hiring_Tabulation_SalaryCalculator/screenshots/LTA');
if (!fs.existsSync(LTA_DIR)) fs.mkdirSync(LTA_DIR, { recursive: true });

async function takeLTAScreenshot(page, name) {
    const files = fs.readdirSync(LTA_DIR);
    files.filter(f => f.startsWith(name)).forEach(f => fs.unlinkSync(path.join(LTA_DIR, f)));
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${ts}.png`;

    const originalViewport = page.viewportSize();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(300);

    await page.evaluate(() => {
        document.body.style.zoom = '0.7';
        document.body.style.webkitFontSmoothing = 'antialiased';
        document.body.style.textRendering = 'optimizeLegibility';
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(LTA_DIR, filename), fullPage: true, scale: 'css' });

    await page.evaluate(() => {
        document.body.style.zoom = '1';
        document.body.style.webkitFontSmoothing = '';
        document.body.style.textRendering = '';
    });
    await page.setViewportSize(originalViewport);
    await page.waitForTimeout(300);

    console.log(`📸 HD LTA Screenshot: screenshots/LTA/${filename}`);
}

function parseCurrency(str) {
    if (!str || str === '-') return 0;
    return Number(str.replace(/[₹,\s]/g, ''));
}

function calculateLTA(annualFixed, mealAllowance) {
    const monthlyFixed = annualFixed / 12;
    if (mealAllowance === 'Yes') {
        if (monthlyFixed >= 41800 && monthlyFixed <= 83333) return 2000;
        if (monthlyFixed > 83333 && monthlyFixed <= 166667) return 3000;
        if (monthlyFixed > 166667) return 4000;
        return 0;
    } else {
        if (monthlyFixed >= 42017 && monthlyFixed <= 83333) return 2000;
        if (monthlyFixed > 83333 && monthlyFixed <= 166667) return 3000;
        if (monthlyFixed > 166667) return 4000;
        return 0;
    }
}

// Test sets: cover all 4 LTA brackets × Meal Yes/No = 8 sets
const testSets = [
    // LTA = 0 (monthlyFixed < threshold)
    { annualFixed: '300123', meal: 'Yes', label: '3L_Meal_Yes_LTA_0' },
    { annualFixed: '300123', meal: 'No',  label: '3L_Meal_No_LTA_0' },
    // LTA = 2000 (monthlyFixed 41800-83333)
    { annualFixed: '600192', meal: 'Yes', label: '6L_Meal_Yes_LTA_2000' },
    { annualFixed: '600122', meal: 'No',  label: '6L_Meal_No_LTA_2000' },
    // LTA = 3000 (monthlyFixed 83334-166667)
    { annualFixed: '1200123', meal: 'Yes', label: '12L_Meal_Yes_LTA_3000' },
    { annualFixed: '1200193', meal: 'No',  label: '12L_Meal_No_LTA_3000' },
    // LTA = 4000 (monthlyFixed > 166667)
    { annualFixed: '4000123', meal: 'Yes', label: '40L_Meal_Yes_LTA_4000' },
    { annualFixed: '4000234', meal: 'No',  label: '40L_Meal_No_LTA_4000' },
];

let scenarioCount = 1;

for (const testSet of testSets) {
    for (const category of categories) {
        for (const level of levels) {
            for (const location of locations) {
            const num = scenarioCount++;
            const catShort = category.replace('Non Sales - Technology or Product', 'NS_Tech')
                                     .replace('Non Sales - Rest', 'NS_Rest')
                                     .replace('Sales & AM', 'Sales_AM');

            test(`Scenario : ${num} | LTA | ${testSet.label} | Category: ${category} | Level: ${level} | Location: ${location}`, async ({ page }) => {
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

                // Toggle Meal Allowance dropdown (index 3) if needed
                const mealDropdown = page.locator('[class*="dropdownInput"]').nth(3);
                const currentMeal = (await mealDropdown.textContent()).trim();
                if (currentMeal !== testSet.meal) {
                    await mealDropdown.click();
                    await page.waitForTimeout(500);
                    await page.locator('[class*="optionLabel"]').filter({ hasText: new RegExp(`^${testSet.meal}$`) }).click();
                    await page.waitForTimeout(500);
                    console.log(`✅ Toggled Meal Allowance: ${currentMeal} → ${testSet.meal}`);
                }

                await user.clickCalculateSalaryBreakup();
                const breakup = await user.captureAndPrintCompensationBreakup();

                const expectedLTA = calculateLTA(Number(testSet.annualFixed), testSet.meal);
                const actualLTAMonthly = parseCurrency(breakup['LTA']?.monthly);
                const actualLTAYearly = parseCurrency(breakup['LTA']?.perAnnum);
                const expectedLTAYearly = expectedLTA * 12;

                const monthlyMatch = actualLTAMonthly === expectedLTA;
                const yearlyMatch = actualLTAYearly === expectedLTAYearly;
                const ltaMatch = monthlyMatch && yearlyMatch;

                const monthlyFixed = Number(testSet.annualFixed) / 12;
                console.log(`\n🔍 LTA VALIDATION (${testSet.label}):`);
                console.log(`   Monthly Fixed: ₹${Math.round(monthlyFixed).toLocaleString('en-IN')} | Meal: ${testSet.meal}`);
                console.log(`   LTA Monthly: Expected ₹${expectedLTA.toLocaleString('en-IN')} | Actual ₹${actualLTAMonthly.toLocaleString('en-IN')} → ${monthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
                console.log(`   LTA Yearly : Expected ₹${expectedLTAYearly.toLocaleString('en-IN')} | Actual ₹${actualLTAYearly.toLocaleString('en-IN')} → ${yearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

                // Highlight LTA row
                const color = ltaMatch ? '#795548' : 'red';
                const bg = ltaMatch ? 'rgba(121, 85, 72, 0.08)' : 'rgba(255, 0, 0, 0.08)';
                await page.evaluate(({ color, bg }) => {
                    const rows = document.querySelectorAll('[class*="breakupRow"]:not([class*="Values"]):not([class*="Label"])');
                    for (const row of rows) {
                        const label = row.querySelector('[class*="breakupRowLabel"]');
                        if (label && label.textContent.trim() === 'LTA') {
                            row.style.border = `3px solid ${color}`;
                            row.style.borderRadius = '4px';
                            row.style.padding = '2px';
                            row.style.backgroundColor = bg;
                        }
                    }
                }, { color, bg });

                await takeLTAScreenshot(page, `LTA_${num}_${testSet.label}_${catShort}_${level}_${location}`);
                expect(ltaMatch).toBeTruthy();
                console.log(`✅ Scenario ${num} complete\n`);
            });
            }
        }
    }
}
