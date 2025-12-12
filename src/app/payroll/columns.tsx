"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { upsertPayrollRecord } from "./actions";
import { formatCurrency } from "@/lib/utils/currency";
import { useState, useEffect } from "react";
import { calculatePayroll, formatPayrollCalculations, PayrollInputs } from "@/lib/calculations/payroll-formula";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export type Payroll = {
  id: string;
  emp_no: string;
  first_name: string;
  last_name: string;
  npwp: string;
  nik: string;
  nitku: string;
  role: string;
  department_id: string;
  departments?: {
    id: string;
    name: string;
  };
  status: string;
  ptkp_status: string;
  gross_up_enabled: boolean;
  hire_date: string;
  bpjs_kes_salary_multiplier: number;
  payroll_records: any[];
};

function PayrollEditDialog({ employee, open, onOpenChange }: { 
  employee: Payroll; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const latestRecord = employee.payroll_records?.[0];
  
  // Manual input states
  // Helper function to format number with thousands separator
  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    return num.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  // Helper function to format whole number (no decimals) with thousands separator
  const formatWholeNumber = (num: number): string => {
    if (num === 0) return '0';
    return Math.round(num).toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Helper function to parse formatted number string
  const parseFormattedNumber = (str: string): number => {
    // Remove all non-digit characters except decimal point and minus sign
    const cleaned = str.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper function to parse whole number (no decimals)
  const parseWholeNumber = (str: string): number => {
    // Remove all non-digit characters except minus sign
    const cleaned = str.replace(/[^\d-]/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper function to handle input change with formatting
  const handleNumberInput = (value: string, setter: (val: number) => void) => {
    // Allow user to type freely, parse on blur or when valid
    const parsed = parseFormattedNumber(value);
    setter(parsed);
  };

  // Helper function to handle whole number input (no decimals)
  const handleWholeNumberInput = (value: string, setter: (val: number) => void) => {
    const parsed = parseWholeNumber(value);
    setter(parsed);
  };

  const [bpjsKesSalaryMultiplier, setBpjsKesSalaryMultiplier] = useState(employee.bpjs_kes_salary_multiplier || 0);
  const [basicSalary, setBasicSalary] = useState(latestRecord?.basic_salary || 0);
  const [performanceAllowance, setPerformanceAllowance] = useState(latestRecord?.kinerja_allowance || 0);
  const [mealAllowance, setMealAllowance] = useState(latestRecord?.meal_allowance || 0);
  const [communicationAllowance, setCommunicationAllowance] = useState(latestRecord?.komunikasi_allowance || 0);
  const [pph21Allowance, setPph21Allowance] = useState(latestRecord?.pph21_allowance || 0);
  const [thrBonus, setThrBonus] = useState(latestRecord?.thr_bonus || 0);
  const [severance, setSeverance] = useState(latestRecord?.severance || 0);
  const [grossUpEnabled, setGrossUpEnabled] = useState(employee.gross_up_enabled || false);
  const [ptkpStatus, setPtkpStatus] = useState(employee.ptkp_status || 'TK/0');
  const [adjPreviousPayroll, setAdjPreviousPayroll] = useState(latestRecord?.adj_previous_payroll || 0);
  const [reimbursement, setReimbursement] = useState(latestRecord?.reimbursement || 0);
  const [alreadyPaidAdj, setAlreadyPaidAdj] = useState(latestRecord?.already_paid_adj || 0);
  const [periodMonth, setPeriodMonth] = useState(
    latestRecord?.period_month ? latestRecord.period_month.substring(0, 7) : new Date().toISOString().substring(0, 7)
  );

  // Calculated values state
  const [calculations, setCalculations] = useState<ReturnType<typeof calculatePayroll> | null>(null);

  // Recalculate whenever inputs change
  useEffect(() => {
    const inputs: PayrollInputs = {
      bpjsKesSalaryMultiplier,
      basicSalary,
      performanceAllowance,
      mealAllowance,
      communicationAllowance,
      pph21Allowance,
      thrBonus,
      severance,
      grossUpEnabled,
      ptkpStatus,
      adjPreviousPayroll,
      reimbursement,
      alreadyPaidAdj,
    };

    const result = calculatePayroll(inputs);
    const formatted = formatPayrollCalculations(result);
    setCalculations(formatted);
  }, [
    bpjsKesSalaryMultiplier,
    basicSalary,
    performanceAllowance,
    mealAllowance,
    communicationAllowance,
    pph21Allowance,
    thrBonus,
    severance,
    grossUpEnabled,
    ptkpStatus,
    adjPreviousPayroll,
    reimbursement,
    alreadyPaidAdj,
  ]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Add calculated values to form data
    if (calculations) {
      formData.set('bpjs_tk_jkk_comp', calculations.bpjsTkJkkComp.toString());
      formData.set('bpjs_tk_jkm_comp', calculations.bpjsTkJkmComp.toString());
      formData.set('bpjs_kes_comp', calculations.bpjsKesComp.toString());
      formData.set('bpjs_tk_jht_comp', calculations.bpjsTkJhtComp.toString());
      formData.set('bpjs_tk_jp_comp', calculations.bpjsTkJpComp.toString());
      formData.set('bpjs_tk_jht_emp', calculations.bpjsTkJhtEmp.toString());
      formData.set('bpjs_tk_jp_emp', calculations.bpjsTkJpEmp.toString());
      formData.set('bpjs_kes_emp', calculations.bpjsKesEmp.toString());
      formData.set('total_bruto', calculations.totalBruto.toString());
      formData.set('total_bruto_gross_up', calculations.totalBrutoGrossUp.toString());
      formData.set('total_income', calculations.totalIncome.toString());
      formData.set('tarif_percentage', calculations.tarifPercentage.toString());
      formData.set('tarif_value', calculations.tarifValue.toString());
      formData.set('regular_income_tax', calculations.regularIncomeTax.toString());
      formData.set('payable_tax', calculations.payableTax.toString());
      formData.set('total_deduction', calculations.totalDeduction.toString());
      formData.set('take_home_pay', calculations.takeHomePay.toString());
      formData.set('salary_to_be_paid', calculations.salaryToBePaid.toString());
    }
    
    await upsertPayrollRecord(formData);
    onOpenChange(false);
    window.location.reload(); // Refresh to show updated data
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">
            Edit Payroll for {employee.first_name} {employee.last_name}
          </DialogTitle>
          <DialogDescription className="text-base">
            Enter manual inputs and the system will automatically calculate BPJS contributions and other fields.
          </DialogDescription>
        </DialogHeader>
        <form id="payroll-form" onSubmit={handleFormSubmit} className="space-y-8">
          <input type="hidden" name="employee_id" value={employee.id} />
          
          {/* Employee Details Section */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold border-b pb-3 mb-4">Employee Details</h3>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <Label htmlFor="emp_no">Emp.No.</Label>
                <Input id="emp_no" name="emp_no" defaultValue={employee.emp_no} />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" defaultValue={employee.role} />
              </div>
              <div>
                <Label htmlFor="npwp">NPWP</Label>
                <Input id="npwp" name="npwp" defaultValue={employee.npwp} />
              </div>
              <div>
                <Label htmlFor="nik">NIK</Label>
                <Input id="nik" name="nik" defaultValue={employee.nik} />
              </div>
              <div>
                <Label htmlFor="nitku">NITKU</Label>
                <Input id="nitku" name="nitku" defaultValue={employee.nitku} />
              </div>
              <div>
                <Label htmlFor="ptkp_status">PTKP Status</Label>
                <Select name="ptkp_status" value={ptkpStatus} onValueChange={setPtkpStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TK/0">TK/0 - Single, no dependents</SelectItem>
                    <SelectItem value="K/0">K/0 - Married, no dependents</SelectItem>
                    <SelectItem value="K/1">K/1 - Married, 1 dependent</SelectItem>
                    <SelectItem value="K/2">K/2 - Married, 2 dependents</SelectItem>
                    <SelectItem value="K/3">K/3 - Married, 3 dependents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox 
                  id="gross_up_enabled" 
                  name="gross_up_enabled"
                  checked={grossUpEnabled}
                  onCheckedChange={(checked) => setGrossUpEnabled(checked as boolean)}
                />
                <Label htmlFor="gross_up_enabled" className="cursor-pointer">Gross Up Enabled</Label>
              </div>
            </div>
          </div>

          {/* Manual Inputs Section */}
          <div className="space-y-4 bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold border-b border-blue-200 pb-3 mb-4 text-blue-700">Manual Inputs</h3>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <Label htmlFor="period_month">Period Month</Label>
                <Input 
                  id="period_month" 
                  name="period_month" 
                  type="month" 
                  value={periodMonth}
                  onChange={(e) => setPeriodMonth(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bpjs_kes_salary_multiplier">BPJS-Kes Amount (IDR)</Label>
                <Input
                  id="bpjs_kes_salary_multiplier"
                  name="bpjs_kes_salary_multiplier"
                  type="text"
                  inputMode="numeric"
                  value={formatWholeNumber(bpjsKesSalaryMultiplier)}
                  onChange={(e) => handleWholeNumberInput(e.target.value, setBpjsKesSalaryMultiplier)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="basic_salary">Basic Salary</Label>
                <Input
                  id="basic_salary"
                  name="basic_salary"
                  type="text"
                  inputMode="decimal"
                  value={formatNumber(basicSalary)}
                  onChange={(e) => handleNumberInput(e.target.value, setBasicSalary)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="kinerja_allowance">Performance Allowance</Label>
                <Input
                  id="kinerja_allowance"
                  name="kinerja_allowance"
                  type="text"
                  inputMode="decimal"
                  value={formatNumber(performanceAllowance)}
                  onChange={(e) => handleNumberInput(e.target.value, setPerformanceAllowance)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="meal_allowance">Meal Allowance</Label>
                <Input
                  id="meal_allowance"
                  name="meal_allowance"
                  type="text"
                  inputMode="decimal"
                  value={formatNumber(mealAllowance)}
                  onChange={(e) => handleNumberInput(e.target.value, setMealAllowance)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="komunikasi_allowance">Communication Allowance</Label>
                <Input
                  id="komunikasi_allowance"
                  name="komunikasi_allowance"
                  type="text"
                  inputMode="decimal"
                  value={formatNumber(communicationAllowance)}
                  onChange={(e) => handleNumberInput(e.target.value, setCommunicationAllowance)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="pph21_allowance">PPh 21 Allowance</Label>
                <Input
                  id="pph21_allowance"
                  name="pph21_allowance"
                  type="text"
                  inputMode="decimal"
                  value={formatNumber(pph21Allowance)}
                  onChange={(e) => handleNumberInput(e.target.value, setPph21Allowance)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="thr_bonus">THR/Bonus</Label>
                <Input
                  id="thr_bonus"
                  name="thr_bonus"
                  type="text"
                  inputMode="decimal"
                  value={formatNumber(thrBonus)}
                  onChange={(e) => handleNumberInput(e.target.value, setThrBonus)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="severance">Severance</Label>
                <Input
                  id="severance"
                  name="severance"
                  type="text"
                  inputMode="decimal"
                  value={formatNumber(severance)}
                  onChange={(e) => handleNumberInput(e.target.value, setSeverance)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="adj_previous_payroll">Adj. Previous Payroll</Label>
                <Input
                  id="adj_previous_payroll"
                  name="adj_previous_payroll"
                  type="text"
                  inputMode="decimal"
                  value={formatNumber(adjPreviousPayroll)}
                  onChange={(e) => handleNumberInput(e.target.value, setAdjPreviousPayroll)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="reimbursement">Reimbursement</Label>
                <Input
                  id="reimbursement"
                  name="reimbursement"
                  type="text"
                  inputMode="decimal"
                  value={formatNumber(reimbursement)}
                  onChange={(e) => handleNumberInput(e.target.value, setReimbursement)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="already_paid_adj">Already Paid/Adjustments/Kasbon</Label>
                <Input
                  id="already_paid_adj"
                  name="already_paid_adj"
                  type="text"
                  inputMode="decimal"
                  value={formatNumber(alreadyPaidAdj)}
                  onChange={(e) => handleNumberInput(e.target.value, setAlreadyPaidAdj)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Auto-Calculated BPJS Company Contributions */}
          <div className="space-y-4 bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold border-b border-green-200 pb-3 mb-4 text-green-700">BPJS Company Contributions (Auto-Calculated)</h3>
            <div className="grid grid-cols-5 gap-6">
              <div>
                <Label>BPJS TK JKK Comp 0.24%</Label>
                <Input value={formatCurrency(calculations?.bpjsTkJkkComp || 0)} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>BPJS TK JKM Comp 0.3%</Label>
                <Input value={formatCurrency(calculations?.bpjsTkJkmComp || 0)} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>BPJS Kes Comp 4%</Label>
                <Input value={formatCurrency(calculations?.bpjsKesComp || 0)} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>BPJS TK JHT Comp 3.7%</Label>
                <Input value={formatCurrency(calculations?.bpjsTkJhtComp || 0)} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>BPJS TK JP Comp 2%</Label>
                <Input value={formatCurrency(calculations?.bpjsTkJpComp || 0)} disabled className="bg-gray-50" />
              </div>
            </div>
          </div>

          {/* Auto-Calculated BPJS Employee Deductions */}
          <div className="space-y-4 bg-orange-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold border-b border-orange-200 pb-3 mb-4 text-orange-700">BPJS Employee Deductions (Auto-Calculated)</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <Label>BPJS TK JHT Emp 2%</Label>
                <Input value={formatCurrency(calculations?.bpjsTkJhtEmp || 0)} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>BPJS TK JP Emp 1%</Label>
                <Input value={formatCurrency(calculations?.bpjsTkJpEmp || 0)} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>BPJS Kes Emp 1%</Label>
                <Input value={formatCurrency(calculations?.bpjsKesEmp || 0)} disabled className="bg-gray-50" />
              </div>
            </div>
          </div>

          {/* Auto-Calculated Summary Fields */}
          <div className="space-y-4 bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold border-b border-purple-200 pb-3 mb-4 text-purple-700">Summary (Auto-Calculated)</h3>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <Label>Total Bruto</Label>
                <Input value={formatCurrency(calculations?.totalBruto || 0)} disabled className="bg-gray-50 font-semibold" />
              </div>
              <div>
                <Label>Total Bruto Gross Up</Label>
                <Input value={formatCurrency(calculations?.totalBrutoGrossUp || 0)} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>Total Income</Label>
                <Input value={formatCurrency(calculations?.totalIncome || 0)} disabled className="bg-gray-50 font-semibold" />
              </div>
              <div>
                <Label>Tax Tarif (%)</Label>
                <Input value={`${calculations?.tarifPercentage || 0}%`} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>Regular Income Tax</Label>
                <Input value={formatCurrency(calculations?.regularIncomeTax || 0)} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>Payable Tax</Label>
                <Input value={formatCurrency(calculations?.payableTax || 0)} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>Total Deduction</Label>
                <Input value={formatCurrency(calculations?.totalDeduction || 0)} disabled className="bg-gray-50 font-semibold" />
              </div>
              <div>
                <Label>Take Home Pay</Label>
                <Input value={formatCurrency(calculations?.takeHomePay || 0)} disabled className="bg-green-100 font-bold text-green-700" />
              </div>
              <div>
                <Label>Final To Be Paid</Label>
                <Input value={formatCurrency(calculations?.salaryToBePaid || 0)} disabled className="bg-blue-100 font-bold text-blue-700" />
              </div>
            </div>
          </div>
        </form>
        <DialogFooter className="pt-6 gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6">
            Cancel
          </Button>
          <Button type="submit" form="payroll-form" className="px-6">
            Save Payroll
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const columns: ColumnDef<Payroll>[] = [
  {
    accessorKey: "emp_no",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Emp.No." />
    ),
  },
  {
    id: "name",
    accessorFn: row => `${row.first_name} ${row.last_name}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "departments.name",
    header: "Department",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "payroll_records[0].basic_salary",
    header: "Basic Salary",
    cell: ({ row }) => {
      const amount = row.original.payroll_records?.[0]?.basic_salary || 0;
      return <div className="text-right">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "payroll_records[0].total_income",
    header: "Total Income",
    cell: ({ row }) => {
      const amount = row.original.payroll_records?.[0]?.total_income || 0;
      return <div className="text-right">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "payroll_records[0].total_deduction",
    header: "Total Deduction",
    cell: ({ row }) => {
      const amount = row.original.payroll_records?.[0]?.total_deduction || 0;
      return <div className="text-right">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "payroll_records[0].take_home_pay",
    header: "Take Home Pay",
    cell: ({ row }) => {
      const amount = row.original.payroll_records?.[0]?.take_home_pay || 0;
      return <div className="text-right font-semibold">{formatCurrency(amount)}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original;
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

      return (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            Edit Payroll
          </Button>
          <PayrollEditDialog 
            employee={employee}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        </>
      );
    },
  },
];