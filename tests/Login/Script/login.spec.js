const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const LoginPage = require('../PageObject/LoginPage');
const loginData = require('../testData/loginData');
const ReusableMethods = require('../../Utils/ReusableMethods');

test.describe('Login Module', () => {
  let loginPage;
  let scenarioDir;

  test.beforeEach(async ({ page }, testInfo) => {
    loginPage = new LoginPage(page);
    const scenarioName = testInfo.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    scenarioDir = `tests/Login/screenshots/${scenarioName}`;

    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.owner('QA Team');
    await loginPage.navigate(loginData.appUrl);
  });

  test.afterEach(async ({ page }, testInfo) => {
    const status = testInfo.status;
    await ReusableMethods.takeScreenshot(page, scenarioDir, `Final_${status}`);
  });

  test('TC_LOGIN_001 - Valid login @smoke', async ({ page }) => {
    await allure.severity('critical');
    await allure.story('Valid Credentials');
    await allure.description('Verify user can login with valid credentials via two-step Keycloak flow (username → Continue → password → Sign in).');
    await allure.tag('smoke');
    await allure.tag('login');

    await allure.step('Enter username and click Continue', async () => {
      await loginPage.usernameInput.fill(loginData.validUser.username);
      await loginPage.continueButton.click();
    });

    await allure.step('Wait for password field and enter password', async () => {
      await loginPage.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
      await loginPage.passwordInput.fill(loginData.validUser.password);
    });

    await allure.step('Click Login button', async () => {
      await loginPage.loginButton.click();
    });

    await allure.step('Verify login successful', async () => {
      await page.waitForLoadState('domcontentloaded');
      await ReusableMethods.takeScreenshot(page, scenarioDir, 'Validation_login_successful');
    });
  });

  test.skip('TC_LOGIN_002 - Invalid login shows error @regression', async ({ page }) => {
    await allure.severity('normal');
    await allure.story('Invalid Credentials');
    await allure.description('Verify that entering invalid credentials shows an error message.');
    await allure.tag('regression');
    await allure.tag('negative');

    await allure.step('Enter invalid username and click Continue', async () => {
      await loginPage.usernameInput.fill(loginData.invalidUser.username);
      await loginPage.continueButton.click();
    });

    await allure.step('Enter invalid password and click Sign in', async () => {
      await loginPage.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
      await loginPage.passwordInput.fill(loginData.invalidUser.password);
      await loginPage.loginButton.click();
    });

    await allure.step('Verify error message is visible', async () => {
      const isError = await loginPage.isErrorVisible();
      expect(isError).toBeTruthy();
      await ReusableMethods.takeScreenshot(page, scenarioDir, 'Validation_error_visible');
    });
  });

  test.skip('TC_LOGIN_003 - Empty username and password @regression', async ({ page }) => {
    await allure.severity('minor');
    await allure.story('Empty Credentials');
    await allure.description('Verify that submitting empty username shows a validation error.');
    await allure.tag('regression');
    await allure.tag('boundary');

    await allure.step('Leave username empty and click Continue', async () => {
      await loginPage.usernameInput.fill(loginData.emptyCredentials.username);
      await loginPage.continueButton.click();
    });

    await allure.step('Verify error message is visible', async () => {
      const isError = await loginPage.isErrorVisible();
      expect(isError).toBeTruthy();
      await ReusableMethods.takeScreenshot(page, scenarioDir, 'Validation_error_visible');
    });
  });
});
