export type Role = "admin" | "client";

// Roles live in app_metadata, which only the service role (or SQL) can change.
// Never read roles from user_metadata: users can edit that themselves.
export function roleFrom(appMetadata: Record<string, unknown> | undefined): Role {
  return appMetadata?.role === "admin" ? "admin" : "client";
}

export function homeFor(role: Role) {
  return role === "admin" ? "/admin" : "/dashboard";
}
