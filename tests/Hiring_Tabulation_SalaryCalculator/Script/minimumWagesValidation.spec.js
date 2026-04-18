/**
 * @author Md Noushad Ansari
 * Salary Calculator - Minimum Wages Validation
 *
 * Formula: Minimum Wages = Total Earning - (Statutory Bonus + Mobile Allowance + LTA)
 * Thresholds (Ahmedabad):
 *   L1, L2, L3, L4 → ₹13,195
 *   L5, L6, L7, L8, L9, L10, LST → ₹13,507
 *
 * Approach 1: Annual Fixed = ₹5,00,000 → Min Wages >= threshold → PASS
 * Approach 2: Annual Fixed = threshold amount → Min Wages < threshold → error message
 */

import SalaryCalculatorPage from '../PageObject/SalaryCalculatorPage.js';
import { test, expect } from '@playwright/test';
import { validdata, categories, levels, locations } from '../TestData/testData.js';
import fs from 'fs';
import path from 'path';

const MW_DIR = path.resolve('tests/Hiring_Tabulation_SalaryCalculator/screenshots/MinimumWages');
if (!fs.existsSync(MW_DIR)) fs.mkdirSync(MW_DIR, { recursive: true });

async function takeMWScreenshot(page, name) {
    const files = fs.readdirSync(MW_DIR);
    files.filter(f => f.startsWith(name)).forEach(f => fs.unlinkSync(path.join(MW_DIR, f)));
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
    await page.screenshot({ path: path.join(MW_DIR, filename), fullPage: true, scale: 'css' });

    await page.evaluate(() => {
        document.body.style.zoom = '1';
        document.body.style.webkitFontSmoothing = '';
        document.body.style.textRendering = '';
    });
    await page.setViewportSize(originalViewport);
    await page.waitForTimeout(300);

    console.log(`📸 HD MinWages Screenshot: screenshots/MinimumWages/${filename}`);
}

function parseCurrency(str) {
    if (!str || str === '-') return 0;
    return Number(str.replace(/[₹,\s]/g, ''));
}

function getThreshold(level) {
    const lowLevels = ['L1', 'L2', 'L3', 'L4'];
    return lowLevels.includes(level) ? 13195 : 13507;
}

let scenarioCount = 1;

// ─── APPROACH 1: Normal Flow — Annual Fixed = ₹5,00,000 → Min Wages >= threshold ──

for (const category of categories) {
    for (const level of levels) {
        for (const location of locations) {
        const num = scenarioCount++;
        const catShort = category.replace('Non Sales - Technology or Product', 'NS_Tech')
                                 .replace('Non Sales - Rest', 'NS_Rest')
                                 .replace('Sales & AM', 'Sales_AM');

        test(`Scenario : ${num} | MinWages_Pass | Category: ${category} | Level: ${level} | Location: ${location}`, async ({ page }) => {
            test.setTimeout(120000);
            const user = new SalaryCalculatorPage(page, validdata);
            await user.URL();
            await user.login();
            await user.navigateToSalaryCalculator();

            await user.selectCategory(category);
            await user.selectLevel(level);
            await user.selectLocation(location);
            await user.enterAnnualFixed('499990');

                    // Enter Annual Performance Pay
                    const perfInput1 = page.getByRole('textbox', { name: 'e.g. 500000 or' }).nth(1);
                    await perfInput1.fill('2000');
                    await page.waitForTimeout(500);
                    console.log('✅ Entered Annual Performance Pay: ₹2000');

            await user.clickCalculateSalaryBreakup();

            const breakup = await user.captureAndPrintCompensationBreakup();

            // Get Total Earning from Net Pay section
            const totalEarning = await page.evaluate(() => {
                const spans = document.querySelectorAll('span');
                for (let i = 0; i < spans.length; i++) {
                    if (spans[i].textContent.trim() === 'Total Earning') {
                        const parent = spans[i].closest('div');
                        const valueSpan = parent?.querySelectorAll('span');
                        if (valueSpan && valueSpan.length >= 2) return valueSpan[1].textContent.trim();
                    }
                }
                // Fallback: search in div structure
                const allDivs = document.querySelectorAll('div');
                for (const div of allDivs) {
                    if (div.children.length === 0 && div.textContent.trim() === 'Total Earning') {
                        const sibling = div.parentElement?.querySelector('span');
                        if (sibling) return sibling.textContent.trim();
                    }
                }
                return '0';
            });

            const totalEarningNum = parseCurrency(totalEarning);
            const statBonus = parseCurrency(breakup['Statutory Bonus']?.monthly);
            const mobile = parseCurrency(breakup['Mobile Allowance']?.monthly);
            const lta = parseCurrency(breakup['LTA']?.monthly);

            const minWages = totalEarningNum - (statBonus + mobile + lta);
            const threshold = getThreshold(level);
            const minWagesPass = minWages >= threshold;

            console.log(`\n🔍 MINIMUM WAGES VALIDATION (Approach 1 - Pass):`);
            console.log(`   Total Earning: ₹${totalEarningNum.toLocaleString('en-IN')}`);
            console.log(`   Stat Bonus: ₹${statBonus} | Mobile: ₹${mobile} | LTA: ₹${lta}`);
            console.log(`   Min Wages = ${totalEarningNum} - (${statBonus} + ${mobile} + ${lta}) = ₹${minWages.toLocaleString('en-IN')}`);
            console.log(`   Threshold (${level}): ₹${threshold.toLocaleString('en-IN')}`);
            console.log(`   Result: ${minWagesPass ? '✅ PASS (>= threshold)' : '❌ FAIL (< threshold)'}\n`);

            await takeMWScreenshot(page, `MW_Pass_${num}_${catShort}_${level}_${location}`);
            expect(minWagesPass).toBeTruthy();
        });
    }
    }
}

