/**
 * @author Md Noushad Ansari
 * Salary Calculator - Employer's ESI Contribution Validation
 *
 * Rule:
 *   Total Earning (from Net Pay table) = Gross Monthly Salary
 *   If Total Earning <= 21000 → Employer's ESI = round(3.25% × Total Earning)
 *   If Total Earning > 21000  → Employer's ESI = ₹0
 *
 * Test Sets:
 *   ₹2,00,000 Annual Fixed → low salary → ESI applies
 *   ₹5,00,000 Annual Fixed → high salary → ESI = 0
 */

import SalaryCalculatorPage from '../PageObject/SalaryCalculatorPage.js';
import { test, expect } from '@playwright/test';
import { validdata, categories, levels } from '../TestData/testData.js';
import fs from 'fs';
import path from 'path';

const ESIC_DIR = path.resolve('tests/Hiring_Tabulation_SalaryCalculator/screenshots/ESIC');
if (!fs.existsSync(ESIC_DIR)) fs.mkdirSync(ESIC_DIR, { recursive: true });

async function takeESICScreenshot(page, name) {
    const files = fs.readdirSync(ESIC_DIR);
    files.filter(f => f.startsWith(name)).forEach(f => fs.unlinkSync(path.join(ESIC_DIR, f)));
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
    await page.screenshot({ path: path.join(ESIC_DIR, filename), fullPage: true, scale: 'css' });

    await page.evaluate(() => {
        document.body.style.zoom = '1';
        document.body.style.webkitFontSmoothing = '';
        document.body.style.textRendering = '';
    });
    await page.setViewportSize(originalViewport);
    await page.waitForTimeout(300);

    console.log(`📸 HD ESIC Screenshot: screenshots/ESIC/${filename}`);
}

function parseCurrency(str) {
    if (!str || str === '-') return 0;
    return Number(str.replace(/[₹,\s]/g, ''));
}

function calculateESI(totalEarningMonthly) {
    if (totalEarningMonthly <= 21000) {
        return Math.round(totalEarningMonthly * 0.0325);
    }
    return 0;
}

// Test sets: low salary (ESI applies) + high salary (ESI = 0)
const testSets = [
    { annualFixed: '223456', label: '2L_ESI_Applies' },   // Monthly ~16667 → Total Earning <= 21000
    { annualFixed: '567890', label: '5L_ESI_Zero' },       // Monthly ~41667 → Total Earning > 21000
];

const locationList = ['Aizawl', 'Alwar', 'Kota','Jaipur', 'Agartala'];
let scenarioCount = 1;

