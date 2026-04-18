const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const SalaryCalculatorPage = require('../PageObject/SalaryCalculatorPage');
const salaryData = require('../testData/salaryCalculatorData');
const ReusableMethods = require('../../Utils/ReusableMethods');

test.describe('Salary Calculator Module', () => {
  let salaryPage;

  test.beforeEach(async ({ page }) => {
    salaryPage = new SalaryCalculatorPage(page);
    await allure.epic('Payroll');
    await allure.feature('Salary Calculator');
    await allure.owner('QA Team');
    await salaryPage.navigate(salaryData.appUrl);
  });

  test.afterEach(async ({ page }, testInfo) => {
    const status = testInfo.status;
    const testName = testInfo.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    await ReusableMethods.takeScreenshot(page, 'screenshots/SalaryCalculator', `${testName}_${status}`);
  });

  test.skip('TC_SALARY_001 - Valid salary calculation @smoke', async ({ page }) => {
    await allure.severity('critical');
    await allure.story('Gross Salary Calculation');
    await allure.description('Verify gross salary = Basic + HRA + DA + Special Allowance for valid inputs.');
    await allure.tag('smoke');
    await allure.tag('calculation');

    const data = salaryData.validScenario;

    await allure.step(`Enter Basic Salary: ${data.basicSalary}`, async () => {
      await salaryPage.basicSalaryInput.fill(String(data.basicSalary));
    });

    await allure.step(`Enter HRA: ${data.hra}`, async () => {
      await salaryPage.hraInput.fill(String(data.hra));
    });

    await allure.step(`Enter DA: ${data.da}`, async () => {
      await salaryPage.daInput.fill(String(data.da));
    });

    await allure.step(`Enter Special Allowance: ${data.specialAllowance}`, async () => {
      await salaryPage.specialAllowanceInput.fill(String(data.specialAllowance));
    });

    await allure.step('Click Calculate', async () => {
      await salaryPage.calculateButton.click();
    });

    await allure.step(`Verify gross salary equals ${data.expectedGross}`, async () => {
      const grossSalary = await salaryPage.getGrossSalary();
      expect(Number(grossSalary.replace(/[^0-9.-]/g, ''))).toBe(data.expectedGross);
    });
  });

  test.skip('TC_SALARY_002 - Minimum salary values @regression', async ({ page }) => {
    await allure.severity('normal');
    await allure.story('Minimum Values');
    await allure.description('Verify salary calculation works with minimum boundary values.');
    await allure.tag('regression');
    await allure.tag('boundary');

    const data = salaryData.minimumScenario;
    await salaryPage.calculateSalary(data.basicSalary, data.hra, data.da, data.specialAllowance);
    const grossSalary = await salaryPage.getGrossSalary();
    expect(Number(grossSalary.replace(/[^0-9.-]/g, ''))).toBe(data.expectedGross);
  });

  test.skip('TC_SALARY_003 - Zero values for all fields @regression', async ({ page }) => {
    await allure.severity('minor');
    await allure.story('Zero Values');
    await allure.description('Verify salary calculation handles all-zero inputs correctly.');
    await allure.tag('regression');
    await allure.tag('edge-case');

    const data = salaryData.zeroScenario;
    await salaryPage.calculateSalary(data.basicSalary, data.hra, data.da, data.specialAllowance);
    const grossSalary = await salaryPage.getGrossSalary();
    expect(Number(grossSalary.replace(/[^0-9.-]/g, ''))).toBe(data.expectedGross);
  });
});
