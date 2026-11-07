import type { ProjectStatus } from "@/lib/projects";

const STATUS_STYLES: Record<ProjectStatus, { label: string; className: string }> = {
  "in-progress": { label: "In progress", className: "bg-amber-100 text-amber-800" },
  "in-review": { label: "Ready for review", className: "bg-accent text-white" },
  delivered: { label: "Delivered", className: "bg-emerald-100 text-emerald-800" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>;
}

const dateFormat = new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" });
export const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00`));

export function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = String(totalSeconds % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

export function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight && value > 0 ? "border-accent/50 bg-accent/10" : "border-border bg-surface"
      }`}
    >
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-5xl tabular-nums">{value}</p>
    </div>
  );
}
