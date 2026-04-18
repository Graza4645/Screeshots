/**
 * @author Md Noushad Ansari
 * Salary Calculator - Vehicle Maintenance Validation
 *
 * Prerequisite: Vehicle Maintenance = "Yes" → Vehicle CC dropdown appears
 * Vehicle CC options: "<= 1600 cc" and "> 1600 cc"
 *
 * Vehicle Maintenance amount by Level + CC:
 *   LST, L10, L9, L8, L7 + <= 1600 cc → ₹1,800/month
 *   LST, L10, L9, L8, L7 + > 1600 cc  → ₹2,400/month
 *   L6, L5, L4, L3, L2, L1            → ₹0 (any CC)
 */

import SalaryCalculatorPage from '../PageObject/SalaryCalculatorPage.js';
import { test, expect } from '@playwright/test';
import { validdata, categories, levels, locations } from '../TestData/testData.js';
import fs from 'fs';
import path from 'path';

const VM_DIR = path.resolve('tests/Hiring_Tabulation_SalaryCalculator/screenshots/VehicleMaintenance');
if (!fs.existsSync(VM_DIR)) fs.mkdirSync(VM_DIR, { recursive: true });

async function takeVMScreenshot(page, name) {
    const files = fs.readdirSync(VM_DIR);
    files.filter(f => f.startsWith(name)).forEach(f => fs.unlinkSync(path.join(VM_DIR, f)));
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
    await page.screenshot({ path: path.join(VM_DIR, filename), fullPage: true, scale: 'css' });

    await page.evaluate(() => {
        document.body.style.zoom = '1';
        document.body.style.webkitFontSmoothing = '';
        document.body.style.textRendering = '';
    });
    await page.setViewportSize(originalViewport);
    await page.waitForTimeout(300);

    console.log(`📸 HD Vehicle Maintenance Screenshot: screenshots/VehicleMaintenance/${filename}`);
}

function parseCurrency(str) {
    if (!str || str === '-') return 0;
    return Number(str.replace(/[₹,\s]/g, ''));
}

// Vehicle Maintenance by Level
const vmByLevel = {
    'LST': { low: 1800, high: 2400 }, 'L10': { low: 1800, high: 2400 },
    'L9': { low: 1800, high: 2400 }, 'L8': { low: 1800, high: 2400 },
    'L7': { low: 1800, high: 2400 },
    'L6': { low: 0, high: 0 }, 'L5': { low: 0, high: 0 },
    'L4': { low: 0, high: 0 }, 'L3': { low: 0, high: 0 },
    'L2': { low: 0, high: 0 }, 'L1': { low: 0, high: 0 },
};

const testSets = [
    { ccOption: '<= 1600 cc', key: 'low', label: 'CC_1600_or_less' },
    { ccOption: '> 1600 cc',  key: 'high', label: 'CC_above_1600' },
];

const locationList = locations;
const annualFixed = '500000';
let scenarioCount = 1;

