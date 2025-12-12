/**
 * Payroll Calculation Formulas
 * 
 * This module contains all the formulas for calculating payroll-related values
 * including BPJS contributions, taxes, and take-home pay.
 */

export interface PayrollInputs {
  // Manual inputs
  bpjsKesSalaryMultiplier: number;
  basicSalary: number;
  performanceAllowance: number; // kinerja_allowance
  mealAllowance: number;
  communicationAllowance: number; // komunikasi_allowance
  pph21Allowance: number;
  thrBonus: number;
  severance: number;
  
  // Additional inputs for calculations
  grossUpEnabled: boolean;
  ptkpStatus: string;
  adjPreviousPayroll?: number;
  reimbursement?: number;
  alreadyPaidAdj?: number;
}

export interface PayrollCalculations {
  // BPJS Company contributions (based on BPJS-Kes Salary Multiplier)
  bpjsTkJkkComp: number;      // 0.24%
  bpjsTkJkmComp: number;      // 0.3%
  bpjsKesComp: number;        // 4%
  bpjsTkJhtComp: number;      // 3.7%
  bpjsTkJpComp: number;       // 2%
  
  // BPJS Employee deductions (based on BPJS-Kes Salary Multiplier)
  bpjsTkJhtEmp: number;       // 2%
  bpjsTkJpEmp: number;        // 1%
  bpjsKesEmp: number;         // 1%
  
  // Calculated fields
  totalBruto: number;
  totalBrutoGrossUp: number;
  totalIncome: number;
  tarifPercentage: number;
  tarifValue: number;
  regularIncomeTax: number;
  payableTax: number;
  totalDeduction: number;
  takeHomePay: number;
  salaryToBePaid: number;
}

/**
 * Calculate BPJS company contributions
 * Formula: BPJS-Kes Salary Multiplier × percentage
 */
function calculateBpjsCompanyContributions(multiplier: number) {
  return {
    bpjsTkJkkComp: multiplier * 0.0024,   // 0.24%
    bpjsTkJkmComp: multiplier * 0.003,    // 0.3%
    bpjsKesComp: multiplier * 0.04,       // 4%
    bpjsTkJhtComp: multiplier * 0.037,    // 3.7%
    bpjsTkJpComp: multiplier * 0.02,      // 2%
  };
}

/**
 * Calculate BPJS employee deductions
 * Formula: BPJS-Kes Salary Multiplier × percentage
 */
function calculateBpjsEmployeeDeductions(multiplier: number) {
  return {
    bpjsTkJhtEmp: multiplier * 0.02,      // 2%
    bpjsTkJpEmp: multiplier * 0.01,       // 1%
    bpjsKesEmp: multiplier * 0.01,        // 1%
  };
}

/**
 * Calculate Total Bruto
 * Sum of all income components including company BPJS contributions
 */
function calculateTotalBruto(
  basicSalary: number,
  performanceAllowance: number,
  mealAllowance: number,
  communicationAllowance: number,
  pph21Allowance: number,
  thrBonus: number,
  bpjsCompany: ReturnType<typeof calculateBpjsCompanyContributions>
): number {
  return (
    basicSalary +
    performanceAllowance +
    mealAllowance +
    communicationAllowance +
    pph21Allowance +
    thrBonus +
    bpjsCompany.bpjsTkJkkComp +
    bpjsCompany.bpjsTkJkmComp +
    bpjsCompany.bpjsKesComp +
    bpjsCompany.bpjsTkJhtComp +
    bpjsCompany.bpjsTkJpComp
  );
}

/**
 * Calculate PTKP (Tax-Free Income) based on status
 * TK/0 = Single, no dependents: 54,000,000
 * K/0 = Married, no dependents: 58,500,000
 * K/1 = Married, 1 dependent: 63,000,000
 * K/2 = Married, 2 dependents: 67,500,000
 * K/3 = Married, 3 dependents: 72,000,000
 */
