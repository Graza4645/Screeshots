# Salary Calculator — Validation Summary

**Module:** Hiring Tabulation → Salary Calculator  
**URL:** https://next-gen-eob-ui-qa.teamlease.com/salary-calculator  
**User:** thr_recruiter / 12345  

---

## Spec Files Overview

| # | Spec File | What it Validates | Screenshot Folder |
|---|-----------|-------------------|-------------------|
| 1 | `functional.spec.js` | Basic + HRA + GMC & GPA + GTLI + Gratuity + Statutory Bonus (all together) | `screenshots/Functional/` |
| 2 | `idealPerformancePay.spec.js` | Ideal Performance Pay message | `screenshots/IdealPerfPay/` |
| 3 | `pfValidation.spec.js` | Employee PF Contribution | `screenshots/PF/` |
| 4 | `statutoryBonusValidation.spec.js` | Statutory Bonus (dedicated with ₹4L and ₹9L inputs) | `screenshots/StatutoryBonus/` |
| 5 | `ltaValidation.spec.js` | LTA (Leave Travel Allowance) | `screenshots/LTA/` |
| 6 | `mealAllowanceValidation.spec.js` | Meal Allowance | `screenshots/MealAllowance/` |
| 7 | `esicValidation.spec.js` | Employer's ESI Contribution | `screenshots/ESIC/` |
| 8 | `driverSalaryValidation.spec.js` | Driver Salary | `screenshots/DriverSalary/` |
| 9 | `vehicleMaintenanceValidation.spec.js` | Vehicle Maintenance | `screenshots/VehicleMaintenance/` |
| 10 | `minimumWagesValidation.spec.js` | Minimum Wages | `screenshots/MinimumWages/` |
| 11 | `totalFixedCTCValidation.spec.js` | Total Benefits + Total Fixed (A) + Total CTC (A+B) | `screenshots/TotalFixedCTC/` |
| 12 | `totalBenefitsValidation.spec.js` | Total Benefits (with scroll) — Gratuity + GMC & GPA + GTLI | `screenshots/TotalBenefits/` |

---

## 1. Basic Salary (`functional.spec.js`)

**What is Basic?**  
Basic is the core salary component. It is always 40% of the Annual Fixed amount.

**How it is calculated:**
- Step 1: Take Annual Fixed (e.g. ₹5,00,000)
- Step 2: Monthly Basic = round(Annual Fixed × 40% ÷ 12)
- Step 3: Yearly Basic = Monthly Basic × 12

**Example:**
- Annual Fixed = ₹5,00,000
- Monthly Basic = round(5,00,000 × 0.40 ÷ 12) = round(16,666.67) = **₹16,667**
- Yearly Basic = 16,667 × 12 = **₹2,00,004**

**Rounding Rule:** If decimal is 0.5 or more → round up. Less than 0.5 → round down.  
**Tolerance:** None — must match exactly.  
**Screenshot Color:** 🔵 Blue border = PASS, 🔴 Red border = FAIL

---

## 2. HRA — House Rent Allowance (`functional.spec.js`)

**What is HRA?**  
HRA is a percentage of Basic salary. The percentage depends on whether the city is a Metro or Non-Metro.

