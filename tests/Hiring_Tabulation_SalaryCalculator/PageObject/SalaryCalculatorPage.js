/**
 * @author Md Noushad Ansari
 * Page Object — Salary Calculator
 */

import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { hraMetroCities, gmcGpaByLevel, gtliByLevel } from '../TestData/testData.js';

const SCREENSHOT_DIR = path.resolve('tests/Hiring_Tabulation_SalaryCalculator/screenshots/Functional');

export default class SalaryCalculatorPage {
    constructor(page, data) {
        this.page = page;
        this.data = data;
        this.usernameInput = page.getByRole('textbox');
        this.passwordInput = page.locator('input[type="password"]');
        this.continueButton = page.getByRole('button', { name: 'Continue' });
        this.loginButton = page.getByRole('button', { name: 'Login' });

        // Dropdowns: 0=Category, 1=Level, 2=Location, 3=Meal, 4=PF, 5=Vehicle
        this.categoryDropdown = page.locator('[class*="dropdownInput"]').nth(0);
        this.levelDropdown = page.locator('[class*="dropdownInput"]').nth(1);
        this.locationDropdown = page.locator('[class*="dropdownInput"]').nth(2);

        this.calculateBtn = page.getByRole('button', { name: 'Calculate Salary Breakup' });
        this.resetBtn = page.getByRole('button', { name: 'Reset' });

        if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    async takeScreenshot(scenarioName) {
        const files = fs.readdirSync(SCREENSHOT_DIR);
        files.filter(f => f.startsWith(scenarioName)).forEach(f => {
            fs.unlinkSync(path.join(SCREENSHOT_DIR, f));
        });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${scenarioName}_${timestamp}.png`;

        // Increase viewport for higher resolution capture
        const originalViewport = this.page.viewportSize();
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.page.waitForTimeout(300);

        // Zoom out + crisp text for HD quality
        await this.page.evaluate(() => {
            document.body.style.zoom = '0.7';
            document.body.style.webkitFontSmoothing = 'antialiased';
            document.body.style.textRendering = 'optimizeLegibility';
        });
        await this.page.waitForTimeout(500);

        // scale: 'css' captures at device pixel ratio for sharper images
        await this.page.screenshot({ path: path.join(SCREENSHOT_DIR, filename), fullPage: true, scale: 'css' });

        // Restore original settings
        await this.page.evaluate(() => {
            document.body.style.zoom = '1';
            document.body.style.webkitFontSmoothing = '';
            document.body.style.textRendering = '';
        });
        await this.page.setViewportSize(originalViewport);
        await this.page.waitForTimeout(300);

        console.log(`📸 HD Screenshot saved: ${filename}`);
    }

    async URL() { await this.page.goto(this.data.baseUrl); }

    async login(username = this.data.username, password = this.data.password) {
        await this.usernameInput.fill(username);
        await this.continueButton.click();
        await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.passwordInput.fill(password);
        await this.loginButton.click();
        await this.page.waitForTimeout(2000);
    }

    async navigateToSalaryCalculator() {
        await this.page.getByRole('button', { name: 'Salary Calculator' }).click();
        await this.page.waitForTimeout(1500);
        await expect(this.page.getByRole('heading', { name: 'Salary Calculator', level: 1 })).toBeVisible({ timeout: 5000 });
        console.log('✅ Navigated to Salary Calculator');
    }

    async selectDropdownOption(dropdown, optionText) {
        await dropdown.click();
        await this.page.waitForTimeout(500);
        await this.page.getByText(optionText, { exact: true }).click();
        await this.page.waitForTimeout(500);
    }

    async selectCategory(category) {
        await this.selectDropdownOption(this.categoryDropdown, category);
        console.log(`✅ Selected Category: ${category}`);
    }

    async selectLevel(level) {
        await this.selectDropdownOption(this.levelDropdown, level);
        console.log(`✅ Selected Level: ${level}`);
    }

    async selectLocation(location) {
        await this.selectDropdownOption(this.locationDropdown, location);
        console.log(`✅ Selected Location: ${location}`);
    }

    async enterAnnualFixed(amount) {
        const input = this.page.getByRole('textbox', { name: 'e.g. 500000 or' }).first();
        await input.waitFor({ state: 'visible', timeout: 5000 });
        await input.fill(amount);
        await this.page.waitForTimeout(500);
        console.log(`✅ Entered Annual Fixed: ₹${amount}`);
    }

    async clickCalculateSalaryBreakup() {
        await this.calculateBtn.click();
        await this.page.waitForTimeout(3000);
        console.log('✅ Clicked Calculate Salary Breakup');
    }

    async clickReset() {
        await this.resetBtn.click();
        await this.page.waitForTimeout(1000);
        console.log('✅ Clicked Reset');
    }

    async captureAndPrintCompensationBreakup() {
        console.log('\n═══════════════════════════════════════════════════════════════════════');
        console.log('                    COMPENSATION BREAKUP                               ');
        console.log('═══════════════════════════════════════════════════════════════════════');
        console.log(`  ${'Particulars'.padEnd(45)} | ${'Monthly'.padEnd(14)} | Per Annum`);
        console.log('───────────────────────────────────────────────────────────────────────');

        const breakupData = await this.page.evaluate(() => {
            const results = [];
            const rows = document.querySelectorAll('[class*="breakupRow"]:not([class*="Values"]):not([class*="Label"])');
            for (const row of rows) {
                const label = row.querySelector('[class*="breakupRowLabel"]');
                const valuesDiv = row.querySelector('[class*="breakupRowValues"]');
                if (label && valuesDiv) {
                    const spans = valuesDiv.querySelectorAll('span');
                    results.push({
                        name: label.textContent.trim(),
                        monthly: spans[0]?.textContent.trim() || '-',
                        perAnnum: spans[1]?.textContent.trim() || '-',
                        isHighlight: false
                    });
                }
            }
            const highlights = document.querySelectorAll('[class*="breakupHighlightInner"]');
            for (const row of highlights) {
                const label = row.querySelector('[class*="breakupHighlightLabel"]');
                const valuesDiv = row.querySelector('[class*="breakupHighlightValues"]');
                if (label && valuesDiv) {
                    const spans = valuesDiv.querySelectorAll('span');
                    results.push({
                        name: label.textContent.trim(),
                        monthly: spans[0]?.textContent.trim() || '-',
                        perAnnum: spans[1]?.textContent.trim() || '-',
                        isHighlight: true
                    });
                }
            }
            return results;
        });

        const results = {};
        for (const item of breakupData) {
            results[item.name] = { monthly: item.monthly, perAnnum: item.perAnnum };
            const prefix = item.isHighlight ? '>>>' : '   ';
            console.log(`${prefix} ${item.name.padEnd(44)} | ${item.monthly.padEnd(14)} | ${item.perAnnum}`);
        }

        console.log('═══════════════════════════════════════════════════════════════════════\n');
        return results;
    }

    /**
     * Parse currency string like "₹ 2,00,004" to number
     */
    parseCurrency(str) {
        if (!str || str === '-') return 0;
        return Number(str.replace(/[₹,\s]/g, ''));
    }

    /**
     * Validate Basic & HRA using Monthly-first calculation:
     *   Monthly Basic = round(Annual Fixed * 0.40 / 12)
     *   Yearly Basic  = Monthly Basic * 12
     *   Monthly HRA   = round(Monthly Basic * hraPercent)  (40% or 50% for metro)
     *   Yearly HRA    = Monthly HRA * 12
     * No tolerance — all values must match exactly.
     */
    validateBasicAndHRA(breakup, annualFixed, location) {
        const annualFixedNum = Number(annualFixed);

        // Step 1: Monthly Basic = round(40% of Annual Fixed / 12)
        const expectedMonthlyBasic = Math.round(annualFixedNum * 0.40 / 12);
        const actualMonthlyBasic = this.parseCurrency(breakup['Basic']?.monthly);

        // Step 2: Yearly Basic = Monthly Basic * 12
        const expectedYearlyBasic = expectedMonthlyBasic * 12;
        const actualYearlyBasic = this.parseCurrency(breakup['Basic']?.perAnnum);

        // Step 3: HRA calculation
        const isMetro = hraMetroCities.includes(location);
        const hraPercent = isMetro ? 0.50 : 0.40;

        // Step 4: Monthly HRA = round(Monthly Basic * hraPercent)
        const expectedMonthlyHRA = Math.round(actualMonthlyBasic * hraPercent);
        const actualMonthlyHRA = this.parseCurrency(breakup['HRA']?.monthly);

        // Step 5: Yearly HRA = Monthly HRA * 12
        const expectedYearlyHRA = expectedMonthlyHRA * 12;
        const actualYearlyHRA = this.parseCurrency(breakup['HRA']?.perAnnum);

        // Validate — exact match, no tolerance
        const basicMonthlyMatch = actualMonthlyBasic === expectedMonthlyBasic;
        const basicYearlyMatch = actualYearlyBasic === expectedYearlyBasic;
        const hraMonthlyMatch = actualMonthlyHRA === expectedMonthlyHRA;
        const hraYearlyMatch = actualYearlyHRA === expectedYearlyHRA;

        const basicMatch = basicMonthlyMatch && basicYearlyMatch;
        const hraMatch = hraMonthlyMatch && hraYearlyMatch;

        console.log('\n🔍 VALIDATION (exact match, no tolerance):');
        console.log(`   Annual Fixed: ₹${annualFixedNum.toLocaleString('en-IN')}`);
        console.log(`   Location: ${location} ${isMetro ? '(Metro - HRA 50%)' : '(Non-Metro - HRA 40%)'}`);
        console.log('');
        console.log(`   BASIC Monthly : Expected ₹${expectedMonthlyBasic.toLocaleString('en-IN')} | Actual ₹${actualMonthlyBasic.toLocaleString('en-IN')} → ${basicMonthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   BASIC Yearly  : Expected ₹${expectedYearlyBasic.toLocaleString('en-IN')} | Actual ₹${actualYearlyBasic.toLocaleString('en-IN')} → ${basicYearlyMatch ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   HRA Monthly   : Expected ₹${expectedMonthlyHRA.toLocaleString('en-IN')} | Actual ₹${actualMonthlyHRA.toLocaleString('en-IN')} → ${hraMonthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   HRA Yearly    : Expected ₹${expectedYearlyHRA.toLocaleString('en-IN')} | Actual ₹${actualYearlyHRA.toLocaleString('en-IN')} → ${hraYearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

        return { basicMatch, hraMatch };
    }

    /**
     * Validate GMC & GPA Premium and GTLI Premium (Per Annum) — depends on Level only
     */
    validateGmcGpaGtli(breakup, level) {
        const expectedGmcGpa = gmcGpaByLevel[level] ?? null;
        const expectedGtli = gtliByLevel[level] ?? null;
        const actualGmcGpa = this.parseCurrency(breakup['GMC & GPA Premium']?.perAnnum);
        const actualGtli = this.parseCurrency(breakup['GTLI Premium']?.perAnnum);

        const gmcGpaMatch = expectedGmcGpa !== null ? actualGmcGpa === expectedGmcGpa : true;
        const gtliMatch = expectedGtli !== null ? actualGtli === expectedGtli : true;

        console.log(`   GMC & GPA (PA): Expected ₹${(expectedGmcGpa ?? 'N/A').toLocaleString('en-IN')} | Actual ₹${actualGmcGpa.toLocaleString('en-IN')} → ${gmcGpaMatch ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   GTLI (PA)     : Expected ₹${(expectedGtli ?? 'N/A').toLocaleString('en-IN')} | Actual ₹${actualGtli.toLocaleString('en-IN')} → ${gtliMatch ? '✅ PASS' : '❌ FAIL'}\n`);

        return { gmcGpaMatch, gtliMatch };
    }

    /**
     * Validate Employer's Gratuity Contribution
     *   Monthly Gratuity = round(Monthly Basic × 4.81%)
     *   Yearly Gratuity  = Monthly Gratuity × 12
     * No tolerance — exact match required.
     */
    validateGratuity(breakup) {
        const actualMonthlyBasic = this.parseCurrency(breakup['Basic']?.monthly);
        const expectedMonthlyGratuity = Math.round(actualMonthlyBasic * 0.0481);
        const actualMonthlyGratuity = this.parseCurrency(breakup["Employer's Gratuity Contribution"]?.monthly);

        const expectedYearlyGratuity = expectedMonthlyGratuity * 12;
        const actualYearlyGratuity = this.parseCurrency(breakup["Employer's Gratuity Contribution"]?.perAnnum);

        const gratuityMonthlyMatch = actualMonthlyGratuity === expectedMonthlyGratuity;
        const gratuityYearlyMatch = actualYearlyGratuity === expectedYearlyGratuity;
        const gratuityMatch = gratuityMonthlyMatch && gratuityYearlyMatch;

        console.log(`   GRATUITY Monthly: Expected ₹${expectedMonthlyGratuity.toLocaleString('en-IN')} | Actual ₹${actualMonthlyGratuity.toLocaleString('en-IN')} → ${gratuityMonthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   GRATUITY Yearly : Expected ₹${expectedYearlyGratuity.toLocaleString('en-IN')} | Actual ₹${actualYearlyGratuity.toLocaleString('en-IN')} → ${gratuityYearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

        return { gratuityMatch };
    }

    /**
     * Validate Statutory Bonus
     *   If Monthly Basic <= 21000 → Statutory Bonus Monthly = 1750, Yearly = 21000
     *   If Monthly Basic > 21000  → Statutory Bonus Monthly = 0, Yearly = 0
     * No tolerance — exact match required.
     */
    validateStatutoryBonus(breakup) {
        const actualMonthlyBasic = this.parseCurrency(breakup['Basic']?.monthly);
        const expectedMonthlyBonus = actualMonthlyBasic <= 21000 ? 1750 : 0;
        const expectedYearlyBonus = expectedMonthlyBonus * 12;

        const actualMonthlyBonus = this.parseCurrency(breakup['Statutory Bonus']?.monthly);
        const actualYearlyBonus = this.parseCurrency(breakup['Statutory Bonus']?.perAnnum);

        const bonusMonthlyMatch = actualMonthlyBonus === expectedMonthlyBonus;
        const bonusYearlyMatch = actualYearlyBonus === expectedYearlyBonus;
        const statutoryBonusMatch = bonusMonthlyMatch && bonusYearlyMatch;

        console.log(`   STAT BONUS Rule : Monthly Basic ₹${actualMonthlyBasic.toLocaleString('en-IN')} ${actualMonthlyBasic <= 21000 ? '<= 21,000 → ₹1,750' : '> 21,000 → ₹0'}`);
        console.log(`   STAT BONUS Monthly: Expected ₹${expectedMonthlyBonus.toLocaleString('en-IN')} | Actual ₹${actualMonthlyBonus.toLocaleString('en-IN')} → ${bonusMonthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   STAT BONUS Yearly : Expected ₹${expectedYearlyBonus.toLocaleString('en-IN')} | Actual ₹${actualYearlyBonus.toLocaleString('en-IN')} → ${bonusYearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

        return { statutoryBonusMatch };
    }

    /**
     * Validate Mobile Allowance = ₹400/month, ₹4,800/year (fixed for all levels)
     */
    validateMobileAllowance(breakup) {
        const expectedMonthly = 400;
        const expectedYearly = 4800;
        const actualMonthly = this.parseCurrency(breakup['Mobile Allowance']?.monthly);
        const actualYearly = this.parseCurrency(breakup['Mobile Allowance']?.perAnnum);

        const monthlyMatch = actualMonthly === expectedMonthly;
        const yearlyMatch = actualYearly === expectedYearly;
        const mobileAllowanceMatch = monthlyMatch && yearlyMatch;

        console.log(`   MOBILE Monthly  : Expected ₹${expectedMonthly} | Actual ₹${actualMonthly} → ${monthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   MOBILE Yearly   : Expected ₹${expectedYearly.toLocaleString('en-IN')} | Actual ₹${actualYearly.toLocaleString('en-IN')} → ${yearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

        return { mobileAllowanceMatch };
    }

    /**
     * Validate Total Benefits = Gratuity + GMC & GPA + GTLI
     */
    validateTotalBenefits(breakup) {
        const gratuityM = this.parseCurrency(breakup["Employer's Gratuity Contribution"]?.monthly);
        const gmcM = this.parseCurrency(breakup['GMC & GPA Premium']?.monthly);
        const gtliM = this.parseCurrency(breakup['GTLI Premium']?.monthly);
        const expectedM = gratuityM + gmcM + gtliM;
        const actualM = this.parseCurrency(breakup['Total Benefits']?.monthly);

        const gratuityY = this.parseCurrency(breakup["Employer's Gratuity Contribution"]?.perAnnum);
        const gmcY = this.parseCurrency(breakup['GMC & GPA Premium']?.perAnnum);
        const gtliY = this.parseCurrency(breakup['GTLI Premium']?.perAnnum);
        const expectedY = gratuityY + gmcY + gtliY;
        const actualY = this.parseCurrency(breakup['Total Benefits']?.perAnnum);

        const monthlyMatch = actualM === expectedM;
        const yearlyMatch = actualY === expectedY;
        const totalBenefitsMatch = monthlyMatch && yearlyMatch;

        console.log(`   TOTAL BENEFITS = Gratuity(₹${gratuityM}) + GMC(₹${gmcM}) + GTLI(₹${gtliM}) = ₹${expectedM}`);
        console.log(`   TOTAL BENEFITS Monthly: Expected ₹${expectedM.toLocaleString('en-IN')} | Actual ₹${actualM.toLocaleString('en-IN')} → ${monthlyMatch ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   TOTAL BENEFITS Yearly : Expected ₹${expectedY.toLocaleString('en-IN')} | Actual ₹${actualY.toLocaleString('en-IN')} → ${yearlyMatch ? '✅ PASS' : '❌ FAIL'}\n`);

        return { totalBenefitsMatch };
    }

    /**
     * Highlight Basic, HRA, GMC & GPA, GTLI rows: GREEN if pass, RED if fail
     */
    async highlightRows(results) {
        // Each validation gets a unique color when PASS, RED when FAIL
        const passColors = {
            'Basic':                          { color: '#2196F3', bg: 'rgba(33, 150, 243, 0.08)' },   // Blue
            'HRA':                            { color: '#9C27B0', bg: 'rgba(156, 39, 176, 0.08)' },   // Purple
            'GMC & GPA Premium':              { color: '#FF9800', bg: 'rgba(255, 152, 0, 0.08)' },    // Orange
            'GTLI Premium':                   { color: '#009688', bg: 'rgba(0, 150, 136, 0.08)' },    // Teal
            "Employer's Gratuity Contribution": { color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.08)' },  // Green
            'Statutory Bonus':                { color: '#E91E63', bg: 'rgba(233, 30, 99, 0.08)' },    // Pink
            'Mobile Allowance':               { color: '#CDDC39', bg: 'rgba(205, 220, 57, 0.08)' },   // Lime
        };
        const failStyle = { color: 'red', bg: 'rgba(255, 0, 0, 0.08)' };

        const colorMap = {
            'Basic': results.basicMatch,
            'HRA': results.hraMatch,
            'GMC & GPA Premium': results.gmcGpaMatch,
            'GTLI Premium': results.gtliMatch,
            "Employer's Gratuity Contribution": results.gratuityMatch,
            'Statutory Bonus': results.statutoryBonusMatch,
            'Mobile Allowance': results.mobileAllowanceMatch,
        };

        // Performance Incentive color
        const perfColor = results.perfIncentiveMatch
            ? { color: '#00BFA5', bg: 'rgba(0, 191, 165, 0.12)' }   // Deep Teal
            : { color: 'red', bg: 'rgba(255, 0, 0, 0.08)' };

        const highlights = {};
        for (const [label, pass] of Object.entries(colorMap)) {
            highlights[label] = pass ? passColors[label] : failStyle;
        }
        // Add Performance Incentive highlight
        highlights['Performance and Productivity Incentive (B)'] = perfColor;

        console.log(`🎨 Highlighting: Basic=${results.basicMatch ? 'BLUE' : 'RED'}, HRA=${results.hraMatch ? 'PURPLE' : 'RED'}, GMC&GPA=${results.gmcGpaMatch ? 'ORANGE' : 'RED'}, GTLI=${results.gtliMatch ? 'TEAL' : 'RED'}, Gratuity=${results.gratuityMatch ? 'GREEN' : 'RED'}, StatBonus=${results.statutoryBonusMatch ? 'PINK' : 'RED'}`);

        await this.page.evaluate((highlights) => {
            const rows = document.querySelectorAll('[class*="breakupRow"]:not([class*="Values"]):not([class*="Label"])');
            for (const row of rows) {
                const label = row.querySelector('[class*="breakupRowLabel"]');
                if (label) {
                    const text = label.textContent.trim();
                    if (highlights[text]) {
                        row.style.border = `3px solid ${highlights[text].color}`;
                        row.style.borderRadius = '4px';
                        row.style.padding = '2px';
                        row.style.backgroundColor = highlights[text].bg;
                        if (highlights[text].borderLeft) {
                            row.style.borderLeft = highlights[text].borderLeft;
                        }
                    }
                }
            }
            // Also highlight Performance Incentive in highlight rows
            const hlRows = document.querySelectorAll('[class*="breakupHighlightInner"]');
            for (const row of hlRows) {
                const label = row.querySelector('[class*="breakupHighlightLabel"]');
                if (label) {
                    const text = label.textContent.trim();
                    if (text === 'Performance and Productivity Incentive (B)' && highlights['Performance and Productivity Incentive (B)']) {
                        const h = highlights['Performance and Productivity Incentive (B)'];
                        row.style.border = `3px solid ${h.color}`;
                        row.style.borderRadius = '4px';
                        row.style.padding = '2px';
                        row.style.backgroundColor = h.bg;
                        // Add arrow indicator
                        const arrow = document.createElement('span');
                        arrow.textContent = ' ← Annual Performance Pay';
                        arrow.style.color = h.color;
                        arrow.style.fontWeight = 'bold';
                        arrow.style.fontSize = '11px';
                        arrow.style.marginLeft = '8px';
                        label.appendChild(arrow);
                    }
                }
            }

            // Also highlight the Annual Performance Pay input field area
            const formFields = document.querySelectorAll('[class*="formField"]');
            for (const field of formFields) {
                if (field.textContent.includes('Annual Performance Pay')) {
                    const h = highlights['Performance and Productivity Incentive (B)'];
                    if (h) {
                        field.style.border = `3px solid ${h.color}`;
                        field.style.borderRadius = '4px';
                        field.style.backgroundColor = h.bg;
                        // Add arrow
                        const arrow = document.createElement('div');
                        arrow.textContent = '↓ maps to Performance and Productivity Incentive (B)';
                        arrow.style.color = h.color;
                        arrow.style.fontWeight = 'bold';
                        arrow.style.fontSize = '11px';
                        arrow.style.textAlign = 'center';
                        field.appendChild(arrow);
                    }
                    break;
                }
            }
        }, highlights);
    }

    /**
     * Remove highlights after screenshot
     */
    async removeHighlights() {
        await this.page.evaluate(() => {
            const rows = document.querySelectorAll('[class*="breakupRow"]:not([class*="Values"]):not([class*="Label"])');
            for (const row of rows) {
                row.style.border = '';
                row.style.borderRadius = '';
                row.style.padding = '';
                row.style.backgroundColor = '';
            }
        });
    }

    /**
     * Validate Performance and Productivity Incentive (B) = Annual Performance Pay input
     * Monthly = round(annualPerfPay / 12), Yearly = annualPerfPay
     */
    validatePerformanceIncentive(breakup, annualPerfPay) {
        const perfPayNum = Number(annualPerfPay) || 0;
        const expectedYearly = perfPayNum;
        const actualYearly = this.parseCurrency(breakup['Performance and Productivity Incentive (B)']?.perAnnum);

        const perfIncentiveMatch = actualYearly === expectedYearly;

        console.log(`   PERF INCENTIVE Input: ₹${perfPayNum.toLocaleString('en-IN')} (Annual Performance Pay)`);
        console.log(`   PERF INCENTIVE Yearly : Expected ₹${expectedYearly.toLocaleString('en-IN')} | Actual ₹${actualYearly.toLocaleString('en-IN')} → ${perfIncentiveMatch ? '✅ PASS' : '❌ FAIL'}\n`);

        return { perfIncentiveMatch };
    }

    /**
     * Full flow: fill form → calculate → capture → validate all → highlight → screenshot
     */
    async fullSalaryCalculatorFlow(category, level, location, annualFixed, screenshotName, annualPerfPay = '2000') {
        await this.selectCategory(category);
        await this.selectLevel(level);
        await this.selectLocation(location);
        await this.enterAnnualFixed(annualFixed);

        // Fill Annual Performance Pay
        const perfInput = this.page.getByRole('textbox', { name: 'e.g. 500000 or' }).nth(1);
        await perfInput.fill(annualPerfPay);
        await this.page.waitForTimeout(500);
        console.log(`✅ Entered Annual Performance Pay: ₹${annualPerfPay}`);

        await this.clickCalculateSalaryBreakup();

        const breakup = await this.captureAndPrintCompensationBreakup();
        const { basicMatch, hraMatch } = this.validateBasicAndHRA(breakup, annualFixed, location);
        const { gmcGpaMatch, gtliMatch } = this.validateGmcGpaGtli(breakup, level);
        const { gratuityMatch } = this.validateGratuity(breakup);
        const { statutoryBonusMatch } = this.validateStatutoryBonus(breakup);
        const { mobileAllowanceMatch } = this.validateMobileAllowance(breakup);
        const { perfIncentiveMatch } = this.validatePerformanceIncentive(breakup, annualPerfPay);

        const validation = { basicMatch, hraMatch, gmcGpaMatch, gtliMatch, gratuityMatch, statutoryBonusMatch, mobileAllowanceMatch, perfIncentiveMatch };

        await this.highlightRows(validation);
        await this.takeScreenshot(screenshotName);
        await this.removeHighlights();

        return { breakup, validation };
    }
}
