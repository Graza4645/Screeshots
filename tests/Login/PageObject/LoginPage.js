class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Step 1: Username/Email + Continue
    this.usernameInput = page.getByRole('textbox');
    this.continueButton = page.getByRole('button', { name: 'Continue' });

    // Step 2: Password + Login (appears after clicking Continue)
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    // Error message
    this.errorMessage = page.locator('#input-error, .kc-feedback-text, .alert-error, [role="alert"]');
  }

  /**
   * Navigate to the application URL
   * @param {string} url
   */
  async navigate(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Two-step login: username → Continue → password → Sign in
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    // Step 1: Enter username and click Continue
    await this.usernameInput.fill(username);
    await this.continueButton.click();

    // Step 2: Wait for password field, enter password, click Sign in
    await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Click Cancel on login page
   */
  async clickCancel() {
    await this.cancelButton.click();
  }

  /**
   * Check if error message is visible
   * @returns {Promise<boolean>}
   */
  async isErrorVisible() {
    try {
      await this.errorMessage.first().waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get the error message text
   * @returns {Promise<string>}
   */
  async getErrorText() {
    return await this.errorMessage.first().textContent();
  }

  /**
   * Get the page title
   * @returns {Promise<string>}
   */
  async getPageTitle() {
    return await this.page.title();
  }
}

module.exports = LoginPage;
