"use server"

import { createClient } from "@/utils/supabase/server"
import { unstable_noStore as noStore, revalidatePath } from "next/cache"

export async function getPayrollData() {
  noStore()
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select(
      `
      *,
      payroll_records (
        *
      )
    `
    )
    .order("first_name", { ascending: true });

  if (error) {
    console.error("Error fetching payroll data:", error);
    return [];
  }

  return data;
}

export async function getDepartments() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching departments:", error);
    return [];
  }

  return data || [];
}

export async function upsertPayrollRecord(formData: FormData) {
  const supabase = await createClient();

  const employeeId = formData.get("employee_id") as string;
  const periodMonth = formData.get("period_month") as string;

  // Data for employees table
  const employeeData = {
    emp_no: formData.get("emp_no") as string,
    role: formData.get("role") as string,
    npwp: formData.get("npwp") as string,
    nik: formData.get("nik") as string,
    nitku: formData.get("nitku") as string,
    ptkp_status: formData.get("ptkp_status") as string,
    gross_up_enabled: formData.get("gross_up_enabled") === "on",
    bpjs_kes_salary_multiplier: Number(formData.get("bpjs_kes_salary_multiplier")),
  };

  // Data for payroll_records table
  const payrollData = {
    employee_id: employeeId,
    period_month: periodMonth,
    basic_salary: Number(formData.get("basic_salary")),
    adj_previous_payroll: Number(formData.get("adj_previous_payroll")),
    kinerja_allowance: Number(formData.get("kinerja_allowance")),
    meal_allowance: Number(formData.get("meal_allowance")),
    komunikasi_allowance: Number(formData.get("komunikasi_allowance")),
    pph21_allowance: Number(formData.get("pph21_allowance")),
    thr_bonus: Number(formData.get("thr_bonus")),
    severance: Number(formData.get("severance")),
    bpjs_tk_jkk_comp: Number(formData.get("bpjs_tk_jkk_comp")),
    bpjs_tk_jkm_comp: Number(formData.get("bpjs_tk_jkm_comp")),
    bpjs_kes_comp: Number(formData.get("bpjs_kes_comp")),
    bpjs_tk_jht_comp: Number(formData.get("bpjs_tk_jht_comp")),
    bpjs_tk_jp_comp: Number(formData.get("bpjs_tk_jp_comp")),
    total_bruto: Number(formData.get("total_bruto")),
    total_bruto_gross_up: Number(formData.get("total_bruto_gross_up")),
    total_income: Number(formData.get("total_income")),
    bpjs_tk_jht_emp: Number(formData.get("bpjs_tk_jht_emp")),
    bpjs_tk_jp_emp: Number(formData.get("bpjs_tk_jp_emp")),
    bpjs_kes_emp: Number(formData.get("bpjs_kes_emp")),
    tarif_percentage: Number(formData.get("tarif_percentage")),
    tarif_value: Number(formData.get("tarif_value")),
    regular_income_tax: Number(formData.get("regular_income_tax")),
    tunjangan_pph: Number(formData.get("tunjangan_pph")),
    control_tunjangan_pph: Number(formData.get("control_tunjangan_pph")),
    adj_income_tax: Number(formData.get("adj_income_tax")),
    payable_tax: Number(formData.get("payable_tax")),
    severance_tax: Number(formData.get("severance_tax")),
    total_deduction: Number(formData.get("total_deduction")),
    reimbursement: Number(formData.get("reimbursement")),
    take_home_pay: Number(formData.get("take_home_pay")),
    already_paid_adj: Number(formData.get("already_paid_adj")),
    salary_to_be_paid: Number(formData.get("salary_to_be_paid")),
  };

  // Update employee record
  const { error: employeeError } = await supabase
    .from("employees")
    .update(employeeData)
    .eq("id", employeeId);

  if (employeeError) {
    console.error("Error updating employee data:", employeeError);
    throw new Error(employeeError.message);
  }

  // Upsert payroll record
  const { error: payrollError } = await supabase
    .from("payroll_records")
    .upsert(payrollData, { onConflict: "employee_id,period_month" });

  if (payrollError) {
    console.error("Error upserting payroll record:", payrollError);
    throw new Error(payrollError.message);
  }

  revalidatePath("/payroll");
}