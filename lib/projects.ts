import { requireAdmin } from "./auth";

export type ProjectStatus = "in-progress" | "in-review" | "delivered";

export type Project = {
  id: string;
  title: string;
  client: string;
  status: ProjectStatus;
  version: number;
  duration: string;
  updatedAt: string; // ISO date
  dueAt?: string; // ISO date
};

// Placeholder data until a database is wired in.
const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    title: "Brand Launch — Hero Cut",
    client: "Northwind Coffee",
    status: "in-review",
    version: 3,
    duration: "1:42",
    updatedAt: "2026-10-23",
    dueAt: "2026-10-28",
  },
  {
    id: "p2",
    title: "Instagram Reels Pack (x5)",
    client: "Northwind Coffee",
    status: "in-progress",
    version: 1,
    duration: "0:30",
    updatedAt: "2026-10-22",
    dueAt: "2026-11-02",
  },
  {
    id: "p3",
    title: "Behind the Scenes Mini-Doc",
    client: "Atelier Rose",
    status: "in-progress",
    version: 2,
    duration: "6:15",
    updatedAt: "2026-10-20",
    dueAt: "2026-11-10",
  },
  {
    id: "p4",
    title: "Product Teaser — 15s",
    client: "Lumen Audio",
    status: "delivered",
    version: 4,
    duration: "0:15",
    updatedAt: "2026-10-12",
  },
];

// Every client's projects: admins only.
export async function getAllProjects(): Promise<Project[]> {
  await requireAdmin();
  return MOCK_PROJECTS;
}
