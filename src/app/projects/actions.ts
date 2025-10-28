"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  const supabase = await createClient();
  const { data: projects, error } = await supabase.from("projects").select("*");

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return projects;
}

export async function addProject(formData: FormData) {
  const supabase = await createClient();
  const project = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    revenue: Number(formData.get("revenue")) || 0,
    status: 'active'
  };

  const { error } = await supabase.from("projects").insert([project]);

  if (error) {
    console.error("Error adding project:", error);
    throw new Error(error.message);
  }

  revalidatePath("/projects");
}
export async function updateProject(formData: FormData) {
  const supabase = await createClient();
  const project = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    revenue: Number(formData.get("revenue")) || 0,
  };
  const id = formData.get("id") as string;

  const { error } = await supabase.from("projects").update(project).eq("id", id);

  if (error) {
    console.error("Error updating project:", error);
    throw new Error(error.message);
  }

  revalidatePath("/projects");
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
}