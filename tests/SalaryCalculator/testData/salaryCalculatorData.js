// Salary Calculator test data
// IMPORTANT: Replace appUrl with your actual application URL before running tests

const salaryCalculatorData = {
  appUrl: 'https://www.saucedemo.com/inventory.html',

  validScenario: {
    basicSalary: 50000,
    hra: 20000,
    da: 15000,
    specialAllowance: 10000,
    expectedGross: 95000,
  },

  minimumScenario: {
    basicSalary: 10000,
    hra: 5000,
    da: 3000,
    specialAllowance: 2000,
    expectedGross: 20000,
  },

  zeroScenario: {
    basicSalary: 0,
    hra: 0,
    da: 0,
    specialAllowance: 0,
    expectedGross: 0,
  },
};

module.exports = salaryCalculatorData;
