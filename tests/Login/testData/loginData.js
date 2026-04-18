// Login test data — reads from .env file

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
