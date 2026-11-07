"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { homeFor, roleFrom } from "@/lib/roles";
import { originFromHeaders } from "@/lib/origin";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  message?: string;
  fields?: { name?: string; email?: string };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function callbackUrl() {
  // Build from the forwarded host so the OAuth redirect lands on the public
  // deployment URL rather than localhost or an internal Vercel host.
  const origin = originFromHeaders(await headers());
  return `${origin}/auth/callback`;
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email) || !password) {
    return { error: "Enter your email and password.", fields: { email } };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message, fields: { email } };

  redirect(homeFor(roleFrom(data.user.app_metadata)));
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fields = { name, email };

  if (!name) return { error: "Enter your name.", fields };
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email.", fields };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", fields };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: await callbackUrl(),
    },
  });
  if (error) return { error: error.message, fields };

  // With email confirmation on, Supabase returns no session until the link is clicked.
  if (!data.session) {
    return { message: `Check ${email} for a link to confirm your account.`, fields };
  }
  redirect("/dashboard");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: await callbackUrl(),
      // Force the Google account chooser instead of silently reusing the
      // account already signed in on this browser.
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) redirect("/login?error=oauth");

  redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
