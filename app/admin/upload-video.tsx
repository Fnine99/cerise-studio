"use client";

import { useRef, useState } from "react";
import { createVideo } from "@/app/actions/videos";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/lib/clients";

const BUCKET = "clients";

const inputClass =
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

type Status = { kind: "idle" } | { kind: "uploading" } | { kind: "done"; title: string } | { kind: "error"; message: string };

export function UploadVideo({ clients }: { clients: Client[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploading = status.kind === "uploading";

  function pickFile(next: File | undefined) {
    if (!next) return;
    if (!next.type.startsWith("video/")) {
      setStatus({ kind: "error", message: "That file isn't a video." });
      return;
    }
    setFile(next);
    setStatus({ kind: "idle" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const clientId = String(form.get("clientId") ?? "");
    const title = String(form.get("title") ?? "").trim();
    const dueAt = String(form.get("dueAt") ?? "");

    if (!clientId) return setStatus({ kind: "error", message: "Choose a client." });
    if (!title) return setStatus({ kind: "error", message: "Enter a title." });
    if (!file) return setStatus({ kind: "error", message: "Add a video file." });

    setStatus({ kind: "uploading" });
    const id = crypto.randomUUID();
    const safeName = file.name.replace(/[^\w.-]+/g, "-");
    const storagePath = `videos/${clientId}/${id}/${safeName}`;
    const supabase = createClient();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      return setStatus({ kind: "error", message: `Upload failed: ${uploadError.message}` });
    }

    const result = await createVideo({
      id,
      clientId,
      title,
      storagePath,
      dueAt: dueAt || undefined,
      durationSeconds: await readDuration(file),
    });
    if (result.error) {
      // Don't leave an orphaned file behind if the row couldn't be saved.
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return setStatus({ kind: "error", message: result.error });
    }

    formRef.current?.reset();
    setFile(null);
    setStatus({ kind: "done", title });
  }

  if (clients.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
        No clients yet. They&apos;ll appear here once they sign up.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-xl border border-border bg-surface p-5 md:grid-cols-[1fr_1.2fr]"
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Client
          <select name="clientId" defaultValue="" className={inputClass} disabled={uploading} required>
            <option value="" disabled>
              Select a client…
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name === client.email ? client.email : `${client.name} (${client.email})`}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Title
          <input
            name="title"
            maxLength={200}
            placeholder="Brand Launch — Hero Cut"
            className={inputClass}
            disabled={uploading}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          <span>
            Due date <span className="font-normal text-muted">(optional)</span>
          </span>
          <input name="dueAt" type="date" className={inputClass} disabled={uploading} />
        </label>
      </div>

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pickFile(e.dataTransfer.files[0]);
          }}
          disabled={uploading}
          className={`flex min-h-44 flex-1 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center text-sm transition-colors ${
            dragging ? "border-accent bg-accent/10" : "border-border hover:border-muted"
          }`}
        >
          <svg viewBox="0 0 24 24" className="size-8 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path d="M12 16V4m0 0L7 9m5-5 5 5M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {file ? (
            <>
              <span className="font-medium">{file.name}</span>
              <span className="text-muted">{formatSize(file.size)} · click to change</span>
            </>
          ) : (
            <>
              <span className="font-medium">Drop a video here</span>
              <span className="text-muted">or click to browse</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />

        <div className="flex items-center justify-between gap-4">
          <p
            aria-live="polite"
            className={`text-sm ${status.kind === "error" ? "text-accent" : "text-emerald-700"}`}
          >
            {status.kind === "error" && status.message}
            {status.kind === "done" && `“${status.title}” uploaded and sent for review.`}
            {status.kind === "uploading" && <span className="text-muted">Uploading… keep this tab open.</span>}
          </p>
          <button
            disabled={uploading}
            className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload video"}
          </button>
        </div>
      </div>
    </form>
  );
}

function readDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const done = (value?: number) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    video.preload = "metadata";
    video.onloadedmetadata = () => done(Number.isFinite(video.duration) ? video.duration : undefined);
    video.onerror = () => done(undefined);
    video.src = url;
  });
}

function formatSize(bytes: number) {
  const mb = bytes / 1024 / 1024;
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
}
