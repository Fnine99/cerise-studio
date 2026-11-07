import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllProjects } from "@/lib/projects";
import { getClients } from "@/lib/clients";
import { UploadVideo } from "./upload-video";
import { formatDate, Stat, StatusBadge } from "@/app/ui/project-meta";

export const metadata: Metadata = { title: "Admin" };

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-4xl font-normal tracking-tight sm:text-5xl">Studio overview</h1>
        <p className="mt-1 text-sm text-muted">Every client and project in one place.</p>
      </div>
      <section>
        <h2 className="eyebrow mb-4">
          Upload a video
        </h2>
        <Suspense fallback={<div className="h-56 animate-pulse rounded-xl bg-surface" />}>
          <Upload />
        </Suspense>
      </section>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-surface" />}>
        <Overview />
      </Suspense>
    </div>
  );
}

async function Upload() {
  let clients;
  try {
    clients = await getClients();
  } catch (error) {
    return (
      <p className="rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm text-accent-hover">
        {(error as Error).message}. Has the <code>client_video_uploads</code> migration been applied?
      </p>
    );
  }
  return <UploadVideo clients={clients} />;
}

async function Overview() {
  const projects = await getAllProjects();
  const clients = new Set(projects.map((p) => p.client));

  return (
    <>
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Clients" value={clients.size} />
        <Stat label="In progress" value={projects.filter((p) => p.status === "in-progress").length} />
        <Stat
          label="Waiting on client"
          value={projects.filter((p) => p.status === "in-review").length}
          highlight
        />
        <Stat label="Delivered" value={projects.filter((p) => p.status === "delivered").length} />
      </section>

      <section>
        <h2 className="eyebrow mb-4">
          All projects
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="eyebrow bg-surface-2">
              <tr>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Version</th>
                <th className="px-4 py-3 font-medium">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-surface/60">
                  <td className="px-4 py-3 font-medium">{project.title}</td>
                  <td className="px-4 py-3 text-muted">{project.client}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-muted">v{project.version}</td>
                  <td className="px-4 py-3 text-muted">
                    {project.dueAt ? formatDate(project.dueAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
