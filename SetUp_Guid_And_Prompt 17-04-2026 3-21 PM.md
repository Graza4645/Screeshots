# Kiro AI - Playwright Automation Framework Setup Guide & Master Prompt

> **Purpose:** This guide is a complete, step-by-step reference for setting up a Playwright POM automation framework using Kiro AI. Follow every section in order. Do NOT skip any step — including Jira MCP configuration.

---

## 🚀 Quick Start for New Users (Fresh Laptop Setup)

> **If you're setting up this project for the first time on your own laptop, follow these steps exactly in order. Estimated time: 10-15 minutes.**

### Step A: Install Prerequisites
```bash
# 1. Install Node.js v20+ (LTS) from https://nodejs.org
# 2. Verify installation:
node -v          # Must show v20 or higher
npm -v           # Must show v9 or higher
```

### Step B: Install Kiro AI
1. Download and install **Kiro AI** IDE from https://kiro.dev
2. Open Kiro and sign in

### Step C: Create Project Folder & Open in Kiro
1. Create a new empty folder on your Desktop (e.g., `PlaywrightAutomation`)
2. Open that folder in Kiro AI (File → Open Folder)

### Step D: Give This File to Kiro
1. Copy this entire `.md` file into your project folder
2. Open Kiro AI chat and type:
```
Read the provided .md file completely and implement everything as specified without missing any details.
```
3. Kiro will automatically:
   - Create all folders and files
   - Install npm dependencies
   - Install Playwright Chromium browser
   - Set up MCP configs, auto-heal hook, and all test modules

### Step E: Configure Your App Details
After Kiro finishes setup, update these files with YOUR application details:

**File: `tests/Login/testData/loginData.js`**
```javascript
appUrl: 'https://YOUR-APP-URL-HERE',
validUser: {
  username: 'YOUR-USERNAME',
  password: 'YOUR-PASSWORD',
},
```

**File: `.kiro/settings/mcp.json`** (Jira section)
```json
"ATLASSIAN_SITE_NAME": "YOUR-SITE.atlassian.net",
"ATLASSIAN_USER_EMAIL": "YOUR-EMAIL",
"ATLASSIAN_API_TOKEN": "YOUR-TOKEN"
```

### Step F: Verify Locators with MCP Playwright
Before running tests, ask Kiro to inspect your app's login page:
```
Navigate to https://YOUR-APP-URL and take a snapshot. Then update the LoginPage.js locators to match the actual page elements.
```

### Step G: Run Tests
```bash
# From Git Bash or terminal:
npx playwright test

# Or from Kiro chat:
# "Run all the login tests"
```

### Step H: If Tests Fail
- **If running through Kiro:** Auto-heal hook will fix and re-run automatically
- **If running from Git Bash:** Paste the failure output into Kiro chat — it will fix and re-run

### What You Get Out of the Box:
| Feature | Description |
|---|---|
| ✅ Page Object Model | Maintainable test structure with separate locators, scripts, and data |
| ✅ Auto-retry | Failed tests retry once locally, twice in CI |
| ✅ Auto-heal | Kiro agent detects failures, fixes code, re-runs failed tests |
| ✅ `--last-failed` | Re-run only previously failed tests |
| ✅ MCP Playwright | Inspect live pages to verify locators |
| ✅ MCP Jira | Fetch tickets and generate test scenarios |
| ✅ HTML reports | Screenshots, videos, and traces on failure |
| ✅ 12 npm scripts | Smoke, regression, per-module, debug, headed, report |

---

## Table of Contents

