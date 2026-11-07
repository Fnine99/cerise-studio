import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { AppShell, FullPageLoader } from "@/app/ui/app-shell";

// Auth gate: nothing under /dashboard renders until Supabase has verified the
// user. Signed-out requests are redirected to /login by getCurrentUser().
// The proxy redirects earlier; this check holds even if the proxy is bypassed.
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <ProtectedShell>{children}</ProtectedShell>
    </Suspense>
  );
}

async function ProtectedShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <AppShell user={user} homeHref="/dashboard">
      {children}
    </AppShell>
  );
}