function getPtkpAmount(ptkpStatus: string): number {
  const ptkpMap: Record<string, number> = {
    'TK/0': 54000000,
    'K/0': 58500000,
    'K/1': 63000000,
    'K/2': 67500000,
    'K/3': 72000000,
  };
  
  return ptkpMap[ptkpStatus] || 54000000; // Default to TK/0
}

/**
 * Calculate annual taxable income
 */
function calculateAnnualTaxableIncome(
  totalBruto: number,
  bpjsEmployee: ReturnType<typeof calculateBpjsEmployeeDeductions>,
  ptkpStatus: string
): number {
  const annualBruto = totalBruto * 12;
  const annualBpjsDeduction = (
    bpjsEmployee.bpjsTkJhtEmp +
    bpjsEmployee.bpjsTkJpEmp +
    bpjsEmployee.bpjsKesEmp
  ) * 12;
  
  const ptkp = getPtkpAmount(ptkpStatus);
  const taxableIncome = annualBruto - annualBpjsDeduction - ptkp;
  
  return Math.max(0, taxableIncome);
}

/**
 * Calculate progressive tax based on Indonesian tax brackets (2024)
 * 0 - 60,000,000: 5%
 * 60,000,001 - 250,000,000: 15%
 * 250,000,001 - 500,000,000: 25%
 * 500,000,001 - 5,000,000,000: 30%
 * > 5,000,000,000: 35%
 */
function calculateProgressiveTax(annualTaxableIncome: number): { percentage: number; value: number } {
  let tax = 0;
  let percentage = 0;
  
  if (annualTaxableIncome <= 0) {
    return { percentage: 0, value: 0 };
  }
  
  // First bracket: 0 - 60,000,000 at 5%
  if (annualTaxableIncome <= 60000000) {
    tax = annualTaxableIncome * 0.05;
    percentage = 5;
  }
  // Second bracket: 60,000,001 - 250,000,000 at 15%
  else if (annualTaxableIncome <= 250000000) {
    tax = (60000000 * 0.05) + ((annualTaxableIncome - 60000000) * 0.15);
    percentage = 15;
  }
  // Third bracket: 250,000,001 - 500,000,000 at 25%
  else if (annualTaxableIncome <= 500000000) {
    tax = (60000000 * 0.05) + (190000000 * 0.15) + ((annualTaxableIncome - 250000000) * 0.25);
    percentage = 25;
  }
  // Fourth bracket: 500,000,001 - 5,000,000,000 at 30%
  else if (annualTaxableIncome <= 5000000000) {
    tax = (60000000 * 0.05) + (190000000 * 0.15) + (250000000 * 0.25) + ((annualTaxableIncome - 500000000) * 0.30);
    percentage = 30;
  }
  // Fifth bracket: > 5,000,000,000 at 35%
  else {
    tax = (60000000 * 0.05) + (190000000 * 0.15) + (250000000 * 0.25) + (4500000000 * 0.30) + ((annualTaxableIncome - 5000000000) * 0.35);
    percentage = 35;
  }
  
  return { percentage, value: tax };
}

/**
 * Main function to calculate all payroll values
 */
