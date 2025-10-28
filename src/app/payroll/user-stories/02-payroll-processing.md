### **Epic: Payroll Processing**

**Description:** As a Payroll Manager, I need to run payroll accurately and efficiently to ensure employees are paid correctly and on time.

---

**User Story 5: Create a New Payroll Run**

**Title:** Initiate a New Payroll Run

**As a** Payroll Manager,
**I want to** create a new payroll run for a specific pay period (e.g., monthly, bi-weekly),
**So that** I can begin the process of calculating and distributing employee salaries.

**Acceptance Criteria:**
1.  Given I am on the "Payroll" page, I can click a "Start New Payroll" button.
2.  When I start a new run, I am prompted to select the pay period (e.g., "October 2025") and confirm the pay date.
3.  The system automatically pulls in all active employees who are eligible for payment in that period.
4.  A new "Draft" payroll run is created and appears in the payroll dashboard with its status clearly marked.

**Edge Cases and Considerations:**
*   Preventing the creation of duplicate payroll runs for the same pay period.
*   Handling employees who were hired or terminated mid-period.

---

**User Story 6: Calculate Pay, Deductions, and Taxes**

**Title:** Automatically Calculate Payslips

**As a** system,
**I want to** automatically calculate each employee's gross pay, deductions (e.g., taxes, insurance), and net pay,
**So that** the Payroll Manager has an accurate baseline for each employee's payslip.

**Acceptance Criteria:**
1.  Given a payroll run has been created, the system calculates the gross pay for each employee based on their salary information and the pay period.
2.  The system applies pre-configured deductions (e.g., statutory tax rates, health insurance contributions).
3.  The system calculates the final net pay (Gross Pay - Total Deductions) for each employee.
4.  The Payroll Manager can see a summary of total gross pay, total deductions, and total net pay for the entire payroll run.

**Edge Cases and Considerations:**
*   The system needs a configurable "rules engine" for different types of taxes and deductions.
*   Handling pro-rated pay for new hires or terminated employees.

---

**User Story 7: Review and Adjust Individual Payslips**

**Title:** Review and Adjust Employee Payslips

**As a** Payroll Manager,
**I want to** review each employee's calculated payslip within a payroll run and make manual adjustments,
**So that** I can account for one-time additions (like bonuses, commissions) or deductions (like unpaid leave).

**Acceptance Criteria:**
1.  Given I am viewing a "Draft" payroll run, I can click on any employee to see their detailed payslip breakdown.
2.  On the payslip detail view, I can add new line items for one-time bonuses, allowances, or deductions.
3.  When I add or edit a line item, the employee's net pay is automatically recalculated.
4.  All manual adjustments are clearly marked and an audit log is kept.

**Edge Cases and Considerations:**
*   Permissions: Who is authorized to make manual adjustments?
*   Clear labeling of manual vs. automated calculations.

---

**User Story 8: Finalize and Approve Payroll**

**Title:** Finalize and Approve Payroll Run

**As a** Payroll Manager,
**I want to** finalize the payroll run after reviewing and confirming all details,
**So that** the payslips are locked from further edits and are ready for payment processing.

**Acceptance Criteria:**
1.  Given I have reviewed all payslips in a draft run, I can click a "Finalize Payroll" button.
2.  When I click "Finalize," I see a confirmation summary (total employees, total net pay).
3.  After confirming, the status of the payroll run changes from "Draft" to "Approved," and no further edits can be made.
4.  An "Approved" payroll run generates a record that can be used for generating reports and bank files.

**Edge Cases and Considerations:**
*   What happens if an error is found after a payroll has been approved? There should be a process to "un-approve" or "correct" a finalized payroll, likely with higher-level permissions.