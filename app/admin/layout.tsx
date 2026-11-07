import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { AppShell, FullPageLoader } from "@/app/ui/app-shell";

// Admin gate: signed-out users go to /login, clients go to /dashboard.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <AppShell user={user} homeHref="/admin">
      {children}
    </AppShell>
  );
}