1. [Lessons Learned (Read First)](#lessons-learned-read-first)
2. [Pre-requisites Checklist](#pre-requisites-checklist)
3. [Step 1: MCP Server Configuration](#step-1-mcp-server-configuration)
4. [Step 2: Framework Structure](#step-2-framework-structure)
5. [Step 3: Important Coding Rules](#step-3-important-coding-rules)
6. [Step 4: Locator Strategy](#step-4-locator-strategy)
7. [Step 5: Test Writing Standards](#step-5-test-writing-standards)
8. [Step 6: Application Details (Fill Before Starting)](#step-6-application-details-fill-before-starting)
9. [Step 7: Jira Integration](#step-7-jira-integration)
10. [Step 8: What To Deliver (Checklist)](#step-8-what-to-deliver-checklist)
11. [Quick Reference Commands](#quick-reference-commands)
12. [Final File Structure](#final-file-structure)
13. [Step 9: Auto-Retry Configuration](#step-9-auto-retry-configuration)
14. [Step 10: Auto-Heal Hook Setup](#step-10-auto-heal-hook-setup)
15. [Step 11: Implemented Code (Actual Files)](#step-11-implemented-code-actual-files)
16. [Step 12: Test Execution Results](#step-12-test-execution-results)
17. [Additional Lessons Learned (Post-Implementation)](#additional-lessons-learned-post-implementation)
18. [Step 13: Allure Report Configuration](#step-13-allure-report-configuration)
19. [Step 14: GitHub Actions CI/CD Pipeline](#step-14-github-actions-cicd-pipeline)

---

## Lessons Learned (Read First)

These are real problems we faced. Read them so you don't repeat them.

| # | Problem We Faced | Root Cause | How To Fix |
|---|---|---|---|
| 1 | MCP Playwright not connecting | Node.js was v18 (needs v20+) | Always run `node -v` first. Must be v20+ |
| 2 | MCP Jira network error | Corporate proxy + TLS issue | Add `NODE_TLS_REJECT_UNAUTHORIZED=0` in Jira MCP env |
| 3 | Wrong npm package names | AI guessed package names | Use exact package names from this guide |
| 4 | Wrong import paths in tests | `../` vs `./` confusion | Follow the import path rules in Step 3 exactly |
| 5 | Locators not matching | Wrote locators without inspecting page | ALWAYS use MCP Playwright to inspect the page first |
| 6 | Multiple back-and-forth with AI | Vague initial prompt | Give all details in one structured prompt |
| 7 | PowerShell blocks npx on Windows | Execution policy restriction | Use `cmd /c "npx ..."` as fallback |
| 8 | Jira MCP was skipped | Marked as "optional" in guide | It is now REQUIRED — configure it in Step 1 |

---

## Pre-requisites Checklist

Run these commands in your terminal BEFORE doing anything else:

```bash
node -v          # MUST be v20+ (v22 or v24 recommended)
npm -v           # MUST be v9+
```

**If Node.js is below v20:** Stop here. Download and install LTS from https://nodejs.org first.

**Windows PowerShell issue:** If you see "running scripts is disabled on this system" error, use `cmd /c "command"` as a workaround for all npx commands. Example:
```bash
cmd /c "npx playwright test"
```

---

## Step 1: MCP Server Configuration

> **IMPORTANT:** Configure BOTH servers below. Do NOT skip Jira.

Create the file `.kiro/settings/mcp.json` in your project root with this exact content:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "disabled": false,
      "autoApprove": [
        "browser_snapshot",
        "browser_click",
        "browser_navigate",
        "browser_type"
      ]
    },
    "jira": {
      "command": "npx",
      "args": ["-y", "@aashari/mcp-server-atlassian-jira"],
      "env": {
        "ATLASSIAN_SITE_NAME": "REPLACE-WITH-YOUR-SITE.atlassian.net",
        "ATLASSIAN_USER_EMAIL": "REPLACE-WITH-YOUR-EMAIL",
        "ATLASSIAN_API_TOKEN": "REPLACE-WITH-YOUR-API-TOKEN",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      },
      "disabled": false,
      "timeout": 120000
    }
  }
}
```

### How to get your Jira API Token:
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a name (e.g., "Kiro MCP")
4. Copy the token and paste it in `ATLASSIAN_API_TOKEN` above

### What to replace:
| Placeholder | Replace With | Example |
|---|---|---|
| `REPLACE-WITH-YOUR-SITE.atlassian.net` | Your Jira site URL | `mycompany.atlassian.net` |
| `REPLACE-WITH-YOUR-EMAIL` | Your Atlassian login email | `john@mycompany.com` |
| `REPLACE-WITH-YOUR-API-TOKEN` | API token from step above | `ABCDxxxx1234xxxx` |

### Why `NODE_TLS_REJECT_UNAUTHORIZED=0`?
Corporate networks often have proxy/firewall that intercepts TLS. This setting bypasses certificate validation errors. Without it, Jira MCP will fail with network errors.

---

## Step 2: Framework Structure

The project follows the **Page Object Model (POM)** pattern. Every module has 3 folders:

```
tests/
  └── <ModuleName>/
       ├── PageObject/    ← POM classes (locators + action methods)
       ├── Script/        ← .spec.js test files
       └── testData/      ← Test data files (.js or .json or .csv)
```

**Example with two modules:**
```
tests/
  ├── Login/
  │   ├── PageObject/LoginPage.js
  │   ├── Script/login.spec.js
  │   └── testData/loginData.js
  └── SalaryCalculator/
      ├── PageObject/SalaryCalculatorPage.js
      ├── Script/salaryCalculator.spec.js
      └── testData/
          ├── salaryCalculatorData.js
          └── testScenarios.csv
```

---

## Step 3: Important Coding Rules

Follow these rules strictly. Breaking them causes import errors and test failures.

| Rule | Correct | Wrong |
|---|---|---|
| Module system | `const x = require('...')` (CommonJS) | `import x from '...'` (ES modules) |
| Test runner | `@playwright/test` | `jest`, `mocha`, or plain `playwright` |
| Import from Script/ to PageObject/ | `require('../PageObject/LoginPage')` | `require('./PageObject/LoginPage')` |
| Import from Script/ to testData/ | `require('../testData/loginData')` | `require('./testData/loginData')` |
| Cross-module import | `require('../../Login/PageObject/LoginPage')` | `require('./Login/PageObject/LoginPage')` |
| Run tests on Windows (if PowerShell blocked) | `cmd /c "npx playwright test"` | `npx playwright test` |

### Import Path Explanation:
Since spec files live inside `Script/` folder, they need `../` to go up one level to reach sibling folders `PageObject/` and `testData/`:
```
tests/Login/
  ├── PageObject/LoginPage.js      ← ../PageObject/LoginPage (from Script/)
  ├── Script/login.spec.js         ← YOU ARE HERE
  └── testData/loginData.js        ← ../testData/loginData (from Script/)
```

---

## Step 4: Locator Strategy

> **GOLDEN RULE:** Never guess locators. Always inspect the actual page first.

### Workflow (do this for every page):
1. Use MCP Playwright `browser_navigate` → go to the page URL
2. Use MCP Playwright `browser_snapshot` → see the page structure and element references
3. Write locators based on what you see in the snapshot
4. Use MCP Playwright `browser_click` / `browser_type` → test the locators work

### Preferred locator types (in order of priority):
```javascript
// 1. Role-based (best — accessible and stable)
page.getByRole('button', { name: 'Login' })
page.getByRole('textbox', { name: 'Username' })

// 2. Placeholder-based (good for input fields)
page.getByPlaceholder('Enter your email')

// 3. Label-based (good for form fields)
page.getByLabel('Password')

// 4. Test ID (good when added by developers)
page.getByTestId('submit-btn')

// 5. CSS selector (last resort)
page.locator('#username')
page.locator('.error-message')
```

---

## Step 5: Test Writing Standards

Every test file must follow these standards:

| Standard | Example |
|---|---|
| Group tests with `test.describe()` | `test.describe('Login Module', () => { ... })` |
| Setup with `test.beforeEach()` | Navigate to page, create page objects |
| Tag tests | `@smoke` for critical, `@regression` for full suite |
| Use TC IDs | `TC_LOGIN_001`, `TC_SALARY_003` |
| No hardcoded values | All data comes from `testData/` files |
| Proper assertions | Use `expect()` from `@playwright/test` |

### Test file template:
```javascript
const { test, expect } = require('@playwright/test');
const LoginPage = require('../PageObject/LoginPage');
const loginData = require('../testData/loginData');

test.describe('Login Module', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate(loginData.appUrl);
  });

  test('TC_LOGIN_001 - Valid login @smoke', async ({ page }) => {
    await loginPage.login(loginData.validUser.username, loginData.validUser.password);
    await expect(page).toHaveTitle(/Dashboard/i);
  });

  test('TC_LOGIN_002 - Invalid login shows error @regression', async ({ page }) => {
    await loginPage.login(loginData.invalidUser.username, loginData.invalidUser.password);
    expect(await loginPage.isErrorVisible()).toBeTruthy();
  });
});
```

---

## Step 6: Application Details (Fill Before Starting)

> **IMPORTANT:** Replace ALL placeholders below with your actual values before giving this to Kiro.

```
- URL: https://next-gen-eob-ui-qa.teamlease.com/
- Username: thr_recruiter                    
- Password: 12345                    
- Login type:  ← e.g., Keycloak two-step: username → Continue → password → Login
```

---

## Step 7: Jira Integration

> **This is NOT optional.** Configure Jira MCP in Step 1 first.

### How it works:
1. Provide a Jira ticket ID (e.g., `ANG-2377`)
2. Kiro fetches the ticket using MCP Jira: summary, description, acceptance criteria
3. Kiro generates test scenarios from the requirements
4. Scenarios are saved as CSV in the module's `testData/` folder

### Jira MCP Workflow:
```
Step 1: Fetch ticket
   → jira_get → /rest/api/3/issue/ANG-2377

Step 2: Extract from ticket
   → summary (what the feature does)
   → description (detailed requirements)
   → acceptance criteria (what to test)

Step 3: Generate test scenarios
   → Create CSV with columns: TC_ID, Scenario, Steps, ExpectedResult, Tags

Step 4: Save to testData/
   → tests/<ModuleName>/testData/testScenarios.csv
```

### Example CSV output:
```csv
TC_ID,Scenario,BasicSalary,HRA,DA,SpecialAllowance,ExpectedGross,Tags
TC_SALARY_001,Valid salary calculation,50000,20000,15000,10000,95000,@smoke
TC_SALARY_002,Minimum salary values,10000,5000,3000,2000,20000,@regression
TC_SALARY_003,Zero values for all fields,0,0,0,0,0,@regression
```

---

## Step 8: What To Deliver (Checklist)

Use this checklist to verify everything is done. ALL items are required.

| # | Deliverable | File Path | Status |
|---|---|---|---|
| 1 | MCP config (Playwright + Jira) | `.kiro/settings/mcp.json` | ✅ Done |
| 2 | Playwright config (with retry) | `playwright.config.js` | ✅ Done |
| 3 | Package.json with npm scripts | `package.json` | ✅ Done (12 scripts) |
| 4 | POM classes with verified locators | `tests/<Module>/PageObject/*.js` | ✅ Done |
| 5 | Test scripts with assertions | `tests/<Module>/Script/*.spec.js` | ✅ Done |
| 6 | Test data files | `tests/<Module>/testData/*.js` | ✅ Done |
| 7 | CSV test scenarios from Jira | `tests/<Module>/testData/testScenarios.csv` | ✅ Done |
| 8 | npm install completed | `node_modules/` exists | ✅ Done |
| 9 | Playwright browsers installed | `npx playwright install chromium` done | ✅ Done |
| 10 | Auto-retry configured | `playwright.config.js` retries: 1 (local), 2 (CI) | ✅ Done |
| 11 | Auto-heal hook | `.kiro/hooks/auto-heal-tests.kiro.hook` | ✅ Done |
| 12 | `--last-failed` npm scripts | `package.json` test:last-failed | ✅ Done |
| 13 | Allure reporter configured | `playwright.config.js` + `allure-playwright` | ✅ Done |
| 14 | Allure npm scripts | `package.json` report:allure | ✅ Done |
| 15 | GitHub Actions CI/CD pipeline | `.github/workflows/playwright-tests.yml` | ✅ Done |

---

## Quick Reference Commands

### Running Tests
```bash
npx playwright test                                    # Run all tests
npx playwright test tests/Login/Script/ --headed       # Run Login module (visible browser)
npx playwright test tests/SalaryCalculator/Script/     # Run Salary module
npx playwright test --grep @smoke                      # Run only smoke tests
npx playwright test --grep @regression                 # Run only regression tests
npx playwright test --last-failed                      # Re-run only previously failed tests
npx playwright test --last-failed --headed             # Re-run failed tests with visible browser
npx playwright test --debug                            # Run in debug mode
npx playwright show-report                             # Open HTML test report
```

### Using npm scripts
```bash
npm test                          # Run all tests
npm run test:headed               # Run all with visible browser
npm run test:smoke                # Run @smoke tests
npm run test:regression           # Run @regression tests
npm run test:login                # Run Login module
npm run test:login:headed         # Run Login module with visible browser
npm run test:salary               # Run Salary Calculator module
npm run test:salary:headed        # Run Salary Calculator with visible browser
npm run test:last-failed          # Re-run only previously failed tests
npm run test:last-failed:headed   # Re-run failed tests with visible browser
npm run test:debug                # Debug mode
npm run report                    # Open HTML report
```

### Windows PowerShell Workaround
If PowerShell blocks npx, prefix every command with `cmd /c`:
```bash
cmd /c "npx playwright test"
cmd /c "npx playwright test --grep @smoke --headed"
cmd /c "npx playwright show-report"
```

### MCP Playwright Workflow (for inspecting pages)
```
1. browser_navigate  → Go to the page URL
2. browser_snapshot  → See all elements on the page
3. browser_type      → Type into input fields
4. browser_click     → Click buttons/links
5. browser_snapshot  → Verify the result
```

---

## Final File Structure

Your project should look exactly like this when complete:

```
project-root/
├── .github/
│   └── workflows/
│       └── playwright-tests.yml              ← CI/CD pipeline (GitHub Actions)
├── .kiro/
│   ├── hooks/
│   │   └── auto-heal-tests.kiro.hook         ← Auto-heal hook (fixes & re-runs failed tests)
│   └── settings/
│       └── mcp.json                          ← Playwright + Jira MCP configs
├── scripts/
│   └── allure-report.js                      ← Allure helper (history + env + categories + executor)
├── node_modules/                             ← Created by npm install
├── test-results/                             ← Test artifacts (screenshots, videos, traces, JSON)
├── allure-results/                           ← Raw Allure JSON results (auto-generated)
├── allure-report/                            ← Generated Allure HTML report
├── playwright-report/                        ← Playwright HTML report
├── .env                                      ← Environment URLs + credentials (gitignored)
├── .gitignore                                ← Git ignore rules
├── allure-environment.properties             ← Allure Environment widget config
├── allure-categories.json                    ← Allure Categories widget config
├── allure-executor.json                      ← Allure Executors widget config
├── playwright.config.js                      ← Playwright settings (with dotenv + auto-retry + Allure)
├── package.json                              ← npm scripts and dependencies
├── package-lock.json                         ← Auto-generated by npm
├── tests/
│   ├── Login/
│   │   ├── PageObject/
│   │   │   └── LoginPage.js                  ← Login page locators + methods
│   │   ├── Script/
│   │   │   └── login.spec.js                 ← Login test cases (3 tests ✅) with Allure decorators
│   │   └── testData/
│   │       └── loginData.js                  ← Login credentials + URLs (reads from .env)
│   └── SalaryCalculator/
│       ├── PageObject/
│       │   └── SalaryCalculatorPage.js       ← Salary page locators + methods
│       ├── Script/
│       │   └── salaryCalculator.spec.js      ← Salary test cases (3 tests, skipped)
│       └── testData/
│           ├── salaryCalculatorData.js        ← Salary test data
│           └── testScenarios.csv              ← Test scenarios from Jira
├── PROJECT_DOCUMENTATION.md                  ← Full code documentation
└── SetUp_Guid_And_Prompt 17-04-2026 3-21 PM.md  ← This file
```

---


## Step 9: Auto-Retry Configuration

> **Added post-setup.** Playwright is configured to automatically retry failed tests before marking them as failed.

### What was configured in `playwright.config.js`:

```javascript
retries: process.env.CI ? 2 : 1,  // Auto-retry failed tests once locally, twice in CI
```

| Environment | Retries | Behavior |
|---|---|---|
| Local (your machine) | 1 | If a test fails, Playwright retries it once automatically |
| CI (GitHub Actions, etc.) | 2 | If a test fails, Playwright retries it twice automatically |

### Additional reporters added:

```javascript
reporter: [
  ['html', { open: 'never' }],           // HTML report (viewable with npx playwright show-report)
  ['json', { outputFile: 'test-results/results.json' }],  // JSON results for --last-failed
  ['list']                                 // Console output
],
```

The JSON reporter is required for the `--last-failed` flag to work — it tracks which tests failed in the previous run.

### New npm scripts for re-running failed tests:

```json
"test:last-failed": "npx playwright test --last-failed",
"test:last-failed:headed": "npx playwright test --last-failed --headed"
```

**Usage:**
```bash
npx playwright test                    # Run all tests — if some fail, they retry once
npx playwright test --last-failed      # After failures, re-run ONLY the failed tests
```

---

## Step 10: Auto-Heal Hook Setup

> **Added post-setup.** A Kiro agent hook that automatically detects test failures, diagnoses the root cause, fixes the code, and re-runs only the failed tests.

### Hook file: `.kiro/hooks/auto-heal-tests.kiro.hook`

```json
{
  "enabled": true,
  "name": "Auto-Heal Failing Tests",
  "description": "After the agent stops, checks if the last action was a test run that failed. If so, automatically analyzes the failure, fixes the root cause (locators, test data, page object methods, or assertions), and re-runs the failing test to confirm the fix.",
  "version": "1",
  "when": {
    "type": "agentStop"
  },
  "then": {
    "type": "askAgent",
    "prompt": "Check if the last action involved running Playwright tests (npx playwright test). If tests FAILED:\n\n1. Read the test failure output carefully — identify which test(s) failed and the exact error message.\n2. Diagnose the root cause. Common causes:\n   - Locator not matching (element changed on page) → Use MCP Playwright browser_navigate + browser_snapshot to inspect the actual page, then update the locator in the PageObject file.\n   - Timeout waiting for element → Check if the page loaded correctly, add proper waits.\n   - Assertion mismatch → Check expected vs actual values, update test data or assertion.\n   - Import path error → Verify relative paths follow the ../PageObject/ and ../testData/ convention.\n   - Navigation failure → Verify the URL in testData is correct and reachable.\n3. Fix the identified issue in the correct file (PageObject, Script, or testData).\n4. Re-run ONLY the failed tests using: cmd /c \"npx playwright test --last-failed\"\n   This uses Playwright's built-in --last-failed flag which automatically picks up only the tests that failed in the previous run.\n5. If all pass, report success. If tests fail again with a DIFFERENT error, repeat the diagnosis. If the same error persists after 2 fix attempts, stop and report the issue to the user.\n\nIMPORTANT: Do NOT re-run if tests already PASSED. Only trigger healing on failures."
  }
}
```

### How the two-layer auto-heal system works:

```
Test Run
  │
  ├── Test PASSES → Done ✅
  │
  └── Test FAILS
       │
       ├── Layer 1: Playwright auto-retry (built-in)
       │   └── Retries the test 1 time (local) or 2 times (CI)
       │       ├── Passes on retry → Done ✅ (flaky test handled)
       │       └── Still fails → moves to Layer 2
       │
       └── Layer 2: Kiro Auto-Heal Hook (agentStop)
           └── Agent reads failure → diagnoses root cause → fixes code → re-runs --last-failed
               ├── Passes → Done ✅ (auto-healed)
               └── Fails again (2nd attempt) → Stops and reports to user ❌
```

### What the auto-heal can fix automatically:

| Failure Type | How It Fixes |
|---|---|
| Locator not matching | Inspects live page with MCP Playwright `browser_snapshot`, updates PageObject |
| Timeout waiting for element | Checks page load, adds proper waits |
| Assertion mismatch | Compares expected vs actual, updates test data or assertion |
| Import path error | Fixes `../` vs `./` paths |
| Navigation failure (URL issue) | Verifies URL is reachable, updates testData |

### Important limitation:

The auto-heal hook triggers on `agentStop` — it only works when tests are run **through Kiro agent**. If you run tests from Git Bash terminal directly, paste the failure output into Kiro chat and the agent will fix and re-run.

---

## Step 11: Implemented Code (Actual Files)

> **These are the actual implemented files** — last updated with dotenv, Allure decorators, and all current configurations.

### playwright.config.js (Full)

```javascript
// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

// Load environment variables from single .env file
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['list']
  ],
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### package.json (Full)

```json
{
  "name": "playwright-pom-automation",
  "version": "1.0.0",
  "description": "Playwright POM Automation Framework with Jira Integration",
  "scripts": {
    "test": "npx playwright test",
    "test:headed": "npx playwright test --headed",
    "test:smoke": "npx playwright test --grep @smoke",
    "test:regression": "npx playwright test --grep @regression",
    "test:login": "npx playwright test tests/Login/Script/",
    "test:login:headed": "npx playwright test tests/Login/Script/ --headed",
    "test:salary": "npx playwright test tests/SalaryCalculator/Script/",
    "test:salary:headed": "npx playwright test tests/SalaryCalculator/Script/ --headed",
    "test:debug": "npx playwright test --debug",
    "test:last-failed": "npx playwright test --last-failed",
    "test:last-failed:headed": "npx playwright test --last-failed --headed",
    "report": "npx playwright show-report",
    "report:allure:generate": "node scripts/allure-report.js generate",
    "report:allure:open": "node scripts/allure-report.js open",
    "report:allure": "node scripts/allure-report.js both",
    "test:allure": "npx playwright test && node scripts/allure-report.js both",
    "test:allure:smoke": "npx playwright test --grep @smoke && node scripts/allure-report.js both",
    "test:allure:regression": "npx playwright test --grep @regression && node scripts/allure-report.js both"
  },
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "allure-commandline": "^2.38.1",
    "allure-playwright": "^3.7.1",
    "cross-env": "^10.1.0",
    "dotenv": "^17.4.2"
  }
}
```

### .env (Environment Configuration)

```env
# Application URLs
QA_URL=https://next-gen-eob-ui-qa.teamlease.com/
DEV_URL=https://next-gen-eob-ui-dev.teamlease.com/
STAGING_URL=https://next-gen-eob-ui-staging.teamlease.com/
UAT_URL=https://next-gen-eob-ui-uat.teamlease.com/
PROD_URL=https://next-gen-eob-ui.teamlease.com/

# Credentials
USERNAME=thr_recruiter
PASSWORD=12345

# Active Environment (change this to switch: QA, DEV, STAGING, UAT, PROD, SAUCEDEMO)
ENV=SAUCEDEMO
```

### Login Module — loginData.js (with env switching)

```javascript
const envUrls = {
  QA: process.env.QA_URL,
  DEV: process.env.DEV_URL,
  STAGING: process.env.STAGING_URL,
  UAT: process.env.UAT_URL,
  PROD: process.env.PROD_URL,
  SAUCEDEMO: 'https://www.saucedemo.com',
};

const activeEnv = process.env.ENV || 'QA';
const isSauceDemo = activeEnv === 'SAUCEDEMO';

const loginData = {
  appUrl: envUrls[activeEnv] || 'https://www.saucedemo.com',
  environment: activeEnv,

  validUser: {
    username: isSauceDemo ? 'standard_user' : (process.env.USERNAME || 'standard_user'),
    password: isSauceDemo ? 'secret_sauce' : (process.env.PASSWORD || 'secret_sauce'),
  },

  invalidUser: {
    username: 'invaliduser',
    password: 'WrongPassword123',
  },

  emptyCredentials: {
    username: '',
    password: '',
  },

  loginType: 'Single-step: username + password + Login button',
};

module.exports = loginData;
```

### Login Module — LoginPage.js

```javascript
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async navigate(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }

  async getErrorText() {
    return await this.errorMessage.textContent();
  }

  async getPageTitle() {
    return await this.page.title();
  }
}

module.exports = LoginPage;
```

### Login Module — login.spec.js (with Allure decorators)

```javascript
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const LoginPage = require('../PageObject/LoginPage');
const loginData = require('../testData/loginData');

test.describe('Login Module', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.owner('QA Team');
    await loginPage.navigate(loginData.appUrl);
  });

  test('TC_LOGIN_001 - Valid login @smoke', async ({ page }) => {
    await allure.severity('critical');
    await allure.story('Valid Credentials');
    await allure.description('Verify user can login with valid credentials.');
    await allure.tag('smoke');

    await allure.step('Enter valid username', async () => {
      await loginPage.usernameInput.fill(loginData.validUser.username);
    });
    await allure.step('Enter valid password', async () => {
      await loginPage.passwordInput.fill(loginData.validUser.password);
    });
    await allure.step('Click Login button', async () => {
      await loginPage.loginButton.click();
    });
    await allure.step('Verify page title is Swag Labs', async () => {
      await expect(page).toHaveTitle(/Swag Labs/i);
    });
    await allure.step('Verify redirected to inventory page', async () => {
      await expect(page).toHaveURL(/inventory/);
    });
  });

  test('TC_LOGIN_002 - Invalid login shows error @regression', async ({ page }) => {
    await allure.severity('normal');
    await allure.story('Invalid Credentials');
    await allure.description('Verify invalid credentials show error message.');
    await allure.tag('regression');

    await allure.step('Enter invalid username', async () => {
      await loginPage.usernameInput.fill(loginData.invalidUser.username);
    });
    await allure.step('Enter invalid password', async () => {
      await loginPage.passwordInput.fill(loginData.invalidUser.password);
    });
    await allure.step('Click Login button', async () => {
      await loginPage.loginButton.click();
    });
    await allure.step('Verify error message is visible', async () => {
      expect(await loginPage.isErrorVisible()).toBeTruthy();
    });
  });

  test('TC_LOGIN_003 - Empty username and password @regression', async ({ page }) => {
    await allure.severity('minor');
    await allure.story('Empty Credentials');
    await allure.description('Verify empty fields show validation error.');
    await allure.tag('regression');

    await allure.step('Leave username empty', async () => {
      await loginPage.usernameInput.fill(loginData.emptyCredentials.username);
    });
    await allure.step('Leave password empty', async () => {
      await loginPage.passwordInput.fill(loginData.emptyCredentials.password);
    });
    await allure.step('Click Login button', async () => {
      await loginPage.loginButton.click();
    });
    await allure.step('Verify error message is visible', async () => {
      expect(await loginPage.isErrorVisible()).toBeTruthy();
    });
  });
});
```

### scripts/allure-report.js (Helper — History + Environment + Categories + Executor)

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ALLURE_RESULTS = path.join(ROOT, 'allure-results');
const ALLURE_REPORT = path.join(ROOT, 'allure-report');
const HISTORY_SRC = path.join(ALLURE_REPORT, 'history');
const HISTORY_DEST = path.join(ALLURE_RESULTS, 'history');
const ENV_FILE = path.join(ROOT, 'allure-environment.properties');
const ENV_DEST = path.join(ALLURE_RESULTS, 'environment.properties');
const CATEGORIES_FILE = path.join(ROOT, 'allure-categories.json');
const CATEGORIES_DEST = path.join(ALLURE_RESULTS, 'categories.json');
const EXECUTOR_FILE = path.join(ROOT, 'allure-executor.json');
const EXECUTOR_DEST = path.join(ALLURE_RESULTS, 'executor.json');

const action = process.argv[2] || 'both';

function copyHistory() { /* copies allure-report/history → allure-results/history */ }
function copyEnvironment() { /* copies allure-environment.properties → allure-results/ */ }
function copyCategories() { /* copies allure-categories.json → allure-results/ */ }
function copyExecutor() { /* copies allure-executor.json → allure-results/ with auto-increment buildOrder */ }

function generate() {
  copyHistory();
  copyEnvironment();
  copyCategories();
  copyExecutor();
  execSync('npx allure generate allure-results --clean -o allure-report', { stdio: 'inherit', cwd: ROOT });
}

function open() {
  execSync('npx allure open allure-report', { stdio: 'inherit', cwd: ROOT });
}

if (action === 'generate') generate();
else if (action === 'open') open();
else { generate(); open(); }
```

### .gitignore

```gitignore
node_modules/
test-results/
allure-results/
allure-report/
playwright-report/
.env
Thumbs.db
.DS_Store
.vscode/
.idea/
*.log
npm-debug.log*
```

---

## Step 12: Test Execution Results
};

module.exports = salaryCalculatorData;
```

### Salary Calculator Module — testScenarios.csv

```csv
TC_ID,Scenario,BasicSalary,HRA,DA,SpecialAllowance,ExpectedGross,Tags
TC_SALARY_001,Valid salary calculation,50000,20000,15000,10000,95000,@smoke
TC_SALARY_002,Minimum salary values,10000,5000,3000,2000,20000,@regression
TC_SALARY_003,Zero values for all fields,0,0,0,0,0,@regression
```

---

## Step 12: Test Execution Results

### Login Module — All 3 tests PASSING ✅

```
Running 3 tests using 1 worker
  ✅ TC_LOGIN_001 - Valid login @smoke (1.1s)
  ✅ TC_LOGIN_002 - Invalid login shows error @regression (1.1s)
  ✅ TC_LOGIN_003 - Empty username and password @regression (1.0s)
  3 passed (3.6s)
```

### Salary Calculator Module — 3 tests SKIPPED ⏭️

```
  ⏭️ TC_SALARY_001 - Valid salary calculation @smoke (skipped)
  ⏭️ TC_SALARY_002 - Minimum salary values @regression (skipped)
  ⏭️ TC_SALARY_003 - Zero values for all fields @regression (skipped)
  3 skipped
```

### Full Suite Summary

| Module | Tests | Passed | Skipped | Failed |
|---|---|---|---|---|
| Login | 3 | 3 ✅ | 0 | 0 |
| Salary Calculator | 3 | 0 | 3 ⏭️ | 0 |
| **Total** | **6** | **3** | **3** | **0** |

---

## Additional Lessons Learned (Post-Implementation)

| # | Problem | Root Cause | Fix Applied |
|---|---|---|---|
| 9 | `net::ERR_NAME_NOT_RESOLVED` on all tests | Placeholder URL `https://myapp.company.com` is not a real site | Switched to `https://www.saucedemo.com` (free public demo app) |
| 10 | Corrupted locators (`textboxsfghj`, `textboxrgh`) | Manual edits introduced typos in Playwright role names | Fixed to correct values: `textbox`, `button`. Auto-heal detected and fixed this automatically. |
| 11 | Salary Calculator tests failing | Sauce Demo doesn't have a salary calculator page | Tests marked as `test.skip` until real app URL is provided |
| 12 | Two-step login flow not needed | Sauce Demo uses single-step login (no Continue button) | Removed `continueButton`, simplified `login()` to single-step |
| 13 | Assertion `toHaveTitle(/Dashboard/)` failing | Sauce Demo title is "Swag Labs", not "Dashboard" | Updated to `toHaveTitle(/Swag Labs/)` + `toHaveURL(/inventory/)` |
| 14 | Auto-heal hook doesn't trigger from Git Bash | Hook fires on `agentStop` which only happens inside Kiro agent | Documented: paste failure output into Kiro chat for auto-heal |
| 15 | `--last-failed` not working | Missing JSON reporter in playwright.config.js | Added `['json', { outputFile: 'test-results/results.json' }]` reporter |

---

## Step 13: Allure Report Configuration

> **Added post-setup.** Allure provides rich, interactive HTML reports that managers and stakeholders can view — with charts, test history, categories, and detailed step breakdowns.

### Packages installed:

```bash
npm install -D allure-playwright allure-commandline
```

| Package | Purpose |
|---|---|
| `allure-playwright` | Playwright reporter that generates Allure-compatible result files |
| `allure-commandline` | CLI tool to generate and open the Allure HTML report |

### What was configured in `playwright.config.js`:

Added Allure reporter alongside existing reporters:

```javascript
reporter: [
  ['html', { open: 'never' }],                              // Playwright HTML report
  ['json', { outputFile: 'test-results/results.json' }],    // JSON for --last-failed
  ['allure-playwright', { outputFolder: 'allure-results' }], // Allure results
  ['list']                                                    // Console output
],
```

### New npm scripts added to `package.json`:

```json
"report:allure:generate": "npx allure generate allure-results --clean -o allure-report",
"report:allure:open": "npx allure open allure-report",
"report:allure": "npx allure generate allure-results --clean -o allure-report && npx allure open allure-report",
"test:allure": "npx playwright test && npx allure generate allure-results --clean -o allure-report && npx allure open allure-report",
"test:allure:smoke": "npx playwright test --grep @smoke && npx allure generate allure-results --clean -o allure-report && npx allure open allure-report",
"test:allure:regression": "npx playwright test --grep @regression && npx allure generate allure-results --clean -o allure-report && npx allure open allure-report"
```

| Script | What It Does |
|---|---|
| `npm run test:allure` | **Run all tests → generate Allure report → open in browser** (one command, does everything) |
| `npm run test:allure:smoke` | Run @smoke tests → generate → open Allure report |
| `npm run test:allure:regression` | Run @regression tests → generate → open Allure report |
| `npm run report:allure` | Generate Allure report from last run → open in browser |
| `npm run report:allure:generate` | Only generate Allure HTML (no browser open) |
| `npm run report:allure:open` | Only open previously generated Allure report |
| `npm run report` | Open Playwright's built-in HTML report |

### How to use (one command — runs tests and opens report automatically):

```bash
# Run ALL tests and auto-open Allure report in browser
npm run test:allure

# Run only SMOKE tests and auto-open Allure report
npm run test:allure:smoke

# Run only REGRESSION tests and auto-open Allure report
npm run test:allure:regression

# Just open the report from last run (no test execution)
npm run report:allure
```

### Step-by-step (if you prefer manual control):

```bash
# Step 1: Run tests (Allure results are generated automatically)
npx playwright test

# Step 2: Generate the HTML report
npm run report:allure:generate

# Step 3: Open in browser
npm run report:allure:open
```

### Windows PowerShell workaround:
```bash
# One command — run tests + generate + open Allure report
cmd /c "npx playwright test && npx allure generate allure-results --clean -o allure-report && npx allure open allure-report"

# Or step by step:
cmd /c "npx playwright test"
cmd /c "npx allure generate allure-results --clean -o allure-report"
cmd /c "npx allure open allure-report"
```

### What the Allure report shows:
- **Overview dashboard** — pass/fail/skip percentages with charts
- **Trend graph** — test result trends across multiple runs (requires history preservation — configured via `scripts/allure-report.js`)
- **Suites view** — tests grouped by `test.describe()` blocks
- **Timeline** — execution timeline showing parallel/sequential runs
- **Categories** — failure categories (broken, failed, etc.)
- **Test details** — each test with steps, attachments (screenshots, videos, traces)
- **History** — per-test history showing pass/fail over time

### How Trend graph works:

Allure Trend requires **history from previous runs**. The helper script `scripts/allure-report.js` handles this automatically:

```
Run 1 → allure-results/ → generate report → allure-report/history/ created
Run 2 → allure-results/ → script copies history from allure-report/ → generate → trend shows 2 runs
Run 3 → allure-results/ → script copies history from allure-report/ → generate → trend shows 3 runs
```

The script (`scripts/allure-report.js`) does this:
1. Checks if `allure-report/history/` exists from a previous report
2. Copies those history files into `allure-results/history/`
3. Generates the new report (which now includes past data)
4. Result: Trend graph shows data across all runs

**All `npm run report:allure*` and `npm run test:allure*` commands use this script automatically.**

### Helper script: `scripts/allure-report.js`

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ALLURE_RESULTS = path.join(__dirname, '..', 'allure-results');
const ALLURE_REPORT = path.join(__dirname, '..', 'allure-report');
const HISTORY_SRC = path.join(ALLURE_REPORT, 'history');
const HISTORY_DEST = path.join(ALLURE_RESULTS, 'history');

const action = process.argv[2] || 'both';

function copyHistory() {
  if (fs.existsSync(HISTORY_SRC)) {
    if (!fs.existsSync(HISTORY_DEST)) {
      fs.mkdirSync(HISTORY_DEST, { recursive: true });
    }
    const files = fs.readdirSync(HISTORY_SRC);
    let copied = 0;
    for (const file of files) {
      fs.copyFileSync(path.join(HISTORY_SRC, file), path.join(HISTORY_DEST, file));
      copied++;
    }
    console.log(`✅ Copied ${copied} history files (enables Trend graph)`);
  } else {
    console.log('ℹ️  No previous history — Trend appears after 2+ runs');
  }
}

function generate() {
  copyHistory();
  execSync('npx allure generate allure-results --clean -o allure-report', {
    stdio: 'inherit', cwd: path.join(__dirname, '..'),
  });
}

function open() {
  execSync('npx allure open allure-report', {
    stdio: 'inherit', cwd: path.join(__dirname, '..'),
  });
}

if (action === 'generate') generate();
else if (action === 'open') open();
else { generate(); open(); }
```

### Folder structure after running:
```
project-root/
├── allure-environment.properties ← Environment info (copied into results automatically)
├── allure-results/               ← Raw JSON results (generated during test run)
│   ├── environment.properties    ← Copied from root by helper script
│   ├── history/                  ← Copied from previous report by helper script
│   ├── xxx-result.json           ← One file per test
│   └── ...
├── allure-report/                ← Generated HTML report (open in browser)
│   ├── index.html
│   └── ...
```

### Environment configuration:

The file `allure-environment.properties` in the project root defines what shows in the **Environment** widget on the Allure dashboard:

```properties
Environment=QA
Browser=Chromium
Framework=Playwright
Language=JavaScript (CommonJS)
Node.js=v22.15.0
npm=v10.9.2
OS=Windows
App.URL=https://www.saucedemo.com
Test.Runner=@playwright/test
Pattern=Page Object Model (POM)
Retries.Local=1
Retries.CI=2
Reporter=Allure + HTML + JSON
```

**To customize:** Edit `allure-environment.properties` in the project root. The helper script (`scripts/allure-report.js`) automatically copies it into `allure-results/` before generating the report.

**For different environments** (DEV, QA, STAGING, PROD), just change the `Environment` and `App.URL` values before running tests.

---


## Step 14: GitHub Actions CI/CD Pipeline

> **Added post-setup.** Automated CI/CD pipeline that runs tests on every push/PR, retries failures, generates reports, and deploys Allure report to GitHub Pages.

### Pipeline file: `.github/workflows/playwright-tests.yml`

### What triggers the pipeline:

| Trigger | When |
|---|---|
| `push` | Code pushed to `main`, `master`, or `develop` branch |
| `pull_request` | PR opened/updated against `main`, `master`, or `develop` |
| `workflow_dispatch` | Manual trigger from GitHub Actions UI (Run workflow button) |

### Pipeline flow:

```
Push/PR → Checkout → Install Node.js → npm ci → Install Chromium
  │
  ├── Run all tests
  │   ├── All pass ✅ → Generate reports → Upload artifacts → Done
  │   └── Some fail ❌ → Auto-retry only failed tests (--last-failed)
  │       ├── Pass on retry ✅ → Generate reports → Upload artifacts → Done
  │       └── Still fail ❌ → Generate reports → Upload artifacts → Mark build failed
  │
  └── Deploy Allure report to GitHub Pages (main branch only)
```

### Jobs in the pipeline:

**Job 1: `test`** — Runs on `ubuntu-latest`
1. Checkout code
2. Setup Node.js v22 with npm cache
3. `npm ci` — clean install dependencies
4. Install Chromium browser with system deps
5. Run all Playwright tests (`retries: 2` in CI from playwright.config.js)
6. If tests fail → re-run only failed tests using `--last-failed`
7. Generate Allure HTML report
8. Upload artifacts: Playwright report, Allure report, test results, failure screenshots/videos

**Job 2: `deploy-report`** — Deploys Allure report to GitHub Pages (main branch only)
1. Downloads the Allure report artifact from Job 1
2. Publishes to GitHub Pages
3. Your manager can view the report at: `https://<your-username>.github.io/<repo-name>/`

### Artifacts uploaded (available for 30 days):

| Artifact | Contents | When |
|---|---|---|
| `playwright-html-report` | Playwright's built-in HTML report | Always |
| `allure-report` | Allure interactive HTML report | Always |
| `test-results` | JSON results, traces | Always |
| `test-failure-artifacts` | Screenshots + videos of failures | Only on failure |

### How to download artifacts:
1. Go to your GitHub repo → **Actions** tab
2. Click on the workflow run
3. Scroll to **Artifacts** section at the bottom
4. Click to download any report as a ZIP

### How to enable GitHub Pages deployment:
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The Allure report will auto-deploy on every push to `main`
4. Access at: `https://<your-username>.github.io/<repo-name>/`

### Full `.yml` file:

```yaml
name: Playwright Tests CI/CD Pipeline

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]
  workflow_dispatch:

jobs:
  test:
    name: Run Playwright Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Chromium browser
        run: npx playwright install chromium --with-deps

      - name: Run all Playwright tests
        run: npx playwright test
        continue-on-error: true
        id: test-run

      - name: Re-run only failed tests (auto-retry)
        if: steps.test-run.outcome == 'failure'
        run: npx playwright test --last-failed
        continue-on-error: true
        id: retry-run

      - name: Generate Allure report
        if: always()
        run: npx allure generate allure-results --clean -o allure-report

      - name: Upload Playwright HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-html-report
          path: playwright-report/
          retention-days: 30

      - name: Upload Allure report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: allure-report
          path: allure-report/
          retention-days: 30

      - name: Upload test results (JSON)
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
          retention-days: 30

      - name: Upload failure screenshots and videos
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-failure-artifacts
          path: |
            test-results/**/*.png
            test-results/**/*.webm
            test-results/**/*.zip
          retention-days: 30

      - name: Final status check
        if: steps.test-run.outcome == 'failure' && steps.retry-run.outcome == 'failure'
        run: |
          echo "❌ Tests failed even after retry. Check the uploaded reports for details."
          exit 1

      - name: Tests passed
        if: steps.test-run.outcome == 'success' || steps.retry-run.outcome == 'success'
        run: echo "✅ All tests passed!"

  deploy-report:
    name: Deploy Allure Report to GitHub Pages
    needs: test
    if: always() && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Download Allure report
        uses: actions/download-artifact@v4
        with:
          name: allure-report
          path: allure-report/

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v4

      - name: Upload to GitHub Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: allure-report/

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Quick setup for your repo:

```bash
# 1. Initialize git (if not already)
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Playwright POM framework with CI/CD pipeline"

# 4. Add your GitHub remote
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git

# 5. Push to main
git push -u origin main

# 6. Go to GitHub → Actions tab → Pipeline will run automatically
```

---

### Environment configuration:

The file `allure-environment.properties` in the project root defines what shows in the **Environment** widget:

```properties
Environment=QA
Browser=Chromium
Framework=Playwright
Language=JavaScript (CommonJS)
Node.js=v22.15.0
npm=v10.9.2
OS=Windows
App.URL=https://www.saucedemo.com
Test.Runner=@playwright/test
Pattern=Page Object Model (POM)
Retries.Local=1
Retries.CI=2
Reporter=Allure + HTML + JSON
```

**To customize:** Edit `allure-environment.properties` in the project root. For different environments (DEV, QA, STAGING, PROD), change the `Environment` and `App.URL` values.

### Categories configuration:

The file `allure-categories.json` in the project root classifies failures into meaningful groups in the **Categories** tab:

```json
[
  {
    "name": "Locator / Element Not Found",
    "description": "Element locator did not match any element on the page.",
    "matchedStatuses": ["broken"],
    "messageRegex": ".*(?:locator\\.fill|locator\\.click|waiting for|getByRole|Timeout.*exceeded).*"
  },
  {
    "name": "Navigation / URL Error",
    "description": "Page URL could not be resolved or loaded.",
    "matchedStatuses": ["broken"],
    "messageRegex": ".*(?:ERR_NAME_NOT_RESOLVED|ERR_CONNECTION_REFUSED|page\\.goto|net::ERR_).*"
  },
  {
    "name": "Assertion Failure",
    "description": "Test assertion did not match expected value.",
    "matchedStatuses": ["failed"],
    "messageRegex": ".*(?:expect\\(|toHaveTitle|toHaveURL|toBeTruthy|toBe\\(|toEqual).*"
  },
  {
    "name": "Timeout Error",
    "description": "Action or navigation exceeded the configured timeout.",
    "matchedStatuses": ["broken"],
    "messageRegex": ".*(?:Timeout \\d+ms exceeded|TimeoutError).*"
  },
  {
    "name": "Import / Module Error",
    "description": "Module import failed. Check relative paths.",
    "matchedStatuses": ["broken"],
    "messageRegex": ".*(?:Cannot find module|MODULE_NOT_FOUND).*"
  },
  {
    "name": "Authentication Error",
    "description": "Login or authentication step failed.",
    "matchedStatuses": ["failed", "broken"],
    "messageRegex": ".*(?:login|auth|password|unauthorized|403|401).*"
  },
  {
    "name": "Skipped Tests",
    "description": "Tests marked as test.skip.",
    "matchedStatuses": ["skipped"]
  },
  {
    "name": "Unknown / Other Failures",
    "description": "Unclassified failure. Review manually.",
    "matchedStatuses": ["failed", "broken"],
    "messageRegex": ".*"
  }
]
```

**Categories defined:**

| Category | Matches | What It Means |
|---|---|---|
| Locator / Element Not Found | `locator.fill`, `getByRole`, `Timeout exceeded` | PageObject locator needs updating |
| Navigation / URL Error | `ERR_NAME_NOT_RESOLVED`, `page.goto` | URL in testData is wrong or unreachable |
| Assertion Failure | `expect()`, `toHaveTitle`, `toBe` | Expected vs actual mismatch |
| Timeout Error | `Timeout Xms exceeded` | Page too slow or element missing |
| Import / Module Error | `Cannot find module` | Wrong import path (../  vs ./) |
| Authentication Error | `login`, `auth`, `401`, `403` | Credentials issue |
| Skipped Tests | `test.skip` | Waiting for real app URL |
| Unknown / Other | Catch-all | Review manually |

**To customize:** Edit `allure-categories.json` in the project root. The helper script copies it automatically.

> **Tip for managers:** Share the `allure-report/` folder or host it on a web server. The report is fully self-contained HTML — no server needed to view it.

---

### Executors configuration:

The file `allure-executor.json` in the project root defines what shows in the **Executors** widget:

```json
{
  "name": "QA Team - Local Machine",
  "type": "local",
  "buildName": "Playwright POM Automation",
  "buildOrder": 1,
  "reportName": "Allure Report - QA Environment",
  "reportUrl": "",
  "buildUrl": ""
}
```

| Field | Purpose |
|---|---|
| `name` | Who/what ran the tests (e.g., "QA Team - Local Machine", "GitHub Actions CI") |
| `type` | Executor type: `local`, `jenkins`, `github`, `bamboo`, etc. |
| `buildName` | Build label shown in report (auto-incremented by helper script) |
| `buildOrder` | Build number (auto-incremented each run) |
| `reportName` | Name shown in the Executors widget |
| `reportUrl` | Link to the report (useful for CI — leave empty for local) |
| `buildUrl` | Link to the CI build (leave empty for local) |

**Auto-increment:** The helper script (`scripts/allure-report.js`) automatically increments `buildOrder` and updates `buildName` with the build number on each run.

**To customize:** Edit `allure-executor.json` in the project root. For CI, update `type` to `github`, and set `buildUrl` and `reportUrl` to your CI URLs.

---

### Executor configuration:

The file `allure-executor.json` in the project root defines what shows in the **Executors** widget:

```json
{
  "name": "QA Team - Local Machine",
  "type": "local",
  "buildName": "Playwright POM Automation",
  "buildOrder": 1,
  "reportName": "Allure Report - QA Environment",
  "reportUrl": "",
  "buildUrl": ""
}
```

| Field | Description |
|---|---|
| `name` | Who/what ran the tests (e.g., "QA Team - Local Machine", "GitHub Actions CI") |
| `type` | Executor type: `local`, `jenkins`, `github`, `bamboo`, etc. |
| `buildName` | Build label (auto-incremented by helper script: `#1`, `#2`, `#3`...) |
| `buildOrder` | Build number (auto-incremented each run) |
| `reportName` | Report title shown in Allure |
| `reportUrl` | Link to the hosted report (optional — fill for CI) |
| `buildUrl` | Link to the CI build (optional — fill for CI) |

**Auto-increment:** The helper script (`scripts/allure-report.js`) automatically increments `buildOrder` and `buildName` on each run, so you see `Build #1`, `Build #2`, etc. in the Executors widget.

**To customize:** Edit `allure-executor.json` in the project root. For CI, update `type` to `github`, and fill `reportUrl`/`buildUrl`.

---


### Allure Decorators (Steps, Severity, Epic, Tags)

> **Added post-setup.** These decorators make the Allure report visually rich with detailed steps, severity levels, behavior grouping, and tags.

#### Available decorators:

| Decorator | Purpose | Example |
|---|---|---|
| `allure.step('text', fn)` | Shows step-by-step execution inside each test | `await allure.step('Enter username', async () => { ... })` |
| `allure.severity('level')` | Marks test priority: `blocker`, `critical`, `normal`, `minor`, `trivial` | `await allure.severity('critical')` |
| `allure.epic('name')` | Top-level grouping in Behaviors view | `await allure.epic('Authentication')` |
| `allure.feature('name')` | Mid-level grouping in Behaviors view | `await allure.feature('Login')` |
| `allure.story('name')` | Lowest-level grouping in Behaviors view | `await allure.story('Valid Credentials')` |
| `allure.description('text')` | Human-readable test description shown in test detail | `await allure.description('Verify user can login...')` |
| `allure.owner('name')` | Shows who owns the test | `await allure.owner('QA Team')` |
| `allure.tag('name')` | Adds filterable tags | `await allure.tag('smoke')` |

#### How to import:

```javascript
const { allure } = require('allure-playwright');
```

#### Updated login.spec.js (with all decorators):

```javascript
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const LoginPage = require('../PageObject/LoginPage');
const loginData = require('../testData/loginData');

test.describe('Login Module', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.owner('QA Team');
    await loginPage.navigate(loginData.appUrl);
  });

  test('TC_LOGIN_001 - Valid login @smoke', async ({ page }) => {
    await allure.severity('critical');
    await allure.story('Valid Credentials');
    await allure.description('Verify that a user can login with valid username and password and is redirected to the inventory page.');
    await allure.tag('smoke');
    await allure.tag('login');

    await allure.step('Enter valid username', async () => {
      await loginPage.usernameInput.fill(loginData.validUser.username);
    });

    await allure.step('Enter valid password', async () => {
      await loginPage.passwordInput.fill(loginData.validUser.password);
    });

    await allure.step('Click Login button', async () => {
      await loginPage.loginButton.click();
    });

    await allure.step('Verify page title is Swag Labs', async () => {
      await expect(page).toHaveTitle(/Swag Labs/i);
    });

    await allure.step('Verify redirected to inventory page', async () => {
      await expect(page).toHaveURL(/inventory/);
    });
  });

  test('TC_LOGIN_002 - Invalid login shows error @regression', async ({ page }) => {
    await allure.severity('normal');
    await allure.story('Invalid Credentials');
    await allure.description('Verify that entering invalid credentials shows an error message on the login page.');
    await allure.tag('regression');
    await allure.tag('negative');

    await allure.step('Enter invalid username', async () => {
      await loginPage.usernameInput.fill(loginData.invalidUser.username);
    });

    await allure.step('Enter invalid password', async () => {
      await loginPage.passwordInput.fill(loginData.invalidUser.password);
    });

    await allure.step('Click Login button', async () => {
      await loginPage.loginButton.click();
    });

    await allure.step('Verify error message is visible', async () => {
      expect(await loginPage.isErrorVisible()).toBeTruthy();
    });
  });

  test('TC_LOGIN_003 - Empty username and password @regression', async ({ page }) => {
    await allure.severity('minor');
    await allure.story('Empty Credentials');
    await allure.description('Verify that submitting empty username and password fields shows a validation error.');
    await allure.tag('regression');
    await allure.tag('boundary');

    await allure.step('Leave username empty', async () => {
      await loginPage.usernameInput.fill(loginData.emptyCredentials.username);
    });

    await allure.step('Leave password empty', async () => {
      await loginPage.passwordInput.fill(loginData.emptyCredentials.password);
    });

    await allure.step('Click Login button', async () => {
      await loginPage.loginButton.click();
    });

    await allure.step('Verify error message is visible', async () => {
      expect(await loginPage.isErrorVisible()).toBeTruthy();
    });
  });
});
```

#### What this adds to the Allure report:

| Allure View | What You See |
|---|---|
| **Behaviors** | Epic (Authentication) → Feature (Login) → Story (Valid Credentials, Invalid Credentials, Empty Credentials) |
| **Suites** | Login Module → each test with step-by-step breakdown |
| **Severity** | Critical (TC_001), Normal (TC_002), Minor (TC_003) with color-coded icons |
| **Test Detail** | Description, owner, tags, and each step with pass/fail status |
| **Graphs** | Severity distribution pie chart |

---


### Step 15: Environment Configuration (.env)

> Single `.env` file holds all environment URLs and credentials. Change `ENV=` to switch environments.

#### File: `.env`

```env
# Application URLs
QA_URL=https://next-gen-eob-ui-qa.teamlease.com/
DEV_URL=https://next-gen-eob-ui-dev.teamlease.com/
STAGING_URL=https://next-gen-eob-ui-staging.teamlease.com/
UAT_URL=https://next-gen-eob-ui-uat.teamlease.com/
PROD_URL=https://next-gen-eob-ui.teamlease.com/

# Credentials
USERNAME=thr_recruiter
PASSWORD=12345

# Active Environment (change this to switch: QA, DEV, STAGING, UAT, PROD)
ENV=QA
```

#### How to switch environments:

Just change `ENV=` in `.env`:
- `ENV=QA` → runs against QA URL
- `ENV=DEV` → runs against DEV URL
- `ENV=STAGING` → runs against STAGING URL
- `ENV=UAT` → runs against UAT URL
- `ENV=PROD` → runs against PROD URL

Then run tests normally — no other changes needed:
```bash
npx playwright test
```

#### How it works:

1. `playwright.config.js` loads `.env` using `dotenv`
2. `loginData.js` reads `ENV` and picks the matching URL (`QA_URL`, `DEV_URL`, etc.)
3. Credentials (`USERNAME`, `PASSWORD`) are shared across all environments

#### Packages required:

```bash
npm install -D dotenv cross-env
```

---


### Step 16: .gitignore

**File:** `.gitignore`

```gitignore
# Dependencies
node_modules/

# Test results and reports
test-results/
allure-results/
allure-report/
playwright-report/

# Environment variables
.env

# OS files
Thumbs.db
.DS_Store

# IDE
.vscode/
.idea/

# Logs
*.log
npm-debug.log*
```

| Entry | Why |
|---|---|
| `node_modules/` | Installed by `npm install` — never commit |
| `test-results/` | Screenshots, videos, traces — generated each run |
| `allure-results/` | Raw Allure JSON — regenerated each run |
| `allure-report/` | Generated HTML report — regenerated each run |
| `playwright-report/` | Playwright HTML report — regenerated each run |
| `.env` | Contains credentials — never commit to git |
| `.DS_Store` / `Thumbs.db` | OS junk files |

---


### Step 17: Utils — Reusable Methods

**File:** `tests/Utils/ReusableMethods.js`

#### Available methods:

| Method | Description |
|---|---|
| `takeScreenshot(page, directory, name)` | Full-page HD screenshot (PNG, CSS scale) |
| `takeElementScreenshot(locator, directory, name)` | HD screenshot of a specific element |
| `takeTimestampedScreenshot(page, directory, prefix)` | Auto-named with timestamp |
| `takeViewportScreenshot(page, directory, name)` | Viewport-only HD screenshot |

All screenshots are saved as **PNG with `scale: 'css'`** for HD quality on HiDPI displays.

#### Usage in test files:

```javascript
const ReusableMethods = require('../../Utils/ReusableMethods');

// Full-page HD screenshot
await ReusableMethods.takeScreenshot(page, 'screenshots/login', 'valid-login-success');

// Element screenshot
await ReusableMethods.takeElementScreenshot(loginPage.errorMessage, 'screenshots/login', 'error-msg');

// Auto-timestamped screenshot
await ReusableMethods.takeTimestampedScreenshot(page, 'screenshots/login', 'after-login');

// Viewport-only screenshot
await ReusableMethods.takeViewportScreenshot(page, 'screenshots/login', 'viewport-check');
```

#### Import path from Script/ folders:

```javascript
// From tests/Login/Script/login.spec.js
const ReusableMethods = require('../../Utils/ReusableMethods');

// From tests/SalaryCalculator/Script/salaryCalculator.spec.js
const ReusableMethods = require('../../Utils/ReusableMethods');
```

---


### How Screenshots Work in CI (GitHub Actions)

> Screenshots taken during CI runs are **NOT** committed to the repo. They exist only in the CI runner's temporary filesystem and are destroyed when the job finishes. `git pull` will NOT give you CI screenshots.

#### How to get screenshots from CI:

| Method | How | Recommended? |
|---|---|---|
| **Download Artifacts** | GitHub → Actions → your run → Artifacts section → download ZIP | ✅ Yes |
| **Allure Report** | Screenshots are embedded in the Allure report (deployed to GitHub Pages) | ✅ Yes |
| **Upload to S3** | Add an S3 upload step in the workflow | Optional |
| **Commit back to repo** | CI step to git commit + push screenshots | ❌ Not recommended (clutters repo) |

#### Artifacts uploaded by the pipeline:

| Artifact Name | Contents | When Uploaded |
|---|---|---|
| `playwright-html-report` | Playwright HTML report | Always |
| `allure-report` | Allure interactive report (with embedded screenshots) | Always |
| `test-results` | JSON results, traces | Always |
| `test-failure-artifacts` | Failure screenshots (`.png`), videos (`.webm`), traces (`.zip`) | Always |
| `test-screenshots` | Custom HD screenshots from `ReusableMethods.takeScreenshot()` | Always (if folder exists) |

#### How to download:

1. Go to your GitHub repo → **Actions** tab
2. Click on the workflow run
3. Scroll to **Artifacts** section at the bottom
4. Click any artifact to download as ZIP

#### Custom screenshots in tests:

When you use `ReusableMethods.takeScreenshot(page, 'screenshots/login', 'after-login')` in your tests, those screenshots are saved to the `screenshots/` folder and uploaded as the `test-screenshots` artifact in CI.

---


## Step 18: GitHub Actions CI/CD Pipeline (Complete Details)

> **File:** `.github/workflows/playwright-tests.yml`

### Triggers

| Event | When |
|---|---|
| `push` | Code pushed to `main`, `master`, or `develop` |
| `pull_request` | PR opened/updated against `main`, `master`, or `develop` |
| `workflow_dispatch` | Manual trigger from GitHub Actions UI (Run workflow button) |

### Architecture — 12 Parallel Jobs + 1 Report Job

All 12 spec files run **simultaneously** as separate jobs. Each job gets its own GitHub runner (virtual machine), 6-hour timeout, and 3 workers.

```
Push to main
  │
  ├── test-functional          → functional.spec.js
  ├── test-esic                → esicValidation.spec.js
  ├── test-pf                  → pfValidation.spec.js
  ├── test-lta                 → ltaValidation.spec.js
  ├── test-meal                → mealAllowanceValidation.spec.js
  ├── test-statutory-bonus     → statutoryBonusValidation.spec.js
  ├── test-minimum-wages       → minimumWagesValidation.spec.js
  ├── test-vehicle             → vehicleMaintenanceValidation.spec.js
  ├── test-driver              → driverSalaryValidation.spec.js
  ├── test-ideal-perf          → idealPerformancePay.spec.js
  ├── test-total-benefits      → totalBenefitsValidation.spec.js
  ├── test-total-fixed         → totalFixedCTCValidation.spec.js
  │        ↑ all 12 run at the SAME TIME (parallel)
  │
  └── generate-report          → runs AFTER all 12 finish → Allure report
```

### What Each Job Does (Step by Step)

```yaml
steps:
  1. Checkout code                    → actions/checkout@v4
  2. Setup Node.js 22 with npm cache  → actions/setup-node@v4
  3. npm ci                           → clean install dependencies
  4. Install all browsers             → npx playwright install --with-deps
     (Chromium + Firefox + WebKit)
  5. Run spec file                    → npx playwright test <spec>.spec.js
     - workers: 3 (3 tests run simultaneously)
     - 3 browsers (Chrome, Firefox, WebKit)
     - retries: 2 in CI
     - continue-on-error: true (job doesn't fail, uploads artifacts)
  6. Upload screenshots as artifact   → actions/upload-artifact@v4
     - saved for 30 days
     - downloadable from Actions tab
```

### Playwright Config Used in CI

```javascript
workers: 3,                    // 3 tests run at the same time
retries: 2,                    // CI retries failed tests twice
headless: true,                // No browser UI in CI
screenshot: 'on',              // Screenshots for every test (pass or fail)
video: 'retain-on-failure',    // Video only for failures
trace: 'retain-on-failure',    // Trace only for failures
projects: chromium, firefox, webkit  // All 3 browsers
```

### Time Estimates

| Setup | Time per spec | Total time |
|---|---|---|
| Local, 1 worker, 1 browser | ~5 hours | ~60 hours (sequential) |
| Local, 3 workers, 1 browser | ~1.7 hours | ~20 hours (sequential) |
| CI/CD, 3 workers, 3 browsers, 12 parallel jobs | ~5 hours | **~5 hours** (parallel) |

CI finishes in the time of the **longest single spec** because all 12 run simultaneously.

### Artifacts Uploaded Per Job

| Artifact | Contents |
|---|---|
| `screenshots-functional` | Functional test screenshots |
| `screenshots-esic` | ESIC validation screenshots |
| `screenshots-pf` | PF validation screenshots |
| `screenshots-lta` | LTA validation screenshots |
| `screenshots-meal` | Meal Allowance screenshots |
| `screenshots-statutory-bonus` | Statutory Bonus screenshots |
| `screenshots-minimum-wages` | Minimum Wages screenshots |
| `screenshots-vehicle` | Vehicle Maintenance screenshots |
| `screenshots-driver` | Driver Salary screenshots |
| `screenshots-ideal-perf` | Ideal Performance Pay screenshots |
| `screenshots-total-benefits` | Total Benefits screenshots |
| `screenshots-total-fixed` | Total Fixed CTC screenshots |
| `allure-report` | Allure HTML report |

### How to Download Artifacts

1. Go to GitHub repo → **Actions** tab
2. Click on the workflow run
3. Scroll to **Artifacts** section at the bottom
4. Click any artifact to download as ZIP

### Important Limitation — Corporate VPN

The QA URL (`next-gen-eob-ui-qa.teamlease.com`) is **corporate/VPN-only**. GitHub Actions runners (Ubuntu cloud VMs) cannot reach it. Tests will fail on navigation in CI.

**Workarounds:**

| Option | How | Recommended? |
|---|---|---|
| **Run locally + push screenshots** | Run in Git Bash → `git add . && git push` | ✅ Current approach |
| **Self-hosted runner** | Install GitHub Actions runner on office machine with VPN | ✅ Best for CI/CD |
| **Wait for public URL** | Use CI/CD when app moves to staging/prod (public URL) | ✅ Future |

### Running Locally (Current Workflow)

```bash
# Run all specs (takes hours)
npx playwright test tests/Hiring_Tabulation_SalaryCalculator/Script/

# Run specific spec
npx playwright test functional.spec.js
npx playwright test esicValidation.spec.js

# After tests finish, push screenshots to GitHub
git add .
git commit -m "Test execution screenshots"
git push
```

### Full `.yml` File

```yaml
name: Playwright Tests CI/CD Pipeline

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]
  workflow_dispatch:

jobs:
  test-functional:
    name: Functional Tests
    runs-on: ubuntu-latest
    timeout-minutes: 360
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: Run Functional Tests (Chrome + Firefox + WebKit)
        run: npx playwright test functional.spec.js
        continue-on-error: true
      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: screenshots-functional
          path: tests/Hiring_Tabulation_SalaryCalculator/screenshots/Functional/
          retention-days: 30
          if-no-files-found: ignore

  # ... (same pattern for all 12 specs) ...

  generate-report:
    name: Generate Allure Report
    needs: [test-functional, test-esic, test-pf, test-lta, test-meal,
            test-statutory-bonus, test-minimum-wages, test-vehicle,
            test-driver, test-ideal-perf, test-total-benefits, test-total-fixed]
    if: always()
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - name: Generate Allure report
        run: |
          mkdir -p allure-results
          npx allure generate allure-results --clean -o allure-report
      - name: Upload Allure report
        uses: actions/upload-artifact@v4
        with:
          name: allure-report
          path: allure-report/
          retention-days: 30
```

---
