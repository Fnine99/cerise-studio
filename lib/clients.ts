import { requireAdmin } from "./auth";
import { createClient } from "./supabase/server";

export type Client = {
  id: string;
  email: string;
  name: string;
};

// Every non-admin user, for the admin upload form.
export async function getClients(): Promise<Client[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_clients");
  if (error) throw new Error(`Couldn't load clients: ${error.message}`);

  return (data as { id: string; email: string; full_name: string | null }[]).map((row) => ({
    id: row.id,
    email: row.email,
    name: row.full_name || row.email,
  }));
}
