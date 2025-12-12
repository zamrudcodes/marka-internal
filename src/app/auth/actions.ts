"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRole, FeatureKey } from "@/lib/auth/permissions";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getCurrentUser() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  // Get user role
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return {
    ...user,
    role: userRole?.role as UserRole | null,
    isActive: userRole?.is_active ?? false,
  };
}

export async function getUserRole(email: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("user_roles")
    .select("role, is_active")
    .eq("email", email)
    .single();

  if (error || !data) {
    return null;
  }

  return data.role as UserRole;
}

export async function checkPermission(
  email: string,
  resource: string,
  permissionType: 'view' | 'create' | 'edit' | 'delete'
): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .rpc('has_permission', {
      user_email: email,
      resource_name: resource,
      permission_type: permissionType
    });

  if (error) {
    console.error("Error checking permission:", error);
    return false;
  }

  return data === true;
}

// User invitation functions
export async function inviteUser(formData: FormData) {
  const supabase = await createClient();
  
  const email = formData.get("email") as string;
  const role = formData.get("role") as UserRole;
  
  // Check if user is admin
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { error: "Only administrators can invite users" };
  }

  // Generate invitation token
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

  const { error } = await supabase
    .from("user_invitations")
    .insert([{
      email,
      role,
      invited_by: currentUser.id,
      invitation_token: token,
      expires_at: expiresAt.toISOString(),
    }]);

  if (error) {
    console.error("Error creating invitation:", error);
    return { error: error.message };
  }

  // TODO: Send invitation email with token
  // For now, return the token
  return { 
    success: true, 
    token,
    invitationLink: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/accept-invitation?token=${token}`
  };
}

export async function acceptInvitation(token: string, password: string) {
  const supabase = await createClient();

  // Get invitation
  const { data: invitation, error: invError } = await supabase
    .from("user_invitations")
    .select("*")
    .eq("invitation_token", token)
    .is("accepted_at", null)
    .single();

  if (invError || !invitation) {
    return { error: "Invalid or expired invitation" };
  }

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    return { error: "Invitation has expired" };
  }

  // Create user account
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: invitation.email,
    password,
  });

  if (signUpError || !authData.user) {
    return { error: signUpError?.message || "Failed to create account" };
  }

  // Create user role
  const { error: roleError } = await supabase
    .from("user_roles")
    .insert([{
      user_id: authData.user.id,
      email: invitation.email,
      role: invitation.role,
      is_active: true,
    }]);

  if (roleError) {
    console.error("Error creating user role:", roleError);
    return { error: "Failed to assign role" };
  }

  // Mark invitation as accepted
  await supabase
    .from("user_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  return { success: true };
}

export async function getUsers() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("user_roles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data;
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  const supabase = await createClient();
  
  // Check if current user is admin
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { error: "Only administrators can update user roles" };
  }

  const { error } = await supabase
    .from("user_roles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating user role:", error);
    return { error: error.message };
  }

  revalidatePath("/users");
  return { success: true };
}

export async function toggleUserStatus(userId: string) {
  const supabase = await createClient();
  
  // Check if current user is admin
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { error: "Only administrators can toggle user status" };
  }

  // Get current status
  const { data: user } = await supabase
    .from("user_roles")
    .select("is_active")
    .eq("user_id", userId)
    .single();

  if (!user) {
    return { error: "User not found" };
  }

  const { error } = await supabase
    .from("user_roles")
    .update({ 
      is_active: !user.is_active,
      updated_at: new Date().toISOString() 
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Error toggling user status:", error);
    return { error: error.message };
  }

  revalidatePath("/users");
  return { success: true };
}

// Feature access management functions
export async function getUserFeatures(userId: string): Promise<FeatureKey[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("user_feature_access")
    .select("feature_key")
    .eq("user_id", userId)
    .eq("is_enabled", true);

  if (error) {
    console.error("Error fetching user features:", error);
    return [];
  }

  return data.map(item => item.feature_key as FeatureKey);
}

export async function getAllFeatures() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("features")
    .select("*")
    .order("key");

  if (error) {
    console.error("Error fetching features:", error);
    return [];
  }

  return data;
}

export async function updateUserFeatures(userId: string, featureKeys: FeatureKey[]) {
  const supabase = await createClient();
  
  // Check if current user is admin
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { error: "Only administrators can update user features" };
  }

  // Use the database function to bulk update features
  const { error } = await supabase.rpc('update_user_features', {
    p_user_id: userId,
    p_feature_keys: featureKeys
  });

  if (error) {
    console.error("Error updating user features:", error);
    return { error: error.message };
  }

  revalidatePath("/users");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getUserWithFeatures(userId: string) {
  const supabase = await createClient();
  
  // Get user role info
  const { data: userRole, error: roleError } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (roleError || !userRole) {
    return null;
  }

  // Get user features
  const features = await getUserFeatures(userId);

  return {
    ...userRole,
    features,
  };
}