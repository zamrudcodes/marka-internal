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
  
  // Convert "YYYY-MM" format to "YYYY-MM-01" for database
  const periodMonthDate = periodMonth ? `${periodMonth}-01` : new Date().toISOString().split('T')[0];

  // Helper function to safely parse numbers
  const parseNumber = (value: any, defaultValue: number = 0): number => {
    const parsed = Number(value);
    return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
  };

  // Validate bpjs_kes_salary_multiplier (now DECIMAL(15,2) - can handle large values)
  const bpjsMultiplier = parseNumber(formData.get("bpjs_kes_salary_multiplier"), 1.0);
  const validBpjsMultiplier = Math.max(bpjsMultiplier, 0); // Only ensure it's not negative

  // Data for employees table
  const employeeData = {
    emp_no: formData.get("emp_no") as string || null,
    role: formData.get("role") as string || null,
    npwp: formData.get("npwp") as string || null,
    nik: formData.get("nik") as string || null,
    nitku: formData.get("nitku") as string || null,
    ptkp_status: formData.get("ptkp_status") as string || null,
    gross_up_enabled: formData.get("gross_up_enabled") === "on" || formData.get("gross_up_enabled") === "true",
    bpjs_kes_salary_multiplier: validBpjsMultiplier,
  };

  // Data for payroll_records table - all DECIMAL(15,2) fields
  const payrollData = {
    employee_id: employeeId,
    period_month: periodMonthDate,
    basic_salary: parseNumber(formData.get("basic_salary")),
    adj_previous_payroll: parseNumber(formData.get("adj_previous_payroll")),
    kinerja_allowance: parseNumber(formData.get("kinerja_allowance")),
    meal_allowance: parseNumber(formData.get("meal_allowance")),
    komunikasi_allowance: parseNumber(formData.get("komunikasi_allowance")),
    pph21_allowance: parseNumber(formData.get("pph21_allowance")),
    thr_bonus: parseNumber(formData.get("thr_bonus")),
    severance: parseNumber(formData.get("severance")),
    bpjs_tk_jkk_comp: parseNumber(formData.get("bpjs_tk_jkk_comp")),
    bpjs_tk_jkm_comp: parseNumber(formData.get("bpjs_tk_jkm_comp")),
    bpjs_kes_comp: parseNumber(formData.get("bpjs_kes_comp")),
    bpjs_tk_jht_comp: parseNumber(formData.get("bpjs_tk_jht_comp")),
    bpjs_tk_jp_comp: parseNumber(formData.get("bpjs_tk_jp_comp")),
    total_bruto: parseNumber(formData.get("total_bruto")),
    total_bruto_gross_up: parseNumber(formData.get("total_bruto_gross_up")),
    total_income: parseNumber(formData.get("total_income")),
    bpjs_tk_jht_emp: parseNumber(formData.get("bpjs_tk_jht_emp")),
    bpjs_tk_jp_emp: parseNumber(formData.get("bpjs_tk_jp_emp")),
    bpjs_kes_emp: parseNumber(formData.get("bpjs_kes_emp")),
    tarif_percentage: Math.min(parseNumber(formData.get("tarif_percentage")), 99.99), // Cap at 99.99% for DECIMAL(5,2)
    tarif_value: parseNumber(formData.get("tarif_value")),
    regular_income_tax: parseNumber(formData.get("regular_income_tax")),
    tunjangan_pph: parseNumber(formData.get("tunjangan_pph")),
    control_tunjangan_pph: parseNumber(formData.get("control_tunjangan_pph")),
    adj_income_tax: parseNumber(formData.get("adj_income_tax")),
    payable_tax: parseNumber(formData.get("payable_tax")),
    severance_tax: parseNumber(formData.get("severance_tax")),
    total_deduction: parseNumber(formData.get("total_deduction")),
    reimbursement: parseNumber(formData.get("reimbursement")),
    take_home_pay: parseNumber(formData.get("take_home_pay")),
    already_paid_adj: parseNumber(formData.get("already_paid_adj")),
    salary_to_be_paid: parseNumber(formData.get("salary_to_be_paid")),
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