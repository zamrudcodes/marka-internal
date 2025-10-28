# Payroll Processing Documentation

## 1. Overview

The Payroll Processing module is designed to automate and streamline the calculation and payment of employee salaries. This document outlines the complete workflow, from initiating a new payroll run to finalizing it for payment. The process is designed to be accurate, efficient, and auditable.

## 2. The Payroll Workflow

The payroll process is divided into four main stages:

1.  **Initiate Payroll Run**: A new payroll run is created for a specific pay period.
2.  **Calculate Payslips**: The system automatically calculates gross pay, deductions, and net pay for all eligible employees.
3.  **Review and Adjust**: The Payroll Manager reviews the calculated payslips and makes any necessary manual adjustments.
4.  **Finalize and Approve**: The payroll run is finalized, locking the payslips and preparing them for payment processing and reporting.

---

## 3. Step-by-Step Guide

### 3.1. Initiating a New Payroll Run

**Objective:** To create a new payroll run for a specific pay period.

**Process:**

1.  **Navigate to the Payroll Dashboard**: From the main application menu, select "Payroll."
2.  **Start a New Payroll**: Click the "Start New Payroll" button.
3.  **Select Pay Period**: A dialog will appear prompting you to select the pay period (e.g., "October 2025") and confirm the intended pay date.
4.  **Create Draft**: Upon confirmation, the system performs the following actions:
    *   It identifies all employees who are marked as "active" and are eligible for payment within the selected period.
    *   It creates a new payroll run with a "Draft" status.
    *   This new run will appear on the payroll dashboard, ready for the calculation stage.

**System Logic:**
*   The system must prevent the creation of multiple payroll runs for the same pay period to avoid duplicates.
*   It should correctly handle employees hired or terminated mid-period, including pro-rating their pay (as defined in the calculation stage).

### 3.2. Automatic Payslip Calculation

**Objective:** To automatically calculate the payslip for each employee in the payroll run.

**Process:**

This is a system-driven step that occurs immediately after a payroll run is created.

1.  **Gross Pay Calculation**: The system calculates each employee's gross pay based on their stored salary information and the pay frequency (e.g., monthly salary / 12).
2.  **Deductions Application**: Pre-configured deduction rules are applied. This includes:
    *   Statutory tax deductions based on configurable tax tables.
    *   Contributions to benefits like health insurance.
3.  **Net Pay Calculation**: The final net pay is calculated using the formula: `Net Pay = Gross Pay - Total Deductions`.
4.  **Run Summary**: The payroll dashboard will display a summary for the draft run, including total gross pay, total deductions, and total net pay for all employees included.

**System Logic:**
*   A flexible "rules engine" for deductions is required. This engine should allow administrators to define and modify rules for taxes and other deductions without code changes.
*   The system must accurately pro-rate pay for employees who did not work the full pay period.

### 3.3. Reviewing and Adjusting Payslips

**Objective:** To allow the Payroll Manager to review and make manual adjustments to individual payslips.

**Process:**

1.  **Select a Draft Payroll Run**: From the payroll dashboard, click on a run with "Draft" status.
2.  **View Employee List**: You will see a list of all employees included in the run with their calculated net pay.
3.  **Inspect a Payslip**: Click on an employee to view their detailed payslip. This view will show a breakdown of all earnings and deductions.
4.  **Make Adjustments**:
    *   To add a one-time bonus, commission, or allowance, click "Add Earning" and enter a description and amount.
    *   To add a one-time deduction (e.g., for unpaid leave), click "Add Deduction" and enter a description and amount.
5.  **Recalculation**: The employee's net pay is automatically recalculated and updated on the screen each time an adjustment is made.

**System Logic:**
*   All manual adjustments must be clearly labeled as such on the payslip to distinguish them from automated calculations.
*   An audit trail must be maintained for every manual adjustment, recording the item, the amount, who made the change, and the timestamp.
*   Role-based access control should restrict who has the authority to make manual adjustments.

### 3.4. Finalizing and Approving the Payroll Run

**Objective:** To finalize the payroll, lock it from further changes, and prepare it for payment.

**Process:**

1.  **Finalize Payroll**: Once all payslips have been reviewed and confirmed, click the "Finalize Payroll" button on the payroll run's main page.
2.  **Confirmation Summary**: A confirmation dialog will appear, showing a final summary of the payroll run (e.g., total number of employees, total net pay).
3.  **Approve the Run**: After reviewing the summary, click "Approve."
4.  **Status Change**: The status of the payroll run will change from "Draft" to "Approved."

**System Logic:**
*   Once a payroll run is "Approved," all payslips within it are locked and cannot be edited.
*   The approved payroll data becomes the source of truth for generating reports and bank payment files.
*   There must be a secure, high-privilege process for "un-approving" or creating a correction run if a critical error is discovered after approval.

---

## 4. Data Models and Schema

*(This section would typically include details about the database tables involved, such as `PayrollRuns`, `Payslips`, `PayslipEntries`, etc. This should be filled in as the database schema is designed.)*