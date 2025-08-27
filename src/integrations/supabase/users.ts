import { supabase } from "./client";

export type UserProfile = {
  user_id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "operator" | "super_admin";
  can_read: boolean;
  can_write: boolean;
  is_disabled: boolean;
  can_manage_events?: boolean;
  can_manage_gallery?: boolean;
  can_manage_livestream?: boolean;
  can_edit_profile?: boolean;
  can_manage_users?: boolean;
  is_main_admin?: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export const getCurrentProfile = async (): Promise<UserProfile | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();
  return (data as UserProfile) || null;
};

export const listAllProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as UserProfile[]) || [];
};

export const updateUserRole = async (userId: string, role: "user" | "admin" | "operator" | "super_admin") => {
  // Check if trying to modify a main admin
  const { data: targetProfile } = await supabase
    .from("user_profiles")
    .select("is_main_admin, role")
    .eq("user_id", userId)
    .single();
  
  if (targetProfile?.is_main_admin) {
    throw new Error("Cannot modify the main administrator account");
  }
  
  // Check if current user has permission to change roles
  const currentProfile = await getCurrentProfile();
  if (!currentProfile?.can_manage_users && currentProfile?.role !== 'super_admin') {
    throw new Error("You don't have permission to change user roles");
  }
  
  const { error } = await supabase
    .from("user_profiles")
    .update({ role })
    .eq("user_id", userId);
  if (error) throw error;
};

export const updateUserPermissions = async (
  userId: string,
  updates: Partial<Pick<UserProfile, "can_read" | "can_write" | "is_disabled" | "name" | "can_manage_events" | "can_manage_gallery" | "can_manage_livestream" | "can_edit_profile" | "can_manage_users">>
) => {
  // Check if trying to modify a main admin
  const { data: targetProfile } = await supabase
    .from("user_profiles")
    .select("is_main_admin, role")
    .eq("user_id", userId)
    .single();
  
  if (targetProfile?.is_main_admin) {
    throw new Error("Cannot modify the main administrator account");
  }
  
  // Check if current user has permission to update permissions
  const currentProfile = await getCurrentProfile();
  if (!currentProfile?.can_manage_users && currentProfile?.role !== 'super_admin') {
    throw new Error("You don't have permission to modify user permissions");
  }
  
  const { error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("user_id", userId);
  if (error) throw error;
};

export const deleteUserProfile = async (userId: string) => {
  const { error } = await supabase
    .from("user_profiles")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
};

export const sendPasswordResetTo = async (email: string, redirectPath: string = "/admin-login") => {
  if (!email) throw new Error("Email is required");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${redirectPath}`,
  });
  if (error) throw error;
};


