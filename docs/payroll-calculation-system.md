# Payroll Calculation System Documentation

## Overview

The payroll calculation system provides automated calculation of employee payroll including BPJS contributions, taxes, and take-home pay based on Indonesian tax regulations.

## Features

### Manual Input Fields

The following fields must be entered manually for each employee:

1. **BPJS-Kes Salary Multiplier** - Multiplier applied to basic salary for BPJS calculations (default: 1.0)
2. **Basic Salary** - Employee's base monthly salary
3. **Performance Allowance** (Kinerja Allowance) - Monthly performance-based allowance
4. **Meal Allowance** - Monthly meal allowance
5. **Communication Allowance** (Komunikasi Allowance) - Monthly communication allowance
6. **PPh 21 Allowance** - Tax allowance
7. **THR/Bonus** - Holiday allowance or bonus
8. **Severance** - Severance payment (if applicable)
9. **Adjustment Previous Payroll** - Adjustments from previous payroll periods
10. **Reimbursement** - Expense reimbursements
11. **Already Paid/Adjustments/Kasbon** - Advance payments or adjustments

### Auto-Calculated Fields

The system automatically calculates the following based on the manual inputs:

#### BPJS Company Contributions
- **BPJS TK JKK Comp** - 0.24% of (Basic Salary × BPJS-Kes Salary Multiplier)
- **BPJS TK JKM Comp** - 0.3% of (Basic Salary × BPJS-Kes Salary Multiplier)
- **BPJS Kes Comp** - 4% of (Basic Salary × BPJS-Kes Salary Multiplier)
- **BPJS TK JHT Comp** - 3.7% of (Basic Salary × BPJS-Kes Salary Multiplier)
- **BPJS TK JP Comp** - 2% of (Basic Salary × BPJS-Kes Salary Multiplier)

#### BPJS Employee Deductions
- **BPJS TK JHT Emp** - 2% of (Basic Salary × BPJS-Kes Salary Multiplier)
- **BPJS TK JP Emp** - 1% of (Basic Salary × BPJS-Kes Salary Multiplier)
- **BPJS Kes Emp** - 1% of (Basic Salary × BPJS-Kes Salary Multiplier)

#### Summary Calculations
- **Total Bruto** - Sum of all income components including company BPJS contributions
- **Total Bruto Gross Up** - Adjusted total if gross-up is enabled
- **Total Income** - Total Bruto + Adjustments
- **Tax Tarif** - Progressive tax rate based on annual taxable income
- **Regular Income Tax** - Monthly income tax based on progressive rates
- **Payable Tax** - Total tax payable
- **Total Deduction** - Sum of all deductions (BPJS employee + taxes)
- **Take Home Pay** - Total Income - Total Deduction + Reimbursement
- **Final To Be Paid** - Take Home Pay - Already Paid/Adjustments

## Tax Calculation

The system uses Indonesian progressive tax brackets (2024):

| Annual Taxable Income | Tax Rate |
|----------------------|----------|
| 0 - 60,000,000 | 5% |
| 60,000,001 - 250,000,000 | 15% |
| 250,000,001 - 500,000,000 | 25% |
| 500,000,001 - 5,000,000,000 | 30% |
| > 5,000,000,000 | 35% |

### PTKP (Tax-Free Income) Status

The system supports the following PTKP statuses:

- **TK/0** - Single, no dependents: Rp 54,000,000
- **K/0** - Married, no dependents: Rp 58,500,000
- **K/1** - Married, 1 dependent: Rp 63,000,000
- **K/2** - Married, 2 dependents: Rp 67,500,000
- **K/3** - Married, 3 dependents: Rp 72,000,000

## Employee Configuration

### Contract Tab Fields

The following payroll-related fields can be edited in the employee detail page's Contract tab:

1. **Employee Number** (emp_no) - Unique employee identifier
2. **NIK** - National Identity Number
3. **NPWP** - Tax Identification Number
4. **NITKU** - Labor Union Tax Number
5. **PTKP Status** - Tax-free income status
6. **BPJS-Kes Salary Multiplier** - Multiplier for BPJS calculations
7. **Gross Up Enabled** - Whether to apply gross-up calculation

## Usage

### Editing Payroll for an Employee

1. Navigate to the **Payroll** page
2. Click **Edit Payroll** button for the desired employee
3. Enter the manual input values in the blue section
4. The system will automatically calculate:
   - BPJS company contributions (green section)
   - BPJS employee deductions (orange section)
   - Summary values (purple section)
5. Review the calculated **Take Home Pay** and **Final To Be Paid**
6. Click **Save Payroll** to store the record

### Updating Employee Tax Information

1. Navigate to **Employees** page
2. Click on an employee to view their details
3. Go to the **Contract** tab
4. Click **Edit Employee**
5. Update the **Tax & Payroll Information** section
6. Save changes

## Technical Implementation

### Files

- **Calculation Logic**: [`src/lib/calculations/payroll-formula.ts`](../src/lib/calculations/payroll-formula.ts)
- **Payroll Page**: [`src/app/payroll/page.tsx`](../src/app/payroll/page.tsx)
- **Payroll Columns**: [`src/app/payroll/columns.tsx`](../src/app/payroll/columns.tsx)
- **Payroll Actions**: [`src/app/payroll/actions.ts`](../src/app/payroll/actions.ts)
- **Employee Detail Page**: [`src/app/employees/[id]/page.tsx`](../src/app/employees/[id]/page.tsx)

### Database Schema

#### employees table
- `emp_no` - Employee number
- `nik` - National Identity Number
- `npwp` - Tax Identification Number
- `nitku` - Labor Union Tax Number
- `ptkp_status` - PTKP status
- `gross_up_enabled` - Gross-up flag
- `bpjs_kes_salary_multiplier` - BPJS multiplier

#### payroll_records table
Stores all payroll calculations for each employee per period. See migration file [`supabase/migrations/20251025040526_add_payroll_feature.sql`](../supabase/migrations/20251025040526_add_payroll_feature.sql) for complete schema.

## Best Practices

1. **Always verify BPJS-Kes Salary Multiplier** - Ensure this is set correctly for each employee
2. **Update PTKP Status annually** - Tax-free income amounts may change
3. **Review calculated values** - Always review auto-calculated fields before saving
4. **Keep records by period** - Each payroll record is tied to a specific month
5. **Document adjustments** - Use the adjustment fields to track any manual corrections

## Future Enhancements

- Bulk payroll processing for multiple employees
- Payroll reports and exports
- Historical payroll comparison
- Automated tax filing integration
- Payslip generation