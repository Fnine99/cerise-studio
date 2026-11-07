import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { roleFrom, type Role } from "./roles";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
};

// getUser() checks the token with Supabase, so it's safe for authorization.
export const getCurrentUser = cache(async (): Promise<User> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");

  const { id, email = "", user_metadata: meta, app_metadata } = data.user;
  return {
    id,
    email,
    role: roleFrom(app_metadata),
    name: meta.full_name || meta.name || email.split("@")[0],
    avatarUrl: meta.avatar_url,
  };
});

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
