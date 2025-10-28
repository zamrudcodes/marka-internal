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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { upsertPayrollRecord } from "./actions";
import { formatCurrency } from "@/lib/utils/currency";
import { useState } from "react";

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
      return <div className="text-right">{formatCurrency(amount)}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original;
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

      const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        await upsertPayrollRecord(formData);
        setIsEditDialogOpen(false);
        // Consider how to refresh data without a full page reload
      };

      return (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            Edit
          </Button>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  Edit Payroll for {employee.first_name} {employee.last_name}
                </DialogTitle>
                <DialogDescription>
                  Update the payroll information for this employee.
                </DialogDescription>
              </DialogHeader>
              <form id="payroll-form" onSubmit={handleFormSubmit} className="grid grid-cols-4 gap-4">
                <input type="hidden" name="employee_id" value={employee.id} />
                <div className="col-span-4">
                  <h3 className="text-lg font-medium">Employee Details</h3>
                </div>
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
                  <Label htmlFor="ptkp_status">PTKP</Label>
                  <Input id="ptkp_status" name="ptkp_status" defaultValue={employee.ptkp_status} />
                </div>
                <div>
                  <Label htmlFor="gross_up_enabled">Gross Up</Label>
                  <Input id="gross_up_enabled" name="gross_up_enabled" type="checkbox" defaultChecked={employee.gross_up_enabled} />
                </div>
                <div>
                  <Label htmlFor="bpjs_kes_salary_multiplier">BPJS Kes Multiplier</Label>
                  <Input id="bpjs_kes_salary_multiplier" name="bpjs_kes_salary_multiplier" type="number" step="0.01" defaultValue={employee.bpjs_kes_salary_multiplier} />
                </div>

                <div className="col-span-4">
                  <h3 className="text-lg font-medium">Payroll Record</h3>
                </div>
                <div>
                  <Label htmlFor="period_month">Month</Label>
                  <Input id="period_month" name="period_month" type="month" defaultValue={employee.payroll_records?.[0]?.period_month.substring(0, 7)} />
                </div>
                <div>
                  <Label htmlFor="basic_salary">Basic Salary</Label>
                  <Input id="basic_salary" name="basic_salary" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.basic_salary} />
                </div>
                <div>
                  <Label htmlFor="adj_previous_payroll">Adjs previous payroll</Label>
                  <Input id="adj_previous_payroll" name="adj_previous_payroll" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.adj_previous_payroll} />
                </div>
                <div>
                  <Label htmlFor="kinerja_allowance">Kinerja Allowance</Label>
                  <Input id="kinerja_allowance" name="kinerja_allowance" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.kinerja_allowance} />
                </div>
                <div>
                  <Label htmlFor="meal_allowance">Meal Allowance</Label>
                  <Input id="meal_allowance" name="meal_allowance" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.meal_allowance} />
                </div>
                <div>
                  <Label htmlFor="komunikasi_allowance">Komunikasi Allowance</Label>
                  <Input id="komunikasi_allowance" name="komunikasi_allowance" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.komunikasi_allowance} />
                </div>
                <div>
                  <Label htmlFor="pph21_allowance">PPh 21 Allowance</Label>
                  <Input id="pph21_allowance" name="pph21_allowance" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.pph21_allowance} />
                </div>
                <div>
                  <Label htmlFor="thr_bonus">THR/Bonus</Label>
                  <Input id="thr_bonus" name="thr_bonus" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.thr_bonus} />
                </div>
                <div>
                  <Label htmlFor="severance">Severance</Label>
                  <Input id="severance" name="severance" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.severance} />
                </div>
                <div>
                  <Label htmlFor="bpjs_tk_jkk_comp">BPJS TK JKK Comp 0.24%</Label>
                  <Input id="bpjs_tk_jkk_comp" name="bpjs_tk_jkk_comp" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.bpjs_tk_jkk_comp} />
                </div>
                <div>
                  <Label htmlFor="bpjs_tk_jkm_comp">BPJS TK JKM Comp 0,3%</Label>
                  <Input id="bpjs_tk_jkm_comp" name="bpjs_tk_jkm_comp" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.bpjs_tk_jkm_comp} />
                </div>
                <div>
                  <Label htmlFor="bpjs_kes_comp">BPJS Kes Comp 4%</Label>
                  <Input id="bpjs_kes_comp" name="bpjs_kes_comp" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.bpjs_kes_comp} />
                </div>
                <div>
                  <Label htmlFor="bpjs_tk_jht_comp">BPJS TK JHT Comp 3,7%</Label>
                  <Input id="bpjs_tk_jht_comp" name="bpjs_tk_jht_comp" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.bpjs_tk_jht_comp} />
                </div>
                <div>
                  <Label htmlFor="bpjs_tk_jp_comp">BPJS TK JP Comp 2%</Label>
                  <Input id="bpjs_tk_jp_comp" name="bpjs_tk_jp_comp" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.bpjs_tk_jp_comp} />
                </div>
                <div>
                  <Label htmlFor="total_bruto">Total Bruto</Label>
                  <Input id="total_bruto" name="total_bruto" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.total_bruto} />
                </div>
                <div>
                  <Label htmlFor="total_bruto_gross_up">Total Bruto Gross Up</Label>
                  <Input id="total_bruto_gross_up" name="total_bruto_gross_up" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.total_bruto_gross_up} />
                </div>
                <div>
                  <Label htmlFor="total_income">Total Income</Label>
                  <Input id="total_income" name="total_income" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.total_income} />
                </div>
                <div>
                  <Label htmlFor="bpjs_tk_jht_emp">BPJS TK JHT Emp 2%</Label>
                  <Input id="bpjs_tk_jht_emp" name="bpjs_tk_jht_emp" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.bpjs_tk_jht_emp} />
                </div>
                <div>
                  <Label htmlFor="bpjs_tk_jp_emp">BPJS TK JP Emp 1%</Label>
                  <Input id="bpjs_tk_jp_emp" name="bpjs_tk_jp_emp" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.bpjs_tk_jp_emp} />
                </div>
                <div>
                  <Label htmlFor="bpjs_kes_emp">BPJS Kes Emp 1%</Label>
                  <Input id="bpjs_kes_emp" name="bpjs_kes_emp" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.bpjs_kes_emp} />
                </div>
                <div>
                  <Label htmlFor="tarif_percentage">TARIF</Label>
                  <Input id="tarif_percentage" name="tarif_percentage" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.tarif_percentage} />
                </div>
                <div>
                  <Label htmlFor="tarif_value">Tarif (Value Only)</Label>
                  <Input id="tarif_value" name="tarif_value" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.tarif_value} />
                </div>
                <div>
                  <Label htmlFor="regular_income_tax">Regular Income Taxes</Label>
                  <Input id="regular_income_tax" name="regular_income_tax" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.regular_income_tax} />
                </div>
                <div>
                  <Label htmlFor="tunjangan_pph">Tunjangan PPh</Label>
                  <Input id="tunjangan_pph" name="tunjangan_pph" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.tunjangan_pph} />
                </div>
                <div>
                  <Label htmlFor="control_tunjangan_pph">Control untuk Tunjangan PPh</Label>
                  <Input id="control_tunjangan_pph" name="control_tunjangan_pph" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.control_tunjangan_pph} />
                </div>
                <div>
                  <Label htmlFor="adj_income_tax">Adjustment Income Taxes</Label>
                  <Input id="adj_income_tax" name="adj_income_tax" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.adj_income_tax} />
                </div>
                <div>
                  <Label htmlFor="payable_tax">PAYABLE TAX</Label>
                  <Input id="payable_tax" name="payable_tax" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.payable_tax} />
                </div>
                <div>
                  <Label htmlFor="severance_tax">SEVERANCE / APPRECIATION TAX</Label>
                  <Input id="severance_tax" name="severance_tax" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.severance_tax} />
                </div>
                <div>
                  <Label htmlFor="total_deduction">TOTAL DEDUCTION</Label>
                  <Input id="total_deduction" name="total_deduction" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.total_deduction} />
                </div>
                <div>
                  <Label htmlFor="reimbursement">Reimbursement</Label>
                  <Input id="reimbursement" name="reimbursement" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.reimbursement} />
                </div>
                <div>
                  <Label htmlFor="take_home_pay">TAKE HOME PAY</Label>
                  <Input id="take_home_pay" name="take_home_pay" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.take_home_pay} />
                </div>
                <div>
                  <Label htmlFor="already_paid_adj">Already Paid/ Adjusment/Kasbon</Label>
                  <Input id="already_paid_adj" name="already_paid_adj" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.already_paid_adj} />
                </div>
                <div>
                  <Label htmlFor="salary_to_be_paid">Salary To be Paid</Label>
                  <Input id="salary_to_be_paid" name="salary_to_be_paid" type="number" step="0.01" defaultValue={employee.payroll_records?.[0]?.salary_to_be_paid} />
                </div>
              </form>
              <DialogFooter>
                <Button type="submit" form="payroll-form">
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];