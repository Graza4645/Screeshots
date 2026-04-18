const fs = require('fs');
const path = require('path');

class ReusableMethods {

  // ─────────────────────────────────────────────
  // SCREENSHOT METHODS
  // ─────────────────────────────────────────────

  /**
   * Take a Full HD screenshot using CDP (1920×1080, 2x pixel density)
   * Deletes previous screenshots with same scenario name before saving.
   * @param {import('@playwright/test').Page} page
   * @param {string} directory - Folder path (relative to project root)
   * @param {string} name - Scenario name (used as file prefix)
   * @returns {Promise<string>} Full path of saved screenshot
   */
  static async takeScreenshot(page, directory, name) {
    const dir = path.resolve(directory);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Delete previous screenshots with same scenario name
    const files = fs.readdirSync(dir);
    files.filter(f => f.startsWith(name)).forEach(f => {
      fs.unlinkSync(path.join(dir, f));
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${timestamp}.png`;
    const filePath = path.join(dir, filename);

    // Use CDP to set 1920×1080 at 2x pixel density for true Full HD
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await page.waitForTimeout(300);

    // Improve font rendering
    await page.evaluate(() => {
      document.body.style.webkitFontSmoothing = 'antialiased';
      document.body.style.textRendering = 'optimizeLegibility';
    });
    await page.waitForTimeout(500);

    // Take full-page screenshot
    await page.screenshot({ path: filePath, fullPage: true });

    // Reset to original viewport
    await cdp.send('Emulation.clearDeviceMetricsOverride');
    await cdp.detach();
    await page.evaluate(() => {
      document.body.style.webkitFontSmoothing = '';
      document.body.style.textRendering = '';
    });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(300);

    console.log(`📸 Full HD Screenshot saved: ${directory}/${filename}`);
    return filePath;
  }

  /**
   * Take HD screenshot of a specific element
   * @param {import('@playwright/test').Locator} locator
   * @param {string} directory
   * @param {string} name
   */
  static async takeElementScreenshot(locator, directory, name) {
    const dir = path.resolve(directory);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${name}.png`);
    await locator.screenshot({ path: filePath, type: 'png', scale: 'css', animations: 'disabled' });
    return filePath;
  }

  /**
   * Take auto-timestamped screenshot
   * @param {import('@playwright/test').Page} page
   * @param {string} directory
   * @param {string} [prefix='screenshot']
   */
  static async takeTimestampedScreenshot(page, directory, prefix = 'screenshot') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return await ReusableMethods.takeScreenshot(page, directory, `${prefix}_${timestamp}`);
  }

