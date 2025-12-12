"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Helper function to parse form data with null handling
function getFormValue(formData: FormData, key: string): string | null {
  const value = formData.get(key) as string;
  // Handle empty strings and "none" as null (for Select components)
  if (!value || value.trim() === "" || value === "none") return null;
  return value;
}

function getFormNumber(formData: FormData, key: string): number | null {
  const value = formData.get(key) as string;
  if (!value || value.trim() === "") return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

export async function getProjects() {
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from("projects")
    .select(`
      *,
      project_manager:employees!project_manager_id(id, first_name, last_name, email)
    `);

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return projects;
}

export async function getEmployeesForSelect() {
  const supabase = await createClient();
  const { data: employees, error } = await supabase
    .from("employees")
    .select("id, first_name, last_name, email")
    .eq("status", "active")
    .order("first_name");

  if (error) {
    console.error("Error fetching employees:", error);
    return [];
  }

  return employees;
}

export async function addProject(formData: FormData) {
  const supabase = await createClient();
  const project = {
    // Basic fields
    name: formData.get("name") as string,
    description: getFormValue(formData, "description"),
    start_date: getFormValue(formData, "start_date"),
    end_date: getFormValue(formData, "end_date"),
    monthly_revenue: getFormNumber(formData, "monthly_revenue") || 0,
    status: 'active',
    
    // Core/Static fields
    sow_type: getFormValue(formData, "sow_type"),
    sla_target_type: getFormValue(formData, "sla_target_type"),
    sla_target_value: getFormNumber(formData, "sla_target_value"),
    billable_cap: getFormNumber(formData, "billable_cap"),
    project_manager_id: getFormValue(formData, "project_manager_id"),
    renewal_date: getFormValue(formData, "renewal_date"),
    
    // Dynamic fields
    current_actual_value: getFormNumber(formData, "current_actual_value"),
    current_sla_percentage: getFormNumber(formData, "current_sla_percentage"),
    health_status: getFormValue(formData, "health_status") || 'green',
    primary_blocker: getFormValue(formData, "primary_blocker"),
    last_client_touch: getFormValue(formData, "last_client_touch"),
    
    // Link fields
    link_to_sow: getFormValue(formData, "link_to_sow"),
    link_to_live_tracker: getFormValue(formData, "link_to_live_tracker"),
    link_to_asset_folder: getFormValue(formData, "link_to_asset_folder"),
  };

  console.log("Attempting to insert project:", project);

  const { error } = await supabase.from("projects").insert([project]);

  if (error) {
    console.error("Error adding project:", error);
    throw new Error(`Database Error: ${error.message} (Code: ${error.code}, Details: ${error.details})`);
  }

  revalidatePath("/projects");
  revalidatePath("/projects/heatmap");
}

export async function updateProject(formData: FormData) {
  const supabase = await createClient();
  const project = {
    // Basic fields
    name: formData.get("name") as string,
    description: getFormValue(formData, "description"),
    start_date: getFormValue(formData, "start_date"),
    end_date: getFormValue(formData, "end_date"),
    monthly_revenue: getFormNumber(formData, "monthly_revenue") || 0,
    
    // Core/Static fields
    sow_type: getFormValue(formData, "sow_type"),
    sla_target_type: getFormValue(formData, "sla_target_type"),
    sla_target_value: getFormNumber(formData, "sla_target_value"),
    billable_cap: getFormNumber(formData, "billable_cap"),
    project_manager_id: getFormValue(formData, "project_manager_id"),
    renewal_date: getFormValue(formData, "renewal_date"),
    
    // Dynamic fields
    current_actual_value: getFormNumber(formData, "current_actual_value"),
    current_sla_percentage: getFormNumber(formData, "current_sla_percentage"),
    health_status: getFormValue(formData, "health_status"),
    primary_blocker: getFormValue(formData, "primary_blocker"),
    last_client_touch: getFormValue(formData, "last_client_touch"),
    
    // Link fields
    link_to_sow: getFormValue(formData, "link_to_sow"),
    link_to_live_tracker: getFormValue(formData, "link_to_live_tracker"),
    link_to_asset_folder: getFormValue(formData, "link_to_asset_folder"),
  };
  const id = formData.get("id") as string;

  const { error } = await supabase.from("projects").update(project).eq("id", id);

  if (error) {
    console.error("Error updating project:", error);
    throw new Error(error.message);
  }

  revalidatePath("/projects");
  revalidatePath("/projects/heatmap");
}

// Weekly Updates Actions
export async function getWeeklyUpdates(projectId: string) {
  const supabase = await createClient();
  const { data: updates, error } = await supabase
    .from("project_weekly_updates")
    .select("*")
    .eq("project_id", projectId)
    .order("report_date", { ascending: false });

  if (error) {
    console.error("Error fetching weekly updates:", error);
    return [];
  }

  return updates;
}

export async function getWeeklyUpdatesForHeatmap() {
  const supabase = await createClient();
  
  // Get the last 5 weeks of data for all projects
  const fiveWeeksAgo = new Date();
  fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35); // 5 weeks
  
  const { data: updates, error } = await supabase
    .from("project_weekly_updates")
    .select("*")
    .gte("report_date", fiveWeeksAgo.toISOString().split('T')[0])
    .order("report_date", { ascending: false });

  if (error) {
    console.error("Error fetching weekly updates for heatmap:", error);
    return [];
  }

  return updates;
}

export async function addWeeklyUpdate(formData: FormData) {
  const supabase = await createClient();
  
  const update = {
    project_id: formData.get("project_id") as string,
    report_date: formData.get("report_date") as string,
    actual_value: getFormNumber(formData, "actual_value"),
    sla_percentage: getFormNumber(formData, "sla_percentage"),
    health_status: getFormValue(formData, "health_status") || 'green',
    primary_blocker: getFormValue(formData, "primary_blocker") || 'none',
    notes: getFormValue(formData, "notes"),
  };

  console.log("Attempting to insert weekly update:", update);

  const { error } = await supabase.from("project_weekly_updates").insert([update]);

  if (error) {
    console.error("Error adding weekly update:", error);
    throw new Error(`Database Error: ${error.message} (Code: ${error.code})`);
  }

  revalidatePath("/projects");
  revalidatePath("/projects/heatmap");
}

export async function updateWeeklyUpdate(formData: FormData) {
  const supabase = await createClient();
  
  const update = {
    actual_value: getFormNumber(formData, "actual_value"),
    sla_percentage: getFormNumber(formData, "sla_percentage"),
    health_status: getFormValue(formData, "health_status"),
    primary_blocker: getFormValue(formData, "primary_blocker"),
    notes: getFormValue(formData, "notes"),
  };
  
  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("project_weekly_updates")
    .update(update)
    .eq("id", id);

  if (error) {
    console.error("Error updating weekly update:", error);
    throw new Error(`Database Error: ${error.message}`);
  }

  revalidatePath("/projects");
  revalidatePath("/projects/heatmap");
}

export async function deleteProject(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("Error deleting project:", error);
    throw new Error(error.message);
  }

  revalidatePath("/projects");
  revalidatePath("/projects/heatmap");
}