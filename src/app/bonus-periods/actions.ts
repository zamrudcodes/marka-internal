"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateBonusesForPeriod } from "@/lib/calculations/bonus-formula";

export async function getBonusPeriods(departmentId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("bonus_periods")
    .select(`
      *,
      departments (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (departmentId) {
    query = query.eq("department_id", departmentId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching bonus periods:", error);
    return [];
  }

  return data || [];
}

export async function getBonusPeriod(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bonus_periods")
    .select(`
      *,
      departments (
        id,
        name
      ),
      employee_ratings (
        id,
        employee_id,
        performance_rating,
        notes,
        employees (
          id,
          first_name,
          last_name,
          email,
          salary
        )
      ),
      bonus_calculations (
        id,
        employee_id,
        contribution_score,
        revenue_score,
        salary_adjustment_score,
        weighted_score,
        bonus_amount,
        bonus_percentage,
        calculation_details,
        employees (
          id,
          first_name,
          last_name,
          email,
          salary
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching bonus period:", error);
    return null;
  }

  return data;
}

export async function createBonusPeriod(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const departmentId = formData.get("department_id") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const netProfit = parseFloat(formData.get("net_profit") as string);

  const { data, error } = await supabase
    .from("bonus_periods")
    .insert({
      name,
      department_id: departmentId,
      start_date: startDate,
      end_date: endDate,
      net_profit: netProfit,
      status: "draft"
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating bonus period:", error);
    throw new Error(error.message);
  }

  revalidatePath("/bonus-periods");
  return data;
}

export async function updateBonusPeriod(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const netProfit = parseFloat(formData.get("net_profit") as string);
  const status = formData.get("status") as string;

  const { data, error } = await supabase
    .from("bonus_periods")
    .update({
      name,
      start_date: startDate,
      end_date: endDate,
      net_profit: netProfit,
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating bonus period:", error);
    throw new Error(error.message);
  }

  revalidatePath("/bonus-periods");
  revalidatePath(`/bonus-periods/${id}`);
  return data;
}

export async function deleteBonusPeriod(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bonus_periods")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting bonus period:", error);
    throw new Error(error.message);
  }

  revalidatePath("/bonus-periods");
}

export async function saveEmployeeRating(
  bonusPeriodId: string,
  employeeId: string,
  rating: number,
  notes?: string
) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("employee_ratings")
    .upsert({
      bonus_period_id: bonusPeriodId,
      employee_id: employeeId,
      performance_rating: rating,
      notes: notes || null,
      rated_by: user?.id,
      updated_at: new Date().toISOString()
    }, {
      onConflict: "bonus_period_id,employee_id"
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving employee rating:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/bonus-periods/${bonusPeriodId}`);
  return data;
}

export async function saveMultipleRatings(
  bonusPeriodId: string,
  ratings: Array<{
    employeeId: string;
    rating: number;
    notes?: string;
  }>
) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  const ratingsToInsert = ratings.map(r => ({
    bonus_period_id: bonusPeriodId,
    employee_id: r.employeeId,
    performance_rating: r.rating,
    notes: r.notes || null,
    rated_by: user?.id,
    updated_at: new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from("employee_ratings")
    .upsert(ratingsToInsert, {
      onConflict: "bonus_period_id,employee_id"
    })
    .select();

  if (error) {
    console.error("Error saving multiple ratings:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/bonus-periods/${bonusPeriodId}`);
  return data;
}

export async function calculateBonuses(bonusPeriodId: string) {
  try {
    const result = await calculateBonusesForPeriod(bonusPeriodId);
    
    if (!result.success) {
      throw new Error(result.error || "Failed to calculate bonuses");
    }

    revalidatePath(`/bonus-periods/${bonusPeriodId}`);
    return result;
  } catch (error) {
    console.error("Error calculating bonuses:", error);
    throw error;
  }
}

export async function finalizeBonusPeriod(bonusPeriodId: string) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("bonus_periods")
    .update({
      status: "finalized",
      finalized_at: new Date().toISOString(),
      finalized_by: user?.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", bonusPeriodId)
    .select()
    .single();

  if (error) {
    console.error("Error finalizing bonus period:", error);
    throw new Error(error.message);
  }

  revalidatePath("/bonus-periods");
  revalidatePath(`/bonus-periods/${bonusPeriodId}`);
  return data;
}

export async function getEmployeesForRating(bonusPeriodId: string) {
  const supabase = await createClient();

  // First get the bonus period to know the department
  const { data: bonusPeriod, error: periodError } = await supabase
    .from("bonus_periods")
    .select("department_id")
    .eq("id", bonusPeriodId)
    .single();

  if (periodError || !bonusPeriod) {
    console.error("Error fetching bonus period:", periodError);
    return [];
  }

  // Get all active employees in the department with their ratings for this period
  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      employee_ratings!left (
        performance_rating,
        notes
      ),
      employee_projects!left (
        project_id,
        projects (
          id,
          name,
          revenue
        )
      )
    `)
    .eq("department_id", bonusPeriod.department_id)
    .eq("status", "active")
    .eq("employee_ratings.bonus_period_id", bonusPeriodId)
    .order("last_name", { ascending: true });

  if (error) {
    console.error("Error fetching employees for rating:", error);
    return [];
  }

  return data || [];
}

export async function getBonusCalculations(bonusPeriodId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bonus_calculations")
    .select(`
      *,
      employees (
        id,
        first_name,
        last_name,
        email,
        salary
      )
    `)
    .eq("bonus_period_id", bonusPeriodId)
    .order("bonus_amount", { ascending: false });

  if (error) {
    console.error("Error fetching bonus calculations:", error);
    return [];
  }

  return data || [];
}

export async function exportBonusCalculations(bonusPeriodId: string) {
  const calculations = await getBonusCalculations(bonusPeriodId);
  const bonusPeriod = await getBonusPeriod(bonusPeriodId);

  if (!calculations || !bonusPeriod) {
    throw new Error("Failed to fetch data for export");
  }

  // Format data for CSV export
  const csvData = calculations.map(calc => ({
    "Employee Name": `${calc.employees.first_name} ${calc.employees.last_name}`,
    "Email": calc.employees.email,
    "Salary": calc.employees.salary,
    "Contribution Score": calc.contribution_score,
    "Revenue Score": calc.revenue_score,
    "Salary Adjustment Score": calc.salary_adjustment_score,
    "Weighted Score": calc.weighted_score,
    "Bonus Percentage": `${calc.bonus_percentage}%`,
    "Bonus Amount": `$${calc.bonus_amount.toFixed(2)}`
  }));

  return {
    period: bonusPeriod,
    data: csvData
  };
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

export async function createDepartment(name: string, description?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .insert({
      name,
      description
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating department:", error);
    throw new Error(error.message);
  }

  revalidatePath("/departments");
  return data;
}