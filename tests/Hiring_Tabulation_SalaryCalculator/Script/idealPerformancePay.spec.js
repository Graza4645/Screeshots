/**
 * @author Md Noushad Ansari
 * Salary Calculator - Ideal Performance Pay Validation
 * 
 * Validates the "Ideal Performance Pay" message for all Category × Level combinations.
 * - If percentage exists → message shows "Ideal Performance Pay for this salary is ₹X"
 *   where X = Annual Fixed × percentage. Extract and validate the amount.
 * - If NA → message shows "Ideal Performance Pay Not Applicable"
 */

import SalaryCalculatorPage from '../PageObject/SalaryCalculatorPage.js';
import { test, expect } from '@playwright/test';
import { validdata } from '../TestData/testData.js';
import fs from 'fs';
import path from 'path';

// Separate screenshot folder for Ideal Performance Pay
const IDEAL_SCREENSHOT_DIR = path.resolve('tests/Hiring_Tabulation_SalaryCalculator/screenshots/IdealPerformancePay');
if (!fs.existsSync(IDEAL_SCREENSHOT_DIR)) fs.mkdirSync(IDEAL_SCREENSHOT_DIR, { recursive: true });

async function takeIdealScreenshot(page, scenarioName) {
    const files = fs.readdirSync(IDEAL_SCREENSHOT_DIR);
    files.filter(f => f.startsWith(scenarioName)).forEach(f => {
        fs.unlinkSync(path.join(IDEAL_SCREENSHOT_DIR, f));
    });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${scenarioName}_${timestamp}.png`;

    // Use CDP to set deviceScaleFactor to 2 for true Full HD (2x pixel density)
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 2,
        mobile: false,
    });
    await page.waitForTimeout(300);

    await page.evaluate(() => {
        document.body.style.webkitFontSmoothing = 'antialiased';
        document.body.style.textRendering = 'optimizeLegibility';
    });
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(IDEAL_SCREENSHOT_DIR, filename), fullPage: true });

    // Reset to original viewport
    await cdp.send('Emulation.clearDeviceMetricsOverride');
    await cdp.detach();
    await page.evaluate(() => {
        document.body.style.webkitFontSmoothing = '';
        document.body.style.textRendering = '';
    });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(300);

    console.log(`📸 Full HD Ideal Perf Pay Screenshot saved: screenshots/IdealPerfPay/${filename}`);
}

// ─── Ideal Performance Pay % mapping: Level → { category: percentage or null } ──

const idealPerfPayMap = {
    'LST': { 'Sales & AM': 40, 'Non Sales - Technology or Product': 30, 'Non Sales - Rest': 30 },
    'L10': { 'Sales & AM': 40, 'Non Sales - Technology or Product': 30, 'Non Sales - Rest': 30 },
    'L9':  { 'Sales & AM': 30, 'Non Sales - Technology or Product': 25, 'Non Sales - Rest': 25 },
    'L8':  { 'Sales & AM': 25, 'Non Sales - Technology or Product': 20, 'Non Sales - Rest': 20 },
    'L7':  { 'Sales & AM': null, 'Non Sales - Technology or Product': 15, 'Non Sales - Rest': 15 },
    'L6':  { 'Sales & AM': null, 'Non Sales - Technology or Product': 15, 'Non Sales - Rest': 15 },
    'L5':  { 'Sales & AM': null, 'Non Sales - Technology or Product': 15, 'Non Sales - Rest': 15 },
    'L4':  { 'Sales & AM': null, 'Non Sales - Technology or Product': 15, 'Non Sales - Rest': 15 },
    'L3':  { 'Sales & AM': null, 'Non Sales - Technology or Product': 12, 'Non Sales - Rest': 12 },
    'L2':  { 'Sales & AM': null, 'Non Sales - Technology or Product': 12, 'Non Sales - Rest': 12 },
    'L1':  { 'Sales & AM': null, 'Non Sales - Technology or Product': null, 'Non Sales - Rest': null },
};

const categories = ['Sales & AM', 'Non Sales - Technology or Product', 'Non Sales - Rest'];
const levels = Object.keys(idealPerfPayMap);
const defaultLocation = 'Bengaluru';
// const locations = ['Hyderabad', 'Jharkhand'];


export const locations = [
    'Ahmedabad', 'Bengaluru', 'Chennai', 'Delhi',
    'Hyderabad', 'Kolkata', 'Mumbai', 'Pune', 'Vadodara',
    'Andhra Pradesh', 'Haryana', 'Ernakulam', 'Bhopal',
    'Central Gujarat', 'Gujarat', 'Guntur', 'Indore',
    'Jaipur', 'Kerala', 'Kochi', 'Kolhapur', 'Bhiwandi',
    'Madurai', 'Gandhinagar', 'Mysore', 'Nagpur', 'Solapur',
    'Vijayawada', 'Tirupati', 'West - Ahmedabad', 'Trichy',
    'Trivandrum', 'Uttarakhand', 'Manesar', 'Meerut',
    'Mizoram', 'Mohali', 'Morbi', 'Nadiad', 'Noida',
    'North - Bilaspur', 'Patna', 'Pithampur', 'Raipur',
    'Rajkot', 'Ranchi', 'Sri City', 'Surat', 'Uluberia',
    'Vallam', 'Valsad', 'Wardha', 'Aligarh', 'Bahadurgarh',
    'Balasore', 'Bawal', 'Agartala', 'Bhubaneswar', 'Bhuj',
    'Binola', 'Chandigarh', 'Darbhanga', 'Dehradun',
    'Farukh Nagar Jahjjar', 'Gorakhpur', 'Gurgaon', 'Guwahati',
    'Haldwani', 'Hamirpur', 'Jamshedpur', 'Kalol', 'Kanpur',
    'Kurukshetra', 'Laksar', 'Jharkhand', 'Lucknow', 'Amritsar',
    'Goa', 'Karagpur', 'Faridabad', 'Punjab', 'Assam',
    'Zaheerabad', 'Ludhiana', 'Atali', 'Uttar Pradesh',
    'Haridwar', 'Krishnagiri', 'Moradabad', 'Aizawl', 'Bihar',
    'Orissa', 'Visakhapatnam', 'Barwani', 'Betul', 'Hathras',
    'Tanuku', 'Dhanbad', 'Agra', 'Muzaffarpur', 'Coimbatore',
    'Mangalore', 'Mathura', 'Vizag', 'Srinagar', 'Jammu',
    'Imphal', 'Himachal Pradesh', 'Ratlam', 'Sonipat', 'Jind',
    'Kannur', 'Siliguri', 'Sambalpur', 'Saharanpur', 'Jabalpur',
    'Bharuch', 'Bareilly', 'Prayagraj', 'Rajahmundry', 'Kota',
    'Bilaspur', 'Salem', 'Kottayam', 'Thrissur', 'Hosur',
    'Pantnagar', 'Waluj', 'Alwar'
];


const defaultAnnualFixed = '500000';
const performancePay = '10000000'; // 1 crore — large enough to trigger the message

// ─── Helper: Parse currency from message like "₹2,00,000" → 200000 ──────────

function parseCurrency(str) {
    if (!str) return 0;
    return Number(str.replace(/[₹,\s]/g, ''));
}

// ─── Generate tests for every Category × Level ───────────────────────────────

let scenarioCount = 1;

for (const category of categories) {
    for (const level of levels) {
        for (const location of locations) {
        const num = scenarioCount++;
        const percentage = idealPerfPayMap[level][category];
        const isNA = percentage === null;
        const catShort = category.replace('Non Sales - Technology or Product', 'NS_Tech')
                                 .replace('Non Sales - Rest', 'NS_Rest')
                                 .replace('Sales & AM', 'Sales_AM');

        test(`Scenario : ${num} | Ideal Perf Pay | Category: ${category} | Level: ${level} | Location: ${location}`, async ({ page }) => {
            test.setTimeout(120000);
            const user = new SalaryCalculatorPage(page, validdata);
            await user.URL();
            await user.login();
            await user.navigateToSalaryCalculator();

            // Fill form
            await user.selectCategory(category);
            await user.selectLevel(level);
            await user.selectLocation(location);
            await user.enterAnnualFixed(defaultAnnualFixed);

            // Enter Annual Performance Pay = 1 crore
            const perfInput = page.getByRole('textbox', { name: 'e.g. 500000 or' }).nth(1);
            await perfInput.fill(performancePay);
            await page.waitForTimeout(2000);

            // Capture the Ideal Performance Pay message from DOM
            const idealMessage = await page.evaluate(() => {
                const allElements = document.querySelectorAll('*');
                for (const el of allElements) {
                    const text = el.textContent.trim();
                    if (el.children.length === 0 && text.includes('Ideal Performance Pay')) {
                        return text;
                    }
                }
                return '';
            });

            console.log(`\n🔹 Scenario ${num}: ${category} + ${level}`);
            console.log(`   Message: "${idealMessage}"`);

            if (isNA) {
                // ─── NA case: expect "Not Applicable" ─────────────────────
                expect(idealMessage).toContain('Not Applicable');
                console.log(`   Expected: Not Applicable → ✅ PASS`);

                // Highlight message in RED (NA = no ideal pay)
                await page.evaluate(() => {
                    const allElements = document.querySelectorAll('*');
                    for (const el of allElements) {
                        if (el.children.length === 0 && el.textContent.trim().includes('Ideal Performance Pay')) {
                            el.style.border = '3px solid orange';
                            el.style.borderRadius = '4px';
                            el.style.padding = '2px';
                            el.style.backgroundColor = 'rgba(255, 165, 0, 0.1)';
                        }
                    }
                });
            } else {
                // ─── Percentage case: extract amount and validate ──────────
                const expectedIdealAmount = Math.round(Number(defaultAnnualFixed) * percentage / 100);

                // Extract amount from message like "Ideal Performance Pay for this salary is ₹2,00,000(two lakh)"
                const amountMatch = idealMessage.match(/₹[\d,]+/);
                expect(amountMatch).not.toBeNull();

                const actualIdealAmount = parseCurrency(amountMatch[0]);

                const match = actualIdealAmount === expectedIdealAmount;
                console.log(`   Expected: ${percentage}% of ₹${Number(defaultAnnualFixed).toLocaleString('en-IN')} = ₹${expectedIdealAmount.toLocaleString('en-IN')}`);
                console.log(`   Actual:   ₹${actualIdealAmount.toLocaleString('en-IN')}`);
                console.log(`   Result:   ${match ? '✅ PASS' : '❌ FAIL'}`);

                expect(match).toBeTruthy();

                // Highlight message: GREEN if pass, RED if fail
                const color = match ? 'green' : 'red';
                const bg = match ? 'rgba(0, 200, 0, 0.08)' : 'rgba(255, 0, 0, 0.08)';
                await page.evaluate(({ color, bg }) => {
                    const allElements = document.querySelectorAll('*');
                    for (const el of allElements) {
                        if (el.children.length === 0 && el.textContent.trim().includes('Ideal Performance Pay')) {
                            el.style.border = `3px solid ${color}`;
                            el.style.borderRadius = '4px';
                            el.style.padding = '2px';
                            el.style.backgroundColor = bg;
                        }
                    }
                }, { color, bg });
            }

            await takeIdealScreenshot(page, `IdealPerfPay_${num}_${catShort}_${level}_${location}`);
            console.log(`✅ Scenario ${num} complete\n`);
        });
        }
    }
}