// ─── APPROACH 2: Error Flow — Annual Fixed = threshold → error message expected ──

for (const category of categories) {
    for (const level of levels) {
        for (const location of locations) {
        const num = scenarioCount++;
        const catShort = category.replace('Non Sales - Technology or Product', 'NS_Tech')
                                 .replace('Non Sales - Rest', 'NS_Rest')
                                 .replace('Sales & AM', 'Sales_AM');
        const threshold = getThreshold(level);

        test(`Scenario : ${num} | MinWages_Error | Category: ${category} | Level: ${level} | AnnualFixed: ${threshold} | Location: ${location}`, async ({ page }) => {
            test.setTimeout(120000);
            const user = new SalaryCalculatorPage(page, validdata);
            await user.URL();
            await user.login();
            await user.navigateToSalaryCalculator();

            await user.selectCategory(category);
            await user.selectLevel(level);
            await user.selectLocation(location);
            await user.enterAnnualFixed(String(threshold));

                    // Enter Annual Performance Pay
                    const perfInput2 = page.getByRole('textbox', { name: 'e.g. 500000 or' }).nth(1);
                    await perfInput2.fill('2000');
                    await page.waitForTimeout(500);
                    console.log('✅ Entered Annual Performance Pay: ₹2000');

            await user.clickCalculateSalaryBreakup();

            // Wait for error popup to appear
            await page.waitForTimeout(3000);

            // Check for error popup with "Please increase Fixed Comp"
            let hasError = false;
            let errorText = '';

            try {
                const errorPopup = page.locator('text=Please increase Fixed Comp').first();
                await errorPopup.waitFor({ state: 'visible', timeout: 10000 });
                hasError = true;
                errorText = await errorPopup.textContent();
            } catch {
                // Fallback: check full page text
                const bodyText = await page.evaluate(() => document.body.innerText);
                if (bodyText.includes('Please increase Fixed Comp')) {
                    hasError = true;
                    errorText = bodyText.split('\n').find(l => l.includes('Please increase Fixed Comp')) || '';
                }
            }

            console.log(`\n🔍 MINIMUM WAGES VALIDATION (Approach 2 - Error):`);
            console.log(`   Annual Fixed: ₹${threshold.toLocaleString('en-IN')} (= threshold)`);
            console.log(`   Level: ${level} | Threshold: ₹${threshold.toLocaleString('en-IN')}`);
            console.log(`   Error Popup Found: ${hasError ? '✅ YES' : '❌ NO'}`);
            console.log(`   Message: "${errorText || 'Not found'}"\n`);

            // Take screenshot WITH the error popup visible (before clicking OK)
            await takeMWScreenshot(page, `MW_Error_${num}_${catShort}_${level}_${location}`);

            // Now click OK to dismiss the popup
            try {
                const okBtn = page.getByText('OK', { exact: true });
                if (await okBtn.isVisible({ timeout: 3000 })) {
                    await okBtn.click();
                    await page.waitForTimeout(500);
                    console.log('   Clicked OK on alert popup');
                }
            } catch { /* no OK button */ }

            expect(hasError).toBeTruthy();
            console.log(`✅ Scenario ${num} complete\n`);
        });
    }
    }
}
