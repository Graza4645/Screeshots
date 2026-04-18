class SalaryCalculatorPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Locators — update these after inspecting the actual page with MCP Playwright
    this.basicSalaryInput = page.getByRole('textbox', { name: 'Basic Salary' });
    this.hraInput = page.getByRole('textbox', { name: 'HRA' });
    this.daInput = page.getByRole('textbox', { name: 'DA' });
    this.specialAllowanceInput = page.getByRole('textbox', { name: 'Special Allowance' });
    this.calculateButton = page.getByRole('button', { name: 'Calculate' });
    this.grossSalaryResult = page.locator('.gross-salary-result');
    this.errorMessage = page.locator('.error-message');
  }

  /**
   * Navigate to the salary calculator page
   * @param {string} url
   */
  async navigate(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Fill in salary components and calculate
   * @param {string|number} basicSalary
   * @param {string|number} hra
   * @param {string|number} da
   * @param {string|number} specialAllowance
   */
  async calculateSalary(basicSalary, hra, da, specialAllowance) {
    await this.basicSalaryInput.fill(String(basicSalary));
    await this.hraInput.fill(String(hra));
    await this.daInput.fill(String(da));
    await this.specialAllowanceInput.fill(String(specialAllowance));
    await this.calculateButton.click();
  }

  /**
   * Get the gross salary result text
   * @returns {Promise<string>}
   */
  async getGrossSalary() {
    return await this.grossSalaryResult.textContent();
  }

  /**
   * Check if error message is visible
   * @returns {Promise<boolean>}
   */
  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }

  /**
   * Get the error message text
   * @returns {Promise<string>}
   */
  async getErrorText() {
    return await this.errorMessage.textContent();
  }

  /**
   * Get the page title
   * @returns {Promise<string>}
   */
  async getPageTitle() {
    return await this.page.title();
  }
}

module.exports = SalaryCalculatorPage;
