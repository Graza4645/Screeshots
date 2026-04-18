/**
 * @author Md Noushad Ansari
 * Salary Calculator - Meal Allowance Validation
 *
 * Rule:
 *   If Meal Allowance = "Yes" AND (Annual Fixed / 12) >= 55019
 *     → Meal Allowance = ₹2,200/month, ₹26,400/year
 *   If Meal Allowance = "Yes" AND (Annual Fixed / 12) < 55019
 *     → Meal Allowance = ₹0
 *   If Meal Allowance = "No"
 *     → Meal Allowance = ₹0 (always, regardless of salary)
 */

import SalaryCalculatorPage from '../PageObject/SalaryCalculatorPage.js';
import { test, expect } from '@playwright/test';
import { validdata, categories, levels, locations } from '../TestData/testData.js';
import fs from 'fs';
import path from 'path';

const MEAL_DIR = path.resolve('tests/Hiring_Tabulation_SalaryCalculator/screenshots/MealAllowance');
if (!fs.existsSync(MEAL_DIR)) fs.mkdirSync(MEAL_DIR, { recursive: true });

async function takeMealScreenshot(page, name) {
    const files = fs.readdirSync(MEAL_DIR);
    files.filter(f => f.startsWith(name)).forEach(f => fs.unlinkSync(path.join(MEAL_DIR, f)));
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
    await page.screenshot({ path: path.join(MEAL_DIR, filename), fullPage: true, scale: 'css' });

    await page.evaluate(() => {
        document.body.style.zoom = '1';
        document.body.style.webkitFontSmoothing = '';
        document.body.style.textRendering = '';
    });
    await page.setViewportSize(originalViewport);
    await page.waitForTimeout(300);

    console.log(`📸 HD Meal Screenshot: screenshots/MealAllowance/${filename}`);
}

function parseCurrency(str) {
    if (!str || str === '-') return 0;
    return Number(str.replace(/[₹,\s]/g, ''));
}

function calculateMealAllowance(annualFixed, mealOption) {
    if (mealOption === 'No') return 0;
    const monthlyFixed = annualFixed / 12;
    return monthlyFixed >= 55019 ? 2200 : 0;
}

// Test sets: Meal Yes/No × eligible/not eligible
const testSets = [
    // Meal=Yes, eligible (Annual Fixed ₹7L → Monthly ₹58,333 >= 55019)
    { annualFixed: '700000', meal: 'Yes', label: '7L_Meal_Yes_2200' },
    // Meal=Yes, NOT eligible (Annual Fixed ₹4L → Monthly ₹33,333 < 55019)
    { annualFixed: '400000', meal: 'Yes', label: '4L_Meal_Yes_0' },
    // Meal=No, high salary (still ₹0)
    { annualFixed: '700000', meal: 'No', label: '7L_Meal_No_0' },
    // Meal=No, low salary (still ₹0)
    { annualFixed: '400000', meal: 'No', label: '4L_Meal_No_0' },
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

            test(`Scenario : ${num} | Meal | ${testSet.label} | Category: ${category} | Level: ${level} | Location: ${location}`, async ({ page }) => {
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

                const expectedMeal = calculateMealAllowance(Number(testSet.annualFixed), testSet.meal);
                const expectedMealYearly = expectedMeal * 12;
                const actualMealMonthly = parseCurrency(breakup['Meal Allowance']?.monthly);
                const actualMealYearly = parseCurrency(breakup['Meal Allowance']?.perAnnum);

                const monthlyMatch = actualMealMonthly === expectedMeal;
                const yearlyMatch = actualMealYearly === expectedMealYearly;
                const mealMatch = monthlyMatch && yearlyMatch;

                const monthlyFixed = Number(testSet.annualFixed) / 12;
                console.log(`\n🔍 MEAL ALLOWANCE VALIDATION (${testSet.label}):`);
                console.log(`   Annual Fixed: ₹${Number(testSet.annualFixed).toLocaleString('en-IN')} | Monthly: ₹${Math.round(monthlyFixed).toLocaleString('en-IN')}`);
                console.log(`   Meal Option: ${testSet.meal} | Threshold: Monthly >= ₹55,019`);
                console.log(`   Meal Monthly: Expected ₹${expectedMeal.toLocaleString('en-IN')} | Actual ₹${actualMealMonthly.toLocaleString('en-IN')} → ${monthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
                console.log(`   Meal Yearly : Expected ₹${expectedMealYearly.toLocaleString('en-IN')} | Actual ₹${actualMealYearly.toLocaleString('en-IN')} → ${yearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

                // Highlight Meal Allowance row
                const color = mealMatch ? '#FF5722' : 'red';
                const bg = mealMatch ? 'rgba(255, 87, 34, 0.08)' : 'rgba(255, 0, 0, 0.08)';
                await page.evaluate(({ color, bg }) => {
                    const rows = document.querySelectorAll('[class*="breakupRow"]:not([class*="Values"]):not([class*="Label"])');
                    for (const row of rows) {
                        const label = row.querySelector('[class*="breakupRowLabel"]');
                        if (label && label.textContent.trim() === 'Meal Allowance') {
                            row.style.border = `3px solid ${color}`;
                            row.style.borderRadius = '4px';
                            row.style.padding = '2px';
                            row.style.backgroundColor = bg;
                        }
                    }
                }, { color, bg });

                await takeMealScreenshot(page, `Meal_${num}_${testSet.label}_${catShort}_${level}_${location}`);
                expect(mealMatch).toBeTruthy();
                console.log(`✅ Scenario ${num} complete\n`);
            });
        }
    }
    }
}