for (const testSet of testSets) {
    for (const category of categories) {
        for (const level of levels) {
            for (const location of locationList) {
                const num = scenarioCount++;
                const catShort = category.replace('Non Sales - Technology or Product', 'NS_Tech')
                                         .replace('Non Sales - Rest', 'NS_Rest')
                                         .replace('Sales & AM', 'Sales_AM');

                test(`Scenario : ${num} | VehicleMaint | ${testSet.label} | Category: ${category} | Level: ${level} | Location: ${location}`, async ({ page }) => {
                    test.setTimeout(120000);
                    const user = new SalaryCalculatorPage(page, validdata);
                    await user.URL();
                    await user.login();
                    await user.navigateToSalaryCalculator();

                    await user.selectCategory(category);
                    await user.selectLevel(level);
                    await user.selectLocation(location);
                    await user.enterAnnualFixed(annualFixed);

                    // Enter Annual Performance Pay
                    const perfInput = page.getByRole('textbox', { name: 'e.g. 500000 or' }).nth(1);
                    await perfInput.fill('2000');
                    await page.waitForTimeout(500);
                    console.log('✅ Entered Annual Performance Pay: ₹2000');

                    // Step 1: Set Vehicle Maintenance = "Yes" (dropdown index 5)
                    const vehicleDropdown = page.locator('[class*="dropdownInput"]').nth(5);
                    const currentVehicle = (await vehicleDropdown.textContent()).trim();
                    if (currentVehicle !== 'Yes') {
                        await vehicleDropdown.click();
                        await page.waitForTimeout(500);
                        await page.locator('[class*="optionLabel"]').filter({ hasText: /^Yes$/ }).click();
                        await page.waitForTimeout(1000);
                        console.log(`✅ Vehicle Maintenance: ${currentVehicle} → Yes`);
                    }

                    // Step 2: Select Vehicle CC dropdown (appears after Vehicle = Yes)
                    await page.waitForTimeout(1000);
                    const allContainers = page.locator('[class*="dropdownContainer"]');
                    const containerCount = await allContainers.count();
                    // Vehicle CC is one of the new dropdowns that appeared
                    // Find the dropdown that contains "1600" text or "cc" in its options
                    let ccFound = false;
                    for (let i = containerCount - 1; i >= 0; i--) {
                        const container = allContainers.nth(i);
                        const inputText = (await container.locator('[class*="dropdownInput"]').textContent()).trim();
                        if (inputText.includes('1600') || inputText.includes('cc') || inputText === 'Select') {
                            // This might be the CC dropdown, click it
                            await container.locator('[class*="dropdownInput"]').click();
                            await page.waitForTimeout(500);
                            // Check if options contain "1600"
                            const menuVisible = await page.locator('[class*="dropdownMenu"]').last().isVisible();
                            if (menuVisible) {
                                const options = await page.locator('[class*="dropdownMenu"]').last().locator('[class*="optionLabel"]').allTextContents();
                                if (options.some(o => o.includes('1600'))) {
                                    // Found the CC dropdown, select the option
                                    await page.locator('[class*="dropdownMenu"]').last()
                                        .locator('[class*="optionLabel"]')
                                        .filter({ hasText: testSet.ccOption })
                                        .click();
                                    await page.waitForTimeout(500);
                                    console.log(`✅ Vehicle CC: ${testSet.ccOption}`);
                                    ccFound = true;
                                    break;
                                }
                            }
                            // Close if wrong dropdown
                            await page.keyboard.press('Escape');
                            await page.waitForTimeout(300);
                        }
                    }

                    if (!ccFound) {
                        console.log(`⚠️ Vehicle CC dropdown not found, trying last dropdown`);
                        const lastContainer = allContainers.nth(containerCount - 2);
                        await lastContainer.locator('[class*="dropdownInput"]').click();
                        await page.waitForTimeout(500);
                        await page.locator('[class*="dropdownMenu"]').last()
                            .locator('[class*="optionLabel"]')
                            .filter({ hasText: testSet.ccOption })
                            .click();
                        await page.waitForTimeout(500);
                    }

                    await user.clickCalculateSalaryBreakup();
                    const breakup = await user.captureAndPrintCompensationBreakup();

                    // Expected Vehicle Maintenance
                    const expectedMonthly = vmByLevel[level]?.[testSet.key] ?? 0;
                    const expectedYearly = expectedMonthly * 12;

                    const actualMonthly = parseCurrency(breakup['Vehicle Maintenance']?.monthly);
                    const actualYearly = parseCurrency(breakup['Vehicle Maintenance']?.perAnnum);

                    const monthlyMatch = actualMonthly === expectedMonthly;
                    const yearlyMatch = actualYearly === expectedYearly;
                    const vmMatch = monthlyMatch && yearlyMatch;

                    console.log(`\n🔍 VEHICLE MAINTENANCE VALIDATION (${testSet.label}):`);
                    console.log(`   Level: ${level} | Vehicle CC: ${testSet.ccOption}`);
                    console.log(`   VM Monthly: Expected ₹${expectedMonthly.toLocaleString('en-IN')} | Actual ₹${actualMonthly.toLocaleString('en-IN')} → ${monthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
                    console.log(`   VM Yearly : Expected ₹${expectedYearly.toLocaleString('en-IN')} | Actual ₹${actualYearly.toLocaleString('en-IN')} → ${yearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

                    // Highlight Vehicle Maintenance row
                    const color = vmMatch ? '#8BC34A' : 'red';
                    const bg = vmMatch ? 'rgba(139, 195, 74, 0.08)' : 'rgba(255, 0, 0, 0.08)';
                    await page.evaluate(({ color, bg }) => {
                        const rows = document.querySelectorAll('[class*="breakupRow"]:not([class*="Values"]):not([class*="Label"])');
                        for (const row of rows) {
                            const label = row.querySelector('[class*="breakupRowLabel"]');
                            if (label && label.textContent.trim() === 'Vehicle Maintenance') {
                                row.style.border = `3px solid ${color}`;
                                row.style.borderRadius = '4px';
                                row.style.padding = '2px';
                                row.style.backgroundColor = bg;
                            }
                        }
                    }, { color, bg });

                    await takeVMScreenshot(page, `VM_${num}_${testSet.label}_${catShort}_${level}_${location}`);
                    expect(vmMatch).toBeTruthy();
                    console.log(`✅ Scenario ${num} complete\n`);
                });
            }
        }
    }
}
