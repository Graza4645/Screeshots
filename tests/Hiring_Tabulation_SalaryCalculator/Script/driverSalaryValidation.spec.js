/**
 * @author Md Noushad Ansari
 * Salary Calculator - Driver Salary Validation
 *
 * Prerequisite: Vehicle Maintenance = "Yes" (always) → Driver Salary dropdown appears
 *
 * Set 1: Driver Salary = "Yes" → value based on Level:
 *   LST, L10, L9, L8, L7 → ₹900/month, ₹10,800/year
 *   L6, L5, L4, L3, L2, L1 → ₹0/month, ₹0/year
 *
 * Set 2: Driver Salary = "No" → ₹0/month, ₹0/year (always)
 */

import SalaryCalculatorPage from '../PageObject/SalaryCalculatorPage.js';
import { test, expect } from '@playwright/test';
import { validdata, categories, levels, locations } from '../TestData/testData.js';
import fs from 'fs';
import path from 'path';

const DRIVER_DIR = path.resolve('tests/Hiring_Tabulation_SalaryCalculator/screenshots/DriverSalary');
if (!fs.existsSync(DRIVER_DIR)) fs.mkdirSync(DRIVER_DIR, { recursive: true });

async function takeDriverScreenshot(page, name) {
    const files = fs.readdirSync(DRIVER_DIR);
    files.filter(f => f.startsWith(name)).forEach(f => fs.unlinkSync(path.join(DRIVER_DIR, f)));
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
    await page.screenshot({ path: path.join(DRIVER_DIR, filename), fullPage: true, scale: 'css' });

    await page.evaluate(() => {
        document.body.style.zoom = '1';
        document.body.style.webkitFontSmoothing = '';
        document.body.style.textRendering = '';
    });
    await page.setViewportSize(originalViewport);
    await page.waitForTimeout(300);

    console.log(`📸 HD Driver Salary Screenshot: screenshots/DriverSalary/${filename}`);
}

function parseCurrency(str) {
    if (!str || str === '-') return 0;
    return Number(str.replace(/[₹,\s]/g, ''));
}

// Driver Salary by Level (when Driver Salary = "Yes")
const driverSalaryByLevel = {
    'LST': 900, 'L10': 900, 'L9': 900, 'L8': 900, 'L7': 900,
    'L6': 0, 'L5': 0, 'L4': 0, 'L3': 0, 'L2': 0, 'L1': 0
};

// VALIDATION RUN: exactly 1 scenario to verify artifact download works
const testSets = [
    { driverOption: 'Yes', label: 'Driver_Yes' },
];
const validationCategories = ['Sales & AM'];
const validationLevels = ['L10'];
const locationList = ['Ahmedabad'];



const annualFixed = '498765';
let scenarioCount = 1;

