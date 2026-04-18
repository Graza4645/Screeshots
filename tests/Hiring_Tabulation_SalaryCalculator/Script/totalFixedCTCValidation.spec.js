/**
 * @author Md Noushad Ansari
 * Salary Calculator - Total Fixed (A) & Total Cost to Company (A+B) Validation
 *
 * Total Fixed (A) = Basic + HRA + Statutory Bonus + Meal Allowance + Vehicle Maintenance
 *                 + Driver Salary + Mobile Allowance + Special Allowance + LTA
 *                 + Employer's PF Contribution + Employer's ESI Contribution
 *
 * Total CTC (A+B) = Total Fixed (A) + Performance and Productivity Incentive (B)
 */

import SalaryCalculatorPage from '../PageObject/SalaryCalculatorPage.js';
import { test, expect } from '@playwright/test';
import { validdata, categories, levels, locations } from '../TestData/testData.js';
import fs from 'fs';
import path from 'path';

const TF_DIR = path.resolve('tests/Hiring_Tabulation_SalaryCalculator/screenshots/TotalFixedCTC');
if (!fs.existsSync(TF_DIR)) fs.mkdirSync(TF_DIR, { recursive: true });

async function takeTFScreenshot(page, name) {
    const files = fs.readdirSync(TF_DIR);
    files.filter(f => f.startsWith(name)).forEach(f => fs.unlinkSync(path.join(TF_DIR, f)));
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${ts}.png`;

    // Increase viewport for higher resolution capture
    const originalViewport = page.viewportSize();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(300);

    // Zoom out + crisp text for HD quality
    await page.evaluate(() => {
        document.body.style.zoom = '0.7';
        document.body.style.webkitFontSmoothing = 'antialiased';
        document.body.style.textRendering = 'optimizeLegibility';
    });
    await page.waitForTimeout(500);

    // scale: 'css' captures at device pixel ratio for sharper images
    await page.screenshot({ path: path.join(TF_DIR, filename), fullPage: true, scale: 'css' });

    // Restore original settings
    await page.evaluate(() => {
        document.body.style.zoom = '1';
        document.body.style.webkitFontSmoothing = '';
        document.body.style.textRendering = '';
    });
    await page.setViewportSize(originalViewport);
    await page.waitForTimeout(300);

    console.log(`📸 HD TotalFixed/CTC Screenshot: screenshots/TotalFixedCTC/${filename}`);
}

function parseCurrency(str) {
    if (!str || str === '-') return 0;
    return Number(str.replace(/[₹,\s]/g, ''));
}

const components = [
    'Basic', 'HRA', 'Statutory Bonus', 'Meal Allowance',
    'Vehicle Maintenance', 'Driver Salary', 'Mobile Allowance',
    'Special Allowance', 'LTA',
    "Employer's PF Contribution", "Employer's ESI Contribution"
];

const locationList = locations;
const annualFixed = '499999';
const annualPerfPay = '2000';
let scenarioCount = 1;

for (const category of categories) {
    for (const level of levels) {
        for (const location of locationList) {
            const num = scenarioCount++;
            const catShort = category.replace('Non Sales - Technology or Product', 'NS_Tech')
                                     .replace('Non Sales - Rest', 'NS_Rest')
                                     .replace('Sales & AM', 'Sales_AM');

            test(`Scenario : ${num} | TotalFixed+CTC | Category: ${category} | Level: ${level} | Location: ${location}`, async ({ page }) => {
                test.setTimeout(120000);
                const user = new SalaryCalculatorPage(page, validdata);
                await user.URL();
                await user.login();
                await user.navigateToSalaryCalculator();

                await user.selectCategory(category);
                await user.selectLevel(level);
                await user.selectLocation(location);
                await user.enterAnnualFixed(annualFixed);

                // Fill Annual Performance Pay
                const perfInput = page.getByRole('textbox', { name: 'e.g. 500000 or' }).nth(1);
                await perfInput.fill(annualPerfPay);
                await page.waitForTimeout(500);

                await user.clickCalculateSalaryBreakup();
                const breakup = await user.captureAndPrintCompensationBreakup();

                // ─── Total Benefits = Gratuity + GMC & GPA + GTLI ────────
                const gratuityM = parseCurrency(breakup["Employer's Gratuity Contribution"]?.monthly);
                const gmcM = parseCurrency(breakup['GMC & GPA Premium']?.monthly);
                const gtliM = parseCurrency(breakup['GTLI Premium']?.monthly);
                const expectedTBMonthly = gratuityM + gmcM + gtliM;
                const actualTBMonthly = parseCurrency(breakup['Total Benefits']?.monthly);

                const gratuityY = parseCurrency(breakup["Employer's Gratuity Contribution"]?.perAnnum);
                const gmcY = parseCurrency(breakup['GMC & GPA Premium']?.perAnnum);
                const gtliY = parseCurrency(breakup['GTLI Premium']?.perAnnum);
                const expectedTBYearly = gratuityY + gmcY + gtliY;
                const actualTBYearly = parseCurrency(breakup['Total Benefits']?.perAnnum);

                const tbMonthlyMatch = actualTBMonthly === expectedTBMonthly;
                const tbYearlyMatch = actualTBYearly === expectedTBYearly;
                const totalBenefitsMatch = tbMonthlyMatch && tbYearlyMatch;

                console.log(`🔍 TOTAL BENEFITS VALIDATION:`);
                console.log(`   = Gratuity(₹${gratuityM}) + GMC(₹${gmcM}) + GTLI(₹${gtliM}) = ₹${expectedTBMonthly}`);
                console.log(`   TB Monthly: Expected ₹${expectedTBMonthly.toLocaleString('en-IN')} | Actual ₹${actualTBMonthly.toLocaleString('en-IN')} → ${tbMonthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
                console.log(`   TB Yearly : Expected ₹${expectedTBYearly.toLocaleString('en-IN')} | Actual ₹${actualTBYearly.toLocaleString('en-IN')} → ${tbYearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

                // ─── Total Fixed (A) = sum of 11 components ──────────────
                let expectedTFMonthly = 0;
                let expectedTFYearly = 0;
                console.log(`\n🔍 TOTAL FIXED (A) VALIDATION:`);
                for (const comp of components) {
                    const m = parseCurrency(breakup[comp]?.monthly);
                    const y = parseCurrency(breakup[comp]?.perAnnum);
                    expectedTFMonthly += m;
                    expectedTFYearly += y;
                    console.log(`   + ${comp.padEnd(35)} Monthly: ₹${m.toLocaleString('en-IN').padEnd(10)} Yearly: ₹${y.toLocaleString('en-IN')}`);
                }

                const actualTFMonthly = parseCurrency(breakup['Total Fixed (A)']?.monthly);
                const actualTFYearly = parseCurrency(breakup['Total Fixed (A)']?.perAnnum);

                const tfMonthlyMatch = actualTFMonthly === expectedTFMonthly;
                const tfYearlyMatch = actualTFYearly === expectedTFYearly;
                const totalFixedMatch = tfMonthlyMatch && tfYearlyMatch;

                console.log(`   ─────────────────────────────────────────────────`);
                console.log(`   = Total Fixed (A) Monthly: Expected ₹${expectedTFMonthly.toLocaleString('en-IN')} | Actual ₹${actualTFMonthly.toLocaleString('en-IN')} → ${tfMonthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
                console.log(`   = Total Fixed (A) Yearly : Expected ₹${expectedTFYearly.toLocaleString('en-IN')} | Actual ₹${actualTFYearly.toLocaleString('en-IN')} → ${tfYearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

                // ─── Total CTC (A+B) = Total Fixed (A) + Perf Incentive (B) ──
                const perfMonthly = parseCurrency(breakup['Performance and Productivity Incentive (B)']?.monthly);
                const perfYearly = parseCurrency(breakup['Performance and Productivity Incentive (B)']?.perAnnum);

                const expectedCTCMonthly = actualTFMonthly + perfMonthly;
                const expectedCTCYearly = actualTFYearly + perfYearly;

                const actualCTCMonthly = parseCurrency(breakup['Total Cost to Company (A+B)']?.monthly);
                const actualCTCYearly = parseCurrency(breakup['Total Cost to Company (A+B)']?.perAnnum);

                const ctcMonthlyMatch = actualCTCMonthly === expectedCTCMonthly;
                const ctcYearlyMatch = actualCTCYearly === expectedCTCYearly;
                const totalCTCMatch = ctcMonthlyMatch && ctcYearlyMatch;

                console.log(`🔍 TOTAL CTC (A+B) VALIDATION:`);
                console.log(`   Total Fixed (A): ₹${actualTFMonthly.toLocaleString('en-IN')} + Perf Incentive (B): ₹${perfMonthly.toLocaleString('en-IN')}`);
                console.log(`   CTC Monthly: Expected ₹${expectedCTCMonthly.toLocaleString('en-IN')} | Actual ₹${actualCTCMonthly.toLocaleString('en-IN')} → ${ctcMonthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
                console.log(`   CTC Yearly : Expected ₹${expectedCTCYearly.toLocaleString('en-IN')} | Actual ₹${actualCTCYearly.toLocaleString('en-IN')} → ${ctcYearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

                // ─── Highlight ────────────────────────────────────────────
                const tbColor = totalBenefitsMatch ? '#FFD700' : 'red';
                const tbBg = totalBenefitsMatch ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 0, 0, 0.08)';
                const tfColor = totalFixedMatch ? '#1565C0' : 'red';
                const tfBg = totalFixedMatch ? 'rgba(21, 101, 192, 0.1)' : 'rgba(255, 0, 0, 0.08)';
                const ctcColor = totalCTCMatch ? '#6A1B9A' : 'red';
                const ctcBg = totalCTCMatch ? 'rgba(106, 27, 154, 0.1)' : 'rgba(255, 0, 0, 0.08)';

                await page.evaluate(({ components, tfColor, tfBg, ctcColor, ctcBg, tbColor, tbBg }) => {
                    const benefitsComponents = ["Employer's Gratuity Contribution", 'GMC & GPA Premium', 'GTLI Premium'];

                    // Highlight component rows
                    const rows = document.querySelectorAll('[class*="breakupRow"]:not([class*="Values"]):not([class*="Label"])');
                    for (const row of rows) {
                        const label = row.querySelector('[class*="breakupRowLabel"]');
                        if (label) {
                            const text = label.textContent.trim();
                            // Total Fixed components → blue left border
                            if (components.includes(text)) {
                                row.style.borderLeft = `5px solid ${tfColor}`;
                                row.style.backgroundColor = tfBg;
                            }
                            // Total Benefits components → gold left border + arrow
                            if (benefitsComponents.includes(text)) {
                                row.style.borderRight = `5px solid ${tbColor}`;
                                row.style.backgroundColor = tbBg;
                                const arrow = document.createElement('span');
                                arrow.textContent = ' → Total Benefits';
                                arrow.style.color = tbColor;
                                arrow.style.fontWeight = 'bold';
                                arrow.style.fontSize = '10px';
                                label.appendChild(arrow);
                            }
                        }
                    }

                    // Highlight summary rows
                    const hlRows = document.querySelectorAll('[class*="breakupHighlightInner"]');
                    for (const row of hlRows) {
                        const label = row.querySelector('[class*="breakupHighlightLabel"]');
                        if (label) {
                            const text = label.textContent.trim();
                            if (text === 'Total Fixed (A)') {
                                row.style.border = `3px solid ${tfColor}`;
                                row.style.borderRadius = '4px';
                                row.style.backgroundColor = tfBg;
                                const arrow = document.createElement('span');
                                arrow.textContent = ' ← sum of 11 components';
                                arrow.style.color = tfColor;
                                arrow.style.fontWeight = 'bold';
                                arrow.style.fontSize = '10px';
                                label.appendChild(arrow);
                            }
                            if (text === 'Total Cost to Company (A+B)') {
                                row.style.border = `3px solid ${ctcColor}`;
                                row.style.borderRadius = '4px';
                                row.style.backgroundColor = ctcBg;
                                const arrow = document.createElement('span');
                                arrow.textContent = ' ← Total Fixed(A) + Perf Incentive(B)';
                                arrow.style.color = ctcColor;
                                arrow.style.fontWeight = 'bold';
                                arrow.style.fontSize = '10px';
                                label.appendChild(arrow);
                            }
                            if (text === 'Total Benefits') {
                                row.style.border = `3px solid ${tbColor}`;
                                row.style.borderRadius = '4px';
                                row.style.backgroundColor = tbBg;
                                const arrow = document.createElement('span');
                                arrow.textContent = ' ← Gratuity + GMC + GTLI';
                                arrow.style.color = tbColor;
                                arrow.style.fontWeight = 'bold';
                                arrow.style.fontSize = '10px';
                                label.appendChild(arrow);
                            }
                        }
                    }
                }, { components, tfColor, tfBg, ctcColor, ctcBg, tbColor, tbBg });

                await takeTFScreenshot(page, `TF_CTC_${num}_${catShort}_${level}_${location}`);
                expect(totalFixedMatch).toBeTruthy();
                expect(totalCTCMatch).toBeTruthy();
                expect(totalBenefitsMatch).toBeTruthy();
                console.log(`✅ Scenario ${num} complete\n`);
            });
        }
    }
}
