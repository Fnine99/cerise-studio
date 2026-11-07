import { logout } from "@/app/actions/auth";
import { Logo } from "@/app/ui/logo";
import type { User } from "@/lib/auth";

export function AppShell({
  user,
  homeHref,
  children,
}: {
  user: User;
  homeHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo href={homeHref} />
            {user.role === "admin" && (
              <span className="rounded-md bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent-hover">
                Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <UserMenu user={user} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="grid flex-1 place-items-center" role="status" aria-label="Loading">
      <span className="size-6 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  );
}

function UserMenu({ user }: { user: User }) {
  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="flex items-center gap-2">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Google avatar
          <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="size-8 rounded-full" />
        ) : (
          <span className="grid size-8 place-items-center rounded-full bg-surface-2 text-xs font-semibold">
            {initials}
          </span>
        )}
        <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
      </div>
      <form action={logout}>
        <button className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-foreground">
          Sign out
        </button>
      </form>
    </>
  );
}
