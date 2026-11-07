"use server";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type NewVideo = {
  id: string;
  clientId: string;
  title: string;
  storagePath: string;
  durationSeconds?: number;
  dueAt?: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Records a video the browser has already uploaded to the `clients` bucket.
export async function createVideo(input: NewVideo): Promise<{ error?: string }> {
  await requireAdmin();

  const title = input.title.trim();
  if (!UUID_RE.test(input.id) || !UUID_RE.test(input.clientId)) {
    return { error: "Invalid video or client." };
  }
  if (!title || title.length > 200) return { error: "Enter a title (up to 200 characters)." };
  if (!input.storagePath.startsWith(`videos/${input.clientId}/${input.id}/`)) {
    return { error: "File path doesn't match the selected client." };
  }
  if (input.dueAt && !DATE_RE.test(input.dueAt)) return { error: "Invalid due date." };

  const supabase = await createClient();
  const { error } = await supabase.from("videos").insert({
    id: input.id,
    client_id: input.clientId,
    title,
    storage_path: input.storagePath,
    duration_seconds:
      input.durationSeconds && Number.isFinite(input.durationSeconds)
        ? Math.round(input.durationSeconds)
        : null,
    due_at: input.dueAt || null,
    status: "in-review",
  });
  if (error) return { error: error.message };

  return {};
}