for (const testSet of testSets) {
    for (const category of validationCategories) {
        for (const level of validationLevels) {
            for (const location of locationList) {
                const num = scenarioCount++;
                const catShort = category.replace('Non Sales - Technology or Product', 'NS_Tech')
                                         .replace('Non Sales - Rest', 'NS_Rest')
                                         .replace('Sales & AM', 'Sales_AM');

                test(`Scenario : ${num} | ${testSet.label} | Category: ${category} | Level: ${level} | Location: ${location}`, async ({ page }) => {
                    test.setTimeout(120000);
                    const user = new SalaryCalculatorPage(page, validdata);
                    await user.URL();
                    await user.login();
                    await user.navigateToSalaryCalculator();

                    await user.selectCategory(category);
                    await user.selectLevel(level);
                    await user.selectLocation(location);
                    await user.enterAnnualFixed(annualFixed);

                    // Enter Annual Performance Pay = 2000
                    const perfInput = page.getByRole('textbox', { name: 'e.g. 500000 or' }).nth(1);
                    await perfInput.fill('2000');
                    await page.waitForTimeout(500);
                    console.log('✅ Entered Annual Performance Pay: ₹2000');

                    // Step 1: Set Vehicle Maintenance = "Yes" (always)
                    const vehicleDropdown = page.locator('[class*="dropdownInput"]').nth(5);
                    const currentVehicle = (await vehicleDropdown.textContent()).trim();
                    if (currentVehicle !== 'Yes') {
                        await vehicleDropdown.click();
                        await page.waitForTimeout(500);
                        await page.locator('[class*="optionLabel"]').filter({ hasText: /^Yes$/ }).click();
                        await page.waitForTimeout(1000);
                        console.log(`✅ Vehicle Maintenance: ${currentVehicle} → Yes`);
                    }

                    // Step 2: Set Driver Salary dropdown (appears after Vehicle = Yes)
                    // Wait for the new dropdown to appear, then use the last dropdownInput
                    await page.waitForTimeout(1000);
                    const allDropdowns = page.locator('[class*="dropdownContainer"]');
                    const dropdownCount = await allDropdowns.count();
                    const driverContainer = allDropdowns.nth(dropdownCount - 1); // Last dropdown = Driver Salary
                    const driverInput = driverContainer.locator('[class*="dropdownInput"]');
                    const currentDriver = (await driverInput.textContent()).trim();
                    if (currentDriver !== testSet.driverOption) {
                        await driverInput.click();
                        await page.waitForTimeout(500);
                        // Click the option inside the open dropdown menu (last one in DOM)
                        const menus = page.locator('[class*="dropdownMenu"]');
                        const menuCount = await menus.count();
                        const driverMenu = menus.nth(menuCount - 1);
                        await driverMenu.locator('[class*="optionLabel"]').filter({ hasText: new RegExp(`^${testSet.driverOption}$`) }).click();
                        await page.waitForTimeout(500);
                        console.log(`✅ Driver Salary: ${currentDriver} → ${testSet.driverOption}`);
                    }

                    await user.clickCalculateSalaryBreakup();
                    const breakup = await user.captureAndPrintCompensationBreakup();

                    // Expected Driver Salary
                    let expectedMonthly;
                    if (testSet.driverOption === 'No') {
                        expectedMonthly = 0; // Driver = No → always 0
                    } else {
                        expectedMonthly = driverSalaryByLevel[level] ?? 0; // Driver = Yes → by Level
                    }
                    const expectedYearly = expectedMonthly * 12;

                    const actualMonthly = parseCurrency(breakup['Driver Salary']?.monthly);
                    const actualYearly = parseCurrency(breakup['Driver Salary']?.perAnnum);

                    const monthlyMatch = actualMonthly === expectedMonthly;
                    const yearlyMatch = actualYearly === expectedYearly;
                    const driverMatch = monthlyMatch && yearlyMatch;
                    const notNegative = actualMonthly >= 0 && actualYearly >= 0;

                    console.log(`\n🔍 DRIVER SALARY VALIDATION (${testSet.label}):`);
                    console.log(`   Level: ${level} | Vehicle Maintenance: Yes | Driver Salary: ${testSet.driverOption}`);
                    console.log(`   Driver Monthly: Expected ₹${expectedMonthly.toLocaleString('en-IN')} | Actual ₹${actualMonthly.toLocaleString('en-IN')} → ${monthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
                    console.log(`   Driver Yearly : Expected ₹${expectedYearly.toLocaleString('en-IN')} | Actual ₹${actualYearly.toLocaleString('en-IN')} → ${yearlyMatch ? '✅ PASS' : '❌ FAIL'}`);
                    console.log(`   Not Negative: ${notNegative ? '✅' : '❌'}\n`);

                    // Highlight Driver Salary row
                    const color = driverMatch ? '#3F51B5' : 'red';
                    const bg = driverMatch ? 'rgba(63, 81, 181, 0.08)' : 'rgba(255, 0, 0, 0.08)';
                    await page.evaluate(({ color, bg }) => {
                        const rows = document.querySelectorAll('[class*="breakupRow"]:not([class*="Values"]):not([class*="Label"])');
                        for (const row of rows) {
                            const label = row.querySelector('[class*="breakupRowLabel"]');
                            if (label && label.textContent.trim() === 'Driver Salary') {
                                row.style.border = `3px solid ${color}`;
                                row.style.borderRadius = '4px';
                                row.style.padding = '2px';
                                row.style.backgroundColor = bg;
                            }
                        }
                    }, { color, bg });

                    await takeDriverScreenshot(page, `Driver_${num}_${testSet.label}_${catShort}_${level}_${location}`);
                    expect(driverMatch).toBeTruthy();
                    expect(notNegative).toBeTruthy();
                    console.log(`✅ Scenario ${num} complete\n`);
                });
            }
        }
    }
}
