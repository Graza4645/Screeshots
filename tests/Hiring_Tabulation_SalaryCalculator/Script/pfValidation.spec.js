/**
 * @author Md Noushad Ansari
 * Salary Calculator - Employee PF Contribution Validation
 *
 * Set 1: Annual Fixed = 500000, PF Capped = Yes (all Category × Level)
 * Set 2: Annual Fixed = 15000,  PF Capped = No  (all Category × Level)
 */

import SalaryCalculatorPage from '../PageObject/SalaryCalculatorPage.js';
import { test, expect } from '@playwright/test';
import { validdata, categories, levels, locations } from '../TestData/testData.js';

// ─── PF Calculation Function ─────────────────────────────────────────────────

function calculateExpectedPF({ annualFixed, basicMonthly, hraMonthly,
    otherAllowances = 0, pfCapped = 'Yes',
    mealAllowance = 0, vehicleMaintenance = 0, driverSalary = 0 }) {
    const s = (v) => Number(v) || 0;
    const basic = s(basicMonthly), hra = s(hraMonthly), others = s(otherAllowances);
    const meal = s(mealAllowance), vehicle = s(vehicleMaintenance), driver = s(driverSalary);
    const monthlyCTC = s(annualFixed) / 12;

    if (monthlyCTC <= 22800) {
        const rem = (monthlyCTC - (1.1525 * basic) - (1.0325 * hra) - (1.0325 * others)) / 1.1525;
        return Math.round(0.12 * (basic + rem));
    }
    if (pfCapped === 'Yes') {
        if (basic >= 15000) return 1800;
        const rem = (monthlyCTC - (1.12 * basic) - hra - meal - vehicle - driver) / 1.12;
        const calc = Math.round(0.12 * (basic + rem));
        return calc < 1800 ? calc : 1800;
    }
    if (basic >= 15000) return Math.round(0.12 * basic);
    const rem = (monthlyCTC - (1.12 * basic) - hra - meal - vehicle - driver) / 1.12;
    return Math.round(0.12 * (basic + rem));
}

function parseCurrency(str) {
    if (!str || str === '-') return 0;
    return Number(str.replace(/[₹,\s]/g, ''));
}

// ─── Test Sets ────────────────────────────────────────────────────────────────

const testSets = [
    { annualFixed: '499999', pfCapped: 'Yes', label: 'AnnualFixed_5L_PFCapped_Yes' },
    { annualFixed: '499999',  pfCapped: 'No',  label: 'AnnualFixed_15K_PFCapped_No' },
];

let scenarioCount = 1;

// PF screenshots go to separate folder
import fs from 'fs';
import path from 'path';
const PF_SCREENSHOT_DIR = path.resolve('tests/Hiring_Tabulation_SalaryCalculator/screenshots/PF');
if (!fs.existsSync(PF_SCREENSHOT_DIR)) fs.mkdirSync(PF_SCREENSHOT_DIR, { recursive: true });

