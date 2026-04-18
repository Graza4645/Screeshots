/**
 * Allure Report Generator with History & Environment Preservation
 * 
 * This script:
 * 1. Copies history from the previous allure-report into allure-results (enables Trend graph)
 * 2. Copies environment.properties into allure-results (shows Environment tab in report)
 * 3. Generates a new Allure report
 * 
 * Usage: node scripts/allure-report.js [generate|open|both]
 */

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

function copyEnvironment() {
  if (fs.existsSync(ENV_FILE)) {
    if (!fs.existsSync(ALLURE_RESULTS)) {
      fs.mkdirSync(ALLURE_RESULTS, { recursive: true });
    }
    fs.copyFileSync(ENV_FILE, ENV_DEST);
    console.log('✅ Copied environment.properties (shows Environment tab in report)');
  } else {
    console.log('ℹ️  No allure-environment.properties found — Environment tab will be empty');
  }
}

function copyCategories() {
  if (fs.existsSync(CATEGORIES_FILE)) {
    if (!fs.existsSync(ALLURE_RESULTS)) {
      fs.mkdirSync(ALLURE_RESULTS, { recursive: true });
    }
    fs.copyFileSync(CATEGORIES_FILE, CATEGORIES_DEST);
    console.log('✅ Copied categories.json (classifies failures in Categories tab)');
  } else {
    console.log('ℹ️  No allure-categories.json found — Categories tab will use defaults');
  }
}

function copyExecutor() {
  if (fs.existsSync(EXECUTOR_FILE)) {
    if (!fs.existsSync(ALLURE_RESULTS)) {
      fs.mkdirSync(ALLURE_RESULTS, { recursive: true });
    }
    // Read executor config and auto-increment buildOrder
    const executor = JSON.parse(fs.readFileSync(EXECUTOR_FILE, 'utf-8'));
    const existingExecutor = path.join(ALLURE_RESULTS, 'executor.json');
    if (fs.existsSync(existingExecutor)) {
      const prev = JSON.parse(fs.readFileSync(existingExecutor, 'utf-8'));
      executor.buildOrder = (prev.buildOrder || 0) + 1;
    }
    executor.buildName = `Playwright POM Automation #${executor.buildOrder}`;
    fs.writeFileSync(EXECUTOR_DEST, JSON.stringify(executor, null, 2));
    console.log(`✅ Copied executor.json (build #${executor.buildOrder} — shows Executors tab)`);
  } else {
    console.log('ℹ️  No allure-executor.json found — Executors tab will be empty');
  }
}

function generate() {
  console.log('📊 Generating Allure report...');
  copyHistory();
  copyEnvironment();
  copyCategories();
  copyExecutor();
  execSync('npx allure generate allure-results --clean -o allure-report', {
    stdio: 'inherit',
    cwd: ROOT,
  });
  console.log('✅ Report generated at allure-report/');
}

function open() {
  console.log('🌐 Opening Allure report in browser...');
  execSync('npx allure open allure-report', {
    stdio: 'inherit',
    cwd: ROOT,
  });
}

try {
  if (action === 'generate') {
    generate();
  } else if (action === 'open') {
    open();
  } else {
    generate();
    open();
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
