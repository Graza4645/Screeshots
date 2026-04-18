# Product Overview

This is a **Playwright POM (Page Object Model) Automation Framework** for end-to-end UI testing.

- **Target application:** [Sauce Demo](https://www.saucedemo.com) — a sample e-commerce site
- **Test modules:** Login and Salary Calculator (Salary Calculator is currently skipped — no real target app)
- **Integrations:** Jira MCP for ticket-based test generation, Playwright MCP for live page inspection
- **Reporting:** Playwright HTML reports and Allure reports with history/trend tracking
- **Auto-heal:** A Kiro hook (`agentStop`) that detects test failures, diagnoses root causes, fixes code, and re-runs failed tests automatically
- **CI/CD:** GitHub Actions pipeline that runs tests, retries failures, generates Allure reports, and deploys them to GitHub Pages
- **Environment support:** Multi-environment via `.env` file (QA, DEV, STAGING, UAT, PROD, SAUCEDEMO)
