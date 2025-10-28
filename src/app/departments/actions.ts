"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getDepartments() {
  const supabase = await createClient();
  const { data: departments, error } = await supabase
    .from("departments")
    .select(`*`);

  if (error) {
    console.error("Error fetching departments:", error);
    return [];
  }

  return departments;
}

export async function addDepartment(formData: FormData) {
  const supabase = await createClient();

  const departmentData: any = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  };

  const { error } = await supabase.from("departments").insert([departmentData]);

  if (error) {
    console.error("Error adding department:", error);
    throw new Error(error.message);
  }

  revalidatePath("/departments");
}

export async function updateDepartment(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;

  const departmentData: any = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  };

  const { error } = await supabase.from("departments").update(departmentData).eq("id", id);

  if (error) {
    console.error("Error updating department:", error);
    throw new Error(error.message);
  }

  revalidatePath("/departments");
}

export async function deleteDepartment(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("departments").delete().eq("id", id);

  if (error) {
    console.error("Error deleting department:", error);
    throw new Error(error.message);
  }

  revalidatePath("/departments");
}