export function calculatePayroll(inputs: PayrollInputs): PayrollCalculations {
  // Calculate BPJS contributions
  const bpjsCompany = calculateBpjsCompanyContributions(inputs.bpjsKesSalaryMultiplier);
  const bpjsEmployee = calculateBpjsEmployeeDeductions(inputs.bpjsKesSalaryMultiplier);
  
  // Calculate Total Bruto
  const totalBruto = calculateTotalBruto(
    inputs.basicSalary,
    inputs.performanceAllowance,
    inputs.mealAllowance,
    inputs.communicationAllowance,
    inputs.pph21Allowance,
    inputs.thrBonus,
    bpjsCompany
  );
  
  // Calculate Total Bruto Gross Up (if enabled)
  let totalBrutoGrossUp = totalBruto;
  if (inputs.grossUpEnabled) {
    // Gross up calculation: divide by (1 - highest tax rate applicable)
    // This is a simplified version; actual gross-up may need more complex calculation
    totalBrutoGrossUp = totalBruto / 0.95; // Assuming 5% as base rate
  }
  
  // Calculate annual taxable income
  const annualTaxableIncome = calculateAnnualTaxableIncome(
    totalBruto,
    bpjsEmployee,
    inputs.ptkpStatus
  );
  
  // Calculate tax
  const taxCalculation = calculateProgressiveTax(annualTaxableIncome);
  const monthlyTax = taxCalculation.value / 12;
  
  // Calculate Total Income (Total Bruto + any adjustments)
  const totalIncome = totalBruto + (inputs.adjPreviousPayroll || 0);
  
  // Calculate Total Deduction
  const totalDeduction = 
    bpjsEmployee.bpjsTkJhtEmp +
    bpjsEmployee.bpjsTkJpEmp +
    bpjsEmployee.bpjsKesEmp +
    monthlyTax;
  
  // Calculate Take Home Pay
  const takeHomePay = totalIncome - totalDeduction + (inputs.reimbursement || 0);
  
  // Calculate Salary To Be Paid
  const salaryToBePaid = takeHomePay - (inputs.alreadyPaidAdj || 0);
  
  return {
    // BPJS Company
    bpjsTkJkkComp: bpjsCompany.bpjsTkJkkComp,
    bpjsTkJkmComp: bpjsCompany.bpjsTkJkmComp,
    bpjsKesComp: bpjsCompany.bpjsKesComp,
    bpjsTkJhtComp: bpjsCompany.bpjsTkJhtComp,
    bpjsTkJpComp: bpjsCompany.bpjsTkJpComp,
    
    // BPJS Employee
    bpjsTkJhtEmp: bpjsEmployee.bpjsTkJhtEmp,
    bpjsTkJpEmp: bpjsEmployee.bpjsTkJpEmp,
    bpjsKesEmp: bpjsEmployee.bpjsKesEmp,
    
    // Calculated fields
    totalBruto,
    totalBrutoGrossUp,
    totalIncome,
    tarifPercentage: taxCalculation.percentage,
    tarifValue: taxCalculation.value,
    regularIncomeTax: monthlyTax,
    payableTax: monthlyTax,
    totalDeduction,
    takeHomePay,
    salaryToBePaid,
  };
}

/**
 * Helper function to round to 2 decimal places
 */
export function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}

/**
 * Format all calculated values to 2 decimal places
 */
export function formatPayrollCalculations(calculations: PayrollCalculations): PayrollCalculations {
  return {
    bpjsTkJkkComp: roundToTwo(calculations.bpjsTkJkkComp),
    bpjsTkJkmComp: roundToTwo(calculations.bpjsTkJkmComp),
    bpjsKesComp: roundToTwo(calculations.bpjsKesComp),
    bpjsTkJhtComp: roundToTwo(calculations.bpjsTkJhtComp),
    bpjsTkJpComp: roundToTwo(calculations.bpjsTkJpComp),
    bpjsTkJhtEmp: roundToTwo(calculations.bpjsTkJhtEmp),
    bpjsTkJpEmp: roundToTwo(calculations.bpjsTkJpEmp),
    bpjsKesEmp: roundToTwo(calculations.bpjsKesEmp),
    totalBruto: roundToTwo(calculations.totalBruto),
    totalBrutoGrossUp: roundToTwo(calculations.totalBrutoGrossUp),
    totalIncome: roundToTwo(calculations.totalIncome),
    tarifPercentage: roundToTwo(calculations.tarifPercentage),
    tarifValue: roundToTwo(calculations.tarifValue),
    regularIncomeTax: roundToTwo(calculations.regularIncomeTax),
    payableTax: roundToTwo(calculations.payableTax),
    totalDeduction: roundToTwo(calculations.totalDeduction),
    takeHomePay: roundToTwo(calculations.takeHomePay),
    salaryToBePaid: roundToTwo(calculations.salaryToBePaid),
  };
}