for (const testSet of testSets) {
    for (const category of categories) {
        for (const level of levels) {
            for (const location of locationList) {
                const num = scenarioCount++;
                const catShort = category.replace('Non Sales - Technology or Product', 'NS_Tech')
                                         .replace('Non Sales - Rest', 'NS_Rest')
                                         .replace('Sales & AM', 'Sales_AM');

                test(`Scenario : ${num} | ESIC | ${testSet.label} | Category: ${category} | Level: ${level} | Location: ${location}`, async ({ page }) => {
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
                    const perfInput1 = page.getByRole('textbox', { name: 'e.g. 500000 or' }).nth(1);
                    await perfInput1.fill('2000');
                    await page.waitForTimeout(500);
                    console.log('✅ Entered Annual Performance Pay: ₹2000');

                    await user.clickCalculateSalaryBreakup();

                    // Capture Compensation Breakup
                    const breakup = await user.captureAndPrintCompensationBreakup();

                    // Extract Total Earning from Net Pay section
                    const totalEarning = await page.evaluate(() => {
                        const allElements = document.querySelectorAll('*');
                        for (const el of allElements) {
                            if (el.children.length === 0 && el.textContent.trim() === 'Total Earning') {
                                const parent = el.parentElement;
                                const sibling = parent.querySelector('span:last-child') || parent.children[1];
                                if (sibling) return sibling.textContent.trim();
                            }
                        }
                        // Fallback: search in netPay section
                        const netPayRows = document.querySelectorAll('[class*="netPayRow"], [class*="netPayTotal"]');
                        for (const row of netPayRows) {
                            if (row.textContent.includes('Total Earning')) {
                                const spans = row.querySelectorAll('span');
                                if (spans.length >= 2) return spans[spans.length - 1].textContent.trim();
                            }
                        }
                        return '0';
                    });

                    const totalEarningNum = parseCurrency(totalEarning);
                    const expectedESI = calculateESI(totalEarningNum);
                    const expectedESIYearly = expectedESI * 12;

                    const actualESIMonthly = parseCurrency(breakup["Employer's ESI Contribution"]?.monthly);
                    const actualESIYearly = parseCurrency(breakup["Employer's ESI Contribution"]?.perAnnum);

                    const monthlyMatch = actualESIMonthly === expectedESI;
                    const yearlyMatch = actualESIYearly === expectedESIYearly;
                    const esiMatch = monthlyMatch && yearlyMatch;

                    console.log(`\n🔍 ESIC VALIDATION (${testSet.label}):`);
                    console.log(`   Total Earning (Gross Monthly): ₹${totalEarningNum.toLocaleString('en-IN')} ${totalEarningNum <= 21000 ? '(<= 21,000 → ESI applies)' : '(> 21,000 → ESI = 0)'}`);
                    console.log(`   ESI Monthly: Expected ₹${expectedESI.toLocaleString('en-IN')} | Actual ₹${actualESIMonthly.toLocaleString('en-IN')} → ${monthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
                    console.log(`   ESI Yearly : Expected ₹${expectedESIYearly.toLocaleString('en-IN')} | Actual ₹${actualESIYearly.toLocaleString('en-IN')} → ${yearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

                    // Highlight ESI row
                    const color = esiMatch ? '#673AB7' : 'red';
                    const bg = esiMatch ? 'rgba(103, 58, 183, 0.08)' : 'rgba(255, 0, 0, 0.08)';
                    await page.evaluate(({ color, bg }) => {
                        const rows = document.querySelectorAll('[class*="breakupRow"]:not([class*="Values"]):not([class*="Label"])');
                        for (const row of rows) {
                            const label = row.querySelector('[class*="breakupRowLabel"]');
                            if (label && label.textContent.trim() === "Employer's ESI Contribution") {
                                row.style.border = `3px solid ${color}`;
                                row.style.borderRadius = '4px';
                                row.style.padding = '2px';
                                row.style.backgroundColor = bg;
                            }
                        }
                    }, { color, bg });

                    await takeESICScreenshot(page, `ESIC_${num}_${testSet.label}_${catShort}_${level}_${location}`);
                    expect(esiMatch).toBeTruthy();
                    console.log(`✅ Scenario ${num} complete\n`);
                });
            }
        }
    }
}
for (const testSet of testSets) {
    for (const category of categories) {
        for (const level of levels) {
            for (const location of locationList) {
                const num = scenarioCount++;
                const catShort = category.replace('Non Sales - Technology or Product', 'NS_Tech')
                                         .replace('Non Sales - Rest', 'NS_Rest')
                                         .replace('Sales & AM', 'Sales_AM');

                test(`Scenario : ${num} | ESIC | ${testSet.label} | Category: ${category} | Level: ${level} | Location: ${location}`, async ({ page }) => {
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
                    const perfInput2 = page.getByRole('textbox', { name: 'e.g. 500000 or' }).nth(1);
                    await perfInput2.fill('2000');
                    await page.waitForTimeout(500);
                    console.log('✅ Entered Annual Performance Pay: ₹2000');

                    await user.clickCalculateSalaryBreakup();

                    // Capture compensation breakup
                    const breakup = await user.captureAndPrintCompensationBreakup();

                    // Get Total Earning from Net Pay section
                    const totalEarning = await page.evaluate(() => {
                        const allElements = document.querySelectorAll('*');
                        for (const el of allElements) {
                            if (el.children.length === 0 && el.textContent.trim() === 'Total Earning') {
                                const row = el.closest('div');
                                if (row) {
                                    const sibling = row.querySelector('span') || row.nextElementSibling;
                                    if (sibling) return sibling.textContent.trim();
                                }
                                const parent = el.parentElement;
                                const spans = parent.querySelectorAll('span');
                                for (const s of spans) {
                                    if (s.textContent.includes('₹')) return s.textContent.trim();
                                }
                            }
                        }
                        return '0';
                    });

                    const totalEarningNum = parseCurrency(totalEarning);
                    const expectedESI = calculateESI(totalEarningNum);
                    const expectedESIYearly = expectedESI * 12;

                    const actualESIMonthly = parseCurrency(breakup["Employer's ESI Contribution"]?.monthly);
                    const actualESIYearly = parseCurrency(breakup["Employer's ESI Contribution"]?.perAnnum);

                    const monthlyMatch = actualESIMonthly === expectedESI;
                    const yearlyMatch = actualESIYearly === expectedESIYearly;
                    const esiMatch = monthlyMatch && yearlyMatch;

                    console.log(`\n🔍 ESIC VALIDATION (${testSet.label}):`);
                    console.log(`   Total Earning (Gross Monthly): ₹${totalEarningNum.toLocaleString('en-IN')} ${totalEarningNum <= 21000 ? '(<= 21,000 → ESI applies)' : '(> 21,000 → ESI = 0)'}`);
                    console.log(`   ESI Monthly: Expected ₹${expectedESI.toLocaleString('en-IN')} | Actual ₹${actualESIMonthly.toLocaleString('en-IN')} → ${monthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
                    console.log(`   ESI Yearly : Expected ₹${expectedESIYearly.toLocaleString('en-IN')} | Actual ₹${actualESIYearly.toLocaleString('en-IN')} → ${yearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

                    // Highlight ESI row
                    const color = esiMatch ? '#607D8B' : 'red';
                    const bg = esiMatch ? 'rgba(96, 125, 139, 0.08)' : 'rgba(255, 0, 0, 0.08)';
                    await page.evaluate(({ color, bg }) => {
                        const rows = document.querySelectorAll('[class*="breakupRow"]:not([class*="Values"]):not([class*="Label"])');
                        for (const row of rows) {
                            const label = row.querySelector('[class*="breakupRowLabel"]');
                            if (label && label.textContent.trim() === "Employer's ESI Contribution") {
                                row.style.border = `3px solid ${color}`;
                                row.style.borderRadius = '4px';
                                row.style.padding = '2px';
                                row.style.backgroundColor = bg;
                            }
                        }
                    }, { color, bg });

                    await takeESICScreenshot(page, `ESIC_${num}_${testSet.label}_${catShort}_${level}_${location}`);
                    expect(esiMatch).toBeTruthy();
                    console.log(`✅ Scenario ${num} complete\n`);
                });
            }
        }
    }
}
