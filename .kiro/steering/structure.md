# Project Structure & Conventions

## Directory Layout
```
tests/
  {ModuleName}/
    PageObject/         ← Page Object classes (locators + action methods)
    Script/             ← Test spec files (*.spec.js)
    testData/           ← Test data files (JS modules, CSV)
scripts/                ← Utility scripts (e.g., Allure report generator)
.github/workflows/      ← CI/CD pipeline (GitHub Actions)
.kiro/hooks/            ← Kiro agent hooks (auto-heal)
.kiro/settings/         ← MCP server configs
```

## Page Object Model (POM) Pattern
Each test module follows a strict three-folder structure:
- **PageObject/** — One class per page. Contains locators as constructor properties and action methods. Exported via `module.exports`.
- **Script/** — Test specs using `test.describe` blocks. Instantiate page objects in `beforeEach`. One spec file per module.
- **testData/** — All test data externalized here. No hardcoded values in spec or page object files.

## Import Path Convention
From `Script/` files:
- PageObject: `require('../PageObject/PageName')`
- testData: `require('../testData/dataFile')`
- Cross-module: `require('../../OtherModule/PageObject/PageName')`

## Test Naming & Tagging
- Test IDs follow the pattern: `TC_{MODULE}_{NNN}` (e.g., `TC_LOGIN_001`)
- Tags are appended to the test name string: `@smoke`, `@regression`
- Example: `test('TC_LOGIN_001 - Valid login @smoke', ...)`

## Locator Strategy (priority order)
1. **Role-based** — `page.getByRole('button', { name: 'Login' })` (preferred)
2. **Placeholder** — `page.getByPlaceholder('Enter email')`
3. **Label** — `page.getByLabel('Password')`
4. **Test ID** — `page.getByTestId('submit-btn')`
5. **CSS selector** — `page.locator('.error-message')` (last resort)

Never guess locators. Inspect the live page first using Playwright MCP (`browser_navigate` → `browser_snapshot`).

## Allure Reporting Conventions
Tests use `allure-playwright` annotations in specs:
- `allure.epic()`, `allure.feature()`, `allure.story()` for hierarchy
- `allure.severity()` — `critical`, `normal`, `minor`
- `allure.step()` wraps individual actions for detailed report breakdowns
- `allure.tag()` mirrors the `@smoke`/`@regression` tags
- `allure.description()` provides human-readable test purpose

## Adding a New Test Module
1. Create `tests/{ModuleName}/PageObject/`, `Script/`, `testData/`
2. Build the page object class with locators and methods
3. Create a `*.spec.js` file with `test.describe` block
4. Externalize all data into `testData/`
5. Tag tests with `@smoke` or `@regression`
6. Use `TC_{MODULE}_{NNN}` IDs