  /**
   * Take viewport-only HD screenshot (not full page)
   * @param {import('@playwright/test').Page} page
   * @param {string} directory
   * @param {string} name
   */
  static async takeViewportScreenshot(page, directory, name) {
    const dir = path.resolve(directory);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${name}.png`);
    await page.screenshot({ path: filePath, fullPage: false, type: 'png', scale: 'css', animations: 'disabled' });
    return filePath;
  }

  // ─────────────────────────────────────────────
  // WAIT METHODS
  // ─────────────────────────────────────────────

  /**
   * Wait for a specific amount of time (use sparingly)
   * @param {number} ms - Milliseconds to wait
   */
  static async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait for element to be visible
   * @param {import('@playwright/test').Locator} locator
   * @param {number} [timeout=15000]
   */
  static async waitForVisible(locator, timeout = 15000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   * @param {import('@playwright/test').Locator} locator
   * @param {number} [timeout=15000]
   */
  static async waitForHidden(locator, timeout = 15000) {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Wait for page to fully load (network idle)
   * @param {import('@playwright/test').Page} page
   * @param {number} [timeout=30000]
   */
  static async waitForPageLoad(page, timeout = 30000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Wait for URL to contain a specific string
   * @param {import('@playwright/test').Page} page
   * @param {string} urlPart
   * @param {number} [timeout=15000]
   */
  static async waitForUrlContains(page, urlPart, timeout = 15000) {
    await page.waitForURL(`**/*${urlPart}*`, { timeout });
  }

  // ─────────────────────────────────────────────
  // NAVIGATION METHODS
  // ─────────────────────────────────────────────

  /**
   * Navigate to URL and wait for load
   * @param {import('@playwright/test').Page} page
   * @param {string} url
   */
  static async navigateTo(page, url) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Reload the current page
   * @param {import('@playwright/test').Page} page
   */
  static async reloadPage(page) {
    await page.reload({ waitUntil: 'domcontentloaded' });
  }

  /**
   * Go back to previous page
   * @param {import('@playwright/test').Page} page
   */
  static async goBack(page) {
    await page.goBack({ waitUntil: 'domcontentloaded' });
  }

  /**
   * Get current page URL
   * @param {import('@playwright/test').Page} page
   * @returns {string}
   */
  static getCurrentUrl(page) {
    return page.url();
  }

  /**
   * Get current page title
   * @param {import('@playwright/test').Page} page
   * @returns {Promise<string>}
   */
  static async getPageTitle(page) {
    return await page.title();
  }

  // ─────────────────────────────────────────────
  // ELEMENT INTERACTION METHODS
  // ─────────────────────────────────────────────

  /**
   * Click an element with auto-wait
   * @param {import('@playwright/test').Locator} locator
   */
  static async click(locator) {
    await locator.click();
  }

  /**
   * Double-click an element
   * @param {import('@playwright/test').Locator} locator
   */
  static async doubleClick(locator) {
    await locator.dblclick();
  }

  /**
   * Right-click an element
   * @param {import('@playwright/test').Locator} locator
   */
  static async rightClick(locator) {
    await locator.click({ button: 'right' });
  }

  /**
   * Fill a text field (clears existing text first)
   * @param {import('@playwright/test').Locator} locator
   * @param {string} text
   */
  static async fill(locator, text) {
    await locator.fill(text);
  }

  /**
   * Type text character by character (triggers key events)
   * @param {import('@playwright/test').Locator} locator
   * @param {string} text
   */
  static async typeText(locator, text) {
    await locator.pressSequentially(text, { delay: 50 });
  }

  /**
   * Clear a text field
   * @param {import('@playwright/test').Locator} locator
   */
  static async clearField(locator) {
    await locator.fill('');
  }

  /**
   * Hover over an element
   * @param {import('@playwright/test').Locator} locator
   */
  static async hover(locator) {
    await locator.hover();
  }

  /**
   * Select option from dropdown by value
   * @param {import('@playwright/test').Locator} locator
   * @param {string} value
   */
  static async selectByValue(locator, value) {
    await locator.selectOption({ value });
  }

  /**
   * Select option from dropdown by visible text
   * @param {import('@playwright/test').Locator} locator
   * @param {string} label
   */
  static async selectByLabel(locator, label) {
    await locator.selectOption({ label });
  }

  /**
   * Select option from dropdown by index
   * @param {import('@playwright/test').Locator} locator
   * @param {number} index
   */
  static async selectByIndex(locator, index) {
    await locator.selectOption({ index });
  }

  /**
   * Check a checkbox (only if not already checked)
   * @param {import('@playwright/test').Locator} locator
   */
  static async check(locator) {
    await locator.check();
  }

  /**
   * Uncheck a checkbox (only if checked)
   * @param {import('@playwright/test').Locator} locator
   */
  static async uncheck(locator) {
    await locator.uncheck();
  }

  /**
   * Press a keyboard key
   * @param {import('@playwright/test').Page} page
   * @param {string} key - e.g., 'Enter', 'Tab', 'Escape', 'ArrowDown'
   */
  static async pressKey(page, key) {
    await page.keyboard.press(key);
  }

  /**
   * Upload a file to a file input
   * @param {import('@playwright/test').Locator} locator
   * @param {string} filePath - Absolute or relative path to file
   */
  static async uploadFile(locator, filePath) {
    await locator.setInputFiles(filePath);
  }

  // ─────────────────────────────────────────────
  // ELEMENT STATE METHODS
  // ─────────────────────────────────────────────

  /**
   * Check if element is visible
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<boolean>}
   */
  static async isVisible(locator) {
    return await locator.isVisible();
  }

  /**
   * Check if element is enabled
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<boolean>}
   */
  static async isEnabled(locator) {
    return await locator.isEnabled();
  }

  /**
   * Check if checkbox/radio is checked
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<boolean>}
   */
  static async isChecked(locator) {
    return await locator.isChecked();
  }

  /**
   * Get text content of an element
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<string>}
   */
  static async getText(locator) {
    return await locator.textContent();
  }

  /**
   * Get inner text of an element (visible text only)
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<string>}
   */
  static async getInnerText(locator) {
    return await locator.innerText();
  }

  /**
   * Get input field value
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<string>}
   */
  static async getInputValue(locator) {
    return await locator.inputValue();
  }

  /**
   * Get attribute value of an element
   * @param {import('@playwright/test').Locator} locator
   * @param {string} attribute
   * @returns {Promise<string|null>}
   */
  static async getAttribute(locator, attribute) {
    return await locator.getAttribute(attribute);
  }

  /**
   * Get count of matching elements
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<number>}
   */
  static async getCount(locator) {
    return await locator.count();
  }

  // ─────────────────────────────────────────────
  // FRAME & TAB METHODS
  // ─────────────────────────────────────────────

  /**
   * Switch to iframe by locator
   * @param {import('@playwright/test').Page} page
   * @param {string} selector - CSS selector for the iframe
   * @returns {import('@playwright/test').FrameLocator}
   */
  static getFrame(page, selector) {
    return page.frameLocator(selector);
  }

  /**
   * Handle new tab/popup and return the new page
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').Locator} triggerLocator - Element that opens new tab
   * @returns {Promise<import('@playwright/test').Page>}
   */
  static async handleNewTab(page, triggerLocator) {
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      triggerLocator.click(),
    ]);
    await newPage.waitForLoadState('domcontentloaded');
    return newPage;
  }

  // ─────────────────────────────────────────────
  // SCROLL METHODS
  // ─────────────────────────────────────────────

  /**
   * Scroll to top of page
   * @param {import('@playwright/test').Page} page
   */
  static async scrollToTop(page) {
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  /**
   * Scroll to bottom of page
   * @param {import('@playwright/test').Page} page
   */
  static async scrollToBottom(page) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /**
   * Scroll element into view
   * @param {import('@playwright/test').Locator} locator
   */
  static async scrollIntoView(locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  // ─────────────────────────────────────────────
  // ALERT / DIALOG METHODS
  // ─────────────────────────────────────────────

  /**
   * Auto-dismiss all dialogs (alerts/confirms/prompts) with Cancel
   * Call this once per page — handles all future dialogs automatically
   * @param {import('@playwright/test').Page} page
   */
  static autoDismissDialogs(page) {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  }

  /**
   * Auto-accept all dialogs (alerts/confirms/prompts) with OK
   * Call this once per page — handles all future dialogs automatically
   * @param {import('@playwright/test').Page} page
   */
  static autoAcceptDialogs(page) {
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
  }

  /**
   * Accept the next dialog (alert/confirm/prompt) — one-time only
   * @param {import('@playwright/test').Page} page
   * @param {string} [promptText] - Text to enter for prompt dialogs
   */
  static async acceptDialog(page, promptText) {
    page.once('dialog', async (dialog) => {
      if (promptText) {
        await dialog.accept(promptText);
      } else {
        await dialog.accept();
      }
    });
  }

  /**
   * Dismiss the next dialog
   * @param {import('@playwright/test').Page} page
   */
  static async dismissDialog(page) {
    page.once('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  }

  // ─────────────────────────────────────────────
  // TABLE METHODS
  // ─────────────────────────────────────────────

  /**
   * Get all rows from a table
   * @param {import('@playwright/test').Page} page
   * @param {string} tableSelector - CSS selector for the table
   * @returns {Promise<string[][]>} Array of rows, each row is array of cell texts
   */
  static async getTableData(page, tableSelector) {
    return await page.evaluate((selector) => {
      const rows = document.querySelectorAll(`${selector} tr`);
      return Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td, th');
        return Array.from(cells).map(cell => cell.textContent.trim());
      });
    }, tableSelector);
  }

  /**
   * Get specific cell value from a table
   * @param {import('@playwright/test').Page} page
   * @param {string} tableSelector
   * @param {number} row - Row index (0-based)
   * @param {number} col - Column index (0-based)
   * @returns {Promise<string>}
   */
  static async getTableCell(page, tableSelector, row, col) {
    const data = await ReusableMethods.getTableData(page, tableSelector);
    return data[row] && data[row][col] ? data[row][col] : '';
  }

  // ─────────────────────────────────────────────
  // LOCAL STORAGE & COOKIES
  // ─────────────────────────────────────────────

  /**
   * Get a value from localStorage
   * @param {import('@playwright/test').Page} page
   * @param {string} key
   * @returns {Promise<string|null>}
   */
  static async getLocalStorage(page, key) {
    return await page.evaluate((k) => localStorage.getItem(k), key);
  }

  /**
   * Set a value in localStorage
   * @param {import('@playwright/test').Page} page
   * @param {string} key
   * @param {string} value
   */
  static async setLocalStorage(page, key, value) {
    await page.evaluate(({ k, v }) => localStorage.setItem(k, v), { k: key, v: value });
  }

  /**
   * Get all cookies
   * @param {import('@playwright/test').Page} page
   * @returns {Promise<Array>}
   */
  static async getCookies(page) {
    return await page.context().cookies();
  }

  /**
   * Clear all cookies
   * @param {import('@playwright/test').Page} page
   */
  static async clearCookies(page) {
    await page.context().clearCookies();
  }

  // ─────────────────────────────────────────────
  // UTILITY METHODS
  // ─────────────────────────────────────────────

  /**
   * Generate a random string
   * @param {number} [length=10]
   * @returns {string}
   */
  static generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate a random email
   * @param {string} [domain='test.com']
   * @returns {string}
   */
  static generateRandomEmail(domain = 'test.com') {
    return `user_${ReusableMethods.generateRandomString(8)}@${domain}`;
  }

  /**
   * Generate a random number between min and max
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  static generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get today's date in a specific format
   * @param {string} [format='YYYY-MM-DD'] - Supports YYYY-MM-DD, DD/MM/YYYY, MM-DD-YYYY
   * @returns {string}
   */
  static getToday(format = 'YYYY-MM-DD') {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    switch (format) {
      case 'DD/MM/YYYY': return `${dd}/${mm}/${yyyy}`;
      case 'MM-DD-YYYY': return `${mm}-${dd}-${yyyy}`;
      default: return `${yyyy}-${mm}-${dd}`;
    }
  }
}

module.exports = ReusableMethods;
