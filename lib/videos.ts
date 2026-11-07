import { getCurrentUser } from "./auth";
import { createClient } from "./supabase/server";
import type { ProjectStatus } from "./projects";

export type Video = {
  id: string;
  title: string;
  status: ProjectStatus;
  version: number;
  durationSeconds: number | null;
  dueAt: string | null; // YYYY-MM-DD
  updatedAt: string; // YYYY-MM-DD
  url: string | null; // signed, expires after SIGNED_URL_TTL
  posterUrl: string | null;
};

const BUCKET = "clients";
const SIGNED_URL_TTL = 60 * 60; // 1 hour

// The signed-in client's videos, newest first, with playable signed URLs.
export async function getMyVideos(): Promise<Video[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  // RLS already limits clients to their own rows; the filter keeps that explicit.
  const { data: rows, error } = await supabase
    .from("videos")
    .select("id, title, status, version, duration_seconds, due_at, updated_at, storage_path, thumbnail_path")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Couldn't load videos: ${error.message}`);

  const paths = rows.flatMap((row) => [row.storage_path, row.thumbnail_path]).filter(Boolean) as string[];
  const signed = new Map<string, string>();
  if (paths.length > 0) {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_TTL);
    data?.forEach((item) => {
      if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
    });
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status as ProjectStatus,
    version: row.version,
    durationSeconds: row.duration_seconds,
    dueAt: row.due_at,
    updatedAt: String(row.updated_at).slice(0, 10),
    url: row.storage_path ? (signed.get(row.storage_path) ?? null) : null,
    posterUrl: row.thumbnail_path ? (signed.get(row.thumbnail_path) ?? null) : null,
  }));
}