async function takePFScreenshot(page, scenarioName) {
    const files = fs.readdirSync(PF_SCREENSHOT_DIR);
    files.filter(f => f.startsWith(scenarioName)).forEach(f => {
        fs.unlinkSync(path.join(PF_SCREENSHOT_DIR, f));
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
    await page.screenshot({ path: path.join(PF_SCREENSHOT_DIR, filename), fullPage: true, scale: 'css' });

    await page.evaluate(() => {
        document.body.style.zoom = '1';
        document.body.style.webkitFontSmoothing = '';
        document.body.style.textRendering = '';
    });
    await page.setViewportSize(originalViewport);
    await page.waitForTimeout(300);

    console.log(`📸 HD PF Screenshot saved: screenshots/PF/${filename}`);
}

for (const testSet of testSets) {
    for (const category of categories) {
        for (const level of levels) {
            for (const location of locations) {
            const num = scenarioCount++;
            const catShort = category.replace('Non Sales - Technology or Product', 'NS_Tech')
                                     .replace('Non Sales - Rest', 'NS_Rest')
                                     .replace('Sales & AM', 'Sales_AM');

            test(`Scenario : ${num} | PF | ${testSet.label} | Category: ${category} | Level: ${level} | Location: ${location}`, async ({ page }) => {
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

                // Toggle PF Capped dropdown (index 4) if needed
                const pfDropdown = page.locator('[class*="dropdownInput"]').nth(4);
                const currentPF = (await pfDropdown.textContent()).trim();
                if (currentPF !== testSet.pfCapped) {
                    await pfDropdown.click();
                    await page.waitForTimeout(500);
                    await page.locator('[class*="optionLabel"]').filter({ hasText: new RegExp(`^${testSet.pfCapped}$`) }).click();
                    await page.waitForTimeout(500);
                    console.log(`✅ Toggled PF Capped: ${currentPF} → ${testSet.pfCapped}`);
                }

                await user.clickCalculateSalaryBreakup();
                const breakup = await user.captureAndPrintCompensationBreakup();

                // Extract values
                const basicMonthly = parseCurrency(breakup['Basic']?.monthly);
                const hraMonthly = parseCurrency(breakup['HRA']?.monthly);
                const mealAllowance = parseCurrency(breakup['Meal Allowance']?.monthly);
                const vehicleMaintenance = parseCurrency(breakup['Vehicle Maintenance']?.monthly);
                const driverSalary = parseCurrency(breakup['Driver Salary']?.monthly);
                const statutoryBonus = parseCurrency(breakup['Statutory Bonus']?.monthly);
                const mobileAllowance = parseCurrency(breakup['Mobile Allowance']?.monthly);
                const specialAllowance = parseCurrency(breakup['Special Allowance']?.monthly);
                const lta = parseCurrency(breakup['LTA']?.monthly);
                const otherAllowances = statutoryBonus + mobileAllowance + specialAllowance + lta;

                const expectedPF = calculateExpectedPF({
                    annualFixed: Number(testSet.annualFixed), basicMonthly, hraMonthly,
                    otherAllowances, pfCapped: testSet.pfCapped,
                    mealAllowance, vehicleMaintenance, driverSalary
                });

                const actualPF = parseCurrency(breakup["Employer's PF Contribution"]?.monthly);
                const actualPFYearly = parseCurrency(breakup["Employer's PF Contribution"]?.perAnnum);
                const expectedPFYearly = expectedPF * 12;
                const pfMonthlyMatch = actualPF === expectedPF;
                const pfYearlyMatch = actualPFYearly === expectedPFYearly;
                const pfMatch = pfMonthlyMatch && pfYearlyMatch;

                const monthlyCTC = Number(testSet.annualFixed) / 12;
                console.log(`\n🔍 PF VALIDATION (${testSet.label}):`);
                console.log(`   MonthlyCTC: ₹${Math.round(monthlyCTC).toLocaleString('en-IN')} ${monthlyCTC <= 22800 ? '(<= 22800 → Cond 1)' : '(> 22800)'}`);
                console.log(`   PF Capped: ${testSet.pfCapped} | Basic: ₹${basicMonthly.toLocaleString('en-IN')} ${basicMonthly >= 15000 ? '(>= 15000)' : '(< 15000)'}`);
                console.log(`   PF Monthly: Expected ₹${expectedPF.toLocaleString('en-IN')} | Actual ₹${actualPF.toLocaleString('en-IN')} → ${pfMonthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
                console.log(`   PF Yearly : Expected ₹${expectedPFYearly.toLocaleString('en-IN')} | Actual ₹${actualPFYearly.toLocaleString('en-IN')} → ${pfYearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

                // Highlight PF row
                const color = pfMatch ? '#00BCD4' : 'red';
                const bg = pfMatch ? 'rgba(0, 188, 212, 0.08)' : 'rgba(255, 0, 0, 0.08)';
                await page.evaluate(({ color, bg }) => {
                    const rows = document.querySelectorAll('[class*="breakupRow"]:not([class*="Values"]):not([class*="Label"])');
                    for (const row of rows) {
                        const label = row.querySelector('[class*="breakupRowLabel"]');
                        if (label && label.textContent.trim() === "Employer's PF Contribution") {
                            row.style.border = `3px solid ${color}`;
                            row.style.borderRadius = '4px';
                            row.style.padding = '2px';
                            row.style.backgroundColor = bg;
                        }
                    }
                }, { color, bg });

                await takePFScreenshot(page, `PF_${num}_${testSet.label}_${catShort}_${level}_${location}`);
                expect(pfMatch).toBeTruthy();
                console.log(`✅ Scenario ${num} complete\n`);
            });
        }
        }
    }
}