**How it is calculated:**
- Step 1: Get Monthly Basic (from validation #1 above)
- Step 2: Check if city is Metro or Non-Metro
- Step 3: Monthly HRA = round(Monthly Basic × HRA%)
- Step 4: Yearly HRA = Monthly HRA × 12

**Metro vs Non-Metro:**

| City | HRA % |
|------|-------|
| Mumbai | 50% of Basic |
| Chennai | 50% of Basic |
| Kolkata | 50% of Basic |
| Delhi | 50% of Basic |
| **All other cities** | **40% of Basic** |


**Example (Non-Metro — Bengaluru, HRA 40%):**
- Monthly Basic = ₹16,667
- Monthly HRA = round(16,667 × 0.40) = round(6,666.8) = **₹6,667**
- Yearly HRA = 6,667 × 12 = **₹80,004**

**Example (Metro — Mumbai, HRA 50%):**
- Monthly Basic = ₹16,667
- Monthly HRA = round(16,667 × 0.50) = round(8,333.5) = **₹8,334**
- Yearly HRA = 8,334 × 12 = **₹1,00,008**

**Tolerance:** None — must match exactly.  
**Screenshot Color:** 🟣 Purple border = PASS, 🔴 Red border = FAIL

---

## 3. GMC & GPA Premium (`functional.spec.js`)

**What is GMC & GPA?**  
GMC (Group Medical Coverage) and GPA (Group Personal Accident) is a fixed yearly premium. It depends only on the Level — not on Category or Location.

**How it is calculated:**  
It is a fixed amount per year based on Level:

| Level | GMC & GPA Premium (Per Year) |
|-------|------------------------------|
| LST | ₹6,000 |
| L10 | ₹6,000 |
| L9 | ₹2,000 |
| L8 | ₹2,000 |
| L7 | ₹2,000 |
| L6 | ₹2,000 |
| L5 | ₹2,000 |
| L4 | ₹2,000 |
| L3 | ₹2,000 |
| L2 | ₹2,000 |
| L1 | ₹2,000 |

**Simple Rule:** LST and L10 get ₹6,000/year. Everyone else gets ₹2,000/year.  
**Tolerance:** None — must match exactly.  
**Screenshot Color:** 🟠 Orange border = PASS, 🔴 Red border = FAIL

---

## 4. GTLI Premium (`functional.spec.js`)

**What is GTLI?**  
GTLI (Group Term Life Insurance) is a fixed yearly premium. It depends only on the Level.

**How it is calculated:**  
Fixed amount per year based on Level:

| Level | GTLI Premium (Per Year) |
|-------|-------------------------|
| LST | ₹18,000 |
| L10 | ₹18,000 |
| L9 | ₹10,000 |
| L8 | ₹10,000 |
| L7 | ₹4,000 |
| L6 | ₹4,000 |
| L5 | ₹4,000 |
| L4 | ₹2,000 |
| L3 | ₹2,000 |
| L2 | ₹2,000 |
| L1 | ₹2,000 |

**Simple Rule:** Higher levels get higher GTLI. LST/L10 = ₹18K, L8/L9 = ₹10K, L5-L7 = ₹4K, L1-L4 = ₹2K.  
**Tolerance:** None — must match exactly.  
**Screenshot Color:** 🟢 Teal border = PASS, 🔴 Red border = FAIL

---

## 5. Employer's Gratuity Contribution (`functional.spec.js`)

**What is Gratuity?**  
Gratuity is the employer's contribution towards the employee's gratuity fund. It is always 4.81% of Monthly Basic.

**How it is calculated:**
- Step 1: Get Monthly Basic
- Step 2: Monthly Gratuity = round(Monthly Basic × 4.81%)
- Step 3: Yearly Gratuity = Monthly Gratuity × 12

**Example:**
- Monthly Basic = ₹16,667
- Monthly Gratuity = round(16,667 × 0.0481) = round(801.68) = **₹802**
- Yearly Gratuity = 802 × 12 = **₹9,624**

**Rule:** Same formula for ALL levels. No exceptions.  
**Tolerance:** None — must match exactly.  
**Screenshot Color:** 🟩 Green border = PASS, 🔴 Red border = FAIL

---

## 6. Statutory Bonus (`functional.spec.js` + `statutoryBonusValidation.spec.js`)

**What is Statutory Bonus?**  
Statutory Bonus is a fixed monthly amount paid to employees whose Basic salary is ₹21,000 or less.

**How it is calculated:**

| Condition | Monthly Bonus | Yearly Bonus |
|-----------|--------------|-------------|
| Monthly Basic ≤ ₹21,000 | ₹1,750 | ₹21,000 |
| Monthly Basic > ₹21,000 | ₹0 | ₹0 |


**Dedicated spec uses two Annual Fixed amounts to test both cases:**

| Annual Fixed | Monthly Basic | Expected Bonus |
|-------------|--------------|----------------|
| ₹4,00,000 | ₹13,333 (≤ 21,000) | ₹1,750/month ✅ |
| ₹9,00,000 | ₹30,000 (> 21,000) | ₹0/month ✅ |

**Tolerance:** None — must match exactly.  
**Screenshot Color:** 💗 Pink border = PASS, 🔴 Red border = FAIL

---

## 7. Ideal Performance Pay (`idealPerformancePay.spec.js`)

**What is Ideal Performance Pay?**  
It is a suggested performance pay amount shown as a message below the Annual Performance Pay input. It is calculated as a percentage of Annual Fixed, and the percentage depends on the Category + Level combination.

**How it works:**
- Enter Annual Performance Pay = ₹1,00,00,000 (1 crore) to trigger the message
- If the Category + Level has a percentage → message shows: "Ideal Performance Pay for this salary is ₹X"
- If the combination is NA → message shows: "Ideal Performance Pay Not Applicable"
- No Calculate button click needed — message appears automatically after filling

**Percentage Table:**

| Level | Sales & AM | Non Sales - Tech | Non Sales - Rest |
|-------|-----------|-----------------|-----------------|
| LST | 40% | 30% | 30% |
| L10 | 40% | 30% | 30% |
| L9 | 30% | 25% | 25% |
| L8 | 25% | 20% | 20% |
| L7 | NA | 15% | 15% |
| L6 | NA | 15% | 15% |
| L5 | NA | 15% | 15% |
| L4 | NA | 15% | 15% |
| L3 | NA | 12% | 12% |
| L2 | NA | 12% | 12% |
| L1 | NA | NA | NA |

**Example:**
- Annual Fixed = ₹5,00,000, Level = LST, Category = Sales & AM
- Expected = 40% of 5,00,000 = **₹2,00,000**
- Message: "Ideal Performance Pay for this salary is ₹2,00,000(two lakh)"

**Validation:** Extract the ₹ amount from the message and compare with expected.  
**Locations:** Hyderabad, Jharkhand  
**Screenshot Color:** 🟩 Green = PASS, 🔴 Red = FAIL, 🟧 Orange = NA (Not Applicable)

---

## 8. Employee PF Contribution (`pfValidation.spec.js`)

**What is PF?**  
PF (Provident Fund) is the employer's contribution to the employee's retirement fund. The calculation depends on Monthly CTC, Basic salary, and whether PF is capped.

**How it is calculated (3 conditions):**

**Condition 1: Monthly CTC ≤ ₹22,800**
- PF = round(12% × (Basic + ((MonthlyCTC - 115.25%×Basic - 103.25%×HRA - 103.25%×OtherAllowances) / 115.25%)))

**Condition 2: Monthly CTC > ₹22,800 AND PF Capped = "Yes"**
- If Basic ≥ ₹15,000 → PF = ₹1,800 (flat cap)
- If Basic < ₹15,000 → Calculate PF, but cap at ₹1,800 maximum

**Condition 3: Monthly CTC > ₹22,800 AND PF Capped = "No"**
- If Basic ≥ ₹15,000 → PF = round(12% × Basic)
- If Basic < ₹15,000 → PF = round(12% × (Basic + remainder))

**Test Sets:**

| Set | Annual Fixed | PF Capped | Which Condition |
|-----|-------------|-----------|-----------------|
| 1 | ₹5,00,000 | Yes | Condition 2 (MonthlyCTC ₹41,667 > 22,800) |
| 2 | ₹15,000 | No | Condition 1 (MonthlyCTC ₹1,250 ≤ 22,800) |

**Tolerance:** None — must match exactly.  
**Screenshot Color:** 🔷 Cyan border = PASS, 🔴 Red border = FAIL

---

## 9. LTA — Leave Travel Allowance (`ltaValidation.spec.js`)

**What is LTA?**  
LTA is a monthly allowance for travel. The amount depends on the Monthly Fixed salary and whether Meal Allowance is enabled.

**How it is calculated:**

**If Meal Allowance = "Yes":**

| Monthly Fixed Range | LTA (Monthly) |
|--------------------|---------------|
| ₹41,800 to ₹83,333 | ₹2,000 |
| ₹83,334 to ₹1,66,667 | ₹3,000 |
| Above ₹1,66,667 | ₹4,000 |
| Below ₹41,800 | ₹0 |

**If Meal Allowance = "No":**

| Monthly Fixed Range | LTA (Monthly) |
|--------------------|---------------|
| ₹42,017 to ₹83,333 | ₹2,000 |
| ₹83,334 to ₹1,66,667 | ₹3,000 |
| Above ₹1,66,667 | ₹4,000 |
| Below ₹42,017 | ₹0 |

**Note:** The only difference between Meal Yes/No is the lower threshold: ₹41,800 vs ₹42,017.

**Test Sets (8 sets covering all brackets × Meal Yes/No):**

| Annual Fixed | Monthly Fixed | Meal | Expected LTA |
|-------------|--------------|------|-------------|
| ₹3,00,000 | ₹25,000 | Yes | ₹0 |
| ₹3,00,000 | ₹25,000 | No | ₹0 |
| ₹6,00,000 | ₹50,000 | Yes | ₹2,000 |
| ₹6,00,000 | ₹50,000 | No | ₹2,000 |
| ₹12,00,000 | ₹1,00,000 | Yes | ₹3,000 |
| ₹12,00,000 | ₹1,00,000 | No | ₹3,000 |
| ₹40,00,000 | ₹3,33,333 | Yes | ₹4,000 |
| ₹40,00,000 | ₹3,33,333 | No | ₹4,000 |

**Tolerance:** None — must match exactly.  
**Screenshot Color:** 🟤 Brown border = PASS, 🔴 Red border = FAIL

---

## 10. Meal Allowance (`mealAllowanceValidation.spec.js`)

**What is Meal Allowance?**  
Meal Allowance is a monthly benefit of ₹2,200 given to employees whose Monthly Fixed salary (Annual Fixed ÷ 12) is ₹55,019 or more — but only if Meal Allowance is set to "Yes" in the form.

**How it is calculated:**

| Meal Option | Monthly Fixed (Annual Fixed ÷ 12) | Meal Allowance (Monthly) |
|------------|----------------------------------|-------------------------|
| Yes | ≥ ₹55,019 | ₹2,200 |
| Yes | < ₹55,019 | ₹0 |
| No | Any amount | ₹0 (always) |

**Test Sets:**

| Annual Fixed | Monthly Fixed | Meal | Expected |
|-------------|--------------|------|----------|
| ₹7,00,000 | ₹58,333 (≥ 55,019) | Yes | ₹2,200/month |
| ₹4,00,000 | ₹33,333 (< 55,019) | Yes | ₹0 |
| ₹7,00,000 | ₹58,333 | No | ₹0 (always) |
| ₹4,00,000 | ₹33,333 | No | ₹0 (always) |

**Tolerance:** None — must match exactly.  
**Screenshot Color:** 🟧 Deep Orange border = PASS, 🔴 Red border = FAIL

---

## 11. ESIC — Employer's ESI Contribution (`esicValidation.spec.js`)

**What is ESIC?**  
ESIC (Employee State Insurance Corporation) is a social security contribution. The employer pays 3.25% of the employee's gross monthly salary — but only if the gross salary is ₹21,000 or less.

**How it is calculated:**
- Step 1: Get Total Earning from the Net Pay table (this = Gross Monthly Salary)
- Step 2: Check if Total Earning ≤ ₹21,000

| Condition | Employer's ESI (Monthly) |
|-----------|-------------------------|
| Total Earning ≤ ₹21,000 | round(3.25% × Total Earning) |
| Total Earning > ₹21,000 | ₹0 |

**Example:**
- Total Earning = ₹16,000 → ESI = round(16,000 × 0.0325) = round(520) = **₹520**
- Total Earning = ₹40,000 → ESI = **₹0**

**Test Sets:**

| Annual Fixed | Expected | Locations |
|-------------|----------|-----------|
| ₹2,00,000 | ESI applies (low salary) | Alwar, Jaipur, Agartala |
| ₹5,00,000 | ESI = ₹0 (high salary) | Alwar, Jaipur, Agartala |

**Tolerance:** None — must match exactly.  
**Screenshot Color:** 🔘 Blue Grey border = PASS, 🔴 Red border = FAIL

---

## 12. Driver Salary (`driverSalaryValidation.spec.js`)

**What is Driver Salary?**  
Driver Salary is a fixed monthly amount given to employees at certain levels. It only appears when Vehicle Maintenance is set to "Yes". The amount depends only on the Level — not on Category, Location, or CTC.

**Prerequisite:** Vehicle Maintenance must be set to **"Yes"** first. This makes the Driver Salary dropdown appear.

**Two test sets:**

**Set 1: Driver Salary dropdown = "Yes"**  
Value based on Level:

| Level | Driver Salary (Monthly) | Driver Salary (Yearly) |
|-------|------------------------|----------------------|
| LST | ₹900 | ₹10,800 |
| L10 | ₹900 | ₹10,800 |
| L9 | ₹900 | ₹10,800 |
| L8 | ₹900 | ₹10,800 |
| L7 | ₹900 | ₹10,800 |
| L6 | ₹0 | ₹0 |
| L5 | ₹0 | ₹0 |
| L4 | ₹0 | ₹0 |
| L3 | ₹0 | ₹0 |
| L2 | ₹0 | ₹0 |
| L1 | ₹0 | ₹0 |

**Simple Rule:** L7 and above → ₹900/month. L6 and below → ₹0.

**Set 2: Driver Salary dropdown = "No"**  
→ Driver Salary = ₹0 always, regardless of Level.

**Additional checks:** Value must never be negative or blank.  
**Locations:** Jharkhand, Ahmedabad  
**Tolerance:** None — must match exactly.  
**Screenshot Color:** 🔵 Indigo border = PASS, 🔴 Red border = FAIL

---

## 13. Vehicle Maintenance (`vehicleMaintenanceValidation.spec.js`)

**What is Vehicle Maintenance?**  
Vehicle Maintenance is a monthly allowance for vehicle upkeep. It only appears when Vehicle Maintenance is set to "Yes" in the form. The amount depends on the Level and the Vehicle CC (engine capacity).

**Prerequisite:** Vehicle Maintenance dropdown must be set to **"Yes"** first. This makes a **Vehicle CC** dropdown appear with two options:
- `<= 1600 cc` (smaller engine)
- `> 1600 cc` (larger engine)

**How it is calculated:**

| Level | ≤ 1600 cc (Monthly) | > 1600 cc (Monthly) |
|-------|---------------------|---------------------|
| LST | ₹1,800 | ₹2,400 |
| L10 | ₹1,800 | ₹2,400 |
| L9 | ₹1,800 | ₹2,400 |
| L8 | ₹1,800 | ₹2,400 |
| L7 | ₹1,800 | ₹2,400 |
| L6 | ₹0 | ₹0 |
| L5 | ₹0 | ₹0 |
| L4 | ₹0 | ₹0 |
| L3 | ₹0 | ₹0 |
| L2 | ₹0 | ₹0 |
| L1 | ₹0 | ₹0 |

**Simple Rule:**
- L7 and above: ₹1,800/month for small engine, ₹2,400/month for large engine
- L6 and below: ₹0 regardless of engine size

**Test Flow:**
1. Select Category → Level → Location → Annual Fixed
2. Set Vehicle Maintenance = "Yes" → Vehicle CC dropdown appears
3. Select Vehicle CC option (≤ 1600 cc or > 1600 cc)
4. Click Calculate → capture breakup → validate Vehicle Maintenance amount

**Locations:** Jharkhand, Ahmedabad  
**Tolerance:** None — must match exactly.  
**Screenshot Color:** 🟢 Light Green border = PASS, 🔴 Red border = FAIL

---

## 14. Minimum Wages (`minimumWagesValidation.spec.js`)

**What is Minimum Wages?**  
Minimum Wages is a compliance check to ensure the employee's effective salary (excluding certain allowances) meets the government-mandated minimum wage threshold for the location. If the salary is below the threshold, the system blocks the calculation and shows an error.

**Formula:**  
`Minimum Wages = Total Earning − (Statutory Bonus + Mobile Allowance + LTA)`

Where Total Earning is fetched from the Net Pay table after clicking Calculate.

**Thresholds (Location: Ahmedabad):**

| Level | Minimum Wage Threshold |
|-------|----------------------|
| L1, L2, L3, L4 | ₹13,195 |
| L5, L6, L7, L8, L9, L10, LST | ₹13,507 |

**Two Approaches:**

**Approach 1 — Normal Flow (wages above threshold):**
- Annual Fixed = ₹5,00,000 → salary is high enough
- Calculate → get Total Earning → compute Minimum Wages
- Validate: Minimum Wages ≥ threshold
- Screenshot shows the breakup with validation result

**Approach 2 — Error Flow (wages below threshold):**
- Annual Fixed = threshold value itself (₹13,195 for L1-L4, ₹13,507 for L5+)
- This makes the salary too low to meet minimum wages
- Click Calculate → error popup appears: "Please increase Fixed Comp since this is less than Min Wages"
- Screenshot captures the error popup BEFORE clicking OK
- Then clicks OK to dismiss

**Location:** Ahmedabad only  
**Categories:** All 3  
**Levels:** All 11  
**Total Tests:** 2 approaches × 3 categories × 11 levels = 66 tests  
**Screenshot Color:** N/A (captures popup for error, breakup for pass)

---

## 15. Total Benefits (`totalFixedCTCValidation.spec.js`)

**What is Total Benefits?**  
Total Benefits is the sum of three employer-paid benefits: Gratuity + GMC & GPA Premium + GTLI Premium.

**Formula:**  
`Total Benefits = Employer's Gratuity Contribution + GMC & GPA Premium + GTLI Premium`

**Example:**
- Gratuity: ₹6,413 + GMC: ₹167 + GTLI: ₹833 = **₹7,413** (Monthly)
- Gratuity: ₹76,956 + GMC: ₹2,000 + GTLI: ₹10,000 = **₹88,956** (Yearly)

**Screenshot:** Gratuity/GMC/GTLI rows get gold right border with "→ Total Benefits" arrow. Total Benefits row gets gold border with "← Gratuity + GMC + GTLI" arrow.

---

## 16. Total Fixed (A) (`totalFixedCTCValidation.spec.js`)

**What is Total Fixed?**  
Total Fixed (A) is the sum of all 11 salary components before performance pay.

**Formula:**  
`Total Fixed (A) = Basic + HRA + Statutory Bonus + Meal Allowance + Vehicle Maintenance + Driver Salary + Mobile Allowance + Special Allowance + LTA + Employer's PF + Employer's ESI`

**Example:**
- 9,120 + 3,648 + 1,750 + 0 + 0 + 0 + 400 + 5,427 + 0 + 1,794 + 661 = **₹22,800** (Monthly)

**Screenshot:** All 11 component rows get blue left border. Total Fixed (A) row gets blue border with "← sum of 11 components" arrow.

---

## 17. Total Cost to Company (A+B) (`totalFixedCTCValidation.spec.js`)

**What is Total CTC?**  
Total CTC is the total cost including performance pay.

**Formula:**  
`Total CTC (A+B) = Total Fixed (A) + Performance and Productivity Incentive (B)`

**Example:**
- Total Fixed: ₹22,800 + Perf Incentive: ₹0 = **₹22,800** (Monthly)

**Screenshot:** Total CTC row gets purple border with "← Total Fixed(A) + Perf Incentive(B)" arrow.

**Locations:** Jharkhand, Ahmedabad  
**Annual Performance Pay:** ₹5,000 filled  
**Tolerance:** None — must match exactly.

---

## 18. Total Benefits — With Scroll (`totalBenefitsValidation.spec.js`)

**Why this spec exists:**  
The compensation breakup table on the Salary Calculator page is taller than the browser viewport. Rows at the bottom — specifically **Employer's Gratuity Contribution**, **GMC & GPA Premium**, **GTLI Premium**, and **Total Benefits** — are hidden until the user scrolls down. The original `totalFixedCTCValidation.spec.js` captures the breakup without scrolling, so these bottom rows may not be visible in the DOM or in screenshots. This spec adds scroll logic to ensure those rows are rendered and visible before data capture and screenshot.

**What it validates:**  
Exactly the same three validations as `totalFixedCTCValidation.spec.js`:

1. **Total Benefits** = Employer's Gratuity Contribution + GMC & GPA Premium + GTLI Premium
2. **Total Fixed (A)** = sum of 11 salary components
3. **Total CTC (A+B)** = Total Fixed (A) + Performance and Productivity Incentive (B)

**Scroll Logic — `scrollToTotalBenefits(page)`:**  
Instead of a generic full-page scroll, this function scrolls down in small 300px increments until the "Total Benefits" highlight row is found in the viewport. Once found, it uses `scrollIntoView({ block: 'center' })` to center it on screen. If not found after 20 attempts, it falls back to scrolling to the absolute bottom.

```
Step 1: Scroll to top (window.scrollTo(0, 0))
Step 2: Loop up to 20 times:
        → Check if "Total Benefits" row is in viewport (getBoundingClientRect)
        → If found → scrollIntoView to center it → done
        → If not found → scroll down 300px (window.scrollBy(0, 300))
Step 3: Fallback → scroll to document bottom
```

**Screenshot Logic — `takeTFScreenshot(page, name)`:**  
Before taking the screenshot, the function scrolls to the "Total Benefits" row using `scrollIntoView({ block: 'center' })` so it is visible in the captured image. Then it zooms out to 70% and takes a full-page screenshot.

```
Step 1: Find "Total Benefits" highlight row in DOM
Step 2: scrollIntoView({ behavior: 'instant', block: 'center' })
Step 3: Zoom to 0.7 → fullPage screenshot → reset zoom to 1
```

**Test Flow (per scenario):**
1. Login → Navigate to Salary Calculator
2. Select Category, Level, Location
3. Enter Annual Fixed = ₹5,00,000
4. Enter Annual Performance Pay = ₹5,000
5. Click "Calculate Salary Breakup"
6. **Scroll down until "Total Benefits" row is visible** ← key difference
7. Capture compensation breakup (reads all rows from DOM)
8. Validate Total Benefits, Total Fixed (A), Total CTC (A+B)
9. Highlight rows with color-coded borders
10. Take screenshot with Total Benefits visible

**Test Data:**

| Input | Value |
|-------|-------|
| Annual Fixed | ₹5,00,000 |
| Annual Performance Pay | ₹5,000 |
| Categories | Sales & AM, Non Sales - Technology or Product, Non Sales - Rest |
| Levels | CO, L1, L2, L3, L4, L5, L6, L7, L8, L9, L10, LST, T0 |
| Locations | Jharkhand, Ahmedabad |

**Total Scenarios:** 3 categories × 13 levels × 2 locations = **78 tests**

**Example Validation (Level L1, Location Jharkhand):**

| Component | Monthly | Per Annum |
|-----------|---------|-----------|
| Employer's Gratuity Contribution | ₹802 | ₹9,624 |
| GMC & GPA Premium | ₹167 | ₹2,000 |
| GTLI Premium | ₹167 | ₹2,000 |
| **Total Benefits** | **₹1,136** | **₹13,624** |

Validation: 802 + 167 + 167 = **₹1,136** ✅

**Difference from `totalFixedCTCValidation.spec.js`:**

| Aspect | `totalFixedCTCValidation.spec.js` | `totalBenefitsValidation.spec.js` |
|--------|-----------------------------------|-----------------------------------|
| Scroll before capture | ❌ No | ✅ Yes — scrolls until Total Benefits is visible |
| Scroll before screenshot | ❌ No | ✅ Yes — centers Total Benefits in viewport |
| Screenshot folder | `screenshots/TotalFixedCTC/` | `screenshots/TotalBenefits/` |
| Validation logic | Same | Same |
| Test scenarios | Same (78) | Same (78) |

**Screenshot Folder:** `screenshots/TotalBenefits/`  
**Screenshot Naming:** `TF_CTC_{num}_{category}_{level}_{location}_{timestamp}.png`  
**Tolerance:** None — must match exactly.  
**Screenshot Colors:** Same as `totalFixedCTCValidation.spec.js` — 🟡 Gold for Total Benefits, 🔵 Blue for Total Fixed, 🟣 Purple for Total CTC, 🔴 Red for FAIL.

---

## Screenshot Color Legend (All Specs)

| Validation | Pass Color | Fail Color | NA Color |
|-----------|-----------|-----------|----------|
| Basic | 🔵 Blue | 🔴 Red | — |
| HRA | 🟣 Purple | 🔴 Red | — |
| GMC & GPA | 🟠 Orange | 🔴 Red | — |
| GTLI | 🟢 Teal | 🔴 Red | — |
| Gratuity | 🟩 Green | 🔴 Red | — |
| Statutory Bonus | 💗 Pink | 🔴 Red | — |
| Ideal Perf Pay | 🟩 Green | 🔴 Red | 🟧 Orange |
| PF Contribution | 🔷 Cyan | 🔴 Red | — |
| LTA | 🟤 Brown | 🔴 Red | — |
| Meal Allowance | 🟧 Deep Orange | 🔴 Red | — |
| ESIC | 🔘 Blue Grey | 🔴 Red | — |
| Driver Salary | 🔵 Indigo | 🔴 Red | — |
| Vehicle Maintenance | 🟢 Light Green | 🔴 Red | — |
| Total Benefits | 🟡 Gold | 🔴 Red | — |
| Total Fixed (A) | 🔵 Dark Blue | 🔴 Red | — |
| Total CTC (A+B) | 🟣 Purple | 🔴 Red | — |

**Rule:** If you see 🔴 Red on any row in a screenshot, that validation FAILED.

---

## How to Run

```bash
# Run all validations (Basic + HRA + GMC + GTLI + Gratuity + StatBonus)
npx playwright test tests/ALCSNG_Onboarding/Hiring_Tabulation_SalaryCalculator/Script/functional.spec.js --workers=1

# Run Ideal Performance Pay only
npx playwright test tests/ALCSNG_Onboarding/Hiring_Tabulation_SalaryCalculator/Script/idealPerformancePay.spec.js --workers=1

# Run PF Contribution only
npx playwright test tests/ALCSNG_Onboarding/Hiring_Tabulation_SalaryCalculator/Script/pfValidation.spec.js --workers=1

# Run Statutory Bonus only
npx playwright test tests/ALCSNG_Onboarding/Hiring_Tabulation_SalaryCalculator/Script/statutoryBonusValidation.spec.js --workers=1

# Run LTA only
npx playwright test tests/ALCSNG_Onboarding/Hiring_Tabulation_SalaryCalculator/Script/ltaValidation.spec.js --workers=1

# Run Meal Allowance only
npx playwright test tests/ALCSNG_Onboarding/Hiring_Tabulation_SalaryCalculator/Script/mealAllowanceValidation.spec.js --workers=1

# Run ESIC only
npx playwright test tests/ALCSNG_Onboarding/Hiring_Tabulation_SalaryCalculator/Script/esicValidation.spec.js --workers=1

# Run Driver Salary only
npx playwright test tests/ALCSNG_Onboarding/Hiring_Tabulation_SalaryCalculator/Script/driverSalaryValidation.spec.js --workers=1

# Run Vehicle Maintenance only
npx playwright test tests/ALCSNG_Onboarding/Hiring_Tabulation_SalaryCalculator/Script/vehicleMaintenanceValidation.spec.js --workers=1

# Run Minimum Wages only
npx playwright test tests/ALCSNG_Onboarding/Hiring_Tabulation_SalaryCalculator/Script/minimumWagesValidation.spec.js --workers=1

# Run Total Fixed + CTC + Benefits only
npx playwright test tests/ALCSNG_Onboarding/Hiring_Tabulation_SalaryCalculator/Script/totalFixedCTCValidation.spec.js --workers=1

# Run Total Benefits (with scroll) only
npx playwright test tests/ALCSNG_Onboarding/Hiring_Tabulation_SalaryCalculator/Script/totalBenefitsValidation.spec.js --workers=1

# Run ALL salary calculator specs
npx playwright test tests/ALCSNG_Onboarding/Hiring_Tabulation_SalaryCalculator/Script/ --workers=1
```
