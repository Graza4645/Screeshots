# Tech Stack & Build System

## Runtime
- **Node.js** v22+ with **npm**
- **Language:** JavaScript (CommonJS modules — use `require`/`module.exports`, not ES module `import`/`export`)

## Core Dependencies
| Package | Purpose |
|---|---|
| `@playwright/test` | Test runner and browser automation |
| `allure-playwright` | Allure reporter integration for Playwright |
| `allure-commandline` | CLI to generate and open Allure HTML reports |
| `dotenv` | Load environment variables from `.env` |
| `cross-env` | Cross-platform env variable setting |

## Browser
- **Chromium only** (single project in playwright.config.js)
- Install with: `npx playwright install chromium`

## Common Commands

### Running Tests
```bash
npm test                          # Run all tests
npm run test:headed               # Run with visible browser
npm run test:smoke                # Run @smoke tagged tests
npm run test:regression           # Run @regression tagged tests
npm run test:login                # Run Login module only
npm run test:salary               # Run Salary Calculator module only
npm run test:debug                # Debug mode
npm run test:last-failed          # Re-run only previously failed tests
```

### Reports
```bash
npm run report                    # Open Playwright HTML report
npm run report:allure             # Generate and open Allure report
npm run report:allure:generate    # Generate Allure report only
npm run report:allure:open        # Open existing Allure report
```

### Windows PowerShell Workaround
PowerShell may block `npx` due to execution policy. Use:
```bash
cmd /c "npx playwright test"
```

## Key Config Settings (playwright.config.js)
- `testMatch: '**/*.spec.js'` — only `.spec.js` files are picked up
- `fullyParallel: false`, `workers: 1` — sequential execution
- `retries: 1` locally, `2` in CI
- `headless: true` by default
- Screenshots, video, and trace captured only on failure
- `actionTimeout: 15000ms`, `navigationTimeout: 30000ms`
