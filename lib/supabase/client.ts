import { createBrowserClient } from "@supabase/ssr";

// Browser client: shares the session cookie the server set at sign-in.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
